"use client";

import { useCallback, useRef, useState } from "react";
import type {
  FieldErrors,
  GenerateFailure,
  GenerateResponse,
  Keepsake,
  MemoryInput,
} from "@/types/memory";

export type GenerationStatus = "idle" | "loading" | "success" | "error";

interface KeepsakeState {
  status: GenerationStatus;
  keepsake: Keepsake | null;
  /** The input the current keepsake was written from. */
  source: MemoryInput | null;
  error: GenerateFailure["error"] | null;
}

/**
 * Talks to /api/generate. Keeps the result in memory only — nothing is
 * persisted to storage — and cancels a pending request if a new one starts.
 */
export function useKeepsake() {
  const [state, setState] = useState<KeepsakeState>({
    status: "idle",
    keepsake: null,
    source: null,
    error: null,
  });
  const controllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (input: MemoryInput, regenerate = false): Promise<FieldErrors | null> => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setState((s) => ({ ...s, status: "loading", error: null }));

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, regenerate }),
          signal: controller.signal,
        });
        const data = (await res.json().catch(() => null)) as GenerateResponse | null;

        if (!data) {
          setState((s) => ({
            ...s,
            status: "error",
            error: { code: "provider_error", message: "The server sent an unexpected response." },
          }));
          return null;
        }

        if (!data.ok) {
          setState((s) => ({ ...s, status: "error", error: data.error }));
          return data.error.fieldErrors ?? null;
        }

        setState({ status: "success", keepsake: data.keepsake, source: input, error: null });
        return null;
      } catch (err) {
        if ((err as Error).name === "AbortError") return null;
        setState((s) => ({
          ...s,
          status: "error",
          error: {
            code: "provider_unavailable",
            message: "We couldn't reach Memory Lantern. Check your connection and try again.",
          },
        }));
        return null;
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState((s) => ({ ...s, status: s.keepsake ? "success" : "idle" }));
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState({ status: "idle", keepsake: null, source: null, error: null });
  }, []);

  return { ...state, generate, cancel, reset };
}
