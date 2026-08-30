// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://swm.cc',
  base: '/',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        // wrangler dev persists KV/cache state under worker/.wrangler on
        // every request; without this, each Swanson answer triggers a
        // full-page reload that closes the overlay before the reply lands
        ignored: ['**/worker/**']
      }
    }
  },
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true
    }
  },
  experimental: {
    clientPrerender: true
  }
});
