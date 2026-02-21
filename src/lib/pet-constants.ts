/**
 * 캐릭터 스프라이트 - 7종 (rabbit, tiger, dog, monkey, elephant, giraffe, panda)
 * 모든 시트 13행×4열, rabbit과 동일한 row/프레임맵 적용
 */

import type { CharacterSprite, RoomType, MBTIType } from '@/lib/types';
import { MBTI_TYPES } from '@/lib/pet-messages';

export const CHARACTER_SPRITES: CharacterSprite[] = ['rabbit', 'tiger', 'dog', 'monkey', 'elephant', 'giraffe', 'panda'];

export const ROOM_TYPES: RoomType[] = ['bedroom', 'kitchen', 'classroom', 'shop'];

export const SPRITE_SHEET_MAP: Record<CharacterSprite, string> = {
  rabbit: '/sprites/pet/RABBITSPRITESHEET.png',
  tiger: '/sprites/pet/TIGERSPRITESHEET.png',
  dog: '/sprites/pet/DOGSPRITESHEET.png',
  monkey: '/sprites/pet/MONKEYSPRITESHEET.png',
  elephant: '/sprites/pet/ELEPHANTSPRITESHEET.png',
  giraffe: '/sprites/pet/GIRAFFESPRITESHEET.png',
  panda: '/sprites/pet/PANDASPRITESHEET.png',
};

export interface SpriteRowMap {
  rowIdle: number;
  rowIdleFront: number;
  rowIdleBack: number;
  rowIdleLeft: number;
  rowIdleRight: number;
  rowRight: number;
  rowLeft: number;
  totalRows: number;
}

export type FrameCell = { r: number; c: number };

/** 모든 캐릭터 동일: 앞 정지 Row1,4,5 Col1-2 (rabbit 기준) */
const RABBIT_FRONT: FrameCell[] = [
  { r: 0, c: 0 }, { r: 0, c: 1 },
  { r: 3, c: 0 }, { r: 3, c: 1 },
  { r: 4, c: 0 },
];
/** 모든 캐릭터 동일: 뒤 정지 Row1,4,5 Col3-4 */
const RABBIT_BACK: FrameCell[] = [
  { r: 0, c: 2 }, { r: 0, c: 3 },
  { r: 3, c: 2 }, { r: 3, c: 3 },
  { r: 4, c: 2 },
];

export const FRAME_IDLE_FRONT_MAP: Record<CharacterSprite, FrameCell[]> = {
  rabbit: RABBIT_FRONT,
  tiger: RABBIT_FRONT,
  dog: RABBIT_FRONT,
  monkey: RABBIT_FRONT,
  elephant: RABBIT_FRONT,
  giraffe: RABBIT_FRONT,
  panda: RABBIT_FRONT,
};

export const FRAME_IDLE_BACK_MAP: Record<CharacterSprite, FrameCell[]> = {
  rabbit: RABBIT_BACK,
  tiger: RABBIT_BACK,
  dog: RABBIT_BACK,
  monkey: RABBIT_BACK,
  elephant: RABBIT_BACK,
  giraffe: RABBIT_BACK,
  panda: RABBIT_BACK,
};

/** 레거시 호환 */
export const FRAME_IDLE_FRONT = RABBIT_FRONT;
export const FRAME_IDLE_BACK = RABBIT_BACK;

/** rabbit 기준: Row1 왼 idle, Row2 오 idle, Row8 왼 walk, Row9 오 walk, 13행 고정 */
const RABBIT_ROW_MAP: SpriteRowMap = {
  rowIdle: 0,
  rowIdleFront: 0,
  rowIdleBack: 3,
  rowIdleLeft: 1,
  rowIdleRight: 2,
  rowLeft: 8,
  rowRight: 9,
  totalRows: 13,
};

export const SPRITE_ROW_MAP: Record<CharacterSprite, SpriteRowMap> = {
  rabbit: RABBIT_ROW_MAP,
  tiger: RABBIT_ROW_MAP,
  dog: RABBIT_ROW_MAP,
  monkey: RABBIT_ROW_MAP,
  elephant: RABBIT_ROW_MAP,
  giraffe: RABBIT_ROW_MAP,
  panda: RABBIT_ROW_MAP,
};

export const BG_MAP: Record<RoomType, string> = {
  bedroom: '/sprites/bg-bedroom.png',
  kitchen: '/sprites/bg-kitchen.png',
  classroom: '/sprites/bg-classroom.png',
  shop: '/sprites/bg-shop.png',
};

const VALID_SPRITES: CharacterSprite[] = ['rabbit', 'tiger', 'dog', 'monkey', 'elephant', 'giraffe', 'panda'];

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickRandomCharacter(): CharacterSprite {
  return pickRandom(CHARACTER_SPRITES);
}

export function pickRandomRoom(): RoomType {
  return pickRandom(ROOM_TYPES);
}

export function getCharacterSprite(pet: { character_sprite?: string; character_set?: string }): CharacterSprite {
  const s = pet?.character_sprite;
  if (s && VALID_SPRITES.includes(s as CharacterSprite)) return s as CharacterSprite;
  return 'rabbit';
}

export function getRoomType(pet: { room_type?: RoomType }): RoomType {
  return pet.room_type ?? 'bedroom';
}

function hashToMBTI(id: string): MBTIType {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  return MBTI_TYPES[Math.abs(h) % MBTI_TYPES.length];
}

export function getPetMBTI(pet: { id: string; mbti?: MBTIType }): MBTIType {
  return pet.mbti ?? hashToMBTI(pet.id);
}
