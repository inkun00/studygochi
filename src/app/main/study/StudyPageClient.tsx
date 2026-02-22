'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useStore } from '@/store/useStore';
import { MAX_STUDY_LENGTH, MAX_INTELLIGENCE, INTELLIGENCE_PER_STUDY_CHAR, POINTS_PER_STUDY_CHAR, EXP_PER_STUDY_CHAR, EXP_TO_LEVEL_UP } from '@/lib/constants';
import { ensureStudyLogsLimit } from '@/lib/study-logs';
import { calculateLevel, canStudy, getStudyCooldownRemaining } from '@/lib/pet-utils';

export default function StudyPageClient() {
  const supabase = createClient();
  const { pet, setPet, user, addStudyLog, setPetMessage } = useStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStudy = useCallback(async () => {
    if (!pet || !user || !content.trim()) return;
    if (!canStudy(pet)) {
      const remaining = getStudyCooldownRemaining(pet);
      const min = Math.ceil(remaining / 60000);
      setPetMessage(`1시간 쿨다운! ${min}분 후 가르칠 수 있어요.`);
      return;
    }
    setIsSubmitting(true);

    try {
      await ensureStudyLogsLimit(supabase, user.id);
      const { data: log } = await supabase.from('study_logs').insert({ user_id: user.id, content: content.trim() }).select().single();
      if (log) addStudyLog(log);

      const len = content.trim().length;
      const intelligenceGain = Math.max(1, Math.floor(len / INTELLIGENCE_PER_STUDY_CHAR));
      const pointsGain = Math.max(1, Math.floor(len / POINTS_PER_STUDY_CHAR));
      const expGain = Math.max(1, Math.floor(len / EXP_PER_STUDY_CHAR));
      const newIntelligence = Math.min(MAX_INTELLIGENCE, (pet.intelligence ?? 0) + intelligenceGain);
      const newPoints = (pet.points || 0) + pointsGain;
      const newExp = pet.experience + expGain;
      const newLevel = calculateLevel(newExp);
      const lastStudiedAt = new Date().toISOString();
      const lastActivityAt = lastStudiedAt;
      await supabase.from('pets').update({ points: newPoints, intelligence: newIntelligence, experience: newExp, level: newLevel, last_studied_at: lastStudiedAt, last_activity_at: lastActivityAt }).eq('id', pet.id);
      setPet({ ...pet, points: newPoints, intelligence: newIntelligence, experience: newExp, level: newLevel, last_studied_at: lastStudiedAt, last_activity_at: lastActivityAt });

      setPetMessage(`새로운 걸 배웠어! +${pointsGain}P, 지능 +${intelligenceGain}, 경험치 +${expGain}`);
      setContent('');
    } catch (e) {
      console.error(e);
      setPetMessage('기록 실패... 😥');
    } finally { setIsSubmitting(false); }
  }, [pet, user, content, supabase, addStudyLog, setPet, setPetMessage]);

  const remaining = MAX_STUDY_LENGTH - content.length;

  const fontStyle = { fontFamily: "'Press Start 2P'" };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        data-testid="study-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="펫에게 가르쳐줄 내용&#10;예: 임진왜란은 1592년에..."
        maxLength={MAX_STUDY_LENGTH}
        disabled={isSubmitting}
        className="w-full h-[126px] p-2 rounded-lg resize-none text-[14px] leading-relaxed"
        style={{
          ...fontStyle,
          border: '3px solid #e0c8a0',
          background: '#fff',
          color: '#805030',
          outline: 'none',
          letterSpacing: '-0.05em',
          wordSpacing: '-0.1em',
        }}
      />
      <div className="flex justify-between items-center gap-2">
        {pet && !canStudy(pet) ? (
          <span className="text-[8px]" style={{ fontFamily: "'Press Start 2P'", color: '#e04040' }}>
            {Math.ceil(getStudyCooldownRemaining(pet) / 60000)}분 후 가르치기 가능
          </span>
        ) : (
          <span className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: remaining < 50 ? '#ff4040' : '#a08060' }}>
            {remaining}자
          </span>
        )}
        <button
          data-testid="study-submit"
          onClick={handleStudy}
          disabled={!content.trim() || isSubmitting || !pet || !canStudy(pet)}
          className="pixel-btn px-3 py-1.5 text-[12px] disabled:opacity-40"
          style={{ fontFamily: "'Press Start 2P'", background: '#c0ffc0', color: '#308030', borderColor: '#60a060' }}
        >
          {isSubmitting ? '...' : '가르치기!'}
        </button>
      </div>
    </div>
  );
}
