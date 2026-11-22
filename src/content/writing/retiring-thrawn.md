---
title: Retiring Thrawn
description: In August I built a software factory. In September the platform ate its roadmap. In November I killed it, the day after telling a room at NIDC that it had lost to a markdown file. On the trial that outlived the tool, the one piece I kept, and why the plain workflow won.
pubDate: 2026-11-22T00:00:00.000Z
tags:
  - ai
  - agentic-development
  - orchestration
  - claude
---

Yesterday at [NIDC](https://nidevconf.com/) I stood in front of a room and told them I'd built a software factory and then killed it. That was true in the way talks are true: I'd stopped using it, but the code was still sitting in my repo with a status of "Active" on my projects page. This is the paperwork.

[Thrawn](/projects/building-thrawn) is retired. The code is deleted from main and frozen on a [`thrawn-archive`](https://github.com/swmcc/agentic-development/tree/thrawn-archive/thrawn) branch, where it'll sit as a record rather than a promise.

## Why I built it

Every one of us learned the same way. Hello world. Then a blog nobody read. Then your own web server, which was worse than Apache in every measurable way. You don't build those because the world needs another one. You build them to find out how the thing works.

A software factory is the next one on that list. Underneath it sat a question I genuinely wanted answered: could one engineer run the work of a whole team? So in August I built an orchestrator that took a ticket, planned it with a strong model, split the plan into tasks, routed each task to the model it deserved, ran every agent in its own git worktree and refused to ship anything until I'd typed in a one-time code.

And one morning it worked. Two harnesses raced each other on the same five issues, CI agreed with my scoring exactly, and the rest of a game engine got built and merged before breakfast. I wrote that up as [Execution Stopped Being the Bottleneck](/writing/execution-stopped-being-the-bottleneck), and I may have had a wee moment.

## The platform ate the roadmap

Then in September an audit of my own issue tracker closed twelve open issues down to two, because the platform underneath had shipped them as native features while I wasn't looking. That's [The Platform Ate My Roadmap](/writing/the-platform-ate-my-roadmap). What survived, I said at the time, was the moat: cross-subscription routing, the ship gate and the watchable panes. Three things that lived where the platform structurally couldn't reach.

I also said the ledger would decide whether the proudest of the three, the routing, was worth keeping. It had a trial, kill criteria and a decision date written down in advance, because enthusiasm is not evidence.

## The trial outlived the tool

Phase two of the runner trial started on 27 September. The plan was a fortnight of ordinary, ungroomed work, with the planner steered towards Codex and Pi on the ChatGPT pool so I could see whether moving mechanical traffic off the Claude pool actually paid.

It failed, and not in an interesting way. It failed because it was slow.

On curated tickets in August, five parallel agents finished in a couple of minutes. On real work, the bits either side of execution dominated. Recon, deep planning, the split, the integrator, the checks and the merge back together added up to the best part of an hour from ticket to green board. The same ticket done with a plain plan file and a coding agent fanning out its own subagents was usually merged in fifteen or twenty minutes. Over the fortnight I managed a handful of proper Thrawn runs, nowhere near enough for a verdict, and the ones I did manage were heavy on usage: the planning and integration passes alone were eating a noticeable chunk of a five-hour window before a single line of the actual work had been written. The cheap-pool saving was real, but it was a saving on the cheapest part of the job.

Meanwhile the platform kept shipping. Subagents with model overrides, per-agent worktrees, resumable workflows, review on demand. By the end of October the native tools covered nearly everything I'd built Thrawn to do, and covered it faster. The trial never reached its decision date with enough data to decide anything, because by then there was nothing left for it to decide. Issue [#14](https://github.com/swmcc/agentic-development/issues/14) is the last one open, and it closes with this post.

The trial outlived the tool. That's the honest result, and it's the one I promised I'd publish whichever way it went.

## What replaced it

This is the bit I said on stage, and it still stings a little. The military genius lost to a markdown file.

What replaced Thrawn is embarrassingly plain:

1. **The plan.** One markdown file: what we're building, in what order and what we're not doing. Reviewed before anything runs. Measure twice, build once.
2. **The crew.** The coding agent reads the plan and fans it out to subagents. One agent, one worktree, always.
3. **The control room.** [Herdr](https://herdr.dev/), showing every agent across every repo: who's working, who's waiting on me and who's finished and is now just sitting there judging me.

The intelligence moved out of my clever tool and into a boring file. The panes, one of the three things I thought were a moat, turned out not to need Thrawn at all. Herdr was doing that job all along, and it does it just as well for a plain coding agent as it did for my orchestrator.

## What I kept

Exactly one piece: the code gate. Nothing ships until I've seen the green board and typed in a one-time code. It proves a human read the board before anything touched the remote, and that's still worth having.

But I only kept it for my own work. I ran Thrawn in both worlds, at SkillfulGorilla by night and at Whitespace by day, and I stopped in both. At work the gate wasn't needed, because QA, design QA and product sign-off already do that job, with more names on the line than mine. **The gate moved to wherever accountability already sat.** That turned out to be the spine of the whole talk, and I found it in my own tooling.

## Shrink, then stop

In September I wrote that the right response to being lapped was to shrink, not rewrite. That was right, and it was also only the first half. Shrinking told me which parts were mine. Using the smaller thing honestly for two more months told me that even those parts were either already somewhere else (the panes), better done by something plainer (the routing, which needed a plan file far more than it needed a router), or small enough to live on their own (the gate).

A tool that's been shrunk down to its moat still has to justify itself against the plain alternative every single day. Thrawn couldn't. The questions it was built to ask have been answered: one engineer can run the work of a team, mostly, and the bottleneck moves to planning and judging the output as soon as you do. I don't need a factory to keep asking them.

So it's going in the drawer next to the web server that was worse than Apache. I learned exactly what I built it to learn, and I'd build it again. I just wouldn't keep running it.
