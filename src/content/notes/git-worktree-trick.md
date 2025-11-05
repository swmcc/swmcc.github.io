---
title: "Git Worktree for Multiple Branches"
pubDate: 2025-10-28
tags: ["git", "productivity"]
---

Just learned about `git worktree` and it's genuinely useful.

Problem: Need to work on feature branch whilst also reviewing a PR or checking main. Usually means stashing changes and switching branches.

Solution: Multiple working directories for the same repo.

```bash
# Create a new worktree for a branch
git worktree add ../myrepo-feature feature-branch

# Now you have:
# ~/code/myrepo       (main branch)
# ~/code/myrepo-feature (feature branch)
```

Can have both open in different editors, run different dev servers, etc. Much cleaner than branch switching or having multiple clones.

Clean up when done:
```bash
git worktree remove ../myrepo-feature
```

List all worktrees:
```bash
git worktree list
```

Simple but effective.
