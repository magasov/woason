"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { SafeImage } from "./safe-image";
import { isMediaSrc } from "@/lib/media";
import { formatPrice } from "@/lib/format";

const NAV: { href: string; label: string; icon: IconName; match?: "exact" }[] = [
  { href: "/seller", label: "Дашборд", icon: "home", match: "exact" },
  { href: "/seller/new", label: "Новый товар", icon: "plus" },
  { href: "/seller/orders", label: "Заказы", icon: "box" },
  { href: "/seller/reviews", label: "Отзывы", icon: "star" },
  { href: "/seller/stories", label: "Сторис", icon: "story" },
  { href: "/seller/shorts", label: "Шортс", icon: "play" },
  { href: "/messages", label: "Чат", icon: "chat" },
  { href: "/seller/settings", label: "Настройки", icon: "gear" },
];

export function SellerShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user, logout, orders, catalog, unreadCount, sellerReviews } = useStore();
  const shop = user?.seller;

  if (!user) {
    return (
      <div className="py-16 text-center">
        <p>Войдите, чтобы открыть кабинет продавца.</p>
        <Link href="/login?next=/seller" className="mt-3 inline-block text-ember">
          Войти
        </Link>
      </div>
    );
  }

  if (user.role !== "seller" || !shop) {
    return (
      <div className="py-16 text-center">
        <p>Зарегистрируйте магазин бесплатно.</p>
        <Link href="/register" className="mt-3 inline-block text-ember">
          Продолжить
        </Link>
      </div>
    );
  }

  const myOrders = orders.filter((o) => o.sellerId === shop.id);
  const myProducts = catalog.filter((p) => p.sellerId === shop.id);
  const fresh = myOrders.filter((o) => o.status === "placed" || o.status === "awaiting_shipment").length;
  const unanswered = sellerReviews.filter((r) => !r.sellerReply).length;
  const turnover = myOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  const hideNav = path === "/seller/new";
  const fallbackLogo = `${shop.logo || ""}`;

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-6 lg:flex-row lg:items-start">
      {!hideNav && (
        <aside className="w-full min-w-0 max-w-full shrink-0 space-y-3 overflow-hidden lg:sticky lg:top-[calc(var(--header-h)-50px)] lg:self-start lg:overflow-visible lg:w-[300px] lg:max-w-[300px]">
        <div className="overflow-hidden rounded-2xl bg-paper">
          <div className="relative h-24 bg-ink">
            {shop.banner ? (
              <SafeImage src={shop.banner} alt="" fill className="object-cover opacity-80" sizes="300px" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-ink via-stone-800 to-ember" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <p className="absolute bottom-2 left-3 text-xs font-semibold text-white/90">Баннер витрины</p>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3">
              {isMediaSrc(shop.logo) ? (
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-stone-100">
                  <SafeImage src={shop.logo} alt="" fill className="object-cover" sizes="48px" />
                </span>
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-stone-100 text-2xl">
                  {fallbackLogo.length <= 3 && fallbackLogo ? fallbackLogo : "🏪"}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold leading-snug">{shop.shopName}</p>
                <p className="text-sm text-muted">{shop.city}</p>
              </div>
            </div>
            <div className="mt-3 flex items-start justify-between gap-3 text-sm">
              <span className="text-muted">Страница магазина</span>
              <Link href={`/shop/${shop.id}`} className="shrink-0 text-right text-ember">
                Открыть
                <span className="block text-[11px] text-muted">витрина</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-ember to-ember-dark p-4 text-white">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">WOAson Seller</p>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">0%</span>
          </div>
          <p className="mt-3 text-sm font-semibold leading-snug">Комиссия 0% на старте</p>
          <p className="mt-1 text-xs text-white/80">
            {myProducts.length} товаров · оборот {formatPrice(turnover)}
          </p>
        </div>

        <nav className="overflow-hidden rounded-2xl bg-paper py-2">
          {NAV.map((item) => {
            const active =
              item.match === "exact" ? path === item.href : path === item.href || path.startsWith(`${item.href}/`);
            const badge =
              item.href === "/seller/orders"
                ? fresh
                : item.href === "/messages"
                  ? unreadCount
                  : item.href === "/seller/reviews"
                    ? unanswered
                    : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-0 items-center gap-3 px-4 py-2.5 text-sm ${
                  active ? "bg-stone-100 font-semibold text-ink" : "text-stone-600 hover:bg-stone-50 hover:text-ink"
                }`}
              >
                <MenuIcon name={item.icon} />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {badge ? (
                  <span className="grid min-w-5 place-items-center rounded-full bg-ember px-1.5 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
          <Link
            href="/cabinet"
            className="flex min-w-0 items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-ink"
          >
            <MenuIcon name="user" />
            <span className="min-w-0 truncate">Кабинет покупателя</span>
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full min-w-0 items-center gap-3 px-4 py-2.5 text-left text-sm text-stone-600 hover:bg-stone-50 hover:text-ink"
          >
            <MenuIcon name="out" />
            <span className="min-w-0 truncate">Выйти</span>
          </button>
        </nav>
      </aside>
      )}
      <div className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}

type IconName = "home" | "plus" | "box" | "story" | "chat" | "play" | "gear" | "out" | "star" | "user";

function MenuIcon({ name }: { name: IconName }) {
  const common = "h-5 w-5 shrink-0";
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M4 11.5 12 5l8 6.5V20H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "box":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M4 8h16v11H4zM4 8l8 4 8-4M12 12v7" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "story":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M5 6h14v10H9l-4 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "play":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <rect x="7" y="3" width="10" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M10.6 9.2v5.6L15.4 12z" fill="currentColor" />
        </svg>
      );
    case "gear":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 4.5V3m0 18v-1.5M19.5 12H21M3 12h1.5m13-6.5.9-.9M4.6 19.4l.9-.9m0-12.8-.9-.9m14.8 14.6-.9-.9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path
            d="M12 4.2 14.2 9l5.3.5-4 3.5 1.2 5.2L12 15.6 7.3 18.2l1.2-5.2-4-3.5L9.8 9z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5 19.2c.8-3.2 3.4-5 7-5s6.2 1.8 7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "out":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M10 5H6v14h4M10 12h10M16 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
