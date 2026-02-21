'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useStore } from '@/store/useStore';
import { Exam } from '@/lib/types';
import { MAX_STUDY_LOGS_FOR_EXAM, MAX_INTELLIGENCE, EXP_PER_CORRECT, EXP_PER_WRONG } from '@/lib/constants';
import { FETCH_ALLOWLIST } from '@/lib/fetch-allowlist';
import { calculateLevel, isPetDead } from '@/lib/pet-utils';
import PixelPet from '@/components/pet/PixelPet';
import { getCharacterSprite } from '@/lib/pet-constants';

interface Classroom { id: string; name: string; teacher_id: string; code: string; created_at: string; }

export default function ExamPageClient() {
  const supabase = createClient();
  const { user, setUser, pet, setPet, studyLogs, setPetMessage, sessionStartAt } = useStore();
  const [activeExams, setActiveExams] = useState<Exam[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [currentExamIdx, setCurrentExamIdx] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'ready' | 'thinking' | 'result'>('idle');
  const [useCheatSheet, setUseCheatSheet] = useState(false);
  const [petAnswer, setPetAnswer] = useState('');
  const [gradeResult, setGradeResult] = useState<{ is_correct: boolean; explanation: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [question, setQuestion] = useState('');
  const [modelAnswer, setModelAnswer] = useState('');

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!user) return;
      if (isTeacher) {
        const { data } = await supabase.from('classrooms').select('*').eq('teacher_id', user.id);
        if (data) setClassrooms(data);
      } else {
        const { data: members } = await supabase.from('classroom_members').select('classroom_id').eq('user_id', user.id);
        if (members?.length) {
          const { data: rooms } = await supabase.from('classrooms').select('*').in('id', members.map(m => m.classroom_id));
          if (rooms) setClassrooms(rooms);
        }
      }
    };
    fetchClassrooms();
  }, [user, isTeacher, supabase]);

  useEffect(() => {
    const fetchExams = async () => {
      if (!user) return;
      const roomIds = classrooms.map(r => r.id);
      let data: Exam[] = [];
      if (roomIds.length > 0) {
        const { data: byRoom } = await supabase.from('exams').select('*').eq('is_active', true).in('room_id', roomIds).order('created_at', { ascending: false });
        const { data: noRoom } = await supabase.from('exams').select('*').eq('is_active', true).is('room_id', null).order('created_at', { ascending: false });
        const seen = new Set<number>();
        const merged = [...(byRoom || []), ...(noRoom || [])].filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true; }).sort((a, b) => new Date((b as { created_at?: string }).created_at || 0).getTime() - new Date((a as { created_at?: string }).created_at || 0).getTime());
        data = merged;
      } else {
        const { data: all } = await supabase.from('exams').select('*').eq('is_active', true).is('room_id', null).order('created_at', { ascending: false });
        data = all || [];
      }
      setActiveExams(data);
      if (data.length > 0) setPhase('ready');
    };
    fetchExams();
  }, [supabase, user, classrooms]);

  const handleStartExam = useCallback(async () => {
    if (!pet || !user) return;
    const exam = activeExams[currentExamIdx];
    if (!exam) return;
    const willUseCheat = useCheatSheet && (user.items.cheat_sheet || 0) > 0;
    setPhase('thinking');
    const recentLogs = studyLogs.slice(0, MAX_STUDY_LOGS_FOR_EXAM).map((l) => l.content);

    try {
      const examRes = await fetch(FETCH_ALLOWLIST.api.geminiExam(), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyLogs: recentLogs,
          question: exam.question,
          useCheatSheet: willUseCheat,
          userName: user?.display_name || '사용자',
        }),
      });
      const examData = await examRes.json();
      if (!examRes.ok) throw new Error(examData?.error || '시험 풀이 실패');
      const answer = examData.answer ?? '';
      setPetAnswer(answer);

      const gradeRes = await fetch(FETCH_ALLOWLIST.api.geminiGrade(), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: exam.question, modelAnswer: exam.model_answer, petAnswer: answer }),
      });
      const grade = await gradeRes.json();
      if (!gradeRes.ok) throw new Error(grade?.error || '채점 실패');
      setGradeResult(grade);

      const expGain = grade.is_correct ? EXP_PER_CORRECT : EXP_PER_WRONG;
      const newExp = pet.experience + expGain;
      const newLevel = calculateLevel(newExp);
      const newInt = Math.min(MAX_INTELLIGENCE, pet.intelligence + (grade.is_correct ? 10 : 2));

      await supabase.from('exam_results').insert({ exam_id: exam.id, user_id: user.id, pet_answer: answer, is_correct: grade.is_correct, score: grade.is_correct ? 50 : 10 });
      const lastStudiedAt = new Date().toISOString();
      await supabase.from('pets').update({ experience: newExp, level: newLevel, intelligence: newInt, last_studied_at: lastStudiedAt }).eq('id', pet.id);
      setPet({ ...pet, experience: newExp, level: newLevel, intelligence: newInt, last_studied_at: lastStudiedAt });

      if (willUseCheat) {
        const newItems = { ...user.items, cheat_sheet: Math.max(0, (user.items.cheat_sheet || 0) - 1) };
        await supabase.from('profiles').update({ items: newItems }).eq('id', user.id);
        setUser({ ...user, items: newItems });
      }

      if (newLevel > pet.level) setPetMessage(`레벨업! Lv.${newLevel}! 🎉`);
      else setPetMessage(grade.is_correct ? '정답! 🎯' : '틀렸어... 📚');
      setPhase('result');
    } catch (e) {
      console.error(e);
      setPetAnswer('시험지를 못 읽겠어요...');
      setPhase('result');
    }
  }, [activeExams, currentExamIdx, pet, user, studyLogs, useCheatSheet, supabase, setPet, setUser, setPetMessage]);

  const handleNext = () => {
    if (currentExamIdx < activeExams.length - 1) setCurrentExamIdx(i => i + 1);
    setPhase('ready');
    setPetAnswer('');
    setGradeResult(null);
    setUseCheatSheet(false);
  };

  const handleCreateExam = async () => {
    if (!question.trim() || !modelAnswer.trim()) return;
    setIsCreating(true);
    const payload: { question: string; model_answer: string; is_active: boolean; room_id?: string } = {
      question: question.trim(),
      model_answer: modelAnswer.trim(),
      is_active: true,
    };
    if (selectedRoomId) payload.room_id = selectedRoomId;
    const { data } = await supabase.from('exams').insert(payload).select().single();
    if (data) setActiveExams(prev => [data, ...prev]);
    setQuestion('');
    setModelAnswer('');
    setIsCreating(false);
  };

  if (!pet || !user) return null;
  const dead = isPetDead(pet, sessionStartAt);
  const currentExam = activeExams[currentExamIdx];

  // Teacher mode
  if (isTeacher) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[12px] mb-1" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>문제 출제</p>
        {classrooms.length > 0 && (
          <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)}
            className="w-full p-2 rounded-lg text-[10px]"
            style={{ fontFamily: "'Press Start 2P'", border: '2px solid #e0c8a0', background: '#fff', color: '#805030', outline: 'none' }}>
            <option value="">교실 선택 (미선택=전체)</option>
            {classrooms.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        )}
        <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="문제를 입력하세요"
          className="w-full p-2 rounded-lg text-[12px]"
          style={{ fontFamily: "'Press Start 2P'", border: '2px solid #e0c8a0', background: '#fff', color: '#805030', outline: 'none' }} />
        <input value={modelAnswer} onChange={e => setModelAnswer(e.target.value)} placeholder="모범 답안"
          className="w-full p-2 rounded-lg text-[12px]"
          style={{ fontFamily: "'Press Start 2P'", border: '2px solid #e0c8a0', background: '#fff', color: '#805030', outline: 'none' }} />
        <button onClick={handleCreateExam} disabled={isCreating || !question.trim() || !modelAnswer.trim()}
          className="pixel-btn px-3 py-1.5 text-[12px] w-full disabled:opacity-40"
          style={{ fontFamily: "'Press Start 2P'", background: '#c0e0ff', color: '#3060a0', borderColor: '#6090c0' }}>
          {isCreating ? '...' : '출제하기'}
        </button>
        <p className="text-[10px] mt-1" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>
          활성 문제: {activeExams.length}개
        </p>
      </div>
    );
  }

  // Student mode
  return (
    <div className="flex flex-col items-center gap-2">
      {dead ? (
        <p className="text-[12px] text-center" style={{ fontFamily: "'Press Start 2P'", color: '#ff4040' }}>
          GHOST MODE!<br />시험 불가
        </p>
      ) : !currentExam ? (
        <div className="text-center py-4">
          <p className="text-[12px]" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>시험 없음</p>
          <p className="text-[10px] mt-1" style={{ fontFamily: "'Press Start 2P'", color: '#c0a880' }}>공부해두세요!</p>
        </div>
      ) : (
        <>
          <div className="w-full p-2 rounded-lg" style={{ background: '#fff0e0', border: '2px solid #e0c8a0' }}>
            <p className="text-[10px] mb-1" style={{ fontFamily: "'Press Start 2P'", color: '#d06000' }}>Q.</p>
            <p className="text-[12px] leading-relaxed" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>
              {currentExam.question}
            </p>
          </div>

          {phase === 'thinking' && (
            <div className="flex flex-col items-center gap-2 py-2">
              <PixelPet isDead={false} isThinking={true} size={48} characterSprite={getCharacterSprite(pet)} />
              <p className="text-[10px] animate-pulse" style={{ fontFamily: "'Press Start 2P'", color: '#d06000' }}>생각 중...</p>
            </div>
          )}

          {phase === 'result' && (
            <>
              <div className="w-full p-2 rounded-lg" style={{ background: gradeResult?.is_correct ? '#e0ffe0' : '#ffe0e0', border: `2px solid ${gradeResult?.is_correct ? '#80c080' : '#c08080'}` }}>
                <p className="text-[10px] mb-1" style={{ fontFamily: "'Press Start 2P'", color: gradeResult?.is_correct ? '#308030' : '#c03030' }}>
                  {gradeResult?.is_correct ? '⭕ 정답!' : '❌ 오답'}
                </p>
                <p className="text-[10px] leading-relaxed" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>
                  {petAnswer.slice(0, 100)}
                </p>
              </div>
              <p className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>
                +{gradeResult?.is_correct ? 50 : 10} EXP
              </p>
              <button onClick={handleNext} className="pixel-btn px-3 py-1.5 text-[12px]"
                style={{ fontFamily: "'Press Start 2P'", background: '#ffe8c0', color: '#d06000', borderColor: '#d0a060' }}>
                NEXT
              </button>
            </>
          )}

          {phase === 'ready' && (
            <div className="flex flex-col items-center gap-2">
              {(user.items.cheat_sheet || 0) > 0 && (
                <label className="flex items-center gap-1.5 text-[10px] cursor-pointer" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>
                  <input type="checkbox" checked={useCheatSheet} onChange={e => setUseCheatSheet(e.target.checked)} className="w-3 h-3" />
                  📝 컨닝페이퍼 사용 (보유: {user.items.cheat_sheet})
                </label>
              )}
              <button onClick={handleStartExam} className="pixel-btn px-4 py-2 text-[14px]"
                style={{ fontFamily: "'Press Start 2P'", background: '#ffe0e0', color: '#d04040', borderColor: '#d08080' }}>
                START!
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
