'use client';

import type { CharacterSprite } from '@/lib/types';
import { SPRITE_SHEET_MAP, SPRITE_ROW_MAP } from '@/lib/pet-constants';

interface PixelPetProps {
  isDead: boolean;
  isThinking?: boolean;
  isHappy?: boolean;
  size?: number;
  characterSprite?: CharacterSprite;
}

const COLS = 4;
const FRAME_IDLE = 0;

export default function PixelPet({ isDead, isThinking, isHappy, size = 80, characterSprite = 'rabbit' }: PixelPetProps) {
  if (isDead) {
    return (
      <div className="animate-float-pet opacity-70">
        <img
          src="/sprites/pet-ghost.png"
          alt="Pet"
          width={size}
          height={size}
          style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
        />
      </div>
    );
  }

  const sheet = SPRITE_SHEET_MAP[characterSprite];
  const rows = SPRITE_ROW_MAP[characterSprite];
  const bgPosX = -(FRAME_IDLE % COLS) * size;
  const bgPosY = -rows.rowIdle * size;

  const animClass = isThinking ? '' : isHappy ? 'animate-bounce' : 'animate-float-pet';

  return (
    <div className={animClass} style={isThinking ? { animation: 'walk 0.8s steps(4) infinite' } : undefined}>
      <div
        style={{
          width: size,
          height: size,
          overflow: 'hidden',
          backgroundImage: `url(${sheet})`,
          backgroundPosition: `${bgPosX}px ${bgPosY}px`,
          backgroundSize: `${COLS * size}px ${rows.totalRows * size}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
