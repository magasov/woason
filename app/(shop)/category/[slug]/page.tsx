"use client";

import { use } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { ProductGrid } from "@/components/product-card";
import { categories } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { catalog } = useStore();
  const category = categories.find((c) => c.slug === slug);
  const items = catalog.filter((p) => p.category === slug);
  return (
    <div className="flex h-full min-h-full flex-col">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
            {category ? (
          <>
            <CategoryIcon slug={category.slug} className="h-6 w-6 shrink-0" />
            {category.name}
          </>
        ) : (
          "Категория"
        )}
      </h1>
      <ProductGrid items={items} />
    </div>
  );
}
