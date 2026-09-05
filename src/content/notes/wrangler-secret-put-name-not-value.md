---
title: "wrangler secret put Takes the Name, Not the Value"
pubDate: 2026-08-30T00:00:00.000Z
tags:
  - cloudflare-workers
  - wrangler
  - security
  - gotcha
---

A short cautionary tale from deploying [Swanson](/projects/giving-swm-cc-a-brain).

`wrangler secret put` works like this:

```bash
npx wrangler secret put ANTHROPIC_API_KEY
✔ Enter a secret value: ████████
```

The argument is the secret's *name*. The value goes in at the interactive prompt, hidden, never touching your shell history.

I was moving fast and ran this instead:

```bash
npx wrangler secret put sk-ant-api03-the-actual-key...
```

Wrangler did not blink. It cheerfully created a secret *named* my API key, prompted me for a value, and even offered to create the Worker to hang it on. By the time I noticed, the key was in my shell history, in a Cloudflare dashboard as a visible secret name, and pasted into a chat transcript.

There is only one correct response to that, and it is not "clean up the history". The key was revoked within minutes and a fresh one issued. Once a credential has been anywhere it should not be, it is burned, and no amount of tidying makes it trustworthy again.

Lessons, in order of importance:

1. Read the usage line before pasting a credential into any command. Thirty seconds of reading beats a key rotation.
2. Secret names appear in dashboards, logs, and `wrangler secret list`. Only the value is actually secret.
3. Revoke first, investigate later. Rotation is cheap; doubt is not.
4. `history -d` exists, but a revoked key makes the history entry harmless anyway, which is a far better place to be.
