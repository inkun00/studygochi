import { Pet } from './types';
import { HUNGER_DECAY_RATE, INTELLIGENCE_DECAY_RATE, BOREDOM_INCREASE_RATE, MAX_HUNGER, MAX_BOREDOM, EXP_TO_LEVEL_UP, PET_STAGES, STUDY_CHAT_COOLDOWN_MS } from './constants';
import { getNutritionStatus, NUTRIENT_DECAY_PER_HOUR, type NutrientKey } from './food-constants';

/**
 * 세션 기준 배고픔 계산 (Last_Login 기반)
 * sessionStartAt이 있으면: 오프라인 동안 차감 없음, 앱이 열려있는 동안만 차감
 * sessionStartAt이 없으면: last_fed_at 기반 (기존 방식)
 */
export function calculateCurrentHunger(pet: Pet, sessionStartAt?: number | null): number {
  const now = Date.now();
  const baseline = sessionStartAt ?? new Date(pet.last_fed_at).getTime();
  const hoursElapsed = (now - baseline) / (1000 * 60 * 60);
  const decayed = Math.floor(hoursElapsed * HUNGER_DECAY_RATE);
  return Math.max(0, pet.hunger - decayed);
}

const DEFAULT_NUTRITION = { carbs: 50, protein: 50, fat: 50, vitamin: 50, mineral: 50 };

/**
 * 세션 기준 영양소 계산 (시간 경과에 따라 감소)
 * sessionStartAt이 있으면: 앱이 열려있는 동안만 차감
 * sessionStartAt이 없으면: last_fed_at 기반
 */
export function calculateCurrentNutrition(pet: Pet, sessionStartAt?: number | null): Record<NutrientKey, number> {
  const nut = pet.nutrition || { ...DEFAULT_NUTRITION };
  const now = Date.now();
  const baseline = sessionStartAt ?? new Date(pet.last_fed_at).getTime();
  const hoursElapsed = (now - baseline) / (1000 * 60 * 60);
  const decayed = Math.floor(hoursElapsed * NUTRIENT_DECAY_PER_HOUR);
  const result = { ...nut };
  (Object.keys(result) as NutrientKey[]).forEach((k) => {
    result[k] = Math.max(0, (result[k] ?? 50) - decayed);
  });
  return result;
}

/**
 * 세션 기준 지능 계산 (학습 안 하면 시간당 감소)
 * sessionStartAt이 있으면: 앱이 열려있는 동안만 차감
 * sessionStartAt이 없으면: last_studied_at 기반
 */
export function calculateCurrentIntelligence(pet: Pet, sessionStartAt?: number | null): number {
  const now = Date.now();
  const lastStudied = pet.last_studied_at ? new Date(pet.last_studied_at).getTime() : new Date(pet.created_at).getTime();
  const baseline = sessionStartAt ?? lastStudied;
  const hoursElapsed = (now - baseline) / (1000 * 60 * 60);
  const decayed = Math.floor(hoursElapsed * INTELLIGENCE_DECAY_RATE);
  return Math.max(0, pet.intelligence - decayed);
}

/**
 * 세션 기준 심심 지수 계산 (배고픔과 동일 알고리즘, 시간당 증가)
 * sessionStartAt이 있으면: 앱이 열려있는 동안만 증가
 * sessionStartAt이 없으면: last_played_at 기반
 */
export function calculateCurrentBoredom(pet: Pet, sessionStartAt?: number | null): number {
  const now = Date.now();
  const lastPlayed = pet.last_played_at ? new Date(pet.last_played_at).getTime() : new Date(pet.created_at).getTime();
  const baseline = sessionStartAt ?? lastPlayed;
  const hoursElapsed = (now - baseline) / (1000 * 60 * 60);
  const increased = Math.floor(hoursElapsed * BOREDOM_INCREASE_RATE);
  return Math.min(MAX_BOREDOM, increased);
}

export function isPetDead(pet: Pet, sessionStartAt?: number | null): boolean {
  if (pet.is_dead) return true;
  if (calculateCurrentHunger(pet, sessionStartAt) <= 0) return true;
  if (calculateCurrentBoredom(pet, sessionStartAt) >= MAX_BOREDOM) return true;
  const nutrition = calculateCurrentNutrition(pet, sessionStartAt);
  const hasZeroNutrient = (Object.keys(nutrition) as NutrientKey[]).some((k) => nutrition[k] <= 0);
  if (hasZeroNutrient) return true;
  if (calculateCurrentIntelligence(pet, sessionStartAt) <= 0) return true;
  return false;
}

