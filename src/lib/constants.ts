export const MAX_STUDY_LENGTH = 100;
/** 공부 시 텍스트 1자당 올라가는 지능 (예: 10이면 100자 → +10 지능) */
export const INTELLIGENCE_PER_STUDY_CHAR = 10;
/** 노트 저장 시 포인트: N자당 1P (예: 20자 → 1P, 100자 → 5P) */
export const POINTS_PER_STUDY_CHAR = 20;
export const MAX_STUDY_LOGS_FOR_EXAM = 5;
export const HUNGER_DECAY_RATE = 2; // 시간당 감소량
export const INTELLIGENCE_DECAY_RATE = 1; // 시간당 지능 감소량 (학습 안 할 시)
export const BOREDOM_INCREASE_RATE = 2; // 시간당 심심 지수 증가량 (놀기 안 할 시)
export const MAX_HUNGER = 100;
export const MAX_BOREDOM = 200; // 심심 지수 200 도달 시 사망
/** 사망 후 새 펫 받기까지 대기 시간 (ms) */
export const DEATH_PENALTY_MS = 2 * 24 * 60 * 60 * 1000;
export const EXP_PER_CORRECT = 50;
export const EXP_PER_WRONG = 10;
export const EXP_TO_LEVEL_UP = 200;
/** 활동별 경험치: N자당 1 exp (공부·대화→노트) */
export const EXP_PER_STUDY_CHAR = 2;
/** 밥주기 1회 당 경험치 */
export const EXP_PER_FEED = 10;

export const SHOP_ITEMS = {
  revive_potion: {
    name: '부활 포션',
    description: '유령 상태의 펫을 부활시킵니다.',
    price: 100,
    emoji: '💊',
  },
  cheat_sheet: {
    name: '컨닝 페이퍼',
    description: '시험 시 AI에게 추가 지식을 제공합니다.',
    price: 50,
    emoji: '📝',
  },
} as const;

export const GEM_PACKAGES = [
  { id: 'gem_100', gems: 100, price: 1000, label: '100 젬' },
  { id: 'gem_500', gems: 500, price: 4500, label: '500 젬 (10% 할인)' },
  { id: 'gem_1200', gems: 1200, price: 9900, label: '1200 젬 (20% 할인)' },
] as const;

export const PET_STAGES = [
  { minLevel: 1, name: '알', emoji: '🥚' },
  { minLevel: 3, name: '아기', emoji: '🐣' },
  { minLevel: 5, name: '어린이', emoji: '🐥' },
  { minLevel: 10, name: '청소년', emoji: '🐤' },
  { minLevel: 20, name: '성인', emoji: '🦉' },
] as const;
