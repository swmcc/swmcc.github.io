---
title: "Cloudflare's cacheTtl Caches Your Failures Too"
pubDate: 2026-08-30T00:00:00.000Z
tags:
  - cloudflare-workers
  - caching
  - gotcha
---

While building [Swanson](/projects/giving-swm-cc-a-brain), the AI concierge on this site, I gave the Worker what looked like a perfectly sensible fetch:

```javascript
const res = await fetch('https://swm.cc/swanson-brain.json', {
  cf: { cacheTtl: 3600, cacheEverything: true },
});
```

Fetch the knowledge file, cache it at the edge for an hour, save money and latency. Lovely.

Here is what the documentation does not shout about: `cacheTtl` applies to whatever response comes back, including errors. My Worker went live a few minutes before the site deploy that actually created `/swanson-brain.json`. Its first fetch got a 404 from GitHub Pages, Cloudflare dutifully cached that 404 for 3,600 seconds, and Swanson spent his first hour in production answering every question with a fallback message while the file sat there, deployed, public, and completely ignored.

The fix is `cacheTtlByStatus`, which lets you cache successes and refuse to cache anything else:

```javascript
const res = await fetch('https://swm.cc/swanson-brain.json', {
  cf: {
    cacheEverything: true,
    cacheTtlByStatus: { '200-299': 3600, '300-599': 0 },
  },
});
```

Two follow-on lessons from the same incident:

1. A poisoned entry does not care that you fixed the config. `cacheTtlByStatus` governs new writes, not the entry already sitting in the cache, so the cached 404 kept being served after the fix deployed. I added a cache-busting query parameter driven by an environment variable, so a poisoned entry can be evicted by bumping one value and redeploying.
2. Deploy order matters less if failures are never cached. The whole problem only existed because the Worker and the site deployed minutes apart. With `cacheTtlByStatus` in place from the start, the window would have healed itself on the next request.

Ten lines of config, one bad hour, and a rule I will not forget: never let an edge cache remember your worst moment for an hour.
