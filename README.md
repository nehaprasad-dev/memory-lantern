# 🕯️ Memory Lantern

> *Tell it about someone you love, and it writes you a letter, a short story, or a remembrance card you can keep.*

Memory Lantern is a small, free, open-source website. You type in the things you remember about a person - their name, who they were to you, the songs they loved, the food they made, the little things they always said - and it gently turns those memories into a piece of writing you can read, copy, and save.

The writing is done by an AI model called **GPT-OSS 20B**. It's an "open-weight" model, which just means it's free for anyone to download and use, and it isn't locked to a single company.

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue)](https://www.typescriptlang.org)
[![Model](https://img.shields.io/badge/AI-GPT--OSS%2020B-orange)](https://huggingface.co/openai/gpt-oss-20b)

---

## What's in this README

- [Why we built this](#why-we-built-this)
- [What it does](#what-it-does)
- [See it running (quick start)](#see-it-running-quick-start)
- [Settings you can change](#settings-you-can-change)
- [How it works under the hood](#how-it-works-under-the-hood)
- [Where the files live](#where-the-files-live)
- [About the AI model](#about-the-ai-model)
- [What we built it with](#what-we-built-it-with)
- [Putting it online](#putting-it-online)
- [Your privacy](#your-privacy)
- [How we keep the writing honest](#how-we-keep-the-writing-honest)
- [Helping out](#helping-out)
- [License](#license)

---

## Why we built this

We almost never forget the people we love. But we do lose the small things about them. The exact way they told a joke. The song that was always playing in their car. How they liked their tea. Those little details are what make a memory feel real — and most of the time, nobody ever writes them down.

Shaping those scattered memories into something whole is hard. Maybe you want a letter to read at a birthday, a story to share with the family, or a card for a memorial. It's even harder when you're grieving. And honestly, most AI writing tools make it worse — they paper over the gaps with empty phrases, make up things that never happened, or creepily offer to "talk as" the person who passed away.

Memory Lantern is built on three simple promises:

1. **Only your memories — nothing invented.** The AI can add warmth and feeling, but it's instructed never to make up facts, dates, quotes, or events you didn't give it.
2. **It writes as you, never as them.** Everything is written in *your* voice, about the person. It never pretends to be them, never writes fake "messages from" someone who died, and never suggests they're speaking from beyond.
3. **Nothing is saved.** There are no accounts and no database. What you write stays in your browser and is gone the moment you close the tab.

---

## What it does

- **A welcoming home page** that explains what the app is for and exactly what happens to your words.
- **A simple three-step form** where you share:
  - Their name and who they were to you
  - Whether they're still with you, have passed away, or you'd rather not say (this gently guides the tone — and makes sure the AI never *assumes* someone has died)
  - Your memories, important moments, their favourite things, and anything else you'd like to add
  - Which kind of keepsake you want: a **letter**, a **short story**, or a **remembrance card**
  - The feeling you want: tender, celebratory, reflective, or hopeful
- **Real writing from a real AI model** — not pre-written templates or fake examples.
- **A beautiful reading view** that styles each format differently — a flowing letter, a story with a decorated first letter, or a framed card.
- **Try again** to get a fresh version from the same memories, plus **Copy** and **Download** buttons.
- **Thoughtful touches:** a calm loading screen you can cancel, clear messages when something's missing, and errors written in plain English instead of computer-speak.
- **A warm, candlelit design** in charcoal, ivory, and gold — and it works just as nicely on a phone as on a laptop.

---

## See it running (quick start)

**You'll need:** [Node.js](https://nodejs.org) version 20.9 or newer, and a free [Groq](https://console.groq.com) account. No credit card is needed.

### Step 1 — Get your free AI key

Groq is the service that runs the AI model for you. Sign in at [console.groq.com](https://console.groq.com), open [API Keys](https://console.groq.com/keys), and click **Create API Key**. Copy the key it gives you — it starts with `gsk_`. You only see it once, so keep it somewhere safe.

> Groq's free tier is enough to use Memory Lantern. It has limits: at the time of writing, about 8,000 tokens and 30 requests a minute for this model (roughly 2–3 keepsakes a minute) and 1,000 requests a day. If you hit a limit, the app asks you to wait a minute and try again. You can check your current limits at [console.groq.com/settings/limits](https://console.groq.com/settings/limits).

### Step 2 — Download the project

```bash
git clone https://github.com/your-username/memory-lantern.git
cd memory-lantern
npm install
```

(`npm install` downloads everything the project needs. It can take a minute.)

### Step 3 — Add your key

```bash
cp .env.example .env.local
```

Open the new `.env.local` file in any text editor and paste in your key:

```env
GROQ_API_KEY=gsk_your_key_here
```

### Step 4 — Start it up

```bash
npm run dev
```

Now open **http://localhost:3000** in your browser. That's it — you're running Memory Lantern.

When you're ready to run the finished, faster version:

```bash
npm run build
npm start
```

---

## Settings you can change

All of these go in your `.env.local` file. Only the first one is required.

| Setting | What it's for | Default |
|---|---|---|
| `GROQ_API_KEY` | **Required.** Your Groq key. It stays on the server and is never shown to visitors. | *(none)* |
| `GROQ_MODEL` | Which AI model to use. You can swap in a different open model here. | `openai/gpt-oss-20b` |
| `GROQ_BASE_URL` | Where to send requests. Change this if you're running the AI on your own computer. | `https://api.groq.com/openai/v1` |
| `GROQ_REASONING_EFFORT` | How hard the model "thinks" before answering: `low`, `medium`, `high`, or `none`. | `low` |
| `RATE_LIMIT_PER_MINUTE` | How many keepsakes one visitor can make per minute, to prevent overuse. | `8` |

---

## How it works under the hood

Here's the journey your words take, from the moment you press the button to the keepsake appearing on screen:

```
Your browser                    Memory Lantern's server               The AI model
────────────                    ──────────────────────               ────────────
You fill in the form  ───────▶  Checks everything is filled in
                                Makes sure nobody's overusing it
                                Writes careful instructions   ──────▶ Writes your keepsake
Your keepsake appears ◀───────  Tidies up the result          ◀────── Sends it back
```

Step by step:

1. **It checks your form.** Before anything is sent, the app makes sure the required fields are filled in and not too long. The same check runs again on the server, so nothing slips through.
2. **It protects the server.** It turns away requests that are too big or malformed, and limits how often one person can ask, so the service stays available for everyone.
3. **It writes careful instructions for the AI.** Your memories are clearly marked as *your words to write from* - not as commands — and the AI is given firm rules: stick to the facts you gave, match the format and tone, and never speak as the person.
4. **It asks the AI.** The request goes off to the model and waits up to 60 seconds for an answer.
5. **If something goes wrong,** it explains it in plain language — a bad key, the service being busy, a timeout — instead of showing a scary error. And it never writes your private memories into its logs.
6. **It tidies up the writing** and lays it out beautifully for the format you chose.

---

## Where the files live

If you're curious or want to make changes, here's a map of the project:

```
src/
├─ app/                          the pages people see
│  ├─ page.tsx                   the home page
│  ├─ create/page.tsx            the page where you write a keepsake
│  ├─ api/generate/route.ts      the behind-the-scenes code that talks to the AI
│  ├─ layout.tsx                 the shared frame (header, footer, fonts)
│  └─ globals.css                the colours and visual style
│
├─ components/                   reusable pieces of the interface
│  ├─ Lantern.tsx                the little animated lantern
│  ├─ SiteHeader.tsx             the top navigation bar
│  ├─ SiteFooter.tsx             the footer
│  ├─ PrivacyNotice.tsx          the "here's what happens to your words" note
│  └─ studio/                    everything on the writing page
│     ├─ MemoryStudio.tsx        ties the form and the result together
│     ├─ MemoryForm.tsx          the three-step form
│     ├─ Field.tsx               text boxes with character counters
│     ├─ FormatPicker.tsx        the letter / story / card chooser
│     ├─ ChoicePills.tsx         the tone and status buttons
│     ├─ KeepsakeReader.tsx      the copy / download / try-again buttons
│     ├─ KeepsakeView.tsx        displays the finished keepsake
│     └─ StatusPanels.tsx        the loading, empty, and error screens
│
├─ hooks/
│  └─ useKeepsake.ts             manages talking to the server
│
├─ lib/                          the logic and helpers
│  ├─ ai/
│  │  ├─ prompts.ts              the instructions we give the AI (the heart of the app)
│  │  ├─ groq.ts                 the code that actually calls the AI
│  │  └─ generate.ts             ties the prompt and the call together
│  ├─ validation.ts              the rules for checking the form
│  ├─ keepsake-text.ts           tidies and formats the AI's writing
│  ├─ formats.ts                 the list of formats, tones, and options
│  └─ rate-limit.ts              stops the service being overused
│
└─ types/
   └─ memory.ts                  shared definitions so the code stays consistent
```

---

## About the AI model

| | |
|---|---|
| **The model** | [GPT-OSS 20B](https://huggingface.co/openai/gpt-oss-20b) — a capable open model from OpenAI, free for anyone to use. |
| **Who runs it** | [Groq](https://console.groq.com/docs/model/openai/gpt-oss-20b), which runs the model on their servers so you don't have to. Its free tier is all you need. |
| **How we talk to it** | A simple, direct connection with no heavy extra software - all the code is in one short file, [`groq.ts`](src/lib/ai/groq.ts), so you can read exactly what's sent. |

**Why an open model and not something like ChatGPT or Claude?**
Because an open model belongs to everyone. Anyone can download it, see how it works, and run it themselves — on a cloud service today, or on their own computer tomorrow — without asking permission or being tied to one company. It's also small enough to run on a single good graphics card, or even a decent laptop.

**Want to use a different provider?**
Any service with an OpenAI-compatible API will work. Point `GROQ_BASE_URL` at it, set `GROQ_MODEL` to that service's name for the model, and put that service's key in `GROQ_API_KEY`.

**Want to run the AI entirely on your own computer?**
You can — nothing then ever leaves your machine. Tools like [vLLM](https://github.com/vllm-project/vllm) or [Ollama](https://ollama.com) will run the model locally:

```bash
# Using Ollama
ollama pull gpt-oss:20b

# then put these in your .env.local:
GROQ_BASE_URL=http://localhost:11434/v1
GROQ_MODEL=gpt-oss:20b
GROQ_API_KEY=ollama  # any word works here when running locally
```

> If your local setup complains about the "reasoning" setting, add `GROQ_REASONING_EFFORT=none`.

---

## What we built it with

| Tool | Why |
|---|---|
| **Next.js & React** | A modern framework that handles both the pages people see and the private server code in one project — so your AI key never reaches anyone's browser. |
| **TypeScript** | A safer flavour of JavaScript that catches mistakes early and keeps the whole project consistent. |
| **Tailwind CSS** | Lets us build the warm, candlelit look quickly, with all the colours defined in one place. |
| **Self-hosted fonts** | The elegant typefaces load from the app itself, so they're fast and don't phone home to anyone. |
| **No database, no logins, no payments** | A deliberate choice. Memories should be private and fleeting, not stored. |

---

## Putting it online

Memory Lantern can be hosted almost anywhere that runs modern web apps - Vercel, Netlify, Railway, your own server, and more.

```bash
npm run build
npm start
```

Just remember two things:

- Add your `GROQ_API_KEY` as a **secret** setting in your hosting dashboard. Never put it in a file you share publicly.
- The built-in overuse limit works per server. If you run several servers at once, you'll want a shared limit (many hosts offer this) instead.

---

## Your privacy

Memory Lantern deals with some of the most personal writing there is, so here's exactly what happens to your words — in plain terms.

**In your browser:** What you type stays in your browser tab until you press the button to write your keepsake. Nothing is saved to your device. Close or refresh the tab and it's all gone.

**On Memory Lantern's server:** Your words pass through just long enough to be turned into a keepsake. They aren't saved, written to disk, or kept in any logs. If an error happens, only the error itself is recorded — never your memories.

**At the AI service — and this is important:** Memory Lantern is *not* fully private or offline. To write your keepsake, your words are sent to Groq, the company that runs the model. Groq handles your text under its own privacy rules. If what you're writing is very sensitive, please read [Groq's privacy policy](https://groq.com/privacy-policy) first.

**If you want complete privacy:** run the AI model on your own computer (see [above](#about-the-ai-model)). Then your words never leave your own machine.

**No tracking:** There are no ads, no analytics, and no hidden trackers of any kind.

The app tells you all of this up front — right next to the button you press, and on the home page.

---

## How we keep the writing honest

Writing about someone you love carries real responsibility. Here's how the app tries to get it right:

- The AI is firmly instructed never to invent facts, dates, quotes, or events you didn't provide.
- It's told never to pretend to be the person, speak for them, or suggest any kind of contact after death.
- It never assumes someone has passed away unless you say so.
- Your memories are clearly marked as *material to write from*, not as instructions — which helps stop the AI being tricked or going off-script.
- The finished keepsake comes with a gentle reminder to read it over, because only you know what's truly right.

> One honest note: no set of instructions can *guarantee* how an AI will behave every single time. These safeguards make problems much less likely, but not impossible. Please always read a keepsake before you share or keep it.

---

## Helping out

Contributions are very welcome. A few friendly notes before you dive in:

- Run `npm run lint` before sharing changes, to keep the code tidy.
- The form rules in `src/lib/validation.ts` are used in two places at once — change a rule there and it applies everywhere.
- The instructions in `src/lib/ai/prompts.ts` are the ethical heart of this app. Please treat them with care: the rules about not inventing facts and not impersonating people are not up for negotiation.
- Memories are meant to be fleeting. Please don't add saving, tracking, or analytics without a very good reason and a clear, honest notice to the people using it.

---

## Quick command reference

```bash
npm run dev     # run it on your own computer while developing
npm run build   # prepare the finished, fast version
npm start       # run the finished version
npm run lint    # check the code for tidiness
```

---

## License

The app's code is free to use under the **MIT License** — see [LICENSE](./LICENSE).

The GPT-OSS AI model is released separately by OpenAI under the **Apache 2.0 License**.
