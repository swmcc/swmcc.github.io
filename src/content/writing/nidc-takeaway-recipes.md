---
title: "Govern the Undo, Not the Headcount: Recipes from NIDC 2026"
description: The companion to my NIDC 2026 talk, Getting Shit Done in Two Worlds. The model, the six recipes from the talk, the rest of the recipe book, where it all breaks, and the essays behind it.
pubDate: 2026-11-21T00:00:00.000Z
draft: true
tags:
  - ai
  - agentic-development
  - engineering
  - speaking
---

This is the companion to my talk at [NIDC 2026](https://nidevconf.com/), *Getting Shit Done in Two Worlds*. If you scanned the code on the screen: hello, and well done for not taking notes. Everything practical from the talk is here, with more detail than thirty minutes and a clicker allowed.

<!-- TODO before 21 Nov: link the slides here (PDF export or the deck hosted on swm.cc), then set draft: false -->
**Slides:** coming shortly after the talk.

## Two worlds

By day I'm a principal engineer at Whitespace. Ten engineers building sovereign AI, with proper governance: human in the loop, guardrails, sign-offs on the sign-offs. For what we build, that's exactly right.

By night I run [SkillfulGorilla](https://skillfulgorilla.com). Me, sometimes one other engineer, and a salesperson. Our governance policy is "ah, fuck it, it'll be grand."

Same person. Same AI. Wildly different rules. And I've spent this year watching the same paradigm shift land in both.

Here's the thing I can't stop chewing on. The job didn't speed up. **It changed.** We used to write code. Now we decide what gets built, write down what we meant, and judge what's safe to ship. The typing is nearly free. So every bit of process a team has needs to answer one question: is it there to coordinate typing, or to hold judgement?

## The stripped-down factory doesn't exist

The abstract promised two factories: the full-throttle one I run on my own, and a stripped-down version that survives a governed team.

I went looking for the stripped-down one. It doesn't exist. Sorry, Art.

There's one factory, and it runs in both worlds. Same repo on both laptops. The work one just has a shorter list of repos. What's different isn't the factory. It's **where the human stands.**

## I built a factory, then I killed it

Every one of us learned the same way. Hello world. Then a blog nobody read. Then your own web server, which was worse than Apache in every measurable way. You don't build those because the world needs another one. You build them to find out how the thing works.

A software factory is the next one on that list. So I built [Thrawn](/projects/building-thrawn), named after Grand Admiral Thrawn: military genius, wins every battle through planning and delegation. A strong model plans, the work gets split into tasks, and each task goes to the model it deserves, in its own git worktree.

And one morning it worked. Two models raced each other on the same five issues, CI agreed with my scoring exactly, and the rest of a game engine got built and merged before breakfast. I may have had a wee moment.

And it died anyway. Too slow, too heavy on usage, and while I was busy being proud of it, the platform shipped half my roadmap as built-in features. I wrote about that in [The Platform Ate My Roadmap](/writing/the-platform-ate-my-roadmap), and it's exactly as bitter as it sounds.

The military genius lost. And it lost to a fucking markdown file.

What replaced it is embarrassingly plain:

1. **The plan.** One markdown file: what we're building, in what order, and what we're not doing. Reviewed before anything runs.
2. **The crew.** The coding agent reads the plan and fans it out to subagents. One agent, one worktree, always.
3. **The control room.** One terminal screen showing every agent across every repo: who's working, who's waiting on me, and who's finished and is now just sitting there judging me. Mine is [herdr](https://herdr.dev), which is basically tmux built for agents.

The intelligence moved out of my clever tool and into a boring file. I kept exactly one piece of Thrawn: the code gate. Nothing ships until I've seen the green board and typed in a one-time code. But only for my own stuff. At work, the sign-offs already do that job. **The gate moved to wherever accountability already sat.** That's the whole talk, really.

## This talk is about the grey

Take one change that needs a sign-off and draw it from start to done. AI shrank the build from days to hours: a wee yellow sliver at the start. Everything after it is grey, which is waiting for a human. Review. QA. Sign-off. That didn't move an inch.

We spent billions making the yellow bit smaller. **The interesting problem is the grey.**

Most of my solo work barely has any grey. It goes from in progress to done in under a day. Except for one properly governed client, where the same factory, the same machine and the same me take four days. It isn't the AI that sets the speed. It's the stakes.

And the bit that got me: Whitespace started moving towards spec-level review, docs written for agents, and smaller tickets. That's exactly what my solo factory learned the hard way. Ten people with real governance, and one eejit at midnight, arriving at the same answer separately.

The ones I don't like: Whitespace breaks a lot less than I do. Its review stops real bugs reaching production, and the governance is doing its job. I hate it. The machine is incredibly fast at going the wrong way: a Ferrari with the sat nav set to "surprise me". And code got cheap to write and expensive to read, so review time is up in both worlds.

So if review is where all the time goes, how much of it does each change actually deserve?

## The model

You know one-way doors: go slow on decisions you can't reverse, go fast on the ones you can. That's lovely advice when you make three big decisions a year and own a rocket company.

Now the machine makes a thousand changes a week. Building is nearly free. **Undo is the cost.** And the gate doesn't even need to be a person any more: in the cheap corner, the machine signs off the machine's work overnight. Middle management, asleep.

Two questions for every change. How bad is it if it's wrong? How hard is it to undo? Yes, it's a two-by-two. I'm a principal engineer, it's in the contract.

| | **Easy to undo** | **Hard to undo** |
|---|---|---|
| **Cheap if wrong** | **Let it run.** Tests and an overnight agent sign it off. | **Review the plan, not the diff.** Agree the spec before the machine starts. |
| **Costly if wrong** | **Ship it, then watch.** Behind a flag, fast rollback, a human looks after release. | **Put a human in the way.** Named sign-off before release, every time. |

### Both worlds, every corner

| Quadrant | The governed team | My consultancy |
|---|---|---|
| Let it run | A nightly test run signs it off | An overnight agent signs it off |
| Review the plan | Migrations, changes to the shape of the graph | Migrations |
| Ship it, then watch | QA sign-off, design QA | Me |
| Put a human in the way | QA, then product, then the customer | The client |

**Let it run.** On 8 August, Dependabot bumped Rails on funeralsni and the build broke. The gate completely missed it, and it didn't matter: reverted at 08:20, properly fixed by 08:31. Eleven minutes, no meeting, nobody noticed. In this corner you don't need a perfect gate. You need a fast undo.

**Review the plan.** On 18 January, a migration on a tiny landing-page app fell over in production because the tables were already there. Nobody died, but you can't un-run a migration. Agree it before the machine starts, not line by line after it's finished.

**Put a human in the way.** I'll say this one straight. funeralsni publishes funeral notices for Northern Ireland, and people subscribe to them. A bug that emails the wrong death notice to everyone in a town can't be unsent. A family has already read it. That's a one-person consultancy's app, and it's the human-in-the-way corner every single time.

The most irreversible change I could find wasn't in the sovereign AI world. **Stakes don't come from team size.**

### A confession about the third corner

Both my worlds still make costly-but-reversible work wait before it ships: QA sign-off at work, me at home. We treat it as a one-way door, and it isn't one. Once undo is cheap, watching after release beats waiting before it. That's the biggest speed-up left on the table for a team of ten and a team of one. Including me. Especially me.

### Try it on your own work

Think of the last change you shipped. Don't tell me. Put it in a box.

| If it's… | …and… | It belongs in | The gate it deserves |
|---|---|---|---|
| Cheap if wrong | Easy to undo | Let it run | Tests, plus an agent or a nightly run. Nobody waiting. |
| Cheap if wrong | Hard to undo | Review the plan | A human agrees the spec first. No line-by-line diff review. |
| Costly if wrong | Easy to undo | Ship it, then watch | A flag, a one-command rollback, and someone who looks after release. |
| Costly if wrong | Hard to undo | Put a human in the way | A named person signs off before it goes out. |

Now look at the gate it actually went through. If the two don't match, that's either expensive fear or a near miss.

## The recipes

The model tells you *where* each gate goes. The recipes are *how* I run them. And here's the trick in nearly all of them: each one is a control the regulated world invented (error budgets, separation of duties, audit trails, least privilege) and agents have made cheap enough for a team of one.

### Recipe 1: An autonomy budget

- **When:** cheap if wrong, easy to undo.
- **You need:** a revert count per repo, per quadrant, for agent-merged work.
- **Do:** agents merge on their own while reverts stay under budget. Blow the budget and they're grounded: that kind of work moves up a gate, to a human, until it earns its way back down.

Error budgets, but for agent autonomy. Trust isn't something you hand the machine once. It's earned per repo and per quadrant, and it can be lost. The funeralsni revert counted against the budget, which is the system doing its job.

### Recipe 2: The pre-mortem agent

- **When:** cheap if wrong, hard to undo.
- **You need:** a `plan.md`, and a second agent with no stake in it.
- **Do:** before a human sees the plan, the second agent gets one instruction: *"This plan shipped and caused an incident. Write the post-mortem."* Fix the plan against that story. Then I review it, and only then does it fan out.

"Review this plan" gets you generic objections. "Tell me how this exact plan fails" gets you a specific disaster you can prevent. It's horribly good at it.

### Recipe 3: The shadow run

- **When:** costly if wrong, easy to undo.
- **You need:** the old code path, the new one, and a diff of their outputs.
- **Do:** run the agent's new path beside the old one in production, on real traffic, with its output compared but never used. Flip only when the diff is clean.

This is how you fix the third corner. The change is live but has no consequences until it's proved, which buys undo for a change that would otherwise need a human waiting in front of it.

### Recipe 4: Separation of duties, for agents

- **When:** costly if wrong, hard to undo.
- **You need:** three agents with separate contexts, a hook, and a human.
- **Do:**
  - **Author:** one agent writes the code.
  - **Tester:** another writes the tests from the spec, and **never sees the implementation**, so it can't write tests that just agree with the code.
  - **Reviewer:** a third reviews, and it's never the model that wrote the code.
  - A hook enforces the separation, and a human signs last.

Three agents that can't collude. Enforce it with a hook, not a prompt. **A prompt is a suggestion. A hook is law.**

There's always a human at the end, because **the machine can do everything except be accountable.** It can't be blamed, it can't be fired, and it can't sit in the meeting about the meeting. In my consultancy that human is me and my one-time code. In a governed team it's a chain of named people: QA, then product, and for the highest-stakes work, the customer. Different gate, same corner.

### Recipe 5: The quadrant as code

- **When:** always. This is the 2×2 as infrastructure.
- **You need:** a commit trailer, a hook, and a CI check.
- **Do:** every task in the plan and every commit carries a `Quadrant:` trailer next to its `Co-Authored-By` line. The agent proposes it, the plan review confirms it, and CI checks that the change went through the gate its quadrant demands.

```text
Make Active Storage migration idempotent

Quadrant: cheap-irreversible
Gate: plan-reviewed
Co-Authored-By: Claude <noreply@anthropic.com>
```

And now the git history is an audit trail:

```bash
git log --grep='Quadrant: costly-irreversible' \
  --format='%h %s %(trailers:key=Gate)'
```

Every hard-to-undo change, and who let it through. In a regulated company, that's an audit. In mine it's a git log. **Same thing. Minus four meetings.**

### Recipe 6: Turn your reviewers into standards

- **When:** review has become your bottleneck. It has.
- **You need:** a few dozen real review comments from your own team.
- **Do:** boil them down into a written standards doc. Give it to your agent reviewer word for word, have it use the sections as its checklist, and have it cite the section in every objection so you can look it up and argue with it.

I took 50 real review comments from 15 merge requests (the actual nitpicks real people left on real code) and turned them into a 244-line standards doc. Generic review prompts find generic problems. This one started catching what our best reviewers catch:

- agreement promised in a comment but never enforced in the code
- constants that are only right by coincidence
- code branching on prose produced elsewhere in the same program
- "simplifications" that are really just duplication wearing a hat

**Generic review finds generic things.** Write your best reviewer down once, and they review every change forever. They don't even have to come in to work.

## More from the recipe book

### Least privilege per quadrant

Agents working in the let-it-run corner literally can't touch migrations. Their allowed paths and credentials are scoped to their quadrant. The gate isn't a rule they follow, it's a wall they can't get through.

### The overnight agent

A scheduled agent works while I sleep: dependency upgrades, flaky tests, small fixes. It opens PRs that merge when the autonomy budget allows, and I read the summary over breakfast. It's most of the "after midnight" in the numbers below. Middle management, in action.

### Make the agent prove it's reversible

Every migration an agent writes has to ship with its own rollback and a test that runs it twice, and the reviewer standards enforce it. Here's the January fix that started it, one line that made a migration safe to run twice:

```ruby
class CreateActiveStorageTables < ActiveRecord::Migration[7.0]
  def change
    return if table_exists?(:active_storage_blobs)
    # ...
```

### The lessons loop

After every run, an agent reads the logs and writes up what went wrong in the repo's context, so the next run starts smarter. The factory learns from its own mistakes, which is more than I do.

### Hire a sceptic

An agent persona with memory whose only job is to argue against the plan. Mine is the [skeptic](https://github.com/swmcc/agentic-development/tree/main/souls). Losing an argument to a persona is cheaper than losing a week to a bad plan.

### Audit your fear

You're approving every command your agent runs, aren't you? Feels safe. By the fiftieth prompt you're not reading them, you're going yes, yes, yes. That isn't a gate. **That's the nodding dog of security**, and it's worse than no gate because it feels like one.

I did it for months. Now a classifier waves the routine stuff through, and the prompts I actually see are worth reading. List every deny rule and approval prompt you have, note for a month what each one actually blocked, and bin what guards nothing. **Fear puts human-in-the-way gates on let-it-run work.**

## Buy undo

If governance follows how hard something is to undo, the obvious move is to make more things undoable.

You've heard "shift left": do the checks earlier. Here's the other way to shift left. Make the change easier to undo, and it slides left across the 2×2. One shifts the review. The other shifts the risk. Feature flags, migrations that run twice, rollback in one command, small changes.

Undo is the most effective governance tool ever shipped, and it has never once needed a steering committee. **The cheapest governance is an undo button.** Some work can never be made undoable, and that's where you put your best humans.

## Where it all breaks

If you've been reading this with your arms folded thinking "hang on": you're right.

The 2×2 judges each change on its own. But a thousand perfectly undoable changes can add up to an architecture nobody on earth can undo. Every change was reversible. The mess isn't.

So the 2×2 governs changes, not drift. Drift needs its own gate: a human looking at the shape of the whole system on a schedule and asking, "would we build it this way today?" That's the senior engineer's job in both worlds, and the machine makes it more important, not less. Sorry, seniors. You're not getting replaced. You're getting promoted to the hard bit.

## And the juniors

Hello world, the blog, the terrible web server: that's how we all learned judgement. Write a lot of code, get most of it wrong, get shouted at. The machine writes the code now, so that path is disappearing. Build the apprenticeship on purpose:

- A junior writes the plan, and a senior pulls it apart before the machine runs.
- Juniors own a let-it-run gate, where being wrong is cheap.
- Review the machine's output in pairs, senior and junior, out loud.

If we don't, in five years nobody will be qualified to stand in the human-in-the-way corner. And that's the one corner the machine can't stand in.

## By night, from my git log

The only figures in this post come straight from git: my own commits since 1 January, across 35 repos. These are personal repos only, with nothing from my day job.

- **A quarter of a million lines changed:** 183,601 added and 69,604 deleted, with lock files, vendored and generated code taken out.
- **1,004 commits**, 472 of them with a Claude co-author line. That undercounts, because plenty of agent work doesn't get the trailer.

| | Commits | With a machine's name on them |
|---|---|---|
| 07:00 to midnight | 724 | 39% |
| Midnight to 07:00 | 280 | **68%** |

Before midnight I'm an engineer. After midnight I'm middle management.

## The essays behind the talk

- [Building Thrawn](/projects/building-thrawn): the factory I built to clone myself.
- [Your Architecture Is the Bottleneck, Not the Model](/writing/your-architecture-is-the-bottleneck): why most of my work wouldn't split into parallel tasks.
- [Execution Stopped Being the Bottleneck](/writing/execution-stopped-being-the-bottleneck): two agent harnesses on the same five tickets.
- [The Platform Ate My Roadmap](/writing/the-platform-ate-my-roadmap): the audit that closed half my issues because the platform had already shipped them. Still bitter.

## What a team is for now

Can one engineer run the work of a whole team? Yes, mostly. One person and a machine can carry a whole app. I'm the proof, and I'm not even that good.

So a team isn't for typing any more. A team exists to hold judgement and accountability for the things you can't take back. Its job is to keep buying undo, to look after the shape, and to grow the people who'll stand where undo can't be bought.

A team of ten and a team of one. Same AI. Same factory. Same answer.

**Govern the undo, not the headcount.**

If you want to argue about any of this, I'm [swmcc on GitHub](https://github.com/swmcc). If you want help doing it in your own team, [SkillfulGorilla](https://skillfulgorilla.com) is how you hire me.

---

### Photo credits

The photos in the talk are from Wikimedia Commons:

- **Title**: [Goliath & Samson cranes at Harland and Wolff](https://commons.wikimedia.org/wiki/File:Ballymacarrett_-_Goliath_%26_Samson_cranes_at_Harland_And_Wolff_-_20240908093337.jpg), Hannah Forey, CC BY-SA 4.0
- **By day**: [Belfast Skyline City Quays](https://commons.wikimedia.org/wiki/File:Belfast_Skyline_City_Quays.png), Davidw1406, CC0
- **By night**: [Incandescent bulb lamp glowing on a desk at night](https://commons.wikimedia.org/wiki/File:Incandescent_bulb_lamp_glowing_on_a_desk_at_night.jpg), Sihyeon0621, CC BY-SA 4.0
- **Hello world**: [DEC VT100 terminal](https://commons.wikimedia.org/wiki/File:TSD_Computer_-,Schreib_und_B%C3%BCrotechnik_DEC_ASCII_Computer-Terminal_digital_VT_100.jpg), NoRud, CC BY-SA 4.0
- **And it died anyway**: [Flooded interior of abandoned factory](https://commons.wikimedia.org/wiki/File:Flooded_interior_of_abandoned_factory.jpg), saskialisette, CC BY-SA 4.0
- **One-way doors**: [Old wooden door](https://commons.wikimedia.org/wiki/File:Old_wooden_door%E2%80%93IMG_7297_02.jpg), Kızıl, CC BY-SA 4.0
- **Death notice**: [Letter box, High Street, Luddenden](https://commons.wikimedia.org/wiki/File:Letter_box,_High_Street,_Luddenden_-_geograph.org.uk_-_4253222.jpg), Humphrey Bolton, CC BY-SA 2.0
- **Expensive fear**: [Closed gate](https://commons.wikimedia.org/wiki/File:Closed_gate_-_geograph.org.uk_-_3702411.jpg), Bob Harvey, CC BY-SA 2.0
- **Where the model breaks**: [Bethesda aerial 2019](https://commons.wikimedia.org/wiki/File:Bethesda_aerial_2019_(dehazed).jpg), Antony-22, CC BY-SA 4.0
- **Undo button**: [Photoelasticity: TDK Head Cleaner](https://commons.wikimedia.org/wiki/File:Photoelasticity_-_TDK_Head_Cleaner_-_Black_background.jpg), Colin, CC BY-SA 4.0
- **How juniors learn**: [Ford assembly line in Copenhagen, 1923](https://commons.wikimedia.org/wiki/File:Ford_assembly_line_in_Copenhagen_1923.jpg), Peter Elfelt, public domain
- **Team of one**: [Single sculler at Eton Dorney](https://commons.wikimedia.org/wiki/File:Paralympics_rowing_at_Eton_Dorney,_Argentinian_single_sculler_-_geograph.org.uk_-_3114110.jpg), David Hawgood, CC BY-SA 2.0
- **What a team is for**: [German rowing eight, 1964](https://commons.wikimedia.org/wiki/File:German_rowing_eight_EK_1964c.jpg), Eric Koch for Anefo, CC BY-SA 3.0 NL
