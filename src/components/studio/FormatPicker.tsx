"use client";

import { FORMATS } from "@/lib/formats";
import type { KeepsakeFormat } from "@/types/memory";

const ICONS: Record<KeepsakeFormat, React.ReactNode> = {
  letter: (
    <path d="M4 7l8 6 8-6M4 6h16v12H4z" strokeLinejoin="round" />
  ),
  story: (
    <path d="M5 4h9a5 5 0 0 1 5 5v11H10a5 5 0 0 1-5-5V4Zm4 5h6M9 13h6" strokeLinejoin="round" strokeLinecap="round" />
  ),
  card: (
    <path d="M6 3h12v18H6zM9 8h6M9 12h6M10 16h4" strokeLinejoin="round" strokeLinecap="round" />
  ),
};

interface FormatPickerProps {
  value: KeepsakeFormat;
  onChange: (format: KeepsakeFormat) => void;
}

export function FormatPicker({ value, onChange }: FormatPickerProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-parchment">What should we write?</legend>
      <div className="grid gap-3">
        {FORMATS.map((format) => {
          const selected = format.id === value;
          return (
            <label
              key={format.id}
              className={`relative flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold/60 ${
                selected
                  ? "border-gold/80 bg-gold/[0.07] shadow-[0_8px_24px_-14px_rgb(165_112_31/0.5)]"
                  : "border-line bg-ash hover:border-gold/40"
              }`}
            >
              <input
                type="radio"
                name="format"
                value={format.id}
                checked={selected}
                onChange={() => onChange(format.id)}
                className="sr-only"
              />
              <svg
                viewBox="0 0 24 24"
                className={`h-9 w-9 shrink-0 rounded-lg p-2 ${selected ? "bg-gold/15 text-gold-soft" : "bg-charcoal text-mist"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                {ICONS[format.id]}
              </svg>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-display text-lg leading-tight text-ivory">{format.label}</span>
                <span className="text-sm leading-snug text-mist">{format.description}</span>
              </span>
              <span
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 rounded-full border ${selected ? "border-[5px] border-gold" : "border-line"}`}
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
