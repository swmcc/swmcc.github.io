---
title: "Building swm.cc with Astro 5"
description: "Why I chose Astro 5, Tailwind CSS 4, and MDX for my personal site, and the architectural decisions behind a zero-JavaScript-by-default approach"
pubDate: 2025-11-01
tags: ["astro", "tailwind", "mdx", "web-performance", "architecture"]
---

## The Problem

I needed a personal site that was fast, maintainable, and reflected modern web standards. Most importantly, I wanted something I could actually update without fighting a complex build process or framework overhead.

## Why Astro 5?

**Zero-JavaScript by Default (Mostly)**

The killer feature of Astro is its Islands architecture. By default, every component ships zero JavaScript to the client. This isn't just a performance optimisation - it's a fundamental architectural decision that forces you to think about what actually needs interactivity.

That said, this site does use some JavaScript for interactive features - the theme toggle, mobile menu, and email obfuscation. But it's minimal (~3KB total) and only loaded where needed. Most pages ship almost no JavaScript.

```astro
---
// This runs at build time, never shipped to the client
const posts = await getCollection('writing');
---

<div>
  {posts.map(post => <PostCard post={post} />)}
</div>
```

Pages are server-rendered at build time. The HTML is generated once, cached indefinitely, and served instantly from GitHub Pages' CDN. No runtime rendering. No hydration waterfalls. Just HTML.

**Content Collections with TypeScript Validation**

Content Collections give you type-safe frontmatter validation. If I mess up a date format or forget a required field, TypeScript catches it at build time:

```typescript
const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional()
  })
});
```

This is crucial for a content-heavy site. I'm not discovering broken metadata in production.

**MDX Support**

MDX lets me embed interactive components in markdown when needed:

```mdx
Here's a regular paragraph.

<InteractiveDemo client:load />

And back to markdown.
```

The `client:load` directive tells Astro to hydrate that component on the client. Everything else stays static HTML.

## Why Tailwind CSS 4?

Tailwind 4 is a major shift. It's CSS-first now, not PostCSS. The new engine is written in Rust and leverages native CSS features like `@theme` and CSS custom properties.

**Performance Benefits**

- **Faster builds**: The Rust engine is significantly faster than PostCSS
- **Smaller output**: Better tree-shaking and optimisation
- **Native CSS**: No runtime processing, just standard CSS

**Developer Experience**

The utility-first approach means I'm writing HTML with inline classes rather than context-switching to separate CSS files:

```astro
<article class="prose prose-lg dark:prose-invert max-w-none">
  <h1 class="text-5xl font-bold tracking-tight">Title</h1>
</article>
```

This isn't for everyone, but for a solo developer maintaining a personal site, it's incredibly efficient.

**Dark Mode**

Tailwind 4's dark mode is implemented via CSS custom properties, making the theme toggle smooth and performant:

```css
@theme {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
}

@media (prefers-color-scheme: dark) {
  @theme {
    --color-bg: #0a0a0a;
    --color-text: #e0e0e0;
  }
}
```

## Why MDX?

MDX gives me markdown's simplicity with React/Astro component power when needed. Most content is pure markdown - simple, portable, future-proof. But when I need something interactive, I can drop in a component.

The key is restraint. Just because you *can* use components everywhere doesn't mean you should. 95% of my content is plain markdown. The 5% that needs interactivity gets it.

## Architecture Decisions

**Static Site Generation (SSG)**

Every page is generated at build time. This means:
- Sub-second page loads
- Perfect Lighthouse scores (100/100/100/100)
- No server costs beyond GitHub Pages (free)
- Works offline if cached
- Trivial to deploy

**GitHub Pages Deployment**

GitHub Actions builds the site on every push to main:

```yaml
- name: Build site
  run: npm run build

- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./dist
```

The entire build takes ~30 seconds. No complex deployment pipelines, no environment variables, no infrastructure to manage.

**Content Organisation**

Content is organised in Astro Content Collections:

```
src/content/
├── writing/     # Long-form posts
├── notes/       # Quick snippets
├── thoughts/    # Random observations
└── config.ts    # Type definitions
```

Each collection has its own schema, routes, and templates. This separation keeps things organised as the site grows.

## Performance Characteristics

**Core Web Vitals**

- **LCP (Largest Contentful Paint)**: < 0.5s
- **FID (First Input Delay)**: < 10ms (no JavaScript to block main thread)
- **CLS (Cumulative Layout Shift)**: 0 (everything is pre-rendered)

**Bundle Size**

The entire site's JavaScript (theme toggle, mobile menu) is ~3KB. Most pages ship zero JavaScript.

