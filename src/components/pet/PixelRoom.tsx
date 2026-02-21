'use client';

import Image from 'next/image';
import type { RoomType } from '@/lib/types';
import { BG_MAP } from '@/lib/pet-constants';

interface PixelRoomProps {
  type?: RoomType;
}

export default function PixelRoom({ type = 'bedroom' }: PixelRoomProps) {
  return (
    <Image
      src={BG_MAP[type]}
      alt={type}
      fill
      style={{ imageRendering: 'pixelated', objectFit: 'cover', zIndex: 0 }}
      priority
    />
  );
}
