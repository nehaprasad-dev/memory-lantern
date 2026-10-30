"use client";

import { useId, type ChangeEvent } from "react";

interface BaseFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength: number;
  required?: boolean;
  placeholder?: string;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  count,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  count?: { value: number; max: number };
  children: React.ReactNode;
}) {
  const nearLimit = count && count.value > count.max * 0.9;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-parchment">
          {label}
          {required ? (
            <span className="ml-1 text-gold" aria-hidden="true">*</span>
          ) : (
            <span className="ml-2 text-xs font-normal text-dusk">optional</span>
          )}
        </label>
        {count && (
          <span className={`text-xs tabular-nums ${nearLimit ? "text-rose" : "text-dusk"}`}>
            {count.value.toLocaleString()} / {count.max.toLocaleString()}
          </span>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 text-xs leading-relaxed text-dusk">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-rose" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (error?: string) =>
  `w-full rounded-lg border bg-charcoal/80 px-3.5 py-2.5 text-[15px] text-ivory placeholder:text-dusk/80 transition-colors focus:outline-none focus:ring-2 focus:ring-gold/40 ${
    error ? "border-rose/70 focus:border-rose" : "border-line focus:border-gold/70"
  }`;

export function TextField(props: BaseFieldProps) {
  const id = useId();
  const describedBy = [props.hint && `${id}-hint`, props.error && `${id}-error`]
    .filter(Boolean)
    .join(" ");
  return (
    <FieldShell id={id} {...props}>
      <input
        id={id}
        type="text"
        value={props.value}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        required={props.required}
        aria-invalid={Boolean(props.error)}
        aria-describedby={describedBy || undefined}
        onChange={(e: ChangeEvent<HTMLInputElement>) => props.onChange(e.target.value)}
        className={inputClass(props.error)}
      />
    </FieldShell>
  );
}

export function TextAreaField(props: BaseFieldProps & { rows?: number }) {
  const id = useId();
  const describedBy = [props.hint && `${id}-hint`, props.error && `${id}-error`]
    .filter(Boolean)
    .join(" ");
  return (
    <FieldShell
      id={id}
      {...props}
      count={{ value: props.value.length, max: props.maxLength }}
    >
      <textarea
        id={id}
        rows={props.rows ?? 4}
        value={props.value}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        required={props.required}
        aria-invalid={Boolean(props.error)}
        aria-describedby={describedBy || undefined}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => props.onChange(e.target.value)}
        className={`${inputClass(props.error)} resize-y leading-relaxed`}
      />
    </FieldShell>
  );
}
