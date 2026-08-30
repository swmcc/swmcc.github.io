# swanson-api

The Cloudflare Worker behind the Swanson overlay (header icon, every page).
Holds the Anthropic key, injects the site knowledge (`/swanson-brain.json` —
metadata plus the FULL TEXT of every essay, note and project write-up,
~60k tokens) into a cached system prompt, and answers with Haiku. Swanson
can therefore actually discuss the content — summarise essays, explain how
the projects work — not just link to it. The widget falls back to canned
answers (`public/swanson-qa.json`) whenever this worker is absent, capped
or unreachable — the site never depends on it.

## Cost containment (in order of authority)

1. **Anthropic workspace spend limit** — create a dedicated workspace +
   API key at console.anthropic.com and set a monthly spend cap (£10 is
   plenty). Enforced by Anthropic server-side: the bill *cannot* exceed it.
2. Model fixed to Haiku, `max_tokens` 640, question truncated to 500 chars.
3. Global cap of 300 requests/day + 20/hour per IP (KV counters). Beyond
   either, visitors get a polite in-character brush-off, costing nothing.
4. The system prompt is identical on every request → Anthropic prompt
   caching makes the ~60k-token site-knowledge block ~90% cheaper after
   the first hit (cache reads, not full-price input).

With full content in the prompt a request costs roughly a penny. A month
of the daily cap maxed out every single day would exceed a £10 workspace
cap — at which point Anthropic refuses further requests and Swanson naps
until the 1st. That is the design working, not failing: the workspace cap
is the ceiling, the KV caps just keep ordinary abuse from reaching it.
Realistic personal-site traffic: pence per month.

## Deploy (one-off, ~5 minutes)

```bash
cd worker
npx wrangler login
npx wrangler kv namespace create SWANSON_KV   # paste id into wrangler.toml
npx wrangler secret put ANTHROPIC_API_KEY      # the capped workspace key
npx wrangler deploy                            # note the *.workers.dev URL
```

Then point the site at it — in the repo root:

```bash
echo 'PUBLIC_SWANSON_API=https://swanson-api.<your-subdomain>.workers.dev' >> .env
```

and add the same variable to the GitHub Actions build (repo → Settings →
Secrets and variables → Actions → Variables) so production builds get it.
No variable set → the widget quietly uses canned answers.

## Local dev

```bash
cd worker && npx wrangler dev        # serves on http://localhost:8787
```

The Astro dev server defaults `PUBLIC_SWANSON_API` to
`http://localhost:8787`, so `make local.run` + `wrangler dev` just works.
