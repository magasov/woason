"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product-card";
import { searchProducts } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-400">Ищем…</p>}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const q = useSearchParams().get("q") || "";
  const { catalog } = useStore();
  const items = searchProducts(q, catalog);
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Поиск</h1>
      <p className="mb-6 text-sm text-zinc-500">
        {q ? `По запросу «${q}» — ${items.length}` : "Введите запрос в шапке"}
      </p>
      <ProductGrid items={items} />
    </div>
  );
}
