---
title: "A Self-Hosted Image Sharing Pipeline"
pubDate: 2026-01-30
tags: ["rails", "ruby", "automation", "macos"]
---

Image URLs break. You paste a screenshot into Teams, share the link, and six months later it's gone. Corporate firewalls block Imgur. Third-party services sunset features. The URLs you thought were permanent quietly rot.

I built [Jotter](https://github.com/swmcc/jotter) to fix this — a Rails app that handles image uploads and returns short, stable URLs I control.

## The Flow

Drop an image onto a macOS droplet (or run a CLI command), get a short URL on your clipboard. That's it.

The upload endpoint accepts multipart form data and base64 JSON (for iOS Shortcuts):

```ruby
def create
  album = current_user.albums.find_or_create_by!(title: "Uploads")
  photo = album.photos.build(user: current_user)

  if params[:image_base64].present?
    decoded = Base64.decode64(params[:image_base64])
    # attach from decoded bytes...
  else
    photo.image.attach(params[:image])
  end
end
```

Authentication uses bearer tokens — `SecureRandom.hex(32)`. CSRF verification is skipped for JSON requests with a valid token, so scripts and native apps don't need to fuss with form authenticity tokens.

## Short URLs

Each photo gets a 6-character alphanumeric code with collision detection:

```ruby
def generate_short_code
  loop do
    self.short_code = SecureRandom.alphanumeric(6)
    break unless Photo.exists?(short_code: short_code)
  end
end
```

62 characters, 6 positions — roughly 56 billion combinations. Won't be a problem for a personal tool, but the loop handles it gracefully anyway.

The short URL controller serves the actual image blob with `disposition: :inline`, so Slack and Twitter unfurl it properly without any OpenGraph gymnastics.

## The CLI Glue

A small bash script ties it together:

```bash
response=$(curl -s -X POST "$JOTTER_URL/u.json" \
  -H "Authorization: Bearer $JOTTER_TOKEN" \
  -F "image=@$file")

short_url=$(echo "$response" | jq -r '.photo.short_url')
echo "$short_url" | pbcopy
osascript -e "display notification \"$short_url\" with title \"Jotter\""
```

There's also a compiled AppleScript droplet for drag-and-drop, plus an iOS Shortcut that base64-encodes photos from the share sheet.

## Background Variants

Uploads return immediately. A Solid Queue job generates three variants — thumbnail (200px), medium (800px), large (1600px) — so the response feels instant even on larger files.

```ruby
class ProcessPhotoJob < ApplicationJob
  def perform(photo_id)
    photo = Photo.find(photo_id)
    photo.image.variant(:thumbnail).processed
    photo.image.variant(:medium).processed
    photo.image.variant(:large).processed
  end
end
```

## Worth It?

The whole thing runs on a single VPS. Every screenshot I share now has a URL I own, that won't expire, that isn't blocked by corporate proxies, and that I can move wherever I like. The friction went from "upload somewhere, copy link, hope it lasts" to "drop file, paste link."

Sometimes the best tool is the one you run yourself.
