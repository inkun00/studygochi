'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useStore } from '@/store/useStore';
import { MAX_HUNGER } from '@/lib/constants';
import EggDevice from '@/components/ui/EggDevice';
import PixelPet from '@/components/pet/PixelPet';
import WalkingPet from '@/components/pet/WalkingPet';
import PixelRoom from '@/components/pet/PixelRoom';
import { calculateCurrentHunger, isPetDead, getExpProgress, getPetStage, getPetStatusEmoji, calculateCurrentNutrition, calculateCurrentIntelligence, calculateCurrentBoredom } from '@/lib/pet-utils';
import { EXP_TO_LEVEL_UP, MAX_HUNGER as MAX_H, MAX_BOREDOM as MAX_B, DEATH_PENALTY_MS, INTELLIGENCE_PER_STUDY_CHAR } from '@/lib/constants';
import FeedScreen from '@/components/screens/FeedScreen';
import { CHARACTER_SPRITES, pickRandomCharacter, pickRandomRoom, getCharacterSprite, getRoomType, getPetMBTI } from '@/lib/pet-constants';
import { pickRandomMBTI, getPetTouchMessage } from '@/lib/pet-messages';
import type { CharacterSprite, RoomType } from '@/lib/types';
import GroceryScreen from '@/components/screens/GroceryScreen';
import ChatScreen from '@/components/screens/ChatScreen';
import PlayScreen from '@/components/screens/PlayScreen';
import { calculateNutritionScore, getNutritionStatus, NUTRIENT_COLORS, NUTRIENT_ICONS, NUTRIENT_LABELS, type NutrientKey } from '@/lib/food-constants';
import { UI_SPRITES } from '@/lib/ui-sprites';

type Screen = 'home' | 'menu' | 'study' | 'exam' | 'classroom' | 'shop' | 'feed' | 'grocery' | 'logs' | 'play' | 'chat';

const MENU_ITEMS: { id: Screen; label: string; icon: string; color: string }[] = [
  { id: 'study', label: '공부', icon: '📖', color: '#ff8080' },
  { id: 'feed', label: '밥주기', icon: '🍖', color: '#ffb060' },
  { id: 'grocery', label: '장보기', icon: '🛒', color: '#80e8a0' },
  { id: 'play', label: '놀기', icon: '🎮', color: '#c0a0ff' },
  { id: 'exam', label: '시험', icon: '📝', color: '#ffe080' },
  { id: 'classroom', label: '교실', icon: '🏫', color: '#a0d8ff' },
  { id: 'shop', label: '상점', icon: '💎', color: '#d0a0ff' },
  { id: 'logs', label: '노트', icon: '📋', color: '#ffa0c0' },
  { id: 'chat', label: '대화', icon: '💬', color: '#b0e0e6' },
];

