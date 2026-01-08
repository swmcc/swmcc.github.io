# Content Domain Specification

This specification defines the requirements for content management in swm.cc.

## Overview

The site uses Astro Content Collections with five distinct content types, each with specific schemas, workflows, and display requirements.

---

## Writing (Blog Posts)

Long-form articles covering technical topics, essays, and project retrospectives.

### Requirements

1. **WRT-001**: Every writing post MUST have a unique slug derived from filename
2. **WRT-002**: Every writing post MUST have `title`, `description`, and `pubDate` frontmatter
3. **WRT-003**: Writing posts with `draft: true` MUST NOT appear in production listings
4. **WRT-004**: Writing posts MUST be sorted by `pubDate` descending on index pages
5. **WRT-005**: Writing posts SHOULD have at least one tag for categorization
6. **WRT-006**: The `updatedDate` field SHALL be set when content is significantly revised

### Schema

```typescript
{
  title: string;           // Required
  description: string;     // Required - used for SEO
  pubDate: Date;          // Required
  updatedDate?: Date;     // Optional - set on revision
  tags?: string[];        // Optional but recommended
  draft?: boolean;        // Optional - hides from listings
}
```

### Scenarios

**Scenario: Publishing a new writing post**
- GIVEN a markdown file in `src/content/writing/`
- WHEN the file has valid frontmatter with title, description, and pubDate
- AND draft is not set or is false
- THEN the post SHALL appear on `/writing` index page
- AND the post SHALL be accessible at `/writing/{slug}`
- AND the post SHALL appear in the RSS feed

**Scenario: Draft writing post**
- GIVEN a writing post with `draft: true`
- WHEN the site is built
- THEN the post MUST NOT appear on `/writing` index
- AND the post MUST NOT appear in RSS feed
- BUT the post MAY be accessible via direct URL in development

---

## Notes

Short technical snippets, TILs (Today I Learned), and code examples.

### Requirements

1. **NTE-001**: Every note MUST have a unique slug derived from filename
2. **NTE-002**: Every note MUST have `title` and `pubDate` frontmatter
3. **NTE-003**: Notes MUST be sorted by `pubDate` descending on index pages
4. **NTE-004**: Notes SHOULD be concise (typically < 500 words)
5. **NTE-005**: Notes SHALL include code examples where applicable

### Schema

```typescript
{
  title: string;      // Required
  pubDate: Date;      // Required
  tags?: string[];    // Optional
}
```

### Scenarios

**Scenario: Publishing a technical note**
- GIVEN a markdown file in `src/content/notes/`
- WHEN the file has valid frontmatter with title and pubDate
- THEN the note SHALL appear on `/notes` index page
- AND the note SHALL be accessible at `/notes/{slug}`

**Scenario: Note with code snippets**
- GIVEN a note containing fenced code blocks
- WHEN the note is rendered
- THEN code blocks SHALL have syntax highlighting
- AND code blocks SHALL use the `github-dark-dimmed` theme

---

## Thoughts

Microblog-style short posts, similar to tweets.

### Requirements

1. **THT-001**: Every thought MUST have a unique slug derived from filename
2. **THT-002**: Every thought MUST have `pubDate` frontmatter
3. **THT-003**: Thoughts MAY have `pubTime` for time-of-day precision
4. **THT-004**: Thoughts MUST NOT have a title (content is the title)
5. **THT-005**: Thoughts SHOULD be brief (typically < 280 characters)
6. **THT-006**: Thoughts MUST be sorted by `pubDate` (and `pubTime` if present) descending

### Schema

```typescript
{
  pubDate: Date;       // Required
  pubTime?: string;    // Optional - format "HH:MM"
  tags?: string[];     // Optional
}
```

### Scenarios

**Scenario: Publishing a thought**
- GIVEN a markdown file in `src/content/thoughts/`
- WHEN the file has valid frontmatter with pubDate
- THEN the thought content SHALL appear on `/thoughts` page
- AND on the homepage in the "Latest Thought" card

**Scenario: Thought with time**
- GIVEN a thought with `pubTime: "14:30"`
- WHEN the thought is displayed
- THEN the time SHALL be shown alongside the date

---

## Projects

Documentation for personal and professional projects.

### Requirements

1. **PRJ-001**: Every project MUST have a unique slug derived from filename
2. **PRJ-002**: Every project MUST have `title`, `description`, and `pubDate` frontmatter
3. **PRJ-003**: Projects MUST be displayed on `/projects` page
4. **PRJ-004**: Projects SHOULD include technology tags
5. **PRJ-005**: Projects MAY include screenshots or diagrams

### Schema

```typescript
{
  title: string;        // Required
  description: string;  // Required
  pubDate: Date;       // Required
  tags?: string[];     // Optional - technologies used
}
```

### Scenarios

**Scenario: Adding a new project**
- GIVEN a markdown file in `src/content/projects/`
- WHEN the file has valid frontmatter
- THEN the project SHALL appear on `/projects` page
- AND the project description SHALL be visible in the listing

---

## Now Page

A snapshot of current activities, updated periodically.

### Requirements

1. **NOW-001**: The current now page MUST be at `src/content/now/current.md`
2. **NOW-002**: The now page MUST have `updatedDate` frontmatter
3. **NOW-003**: The `updatedDate` MUST be displayed to visitors
4. **NOW-004**: Past now pages MAY be archived with `archived: true`
5. **NOW-005**: The now page content SHOULD be updated at least monthly

### Schema

```typescript
{
  updatedDate: Date;    // Required
  archived?: boolean;   // Optional - for past versions
  month?: string;       // Optional - for archived pages
  year?: number;        // Optional - for archived pages
}
```

### Scenarios

**Scenario: Viewing the now page**
- GIVEN the current.md file exists
- WHEN a user visits `/now`
- THEN the content SHALL be displayed
- AND the last updated date SHALL be visible

**Scenario: Archiving a now page**
- GIVEN an existing now page
- WHEN creating a new now page
- THEN the old page MAY be moved to an archive
- AND marked with `archived: true`, `month`, and `year`

---

## RSS Feed

### Requirements

1. **RSS-001**: The RSS feed MUST be available at `/rss.xml`
2. **RSS-002**: The feed MUST include all published writing posts
3. **RSS-003**: The feed MUST NOT include draft posts
4. **RSS-004**: The feed MUST use `en-gb` language tag
5. **RSS-005**: Each item MUST have title, description, link, and pubDate

### Scenarios

**Scenario: RSS feed generation**
- GIVEN writing posts exist
- WHEN the site is built
- THEN `/rss.xml` SHALL be generated
- AND the feed SHALL validate as valid RSS 2.0

---

## Cross-Cutting Concerns

### Tagging

1. **TAG-001**: Tags SHOULD use lowercase with hyphens (e.g., `ruby-on-rails`)
2. **TAG-002**: Tags SHOULD be consistent across content types
3. **TAG-003**: Common tags include: `typescript`, `astro`, `ruby`, `python`, `devops`

### Dates

1. **DTE-001**: All dates MUST be in ISO 8601 format in frontmatter (YYYY-MM-DD)
2. **DTE-002**: Dates SHALL be displayed in UK format (DD/MM/YYYY) to users
3. **DTE-003**: Dates SHALL include proper `datetime` attribute in `<time>` elements

### SEO

1. **SEO-001**: Every page MUST have a unique `<title>` tag
2. **SEO-002**: Every page MUST have a meta description
3. **SEO-003**: Writing posts and projects MUST have OpenGraph meta tags
4. **SEO-004**: The sitemap MUST be generated at `/sitemap-index.xml`
