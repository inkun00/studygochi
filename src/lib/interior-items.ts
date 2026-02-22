/**
 * 인테리어 소품 스프라이트 시트 정의
 * 각 시트는 그리드 형태, 타일 기본 64x64px
 */
const BASE = '/sprites/interior';
const CROPPED = `${BASE}/cropped`;
const TILE = 64;

/** 스프라이트 시트 (bedroom_wood_floor 등 일부)용 */
const SHEET_DIMENSIONS: Record<string, { w: number; h: number; tileW: number; tileH: number }> = {
  [`${BASE}/Bedroom-Asset-Pack.png`]: { w: 352, h: 256, tileW: 32, tileH: 32 },
  [`${BASE}/Pixel-Interiors-32x32.png`]: { w: 544, h: 352, tileW: 32, tileH: 32 },
};

export interface InteriorSprite {
  sheet: string;
  row: number;
  col: number;
  tileW?: number;
  tileH?: number;
  /** 개별 이미지 파일인 경우 true (스프라이트 시트가 아님) */
  fullImage?: boolean;
  /** 스프라이트 시트 전체 크기 (32x32 타일 시트용) */
  sheetWidth?: number;
  sheetHeight?: number;
}

export interface InteriorItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  sprite: InteriorSprite;
}

export const INTERIOR_ITEMS: InteriorItem[] = [
  // 크롭된 개별 이미지 사용 (해상도별 정확한 크롭)
  { id: 'bed_blue', name: '파란침대', price: 30, emoji: '🛏️', sprite: { sheet: `${CROPPED}/bed_blue.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bed_pink', name: '핑크침대', price: 30, emoji: '🛏️', sprite: { sheet: `${CROPPED}/bed_pink.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bed_purple', name: '보라침대', price: 35, emoji: '🛏️', sprite: { sheet: `${CROPPED}/bed_purple.png`, row: 0, col: 0, fullImage: true } },
  { id: 'flower_tall', name: '큰화분', price: 15, emoji: '🌿', sprite: { sheet: `${CROPPED}/flower_tall.png`, row: 0, col: 0, fullImage: true } },
  { id: 'flower_medium', name: '중형화분', price: 10, emoji: '🪴', sprite: { sheet: `${CROPPED}/flower_medium.png`, row: 0, col: 0, fullImage: true } },
  { id: 'flower_small', name: '작은화분', price: 8, emoji: '🌱', sprite: { sheet: `${CROPPED}/flower_small.png`, row: 0, col: 0, fullImage: true } },
  { id: 'lamp_gray', name: '회색램프', price: 20, emoji: '💡', sprite: { sheet: `${CROPPED}/lamp_gray.png`, row: 0, col: 0, fullImage: true } },
  { id: 'lamp_brown', name: '갈색램프', price: 20, emoji: '🪔', sprite: { sheet: `${CROPPED}/lamp_brown.png`, row: 0, col: 0, fullImage: true } },
  { id: 'tv_monitor', name: 'TV', price: 50, emoji: '📺', sprite: { sheet: `${CROPPED}/tv_monitor.png`, row: 0, col: 0, fullImage: true } },
  { id: 'tv_cabinet', name: '수납장', price: 40, emoji: '🗄️', sprite: { sheet: `${CROPPED}/tv_cabinet.png`, row: 0, col: 0, fullImage: true } },
  { id: 'sofa', name: '소파', price: 45, emoji: '🛋️', sprite: { sheet: `${CROPPED}/sofa.png`, row: 0, col: 0, fullImage: true } },
  { id: 'table', name: '테이블', price: 25, emoji: '🪑', sprite: { sheet: `${CROPPED}/table.png`, row: 0, col: 0, fullImage: true } },
  { id: 'kitchen_counter', name: '주방카운터', price: 55, emoji: '🍳', sprite: { sheet: `${CROPPED}/kitchen_counter.png`, row: 0, col: 0, fullImage: true } },
  { id: 'kitchen_shelf', name: '주방선반', price: 35, emoji: '📦', sprite: { sheet: `${CROPPED}/kitchen_shelf.png`, row: 0, col: 0, fullImage: true } },
  { id: 'painting_1', name: '액자1', price: 18, emoji: '🖼️', sprite: { sheet: `${CROPPED}/painting_1.png`, row: 0, col: 0, fullImage: true } },
  { id: 'painting_2', name: '액자2', price: 18, emoji: '🖼️', sprite: { sheet: `${CROPPED}/painting_2.png`, row: 0, col: 0, fullImage: true } },
  { id: 'chimney', name: '벽난로', price: 60, emoji: '🔥', sprite: { sheet: `${CROPPED}/chimney.png`, row: 0, col: 0, fullImage: true } },
  { id: 'door', name: '문', price: 40, emoji: '🚪', sprite: { sheet: `${CROPPED}/door.png`, row: 0, col: 0, fullImage: true } },
  { id: 'cupboard', name: '찬장', price: 42, emoji: '🗃️', sprite: { sheet: `${CROPPED}/cupboard.png`, row: 0, col: 0, fullImage: true } },
  { id: 'misc_rug', name: '쿠션테이블', price: 22, emoji: '🏠', sprite: { sheet: `${CROPPED}/misc_rug.png`, row: 0, col: 0, fullImage: true } },
  // Bedroom-Asset-Pack (크롭됨)
  { id: 'bedroom_bed1', name: '침대1', price: 28, emoji: '🛏️', sprite: { sheet: `${CROPPED}/bedroom_bed1.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_bed2', name: '침대2', price: 28, emoji: '🛏️', sprite: { sheet: `${CROPPED}/bedroom_bed2.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_wardrobe', name: '옷장', price: 38, emoji: '🚪', sprite: { sheet: `${CROPPED}/bedroom_wardrobe.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_dresser', name: '장식장', price: 35, emoji: '🗄️', sprite: { sheet: `${CROPPED}/bedroom_dresser.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_desk', name: '책상', price: 32, emoji: '🪑', sprite: { sheet: `${CROPPED}/bedroom_desk.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_chair', name: '나무의자', price: 15, emoji: '🪑', sprite: { sheet: `${CROPPED}/bedroom_chair.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_bookshelf', name: '책장', price: 30, emoji: '📚', sprite: { sheet: `${CROPPED}/bedroom_bookshelf.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_rug', name: '청회색러그', price: 18, emoji: '🏠', sprite: { sheet: `${CROPPED}/bedroom_rug.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_lamp', name: '장식선반', price: 22, emoji: '📚', sprite: { sheet: `${CROPPED}/bedroom_lamp.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_plant', name: '화분', price: 12, emoji: '🌿', sprite: { sheet: `${CROPPED}/bedroom_plant.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_picture', name: '상자', price: 14, emoji: '📦', sprite: { sheet: `${CROPPED}/bedroom_picture.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_clock', name: '시계', price: 16, emoji: '🕐', sprite: { sheet: `${CROPPED}/bedroom_clock.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_stool', name: '스툴', price: 10, emoji: '🪑', sprite: { sheet: `${CROPPED}/bedroom_stool.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_cabinet', name: '수납장2', price: 36, emoji: '🗄️', sprite: { sheet: `${CROPPED}/bedroom_cabinet.png`, row: 0, col: 0, fullImage: true } },
  { id: 'bedroom_wood_floor', name: '나무바닥', price: 8, emoji: '🪵', sprite: { sheet: `${BASE}/Bedroom-Asset-Pack.png`, row: 0, col: 0, tileW: 32, tileH: 32, sheetWidth: 352, sheetHeight: 256 } },
  // Pixel-Interiors (크롭됨)
  { id: 'pixel_bed_blue', name: '파란침대2', price: 30, emoji: '🛏️', sprite: { sheet: `${CROPPED}/pixel_bed_blue.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_bed_pink', name: '핑크침대2', price: 30, emoji: '🛏️', sprite: { sheet: `${CROPPED}/pixel_bed_pink.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_nightstand', name: '협탁', price: 18, emoji: '🪑', sprite: { sheet: `${CROPPED}/pixel_nightstand.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_armchair_brown', name: '갈색안락의자', price: 35, emoji: '🛋️', sprite: { sheet: `${CROPPED}/pixel_armchair_brown.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_armchair_teal', name: '청록안락의자', price: 35, emoji: '🛋️', sprite: { sheet: `${CROPPED}/pixel_armchair_teal.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_bookshelf', name: '책장2', price: 32, emoji: '📚', sprite: { sheet: `${CROPPED}/pixel_bookshelf.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_table_long', name: '긴테이블', price: 28, emoji: '🪑', sprite: { sheet: `${CROPPED}/pixel_table_long.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_chair_purple', name: '보라의자', price: 18, emoji: '🪑', sprite: { sheet: `${CROPPED}/pixel_chair_purple.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_kitchen_counter', name: '주방카운터2', price: 45, emoji: '🍳', sprite: { sheet: `${CROPPED}/pixel_kitchen_counter.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_fridge', name: '냉장고', price: 55, emoji: '🧊', sprite: { sheet: `${CROPPED}/pixel_fridge.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_stove', name: '가스레인지', price: 50, emoji: '🔥', sprite: { sheet: `${CROPPED}/pixel_stove.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_microwave', name: '전자레인지', price: 42, emoji: '📻', sprite: { sheet: `${CROPPED}/pixel_microwave.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_toaster', name: '토스터', price: 15, emoji: '🍞', sprite: { sheet: `${CROPPED}/pixel_toaster.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_rug_stripe', name: '줄무늬러그', price: 20, emoji: '🏠', sprite: { sheet: `${CROPPED}/pixel_rug_stripe.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_plant', name: '화분2', price: 12, emoji: '🌿', sprite: { sheet: `${CROPPED}/pixel_plant.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_lamp', name: '스탠드램프', price: 24, emoji: '💡', sprite: { sheet: `${CROPPED}/pixel_lamp.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_wardrobe', name: '장롱', price: 40, emoji: '🚪', sprite: { sheet: `${CROPPED}/pixel_wardrobe.png`, row: 0, col: 0, fullImage: true } },
  { id: 'pixel_door', name: '문2', price: 35, emoji: '🚪', sprite: { sheet: `${CROPPED}/pixel_door.png`, row: 0, col: 0, fullImage: true } },
  // Tree (개별 이미지)
  ...Array.from({ length: 60 }, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    return {
      id: `tree_${n}`,
      name: `나무${i + 1}`,
      price: 12,
      emoji: '🌲',
      sprite: { sheet: `${BASE}/tree/${n}.png`, row: 0, col: 0, fullImage: true },
    };
  }),
];

export const INTERIOR_ITEMS_MAP: Record<string, InteriorItem> = Object.fromEntries(
  INTERIOR_ITEMS.map((item) => [item.id, item])
);

export function getInteriorItem(id: string): InteriorItem | undefined {
  return INTERIOR_ITEMS_MAP[id];
}

/** 스프라이트 시트에서 한 프레임의 backgroundPosition 계산 (row, col 0-based)
 * @param displaySize - 지정 시 해당 크기 컨테이너에 스프라이트를 가운데 배치 (예: 상점 썸네일 40px)
 */
export function getInteriorSpriteStyle(
  sprite: InteriorSprite,
  displaySize?: number
): { backgroundImage: string; backgroundPosition: string; backgroundSize: string } {
  if (sprite.fullImage) {
    return {
      backgroundImage: `url(${sprite.sheet})`,
      backgroundPosition: 'center',
      backgroundSize: 'contain',
    };
  }
  const dims = SHEET_DIMENSIONS[sprite.sheet];
  const w = dims?.tileW ?? sprite.tileW ?? TILE;
  const h = dims?.tileH ?? sprite.tileH ?? TILE;
  const sheetW = dims?.w ?? sprite.sheetWidth;
  const sheetH = dims?.h ?? sprite.sheetHeight;
  const size = displaySize ?? TILE;
  const tileSize = Math.max(w, h);
  const centerOffset = size < tileSize ? (tileSize - size) / 2 : 0;

  if (sheetW != null && sheetH != null) {
    const scale = size / Math.min(w, h);
    const sizeW = sheetW * scale;
    const sizeH = sheetH * scale;
    const cellCenterX = sprite.col * w + w / 2;
    const cellCenterY = sprite.row * h + h / 2;
    const posX = cellCenterX * scale - size / 2;
    const posY = cellCenterY * scale - size / 2;
    return {
      backgroundImage: `url(${sprite.sheet})`,
      backgroundPosition: `-${posX}px -${posY}px`,
      backgroundSize: `${sizeW}px ${sizeH}px`,
    };
  }
  const x = sprite.col * w + centerOffset;
  const y = sprite.row * h + centerOffset;
  return {
    backgroundImage: `url(${sprite.sheet})`,
    backgroundPosition: `-${x}px -${y}px`,
    backgroundSize: 'auto',
  };
}
