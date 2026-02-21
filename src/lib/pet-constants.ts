/**
 * 캐릭터 스프라이트 - 22종
 * 기존 7종: rabbit, tiger, dog, monkey, elephant, giraffe, panda
 * 신규 15종: squirrel, sloth, wolf, mouse, hedgehog, koala, bear, horse, pig,
 *           meerkat, dessertFox, racoon, deer, cat, lion
 */

import type { CharacterSprite, RoomType, MBTIType } from '@/lib/types';
import { MBTI_TYPES } from '@/lib/pet-messages';

export const CHARACTER_SPRITES: CharacterSprite[] = [
  'rabbit', 'tiger', 'dog', 'monkey', 'elephant', 'giraffe', 'panda',
  'squirrel', 'sloth', 'wolf', 'mouse', 'hedgehog', 'koala', 'bear', 'horse', 'pig',
  'meerkat', 'dessertFox', 'racoon', 'deer', 'cat', 'lion',
];

export const ROOM_TYPES: RoomType[] = ['bedroom', 'kitchen', 'classroom', 'shop'];

export const SPRITE_SHEET_MAP: Record<CharacterSprite, string> = {
  rabbit: '/sprites/pet/RABBITSPRITESHEET.png',
  tiger: '/sprites/pet/TIGERSPRITESHEET.png',
  dog: '/sprites/pet/DOGSPRITESHEET.png',
  monkey: '/sprites/pet/MONKEYSPRITESHEET.png',
  elephant: '/sprites/pet/ELEPHANTSPRITESHEET.png',
  giraffe: '/sprites/pet/GIRAFFESPRITESHEET.png',
  panda: '/sprites/pet/PANDASPRITESHEET.png',
  squirrel: '/sprites/pet/SQUIRRELSPRITESHEET.png',
  sloth: '/sprites/pet/SLOTHSPRITESHEET.png',
  wolf: '/sprites/pet/WOLFSPRITESHEET.png',
  mouse: '/sprites/pet/MOUSESPRITESHEET.png',
  hedgehog: '/sprites/pet/HEDGEHOGSPRITESHEET.png',
  koala: '/sprites/pet/KOALASPRITESHEET.png',
  bear: '/sprites/pet/BEARSPRITESHEET.png',
  horse: '/sprites/pet/HORSESPRITESHEET.png',
  pig: '/sprites/pet/PIGSPRITESHEET.png',
  meerkat: '/sprites/pet/MEERKATSPRITESHEET.png',
  dessertFox: '/sprites/pet/DESSERTFOXSPRITESHEET.png',
  racoon: '/sprites/pet/RACOONSPRITESHEET.png',
  deer: '/sprites/pet/DEERSPRITESHEET.png',
  cat: '/sprites/pet/CATSPRITESHEET.png',
  lion: '/sprites/pet/LIONSPRITESHEET.png',
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
  /** 스프라이트 상단이 잘릴 때 위로 당기는 오프셋 (px) */
  topOffset?: number;
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
  squirrel: RABBIT_FRONT,
  sloth: RABBIT_FRONT,
  wolf: RABBIT_FRONT,
  mouse: RABBIT_FRONT,
  hedgehog: RABBIT_FRONT,
  koala: RABBIT_FRONT,
  bear: RABBIT_FRONT,
  horse: RABBIT_FRONT,
  pig: RABBIT_FRONT,
  meerkat: RABBIT_FRONT,
  dessertFox: RABBIT_FRONT,
  racoon: RABBIT_FRONT,
  deer: RABBIT_FRONT,
  cat: RABBIT_FRONT,
  lion: RABBIT_FRONT,
};

export const FRAME_IDLE_BACK_MAP: Record<CharacterSprite, FrameCell[]> = {
  rabbit: RABBIT_BACK,
  tiger: RABBIT_BACK,
  dog: RABBIT_BACK,
  monkey: RABBIT_BACK,
  elephant: RABBIT_BACK,
  giraffe: RABBIT_BACK,
  panda: RABBIT_BACK,
  squirrel: RABBIT_BACK,
  sloth: RABBIT_BACK,
  wolf: RABBIT_BACK,
  mouse: RABBIT_BACK,
  hedgehog: RABBIT_BACK,
  koala: RABBIT_BACK,
  bear: RABBIT_BACK,
  horse: RABBIT_BACK,
  pig: RABBIT_BACK,
  meerkat: RABBIT_BACK,
  dessertFox: RABBIT_BACK,
  racoon: RABBIT_BACK,
  deer: RABBIT_BACK,
  cat: RABBIT_BACK,
  lion: RABBIT_BACK,
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

/** 신규 스프라이트 시트 - 실제 PNG 315×1024px 기준 13행 4열 */
const NEW_SPRITE_ROW_MAPS: Record<'squirrel' | 'sloth' | 'wolf' | 'mouse' | 'hedgehog' | 'koala' | 'bear' | 'horse' | 'pig' | 'meerkat' | 'dessertFox' | 'racoon' | 'deer' | 'cat' | 'lion', SpriteRowMap> = {
  squirrel: { ...RABBIT_ROW_MAP, totalRows: 13 },
  sloth: { ...RABBIT_ROW_MAP, totalRows: 13 },
  wolf: { ...RABBIT_ROW_MAP, totalRows: 13 },
  mouse: { ...RABBIT_ROW_MAP, totalRows: 13 },
  hedgehog: { ...RABBIT_ROW_MAP, totalRows: 13 },
  koala: { ...RABBIT_ROW_MAP, totalRows: 13 },
  bear: { ...RABBIT_ROW_MAP, totalRows: 13 },
  horse: { ...RABBIT_ROW_MAP, totalRows: 13 },
  pig: { ...RABBIT_ROW_MAP, totalRows: 13 },
  meerkat: { ...RABBIT_ROW_MAP, totalRows: 13 },
  dessertFox: { ...RABBIT_ROW_MAP, totalRows: 13 },
  racoon: { ...RABBIT_ROW_MAP, totalRows: 13 },
  deer: { ...RABBIT_ROW_MAP, totalRows: 13 },
  cat: { ...RABBIT_ROW_MAP, totalRows: 13 },
  lion: { ...RABBIT_ROW_MAP, totalRows: 13 },
};

export const SPRITE_ROW_MAP: Record<CharacterSprite, SpriteRowMap> = {
  rabbit: RABBIT_ROW_MAP,
  tiger: RABBIT_ROW_MAP,
  dog: RABBIT_ROW_MAP,
  monkey: RABBIT_ROW_MAP,
  elephant: RABBIT_ROW_MAP,
  giraffe: RABBIT_ROW_MAP,
  panda: { ...RABBIT_ROW_MAP, topOffset: 6 },
  ...NEW_SPRITE_ROW_MAPS,
};

export const BG_MAP: Record<RoomType, string> = {
  bedroom: '/sprites/bg-bedroom.png',
  kitchen: '/sprites/bg-kitchen.png',
  classroom: '/sprites/bg-classroom.png',
  shop: '/sprites/bg-shop.png',
};

const VALID_SPRITES: CharacterSprite[] = [
  'rabbit', 'tiger', 'dog', 'monkey', 'elephant', 'giraffe', 'panda',
  'squirrel', 'sloth', 'wolf', 'mouse', 'hedgehog', 'koala', 'bear', 'horse', 'pig',
  'meerkat', 'dessertFox', 'racoon', 'deer', 'cat', 'lion',
];

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
