---
title: Your Architecture Is the Bottleneck, Not the Model
description: A month of running parallel coding agents, with a ledger recording every run, says the constraint on agentic development isn't model quality. It's whether your codebase can be decomposed at all.
pubDate: 2026-08-09T00:00:00.000Z
tags:
  - ai
  - agentic-development
  - architecture
  - orchestration
---

Every conversation about AI-assisted development eventually collapses into the same question: which model? Which one benchmarks best, which one is cheapest, which one writes the most convincing Rails. It's a comfortable question because it has a shopping answer.

I've spent the last month asking a different one. I built [Thrawn](/projects/building-thrawn), an orchestrator that takes a ticket, plans it with a strong model, then executes the plan as parallel agents in isolated git worktrees. Every run gets recorded in a ledger: what parallelised, what didn't, what the overhead cost, what broke in integration. The mechanics are written up in [their own note](/notes/building-thrawn-one-python-file). This piece is about what the ledger has been telling me.

It has not been telling me the models are the problem. The models are mostly fine. The bottleneck, run after run, is my architecture.

## Amdahl doesn't care about your token budget

In 1967 Gene Amdahl pointed out that the speedup from parallelising a program is bounded by its serial fraction. If 20 percent of the work can't be parallelised, it doesn't matter whether you have four processors or four thousand: you never get past a 5x speedup. The maths is brutal and it doesn't negotiate.

Swap processors for coding agents and nothing changes. A ticket has a serial fraction too: the part where every change depends on the change before it. Throw six agents at a ticket that's 80 percent serial and five of them are decoration. You've paid for a planning pass, six worktrees and an integration phase to go slower than one agent working alone.

The uncomfortable question is what determines that serial fraction. It isn't the model. It isn't the orchestrator. It's the shape of the codebase the work lands in.

## What the ledger says

Roughly half of my personal tickets don't decompose into parallel work at all. Not "decompose badly", don't decompose. The planner studies the repo, thinks hard with the most capable model I can give it, and comes back with what is honestly one task wearing a plan's clothing. When that happens, the entire apparatus is overhead. One agent with a clear brief would have been faster and cheaper.

The other half decompose on paper and then meet integration. This is where the really instructive failures live: semantic merge conflicts. Two agents each did exactly what they were asked. Both diffs are correct in isolation. Merged, they disagree about something neither of them could see: a helper both extended in different directions, a schema both touched, an assumption one invalidated for the other. Git flags the shallow version of this; the deep version sails through the merge and fails in the checks, which is worse.

A merge conflict is a symptom. The disease is coupling. My personal projects are small monoliths, and in a small monolith everything is one hop from everything else. There are no boundaries for the planner to cut along, so it's cutting through load-bearing walls.

## Conway's law now applies to machines

Conway told us systems end up mirroring the communication structures of the organisations that build them. For fifty years that's been about humans, and humans are remarkably good at compensating for bad boundaries. We absorb coupling with conversation. Two developers about to collide say so at standup, or in the channel, or by the ancient ritual of shouting across the room: I'm in the User model, hold off.

An agent team has no standup. Thrawn's agents work in deliberately isolated worktrees, blind to each other by design, because that isolation is exactly what makes running them in parallel safe. The coordination channel a human team uses to route around coupling does not exist, and adding one would reintroduce precisely the coupling I'm trying to escape.

Which means coupling that a human team quietly absorbs becomes a hard failure for an agent team. The codebase itself has to carry the coordination: boundaries that make tasks genuinely independent, contracts at the edges, checks that catch disagreements mechanically. Service boundaries and task boundaries turn out to be the same thing.

This is why I've come to think my personal projects are the wrong testing ground, and the ledger's grim numbers may say more about my architecture than about the approach. Distributed systems, where a ticket lands inside one service and the blast radius stops at a contract, are where the parallel bet should actually pay. That's the environment I work in during the day, and it's where the thesis gets its real trial.

## The next refactoring wave

We spent the 2010s restructuring codebases around teams of humans. Microservices, module ownership, the inverse Conway manoeuvre: deliberately shaping the architecture to match how we wanted people to work. An enormous amount of that effort was justified by coordination costs. Fewer merge conflicts, fewer meetings, independent deployability.

I think the next wave of that work is coming, and this time it's for teams of agents.

The funny thing is what "agent-ready architecture" looks like when you write it down. Sharp interfaces. Boundaries that localise change. Fast, deterministic checks that act as the arbiter of done. Documentation accurate enough that a machine reading it cold can plan against it. None of this is new. It's every virtue we've claimed to want for twenty years, the stuff of conference talks and code review sermons that lost out, project after project, to shipping the next feature.

Agents change the economics of that argument. Good boundaries used to be an investment in future maintainers, easy to defer because the payoff was diffuse. Now they're the difference between farming a ticket out to five parallel workers and watching an expensive planner conclude, correctly, that your codebase only admits one. Amdahl's law has been promoted from computer architecture to a line item on your velocity. The serial fraction is now something you can refactor.

So the codebases that get the most out of this era won't be the ones with the best prompts. Prompts are a commodity already. They'll be the ones with the best boundaries, because boundaries are what parallelism, human or machine, has always actually run on.

## The ledger gets the last word

I want to be honest about the epistemics here, because the AI discourse has enough enthusiasm masquerading as evidence. This thesis is exactly one month and one codebase deep. Thrawn is running a 30-day trial with kill criteria I wrote down before I started, and the ledger, not my fondness for the thing I built, decides whether it survives. If proper service boundaries at work don't move the numbers either, then the architecture story is wrong too, and I'll write that up with the same enthusiasm.

That's the discipline. It applied to every tool before this one, and being magic doesn't exempt the new ones.
