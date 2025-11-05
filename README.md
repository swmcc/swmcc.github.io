# swm.cc

Personal website for Stephen McCullough, built with Astro and deployed to GitHub Pages.

## Features

- 📝 Blog and notes sections with Markdown support
- 🌓 Dark/light mode toggle with system preference detection
- 🎨 Clean, minimalist design using Tailwind CSS
- 🚀 Fast loading with minimal JavaScript
- 📱 Fully responsive
- 📡 RSS feed for blog posts and notes
- 🗺️ Automatic sitemap generation
- 🔍 SEO optimised with meta tags and Open Graph support

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) to see the site.

### Build

```bash
npm run build
```

The built site will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Content Management

### Adding a Blog Post

Create a new Markdown file in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
description: "Brief description for SEO"
pubDate: 2025-11-05
tags: ["typescript", "astro"]
---

Your content here...
```

### Adding a Note

Create a new Markdown file in `src/content/notes/`:

```markdown
---
title: "Quick Note About X"
pubDate: 2025-11-05
tags: ["javascript"]
---

Brief content...
```

### Updating the Now Page

Edit `src/content/now/current.md`:

```markdown
---
updatedDate: 2025-11-05
---

## What I'm up to

Currently working on...
```

## Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch.

### Initial Setup

1. Go to your GitHub repository Settings → Pages
2. Under "Build and deployment", select "GitHub Actions"
3. Under "Custom domain", enter `swm.cc`
4. Ensure DNS is configured with a CNAME record pointing to your GitHub Pages URL

## Project Structure

```
/
├── .github/workflows/   # GitHub Actions deployment
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable Astro components
│   ├── content/         # Markdown content
│   │   ├── blog/
│   │   ├── notes/
│   │   └── now/
│   ├── layouts/         # Page layouts
│   ├── pages/           # Routes (becomes URLs)
│   ├── styles/          # Global styles
│   └── utils/           # Helper functions
├── astro.config.mjs     # Astro configuration
├── claude.md            # Project documentation
└── package.json
```

## Technical Details

- **Framework**: Astro v5
- **Styling**: Tailwind CSS v4
- **Content**: Markdown with frontmatter
- **Deployment**: GitHub Pages via GitHub Actions
- **Domain**: swm.cc (custom domain)

## Development Notes

See `claude.md` for detailed project documentation, including:
- Architecture decisions
- Content workflow
- Maintenance guidelines
- Troubleshooting

## Licence

Content: All rights reserved
Code: MIT Licence
