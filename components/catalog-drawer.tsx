"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { categories, categoryGroups } from "@/lib/data";
import { CategoryIcon } from "./category-icon";

export function CatalogDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const grouped = useMemo(
    () =>
      categoryGroups.map((group) => ({
        group,
        items: categories.filter((c) => c.group === group),
      })),
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-[80] ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Закрыть каталог"
        onClick={onClose}
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Каталог товаров"
        className={`absolute inset-y-0 left-0 flex w-full max-w-[420px] flex-col bg-paper shadow-[12px_0_40px_rgba(26,24,20,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">WOAson</p>
            <h2 className="text-lg font-bold">Каталог товаров</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-ink hover:bg-stone-200"
            aria-label="Закрыть"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-6">
            {grouped.map(({ group, items }) => (
              <section key={group}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{group}</p>
                <ul className="grid grid-cols-1 gap-1">
                  {items.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/category/${c.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-stone-100"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-100">
                          <CategoryIcon slug={c.slug} className="h-5 w-5" />
                        </span>
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
