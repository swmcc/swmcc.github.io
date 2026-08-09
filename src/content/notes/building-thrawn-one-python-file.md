---
title: "Building Thrawn: One Python File, No Dependencies"
pubDate: 2026-08-09T00:00:00.000Z
tags:
  - python
  - agentic-development
  - orchestration
  - claude
---

I've been building [Thrawn](https://github.com/swmcc/agentic-development/tree/main/thrawn), an orchestrator that takes a ticket, plans it with a strong model, then executes the plan as parallel agents in isolated git worktrees. The [project page](/projects/building-thrawn) covers what it does and the [experiments write-up](https://experiments.swm.cc/thrawn/) covers whether it's actually a good idea. This note is about how it's built, because the engineering turned out to be more interesting than the AI.

## One file, stdlib only

`bin/thrawn` is just under 2,000 lines of Python. No dependencies, 3.11 or newer because that's when `tomllib` landed. Installation is a symlink into `~/.local/bin`.

That's a deliberate choice, not laziness. Internal tools die from dependency management. The virtualenv rots, a transitive dependency breaks on a new machine, and six months later the tool is dead because nobody can be bothered resurrecting it. A single stdlib file runs anywhere Python runs, forever.

## Agents are argv templates

Thrawn imports no AI SDK. A runner is a line of TOML:

```toml
[runners.haiku]
argv = ["claude", "--model", "haiku", "-p", "{prompt}",
        "--dangerously-skip-permissions",
        "--output-format", "stream-json", "--verbose"]
notes = "fast + cheap; mechanical edits, config changes, docs"
```

The `notes` field is injected into the planner's prompt so it can route each task to the cheapest model that can do it well. Adding a new agent, Codex, a local Ollama model, whatever comes next, is configuration rather than code. The integration surface is argv in, exit code out. Unix has been good at this since before I had a mortgage.

## The scheduler is a poll loop over files

Agents run detached, either as [Herdr](https://herdr.dev/) panes or as `start_new_session` process groups when Herdr isn't about. The orchestrator holds no pipe to them and no process handle. Instead, every agent's command line is wrapped before it launches:

```python
def wrapped_cmdline(argv, log, exit_file):
    cmd = " ".join(shlex.quote(a) for a in argv)
    return (
        "set -o pipefail; "
        f"{cmd} 2>&1 | tee {log} | {me} _fmt; ec=$?; "
        # write-then-rename so pollers never observe a half-written file
        f"echo $ec > {ef}.tmp && mv {ef}.tmp {ef}; "
        f"exit $ec"
    )
```

Three things are going on there. Output tees to a log so nothing is ever lost. The stream pipes through `thrawn _fmt`, the script invoking itself as a formatter to render the model's stream-json events as readable progress. And the exit code lands in a file via write-then-rename, because `mv` is atomic on the same filesystem and a poller must never read a half-written result.

The watch loop is then embarrassingly simple: poll the exit files, spawn any task whose dependencies are done, redraw the board.

```python
def deps_done(plan, state, task):
    return all(
        state["tasks"].get(d, {}).get("status") == "done"
        for d in task["deps"]
    )
```

That's the whole DAG scheduler. Because state is JSON on disk and the processes are detached, ctrl-c is completely safe. Kill the watcher, come back after lunch, `thrawn watch` again and it picks up exactly where it was. Crash-only design, learned from years of watching daemons die at the worst moment.

## Exit 0 is not enough

An agent exiting cleanly proves nothing. The poller checks that work actually exists on the task branch:

```python
if code == 0:
    proc = try_run(["git", "rev-list", "--count",
                    f"{base_commit}..{branch}"], cwd=repo)
    if proc.stdout.strip() == "0":
        code = 1
        ts["note"] = "runner exited 0 but committed nothing"
```

Models are cheerful about declaring victory. The orchestrator's job is to be the miserable one who asks for receipts.

## Cache invalidation, measured in commits

Before planning, Thrawn runs a recon pass: a read-only agent surveys the repo and writes a brief to `.thrawn/recon.md`, pinned to the current commit. Later runs reuse it, and staleness isn't measured in hours, it's measured in `git rev-list --count <recon_commit>..HEAD`. Fifty commits is the default threshold, and if the pinned commit has vanished under a rebase, that's unknowable, so it's treated as stale.

The clever bit is what happens with a stale brief. It isn't discarded. It gets injected into the planner's prompt with a health warning prepended: trust it for orientation, verify anything load-bearing against the actual code. Cache invalidation as a prompt engineering problem.

## Merge conflicts get triaged, not just retried

After the parallel tasks finish, an integration worktree merges each task branch with `--no-ff`. Conflicts dispatch an integrator agent, but only with consent; `auto_fix` defaults to false and `confirm()` returns false when stdin isn't a terminal, so nothing running unattended can answer yes to itself.

The part I'm most pleased with is check-failure triage. When a check fails after the merge, Thrawn reruns that exact check against the base commit in a separate worktree, then tells the fix agent which world it's living in:

- Fails on base too: the failure is pre-existing or environmental. Do not rework the feature code.
- Passes on base: the merge introduced it. Go fix what was merged.
- Can't run on base: say so, and establish the blame before touching anything.

Without that, a fix agent looks at a red check and starts "fixing" perfectly good feature code to route around a broken environment. With it, the agent gets a bisected diagnosis for the price of one extra check run.

## Nothing ships without the code

Zero configured checks means the run can never go green, because green with no evidence is just optimism. When every check does pass, the board prints a six-digit code generated with `secrets`:

```
ALL GREEN  ship code: 482913
→ thrawn ship gh-123 --code 482913
```

`thrawn ship` refuses unless the phase is green and the code matches. Typing it back is the entire ceremony, and it's the point of the whole system: it proves a human read the board before anything touched the remote. Agents working in parallel is a productivity story. Agents pushing to origin unsupervised is a horror story.

## Testing an orchestrator without burning tokens

The test suite never talks to a real model. Fake runners are shell scripts declared in a throwaway repo's config, the remote is a local bare repository, and the entire pipeline, plan through ship, runs end to end in pytest with no network. That's the payoff for making argv the integration surface: swapping a frontier model for a five-line shell script is trivial, and the orchestration logic gets exercised properly on every change.

## The old discipline

Strip away the novelty and Thrawn is subprocesses, log files, exit codes, atomic renames and git plumbing. The models are new. The discipline holding them together is the same one we've always needed, and it's the part that decides whether the thing survives contact with real work.
