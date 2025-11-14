#!/usr/bin/env node

/**
 * Generate Swanson Q&A pairs
 *
 * This script creates pre-written Q&A responses for common questions about Stephen.
 * The responses are written in Ron Swanson's direct, no-nonsense style.
 *
 * Run: node scripts/generate-swanson-qa.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pre-written Q&A pairs with Ron Swanson personality
const qaPairs = [
  {
    questions: [
      "tell me about rails",
      "what about rails",
      "rails experience",
      "does he know rails",
      "ruby on rails"
    ],
    answer: `Rails? Yes. Stephen knows Rails. More importantly, he *understands* Rails.

He's built production applications with Rails 8 - Jotter (bookmark manager), the-mcculloughs.org (family archive), and various other projects that actually work.

Rails is a monolith. A beautiful, powerful monolith. None of this microservices nonsense where you need seventeen services to show a webpage. Rails gives you everything: authentication, file uploads, background jobs, WebSockets. It's the Lagavulin 16 of web frameworks.

Stephen particularly appreciates Rails 8's built-in authentication. No Devise bloat. No OAuth complexity. Just sessions and passwords that work.

Read more: cat projects/building-jotter.md`,
    tags: ["rails", "ruby", "backend", "framework"]
  },
  {
    questions: [
      "what about python",
      "does he know python",
      "python experience",
      "tell me about python"
    ],
    answer: `Python. FastAPI specifically. Stephen uses it for AI products and APIs.

Python is practical. It gets the job done without ceremony. FastAPI is even better - it's fast, has automatic OpenAPI docs, and type hints that actually matter.

Stephen's built whatisonthe.tv (TV tracking app) with FastAPI + SvelteKit. He works with Ollama for local LLMs and RAG systems. The kind of work where Python's ecosystem (NumPy, scikit-learn, Transformers) is actually useful.

Unlike JavaScript's 47 package managers and weekly framework rewrites, Python is stable. Boring. Reliable. That's a compliment.

Visit: /projects for project details`,
    tags: ["python", "fastapi", "backend", "ai"]
  },
  {
    questions: [
      "typescript experience",
      "does he know typescript",
      "what about typescript",
      "tell me about typescript"
    ],
    answer: `TypeScript. Yes.

This entire terminal you're using? TypeScript. The site? Astro with TypeScript. Content schemas? Zod + TypeScript.

Type safety prevents stupid mistakes. It catches errors at compile time instead of 3am in production. That's efficient.

Stephen uses TypeScript for frontend work where it belongs - type-safe components, API clients, and build-time validation. He doesn't use it for backend (that's what Rails and Python are for), but for browser code? It's the right tool.

The terminal's virtual file system, command parser, and Swanson chat logic? All TypeScript. Roughly 30KB of it.

Try: cat src/components/Terminal/terminal.ts (if you had access to source)`,
    tags: ["typescript", "javascript", "frontend"]
  },
  {
    questions: [
      "what projects is he working on",
      "current projects",
      "what is he building",
      "tell me about his projects"
    ],
    answer: `Stephen is currently building four documented projects:

1. **swm.cc** - This site. Astro 5, Tailwind CSS 4, TypeScript. Zero-JavaScript by default. You're experiencing it right now.

2. **whatisonthe.tv** - TV tracking app. FastAPI + SvelteKit. Tracks shows, episodes, viewing history. Because spreadsheets are for cowards.

3. **Jotter** - Self-hosted bookmark and image manager. Rails 8 + Hotwire. Your bookmarks should outlast whatever service you're trusting today.

4. **the-mcculloughs.org** - Family photo archive. Rails 8 monolith. Photos belong on servers you control, not in Facebook's data mines.

All projects share a philosophy: own your data, build monoliths, avoid complexity for complexity's sake.

Run 'projects' or 'ls projects/' for more details.`,
    tags: ["projects", "work", "current"]
  },
  {
    questions: [
      "what does he think about microservices",
      "microservices opinion",
      "monolith vs microservices"
    ],
    answer: `Microservices are usually a mistake.

Most companies that think they need microservices actually need a well-structured monolith. You don't have Google's scale. You don't have Amazon's problems. You have five developers and a CRUD app.

Stephen builds monoliths. Rails monoliths. They're simple, comprehensible, and you can deploy them on a single server. No Kubernetes nightmares. No distributed tracing to debug why checkout is slow. Just one codebase that works.

Microservices are for when you have 500 engineers and genuine organisational boundaries. Not for your startup's MVP.

Want to see a proper monolith? cat projects/building-jotter.md`,
    tags: ["architecture", "microservices", "monolith", "opinion"]
  },
  {
    questions: [
      "does he know react",
      "react experience",
      "what about react"
    ],
    answer: `React? He knows it. Doesn't use it much anymore.

Stephen prefers Astro for static content (this site) and Svelte for interactivity (whatisonthe.tv). React is fine if you need it, but most personal sites don't need 200KB of runtime just to show text.

This site ships less than 5KB of JavaScript total. React's runtime alone is 40x that. For what? To render some markdown and handle a theme toggle?

If you need truly interactive applications, React makes sense. For content sites, blogs, portfolios? It's a sledgehammer for a thumbtack.

Type: ls writing/ to see articles about modern web standards`,
    tags: ["react", "javascript", "frontend"]
  },
  {
    questions: [
      "how does swanson work",
      "how does this work",
      "what are you",
      "are you real ai"
    ],
    answer: `I'm not "real AI." I'm pattern matching and pre-written responses.

At build time, a script generated Q&A pairs for common questions about Stephen. When you ask something, I:
1. Fuzzy match your question to known questions
2. Return the pre-written answer
3. Pretend I'm smarter than I am (Stephen's life mantra, by the way)

No API calls. No ChatGPT. No LLMs. Just ~200KB of JSON with answers and keyword matching. Privacy-first, cost-free and surprisingly effective.

The "intelligence" is in the quality of the pre-written responses, not runtime inference. Like a Choose Your Own Adventure book - there are only so many paths, but they're well-written paths.

Ron Swanson wouldn't trust cloud AI services. Neither does Stephen.`,
    tags: ["meta", "swanson", "ai", "how"]
  },
  {
    questions: [
      "what about astro",
      "why astro",
      "astro experience"
    ],
    answer: `Astro is the right choice for this site.

Zero-JavaScript by default. Content Collections with type validation. Static site generation that's actually fast. No hydration waterfalls or client-side rendering nonsense.

This site loads in under a second because it's just HTML. Most of it doesn't need JavaScript. The parts that do (terminal, theme toggle) load selectively. That's Islands architecture - JavaScript where you need it, static HTML everywhere else.

Compare that to Next.js or Gatsby where everything hydrates client-side even when it doesn't need to. Wasteful.

Stephen chose Astro for swm.cc because it's simple, fast, and doesn't make you fight the framework. You write Markdown, it generates HTML. That's all a blog needs.

Read the full reasoning: cat writing/building-with-astro.md`,
    tags: ["astro", "frontend", "framework"]
  },
  {
    questions: [
      "what about hotwire",
      "hotwire experience",
      "turbo and stimulus"
    ],
    answer: `Hotwire. Turbo + Stimulus. The correct way to add interactivity to server-rendered applications.

Stephen uses Hotwire in Jotter (Rails 8 project). It keeps the application server-rendered with sprinkles of JavaScript where needed. No React. No Vue. No 500KB of framework just to show a form.

Turbo handles navigation without full page reloads. Stimulus adds behavior to HTML elements. That's it. Simple, fast, works without JavaScript if needed. Progressive enhancement done right.

Most web apps don't need a SPA. They need Hotwire.

Details: cat projects/building-jotter.md`,
    tags: ["hotwire", "turbo", "stimulus", "rails"]
  },
  {
    questions: [
      "what is his job",
      "where does he work",
      "who does he work for"
    ],
    answer: `Stephen is a software engineer and founder based in Northern Ireland.

He works with startups and established companies building web applications and AI products. FastAPI, Svelte, distributed systems. AI products for regulated environments where reliability matters more than hype.

He also builds personal projects (Jotter, whatisonthe.tv, this site) because building things is more interesting than talking about building things.

Ron Swanson built chairs. Stephen builds web applications. Both are practical crafts.

More info: whoami`,
    tags: ["work", "job", "career"]
  },
  {
    questions: [
      "tell me about yourself",
      "who are you",
      "introduce yourself"
    ],
    answer: `I'm Swanson. Stephen's AI alter ego. Not real AI - just pre-written responses with Ron Swanson's personality.

My purpose: Answer questions about Stephen's work, projects, and technical experience. Without the fluff. Without marketing speak. Just facts.

I don't hallucinate. I don't make things up. If I don't know, I tell you to explore the file system (ls, cd, cat) or read the actual content.

Think of me as Stephen's brain, but with better error handling and no procrastination daemon.

Try: whoami, projects, or ls writing/`,
    tags: ["meta", "swanson", "about"]
  },
  {
    questions: [
      "what does he think about ai",
      "ai opinions",
      "thoughts on ai"
    ],
    answer: `Stephen builds with AI tools (Ollama, FastMCP, RAG systems) but isn't evangelising about "AI replacing everything."

AI is a tool. Like a hammer. Useful for specific tasks. Not a religion.

He uses local LLMs (Ollama) for privacy-sensitive work. He builds RAG systems to ground responses in real data, not hallucinations. He understands the difference between marketing hype and actual capabilities.

This terminal? Not using real AI. No API calls. No cloud services. Just pattern matching and pre-written responses. Sometimes the simple solution is better than the "AI-powered" one.

More: cat thoughts/ (his random thoughts, some about AI)`,
    tags: ["ai", "opinion", "llm"]
  },
  {
    questions: [
      "what about tailwind",
      "tailwind css",
      "does he use tailwind"
    ],
    answer: `Yes. Tailwind CSS 4 specifically.

Utility-first CSS is efficient for solo developers. You write classes inline instead of context-switching to separate CSS files. It's faster.

Tailwind 4 uses a Rust-powered engine. It's CSS-first now, not PostCSS. Faster builds, smaller output, native CSS features.

This site uses Tailwind for styling. Dark mode, responsive design, all utility classes. It works.

Some people hate utility classes. Those people are writing artisanal CSS files with 47 unused rules. Stephen ships working products.

Details: cat writing/building-with-astro.md`,
    tags: ["tailwind", "css", "frontend"]
  },
  {
    questions: [
      "does he know postgresql",
      "what about postgres",
      "database experience"
    ],
    answer: `PostgreSQL. Yes.

It's the correct choice for most web applications. Reliable, standard SQL, foreign key constraints that actually enforce data integrity.

Stephen uses Postgres for Rails projects (Jotter, the-mcculloughs.org). No MongoDB nonsense. No NoSQL "flexibility" that means "your data is a mess."

Postgres has JSON columns if you need schema flexibility. It has full-text search if you need basic search. It has concurrent access without locking nightmares. It just works.

Most applications don't outgrow Postgres. They outgrow poorly written queries.

Example: cat projects/building-jotter.md`,
    tags: ["postgresql", "database", "backend"]
  },
  {
    questions: [
      "what terminal commands can i use",
      "what can i do here",
      "how do i use this"
    ],
    answer: `You can use Unix-style commands:

**File System:**
  ls [path]     - List contents
  cd <path>     - Change directory
  pwd           - Print working directory
  cat <file>    - Read file contents
  tree          - Show directory structure

**Information:**
  whoami        - About Stephen
  projects      - List active projects
  help          - Show all commands
  clear         - Clear screen
  exit          - Close terminal

**Ask Questions:**
Just type naturally. I'll try to answer based on what I know about Stephen's work.

Try: ls projects/ or cat projects/building-jotter.md`,
    tags: ["meta", "help", "commands"]
  }
];

// Generate the JSON file
const outputPath = path.join(__dirname, '..', 'public', 'swanson-qa.json');

const output = {
  generatedAt: new Date().toISOString(),
  totalQuestions: qaPairs.reduce((sum, pair) => sum + pair.questions.length, 0),
  totalAnswers: qaPairs.length,
  qaPairs: qaPairs
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('✅ Generated Swanson Q&A pairs');
console.log(`📊 ${output.totalQuestions} questions mapped to ${output.totalAnswers} answers`);
console.log(`📁 Output: ${outputPath}`);
console.log(`📦 Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
