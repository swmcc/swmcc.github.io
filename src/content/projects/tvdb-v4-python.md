---
title: "Contributing to tvdb-v4-python"
description: "Open source contributions to the official Python wrapper for TheTVDB API v4, adding tests and refactoring for maintainability"
pubDate: 2025-11-14
tags: ["python", "open-source", "testing", "refactoring"]
---

## The Project

[tvdb-v4-python](https://github.com/thetvdb/tvdb-v4-python) is the official Python wrapper for [TheTVDB](https://thetvdb.com/) API v4. TheTVDB is a comprehensive database for TV series and movies, providing metadata, episode information, cast and crew details, and artwork.

It's the library I use in [whatisonthe.tv](/projects/building-whatisonthetv) to fetch series and movie metadata from TheTVDB's API.

When I started using it in 2023, the library worked but lacked tests and had some structural issues that made it harder to maintain and extend.

## My Contributions

I contributed throughout [2023 and 2024](https://github.com/thetvdb/tvdb-v4-python/graphs/contributors), focusing on:

**Adding Tests**

The library had no test coverage. My contributions focused on adding tests to enable safe refactoring:
- Unit tests for core API client functionality
- Integration tests for endpoint responses
- Fixtures for common API response patterns
- Test coverage reporting

Tests are the foundation of safe refactoring. Without them, you're changing code blind.

## Current Status

The project appears to be dormant. The last commit was in [March 2024](https://github.com/thetvdb/tvdb-v4-python/commits/main).

I have [Pull Request #46](https://github.com/thetvdb/tvdb-v4-python/pull/46) open since March 2024 that adds additional test coverage and refactoring. It's waiting to be merged.

I'm not sure if the project is currently being actively maintained. The repository is still functional, and I continue to use it in whatisonthe.tv without issues.

## What I Had Planned

The project stalled before I could complete the refactoring work I'd intended. My plans were to:

1. **Refactor for DRY and SOLID**: Consolidate duplicate endpoint handling, single responsibility classes, dependency injection for configuration
2. **Increase test coverage** to 90%+ to ensure comprehensive coverage of edge cases
3. **Add type hints** throughout for better IDE support and runtime validation
4. **Refactor for async/await** to match whatisonthe.tv's async architecture (currently the library is synchronous)
5. **Add retry logic** with exponential backoff for failed API calls
6. **Improve error handling** with better error messages when API calls fail

The goal was fast red-green refactoring - tests passing, refactor, tests still passing. But the project went dormant before I could execute on most of this.

## Why I'm Still Using It

Despite the project being dormant, the library works well for my use case:
- [TheTVDB's API v4](https://thetvdb.github.io/v4-api/) is stable
- The core functionality is solid
- My tests ensure it continues to work as expected
- It integrates cleanly with my async SQLAlchemy setup via [Celery background jobs](/projects/building-whatisonthetv#celery-for-background-jobs)

As I explain in the [whatisonthe.tv article](/projects/building-whatisonthetv#the-caching-pattern-database-first-with-async-refresh), I use a database-first caching pattern where Celery workers fetch from TheTVDB in the background. The synchronous nature of tvdb-v4-python isn't a problem because it runs in separate worker processes, not the async FastAPI event loop.

I'm watching the repository for activity. If development resumes, I'll contribute the planned improvements. If it remains dormant, I'll continue using it as-is or fork if necessary.

## Lessons From Open Source

**Start With Tests**

You can't safely refactor without tests. Adding test coverage was the highest-value contribution I could make.

**Small, Focused PRs**

Large refactoring PRs are hard to review and often stall. Breaking work into smaller, focused changes increases the chance of merge.

**Maintenance is Unpredictable**

Open source projects go dormant. Maintainers move on, priorities shift, companies change direction. That's fine - the code still works, and forks are always an option.

**Use What You Contribute To**

The best contributions come from actually using the library in production. You find the rough edges, the missing features, the bugs that only appear under real load.

## Conclusion

Contributing to tvdb-v4-python taught me the value of adding tests before refactoring, the importance of SOLID principles in API client design, and the reality that open source maintenance is unpredictable.

The library powers whatisonthe.tv's metadata fetching, and I'll continue using it until it no longer meets my needs.

You can view the project on [GitHub](https://github.com/thetvdb/tvdb-v4-python) and see my [contributions here](https://github.com/thetvdb/tvdb-v4-python/graphs/contributors).
