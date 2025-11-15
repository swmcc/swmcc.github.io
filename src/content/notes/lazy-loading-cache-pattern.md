---
title: "Lazy Loading Cache for whatisonthe.tv"
pubDate: 2025-11-16
tags: ["caching", "architecture", "python"]
---

Working on [whatisonthe.tv](https://whatisonthe.tv), I needed a caching pattern for film and star metadata lookups. The app pulls data from external APIs (TMDb for cast lists, film details) but only when the data doesn't exist in the database. A background worker fetches from the API and saves it to the database, avoiding repeated expensive API calls. The cache sits in front of the database to speed up reads.

## The Problem

The app queries film and star metadata frequently - same films, same actors, multiple users browsing. Without caching:

- Repeated database reads slow things down
- API rate limits get hit quickly
- External API calls are expensive (latency and cost)
- Preloading everything wastes resources on data no one requests

The flow without caching:
1. User requests film metadata
2. Check database
3. If not in database, queue background worker
4. Worker hits API, saves to database
5. Return data to user
6. Next user requesting same film hits database again (slow)

## How Lazy Loading Cache Works

The cache sits in front of the database and only the database. API lookups happen separately via background workers.

The flow with caching:

1. User requests film metadata
2. Check the cache first
3. If in cache and fresh, return it immediately (fast)
4. If not in cache, check the database
5. If in database, store it in cache and return it
6. If not in database, queue background worker to fetch from API
7. Worker fetches from API, saves to database
8. Next request will find it in cache or database (no API call needed)

The cache grows based on real usage. Popular films stay in cache, obscure ones get cached on first database hit. The background worker only runs when data is completely missing, avoiding expensive API calls for already-known films.

## Implementation in Python

```python
import time
from workers import enqueue_fetch_film

CACHE = {}
TTL = 300  # 5 minutes for film/star metadata

def get_film(film_id):
    cache_key = f"film:{film_id}"
    now = time.time()

    # Check cache first
    item = CACHE.get(cache_key)
    if item and now - item['ts'] < TTL:
        return item['data']

    # Cache miss - check database
    data = db.query_film(film_id)

    if data:
        # Found in database - cache it
        CACHE[cache_key] = {'data': data, 'ts': now}
        return data

    # Not in database - queue background worker to fetch from API
    enqueue_fetch_film(film_id)
    return None  # or return placeholder/loading state

# Background worker (runs separately)
def fetch_film_worker(film_id):
    # Hit external API (TMDb, etc)
    api_data = tmdb_api.get_film(film_id)

    # Save to database
    db.save_film(film_id, api_data)

    # Next request will find it in database and cache it
```

For whatisonthe.tv, this meant:
- Popular films stay cached (no database or API hits)
- First request for a film hits database only
- Missing films trigger one API call via worker
- All subsequent requests are cached
- Saves API rate limits and costs

## Why Use It

This pattern works well when:
- External API calls are expensive (rate limits, latency, cost)
- Reads are more common than writes
- Slightly stale data is acceptable (film metadata doesn't change frequently)
- You want a cache that maintains itself
- You want to avoid extra infrastructure (Redis, Memcached)

The key benefit: API lookups only happen once per film. The database stores it permanently, and the cache speeds up repeated reads. If the cache is wiped (server restart, deployment), everything keeps working. It just warms up again based on traffic.

## Trade-offs

**Advantages:**
- Self-maintaining - no explicit invalidation logic
- Minimal infrastructure
- Database remains authoritative
- Graceful degradation

**Disadvantages:**
- First request after TTL expiry is slow (cache miss)
- Memory grows unbounded without eviction policy
- Not suitable for distributed systems (in-memory only)

For whatisonthe.tv, an in-memory cache with occasional misses is fine. If it scales beyond a single instance, Redis with the same pattern would work.

## Summary

Lazy loading cache combined with database-backed storage and background workers is a safe and predictable pattern. API lookups only happen once per entity, the database stores it permanently, and the cache speeds up repeated reads.

For whatisonthe.tv, this means:
- One API call per film (ever)
- Database hits for first request after cache expiry
- Cache hits for everything else
- No wasted API calls
- No rate limit issues

It's the right level of sophistication for a side project - solves the problem without introducing new ones.
