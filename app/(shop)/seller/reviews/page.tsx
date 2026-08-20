"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SafeImage } from "@/components/safe-image";
import { Stars } from "@/components/star-rating";
import { formatPrice } from "@/lib/format";
import { avgRating, formatReviewDate } from "@/lib/reviews";
import { useStore } from "@/lib/store";

export default function SellerReviewsPage() {
  const { user, sellerReviews, findProduct, replyToReview, loadSellerReviews } = useStore();
  const shop = user?.seller;
  const [filter, setFilter] = useState<"all" | "open" | "replied">("all");
  const [star, setStar] = useState(0);

  useEffect(() => {
    void loadSellerReviews().catch(() => undefined);
  }, [loadSellerReviews]);

  const rows = useMemo(() => {
    return sellerReviews.map((review) => {
      const product = review.productId ? findProduct(review.productId) : undefined;
      return {
        review,
        productId: review.productId || product?.id || "",
        title: review.productTitle || product?.title || "Товар",
        image: review.productImage || product?.image || "",
        price: product?.price,
      };
    });
  }, [sellerReviews, findProduct]);

  const visible = rows.filter((row) => {
    if (star && Math.round(row.review.rating) !== star) return false;
    if (filter === "open") return !row.review.sellerReply;
    if (filter === "replied") return Boolean(row.review.sellerReply);
    return true;
  });

  const unanswered = rows.filter((r) => !r.review.sellerReply).length;
  const avg = avgRating(
    rows.map((r) => r.review),
    0,
  );

  if (!shop) return null;

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl bg-ink p-5 text-white sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Кабинет продавца</p>
        <h1 className="mt-1 text-2xl font-bold">Отзывы на товары</h1>
        <p className="mt-1 text-sm text-white/65">Отвечайте покупателям — ответы видны на карточке товара.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat label="Отзывы" value={String(rows.length)} />
          <Stat label="Средняя" value={rows.length ? avg.toFixed(1) : "—"} />
          <Stat label="Без ответа" value={String(unanswered)} />
        </div>
      </section>

      <section className="rounded-2xl bg-paper p-5">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Все"],
              ["open", "Без ответа"],
              ["replied", "С ответом"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                filter === id ? "bg-ink text-paper" : "bg-stone-100 text-stone-700"
              }`}
            >
              {label}
            </button>
          ))}
          <select
            value={star}
            onChange={(e) => setStar(Number(e.target.value))}
            className="ml-auto h-9 rounded-full bg-stone-100 px-3 text-sm outline-none"
          >
            <option value={0}>Любая оценка</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} ★
              </option>
            ))}
          </select>
        </div>

        <ul className="mt-5 space-y-3">
          {visible.map(({ review, productId, title, image, price }) => (
            <li key={review.id} className="rounded-2xl bg-stone-50 p-4">
              <div className="flex gap-3">
                <Link
                  href={productId ? `/product/${productId}` : "/seller"}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-200"
                >
                  {image ? <SafeImage src={image} alt="" fill className="object-cover" sizes="64px" /> : null}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        href={productId ? `/product/${productId}` : "/seller"}
                        className="font-semibold hover:underline"
                      >
                        {title}
                      </Link>
                      <p className="text-sm text-muted">
                        {review.author} · {formatReviewDate(review.date)}
                        {price != null ? ` · ${formatPrice(price)}` : ""}
                      </p>
                    </div>
                    <Stars value={review.rating} size="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-700">{review.text}</p>
                  {review.sellerReply ? (
                    <p className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Ваш ответ</span>
                      <span className="mt-1 block">{review.sellerReply}</span>
                    </p>
                  ) : (
                    <ReplyForm
                      onSend={async (text) => replyToReview(review.id, productId, text)}
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
          {!visible.length && (
            <p className="py-8 text-center text-sm text-muted">
              {rows.length
                ? "Нет отзывов с таким фильтром."
                : "Отзывов пока нет. Когда покупатель получит заказ, оценка появится здесь."}
            </p>
          )}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/8 px-4 py-3">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function ReplyForm({ onSend }: { onSend: (text: string) => Promise<string | null> }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (body.length < 2) return;
    setBusy(true);
    setNote(null);
    const err = await onSend(body);
    if (err) setNote(err);
    else setText("");
    setBusy(false);
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-3 flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Ответить покупателю"
        className="w-full resize-none rounded-xl bg-paper px-3 py-2 text-sm outline-none ring-1 ring-stone-200 focus:ring-ink"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy || text.trim().length < 2}
          className="h-9 rounded-xl bg-ink px-4 text-sm font-semibold text-paper disabled:opacity-50"
        >
          {busy ? "Отправляем…" : "Ответить"}
        </button>
        {note && <p className="text-sm text-ember">{note}</p>}
      </div>
    </form>
  );
}
