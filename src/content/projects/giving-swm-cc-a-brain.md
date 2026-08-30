---
title: "Giving swm.cc a Brain"
description: "Putting a real AI alter ego on a static site: a Cloudflare Worker, Haiku with the whole site in a cached prompt, and enough layered spend caps that going viral costs me a tenner"
pubDate: 2026-08-30
tags: ["ai", "claude", "cloudflare-workers", "astro", "cost-engineering", "prompt-caching"]
---

## The Idea

This site is static and proud of it: Astro, GitHub Pages, no tracking, pages that weigh less than this paragraph's OG image. But static sites are museums. You wander them alone. I wanted someone at the door. Not a support chatbot in a floating bubble, but an *alter ego*: someone who has read everything here and will tell you, with mild impatience, what's worth your time.

[Swanson](/projects/building-swanson) already existed as a name in my world, from my Ron Swanson-themed developer dashboard. The persona transferred perfectly. Click the avatar in the header of any page and he takes over the screen. He spins in, offers a rotating opinion ("*A monolith is like a good steak. One piece, cooked properly, no garnish.*"), and answers questions about my writing, my projects, or what I'm up to now. He is, as his boot text has always claimed, Stephen 2.0: compiled, optimised and debugged.

## The Constraint That Shaped Everything

GitHub Pages serves files. It cannot keep a secret, run code, or call an API, and an Anthropic key can never ship to a browser. So "an AI on the site" really means "the smallest possible brain somewhere else". Mine is a single Cloudflare Worker, about 160 lines, free tier. The site stays 100% static; the widget makes one `fetch` to the worker; the worker holds the key and talks to Haiku.

The second constraint was fear, and I make no apology for it. A public, unauthenticated endpoint that spends my money on every request is the kind of thing that shows up in cautionary blog posts. The whole design answers one question: *what happens when someone hammers this?*

## The Brain Is a Build Artifact

Swanson's knowledge is a JSON file the site generates about itself on every build: `/swanson-brain.json`, which holds metadata plus the **full text** of every essay, note and project write-up. About 54k tokens. The worker fetches it, caches it for an hour, and injects it into the system prompt.

This is the part I'd defend in a fight: there is no RAG, no vector database, no embedding pipeline, no sync job. A personal site fits in a context window. Mine uses about a quarter of Haiku's. When I publish an essay, the next deploy regenerates the brain, and Swanson has read it two minutes later. The knowledge pipeline *is* the build.

Anthropic's prompt caching is what makes this affordable rather than absurd. The system prompt is byte-identical on every request, so those 54k tokens are cache reads at a tenth of input price. A conversation with Swanson costs roughly a penny a question.

## The Paranoia, Layered

Four fences, in order of authority:

1. **A spend limit on the Anthropic side.** Enforced by their billing system, not my code. If everything else fails (a bug, a scraper, the front page of somewhere) the API starts refusing and Swanson naps until the 1st. The worst possible outcome is a fixed number I chose in advance.
2. **The model is hardcoded server-side.** Haiku, `max_tokens` capped, question truncated at 500 characters. Nobody can talk him into being Opus.
3. **Request budgets in Workers KV**: 100 requests a day site-wide, 20 an hour per IP. Past either, you get an in-character brush-off that costs nothing: "*You've asked a lot of questions this hour. I respect the enthusiasm. Come back shortly, or just read /writing like it's 2009.*"
4. **No agency.** One request in, one capped response out. No tools, no loops, no memory beyond the visitor's own tab. A chatbot can't go rogue when it can't *do* anything.

And beneath it all, graceful degradation: if the worker is down, capped or unreachable, the widget silently falls back to canned answers matched with a word-overlap score. The site never depends on the AI.

## The Persona Is Prompt Engineering

The system prompt does three jobs. It sets the voice: dry, terse, a little Ron, a little Northern Irish understatement, "wit is seasoning, not the meal". It grounds every claim in the site text and forbids inventing URLs, so he can link only to pages that exist. And it locks the topic: ask him about anything other than me and this site, and you get a one-line deadpan refusal and a redirect.

The result genuinely converses. Ask how [Grub](/projects/building-second-breakfast) builds its shopping list and he quotes the actual SQL. Ask what to read first and he'll triage you by interest, with reasons. The full text in the prompt is what elevates it from "search with manners" to something that has clearly *read* the material.

## The Honest Bit

The code took an afternoon. Shipping it took another one, and nearly all of the wounds were self-inflicted, so they're going on the record:

- I told Cloudflare to cache the brain fetch for an hour. That included, it turns out, the 404 from before the site had deployed, so Swanson spent his first hour in production gagged by a cached failure. `cacheTtlByStatus` exists for exactly this.
- `wrangler dev` persists its state *inside the project directory*, which Astro's file watcher dutifully noticed. In local dev, every answer triggered a full page reload that closed the overlay just before the reply landed. A genuinely excellent bug: the act of answering destroyed the audience.
- `wrangler secret put` takes the secret's **name** as its argument and prompts for the value. I gave it the value as the name, thereby writing my API key into my shell history and a Cloudflare dashboard. That key is dead now. Read the usage line before pasting credentials, is the lesson.
- Anthropic's console has evolved: new keys can be "identity-linked", which means they don't appear in the org's key list (cue twenty minutes of believing the key had ceased to exist) and require a workspace id header the docs assume you know about. The worker now handles both key flavours.
- Never hardcode a dev-server port in config. Astro's persistent dev sessions drift between ports as old servers die and new ones grab whatever's free, and a 13-day-old zombie `astro preview` on the port I expected made the wrong configuration *half-work*, which is so much worse than failing. The local worker now reads the production brain and no ports are involved anywhere.

## Where It Ended Up

Live, on every page of this site: the avatar in the header. A static site on free hosting, with a personality that has read all of it, for pennies a month and a hard ceiling I set myself. The pattern generalises to any static site: build-time knowledge file, thin worker, layered caps, canned fallback. No servers were harmed.

Give him a poke. Ask him what I'm working on. He's confident, not infallible, a bit like me.
