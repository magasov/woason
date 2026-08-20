"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categories } from "@/lib/data";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { FunnelDiagram } from "@/components/funnel-diagram";
import { SafeImage } from "@/components/safe-image";
import { SellerGoods } from "@/components/seller-goods";
import { isMediaSrc } from "@/lib/media";
import type { Order } from "@/lib/types";

export default function SellerPage() {
  const { user, catalog, orders } = useStore();
  const shop = user?.seller;
  const myProducts = catalog.filter((p) => shop && p.sellerId === shop.id);
  const myOrders = orders.filter((o) => shop && o.sellerId === shop.id);
  const productsByCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of myProducts) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return map;
  }, [myProducts]);

  if (!shop) return null;

  const fallbackLogo = `${shop.logo || ""}`;
  const fresh = myOrders.filter((o) => o.status === "placed" || o.status === "awaiting_shipment");
  const transit = myOrders.filter((o) => o.status === "in_transit" || o.status === "label_printed");
  const delivered = myOrders.filter((o) => o.status === "delivered");
  const cancelled = myOrders.filter((o) => o.status === "cancelled" || o.status === "refunded");
  const turnover = myOrders.filter((o) => o.status !== "cancelled" && o.status !== "refunded").reduce((s, o) => s + o.total, 0);
  const deliveredSum = delivered.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-2xl bg-ink text-white">
        <div className="relative h-40 md:h-52">
          {shop.banner ? (
            <SafeImage src={shop.banner} alt="" fill className="object-cover opacity-55" sizes="900px" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-ink to-ember" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">Кабинет продавца</p>
            <h1 className="mt-1 flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {isMediaSrc(shop.logo) ? (
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/10">
                  <SafeImage src={shop.logo} alt="" fill className="object-cover" sizes="40px" />
                </span>
              ) : fallbackLogo.length <= 3 && fallbackLogo ? (
                `${fallbackLogo} `
              ) : null}
              {shop.shopName}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/70">{shop.description || shop.city}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/seller/new" className="rounded-full bg-ember px-4 py-2 text-sm font-semibold">
                Добавить товар
              </Link>
              <Link href="/seller/reviews" className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/20">
                Отзывы
              </Link>
              <Link href={`/shop/${shop.id}`} className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/20">
                Открыть витрину
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SellerCharts
        products={myProducts.length}
        fresh={fresh.length}
        transit={transit.length}
        delivered={delivered.length}
        cancelled={cancelled.length}
        turnover={turnover}
        deliveredSum={deliveredSum}
        orders={myOrders}
        productsByCat={productsByCat}
      />

      <SellerGoods products={myProducts} />
    </div>
  );
}

function SellerCharts({
  products,
  fresh,
  transit,
  delivered,
  cancelled,
  turnover,
  deliveredSum,
  orders,
  productsByCat,
}: {
  products: number;
  fresh: number;
  transit: number;
  delivered: number;
  cancelled: number;
  turnover: number;
  deliveredSum: number;
  orders: Order[];
  productsByCat: Map<string, number>;
}) {
  const bars = useMemo(() => weekBars(orders), [orders]);
  const slices = [
    { label: "Новые", value: fresh, color: "#e2571b" },
    { label: "В пути", value: transit, color: "#f59e0b" },
    { label: "Доставлены", value: delivered, color: "#22c55e" },
    { label: "Отмены", value: cancelled, color: "#a8a29e" },
  ];
  const catRows = [...productsByCat.entries()]
    .map(([slug, count]) => ({ slug, count, name: categories.find((c) => c.slug === slug)?.name || slug }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const catMax = Math.max(...catRows.map((r) => r.count), 1);

  return (
    <section className="overflow-hidden rounded-2xl bg-ink p-5 text-white sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Аналитика</p>
          <h2 className="mt-1 text-xl font-bold">Схема продаж</h2>
        </div>
        <Link href="/seller/orders" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15">
          К заказам
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Kpi label="Товары" value={products} href="#goods" delay={0} />
        <Kpi label="Новые заказы" value={fresh} href="/seller/orders" delay={80} />
        <Kpi label="Оборот" value={turnover} href="/seller/orders" delay={160} money />
        <Kpi label="Выручка" value={deliveredSum} delay={240} money />
      </div>

      <FunnelDiagram
        title="Воронка продаж"
        steps={[
          { label: "Витрина", value: String(products), href: "/seller#goods", hint: "товары в зоне" },
          { label: "Заказ", value: String(fresh), href: "/seller/orders", hint: "ждут отправки" },
          { label: "Отправка", value: String(transit), href: "/seller/orders", hint: "уже в пути" },
          { label: "Выручка", value: formatPrice(deliveredSum), href: "/seller/orders", hint: "доставлено" },
        ]}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Оборот за 7 дней</p>
            <span className="text-xs text-white/45">по сумме заказов</span>
          </div>
          <div className="flex h-36 items-end gap-2">
            {bars.map((b, i) => (
              <div key={b.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end justify-center">
                  <div
                    className="bar-grow w-full max-w-9 rounded-t-lg bg-gradient-to-t from-ember to-orange-300"
                    style={{ height: `${Math.max(8, b.ratio * 100)}%`, animationDelay: `${i * 70}ms` }}
                  />
                </div>
                <span className="text-[10px] text-white/50">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="mb-3 text-sm font-semibold">Статусы заказов</p>
          <div className="flex items-center gap-4">
            <Donut parts={slices} />
            <ul className="min-w-0 space-y-1.5 text-xs">
              {slices.map((s) => (
                <li key={s.label} className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="text-white/70">{s.label}</span>
                  <b className="ml-auto">{s.value}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {catRows.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white/5 p-4">
          <p className="mb-3 text-sm font-semibold">Товары по категориям</p>
          <ul className="space-y-2">
            {catRows.map((row, i) => (
              <li key={row.slug} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate text-white/70">{row.name}</span>
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="bar-grow-x h-full rounded-full bg-ember"
                    style={{ width: `${(row.count / catMax) * 100}%`, animationDelay: `${i * 80}ms` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs text-white/55">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Donut({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = Math.max(
    parts.reduce((s, p) => s + p.value, 0),
    1,
  );
  const r = 38;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" className="h-32 w-32 shrink-0 -rotate-90" aria-hidden>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
      {parts.map((p) => {
        const len = (p.value / total) * c;
        const el = (
          <circle
            key={p.label}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={p.color}
            strokeWidth="12"
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
            className="ring-draw"
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

function Kpi({
  label,
  value,
  href,
  delay,
  money,
}: {
  label: string;
  value: number;
  href?: string;
  delay: number;
  money?: boolean;
}) {
  const n = useCountUp(value);
  const inner = (
    <div className="node-in rounded-2xl bg-white/8 px-4 py-3" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{money ? formatPrice(n) : n}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function useCountUp(target: number, duration = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const ease = 1 - (1 - k) ** 3;
      setN(Math.round(target * ease));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

function weekBars(orders: Order[]) {
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const sums = days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const sum = orders
      .filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= day.getTime() && t < next.getTime();
      })
      .reduce((s, o) => s + o.total, 0);
    return { label: day.toLocaleDateString("ru-RU", { weekday: "short" }).replace(".", ""), sum };
  });
  const max = Math.max(...sums.map((s) => s.sum), 1);
  return sums.map((s) => ({ ...s, ratio: s.sum / max }));
}