**Time to Interactive**

Instant. Static HTML doesn't need to hydrate.

## Trade-offs

**Build Time vs Runtime**

This architecture optimises for runtime performance at the cost of build time. Every content change requires a full rebuild. For a personal site with ~50 pages, this is fine (30 second builds). For a site with 10,000+ pages, you'd want incremental builds or a different approach.

**Dynamic Content**

There's no database, no server-side rendering of dynamic content. Everything is static. This works for a blog/portfolio site. It wouldn't work for something like a social network or dashboard.

**Comments/Interactivity**

No built-in comments system. I could add Webmentions or a third-party service, but I've chosen to just link to email instead. Less complexity, more direct communication.

## Lessons Learned

**Start Simple**

I initially considered Next.js, SvelteKit, and other frameworks. All would have worked. But Astro's simplicity - HTML files that render to HTML - meant I spent more time writing content and less time configuring build tools.

**Measure What Matters**

Lighthouse scores and Web Vitals are great, but the real metric is: can I update the site without friction? Can I write a post in markdown, push to main, and have it live in 30 seconds? Yes. That's the win.

**Zero-JavaScript is Underrated**

Most personal sites don't need JavaScript. Static HTML is faster, more accessible, more resilient, and easier to maintain. Starting from "zero JavaScript" and adding it only when necessary is a better default than the other way around.

## Thoughts: GitHub Actions for Quick Posts

I've moved on from my Twitter days. I don't have much to say about social media anymore, but in the spirit of owning my own data, I wanted a way to capture quick thoughts without the overhead of writing a full blog post.

**The Problem**

I needed a way to post quick thoughts from my phone whilst travelling or away from my desk. Creating a markdown file, committing, and pushing via mobile is tedious. I wanted something as frictionless as posting to Twitter, but with the data living on my site.

**The Solution**

A password-protected form at `/quick-thought` that triggers a GitHub Actions workflow:

```typescript
// POST to GitHub API with repository_dispatch event
await fetch('https://api.github.com/repos/swmcc/swmcc.github.io/dispatches', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
  },
  body: JSON.stringify({
    event_type: 'create-thought',
    client_payload: { slug, tags, content }
  })
});
```

The workflow creates a markdown file, commits it, and pushes to main:

```yaml
- name: Create thought file
  run: |
    SLUG="${{ github.event.client_payload.slug }}"
    CONTENT="${{ github.event.client_payload.content }}"
    DATE="$(date +'%Y-%m-%d')"
    TIME="$(date +'%H:%M')"

    echo "---" > "src/content/thoughts/${SLUG}.md"
    echo "pubDate: ${DATE}" >> "src/content/thoughts/${SLUG}.md"
    echo "pubTime: \"${TIME}\"" >> "src/content/thoughts/${SLUG}.md"
    echo "---" >> "src/content/thoughts/${SLUG}.md"
    echo "" >> "src/content/thoughts/${SLUG}.md"
    echo "$CONTENT" >> "src/content/thoughts/${SLUG}.md"

- name: Commit and push
  run: |
    git add src/content/thoughts/
    git commit -m "💭 Add thought: ${{ github.event.client_payload.slug }}"
    git push
```

GitHub Pages redeploys automatically. The entire flow takes ~2 minutes from form submission to live content.

**Why This Works**

- No backend infrastructure (serverless via GitHub Actions)
- Password is a GitHub Personal Access Token (fine-grained, repo-scoped)
- Content lives in git history (versioned, recoverable)
- Works from mobile browser
- No third-party services

This is what data ownership looks like in practice. I control the content, the infrastructure, and the workflow. Twitter can disappear tomorrow - my thoughts stay here.

## Long-Form Writing and Notes

I intend to write more long-form content in the `/writing` section - technical essays, project retrospectives, and deeper explorations of architectural decisions. The `/notes` section captures shorter snippets, TILs, and code examples that don't warrant a full article.

The content collections make this trivial:

```typescript
const writing = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional()
  })
});

const notes = defineCollection({
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional()
  })
});
```

Different schemas, different routes, same underlying Content Collections API. As the site grows, the separation keeps things organised without adding complexity.

## Conclusion

Astro 5 + Tailwind 4 + MDX gives me:
- Instant page loads
- Type-safe content
- Minimal JavaScript
- Fast builds
- Simple deployment
- Maintainable codebase

For a personal site focused on content, this stack is hard to beat. The architecture prioritises performance and simplicity over flexibility and dynamism - exactly the right trade-off for this use case.

You can view the source on [GitHub](https://github.com/swmcc/swm.cc).
