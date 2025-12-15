#!/usr/bin/env python3
"""Get recent Spotify listening and save to JSON."""
import argparse
import json
import os
from pathlib import Path

import requests

ROOT_DIR = Path(__file__).parent.parent

# Credentials from env vars (GitHub Actions) or fallback to hardcoded (local dev)
CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID", "af253baf8c664d648e4e01308bd2c052")
CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET", "0d06f3babe96490bb720945171a78183")
REFRESH_TOKEN = os.environ.get(
    "SPOTIFY_REFRESH_TOKEN",
    "AQBVmhhsO-dlNZdhQm-thLmbT7MQuxPHiCqWzJOWMJPgp0jcsMsv-ZNhDUSXejxlwmcZv7ceOXw-gFinhNuhEqv8ljgnShCAiWu3wOC1WeEZCNcT690f5DG8yHwyCGLuU7U"
)

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
