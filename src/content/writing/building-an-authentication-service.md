---
title: "Extracting Authentication to a Microservice"
description: "Lessons from extracting authentication and authorisation into a dedicated microservice, including database migration, in-memory testing, and architectural decisions"
pubDate: 2025-11-07
tags: ["authentication", "microservices", "architecture", "testing", "database-migration"]
---

## The Problem

Authentication isn't a feature you bolt on - it's foundational infrastructure that deserves its own service boundary.

I recently architected and built a dedicated authentication and authorisation service, extracting it from a monolithic application where auth logic was tangled with business logic. Other services and applications now consume this auth service, creating a centralised identity provider that serves multiple consumers.

This is the story of the patterns I used, the trade-offs I made, and why I started with authentication as the foundation and am fanning out to related concerns (user profiles, preferences, permissions) as needed.

## Why Extract Authentication?

**Separation of Concerns**

Authentication is cross-cutting. Multiple applications needed it - the original monolith, new microservices, mobile apps, third-party integrations. Rather than duplicating auth logic across services, we extracted it into a dedicated identity provider.

This service handles only authentication and authorisation. User profiles (names, email addresses, contact information) will eventually live in a separate user service. User preferences (UI settings, notification preferences) will live elsewhere. We're deliberately starting narrow - focusing solely on "who you are" and "what you can do" - and expanding the domain model as requirements emerge.

By extracting auth into its own service, I:
- Centralised identity management across all consuming applications
- Made authorisation decisions consistent (same roles and permissions everywhere)
- Eliminated duplication of auth logic across services
- Created a single source of truth for authentication state

**Multiple Consumers, Unified Identity**

The auth service serves:
- The original monolith (being gradually decomposed)
- New microservices being built alongside the monolith
- Mobile applications requiring OAuth2 flows
- Third-party integrations needing API authentication
- Internal tools and admin dashboards

Each consumer gets the same authentication guarantees, the same permission model, and the same security posture. When a user's access is revoked, it's revoked everywhere. When permissions change, they change consistently across all applications.

**Independent Scaling**

Authentication patterns are different from business logic patterns. Auth services handle:
- High-frequency token validation (every API request across all services)
- Burst traffic during login periods (morning login rush, post-deployment re-authentication)
- Read-heavy operations (thousands of token validations per second vs occasional user creation)

Separating auth lets the team scale it independently based on its actual load characteristics, not the characteristics of the broader application. I designed it to optimise caching, connection pooling, and database read replicas specifically for auth workload patterns.

**Security Boundary**

Authentication credentials deserve isolation. By moving auth to its own service, we:
- Limited the attack surface (fewer services handling passwords)
- Simplified security audits (smaller codebase to review)
- Made credential rotation easier (one service to update)
- Improved secrets management (auth secrets stay in auth service)

## Is "Microservice" the Right Term?

Probably. The term is overloaded and often misused, but this fits the definition:
- Single responsibility (authentication and authorisation)
- Independent deployment
- Own database (not shared with other services)
- Communicated via HTTP APIs
- Stateless (tokens, not sessions)

We didn't build a microservice for the sake of it. We extracted auth because it made architectural sense - the boundaries were clear, the responsibilities distinct, and the benefits tangible.

## The Migration: SQLite to Production Database

**Starting with SQLite**

The initial prototype used SQLite. This was deliberate:
- Fast iteration during development
- No external dependencies (database is a file)
- Simple schema migrations (just delete the file and rebuild)
- Sufficient for proving the concept

**Migrating to PostgreSQL**

