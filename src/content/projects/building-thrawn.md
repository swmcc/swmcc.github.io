---
title: "Building Thrawn"
description: "An agentic development workflow that plans deeply with a strong model, executes in parallel with cheaper ones and refuses to ship anything I haven't approved"
pubDate: 2026-08-09
tags: ["agentic-development", "claude", "orchestration", "multi-model"]
---

## The Problem

Coding agents are good now. Genuinely good. But the way most of us use them hasn't caught up: one agent, one terminal, and you sit there watching it work like it's 2024. The bottleneck has stopped being the typing and become the orchestration. Deciding what to build, keeping more than one agent busy at once, reviewing what comes back and stopping any of it shipping before a human has looked at it.

There's also a cost and fit problem nobody talks about enough. Running your biggest, most expensive model on every task is lazy. Renaming a function does not need the same brain as designing a schema. What I wanted was a workflow that plans with the strongest model available, then farms the actual work out to whatever model each task deserves.

So I built [Thrawn](https://github.com/swmcc/agentic-development/tree/main/thrawn). Named for the Grand Admiral, because the whole point is that it wins by planning and delegation rather than brute force.

![Thrawn, the agentic development workflow](/projects/thrawn.webp)

## How It Works

You give Thrawn a ticket number or a markdown brief. From there:

1. A strong model deep-thinks a plan, exploring the repo read-only. No writes at this stage, just understanding.
2. The plan gets split into parallel tasks, each routed to the right model for its complexity. Design work goes to a heavyweight, mechanical work goes to something cheap and fast.
3. One agent spawns per task, each in its own isolated git worktree. They can't stand on each other's toes because they're not in the same working copy.
4. The task branches get merged back together. An integrator agent resolves conflicts and runs the project's checks.
5. Shipping is gated behind a one-time code. Nothing gets pushed until I've seen the green board and typed the code in myself.
6. Only then does it push the branch and open the PR.

That last gate matters more than any of the clever bits. Agents doing work in parallel is a productivity story. Agents pushing to a remote without a human in the loop is a horror story.

## Herdr Underneath

The agents run inside [Herdr](https://herdr.dev/), a terminal multiplexer built for exactly this. Each Thrawn task shows up as a pane, and Herdr's state awareness means I can see at a glance who's running, who's waiting on input and who's finished. My full [Herdr setup](https://github.com/swmcc/agentic-development/tree/main/herdr) lives in the same repo, keybindings, workspace definitions and the agent state hooks included.

After years of cobbling together tmux sessions and shell scripts, this is where I've wanted my terminal workflow to be. Herdr handles the runtime, Thrawn handles the orchestration, and the two of them together are the closest I've got to a proper answer.

## The Honest Bit

I'm dogfooding this properly, with a ledger that records every run, and the early data is humbling. Roughly half of my personal tickets don't actually decompose into parallel work. When a task is inherently serial, the orchestration is pure overhead. And semantic merge conflicts, where two agents both did the right thing but their right things disagree, remain the hardest problem in the whole system.

My suspicion is that my personal projects are the wrong testing ground. They're small monoliths, and the tasks are chatty with each other. Where Thrawn should earn its keep is distributed work, where service boundaries give you natural task boundaries. I'll find out when I've used it in anger at work.

I've written the design and the findings up properly on my [experiments site](https://experiments.swm.cc/thrawn/), including the failure cases. The 30-day trial is running now and the ledger, not my enthusiasm, gets the final say on whether it survives.

## Status

Actively working on it, and using it daily. Watch this space.

## Source

Thrawn lives in my [agentic-development](https://github.com/swmcc/agentic-development) repo on GitHub, alongside the Herdr configuration it pairs with.
