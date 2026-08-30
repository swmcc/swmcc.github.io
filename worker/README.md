# swanson-api

The Cloudflare Worker behind the Swanson widget on the homepage. Holds the
Anthropic key, injects the site index (`/swanson-brain.json`) into a cached
system prompt, and answers with Haiku. The widget falls back to canned
answers (`public/swanson-qa.json`) whenever this worker is absent, capped
or unreachable — the site never depends on it.

## Cost containment (in order of authority)

1. **Anthropic workspace spend limit** — create a dedicated workspace +
   API key at console.anthropic.com and set a monthly spend cap (£10 is
   plenty). Enforced by Anthropic server-side: the bill *cannot* exceed it.
2. Model fixed to Haiku, `max_tokens` 400, question truncated to 500 chars.
3. Global cap of 300 requests/day + 20/hour per IP (KV counters). Beyond
   either, visitors get a polite in-character brush-off, costing nothing.
4. The system prompt is identical on every request → Anthropic prompt
   caching makes the big site-index block ~90% cheaper after the first hit.

Worst case with all caps at defaults: roughly £10–12/month, which is why
the workspace cap at £10 makes the whole question moot. Realistic personal
site traffic: pence.

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
