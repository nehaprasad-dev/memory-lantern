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
      <div className="grid gap-3 sm:grid-cols-3">
        {FORMATS.map((format) => {
          const selected = format.id === value;
          return (
            <label
              key={format.id}
              className={`relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold/60 ${
                selected
                  ? "border-gold/80 bg-gold/[0.07] shadow-[0_0_30px_-12px_rgb(232_162_79/0.6)]"
                  : "border-line bg-charcoal/60 hover:border-gold/40"
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
                className={`h-5 w-5 ${selected ? "text-gold-soft" : "text-mist"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                {ICONS[format.id]}
              </svg>
              <span className="font-display text-lg leading-tight text-ivory">{format.label}</span>
              <span className="text-xs leading-snug text-mist">{format.tagline}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
