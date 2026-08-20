"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { FileDrop } from "./file-drop";
import { SafeImage } from "./safe-image";
import { Stars } from "./star-rating";
import { plural } from "@/lib/format";
import { formatReviewDate, ratingHistogram, type ReviewEligibility } from "@/lib/reviews";
import { useStore } from "@/lib/store";
import type { Review } from "@/lib/types";
import { uploadFiles } from "@/lib/upload";

export function ProductReviews({
  productId,
  rating,
  reviewsCount,
  reviews,
  eligibility,
}: {
  productId: string;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  eligibility: ReviewEligibility;
}) {
  const { loadProductReviews } = useStore();
  const [sort, setSort] = useState<"new" | "high" | "low">("new");
  const [filter, setFilter] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

  useEffect(() => {
    void loadProductReviews(productId, sort).catch(() => undefined);
  }, [productId, sort, loadProductReviews]);
  const bars = ratingHistogram(reviews);
  const visible = useMemo(() => {
    return reviews.filter((r) => (filter ? Math.round(r.rating) === filter : true));
  }, [reviews, filter]);

  return (
    <section id="reviews" className="scroll-mt-24 rounded-3xl bg-paper p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Отзывы</h2>
          <p className="mt-1 text-sm text-muted">
            {reviewsCount
              ? `${rating.toFixed(1)} · ${plural(reviewsCount, "оценка", "оценки", "оценок")}`
              : "Пока никто не оценил"}
          </p>
          <p className="mt-1 text-sm text-muted">Смотреть может любой. Написать — только получивший заказ.</p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="h-10 rounded-full bg-stone-100 px-3 text-sm outline-none"
        >
          <option value="new">Сначала новые</option>
          <option value="high">Высокая оценка</option>
          <option value="low">Низкая оценка</option>
        </select>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <div>
          <p className="text-4xl font-black tracking-tight">{reviewsCount ? rating.toFixed(1) : "—"}</p>
          <Stars value={rating} />
          <ul className="mt-4 space-y-1.5">
            {bars.map((b) => (
              <li key={b.star}>
                <button
                  type="button"
                  onClick={() => setFilter(filter === b.star ? 0 : (b.star as 1 | 2 | 3 | 4 | 5))}
                  className="flex w-full items-center gap-2 text-xs"
                >
                  <span className={`w-4 ${filter === b.star ? "font-bold text-ember" : "text-muted"}`}>{b.star}</span>
                  <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-stone-100">
                    <span
                      className="block h-full rounded-full bg-ember"
                      style={{ width: `${Math.round(b.ratio * 100)}%` }}
                    />
                  </span>
                  <span className="w-6 text-right text-muted">{b.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 space-y-4">
          <ReviewComposer productId={productId} eligibility={eligibility} />
          {visible.length ? (
            visible.map((review) => <ReviewCard key={review.id} review={review} />)
          ) : (
            <p className="rounded-2xl bg-stone-50 px-4 py-8 text-center text-sm text-muted">
              {filter ? "Нет отзывов с этой оценкой." : "Пока нет отзывов."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-2xl bg-stone-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">{review.author}</p>
          <p className="text-xs text-muted">{formatReviewDate(review.date)}</p>
        </div>
        <Stars value={review.rating} size="h-4 w-4" />
      </div>
      {review.text && <p className="mt-3 text-sm leading-6 text-stone-700">{review.text}</p>}
      {review.photos && review.photos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {review.photos.map((src) => (
            <span key={src} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-200">
              <SafeImage src={src} alt="" fill className="object-cover" sizes="80px" />
            </span>
          ))}
        </div>
      )}
      {review.sellerReply && (
        <div className="mt-3 rounded-xl bg-paper px-3 py-2.5 ring-1 ring-stone-200">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Ответ продавца</p>
          <p className="mt-1 text-sm text-stone-700">{review.sellerReply}</p>
        </div>
      )}
    </article>
  );
}

function ReviewComposer({
  productId,
  eligibility,
}: {
  productId: string;
  eligibility: ReviewEligibility;
}) {
  const { addReview } = useStore();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  if (eligibility.status === "owner") {
    return (
      <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-muted">
        Это ваш товар — покупатели оставят отзыв после доставки.
      </p>
    );
  }

  if (eligibility.status === "done") {
    return (
      <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Вы уже оценили этот товар. Спасибо за отзыв.
      </p>
    );
  }

  if (eligibility.status === "guest" || eligibility.status === "none") {
    return null;
  }

  if (eligibility.status === "pending" || eligibility.status === "in_transit") {
    return (
      <p className="rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-900">
        {eligibility.status === "in_transit"
          ? "Ваш заказ ещё в пути. Форма отзыва откроется после статуса «Доставлен». Отзывы ниже доступны всем."
          : "Заказ оформлен. Написать отзыв можно после получения. Читать отзывы ниже может любой."}{" "}
        <Link href={`/orders/${eligibility.orderId}`} className="font-semibold underline-offset-2 hover:underline">
          Смотреть заказ
        </Link>
      </p>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (eligibility.status !== "eligible") return;
    const body = text.trim();
    if (body.length < 8) {
      setNote("Напишите хотя бы пару слов — от 8 символов.");
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      const photos = files.length ? await uploadFiles(files, "review") : [];
      const err = await addReview({
        productId,
        orderId: eligibility.orderId,
        rating,
        text: body,
        photos,
      });
      if (err) setNote(err);
      else {
        setText("");
        setFiles([]);
        setRating(5);
      }
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Не удалось отправить");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="rounded-2xl bg-stone-50 p-4">
      <p className="font-semibold">Ваша оценка</p>
      <p className="mt-1 text-sm text-muted">Товар доставлен — можно оставить отзыв.</p>
      <div className="mt-3">
        <Stars value={rating} onChange={setRating} size="h-7 w-7" label="Оценка" />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Как товар, упаковка, доставка? Честный отзыв помогает другим."
        className="mt-3 w-full resize-none rounded-2xl bg-paper px-4 py-3 text-sm outline-none ring-1 ring-stone-200 focus:ring-ink"
      />
      <div className="mt-3">
        <FileDrop
          files={files}
          onChange={setFiles}
          max={4}
          label="Фото к отзыву"
          hint="До 4 снимков, по желанию."
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="h-11 rounded-xl bg-ink px-5 text-sm font-semibold text-paper disabled:opacity-60"
        >
          {busy ? "Отправляем…" : "Опубликовать"}
        </button>
        {note && <p className="text-sm text-ember">{note}</p>}
      </div>
    </form>
  );
}
