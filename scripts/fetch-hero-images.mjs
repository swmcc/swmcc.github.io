#!/usr/bin/env node

/**
 * Fetches hero images from the-mcculloughs.org slideshow API
 * and downloads them to public/hero/ for use on the homepage.
 *
 * Run: node scripts/fetch-hero-images.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const SLIDESHOW_URL = 'https://www.the-mcculloughs.org/s/bxllbfcj.json';
const HERO_DIR = path.join(PROJECT_ROOT, 'public', 'hero');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'hero-images.json');

async function fetchSlideshow() {
  console.log(`Fetching slideshow from ${SLIDESHOW_URL}...`);
  const response = await fetch(SLIDESHOW_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch slideshow: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function downloadImage(url, filename) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const filepath = path.join(HERO_DIR, filename);
  await fs.writeFile(filepath, buffer);

  return filepath;
}

async function main() {
  // Ensure directories exist
  await fs.mkdir(HERO_DIR, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });

  // Fetch slideshow data
  const data = await fetchSlideshow();
  console.log(`Found ${data.images.length} images in slideshow "${data.title}"`);

  // Download each image and build manifest
  const manifest = [];

  for (const img of data.images) {
    const filename = `hero-${img.short_code}.webp`;
    const imageUrl = img.thumb_webp || img.thumb;

    console.log(`  Downloading ${img.short_code}...`);

    try {
      await downloadImage(imageUrl, filename);
      manifest.push({
        src: `/hero/${filename}`,
        publicUrl: img.public_url,
        title: img.title || '',
        caption: img.caption || '',
        shortCode: img.short_code,
      });
    } catch (err) {
      console.error(`  Failed to download ${img.short_code}: ${err.message}`);
    }
  }

  // Write manifest
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nWrote ${manifest.length} images to ${HERO_DIR}`);
  console.log(`Manifest saved to ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
