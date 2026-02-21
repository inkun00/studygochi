export type CharacterSet = 'default' | 'dragon' | 'bunny' | 'fox';

export type CharacterSprite = 'rabbit' | 'tiger' | 'dog' | 'monkey' | 'elephant' | 'giraffe' | 'panda';
export type RoomType = 'bedroom' | 'kitchen' | 'classroom' | 'shop';

export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export interface PetNutrition {
  carbs: number;
  protein: number;
  fat: number;
  vitamin: number;
  mineral: number;
}

export interface FoodInventory {
  [foodId: string]: number;
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  level: number;
  experience: number;
  intelligence: number;
  hunger: number;
  is_dead: boolean;
  last_fed_at: string;
  last_studied_at?: string;
  last_played_at?: string;
  died_at?: string;
  created_at: string;
  character_sprite?: CharacterSprite;
  room_type?: RoomType;
  character_set?: CharacterSet;
  nutrition: PetNutrition;
  food_inventory: FoodInventory;
  points: number;
  mbti?: MBTIType;
}

export interface StudyLog {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Exam {
  id: number;
  room_id?: string | null;
  question: string;
  model_answer: string;
  is_active: boolean;
  created_at?: string;
}

export interface ExamResult {
  id: number;
  exam_id: number;
  user_id: string;
  pet_answer: string;
  is_correct: boolean;
  score: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: 'student' | 'teacher';
  gems: number;
  items: UserItems;
  created_at: string;
}

export interface UserItems {
  revive_potion: number;
  cheat_sheet: number;
}

export interface Payment {
  order_id: string;
  amount: number;
  user_id: string;
  status: 'READY' | 'DONE' | 'CANCELED';
  created_at: string;
}

export interface Classroom {
  id: string;
  name: string;
  teacher_id: string;
  code: string;
  created_at: string;
}

export interface GeminiReaction {
  reaction: string;
}

export interface GeminiExamAnswer {
  answer: string;
}

export interface GeminiGradeResult {
  is_correct: boolean;
  explanation: string;
}
