---
title: "tvdb_api: A Ruby Gem I Don't Use"
description: "Why I built a Ruby gem for TheTVDB API when considering Ruby for whatisonthe.tv, and why I ultimately chose FastAPI instead"
pubDate: 2025-11-14
tags: ["ruby", "api-client", "open-source"]
---

## The Project

[tvdb_api](https://github.com/swmcc/tvdb_api) is a Ruby gem for [TheTVDB](https://thetvdb.com/) API. It's published on [RubyGems](https://rubygems.org/gems/tvdb_api) and provides a straightforward Ruby interface for fetching TV series and movie metadata.

I built it in 2023 when I was considering Ruby for [whatisonthe.tv](/projects/building-whatisonthetv). The gem shipped, the tests passed, and it's available for anyone to use.

I just don't use it myself.

## Why I Built It

When I started planning whatisonthe.tv, I was considering Ruby for the backend. The existing Ruby gems for TheTVDB were either outdated, unmaintained, or poorly documented. So I built tvdb_api - a clean, tested Ruby wrapper for TheTVDB's API.

The gem provided:
- Simple interface for fetching series, episodes, and movie data
- Caching of API responses to reduce external calls
- Error handling for rate limits and network failures
- Test coverage with RSpec

It worked well. But I never used it for whatisonthe.tv.

## Why I Chose FastAPI Instead

As I built out the architecture, I realised Ruby wasn't the right choice for whatisonthe.tv's specific requirements:

**I/O-Bound Workload**

whatisonthe.tv makes frequent external API calls to TheTVDB. Every series lookup, every episode fetch, every metadata update involves waiting for network I/O.

Ruby's threading model means each request blocks whilst waiting for external API responses. FastAPI's async/await means I can handle hundreds of concurrent requests without blocking - requests wait on I/O without tying up threads.

**Performance Under Load**

For a personal project, performance might not matter. But I wanted to build it right. FastAPI on ASGI can handle significantly more concurrent requests because of its async nature.

The [database-first caching pattern](/projects/building-whatisonthetv#the-caching-pattern-database-first-with-async-refresh) I implemented benefits massively from async I/O - database lookups, cache checks, and background API calls all happen concurrently without blocking.

**Type Safety End-to-End**

Pydantic provides runtime validation and automatic API documentation generation in FastAPI. Python's type hints aren't just documentation - they're enforced at runtime. Request validation, response serialisation, and OpenAPI documentation all come from the type definitions.

Ruby has type annotations (Sorbet, RBS), but they're not as deeply integrated into the ecosystem as Python's type hints are with FastAPI.

**Separation of Concerns**

I wanted the backend to be a pure API with no frontend rendering. FastAPI is purpose-built for APIs.

The separation forced me to design clean API contracts and allowed me to build the SvelteKit frontend independently.

## What I Learned

**Choose The Right Tool For The Problem**

whatisonthe.tv's requirements (async I/O, API-only backend, external API aggregation) aligned better with FastAPI than Ruby.

The gem still exists and works. I just chose a different tool for my specific use case.

**Libraries Follow Use Cases**

I built tvdb_api because the existing Ruby gems for TheTVDB were outdated or unmaintained. But the limited ecosystem probably reflects limited demand - most Ruby developers building TV tracking apps either don't exist in large numbers or use different approaches.

**Shipping Is Separate From Using**

I stopped active development of tvdb_api in 2023 when I committed to FastAPI for whatisonthe.tv. The gem is archived - I'm not maintaining it - but it's published, functional, and available on RubyGems.

Several other Ruby TVDB libraries exist with more active maintenance. I'm not sure what adoption tvdb_api has (if any), but it's there if someone needs it.

Building it wasn't wasted time. It forced me to understand TheTVDB's API thoroughly, which informed the [Python implementation](/projects/tvdb-v4-python) I contributed to later.

## Current Status

The gem is **archived**. It's functional, tested, and published on RubyGems, but I'm not actively maintaining it.

If you need a Ruby client for TheTVDB, there are [several other options](https://rubygems.org/search?query=tvdb) with more active maintenance. I'm not sure what adoption tvdb_api has (if any), and that's fine - it served its purpose as an exploration before I chose the right architecture for whatisonthe.tv.

## Conclusion

tvdb_api shipped. It's published on RubyGems, functional, and available for anyone who needs a Ruby client for TheTVDB.

I just chose a different stack for whatisonthe.tv. That's not failure - it's good decision-making. The gem informed the architecture I ultimately built, even if it didn't power it.

whatisonthe.tv is better as FastAPI + async PostgreSQL + SvelteKit for its specific requirements. [Jotter](/projects/building-jotter) is better as a Rails monolith for its requirements.

Different problems, different tools.

You can view the gem on [RubyGems](https://rubygems.org/gems/tvdb_api) and the source on [GitHub](https://github.com/swmcc/tvdb_api).
