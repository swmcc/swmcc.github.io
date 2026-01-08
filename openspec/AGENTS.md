# AI Agent Workflows for swm.cc

Quick reference and guidelines for AI agents working on this codebase.

## Quick Reference Commands

```bash
# Development
make local.install          # Install dependencies
make local.run             # Start dev server at localhost:4321
make local.build           # Build for production
npm run test               # Run E2E tests

# Content creation
make content.writing       # New blog post (interactive)
make content.note          # New note (interactive)
make content.thought       # New thought (interactive)

# Deployment
git push origin main       # Triggers GitHub Pages deploy
```

## Key Files

| File | Purpose |
|------|---------|
| `src/content/config.ts` | Content collection schemas (Zod) |
| `src/layouts/BaseLayout.astro` | Main page layout |
| `src/components/Header.astro` | Site navigation |
| `src/components/Footer.astro` | Site footer |
| `src/components/BaseHead.astro` | SEO meta tags |
| `src/styles/global.css` | Global styles and CSS variables |
| `astro.config.mjs` | Astro configuration |
| `playwright.config.ts` | E2E test configuration |
| `Makefile` | Development and content commands |

## Content Locations

| Content Type | Location | Schema |
|--------------|----------|--------|
| Blog posts | `src/content/writing/*.md` | title, description, pubDate, tags?, draft? |
| Notes | `src/content/notes/*.md` | title, pubDate, tags? |
| Thoughts | `src/content/thoughts/*.md` | pubDate, pubTime?, tags? |
| Projects | `src/content/projects/*.md` | title, description, pubDate, tags? |
| Now page | `src/content/now/current.md` | updatedDate |
| Reading list | `src/data/reading.yaml` | YAML format |

## Implementation Guidelines

### Adding New Pages

1. Create page in `src/pages/` directory
2. Use `BaseLayout` for consistent structure
3. Add navigation link in `src/components/Header.astro`
4. Add E2E test in `tests/site.spec.ts`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Page Title" description="Page description for SEO">
  <h1>Page Title</h1>
  <!-- Content -->
</BaseLayout>
```

### Adding New Components

1. Create in `src/components/` with `.astro` extension
2. Use TypeScript interface for Props
3. Use scoped styles or Tailwind utilities
4. Ensure dark mode support via CSS variables

```astro
---
interface Props {
  variant?: 'primary' | 'secondary';
}

const { variant = 'primary' } = Astro.props;
---

<div class:list={['component', variant]}>
  <slot />
</div>

<style>
  .component {
    background: var(--color-bg-secondary);
    color: var(--color-text);
  }
</style>
```

### Adding Content

**Blog Post (Writing):**
```bash
# Use Makefile helper
make content.writing

# Or manually create src/content/writing/my-post.md
```

Required frontmatter:
```yaml
---
title: "Post Title"
description: "SEO description"
pubDate: 2025-01-08
tags: ["tag1", "tag2"]
---
```

**Note:**
```bash
make content.note
```

Required frontmatter:
```yaml
---
title: "Note Title"
pubDate: 2025-01-08
tags: ["tag"]
---
```

**Thought:**
```bash
make content.thought
```

Required frontmatter:
```yaml
---
pubDate: 2025-01-08
pubTime: "14:30"
---
```

### Modifying Styles

- Global CSS variables in `src/styles/global.css`
- Theme colors defined with `--color-*` prefix
- Always support both light and dark modes
- Use Tailwind for layout, CSS variables for colors

Key CSS variables:
```css
--color-bg
--color-bg-secondary
--color-text
--color-text-secondary
--color-text-heading
--color-text-muted
--color-accent
--color-border
```

### Testing Changes

1. Run dev server: `make local.run`
2. Test in browser at `http://localhost:4321`
3. Check dark mode toggle
4. Test on mobile viewport
5. Run E2E tests: `npm run test`

### Pre-Commit Checklist

- [ ] Build succeeds: `make local.build`
- [ ] E2E tests pass: `npm run test`
- [ ] Dark mode works correctly
- [ ] Mobile responsive
- [ ] Images have alt text
- [ ] Heading hierarchy correct

## Common Tasks

### Update Now Page

Edit `src/content/now/current.md`:
```yaml
---
updatedDate: 2025-01-08
---

Current activities...
```

### Add Book to Reading List

Edit `src/data/reading.yaml`:
```yaml
- title: "Book Title"
  author: "Author Name"
  status: "reading"  # or "finished", "want-to-read"
  cover: "/covers/book-cover.jpg"  # optional
```

### Add Project Documentation

Create `src/content/projects/project-name.md`:
```yaml
---
title: "Project Name"
description: "What this project does"
pubDate: 2025-01-08
tags: ["ruby", "rails"]
---

Project content...
```

### Fix Dark Mode Issues

Check these files:
- `src/layouts/BaseLayout.astro` - Theme init script
- `src/components/ThemeToggle.astro` - Toggle logic
- `src/styles/global.css` - CSS variable definitions

### Add Navigation Link

Edit `src/components/Header.astro`:
```astro
<a href="/new-page" class="nav-link">New Page</a>
```

## Error Resolution

### Build Fails

1. Check Astro type errors: `make local.check`
2. Verify frontmatter matches schema in `src/content/config.ts`
3. Check for missing imports in components

### Tests Fail

1. Ensure site builds: `make local.build`
2. Check if routes changed (update tests)
3. Review test output for specific failures

### Styles Not Applying

1. Check CSS variable definitions in `global.css`
2. Verify dark mode class (`.dark`) handling
3. Clear browser cache and `.astro` cache

## Git Workflow

1. Create feature branch from main
2. Make changes
3. Build and test locally
4. Commit with gitmoji: `:sparkles: Add new feature`
5. Push to remote
6. Create PR (if applicable) or merge to main
7. GitHub Actions deploys automatically
