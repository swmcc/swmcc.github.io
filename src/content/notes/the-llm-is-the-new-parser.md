---
title: "The LLM Is the New Parser"
pubDate: 2026-02-24
tags: ["llm", "ollama", "parsing", "ai"]
---

I spent the early 2000s writing parsers. HTML scrapers with regex that would make you cry. XML deserializers that handled seventeen flavours of "valid". CSV readers that knew a comma inside quotes wasn't a delimiter.

The pattern was always the same: the world gives you garbage, you write defensive code to extract meaning.

Then APIs won. JSON with schemas. Type-safe clients. The parsing era ended. We'd civilised the machines.

Now I'm building [Indexatron](https://github.com/swmcc/indexatron), a local LLM pipeline for analysing family photos. LLaVA looks at an image, I ask for JSON, and I get... this:

```
```json
{
  "description": "A dog sitting on a wooden floor",
  "categories": ["dog"],
  "people": [
    {"estimated_age": "Beer is an alcoholic beverage"}
  ]
}
```
```

The model wrapped JSON in markdown code fences. It put beer in the `people` array with an age field containing a Wikipedia definition. Sometimes the braces don't balance. Sometimes it returns YAML when you asked for JSON.

Sound familiar?

**We're back to parsing unreliable output.** The only difference is the garbage now comes from a neural network instead of a web server. The defensive patterns are identical:

```python
# Strip markdown code blocks
if response.startswith("```"):
    response = response.split("```")[1]
    if response.startswith("json"):
        response = response[4:]

# Balance braces
open_braces = response.count("{")
close_braces = response.count("}")
if open_braces > close_braces:
    response += "}" * (open_braces - close_braces)

# Parse and pray
try:
    data = json.loads(response)
except JSONDecodeError:
    data = {"raw": response, "parsed": False}
```

Twenty years of progress and I'm back to "try to parse it, catch the exception, return something usable anyway."

The irony isn't lost on me. We built trillion-parameter models that can write poetry and explain quantum physics, but they can't reliably close a curly brace. The solution? Wrap them in the same defensive parsing code we wrote for Internet Explorer's HTML in 2003.

The LLM is the new parser. It turns unstructured data (images, documents, audio) into semi-structured output that you then parse into actually-structured data.

The more things change.
