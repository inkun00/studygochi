'use client';

import { useState, useEffect } from 'react';
import type { Pet } from '@/lib/types';
import { canPlayGame, getRemainingCooldownMs, formatRemainingCooldown } from '@/lib/game-play-cooldown';

export type GameId = 'multiplication' | string;

interface GameItem {
  id: GameId;
  label: string;
  emoji: string;
  description: string;
}

const GAMES: GameItem[] = [
  {
    id: 'multiplication',
    label: '곱셈 퍼즐',
    emoji: '🔢',
    description: '애니팡 형식! 숫자 연결해 곱셈식 완성. 점수↑→포인트↑ 24시간에 1회',
  },
];

interface PlayGameSelectScreenProps {
  pet: Pet;
  onBack: () => void;
  onSelectGame: (gameId: GameId) => void;
}

export default function PlayGameSelectScreen({ pet, onBack, onSelectGame }: PlayGameSelectScreenProps) {
  const [cooldownUpdates, setCooldownUpdates] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCooldownUpdates((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full h-full flex flex-col animate-slide-in" style={{ background: '#fff8f0' }}>
      <div className="flex items-center gap-1 p-2 shrink-0">
        <button
          onClick={onBack}
          className="text-[14px] p-1"
          style={{ fontFamily: "'Press Start 2P'", color: '#d06000' }}
        >
          ←
        </button>
        <div className="flex-1 text-center py-1 rounded" style={{ background: '#c0a0ff', fontFamily: "'Press Start 2P'" }}>
          <span className="text-[14px] text-white">게임 선택</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-[10px] mb-3" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>
          {pet.name}와(과) 놀아요!
        </p>
        {GAMES.map((game) => {
          const playable = canPlayGame(pet.id, game.id);
          const remainingMs = getRemainingCooldownMs(pet.id, game.id);
          const cooldownText = formatRemainingCooldown(remainingMs);

          return (
            <button
              key={game.id}
              onClick={() => playable && onSelectGame(game.id)}
              disabled={!playable}
              className="w-full p-4 rounded-lg text-left transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
              style={{
                background: playable ? '#f0e8e0' : '#e8e0d8',
                border: `2px solid ${playable ? '#d0c0b0' : '#c0b0a0'}`,
                fontFamily: "'Press Start 2P'",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{game.emoji}</span>
                <div className="flex-1">
                  <p className="text-[12px]" style={{ color: '#2a2035' }}>
                    {game.label}
                  </p>
                  <p className="text-[8px] mt-1" style={{ color: '#806050' }}>
                    {playable ? game.description : `다음 플레이: ${cooldownText} 후`}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
