"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/safe-image";
import { deliveryLabel, formatPrice, statusLabel } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { orders, user, loadOrder, pendingReviews, loadPendingReviews } = useStore();
  const order = orders.find((o) => o.id === id);

  useEffect(() => {
    void loadOrder(id).catch(() => undefined);
    void loadPendingReviews().catch(() => undefined);
  }, [id, loadOrder, loadPendingReviews]);

  if (!order) {
    return (
      <div className="py-8 text-center">
        Заказ не найден. <Link href="/" className="text-ember">На главную</Link>
      </div>
    );
  }

  const steps = ["awaiting_payment", "awaiting_shipment", "label_printed", "in_transit", "delivered"] as const;
  const mapped =
    order.status === "paid" || order.status === "placed" ? "awaiting_shipment" : order.status;
  const idx = Math.max(
    0,
    steps.findIndex((s) => s === mapped),
  );

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-sm text-muted">Заказ {order.id}</p>
      <h1 className="mt-1 text-2xl font-bold">{statusLabel[order.status]}</h1>
      <div className="mt-4 flex gap-1">
        {steps.map((s, i) => (
          <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-ink" : "bg-stone-200"}`} />
        ))}
      </div>
      <div className="mt-6 space-y-2 rounded-2xl bg-paper p-4 text-sm">
        <p>Доставка: {deliveryLabel[order.delivery]} · {order.eta}</p>
        <p>Город: {order.city}</p>
        <p>Адрес: {order.address}</p>
        <p>
          Трек-номер:{" "}
          <b>{order.trackNumber || "появится после отправки продавцом"}</b>
        </p>
        <p className="pt-2 text-base font-bold">Итого {formatPrice(order.total)}</p>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {order.items.map((i) => (
          <li key={i.productId} className="flex items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3">
            <Link href={`/product/${i.productId}`} className="flex min-w-0 items-center gap-3">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-200">
                <SafeImage src={i.image} alt="" fill className="object-cover" sizes="48px" />
              </span>
              <span className="min-w-0 truncate hover:underline">{i.title}</span>
            </Link>
            <span className="shrink-0">
              {i.qty} × {formatPrice(i.price)}
            </span>
          </li>
        ))}
      </ul>
      {user && order.buyerId === user.id && order.status === "delivered" && (
        <ReviewCta items={pendingReviews.filter((row) => row.orderId === order.id)} />
      )}
      {user?.role === "seller" && (
        <Link href="/seller/orders" className="mt-6 inline-block text-sm text-ember">
          К отправкам →
        </Link>
      )}
    </div>
  );
}

function ReviewCta({
  items,
}: {
  items: { productId: string; title: string }[];
}) {
  if (!items.length) {
    return (
      <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Все товары из этого заказа уже оценены. Спасибо.
      </p>
    );
  }
  return (
    <div className="mt-5 rounded-2xl bg-orange-50 p-4">
      <p className="font-semibold text-orange-950">Заказ доставлен — можно оставить отзыв</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.productId}>
            <Link
              href={`/product/${item.productId}#reviews`}
              className="block rounded-xl bg-white px-3 py-2 text-sm font-medium hover:ring-1 hover:ring-ink"
            >
              Оценить: {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
