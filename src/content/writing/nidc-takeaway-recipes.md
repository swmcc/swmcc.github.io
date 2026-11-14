---
title: "Govern the Undo, Not the Headcount: Recipes from NIDC 2026"
description: The companion to my NIDC 2026 talk, Getting Shit Done in Two Worlds. The model, the six recipes from the talk, the rest of the recipe book, where the model breaks, and the essays behind it.
pubDate: 2026-11-21T00:00:00.000Z
draft: true
tags:
  - ai
  - agentic-development
  - engineering
  - speaking
---

This is the companion to my talk at [NIDC 2026](https://nidevconf.com/), *Getting Shit Done in Two Worlds*. If you scanned the code on the screen, welcome. Everything practical from the talk is here, in more detail than thirty minutes allowed, so you didn't need to take notes.

<!-- TODO before 21 Nov: link the slides here (PDF export or the deck hosted on swm.cc), then set draft: false -->
**Slides:** coming shortly after the talk.

## The short version

I build software in two very different worlds with the same AI. By day I'm a principal engineer on a ten-person team building sovereign AI, with real governance: human-in-the-loop, guardrails, sign-offs. By night I run [SkillfulGorilla](https://skillfulgorilla.com), a consultancy that's me, sometimes one other engineer, and a salesperson.

I expected to need a stripped-down version of my workflow for the governed team. I didn't. The same factory runs in both worlds. What differs is where the human stands.

In both worlds the AI collapsed the build, and the time moved to waiting for human judgement: review, QA, sign-off. So the useful question isn't "how do I go faster?" It's **"how much of that waiting does each change actually deserve?"**

My answer, in one line:

> **Govern the undo, not the headcount.**

If you can roll it back, let the machine run. If you can't, put a human in the way.

## The model

You probably know one-way and two-way doors: go slow on decisions you can't reverse, go fast on the ones you can. Progressive delivery taught us to make deploys reversible. This is that idea, with two things that are new now the machine is walking through the doors:

1. **Building is nearly free, so undo is the main cost.** The doors idea was about a handful of big decisions a year. The machine now makes a thousand changes a week. The limit is how many of them you can afford to get wrong.
2. **The gate can be an agent.** In the cheap, reversible corner, a machine can sign off the machine's work, overnight.

Ask two questions of every change. How bad is it if it's wrong? How hard is it to undo?

| | **Easy to undo** | **Hard to undo** |
|---|---|---|
| **Cheap if wrong** | **Let it run.** Tests and an overnight agent sign it off. | **Review the plan, not the diff.** Agree the spec before the machine starts. |
| **Costly if wrong** | **Ship it, then watch.** Behind a flag, fast rollback, a human looks after release. | **Put a human in the way.** Named sign-off before release, every time. |

### What it looks like in both worlds

| Quadrant | The governed team | My consultancy |
|---|---|---|
| Let it run | A nightly test run signs it off | An overnight agent signs it off |
| Review the plan | Data and schema migrations, changes to the shape of the graph everything downstream depends on | Migrations |
| Ship it, then watch | QA sign-off and design QA | Me |
| Put a human in the way | A chain of sign-offs: QA, then product, and for the highest-stakes work the customer | The client |

Some true stories from my side, all from the git history:

- **Let it run.** On 8 August, Dependabot bumped Rails on funeralsni and the build broke. The gate missed it, and it didn't matter: reverted at 08:20, properly upgraded by 08:31. Eleven minutes, no meeting, nothing reached a user. In this corner you buy speed with cheap undo, not with a perfect gate.
- **Review the plan.** On 18 January, a migration on a small landing-page app failed the production deploy because the tables already existed. Not much at stake, but a migration is a one-way door. You agree that kind of change before the machine starts, not line by line afterwards.
- **Put a human in the way.** funeralsni publishes funeral notices for Northern Ireland, and people subscribe to them. A bug that emails the wrong death notice to every subscriber in a town can't be unsent. That's a one-person consultancy's app, and it's the human-in-the-way corner every time.

That last one is the point. The most irreversible change I could find wasn't in the sovereign AI world. **Stakes don't come from team size.**

### The finding in the third row

Both worlds still gate costly-but-reversible work *before* release, as if it were a one-way door. Once undo is cheap, watching after release is faster than waiting before it. That's the biggest speed-up still on the table for a team of ten and a team of one alike, and I include myself in that.

### Try it on your own work

Think of the last change you shipped.

| If it's… | …and… | Then it belongs in | The gate it deserves |
|---|---|---|---|
| Cheap if wrong | Easy to undo | Let it run | Tests, plus an agent or a nightly run. No human waiting. |
| Cheap if wrong | Hard to undo | Review the plan | A human agrees the spec first. Don't review the diff line by line. |
| Costly if wrong | Easy to undo | Ship it, then watch | A flag, a one-command rollback, and someone who looks after release. |
| Costly if wrong | Hard to undo | Put a human in the way | A named person signs off before it goes out. |

Now look at the gate it actually went through. If those two don't match, that's either expensive fear or a near miss.

## The recipes

The model tells you *where* each gate goes. The recipes are *how* I run them. Most of them take an idea the regulated world invented (error budgets, separation of duties, audit trails, least privilege) and make it cheap enough for a team of one. Agents make governance nearly free to run, so you can afford controls that used to need a compliance department.

Every recipe has the same three parts: when to use it, what you need, and what to do.

### Recipe 1: An autonomy budget

- **When:** cheap if wrong, easy to undo.
- **You need:** a revert count per repo, per quadrant, for agent-merged work.
- **Do:** while reverts stay under budget, agents merge on their own. Go over it, and that kind of work automatically moves up a gate, to a human, until it earns its way back down.

It's an SRE error budget applied to agent autonomy. Trust isn't something you hand the machine once. It's earned per repo and per quadrant, and it can be lost. The funeralsni Rails revert counted against the budget, which is the system working as designed.

### Recipe 2: The pre-mortem agent

- **When:** cheap if wrong, hard to undo.
- **You need:** a `plan.md`, and a second agent with no stake in it.
- **Do:** before a human sees the plan, the second agent gets one instruction: *"This plan shipped and caused an incident. Write the post-mortem."* Fix the plan against that story, then a human reviews it, and only then does it fan out to subagents, one agent per worktree.

"Review this plan" gets you generic objections. "Tell me how this exact plan fails" gets you a specific story you can fix. The plan reaches me having already survived its future.

### Recipe 3: The shadow run

- **When:** costly if wrong, easy to undo.
- **You need:** the old code path, the new one, and a diff of their outputs.
- **Do:** run the agent's new path beside the old one in production, on real traffic, with its output compared but not used. Flip only when the diff is clean.

This is my answer to the third row of the 2×2, where both my worlds still wait before release. The change is live but has no consequences until it's proved. You've bought undo for a change that would otherwise need a human waiting in front of it.

### Recipe 4: Separation of duties, for agents

- **When:** costly if wrong, hard to undo.
- **You need:** three agents with separate contexts, a hook, and a human.
- **Do:**
  - **Author:** one agent writes the code.
  - **Tester:** another writes the tests from the spec, and **never sees the implementation**, so it can't write tests that simply agree with the code.
  - **Reviewer:** a third reviews, and is never the model that wrote the code.
  - A hook enforces the separation, and a human signs last.

Separation of duties is the oldest control in regulated industries, and with agents it costs nothing. Enforce it with a hook, not a prompt. **A prompt is a suggestion. A hook is law.**

The human signature is the part the machine can't own. In my consultancy, it's my code gate: nothing ships until I've seen the green board and typed in a one-time code. In a governed team, it's a chain of named people: QA, then product, and for the highest-stakes work, the customer. **The machine can do everything except be accountable.**

### Recipe 5: The quadrant as code

- **When:** always. This is the 2×2 as infrastructure.
- **You need:** a commit trailer, a hook, and a CI check.
- **Do:** every task in the plan and every commit carries a `Quadrant:` trailer next to its `Co-Authored-By` line. The agent proposes it, the plan review confirms it, and CI checks that the change went through the gate its quadrant requires.

```text
Make Active Storage migration idempotent

Quadrant: cheap-irreversible
Gate: plan-reviewed
Co-Authored-By: Claude <noreply@anthropic.com>
```

Now the git history is an audit trail you can query:

```bash
git log --grep='Quadrant: costly-irreversible' --format='%h %s %(trailers:key=Gate)'
```

*Show me every hard-to-undo change, and who signed it off.* In a regulated world, that's an audit. In mine, it's one command.

### Recipe 6: Turn your reviewers into standards

- **When:** review has become your bottleneck, which it probably has.
- **You need:** a few dozen real review comments from your own team.
- **Do:** distil them into a written standards doc. Give it to your agent reviewer verbatim, have it use the sections as its checklist, and have it cite the section in every objection so the author can look it up.

I took 50 real review comments across 15 merge requests and turned them into a 244-line standards doc. Generic review prompts find generic problems. This one finds what our humans kept catching:

- agreement asserted in a comment rather than enforced by code
- constants that are right only by coincidence
- code branching on prose produced elsewhere in the same program
- simplifications that are really duplication one level up

**Generic review finds generic things.** This is how review capacity scales: a senior's judgement gets written down once and applied to every change.

## More recipes from the same factory

### The factory kit

What replaced the orchestrator I built and killed (more on that below) is almost embarrassingly plain:

1. **A `plan.md`**, written, pre-mortemed and reviewed before anything runs.
2. **Subagents.** Claude Code reads the plan and fans it out in parallel. One agent, one git worktree, always, so they never trip over each other.
3. **[herdr](https://herdr.dev)**, showing every agent across every repo: who's working, who's waiting on me, who's done.

The whole setup lives in one repo, [agentic-development](https://github.com/swmcc/agentic-development), and installs the same way on both my laptops. The only thing that changes per machine is the list of repos.

### Least privilege per quadrant

Agents working in the let-it-run corner literally can't touch migrations. Their allowed paths and credentials are scoped to their quadrant. The gate isn't a rule they follow, it's a wall they can't get through.

### The overnight agent

A scheduled agent works while I sleep: dependency upgrades, flaky tests, small fixes. It opens PRs that merge when the autonomy budget allows, and I read a summary at breakfast. That's most of the 69% after midnight in the numbers below.

### Make the agent prove it's reversible

Every migration an agent writes has to ship with its own rollback, and a test that runs it twice. The reviewer standards enforce it. Here's the January fix that started it, one line that made a migration safe to run twice:

```ruby
class CreateActiveStorageTables < ActiveRecord::Migration[7.0]
  def change
    return if table_exists?(:active_storage_blobs)
    # ...
```

That's buying undo. **The cheapest governance is an undo button.**

### The lessons loop

After every run, an agent reads the logs and writes up what went wrong into the repo's context, so the next run starts smarter. The factory learns from its own failures, one repo at a time.

### Hire a sceptic

An agent persona with memory whose only job is to argue against the plan. Mine is the [skeptic](https://github.com/swmcc/agentic-development/tree/main/souls). It's cheaper to lose an argument with a persona than to lose a week to a bad plan.

### Audit your fear

Approving every command your agent runs feels safe. By the fiftieth prompt you're not reading them, you're clicking yes. That isn't a gate, it's a ritual, and it's worse than no gate because it feels like one. Now a classifier waves through the routine ones, and the prompts I do see are worth reading.

List every deny rule and approval prompt you have. For a month, note what each one actually blocked. Delete what guards nothing, and move the rest to the quadrant it belongs in. **Fear puts human-in-the-way gates on let-it-run work.**

### A junior writes the spec

Every one of us learned judgement the same way: hello world, then a blog, then our own web server, getting a lot of code wrong along the way. The machine writes the code now, so that path is disappearing. Build the apprenticeship on purpose:

- A junior writes the plan, and a senior reviews it before the machine runs.
- Give juniors ownership of a let-it-run gate, where it's safe to be wrong.
- Review the machine's output in pairs, senior and junior, out loud.

If we don't, in five years nobody will be qualified to stand in the human-in-the-way corner.

## Where the model breaks

The 2×2 judges each change on its own. But a thousand individually undoable changes can add up to an architecture nobody can undo. Reversibility works one change at a time, and entropy builds up across all of them.

So the 2×2 governs changes, not drift. Drift needs its own gate: a human looking at the shape of the whole system on a schedule, asking whether we'd build it this way today. In both worlds that's the senior engineer's job, and the machine makes it more important, not less.

## By night, from my git log

The only numbers in this post come straight from git: commits since 1 January across my own projects. These are personal repos only, with nothing from my day job. "A machine's name" means a Claude co-author line, so it's an undercount.

| | Commits | With a machine's name on them |
|---|---|---|
| 07:00 to 18:00 | 304 | 35% |
| 18:00 to midnight | 483 | 33% |
| Midnight to 07:00 | 211 | **69%** |
| **Total** | **1,001** | **41%** |

Before midnight I'm the engineer. After midnight I'm the gate.

## The essays behind the talk

The talk is the end of a year of writing things down:

- [Building Thrawn](/projects/building-thrawn): the orchestrator I built to parallelise myself.
- [Your Architecture Is the Bottleneck, Not the Model](/writing/your-architecture-is-the-bottleneck): why most of my work wouldn't decompose into parallel tasks.
- [Execution Stopped Being the Bottleneck](/writing/execution-stopped-being-the-bottleneck): two agent harnesses on the same five tickets, and what that showed.
- [The Platform Ate My Roadmap](/writing/the-platform-ate-my-roadmap): the audit that closed half my orchestrator's issues because the platform had shipped them.

The short version of those four: I built a factory to remove the build bottleneck, and the bottleneck moved to planning and judging the output. The platform absorbed the orchestration, and the intelligence moved into the plan. Knowing when to kill your own tool is part of the job.

## What a team is for now

Can one engineer run the work of a whole team? Mostly, yes. One person and a machine can carry a whole app.

So a team exists to hold judgement and accountability for the things you can't undo. Its job is to keep buying undo, to govern the shape, and to grow the people who stand where undo can't be bought.

A team of ten and a team of one. Same AI, same factory, same answer.

**Govern the undo, not the headcount.**

If you want to talk about any of this, or want help with it in your own team, I'm [swmcc on GitHub](https://github.com/swmcc) and [SkillfulGorilla](https://skillfulgorilla.com) is how you hire me.

---

### Photo credits

The photos in the talk are from Wikimedia Commons:

- **Title**: [Goliath & Samson cranes at Harland and Wolff](https://commons.wikimedia.org/wiki/File:Ballymacarrett_-_Goliath_%26_Samson_cranes_at_Harland_And_Wolff_-_20240908093337.jpg), Hannah Forey, CC BY-SA 4.0
- **By day**: [Belfast Skyline City Quays](https://commons.wikimedia.org/wiki/File:Belfast_Skyline_City_Quays.png), Davidw1406, CC0
- **By night**: [Incandescent bulb lamp glowing on a desk at night](https://commons.wikimedia.org/wiki/File:Incandescent_bulb_lamp_glowing_on_a_desk_at_night.jpg), Sihyeon0621, CC BY-SA 4.0
- **Hello world**: [DEC VT100 terminal](https://commons.wikimedia.org/wiki/File:TSD_Computer_-,Schreib_und_B%C3%BCrotechnik_DEC_ASCII_Computer-Terminal_digital_VT_100.jpg), NoRud, CC BY-SA 4.0
- **thrawn**: [Tesla Motors Assembly Line](https://commons.wikimedia.org/wiki/File:Tesla_Motors_Assembly_Line_(6858583426).jpg), Steve Jurvetson, CC BY 2.0
- **And it died anyway**: [Flooded interior of abandoned factory](https://commons.wikimedia.org/wiki/File:Flooded_interior_of_abandoned_factory.jpg), saskialisette, CC BY-SA 4.0
- **One-way doors**: [Old wooden door](https://commons.wikimedia.org/wiki/File:Old_wooden_door%E2%80%93IMG_7297_02.jpg), Kızıl, CC BY-SA 4.0
- **Death notice**: [Letter box, High Street, Luddenden](https://commons.wikimedia.org/wiki/File:Letter_box,_High_Street,_Luddenden_-_geograph.org.uk_-_4253222.jpg), Humphrey Bolton, CC BY-SA 2.0
- **Expensive fear**: [Closed gate](https://commons.wikimedia.org/wiki/File:Closed_gate_-_geograph.org.uk_-_3702411.jpg), Bob Harvey, CC BY-SA 2.0
- **Where the model breaks**: [Bethesda aerial 2019](https://commons.wikimedia.org/wiki/File:Bethesda_aerial_2019_(dehazed).jpg), Antony-22, CC BY-SA 4.0
- **Undo button**: [Photoelasticity: TDK Head Cleaner](https://commons.wikimedia.org/wiki/File:Photoelasticity_-_TDK_Head_Cleaner_-_Black_background.jpg), Colin, CC BY-SA 4.0
- **How juniors learn**: [Ford assembly line in Copenhagen, 1923](https://commons.wikimedia.org/wiki/File:Ford_assembly_line_in_Copenhagen_1923.jpg), Peter Elfelt, public domain
- **Team of one**: [Single sculler at Eton Dorney](https://commons.wikimedia.org/wiki/File:Paralympics_rowing_at_Eton_Dorney,_Argentinian_single_sculler_-_geograph.org.uk_-_3114110.jpg), David Hawgood, CC BY-SA 2.0
- **What a team is for**: [German rowing eight, 1964](https://commons.wikimedia.org/wiki/File:German_rowing_eight_EK_1964c.jpg), Eric Koch for Anefo, CC BY-SA 3.0 NL
