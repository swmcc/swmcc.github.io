import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { getRecentEntries, KIND_LABEL, updatedAfter } from '../utils/recent';

// Site knowledge consumed by the Swanson worker (worker/): metadata AND the
// full text of every essay, note and project write-up, so Swanson can
// actually discuss the content rather than just point at it. Regenerated on
// every build, so Swanson learns new content on deploy without the worker
// being touched. Kept affordable by Anthropic prompt caching (the whole
// blob rides in a cached system block).
const MAX_BODY_CHARS = 12000;

const body = (entry: { body?: string }) =>
  (entry.body ?? '').trim().slice(0, MAX_BODY_CHARS);

export const GET: APIRoute = async () => {
  const [writing, notes, projects, nowPages] = await Promise.all([
    getCollection('writing'),
    getCollection('notes'),
    getCollection('projects'),
    getCollection('now'),
  ]);

  const byDate = (a: any, b: any) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

  const recent = await getRecentEntries(10);

  const brain = {
    generatedAt: new Date().toISOString(),
    // newest changes across the whole site, so "what's new?" has a definite answer
    // `date` is when it was published; `updated` (when present) is a later edit
    recent: recent.map((e) => ({
      kind: KIND_LABEL[e.kind],
      title: e.title,
      date: e.date.toISOString().slice(0, 10),
      ...(e.updated ? { updated: e.updated.toISOString().slice(0, 10) } : {}),
      url: e.href,
    })),
    about: {
      name: 'Stephen McCullough',
      role: 'Software engineer and founder',
      location: 'Northern Ireland',
      site: 'https://swm.cc',
      pages: {
        '/about': 'Who Stephen is',
        '/now': "What he's focused on right now",
        '/writing': 'Essays — longer-form writing',
        '/notes': 'Short technical notes and TILs',
        '/projects': 'Project write-ups',
        '/codin': 'Live GitHub activity',
        '/eatin': "This week's meal plan (syndicated from Grub)",
        '/readin': "What he's reading",
        '/listenin': "What he's listening to",
        '/changin': "What's new on the site, newest first",
        '/colophon': 'How this site is built',
      },
    },
    now: (() => {
      // the now collection keeps history — Swanson only gets the newest
      const current = [...nowPages].sort(
        (a, b) => b.data.updatedDate.valueOf() - a.data.updatedDate.valueOf()
      )[0];
      return current
        ? { updated: current.data.updatedDate.toISOString().slice(0, 10), text: body(current) }
        : null;
    })(),
    writing: writing
      .filter((p) => !p.data.draft)
      .sort(byDate)
      .map((p) => ({
        title: p.data.title,
        description: p.data.description,
        tags: p.data.tags ?? [],
        date: p.data.pubDate.toISOString().slice(0, 10),
        url: `/writing/${p.id}`,
        body: body(p),
      })),
    notes: notes.sort(byDate).map((n) => ({
      title: n.data.title,
      tags: n.data.tags ?? [],
      date: n.data.pubDate.toISOString().slice(0, 10),
      url: `/notes/${n.id}`,
      body: body(n),
    })),
    projects: projects.sort(byDate).map((p) => {
      const updated = updatedAfter(p.filePath, p.data.pubDate);
      return {
        title: p.data.title,
        description: p.data.description,
        tags: p.data.tags ?? [],
        date: p.data.pubDate.toISOString().slice(0, 10),
        ...(updated ? { updated: updated.toISOString().slice(0, 10) } : {}),
        url: `/projects/${p.id}`,
        body: body(p),
      };
    }),
  };

  return new Response(JSON.stringify(brain, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
