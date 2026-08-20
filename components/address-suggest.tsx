"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  cityFromSuggestion,
  suggestAddress,
  type DadataSuggestKind,
  type DadataSuggestion,
} from "@/lib/dadata";

export function AddressSuggest({
  value,
  onChange,
  kind = "address",
  placeholder,
  cityBoost,
  required,
  variant = "field",
  className = "",
  inputClassName = "",
}: {
  value: string;
  onChange: (next: string, suggestion?: DadataSuggestion) => void;
  kind?: DadataSuggestKind;
  placeholder?: string;
  cityBoost?: string;
  required?: boolean;
  variant?: "field" | "header";
  className?: string;
  inputClassName?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<DadataSuggestion[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      void suggestAddress(q, kind, cityBoost).then((list) => {
        if (cancelled) return;
        setItems(list);
        setActive(0);
        setLoading(false);
      });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value, kind, cityBoost]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(s: DadataSuggestion) {
    onChange(kind === "city" ? cityFromSuggestion(s) : s.value, s);
    setOpen(false);
    setItems([]);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const inputCls =
    variant === "header"
      ? "h-7 w-full min-w-0 bg-transparent text-sm font-medium outline-none"
      : "h-11 w-full rounded-xl bg-stone-100 px-3 text-sm outline-none focus:ring-2 focus:ring-ink";

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <input
        value={value}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={placeholder}
        className={`${inputCls} ${inputClassName}`}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKey}
      />
      {open && (loading || items.length > 0) && (
        <ul
          id={listId}
          role="listbox"
          className={`absolute z-50 mt-1 max-h-64 overflow-auto rounded-xl bg-paper py-1 shadow-lg ring-1 ring-stone-200 ${
            variant === "header" ? "right-0 left-auto min-w-[280px]" : "inset-x-0"
          }`}
        >
          {loading && !items.length ? (
            <li className="px-3 py-2 text-sm text-muted">Ищем адрес…</li>
          ) : (
            items.map((s, i) => (
              <li key={`${s.unrestricted_value}-${i}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm ${i === active ? "bg-stone-100" : "hover:bg-stone-50"}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(s)}
                >
                  <span className="block font-medium">{kind === "city" ? cityFromSuggestion(s) : s.value}</span>
                  <span className="block truncate text-xs text-muted">{s.unrestricted_value}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
