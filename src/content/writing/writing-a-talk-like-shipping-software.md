---
title: Writing a Talk Like Shipping Software
description: I've shipped software for thirty years. The hardest thing I wrote this autumn was thirty minutes of talking. On writing an NIDC talk with speaking.io open in one tab, a coding agent in another, and a bin for every clever idea that came near it.
pubDate: 2026-11-21T00:00:00.000Z
draft: true
tags:
  - speaking
  - nidc
  - writing
  - agentic-development
---

Today I gave [Getting Shit Done in Two Worlds](/writing/nidc-takeaway-recipes) at NIDC. Thirty minutes, Room 1B, no Q&A. I've shipped software for thirty years, and the hardest thing I wrote this autumn was thirty minutes of talking.

This is how it got written. Not the content, which is [over here](/writing/nidc-takeaway-recipes), but the process, because it turned out to look a lot like how I ship code now. A plan, a lot of drafts, a machine doing much of the typing and a human deciding what survives.

## The first draft was a paper

The first complete version was correct. Every claim was defensible, the structure was sound and the argument built properly from section to section. It read like something you'd submit to a journal.

I sat down to read it out loud and got bored halfway through the second section. That's a bad sign when you're the one doing the reading. If I couldn't stay awake for it, a room full of people who'd skipped another talk to be there had no chance.

The problem wasn't the ideas. It was the register. I'd written something to be read, and a talk is something to be heard. Those are different formats, and the first one doesn't survive conversion to the second.

## speaking.io

So I went back to [speaking.io](https://speaking.io/), Zach Holman's guide to giving talks, which I'd read years ago and mostly forgotten. It holds up. The parts that changed the talk:

**Slides aren't your notes.** One idea per slide, one or two words where you can get away with it, big type, full-bleed photos. The slide is there to land the point, not carry it. Everything I wanted to say went into the speaker notes instead, along with stage directions to myself: *[Water. Breathe. Don't touch the clicker until the first laugh.]*

**More slides, not fewer.** My first instinct was that sixty slides was far too many for thirty minutes. The talk ended up at seventy. That sounds mad until you realise most of them are on screen for ten seconds. Pace comes from the clicker, not from talking faster.

**Tell experiences, not things.** "Reversibility matters" is a thing. A migration that fell over in production on the 18th of January because the tables were already there is an experience. Every abstract point in the talk ended up pinned to something that actually happened to me, with a date on it.

**A joke, then the serious point.** Holman's talks are funny and they're also right, and the funny is what gets the right past people's defences. I'm not a comedian. But a slide that just says "Ah, fuck it, it'll be grand" in enormous letters, describing the governance policy of my own company, does more work than a paragraph on risk appetite.

**Callbacks.** A running joke that comes back twice feels like structure, and the audience enjoys spotting it. The talk has a few. You'll have spotted them.

The rewrite in that voice took the same argument and made it something I wanted to say out loud. Nothing in the substance changed. The register did.

## The abstract wrote a cheque

Conference abstracts get written months before the talk, by a more optimistic version of you. Mine promised two factories: the full-throttle one I run on my own, and a stripped-down version that would survive a governed team.

When I sat down to build the stripped-down one, it didn't exist. There was one factory, and it ran in both worlds. What changed between them was where the human stood.

The temptation was to quietly fudge it. Instead it became one of the best moments in the talk, because the honest version was more interesting than the promised one. If your abstract turns out to be wrong, say so on stage. It's the most credible thing you'll do all day.

## Review it like a promotion case

Once there was a full outline, I reviewed it the way I'd review a design doc from someone going for distinguished engineer. Not "is this good?" but "would a sceptical senior person in the third row buy this?"

That review found the hole. The model at the heart of the talk judges each change on its own, and a thousand perfectly reasonable changes can still add up to an architecture nobody would choose. Someone would have spotted that.

With a Q&A, you'd wait for them to ask. With no Q&A, the objection sits in their head unanswered and they leave thinking you missed it. So the talk now raises its own best objection, concedes it, and says what to do about it. If you've no Q&A, kill the best objection yourself.

## The organiser asked for recipes

Partway through, Art, one of the organisers, asked for something practical. People like to leave a talk with a thing they can do on Monday. Art was right, and it was a useful constraint, because "here is a model" is easy to nod at and forget, while "here is a commit trailer and a CI check" is something you can actually ship.

Six recipes went in. Four go past fast, fifteen seconds each, because they're twists on things the room already knows. Two get the time, because nobody else in the building will have them. The full versions live in a [companion post](/writing/nidc-takeaway-recipes) behind a QR code, so the slides can stay big and the detail can stay complete.

## Real numbers or none

Every number on screen came out of git, and I wrote up [exactly how I counted](/notes/counting-what-the-machine-wrote) so anyone can check. Where I couldn't show a number honestly, I showed a shape instead: bars, not figures. A room of engineers will forgive you a missing number. They won't forgive you a made-up one, and they'll stop believing every other slide.

## The bin

Most of the work was killing ideas. Some of the ones that didn't make it:

- **A live demo.** Agents running on stage would have been spectacular for exactly as long as the conference wifi held up.
- **An interactive QR code at the start.** Clever, and one more moving part on a morning that already had enough.
- **Hands up.** "Hands up who's used AI this week" is the talk equivalent of a stock photo of a handshake.
- **Local colour.** I'm from Belfast. Everyone in the room is from Belfast. Nobody needs me to explain Belfast to them.

The test for all of them was the same: does it make the talk better, or does it make me look clever? I wanted it to land hard and carry no risk at all, and almost everything clever carries risk.

## The deck is code

The slides are a [reveal.js](https://revealjs.com/) deck: plain HTML and CSS in a git repo, with every dependency vendored, because a talk that needs the internet to start is a talk with a single point of failure. It runs from a laptop on a local server, at 1920×1080, with the speaker notes on a second screen.

The photos are freely licensed from Wikimedia Commons and credited properly. The QR code was generated locally, so it doesn't depend on a link-shortening service still existing next year. The screenshot of my agents at two in the morning isn't a screenshot at all: it's HTML and CSS, so it's pin-sharp on a cinema-sized screen and its clock actually ticks.

Treating the deck as code meant every change was a commit, I could see what changed between drafts, and nothing about the slides depended on an app I don't control.

## Same factory, same rules

I wrote a lot of this with a coding agent. Not "write me a talk", which gets you the first draft I binned, but the way I use one for software: plan first, critique often, rewrite constantly, keep the human on the decisions. It drafted, I cut. It suggested things, and I binned more of them than I kept. It went off and found photos, checked the git numbers, built the slides and rebuilt them every time I changed my mind, which was often.

That's the talk, really. The machine can do nearly everything except be accountable. It isn't the one standing in Room 1B. My name is on the schedule, so the decisions about what goes in were mine, and so was every cut.

## If you're writing one

- **Read it out loud early.** If it bores you, it'll bore them.
- **Read [speaking.io](https://speaking.io/).** Then do what it says, especially the parts you think don't apply to you.
- **Pin every idea to something that happened.** Dates help.
- **Fix your abstract on stage.** Out loud, early, with a joke.
- **No Q&A? Raise the best objection yourself.**
- **Real numbers or none.** Show your working somewhere people can check it.
- **Put the detail behind a QR code** and keep the slides big.
- **Bin the clever stuff.** Wow with no risk is a constraint, and constraints are good for you.
- **Make the deck code.** Offline, versioned, yours.

Thirty years in, I'm still learning to ship things. This one just happened to be thirty minutes long.
