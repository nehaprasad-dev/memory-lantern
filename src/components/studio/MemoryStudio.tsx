"use client";

import { useRef, useState } from "react";
import { useKeepsake } from "@/hooks/useKeepsake";
import { EMPTY_INPUT, hasErrors, validateInput } from "@/lib/validation";
import type { FieldErrors, MemoryInput } from "@/types/memory";
import { KeepsakeReader } from "./KeepsakeReader";
import { MemoryForm } from "./MemoryForm";
import { EmptyPanel, ErrorPanel, GeneratingPanel } from "./StatusPanels";

/**
 * The interactive memory → keepsake experience. All state lives in React
 * memory; nothing is written to localStorage, cookies or a server database.
 */
export function MemoryStudio() {
  const [input, setInput] = useState<MemoryInput>(EMPTY_INPUT);
  const [errors, setErrors] = useState<FieldErrors>({});
  // The most recently submitted input, so "Try again" repeats it.
  const [lastInput, setLastInput] = useState<MemoryInput | null>(null);
  const { status, keepsake, source, error, generate, cancel, reset } = useKeepsake();
  const outputRef = useRef<HTMLDivElement>(null);

  const loading = status === "loading";

  const update = <K extends keyof MemoryInput>(key: K, value: MemoryInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const scrollToOutput = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const run = async (source: MemoryInput, regenerate: boolean) => {
    setLastInput(source);
    scrollToOutput();
    const serverErrors = await generate(source, regenerate);
    if (serverErrors) setErrors(serverErrors);
  };

  const handleSubmit = () => {
    const found = validateInput(input);
    setErrors(found);
    if (hasErrors(found)) {
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    void run(input, false);
  };

  const handleClear = () => {
    setInput(EMPTY_INPUT);
    setErrors({});
    setLastInput(null);
    reset();
  };

  const retry = () => {
    if (lastInput) void run(lastInput, false);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
      <div>
        <MemoryForm
          value={input}
          errors={errors}
          loading={loading}
          onChange={update}
          onSubmit={handleSubmit}
          onClear={handleClear}
        />
      </div>

      <div ref={outputRef} className="scroll-mt-24">
        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          {error && status === "error" && <ErrorPanel error={error} onRetry={retry} />}

          {loading && !keepsake && <GeneratingPanel onCancel={cancel} />}

          {keepsake && source && (
            <>
              {loading && (
                <p className="text-sm text-gold-soft" role="status">
                  Writing a new version…{" "}
                  <button type="button" onClick={cancel} className="text-mist underline underline-offset-4">
                    cancel
                  </button>
                </p>
              )}
              <KeepsakeReader
                keepsake={keepsake}
                personName={source.name}
                regenerating={loading}
                onRegenerate={() => void run(source, true)}
              />
            </>
          )}

          {!keepsake && !loading && status !== "error" && <EmptyPanel />}
        </div>
      </div>
    </div>
  );
}
