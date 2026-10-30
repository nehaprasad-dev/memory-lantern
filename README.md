# 🕯️ Memory Lantern

> *Turn the small details you remember about someone you love into a letter, a short story or a remembrance card — written by an open-weight AI model.*

Memory Lantern is an open-source web application that helps people preserve meaningful memories and transform them into beautifully written keepsakes. You share the details: their name, who they are to you, the moments you shared, the songs, food and habits you connect with them. The app shapes those memories into something you can read, copy and keep — powered by **OpenAI's GPT-OSS 20B**, an open-weight model served through **Hugging Face Inference Providers**.

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Model](https://img.shields.io/badge/Model-GPT--OSS%2020B-orange)](https://huggingface.co/openai/gpt-oss-20b)

---

## Table of contents

- [Why Memory Lantern](#why-memory-lantern)
- [Features](#features)
- [Screenshots](#screenshots)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Open-weight AI integration](#open-weight-ai-integration)
- [Technology choices](#technology-choices)
- [Deploying](#deploying)
- [Privacy](#privacy)
- [Responsible-use safeguards](#responsible-use-safeguards)
- [Contributing](#contributing)
- [License](#license)

---

## Why Memory Lantern

We rarely forget the people we love — but we lose the texture of them. The exact words of a joke. Which song was always playing in the car. How they took their tea. Those details are what make a memory feel like *them*, and most of the time they never get written down.

Turning fragments into something whole — a letter for a birthday, a story for the family, a card for a memorial — is hard, especially when you are grieving. General-purpose AI tools tend to make it worse: they fill gaps with generic sentiment, invent anecdotes, or offer to "speak as" the person who died.

Memory Lantern is built around three commitments:

1. **Your memories, not invented ones.** The model may add feeling and reflection. It must not add facts, events, dates, quotes or people you didn't provide.
2. **Never their voice.** Keepsakes are written as *you*, about them. The app never impersonates anyone, never writes "messages from" the deceased and never implies contact from beyond death.
3. **Nothing kept.** No accounts. No database. Your memories live only in your browser tab and in the single request that writes your keepsake.

---

## Features

- **Welcoming landing page** explaining the purpose, the three formats, the app's promises and exactly how your data is handled
- **Three-step memory form:**
  - Name and relationship (required)
  - Whether the person is living, has passed, or you'd rather not say — prevents the model from assuming someone has died
  - Memories (required), important moments, favourite things and additional context
  - Format: personal letter, short story or remembrance card
  - Tone: tender, celebratory, reflective or hopeful
- **Genuine AI generation** via a secure server-side route — the token never touches the browser
- **Format-specific reading view:** letters in prose, stories with drop caps, remembrance cards in a framed layout with ornamental dividers
- **Regenerate** — asks for a different angle from the same memories
- **Copy** and **Download .txt** — with a sensible filename
- Loading state with a cancel option, inline field validation, and error messages written for people rather than developers
- Responsive dark design: charcoal, ivory and gold with Cormorant Garamond, Newsreader and Inter
- `prefers-reduced-motion` support, labelled form controls, visible focus states and ARIA live regions

---

## Screenshots

| Landing page | Create — with result |
|:---:|:---:|
| *Deep charcoal hero with animated lantern* | *Two-column studio — form left, keepsake right* |

> Screenshots shown above are taken against a live mock provider. Run the app with a real `HF_TOKEN` to see actual GPT-OSS 20B output.

---

## Quick start

**Requirements:** Node.js 20.9 or later, and a Hugging Face account.

### 1 — Get a Hugging Face token

Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) and create a **fine-grained** token with **"Make calls to Inference Providers"** enabled.

> Free accounts include a small monthly inference credit. Usage is billed per token against your Hugging Face account.

### 2 — Clone and install

```bash
git clone https://github.com/your-username/memory-lantern.git
cd memory-lantern
npm install
```

### 3 — Configure

```bash
cp .env.example .env.local
```

Open `.env.local` and set your token:

```env
HF_TOKEN=hf_your_token_here
```

### 4 — Run

```bash
npm run dev       # development server at http://localhost:3000
```

For a production build:

```bash
npm run build
npm start
```

---

## Environment variables

| Variable | Default | Required | Purpose |
|---|---|---|---|
| `HF_TOKEN` | — | ✅ Yes | Hugging Face access token. Server-side only — never sent to the browser. |
| `HF_MODEL` | `openai/gpt-oss-20b` | No | Model ID. Append `:provider` to pin a provider (e.g. `openai/gpt-oss-20b:groq`). |
| `HF_BASE_URL` | `https://router.huggingface.co/v1` | No | Any OpenAI-compatible chat-completions endpoint. |
| `HF_REASONING_EFFORT` | `low` | No | `low`, `medium`, `high`, or `none` to omit the parameter entirely. |
| `RATE_LIMIT_PER_MINUTE` | `8` | No | Max requests per minute per IP to `/api/generate`. |

---

## Architecture

```
Browser (React client)                      Next.js server                            Inference
──────────────────────                      ──────────────                            ─────────
MemoryStudio                                POST /api/generate                        Hugging Face router
 ├─ MemoryForm  ──validate (shared)──┐       ├─ content-type + size checks            router.huggingface.co/v1
 ├─ useKeepsake ─── fetch JSON ──────┼─────▶ ├─ in-memory rate limit (per IP)              │
 └─ KeepsakeReader ◀── keepsake ─────┘       ├─ parseInput + validateInput                 ▼
     copy / download / regenerate            ├─ buildMessages (prompts.ts)  ──────▶ provider running
                                             ├─ createChatCompletion                  openai/gpt-oss-20b
                                             └─ cleanModelOutput ◀───────────────── chat completion
```

### Request lifecycle

| Step | What happens |
|---|---|
| **1. Client validation** | `validateInput` checks required fields, length limits and allowed enum values. The server runs the same function — rules can't drift. |
| **2. Server hardening** | Rejects non-JSON (415) and bodies over 16 KB (413). Rate-limits per IP with a `Retry-After` header on 429. Returns structured `fieldErrors` on 422. |
| **3. Prompt construction** | `buildMessages` wraps user text in `<memory_material>` tags, then attaches format instructions (with word count and structure), tone guidance and status guidance. A `regenerate` flag asks for a different angle. |
| **4. Inference** | POSTs to `${HF_BASE_URL}/chat/completions` with a per-format token budget, `temperature` (0.8 or 0.95 on regenerate), `top_p` and `reasoning_effort`. Times out after 60 s. |
| **5. Error mapping** | 401/402/403 → `provider_auth`, 429 → `rate_limited`, 400/404 → `provider_error`, network failure → `provider_unavailable`, abort → `timeout`, empty output → `empty_response`. Logs record status and provider message only — never the user's memories. |
| **6. Output cleanup** | Strips `<think>` tags, markdown emphasis, bullet characters and code fences. Keeps `# ` and `## ` markers for `KeepsakeView` to render with format-specific typography. |

---

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx                  fonts, header/footer, global metadata
│  ├─ page.tsx                    landing page
│  ├─ create/
│  │  └─ page.tsx                 /create — heading + MemoryStudio
│  ├─ api/
│  │  └─ generate/
│  │     └─ route.ts              POST /api/generate
│  └─ globals.css                 Tailwind v4 @theme tokens, candlelight radial, grain texture
│
├─ components/
│  ├─ Lantern.tsx                 animated SVG lantern with flickering flame
│  ├─ SiteHeader.tsx              sticky nav with CTA
│  ├─ SiteFooter.tsx              tagline + model credit
│  ├─ PrivacyNotice.tsx           pre-generation disclosure (text leaves the device)
│  └─ studio/
│     ├─ MemoryStudio.tsx         orchestrates form ↔ loading ↔ error ↔ reader
│     ├─ MemoryForm.tsx           three-step input form
│     ├─ Field.tsx                TextField + TextAreaField with character counters
│     ├─ FormatPicker.tsx         card-style radio buttons for letter / story / card
│     ├─ ChoicePills.tsx          pill-style radio buttons for tone and status
│     ├─ KeepsakeReader.tsx       copy / download / regenerate action bar
│     ├─ KeepsakeView.tsx         format-specific typography renderer
│     └─ StatusPanels.tsx         empty, generating and error panels
│
├─ hooks/
│  └─ useKeepsake.ts              fetch lifecycle — loading, cancel, result, source tracking
│
├─ lib/
│  ├─ ai/
│  │  ├─ prompts.ts               system prompt + format/tone/status instructions
│  │  ├─ huggingface.ts           OpenAI-compatible fetch client + error mapping
│  │  └─ generate.ts              calls model, validates output length, returns Keepsake
│  ├─ validation.ts               field limits + validateInput / parseInput (shared)
│  ├─ keepsake-text.ts            cleanModelOutput, parseKeepsake, toPlainText, filename
│  ├─ formats.ts                  format, tone and status option lists
│  └─ rate-limit.ts               fixed-window per-IP rate limiter
│
└─ types/
   └─ memory.ts                   MemoryInput, Keepsake, GenerateResponse, KeepsakeBlock…
```

---

## Open-weight AI integration

| | |
|---|---|
| **Model** | [`openai/gpt-oss-20b`](https://huggingface.co/openai/gpt-oss-20b) — 21B-parameter mixture-of-experts (~3.6B active), Apache 2.0 licence |
| **Access** | [Hugging Face Inference Providers](https://huggingface.co/docs/inference-providers) via the OpenAI-compatible router at `https://router.huggingface.co/v1` |
| **Transport** | Plain `fetch` with no SDK — the full integration lives in [`src/lib/ai/huggingface.ts`](src/lib/ai/huggingface.ts) |
| **Reasoning** | GPT-OSS reasons before it answers. `reasoning_effort` defaults to `low` for speed; token budgets leave headroom for reasoning tokens. |

### Why an open-weight model?

Anyone can download, inspect and run GPT-OSS. It's not tied to one vendor. The same app can run on a hosted provider today and on your own hardware tomorrow, with no licence change needed. It's also compact enough for a single GPU — or a well-equipped laptop — to serve.

### Pinning a provider

By default Hugging Face routes the request automatically. To pin one:

```bash
HF_MODEL=openai/gpt-oss-20b:groq
HF_MODEL=openai/gpt-oss-20b:cerebras
HF_MODEL=openai/gpt-oss-20b:fireworks-ai
```

### Self-hosting

Any server that speaks the OpenAI chat-completions protocol works:

```bash
# vLLM
vllm serve openai/gpt-oss-20b
HF_BASE_URL=http://localhost:8000/v1
HF_MODEL=openai/gpt-oss-20b
HF_TOKEN=local                      # any non-empty string

# Ollama
ollama pull gpt-oss:20b
HF_BASE_URL=http://localhost:11434/v1
HF_MODEL=gpt-oss:20b
HF_TOKEN=ollama
```

> If your server rejects `reasoning_effort`, set `HF_REASONING_EFFORT=none`.

---

## Technology choices

| | Reason |
|---|---|
| **Next.js 16 App Router** | One codebase for static pages and the server API route. `HF_TOKEN` stays server-side and never reaches the browser. |
| **React 19** | Server Components for the pages, a single Client Component tree for the studio. |
| **TypeScript 5** | `GenerateResponse` is a discriminated union shared by client and server — rules can't drift. |
| **Tailwind CSS v4** | Design tokens (`charcoal`, `ivory`, `gold`, `ember`) defined once in `@theme`; no config file. |
| **`next/font`** | Self-hosts Cormorant Garamond, Newsreader and Inter at build time — zero layout shift, no external requests. |
| **`server-only`** | Marks the AI and rate-limit modules so the build fails if they're accidentally imported in a Client Component. |
| **No DB / auth / payments** | Deliberate for v1. Memories should be ephemeral. |

---

## Deploying

The app deploys anywhere Next.js runs: Vercel, Netlify, Railway, a bare Node server or a container.

```bash
npm run build
npm start
```

Set `HF_TOKEN` as a **secret** environment variable — never commit it.

**Rate limiting note.** The built-in limiter is in-process. On serverless platforms or across multiple instances, add a shared limiter (e.g. Upstash Redis + `@upstash/ratelimit`) or rely on platform-level rate limiting instead.

---

## Privacy

Memory Lantern handles some of the most personal writing people do. Here is exactly what happens to that writing:

**In your browser**
Form input and generated keepsakes are held in React state only. Nothing is written to `localStorage`, cookies or IndexedDB. Closing or refreshing the tab clears everything.

**On the Memory Lantern server**
The API route receives your memories, builds a prompt, forwards it and returns the result. It does not store request bodies, write them to disk or log them. Error logs record only the HTTP status and the provider's error message — never your text.

**At the inference provider — this is not offline or on-device processing**
To generate a keepsake, the server sends your text (inside the prompt) to Hugging Face's router, which forwards it to a third-party provider such as Groq, Cerebras, Fireworks or Together. Those companies process the text under their own privacy policies and data-retention terms. Review [Hugging Face's Inference Providers documentation](https://huggingface.co/docs/inference-providers) and the policy of the provider you pin before using the app with sensitive material.

**For full privacy**, self-host the model (see [Self-hosting](#self-hosting)) and point `HF_BASE_URL` at your own server. Your memories then never leave infrastructure you control.

**Analytics:** none. No tracking pixels, no third-party scripts. Fonts are self-hosted.

The interface discloses this before anything is sent — in the privacy notice beside the generate button and on the landing page.

---

## Responsible-use safeguards

- The system prompt forbids inventing facts, dates, quotes, events or people the user didn't provide.
- It forbids impersonating the person, speaking for them, or implying any form of contact from beyond death.
- The model is told explicitly not to assume someone has died unless the user says so.
- User text is wrapped in `<memory_material>` tags, labelled as source material rather than instructions — this reduces prompt injection risk.
- The reading view reminds people to check the result, because only they know what's true.

> No prompt engineering guarantees model behaviour. These safeguards make problems much less likely, but not impossible. Please read every keepsake before you share it.

---

## Contributing

Contributions are welcome. A few things to know before opening a PR:

- Run `npm run lint` and `npx tsc --noEmit` before pushing.
- The validation rules in `src/lib/validation.ts` are shared by the client and the server — if you change a limit, it applies to both.
- The prompt in `src/lib/ai/prompts.ts` is the ethical core of the app. Changes there need care: the rules around not inventing facts and not impersonating people are non-negotiable.
- Memories are ephemeral by design. Please don't add storage, analytics or tracking without a very strong reason and clear user disclosure.

---

## Scripts

```bash
npm run dev     # start the development server (http://localhost:3000)
npm run build   # production build
npm start       # serve the production build
npm run lint    # run ESLint
```

---

## License

The application code is released under the **MIT License** — see [LICENSE](./LICENSE).

GPT-OSS model weights are released by OpenAI under the **Apache 2.0 License**.
