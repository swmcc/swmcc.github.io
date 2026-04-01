---
title: "Dropping Down to Raw ASGI"
pubDate: 2026-03-18
tags: ["python", "asgi", "fastapi"]
syndicate: true
---

Building [mailview](https://github.com/swmcc/mailview), `Mount` looked like the obvious choice for attaching routes at `/_mail`. It wasn't.

## The Problem with Static Mounting

`Mount` ties routing to application structure:

```python
routes = [
    Mount("/_mail", app=mailview_app),
]
```

But mailview shouldn't exist in production. It captures emails, useful in development, a liability anywhere else. With `Mount`, you either include the routes or you don't. Conditional mounting means conditional route definitions, which leaks environment logic into your route table.

That's the deeper issue: `Mount` conflates *what paths exist* with *what behaviour runs*. Those are separate concerns.

## Middleware Separates Routing from Runtime

Raw ASGI middleware moves the decision to runtime:

```python
async def __call__(self, scope, receive, send):
    if not self.enabled:
        await self.app(scope, receive, send)
        return

    if scope["type"] == "http" and self._is_mailview_path(scope["path"]):
        await self._mailview_app(scope, receive, send)
        return

    await self.app(scope, receive, send)
```

The enable/disable logic lives in the middleware, not the route table. Add the middleware unconditionally; it handles the rest. In production, it's a single boolean check that passes everything through.

The payoff isn't just cleaner code. When disabled:

- **No routes registered**, nothing to accidentally expose
- **No OpenAPI pollution**, `/_mail` doesn't appear in your schema
- **No security surface**, the endpoints don't exist, not just "protected"

## What Surprised Me

Coming from Ruby's Rack, I expected more ceremony. Rack middleware is similar, `call(env)` returns `[status, headers, body]`, but the response is synchronous and the contract is more rigid.

ASGI's receive/send pattern felt odd at first. You're not returning a response; you're calling `send` with message dicts. But it means you can stream, intercept partway through, do things that Rack makes awkward.

The other surprise: how little code it takes. The entire middleware is 40 lines, half of that docstrings and type hints. I expected to miss Starlette's conveniences more than I did.

## The Boundary Bug Worth Remembering

One subtlety that bit me:

```python
# Wrong, matches /_mail-archive, /_mailbox, etc.
if path.startswith("/_mail"):

# Right, exact match or child paths only
if path == "/_mail" or path.startswith("/_mail/"):
```

Obvious in hindsight. Easy to miss when you're pattern-matching paths.

## When to Drop Down

I'd reach for raw ASGI middleware again when:

- The sub-app needs conditional activation based on environment
- You want zero footprint when disabled, no routes, no schema, no surface
- The logic is simple enough that Starlette's abstractions add more than they save

For anything more complex, authentication, request modification, response transformation, I'd stick with Starlette's `BaseHTTPMiddleware`. But for "intercept these paths, let everything else through," raw ASGI is cleaner than I expected.
