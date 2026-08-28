---
title: Execution Stopped Being the Bottleneck
description: A friend warned me that parallel coding agents would blow the bank. So I ran the same five tickets through two different agent harnesses on the same subscription and let the ledger decide. The cost story dissolved on contact. What it revealed instead is that the constraint has moved somewhere more interesting.
pubDate: 2026-08-28T00:00:00.000Z
tags:
  - ai
  - agentic-development
  - orchestration
  - economics
---

A friend looked at my agent orchestrator and gave me a warning: "Claude -p will never benefit from caching. That's required to not blow the bank." He recommended I look at [pi](https://pi.dev/), a deliberately bare-bones agent harness, and drive a GPT model on a flat subscription instead.

It was good feedback in the way the best feedback usually is: wrong in the details and right where it counted. I wrote it up as [an issue with an experiment attached](https://github.com/swmcc/agentic-development/issues/8), defined the measurements before I started and let the ledger decide. This piece is about what happened, because almost none of it was what the warning predicted.

[Last time](/writing/your-architecture-is-the-bottleneck) the ledger told me my architecture was the constraint on parallel agents. This time it told me something stranger: the constraint I set out to measure barely exists, and the real one has moved somewhere nobody is looking.

## The bank was never in danger

The caching claim first, because it deserves a fair hearing. A single `claude -p` run is a full agentic session with dozens of model calls, and prompt caching works within it. Without that no agentic CLI would be affordable at all. What is true is that there is no reuse across invocations: every worker my orchestrator spawns starts cold, paying full price for the system prompt, the repo brief and its own exploration, multiplied by however many workers the plan calls for.

Whether that "blows the bank" depends entirely on the billing regime, and this is the part almost every cost conversation skips. On API pay-per-token, parallel workers on a strong model are genuinely the expensive way to do anything. On a subscription, headless workers draw from the same plan quota as everything else, and the calculus is rate limits rather than money. I am on the subscription. The bank was never involved.

Then came the twist that reframed the whole experiment. The advice was to adopt pi so I could put workers on a flat-rate GPT subscription. When I went to set that up, I discovered my existing Codex CLI was already authenticated against that same subscription. The quota offload I was being urged towards had existed on my machine the whole time. Nobody had checked, including me.

So the question stopped being "should I escape Claude's pricing" and became something better: two harnesses, one subscription pool, which one earns the traffic?

## Same five tickets, two harnesses, one ledger

The trial design was simple. Five small well-specified issues on a [Rails side project](https://github.com/swmcc/rails_love_letter): a typo bugfix, a schema hardening migration, a CI workflow, a value object and a cleanup task. Dispatch all five as parallel agents in isolated worktrees with [thrawn's swarm mode](https://github.com/swmcc/agentic-development), once with codex as the runner and once with pi. Score every branch the same way: would I merge this as it stands? The [full method and raw data](https://github.com/swmcc/agentic-development/blob/main/thrawn/docs/runner-trial-14.md) are in the repo, patches and task logs included.

Both harnesses committed credible spec-covered work on all five issues. Both passed the test I was quietly most interested in: the repo already had a CI workflow, so the CI ticket was really a judgement probe. Extend the existing file or blindly create a duplicate? Both extended. pi actually produced the single best branch of the ten, keeping security scan jobs in the workflow that codex silently dropped.

Then the differences. codex ran the linter and the tests before committing, unprompted, and went five for five green. pi did exactly what the prompt said and nothing more, which is its stated philosophy, and committed two branches with lint failures it never checked for. codex finished the batch in about two and a half minutes; pi took just over four. And the token story collapsed the original cost fear from the other direction: 85 percent of pi's volume was server-side cache reads. The provider was already doing, across a whole run, the thing the warning said could never happen.

The [scores and the verdict](https://github.com/swmcc/agentic-development/issues/14) went to the tracker like everything else. codex keeps the default seat on discipline. pi earns one anyway, because it was the only harness that reported per-task usage in a form my orchestrator could record automatically, and if routing decisions are ever going to be data-driven rather than vibes-driven, that telemetry is worth paying a lint fix for.

## Baked-in judgement versus bring-your-own

The discipline gap is the finding I keep turning over, because it is not a bug in either tool. It is two philosophies doing exactly what they promise.

codex ships as a tuned product. Its harness carries opinions about how an agent should behave: check your work, run what the repo runs, leave the tree clean. You cannot see those opinions and you cannot easily change them, but you benefit from them on every task. pi ships as a kit. Four tools, a tiny prompt and the explicit position that everything else is your job. Its ceiling is higher, as the best branch of the trial showed. Its floor is exactly as high as your prompts make it, as the two lint failures also showed.

For work you supervise, the kit is attractive. For work you fire and forget, the floor is what matters, because nobody is watching when the floor gives way. Unattended operation quietly converts operational judgement from a nice-to-have into the entire product. That framing settles a surprising number of tool debates in this space once you apply it.

## Where the bottleneck actually went

Here is the number that reframed my week. Ten credible branches, two full trial legs, roughly seven minutes of wall clock, marginal cost of zero. And the morning after the trial, the same machinery shipped the project's entire game engine: card effects, scoring, realtime updates and an end-to-end spec suite, issue by issue, while I was doing something else.

Execution used to be the thing you rationed. It is now effectively free at my scale, and the warning I started with was aimed at a constraint that had already dissolved. What is not free, and what every run of the trial spent lavishly, is the stuff either side of execution: issues groomed sharply enough that an agent can act on them cold, and review attention honest enough to catch the branch that looks right but is not. The five tickets worked because a human had already done the thinking that made them parallelisable. The ten branches still needed a human to say yes.

The last piece argued that architecture decides whether work can be parallelised at all. This one adds the corollary: once it can be, the economics stop being about tokens and start being about the human at each end of the pipeline. The scarce resource is not the model, and it turned out not to be the money. It is well-shaped work going in and judgement coming out.

## The ledger keeps the last word

Epistemic honesty, as ever. This is one trial, five curated tickets, a thin test suite and a single afternoon. It measured a best case and I knew that going in. The follow-up is already defined: both harnesses sit in the planner's rotation for a fortnight of ordinary ungroomed work, the usage capture now records every task and the [verdict](https://github.com/swmcc/agentic-development/issues/8) gets written from those numbers, not these ones.

But I will take the early lesson, because it cost me nothing to learn and the alternative was taking a stranger's cost model on faith. Measure your own constraint before you build around someone else's. Mine was never the bank. Yours probably is not either.
