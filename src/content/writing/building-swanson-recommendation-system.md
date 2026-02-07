---
title: "Building Swanson: A RAG-Enhanced Recommendation System for whatisonthe.tv"
description: "How I built a context-aware recommendation system using Claude, Server-Sent Events, and viewing history to suggest TV shows and films"
pubDate: 2026-02-07
tags: ["ai", "python", "fastapi", "svelte", "llm", "streaming", "rag"]
---

Since October last year, I've been logging everything I watch on [whatisonthe.tv](https://whatisonthe.tv). The check-in feature has been working well, and I now have a solid history of viewing habits. But there was a problem I kept running into: finding something to watch with my mum.

## The Problem

When I'm at my mum's house, half the battle is finding something we can both enjoy. She's not into anything too dark or violent. I'm not keen on anything too slow. Our overlap is narrower than you'd think, and scrolling through streaming services together rarely ends well.

I had the data. Months of check-ins, tagged with who I watched with, when, and what we thought. What I didn't have was a way to use that data intelligently.

So I built Swanson.

## What is Swanson?

Swanson is a RAG-enhanced chatbot that sits inside whatisonthe.tv. Named after the character from Parks and Recreation, it gives straightforward recommendations based on your viewing history. No fluff, no endless scrolling. Just practical suggestions with brief explanations.

<video controls preload="metadata" class="w-full rounded-lg shadow-lg my-8">
  <source src="/writing/swanson-demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

The "RAG" part (Retrieval-Augmented Generation) is the key. Rather than asking a generic LLM for recommendations, we first retrieve the user's viewing history from the database, build a taste profile, and inject that context into the prompt. The LLM then generates recommendations grounded in actual data rather than making things up.

It's not a true AI agent. It doesn't have tool use, multi-step reasoning, or autonomous decision-making. It's a context-aware LLM wrapper with a feedback loop. But that's exactly what I needed.

## The Architecture

The implementation spans three layers: an LLM abstraction, an API endpoint with Server-Sent Events (SSE), and a SvelteKit frontend that streams the response in real-time.

### LLM Provider Abstraction

I wanted the ability to swap providers without changing application code. The abstraction is simple:

```python
class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def complete(self, system_prompt: str, user_prompt: str) -> str:
        """Generate a completion from the LLM."""
        pass

    @abstractmethod
    async def stream(self, system_prompt: str, user_prompt: str) -> AsyncIterator[str]:
        """Stream a completion from the LLM, yielding text chunks."""
        pass
```

Currently there are two implementations: `AnthropicProvider` for Claude and `OpenAIProvider` for GPT models. I'm using Claude (specifically `claude-sonnet-4-20250514`) and at the time of writing, I heavily favour it over ChatGPT for this kind of work. The reasoning and tone are better suited to making recommendations.

Swapping providers is a configuration change:

```python
def get_llm_provider() -> LLMProvider:
    if settings.llm_provider == "anthropic":
        return AnthropicProvider(
            api_key=settings.anthropic_api_key,
            model=settings.llm_model,
        )
    elif settings.llm_provider == "openai":
        return OpenAIProvider(
            api_key=settings.openai_api_key,
            model=settings.llm_model,
        )
```

### The System Prompt

Swanson's personality comes from a carefully crafted system prompt:

```python
SYSTEM_PROMPT = """You are Swanson, a straightforward TV and movie recommendation assistant.

Your job is to help users find something to watch based on their viewing history and preferences.

Guidelines:
- Be direct and practical - no fluff
- Give 3-5 specific recommendations with brief explanations
- Focus on WHY each recommendation fits the user's taste
- If the search results are provided, prioritize those but feel free to suggest others
- If the user hasn't watched much, acknowledge that and give broader suggestions
- Keep responses concise

Format your response using markdown:
- Always wrap show/movie titles in double asterisks for bold: **Title Here**
- Use a blank line between paragraphs
- Start each recommendation on a new line with a bullet point

At the end of your response, add a line starting with "TITLES:" followed by a comma-separated list of the exact titles you recommended.
TITLES: The Wire, Breaking Bad, The Sopranos
"""
```

The `TITLES:` line is a structured extraction pattern. After the LLM finishes streaming, the frontend parses out the titles and uses the internal search API to fetch metadata, images, and links. This gives us rich recommendation cards rather than just text.

### Building the User Context

Before each request, we build a taste profile from the user's check-in history:

```python
async def get_user_taste_profile(db: AsyncSession, user_id: int) -> dict:
    """Build a taste profile from user's checkin history."""
    result = await db.execute(
        select(Checkin)
        .where(Checkin.user_id == user_id)
        .options(
            selectinload(Checkin.content).selectinload(Content.genres)
        )
        .order_by(Checkin.watched_at.desc())
        .limit(50)
    )
    checkins = result.scalars().all()

    # Aggregate: genre counts, content types, recent titles
    # Returns structured data for the prompt
```

This profile gets injected into the user prompt along with any current search results and feedback from previous recommendations:

