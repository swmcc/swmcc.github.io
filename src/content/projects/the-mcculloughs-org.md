---
title: "Building the-mcculloughs.org"
description: "Why I'm building a Rails monolith to archive family photos from the 1930s onwards, migrating from Flickr to own the data and ensure longevity"
pubDate: 2025-11-10
tags: ["rails", "active-storage", "data-ownership", "family", "photography"]
---

## The Problem

I want to own my family's photo history. Not trust it to Flickr, Facebook, or any other platform that can change ownership, modify terms, or disappear entirely.

This is part of the same philosophy behind [Jotter](/projects/building-jotter), my [thoughts section](/thoughts), and this site itself: **own your data**. If the platform changes, your data should remain accessible. If the service shuts down, your memories should survive.

the-mcculloughs.org is an archive of my family photos spanning from the 1930s to the present day. It's built with Rails 8, shares architectural patterns with Jotter, and prioritises mobile-first access and effortless uploading.

## Why Leave Flickr?

I've been using Flickr for years. It's a solid photo hosting service with good features and reasonable pricing. But there are problems:

**Data Ownership**

When you upload to Flickr, you're trusting Yahoo (or SmugMug, or whoever owns it next) with your photos. The terms change. The ownership changes. In 2018, [Verizon sold Flickr to SmugMug](https://en.wikipedia.org/wiki/Flickr#SmugMug_acquisition). Who knows what happens next?

My family photos from the 1930s - scanned negatives, precious memories - shouldn't be subject to corporate acquisition strategies.

**Platform Lock-In**

Flickr's organisation model doesn't export cleanly. Albums, collections, tags, descriptions - they're all structured around Flickr's data model. Migrating elsewhere means rebuilding that organisation from scratch.

**Storage Costs vs Control**

Flickr Pro costs £60/year for unlimited storage. For a family archive that could span terabytes of high-resolution scans, that's reasonable. But you're paying for convenience, not ownership.

With self-hosting, storage is a one-time hardware cost (or cheap cloud storage), and you control retention, backups, and access indefinitely.

**Family Sharing Limitations**

Flickr's sharing model is built for photographers sharing with audiences, not families sharing privately amongst themselves. Permissions are coarse-grained, organisation is photographer-centric, and the interface isn't designed for casual family browsing.

**Longevity**

Will Flickr exist in 20 years? Maybe. Will it exist in 50 years when my children want to show their children photos from the 1930s? Unknown.

Self-hosted archives don't depend on external companies. The data is portable, the code is open source, and the infrastructure is under my control.

## What the-mcculloughs.org Is

A Rails 8 monolith for archiving and sharing family photos. It's currently a photo sharing website, but I have bigger plans - family tree integration, timeline views, story annotations, collaborative family history. For now, it's starting with the foundation: getting photos uploaded, organised, and accessible.

**Current Features:**

- Photo upload with metadata (date, location, people)
- Albums and galleries
- Polymorphic tagging (same pattern as Jotter)
- Public/private visibility controls
- Mobile-first responsive design
- Active Storage for file management
- Multiple image variants (thumbnail, medium, full-resolution)

**Who It's For:**

Family members. My parents, siblings, extended family - anyone who wants to browse family history. Authentication is simple (no Facebook OAuth complexity), and the interface is designed for people who aren't technical.

## Shared Patterns with Jotter

the-mcculloughs.org and [Jotter](/projects/building-jotter) share significant architectural patterns:

**Polymorphic Tagging**

```ruby
class Photo < ApplicationRecord
  has_many :taggings, as: :taggable, dependent: :destroy
  has_many :tags, through: :taggings
end
```

Tags work across photos, albums, and galleries. One tagging system, multiple content types. The same pattern Jotter uses for bookmarks and images.

**Active Storage**

Both applications use Rails' Active Storage for file uploads:

```ruby
class Photo < ApplicationRecord
  has_one_attached :image

  def thumbnail
    image.variant(resize_to_limit: [200, 200])
  end

  def display
    image.variant(resize_to_limit: [1200, 1200])
  end

  def full_resolution
    image.variant(resize_to_limit: [3000, 3000])
  end
end
```

Image variants are generated on demand and cached. Upload once, serve multiple sizes for different contexts (thumbnails in grids, full-resolution for viewing).

**Rails Monolith Simplicity**

Both are Rails monoliths. No microservices, no separate frontend/backend, no API layer. One codebase, one database, one deployment.

For applications serving a small number of users (family members, in this case), the monolith is the right choice. No distributed systems complexity, no service boundaries to manage, no network latency between components.

**Public/Private Visibility**

```ruby
scope :public_photos, -> { where(is_public: true) }
scope :private_photos, -> { where(is_public: false) }
```

