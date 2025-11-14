---
title: "Building whatisonthe.tv with FastAPI"
description: "Why I chose FastAPI with async PostgreSQL, Redis caching, and SvelteKit for a self-hosted TV and film tracking application"
pubDate: 2025-11-08
tags: ["fastapi", "postgresql", "sveltekit", "python", "architecture"]
---

## The Problem

I watch a lot of TV and film. Streaming platforms track what you watch, but that data lives in their silos. Switch services, lose your history. Want to see everything you've watched across Netflix, Apple TV+, and Amazon Prime in one place? Can't do it.

I wanted a centralised personal viewing log where I control the data. Not reliant on any platform, not locked into any service - just my viewing history, stored in my database, accessible whenever I want.

whatisonthe.tv is a self-hosted TV and film tracking application. I own the data, I control the infrastructure, and it outlasts any streaming service.

## Architecture Overview

- **Backend**: FastAPI (Python 3.11) with async SQLAlchemy + PostgreSQL
- **Message Broker**: Redis for Celery task queue
- **Background Jobs**: Celery with [Flower](https://flower.readthedocs.io/) monitoring
- **Frontend**: SvelteKit with TypeScript + Tailwind CSS 3
- **External API**: [TheTVDB](https://thetvdb.com/) for series/movie metadata, cast, crew, episodes
- **Caching Pattern**: [Cache-aside](https://en.wikipedia.org/wiki/Cache_(computing)#Writing_policies) with [asynchronous write-through](https://docs.celeryq.dev/en/stable/userguide/tasks.html)

The core decision was async-first architecture. FastAPI with async SQLAlchemy means I/O operations (database queries, external API calls) don't block the event loop. For a personal project, this might be overkill. But it's the right pattern - non-blocking, concurrent, and scalable.

## Why FastAPI?

I needed a Python framework that could handle async I/O efficiently whilst providing type safety and automatic API documentation. FastAPI delivers all three.

**Performance**

FastAPI is one of the fastest Python frameworks available. It's built on Starlette (ASGI) and Pydantic, both written in Python but optimised with Cython. For a self-hosted app that makes frequent external API calls, async performance matters.

**Type Safety End-to-End**

Python's type hints aren't just documentation - FastAPI uses them for validation, serialisation, and OpenAPI generation. This means type errors surface at development time, not in production:

```python
@app.get("/series/{series_id}", response_model=SeriesDetail)
async def get_series(series_id: int) -> SeriesDetail:
    # series_id is validated as int
    # Return type is validated against SeriesDetail schema
    # OpenAPI docs generated automatically
```

**Developer Experience**

Interactive API documentation is generated automatically. No Postman collections, no manual schema maintenance - just visit `/docs` and test endpoints directly in the browser.

**Async/Await Throughout**

FastAPI is built on Starlette and uses async/await by default:

```python
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI()

@app.get("/content/{content_id}")
async def get_content(
    content_id: int,
    db: AsyncSession = Depends(get_db)
):
    async with db.begin():
        result = await db.execute(
            select(Content).where(Content.id == content_id)
        )
        content = result.scalar_one_or_none()
    return content
```

That `await` means other requests can execute whilst waiting for the database. No thread pools, no blocking I/O.

**Automatic API Documentation**

FastAPI generates OpenAPI documentation from type hints:

```python
@app.get("/search", response_model=list[ContentSchema])
async def search_content(
    query: str,
    offset: int = 0,
    limit: int = 20
):
    """Search for TV shows and movies"""
    results = await tvdb_service.search(query, offset, limit)
    return results
```

Visit `/docs` and you get Swagger UI. Visit `/redoc` for ReDoc. No manual documentation, no keeping schemas in sync. Just type hints.

**Pydantic for Validation**

Request and response validation happens automatically:

```python
from pydantic import BaseModel, EmailStr

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@app.post("/auth/login")
async def login(credentials: UserLogin):
    # Invalid email format? Pydantic rejects it before this runs
    user = await authenticate_user(credentials.email, credentials.password)
    return {"access_token": create_token(user)}
```

Invalid data never reaches your handler. The validation layer catches it at the framework level.

## Why PostgreSQL (Async)?

**SQLAlchemy 2.0 with AsyncPG**

whatisonthe.tv uses SQLAlchemy 2.0's async support with asyncpg:

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    "postgresql+asyncpg://watchlog:watchlog@localhost/watchlog"
)

async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)
```

All database queries are non-blocking. This fits FastAPI's async nature perfectly.

**JSONB for Flexible External Data**

The `Content` model stores TheTVDB's full response in a JSONB column:

```python
class Content(Base):
    __tablename__ = "content"

    id: Mapped[int] = mapped_column(primary_key=True)
    tvdb_id: Mapped[int] = mapped_column(unique=True)
    name: Mapped[str]
    content_type: Mapped[str]  # "series" or "movie"
    extra_metadata: Mapped[dict] = mapped_column(JSONB, default={})
```

TheTVDB returns rich data - artwork URLs, network information, air dates, episode summaries, production companies, ratings, plot keywords. JSONB lets me store everything without creating dozens of relational tables. Query what I need now, ignore the rest, access it later if requirements change.

**Polymorphic Relationships**

Content can be either a series or a movie, with type-specific details:

```python
class Content(Base):
    # ... base fields ...

    # One-to-one relationships based on type
    series_detail: Mapped["SeriesDetail"] = relationship(
        back_populates="content"
    )
    movie_detail: Mapped["MovieDetail"] = relationship(
        back_populates="content"
    )

    @property
    def is_series(self) -> bool:
        return self.content_type == "series"

    @property
    def is_movie(self) -> bool:
        return self.content_type == "movie"
```

This pattern avoids inheritance complexity whilst maintaining type-specific data.

## The Caching Pattern: Database-First with Async Refresh

This is the critical architectural decision. Users never wait for external API calls.

**The Pattern:**

1. **Check database first** - Look for content in PostgreSQL
2. **Return cached data immediately** if found (~50-100ms response)
3. **Schedule background sync** if data is missing or stale
4. **Celery worker fetches from TheTVDB** (~200-300ms per API call)
5. **Update database** asynchronously
6. **Next request gets fresh data** from the database

This is called **cache-aside with asynchronous write-through**. The user gets instant responses whilst the database stays current in the background.

```python
# Simplified example of the pattern
async def get_series(series_id: int, db: AsyncSession):
    # 1. Check database first
    series = await db.get(Content, series_id)

    if series:
        # 2. Return immediately
        # 3. Schedule refresh if stale (>7 days old)
        if series.last_synced_at < datetime.now() - timedelta(days=7):
            save_series_full.delay(series.tvdb_id)
        return series
    else:
        # 4. No cache - schedule Celery task to fetch and save
        save_series_full.delay(series_id)
        # Return 202 Accepted - data is being fetched
        raise HTTPException(status_code=202, detail="Fetching data...")
```

**Why This Works:**

- Users get sub-100ms responses from PostgreSQL
- TheTVDB API calls happen in background workers
- Database writes don't block user requests
- Stale data refreshes automatically
- Failed API calls retry up to 3 times

## Celery for Background Jobs

**Redis as Message Broker**

Celery uses Redis as the message broker and result backend:

```python
# Celery configuration
app = Celery(
    "whatisonthe.tv",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)
```

**Content Sync Tasks**

Two primary tasks handle data synchronisation:

```python
@celery_app.task(bind=True, max_retries=3)
def save_series_full(self, tvdb_id: int, api_data: dict = None):
    """Fetch series from TheTVDB and save to database"""
    # Random jitter (5-15s) to distribute API load
    time.sleep(random.uniform(5, 15))

    try:
        # Fetch from API if not provided
        if not api_data:
            api_data = tvdb_service.get_series_details(tvdb_id)

        # Save series, genres, credits, aliases, seasons, episodes
        # All within a database transaction
        with db.begin():
            series = create_or_update_series(api_data)
            save_genres(series, api_data["genres"])
            save_credits(series, api_data["cast"])
            save_seasons_and_episodes(series, tvdb_id)

        logger.info(f"Series {tvdb_id} synced successfully")
    except Exception as e:
        logger.error(f"Failed to sync series {tvdb_id}: {e}")
        raise self.retry(exc=e, countdown=60)
```

The same pattern applies to `save_movie_full`.

**Scheduled Maintenance**

Three periodic tasks keep the database fresh:

1. **Weekly Content Refresh** (Sundays at 3 AM)
   ```python
   @celery_app.task
   def refresh_stale_content():
       """Refresh content not synced in 7+ days"""
       stale_series = get_stale_content(content_type="series", days=7, limit=100)
       for series in stale_series:
           save_series_full.delay(series.tvdb_id)
   ```

2. **Weekly People Refresh**
   - Updates actors, directors, writers not synced in 14+ days

3. **Monthly Sync Log Cleanup** (1st of month at 4 AM)
   - Deletes sync logs older than 30 days to prevent table bloat

**Flower for Monitoring**

Celery tasks are monitored via Flower at `http://localhost:5555`:
- Active/completed tasks
- Worker health
- Performance metrics
- Retry status

## The Data Model

**Content, Series, Movies, Episodes**

The domain model reflects how TV and film metadata is structured:

- `Content` - Base entity (series or movie)
- `SeriesDetail` - Additional series-specific data
- `MovieDetail` - Additional movie-specific data
- `Season` - Grouping of episodes
- `Episode` - Individual episodes
- `Person` - Actors, directors, writers, producers
- `Credit` - Many-to-many join between Content and Person with role
- `Genre` - Categorisation (many-to-many with Content)

This mirrors TheTVDB's structure, making sync operations straightforward.

**User Management**

Simple user model with JWT authentication:

```python
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]
```

Passwords are hashed with bcrypt. JWTs expire after 7 days. No OAuth, no social login - just email and password.

## Authentication

**JWT with 7-Day Expiry**

Login returns a JWT that's valid for 7 days:

```python
from jose import jwt
from datetime import datetime, timedelta

def create_access_token(user: User) -> str:
    expires = datetime.utcnow() + timedelta(
        minutes=settings.access_token_expire_minutes  # 10080 = 7 days
    )
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "exp": expires
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")
```

Authentication endpoints:
- `POST /auth/login` - Returns JWT + user data
- `GET /auth/me` - Returns current user
- `PATCH /auth/me` - Update profile
- `POST /auth/me/password` - Change password
- `POST /auth/logout` - Client-side token deletion

Simple, stateless, works.

## Why SvelteKit?

I wanted a frontend framework that didn't ship a massive runtime to the browser. React (44KB), Vue (34KB), and Angular (60KB+) all include framework code in every page load. Svelte compiles away.

**No Virtual DOM**

Svelte compiles components to vanilla JavaScript that manipulates the DOM directly. No diffing algorithm, no reconciliation, no framework overhead:

```svelte
<script>
  let count = 0;
  // This compiles to direct DOM updates
  // No virtual DOM diffing
</script>

<button on:click={() => count += 1}>
  Clicked {count} times
</button>
```

The compiled output is surgical - only the code needed to update that specific element.

**Server-Side Rendering by Default**

SvelteKit server-renders pages on first load, then hydrates for interactivity. Users see content instantly, search engines index properly, and the app still feels like a SPA.

**TypeScript Without Configuration**

SvelteKit includes TypeScript support out of the box. No webpack config, no tsconfig wrestling - it just works:

```typescript
// Automatically typed from the API response
export async function load({ fetch, params }) {
  const res = await fetch(`/api/series/${params.id}`);
  const series: SeriesDetail = await res.json();
  return { series };
}
```

**Smaller Bundle Sizes**

A comparable React app would ship ~150KB of framework code. The Svelte equivalent? ~15KB. That's a 10x reduction before you write a single line of application code.

**Developer Experience**

Svelte's syntax is closer to vanilla HTML/CSS/JS than JSX or Vue's template syntax. Less magic, less abstraction, easier to reason about.

**Tailwind CSS 3**

Utility-first styling with Tailwind 3:

```svelte
<div class="max-w-4xl mx-auto p-6">
  <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
    {content.name}
  </h1>
</div>
```

The frontend is still in development, but the pattern is: server-rendered HTML, enhanced with Svelte components for interactivity.

## Architecture Decisions

**Separate Frontend/Backend**

The backend is a pure API. The frontend is a separate SvelteKit app. They communicate over HTTP.

This means:
- Backend can be deployed independently
- Frontend can be swapped (mobile app, CLI, etc.)
- Clear separation of concerns
- Easier testing (mock API responses)

**CORS Configuration**

The API allows CORS from `localhost:5173` (Vite), `localhost:5174`, and `localhost:3000`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

This lets the SvelteKit frontend make requests to the FastAPI backend during development.

## What Works Now

- User authentication (registration, login, profile management)
- TheTVDB API integration with caching
- Search for TV series and movies
- Fetch detailed metadata (series, movies, episodes, people)
- PostgreSQL storage with async queries
- Redis caching layer
- JWT authentication with 7-day tokens

## What's Next

- Check-in functionality (log what you've watched)
- Personal viewing history and stats
- Integration with streaming platforms (Apple TV+, Netflix, Amazon Prime)
- Recommendations based on viewing history
- Complete the SvelteKit frontend

## Lessons Learned

**Async SQLAlchemy is Worth It**

The async overhead is minimal, and the benefits (non-blocking I/O, concurrent requests) are real. Even for a personal project, it's the right pattern.

**JSONB for External APIs**

TheTVDB's API returns inconsistent data structures. JSONB columns let me store everything without complex normalisation. Query what I need, ignore the rest.

**The Database-First Pattern is Powerful**

Cache-aside with async write-through means users get instant responses (~50-100ms from PostgreSQL) whilst background workers keep the data fresh. This pattern works brilliantly for external API aggregation.

**Separate Frontend/Backend is Cleaner**

Having the backend as a pure API means I can build multiple clients (web, mobile, CLI) without touching the backend. The separation forces good API design.

## Conclusion

FastAPI + async PostgreSQL + Redis + SvelteKit is a modern, performant stack for building web applications. The async architecture handles I/O efficiently, the type system catches bugs early, and the separation of concerns makes the system maintainable.

For whatisonthe.tv, this architecture prioritises developer experience, type safety, and performance - exactly what I wanted.

You can view the source on [GitHub](https://github.com/swmcc/whatisonthe.tv).
