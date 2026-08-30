// Tag-derived marks for writing and notes cards.
// Same visual language as the hand-drawn project icons in public/projects:
// 64-unit box, 3px currentColor strokes, no fills.

const S = 'stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"';
const wrap = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">${inner}</svg>`;

export const MARKS = {
  ai: wrap(`<path ${S} d="M32 10l4 12 12 4-12 4-4 12-4-12-12-4 12-4z"/><path ${S} d="M50 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path ${S} d="M14 44l1.5 3.5L19 49l-3.5 1.5L14 54l-1.5-3.5L9 49l3.5-1.5z"/>`),
  python: wrap(`<path ${S} d="M32 12c-8 0-12 3-12 8v6h12v2H16c-5 0-8 4-8 10s3 10 8 10h4v-6c0-4 3-8 8-8h12c4 0 8-3 8-8v-6c0-5-4-8-16-8z"/><path ${S} d="M32 52c8 0 12-3 12-8v-6H32"/><circle cx="26" cy="18" r="1.5" fill="currentColor"/><circle cx="38" cy="46" r="1.5" fill="currentColor"/>`),
  ruby: wrap(`<path ${S} d="M20 12h24l12 14-24 28L8 26z"/><path ${S} d="M8 26h48M20 12l12 14 12-14M32 26v28"/>`),
  web: wrap(`<rect ${S} x="8" y="12" width="48" height="40" rx="4"/><path ${S} d="M8 22h48M16 17h2M23 17h2"/><path ${S} d="M26 32l-6 6 6 6M38 32l6 6-6 6"/>`),
  cache: wrap(`<path ${S} d="M32 10l22 10-22 10-22-10z"/><path ${S} d="M10 32l22 10 22-10M10 44l22 10 22-10"/>`),
  git: wrap(`<circle ${S} cx="18" cy="14" r="5"/><circle ${S} cx="18" cy="50" r="5"/><circle ${S} cx="46" cy="22" r="5"/><path ${S} d="M18 19v26M46 27c0 10-28 6-28 16"/>`),
  test: wrap(`<path ${S} d="M24 10h16M28 10v14L14 48c-2 3 0 6 3 6h30c3 0 5-3 3-6L36 24V10"/><path ${S} d="M20 40h24"/>`),
  code: wrap(`<path ${S} d="M22 14c-6 0-6 4-6 8v4c0 4-4 6-6 6 2 0 6 2 6 6v4c0 4 0 8 6 8M42 14c6 0 6 4 6 8v4c0 4 4 6 6 6-2 0-6 2-6 6v4c0 4 0 8-6 8"/>`),
  photo: wrap(`<rect ${S} x="8" y="14" width="48" height="36" rx="4"/><circle ${S} cx="24" cy="26" r="4"/><path ${S} d="M8 44l14-12 10 8 8-6 16 12"/>`),
  lock: wrap(`<rect ${S} x="14" y="28" width="36" height="26" rx="4"/><path ${S} d="M22 28v-8a10 10 0 0120 0v8"/><circle cx="32" cy="41" r="3" fill="currentColor"/>`),
  package: wrap(`<path ${S} d="M32 8l22 12v24L32 56 10 44V20z"/><path ${S} d="M10 20l22 12 22-12M32 32v24"/>`),
  doc: wrap(`<path ${S} d="M16 8h22l10 10v38H16z"/><path ${S} d="M38 8v10h10M24 30h16M24 40h16"/>`),
} as const;

export type MarkKey = keyof typeof MARKS;

// First rule that matches any of the entry's tags wins, so order is deliberate:
// a Python note about caching files under caching, a Rails note about AI under AI.
const RULES: Array<[MarkKey, string[]]> = [
  ['cache', ['caching', 'cloudflare-workers', 'gotcha', 'architecture', 'asgi']],
  ['test', ['testing', 'cypress', 'playwright', 'e2e']],
  ['git', ['git', 'productivity', 'git-worktrees']],
  ['photo', ['photos', 'macos']],
  ['lock', ['oauth', 'auth', 'authentication']],
  ['ai', ['agentic-development', 'orchestration', 'claude', 'claude-code', 'ai', 'llm', 'ollama', 'rag', 'parsing', 'workflow', 'cost', 'multi-model']],
  ['ruby', ['rails', 'ruby', 'hotwire']],
  ['python', ['python', 'fastapi', 'sse']],
  ['code', ['typescript']],
  ['web', ['astro', 'web', 'github-actions', 'automation', 'web-performance']],
  ['package', ['open-source']],
];

export function markFor(tags: string[] = []): string {
  const lower = tags.map((t) => t.toLowerCase());
  for (const [key, list] of RULES) {
    if (list.some((t) => lower.includes(t))) return MARKS[key];
  }
  return MARKS.doc;
}
