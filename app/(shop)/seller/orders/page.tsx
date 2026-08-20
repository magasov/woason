"use client";

import Link from "next/link";
import { useState } from "react";
import { deliveryLabel, formatPrice, statusLabel } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { DeliveryMethod, Order } from "@/lib/types";

export default function SellerOrdersPage() {
  const { user, orders, shipOrder, advanceOrder } = useStore();
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  if (!user?.seller) {
    return (
      <div className="py-8 text-center">
        <Link href="/login" className="text-ember">
          Войдите как продавец
        </Link>
      </div>
    );
  }

  const mine = orders.filter((o) => o.sellerId === user.seller?.id || o.sellerId === user.id);

  async function printLabel(order: Order, method: DeliveryMethod) {
    await shipOrder(order.id, method);
    setPrintOrder({
      ...order,
      delivery: method,
      trackNumber: "формируется…",
      status: "label_printed",
    });
    setTimeout(() => window.print(), 50);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Отправки</h1>
      <p className="text-sm text-muted">Создайте заказ в СДЭК или Почте России, напечатайте этикетку и двигайте статус.</p>
      <ul className="mt-6 space-y-3">
        {mine.map((o) => (
          <li key={o.id} className="rounded-2xl bg-paper p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link href={`/orders/${o.id}`} className="font-semibold">
                  {o.id}
                </Link>
                <p className="text-sm text-zinc-500">
                  {statusLabel[o.status]} · {deliveryLabel[o.delivery]} · {o.city}
                </p>
                {o.trackNumber && <p className="text-sm">Трек: {o.trackNumber}</p>}
              </div>
              <b>{formatPrice(o.total)}</b>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => printLabel(o, "cdek")}
                className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-paper"
              >
                Этикетка СДЭК
              </button>
              <button
                type="button"
                onClick={() => printLabel(o, "pochta")}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white"
              >
                Этикетка Почты
              </button>
              <button
                type="button"
                onClick={() => void advanceOrder(o.id)}
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium"
              >
                Следующий статус
              </button>
            </div>
          </li>
        ))}
        {!mine.length && <p className="text-sm text-zinc-500">Заказов нет — дождитесь покупки из ленты.</p>}
      </ul>
      {printOrder && (
        <div className="print-label hidden print:block p-8">
          <p className="text-xs uppercase tracking-widest">WOAson · этикетка</p>
          <h2 className="mt-2 text-3xl font-black">{deliveryLabel[printOrder.delivery]}</h2>
          <p className="mt-4 text-lg">Заказ {printOrder.id}</p>
          <p>Куда: {printOrder.city}, {printOrder.address}</p>
          <p className="mt-6 font-mono text-2xl">{printOrder.trackNumber}</p>
          <p className="mt-8 text-sm">ВОАЗОН — всё в одной зоне</p>
        </div>
      )}
    </div>
  );
}
