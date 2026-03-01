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
import { config } from 'dotenv';

// Load .env file for local development
config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const SLIDESHOW_URL = process.env.SLIDESHOW_URL;

if (!SLIDESHOW_URL) {
  console.error('Error: SLIDESHOW_URL environment variable is not set');
  console.error('Set it in .env file or as an environment variable');
  process.exit(1);
}
const HERO_DIR = path.join(PROJECT_ROOT, 'public', 'hero');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'hero-images.json');

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st'
    : day === 2 || day === 22 ? 'nd'
    : day === 3 || day === 23 ? 'rd'
    : 'th';
  const month = date.toLocaleDateString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
}

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
    const filepath = path.join(HERO_DIR, filename);
    const imageUrl = img.thumb_webp || img.thumb;

    try {
      // Check if image already exists
      await fs.access(filepath);
      console.log(`  Skipping ${img.short_code} (exists)`);
    } catch {
      // File doesn't exist, download it
      console.log(`  Downloading ${img.short_code}...`);
      try {
        await downloadImage(imageUrl, filename);
      } catch (err) {
        console.error(`  Failed to download ${img.short_code}: ${err.message}`);
        continue;
      }
    }

    manifest.push({
      src: `/hero/${filename}`,
      publicUrl: img.public_url,
      title: img.title || '',
      caption: img.caption || '',
      dateTaken: formatDate(img.date_taken),
      shortCode: img.short_code,
    });
  }

  // Clean up images that are no longer in the slideshow
  const validFilenames = new Set(data.images.map(img => `hero-${img.short_code}.webp`));
  const existingFiles = await fs.readdir(HERO_DIR);
  const heroFiles = existingFiles.filter(f => f.startsWith('hero-') && f.endsWith('.webp'));

  let deletedCount = 0;
  for (const file of heroFiles) {
    if (!validFilenames.has(file)) {
      const filepath = path.join(HERO_DIR, file);
      await fs.unlink(filepath);
      console.log(`  Deleted ${file} (no longer in slideshow)`);
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    console.log(`\nRemoved ${deletedCount} stale image(s)`);
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
