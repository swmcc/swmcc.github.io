---
title: "Adding OAuth to the Authentication Service"
description: "Extending the authentication microservice with OAuth 2.0 support for Keycloak and Google, evaluating FastAPI libraries, and why I chose aioauth"
pubDate: 2025-12-02
tags: ["authentication", "oauth", "microservices", "fastapi", "keycloak"]
---

## The Next Step

In [Extracting Authentication to a Microservice](/writing/building-an-authentication-service/), I described building a dedicated auth service with JWT-based authentication and RBAC. It worked well for email/password authentication, but we needed more.

Enterprise clients wanted SSO via Keycloak. Consumer users expected Google sign-in. Time to add OAuth 2.0.

## The Providers

**Keycloak** for enterprise SSO. Self-hosted, open source, speaks OIDC fluently. Clients can connect their existing identity provider and we integrate via Keycloak as an intermediary.

**Google** for consumer sign-in. Reduces friction for users who don't want another password.

Two different providers, but the OAuth flow is fundamentally the same.

## FastAPI Library Options

I evaluated four libraries:

### Authlib

The most comprehensive OAuth library for Python. Supports OAuth 1.0, OAuth 2.0, and OIDC. Framework-agnostic with FastAPI integration.

**Pros:** Complete spec implementation, well-documented, handles PKCE and JWT validation.

**Cons:** Large library with features you might not need. Some learning curve.

### httpx-oauth

Lightweight library with async support. Built for modern Python with httpx.

**Pros:** Async-native, simple API, minimal dependencies.

**Cons:** Less comprehensive. Fewer providers supported. Need to implement some OIDC features yourself.

### fastapi-users

Full authentication solution including OAuth. Handles users, passwords, sessions, and OAuth in one package.

**Pros:** Everything in one place, database models included.

**Cons:** Opinionated about database models. Less flexible with existing infrastructure.

### aioauth

Async OAuth 2.0 provider library. Implements the full OAuth 2.0 spec with async/await throughout.

**Pros:** Fully async, clean implementation, gives you control over storage and user models, well-typed.

**Cons:** Lower-level than some alternatives. You implement the storage layer yourself.

## The Decision

I chose **aioauth**.

**Async from the ground up.** FastAPI is async. The auth service is async. aioauth doesn't bolt async onto a sync library. It's async throughout.

**Control over storage.** We already had user models and database infrastructure. aioauth doesn't impose its own models. You implement a storage interface and it handles the OAuth protocol.

**Full spec implementation.** aioauth implements OAuth 2.0 properly. Authorization code flow, PKCE, token refresh, token revocation. Not a simplified subset.

**Clean separation.** aioauth handles the OAuth protocol. We handle users, sessions, and JWTs. Clear boundaries.

The trade-off is that aioauth is lower-level. You write more code. But that code is yours to control, and it integrates cleanly with existing infrastructure rather than fighting it.

## Implementation

### The Storage Interface

aioauth requires you to implement a storage class. This is where your database integration lives:

```python
class AuthStorage(BaseStorage):
    async def get_client(self, client_id: str) -> Optional[Client]:
        # Fetch OAuth client from database

    async def create_authorization_code(self, code: AuthorizationCode) -> None:
        # Store auth code

    async def get_authorization_code(self, code: str) -> Optional[AuthorizationCode]:
        # Retrieve and validate auth code
```

This felt like boilerplate initially, but it meant the OAuth layer integrated naturally with our existing SQLAlchemy models and async database sessions.

### Keycloak Configuration

Keycloak exposes a `.well-known/openid-configuration` endpoint. We fetch metadata from there and configure aioauth accordingly. When Keycloak gets upgraded, discovery handles any endpoint changes.

### Google Configuration

Same pattern, different metadata URL. Both providers use the same code paths once configured.

### The Flow

1. User clicks "Sign in with Google" or "Sign in with your company account"
2. Generate state parameter and PKCE verifier
3. Redirect to provider's authorisation endpoint
4. User authenticates with the provider
5. Provider redirects back with authorisation code
6. Exchange code for tokens via aioauth
7. Validate ID token, extract user claims
8. Find or create user in our database
9. Issue our own JWT

## What Worked Well

**Async throughout.** No blocking calls hiding in the OAuth flow. Database queries, HTTP requests to providers, token validation. All async.

**Storage flexibility.** Adding Redis-backed token storage for revocation was straightforward. Just implement the interface methods.

**Testability.** The storage interface makes testing easy. Mock the storage, test the OAuth logic in isolation.

## What I'd Do Differently

**Earlier load testing.** The async implementation handles concurrency well, but we found connection pool limits under load. Should have tested earlier.

**Better error messages.** OAuth failures are opaque. We added detailed logging for each step to diagnose issues faster.

## Conclusion

aioauth was the right choice for a FastAPI service with existing infrastructure. It handles the OAuth protocol correctly and gets out of the way for everything else.

The key decisions:
- aioauth over higher-level libraries (needed async, had existing models)
- Implement storage interface (clean integration with existing database)
- Metadata discovery for providers (reduces configuration)

If you're starting fresh and want batteries included, look at fastapi-users. If you have existing infrastructure and want control, aioauth is worth the extra setup.
