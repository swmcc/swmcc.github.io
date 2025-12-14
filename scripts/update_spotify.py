#!/usr/bin/env python3
"""Get recent Spotify listening and save to public/spotify.json."""
import json
from pathlib import Path
import requests

ROOT_DIR = Path(__file__).parent.parent

CLIENT_ID = "af253baf8c664d648e4e01308bd2c052"
CLIENT_SECRET = "0d06f3babe96490bb720945171a78183"
REFRESH_TOKEN = "AQBVmhhsO-dlNZdhQm-thLmbT7MQuxPHiCqWzJOWMJPgp0jcsMsv-ZNhDUSXejxlwmcZv7ceOXw-gFinhNuhEqv8ljgnShCAiWu3wOC1WeEZCNcT690f5DG8yHwyCGLuU7U"

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

access_token = token_resp["access_token"]

# Get recently played
recent = requests.get(
    "https://api.spotify.com/v1/me/player/recently-played?limit=20",
    headers={"Authorization": f"Bearer {access_token}"}
).json()

output_file = ROOT_DIR / "public" / "spotify.json"
with open(output_file, "w") as f:
    json.dump(recent, f, indent=2)

print(f"Wrote {len(recent['items'])} tracks to {output_file}")
