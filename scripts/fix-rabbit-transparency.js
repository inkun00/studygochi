/**
 * 토끼 스프라이트 시트의 흰색 배경을 투명으로 변환
 * 실행: node scripts/fix-rabbit-transparency.js
 */

const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '../public/sprites/pet/RABBITSPRITESHEET.png');
const outputPath = path.join(__dirname, '../public/sprites/pet/RABBITSPRITESHEET_transparent.png');

async function main() {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const threshold = 250; // 250 이상이면 흰색으로 보고 투명 처리

  for (let i = 0; i < width * height; i++) {
    const idx = i * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[idx + 3] = 0; // alpha = 0 (투명)
    }
  }

  await sharp(data, { raw: info })
    .png()
    .toFile(outputPath);

  console.log('✓ RABBITSPRITESHEET_transparent.png 생성 완료');
  console.log('  → RABBITSPRITESHEET.png를 백업 후, _transparent.png 내용으로 교체하세요.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
