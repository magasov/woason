"use client";

import { SafeImage } from "@/components/safe-image";
import { ShopStories } from "@/components/shop-stories";
import { ProductGrid } from "@/components/product-card";
import { CategoryIcon } from "@/components/category-icon";
import { IconChat, IconPlay, IconStar } from "@/components/icons";
import { SellerBadge } from "@/components/seller-badge";
import { categories } from "@/lib/data";
import { deliveryLabel, formatPrice } from "@/lib/format";
import { isMediaSrc } from "@/lib/media";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";

export default function ShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { catalog, reels, stories, findShop, user, loadShop } = useStore();
  const shop = findShop(id);
  const [cat, setCat] = useState<string>("all");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    void loadShop(id).catch(() => setFailed(true));
  }, [id, loadShop]);

  const goods = useMemo(() => catalog.filter((p) => p.sellerId === id), [catalog, id]);
  const shopReels = useMemo(() => reels.filter((r) => r.sellerId === id), [reels, id]);
  const shopStories = useMemo(() => stories.filter((s) => s.sellerId === id), [stories, id]);
  const cats = useMemo(() => {
    const slugs = new Set(goods.map((p) => p.category));
    return categories.filter((c) => slugs.has(c.slug));
  }, [goods]);

  const showcase = cat === "all" ? goods : goods.filter((p) => p.category === cat);
  const rating =
    goods.length > 0 ? (goods.reduce((s, p) => s + p.rating, 0) / goods.length).toFixed(1) : "—";
  const isOwner = Boolean(user?.seller && user.seller.id === id);

  if (!shop && !failed) {
    return <p className="py-16 text-center text-muted">Загрузка магазина…</p>;
  }

  if (!shop) {
    return (
      <div className="py-16 text-center">
        <p className="text-xl font-bold">Магазин не найден</p>
        <Link href="/" className="mt-4 inline-block text-ember">
          На главную
        </Link>
      </div>
    );
  }

  const chatHref = user ? `/chat/${id}` : `/login?next=${encodeURIComponent(`/chat/${id}`)}`;

  return (
    <div className="flex flex-col gap-8">
      <section className="overflow-hidden rounded-3xl bg-paper">
        <div className="relative h-40 w-full bg-gradient-to-br from-ink to-stone-600 md:h-52">
          {shop.banner ? (
            <SafeImage src={shop.banner} alt="" fill className="object-cover opacity-80" sizes="1120px" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        </div>
        <div className="relative px-5 pb-5 pt-0 md:px-7">
          <div className="-mt-10 flex flex-wrap items-end gap-4">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-paper text-3xl ring-4 ring-paper">
              {isMediaSrc(shop.logo) ? (
                <span className="relative h-full w-full">
                  <SafeImage src={shop.logo} alt="" fill className="object-cover" sizes="80px" />
                </span>
              ) : (
                shop.logo || "🛍️"
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{shop.shopName}</h1>
                <SellerBadge kind={shop.kind === "private" ? "private" : "shop"} />
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted">
                <span className="inline-flex items-center gap-1">
                  <IconStar className="h-3.5 w-3.5 text-ember" />
                  {rating}
                </span>
                <span>· {shop.city}</span>
                <span>· {goods.length} в витрине</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pb-1">
              {isOwner ? (
                <Link href="/seller" className="h-11 rounded-xl bg-ink px-4 text-sm font-semibold leading-[44px] text-paper">
                  Кабинет
                </Link>
              ) : (
                <Link
                  href={chatHref}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-paper"
                >
                  <IconChat className="h-4 w-4" />
                  Написать
                </Link>
              )}
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600">{shop.description}</p>
          {shop.phone && <p className="mt-2 text-sm text-muted">Телефон: {shop.phone}</p>}
          <p className="mt-1 text-sm text-muted">
            Доставка: {shop.delivery.map((d) => deliveryLabel[d]).join(" · ")}
          </p>
        </div>
      </section>

      <ShopStories items={shopStories} shopName={shop.shopName} />

      {shopReels.length > 0 && (
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-semibold">Шортс магазина</h2>
            <Link href="/reels" className="text-sm text-muted">
              Все Шортс
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {shopReels.map((reel) => {
              const product = catalog.find((p) => p.id === reel.productId);
              return (
                <Link
                  key={reel.id}
                  href={`/reels?id=${reel.id}`}
                  className="relative aspect-[4/3] w-[220px] shrink-0 overflow-hidden rounded-2xl bg-stone-900 text-white"
                >
                  {product && (
                    <SafeImage src={product.image} alt={reel.title} fill className="object-cover opacity-90" sizes="220px" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <span className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/20">
                    <IconPlay className="h-4 w-4" />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <p className="line-clamp-2 text-[13px] font-semibold">{reel.title}</p>
                    {product && <p className="mt-1 text-xs text-white/80">{formatPrice(product.price)}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-semibold">Витрина</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCat("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${cat === "all" ? "bg-ink text-paper" : "bg-stone-100"}`}
          >
            Все
          </button>
          {cats.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCat(c.slug)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                cat === c.slug ? "bg-ink text-paper" : "bg-stone-100"
              }`}
            >
              <CategoryIcon slug={c.slug} className="h-3.5 w-3.5" />
              {c.name}
            </button>
          ))}
        </div>
        <div className="mt-5">
          <ProductGrid items={showcase} />
        </div>
      </section>
    </div>
  );
}
