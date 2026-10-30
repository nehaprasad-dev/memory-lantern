# Memory Lantern

**Turn the small details you remember about someone you love into a letter, a short story or a remembrance card, written by an open-weight AI model.**

Memory Lantern is a small, open-source web app. You write down what you remember about a person: their name, what they mean to you, the moments you shared, the songs, food and habits you connect with them. It shapes those memories into a keepsake you can read, copy and download. The writing comes from **OpenAI's GPT-OSS 20B**, an open-weight model, served through **Hugging Face Inference Providers**.

---

## The problem

We rarely forget the people we love, but we do lose the small details: the exact words of a joke, the song that was always playing in the car, how they took their tea. Those details are what make a memory feel like *them*. Most of the time they never get written down.

Turning fragments into something whole, like a letter for a birthday, a story for the family or a card for a memorial, is hard to do, especially when you are grieving. General-purpose AI writing tools tend to make it worse. They fill the gaps with generic sentiment, make up anecdotes, or offer to "speak as" the person who died.

## The product

Memory Lantern is built around three ideas:

1. **Your memories, not invented ones.** The model may add feeling and reflection. It must not add facts, events, dates, quotes or people that you didn't provide.
2. **Never their voice.** Keepsakes are written as *you*, about them. The app never impersonates anyone, never writes "messages from" the deceased and never suggests contact from beyond death.
3. **Nothing kept.** There are no accounts and no database. Memories live in your browser tab and in the single request that writes your keepsake.

### Features

- A landing page that explains what the app does, how it works and how your data is handled.
- A guided, three-step memory form with these fields:
  - **Name** and **relationship** (required)
  - **Are they still with you?** (living / passed / rather not say). This sets the tone, and stops the model from assuming someone has died.
  - **Memories** (required), **important moments**, **favourite things** and **additional context**
  - **Format**: personal letter, short story or remembrance card
  - **Tone**: tender, celebratory, reflective or hopeful
- Real AI generation through a server-side API route.
- A reading view with typography for each format: a letter, a story with a drop cap, or a framed card.
- **Regenerate** (asks for a different angle from the same memories), **Copy** and **Download .txt**.
- A loading state with a cancel option, inline validation, and error messages written for people rather than for developers.
- A responsive dark design built around candlelight: charcoal, ivory and gold, with Cormorant Garamond, Newsreader and Inter.
- `prefers-reduced-motion` support, labelled form controls, visible focus states and live regions.

---

## Architecture

```
Browser (React client)                       Next.js server                         Inference
──────────────────────                       ──────────────                         ─────────
MemoryStudio                                 POST /api/generate                     Hugging Face router
 ├─ MemoryForm  ──validate (shared)──┐        ├─ content-type + size checks          router.huggingface.co/v1
 ├─ useKeepsake ─── fetch JSON ──────┼──────▶ ├─ in-memory rate limit (per IP)        │
 └─ KeepsakeReader ◀── keepsake ─────┘        ├─ parseInput + validateInput           ▼
     copy / download / regenerate             ├─ buildMessages (prompts.ts)  ───────▶ provider running
                                              ├─ createChatCompletion (huggingface.ts)  openai/gpt-oss-20b
                                              └─ cleanModelOutput ◀──────────────────── chat completion
```

### Project layout

```
src/
├─ app/
│  ├─ layout.tsx               fonts, header/footer, metadata
│  ├─ page.tsx                 landing page
│  ├─ create/page.tsx          memory creation page
│  ├─ api/generate/route.ts    POST endpoint: validate → prompt → model → response
│  └─ globals.css              Tailwind v4 theme tokens, candlelight + grain effects
├─ components/
│  ├─ Lantern.tsx              animated SVG lantern mark
│  ├─ SiteHeader.tsx, SiteFooter.tsx, PrivacyNotice.tsx
│  └─ studio/
│     ├─ MemoryStudio.tsx      orchestrates form, states and reader
│     ├─ MemoryForm.tsx        the three-step form
│     ├─ Field.tsx             accessible text input / textarea with counters
│     ├─ FormatPicker.tsx, ChoicePills.tsx
│     ├─ KeepsakeReader.tsx    copy / download / regenerate actions
│     ├─ KeepsakeView.tsx      format-specific typography
│     └─ StatusPanels.tsx      empty, loading and error panels
├─ hooks/useKeepsake.ts        request lifecycle, cancellation, in-memory result
├─ lib/
│  ├─ ai/
│  │  ├─ prompts.ts            system prompt, format/tone/status instructions
│  │  ├─ huggingface.ts        OpenAI-compatible client + provider error mapping
│  │  └─ generate.ts           builds prompt, calls model, cleans output
│  ├─ validation.ts            limits + validation shared by client and server
│  ├─ keepsake-text.ts         output cleanup, parsing, plain-text export, filenames
│  ├─ formats.ts               format/tone/status metadata
│  └─ rate-limit.ts            fixed-window per-IP limiter
└─ types/memory.ts             shared TypeScript types
```

