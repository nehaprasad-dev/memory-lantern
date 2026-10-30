"use client";

interface ChoicePillsProps<T extends string> {
  legend: string;
  name: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function ChoicePills<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: ChoicePillsProps<T>) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-medium text-parchment">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <label
              key={option.id}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold/60 ${
                selected
                  ? "border-gold/70 bg-gold/10 text-gold-soft"
                  : "border-line text-mist hover:border-gold/40 hover:text-parchment"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
