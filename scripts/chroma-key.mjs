import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SPRITES_DIR = path.resolve('public/sprites');

const PET_FILES = [
  'pet-egg.png',
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

async function makeTransparent(filename) {
  const filePath = path.join(SPRITES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${filename}`);
    return;
  }

  console.log(`Processing: ${filename}...`);
  const image = sharp(filePath);
  const { width, height } = await image.metadata();
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  let cleared = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // Detect near-white, light gray, and checkered pattern colors
    const isWhite = r > 230 && g > 230 && b > 230;
    const isLightGray = r > 180 && g > 180 && b > 180 && Math.abs(r - g) < 10 && Math.abs(g - b) < 10;
    const isGreen = g > 150 && g > r * 1.3 && g > b * 1.3;

    if (isWhite || isLightGray || isGreen) {
      pixels[i + 3] = 0; // set alpha to 0
      cleared++;
    }
  }

  await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(filePath + '.tmp');

  fs.renameSync(filePath + '.tmp', filePath);
  const pct = ((cleared / (pixels.length / 4)) * 100).toFixed(1);
  console.log(`  DONE: ${filename} - ${pct}% pixels made transparent`);
}

async function main() {
  console.log('=== Chroma Key Background Removal ===\n');
  for (const file of PET_FILES) {
    await makeTransparent(file);
  }
  console.log('\n=== Complete ===');
}

main();
