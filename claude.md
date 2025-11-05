# Stephen McCullough's Personal Website

## Overview

A modern, high-performance personal website built with cutting-edge web technologies. This site demonstrates 2025 front-end best practices whilst serving as a professional presence for sharing thoughts, technical notes, and current work.

**Stack:**
- **Astro v5** — Zero-JavaScript by default, Islands architecture for selective hydration
- **TypeScript** — Type safety with strict mode enabled
- **Tailwind CSS v4** — Modern utility-first styling with CSS-first approach
- **Markdown/MDX** — Content authoring with frontmatter validation
- **GitHub Pages** — Automated deployment with GitHub Actions

**Modern Web Standards (2025):**
- ✅ **Semantic HTML5** — Proper use of `<header>`, `<main>`, `<article>`, `<section>`, `<footer>`
- ✅ **Core Web Vitals Optimised** — Fast FCP, LCP < 2.5s, CLS < 0.1
- ✅ **Progressive Enhancement** — Works without JavaScript, enhances with it
- ✅ **Accessibility First** — WCAG 2.1 AA compliant, keyboard navigation, ARIA labels
- ✅ **Modern CSS** — Grid, Flexbox, `clamp()`, `min()`, `max()`, CSS custom properties
- ✅ **View Transitions API** — Smooth SPA-like navigation without frameworks
- ✅ **Intersection Observer** — Performant scroll animations
- ✅ **Web Components** — Custom elements for interactive features
- ✅ **Variable Fonts** — Space Grotesk & Inter for optimal performance
- ✅ **Dark Mode** — `prefers-color-scheme` with manual override
- ✅ **Prefetching** — Link prefetch on hover for instant navigation
- ✅ **Meta Tags** — Complete SEO with OpenGraph, Twitter Cards, structured data

## Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ThemeToggle.astro
│   │   └── BaseHead.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── BlogPost.astro
│   │   └── NoteLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── now.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── notes/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── rss.xml.js
│   │   └── sitemap.xml.js
│   ├── content/
│   │   ├── config.ts
│   │   ├── blog/
│   │   ├── notes/
│   │   └── now/
│   │       └── current.md
│   └── styles/
│       └── global.css
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## Initial Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- Git
- GitHub account

### Create New Astro Project

```bash
npm create astro@latest personal-site
cd personal-site

# Install dependencies
npm install

# Add Tailwind CSS
npx astro add tailwind

# Add MDX support
npx astro add mdx

# Add sitemap generation
npx astro add sitemap
```

### Configure `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://swm.cc',
  base: '/',
  integrations: [tailwind(), mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true
    }
  }
});
```

### Configure Content Collections

Create `src/content/config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional()
  })
});

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional()
  })
});

const now = defineCollection({
  type: 'content',
  schema: z.object({
    updatedDate: z.coerce.date()
  })
});

