"use client";

import { useEffect, useId, useRef, useState } from "react";
import { suggestCdek, type CdekCityOption, type CdekOfficeOption } from "@/lib/cdek";

type Hit =
  | { kind: "city"; city: CdekCityOption }
  | { kind: "office"; office: CdekOfficeOption };

export function CdekSuggest({
  value,
  onChange,
  onPickOffice,
  onPickCity,
  placeholder = "Город или пункт выдачи СДЭК",
  required,
  className = "",
}: {
  value: string;
  onChange: (next: string) => void;
  onPickOffice: (office: CdekOfficeOption) => void;
  onPickCity?: (city: CdekCityOption) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      void suggestCdek(q).then(({ cities, offices }) => {
        if (cancelled) return;
        const next: Hit[] = [
          ...cities.map((city) => ({ kind: "city" as const, city })),
          ...offices.map((office) => ({ kind: "office" as const, office })),
        ];
        setHits(next);
        setActive(0);
        setLoading(false);
      });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(hit: Hit) {
    if (hit.kind === "city") {
      onChange(hit.city.city);
      onPickCity?.(hit.city);
    } else {
      onChange(hit.office.address || hit.office.name);
      onPickOffice(hit.office);
    }
    setOpen(false);
    setHits([]);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !hits.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + hits.length) % hits.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(hits[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <input
        value={value}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl bg-stone-100 px-3 text-sm outline-none focus:ring-2 focus:ring-ink"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKey}
      />
      {open && (loading || hits.length > 0) && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 z-50 mt-1 max-h-72 overflow-auto rounded-xl bg-paper py-1 shadow-lg ring-1 ring-stone-200"
        >
          {loading && !hits.length ? (
            <li className="px-3 py-2 text-sm text-muted">Ищем в СДЭК…</li>
          ) : (
            hits.map((hit, i) => (
              <li key={hit.kind === "city" ? `c-${hit.city.code}` : `o-${hit.office.code}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm ${i === active ? "bg-stone-100" : "hover:bg-stone-50"}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(hit)}
                >
                  {hit.kind === "city" ? (
                    <>
                      <span className="block text-[11px] text-muted">Город СДЭК</span>
                      <span className="block font-medium">{hit.city.fullName || hit.city.city}</span>
                    </>
                  ) : (
                    <>
                      <span className="block font-medium">{hit.office.name}</span>
                      <span className="block truncate text-xs text-muted">{hit.office.address}</span>
                      {hit.office.workTime ? (
                        <span className="block text-xs text-muted">{hit.office.workTime}</span>
                      ) : null}
                    </>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
