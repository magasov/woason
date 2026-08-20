"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SafeImage } from "./safe-image";
import { Stars } from "./star-rating";
import { formatPrice } from "@/lib/format";
import { formatReviewDate } from "@/lib/reviews";
import { useStore } from "@/lib/store";

export function CabinetReviews() {
  const { user, myReviews, pendingReviews, loadMyReviews, loadPendingReviews } = useStore();

  useEffect(() => {
    void loadMyReviews().catch(() => undefined);
    void loadPendingReviews().catch(() => undefined);
  }, [loadMyReviews, loadPendingReviews]);

  if (!user) return null;

  return (
    <section className="min-w-0 max-w-full space-y-4 overflow-visible">
      <div className="rounded-2xl bg-paper p-5">
        <h1 className="text-xl font-bold">Отзывы</h1>
        <p className="mt-1 text-sm text-muted">
          Все отзывы на сайте открыты. Написать можно только после статуса «Доставлен».
        </p>
      </div>

      <div className="rounded-2xl bg-paper p-5">
        <h2 className="font-semibold">Ждут оценки</h2>
        {pendingReviews.length ? (
          <ul className="mt-3 space-y-2">
            {pendingReviews.map((row) => (
              <li key={`${row.orderId}-${row.productId}`}>
                <Link
                  href={`/product/${row.productId}#reviews`}
                  className="flex items-center gap-3 rounded-xl bg-stone-50 p-3 hover:ring-1 hover:ring-ink"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-200">
                    <SafeImage src={row.image} alt="" fill className="object-cover" sizes="56px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{row.title}</span>
                    <span className="text-sm text-muted">
                      {formatPrice(row.price)} · заказ {row.orderId}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-ember px-3 py-1.5 text-xs font-semibold text-white">
                    Оценить
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Нет доставленных товаров без отзыва.</p>
        )}
      </div>

      <div className="rounded-2xl bg-paper p-5">
        <h2 className="font-semibold">Мои отзывы</h2>
        {myReviews.length ? (
          <ul className="mt-3 space-y-3">
            {myReviews.map((review) => (
              <li key={review.id} className="rounded-xl bg-stone-50 p-4">
                <div className="flex gap-3">
                  {review.productId && (
                    <Link
                      href={`/product/${review.productId}`}
                      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-200"
                    >
                      {review.productImage ? (
                        <SafeImage src={review.productImage} alt="" fill className="object-cover" sizes="56px" />
                      ) : null}
                    </Link>
                  )}
                  <div className="min-w-0 flex-1">
                    {review.productId ? (
                      <Link href={`/product/${review.productId}`} className="font-medium hover:underline">
                        {review.productTitle || "Товар"}
                      </Link>
                    ) : (
                      <p className="font-medium">{review.productTitle || "Товар"}</p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Stars value={review.rating} size="h-3.5 w-3.5" />
                      <span className="text-xs text-muted">{formatReviewDate(review.date)}</span>
                    </div>
                    <p className="mt-2 text-sm text-stone-700">{review.text}</p>
                    {review.sellerReply && (
                      <p className="mt-2 rounded-lg bg-paper px-3 py-2 text-sm">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                          Ответ продавца
                        </span>
                        <span className="mt-1 block">{review.sellerReply}</span>
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Вы ещё не оставляли отзывы.</p>
        )}
      </div>
    </section>
  );
}
