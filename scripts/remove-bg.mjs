import { removeBackground } from '@imgly/background-removal-node';
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

async function processImage(filename) {
  const filePath = path.join(SPRITES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${filename} not found`);
    return;
  }

  console.log(`Processing: ${filename}...`);
  try {
    const inputBuffer = fs.readFileSync(filePath);
    const blob = new Blob([inputBuffer], { type: 'image/png' });

    const resultBlob = await removeBackground(blob, {
      model: 'medium',
      output: { format: 'image/png' },
    });

    const arrayBuffer = await resultBlob.arrayBuffer();
    const outputBuffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, outputBuffer);
    console.log(`  DONE: ${filename} (${(outputBuffer.length / 1024).toFixed(1)}KB)`);
  } catch (err) {
    console.error(`  ERROR: ${filename}:`, err.message);
  }
}

async function main() {
  console.log(`=== Background Removal Start ===`);
  console.log(`Processing ${PET_FILES.length} images...\n`);

  for (const file of PET_FILES) {
    await processImage(file);
  }

  console.log(`\n=== Complete ===`);
}

main();
