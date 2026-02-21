'use client';

import type { Pet } from '@/lib/types';

interface PlayScreenProps {
  pet: Pet;
  onBack: () => void;
}

export default function PlayScreen({ pet, onBack }: PlayScreenProps) {
  return (
    <div className="w-full h-full flex flex-col animate-slide-in" style={{ background: '#fff8f0' }}>
      <div className="flex items-center gap-1 p-2">
        <button onClick={onBack} className="text-[14px]" style={{ fontFamily: "'Press Start 2P'", color: '#d06000' }}>
          ←
        </button>
        <div className="flex-1 text-center py-1 rounded" style={{ background: '#c0a0ff', fontFamily: "'Press Start 2P'" }}>
          <span className="text-[14px] text-white">놀기</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-[12px] text-center leading-relaxed" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>
          {pet.name}와(과) 놀기
          <br />
          <br />
          (기능 준비 중)
        </p>
      </div>
    </div>
  );
}