export const collections = { blog, notes, now };
```

## GitHub Pages Deployment

### 1. Configure GitHub Repository

Create a new repository on GitHub. Since you're using the custom domain `swm.cc`, you can name the repository anything (e.g., `website` or `swm.cc`).

### 2. Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. Enable GitHub Pages

1. Go to your repository Settings → Pages
2. Under "Build and deployment", select "GitHub Actions" as the source
3. Under "Custom domain", enter `swm.cc` and save
4. Ensure your DNS is configured:
   - Add a CNAME record pointing `swm.cc` to `yourusername.github.io`
   - Or use A records pointing to GitHub Pages IPs (see GitHub documentation)
5. Push your code and the action will deploy automatically
6. GitHub will automatically provision an SSL certificate for your custom domain

## Site Sections

### Home Page (`/`)

Brief introduction with links to main sections. Shows latest blog post or note. Should feel welcoming but not over-the-top.

### About Page (`/about`)

Includes:
- Who I am (software engineer, founder, Northern Ireland)
- Professional background (brief, not a CV)
- Current work (automatically pulled from `/now` data)
- Personal interests (modest, authentic)
- Contact or social links (GitHub, email, etc.)

**Implementation note:** The about page should import and reference the current Now page entry to avoid duplication of "what I'm working on" information.

### Now Page (`/now`)

Inspired by Derek Sivers' "Now" page movement. A snapshot of current focus:
- What I'm working on professionally
- Side projects or learning
- Personal priorities
- Last updated date (UK format: DD/MM/YYYY)

Stored as `src/content/now/current.md` for easy editing.

### Blog (`/blog`)

Longer-form writing:
- Technical posts
- Essays on software, startups, or related topics
- Project retrospectives

Each post is a Markdown file in `src/content/blog/` with frontmatter for metadata.

### Notes (`/notes`)

Shorter, less polished content:
- Quick technical snippets
- TILs (Today I Learned)
- Code examples
- Brief thoughts

More informal than blog posts. Like a public Zettelkasten.

## Modern Web Techniques (2025 Standards)

### 1. Semantic HTML5 Structure

All pages use proper semantic elements for better accessibility and SEO:

```html
<header>     <!-- Site navigation and branding -->
<main>       <!-- Primary content of the page -->
  <article>  <!-- Self-contained content (blog posts, notes) -->
  <section>  <!-- Thematic grouping of content -->
