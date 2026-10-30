import type {
  FieldErrors,
  KeepsakeFormat,
  KeepsakeTone,
  MemoryField,
  MemoryInput,
  PersonStatus,
} from "@/types/memory";

/** Character limits per field. Shared by the form and the API route. */
export const LIMITS: Record<MemoryField, { min: number; max: number }> = {
  name: { min: 1, max: 80 },
  relationship: { min: 2, max: 80 },
  writerName: { min: 0, max: 80 },
  memories: { min: 40, max: 3000 },
  moments: { min: 0, max: 2000 },
  favourites: { min: 0, max: 1200 },
  context: { min: 0, max: 1200 },
};

const FORMAT_IDS: KeepsakeFormat[] = ["letter", "story", "card"];
const TONE_IDS: KeepsakeTone[] = ["tender", "celebratory", "reflective", "hopeful"];
const STATUS_IDS: PersonStatus[] = ["living", "passed", "unspecified"];

const FIELD_LABELS: Record<MemoryField, string> = {
  name: "Their name",
  relationship: "Who they are to you",
  writerName: "Your name",
  memories: "Your memories",
  moments: "Important moments",
  favourites: "Favourite things",
  context: "Additional context",
};

export const EMPTY_INPUT: MemoryInput = {
  name: "",
  relationship: "",
  writerName: "",
  status: "unspecified",
  memories: "",
  moments: "",
  favourites: "",
  context: "",
  format: "letter",
  tone: "tender",
};

/** Collapse runs of spaces, strip control characters and limit blank lines. */
export function cleanText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validateInput(input: MemoryInput): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of Object.keys(LIMITS) as MemoryField[]) {
    const value = cleanText(input[field]);
    const { min, max } = LIMITS[field];
    const label = FIELD_LABELS[field];

    if (min > 0 && value.length === 0) {
      errors[field] = `${label} is required.`;
    } else if (value.length > 0 && value.length < min) {
      errors[field] =
        field === "memories"
          ? `Share a little more — at least ${min} characters helps the writing feel like them.`
          : `${label} needs at least ${min} characters.`;
    } else if (value.length > max) {
      errors[field] = `${label} can be at most ${max} characters.`;
    }
  }

  if (!FORMAT_IDS.includes(input.format)) errors.format = "Choose a keepsake format.";
  if (!TONE_IDS.includes(input.tone)) errors.tone = "Choose a tone.";
  if (!STATUS_IDS.includes(input.status)) errors.status = "Choose an option.";

  return errors;
}

/**
 * Turn an untrusted JSON value into a well-typed MemoryInput.
 * Returns null when the shape is wrong; field-level checks happen in validateInput.
 */
export function parseInput(raw: unknown): MemoryInput | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  const str = (key: string): string | null => {
    const v = obj[key];
    if (v === undefined || v === null) return "";
    return typeof v === "string" ? v : null;
  };

  const fields = {
    name: str("name"),
    relationship: str("relationship"),
    writerName: str("writerName"),
    memories: str("memories"),
    moments: str("moments"),
    favourites: str("favourites"),
    context: str("context"),
  };
  if (Object.values(fields).some((v) => v === null)) return null;

  const format = obj.format as KeepsakeFormat;
  const tone = (obj.tone ?? "tender") as KeepsakeTone;
  const status = (obj.status ?? "unspecified") as PersonStatus;

  return {
    name: cleanText(fields.name!),
    relationship: cleanText(fields.relationship!),
    writerName: cleanText(fields.writerName!),
    memories: cleanText(fields.memories!),
    moments: cleanText(fields.moments!),
    favourites: cleanText(fields.favourites!),
    context: cleanText(fields.context!),
    format,
    tone,
    status,
  };
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
