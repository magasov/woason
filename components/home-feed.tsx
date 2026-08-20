"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { isGoodPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ConditionFilter } from "@/lib/types";
import { FiltersBar } from "./filters-bar";
import { ProductGrid } from "./product-card";
import { PromoBanners } from "./promo-banners";
import { ReelsRow } from "./reels-row";

export function HomeFeed() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-400">Загружаем ленту…</div>}>
      <HomeFeedInner />
    </Suspense>
  );
}

function HomeFeedInner() {
  const params = useSearchParams();
  const { catalog, ready } = useStore();
  const condition = (params.get("condition") as ConditionFilter) || "all";

  const filtered = catalog.filter((p) => {
    if (condition !== "all" && p.condition !== condition) return false;
    return true;
  });

  const deals = catalog.filter((p) => isGoodPrice(p.price, p.oldPrice)).slice(0, 4);

  return (
    <div className="flex h-full min-h-full flex-col">
      <PromoBanners />
      <ReelsRow />
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">Хорошая цена</h2>
        <ProductGrid items={deals} />
      </section>
      <section className="mt-10">
        <h2 className="mb-1 text-xl font-bold">Лента</h2>
        <p className="mb-4 text-sm text-muted">Новое от магазинов и б/у от частных продавцов — в одной зоне</p>
        <FiltersBar />
        {!ready ? (
          <p className="py-10 text-center text-muted">Загружаем каталог…</p>
        ) : (
          <ProductGrid items={filtered} />
        )}
      </section>
    </div>
  );
}
