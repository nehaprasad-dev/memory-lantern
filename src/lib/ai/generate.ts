import "server-only";

import type { Keepsake, MemoryInput } from "@/types/memory";
import { cleanModelOutput } from "@/lib/keepsake-text";
import { checkKeepsake, repairKeepsake } from "./fidelity";
import { createChatCompletion, ProviderError } from "./groq";
import { buildMessages, buildReviewMessages, MAX_TOKENS } from "./prompts";

const MIN_LENGTH = 60;

/**
 * Write a keepsake in up to three model calls:
 * 1. draft from the writer's material;
 * 2. a low-temperature fact-check edit that removes anything not in the material;
 * 3. one more targeted edit only if deterministic checks still find problems.
 * Anything still flagged after that is removed rather than shown.
 */
export async function generateKeepsake(
  input: MemoryInput,
  { regenerate = false }: { regenerate?: boolean } = {},
): Promise<Keepsake> {
  const maxTokens = MAX_TOKENS[input.format];

  const draft = await createChatCompletion(buildMessages(input, regenerate), {
    maxTokens,
    temperature: regenerate ? 0.9 : 0.7,
  });
  const model = draft.model;
  let content = cleanModelOutput(draft.text);

  for (let pass = 0; pass < 2; pass++) {
    const issues = checkKeepsake(content, input);
    if (pass > 0 && issues.length === 0) break;
    const edited = await editKeepsake(input, content, issues.map((i) => i.message), maxTokens);
    if (edited) content = edited;
  }

  const remaining = checkKeepsake(content, input);
  if (remaining.length) content = repairKeepsake(content, input, remaining);

  if (content.length < MIN_LENGTH) {
    throw new ProviderError(
      "empty_response",
      "The model's response was too short to be a keepsake. Please try again.",
      502,
    );
  }

  return {
    format: input.format,
    content,
    model,
    createdAt: new Date().toISOString(),
  };
}

/** Returns the edited text, or null if the editor produced nothing usable. */
async function editKeepsake(
  input: MemoryInput,
  content: string,
  flagged: string[],
  maxTokens: number,
): Promise<string | null> {
  try {
    const { text } = await createChatCompletion(buildReviewMessages(input, content, flagged), {
      maxTokens,
      temperature: 0.2,
      // Checking each sentence against the material benefits from more reasoning.
      reasoningEffort: "medium",
    });
    const edited = cleanModelOutput(text);
    return edited.length >= MIN_LENGTH ? edited : null;
  } catch (err) {
    if (err instanceof ProviderError && err.code === "empty_response") return null;
    throw err;
  }
}
