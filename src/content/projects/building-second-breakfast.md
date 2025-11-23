---
title: "Building second_breakfast with AI"
description: "Letting AI agents drive 99% of development work using Claude Code and GitHub Copilot to push the boundaries of intelligent automation"
pubDate: 2025-11-23
tags: ["rails", "ai-driven", "claude-code", "github-copilot", "automation", "architecture"]
---

## The Experiment

This is a standard Rails 8 monolith. PostgreSQL database. Hotwire for progressive enhancement. Tailwind CSS for styling. The Solid suite for caching, queuing, and cables. I've built this stack dozens of times.

But second_breakfast is different. I resurrected this project during my autumn 2025 renaissance not to build another recipe tracker, but to answer a specific question: How far can modern AI agents autonomously drive software development?

## The Standard Pattern vs. The AI-Native Pattern

In my usual workflow, AI assists with implementation details. Claude helps with CRUD boilerplate and refactoring logic. GitHub Copilot autocompletes patterns. I design the architecture, make the strategic decisions, and orchestrate the build. AI handles the tactical execution.

second_breakfast inverts this. AI drives strategy and execution. I observe.

The goal is 99% autonomous development using [Claude Code](https://claude.ai/claude-code) orchestrating architecture, CRUD operations, and feature implementation, with GitHub infrastructure handling code review, deployment pipelines, and automated quality checks. As of late November 2025, this is a greenfield experiment.

## The Architecture

**Core Stack**
- Rails 8.1.1 on Ruby 3.3.1
- PostgreSQL for primary database
- Solid Cache, Solid Queue, Solid Cable (Rails 8 defaults)
- Hotwire (Turbo + Stimulus) for frontend interactions
- Tailwind CSS 3 for styling
- Active Storage with libvips for image processing

**Infrastructure**
- GitHub Actions for CI/CD
- RuboCop for linting
- Brakeman for security scanning
- PostgreSQL migrations managed via Active Record

This is deliberately conventional. The innovation isn't the stack - it's the development process.

## How It Works

### Claude Code as Developer

[Claude Code](https://claude.ai/claude-code) isn't just writing code. It's the primary developer:

- Database schema design and migrations
- CRUD operations and business logic
- Controller actions, model validations, and views
- Dependency management and version upgrades
- CI/CD pipeline configuration
- Security audits and vulnerability remediation
- Issue creation and project planning

When I upgraded from Rails 8.0 to 8.1, migrated from SQLite to PostgreSQL, and configured GitHub Actions, Claude Code executed the entire workflow. No hand-holding. No micro-management. Strategic direction, autonomous execution.

### GitHub Infrastructure as Quality Gate

Where Claude Code handles development work, GitHub infrastructure provides automated oversight:

- **Actions**: CI pipeline runs linting, security scans, and tests
- **Dependabot**: Creates dependency update PRs
- **Code Review**: Automated checks validate quality before merge

The division is deliberate. Claude Code writes features. GitHub validates them.

## The Workflow

1. **Issue Creation**: Claude Code generates GitHub issues with detailed implementation checklists
2. **Branch Strategy**: Standard Git flow with feature branches
3. **Development**: Claude Code implements features autonomously
4. **Code Review**: GitHub Actions runs linting, security scans, and tests
5. **Merge**: Automated merge on successful CI
6. **Dependency Updates**: Dependabot creates PRs, Claude Code reviews and merges

Once the application reaches stability, the next phase begins: complete autonomy. GitHub issues describe features, Claude Code implements them, GitHub infrastructure validates quality, and merges happen without human intervention.

## What I'm Learning

Early observations from late November 2025:

**AI Excels At:**
- Dependency management and version upgrades
- Boilerplate CRUD operations
- Migration scripts and schema changes
- CI/CD configuration
- Security vulnerability remediation
- Documentation generation

**AI Struggles With:**
- Ambiguous product requirements
- Complex business logic with edge cases
- Performance optimisation without profiling data
- Architectural trade-offs requiring domain expertise
- Debugging obscure production issues

**Human Intervention Required For:**
- Product vision and feature prioritisation
- Design system decisions
- Data modelling for complex domains
- Strategic technical debt management
- Understanding user needs and workflows

## The Test Bed Philosophy

second_breakfast is infrastructure for discovery. I'm not trying to prove AI can replace developers. I'm discovering where the boundaries are.

What can AI genuinely own end-to-end? Where does human judgement remain irreplaceable? What does the developer role look like when 99% of implementation work is automated?

This isn't a demonstration project. It's a laboratory. The code matters less than what I learn building it.

## Current Status

As of November 2025:
- Rails 8.1.1 upgraded and PostgreSQL migrated (AI-driven)
- CI/CD pipeline configured (AI-driven)
- Makefile for development commands (AI-driven)
- Security scanning with Brakeman (AI-driven)
- 15 GitHub issues created for future development (AI-driven)
- Application structure complete, features pending

Next phase: Issue-driven autonomous development with AI agents implementing features from GitHub issues whilst I observe the process, intervene only when necessary, and document what works and what fails.

## Why This Matters

We're at an inflection point. AI-assisted development is common. AI-driven development is emerging. Understanding the difference matters.

This project exists to map that territory. Not with speculation or theory, but with working code, real constraints, and documented failures.

The goal isn't to eliminate developers. It's to discover what development looks like when intelligent automation handles the mechanical work, freeing humans to focus on problems that actually require human insight.

second_breakfast is the test bed. The real output is understanding.
