import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const input = path.join(root, 'apps', 'extension', 'src', 'assets', 'icon.svg');
const sizes = [16, 48, 128];

const svgBuffer = await readFile(input);

for (const size of sizes) {
  const output = path.join(root, 'apps', 'extension', 'src', 'assets', `icon${size}.png`);
  await sharp(svgBuffer).resize(size, size).png().toFile(output);
  console.log(`Generated ${output}`);
}
