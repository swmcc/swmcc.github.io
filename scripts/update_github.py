#!/usr/bin/env python3
"""Fetch GitHub activity and save to JSON."""
import argparse
import json
import os
from pathlib import Path

import requests

ROOT_DIR = Path(__file__).parent.parent
GITHUB_USERNAME = "swmcc"

parser = argparse.ArgumentParser()
parser.add_argument("--output", "-o", help="Output file path")
args = parser.parse_args()

# GitHub token is optional but helps with rate limiting
github_token = os.environ.get("GITHUB_TOKEN")
headers = {"Accept": "application/vnd.github+json"}
if github_token:
    headers["Authorization"] = f"Bearer {github_token}"

# Fetch public events
response = requests.get(
    f"https://api.github.com/users/{GITHUB_USERNAME}/events/public?per_page=100",
    headers=headers
)
response.raise_for_status()
events = response.json()

# Filter for push events
push_events = [e for e in events if e["type"] == "PushEvent"]

# Process and fetch commit details
repo_commits = {}
for event in push_events[:30]:  # Limit to 30 events
    repo_name = event["repo"]["name"]
    repo_short_name = repo_name.split("/")[-1]
    before = event["payload"]["before"]
    head = event["payload"]["head"]

    try:
        compare_resp = requests.get(
            f"https://api.github.com/repos/{repo_name}/compare/{before}...{head}",
            headers=headers
        )
        if compare_resp.ok:
            compare_data = compare_resp.json()
            commits = compare_data.get("commits", [])

            if repo_name not in repo_commits:
                repo_commits[repo_name] = {
                    "shortName": repo_short_name,
                    "fullName": repo_name,
                    "commits": [],
                    "lastDate": event["created_at"]
                }

            # Update lastDate to most recent
            if event["created_at"] > repo_commits[repo_name]["lastDate"]:
                repo_commits[repo_name]["lastDate"] = event["created_at"]

            for commit in commits:
                repo_commits[repo_name]["commits"].append({
                    "message": commit["commit"]["message"],
                    "sha": commit["sha"],
                    "date": event["created_at"]
                })
    except Exception as e:
        print(f"Error fetching commits for {repo_name}: {e}")

# Sort by most recent and limit to 5 repos
repos = sorted(repo_commits.values(), key=lambda x: x["lastDate"], reverse=True)[:5]

# Determine output path
if args.output:
    output_file = Path(args.output)
else:
    output_file = ROOT_DIR / "public" / "github.json"

with open(output_file, "w") as f:
    json.dump(repos, f, indent=2)

total_commits = sum(len(r["commits"]) for r in repos)
print(f"Wrote {len(repos)} repos ({total_commits} commits) to {output_file}")
