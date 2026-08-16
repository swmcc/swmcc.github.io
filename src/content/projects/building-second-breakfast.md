---
title: "Building Grub"
description: "A Rails meal planner with a bundled MCP server, so Claude can import recipes from photos, plan my week conversationally and read back the shopping list"
pubDate: 2026-08-17
tags: ["rails", "mcp", "claude", "postgresql", "hotwire", "api-design"]
---

## What It Is

[Grub](https://grub.swm.cc) (the repo is called `second_breakfast`, because naming things is hard and hobbits are funny) is my personal recipe collection and meal planner. It holds the recipes I actually cook, turns them into a Monday–Sunday plan each week, and rolls that plan up into a shopping list. The current week is [syndicated to this site](/eatin), so you can see what I'm eating.

It started life as an experiment in letting AI agents drive 99% of development — and it's still built that way, with Claude Code doing the implementation work and GitHub Actions standing guard. But somewhere along the way it stopped being a lab rat and became an app I use every single week. This page is about what got built.

## The Stack

Deliberately boring: Rails 8.1 on Ruby 3.3, PostgreSQL, Hotwire (Turbo + Stimulus), Tailwind CSS. The Solid suite (Queue, Cache, Cable) rides on Postgres, so there's no Redis to babysit. Active Storage on S3 for recipe images. A documented JSON API under `/api/v1` with an rswag/OpenAPI spec served at `/api-docs`.

The interesting part isn't the stack. It's what sits on top of the API.

## The MCP Server

The repo ships with an MCP (Model Context Protocol) server — a small Node process built on `@modelcontextprotocol/sdk`, speaking over stdio. Point Claude Desktop or Claude Code at it and Claude gets a toolbox for the whole app: `search_recipes`, `get_recipe`, `create_recipe`, `list_categories`, plus a full set of meal plan tools.

Architecturally it's a deliberately thin client. The MCP server contains no business logic at all — every tool is a straight HTTP call to the Rails JSON API with a Bearer token. Rails stays the single source of truth for validation, authorisation and side effects; the Node layer just translates between MCP tool calls and REST. When the web UI and Claude both create a recipe, they hit exactly the same code path.

Tool inputs are Zod schemas, and the schema descriptions double as prompt engineering. My favourite example: the ingredient `name` field is described as *"Ingredient name ONLY — no prep instructions (e.g., 'onion' not 'onion, diced')"*. That one line of schema documentation is what keeps the shopping list aggregation clean — if Claude filed "onion, diced" and "onion, finely chopped" as separate ingredients, the SQL rollup below would happily give me three kinds of onion.

### Auth

Every operation, including reads, requires an API key — the server refuses to even start without one. Keys are `sb_`-prefixed tokens managed from the account page. The raw token is shown exactly once at creation and never persisted; Rails stores only a SHA-256 digest and authenticates by hashing the presented token and looking up the digest. Keys are individually revocable, and each key tracks `last_used_at` (write-throttled to once a minute so a chatty Claude session doesn't hammer the row).

### Recipe Import From Photos

This is the workflow that justifies the whole thing. I photograph a page of a cookbook, hand it to Claude, and say "file this". Claude's vision extracts the title, ingredients (as structured `{name, quantity, unit}` objects), instructions and the nutrition panel, then calls `create_recipe`.

Images are handled asynchronously: `create_recipe` returns immediately, and a background job on Solid Queue fetches a matching photo from the Pexels API based on the recipe title. Claude can also pass the actual cookbook photo as a base64 data URL if I want the real thing. Either way, recipe creation never blocks on an image.

## Meal Plans as a State Machine

The domain model is stricter than it looks:

- **One plan per user per week.** `week_start_date` is normalised to Monday (`beginning_of_week(:monday)`) before validation, with a uniqueness constraint scoped to the user. Hand the API a Wednesday and it quietly becomes that week's Monday. Creating plans for past weeks is rejected outright.
- **Draft → accepted, with a ratchet.** Plans are a two-state enum. Drafts are editable; accepting locks the plan. You can reopen an accepted plan — but only until the week ends. Once `week_end_date` is behind us, the plan archives itself into read-only history. No flags, no cron: `archived?` is just a date comparison, and the active/archived scopes fall out of the same predicate.
- **Auto-fill is a shuffle, not an LLM.** `auto_fill!` maps each slot to categories (breakfast → Breakfast, dinner → Dinner *or* Main Course), shuffles the matching recipe pool once, then deals it out with `pool[day % pool.size]` — so nothing repeats until a slot's pool is exhausted. Existing entries are left alone, empty pools are skipped, and the whole thing runs in a transaction.

The conversational planning happens a layer up: I tell Claude "plan next week, fish twice, no beef, quick breakfasts" and it composes the primitives — `create_meal_plan`, `search_recipes`, `add_meal_to_plan`, `accept_meal_plan` — to satisfy the brief. Deterministic mechanics in Rails, judgement in the model. That split is the design.

## The Shopping List Is One SQL Query

Ingredients live on each recipe as a JSON array. The shopping list for a week is the aggregation of every ingredient across every recipe in the plan — and it's done entirely in Postgres:

```sql
SELECT ingredient->>'name'                       AS name,
       SUM((ingredient->>'quantity')::NUMERIC)   AS total_quantity,
       ingredient->>'unit'                       AS unit
FROM recipes
CROSS JOIN LATERAL jsonb_array_elements(recipes.ingredients::jsonb) AS ingredient
GROUP BY name, unit
```

`jsonb_array_elements` in a `LATERAL` join explodes each recipe's ingredient array into rows, then it's a plain `SUM ... GROUP BY name, unit`. Two recipes wanting 200g of flour and one wanting 150g becomes a single 350g line. Grouping by unit as well as name means "2 cloves of garlic" and "1 tsp of garlic" stay as separate lines rather than producing nonsense arithmetic. No Ruby loops, no N+1 — the printed list, the copy-to-clipboard list and the MCP `get_meal_plan_shopping_list` tool all read from this one query.

## Syndication

The `/eatin` page on this site is fed by the one deliberate hole in the API's authentication: a public, read-only endpoint serving exactly one thing — my current week's accepted plan. It's scoped to a single hard-coded account, sends a five-minute public `Cache-Control`, and revalidates with an ETag derived from the week's Monday and the plan's `updated_at`, so the static swm.cc frontend can poll it cheaply from the client. Every other endpoint still demands a key.

## Where It Ended Up

The AI-driven development experiment is still running — Claude Code writes the features, the CI gate (RSpec, RuboCop, Brakeman) decides if they ship. But the more interesting result is the product shape it produced: a conventional Rails monolith whose API grew an MCP face, which turned "a recipe CRUD app" into "a thing I talk to while holding a cookbook".

The pattern generalises. If you have a well-factored JSON API, an MCP server is a weekend of glue code — and it changes what the app *is*.

## Source

Grub lives at [grub.swm.cc](https://grub.swm.cc); the code, MCP server included, is on [GitHub](https://github.com/swmcc/second_breakfast).
