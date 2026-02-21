'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Sparkles } from 'lucide-react';

interface PetCreationFormProps {
  onCreatePet: (name: string) => Promise<void>;
  isLoading: boolean;
}

export default function PetCreationForm({ onCreatePet, isLoading }: PetCreationFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      await onCreatePet(name.trim());
    },
    [name, onCreatePet]
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-emerald-50 to-sky-50">
      <Card className="w-full max-w-sm text-center">
        <div className="text-7xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
          🥚
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">새 펫이 태어났어요!</h2>
        <p className="text-sm text-gray-500 mb-6">
          펫의 이름을 지어주세요. 잘 가르쳐주면 시험도 잘 볼 거예요!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="펫 이름 (예: 뽀삐)"
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors text-center text-lg font-semibold"
            maxLength={20}
            required
          />
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!name.trim()}
            className="w-full"
            size="lg"
          >
            <Sparkles size={18} className="mr-2" />
            펫 탄생!
          </Button>
        </form>
      </Card>
    </div>
  );
}
