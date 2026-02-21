'use client';

import { useState, useCallback } from 'react';
import { Exam, ExamResult } from '@/lib/types';
import { FETCH_ALLOWLIST } from '@/lib/fetch-allowlist';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SpeechBubble from '@/components/ui/SpeechBubble';
import { GraduationCap, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface ExamPanelProps {
  exam: Exam;
  studyLogs: string[];
  hasCheatSheet: boolean;
  onUseCheatSheet: () => void;
  onComplete: (result: ExamResult) => void;
}

export default function ExamPanel({
  exam,
  studyLogs,
  hasCheatSheet,
  onUseCheatSheet,
  onComplete,
}: ExamPanelProps) {
  const [phase, setPhase] = useState<'ready' | 'thinking' | 'answered' | 'graded'>('ready');
  const [petAnswer, setPetAnswer] = useState('');
  const [gradeResult, setGradeResult] = useState<{
    is_correct: boolean;
    explanation: string;
  } | null>(null);
  const [useCheat, setUseCheat] = useState(false);

  const handleStartExam = useCallback(async () => {
    setPhase('thinking');

    try {
      const examRes = await fetch(FETCH_ALLOWLIST.api.geminiExam(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyLogs,
          question: exam.question,
          useCheatSheet: useCheat,
        }),
      });
      const { answer } = await examRes.json();
      setPetAnswer(answer);
      setPhase('answered');

      const gradeRes = await fetch(FETCH_ALLOWLIST.api.geminiGrade(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: exam.question,
          modelAnswer: exam.model_answer,
          petAnswer: answer,
        }),
      });
      const grade = await gradeRes.json();
      setGradeResult(grade);
      setPhase('graded');
    } catch (error) {
      console.error('Exam error:', error);
      setPetAnswer('으악... 시험지를 못 읽겠어요... 😵');
      setPhase('answered');
    }
  }, [exam, studyLogs, useCheat]);

  const handleConfirmResult = useCallback(() => {
    if (!gradeResult) return;
    onComplete({
      id: 0,
      exam_id: exam.id,
      user_id: '',
      pet_answer: petAnswer,
      is_correct: gradeResult.is_correct,
      score: gradeResult.is_correct ? 50 : 10,
      created_at: new Date().toISOString(),
    });
  }, [gradeResult, exam, petAnswer, onComplete]);

  return (
    <Card className="w-full border-amber-200 bg-amber-50/50">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap size={24} className="text-amber-600" />
        <h3 className="font-bold text-amber-800 text-lg">시험 시간!</h3>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl p-4 mb-4 border-2 border-amber-200">
        <p className="text-xs text-amber-600 font-semibold mb-1">문제</p>
        <p className="text-gray-800 font-medium">{exam.question}</p>
      </div>

      {/* Cheat Sheet Option */}
      {phase === 'ready' && hasCheatSheet && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
          <input
            type="checkbox"
            id="cheat"
            checked={useCheat}
            onChange={(e) => setUseCheat(e.target.checked)}
            className="w-4 h-4 accent-purple-500"
          />
          <label htmlFor="cheat" className="text-sm text-purple-700 flex items-center gap-1">
            <Sparkles size={14} />
            컨닝 페이퍼 사용 (1개 소모)
          </label>
        </div>
      )}

      {/* Pet Answer */}
      {phase !== 'ready' && (
        <div className="mb-4 flex justify-center">
          <SpeechBubble isThinking={phase === 'thinking'}>
            {petAnswer}
          </SpeechBubble>
        </div>
      )}

      {/* Grade Result */}
      {phase === 'graded' && gradeResult && (
        <div
          className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${
            gradeResult.is_correct
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-red-50 border-2 border-red-200'
          }`}
        >
          {gradeResult.is_correct ? (
            <CheckCircle size={24} className="text-green-500 shrink-0 mt-0.5" />
          ) : (
            <XCircle size={24} className="text-red-500 shrink-0 mt-0.5" />
          )}
          <div>
            <p
              className={`font-bold ${
                gradeResult.is_correct ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {gradeResult.is_correct ? '정답! 🎉' : '오답 😢'}
            </p>
            <p className="text-sm text-gray-600 mt-1">{gradeResult.explanation}</p>
            <p className="text-xs text-gray-400 mt-1">
              획득 경험치: +{gradeResult.is_correct ? 50 : 10} EXP
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3">
        {phase === 'ready' && (
          <Button onClick={handleStartExam} variant="primary" size="lg">
            시험 시작! 📝
          </Button>
        )}
        {phase === 'thinking' && (
          <p className="text-sm text-amber-600 animate-pulse">
            펫이 열심히 생각하고 있어요... 🤔
          </p>
        )}
        {phase === 'graded' && (
          <Button onClick={handleConfirmResult} variant="secondary">
            결과 확인 완료
          </Button>
        )}
      </div>
    </Card>
  );
}
