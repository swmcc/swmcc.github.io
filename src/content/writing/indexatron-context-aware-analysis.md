---
title: "Indexatron Update: Context-Aware Analysis with Local Vision Models"
description: How injecting domain knowledge into prompts transformed a generic image classifier into something that understands your specific photo archive
pubDate: 2026-04-06T00:00:00.000Z
tags:
  - ai
  - python
  - ollama
  - llm
  - privacy
  - prompt-engineering
syndicate: true
---

*An update to [the original Indexatron experiment](/writing/indexatron-local-llm-photo-analysis/)*

## From Proof of Concept to Production

The original Indexatron answered a simple question: can local LLMs extract meaningful metadata from family photos? The answer was yes, but with caveats.

Feeding a vision model an image with zero context is like asking someone to describe a photo with no knowledge of the subjects, the era, or the occasion. The AI sees pixels. It doesn't see *your* grandmother's wedding or *your* family's Christmas traditions.

This update explores what happens when you bridge that gap by injecting domain knowledge into the analysis pipeline and transforming a generic image classifier into something that understands your specific archive.

## The Problem with Context-Free Analysis

My first runs were disappointing. The AI would look at a 1974 photo titled "Auntie Wilma, Mum, Dad and Uncle Sam" and completely ignore that context. It knew there were people in the photo. It had no idea *who*.

Worse, I tried Llama 3.2 Vision (the newer, supposedly better model) and got output like this:

```json
{
  "categories": ["family", "children", "family", "children", "family", "children"...]
}
```

The model had entered a repetition loop, producing thousands of repeated tags. It also generated oddly-phrased descriptions that weren't suitable for a family website. Not ideal.

## The Solution: Context-Aware Prompting

Instead of asking "what's in this photo?", I started telling the AI what it should already know:

```
IMPORTANT: This photo includes Edmund McCullough, Isobel McCullough.
Use these REAL names in the 'people' array.

IMPORTANT: This photo is from 1974-08-14 (1970s).
Use this as the era decade with 'high' confidence.

This photo is from the album: "Old 35mm Slides"
Caption says: "Auntie Wilma, Mum, Dad and Uncle Sam"
```

The results improved dramatically. The AI now had guardrails.

## Prompt Injection: Teaching the AI Your Domain

The real breakthrough was realising I could inject domain knowledge into the prompt itself. The AI doesn't know my family, but I can *tell* it.

### Alias Resolution

Every family has nicknames. Rather than expecting the AI to understand "Mamie" means my Mum, I built an alias resolver that runs *before* the prompt is constructed:

```python
FAMILY_ALIASES = {
    "nickname": "Real Name",
    # ... your family's nicknames
}
```

The system scans titles, captions, and gallery names for known aliases and injects the real names into the prompt. The AI then uses these names in its output.

### Metadata as Directives

The prompt isn't just "analyse this photo". It's structured with explicit directives:

```
IMPORTANT: This photo includes [extracted names]. Use these names in the 'people' array.
IMPORTANT: This photo is from [date] ([decade]). Use this era with 'high' confidence.
This photo is from the album: "[gallery name]" - [gallery description]
Title: "[photo title]"
Caption: "[photo caption]"
```

This transforms the AI from a generic image analyser into something that understands *your* photos. It knows who might be in the frame before it even looks.

## Model Comparison: LLaVA 7b vs Llama 3.2 Vision

I tested both models extensively. Llama 3.2 Vision is newer, larger (7.8GB vs 4.7GB), and benchmarks suggest it should outperform LLaVA on vision tasks. Reality proved more nuanced.

| Aspect | LLaVA 7b | Llama 3.2 Vision |
|--------|----------|------------------|
| Speed | ~27s per image | ~60s+ per image |
| JSON Output | Mostly valid, occasional truncation | More verbose, sometimes malformed |
| Structured Output | Follows schema reliably | Occasionally enters repetition loops |
| Context Adherence | Good with explicit prompts | Variable, may need different prompting |

LLaVA 7b's tighter, more predictable outputs made it better suited for this structured extraction pipeline. Llama 3.2 Vision's additional capabilities (stronger reasoning, better multi-turn dialogue) might shine in conversational or open-ended analysis tasks.

The lesson isn't that newer models are worse. It's that benchmarks don't tell the whole story. For constrained, schema-driven outputs on a local machine, the smaller model proved more reliable. Your mileage may vary with different prompting approaches or GPU acceleration.

