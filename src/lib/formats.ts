import type { KeepsakeFormat, KeepsakeTone, PersonStatus } from "@/types/memory";

export interface FormatOption {
  id: KeepsakeFormat;
  label: string;
  tagline: string;
  description: string;
}

export const FORMATS: FormatOption[] = [
  {
    id: "letter",
    label: "Personal letter",
    tagline: "Words written to them",
    description:
      "A heartfelt letter in your voice, addressed to them, carrying the details you shared.",
  },
  {
    id: "story",
    label: "Short story",
    tagline: "A moment, retold",
    description:
      "A short, true-to-memory narrative that brings one of your moments back to the page.",
  },
  {
    id: "card",
    label: "Remembrance card",
    tagline: "A keepsake to hold",
    description:
      "A beautifully structured card — a title, a few gathered details, and a closing line.",
  },
];

export const TONES: { id: KeepsakeTone; label: string }[] = [
  { id: "tender", label: "Tender" },
  { id: "celebratory", label: "Celebratory" },
  { id: "reflective", label: "Reflective" },
  { id: "hopeful", label: "Hopeful" },
];

export const STATUSES: { id: PersonStatus; label: string }[] = [
  { id: "living", label: "They're with us" },
  { id: "passed", label: "They've passed away" },
  { id: "unspecified", label: "I'd rather not say" },
];

export function formatLabel(format: KeepsakeFormat): string {
  return FORMATS.find((f) => f.id === format)?.label ?? format;
}
