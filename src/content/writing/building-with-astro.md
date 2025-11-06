---
title: "Building a Personal Site with Astro"
description: "Why I chose Astro for my personal website and what I learned in the process"
pubDate: 2025-11-05
tags: ["astro", "web development", "meta"]
---

After years of having various iterations of personal websites (and letting them languish), I decided to rebuild from scratch with Astro. Here's why and what I learned.

## Why Astro?

I've built sites with Next.js, Gatsby, and plain HTML/CSS over the years. Each has its strengths, but for a personal site that's primarily static content, Astro hits a sweet spot:

1. **Speed by default** - Ships minimal JavaScript unless you explicitly need it
2. **Content-focused** - Built-in support for Markdown and content collections
3. **Flexible** - Can use React, Vue, or other frameworks when needed
4. **Simple deployment** - Static output works anywhere

## The Setup

The project structure is straightforward:

```typescript
/
├── src/
│   ├── content/     // Markdown content
│   ├── layouts/     // Page layouts
│   ├── components/  // Reusable components
│   └── pages/       // Routes
└── public/          // Static assets
```

Content collections make it easy to define schemas for different types of content (blog posts, notes, etc.) and get TypeScript validation for free.

## What I Like

**Content workflow is excellent.** Write Markdown, commit, push, done. No CMS, no database, no complexity.

**Performance is genuinely good.** The homepage loads in under a second on a 3G connection. That's without any optimisation beyond Astro's defaults.

**Dark mode was trivial.** A bit of CSS custom properties and localStorage. No heavy theme provider or context needed.

## What Could Be Better

**TypeScript strictness can be overzealous.** Sometimes the content collection types get in the way when you know what you're doing.

**The docs assume familiarity with build tools.** If you're coming from a simple HTML/CSS background, the learning curve might be steeper than necessary.

## Lessons Learned

1. **Start with content.** I wrote the About and Now pages before styling anything. Helped clarify what the site actually needed to do.

2. **Resist adding features.** My first draft had tags, categories, search, and analytics. Stripped it all back. Can always add later if needed.

3. **Automate deployment early.** Set up GitHub Actions from day one. Removes friction from publishing.

## Would I Recommend It?

For a personal site focused on writing? Absolutely. For a complex web app? Probably not the right tool.

Astro excels at what it's designed for: content-heavy sites that should be fast and simple to maintain. That's exactly what I needed.

---

*If you're interested in the implementation details, the source code is [on GitHub](https://github.com/swmcc/swmcc.github.io).*
