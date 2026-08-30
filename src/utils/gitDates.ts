import { execFileSync } from 'node:child_process';

// Created / last-edited dates for a content file, from git history, at build time.
// Needs full history in CI (actions/checkout with fetch-depth: 0); with a shallow
// clone every file would look like it was created and edited today.

export interface GitDates {
  created?: Date;
  updated?: Date;
}

const cache = new Map<string, GitDates>();

function git(args: string[]): string {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

export function gitDates(filePath: string | undefined): GitDates {
  if (!filePath) return {};
  const hit = cache.get(filePath);
  if (hit) return hit;

  // first commit that added the file (following renames), and the most recent touch
  const created = git(['log', '--follow', '--diff-filter=A', '--format=%cI', '--', filePath]).split('\n').pop() || '';
  const updated = git(['log', '-1', '--format=%cI', '--', filePath]);

  const result: GitDates = {
    created: created ? new Date(created) : undefined,
    updated: updated ? new Date(updated) : undefined,
  };
  cache.set(filePath, result);
  return result;
}

/** True when two dates fall on different calendar days (UTC). */
export function differentDay(a?: Date, b?: Date): boolean {
  if (!a || !b) return false;
  return a.toISOString().slice(0, 10) !== b.toISOString().slice(0, 10);
}
