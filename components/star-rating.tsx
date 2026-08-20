"use client";

import { IconStar } from "./icons";

export function Stars({
  value,
  onChange,
  size = "h-5 w-5",
  label,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: string;
  label?: string;
}) {
  const interactive = Boolean(onChange);
  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? "radiogroup" : undefined} aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        if (!interactive) {
          return (
            <IconStar
              key={n}
              className={`${size} ${filled ? "text-ember" : "text-stone-300"}`}
            />
          );
        }
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} из 5`}
            onClick={() => onChange?.(n)}
            className={`rounded-md p-0.5 transition ${filled ? "text-ember" : "text-stone-300 hover:text-ember/70"}`}
          >
            <IconStar className={size} />
          </button>
        );
      })}
    </div>
  );
}
