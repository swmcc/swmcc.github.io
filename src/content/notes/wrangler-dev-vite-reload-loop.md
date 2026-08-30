---
title: "When wrangler dev Fights Your Dev Server"
pubDate: 2026-08-30T00:00:00.000Z
tags:
  - cloudflare-workers
  - wrangler
  - astro
  - vite
  - gotcha
---

The strangest bug from building [Swanson](/projects/giving-swm-cc-a-brain): in local development, every time the AI answered a question, the page reloaded and closed the chat overlay just before the reply landed. The act of answering destroyed the audience.

Nothing was wrong with the form, the fetch, or the response. I proved it by firing a request at the Worker from a plain terminal with no browser involved at all, and the page *still* reloaded. That narrowed it down beautifully: whatever caused the reload lived server-side.

The chain, once found, was obvious in hindsight:

1. `wrangler dev` runs your Worker locally via miniflare, which persists its simulated KV and cache state to disk on every request.
2. That state lives in `.wrangler/` inside the Worker's directory, which in my repo sits at `worker/`, inside the project.
3. Astro's dev server (Vite underneath) watches the project for file changes.
4. Worker handles a request, miniflare writes state, Vite sees files change, and broadcasts a full page reload to every connected browser.

So each answer literally triggered its own teardown. My favourite part is that it only happens when things *work*: a failing Worker writes nothing and reloads nothing.

The fix is one stanza in `astro.config.mjs`:

```javascript
vite: {
  server: {
    watch: {
      ignored: ['**/worker/**'],
    },
  },
},
```

The same applies to any file-watching dev server (Vite, webpack, whatever Next is doing this year) sharing a repo with `wrangler dev`. If your local pages reload for no visible reason, check what is quietly writing files inside the watch root. It is usually somebody's state directory.
