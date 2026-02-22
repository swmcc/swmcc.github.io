---
title: "Indexatron: Teaching Local LLMs to See Family Photos"
description: "An experiment using Ollama with LLaVA and nomic-embed-text to analyse family photos locally - proving that privacy-preserving AI photo analysis actually works"
pubDate: 2026-02-22
tags: ["ai", "python", "ollama", "llm", "privacy", "experiment"]
---

> **Status:** ✅ SUCCESS
> **Hypothesis:** Local LLMs can analyse family photos with useful metadata extraction

I've been building [the-mcculloughs.org](https://the-mcculloughs.org) - a [family photo sharing app](/projects/the-mcculloughs-org). The Rails side handles uploads, galleries, and all the usual stuff. But I wanted semantic search - not just "photos from 2015" but "photos at the beach" or "pictures with grandma."

The cloud APIs exist. But uploading decades of family photos to someone else's servers? Hard pass.

Time for a science experiment - two apps working together.

## The Experiment

I called it [**Indexatron**](https://github.com/swmcc/indexatron) 🤖

The goal: prove that Ollama running locally with LLaVA:7b and nomic-embed-text can:

1. **Analyse photos** - Extract descriptions, detect people/objects, estimate era
2. **Generate embeddings** - Create 768-dimensional vectors for similarity search
3. **Process batches** - Handle multiple images with progress tracking

## Test Results

| Metric | Value |
|--------|-------|
| Images Processed | 3/3 |
| Failed | 0 |
| Total Time | 40.82s |
| Avg Time/Image | ~13.6s |

### Sample Outputs

#### 🐕 family_photo_03.jpg
- **Description:** "A tan-coloured Labrador Retriever is sitting on a wooden floor indoors"
- **Categories:** `["dog"]`
- **Mood:** calm
- **Processing Time:** 14.73s

#### 🍺 family_photo_02.jpg
- **Description:** "A photo of a bottle of beer and a glass with frothy white head on top, placed on a table at a restaurant"
- **Location:** Indoor restaurant
- **Objects Detected:** Beer bottle (Kingfisher brand), glass with beer
- **Categories:** `["beer", "restaurant"]`
- **Processing Time:** 14.2s

#### 👔 family_photo_01.jpg
- **Description:** "A man standing in an indoor conference room during a wedding reception"
- **Era Detected:** 2010s (medium confidence)
- **Person:** Male guest, 30s, wearing suit and tie
- **Categories:** `["wedding"]`
- **Processing Time:** 11.89s

## What Worked Well

### LLaVA Vision Analysis
- Correctly identified subjects (dog, beer, person)
- Detected specific brands (Kingfisher)
- Estimated era from visual cues
- Provided useful mood/atmosphere descriptions

### Embedding Generation
- 768-dimensional embeddings generated for all images
- Based on analysis descriptions (semantic meaning)
- Ready for similarity search when needed

### Batch Processing
- Progress bar with Rich library
- Skip existing functionality
- Combined JSON output

## Quirks & Learnings

### JSON Parsing Required Repair

LLaVA doesn't always output clean JSON. The analyser needed:
- Code block stripping
- Brace balancing
- Type coercion for nested objects

### Model Hallucinations

Some amusing observations:
- The dog photo mentioned "clothing" and "fashion trends for pets" (the dog had no clothes)
- Beer was classified under `people` array with `estimated_age: "Beer is an alcoholic beverage"`

These quirks don't break the system - robust parsing handles them.

### Processing Time

~13.6 seconds per image is acceptable for batch processing. Real-time analysis would need:
- Smaller model (llava:7b is the smallest)
- GPU acceleration
- Or async processing with user feedback

## Development Approach

This was parallel development across two codebases - with very different approaches for each.

### The Boring Bits: AI Agents for CRUD

The Rails API work? It's not exciting. Setting up API endpoints, adding pgvector, writing migrations, CRUD operations - I've done this hundreds of times. It's necessary scaffolding, but it's not where I want to spend my brain cycles.

So I let AI agents handle it. Claude Code with custom agents for code review, test writing, and documentation. The agents handled the boilerplate while I reviewed and approved. This is exactly what AI assistance is good for - augmenting the repetitive work so you can focus on what matters.

### The Interesting Bits: README-Driven Development

Indexatron was different. This was an experiment - I needed to understand every piece, make deliberate choices, and document as I went. For this, I used README-driven development:

1. **Write the README first** - Document what the code should do before writing it
2. **One branch per milestone** - Each branch proves one thing works
3. **Merge only when it works** - No moving on until the milestone is complete
4. **AI for documentation** - Let agents help write up the results

README-driven development forces you to think through the design before coding. It's slower, but you end up with working code *and* documentation. Perfect for experiments where you need to prove something works.

## Development Progress

### Indexatron (Python) - The Experiment

README-driven development with one branch per milestone:

| PR | Milestone | What It Proved |
|----|-----------|----------------|
| [#5](https://github.com/swmcc/indexatron/pull/5) | Project Setup | Foundation ready |
| [#1](https://github.com/swmcc/indexatron/pull/1) | Ollama Connection | Local LLM runtime accessible |
| [#2](https://github.com/swmcc/indexatron/pull/2) | Image Analysis | LLaVA extracts useful metadata |
| [#3](https://github.com/swmcc/indexatron/pull/3) | Embeddings | 768-dim vectors for similarity |
| [#4](https://github.com/swmcc/indexatron/pull/4) | Batch Processing | Scalable to many images |

Each branch had to work before moving on. Prove it, merge it, move on.

### Rails App - The Integration (Agent-Assisted)

While I focused on Indexatron, AI agents handled the Rails infrastructure:

| PR | Feature |
|----|---------|
| [#60](https://github.com/swmcc/the-mcculloughs.org/pull/60) | AI Photo Analysis API with pgvector |

Standard API endpoint, database migration, pgvector setup - all the CRUD that's been done a thousand times before. The agents wrote the code, I reviewed it, tests passed, merged. That's the right division of labour: agents handle the predictable, humans handle the novel.

## Technical Stack

```
Ollama (local runtime)
├── llava:7b (~4.7GB) - Vision analysis
└── nomic-embed-text (~274MB) - Embeddings

Python 3.11+
├── ollama - API client
├── pydantic - Data validation
├── pillow - Image handling
└── rich - Console output
```

## Next Steps

This proves the concept works. Future integration:

1. **Rails API** - Add endpoint for on-demand analysis
2. **Database Storage** - Save embeddings in PostgreSQL (pgvector)
3. **Similarity Search** - Find "photos like this one"
4. **Face Recognition** - Cluster photos by person (future model)

## Conclusion

🤖 **The robots can see our photos.**

Local LLMs provide a privacy-preserving alternative to cloud APIs for photo analysis. The quality is good enough for family photo organisation, and the 768-dimensional embeddings enable future similarity search features.

## Code

| Repository | Description |
|------------|-------------|
| [swmcc/indexatron](https://github.com/swmcc/indexatron) | Python service for local LLM photo analysis |
| [swmcc/the-mcculloughs.org](https://github.com/swmcc/the-mcculloughs.org) | Rails family photo sharing app |

**Full experiment results:** [RESULTS.md](https://github.com/swmcc/indexatron/blob/main/RESULTS.md)

---

*Built with Ollama, LLaVA, and a healthy scepticism of cloud APIs.*
