"use client";

import { ProductGrid } from "@/components/product-card";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function FavoritesPage() {
  const { favoriteProducts } = useStore();
  const items = favoriteProducts;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Избранное</h1>
      {items.length ? (
        <ProductGrid items={items} />
      ) : (
        <p className="text-zinc-500">
          Пока пусто. <Link href="/" className="text-ember">Открыть ленту</Link>
        </p>
      )}
    </div>
  );
}
