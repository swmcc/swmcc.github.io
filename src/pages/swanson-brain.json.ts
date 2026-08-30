import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

// Lean site index consumed by the Swanson worker (worker/): everything the
// model needs to recommend and link content, none of the full article
// bodies. Regenerated on every build, so Swanson learns new content on
// deploy without the worker being touched.
export const GET: APIRoute = async () => {
  const [writing, notes, projects, nowPages] = await Promise.all([
    getCollection('writing'),
    getCollection('notes'),
    getCollection('projects'),
    getCollection('now'),
  ]);

  const byDate = (a: any, b: any) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

  const brain = {
    generatedAt: new Date().toISOString(),
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
        '/colophon': 'How this site is built',
      },
    },
    now: nowPages[0]?.body?.trim() ?? null,
    writing: writing
      .filter((p) => !p.data.draft)
      .sort(byDate)
      .map((p) => ({
        title: p.data.title,
        description: p.data.description,
        tags: p.data.tags ?? [],
        date: p.data.pubDate.toISOString().slice(0, 10),
        url: `/writing/${p.id}`,
      })),
    notes: notes.sort(byDate).map((n) => ({
      title: n.data.title,
      tags: n.data.tags ?? [],
      date: n.data.pubDate.toISOString().slice(0, 10),
      url: `/notes/${n.id}`,
    })),
    projects: projects.sort(byDate).map((p) => ({
      title: p.data.title,
      description: p.data.description,
      tags: p.data.tags ?? [],
      url: `/projects/${p.id}`,
    })),
  };

  return new Response(JSON.stringify(brain, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
