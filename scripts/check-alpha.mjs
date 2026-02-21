import sharp from 'sharp';
import path from 'path';

const file = path.resolve('public/sprites/pet-egg.png');

async function main() {
  const meta = await sharp(file).metadata();
  console.log('Format:', meta.format);
  console.log('Size:', meta.width, 'x', meta.height);
  console.log('Channels:', meta.channels);
  console.log('Has alpha:', meta.hasAlpha);

  const { data } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  
  let transparent = 0, opaque = 0, semi = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 0) transparent++;
    else if (data[i] === 255) opaque++;
    else semi++;
  }
  const total = transparent + opaque + semi;
  console.log(`\nPixels: ${total}`);
  console.log(`Transparent (a=0): ${transparent} (${(transparent/total*100).toFixed(1)}%)`);
  console.log(`Opaque (a=255): ${opaque} (${(opaque/total*100).toFixed(1)}%)`);
  console.log(`Semi (0<a<255): ${semi} (${(semi/total*100).toFixed(1)}%)`);
}

main();
