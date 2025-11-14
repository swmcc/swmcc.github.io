---
title: "Building Jotter with Rails 8"
description: "Why I chose Ruby on Rails 8, Hotwire, and Tailwind CSS 4 for a self-hosted bookmark and image manager that solves the problem of volatile third-party URLs"
pubDate: 2025-11-14
tags: ["rails", "hotwire", "turbo", "stimulus", "tailwind", "architecture"]
---

## The Problem

I want to own my data. Not trust it to third-party services that can disappear, change terms, or lock me out.

[Delicious](https://en.wikipedia.org/wiki/Delicious_(website)) shut down. [TwitPic](https://en.wikipedia.org/wiki/TwitPic) disappeared, taking millions of images with it. Corporate tools like Microsoft Teams have image URLs that break due to firewall rules and security software. Your bookmarks are tied to wherever you saved them - work machine gets wiped? Gone. Switch jobs? Your bookmarks stay on their infrastructure.

This is the same reason I have a `/thoughts` section on this site instead of posting to X or other social platforms. My writing, my bookmarks, my images - they should outlast any service, employer, or platform.

Jotter is a self-hosted bookmark and image manager where I control the URLs, the data, and the longevity. One system, available everywhere, owned entirely by me.

## Why Rails 8?

Rails is phenomenal. Not boring - phenomenal. It's a framework that has consistently evolved whilst maintaining its core philosophy: developer happiness through convention and productivity.

**The One-Stop Shop**

Rails 8 gives you everything you need out of the box. No hunting for authentication libraries, no debating state management patterns, no endless configuration files. You get:

- Built-in authentication (new in Rails 8)
- Active Storage for file uploads
- Hotwire for progressive enhancement
- Action Cable for WebSockets
- Active Job for background processing
- Solid Queue and Solid Cache (optional, but integrated)

This matters. For Jotter, I wanted to leverage the full Rails ecosystem without bolting on third-party gems. Rails 8's built-in authentication was particularly appealing - simple, understandable, and no external dependencies.

**Convention Over Configuration**

Rails makes thousands of decisions for you. File structure, naming conventions, database migrations, routing - all standardised. You're writing application code, not configuration files:

```ruby
# app/controllers/bookmarks_controller.rb
class BookmarksController < ApplicationController
  allow_unauthenticated_access only: [:index, :show]

  def index
    @bookmarks = if authenticated?
      current_user.bookmarks
    else
      Bookmark.public_bookmarks
    end

    @bookmarks = @bookmarks.tagged_with(params[:tag]) if params[:tag].present?
    @bookmarks = @bookmarks.search(params[:query]) if params[:query].present?
  end
end
```

No decorators, no service objects, no layers of abstraction. Just controllers that do what controllers should do.

**Rails 8's Built-in Authentication**

This was the first time I used Rails 8's built-in authentication, and it's excellent. Previous projects used Devise (powerful but opinionated) or custom solutions. Rails 8 gives you the middle ground:

```bash
rails generate authentication
```

You get:
- Session-based authentication
- Password hashing with bcrypt
- Current user helpers (`authenticated?`, `current_user`)
- Password reset flow

It's ~300 lines of code you can read, understand, and modify. No magic, no metaprogramming gymnastics, just straightforward Rails code.

## What Jotter Actually Does

**Bookmarks** (completed):
- Save URLs with title and description
- Tag-based organisation
- Public/private visibility controls
- Short URLs for sharing (`/x/<short_code>`)
- Browser bookmarklet for one-click saving
- Search across title, description, and URL

**Images** (completed):
- Organised into albums and galleries
- Drag-and-drop uploads via Stimulus
- Short, shareable URLs
- Tagging system (shared with bookmarks)
- Public/private visibility
- Active Storage with three variant sizes (thumbnail, medium, large)
- Background processing via Solid Queue for image variants

The core insight: both bookmarks and images need the same foundational features - tagging, privacy controls, short URLs, and search. Rails makes this trivial through polymorphic associations and shared concerns.

## Polymorphic Tagging

Tags work across bookmarks, photos, albums, and galleries via a polymorphic `taggings` table:

```ruby
# app/models/bookmark.rb
class Bookmark < ApplicationRecord
  belongs_to :user
  has_many :taggings, as: :taggable, dependent: :destroy
  has_many :tags, through: :taggings

  def tag_list=(value)
    tag_names = value.is_a?(String) ? value.split(',') : value
    tag_names = tag_names.map(&:strip).map(&:downcase).reject(&:blank?)

    self.tags = tag_names.map do |name|
      Tag.find_or_create_by(name: name)
    end
  end

  def tag_list
    tags.pluck(:name).join(', ')
  end
end
```

The same pattern applies to `Photo`, `Album`, and `Gallery`. One tagging system, multiple content types. This is the power of Rails conventions - polymorphic associations are first-class citizens.

## Short URLs for Sharing

Every bookmark, photo, album, and gallery gets a unique short code for sharing:

```ruby
# app/models/bookmark.rb
class Bookmark < ApplicationRecord
  before_create :generate_short_code

  private

  def generate_short_code
    self.short_code = loop do
      code = SecureRandom.alphanumeric(6)
      break code unless Bookmark.exists?(short_code: code)
    end
  end
end
```

Routes map `/x/:short_code` to the appropriate content. Simple, reliable, collision-resistant.

## Hotwire for Progressive Enhancement

Hotwire (Turbo + Stimulus) keeps the application server-rendered with sprinkles of interactivity.

**Stimulus for Photo Uploads**

The photo upload controller handles drag-and-drop:

```javascript
// app/javascript/controllers/photo_upload_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "preview"]

  handleDrop(event) {
    event.preventDefault()
    const files = event.dataTransfer.files
    this.inputTarget.files = files
    this.previewFiles(files)
  }

  previewFiles(files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        // Display preview
      }
      reader.readAsDataURL(file)
    })
  }
}
```

This is Stimulus at its best - enhancing existing HTML forms, not replacing them. Without JavaScript, the file input still works. With JavaScript, you get drag-and-drop and previews.

**Turbo for Navigation**

Turbo handles form submissions and page transitions without full reloads. Combined with Rails' convention of redirecting after POST, the application feels fast and responsive whilst remaining server-rendered.

## PostgreSQL for Reliability

PostgreSQL provides:
- Foreign key constraints for data integrity
- Concurrent access without locking issues
- Reliable transactions
- Standard SQL types (no NoSQL complexity)

Search is implemented using PostgreSQL's `ILIKE` for case-insensitive pattern matching:

```ruby
# app/controllers/bookmarks_controller.rb
if params[:q].present?
  @bookmarks = @bookmarks.where(
    "title ILIKE ? OR description ILIKE ? OR url ILIKE ?",
    "%#{params[:q]}%", "%#{params[:q]}%", "%#{params[:q]}%"
  )
end
```

Simple, effective, no full-text search complexity needed for a personal bookmark manager.

## Active Storage with Solid Queue for Image Processing

Rails' Active Storage handles image uploads, and Solid Queue processes variants in the background:

```ruby
# app/models/photo.rb
class Photo < ApplicationRecord
  has_one_attached :image

  validates :image,
    presence: true,
    content_type: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'],
    size: { less_than: 10.megabytes }

  # Define three variant sizes
  def thumbnail
    image.variant(resize_to_limit: [200, 200])
  end

  def medium
    image.variant(resize_to_limit: [800, 800])
  end

  def large
    image.variant(resize_to_limit: [1600, 1600])
  end
end
```

When a photo uploads, a background job generates all three variants:

```ruby
# app/jobs/process_photo_job.rb
class ProcessPhotoJob < ApplicationRecord
  queue_as :default

  def perform(photo_id)
    photo = Photo.find_by(id: photo_id)
    return unless photo&.image&.attached?

    # Pre-process all variants
    photo.thumbnail.processed
    photo.medium.processed
    photo.large.processed
  end
end
```

**Why Solid Queue?**

Solid Queue is Rails' database-backed job queue. No Redis, no external dependencies - jobs are stored in PostgreSQL. Image processing happens asynchronously without blocking the upload request.

Active Storage abstracts the storage backend - local disk in development, S3 in production. Image processing uses libvips or ImageMagick under the hood.

## Architecture Decisions

**Monolith, Not Microservices**

One Rails app, one database, one deployment. No service boundaries, no API contracts, no distributed systems complexity.

For a personal tool managing bookmarks and images, a monolith is the correct choice. The entire codebase is comprehensible, changes are atomic, and there's no network latency between "services".

**Public/Private by Default**

Every content type has an `is_public` boolean. Public bookmarks are visible to anyone (useful for sharing reading lists). Private bookmarks are user-only. The same applies to photos, albums, and galleries.

This is implemented at the model level:

```ruby
scope :public_bookmarks, -> { where(is_public: true) }
scope :private_bookmarks, -> { where(is_public: false) }
```

And enforced in controllers:

```ruby
def index
  @bookmarks = authenticated? ? current_user.bookmarks : Bookmark.public_bookmarks
end
```

Simple, effective, no ACL complexity.

**Browser Bookmarklet for Quick Saving**

The bookmarklet is a piece of JavaScript that POSTs to `/bookmarks/new` with the current page's URL and title:

```javascript
javascript:(function(){
  var url = window.location.href;
  var title = document.title;
  window.open('https://your-jotter-instance.com/bookmarks/new?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title), '_blank');
})();
```

This turns Jotter into a one-click bookmarking tool, similar to Delicious in its heyday.

## Tailwind CSS 4

Tailwind 4's CSS-first approach means utilities are defined in `@theme` blocks:

```css
@theme {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
}

@media (prefers-color-scheme: dark) {
  @theme {
    --color-bg: #0a0a0a;
    --color-text: #e0e0e0;
  }
}
```

The `tailwindcss-rails` gem integrates this seamlessly. No PostCSS configuration, no build step complexity, just CSS that works.

## What I Learned

**Rails 8's Authentication is Production-Ready**

I was sceptical about built-in auth being "good enough". It is. For a self-hosted tool with a handful of users (or just me), it's perfect. No Devise bloat, no OAuth complexity, just sessions and passwords.

**Polymorphic Associations are Underrated**

The tagging system works identically across bookmarks, photos, albums, and galleries. One `Tag` model, one `Tagging` join table, multiple content types. This is Rails at its best - conventions that scale across your domain model.

**Active Storage "Just Works"**

File uploads are complex. Storage backends, processing pipelines, CDN integration - there's a lot to get wrong. Active Storage handles all of it. I focused on the application logic, not infrastructure.

**Hotwire Reduces Cognitive Load**

Server-rendered HTML with progressive enhancement means I'm writing Ruby (which I know deeply) rather than managing frontend state (which I'd rather avoid). Stimulus adds interactivity where needed without requiring a SPA architecture.

## What's Next

- Add bulk tagging operations
- Implement bookmark archiving (save full page snapshots)
- API for mobile apps or third-party integrations
- Export functionality (JSON, HTML, markdown)
- Better search (tag combinations, date ranges)

## Conclusion

Rails 8 is a one-stop shop for building web applications. Built-in authentication, Hotwire for modern UX, Active Storage for files, Solid Queue for background jobs, and PostgreSQL for reliability - everything you need is included.

For Jotter, this architecture means I spent time solving the actual problem (volatile third-party URLs) rather than configuring build tools, choosing authentication libraries, or debugging frontend state management.

Rails lets me build. That's why I keep coming back to it.

You can view the source on [GitHub](https://github.com/swmcc/jotter).