/** 공부/대화 쿨다운 경과 여부 (1시간 지났으면 true, last_activity_at 없으면 가능) */
export function canStudyOrChat(pet: Pet): boolean {
  if (!pet.last_activity_at) return true;
  const last = new Date(pet.last_activity_at).getTime();
  return Date.now() - last >= STUDY_CHAT_COOLDOWN_MS;
}

/** 쿨다운 남은 시간(ms), 0이면 사용 가능 */
export function getStudyChatCooldownRemaining(pet: Pet): number {
  if (!pet.last_activity_at) return 0;
  const last = new Date(pet.last_activity_at).getTime();
  const elapsed = Date.now() - last;
  return Math.max(0, STUDY_CHAT_COOLDOWN_MS - elapsed);
}

export function getPetStage(level: number): { minLevel: number; name: string; emoji: string } {
  let stage: { minLevel: number; name: string; emoji: string } = PET_STAGES[0];
  for (const s of PET_STAGES) {
    if (level >= s.minLevel) stage = s;
  }
  return stage;
}

export function calculateLevel(experience: number): number {
  return Math.floor(experience / EXP_TO_LEVEL_UP) + 1;
}

export function getExpProgress(experience: number): number {
  return experience % EXP_TO_LEVEL_UP;
}

/** 노트 표시용: study_log, 사용자:, 펫:, 학습요약: 등 레이블 제거 */
export function formatLogContentForDisplay(content: string | undefined): string {
  if (!content) return '';
  let text = content.trim();
  // 레이블 패턴: 줄 시작 또는 앞뒤 공백 포함, 콜론 유무 관계없이 제거
  const labelsToRemove = /(^|\n)\s*(study_log|요약|학습\s*요약|학습요약|학습\s*요약\s*:?|사용자|펫)\s*:?\s*/gi;
  text = text.replace(labelsToRemove, '$1').trim();
  text = text.replace(/^\s*[-–—]\s*/gm, '').trim();
  return text;
}

/** 단어 토큰 추출 (공백·구두점 기준, 한국어/영어 유지) */
function tokenizeForComparison(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w가-힣a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2); // 1글자 단어 제외 (조사 등)
  return new Set(normalized);
}

/** 기존 노트와 단어 단위 유사도가 높으면 중복 (일치도 임계값 0.65) */
export function isDuplicateOfExistingContent(
  newContent: string,
  existingLogs: { content: string }[]
): boolean {
  if (!newContent.trim()) return true;
  const newTokens = tokenizeForComparison(newContent);
  if (newTokens.size === 0) return false;

  for (const log of existingLogs) {
    const existingTokens = tokenizeForComparison(log.content);
    let matches = 0;
    for (const t of newTokens) {
      if (existingTokens.has(t)) matches++;
    }
    const overlapRatio = matches / newTokens.size;
    if (overlapRatio >= 0.65) return true;
  }
  return false;
}

export function getHungerColor(hunger: number): string {
  if (hunger > 70) return 'text-green-500';
  if (hunger > 30) return 'text-yellow-500';
  return 'text-red-500';
}

export function getHungerBarColor(hunger: number): string {
  if (hunger > 70) return '#40c040';
  if (hunger > 30) return '#eab308';
  return '#ff4040';
}

/**
 * 펫의 현재 감정/건강 상태를 이모지로 반환
 * 배고픔 낮음 → 배고픔 표시, 심심 지수 높음 → 심심함 표시 우선
 */
export function getPetStatusEmoji(pet: Pet, sessionStartAt?: number | null): string {
  const hunger = calculateCurrentHunger(pet, sessionStartAt);
  const boredom = calculateCurrentBoredom(pet, sessionStartAt);
  const isDead = isPetDead(pet, sessionStartAt);

  if (isDead) return '👻';

  // 배고픔 지수 낮으면 배고픔 표시 (우선)
  if (hunger <= 10) return '😫';
  if (hunger <= 25) return '😢';
  if (hunger <= 40) return '😔';

  // 심심 지수 높으면 심심함 표시
  if (boredom >= 150) return '😑';
  if (boredom >= 100) return '😒';
  if (boredom >= 50) return '😐';

  const nut = calculateCurrentNutrition(pet, sessionStartAt);
  const nutStatus = getNutritionStatus(nut);

  if (nutStatus.status === 'danger') return '🤢';
  if (nutStatus.status === 'warning') return '😟';
  if (hunger >= 90) return '😄';
  if (hunger >= 70) return '😊';
  return '🙂';
}
