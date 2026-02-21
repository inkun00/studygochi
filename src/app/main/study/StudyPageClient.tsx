'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useStore } from '@/store/useStore';
import { MAX_STUDY_LENGTH, INTELLIGENCE_PER_STUDY_CHAR, POINTS_PER_STUDY_CHAR, EXP_PER_STUDY_CHAR, EXP_TO_LEVEL_UP } from '@/lib/constants';
import { calculateLevel } from '@/lib/pet-utils';

export default function StudyPageClient() {
  const supabase = createClient();
  const { pet, setPet, user, addStudyLog, setPetMessage } = useStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStudy = useCallback(async () => {
    if (!pet || !user || !content.trim()) return;
    setIsSubmitting(true);

    try {
      const { data: log } = await supabase.from('study_logs').insert({ user_id: user.id, content: content.trim() }).select().single();
      if (log) addStudyLog(log);

      const len = content.trim().length;
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
        }}
      />
      <div className="flex justify-between items-center">
        <span className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: remaining < 50 ? '#ff4040' : '#a08060' }}>
          {remaining}자
        </span>
        <button
          data-testid="study-submit"
          onClick={handleStudy}
          disabled={!content.trim() || isSubmitting}
          className="pixel-btn px-3 py-1.5 text-[12px] disabled:opacity-40"
          style={{ fontFamily: "'Press Start 2P'", background: '#c0ffc0', color: '#308030', borderColor: '#60a060' }}
        >
          {isSubmitting ? '...' : '가르치기!'}
        </button>
      </div>
    </div>
  );
}
