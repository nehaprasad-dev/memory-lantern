"use client";

import type { FormEvent } from "react";
import { STATUSES, TONES } from "@/lib/formats";
import { LIMITS } from "@/lib/validation";
import type { FieldErrors, MemoryInput } from "@/types/memory";
import { PrivacyNotice } from "../PrivacyNotice";
import { ChoicePills } from "./ChoicePills";
import { TextAreaField, TextField } from "./Field";
import { FormatPicker } from "./FormatPicker";

interface MemoryFormProps {
  value: MemoryInput;
  errors: FieldErrors;
  loading: boolean;
  onChange: <K extends keyof MemoryInput>(key: K, value: MemoryInput[K]) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export function MemoryForm({ value, errors, loading, onChange, onSubmit, onClear }: MemoryFormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  const typedName = value.name.trim();
  const name = typedName || "them";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <StepHeading step="1" title="Who are you remembering?" />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Their name"
            value={value.name}
            onChange={(v) => onChange("name", v)}
            error={errors.name}
            maxLength={LIMITS.name.max}
            placeholder="e.g. Nani, Dad, Priya"
            required
          />
          <TextField
            label="Who they are to you"
            value={value.relationship}
            onChange={(v) => onChange("relationship", v)}
            error={errors.relationship}
            maxLength={LIMITS.relationship.max}
            placeholder="e.g. my grandmother"
            required
          />
          <TextField
            label="Your name"
            hint="Signs the letter."
            value={value.writerName}
            onChange={(v) => onChange("writerName", v)}
            error={errors.writerName}
            maxLength={LIMITS.writerName.max}
            placeholder="e.g. Meera"
          />
        </div>
        <ChoicePills
          legend={typedName ? `Is ${typedName} still with you?` : "Are they still with you?"}
          name="status"
          options={STATUSES}
          value={value.status}
          onChange={(v) => onChange("status", v)}
        />
      </section>

      <section className="flex flex-col gap-5">
        <StepHeading step="2" title="What do you remember?" />
        <TextAreaField
          label={`Your memories of ${name}`}
          hint={`Only what you write here is used. The little details matter most — the way ${typedName || "they"} laughed, what they always said.`}
          value={value.memories}
          onChange={(v) => onChange("memories", v)}
          error={errors.memories}
          maxLength={LIMITS.memories.max}
          rows={6}
          placeholder="She hummed while she cooked, always slightly off-key, and would pretend she hadn't noticed you sneaking a taste…"
          required
        />
        <TextAreaField
          label="Important moments"
          hint="A day, a trip, a conversation, a turning point."
          value={value.moments}
          onChange={(v) => onChange("moments", v)}
          error={errors.moments}
          maxLength={LIMITS.moments.max}
          placeholder="The summer we drove to the coast and she insisted on stopping at every fruit stand…"
        />
        <TextAreaField
          label="Favourite things"
          hint="Songs, food, places, books, sayings, habits."
          value={value.favourites}
          onChange={(v) => onChange("favourites", v)}
          error={errors.favourites}
          maxLength={LIMITS.favourites.max}
          rows={3}
          placeholder="Old Kishore Kumar songs, cardamom tea, crossword puzzles in pen…"
        />
        <TextAreaField
          label="Additional context"
          hint="Anything that helps — an occasion, who it's for, something to avoid."
          value={value.context}
          onChange={(v) => onChange("context", v)}
          error={errors.context}
          maxLength={LIMITS.context.max}
          rows={3}
          placeholder="I'd like to read this at her 80th birthday."
        />
      </section>

      <section className="flex flex-col gap-5">
        <StepHeading step="3" title="Shape the keepsake" />
        <FormatPicker value={value.format} onChange={(v) => onChange("format", v)} />
        <ChoicePills
          legend="Tone"
          name="tone"
          options={TONES}
          value={value.tone}
          onChange={(v) => onChange("tone", v)}
        />
      </section>

      <PrivacyNotice />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="rounded-full px-4 py-2.5 text-sm text-dusk transition-colors hover:text-parchment disabled:opacity-50"
        >
          Clear everything
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-night shadow-[0_10px_30px_-12px_rgb(165_112_31/0.6)] transition-all hover:-translate-y-0.5 hover:bg-gold-soft disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Writing…" : "Write my keepsake"}
        </button>
      </div>
    </form>
  );
}

function StepHeading({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-line/70 pb-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/10 text-sm font-semibold text-gold-soft ring-1 ring-gold/30">
        {step}
      </span>
      <h2 className="font-display text-2xl text-ivory">{title}</h2>
    </div>
  );
}