### Request lifecycle

1. **Client validation.** `validateInput` in `lib/validation.ts` checks required fields, minimum and maximum lengths and allowed enum values. The server runs the same code, so the rules can't drift apart.
2. **Server hardening.** The route rejects non-JSON requests (415) and bodies over 16 KB (413), rate-limits each IP (429 with `Retry-After`), and returns structured `fieldErrors` with a 422 when validation fails.
3. **Prompt construction.** `buildMessages` produces a fixed system prompt that carries the rules, plus a user message containing:
   - the memories inside `<memory_material>` tags, labelled as material and not instructions, which reduces prompt injection
   - instructions for the chosen format, with a word count and structure
   - tone guidance
   - status guidance, which controls whether loss may be mentioned
   - when regenerating, an instruction to take a different angle
4. **Inference.** `createChatCompletion` POSTs to `${HF_BASE_URL}/chat/completions` with a bearer token, a token budget for the format, `temperature` (0.8, or 0.95 when regenerating), `top_p` and `reasoning_effort`. The request times out after 60 seconds.
5. **Error mapping.** Provider responses are mapped to user-facing codes:
   - 401/403/402 → `provider_auth`
   - 429 → `rate_limited`
   - 400/404 → `provider_error`
   - 5xx or network failure → `provider_unavailable`
   - abort → `timeout`
   - empty or truncated output → `empty_response`

   Server logs include only the HTTP status and the provider's error message, never the user's memories.
6. **Output cleanup.** `cleanModelOutput` strips stray markdown emphasis, bullets, code fences and `<think>` tags. It keeps the `# ` title and `## ` heading markers, which `KeepsakeView` uses to lay out each format.

---

## Open-weight AI integration

