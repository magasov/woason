"use client";

import { ProductGallery } from "@/components/product-gallery";
import { ProductGrid } from "@/components/product-card";
import { ProductReviews } from "@/components/product-reviews";
import { SafeImage } from "@/components/safe-image";
import { SellerBadge, TradeBadge } from "@/components/seller-badge";
import { Stars } from "@/components/star-rating";
import { IconHeart, IconShare, IconStar, IconTruck } from "@/components/icons";
import { calculateCdek } from "@/lib/cdek";
import { categories } from "@/lib/data";
import { quoteDelivery } from "@/lib/delivery";
import {
  conditionLabel,
  deliveryLabel,
  discountPercent,
  formatPrice,
  isGoodPrice,
  plural,
  publicTradeType,
  tradeTypeHint,
} from "@/lib/format";
import { isMediaSrc } from "@/lib/media";
import { reviewEligibility } from "@/lib/reviews";
import { useStore } from "@/lib/store";
import type { DeliveryMethod } from "@/lib/types";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    findProduct,
    findShop,
    addToCart,
    favorites,
    toggleFavorite,
    city,
    user,
    loadProduct,
    catalog,
    orders,
    myReviews,
    pendingReviews,
  } = useStore();
  const product = findProduct(id);
  const shop = product ? findShop(product.sellerId) : undefined;
  const [cdekPrice, setCdekPrice] = useState<number | null>(null);
  const [cdekEta, setCdekEta] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    void loadProduct(id).catch(() => undefined);
  }, [id, loadProduct]);

  const isOwner = Boolean(
    user && product && (user.id === product.sellerId || user.seller?.id === product.sellerId),
  );

  useEffect(() => {
    if (!product?.delivery?.includes("cdek") || !city) return;
    let cancelled = false;
    void calculateCdek(product.city, city, product.weightKg).then((q) => {
      if (cancelled || !q) return;
      setCdekPrice(q.price);
      setCdekEta(q.eta);
    });
    return () => {
      cancelled = true;
    };
  }, [product, city]);

  const quotes = (product?.delivery || []).map((method: DeliveryMethod) => {
    const local = quoteDelivery(method, city, product!.weightKg);
    if (method === "cdek" && cdekPrice != null) {
      return { method, price: cdekPrice, eta: cdekEta || local.eta, days: local.days };
    }
    return { method, ...local };
  });

  const eligibility = useMemo(
    () =>
      product
        ? reviewEligibility({ user, product, orders, myReviews, pending: pendingReviews })
        : { status: "none" as const },
    [user, product, orders, myReviews, pendingReviews],
  );

  const similar = useMemo(() => {
    if (!product) return [];
    return catalog
      .filter((p) => p.id !== product.id && (p.category === product.category || p.sellerId === product.sellerId))
      .slice(0, 8);
  }, [catalog, product]);

  if (!product) {
    return (
      <div className="py-16 text-center">
        <p className="text-xl font-bold">Товар не найден</p>
        <Link href="/" className="mt-4 inline-block text-ember">
          На главную
        </Link>
      </div>
    );
  }

  const discount = discountPercent(product.price, product.oldPrice);
  const category = categories.find((c) => c.slug === product.category);
  const photos = product.images?.length ? product.images : [product.image];
  const liked = favorites.includes(product.id);
  const productId = product.id;
  const productTitle = product.title;
  const shopHref = `/shop/${product.sellerId}`;
  const chatHref = user ? `/chat/${product.sellerId}` : `/login?next=${encodeURIComponent(`/chat/${product.sellerId}`)}`;

  function requireUser(next: string, action: () => void) {
    if (!user) {
      window.location.href = `/login?next=${encodeURIComponent(next)}`;
      return;
    }
    action();
  }

  async function onAdd() {
    requireUser(`/product/${productId}`, () => {
      void addToCart(productId).then(() => {
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
      });
    });
  }

  async function onShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: productTitle, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    }
  }

  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Главная
        </Link>
        <span>/</span>
        {category && (
          <>
            <Link href={`/category/${category.slug}`} className="hover:text-ink">
              {category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="line-clamp-1 text-ink">{product.title}</span>
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <ProductGallery title={product.title} images={photos} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SellerBadge kind={product.sellerKind} />
            <TradeBadge type={product.tradeType} revealDropship={isOwner} />
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium">
              {conditionLabel[product.condition]}
            </span>
            {isGoodPrice(product.price, product.oldPrice) && (
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-ember">
                Хорошая цена
              </span>
            )}
            {product.inStock > 0 ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                В наличии · {product.inStock} шт.
              </span>
            ) : (
              <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium">Нет в наличии</span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl">{product.title}</h1>

          <a href="#reviews" className="mt-3 inline-flex flex-wrap items-center gap-2 text-sm text-stone-600">
            <Stars value={product.rating} size="h-4 w-4" />
            <b className="text-ink">{product.rating}</b>
            <span className="text-ember underline-offset-2 hover:underline">
              {plural(product.reviewsCount, "отзыв", "отзыва", "отзывов")}
            </span>
            <span>· {product.city}</span>
          </a>

          {product.tradeType && (
            <p className="mt-2 text-sm text-muted">
              {tradeTypeHint[isOwner ? product.tradeType : publicTradeType(product.tradeType) || "retail"]}
            </p>
          )}

          <div className="mt-6 rounded-3xl bg-paper p-5 shadow-[0_18px_40px_-32px_rgba(26,24,20,0.4)]">
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-4xl font-black tracking-tight">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <>
                  <span className="text-lg text-stone-400 line-through">{formatPrice(product.oldPrice)}</span>
                  <span className="rounded-full bg-ember px-2.5 py-0.5 text-sm font-bold text-white">−{discount}%</span>
                </>
              )}
            </div>
            {product.oldPrice && (
              <p className="mt-1 text-sm text-muted">
                Выгода {formatPrice(product.oldPrice - product.price)}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => void onAdd()}
                disabled={!product.inStock}
                className="h-12 flex-1 rounded-2xl bg-ink text-base font-semibold text-paper transition hover:bg-stone-800 disabled:opacity-50"
              >
                {added ? "Добавлено" : "В корзину"}
              </button>
              <button
                type="button"
                onClick={() =>
                  requireUser(`/product/${product.id}`, () => {
                    void toggleFavorite(product.id);
                  })
                }
                className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 ring-stone-200 ${
                  liked ? "bg-orange-50 text-ember" : "text-stone-500 hover:bg-stone-50"
                }`}
                aria-label="Избранное"
              >
                <IconHeart filled={liked} />
              </button>
              <button
                type="button"
                onClick={() => void onShare()}
                className="grid h-12 w-12 place-items-center rounded-2xl text-stone-500 ring-1 ring-stone-200 hover:bg-stone-50"
                aria-label="Поделиться"
              >
                <IconShare />
              </button>
            </div>
            {copied && <p className="mt-2 text-sm text-ember">Ссылка скопирована</p>}

            {eligibility.status === "eligible" && (
              <a
                href="#reviews"
                className="mt-3 flex h-11 items-center justify-center rounded-2xl bg-orange-50 text-sm font-semibold text-ember"
              >
                Оставить отзыв — товар доставлен
              </a>
            )}
          </div>

          <div className="mt-4 rounded-3xl bg-paper p-5">
            <p className="flex items-center gap-2 font-semibold">
              <IconTruck className="h-5 w-5 text-ember" />
              Доставка в {city || "ваш город"}
            </p>
            <ul className="mt-3 space-y-3">
              {quotes.map((q) => (
                <li key={q.method} className="flex items-start justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium">{deliveryLabel[q.method]}</p>
                    <p className="text-muted">
                      {q.days} · {q.eta}
                    </p>
                  </div>
                  <p className="font-semibold">{q.price === 0 ? "бесплатно" : formatPrice(q.price)}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl bg-paper">
            <div className="flex items-center gap-4 p-4">
              <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-stone-100 text-2xl">
                {isMediaSrc(shop?.logo) ? (
                  <SafeImage src={shop!.logo} alt="" fill className="object-cover" sizes="56px" />
                ) : (
                  shop?.logo || "🛍️"
                )}
              </span>
              <div className="min-w-0 flex-1">
                <Link href={shopHref} className="block truncate font-semibold hover:underline">
                  {product.sellerName}
                </Link>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                  <IconStar className="h-3.5 w-3.5 text-ember" />
                  {product.rating} · {product.city}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-stone-100">
              <Link href={shopHref} className="bg-paper py-3 text-center text-sm font-semibold hover:bg-stone-50">
                В магазин
              </Link>
              {isOwner ? (
                <Link href="/seller" className="bg-paper py-3 text-center text-sm font-semibold hover:bg-stone-50">
                  Кабинет
                </Link>
              ) : (
                <Link href={chatHref} className="bg-paper py-3 text-center text-sm font-semibold hover:bg-stone-50">
                  Написать
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-3xl bg-paper p-5 sm:p-7">
        <h2 className="text-xl font-bold">О товаре</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">{product.description}</p>
        <dl className="mt-5 grid gap-2 sm:grid-cols-2">
          <Spec k="Категория" v={category?.name || product.category} />
          <Spec k="Состояние" v={conditionLabel[product.condition]} />
          <Spec k="Вес" v={`${product.weightKg} кг`} />
          <Spec k="Город продавца" v={product.city} />
        </dl>
        {product.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      <ProductReviews
        productId={product.id}
        rating={product.rating}
        reviewsCount={product.reviewsCount}
        reviews={product.reviews ?? []}
        eligibility={eligibility}
      />

      {similar.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-bold">Похожие товары</h2>
            {category && (
              <Link href={`/category/${category.slug}`} className="text-sm text-muted hover:text-ink">
                В категорию
              </Link>
            )}
          </div>
          <ProductGrid items={similar} />
        </section>
      )}

      <div className="h-16 md:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-paper/95 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-black leading-none">{formatPrice(product.price)}</p>
            {product.oldPrice && (
              <p className="text-xs text-stone-400 line-through">{formatPrice(product.oldPrice)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => void onAdd()}
            disabled={!product.inStock}
            className="h-11 flex-1 rounded-2xl bg-ink text-sm font-semibold text-paper disabled:opacity-50"
          >
            {added ? "Добавлено" : "В корзину"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm">
      <dt className="text-muted">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
