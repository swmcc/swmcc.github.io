---
title: "Rate Limiting a Cloudflare Worker with Nothing but KV"
pubDate: 2026-08-30T00:00:00.000Z
tags:
  - cloudflare-workers
  - kv
  - rate-limiting
  - cost-engineering
---

[Swanson](/projects/giving-swm-cc-a-brain), the AI on this site, is a public, unauthenticated endpoint that spends my money on every request. Before it went anywhere near production I wanted two budgets enforced at the edge: a global cap per day, and a per-visitor cap per hour.

Cloudflare has a proper rate-limiting product, but for a personal site the free tier of Workers KV does the job in about fifteen lines:

```javascript
async function bumpCounter(kv, key, ttlSeconds) {
  const current = parseInt((await kv.get(key)) || '0', 10) + 1;
  await kv.put(key, String(current), { expirationTtl: ttlSeconds });
  return current;
}

async function overBudget(request, env) {
  const day = new Date().toISOString().slice(0, 10);
  const hour = new Date().toISOString().slice(0, 13);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  const daily = await bumpCounter(env.KV, `d:${day}`, 90000);
  if (daily > 100) return 'daily cap hit';

  const perIp = await bumpCounter(env.KV, `ip:${ip}:${hour}`, 7200);
  if (perIp > 20) return 'hourly cap hit';

  return null;
}
```

The keys encode their own window (`d:2026-08-30`, `ip:1.2.3.4:2026-08-30T14`), and `expirationTtl` means old counters delete themselves. No cron, no cleanup, no state beyond the counters.

The honest caveat: KV is eventually consistent, and the read-increment-write is not atomic. Two simultaneous requests can both read 99 and both write 100. This is a budget fence, not a precision instrument. For my purposes that is exactly right, because the caps exist to stop a runaway bill, not to be fair to the nearest request. The hard guarantee lives a layer up anyway, as a spend limit on the API account itself, enforced by the provider's billing system rather than my code.

One more trick worth stealing: when a cap trips, return a response in the product's own voice instead of a bare 429. Swanson tells over-eager visitors: "You've asked a lot of questions this hour. I respect the enthusiasm. Come back shortly, or just read /writing like it's 2009." A rate limit that makes people smile costs nothing extra.