Once the patterns were validated, we migrated to PostgreSQL:
- Proper concurrency support (SQLite's locking is too coarse for production)
- ACID transactions for sensitive auth operations
- Foreign key constraints enforced at the database level
- Better query performance for complex permission lookups

The migration was straightforward because we'd abstracted the database layer from the start. The ORM handled most differences, and the handful of SQLite-specific quirks (like `INTEGER PRIMARY KEY` vs `SERIAL`) were isolated to schema definitions.

**Key Lesson: Start Simple, Migrate Later**

SQLite let us iterate fast without infrastructure overhead. PostgreSQL gave us production-grade reliability. Starting with SQLite and migrating later was the right trade-off for this project.

## In-Memory Testing

**The Pattern**

We run the entire test suite against an in-memory database. No fixtures, no seed data, no teardown scripts. Every test:
1. Spins up a fresh in-memory database
2. Runs migrations to create schema
3. Executes the test
4. Discards the database

**Why This Works**

- **Fast**: In-memory databases are orders of magnitude faster than disk-based
- **Isolated**: Each test gets a clean slate, no shared state between tests
- **Reliable**: No "test pollution" where one test's data affects another
- **Portable**: No external dependencies, tests run anywhere

**The Trade-off**

In-memory testing doesn't catch database-specific issues (locking behaviour, transaction isolation, query performance). We mitigate this with:
- Integration tests against a real PostgreSQL instance (run less frequently)
- Staging environment that mirrors production database configuration
- Database-specific features (like PostgreSQL's `JSONB` or full-text search) tested separately

**Key Lesson: Fast Tests Beat Comprehensive Tests**

Fast tests get run. Slow tests get skipped. We optimised for fast feedback loops, accepting that some edge cases would only surface in integration tests or staging.

## Architectural Patterns

**Stateless Token-Based Authentication**

We use JWTs (JSON Web Tokens) for authentication. This means:
- No session storage (stateless)
- Tokens contain user identity and permissions (self-contained)
- Other services validate tokens without calling the auth service (distributed validation)

Trade-off: Token revocation is harder (tokens are valid until they expire). We handle this with short expiry times (15 minutes) and refresh tokens for extending sessions.

**Role-Based Access Control (RBAC)**

Permissions are modelled as roles, with roles containing granular permissions. Users are assigned roles, and services check permissions rather than roles directly.

This separates "what a user can do" (permissions) from "who the user is" (role membership). Adding new permissions doesn't require changing user records - we modify role definitions instead.

**UUID Primary Keys**

All entities use UUIDs as primary keys rather than sequential integers. This adds complexity (UUIDs are 128-bit vs 64-bit integers, indexing is slightly slower, more storage overhead), but the benefits outweigh the costs:

- **Distributed generation**: Multiple services can generate IDs without coordination or collision
- **No information leakage**: Sequential IDs reveal record counts and creation order
- **Merge-safe**: Migrating data between environments doesn't require ID remapping
- **Future-proof**: Prepares for potential database sharding or multi-region deployment

The performance overhead is negligible for auth workloads, and the architectural flexibility is valuable.

**Layered Architecture**

The service is structured in layers:
- **API Layer**: HTTP endpoints, request validation, response formatting
- **Service Layer**: Business logic (authentication, token generation, permission checks)
- **Repository Layer**: Database access, query construction, transaction management

Each layer has a single responsibility. Testing is straightforward - mock the layer below, test the layer above.

## What We Got Right

**Database Abstraction from Day One**

I abstracted database access behind a repository pattern from the start. This made the SQLite → PostgreSQL migration trivial and enabled in-memory testing without touching business logic.

**Test Isolation**

Every test runs in isolation with its own database. This eliminated flaky tests caused by shared state and made the test suite parallelisable.

**Observability from the Start**

I've been bitten too many times by insufficient observability. This time, metrics, logging, and tracing were built in from day one, not bolted on after deployment.

Observability is paramount when you migrate to a service-based architecture. In a monolith, you can debug by stepping through code or tailing a single log file. In a distributed system, a single request spans multiple services, and failures cascade in non-obvious ways.

The auth service includes:
- **Structured logging**: Every authentication attempt, permission check, and token operation is logged with correlation IDs
- **Metrics**: Authentication success/failure rates, token validation latency, permission check duration, database connection pool usage
- **Distributed tracing**: Request spans across services, showing exactly where time is spent (database query? external API call? business logic?)
- **Health checks**: Liveness and readiness endpoints for orchestration platforms

When authentication fails, I can trace the request through the entire system. When latency spikes, I know immediately which component is slow. When database connections are exhausted, alerts fire before users notice.

This isn't over-engineering - it's table stakes for production microservices.

**Clear Service Boundaries**

Authentication is a well-understood domain with clear inputs and outputs:
- Input: Credentials or token
- Output: Authenticated user or rejection

The boundaries were obvious, making the microservice extraction clean.

## What We'd Do Differently

**Token Revocation**

Short-lived JWTs work for most cases, but immediate revocation (e.g., user logs out, admin disables account) requires additional infrastructure. We'd implement a token blacklist or switch to opaque tokens for critical use cases.

**Database Connection Pooling**

We initially underestimated connection pool sizing for the auth service. High-frequency token validation meant connection exhaustion under load. Proper pooling configuration (with sensible limits and timeouts) should have been part of the initial design.

## Lessons Learned

**Microservices Aren't the Default**

Most systems should be monoliths. Extract services only when boundaries are clear and benefits are tangible. Authentication qualified because the domain is well-understood, the boundaries are obvious, and the scaling characteristics differ from the main application.

**Start Simple, Migrate Deliberately**

SQLite was the right choice for prototyping. PostgreSQL was the right choice for production. Starting with the simpler option and migrating later was faster than trying to get production infrastructure right from day one.

**Fast Tests Enable Confidence**

In-memory tests run in seconds. This means we run them constantly. Confidence comes from running tests frequently, not from having perfect test coverage.

**Abstractions Pay Dividends**

The repository pattern felt like over-engineering during the SQLite prototype. It paid for itself the moment we migrated databases and when we implemented in-memory testing. Good abstractions are invisible until you need them.

## Conclusion

Building an authentication service taught me that microservices work when boundaries are clear, responsibilities are single-purpose, and scaling characteristics justify separation.

The patterns I used - SQLite for prototyping, in-memory testing, layered architecture, JWT-based stateless auth - aren't novel. They're battle-tested approaches that work because they're simple, composable, and well-understood.

Choose boring technology, optimise for fast feedback loops, and only introduce complexity when the benefits are obvious.
