'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useStore } from '@/store/useStore';
import { INTERIOR_ITEMS, getInteriorSpriteStyle } from '@/lib/interior-items';

export default function ShopPageClient() {
  const supabase = createClient();
  const { pet, setPet } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyInterior = useCallback(async (itemId: string) => {
    if (!pet) return;
    const item = INTERIOR_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    const currentPoints = pet.points || 0;
    if (currentPoints < item.price) return;
    setIsLoading(true);
    try {
      const newPoints = currentPoints - item.price;
      const inv = pet.interior_inventory ?? {};
      const newInventory = { ...inv, [itemId]: (inv[itemId] ?? 0) + 1 };
      await supabase
        .from('pets')
        .update({ points: newPoints, interior_inventory: newInventory })
        .eq('id', pet.id);
      setPet({ ...pet, points: newPoints, interior_inventory: newInventory });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [pet, supabase, setPet]);

  const handleRefundInterior = useCallback(async (itemId: string) => {
    if (!pet) return;
    const item = INTERIOR_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    const inv = pet.interior_inventory ?? {};
    const count = inv[itemId] ?? 0;
    if (count <= 0) return;
    setIsLoading(true);
    try {
      const newPoints = (pet.points || 0) + item.price;
      const newInventory = { ...inv, [itemId]: count - 1 };
      if (newInventory[itemId] === 0) delete newInventory[itemId];
      let newPlaced = pet.placed_interior ?? [];
      const placedIdx = newPlaced.findIndex((p) => p.itemId === itemId);
      if (placedIdx >= 0) {
        newPlaced = newPlaced.filter((_, i) => i !== placedIdx);
      }
      await supabase
        .from('pets')
        .update({ points: newPoints, interior_inventory: newInventory, placed_interior: newPlaced })
        .eq('id', pet.id);
      setPet({ ...pet, points: newPoints, interior_inventory: newInventory, placed_interior: newPlaced });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [pet, supabase, setPet]);

  if (!pet) return null;

  const points = pet.points || 0;
  const inventory = pet.interior_inventory ?? {};

  const ownedItems = INTERIOR_ITEMS.filter((item) => (inventory[item.id] ?? 0) > 0);
  const shopItems = INTERIOR_ITEMS.filter((item) => (inventory[item.id] ?? 0) <= 0);

  return (
    <div className="flex flex-col gap-2 text-xs" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div className="text-center p-2 rounded-lg" style={{ background: '#fff8d0', border: '2px solid #e0c880' }}>
        <span className="font-bold" style={{ color: '#d06000' }}>⭐ {points}P</span>
      </div>

      {ownedItems.length > 0 && (
        <>
          <p className="text-[11px] font-bold mt-1" style={{ color: '#506080' }}>보유 아이템</p>
          <div className="grid grid-cols-2 gap-1.5">
            {ownedItems.map((item) => {
              const count = inventory[item.id] ?? 0;
              const style = getInteriorSpriteStyle(item.sprite, 40);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg"
                  style={{ background: '#e8eeff', border: '2px solid #b0c0e0' }}
                >
                  <div
                    className="w-10 h-10 shrink-0 rounded bg-white/60 overflow-hidden"
                    style={{ ...style, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate" style={{ color: '#405070' }}>{item.name}</p>
                    <p className="text-[10px]" style={{ color: '#7080a0' }}>{count}개</p>
                  </div>
                  <button
                    onClick={() => handleRefundInterior(item.id)}
                    disabled={isLoading}
                    className="pixel-btn px-1.5 py-0.5 text-[10px] font-bold shrink-0 disabled:opacity-40"
                    style={{ background: '#e8e8ff', color: '#6060c0', borderColor: '#a0a0d0' }}
                  >
                    환불
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="text-[11px] font-bold mt-1" style={{ color: '#805030' }}>상점</p>
      <div className="grid grid-cols-2 gap-1.5">
        {shopItems.map((item) => {
          const style = getInteriorSpriteStyle(item.sprite, 40);
          return (
            <div
              key={item.id}
              className="flex items-center gap-1.5 p-1.5 rounded-lg"
              style={{ background: '#fff0e0', border: '2px solid #e0c8a0' }}
            >
              <div
                className="w-10 h-10 shrink-0 rounded bg-gray-100 overflow-hidden"
                style={{ ...style, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate" style={{ color: '#805030' }}>{item.name}</p>
              </div>
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <p className="text-[11px] font-bold text-center" style={{ color: '#d06000' }}>{item.price}P</p>
                <button
                  onClick={() => handleBuyInterior(item.id)}
                  disabled={points < item.price || isLoading}
                  className="pixel-btn px-1.5 py-0.5 text-[10px] font-bold disabled:opacity-40"
                  style={{ background: '#ffe8c0', color: '#d06000', borderColor: '#d0a060' }}
                >
                  구매
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
