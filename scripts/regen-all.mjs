import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ASSETS_DIR = 'C:/Users/user/.cursor/projects/c-Users-user-myproject-studygochi/assets';
const SPRITES_DIR = path.resolve('public/sprites');

// Map: green-screen source -> output sprite name
const FILES = [
  'pet-baby.png',
  'pet-child.png',
  'pet-teen.png',
  'pet-adult.png',
  'pet-ghost.png',
  'pet-dragon-baby.png',
  'pet-dragon-child.png',
  'pet-dragon-teen.png',
  'pet-dragon-adult.png',
  'pet-bunny-baby.png',
  'pet-bunny-child.png',
  'pet-bunny-teen.png',
  'pet-bunny-adult.png',
  'pet-fox-baby.png',
  'pet-fox-child.png',
  'pet-fox-teen.png',
  'pet-fox-adult.png',
];

async function chromaKey(inputPath, outputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = Buffer.from(data);
  const total = pixels.length / 4;
  let cleared = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Already transparent
    if (a === 0) { cleared++; continue; }

    // Near-white or light gray (checkered pattern remnants)
    const avg = (r + g + b) / 3;
    const isNearWhite = r > 235 && g > 235 && b > 235;
    const isLightGray = avg > 185 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;
    const isCheckered = (
      (r > 190 && g > 190 && b > 190 && Math.abs(r - g) < 8 && Math.abs(g - b) < 8) ||
      (r > 220 && g > 220 && b > 220)
    );

    if (isNearWhite || isLightGray || isCheckered) {
      pixels[i + 3] = 0;
      cleared++;
    }
  }

  await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile(outputPath);

  return ((cleared / total) * 100).toFixed(1);
}

async function main() {
  console.log('=== Re-processing all sprites ===\n');

  for (const file of FILES) {
    const spritePath = path.join(SPRITES_DIR, file);
    if (!fs.existsSync(spritePath)) {
      console.log(`SKIP: ${file}`);
      continue;
    }

    try {
      const pct = await chromaKey(spritePath, spritePath + '.tmp');
      fs.renameSync(spritePath + '.tmp', spritePath);
      console.log(`  ${file}: ${pct}% bg removed`);
    } catch (e) {
      console.error(`  ERROR ${file}: ${e.message}`);
    }
  }

  console.log('\n=== Done ===');
}

main();
