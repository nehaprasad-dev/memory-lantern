import "server-only";

import type { GenerateErrorCode } from "@/types/memory";
import type { ChatMessage } from "./prompts";

/**
 * Groq serves GPT-OSS 20B behind an OpenAI-compatible chat-completions API.
 * GPT-OSS reasoning comes back in `message.reasoning`, separate from
 * `message.content`, so only the content is used.
 * Docs: https://console.groq.com/docs/openai
 */
const DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "openai/gpt-oss-20b";
const REQUEST_TIMEOUT_MS = 60_000;
const MAX_RETRY_WAIT_S = 20;

export class ProviderError extends Error {
  constructor(
    public code: GenerateErrorCode,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export interface InferenceConfig {
  token: string;
  baseUrl: string;
  model: string;
  reasoningEffort?: "low" | "medium" | "high";
}

export function getInferenceConfig(): InferenceConfig {
  const token = process.env.GROQ_API_KEY?.trim();
  if (!token) {
    throw new ProviderError(
      "not_configured",
      "Memory Lantern isn't connected to a model yet. Add GROQ_API_KEY to .env.local and restart the server.",
      503,
    );
  }

  const effort = process.env.GROQ_REASONING_EFFORT?.trim().toLowerCase();
  return {
    token,
    baseUrl: (process.env.GROQ_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    model: process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL,
    reasoningEffort:
      effort === "none" ? undefined : effort === "medium" || effort === "high" ? effort : "low",
  };
}

interface ChatCompletionResponse {
  model?: string;
  choices?: {
    finish_reason?: string | null;
    message?: { content?: string | null };
  }[];
  error?: string | { message?: string };
}

export interface CompletionResult {
  text: string;
  model: string;
}

export async function createChatCompletion(
  messages: ChatMessage[],
  options: { maxTokens: number; temperature: number; reasoningEffort?: "low" | "medium" | "high" },
): Promise<CompletionResult> {
  const config = getInferenceConfig();

  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
    top_p: 0.95,
    stream: false,
  };
  if (config.reasoningEffort) body.reasoning_effort = options.reasoningEffort ?? config.reasoningEffort;

  let res = await send(config, body);
  // The free tier allows a fixed number of tokens per minute. When the wait is
  // short, waiting once is kinder than failing the whole keepsake.
  const retryAfter = Number(res.headers.get("retry-after"));
  if (res.status === 429 && retryAfter > 0 && retryAfter <= MAX_RETRY_WAIT_S) {
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    res = await send(config, body);
  }

  const data = (await res.json().catch(() => null)) as ChatCompletionResponse | null;

  if (!res.ok) throw toProviderError(res.status, data);

  const choice = data?.choices?.[0];
  const text = choice?.message?.content?.trim() ?? "";

  if (!text) {
    throw new ProviderError(
      "empty_response",
      choice?.finish_reason === "length"
        ? "The model ran out of room before it finished writing. Please try again."
        : "The model returned an empty response. Please try again.",
      502,
    );
  }

  return { text, model: data?.model || config.model };
}

async function send(config: InferenceConfig, body: Record<string, unknown>): Promise<Response> {
  try {
    return await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
      throw new ProviderError(
        "timeout",
        "The model took too long to respond. Please try again in a moment.",
        504,
      );
    }
    throw new ProviderError(
      "provider_unavailable",
      "We couldn't reach the inference provider. Check your connection and try again.",
      502,
    );
  }
}

function toProviderError(status: number, data: ChatCompletionResponse | null): ProviderError {
  const detail =
    typeof data?.error === "string" ? data.error : (data?.error?.message ?? "");
  // Log only status and provider message — never the user's memories.
  console.error(`[memory-lantern] inference provider returned ${status}: ${detail.slice(0, 300)}`);

  if (status === 401 || status === 403) {
    return new ProviderError(
      "provider_auth",
      "Groq rejected the API key. Check that GROQ_API_KEY is set correctly.",
      502,
    );
  }
  // Groq's free tier limits tokens and requests per minute and per day; it
  // answers 429, or 413 when one request would exceed the per-minute tokens.
  if (status === 429 || status === 413) {
    return new ProviderError(
      "rate_limited",
      "Memory Lantern has reached its free usage limit for the moment. Please wait a minute and try again.",
      429,
    );
  }
  if (status === 404 || status === 400) {
    return new ProviderError(
      "provider_error",
      "The configured model or provider couldn't handle this request. Check GROQ_MODEL in your environment.",
      502,
    );
  }
  return new ProviderError(
    "provider_unavailable",
    "The model provider is having trouble right now. Please try again shortly.",
    502,
  );
}
