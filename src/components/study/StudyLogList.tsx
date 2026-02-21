'use client';

import { StudyLog } from '@/lib/types';
import Card from '@/components/ui/Card';
import { History } from 'lucide-react';

interface StudyLogListProps {
  logs: StudyLog[];
}

export default function StudyLogList({ logs }: StudyLogListProps) {
  if (logs.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-gray-400 text-sm">
          아직 학습 기록이 없어요.
          <br />
          펫에게 무언가를 가르쳐주세요! 📚
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <History size={20} className="text-sky-500" />
        <h3 className="font-bold text-gray-800">학습 기록</h3>
        <span className="text-xs text-gray-400 ml-auto">
          총 {logs.length}개
        </span>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700"
          >
            <p className="whitespace-pre-wrap">{log.content}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(log.created_at).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
