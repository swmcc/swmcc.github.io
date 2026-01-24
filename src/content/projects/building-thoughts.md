---
title: "Building thoughts.swm.cc"
description: "A simple Rails microblogging app for quick thoughts, replacing a complicated workflow that didn't work on mobile"
pubDate: 2026-01-24
tags: ["rails", "pwa", "data-ownership", "microblogging"]
---

## The Problem

I wanted a place to share quick thoughts without the complexity of a full blog post or the limitations of social media. Initially, I built this into swm.cc directly as a `/thoughts` section - markdown files with frontmatter, just like my notes and blog posts.

It didn't work.

## Why the Original Approach Failed

The [commit that removed thoughts from this site](https://github.com/swmcc/swmcc.github.io/commit/2daffceeb8a0a1251740ad1016053fd133b01bea) tells the story. The workflow was too cumbersome:

**On Desktop:**
I could create a new markdown file, add frontmatter, write the thought, commit, and push. Five steps for a single sentence. Acceptable, but not frictionless.

**On Mobile:**
This is where it fell apart. Options were:

1. **GitHub mobile app** - Navigate to the repo, create a file, remember the exact frontmatter format, type on a phone keyboard, commit. Painful.
2. **Shell script via Shortcuts** - SSH into a server, run a script that creates the file, commits, and pushes. This worked but required maintaining the script, handling edge cases, and trusting iOS Shortcuts to execute reliably.

Either way, the friction was too high. Quick thoughts should be quick to capture. If posting takes longer than the thought itself, the system fails.

## The Solution: A Simple Rails App

[thoughts.swm.cc](https://thoughts.swm.cc) is a Rails 8 application. Twitter-inspired microblogging with 140-character posts and tags. Nothing revolutionary, but it solves the actual problem.

**The Stack:**
- Rails 8.1 with Ruby 3.4.4
- PostgreSQL for persistence
- Tailwind CSS 4 for styling
- Stimulus for minimal JavaScript interactivity
- Token-authenticated JSON API for posting

**Core Features:**
- Public timeline with tag filtering
- View count tracking per post
- Secure admin dashboard for management
- Dark mode support
- Responsive design

## PWA for Quick Posting

The app is installed as a Progressive Web App on my phone. One tap opens the posting interface. Type the thought, add tags, submit. Done.

This is the workflow I wanted - faster than opening Twitter, no algorithm, no engagement metrics, just a place to capture thoughts that I own.

## OpenGraph Generation

Each thought automatically generates OpenGraph metadata via a `before_save` callback. When someone shares a link to a specific thought, it renders properly on social platforms and messaging apps. Simple implementation, handled server-side, no external services.

## Owning the Data

This fits the same philosophy as [Jotter](https://jotter.swm.cc) and [the-mcculloughs.org](/projects/the-mcculloughs-org): own your data.

The combination is becoming useful:
- **Jotter's gallery** stores images I own
- **iOS Shortcuts** can upload images to Jotter
- **thoughts.swm.cc** links to those images

A photo, a caption, and full ownership of both. No Instagram, no Twitter, no platform that can change terms or disappear.

## What's Next

I'll add to this if I find myself using it regularly. The test is whether it becomes part of my daily workflow or sits unused like previous attempts.

Current usage suggests it's working. Low friction posting means I actually post. That was the goal.

## Source

You can view the source on [GitHub](https://github.com/swmcc/thoughts).
