'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { PlacedInteriorItem } from '@/lib/types';
import type { Pet } from '@/lib/types';
import { createClient } from '@/lib/supabase-client';
import { BG_MAP } from '@/lib/pet-constants';
import { getRoomType } from '@/lib/pet-constants';
import { INTERIOR_ITEMS, getInteriorItem, getInteriorSpriteStyle } from '@/lib/interior-items';

const TILE_SIZE = 64;

interface InteriorDecoratorScreenProps {
  pet: Pet;
  setPet: (pet: Pet) => void;
  onBack: () => void;
}

export default function InteriorDecoratorScreen({ pet, setPet, onBack }: InteriorDecoratorScreenProps) {
  const supabase = createClient();
  const roomRef = useRef<HTMLDivElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [placed, setPlaced] = useState<PlacedInteriorItem[]>(pet.placed_interior ?? []);

  useEffect(() => {
    setPlaced(pet.placed_interior ?? []);
  }, [pet.placed_interior]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [selectedPlacedIndex, setSelectedPlacedIndex] = useState<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const placedRef = useRef(placed);
  placedRef.current = placed;

  const savePlaced = useCallback(
    async (next: PlacedInteriorItem[]) => {
      setPlaced(next);
      setPet({ ...pet, placed_interior: next });
      await supabase.from('pets').update({ placed_interior: next }).eq('id', pet.id);
    },
    [pet, setPet, supabase]
  );

  const inventory = pet.interior_inventory ?? {};
  const placedCount: Record<string, number> = {};
  for (const p of placed) {
    placedCount[p.itemId] = (placedCount[p.itemId] ?? 0) + 1;
  }
  const availableItems = INTERIOR_ITEMS.filter((item) => {
    const owned = inventory[item.id] ?? 0;
    const used = placedCount[item.id] ?? 0;
    return owned > used;
  });

  const roomType = getRoomType(pet);

  const getPercentFromPointer = useCallback((clientX: number, clientY: number) => {
    const room = roomRef.current;
    if (!room) return null;
    const rect = room.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  }, []);

  const handleRoomPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (draggingIndex !== null) return;
      setSelectedPlacedIndex(null);
      if (selectedItemId && availableItems.some((i) => i.id === selectedItemId)) {
        const pos = getPercentFromPointer(e.clientX, e.clientY);
        if (pos) {
          const next = [...placed, { itemId: selectedItemId, x: pos.x, y: pos.y }];
          savePlaced(next);
        }
      }
    },
    [selectedItemId, availableItems, placed, draggingIndex, getPercentFromPointer, savePlaced]
  );

  const handlePlacedPointerDown = (e: React.PointerEvent, index: number) => {
    e.stopPropagation();
    setDraggingIndex(index);
    setSelectedPlacedIndex(null);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: placed[index].x,
      y: placed[index].y,
      startX: e.clientX,
      startY: e.clientY,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePlacedPointerMove = (e: React.PointerEvent, index: number) => {
    if (draggingIndex !== index || !dragStartRef.current) return;
    const room = roomRef.current;
    if (!room) return;
    const rect = room.getBoundingClientRect();
    const dx = ((e.clientX - dragStartRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragStartRef.current.startY) / rect.height) * 100;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) hasDraggedRef.current = true;
    const next = [...placed];
    next[index] = {
      ...next[index],
      x: Math.max(0, Math.min(100, dragStartRef.current.x + dx)),
      y: Math.max(0, Math.min(100, dragStartRef.current.y + dy)),
    };
    setPlaced(next);
    dragStartRef.current = { ...dragStartRef.current, x: next[index].x, y: next[index].y, startX: e.clientX, startY: e.clientY };
  };

  const handlePlacedPointerUp = (e: React.PointerEvent, index: number) => {
    e.stopPropagation();
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    if (draggingIndex === index) {
      savePlaced(placedRef.current);
      setDraggingIndex(null);
      dragStartRef.current = null;
      if (!hasDraggedRef.current) setSelectedPlacedIndex(index);
    }
  };

  const movePlacedOrder = useCallback(
    (index: number, direction: 'front' | 'back') => {
      if (index < 0 || index >= placed.length) return;
      const next = [...placed];
      const [item] = next.splice(index, 1);
      if (direction === 'front') next.push(item);
      else next.unshift(item);
      savePlaced(next);
      setSelectedPlacedIndex(direction === 'front' ? next.length - 1 : 0);
    },
    [placed, savePlaced]
  );

  return (
    <div className="w-full h-full flex flex-col animate-slide-in" style={{ background: '#fff8f0' }}>
      <div className="flex items-center gap-1 p-2 shrink-0">
        <button onClick={onBack} className="text-[14px]" style={{ fontFamily: "'Press Start 2P'", color: '#d06000' }}>
          ←
        </button>
        <div className="flex-1 text-center py-1 rounded" style={{ background: '#80c0a0', fontFamily: "'Press Start 2P'" }}>
          <span className="text-[14px] text-white">방꾸미기</span>
        </div>
      </div>

      <div ref={roomRef} className="flex-1 relative overflow-hidden min-h-0">
        <Image
          src={BG_MAP[roomType]}
          alt={roomType}
          fill
          style={{ imageRendering: 'pixelated', objectFit: 'cover', zIndex: 0 }}
        />
        {placed.map((p, i) => {
          const item = getInteriorItem(p.itemId);
          if (!item) return null;
          const style = getInteriorSpriteStyle(item.sprite);
          const isSelected = selectedPlacedIndex === i;
          return (
            <div
              key={`${p.itemId}-${i}`}
              className={`absolute cursor-grab active:cursor-grabbing touch-none ${isSelected ? 'ring-2 ring-[#d06000]' : ''}`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: TILE_SIZE,
                height: TILE_SIZE,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 10 : 2,
                ...style,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
                pointerEvents: 'auto',
              }}
              onPointerDown={(e) => handlePlacedPointerDown(e, i)}
              onPointerMove={(e) => handlePlacedPointerMove(e, i)}
              onPointerUp={(e) => handlePlacedPointerUp(e, i)}
              onPointerLeave={(e) => handlePlacedPointerUp(e, i)}
            />
          );
        })}
        <div
          className="absolute inset-0 z-[1] cursor-crosshair"
          onPointerUp={handleRoomPointerUp}
          style={{ touchAction: 'none' }}
          aria-label="방에 배치할 위치 클릭"
        />
      </div>

      {selectedPlacedIndex !== null && placed[selectedPlacedIndex] && (
        <div className="flex items-center gap-1.5 p-2 shrink-0" style={{ background: '#ffe8c0', borderTop: '2px solid #e0c8a0' }}>
          <span className="text-[8px] flex-1" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>
            겹침순서: {getInteriorItem(placed[selectedPlacedIndex].itemId)?.name}
          </span>
          <button
            type="button"
            onClick={() => movePlacedOrder(selectedPlacedIndex, 'back')}
            className="pixel-btn px-1.5 py-0.5 text-[8px]"
            style={{ fontFamily: "'Press Start 2P'", background: '#e0e0e0', color: '#505050', borderColor: '#909090' }}
          >
            뒤로
          </button>
          <button
            type="button"
            onClick={() => movePlacedOrder(selectedPlacedIndex, 'front')}
            className="pixel-btn px-1.5 py-0.5 text-[8px]"
            style={{ fontFamily: "'Press Start 2P'", background: '#e0e0e0', color: '#505050', borderColor: '#909090' }}
          >
            앞으로
          </button>
        </div>
      )}

      <div className="p-2 shrink-0" style={{ background: '#fff0e0', borderTop: '2px solid #e0c8a0' }}>
        <p className="text-[8px] mb-1" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>
          배치할 아이템 선택 → 방을 눌러 배치 · 배치된 아이템 클릭 후 앞/뒤로 겹침순서 변경
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
          {availableItems.length === 0 ? (
            <p className="text-[8px]" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>
              배치 가능한 인테리어가 없어요. 상점에서 구매하세요!
            </p>
          ) : (
            availableItems.map((item) => {
              const owned = inventory[item.id] ?? 0;
              const used = placedCount[item.id] ?? 0;
              const left = owned - used;
              const isSelected = selectedItemId === item.id;
              const spriteStyle = getInteriorSpriteStyle(item.sprite);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setSelectedItemId(isSelected ? null : item.id); setSelectedPlacedIndex(null); }}
                  className="flex items-center gap-1 p-1.5 rounded shrink-0"
                  style={{
                    background: isSelected ? '#c8e0a0' : '#fff8e0',
                    border: `2px solid ${isSelected ? '#608040' : '#e0c8a0'}`,
                  }}
                >
                  <div
                    className="w-8 h-8 shrink-0 rounded overflow-hidden"
                    style={{
                      ...spriteStyle,
                      backgroundRepeat: 'no-repeat',
                      imageRendering: 'pixelated',
                    }}
                  />
                  <span className="text-[6px]" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>
                    {item.name} x{left}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
