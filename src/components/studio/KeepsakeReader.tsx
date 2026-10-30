"use client";

import { useEffect, useState } from "react";
import { formatLabel } from "@/lib/formats";
import { keepsakeFilename, toPlainText } from "@/lib/keepsake-text";
import type { Keepsake } from "@/types/memory";
import { KeepsakeView } from "./KeepsakeView";

interface KeepsakeReaderProps {
  keepsake: Keepsake;
  personName: string;
  regenerating: boolean;
  onRegenerate: () => void;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers or contexts without the async clipboard API.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function KeepsakeReader({ keepsake, personName, regenerating, onRegenerate }: KeepsakeReaderProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (copyState === "idle") return;
    const t = setTimeout(() => setCopyState("idle"), 2200);
    return () => clearTimeout(t);
  }, [copyState]);

  const plain = toPlainText(keepsake.content);

  return (
    <article className="animate-rise" aria-labelledby="keepsake-heading">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">{formatLabel(keepsake.format)}</p>
          <h2 id="keepsake-heading" className="font-display text-2xl text-ivory">
            For {personName}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton
            onClick={async () => setCopyState((await copyText(plain)) ? "copied" : "failed")}
            label={copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"}
            icon={<path d="M8 8h11v11H8zM5 16V5h11" strokeLinejoin="round" />}
          />
          <ActionButton
            onClick={() => downloadText(plain, keepsakeFilename(personName, keepsake.format))}
            label="Download .txt"
            icon={<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />}
          />
          <ActionButton
            onClick={onRegenerate}
            disabled={regenerating}
            label={regenerating ? "Rewriting…" : "Regenerate"}
            icon={
              <path
                d="M19 12a7 7 0 1 1-2.05-4.95M19 5v4h-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            }
          />
        </div>
      </header>
      <span className="sr-only" aria-live="polite">
        {copyState === "copied" ? "Keepsake copied to clipboard" : ""}
      </span>

      <div
        className={`grain rounded-2xl border border-line/80 bg-ash/80 px-6 py-10 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)] transition-opacity sm:px-12 sm:py-14 ${
          regenerating ? "opacity-50" : ""
        }`}
      >
        <KeepsakeView content={keepsake.content} format={keepsake.format} />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-dusk">
        Written by <span className="text-mist">{keepsake.model}</span> from the memories you
        shared. Please read it through — only you know what&apos;s true, so edit anything that
        doesn&apos;t sound like them before you keep it.
      </p>
    </article>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm text-parchment transition-colors hover:border-gold/60 hover:text-gold-soft disabled:cursor-wait disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        {icon}
      </svg>
      {label}
    </button>
  );
}
