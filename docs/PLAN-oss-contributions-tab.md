# Plan: Open Source Tab

## Overview

Add a tabbed interface to `/codin` with two views:
1. **Recent Activity** (default) - Current dynamic view showing commits
2. **Open Source** - Curated list of OSS projects with package links

## URL Design

```
/codin              → Recent Activity (default)
/codin?view=oss     → Open Source projects
```

## UI Design

```
┌─────────────────────────────────────────────────────────────┐
│  [Recent Activity]  [Open Source]                           │
│                     ─────────────                           │
│                                                             │
│  A collection of open source packages I maintain and        │
│  projects I contribute to.                                  │
│                                                             │
│  ── My Packages ──                                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📦 mailview                                          │   │
│  │                                                      │   │
│  │ "Email preview middleware for development"          │   │  ← GitHub description
│  │                                                      │   │
│  │ I built this because I wanted letter_opener for     │   │  ← My detailed description
│  │ Python. It captures outgoing emails and displays    │   │
│  │ them in a browser UI at /_mail.                     │   │
│  │                                                      │   │
│  │ [GitHub]  [PyPI]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ── Contributions ──                                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🤝 tvdb-v4-python                                    │   │
│  │                                                      │   │
│  │ "Official TVDB API v4 Python client"                │   │  ← GitHub description
│  │                                                      │   │
│  │ I use this in whatisonthe.tv and have contributed   │   │  ← My detailed description
│  │ bug fixes and improvements back to the official     │   │
│  │ client.                                              │   │
│  │                                                      │   │
│  │ [GitHub]  [PyPI]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Structure

Projects defined in a data file or component with:

```typescript
interface OSSProject {
  name: string;
  repo: string;                    // e.g., "swmcc/mailview"
  description?: string;            // My detailed description (optional)
  links: {
    github: string;
    pypi?: string;
    npm?: string;
    gem?: string;
  };
  type: 'package' | 'contribution'; // For grouping
}
```

GitHub descriptions fetched at runtime (with caching).

## Projects

### My Packages

| Name | Repo | Links |
|------|------|-------|
| mailview | swmcc/mailview | GitHub, PyPI |
| mailjunky | swmcc/mailjunky | GitHub, ? |
| mailjunky-python | swmcc/mailjunky-python | GitHub, PyPI |
| tvdb_api | swmcc/tvdb_api | GitHub, PyPI? |

### Contributions

| Name | Repo | Links |
|------|------|-------|
| tvdb-v4-python | thetvdb/tvdb-v4-python | GitHub, PyPI |

## Implementation

### Files

| File | Change |
|------|--------|
| `src/pages/codin.astro` | Add tab switching, read `?view=` param |
| `src/components/OSSProjects.astro` | **NEW** - Open Source view |
| `src/data/oss-projects.ts` | **NEW** - Project definitions with descriptions |

### Flow

1. Page reads `?view=` query param
2. Renders tab UI with active state
3. Conditionally shows GitHubActivity or OSSProjects
4. OSSProjects fetches GitHub descriptions on load
5. Merges with custom descriptions from data file
6. Caches in localStorage (1 hour)

## Questions to Resolve

1. Package links for each project (pypi/npm/gem URLs)
2. Your detailed descriptions for each project

## Next Steps

1. [x] Plan approved
2. [ ] Create data file with projects
3. [ ] Build OSSProjects component
4. [ ] Add tab UI to codin.astro
5. [ ] Fetch GitHub descriptions
6. [ ] Add your custom descriptions
