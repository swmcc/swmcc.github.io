import type { APIRoute } from 'astro';
import { getRecentEntries, KIND_LABEL } from '../utils/recent';

// The site's recent-changes feed as JSON. Swanson answers "What's new?" from
// this directly in the browser (no model call), and it's handy for anything
// else that wants to know what changed. Same source as the homepage section.
export const GET: APIRoute = async () => {
  const entries = await getRecentEntries(10);
  return new Response(
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      entries: entries.map((e) => ({
        kind: e.kind,
        label: KIND_LABEL[e.kind],
        title: e.title,
        url: e.href,
        date: e.date.toISOString().slice(0, 10),
        ...(e.description ? { description: e.description } : {}),
      })),
    }),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