</main>
<footer>     <!-- Site footer with links and info -->
```

**Benefits:**
- Screen readers navigate content more effectively
- Search engines understand content hierarchy
- Improved keyboard navigation
- Better document outline

### 2. Modern CSS Techniques

**Fluid Typography:**
```css
font-size: clamp(0.9375rem, 0.875rem + 0.25vw, 1.0625rem);
```
- Scales smoothly between viewport sizes
- No media queries needed for font sizing
- Better reading experience across devices

**CSS Custom Properties (Variables):**
```css
:root {
  --color-accent: #2563eb;
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

:root.dark {
  --color-accent: #3b82f6;
  /* Dark mode overrides */
}
```

**Modern Layout:**
- **CSS Grid** for complex layouts (footer columns, note cards)
- **Flexbox** for alignment and spacing
- **Container Queries** ready (future-proof responsive design)

### 3. Dark/Light Mode (Best Practices)

**System Preference Detection:**
```javascript
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

**Manual Override:**
- Persists user choice in `localStorage`
- Inline script prevents FOUC (Flash of Unstyled Content)
- Smooth transitions between modes
- Respects `prefers-reduced-motion`

**Implementation:** `src/components/ThemeToggle.astro`

### 4. Core Web Vitals Optimisation

**Largest Contentful Paint (LCP < 2.5s):**
- Font preconnection to Google Fonts
- Minimal JavaScript (< 5KB)
- Static site generation (no runtime rendering)
- Optimised images with proper sizing

**Cumulative Layout Shift (CLS < 0.1):**
- Fixed header height
- Predefined card dimensions
- No layout-shifting animations
- Font loading with `font-display: swap`

**First Input Delay (FID < 100ms):**
- Passive event listeners
- Minimal main-thread JavaScript
- Web Components for encapsulated interactivity

### 5. Progressive Enhancement

**Core Principle:** Site works without JavaScript, enhances with it.

**Without JS:**
- ✅ Content is readable
- ✅ Navigation works (standard links)
- ✅ Forms function
- ✅ Dark mode follows system preference

**With JS:**
- ✅ Smooth page transitions
- ✅ Prefetch on hover
- ✅ Scroll animations
- ✅ Reading progress indicator
- ✅ Mobile menu interactivity

### 6. Astro Islands Architecture

**Zero-JavaScript by Default:**
Most components are server-rendered with no client-side JavaScript.

**Selective Hydration:**
Only interactive components load JavaScript:

```astro
<!-- ReadingProgress.astro - Custom Web Component -->
<script>
  class ReadingProgress extends HTMLElement {
    connectedCallback() {
      // Runs only on article pages
      // Minimal JS footprint
    }
  }
  customElements.define('reading-progress', ReadingProgress);
</script>
```

**Benefits:**
- Fast initial load
- Minimal bundle size
- Progressive enhancement
- Better mobile performance

### 7. View Transitions API

**Modern SPA-like Navigation:**
```astro
<html transition:animate="fade">
  <main transition:animate="slide">
```

**Custom Animations:**
```css
::view-transition-old(root) {
  animation: 250ms cubic-bezier(0.4, 0, 0.2, 1) smooth-fade-out;
}

::view-transition-new(root) {
  animation: 350ms cubic-bezier(0.4, 0, 0.2, 1) smooth-fade-in;
}
```

**Fallback:** Works as normal links in unsupported browsers.

### 8. Intersection Observer for Animations

**Performant Scroll Effects:**
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-on-scroll');
      observer.unobserve(entry.target); // Clean up
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});
```

**Benefits:**
- No scroll event listeners (better performance)
- Automatic cleanup
- Respects `prefers-reduced-motion`

### 9. Modern Typography

**Variable Fonts:**
- **Space Grotesk** (headings) — Geometric, modern, personality
- **Inter** (body) — Highly readable, designed for screens

**Loading Strategy:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

**System Font Fallback:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### 10. Accessibility Features

**WCAG 2.1 AA Compliant:**
- ✅ Proper heading hierarchy
- ✅ Alt text for images
- ✅ ARIA labels for interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators (`:focus-visible`)
- ✅ Color contrast ratios > 4.5:1
- ✅ Reduced motion support

**Example:**
```astro
<button aria-label="Toggle dark mode" aria-pressed={isDark}>
```

### 11. Performance Optimizations

**Link Prefetching:**
```javascript
link.addEventListener('mouseenter', () => {
  const prefetchLink = document.createElement('link');
  prefetchLink.rel = 'prefetch';
  prefetchLink.href = href;
  document.head.appendChild(prefetchLink);
}, { once: true });
```

**Lazy Loading:**
- Images use `loading="lazy"` attribute
- Below-the-fold content deferred
- Critical CSS inlined

**Minimal Dependencies:**
- No heavy frameworks (React, Vue, etc.)
- Vanilla JavaScript where needed
- Web Components for encapsulation

### 12. SEO & Meta Tags

**Complete Meta Tag Implementation:**
```astro
<!-- src/components/BaseHead.astro -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="description" content={description} />
<meta name="generator" content={Astro.generator} />

<!-- Canonical URL -->
<link rel="canonical" href={canonicalURL} />

<!-- Open Graph (Facebook, LinkedIn) -->
<meta property="og:type" content="website" />
<meta property="og:url" content={Astro.url} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL(image, Astro.url)} />

<!-- Twitter Card -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:title" content={title} />
<meta property="twitter:description" content={description} />
<meta property="twitter:image" content={new URL(image, Astro.url)} />
```

**RSS Feed:**
- Auto-generated at `/rss.xml`
- Includes both blog posts and notes
- Proper `<language>` tag (en-gb)
- Implements `<pubDate>` and `<description>`

**Sitemap:**
- Auto-generated by `@astrojs/sitemap`
- Updates automatically on build
- Located at `/sitemap-index.xml`

**Robots.txt:**
```txt
User-agent: *
Allow: /
Sitemap: https://swm.cc/sitemap-index.xml
```

### 13. Micro-Interactions

**Tasteful Animation Examples:**

**Card Hover Effects:**
```css
.card {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
```

**Button Press Effect:**
```css
.button:active {
  transform: scale(0.98);
}
```

**Focus Indicators:**
```css
*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 4px;
}
```

**Animated Blobs (Hero Background):**
```css
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.blob {
  animation: float 20s ease-in-out infinite;
  filter: blur(80px);
}
```

### 14. Deployment Optimisation (GitHub Pages)

**Build Optimisation:**
```javascript
// astro.config.mjs
export default defineConfig({
  site: 'https://swm.cc',
  base: '/',
  experimental: {
    clientPrerender: true  // Pre-render pages in background
  }
});
```

**GitHub Actions Configuration:**
- Node.js 20 (latest LTS)
- `npm ci` for faster, reproducible builds
- Artifact caching for dependencies
- Automatic deployment on push to `main`

**Performance Checklist:**
- ✅ Minified HTML, CSS, JS
- ✅ Optimised images
- ✅ Gzip compression enabled
- ✅ HTTP/2 support (GitHub Pages default)
- ✅ SSL certificate (automatic via GitHub)

## Code Examples

### Modern Component Pattern

```astro
---
// TypeScript props with validation
interface Props {
  title: string;
  description: string;
  publishDate: Date;
}

