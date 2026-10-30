import type { Metadata } from "next";
import { MemoryStudio } from "@/components/studio/MemoryStudio";

export const metadata: Metadata = {
  title: "Create a keepsake",
  description: "Share your memories of someone you love and turn them into a letter, story or remembrance card.",
};

export default function CreatePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16">
      <div className="mb-12 max-w-3xl">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Light a lantern</p>
        <h1 className="font-display text-4xl leading-tight text-balance text-ivory sm:text-5xl">
          Tell us about someone you love.
        </h1>
        <p className="mt-4 font-serif text-lg leading-relaxed text-mist">
          Write the way you&apos;d tell a friend — fragments are fine. The more specific you are,
          the more the keepsake will sound like them, and only what you share will be used.
        </p>
      </div>
      <MemoryStudio />
    </div>
  );
}
