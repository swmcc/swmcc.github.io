import { getCollection } from 'astro:content';

// One merged, date-sorted feed of everything that changes on the site.
// Used by the homepage "Recently" section, /whats-new.json, and Swanson's brain,
// so all three agree on what "new" means.

export type RecentKind = 'essay' | 'note' | 'project' | 'now';

export interface RecentEntry {
  kind: RecentKind;
  title: string;
  href: string;
  date: Date;
  description?: string;
}

export const KIND_LABEL: Record<RecentKind, string> = {
  essay: 'Essay',
  note: 'Note',
  project: 'Project',
  now: 'Now',
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export async function getRecentEntries(limit = 8): Promise<RecentEntry[]> {
  const [writing, notes, projects, nowPages] = await Promise.all([
    getCollection('writing'),
    getCollection('notes'),
    getCollection('projects'),
    getCollection('now'),
  ]);

  const entries: RecentEntry[] = [
    ...writing
      .filter((p) => !p.data.draft)
      .map((p) => ({ kind: 'essay' as const, title: p.data.title, href: `/writing/${p.id}`, date: p.data.pubDate, description: p.data.description })),
    ...notes.map((n) => ({ kind: 'note' as const, title: n.data.title, href: `/notes/${n.id}`, date: n.data.pubDate })),
    ...projects.map((p) => ({ kind: 'project' as const, title: p.data.title, href: `/projects/${p.id}`, date: p.data.pubDate, description: p.data.description })),
    ...nowPages.map((n) => {
      const d = n.data.updatedDate;
      const month = n.data.month ?? MONTHS[d.getUTCMonth()];
      const year = n.data.year ?? d.getUTCFullYear();
      return {
        kind: 'now' as const,
        title: `Now page updated for ${month} ${year}`,
        href: n.data.archived ? `/now/${n.id}` : '/now',
        date: d,
      };
    }),
  ];

  return entries.sort((a, b) => b.date.valueOf() - a.date.valueOf()).slice(0, limit);
}
