export const MAX_STUDY_LENGTH = 100;
/** 공부 시 텍스트 1자당 올라가는 지능 (예: 10이면 100자 → +10 지능) */
export const INTELLIGENCE_PER_STUDY_CHAR = 10;
/** 노트 저장 시 포인트: N자당 1P (예: 20자 → 1P, 100자 → 5P) */
export const POINTS_PER_STUDY_CHAR = 20;
export const MAX_STUDY_LOGS_FOR_EXAM = 5;
/** 노트에 저장 가능한 최대 지식 개수 */
export const MAX_STUDY_LOGS = 100;
export const HUNGER_DECAY_RATE = 2; // 시간당 감소량
export const INTELLIGENCE_DECAY_RATE = 1; // 시간당 지능 감소량 (학습 안 할 시)
export const BOREDOM_INCREASE_RATE = 2; // 시간당 심심 지수 증가량 (놀기 안 할 시)
export const MAX_HUNGER = 100;
export const MAX_BOREDOM = 200;
export const MAX_INTELLIGENCE = 200;
/** 공부/대화 쿨다운: 1시간 (ms) */
export const STUDY_CHAT_COOLDOWN_MS = 60 * 60 * 1000;
/** 대화 1회 = 5번 주고받기 */
export const CHAT_EXCHANGES_PER_SESSION = 5;
/** 대화 입력 최대 글자 수 */
export const CHAT_INPUT_MAX_LENGTH = 30;

/** 사망 후 새 펫 받기까지 대기 시간 (ms) */
export const DEATH_PENALTY_MS = 2 * 24 * 60 * 60 * 1000;
export const EXP_PER_CORRECT = 50;
export const EXP_PER_WRONG = 10;
export const EXP_TO_LEVEL_UP = 200;
/** 활동별 경험치: N자당 1 exp (공부·대화→노트) */
export const EXP_PER_STUDY_CHAR = 2;
/** 밥주기 경험치: 음식 가격에 비례 (FeedScreen에서 food.price 사용) */

export const SHOP_ITEMS = {} as const;

export const POINT_PACKAGES = [
  { id: 'point_100', points: 100, price: 1000, label: '100P' },
  { id: 'point_500', points: 500, price: 4500, label: '500P (10% 할인)' },
  { id: 'point_1200', points: 1200, price: 9900, label: '1200P (20% 할인)' },
] as const;

export const PET_STAGES = [
  { minLevel: 1, name: '알', emoji: '🥚' },
  { minLevel: 3, name: '아기', emoji: '🐣' },
  { minLevel: 5, name: '어린이', emoji: '🐥' },
  { minLevel: 10, name: '청소년', emoji: '🐤' },
  { minLevel: 20, name: '성인', emoji: '🦉' },
] as const;
