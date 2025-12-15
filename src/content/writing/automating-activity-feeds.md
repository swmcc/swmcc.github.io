---
title: "Automating Activity Feeds with GitHub Actions and Gists"
description: "How I set up automated Spotify and GitHub activity feeds for my personal site using GitHub Actions and Gists"
pubDate: 2025-12-15
tags: ["github-actions", "automation", "astro"]
---

I wanted my personal site to show what I'm currently listening to on Spotify and what I've been coding on GitHub. The challenge: keeping this data fresh without manual updates or expensive API calls on every page load.

## The Problem

Both Spotify and GitHub have APIs, but there are issues with calling them directly from a static site:

1. **Rate limiting** - GitHub's API has strict limits for unauthenticated requests
2. **Authentication** - Spotify requires OAuth tokens that expire
3. **Performance** - Multiple API calls on page load slow things down
4. **Reliability** - If either API is down, the page breaks

## The Solution

I settled on a simple architecture:

1. **GitHub Actions** run on a schedule (every 6 hours)
2. **Python scripts** fetch and process the data
3. **GitHub Gists** store the processed JSON
4. **The site** fetches from the Gists with local caching

This gives me fresh data without hammering APIs on every page view, and the Gists act as a reliable CDN-cached data source.

## Spotify Integration

The Spotify script uses a refresh token to get an access token, then fetches recently played tracks:

```python
# Get access token from refresh token
token_resp = requests.post(
    "https://accounts.spotify.com/api/token",
    data={
        "grant_type": "refresh_token",
        "refresh_token": REFRESH_TOKEN,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }
).json()

# Fetch recently played
recent = requests.get(
    "https://api.spotify.com/v1/me/player/recently-played?limit=20",
    headers={"Authorization": f"Bearer {token_resp['access_token']}"}
).json()
```

The workflow runs every 6 hours and uploads the result to a Gist:

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'

steps:
  - name: Fetch Spotify data
    env:
      SPOTIFY_CLIENT_ID: ${{ secrets.SPOTIFY_CLIENT_ID }}
      SPOTIFY_CLIENT_SECRET: ${{ secrets.SPOTIFY_CLIENT_SECRET }}
      SPOTIFY_REFRESH_TOKEN: ${{ secrets.SPOTIFY_REFRESH_TOKEN }}
    run: python scripts/update_spotify.py --output spotify.json

  - name: Update Gist
    uses: exuanbo/actions-deploy-gist@v1
    with:
      token: ${{ secrets.GIST_TOKEN }}
      gist_id: ${{ secrets.SPOTIFY_GIST_ID }}
      file_path: spotify.json
```

## GitHub Activity

For GitHub, I fetch public events and process them into a cleaner format, grouping commits by repository:

```python
# Fetch public events
response = requests.get(
    f"https://api.github.com/users/{USERNAME}/events/public?per_page=100",
    headers=headers
)

# Filter for push events and group by repo
push_events = [e for e in events if e["type"] == "PushEvent"]
```

The GitHub workflow is similar, just offset by 30 minutes to spread the load.

## Client-Side Fetching

The Astro components fetch from the Gists with a local storage cache to reduce requests:

```javascript
const CACHE_KEY = 'spotify-activity-cache';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

async function loadSpotifyActivity() {
  // Check cache first
  const cached = getCachedData();
  if (cached) {
    renderTracks(cached);
    return;
  }

  // Fetch from Gist
  const response = await fetch(GIST_URL);
  const data = await response.json();

  setCachedData(data);
  renderTracks(data);
}
```

For the GitHub activity component, I also added a fallback to the direct API in case the Gist is unavailable.

## Secrets Required

The workflows need these secrets configured in the repository:

- `SPOTIFY_CLIENT_ID` - From the Spotify Developer Dashboard
- `SPOTIFY_CLIENT_SECRET` - From the Spotify Developer Dashboard
- `SPOTIFY_REFRESH_TOKEN` - Obtained via OAuth flow
- `GIST_TOKEN` - A GitHub PAT with gist scope
- `SPOTIFY_GIST_ID` - The ID of the Spotify data Gist
- `ACTIVITY_GIST_ID` - The ID of the GitHub activity Gist

Note that GitHub doesn't allow secrets starting with `GITHUB_`, hence `ACTIVITY_GIST_ID` rather than `GITHUB_GIST_ID`.

## Results

The setup works well:

- Data updates automatically every 6 hours
- Page loads are fast since we're just fetching static JSON
- No rate limiting issues
- The site still works if either external API is down (shows cached or Gist data)

You can see the results on the [listenin' to](/listenin) and [codin'](/codin) pages.

## Future Improvements

A few things I might add later:

- Webhook triggers when I listen to something new
- More granular caching based on data freshness
- Error notifications if workflows fail repeatedly

For now though, this simple setup does exactly what I need.
