import { generateKeepsake } from "@/lib/ai/generate";
import { ProviderError } from "@/lib/ai/groq";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { hasErrors, parseInput, validateInput } from "@/lib/validation";
import type { GenerateErrorCode, GenerateResponse } from "@/types/memory";

const MAX_BODY_BYTES = 16_000;

function fail(
  status: number,
  code: GenerateErrorCode,
  message: string,
  extra: { fieldErrors?: Record<string, string>; headers?: HeadersInit } = {},
) {
  const body: GenerateResponse = {
    ok: false,
    error: { code, message, fieldErrors: extra.fieldErrors },
  };
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extra.headers },
  });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return fail(415, "invalid_request", "Requests must be sent as JSON.");
  }

  const limit = checkRateLimit(clientKey(request));
  if (!limit.allowed) {
    return fail(
      429,
      "rate_limited",
      `You've made several requests in a short time. Please wait ${limit.retryAfter} seconds.`,
      { headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return fail(413, "invalid_request", "That's more text than we can send in one request.");
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail(400, "invalid_request", "The request body wasn't valid JSON.");
  }

  const payload = (json ?? {}) as { input?: unknown; regenerate?: unknown };
  const input = parseInput(payload.input);
  if (!input) {
    return fail(400, "invalid_request", "The request was missing the memory details.");
  }

  const fieldErrors = validateInput(input);
  if (hasErrors(fieldErrors)) {
    return fail(422, "validation_failed", "Some details need another look.", {
      fieldErrors: fieldErrors as Record<string, string>,
    });
  }

  try {
    const keepsake = await generateKeepsake(input, { regenerate: payload.regenerate === true });
    const body: GenerateResponse = { ok: true, keepsake };
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof ProviderError) {
      return fail(err.status, err.code, err.message);
    }
    console.error("[memory-lantern] unexpected generation error:", (err as Error)?.name);
    return fail(500, "provider_error", "Something went wrong while writing. Please try again.");
  }
}
