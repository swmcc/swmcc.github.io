# Site Domain Specification

This specification defines the requirements for site structure, navigation, theming, and user experience in swm.cc.

## Overview

The site is a static personal website with modern web standards, focusing on performance, accessibility, and a clean user experience.

---

## Navigation

### Requirements

1. **NAV-001**: The header navigation MUST be present on all pages
2. **NAV-002**: Navigation MUST include links to: Home, About, Now, Writing, Notes, Projects
3. **NAV-003**: The site logo/name MUST link to the homepage
4. **NAV-004**: Navigation MUST be accessible via keyboard (Tab navigation)
5. **NAV-005**: The current page SHOULD be visually indicated in navigation
6. **NAV-006**: Navigation MUST be responsive with mobile menu support

### Scenarios

**Scenario: Desktop navigation**
- GIVEN a user on desktop viewport (> 768px)
- WHEN viewing any page
- THEN all navigation links SHALL be visible in the header
- AND navigation SHALL use horizontal layout

**Scenario: Mobile navigation**
- GIVEN a user on mobile viewport (< 768px)
- WHEN viewing any page
- THEN navigation SHOULD collapse to a hamburger menu
- AND tapping the menu SHALL reveal navigation links

**Scenario: Keyboard navigation**
- GIVEN a user navigating with keyboard
- WHEN pressing Tab key
- THEN focus SHALL move through navigation links in order
- AND focused links SHALL have visible focus indicator

---

## Theme (Dark/Light Mode)

### Requirements

1. **THM-001**: The site MUST support both light and dark color schemes
2. **THM-002**: The site MUST respect system preference (`prefers-color-scheme`)
3. **THM-003**: Users MUST be able to manually toggle theme
4. **THM-004**: Theme preference MUST persist across sessions (localStorage)
5. **THM-005**: Theme toggle MUST NOT cause flash of wrong theme on page load
6. **THM-006**: All color values MUST use CSS custom properties for theming

### Scenarios

**Scenario: First visit with system dark mode**
- GIVEN a user's system is set to dark mode
- AND this is their first visit
- WHEN the page loads
- THEN the site SHALL display in dark mode
- AND no flash of light mode SHALL occur

**Scenario: Manual theme toggle**
- GIVEN a user on the site
- WHEN they click the theme toggle button
- THEN the theme SHALL switch immediately
- AND the preference SHALL be saved to localStorage
- AND subsequent page loads SHALL use the saved preference

**Scenario: Saved preference overrides system**
- GIVEN a user has previously selected light mode
- AND their system is set to dark mode
- WHEN they return to the site
- THEN the site SHALL display in light mode (their saved preference)

---

## Layout and Structure

### Requirements

1. **LAY-001**: Every page MUST use semantic HTML5 elements
2. **LAY-002**: Every page MUST have exactly one `<main>` element
3. **LAY-003**: The page structure MUST be: `<header>`, `<main>`, `<footer>`
4. **LAY-004**: Content width MUST NOT exceed `max-w-4xl` (896px) for readability
5. **LAY-005**: The layout MUST be responsive across all viewport sizes
6. **LAY-006**: The footer MUST be sticky to bottom on short pages

### Scenarios

**Scenario: Page structure validation**
- GIVEN any page on the site
- WHEN the HTML is inspected
- THEN there SHALL be one `<header>` element with `role="banner"`
- AND there SHALL be one `<main>` element
- AND there SHALL be one `<footer>` element with `role="contentinfo"`

**Scenario: Short page layout**
- GIVEN a page with minimal content
- WHEN the viewport is taller than the content
- THEN the footer SHALL remain at the bottom of the viewport
- AND content SHALL not stretch unnaturally

---

## Performance

### Requirements

1. **PRF-001**: First Contentful Paint MUST be under 1 second
2. **PRF-002**: Largest Contentful Paint MUST be under 2.5 seconds
3. **PRF-003**: Cumulative Layout Shift MUST be under 0.1
4. **PRF-004**: Total page weight SHOULD be under 100KB (excluding images)
5. **PRF-005**: JavaScript MUST NOT block initial render
6. **PRF-006**: Links SHOULD be prefetched on hover for instant navigation

### Scenarios

**Scenario: JavaScript-disabled experience**
- GIVEN a user with JavaScript disabled
- WHEN they visit any page
- THEN the content SHALL be fully readable
- AND navigation SHALL work (standard links)
- AND theme SHALL follow system preference

**Scenario: Link prefetching**
- GIVEN a user hovering over an internal link
- WHEN the hover event fires
- THEN the linked page SHALL be prefetched
- AND clicking the link SHALL navigate instantly (from cache)

