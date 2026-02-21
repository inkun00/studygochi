'use client';

import { useState, useRef, useEffect } from 'react';
import { FETCH_ALLOWLIST } from '@/lib/fetch-allowlist';
import PixelPet from '@/components/pet/PixelPet';
import { getCharacterSprite, getPetMBTI } from '@/lib/pet-constants';
import { INTELLIGENCE_PER_STUDY_CHAR, POINTS_PER_STUDY_CHAR, EXP_PER_STUDY_CHAR } from '@/lib/constants';
import { calculateLevel } from '@/lib/pet-utils';
import type { Pet, StudyLog, UserProfile } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

interface ChatMessage {
  id: string;
  role: 'user' | 'pet';
  text: string;
  timestamp: number;
}

interface ChatScreenProps {
  pet: Pet;
  studyLogs: StudyLog[];
  userName?: string;
  user: UserProfile | null;
  supabase: SupabaseClient;
  addStudyLog: (log: StudyLog) => void;
  setPet: (pet: Pet | null) => void;
  onBack: () => void;
}

export default function ChatScreen({ pet, studyLogs, userName = '사용자', user, supabase, addStudyLog, setPet, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role as 'user' | 'model',
        text: m.text,
      }));
      const recentLogs = studyLogs.slice(0, 20).map((l) => l.content);

      const res = await fetch(FETCH_ALLOWLIST.api.geminiChat(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          conversationHistory: history,
          mbti: getPetMBTI(pet),
          studyLogs: recentLogs,
          userName,
          petName: pet.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '대화 실패');

      const petAnswer = data.answer || '...';
      const petMsg: ChatMessage = {
        id: `p-${Date.now()}`,
        role: 'pet',
        text: petAnswer,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, petMsg]);

      // 학습 관련 내용만 요약해서 노트에 저장
      if (user?.id) {
        try {
          const sumRes = await fetch(FETCH_ALLOWLIST.api.geminiSummarizeLearning(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userMessage: text, petAnswer }),
          });
          const sumData = await sumRes.json();
          const summary = sumData?.summary;
          if (summary && typeof summary === 'string' && summary.trim()) {
            const trimmed = summary.trim();
            const { data: log } = await supabase
              .from('study_logs')
              .insert({ user_id: user.id, content: trimmed })
              .select()
              .single();
            if (log) {
              addStudyLog(log);
              const len = trimmed.length;
              const intelligenceGain = Math.max(1, Math.floor(len / INTELLIGENCE_PER_STUDY_CHAR));
              const pointsGain = Math.max(1, Math.floor(len / POINTS_PER_STUDY_CHAR));
              const expGain = Math.max(1, Math.floor(len / EXP_PER_STUDY_CHAR));
              const newIntelligence = (pet.intelligence ?? 0) + intelligenceGain;
              const newPoints = (pet.points || 0) + pointsGain;
              const newExp = pet.experience + expGain;
              const newLevel = calculateLevel(newExp);
              const lastStudiedAt = new Date().toISOString();
              await supabase.from('pets').update({ points: newPoints, intelligence: newIntelligence, experience: newExp, level: newLevel, last_studied_at: lastStudiedAt }).eq('id', pet.id);
              setPet({ ...pet, points: newPoints, intelligence: newIntelligence, experience: newExp, level: newLevel, last_studied_at: lastStudiedAt });
            }
          }
        } catch {
          // 노트 저장 실패 시 무시
        }
      }
    } catch (err) {
      const errMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: 'pet',
        text: '미안해요, 잘 모르겠어요... 다시 말해주실래요? 😢',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full h-full flex flex-col animate-slide-in" style={{ background: '#abc1d1' }}>
      {/* 헤더 - 카카오톡 스타일 */}
      <div className="flex items-center gap-2 p-2 shrink-0" style={{ background: '#9eaab7' }}>
        <button onClick={onBack} className="text-[14px] p-1" style={{ fontFamily: "'Press Start 2P'", color: '#333' }}>
          ←
        </button>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ background: '#e8e8e8' }}>
            <PixelPet isDead={false} size={32} characterSprite={getCharacterSprite(pet)} />
          </div>
          <div>
            <p className="text-[10px] font-bold" style={{ fontFamily: "'Press Start 2P'", color: '#333' }}>{pet.name}</p>
            <p className="text-[6px]" style={{ fontFamily: "'Press Start 2P'", color: '#666' }}>Lv.{pet.level}</p>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-3 flex flex-col"
      >
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <p className="text-[10px] mb-2" style={{ fontFamily: "'Press Start 2P'", color: '#666' }}>
              {pet.name}에게 말해보세요!
            </p>
            <p className="text-[8px]" style={{ fontFamily: "'Press Start 2P'", color: '#999' }}>
              지식 질문은 공부한 내용만 답해요
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[75%] px-2.5 py-1.5 rounded-lg"
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                lineHeight: 1.5,
                ...(m.role === 'user'
                  ? { background: '#ffe812', color: '#333', border: '1px solid #e8d000' }
                  : { background: '#fff', color: '#333', border: '1px solid #e0e0e0' }),
              }}
            >
              <span className="whitespace-pre-wrap break-words">{m.text}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="px-2.5 py-1.5 rounded-lg"
              style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#999',
              }}
            >
              ...
            </div>
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="p-1.5 shrink-0" style={{ background: '#fff', borderTop: '1px solid #e0e0e0' }}>
        <div className="flex gap-1 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요"
            maxLength={200}
            className="flex-1 max-w-[75%] px-1.5 py-1 rounded text-[12px] outline-none min-h-[40px]"
            style={{
              fontFamily: "'Press Start 2P'",
              border: '1px solid #ddd',
              background: '#f8f8f8',
            }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-3 py-1 rounded text-[12px] font-bold disabled:opacity-40 transition-opacity shrink-0 min-h-[40px] min-w-[63px]"
            style={{
              fontFamily: "'Press Start 2P'",
              background: '#ffe812',
              color: '#333',
              border: '1px solid #e8d000',
            }}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
