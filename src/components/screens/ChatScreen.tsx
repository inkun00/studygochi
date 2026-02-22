'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { FETCH_ALLOWLIST } from '@/lib/fetch-allowlist';
import PixelPet from '@/components/pet/PixelPet';
import { getCharacterSprite, getPetMBTI } from '@/lib/pet-constants';
import { MAX_INTELLIGENCE, INTELLIGENCE_PER_STUDY_CHAR, POINTS_PER_STUDY_CHAR, EXP_PER_STUDY_CHAR, CHAT_EXCHANGES_PER_SESSION, CHAT_INPUT_MAX_LENGTH } from '@/lib/constants';
import { ensureStudyLogsLimit } from '@/lib/study-logs';
import { calculateLevel, canChat, getChatCooldownRemaining, isDuplicateOfExistingContent } from '@/lib/pet-utils';
import type { Pet, StudyLog, UserProfile } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

function formatCooldownRemaining(ms: number): string {
  if (ms <= 0) return '0분 0초';
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}분 ${s}초`;
}

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
  const { chatMessages, setChatMessages } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>(() => chatMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(() => {
    const count = chatMessages.filter((m) => m.role === 'pet').length;
    return count >= CHAT_EXCHANGES_PER_SESSION;
  });
  const [remainingMs, setRemainingMs] = useState(() => getChatCooldownRemaining(pet));
  const scrollRef = useRef<HTMLDivElement>(null);

  const onCooldown = !canChat(pet);
  const exchangeCount = messages.filter((m) => m.role === 'pet').length;

  // 진입 시 DB에서 pet 재조회 → last_chat_at 정확히 반영
  useEffect(() => {
    if (!pet?.id) return;
    let cancelled = false;
    supabase.from('pets').select('*').eq('id', pet.id).single().then(({ data }) => {
      if (!cancelled && data) setPet(data);
    });
    return () => { cancelled = true; };
  }, [pet?.id, supabase, setPet]);

  useEffect(() => {
    setChatMessages(sessionComplete ? [] : messages);
  }, [messages, sessionComplete, setChatMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // 쿨다운 타이머: 1초마다 남은 시간 갱신
  useEffect(() => {
    if (!onCooldown) {
      setRemainingMs(0);
      return;
    }
    const update = () => setRemainingMs(getChatCooldownRemaining(pet));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [onCooldown, pet]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (sessionComplete) return;
    if (exchangeCount >= CHAT_EXCHANGES_PER_SESSION) return;
    if (onCooldown) {
      alert(`1시간 쿨다운! ${formatCooldownRemaining(remainingMs)} 후 대화 가능해요.`);
      return;
    }

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
      const nextMessages = [...messages, userMsg, petMsg];
      const newExchangeCount = nextMessages.filter((m) => m.role === 'pet').length;
      setMessages(nextMessages);

      if (newExchangeCount >= CHAT_EXCHANGES_PER_SESSION) {
        setSessionComplete(true);
        setChatMessages([]);
        const lastChatAt = new Date().toISOString();
        await supabase.from('pets').update({ last_chat_at: lastChatAt }).eq('id', pet.id);
        setPet({ ...pet, last_chat_at: lastChatAt });
      }

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
            if (!isDuplicateOfExistingContent(trimmed, studyLogs)) {
              await ensureStudyLogsLimit(supabase, user.id);
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
                const newIntelligence = Math.min(MAX_INTELLIGENCE, (pet.intelligence ?? 0) + intelligenceGain);
                const newPoints = (pet.points || 0) + pointsGain;
                const newExp = pet.experience + expGain;
                const newLevel = calculateLevel(newExp);
                const lastStudiedAt = new Date().toISOString();
                await supabase.from('pets').update({ points: newPoints, intelligence: newIntelligence, experience: newExp, level: newLevel, last_studied_at: lastStudiedAt }).eq('id', pet.id);
                setPet({ ...pet, points: newPoints, intelligence: newIntelligence, experience: newExp, level: newLevel, last_studied_at: lastStudiedAt });
              }
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
        {messages.length === 0 && onCooldown && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <p className="text-[10px] mb-2" style={{ fontFamily: "'Press Start 2P'", color: '#e04040' }}>
              1시간 쿨다운!
            </p>
            <p className="text-[8px] font-bold" style={{ fontFamily: "'Press Start 2P'", color: '#333' }}>
              {formatCooldownRemaining(remainingMs)} 후 대화 가능해요
            </p>
          </div>
        )}
        {messages.length === 0 && canChat(pet) && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <p className="text-[10px] mb-2" style={{ fontFamily: "'Press Start 2P'", color: '#666' }}>
              {pet.name}에게 말해보세요!
            </p>
            <p className="text-[8px]" style={{ fontFamily: "'Press Start 2P'", color: '#999' }}>
              지식 질문은 공부한 내용만 답해요. 5번 주고받기 = 1회
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
        {(sessionComplete || onCooldown) && (
          <p className="text-[8px] mb-1 text-center" style={{ fontFamily: "'Press Start 2P'", color: onCooldown ? '#e04040' : '#408040' }}>
            {onCooldown ? `${formatCooldownRemaining(remainingMs)} 후 대화 가능` : '5번 대화 완료! 1시간 후 다시 대화 가능'}
          </p>
        )}
        <div className="flex gap-1 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`메시지 (${CHAT_INPUT_MAX_LENGTH}자 이내)`}
            maxLength={CHAT_INPUT_MAX_LENGTH}
            className="flex-1 max-w-[75%] px-1.5 py-1 rounded text-[12px] outline-none min-h-[40px] chat-input-space"
            style={{
              fontFamily: "'Press Start 2P'",
              border: '1px solid #ddd',
              background: '#f8f8f8',
            }}
            disabled={loading || onCooldown || sessionComplete}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || sessionComplete || onCooldown}
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
