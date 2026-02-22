'use client';

import Image from 'next/image';
import type { RoomType, PlacedInteriorItem } from '@/lib/types';
import { BG_MAP } from '@/lib/pet-constants';
import { getInteriorItem, getInteriorSpriteStyle } from '@/lib/interior-items';

interface PixelRoomProps {
  type?: RoomType;
  placedInterior?: PlacedInteriorItem[];
}

const TILE_SIZE = 64;

export default function PixelRoom({ type = 'room1', placedInterior = [] }: PixelRoomProps) {
  return (
    <>
      <Image
        src={BG_MAP[type]}
        alt={type}
        fill
        style={{ imageRendering: 'pixelated', objectFit: 'cover', zIndex: 0 }}
        priority
      />
      {placedInterior.map((placed, i) => {
        const item = getInteriorItem(placed.itemId);
        if (!item) return null;
        const style = getInteriorSpriteStyle(item.sprite);
        return (
          <div
            key={`${placed.itemId}-${i}`}
            className="absolute z-[1] pointer-events-none"
            style={{
              left: `${placed.x}%`,
              top: `${placed.y}%`,
              width: TILE_SIZE,
              height: TILE_SIZE,
              ...style,
              backgroundRepeat: 'no-repeat',
              imageRendering: 'pixelated',
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </>
  );
}
