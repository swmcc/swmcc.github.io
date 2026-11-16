---
title: "Counting What the Machine Wrote"
pubDate: 2026-11-17T00:00:00.000Z
tags:
  - nidc
  - git
  - agentic-engineering
---

One of the slides in [Saturday's talk](/notes/nidc-2026-getting-shit-done-in-two-worlds) says this:

> A quarter of a million lines changed this year. After midnight, 68% have a machine's name on them.

Nobody recorded those numbers for me. They came out of git, and I'd rather show the working than ask anyone to take a slide on trust.

## A machine's name

When a coding agent commits, it signs the commit with a trailer:

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

Git can read trailers directly with `%(trailers)`, so there's no grepping of commit bodies. This counts my commits across every repo in `~/Code`, split by the hour they were made:

```sh
for repo in ~/Code/*/; do
  [ -d "$repo/.git" ] || continue
  git -C "$repo" log --since=2026-01-01 --no-merges --author=McCullough \
    --date=format-local:%H \
    --format='%ad%x09%(trailers:key=Co-authored-by,valueonly,separator=%x2C)'
done | awk -F'\t' '
  { night = ($1 < 7); n[night]++; if ($2 != "") m[night]++ }
  END {
    printf "midnight to 7am: %d of %d (%d%%)\n", m[1], n[1], 100*m[1]/n[1]
    printf "rest of the day: %d of %d (%d%%)\n", m[0], n[0], 100*m[0]/n[0]
  }'
```

`format-local` matters. Without it you get the hour in whatever timezone the commit was stamped with, and an agent running in a container on UTC will happily move your 1am work to midnight.

## Lines changed

Lines are a terrible measure of work and a decent measure of volume. The trick is not counting what nobody wrote:

```sh
git -C "$repo" log --since=2026-01-01 --no-merges --author=McCullough \
  --numstat --format= -- . \
  ':!*.lock' ':!*-lock.json' ':!vendor/' ':!node_modules/' ':!*.min.*' ':!dist/' \
| awk '$1 != "-" { a += $1; d += $2 } END { print a + d }'
```

The `:!` pathspecs exclude lock files, vendored code and build output. Leave them in and one `bundle update` makes you look like a genius. The `$1 != "-"` skips binary files, which numstat reports as dashes.

## What it undercounts

A trailer means the agent was involved. It doesn't mean it wrote every line, and it doesn't count the times I took an agent's work and committed it myself. So treat the number as a floor, not a measurement of authorship.

## What it says

Thirty-five repos, a thousand commits. During the day, about a third of my commits carry a machine's name. After midnight it's about two thirds.

I don't get lazier at one in the morning. The job changes shape. What I'm actually doing at that hour, and what that has to do with a ten-person governed team doing the same thing in daylight, is Saturday.

Thursday: what one in the morning looks like.
