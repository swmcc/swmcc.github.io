import { getCollection } from 'astro:content';
import { gitDates, differentDay } from './gitDates';

// One merged, date-sorted feed of everything that changes on the site.
// Used by the homepage "Recently" section, /whats-new.json, and Swanson's brain,
// so all three agree on what "new" means.

export type RecentKind = 'essay' | 'note' | 'project' | 'now';

export interface RecentEntry {
  kind: RecentKind;
  title: string;
  href: string;
  date: Date;        // created / published
  updated?: Date;    // last git edit, projects only (essays and notes are one-off; edits there are typo fixes)
  activity: Date;    // whichever is later; the feed sorts by this
  description?: string;
}

/** Last git edit for a content file, or undefined when it isn't a later day than `date`. */
export function updatedAfter(filePath: string | undefined, date: Date): Date | undefined {
  const { updated } = gitDates(filePath);
  return updated && updated > date && differentDay(updated, date) ? updated : undefined;
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

  const raw = [
    ...writing
      .filter((p) => !p.data.draft)
      .map((p) => ({ kind: 'essay' as const, title: p.data.title, href: `/writing/${p.id}`, date: p.data.pubDate, description: p.data.description, filePath: undefined })),
    ...notes.map((n) => ({ kind: 'note' as const, title: n.data.title, href: `/notes/${n.id}`, date: n.data.pubDate, filePath: undefined })),
    ...projects.map((p) => ({ kind: 'project' as const, title: p.data.title, href: `/projects/${p.id}`, date: p.data.pubDate, description: p.data.description, filePath: p.filePath })),
    ...nowPages.map((n) => {
      const d = n.data.updatedDate;
      const month = n.data.month ?? MONTHS[d.getUTCMonth()];
      const year = n.data.year ?? d.getUTCFullYear();
      return {
        kind: 'now' as const,
        title: `Now page updated for ${month} ${year}`,
        href: n.data.archived ? `/now/${n.id}` : '/now',
        date: d,
        filePath: undefined, // edited all month; its own updatedDate is the signal
      };
    }),
  ];

  const entries: RecentEntry[] = raw.map(({ filePath, ...e }) => {
    const updated = updatedAfter(filePath, e.date);
    return { ...e, updated, activity: updated ?? e.date };
  });

  return entries.sort((a, b) => b.activity.valueOf() - a.activity.valueOf()).slice(0, limit);
}
