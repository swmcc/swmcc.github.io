# Project: swm.cc

Personal website for Stephen McCullough - a modern, high-performance static site built with Astro.

## Overview

A personal website featuring blog posts (writing), technical notes, quick thoughts, project documentation, and a "now" page. Built with a focus on performance, accessibility, and modern web standards.

**Live site:** https://swm.cc

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Astro | v5 |
| Language | TypeScript | - |
| Styling | Tailwind CSS | v4 |
| Content | Markdown/MDX | - |
| Testing | Playwright | E2E |
| Deployment | GitHub Pages | via Actions |

### Key Dependencies

- `@astrojs/mdx` - MDX support for rich content
- `@astrojs/rss` - RSS feed generation
- `@astrojs/sitemap` - Automatic sitemap generation
- `@tailwindcss/vite` - Tailwind CSS v4 Vite plugin

## Architecture

```
src/
├── components/       # Reusable Astro components
│   ├── Header.astro
│   ├── Footer.astro
│   ├── BaseHead.astro
│   ├── ThemeToggle.astro
│   ├── ReadingProgress.astro
│   ├── GitHubActivity.astro
│   ├── SpotifyActivity.astro
│   ├── ReadingActivity.astro
│   └── Terminal/     # Interactive terminal feature
├── content/          # Markdown content collections
│   ├── config.ts     # Content collection schemas
│   ├── writing/      # Long-form blog posts
│   ├── notes/        # Short technical notes
│   ├── thoughts/     # Quick microblog thoughts
│   ├── projects/     # Project documentation
│   └── now/          # Now page content
├── data/             # Static data files
│   └── reading.yaml  # Book reading list
├── layouts/          # Page layouts
│   ├── BaseLayout.astro
│   ├── WritingPost.astro
│   └── NoteLayout.astro
├── pages/            # Route pages
│   ├── index.astro
│   ├── about.astro
│   ├── now.astro
│   ├── projects.astro
│   ├── colophon.astro
│   ├── writing/
│   ├── notes/
│   ├── thoughts/
│   └── rss.xml.js
├── styles/           # Global styles
│   └── global.css
└── utils/            # Helper functions
    └── formatDate.ts
```

### Content Collections

Content is managed via Astro's Content Collections with Zod schema validation:

| Collection | Purpose | Schema Fields |
|------------|---------|---------------|
| `writing` | Long-form blog posts | title, description, pubDate, updatedDate?, tags?, draft? |
| `notes` | Short technical notes | title, pubDate, tags? |
| `thoughts` | Microblog posts | pubDate, pubTime?, tags? |
| `projects` | Project documentation | title, description, pubDate, tags? |
| `now` | Current activities | updatedDate, archived?, month?, year? |

## Git Commit Conventions

Use [gitmoji](https://gitmoji.dev/) format for commit messages:

| Emoji | Code | Purpose |
|-------|------|---------|
| :sparkles: | `:sparkles:` | New feature |
| :bug: | `:bug:` | Bug fix |
| :memo: | `:memo:` | Documentation |
| :lipstick: | `:lipstick:` | UI/style changes |
| :recycle: | `:recycle:` | Refactoring |
| :rocket: | `:rocket:` | Deployment |
| :lock: | `:lock:` | Security fix |
| :construction: | `:construction:` | Work in progress |
| :white_check_mark: | `:white_check_mark:` | Add/update tests |
| :building_construction: | `:building_construction:` | Architecture changes |
| :arrow_up: | `:arrow_up:` | Upgrade dependencies |
| :books: | `:books:` | Content updates (writing/notes) |

### Example Commit Messages

```
:sparkles: Add reading list page with book covers
:bug: Fix dark mode flash on page load
:memo: Update now page with current projects
:lipstick: Improve mobile navigation styling
:white_check_mark: Add E2E tests for new pages
```

## Code Conventions

### Astro Components

- Use `.astro` extension for all components
- TypeScript for frontmatter with interface Props
- Scoped styles within component files
- Use CSS custom properties for theming

```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<article class="card">
  <h2>{title}</h2>
  {description && <p>{description}</p>}
</article>

<style>
  .card {
    background: var(--color-bg-secondary);
  }
</style>
```

### CSS/Styling

- Use Tailwind utility classes for layout/spacing
- CSS custom properties for colors (theming)
- Semantic HTML elements (`<article>`, `<section>`, etc.)
- Mobile-first responsive design
- Support `prefers-reduced-motion`

### Content Frontmatter

Writing (blog posts):
```yaml
---
title: "Your Post Title"
description: "Brief description for SEO"
pubDate: 2025-11-05
tags: ["typescript", "astro"]
draft: false  # optional
---
```

Notes:
```yaml
---
title: "Quick Note Title"
pubDate: 2025-11-05
tags: ["git", "productivity"]
---
```

Thoughts:
```yaml
---
pubDate: 2025-11-05
pubTime: "18:30"
tags: ["meta"]
---
```

## Commands

### Development

| Command | Description |
|---------|-------------|
| `make local.install` | Install dependencies |
| `make local.run` | Start dev server (localhost:4321) |
| `make local.build` | Build for production |
| `make local.preview` | Preview production build |
| `make local.check` | Run Astro type checking |
| `make local.clean` | Clean build artifacts |

### Testing

| Command | Description |
|---------|-------------|
| `npm run test` | Run Playwright E2E tests |
| `npm run test:ui` | Run tests with Playwright UI |

### Content Creation

| Command | Description |
|---------|-------------|
| `make content.writing` | Create new blog post |
| `make content.note` | Create new note |
| `make content.thought` | Create new thought |

### Deployment

| Command | Description |
|---------|-------------|
| `make production.deploy` | Push to main (triggers deploy) |
| `make production.logs` | View recent GitHub Actions runs |
| `make production.status` | View current deployment status |

## Performance Targets

- First Contentful Paint: < 1s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Total page weight: < 100KB (before images)

## Accessibility Requirements

- WCAG 2.1 AA compliance
- Proper heading hierarchy (h1 -> h2 -> h3)
- Alt text for all images
- Keyboard navigation support
- Color contrast > 4.5:1
- Respect `prefers-reduced-motion`
- ARIA labels for interactive elements
