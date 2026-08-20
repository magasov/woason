"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categories } from "@/lib/data";
import { conditionLabel, formatPrice, tradeTypeLabel } from "@/lib/format";
import type { Condition, Product } from "@/lib/types";
import { SafeImage } from "./safe-image";
import { IconSearch } from "./icons";

export function SellerGoods({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState<"all" | Condition>("all");
  const [sort, setSort] = useState<"new" | "price" | "stock">("new");

  const usedCats = useMemo(() => {
    const slugs = new Set(products.map((p) => p.category));
    return categories.filter((c) => slugs.has(c.slug));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (condition !== "all" && p.condition !== condition) return false;
      if (!q) return true;
      return [p.title, p.description, p.tags.join(" ")].join(" ").toLowerCase().includes(q);
    });
    const next = [...list];
    if (sort === "price") next.sort((a, b) => a.price - b.price);
    else if (sort === "stock") next.sort((a, b) => b.inStock - a.inStock);
    return next;
  }, [products, query, category, condition, sort]);

  return (
    <section id="goods" className="rounded-2xl bg-paper p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Товары</h2>
          <p className="text-sm text-muted">
            {filtered.length} из {products.length} в витрине
          </p>
        </div>
        <Link href="/seller/new" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">
          Добавить товар
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex min-w-0">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти среди своих товаров"
            className="h-11 min-w-0 flex-1 rounded-l-xl bg-stone-100 px-4 text-sm outline-none placeholder:text-stone-400 focus:bg-white"
          />
          <span className="grid h-11 w-11 place-items-center rounded-r-xl bg-ink text-paper">
            <IconSearch className="h-4 w-4" />
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            Все категории
          </Chip>
          {usedCats.map((c) => (
            <Chip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>
              {c.name}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {([
            ["all", "Все"],
            ["new", "Новые"],
            ["used", "Б/у"],
          ] as const).map(([id, label]) => (
            <Chip key={id} active={condition === id} onClick={() => setCondition(id)}>
              {label}
            </Chip>
          ))}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="ml-auto h-9 rounded-full bg-stone-100 px-3 text-sm outline-none"
          >
            <option value="new">Сначала новые</option>
            <option value="price">Дешевле</option>
            <option value="stock">По остатку</option>
          </select>
        </div>
      </div>

      {filtered.length ? (
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3">
          {filtered.map((p) => (
            <SellerProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">
          {products.length ? "Ничего не нашлось — сбросьте фильтр." : "Витрина пустая. Добавьте первый товар."}
        </p>
      )}
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${
        active ? "bg-ink text-paper" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
      }`}
    >
      {children}
    </button>
  );
}

function SellerProductCard({ product }: { product: Product }) {
  const cat = categories.find((c) => c.slug === product.category)?.name;
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200">
        <SafeImage
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, 220px"
          className="object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.condition === "used" && (
            <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {conditionLabel.used}
            </span>
          )}
          {product.tradeType && (
            <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink">
              {tradeTypeLabel[product.tradeType]}
            </span>
          )}
        </div>
        <span className="absolute bottom-2 right-2 rounded-md bg-ink/85 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {product.inStock} шт.
        </span>
      </div>
      <div className="mt-2 space-y-0.5 px-0.5">
        <p className="text-lg font-bold tracking-tight">{formatPrice(product.price)}</p>
        <p className="line-clamp-2 text-sm leading-snug text-stone-700">{product.title}</p>
        <p className="text-xs text-muted">{cat}</p>
      </div>
    </Link>
  );
}
