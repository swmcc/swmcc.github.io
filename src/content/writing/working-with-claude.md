---
title: "Working with Claude: A Senior Developer's Honest Take"
description: "After months of integrating AI into my development workflow, here's what actually works and why planning mode, skills, and tasks have been game changers"
pubDate: 2026-01-27
tags: ["ai", "workflow", "developer-tools", "productivity"]
---

I've been using Claude Code as part of my daily development workflow for several months now. This isn't a breathless endorsement or a dismissive rejection. It's an honest assessment from someone who's been writing software professionally for over two decades.

## It's a Tool. Treat It Like One.

Claude is a tool. A genuinely impressive one, but still a tool. It sits in the same category as my text editor, my terminal, and my version control system. I find this framing helpful - not to diminish what it can do, but to approach it practically.

Some of the hype around AI assistants oversells what they are. Junior developers aren't obsolete. Senior developers aren't being replaced. What's actually happening is more interesting: certain categories of work have become dramatically faster, and that changes what's practical to attempt.

AI assistants are particularly good at boilerplate, repetitive transformations, exploring unfamiliar codebases, and acting as a thinking partner. They still need human judgement for architecture decisions and business context. That's not a criticism - it's just understanding where the tool excels.

## The Workflow

My setup has evolved over these months. I've finally moved away from tmux after years of muscle memory. Ghostty with native splits handles my terminal needs now, and honestly, it's simpler. One less abstraction layer, one less thing to configure.

A typical session looks like this:

- **Left pane**: Claude Code running in the terminal
- **Right pane**: Shell for running tests, git operations, server logs
- **Editor**: Neovim in a separate window (some habits don't change)

Claude handles the tedious bits. Writing test scaffolding. Generating boilerplate for new modules. Explaining what some legacy code does before I refactor it. Drafting commit messages (which I usually edit - it's verbose by default, but that's easy to fix).

## The Game Changers

Three features have fundamentally changed how I work: planning mode, skills, and tasks. These aren't just conveniences - they've shifted how I approach problems.

### Planning Mode

Before I discovered planning mode, I'd sometimes watch Claude charge off implementing something before I'd fully thought through the approach. Now, for anything non-trivial, I start in planning mode.

The workflow is: describe what I want to achieve, let Claude explore the codebase, and then review a structured plan before any code gets written. This catches architectural issues early. It surfaces questions I hadn't considered. It means we're aligned on approach before investing time in implementation.

For complex features, I'll spend fifteen minutes in planning mode refining the approach. That investment pays back tenfold by avoiding wrong turns and rework. It's like having a technical design review built into the workflow.

### Skills

Skills are reusable prompts that encode workflow knowledge. I've built custom skills for my common tasks: code review, security audit, test generation, and more. Instead of explaining what I want each time, I invoke a skill and it applies consistent standards.

My `/review` skill knows how to examine git changes against the patterns I care about. My `/audit` skill applies security checks specific to my tech stack. These aren't just time savers - they're consistency enforcers. The review I get at 6pm after a long day is the same quality as the one at 9am.

The ability to chain skills is powerful too. I can run security audit, code review, and test coverage analysis in parallel, then synthesise the results. What used to be a morning's work happens while I grab a coffee.

### Tasks

The task system changed how I approach larger pieces of work. When I'm implementing a feature that spans multiple files or requires several steps, I ask Claude to break it down into tasks.

Each task becomes a tracked unit of work. I can see what's done, what's in progress, and what's blocked. Claude updates task status as it works, so I always know where we are. When I step away and come back, the context is preserved in the task list.

For a recent project, I had a twelve-task implementation plan. Being able to work through it systematically, with clear progress tracking, made a complex change manageable. It's project management integrated directly into the coding workflow.

## What Actually Helps

**Exploration**: When I'm dropped into an unfamiliar codebase, Claude can trace through call paths faster than I can grep. "Where does this function get called from?" is a question I used to spend twenty minutes on. Now it's seconds.

**Boilerplate**: Writing the fourteenth variation of a CRUD endpoint is mind-numbing. Claude handles it, I review and adjust. The code isn't clever, but it doesn't need to be.

**Documentation**: Drafting docstrings, README sections, or API documentation. I edit to match my voice, but having a solid starting point beats a blank page.

**Thinking partner**: Sometimes I explain a problem to Claude and realise the solution myself while typing. Other times, it suggests an approach I hadn't considered. Either way, it's valuable.

**Learning unfamiliar libraries**: When I need to use an API I haven't touched before, Claude provides working starting points. Better than Stack Overflow answers from 2019 that may or may not work with current versions.

## Where Human Judgement Matters

**Architecture**: Claude can suggest architectures, and the suggestions are reasonable starting points. But the "right" architecture depends on team size, existing infrastructure, deployment targets, and factors that require human judgement to weigh.

**Business logic**: When the correct behaviour depends on understanding why the business works a certain way, I need to provide that context. Claude works with what it can see in the code.

**Security-critical code**: I review generated code carefully when it touches authentication, authorisation, or sensitive data. Trust but verify.

## The Biggest Paradigm Shift I've Seen

I've been doing this long enough to have opinions about paradigm shifts. I remember when version control went from "nice to have" to essential. I watched the industry move from on-premise to cloud. I've seen languages rise and fall.

This is different. Not because AI is magic - it isn't. But because it changes the economics of certain tasks. Things that weren't worth doing because the effort exceeded the benefit are now tractable.

Writing tests for legacy code without tests? Used to be a multi-day investment that teams avoided. Now it's a few hours of guided generation and review. Documenting that internal tool nobody wants to maintain? Tedious but now practical. Exploring a new codebase before making changes? Used to take days of reading. Now I have a knowledgeable guide.

The shift isn't "AI writes code for you". It's "the effort required for certain tasks dropped significantly". That changes which projects are viable and which maintenance tasks actually get done.

## Human in the Loop

Every piece of generated code gets reviewed. Every suggestion gets evaluated against what I know about the system. I modify a fair amount of what Claude produces - sometimes because it's wrong, more often because I want it slightly different.

This isn't a complaint about Claude. It's the nature of working with any tool that doesn't have your full context. Claude doesn't know that this codebase has a quirk where that function behaves differently than its signature suggests. It doesn't know that the team agreed to avoid that pattern last month. It doesn't know that this feature will be deprecated next quarter.

The value is in the collaboration. Claude moves fast on the mechanical work. I provide context, make judgement calls, and catch issues that require institutional knowledge. Neither of us would be as effective alone.

## Practical Advice

If you're considering integrating AI tools into your workflow:

**Invest in planning mode.** It's tempting to skip straight to implementation, but the upfront investment in planning pays dividends.

**Build skills for your common workflows.** The time spent encoding your standards into reusable skills comes back quickly.

**Use tasks for complex work.** Breaking work into tracked tasks provides structure and makes progress visible.

**Learn the tool's patterns.** Claude has tendencies - certain stylistic preferences, default approaches. Knowing these helps you guide it effectively.

**Stay engaged.** The fundamentals still matter. Understanding algorithms, system design, debugging techniques - these inform how you evaluate and direct what the AI produces.

## Conclusion

Claude Code has genuinely improved my productivity. The combination of planning mode, skills, and tasks has created a workflow that's more than the sum of its parts. It hasn't replaced thinking, judgement, or experience. It's amplified them.

This is the most significant shift in how I work since I started using version control. Not because the AI is doing my job - it isn't. Because it's handling the mechanical work well enough that I can focus on the parts that actually require experience and judgement.

It's a tool. A good one. And like any good tool, it rewards learning how to use it well.
