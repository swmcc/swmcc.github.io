// Generates public/og-image.png (1200x630 Open Graph card).
// Run with: node scripts/generate-og-image.mjs
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outPath = path.join(root, 'public/og-image.png');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="70"/>
    </filter>
    <linearGradient id="purplepink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a855f7"/>
      <stop offset="1" stop-color="#ec4899"/>
    </linearGradient>
    <linearGradient id="cyanblue" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#22d3ee"/>
      <stop offset="1" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="#0a0a0a"/>

  <circle cx="120" cy="80" r="220" fill="url(#purplepink)" opacity="0.28" filter="url(#blur)"/>
  <circle cx="1100" cy="140" r="240" fill="url(#cyanblue)" opacity="0.26" filter="url(#blur)"/>
  <circle cx="320" cy="600" r="230" fill="url(#purplepink)" opacity="0.2" filter="url(#blur)"/>

  <text x="600" y="300" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="88" font-weight="700" fill="#fafafa" letter-spacing="-2">Stephen McCullough</text>
  <text x="600" y="380" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="34" font-weight="400" fill="#9ca3af">Software engineer and founder, Northern Ireland</text>
  <text x="600" y="500" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="30" font-weight="600" fill="#3b82f6">swm.cc</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(outPath);

const meta = await sharp(outPath).metadata();
console.log(`Wrote ${outPath}: ${meta.width}x${meta.height} ${meta.format}`);
