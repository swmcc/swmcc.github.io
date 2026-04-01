---
title: Maintaining Open Source in the AI Era
description: Reflections on building and maintaining Ruby and Python packages, how AI has changed the process, and why I'm not entirely sure it's for the better
pubDate: 2026-03-17T00:00:00.000Z
tags:
  - open-source
  - ai
  - ruby
  - python
  - developer-tools
syndicate: true
devtoId: 3442474
---

I've been maintaining a handful of open source packages lately: [mailview](https://pypi.org/project/mailview/), [mailjunky](https://pypi.org/project/mailjunky/) (in both Python and Ruby), and recently dusted off an old Ruby gem called [tvdb_api](https://rubygems.org/gems/tvdb_api/). The experience has been illuminating - not just about package management, but about how AI is changing open source development in ways I'm still processing.

## The Packages

**mailview** started because I missed [letter_opener](https://github.com/ryanb/letter_opener) from the Ruby world. When you're developing a web application, you don't want emails actually being sent - you want to inspect them locally. In Rails, letter_opener handles this beautifully. In Python? The options were less elegant. So I built mailview: add the middleware to your FastAPI or ASGI app, and every outgoing email gets captured and displayed in a clean browser UI at `/_mail`.

**mailjunky** is the SDK for a transactional email service I use. I wrote both Python and Ruby versions because I work across both ecosystems and wanted a consistent interface. The Python version powers the email notifications in [whatisonthe.tv](https://whatisonthe.tv), sending watchlist digests and update notifications.

**tvdb_api** is older. I wrote it years ago when I needed to fetch TV show metadata from TheTVDB. Recently I came back to it and found... well, it had aged poorly.

## When Code Goes Stale

Opening tvdb_api after several years was humbling. The code still worked, technically, but it was written for a different era of Ruby. No keyword arguments where they'd make sense. Inconsistent error handling. Dependencies that had moved on. The API it wrapped had evolved through multiple versions.

This is the reality of open source maintenance that doesn't get discussed enough. You release something, people use it, and then life happens. You move to different projects. The ecosystem evolves. What was idiomatic becomes dated.

I spent a weekend modernising tvdb_api. Keyword arguments throughout. Proper exception hierarchies. Updated API support. Modern testing practices. The gem that emerged was recognisably the same tool but felt contemporary rather than archaeological.

The irony isn't lost on me that I did this modernisation with Claude's help. More on that shortly.

## Ruby vs Python: A Tale of Two Package Managers

Here's where things get interesting. Publishing to RubyGems versus PyPI in 2026 is a study in contrasts.

RubyGems feels... creaky. The authentication flow is clunky. The web interface looks dated. I've hit mysterious failures that resolved themselves without explanation. The documentation assumes knowledge that new maintainers might not have. It works, but it feels like infrastructure that's been maintained rather than evolved.

PyPI, meanwhile, has embraced [Trusted Publishing](https://docs.pypi.org/trusted-publishers/). You configure your GitHub repository as a trusted publisher, and your GitHub Actions workflow can publish packages without storing API tokens as secrets. The authentication happens via OpenID Connect - GitHub attests to the identity of the workflow, PyPI trusts that attestation.

The practical difference is significant:

```yaml
# PyPI with Trusted Publishing - no secrets needed
- name: Publish to PyPI
  uses: pypa/gh-action-pypi-publish@release/v1
```

Compare this to RubyGems, where you're still managing API keys, storing them as secrets, and hoping you've configured the authentication correctly.

For mailview and mailjunky-python, I set up Trusted Publishing and the release process is now: tag a release, push the tag, and GitHub Actions handles the rest. For the Ruby packages, there's more ceremony involved, and I've had releases fail for reasons that weren't immediately clear.

I don't want to overstate this - RubyGems works and millions of packages depend on it. But PyPI's investment in modern authentication patterns has made the maintainer experience noticeably better.

## AI Changed Everything (And I'm Not Sure How I Feel About It)

Here's where I need to be honest about something uncomfortable.

All of these packages were built with significant AI assistance. Claude helped write the initial implementations. It helped with test coverage. It modernised tvdb_api's Ruby patterns. It debugged edge cases I would have spent hours tracking down.

The productivity gains are real. What might have taken weeks of evening and weekend work happened in days. Features that I might have cut for time made it in. Test coverage that I might have skipped got written.

But.

I look at open source differently now, and I'm not sure it's for the better.

When I review pull requests on other projects, I find myself wondering: did a human think through this change, or did an AI generate it and a human click approve? When I encounter a bug in a library, I wonder: was this edge case missed because the AI-generated tests didn't think to cover it?

The social contract of open source has always been implicit: someone cared enough about this problem to spend their limited time solving it. That investment of human attention was a signal of quality, of thoughtfulness. It's why we trusted small libraries maintained by individuals - someone was paying attention.

AI disrupts this calculus. I can now create a package in an afternoon that would have taken weeks. But has the thoughtfulness kept pace with the speed? I've tried to maintain the same standards I would have without AI assistance, but I'm not certain I've succeeded. And I definitely can't evaluate whether other maintainers have.

## The Testing Paradox

This concern crystallises around testing. AI is excellent at generating tests. Given a function, Claude will produce comprehensive test cases covering happy paths, edge cases, error conditions. The coverage numbers look great.

But test generation isn't the same as test thinking. When I write tests manually, I'm forced to think about how the code will be used. What assumptions am I making? What could go wrong? What would a user reasonably expect?

AI-generated tests cover the code that exists. Human-written tests often reveal the code that should exist. There's a subtle but important difference.

I've tried to mitigate this by reviewing AI-generated tests carefully and adding cases that emerge from my understanding of how the package will be used in practice. But I'd be lying if I said every test got that level of attention.

## What I've Learned

A few things have become clearer through this experience:

**Maintenance is the hard part.** Writing the initial code is the easy bit. Keeping it current, fixing bugs, responding to issues, updating dependencies - that's where open source lives or dies. AI helps with maintenance too, but it doesn't solve the fundamental problem of limited human attention.

**Modern tooling matters.** PyPI's Trusted Publishing removed a category of release friction entirely. When releasing is easy, releases happen more often. When it's painful, packages go stale. This is boring infrastructure work, but it has real effects on ecosystem health.

**AI is a force multiplier, not a replacement.** The packages I'm happiest with are ones where I used AI to handle the mechanical work while staying engaged with the design decisions. The ones where I let AI drive too much feel... hollow, somehow. Technically correct but lacking in soul.

**Transparency matters.** I've started noting in my projects when AI was used significantly in development. Not as a warning, but as context. Users can decide for themselves what that means.

## Where This Leaves Me

I'm going to keep maintaining these packages. People use them, and I use them myself. The experience has made me more thoughtful about what I'm building and why.

But I watch the open source ecosystem with more concern than I used to. The barriers to creating packages have dropped dramatically. That's good for getting solutions out there quickly. I'm less sure it's good for the long-term health of software we all depend on.

Maybe I'm worrying about nothing. Maybe AI-assisted development will become so normal that these concerns seem quaint. Maybe the tooling will evolve to help us distinguish thoughtful work from generated slop.

For now, I'm trying to hold myself to the standards I had before AI assistance was available, while being honest that the assistance exists. It's an imperfect balance, but it's the best I've found.

The packages are on PyPI and RubyGems if you want to use them. They work. I've tested them. Claude helped.

Make of that what you will.