| | |
|---|---|
| **Model** | [`openai/gpt-oss-20b`](https://huggingface.co/openai/gpt-oss-20b): 21B-parameter mixture-of-experts (about 3.6B active), Apache 2.0 licence |
| **Access** | [Hugging Face Inference Providers](https://huggingface.co/docs/inference-providers), using the OpenAI-compatible router at `https://router.huggingface.co/v1` |
| **Transport** | Plain `fetch`, with no SDK dependency, so the whole integration is visible in `src/lib/ai/huggingface.ts` |
| **Reasoning** | GPT-OSS reasons before it answers. `reasoning_effort` defaults to `low` for speed, and the token budgets leave room for the reasoning tokens. |

**Why an open-weight model?** Anyone can download, inspect and run GPT-OSS. It is not tied to one vendor. The same app can run on a hosted provider today and on your own hardware tomorrow, and the licence permits both commercial and personal use. It is also small enough that a single GPU, or a well-equipped laptop, can run it.

**Choosing a provider.** By default, Hugging Face routes the request to an available provider. To pin a specific one, add a suffix to `HF_MODEL`:

```bash
HF_MODEL=openai/gpt-oss-20b:groq
HF_MODEL=openai/gpt-oss-20b:cerebras
HF_MODEL=openai/gpt-oss-20b:fireworks-ai
```

**Self-hosting.** Any server that speaks the OpenAI chat-completions protocol will work. For example:

```bash
# vLLM
vllm serve openai/gpt-oss-20b
HF_BASE_URL=http://localhost:8000/v1  HF_MODEL=openai/gpt-oss-20b  HF_TOKEN=local

# Ollama
ollama pull gpt-oss:20b
HF_BASE_URL=http://localhost:11434/v1  HF_MODEL=gpt-oss:20b  HF_TOKEN=ollama
```

If your server rejects the `reasoning_effort` parameter, set `HF_REASONING_EFFORT=none`.

---

## Technology choices

- **Next.js 16 (App Router) + React 19.** One codebase serves the static pages and the server-side API route. The landing and create pages are prerendered, and `/api/generate` runs on demand. The token stays on the server and never reaches the browser.
- **TypeScript.** The request and response are typed as a discriminated union (`GenerateResponse`) shared by the client and the server.
- **Tailwind CSS v4.** Design tokens such as `charcoal`, `ivory`, `gold` and `ember` are defined once in `@theme` in `globals.css`.
- **`next/font`.** Self-hosts Cormorant Garamond for display type, Newsreader for reading text and Inter for the interface, with no layout shift.
- **No database, auth or payment provider.** That was a deliberate scope decision for this first version.

---

## Setup

**Requirements:** Node.js 20.9 or later, and a Hugging Face account.

1. **Create a token.** Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) and create a *fine-grained* token with **"Make calls to Inference Providers"** enabled. Inference Providers bill against your Hugging Face account; free accounts get a small monthly credit.

2. **Install and configure:**

   ```bash
   git clone <your-fork-url> memory-lantern
   cd memory-lantern
   npm install
   cp .env.example .env.local
   # edit .env.local and set HF_TOKEN=hf_...
   ```

3. **Run:**

   ```bash
   npm run dev          # http://localhost:3000
   # or
   npm run build && npm start
   ```

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `HF_TOKEN` | *(required)* | Hugging Face access token. Server-side only. |
| `HF_MODEL` | `openai/gpt-oss-20b` | Model ID. An optional `:provider` suffix pins the provider. |
| `HF_BASE_URL` | `https://router.huggingface.co/v1` | Any OpenAI-compatible endpoint. |
| `HF_REASONING_EFFORT` | `low` | `low`, `medium`, `high`, or `none` to omit the parameter. |
| `RATE_LIMIT_PER_MINUTE` | `8` | Requests per minute per IP to `/api/generate`. |

### Deploying

The app deploys anywhere Next.js runs, including Vercel, Netlify, a Node server or a container. Set `HF_TOKEN` as a secret environment variable. The built-in rate limiter keeps its counts in memory for each process. On serverless platforms or across several instances, add a shared limiter (for example Redis) or rate limiting at the platform level.

---

## Privacy considerations

Memory Lantern handles some of the most personal writing people do. This is exactly what happens to that writing:

- **In your browser.** Form input and generated keepsakes are held in React state only. Nothing is written to `localStorage`, cookies or IndexedDB. Closing or refreshing the tab clears everything.
- **On the Memory Lantern server.** The API route receives your memories, builds a prompt, forwards it and returns the result. It does not store request bodies, write them to disk or log them. Error logs record only the HTTP status and the provider's error message.
- **At the inference provider. This is not local or offline processing.** To generate a keepsake, the server sends your memories, inside the prompt, to Hugging Face's router. The router forwards them to the third-party provider serving the model, such as Groq, Cerebras, Fireworks or Together. Those companies process the text under their own privacy policies and data-retention terms. Review [Hugging Face's Inference Providers documentation](https://huggingface.co/docs/inference-providers) and the policy of the provider you pin before using the app with sensitive material.
- **For full privacy,** self-host the model (see [Self-hosting](#open-weight-ai-integration)) and point `HF_BASE_URL` at your own server. Your memories then never leave infrastructure you control.
- **Analytics.** There are none. The app includes no analytics, tracking pixels or third-party scripts. Fonts are self-hosted by `next/font` at build time.

The interface states this before anything is sent: the form shows a notice before the generate button, and the landing page has a dedicated privacy section.

## Responsible-use safeguards

- The system prompt forbids inventing facts, impersonating the person, speaking for them, or implying contact from beyond death.
- The model doesn't assume someone has died unless the user says so.
- User text is wrapped in `<memory_material>` tags and labelled as material, not instructions.
- The reading view reminds people to check the keepsake, because only they know what's true.

No prompt guarantees model behaviour. These measures make problems much less likely, but they cannot rule them out. Please read every keepsake before you share it.

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm start       # serve the production build
npm run lint    # ESLint
```

## License

The application code is MIT-licensed. GPT-OSS model weights are released by OpenAI under the Apache 2.0 licence.
