---
title: "The Trial I Promised: Seven Weeks In"
description: "I said the parallel-agents thesis would get its real trial at work, in a distributed system with proper boundaries. Seven weeks in: the bet is paying, and the serial fraction has moved."
pubDate: 2026-11-27
tags: ["agentic-development", "teams", "amdahl", "verification"]
---

In [Your Architecture Is the Bottleneck](/writing/your-architecture-is-the-bottleneck) I made a prediction and a promise. The prediction: my personal projects were the wrong testing ground for parallel agents, because small monoliths have no boundaries to cut along, and distributed systems, where a ticket lands inside one service and the blast radius stops at a contract, are where the bet should actually pay. The promise: that's where I work, so that's where the thesis would get its real trial.

Seven weeks in. Here's what's held and what hasn't.

## The setup

Three engineers and a QA engineer, working under one epic on a distributed system. The tickets are written before we see them, by a product engineer in conjunction with another engineer, which matters more than it sounds: [last time](/writing/execution-stopped-being-the-bottleneck) the scarce resources turned out to be well-shaped work going in and judgement coming out. Someone is paying the first cost up front, properly, as a job.

The honest sizing is that this initiative would have taken six or seven months the old way. We're aiming at a quarter, and seven weeks in, that's still credible. The compression is real. That part of the prediction held.

## What the contract didn't contain

Here's the part that didn't. I wrote that in a distributed system the blast radius stops at a contract. It doesn't. It stops where the *change* stops, and on this epic a single ticket can stretch across three or four other repos depending on what it touches. Each of those changes can spawn tickets of its own. Add the NITs and NABs, which we deliberately ticket out rather than fold into the change that surfaced them, and completed tickets that still surface bugs, which become tickets too.

So the epic isn't a list you burn down. It's a graph that grows while you work it. There have been weeks where we created more tickets than we closed. I'd hoped the testing would compound by now and the spawn rate would fall. Not yet.

This isn't a failure of the boundaries. The contracts do their job: the work parallelises, three people and their agents ship simultaneously without semantic collisions, which is exactly what my monoliths couldn't do. What the contracts don't do is make a *feature* small. The unit of work our tooling understands is the ticket. The unit of work that actually exists is the ticket graph. Nothing in the old workflow has a name for that.

## Review held, because we rebuilt it

Everyone's prediction, mine included, was that review would drown first. Three people shipping agent-assisted code should bury any review process built for human typing speeds.

It didn't drown, because we didn't ask the old review process to cope. Every completed ticket goes through a suite of agent reviews, and which ones run depends on who shipped it and what it touched. Security-adjacent change, security audit. Everything gets an autopsy, and a pass that walks the tests and confirms the things we claim passed actually passed. The suite started as one review prompt in my Obsidian vault and has grown with every ticket since; once a week it gets pruned against what it caught and what it missed. The artefact earns its place with evidence or it goes.

[The harness trial](/writing/execution-stopped-being-the-bottleneck) taught me that unattended operation converts operational judgement into the entire product. A team is the same lesson at a different scale. Review survived the new speed because its judgement got encoded, versioned and maintained like code. Which is exactly what we didn't do to the stage after it.

## Amdahl, again, wearing a different hat

Amdahl's law says your speedup is bounded by your serial fraction. Two essays ago the serial fraction was architectural: coupled code that wouldn't decompose. The day job's architecture had already fixed that. The serial fraction didn't disappear. It moved downstream and changed clothes.

It's verification now. Code production parallelised across three people and their agents. Review parallelised, because we rebuilt it. Human verification didn't, and can't as currently shaped: one QA engineer, serially absorbing the output of everything upstream, across every repo a ticket graph touches. And before anyone misreads this, the QA engineer is doing exactly what the role asks, well. Blaming the person at the narrowest point of a pipeline for the shape of the pipeline is how you learn nothing.

The testing infrastructure is genuinely decent. Engineers run the full suite, unit, integration and the rest. Every merge produces a test plan, which feeds a growing suite the QA engineer maintains against the ticket graph. There are cross-repo checks and a nightly run against each release candidate. It is comprehensive and the bugs still arrive after done, sometimes in the repo that changed, sometimes in the seams, no pattern. Per-ticket adequacy doesn't compose across a ticket graph. Testing the nodes is not testing the graph.

## The debt we're paying on purpose

One deliberate choice deserves its own paragraph. When code is this cheap to produce, slop is also cheap to produce, so we treat every NIT and NAB as real: fixed in the current ticket or ticketed to be done, never waved through on a promise. The codebase is measurably better for it. But it's also a tax the graph collects on every change, and the sediment is accumulating. We will have to deal with it. Deliberately incurred debt is still debt.

## Week seven

The thesis survives its trial so far, with an amendment. Boundaries decide whether work parallelises; they don't decide where the serial fraction goes when it does. Every stage we rebuilt for the new speed kept up. The one stage still shaped for the old speed is the bottleneck.

The next move is to shift verification left. QA in the ticket graph from the start rather than at the end of it, leaning on that growing suite instead of absorbing finished work serially. Something in the spirit of TDD, if not the letter of it, the verification written down before the work rather than chasing it afterwards. Would that even be the right name for it? I don't know. The old names don't quite fit the new shapes yet. Week fourteen gets the last word.
