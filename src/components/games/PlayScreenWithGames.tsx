'use client';

import { useState, useCallback } from 'react';
import type { Pet } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { calculateCurrentBoredom } from '@/lib/pet-utils';
import { BOREDOM_INCREASE_RATE } from '@/lib/constants';
import { canPlayGame, recordGamePlay } from '@/lib/game-play-cooldown';
import PlayGameSelectScreen, { type GameId } from './PlayGameSelectScreen';
import MultiplicationPuzzleGame from './MultiplicationPuzzleGame';

interface PlayScreenWithGamesProps {
  pet: Pet;
  setPet: (pet: Pet) => void;
  supabase: SupabaseClient;
  setPetMessage: (msg: string) => void;
  onBack: () => void;
  sessionStartAt?: number | null;
}

const BOREDOM_REDUCTION_PER_SCORE = 0.1;

/** 게임 점수 → 포인트 변환 (1/10 비율) */
function scoreToPoints(score: number): number {
  if (score <= 0) return 0;
  const base = Math.floor(score / 200);
  const bonus = score >= 500 ? 1 : 0;
  return Math.max(1, base + bonus);
}

export default function PlayScreenWithGames({
  pet,
  setPet,
  supabase,
  setPetMessage,
  onBack,
  sessionStartAt,
}: PlayScreenWithGamesProps) {
  const [subScreen, setSubScreen] = useState<'select' | 'multiplication'>('select');

  const handleGameEnd = useCallback(
    async (score: number, gameId: GameId) => {
      recordGamePlay(pet.id, gameId);

      const boredom = calculateCurrentBoredom(pet, sessionStartAt);
      const reduction = Math.min(boredom, Math.floor(score * BOREDOM_REDUCTION_PER_SCORE));
      const newBoredom = Math.max(0, boredom - reduction);
      const hoursForNewBoredom = newBoredom / BOREDOM_INCREASE_RATE;
      const last_played_at = new Date(Date.now() - hoursForNewBoredom * 3600 * 1000).toISOString();

      const pointsGain = scoreToPoints(score);
      const currentPoints = pet.points ?? 0;
      const newPoints = currentPoints + pointsGain;

      await supabase
        .from('pets')
        .update({ last_played_at, points: newPoints })
        .eq('id', pet.id);
      setPet({ ...pet, last_played_at, points: newPoints });
      setPetMessage(`곱셈 퍼즐 점수 ${score}pt! +${pointsGain}P 획득! 심심 -${reduction} 😊`);
    },
    [pet, sessionStartAt, supabase, setPet, setPetMessage]
  );

  const handleSelectGame = useCallback((gameId: GameId) => {
    if (!canPlayGame(pet.id, gameId)) return;
    if (gameId === 'multiplication') setSubScreen('multiplication');
  }, [pet.id]);

  if (subScreen === 'multiplication') {
    return (
      <MultiplicationPuzzleGame
        pet={pet}
        onBack={() => setSubScreen('select')}
        onGameEnd={(score) => handleGameEnd(score, 'multiplication')}
      />
    );
  }

  return (
    <PlayGameSelectScreen
      pet={pet}
      onBack={onBack}
      onSelectGame={handleSelectGame}
    />
  );
}
