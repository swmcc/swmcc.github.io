---
title: "Designing Tools for Agents: Three, Not Three Hundred"
pubDate: 2026-11-10T00:00:00.000Z
tags:
  - agentic-engineering
  - mcp
  - stripe
  - tool-design
---

[Yesterday](/notes/stripe-mcp-from-401-to-tools-call) ended with `tools/list`. On Stripe's MCP server that list is short, and that's a design decision worth copying.

## Tool definitions are paid for on every turn

An agent's tools are sent to the model as part of the context, every time the model is asked what to do next. Each definition is a name, a description and a JSON Schema for its input. Call it a couple of hundred tokens for a well described one. The obvious way to expose an API like Stripe's is one tool per endpoint. Stripe has hundreds of endpoints. Do the sum and you've spent tens of thousands of tokens on every turn before the user says anything. Worse, the model now has to pick the right tool out of a crowd of near neighbours: `create_invoice`, `create_invoice_item`, `update_invoice`, `finalize_invoice`.

More tools isn't more capability. Past a point it's less, because selection gets worse.

## What Stripe does instead

From [Stripe's MCP docs](https://docs.stripe.com/mcp):

- **`stripe_api_read`** and **`stripe_api_write`** cover much of the API without loading it all into context.
- **`stripe_implementation_planner`** guides the shape of an integration before anything gets called.

Two general tools that take an operation as an argument and fetch what they need on demand, plus a planner. Discovery moves out of the context window and into a tool call, so the model pays for the parts of the API it actually uses.

## The split that matters is read and write

Separating `read` from `write` isn't tidiness. It's what lets the client treat them differently. MCP gives tools [annotations](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) for exactly this:

```json
{
  "name": "orders_read",
  "description": "Read orders. Never changes anything.",
  "inputSchema": { "type": "object", "properties": { "id": { "type": "string" } } },
  "annotations": { "readOnlyHint": true, "openWorldHint": false }
}
```

```json
{
  "name": "orders_refund",
  "description": "Refund an order. Moves money out of the business.",
  "inputSchema": {
    "type": "object",
    "required": ["id", "amount", "idempotency_key"],
    "properties": {
      "id": { "type": "string" },
      "amount": { "type": "integer", "description": "In the smallest unit, e.g. pence" },
      "idempotency_key": { "type": "string" }
    }
  },
  "annotations": { "destructiveHint": true, "idempotentHint": true }
}
```

A client can wave the first through and stop for a person on the second. In Claude Code that's a permission rule like `"allow": ["mcp__stripe__stripe_api_read"]`. Other clients have their own switch.

One warning from the spec: annotations are hints. A client must not trust them from a server it doesn't trust. They're for building good approval screens, not a security boundary. The boundary is the credential (yesterday) and the system that holds the money (tomorrow).

## If you're writing your own MCP server

The checklist I work to:

1. **Few tools, general verbs.** Read, write, plan. Let arguments carry the detail.
2. **Read and write as separate tools.** Never one tool with a `mode` flag.
3. **Strict input schemas.** Integers in minor units, enums for states, `required` set. The schema is the model's documentation and your validation in one.
4. **Errors as results.** Return `isError: true` with a message that says what to fix. A model can recover from "amount must be in pence, got 90.00". It can't recover from a 500.
5. **Idempotency on every write.** Models retry. Networks drop. Make the second identical call a no op.

Tomorrow: the threat model, starting with what happens when the handwritten note in my pocket isn't as innocent as it looks.
