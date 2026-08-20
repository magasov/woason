"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatPrice, plural } from "@/lib/format";
import type { Order, Product } from "@/lib/types";
import { FunnelDiagram } from "./funnel-diagram";
import { ProductGrid } from "./product-card";

type Props = {
  name: string;
  favoritesCount: number;
  purchasesCount: number;
  waitingReviews: number;
  cartCount: number;
  orders: Order[];
  recent: Product[];
  picks: Product[];
};

export function CabinetDashboard({
  name,
  favoritesCount,
  purchasesCount,
  waitingReviews,
  cartCount,
  orders,
  recent,
  picks,
}: Props) {
  const grid = "grid min-w-0 grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3";
  const inTransit = orders.filter((o) => o.status === "in_transit" || o.status === "label_printed").length;
  const spent = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const bars = useMemo(() => weekBars(orders), [orders]);

  return (
    <>
      <section className="overflow-hidden rounded-2xl bg-ink p-5 text-white sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Кабинет</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{hello(name)}</h1>
            <p className="mt-1 text-sm text-white/65">Схема покупок в одной зоне</p>
          </div>
          <Link href="/" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15">
            В каталог
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Kpi label="Избранное" value={favoritesCount} href="/cabinet?tab=favorites" delay={0} />
          <Kpi label="В корзине" value={cartCount} href="/cart" delay={80} />
          <Kpi label="Заказы" value={orders.length} href="/cabinet?tab=orders" delay={160} />
          <Kpi label="Потрачено" value={spent} href="/cabinet?tab=purchases" delay={240} money />
        </div>

        <FunnelDiagram
          title="Путь покупки"
          steps={[
            { label: "Избранное", value: String(favoritesCount), href: "/cabinet?tab=favorites", hint: "отложили" },
            { label: "Корзина", value: String(cartCount), href: "/cart", hint: "готовы купить" },
            { label: "Заказы", value: String(orders.length), href: "/cabinet?tab=orders", hint: "оформлено" },
            { label: "Доставка", value: String(inTransit), href: "/cabinet?tab=orders", hint: "уже в пути" },
          ]}
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Активность 7 дней</p>
              <span className="text-xs text-white/45">по сумме заказов</span>
            </div>
            <div className="flex h-28 items-end gap-2">
              {bars.map((b, i) => (
                <div key={b.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="flex h-20 w-full items-end justify-center">
                    <div
                      className="bar-grow w-full max-w-8 rounded-t-lg bg-gradient-to-t from-ember to-orange-300"
                      style={{
                        height: `${Math.max(8, b.ratio * 100)}%`,
                        animationDelay: `${i * 70}ms`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-white/50">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-1">
            <RingCard label="Оценки" value={waitingReviews} max={Math.max(waitingReviews, 4)} href="/cabinet?tab=reviews" />
            <RingCard label="Покупки" value={purchasesCount} max={Math.max(purchasesCount, 4)} href="/cabinet?tab=purchases" />
            <RingCard label="В пути" value={inTransit} max={Math.max(inTransit, 3)} href="/cabinet?tab=orders" />
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <QuickCard href="/cabinet?tab=favorites" title="Избранное" value={plural(favoritesCount, "товар", "товара", "товаров")} />
        <QuickCard href="/cabinet?tab=purchases" title="Покупки" value={purchasesCount ? "Смотреть" : "Пока пусто"} />
        <QuickCard
          href="/cabinet?tab=reviews"
          title="Ждут оценки"
          value={waitingReviews ? plural(waitingReviews, "товар", "товара", "товаров") : "Нет товаров"}
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Недавно смотрели</h2>
          <Link href="/" className="rounded-full bg-paper px-3 py-1 text-xs font-medium">
            Все
          </Link>
        </div>
        <ProductGrid items={recent} className={grid} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Подобрали для вас</h2>
        <ProductGrid items={picks} className={grid} />
      </section>
    </>
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
  href: string;
  delay: number;
  money?: boolean;
}) {
  const n = useCountUp(value);
  return (
    <Link
      href={href}
      className="node-in rounded-2xl bg-white/8 px-4 py-3 hover:bg-white/12"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{money ? formatPrice(n) : n}</p>
    </Link>
  );
}

function RingCard({ label, value, max, href }: { label: string; value: number; max: number; href: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3 hover:bg-white/10">
      <svg viewBox="0 0 36 36" className="h-12 w-12 shrink-0 -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="#e2571b"
          strokeWidth="4"
          strokeLinecap="round"
          className="ring-draw"
          strokeDasharray="88"
          strokeDashoffset={88 - (88 * pct) / 100}
        />
      </svg>
      <span>
        <span className="block text-sm font-semibold">{value}</span>
        <span className="text-xs text-white/50">{label}</span>
      </span>
    </Link>
  );
}

function QuickCard({ href, title, value }: { href: string; title: string; value: string }) {
  return (
    <Link href={href} className="rounded-2xl bg-paper p-4 hover:ring-1 hover:ring-ink">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted">{value}</p>
    </Link>
  );
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

function hello(name: string) {
  const first = name.split(" ")[0] || "друг";
  return `Привет, ${first}`;
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
    return {
      label: day.toLocaleDateString("ru-RU", { weekday: "short" }).replace(".", ""),
      sum,
    };
  });
  const max = Math.max(...sums.map((s) => s.sum), 1);
  return sums.map((s) => ({ ...s, ratio: s.sum / max }));
}
