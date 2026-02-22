/**
 * 스프라이트 시트에서 아이템을 잘라 개별 파일로 저장
 * 분석된 해상도: Beds 256x256, Flowers 384x96, LivingRoom 192x96, Kitchen 1152x96,
 * Bedroom 352x256, Pixel-Interiors 544x352
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BASE = path.join(__dirname, '../public/sprites/interior');
const OUT = path.join(BASE, 'cropped');
fs.mkdirSync(OUT, { recursive: true });

const sheets = [
  { file: 'Beds-Sheet.png', tw: 64, th: 64, items: [[0,0,'bed_blue'],[1,0,'bed_pink'],[2,0,'bed_purple']]},
  { file: 'Flowers-Sheet.png', tw: 64, th: 96, items: [[0,0,'flower_tall'],[1,0,'flower_medium'],[5,0,'flower_small']]},
  { file: 'LivingRoom-Sheet.png', tw: 96, th: 96, items: [[0,0,'sofa'],[1,0,'table']]},
  { file: 'Kitchen-Sheet.png', tw: 96, th: 96, items: [[0,0,'kitchen_counter'],[1,0,'kitchen_shelf']]},
  { file: 'Lights-Sheet.png', tw: 64, th: 64, items: [[0,0,'lamp_gray'],[1,0,'lamp_brown']]},
  { file: 'TV-Sheet.png', tw: 64, th: 96, items: [[0,0,'tv_cabinet'],[1,0,'tv_monitor']]},
  { file: 'Bedroom-Asset-Pack.png', tw: 32, th: 32, items: [
    [0,4,'bedroom_bed1'],[1,4,'bedroom_bed2'],[2,4,'bedroom_wardrobe'],[3,4,'bedroom_dresser'],
    [4,4,'bedroom_desk'],[5,4,'bedroom_chair'],[6,4,'bedroom_bookshelf'],[7,4,'bedroom_rug'],
    [0,5,'bedroom_lamp'],[1,5,'bedroom_plant'],[2,5,'bedroom_picture'],[3,5,'bedroom_clock'],
    [4,5,'bedroom_stool'],[5,5,'bedroom_cabinet']
  ]},
  { file: 'Pixel-Interiors-32x32.png', tw: 32, th: 32, items: [
    [0,0,'pixel_bed_blue'],[1,0,'pixel_bed_pink'],[2,0,'pixel_nightstand'],
    [0,1,'pixel_armchair_brown'],[1,1,'pixel_armchair_teal'],[2,1,'pixel_bookshelf'],
    [0,2,'pixel_table_long'],[1,2,'pixel_chair_purple'],
    [0,3,'pixel_kitchen_counter'],[1,3,'pixel_fridge'],[2,3,'pixel_stove'],[3,3,'pixel_microwave'],[4,3,'pixel_toaster'],
    [0,4,'pixel_rug_stripe'],[1,4,'pixel_plant'],[2,4,'pixel_lamp'],[3,4,'pixel_wardrobe'],
    [0,5,'pixel_door']
  ]},
  { file: 'Paintings-Sheet.png', tw: 64, th: 32, items: [[0,0,'painting_1'],[1,0,'painting_2']]},
  { file: 'Chimney-Sheet.png', tw: 64, th: 48, items: [[0,0,'chimney']]},
  { file: 'Doors-Sheet.png', tw: 64, th: 128, items: [[0,0,'door']]},
  { file: 'Cupboard-Sheet.png', tw: 96, th: 96, items: [[0,0,'cupboard']]},
  { file: 'Miscellaneous-Sheet.png', tw: 64, th: 64, items: [[0,0,'misc_rug']]},
];

async function crop() {
  for (const { file, tw, th, items } of sheets) {
    const src = path.join(BASE, file);
    if (!fs.existsSync(src)) { console.log('Skip (not found):', file); continue; }
    for (const [col, row, name] of items) {
      const left = col * tw;
      const top = row * th;
      const outPath = path.join(OUT, `${name}.png`);
      await sharp(src)
        .extract({ left, top, width: tw, height: th })
        .toFile(outPath);
      console.log('Created:', name, tw + 'x' + th);
    }
  }
}
crop().catch(console.error);
