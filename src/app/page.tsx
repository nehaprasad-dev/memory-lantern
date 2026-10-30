import Link from "next/link";
import { Lantern } from "@/components/Lantern";
import { FORMATS } from "@/lib/formats";

const STEPS = [
  {
    title: "Share the little things",
    body: "Their name, who they are to you, and what you remember — a laugh, a phrase, a song, a recipe, a Sunday ritual.",
  },
  {
    title: "Choose a keepsake",
    body: "A personal letter, a short story or a remembrance card, in the tone that feels right.",
  },
  {
    title: "Read, refine, keep",
    body: "An open-weight model writes from your details only. Regenerate until it feels true, then copy or download it.",
  },
];

const PROMISES = [
  {
    title: "Your memories, not invented ones",
    body: "The model is instructed to use only what you share — no made-up events, dates, quotes or facts.",
  },
  {
    title: "Never their voice",
    body: "Memory Lantern writes as you, about them. It never speaks for someone you've lost or claims to hear from them.",
  },
  {
    title: "Nothing kept",
    body: "No accounts and no database. Your words exist only in your browser tab and the single request that writes your keepsake.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pt-20 pb-24 text-center sm:px-6 sm:pt-28 sm:pb-32">
          <Lantern className="mb-10 h-24 w-24 sm:h-28 sm:w-28" />
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-gold">A place for remembering</p>
          <h1 className="font-display text-5xl leading-[1.05] text-ivory sm:text-7xl">
            Keep the light of
            <br />
            <span className="text-gold-soft">the ones you love.</span>
          </h1>
          <p className="mt-7 max-w-2xl font-serif text-lg leading-relaxed text-mist sm:text-xl">
            Memory Lantern turns the small details you carry — their favourite song, the food
            they made, the thing they always said — into a letter, a story or a remembrance card
            you can keep.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/create"
              className="rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-night shadow-[0_10px_30px_-12px_rgb(165_112_31/0.6)] transition-all hover:-translate-y-0.5 hover:bg-gold-soft"
            >
              Begin a keepsake
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-full px-6 py-3.5 text-sm text-parchment transition-colors hover:text-ivory"
            >
              How it works →
            </Link>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-y border-line/60 bg-charcoal/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <h2 className="font-display text-3xl leading-tight text-ivory sm:text-4xl">
            The details fade first.
          </h2>
          <div className="space-y-5 font-serif text-lg leading-relaxed text-parchment">
            <p>
              We rarely forget the people we love — but we lose the texture of them. The exact
              words of a joke. Which song was always playing in the car. How they took their tea.
            </p>
            <p className="text-mist">
              Memory Lantern gives those details somewhere to go. You write them down as they come
              to you, and it helps shape them into something whole — written with care, faithful to
              what you remember, and yours to keep.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionTitle eyebrow="How it works" title="Three quiet steps" />
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-line/70 bg-ash/50 p-7">
                <span className="font-display text-4xl text-gold/80">{["I", "II", "III"][i]}</span>
                <h3 className="mt-4 font-display text-2xl text-ivory">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-mist">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Formats */}
      <section className="border-t border-line/60">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionTitle eyebrow="Keepsakes" title="Three ways to hold a memory" />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {FORMATS.map((format) => (
              <div
                key={format.id}
                className="grain group flex flex-col rounded-2xl border border-line/70 bg-gradient-to-b from-ash to-charcoal p-8 transition-colors hover:border-gold/40"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-gold">{format.tagline}</p>
                <h3 className="mt-3 font-display text-3xl text-ivory">{format.label}</h3>
                <p className="mt-4 flex-1 font-serif leading-relaxed text-mist">{format.description}</p>
              </div>
            ))}
          </div>
          <figure className="mx-auto mt-16 max-w-2xl text-center">
            <blockquote className="font-display text-2xl leading-snug text-parchment sm:text-3xl">
              &ldquo;You hummed while you cooked, always a little off-key, and pretended not to see
              me stealing a taste of the dal.&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm text-dusk">
              An illustrative line. Every keepsake is written from your own memories.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-line/60 bg-charcoal/50">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionTitle eyebrow="Our promises" title="Written with care" />
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {PROMISES.map((p) => (
              <div key={p.title} className="border-l border-gold/40 pl-6">
                <h3 className="font-display text-2xl text-ivory">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-mist">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & model */}
      <section id="privacy" className="scroll-mt-20 border-t border-line/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 md:grid-cols-2">
          <div>
            <SectionTitle eyebrow="Privacy" title="What happens to your words" align="left" />
            <div className="mt-8 space-y-4 leading-relaxed text-mist">
              <p>
                Memory Lantern has no accounts, no database and no analytics. Your memories stay
                in your browser tab and disappear when you close it.
              </p>
              <p>
                <strong className="font-medium text-parchment">
                  It isn&apos;t offline or on-device.
                </strong>{" "}
                To write your keepsake, the server sends your text to Groq, a hosted inference
                provider, which runs the model and returns the writing. Groq processes your text
                under its own terms and privacy policy. If
                you need full privacy, you can run the same open-weight model yourself and point
                Memory Lantern at it.
              </p>
            </div>
          </div>
          <div>
            <SectionTitle eyebrow="Open-weight AI" title="Built on GPT-OSS 20B" align="left" />
            <div className="mt-8 space-y-4 leading-relaxed text-mist">
              <p>
                Keepsakes are written by <span className="text-parchment">gpt-oss-20b</span>,
                OpenAI&apos;s open-weight model released under the Apache 2.0 licence. Anyone can
                download, inspect and run its weights.
              </p>
              <p>
                Memory Lantern reaches it through Groq&apos;s OpenAI-compatible API, so you
                can swap in another open model — or your own server — with a single
                environment variable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line/60">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
          <Lantern className="mb-8 h-16 w-16" />
          <h2 className="font-display text-4xl leading-tight text-balance text-ivory sm:text-5xl">
            Who would you like to remember?
          </h2>
          <Link
            href="/create"
            className="mt-10 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-night shadow-[0_10px_30px_-12px_rgb(165_112_31/0.6)] transition-all hover:-translate-y-0.5 hover:bg-gold-soft"
          >
            Light a lantern
          </Link>
        </div>
      </section>
    </>
  );
}

function SectionTitle({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-tight text-balance text-ivory sm:text-5xl">{title}</h2>
    </div>
  );
}
