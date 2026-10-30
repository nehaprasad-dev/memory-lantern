export type KeepsakeFormat = "letter" | "story" | "card";

export type KeepsakeTone = "tender" | "celebratory" | "reflective" | "hopeful";

/**
 * Whether the person is still living. Used only to steer tone — the model is
 * never allowed to assume someone has died unless the user says so.
 */
export type PersonStatus = "living" | "passed" | "unspecified";

export interface MemoryInput {
  name: string;
  relationship: string;
  status: PersonStatus;
  memories: string;
  moments: string;
  favourites: string;
  context: string;
  format: KeepsakeFormat;
  tone: KeepsakeTone;
}

export type MemoryField = Exclude<keyof MemoryInput, "format" | "tone" | "status">;

export type FieldErrors = Partial<Record<keyof MemoryInput, string>>;

export interface GenerateRequest {
  input: MemoryInput;
  /** Set when the user asks for another version of the same keepsake. */
  regenerate?: boolean;
}

export interface Keepsake {
  format: KeepsakeFormat;
  /** The model's raw text, using `# ` for a title and `## ` for section headings. */
  content: string;
  model: string;
  createdAt: string;
}

export interface GenerateSuccess {
  ok: true;
  keepsake: Keepsake;
}

export type GenerateErrorCode =
  | "invalid_request"
  | "validation_failed"
  | "rate_limited"
  | "not_configured"
  | "provider_auth"
  | "provider_unavailable"
  | "provider_error"
  | "empty_response"
  | "timeout";

export interface GenerateFailure {
  ok: false;
  error: {
    code: GenerateErrorCode;
    message: string;
    fieldErrors?: FieldErrors;
  };
}

export type GenerateResponse = GenerateSuccess | GenerateFailure;

/** A parsed block of keepsake text, ready for rendering. */
export type KeepsakeBlock =
  | { kind: "title"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string };
