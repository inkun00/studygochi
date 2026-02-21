import sharp from 'sharp';
import path from 'path';

const INPUT = path.resolve('C:/Users/user/.cursor/projects/c-Users-user-myproject-studygochi/assets/pet-egg-green.png');
const OUTPUT = path.resolve('public/sprites/pet-egg.png');

async function main() {
  const image = sharp(INPUT);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = Buffer.from(data);

  let cleared = 0;
  const total = pixels.length / 4;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // Green screen: green channel is dominant
    if (g > 100 && g > r * 1.2 && g > b * 1.2) {
      pixels[i + 3] = 0;
      cleared++;
    }
  }

  await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()   // auto-crop transparent edges
    .png()
    .toFile(OUTPUT);

  console.log(`Cleared ${cleared}/${total} pixels (${((cleared/total)*100).toFixed(1)}%)`);
  console.log(`Saved to ${OUTPUT}`);
}

main();
