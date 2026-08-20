"use client";

import { SafeImage } from "./safe-image";
import Link from "next/link";
import { discountPercent, formatPrice, isGoodPrice, plural } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { IconHeart, IconStar } from "./icons";
import { SellerBadge, TradeBadge } from "./seller-badge";

export function ProductCard({ product }: { product: Product }) {
  const { favorites, toggleFavorite, user } = useStore();
  const liked = favorites.includes(product.id);
  const discount = discountPercent(product.price, product.oldPrice);
  const good = isGoodPrice(product.price, product.oldPrice);

  return (
    <article className="group relative">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200">
          <SafeImage
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition duration-300 group-hover:scale-[1.04]"
          />
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            <SellerBadge kind={product.sellerKind} />
            <TradeBadge type={product.tradeType} />
            {product.condition === "used" && (
              <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                Б/у
              </span>
            )}
          </div>
          {discount > 0 && (
            <span className="absolute bottom-2 left-2 rounded-md bg-ember px-1.5 py-0.5 text-xs font-bold text-white">
              −{discount}%
            </span>
          )}
        </div>
        <div className="mt-2 space-y-0.5 px-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight">{formatPrice(product.price)}</span>
            {product.oldPrice ? (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            ) : null}
          </div>
          {good && (
            <p className="text-[11px] font-semibold text-ember">Хорошая цена</p>
          )}
          <p className="line-clamp-2 text-sm leading-snug text-stone-700">{product.title}</p>
          <p className="flex items-center gap-1 text-xs text-muted">
            <IconStar className="h-3.5 w-3.5 text-ember" />
            <span className="font-medium text-ink">{product.rating}</span>
            <span>· {plural(product.reviewsCount, "отзыв", "отзыва", "отзывов")}</span>
          </p>
        </div>
      </Link>
      <Link href={`/shop/${product.sellerId}`} className="mt-0.5 block px-0.5 text-xs text-muted hover:text-ink">
        {product.sellerName}
      </Link>
      <button
        type="button"
        onClick={() => {
          if (!user) {
            window.location.href = "/login";
            return;
          }
          void toggleFavorite(product.id);
        }}
        className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm ${liked ? "text-ember" : "text-stone-500"}`}
        aria-label="В избранное"
      >
        <IconHeart className="h-4 w-4" filled={liked} />
      </button>
    </article>
  );
}

export function ProductGrid({
  items,
  className = "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4",
}: {
  items: Product[];
  className?: string;
}) {
  if (!items.length) {
    return (
      <p className="py-16 text-center text-muted">
        Ничего не нашлось. Снимите фильтры или попробуйте другой запрос.
      </p>
    );
  }
  return (
    <div className={className}>
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
