---
title: The Platform Ate My Roadmap
description: I built an orchestrator in August. In September an audit closed half its open issues as already shipped by the platform underneath it. On maintaining a personal tool in the platform's shadow, and the discipline of closing your own issues.
pubDate: 2026-09-27T00:00:00.000Z
tags:
  - ai
  - agentic-development
  - orchestration
  - claude
---

In August I built [Thrawn](/projects/building-thrawn), an orchestrator that takes a ticket, plans it with a strong model, then executes the plan as parallel agents in isolated git worktrees. By late August it had a healthy roadmap: twelve open issues, each one a feature I was genuinely excited about. Event-driven dispatch. An intake agent that grooms raw issues into agent-ready briefs. A skeptic that reviews work before it ships. Personas with memory and taste.

In late September I ran an audit of the whole setup, and closed half of them in a day.

Not because the ideas were bad. Because they'd shipped. Just not by me.

## The audit

The prompt was simple enough: look at my setup, look at what the most advanced setups are doing, and tell me where the holes are. I expected to hear about missing features. What I got instead was a list of my own open issues with, effectively, "the platform does this now" stamped across them.

Issue [#26](https://github.com/swmcc/agentic-development/issues/26), event-driven dispatch (a GitHub label fires Thrawn on my machine), turned out to be Claude Code's scheduled routines with GitHub-event triggers, almost verbatim. Issue [#25](https://github.com/swmcc/agentic-development/issues/25), the intake grooming agent, is a `@claude` mention in a GitHub Action. Issue [#20](https://github.com/swmcc/agentic-development/issues/20), the pre-ship review stage, is `/code-review` plus a persona file. The deep planning stage I was proud of? Plan mode plus native workflow orchestration, which will happily fan out subagents into per-agent worktrees with model overrides and resume support. That was most of my Q4, implemented by someone else's Q3.

There is a particular flavour of embarrassment in having a machine read your issue tracker and gently point out that you've been speccing features for a race you already lost. It's sharpened by the fact that the machine doing the pointing is made by the company whose roadmap ate mine. I couldn't decide if that was a conflict of interest or just efficient.

## What actually survived

The useful part of the audit wasn't the obituary. It was the survival table. Six pipeline stages, honestly assessed:

| Stage | Verdict |
|-------|---------|
| Deep-think planning | Native now |
| Task split + parallel worktrees | Native for Claude-only work |
| Runner routing across vendors | **Mine** |
| Integrator merge + checks | Largely native |
| Ship gate | **Mine** |
| PR creation | Commodity |

Three things survived, and it's worth being precise about why.

**Cross-subscription dispatch.** Thrawn routes tasks to whichever agent CLI suits them: Claude for judgement, Codex or Pi for mechanical work, each billing to a different subscription pool. Every "router" you'll find is an API proxy, and API proxies structurally cannot do this: subscription OAuth traffic never touches a proxy. The quota you pay for monthly is only reachable through the official CLIs themselves, so arbitrage between pools has to happen at the process-spawn level. That's what Thrawn is. A 2,500-line Python file out-routes a proxy because it's standing in the only place routing can happen.

**The ship gate.** Nothing gets pushed until integration goes green and I type a one-time code back that's only shown on the status board. Seeing the green board is the second factor. No platform offers this, and I suspect none will, because it encodes a personal level of distrust that doesn't generalise into a product.

**Watchable panes.** Every parallel agent runs as a live pane in my terminal multiplexer, with working/blocked/done state on the border. The native alternatives (cloud sessions, workflow fan-outs) are fire-and-forget by comparison. It turns out I orchestrate by looking, and the platform can't see my terminal.

Notice the shape of that list. What survived isn't the clever stuff. It's the stuff that lives where the platform structurally can't reach: other vendors' quota, my personal trust boundary, my screen.

## Shrink, don't rewrite

The tempting responses to being lapped are the two extremes: defend the tool (keep building the roadmap out of loyalty) or abandon it (the platform won, delete the repo). Both are wrong, and both are easier than the honest middle.

The honest middle is treating your own tool the way a rival would. Which of these issues would a competitor bother attacking? Not the ones the platform ships for free next quarter. So they closed, marked superseded with comments explaining exactly what native feature replaced them, so future me doesn't reopen them in a fit of enthusiasm. The persona system that shipped inert in August got one character written (the skeptic, the only one with a job) and the other three issues that hung off it closed as parked. Twelve issues became two.

What remains is exactly the moat: one issue trialling whether the cross-pool routing actually pays (with kill criteria and a decision date written down in advance, because enthusiasm is not evidence), and one feature idea that leans into the panes rather than competing with native orchestration.

Closing your own issues is a discipline nobody performs in public. We write about launching things. We do not write about the Tuesday afternoon spent stamping "not planned" on our own ideas because someone with ten thousand engineers had them too, and had them faster. But it's the same skill as deleting code, and we've at least learned to brag about that.

## The general case

If you maintain any personal agent tooling (and the sort of person who reads this far probably does) the platform's gravity applies to you too. Some portable rules from the wreckage:

**Audit quarterly, like a rival.** Not "what should I add" but "what here would embarrass me if I read the release notes properly". The half-life of a workaround in this ecosystem is currently about six weeks.

**Name your moat in one sentence per feature.** Mine turned out to be: other people's quota, my own paranoia and my own screen. If a feature's justification is "the platform doesn't do this *yet*", it's not a moat, it's a countdown.

**Build only in the shadow's gaps.** Cross-vendor anything, local visibility, personal trust gates, your own machine's context: these are structurally safe. Orchestration mechanics, GitHub plumbing, scheduling: you're speedrunning deprecation.

**Let the ledger kill your darlings.** The features that survived my audit did so on evidence. The trial that decides whether the routing is worth keeping has a date on it. If the numbers come back saying a cheap model on one pool was fine all along, then the tool's proudest feature dies too, and the essay about that will be honest whichever way it goes.

Thrawn is better today than it was in August, and it's better because it's smaller. The platform ate my roadmap. It can have it. The three things it can't eat were the only parts worth keeping anyway.
