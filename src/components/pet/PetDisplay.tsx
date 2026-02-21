'use client';

import { useMemo } from 'react';
import { Pet } from '@/lib/types';
import { calculateCurrentHunger, getPetStage, isPetDead, getExpProgress, calculateCurrentIntelligence } from '@/lib/pet-utils';
import { EXP_TO_LEVEL_UP, MAX_HUNGER } from '@/lib/constants';
import ProgressBar from '@/components/ui/ProgressBar';
import SpeechBubble from '@/components/ui/SpeechBubble';
import { getHungerBarColor } from '@/lib/pet-utils';

interface PetDisplayProps {
  pet: Pet;
  message: string;
  isThinking?: boolean;
  sessionStartAt?: number | null;
}

export default function PetDisplay({ pet, message, isThinking, sessionStartAt }: PetDisplayProps) {
  const hunger = useMemo(() => calculateCurrentHunger(pet, sessionStartAt), [pet, sessionStartAt]);
  const dead = useMemo(() => isPetDead(pet, sessionStartAt), [pet, sessionStartAt]);
  const stage = useMemo(() => getPetStage(pet.level), [pet.level]);
  const expProgress = useMemo(() => getExpProgress(pet.experience), [pet.experience]);
  const intelligence = useMemo(() => calculateCurrentIntelligence(pet, sessionStartAt), [pet, sessionStartAt]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Speech Bubble */}
      <SpeechBubble isThinking={isThinking}>
        {dead ? '으으... 배고파서 못 움직여요... 👻' : message}
      </SpeechBubble>

      {/* Pet Character */}
      <div className="relative">
        <div
          className={`text-8xl transition-all duration-300 select-none ${
            dead
              ? 'grayscale opacity-50'
              : 'animate-bounce hover:scale-110 cursor-pointer'
          }`}
          style={{ animationDuration: '2s' }}
        >
          {dead ? '👻' : stage.emoji}
        </div>
        {!dead && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            Lv.{pet.level}
          </div>
        )}
      </div>

      {/* Pet Name */}
      <h2 className="text-xl font-bold text-gray-800">
        {pet.name}
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({stage.name})
        </span>
      </h2>

      {/* Status Bars */}
      <div className="w-full max-w-xs space-y-2">
        <ProgressBar
          label="🧠 경험치"
          value={expProgress}
          max={EXP_TO_LEVEL_UP}
          color="#a060e0"
        />
        <ProgressBar
          label="🍖 배고픔"
          value={hunger}
          max={MAX_HUNGER}
          color={getHungerBarColor(hunger)}
        />
        <ProgressBar
          label="📚 지능"
          value={intelligence}
          max={Math.max(100, intelligence + 50)}
          color="#4080ff"
        />
      </div>
    </div>
  );
}