---

## Accessibility

### Requirements

1. **A11Y-001**: The site MUST meet WCAG 2.1 AA standards
2. **A11Y-002**: All pages MUST have proper heading hierarchy (h1 -> h2 -> h3)
3. **A11Y-003**: All images MUST have `alt` attributes (can be empty for decorative)
4. **A11Y-004**: Color contrast MUST be at least 4.5:1 for normal text
5. **A11Y-005**: Interactive elements MUST have visible focus indicators
6. **A11Y-006**: The site MUST respect `prefers-reduced-motion`
7. **A11Y-007**: All interactive elements MUST have accessible names (ARIA labels)

### Scenarios

**Scenario: Heading hierarchy**
- GIVEN any page on the site
- WHEN the heading structure is analyzed
- THEN there SHALL be exactly one `<h1>` element
- AND subsequent headings SHALL not skip levels (h1 -> h3 is invalid)

**Scenario: Image accessibility**
- GIVEN a page with images
- WHEN the images are inspected
- THEN every `<img>` SHALL have an `alt` attribute
- AND meaningful images SHALL have descriptive alt text

**Scenario: Reduced motion preference**
- GIVEN a user with `prefers-reduced-motion: reduce`
- WHEN they visit the site
- THEN all animations SHALL be disabled or minimal
- AND view transitions SHALL be instant (no animation)

**Scenario: Focus indicator visibility**
- GIVEN a user navigating with keyboard
- WHEN they Tab to an interactive element
- THEN a visible focus indicator SHALL appear
- AND the indicator SHALL have sufficient contrast

---

## Homepage

### Requirements

1. **HOM-001**: The homepage MUST display the site owner's name prominently
2. **HOM-002**: The homepage MUST show latest content from: Thoughts, Writing, Notes
3. **HOM-003**: Each content card MUST link to its respective section or item
4. **HOM-004**: The homepage SHOULD have animated hero section (respecting motion preference)
5. **HOM-005**: Content cards MUST show publication date and excerpt

### Scenarios

**Scenario: Homepage content display**
- GIVEN content exists in writing, notes, and thoughts
- WHEN a user visits the homepage
- THEN they SHALL see the latest thought
- AND they SHALL see the latest writing post
- AND they SHALL see the latest note
- AND each card SHALL link to the full content

---

## SEO

### Requirements

1. **SEO-001**: Every page MUST have a unique `<title>` tag
2. **SEO-002**: Every page MUST have a meta description
3. **SEO-003**: OpenGraph tags MUST be present for social sharing
4. **SEO-004**: Twitter Card meta tags MUST be present
5. **SEO-005**: Canonical URLs MUST be set correctly
6. **SEO-006**: The sitemap MUST be auto-generated and accessible

### Scenarios

**Scenario: Social sharing metadata**
- GIVEN a writing post
- WHEN the page source is inspected
- THEN `og:title`, `og:description`, and `og:image` SHALL be present
- AND `twitter:card` and `twitter:title` SHALL be present

**Scenario: Sitemap validation**
- GIVEN the site is built
- WHEN `/sitemap-index.xml` is requested
- THEN a valid XML sitemap SHALL be returned
- AND all public pages SHALL be included

---

## Error Handling

### Requirements

1. **ERR-001**: 404 pages SHOULD display a helpful error message
2. **ERR-002**: 404 pages MUST maintain site layout (header, footer)
3. **ERR-003**: 404 pages SHOULD suggest navigation options

### Scenarios

**Scenario: Page not found**
- GIVEN a user visits a non-existent URL
- WHEN the page loads
- THEN a 404 status code SHALL be returned
- AND a user-friendly error message SHALL be displayed
- AND navigation back to the site SHALL be available

---

## View Transitions

### Requirements

1. **VTR-001**: Page transitions MUST use View Transitions API where supported
2. **VTR-002**: Transitions MUST be smooth (no jarring flashes)
3. **VTR-003**: Transitions MUST be fast (< 350ms)
4. **VTR-004**: Transitions MUST gracefully degrade in unsupported browsers
5. **VTR-005**: Transitions MUST respect `prefers-reduced-motion`

### Scenarios

**Scenario: Page transition**
- GIVEN a browser supporting View Transitions API
- WHEN a user clicks an internal link
- THEN the page SHALL transition smoothly
- AND the transition SHALL complete within 350ms

**Scenario: Fallback for unsupported browsers**
- GIVEN a browser without View Transitions support
- WHEN a user clicks an internal link
- THEN standard navigation SHALL occur
- AND no errors SHALL be thrown
