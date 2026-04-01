#!/usr/bin/env node

/**
 * Syndicates content to dev.to via their API.
 * Posts with `syndicate: true` in frontmatter will be published.
 * The dev.to article ID is stored back in the frontmatter as `devtoId`.
 *
 * Run: DEVTO_API_KEY=xxx node scripts/syndicate.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import yaml from 'js-yaml';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const DEVTO_API_KEY = process.env.DEVTO_API_KEY?.trim();
const DEVTO_API_URL = 'https://dev.to/api/articles';
const SITE_URL = 'https://swm.cc';

const COLLECTIONS = [
  { name: 'writing', dir: path.join(PROJECT_ROOT, 'src/content/writing'), urlPath: 'writing' },
  { name: 'notes', dir: path.join(PROJECT_ROOT, 'src/content/notes'), urlPath: 'notes' },
];

if (!DEVTO_API_KEY) {
  console.log('DEVTO_API_KEY not set, skipping syndication');
  process.exit(0);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function sanitizeTag(tag) {
  // dev.to only allows alphanumeric characters
  return tag.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  const frontmatter = yaml.load(match[1]);
  const body = match[2].trim();
  return { frontmatter, body };
}

function serializeFrontmatter(frontmatter, body) {
  const yamlStr = yaml.dump(frontmatter, {
    quotingType: '"',
    forceQuotes: false,
    lineWidth: -1,
  }).trim();
  return `---\n${yamlStr}\n---\n\n${body}\n`;
}

async function getDevtoArticle(id) {
  const response = await fetch(`${DEVTO_API_URL}/${id}`, {
    headers: {
      'api-key': DEVTO_API_KEY,
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch article ${id}: ${response.status}`);
  }

  return response.json();
}

async function createDevtoArticle(article) {
  const response = await fetch(DEVTO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': DEVTO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ article }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create article: ${response.status} - ${text}`);
  }

  return response.json();
}

async function updateDevtoArticle(id, article) {
  const response = await fetch(`${DEVTO_API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'api-key': DEVTO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ article }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update article ${id}: ${response.status} - ${text}`);
  }

  return response.json();
}

async function processFile(filepath, urlPath) {
  const content = await fs.readFile(filepath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter.syndicate) {
    return null;
  }

  if (frontmatter.draft) {
    console.log(`  Skipping draft: ${frontmatter.title}`);
    return null;
  }

  const slug = path.basename(filepath, '.md');
  const canonicalUrl = `${SITE_URL}/${urlPath}/${slug}`;
  const tags = (frontmatter.tags || []).slice(0, 4).map(sanitizeTag).filter(Boolean);

  const article = {
    title: frontmatter.title,
    body_markdown: body,
    canonical_url: canonicalUrl,
    published: true,
    tags,
  };

  if (frontmatter.description) {
    article.description = frontmatter.description;
  }

  let result;
  let action;

  if (frontmatter.devtoId) {
    const existing = await getDevtoArticle(frontmatter.devtoId);
    if (existing) {
      console.log(`  Updating: ${frontmatter.title}`);
      result = await updateDevtoArticle(frontmatter.devtoId, article);
      action = 'updated';
    } else {
      console.log(`  Article ${frontmatter.devtoId} not found, creating new: ${frontmatter.title}`);
      result = await createDevtoArticle(article);
      action = 'created';
    }
  } else {
    console.log(`  Creating: ${frontmatter.title}`);
    result = await createDevtoArticle(article);
    action = 'created';
  }

  if (action === 'created' && result.id !== frontmatter.devtoId) {
    frontmatter.devtoId = result.id;
    const newContent = serializeFrontmatter(frontmatter, body);
    await fs.writeFile(filepath, newContent);
    console.log(`    Saved devtoId: ${result.id}`);
  }

  return { action, id: result.id, url: result.url };
}

async function main() {
  console.log('Starting dev.to syndication...\n');

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const collection of COLLECTIONS) {
    console.log(`Processing ${collection.name}/`);

    let files;
    try {
      files = await fs.readdir(collection.dir);
    } catch {
      console.log(`  Directory not found, skipping\n`);
      continue;
    }

    const mdFiles = files.filter(f => f.endsWith('.md'));

    for (const file of mdFiles) {
      const filepath = path.join(collection.dir, file);
      try {
        const result = await processFile(filepath, collection.urlPath);
        if (result) {
          if (result.action === 'created') created++;
          if (result.action === 'updated') updated++;
          // Rate limit: wait 10 seconds between API calls
          await sleep(10000);
        }
      } catch (err) {
        console.error(`  Error processing ${file}: ${err.message}`);
        errors++;
        // Wait 35 seconds after rate limit error
        await sleep(35000);
      }
    }

    console.log('');
  }

  console.log('Syndication complete:');
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errors}`);

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
