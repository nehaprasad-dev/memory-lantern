"use client";

import { useEffect, useState } from "react";
import type { GenerateFailure } from "@/types/memory";
import { Lantern } from "../Lantern";

const LOADING_LINES = [
  "Gathering your memories…",
  "Listening for the small details…",
  "Finding the right words…",
  "Setting it down gently…",
];

export function GeneratingPanel({ onCancel }: { onCancel: () => void }) {
  const [line, setLine] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLine((l) => (l + 1) % LOADING_LINES.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="flex min-h-[420px] flex-col items-center justify-center gap-6 rounded-2xl border border-line/70 bg-ash/40 px-6 py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <Lantern className="h-20 w-20" />
      <div>
        <p key={line} className="animate-rise font-display text-2xl text-ivory">
          {LOADING_LINES[line]}
        </p>
        <p className="mt-2 text-sm text-dusk">This usually takes 10–30 seconds.</p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-mist underline-offset-4 transition-colors hover:text-ivory hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}

export function EmptyPanel() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-line/80 px-6 py-16 text-center">
      <Lantern className="h-16 w-16 opacity-80" />
      <div className="max-w-sm">
        <p className="font-display text-2xl text-ivory">Your keepsake will appear here</p>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          Share a few memories, choose a format, and Memory Lantern will write something you can
          read, copy and keep.
        </p>
      </div>
    </div>
  );
}

export function ErrorPanel({
  error,
  onRetry,
}: {
  error: GenerateFailure["error"];
  onRetry?: () => void;
}) {
  // Retrying can't fix bad input, a missing token, or an account problem.
  const retryable = !["validation_failed", "not_configured", "provider_auth"].includes(error.code);
  return (
    <div role="alert" className="rounded-2xl border border-rose/40 bg-rose/[0.06] p-5">
      <p className="font-display text-xl text-ivory">The lantern flickered</p>
      <p className="mt-1.5 text-sm leading-relaxed text-parchment">{error.message}</p>
      {retryable && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full border border-rose/50 px-4 py-1.5 text-sm text-parchment transition-colors hover:bg-rose/10"
        >
          Try again
        </button>
      )}
    </div>
  );
}