const { title, description, publishDate } = Astro.props;
---

<article class="card">
  <header>
    <h2>{title}</h2>
    <time datetime={publishDate.toISOString()}>
      {formatDate(publishDate)}
    </time>
  </header>
  <p>{description}</p>
  <slot />  <!-- Content injection point -->
</article>

<style>
  /* Scoped styles - only affect this component */
  article {
    padding: 1.5rem;
    border-radius: 12px;
  }
</style>
```

### Responsive Grid with Modern CSS

```css
/* Auto-fit grid - no media queries */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 2rem;
}

/* Container query example */
@container (min-width: 768px) {
  .card {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Web Component (Reading Progress)

```astro
<script>
  class ReadingProgress extends HTMLElement {
    constructor() {
      super();
      this.bar = null;
      this.handleScroll = this.handleScroll.bind(this);
    }

    connectedCallback() {
      this.bar = this.querySelector('.progress-bar');
      if (!document.querySelector('article')) return;  // Only on articles

      window.addEventListener('scroll', this.handleScroll, { passive: true });
      this.handleScroll();
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
      const scrollPercentage =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      this.bar.style.width = `${Math.min(Math.max(scrollPercentage, 0), 100)}%`;
    }
  }

  customElements.define('reading-progress', ReadingProgress);
</script>
```

## Best Practices Summary

### HTML
- ✅ Use semantic elements (`<header>`, `<main>`, `<article>`, `<section>`, `<footer>`)
- ✅ Provide `alt` text for images
- ✅ Use `<time>` with `datetime` attribute for dates
- ✅ Proper heading hierarchy (don't skip levels)

### CSS
- ✅ Use CSS custom properties for theming
- ✅ Prefer `clamp()`, `min()`, `max()` for responsive sizing
- ✅ Use Grid and Flexbox appropriately
- ✅ Implement dark mode with `prefers-color-scheme`
- ✅ Respect `prefers-reduced-motion`

### JavaScript
- ✅ Start with zero JavaScript (progressive enhancement)
- ✅ Use Web Components for encapsulation
- ✅ Prefer Intersection Observer over scroll events
- ✅ Use passive event listeners
- ✅ Clean up event listeners (`removeEventListener`)

### Performance
- ✅ Minimise JavaScript bundle size
- ✅ Lazy load images
- ✅ Prefetch links on hover
- ✅ Use static site generation
- ✅ Optimise fonts (preconnect, variable fonts)

### Accessibility
- ✅ Keyboard navigation support
- ✅ ARIA labels where needed
- ✅ Focus indicators
- ✅ Color contrast > 4.5:1
- ✅ Screen reader tested

## Additional Features

### Optional Enhancements

**Tags/Categories:**
- Already included in content schema
- Can add tag pages at `/blog/tags/[tag]` and `/notes/tags/[tag]`
- Simple tag listing components

**Search:**
- Keep it simple: could add Pagefind (static search)
- Or just rely on browser find and good navigation

**Analytics:**
- Plausible or Simple Analytics (privacy-friendly)
- Or basic Cloudflare Web Analytics
- Avoid Google Analytics (heavy, privacy concerns)

**Reading Time:**
- Calculate from word count in blog posts
- Display in post metadata

## Content Workflow

### Adding a Blog Post

1. Create new file: `src/content/blog/my-new-post.md`
2. Add frontmatter:
```markdown
---
title: "Your Post Title"
description: "Brief description for SEO and listing pages"
pubDate: 2025-11-05
tags: ["typescript", "astro"]
---

Your content here...
```
3. Commit and push to main branch
4. GitHub Actions deploys automatically (typically 1-2 minutes)

### Adding a Note

Same as blog post, but in `src/content/notes/` with simpler frontmatter:
```markdown
---
title: "Quick Note About X"
pubDate: 2025-11-05
tags: ["javascript"]
---

Brief content...
```

### Updating Now Page

Edit `src/content/now/current.md`:
```markdown
---
updatedDate: 2025-11-05
---

## What I'm up to

Currently working on...
```

Commit and push. The About page will automatically reflect the update.

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type checking
npm run astro check
```

## Design System

### Typography

- Headings: System font stack (clean, fast)
- Body: Georgia or similar serif for readability
- Code: JetBrains Mono or SF Mono

### Colour Palette

Light mode:
- Background: Off-white (#fafafa)
- Text: Near-black (#1a1a1a)
- Accent: Subtle blue or grey

Dark mode:
- Background: True black or near-black (#0a0a0a)
- Text: Off-white (#e0e0e0)
- Accent: Same as light, adjusted for contrast

Keep it simple. Two colours plus greys is plenty.

### Spacing

Use Tailwind's default spacing scale. Generous whitespace, especially around text blocks.

## Performance Targets

- First Contentful Paint: < 1s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Total page weight: < 100KB (before images)

Astro's default output is excellent for this. Minimal JavaScript, mostly static HTML.

## Maintenance Notes

### Regular Updates

- Update Astro and dependencies quarterly
- Check GitHub Actions still deploying correctly
- Review and update Now page monthly
- Archive old blog posts if they become outdated (add note at top)

### Content Guidelines

**For blog posts:**
- Clear, descriptive titles
- Proper headings hierarchy
- Code examples where relevant
- Link to sources and references

**For notes:**
- Can be rough, but still coherent
- Tag properly for future findability
- Date is essential (harder to search without)

**For Now page:**
- Update when focus significantly changes
- Be honest about what's actually happening
- Not a todo list, more a snapshot

### Troubleshooting Deployment

If GitHub Actions fails:
1. Check the Actions tab for error logs
2. Common issues: Node version mismatch, missing dependencies
3. Test build locally with `npm run build`
4. Ensure `astro.config.mjs` has correct `site` and `base` values

If site loads but styles broken:
- Check `base` path in config matches repository setup
- With custom domain (`swm.cc`): `base: '/'` (already correct)
- Verify the custom domain is properly configured in GitHub Pages settings

## Future Considerations

**Things to potentially add later:**
- Comments (probably not worth it; prefer email replies)
- Newsletter (maybe, but avoid complexity)
- Webmentions (nice to have, low priority)
- Photography or portfolio section (if relevant)

**Things to actively avoid:**
- Complex JavaScript frameworks for simple content
- Cookie banners (no tracking, no need)
- Aggressive SEO tactics
- Auto-posting to social media (do it manually or not at all)

## Technical Debt / Known Issues

Document any shortcuts or issues here as they arise:
- None currently (new project)

## Resources

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Derek Sivers: Now Page Movement](https://nownownow.com/about)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## Licence

Content: All rights reserved (or specify Creative Commons if preferred)
Code: MIT Licence

---

**Last updated:** 5th November 2025
**Maintained by:** Stephen McCullough