Same pattern as Jotter. Some photos are public (shareable with extended family or friends), others are private (immediate family only). Enforced at the model level, checked in controllers.

## Mobile-First is Paramount

Family members browse photos on their phones, not desktops. The interface is designed mobile-first:

- Touch-friendly controls (large tap targets, swipe gestures)
- Responsive images (serve appropriate sizes for device)
- Fast loading (lazy loading, progressive image loading)
- Offline-capable (service worker for previously-viewed photos)

Tailwind CSS 4 handles responsive design with utility classes. Hotwire (Turbo + Stimulus) provides interactivity without heavy JavaScript frameworks.

**Example: Photo Upload from Mobile**

```javascript
// Stimulus controller for drag-and-drop or tap-to-upload
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "preview"]

  upload(event) {
    const files = event.target.files
    Array.from(files).forEach(file => {
      // Show preview immediately
      const reader = new FileReader()
      reader.onload = (e) => {
        this.showPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    })
  }

  showPreview(dataUrl) {
    const img = document.createElement('img')
    img.src = dataUrl
    img.className = 'w-32 h-32 object-cover rounded'
    this.previewTarget.appendChild(img)
  }
}
```

Tap the upload button, select photos from your camera roll, see previews immediately, submit when ready. No complex multi-step process, no confusing UI.

## Ease of Uploading is Paramount

The biggest barrier to a family photo archive is friction during upload. If uploading is tedious, photos stay on phones and hard drives instead of being archived.

**Batch Upload**

Select multiple photos at once, upload in one operation. Active Storage handles multiple attachments, background jobs process image variants.

**Metadata Auto-Detection**

EXIF data is parsed automatically:
- Date taken (from camera metadata)
- GPS coordinates (if available)
- Camera model
- Orientation

Users can override or supplement this data, but defaults are extracted from the image itself.

**Progressive Enhancement**

The upload form works without JavaScript (standard file input + form submission). With JavaScript, it's enhanced with drag-and-drop, previews, and progress indicators.

## What's Next

Photo sharing is the foundation, but I have bigger plans:

**Family Tree Integration**

Link photos to family members, show relationships, build a visual family tree with photos attached to nodes.

**Timeline Views**

Chronological timeline of family history - births, weddings, events - with photos illustrating each moment.

**Story Annotations**

Family members can add stories, context, and memories to photos. "This is my grandmother's house in 1947" or "This was taken the day before Dad left for the war."

**Collaborative Family History**

Multiple family members contributing photos, stories, and corrections. Not just an archive - a living family history that grows over time.

**Offline Access**

Service worker for offline browsing. Download albums to your phone, view them without internet, sync changes when back online.

## Why a Rails Monolith?

I could have built this as a SPA with a separate API backend. I could have used microservices. I could have gone serverless.

But Rails is the right choice for this:

**Simplicity**

One codebase, one server, one deployment. No coordination between services, no API versioning, no distributed tracing complexity.

**Developer Velocity**

Rails conventions mean I'm writing application code, not infrastructure glue. Active Storage handles uploads, Active Record handles database queries, Hotwire handles interactivity.

**Long-Term Maintenance**

This is a family project I'll maintain for decades. Simplicity matters more than architectural novelty. Rails has been around since 2004 and will be around in 2044.

**Extensibility**

When I add family tree features, timeline views, or story annotations, they'll integrate naturally with the existing Rails app. No cross-service communication, no API contracts to maintain.

## Own Your Data

the-mcculloughs.org is part of a broader philosophy:

- **This site**: Thoughts, notes, and writing live here, not on social media
- **Jotter**: Bookmarks and images under my control, not Delicious or Pinterest
- **the-mcculloughs.org**: Family photos owned by the family, not Flickr or Facebook

Platforms change ownership, modify terms, and shut down. Data you control survives.

Family photos from the 1930s deserve better than corporate terms of service.

## Conclusion

the-mcculloughs.org is a Rails 8 monolith for archiving family photos. It shares patterns with Jotter (Active Storage, polymorphic tagging, public/private visibility), prioritises mobile-first access and easy uploading, and ensures family photo history isn't subject to platform changes or corporate acquisitions.

It's starting as a photo sharing website. It'll grow into something more - family tree, timeline, collaborative history. But the foundation is: own your data, control your infrastructure, and ensure longevity.

You can view the source on [GitHub](https://github.com/swmcc/the-mcculllughs.org). Yes, I know I misspelled my own name in the repository URL (mcculllughs vs mcculloughs). Renaming a GitHub repository causes redirect issues, breaks existing clones, and requires updating CI/CD configs. Too much hassle for a typo.
