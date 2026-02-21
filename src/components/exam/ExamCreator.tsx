'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PlusCircle, GraduationCap } from 'lucide-react';

interface ExamCreatorProps {
  onCreateExam: (question: string, modelAnswer: string) => Promise<void>;
  isLoading: boolean;
}

export default function ExamCreator({ onCreateExam, isLoading }: ExamCreatorProps) {
  const [question, setQuestion] = useState('');
  const [modelAnswer, setModelAnswer] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!question.trim() || !modelAnswer.trim()) return;
    await onCreateExam(question.trim(), modelAnswer.trim());
    setQuestion('');
    setModelAnswer('');
  }, [question, modelAnswer, onCreateExam]);

  return (
    <Card className="w-full border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap size={20} className="text-blue-600" />
        <h3 className="font-bold text-gray-800">시험 문제 출제</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-semibold text-gray-600 mb-1 block">
            문제
          </label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="예: 임진왜란의 발발 연도는?"
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-sm"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600 mb-1 block">
            모범 답안 (채점 기준)
          </label>
          <input
            value={modelAnswer}
            onChange={(e) => setModelAnswer(e.target.value)}
            placeholder="예: 1592년"
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-sm"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!question.trim() || !modelAnswer.trim()}
          variant="secondary"
          className="w-full"
        >
          <PlusCircle size={16} className="mr-2" />
          문제 출제하기
        </Button>
      </div>
    </Card>
  );
}