export default function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const { user, setUser, pet, setPet, studyLogs, setStudyLogs, addStudyLog, petMessage, setPetMessage, sessionStartAt, setSessionStartAt } = useStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [needsPet, setNeedsPet] = useState(false);
  const [creatingPet, setCreatingPet] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('home');
  const [petName, setPetName] = useState('');
  const [statusEmoji, setStatusEmoji] = useState<string | null>(null);
  const [showStatusOverlay, setShowStatusOverlay] = useState(false);
  const [previewCharacter, setPreviewCharacter] = useState<CharacterSprite | null>(null);
  const [previewRoom, setPreviewRoom] = useState<RoomType | null>(null);
  const [faceFrontTrigger, setFaceFrontTrigger] = useState(0);
  const [selectedLogIds, setSelectedLogIds] = useState<Set<number>>(new Set());
  const [deletingLogs, setDeletingLogs] = useState(false);
  const statusPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const petRef = useRef(pet);
  petRef.current = pet;

  // 펫 머리 위 Popup 스프라이트: 무작위로 상태 이모지 표시, 3초 후 사라짐
  useEffect(() => {
    if (screen !== 'home' || !pet || isPetDead(pet, sessionStartAt)) return;
    const schedule = () => {
      const delayMs = 8000 + Math.random() * 16000; // 8~24초 무작위
      statusPopupTimerRef.current = setTimeout(() => {
        const currentPet = petRef.current;
        if (currentPet && !isPetDead(currentPet, sessionStartAt)) {
          setStatusEmoji(getPetStatusEmoji(currentPet, sessionStartAt));
        }
        statusPopupTimerRef.current = setTimeout(() => {
          setStatusEmoji(null);
          schedule();
        }, 3000);
      }, delayMs);
    };
    schedule();
    return () => {
      if (statusPopupTimerRef.current) clearTimeout(statusPopupTimerRef.current);
    };
  }, [screen, pet?.id, sessionStartAt]);

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push('/auth/login'); return; }
      setAuthUserId(authUser.id);

      let { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (!profile) {
        const { data: newProfile, error } = await supabase.from('profiles').upsert({
          id: authUser.id, email: authUser.email,
          display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0],
          role: authUser.user_metadata?.role || 'student', gems: 100,
          items: { revive_potion: 0, cheat_sheet: 0 },
        }, { onConflict: 'id' }).select().single();
        if (error) console.error('Profile upsert error:', error);
        profile = newProfile;
      }
      if (profile) setUser(profile);

      const fetchPet = async () => {
        const { data: petData } = await supabase
          .from('pets')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        return petData;
      };

      let petData = await fetchPet();
      if (!petData) {
        await new Promise((r) => setTimeout(r, 400));
        petData = await fetchPet();
      }
      if (petData) {
        // 펫이 죽었는데 died_at이 없으면 DB에 기록 (계산적 사망: 배고픔/심심/영양/지능)
        const sessionStart = Date.now();
        const computedDead = petData.is_dead || isPetDead(petData, sessionStart);
        if (computedDead && !petData.died_at) {
          const { data: updated } = await supabase
            .from('pets')
            .update({ is_dead: true, died_at: new Date().toISOString() })
            .eq('id', petData.id)
            .select()
            .single();
          if (updated) petData = updated;
        }
        setPet(petData);
        // 펫이 죽었고 2일 패널티가 지났으면 새 펫 받기 화면으로
        const diedAt = petData.died_at ? new Date(petData.died_at).getTime() : 0;
        if (diedAt && Date.now() - diedAt >= DEATH_PENALTY_MS) {
          setNeedsPet(true);
          setPreviewCharacter(pickRandomCharacter());
          setPreviewRoom(pickRandomRoom());
        }
      } else {
        setNeedsPet(true);
        setPreviewCharacter(pickRandomCharacter());
        setPreviewRoom(pickRandomRoom());
      }

      const { data: logs } = await supabase.from('study_logs').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(20);
      if (logs) setStudyLogs(logs);
      setSessionStartAt(Date.now());
      setIsInitialized(true);
    };
    init();
  }, [supabase, router, setUser, setPet, setStudyLogs, setSessionStartAt]);

  const handleCreatePet = useCallback(async () => {
    const userId = user?.id || authUserId;
    if (!userId || !petName.trim()) return;
    setCreatingPet(true);

    // 사망 후 새 펫 받기: 기존 죽은 펫 삭제
    if (pet) {
      await supabase.from('pets').delete().eq('id', pet.id);
      setPet(null);
    }

    const characterSprite = previewCharacter ?? pickRandomCharacter();
    const roomType = previewRoom ?? pickRandomRoom();
    const defaults = {
      nutrition: { carbs: 50, protein: 50, fat: 50, vitamin: 50, mineral: 50 },
      food_inventory: { rice: 3, apple: 2, milk: 2 },
      points: 30,
    };

    // 새 펫은 포인트, 지능, 경험치 등 모든 것을 초기 상태로 생성
    const petMbti = pickRandomMBTI();
    const fullPayload = {
      user_id: userId,
      name: petName.trim(),
      level: 1,
      experience: 0,
      intelligence: 10,
      hunger: MAX_HUNGER,
      is_dead: false,
      last_fed_at: new Date().toISOString(),
      last_studied_at: new Date().toISOString(),
      last_played_at: new Date().toISOString(),
      character_sprite: characterSprite,
      room_type: roomType,
      mbti: petMbti,
      ...defaults,
    };

    function getErrInfo(e: unknown): { code: string; message: string } {
      if (!e) return { code: '', message: 'Unknown error' };
      const err = e as Record<string, unknown>;
      const code = err?.code ?? (err as any)?.code ?? '';
      const message = err?.message ?? (err as any)?.message ?? '';
      return { code: String(code), message: String(message) };
    }

    let { data, error } = await supabase.from('pets').insert(fullPayload).select().single();

    if (error) {
      const { code } = getErrInfo(error);
      const isColumnError = code === '42703' || code === 'PGRST204' || /does not exist|column|schema cache/i.test(String(getErrInfo(error).message));

      // 컬럼 없음 시 단계별 폴백: 최소 스키마만 사용
      if (isColumnError) {
        // 폴백 1: character_sprite, room_type 등 제거
        const fallback1 = { ...fullPayload };
        delete (fallback1 as Record<string, unknown>).character_sprite;
        delete (fallback1 as Record<string, unknown>).room_type;
        delete (fallback1 as Record<string, unknown>).mbti;
        delete (fallback1 as Record<string, unknown>).nutrition;
        delete (fallback1 as Record<string, unknown>).food_inventory;
        delete (fallback1 as Record<string, unknown>).points;
        delete (fallback1 as Record<string, unknown>).last_studied_at;
        delete (fallback1 as Record<string, unknown>).last_played_at;

        // 폴백 2: 최소 스키마만 (가장 오래된 테이블 호환)
        const fallback2 = {
          user_id: userId,
          name: petName.trim(),
          level: 1,
          experience: 0,
          intelligence: 10,
          hunger: MAX_HUNGER,
          is_dead: false,
          last_fed_at: new Date().toISOString(),
        };

        for (const payload of [fallback1, fallback2]) {
          const res = await supabase.from('pets').insert(payload).select().single();
          if (!res.error) {
            data = res.data;
            error = null;
            break;
          }
          console.warn('Pet insert fallback failed:', res.error?.message);
        }

        if (error) {
          console.error('Pet creation: all fallbacks failed');
          alert(
            '펫 테이블 스키마가 최신이 아닙니다.\n\n' +
            'Supabase Dashboard > SQL Editor에서 다음 파일들을 순서대로 실행해주세요:\n' +
            '1. supabase/migrations/001_add_pet_character_columns.sql\n' +
            '2. supabase/migrations/003_add_last_studied_at.sql\n' +
            '3. supabase/migrations/007_add_last_played_at.sql\n' +
            '4. supabase/migrations/008_add_died_at.sql'
          );
          setCreatingPet(false);
          return;
        }
      }
    }

    if (error) {
      if (!data) {
        const { message: msg } = getErrInfo(error);
        console.error('Pet creation error:', error);
        alert(`펫 생성 실패: ${msg || '알 수 없는 오류'}`);
      }
    } else if (data) {
      setPet(data);
      setNeedsPet(false);
      setScreen('home');
      // 새 펫 = 새 시작: 학습 로그·지식도 초기화
      await supabase.from('study_logs').delete().eq('user_id', userId);
      setStudyLogs([]);
    }
    setCreatingPet(false);
  }, [user, authUserId, pet, petName, previewCharacter, previewRoom, supabase, setPet, setStudyLogs]);

  const handleDeleteLogs = useCallback(async () => {
    if (!pet || selectedLogIds.size === 0) return;
    setDeletingLogs(true);
    const toDelete = studyLogs.filter((l) => selectedLogIds.has(l.id));
    let totalIntelligenceLoss = 0;
    for (const log of toDelete) {
      totalIntelligenceLoss += Math.max(1, Math.floor((log.content || '').length / INTELLIGENCE_PER_STUDY_CHAR));
    }
    const newIntelligence = Math.max(0, (pet.intelligence ?? 0) - totalIntelligenceLoss);
    const ids = Array.from(selectedLogIds);
    const { error } = await supabase.from('study_logs').delete().in('id', ids);
    if (error) {
      console.error('Log delete error:', error);
      alert(`노트 삭제 실패: ${error.message}`);
    } else {
      setStudyLogs(studyLogs.filter((l) => !selectedLogIds.has(l.id)));
      await supabase.from('pets').update({ intelligence: newIntelligence }).eq('id', pet.id);
      setPet({ ...pet, intelligence: newIntelligence });
      setSelectedLogIds(new Set());
      setPetMessage(`노트 ${ids.length}개 삭제됨. 지능 -${totalIntelligenceLoss}`);
    }
    setDeletingLogs(false);
  }, [pet, selectedLogIds, studyLogs, supabase, setPet, setStudyLogs, setPetMessage]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  // Loading screen
  if (!isInitialized) {
    return (
      <EggDevice title="STUDYGOTCHI">
        <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: '#fff8f0' }}>
          <PixelPet isDead={false} size={64} characterSprite="rabbit" />
          <p className="mt-4 text-[16px]" style={{ fontFamily: "'Press Start 2P'" }}>로딩중...</p>
        </div>
      </EggDevice>
    );
  }

  // Pet creation screen (1. 첫 로그인 2. 사망 후 2일 패널티 경과)
  if (needsPet) {
    const isAfterDeath = !!pet;
    return (
      <EggDevice
        title="STUDYGOTCHI"
        onButton2={handleCreatePet}
      >
        <div className="w-full h-full flex flex-col items-center p-3 gap-1 overflow-y-auto" style={{ background: '#fff8f0' }}>
          <p className="text-[14px] text-center" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>
            {isAfterDeath ? '2일이 지났어요!' : `${(user?.display_name || '사용자').trim() || '사용자'}님의 새 펫!`}
          </p>
          <p className="text-[8px] text-center" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>
            {isAfterDeath ? '새 펫을 받을 수 있어요' : '캐릭터를 골라주세요'}
          </p>
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => {
                const idx = CHARACTER_SPRITES.indexOf(previewCharacter ?? 'rabbit');
                setPreviewCharacter(CHARACTER_SPRITES[(idx - 1 + CHARACTER_SPRITES.length) % CHARACTER_SPRITES.length]);
              }}
              className="w-8 h-8 rounded pixel-btn flex items-center justify-center text-[14px]"
              style={{ fontFamily: "'Press Start 2P'" }}
            >
              ‹
            </button>
            <div className="flex items-center justify-center w-24 h-24 rounded-lg ui-panel">
              <PixelPet isDead={false} size={56} characterSprite={previewCharacter ?? 'rabbit'} />
            </div>
            <button
              type="button"
              onClick={() => {
                const idx = CHARACTER_SPRITES.indexOf(previewCharacter ?? 'rabbit');
                setPreviewCharacter(CHARACTER_SPRITES[(idx + 1) % CHARACTER_SPRITES.length]);
              }}
              className="w-8 h-8 rounded pixel-btn flex items-center justify-center text-[14px]"
              style={{ fontFamily: "'Press Start 2P'" }}
            >
              ›
            </button>
          </div>
          <p className="text-[10px] text-center" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>
            {(user?.display_name || '사용자').trim() || '사용자'}님, 펫 이름을 지어주세요
          </p>
          <input
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            placeholder="이름"
            maxLength={10}
            className="w-32 px-2 py-1.5 text-center text-[16px] rounded ui-panel"
            style={{
              fontFamily: "'Press Start 2P'",
              color: 'var(--text-dark)',
              outline: 'none',
            }}
          />
          <button
            onClick={handleCreatePet}
            disabled={!petName.trim() || creatingPet}
            className="px-4 py-2 text-[14px] disabled:opacity-40 border-none cursor-pointer transition-transform active:scale-95"
            style={{
              backgroundImage: 'url(/sprites/ui/btn_plain_red.png)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              fontFamily: "'Press Start 2P'",
              color: '#fff',
            }}
          >
            {creatingPet ? '...' : '탄생!'}
          </button>
        </div>
      </EggDevice>
    );
  }

  // 펫이 죽었고 2일 패널티 중인 화면
  if (pet && user) {
    const dead = isPetDead(pet, sessionStartAt);
    const diedAt = pet.died_at ? new Date(pet.died_at).getTime() : 0;
    const penaltyPassed = diedAt && Date.now() - diedAt >= DEATH_PENALTY_MS;
    if (dead && diedAt && !penaltyPassed) {
      const remaining = Math.max(0, DEATH_PENALTY_MS - (Date.now() - diedAt));
      const hoursLeft = Math.floor(remaining / (60 * 60 * 1000));
      const daysLeft = Math.floor(hoursLeft / 24);
      const hrsLeft = hoursLeft % 24;
      return (
        <EggDevice title="STUDYGOTCHI">
          <div className="w-full h-full flex flex-col items-center justify-center p-4" style={{ background: '#fff8f0' }}>
            <p className="text-[14px] text-center leading-relaxed mb-2" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>
              펫이 죽었어요
            </p>
            <p className="text-[10px] text-center leading-relaxed mb-4" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>
              2일 후 새 펫을
              <br />
              받을 수 있어요
            </p>
            <p className="text-[8px] text-center" style={{ fontFamily: "'Press Start 2P'", color: '#c0a080' }}>
              {daysLeft}일 {hrsLeft}시간 후
            </p>
          </div>
        </EggDevice>
      );
    }
  }

  if (!pet || !user) return null;

  const dead = isPetDead(pet, sessionStartAt);
  const hunger = calculateCurrentHunger(pet, sessionStartAt);
  const stage = getPetStage(pet.level);
  const expProgress = getExpProgress(pet.experience);

  // Button handlers: 왼쪽=메뉴, 가운데=메인복귀, 오른쪽=뒤로가기
  const handleBtn1 = () => {
    if (screen === 'home') setScreen('menu');
    else if (screen === 'menu') setScreen('home');
    else setScreen('menu');
  };
  const handleBtn2 = () => {
    setScreen('home');
  };
  const handleBtn3 = () => {
    if (screen === 'menu') setScreen('home');
  };

  // Render screens
  const renderScreen = () => {
    switch (screen) {
      case 'home': {
        const charSprite = getCharacterSprite(pet);
        const roomType = getRoomType(pet);
        const handlePetTouch = () => {
          const msg = getPetTouchMessage(pet, sessionStartAt, getPetMBTI(pet));
          setPetMessage(msg);
          setTimeout(() => setPetMessage(''), 4000);
          setFaceFrontTrigger((t) => t + 1);
        };
        return (
          <div className="relative w-full h-full overflow-hidden">
            <div
              className="absolute inset-0 z-[5] cursor-pointer"
              onClick={handlePetTouch}
              onTouchEnd={(e) => {
                e.preventDefault();
                handlePetTouch();
              }}
              aria-label="펫 터치"
            >
              <PixelRoom type={roomType} />
              {!dead ? (
                <WalkingPet
                  isDead={dead}
                  characterSprite={charSprite}
                  size={56}
                  faceFrontTrigger={faceFrontTrigger}
                  floatingEmoji={statusEmoji ? (
                    <div
                      className="w-8 h-6 flex items-center justify-center bg-contain bg-center bg-no-repeat animate-bounce"
                      style={{ backgroundImage: `url(${UI_SPRITES.popups.popup1})` }}
                    >
                      <span className="text-[10px] leading-none -mt-0.5 block" style={{ fontFamily: "'Press Start 2P'", transform: 'translateY(-3px)' }}>{statusEmoji}</span>
                    </div>
                  ) : undefined}
                />
              ) : (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                  {statusEmoji && (
                    <div className="mb-1 rounded-lg px-2 py-2 min-h-[48px] ui-popup animate-bounce flex items-center justify-center" style={{ fontFamily: "'Press Start 2P'" }}>
                      <span className="text-[17px] leading-none" style={{ transform: 'translateY(-5px)' }}>{statusEmoji}</span>
                    </div>
                  )}
                  <PixelPet isDead={dead} size={80} characterSprite={charSprite} />
                </div>
              )}
            </div>
            {/* Status bar overlay - 펫 이름 클릭 시 상태 표시 */}
            <div className="absolute top-0 left-0 right-0 z-20 p-1.5 flex justify-between items-start ui-panel">
              <button
                type="button"
                onClick={() => setShowStatusOverlay(true)}
                className="text-[12px] cursor-pointer bg-transparent border-none text-left"
                style={{ fontFamily: "'Press Start 2P'", color: 'var(--ui-outline)' }}
              >
                {pet.name}
              </button>
              <div className="text-[12px]" style={{ fontFamily: "'Press Start 2P'", color: 'var(--text-orange)' }}>
                Lv.{pet.level}
              </div>
            </div>
            {/* Pet message - 채팅창 / 영양 위기 */}
            {(() => {
              const nut = calculateCurrentNutrition(pet, sessionStartAt);
              const crisisNutrients = (Object.keys(nut) as NutrientKey[]).filter(k => nut[k] <= 10);
              if (crisisNutrients.length > 0) {
                return (
                  <div className="absolute bottom-1 left-1 right-1 z-20">
                    <div className="p-1.5 rounded text-[10px] text-center ui-pet-chat" style={{ fontFamily: "'Press Start 2P'", color: '#ff4040', border: '2px solid #ff4040' }}>
                      🚨⚠️ 영양 위기! {crisisNutrients.map(k => `${NUTRIENT_ICONS[k]}${NUTRIENT_LABELS[k]}`).join(' ')} 부족
                    </div>
                  </div>
                );
              }
              if (petMessage) {
                return (
                  <div className="absolute bottom-1 left-1 right-1 z-20">
                    <div className="p-1.5 rounded text-[10px] text-center ui-pet-chat" style={{ fontFamily: "'Press Start 2P'", color: 'var(--text-dark)' }}>
                      {petMessage}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* 상태 오버레이 - 펫 이름 클릭 시 */}
            {showStatusOverlay && (
              <div
                className="absolute inset-0 z-40 flex flex-col overflow-y-auto animate-slide-in gap-0.5"
                style={{ background: 'rgba(255,248,240,0.98)', padding: '2px 10px 6px' }}
              >
                <div className="flex items-center">
                  <button onClick={() => setShowStatusOverlay(false)} className="text-[10px] pixel-btn px-1.5 py-0.5" style={{ fontFamily: "'Press Start 2P'", color: '#000' }}>X</button>
                </div>
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg ui-panel">
                  <PixelPet isDead={dead} size={40} characterSprite={getCharacterSprite(pet)} />
                  <div>
                    <p className="text-[14px]" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>{pet.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>{stage.name} Lv.{pet.level}</p>
                  </div>
                </div>
                {(() => {
                  const intel = calculateCurrentIntelligence(pet, sessionStartAt);
                  const boredom = calculateCurrentBoredom(pet, sessionStartAt);
                  return [
                    { label: '경험치', value: expProgress, max: EXP_TO_LEVEL_UP, color: '#a060e0' },
                    { label: '배고픔', value: hunger, max: MAX_H, color: hunger > 30 ? '#40c040' : '#ff4040' },
                    { label: '심심 지수', value: boredom, max: MAX_B, color: boredom < 100 ? '#60c0a0' : boredom < 150 ? '#e0a040' : '#ff4040' },
                    { label: '지능', value: intel, max: Math.max(100, intel + 50), color: '#4080ff' },
                  ];
                })().map((bar) => (
                  <div key={bar.label} className="px-2">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>{bar.label}</span>
                      <span className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>{bar.value}/{bar.max}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-sm overflow-hidden" style={{ background: '#2a2035', border: '1px solid var(--ui-outline-dark)' }}>
                      <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${Math.min(100, (bar.value / bar.max) * 100)}%`, minWidth: (bar.value / bar.max) * 100 > 0 ? '4px' : 0, background: bar.color }} />
                    </div>
                  </div>
                ))}
                {(() => {
                  const nut = calculateCurrentNutrition(pet, sessionStartAt);
                  const nutStatus = getNutritionStatus(nut);
                  const nutScore = calculateNutritionScore(nut);
                  return (
                    <div className="px-2">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>영양지수</span>
                        <span className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: nutStatus.status === 'good' ? '#40a040' : nutStatus.status === 'warning' ? '#d0a000' : '#e04040' }}>{nutScore}점</span>
                      </div>
                      <div className="flex gap-0.5">
                        {(Object.keys(nut) as NutrientKey[]).map(k => (
                          <div key={k} className="flex-1">
                            <div className="text-center text-[6px] mb-0.5" style={{ fontFamily: "'Press Start 2P'", color: 'var(--ui-outline)' }}>{NUTRIENT_ICONS[k]}</div>
                            <div className="h-1.5 rounded-sm" style={{ background: '#2a2035', border: '1px solid var(--ui-outline-dark)' }}>
                              <div className="h-full rounded-sm" style={{ width: `${nut[k]}%`, background: nut[k] < 20 ? '#ff4040' : NUTRIENT_COLORS[k] }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <div className="flex justify-between px-2">
                  <span className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>포인트</span>
                  <span className="text-[12px]" style={{ fontFamily: "'Press Start 2P'", color: '#d06000' }}>⭐ {pet.points || 0}P</span>
                </div>
                <div className="flex justify-between px-2">
                  <span className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>보석</span>
                  <span className="text-[12px]" style={{ fontFamily: "'Press Start 2P'", color: '#d06000' }}>💎 {user.gems}</span>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'menu':
        const BTN_PLAIN = '/sprites/ui/btn_plain_green.png';
        const MENU_ROW_HEIGHT = 64; // 버튼 높이 고정 (gap 늘어나도 유지)
        return (
          <div className="w-full h-full overflow-hidden pt-[13px] px-3 grid grid-cols-3 gap-x-2 gap-y-1.5" style={{ background: '#fff8f0', paddingBottom: 0, marginBottom: '-36px', gridTemplateRows: `repeat(4, ${MENU_ROW_HEIGHT}px)` }}>
            {MENU_ITEMS.map((item, i) => (
              <div key={item.id} className="flex items-center justify-center" style={{ transform: 'scale(0.9)' }}>
                <button
                  data-testid={`menu-${item.id}`}
                  onClick={() => setScreen(item.id)}
                  className="flex flex-col items-center justify-center w-full h-full min-h-0 transition-transform active:scale-95 animate-menu-pop border-none rounded-[8px] overflow-hidden"
                  style={{
                    backgroundImage: `url(${BTN_PLAIN})`,
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    imageRendering: 'auto',
                    animationDelay: `${i * 0.03}s`,
                    aspectRatio: '1',
                  }}
                >
                  <span className="text-lg leading-none drop-shadow-sm">{item.icon}</span>
                  <span className="text-[7px] mt-1 font-bold leading-tight text-center px-1" style={{ fontFamily: "'Press Start 2P'", color: '#2a2035', textShadow: '1px 1px 0 rgba(255,255,255,0.5)' }}>
                    {item.label}
                  </span>
                </button>
              </div>
            ))}
          </div>
        );

      case 'play':
        return (
          <PlayScreen
            pet={pet}
            onBack={() => setScreen('menu')}
          />
        );

      case 'feed':
        return (
          <FeedScreen
            pet={pet}
            setPet={setPet}
            user={user}
            setUser={setUser}
            supabase={supabase}
            setPetMessage={setPetMessage}
            onBack={() => setScreen('menu')}
            sessionStartAt={sessionStartAt}
          />
        );

      case 'grocery':
        return (
          <GroceryScreen
            pet={pet}
            setPet={setPet}
            supabase={supabase}
            setPetMessage={setPetMessage}
            onBack={() => setScreen('menu')}
          />
        );

      case 'logs':
        return (
          <div className="w-full h-full flex flex-col animate-slide-in" style={{ background: '#fff8f0' }}>
            <div className="flex items-center gap-1 p-2">
              <button onClick={() => setScreen('menu')} className="text-[14px]" style={{ fontFamily: "'Press Start 2P'", color: '#d06000' }}>←</button>
              <div className="flex-1 text-center py-1 rounded ui-panel" style={{ fontFamily: "'Press Start 2P'" }}>
                <span className="text-[14px]" style={{ color: 'var(--ui-outline)' }}>노트</span>
              </div>
            </div>
            {selectedLogIds.size > 0 && (
              <div className="flex items-center gap-2 px-2 pb-1">
                <button
                  onClick={() => setSelectedLogIds(new Set())}
                  className="pixel-btn px-2 py-1 text-[9px]"
                  style={{ fontFamily: "'Press Start 2P'", background: '#e0e0e0', color: '#606060', borderColor: '#909090' }}
                >
                  선택 해제
                </button>
                <button
                  onClick={handleDeleteLogs}
                  disabled={deletingLogs}
                  className="pixel-btn px-2 py-1 text-[9px]"
                  style={{ fontFamily: "'Press Start 2P'", background: '#ffc0c0', color: '#a03030', borderColor: '#d06060' }}
                >
                  {deletingLogs ? '...' : `삭제 (${selectedLogIds.size}개)`}
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {studyLogs.length === 0 ? (
                <p className="text-[10px] text-center py-6" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>
                  아직 학습 기록이 없어요.<br />공부 화면에서 가르쳐주세요!
                </p>
              ) : (
                studyLogs.map((log) => {
                  const isSelected = selectedLogIds.has(log.id);
                  return (
                    <div
                      key={log.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedLogIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(log.id)) next.delete(log.id);
                        else next.add(log.id);
                        return next;
                      })}
                      onKeyDown={(e) => e.key === 'Enter' && (document.activeElement as HTMLElement)?.click?.()}
                      className="p-2 rounded-lg cursor-pointer select-none"
                      style={{
                        background: isSelected ? '#e8d0c0' : '#fff0e0',
                        border: `2px solid ${isSelected ? '#c08060' : '#e0d0b8'}`,
                        fontFamily: "'Press Start 2P'",
                      }}
                    >
                      <p className="text-[10px] leading-relaxed" style={{ color: '#805030' }}>{log.content}</p>
                      <p className="text-[7px] mt-1" style={{ color: '#a08060' }}>
                        {new Date(log.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'chat':
        return (
          <ChatScreen
            pet={pet}
            studyLogs={studyLogs}
            userName={user?.display_name}
            user={user}
            supabase={supabase}
            addStudyLog={addStudyLog}
            setPet={setPet}
            onBack={() => setScreen('menu')}
          />
        );

      default: {
        const screenLabels: Record<string, string> = {
          study: '공부', exam: '시험', classroom: '교실', shop: '상점', logs: '노트', grocery: '장보기', play: '놀기', chat: '대화',
        };
        return (
          <div className="w-full h-full flex flex-col animate-slide-in" style={{ background: '#fff8f0' }}>
            <div className="flex items-center gap-1 p-2">
              <button onClick={() => setScreen('menu')} className="text-[14px]" style={{ fontFamily: "'Press Start 2P'", color: '#d06000' }}>←</button>
              <div className="flex-1 text-center py-1 rounded" style={{ background: '#4080ff', fontFamily: "'Press Start 2P'" }}>
                <span className="text-[14px] text-white">{screenLabels[screen] || screen}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {children}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <EggDevice
      title="STUDYGOTCHI"
      onButton1={handleBtn1}
      onButton2={handleBtn2}
      onButton3={handleBtn3}
    >
      {renderScreen()}
    </EggDevice>
  );
}

