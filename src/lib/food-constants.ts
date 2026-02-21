/**
 * 5대 영양소 기반 음식 시스템
 * - 탄수화물(carbs), 단백질(protein), 지방(fat), 비타민(vitamin), 무기질(mineral)
 * - 각 음식은 서로 다른 영양소 조합을 제공
 * - 균형 잡힌 식단이 중요: 한 가지만 먹으면 건강 문제 발생
 */

export type NutrientKey = 'carbs' | 'protein' | 'fat' | 'vitamin' | 'mineral';

export const NUTRIENT_LABELS: Record<NutrientKey, string> = {
  carbs: '탄수화물',
  protein: '단백질',
  fat: '지방',
  vitamin: '비타민',
  mineral: '무기질',
};

export const NUTRIENT_COLORS: Record<NutrientKey, string> = {
  carbs: '#f0a030',
  protein: '#e05050',
  fat: '#e8c040',
  vitamin: '#40b840',
  mineral: '#5090d0',
};

export const NUTRIENT_ICONS: Record<NutrientKey, string> = {
  carbs: '🌾',
  protein: '🥩',
  fat: '🧈',
  vitamin: '🍊',
  mineral: '🥛',
};

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  hungerRestore: number;
  nutrients: Record<NutrientKey, number>;
  description: string;
  category: 'staple' | 'protein' | 'snack' | 'fruit' | 'dairy';
}

export const FOODS: FoodItem[] = [
  // 주식류 (탄수화물 높음)
  {
    id: 'rice', name: '밥', emoji: '🍚', price: 5, hungerRestore: 25,
    nutrients: { carbs: 30, protein: 5, fat: 2, vitamin: 3, mineral: 5 },
    description: '든든한 한 공기! 탄수화물 풍부', category: 'staple',
  },
  {
    id: 'bread', name: '빵', emoji: '🍞', price: 4, hungerRestore: 20,
    nutrients: { carbs: 25, protein: 5, fat: 8, vitamin: 2, mineral: 3 },
    description: '부드러운 식빵. 탄수화물+지방', category: 'staple',
  },
  {
    id: 'noodle', name: '국수', emoji: '🍜', price: 6, hungerRestore: 22,
    nutrients: { carbs: 28, protein: 8, fat: 5, vitamin: 5, mineral: 4 },
    description: '따뜻한 국수. 균형 잡힌 한 끼', category: 'staple',
  },
  // 단백질류
  {
    id: 'meat', name: '고기', emoji: '🍖', price: 10, hungerRestore: 30,
    nutrients: { carbs: 2, protein: 35, fat: 15, vitamin: 5, mineral: 8 },
    description: '구운 고기! 단백질의 왕', category: 'protein',
  },
  {
    id: 'fish', name: '생선', emoji: '🐟', price: 8, hungerRestore: 25,
    nutrients: { carbs: 0, protein: 28, fat: 12, vitamin: 8, mineral: 10 },
    description: '신선한 생선. 단백질+무기질', category: 'protein',
  },
  {
    id: 'egg_food', name: '계란', emoji: '🥚', price: 3, hungerRestore: 15,
    nutrients: { carbs: 2, protein: 20, fat: 10, vitamin: 10, mineral: 5 },
    description: '완전식품! 고른 영양소', category: 'protein',
  },
  // 간식/지방류
  {
    id: 'cookie', name: '쿠키', emoji: '🍪', price: 3, hungerRestore: 10,
    nutrients: { carbs: 15, protein: 3, fat: 20, vitamin: 1, mineral: 2 },
    description: '달콤한 쿠키. 지방 높음', category: 'snack',
  },
  {
    id: 'cheese', name: '치즈', emoji: '🧀', price: 6, hungerRestore: 12,
    nutrients: { carbs: 3, protein: 12, fat: 18, vitamin: 5, mineral: 15 },
    description: '고소한 치즈. 지방+무기질', category: 'snack',
  },
  // 과일/비타민류
  {
    id: 'apple', name: '사과', emoji: '🍎', price: 4, hungerRestore: 10,
    nutrients: { carbs: 12, protein: 1, fat: 0, vitamin: 25, mineral: 5 },
    description: '싱싱한 사과! 비타민 풍부', category: 'fruit',
  },
  {
    id: 'banana', name: '바나나', emoji: '🍌', price: 3, hungerRestore: 12,
    nutrients: { carbs: 18, protein: 2, fat: 1, vitamin: 15, mineral: 10 },
    description: '에너지 충전! 비타민+무기질', category: 'fruit',
  },
  {
    id: 'salad', name: '샐러드', emoji: '🥗', price: 7, hungerRestore: 8,
    nutrients: { carbs: 5, protein: 5, fat: 5, vitamin: 30, mineral: 15 },
    description: '신선한 채소. 비타민의 보고', category: 'fruit',
  },
  // 유제품/무기질류
  {
    id: 'milk', name: '우유', emoji: '🥛', price: 4, hungerRestore: 10,
    nutrients: { carbs: 8, protein: 10, fat: 8, vitamin: 5, mineral: 25 },
    description: '칼슘 듬뿍! 무기질 최고', category: 'dairy',
  },
];

export const MAX_NUTRIENT = 100;
export const NUTRIENT_DECAY_PER_HOUR = 3;
export const LOW_NUTRIENT_THRESHOLD = 20;

export const POINTS_REWARD = {
  study: 5,
  exam_correct: 20,
  exam_wrong: 5,
  feed: 1,
} as const;

/**
 * 영양 균형 점수 계산 (0~100)
 * 모든 영양소가 고르게 높을수록 높은 점수
 */
export function calculateNutritionScore(nutrition: Record<NutrientKey, number>): number {
  const values = Object.values(nutrition);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const balance = min / (avg || 1);
  return Math.round(avg * balance);
}

/**
 * 영양 상태 진단
 */
export function getNutritionStatus(nutrition: Record<NutrientKey, number>): {
  status: 'good' | 'warning' | 'danger';
  message: string;
  lowNutrients: NutrientKey[];
} {
  const lowNutrients = (Object.keys(nutrition) as NutrientKey[])
    .filter(k => nutrition[k] < LOW_NUTRIENT_THRESHOLD);

  if (lowNutrients.length === 0) {
    return { status: 'good', message: '영양 상태가 좋아요!', lowNutrients: [] };
  }
  if (lowNutrients.length <= 2) {
    const names = lowNutrients.map(k => NUTRIENT_LABELS[k]).join(', ');
    return { status: 'warning', message: `${names}이(가) 부족해요!`, lowNutrients };
  }
  return { status: 'danger', message: '영양 상태가 위험해요!', lowNutrients };
}