```
## User's Viewing Profile
Total watches logged: 47
Top genres: Drama, Comedy, Crime, Thriller, Mystery
Recently watched: Slow Horses, Shrinking, The Bear, Silo, Severance
Content types: series (32), movies (15)

## User Feedback on Previous Recommendations
Very interested in: The Diplomat
Somewhat interested in: For All Mankind
Not interested in: Foundation

## Already Recommended This Session
Do NOT suggest these again: The Diplomat, For All Mankind, Foundation

## User's Question
Something like Slow Horses but funnier
```

### Server-Sent Events for Streaming

Rather than waiting for the full response, Swanson streams tokens as they're generated. The FastAPI endpoint uses `StreamingResponse` with SSE format:

```python
@router.post("/recommend/stream")
async def get_recommendation_stream(
    request: RecommendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Stream an AI-powered recommendation."""
    taste_profile = await get_user_taste_profile(db, current_user.id)
    user_prompt = build_user_prompt(
        request.prompt,
        taste_profile,
        [r.model_dump() for r in request.search_results],
        [f.model_dump() for f in request.feedback],
        request.previous_recommendations,
    )

    llm = get_llm()

    async def generate():
        try:
            async for chunk in llm.stream(SYSTEM_PROMPT, user_prompt):
                yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
```

The Anthropic SDK's `messages.stream()` method yields text chunks as they're generated. We wrap each chunk in SSE format (`data: ...\n\n`) and the frontend picks them up in real-time.

### Frontend Streaming

On the SvelteKit side, we consume the SSE stream and render it progressively:

```typescript
async function streamResponse(prompt: string) {
  swansonMessages.update(msgs => [...msgs, { role: 'user', content: prompt }]);
  swansonLoading.set(true);
  swansonStreamingText.set('');

  const feedback = collectFeedback();
  const previousRecs = collectPreviousRecommendations();

  try {
    let accumulated = '';
    for await (const chunk of api.swanson.stream({
      prompt,
      search_results: searchResults,
      feedback: feedback.length > 0 ? feedback : undefined,
      previous_recommendations: previousRecs.length > 0 ? previousRecs : undefined
    })) {
      accumulated += chunk;
      swansonStreamingText.set(accumulated);
    }

    // Parse titles and search for recommendations
    const { cleanContent, titles } = parseTitles(accumulated);
    let recommendations: SearchResult[] = [];
    if (titles.length > 0) {
      recommendations = await searchForTitles(titles);
    }

    swansonMessages.update(msgs => [...msgs, {
      role: 'swanson',
      content: cleanContent,
      recommendations
    }]);
  } finally {
    swansonLoading.set(false);
  }
}
```

As tokens arrive, `swansonStreamingText` updates and the UI re-renders. The user sees the recommendation being written in real-time, which feels much more responsive than waiting for a complete response.

## The Workflow

The typical flow looks like this:

1. **Filter check-ins**: Select content watched with my mum in a given time frame (say, the last three months)
2. **Open Swanson**: Click the Swanson button to open the recommendation modal
3. **Ask a question**: "Something we'd both enjoy, maybe a bit lighter than Slow Horses"
4. **Stream the response**: Swanson processes the viewing history and streams recommendations
5. **Review the cards**: Each recommendation appears with artwork, type, and year from TheTVDB
6. **Provide feedback**: Mark recommendations as "very interested", "interested", or "not interested"
7. **Refine**: Ask again, and Swanson incorporates the feedback

On desktop, Swanson returns five recommendations. On mobile, it's three. This keeps the interface clean and prevents decision fatigue.

The feedback loop is the key feature. If I mark "The Diplomat" as something I'm very interested in and "Foundation" as something I'm not interested in, the next recommendation round knows to lean towards political thrillers and away from hard sci-fi. This iterative refinement is far more useful than a single static recommendation.

## Technical Decisions

**Why SSE instead of WebSockets?**

SSE is simpler for this use case. We're only streaming in one direction (server to client), and SSE has native browser support with automatic reconnection. WebSockets would be overkill.

**Why parse titles from the response?**

I considered having the LLM return structured JSON, but that complicates streaming. With the `TITLES:` pattern, we can stream the natural language response and extract structure at the end. The trade-off is that parsing is fragile, but in practice it works reliably.

**Why Claude over GPT?**

Personal preference. Claude's responses feel more thoughtful for recommendation tasks, and the streaming API is clean. The abstraction layer means I can switch if that changes.

## Cost

I've put $10 of API credit into Swanson. At current Claude Sonnet pricing, that should last a while. Each recommendation request uses roughly 1,500-2,000 tokens (mostly from the viewing history context), which works out to a fraction of a cent per request.

I'll keep an eye on usage, but for a personal tool used a few times a week, the economics work.

## What's Next

This is version one. Some things I'm considering:

- **Caching similar queries**: If I ask the same question twice within a session, skip the LLM call
- **Better feedback persistence**: Currently feedback only persists within a session. Cross-session learning would be valuable
- **Collaborative filtering**: Compare my viewing history against other users (if I ever open this up to others)
- **Watch party mode**: Recommendations specifically optimised for group viewing

For now, though, it solves the immediate problem. When I'm at my mum's house and we need something to watch, I can pull out my phone, filter to our shared viewing history, and get tailored suggestions in seconds.

---

The source code is part of [whatisonthe.tv on GitHub](https://github.com/swmcc/whatisonthe.tv). Swanson lives in the `backend/app/api/swanson.py` and `frontend/src/routes/swanson/` directories.