## Performance Optimisations

Several changes made the pipeline faster:

### Image Resizing
Vision models don't need 4000x3000 pixel photos to understand what's in them. Resizing to 1024px max before analysis cut processing time without affecting quality:

```python
max_dim = 1024
if max(img.size) > max_dim:
    img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
```

### Using Pre-Generated Variants
The Rails app already generates 1024px WebP variants for web display. Why download the original when a smaller version exists?

```ruby
image_url: upload_variant_url(upload, :medium)  # 1024px, not :large (2048px)
```

### WebP to JPG Conversion
LLaVA crashes on WebP images (segfault). Converting to JPG before analysis fixed this:

```python
if output_path.suffix.lower() == ".webp":
    with Image.open(output_path) as img:
        img.save(jpg_path, "JPEG", quality=85)
```

## Era Override: Trust the Metadata

The AI guesses photo era from visual cues: clothing, image quality, colour palette. It's often wrong. But I *have* the actual date for many photos from EXIF data or manual entry.

Rather than trust the AI's guess, I override it:

```python
if metadata.get("date_taken"):
    decade = extract_decade(metadata["date_taken"])
    analysis_data["era"] = {
        "decade": decade,
        "confidence": "high",
        "reasoning": f"From actual date: {metadata['date_taken']}"
    }
```

Now a photo from 1974 is correctly tagged as 1970s with high confidence, regardless of what the AI thought.

## Safety Filters

After the Llama 3.2 Vision incident, I added safeguards:

```python
BLOCKED_TERMS = {"inappropriate", "terms", "filtered", "here"}
MAX_CATEGORIES = 20  # Prevents runaway repetition
```

Terms that shouldn't appear in a family photo context get filtered. Category arrays get capped to prevent repetition loops. The AI can still hallucinate, but it can't flood my family website with unsuitable content.

## A Real Example

Here's an actual processing run:

```
Analyzing: YsbAlt.jpg
Context: Title: Auntie Wilma, Mum, Dad and Uncle Sam, Date: 1974-08-14
Waiting for llava:7b...
Response: 511 chars in 27.0s

LLaVA Response:
{
  "description": "Wedding group photo with bride and groom and guests",
  "location": {"setting": "outdoor", "type": "park"},
  "people": [{"name": "Auntie Wilma, Mum, Dad and Uncle Sam", "estimated_age": "adults"}],
  "categories": ["wedding", "celebration", "family", "special occasion", "1970s fashion"],
  "era": {"decade": "1974", "confidence": "medium"},
  "mood": "happy"
}

Overrode era with actual date: 1970s
Generated 768-dimensional embedding
Posted to API
```

The AI saw the context, identified it as a wedding photo, and the era was corrected to use the actual date. Not perfect (it put all four names in one person object) but usable.

## What's Next

The [search API issue](https://github.com/swmcc/the-mcculllughs.org/issues/99) is queued up. Once implemented, I'll be able to:

```
GET /api/uploads/search?person=Isobel+McCullough
GET /api/uploads/search?category=wedding&decade=1970s
GET /api/uploads/search?location=beach
```

Semantic search using the embeddings is also on the roadmap: find photos *similar to* a given photo, regardless of tags.

## Lessons Learned

1. **Context transforms capability.** The same model produces dramatically different results when given domain knowledge. Don't ask AI to guess what you already know. Inject it into the prompt.

2. **Model selection is task-specific.** Benchmarks measure general capability, not fitness for your specific use case. Test with your actual data and requirements.

3. **Hybrid approaches win.** Let AI do what it's good at (visual analysis) while overriding it with ground truth where available (dates, known names). The best results come from human knowledge augmented by machine perception.

4. **Defensive programming matters.** Vision models can produce unexpected outputs: malformed JSON, repetition loops, unsuitable content. Build robust parsing and filtering from day one.

5. **Optimise the right layer.** Resizing images and using pre-generated variants had more impact on performance than model tweaking. Sometimes the boring optimisations are the most effective.

## The Code

Both projects are on GitHub:
- [indexatron](https://github.com/swmcc/indexatron) - The Python analysis service
- [the-mcculloughs.org](https://github.com/swmcc/the-mcculllughs.org) - The Rails family photo site

---

*Local vision models aren't magic. They're tools. The magic happens when you give them the context to understand what they're looking at.*
