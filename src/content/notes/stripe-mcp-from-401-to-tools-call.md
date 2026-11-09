---
title: "Stripe's MCP Server, from 401 to tools/call"
pubDate: 2026-11-09T00:00:00.000Z
tags:
  - agentic-engineering
  - mcp
  - stripe
  - oauth
---

On Thursday I'm giving a talk at the [Stripe Belfast launch](https://www.stripecommunity.com/public/clubs/belfast/events/belfast-stripe-community-launch-event-gbx3b7m7bo) where an agent bills a customer through Stripe's hosted MCP server. On stage that's one line of config and a browser tab. This note is what happens underneath, because none of it is magic and all of it is worth knowing if you're building agents.

## Knock on the door

Send an MCP `initialize` to the server with no credentials:

```sh
curl -i -X POST https://mcp.stripe.com/ \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"0"}}}'
```

```http
HTTP/2 401
www-authenticate: Bearer resource_metadata="https://mcp.stripe.com/.well-known/oauth-protected-resource"
```

That header is the whole discovery mechanism. The MCP spec builds authorisation on OAuth 2.1, and the server points the client at its protected resource metadata ([RFC 9728](https://www.rfc-editor.org/rfc/rfc9728)):

```json
{
  "resource": "https://mcp.stripe.com",
  "scopes_supported": ["mcp"],
  "authorization_servers": ["https://access.stripe.com/mcp"]
}
```

## Find the authorisation server

The client follows that to the authorisation server's metadata ([RFC 8414](https://www.rfc-editor.org/rfc/rfc8414)). The interesting lines:

```json
{
  "registration_endpoint": "https://access.stripe.com/mcp/oauth2/register",
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "token_endpoint_auth_methods_supported": ["none"],
  "code_challenge_methods_supported": ["S256"]
}
```

Three things in there do a lot of work:

- **`registration_endpoint`** means dynamic client registration. Your MCP client registers itself on first use. Nobody files a form for an app ID.
- **`token_endpoint_auth_methods_supported: ["none"]`** means a public client. There's no client secret, because a desktop app or CLI can't keep one.
- **`S256`** is PKCE, which is what makes a public client safe. The client makes a random verifier, sends only its hash when it starts and proves it holds the verifier when it swaps the code for a token. Someone who steals the code can't use it.

I learnt the value of that last pair the hard way this week, building a board that signs in with GitHub. GitHub's web flow insists on a client secret. Stripe's doesn't need one.

## Consent is where the blast radius gets decided

The browser tab that opens is Stripe's consent screen, and it's per environment. I grant my sandbox and nothing else. The token that comes back can't see live mode because I never gave it live mode. Every other guardrail in the talk sits on top of this one.

## Then it's just JSON-RPC

With a bearer token, the client runs the normal MCP handshake over Streamable HTTP: `initialize`, then `tools/list` to learn what it can call, then `tools/call` whenever the model decides to use one. A call has this shape (the arguments are illustrative, the server's schema decides the real ones):

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "stripe_api_write",
    "arguments": { "...": "whatever the tool's inputSchema asks for" }
  }
}
```

The result comes back as `content` blocks plus an `isError` flag, so a failed call is something the model reads and recovers from rather than an exception that kills the run.

That's the full path from a photo of a handwritten note to a Stripe invoice: discovery, a public OAuth client with PKCE, a consent screen that scopes the environment and JSON-RPC calls the model chooses. Tomorrow: why `tools/list` on Stripe's server is so short.
