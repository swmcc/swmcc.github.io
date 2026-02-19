---
title: "Custom Agents for Claude Code"
pubDate: 2026-02-19
tags: ["claude-code", "automation", "ai"]
---

Claude Code ships with a general-purpose agent, but it doesn't know your stack, your conventions, or your workflows. Custom agents fix that.

## The Setup

Agents live in `~/.claude/agents/`. Each is a markdown file with YAML frontmatter:

```markdown
---
name: code-reviewer
description: Senior-level code review with architecture focus
model: sonnet
tools:
  - Bash
  - Glob
  - Grep
  - Read
---

You are a principal engineer conducting code reviews...
```

The `tools` list constrains what the agent can do. A reviewer doesn't need `Edit` or `Write`. It's read-only by design.

## What Makes a Good Agent Prompt

**1. Explicit process steps**

Don't assume the model knows your workflow. Spell it out:

```markdown
## IMPORTANT: Process

1. **Gather context** - Run `git diff`, read modified files fully
2. **Understand intent** - What problem is this solving?
3. **Analyse systematically** - Work through each category
4. **Prioritise** - Must fix → Should fix → Consider
```

The model follows instructions better when they're numbered and imperative.

**2. What NOT to do**

Negative constraints prevent common failure modes:

```markdown
## What NOT to Do

- Don't nitpick style (linter's job)
- Don't block on personal preference
- Don't review code you haven't read
```

Without these, the agent will happily suggest renaming variables or adding docstrings you didn't ask for.

**3. Output format with examples**

Show the exact structure you want. The model will match it:

```markdown
## Output Format

### Must Address
- **Location**: file:line
- **Issue**: What's wrong
- **Why**: Impact/risk
- **Fix**: How to resolve
```

Include a worked example. One good example beats three paragraphs of explanation.

## Parallel vs Chained

**Parallel**: independent tasks that don't share state:

```
Run these agents in parallel:
- code-reviewer: review the PR
- security-auditor: check for vulnerabilities
```

Both run concurrently. Results come back together.

**Chained**: when output feeds into the next step:

```
1. Use api-designer to design the endpoint
2. Then use test-writer to create tests for it
```

Sequential. The test-writer sees the api-designer's output.

Use parallel when you can. It's faster and the tasks are cleaner.

## Trade-offs

**Advantages:**
- Consistent output format across runs
- Domain knowledge baked in (your stack, your patterns)
- Tool restrictions prevent accidents (read-only agents can't break things)
- Reusable across projects

**Disadvantages:**
- Maintenance overhead (agents drift as your practices change)
- Prompt engineering is trial and error
- Model updates can change behaviour unexpectedly

## My Setup

Ten agents covering the common workflows: `code-reviewer`, `security-auditor`, `debugger`, `test-writer`, `refactorer`, `api-designer`, `database-expert`, `devops`, `documentation`, `dependabot`.

The dependabot one saves the most time. It processes all open Dependabot PRs, rebases them, runs tests, and reports which are ready to merge. What used to be 20 minutes of tab-switching is now one command.

Worth the setup cost.
