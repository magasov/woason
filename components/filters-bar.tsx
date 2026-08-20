"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ConditionFilter } from "@/lib/types";

const conditions: { id: ConditionFilter; label: string }[] = [
  { id: "all", label: "Все товары" },
  { id: "new", label: "Только новые" },
  { id: "used", label: "Только б/у" },
];

export function FiltersBar() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const condition = (params.get("condition") as ConditionFilter) || "all";

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {conditions.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => set("condition", s.id)}
          className={`rounded-full px-3 py-1.5 text-sm ${
            condition === s.id
              ? "bg-ink text-paper"
              : "bg-paper text-stone-700 ring-1 ring-stone-200 hover:ring-ink"
          }`}
        >
          {s.label}
        </button>
      ))}
      <Link href="/reels" className="ml-auto text-sm font-medium text-ink hover:underline">
        Смотреть Шортс →
      </Link>
    </div>
  );
}
