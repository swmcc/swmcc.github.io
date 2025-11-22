import os
import json
import spotipy
from spotipy.oauth2 import SpotifyOAuth

CLIENT_ID = os.environ["SPOTIFY_CLIENT_ID"]
CLIENT_SECRET = os.environ["SPOTIFY_CLIENT_SECRET"]
REFRESH_TOKEN = os.environ["SPOTIFY_REFRESH_TOKEN"]

auth = SpotifyOAuth(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri="http://localhost:8888/callback",
    scope="user-read-recently-played"
)

token_info = {"refresh_token": REFRESH_TOKEN}
access = auth.refresh_access_token(token_info["refresh_token"])
sp = spotipy.Spotify(auth=access["access_token"])

recent = sp.current_user_recently_played(limit=20)

with open("spotify.json", "w") as f:
    json.dump(recent, f, indent=2)
