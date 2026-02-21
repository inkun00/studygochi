'use client';

import { useState, useCallback } from 'react';
import { MAX_STUDY_LENGTH } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { BookOpen, Send } from 'lucide-react';

interface StudyEditorProps {
  onSubmit: (content: string) => Promise<void>;
  isLoading: boolean;
}

export default function StudyEditor({ onSubmit, isLoading }: StudyEditorProps) {
  const [content, setContent] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || content.length > MAX_STUDY_LENGTH) return;
    await onSubmit(content.trim());
    setContent('');
  }, [content, onSubmit]);

  const remaining = MAX_STUDY_LENGTH - content.length;

  return (
    <Card className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={20} className="text-emerald-500" />
        <h3 className="font-bold text-gray-800">공부하기</h3>
      </div>

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="펫에게 가르쳐줄 내용을 입력하세요...&#10;예: 임진왜란은 1592년에 일어났어."
          className="w-full h-32 p-3 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-emerald-400 transition-colors text-sm text-gray-700 placeholder-gray-400"
          maxLength={MAX_STUDY_LENGTH}
          disabled={isLoading}
        />
        <span
          className={`absolute bottom-3 right-3 text-xs ${
            remaining < 50 ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          {remaining}자 남음
        </span>
      </div>

      <div className="flex justify-end mt-3">
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!content.trim() || content.length > MAX_STUDY_LENGTH}
          size="md"
        >
          <Send size={16} className="mr-2" />
          가르쳐주기
        </Button>
      </div>
    </Card>
  );
}
