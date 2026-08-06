#!/usr/bin/env python3
"""Get recent Spotify listening and save to JSON."""
import argparse
import json
import os
from pathlib import Path

import requests

ROOT_DIR = Path(__file__).parent.parent

# Credentials must be provided via environment variables — never hardcode them.
CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET")
REFRESH_TOKEN = os.environ.get("SPOTIFY_REFRESH_TOKEN")

missing = [
    name
    for name, value in [
        ("SPOTIFY_CLIENT_ID", CLIENT_ID),
        ("SPOTIFY_CLIENT_SECRET", CLIENT_SECRET),
        ("SPOTIFY_REFRESH_TOKEN", REFRESH_TOKEN),
    ]
    if not value
]
if missing:
    print(f"Error: missing required environment variable(s): {', '.join(missing)}")
    exit(1)

parser = argparse.ArgumentParser()
parser.add_argument("--output", "-o", help="Output file path")
args = parser.parse_args()

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

if "error" in token_resp:
    print(f"Error getting token: {token_resp}")
    exit(1)

access_token = token_resp["access_token"]

# Get recently played
recent = requests.get(
    "https://api.spotify.com/v1/me/player/recently-played?limit=20",
    headers={"Authorization": f"Bearer {access_token}"}
).json()

# Determine output path
if args.output:
    output_file = Path(args.output)
else:
    output_file = ROOT_DIR / "public" / "spotify.json"

with open(output_file, "w") as f:
    json.dump(recent, f, indent=2)

print(f"Wrote {len(recent['items'])} tracks to {output_file}")
