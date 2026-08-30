/**
 * swanson-api — the brain behind the Swanson widget on swm.cc.
 *
 * POST { question, history? } -> { answer }
 *
 * Cost containment, layered (see worker/README.md):
 *   1. Anthropic workspace spend limit (set in the console — the hard cap)
 *   2. Haiku only, model fixed server-side, max_tokens capped
 *   3. Global daily request budget + per-IP hourly limit (KV counters)
 *   4. Prompt caching on the system prompt (identical across requests)
 * No tools, no loops: one request in, one capped response out.
 */

const MAX_QUESTION_CHARS = 500;
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_CHARS = 1000;
const MAX_OUTPUT_TOKENS = 400;

const PERSONA = `You are Swanson, the AI alter ego of Stephen McCullough — think of yourself as Stephen 2.0: compiled, optimised and debugged. You live on his personal site, swm.cc, and your job is to help visitors find what they're after.

Voice: dry, terse, confident, quietly helpful. A little Ron Swanson, a little Northern Irish understatement. British spelling. Never gushing, never corporate.

Rules:
- Only discuss Stephen, his work, his writing and this site. Anything else gets a one-line deadpan refusal and a redirect to something on the site.
- Ground every answer in the site index below. Recommend one to three pages and give their paths (like /writing/some-essay). NEVER invent a URL that is not in the index.
- Keep answers under 120 words. Plain text only — no markdown headings, no bullets unless listing links.
- If asked who you are: you're Swanson, Stephen's digital alter ego. All his knowledge, none of the bugs, and your commits actually make sense.
- If you genuinely don't know, say so and point at /writing or /about rather than guessing.`;

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim());
  const ok = allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : allowed[0] || '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

async function bumpCounter(kv, key, ttlSeconds) {
  const current = parseInt((await kv.get(key)) || '0', 10) + 1;
  await kv.put(key, String(current), { expirationTtl: ttlSeconds });
  return current;
}

async function overBudget(request, env) {
  if (!env.SWANSON_KV) return null; // no KV bound — run uncapped (dev)
  const day = new Date().toISOString().slice(0, 10);
  const hour = new Date().toISOString().slice(0, 13);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  const daily = await bumpCounter(env.SWANSON_KV, `d:${day}`, 90000);
  if (daily > parseInt(env.DAILY_LIMIT || '300', 10)) {
    return "I've said enough for one day. Even an optimised Stephen needs downtime — browse /writing yourself, it's all there.";
  }
  const perIp = await bumpCounter(env.SWANSON_KV, `ip:${ip}:${hour}`, 7200);
  if (perIp > parseInt(env.IP_HOURLY_LIMIT || '20', 10)) {
    return "You've asked a lot of questions this hour. I respect the enthusiasm. Come back shortly, or just read /writing like it's 2009.";
  }
  return null;
}

async function fetchBrain(env) {
  const res = await fetch(env.BRAIN_URL || 'https://swm.cc/swanson-brain.json', {
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`brain fetch failed: ${res.status}`);
  return res.text();
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return json({ error: 'POST only' }, 405, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'bad JSON' }, 400, cors);
    }

    const question = String(body.question || '').slice(0, MAX_QUESTION_CHARS).trim();
    if (!question) {
      return json({ error: 'no question' }, 400, cors);
    }

    const capped = await overBudget(request, env);
    if (capped) {
      return json({ answer: capped, capped: true }, 429, cors);
    }

    const history = Array.isArray(body.history)
      ? body.history
          .slice(-MAX_HISTORY_TURNS)
          .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_CHARS) }))
      : [];

    let brain;
    try {
      brain = await fetchBrain(env);
    } catch {
      return json({ error: 'brain unavailable' }, 502, cors);
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: env.MODEL || 'claude-haiku-4-5',
        max_tokens: MAX_OUTPUT_TOKENS,
        system: [
          { type: 'text', text: PERSONA },
          {
            type: 'text',
            text: `Site index (the only pages that exist):\n${brain}`,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [...history, { role: 'user', content: question }],
      }),
    });

    if (!anthropicRes.ok) {
      // includes the case where the workspace spend cap has been hit
      return json({ error: 'model unavailable' }, 502, cors);
    }

    const data = await anthropicRes.json();
    const answer = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    return json({ answer: answer || "I've nothing to say to that. Try /writing." }, 200, cors);
  },
};
