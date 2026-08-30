---
title: "Anthropic Identity-Linked Keys: Invisible in the Console, and They Want a Header"
pubDate: 2026-08-30T00:00:00.000Z
tags:
  - anthropic
  - api
  - claude
  - gotcha
---

Two surprises from wiring an Anthropic API key into [Swanson](/projects/giving-swm-cc-a-brain), both courtesy of a console that has evolved faster than the collective memory of everyone giving instructions about it, me included.

**Surprise one: the key that "didn't exist".** Newer keys can be *identity-linked*, tied to your user rather than issued as a workspace service key. These do not appear in the organisation's API keys list. I created one, stored it, went back to the console, and found an empty list where my key should be. I spent a genuinely confusing stretch convinced the key had ceased to exist, while the whole time it authenticated perfectly. If your key list looks empty but your requests work, you have an identity-linked key, and the console is just not showing it to you where you are looking.

**Surprise two: the mandatory header.** Identity-linked keys refuse to work until you tell them which workspace the request acts in:

```json
{
  "type": "invalid_request_error",
  "message": "anthropic-workspace-id is required when authenticating
    with an identity-linked API key; send the id of the workspace
    this request acts in."
}
```

That arrives as a 400, not a 401, which at least tells you the key itself is fine. The fix is one header:

```javascript
headers['anthropic-workspace-id'] = 'wrkspc_01AbC...';
```

Finding the workspace id has its own wrinkle: the legacy Default workspace does not have one at all. I had to create a proper named workspace, whose id then appears on its console page and in the URL. Classic workspace service keys need none of this, so if you would rather skip the whole dance, create one of those instead.

Worth knowing before you burn an evening on it: a 400 with that message means "add the header", an empty key list means "look somewhere else", and neither means what it appears to mean at first glance.
