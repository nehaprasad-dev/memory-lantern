import "server-only";

import type { Keepsake, MemoryInput } from "@/types/memory";
import { cleanModelOutput } from "@/lib/keepsake-text";
import { createChatCompletion, ProviderError } from "./huggingface";
import { buildMessages, MAX_TOKENS } from "./prompts";

/** Build the prompt, call the open-weight model and tidy its output. */
export async function generateKeepsake(
  input: MemoryInput,
  { regenerate = false }: { regenerate?: boolean } = {},
): Promise<Keepsake> {
  const { text, model } = await createChatCompletion(buildMessages(input, regenerate), {
    maxTokens: MAX_TOKENS[input.format],
    temperature: regenerate ? 0.95 : 0.8,
  });

  const content = cleanModelOutput(text);
  if (content.length < 60) {
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
