"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useStore } from "@/lib/store";
import { AddressSuggest } from "./address-suggest";
import { Container } from "./container";
import { IconCart, IconChat, IconHeart, IconSearch, IconShorts, IconStore, IconUser } from "./icons";
import { Logo } from "./logo";

export function Header({
  onToggleCatalog,
  catalogOpen,
}: {
  onToggleCatalog: () => void;
  catalogOpen: boolean;
}) {
  const { user, cart, favorites, city, setCity, unreadCount } = useStore();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <header className="sticky top-0 z-40 overflow-visible border-b border-stone-200/80 bg-paper/90 backdrop-blur">
      <Container className="flex items-center gap-3 py-3 md:gap-4">
        <Logo />
        <button
          type="button"
          onClick={onToggleCatalog}
          aria-expanded={catalogOpen}
          aria-haspopup="dialog"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 text-sm font-semibold text-paper hover:bg-stone-800 md:px-4"
        >
          <GridIcon />
          <span className="hidden sm:inline">Каталог</span>
        </button>
        <form onSubmit={onSearch} className="flex min-w-0 flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти на WOAson"
            className="h-11 min-w-0 flex-1 rounded-l-full bg-stone-100 px-4 text-sm outline-none ring-1 ring-transparent placeholder:text-stone-400 focus:bg-white focus:ring-ink"
          />
          <button
            type="submit"
            className="grid h-11 w-12 place-items-center rounded-r-full bg-ink text-paper hover:bg-stone-800"
            aria-label="Найти"
          >
            <IconSearch />
          </button>
        </form>
        <label className="relative hidden min-w-0 max-w-[180px] text-xs text-muted lg:block">
          <span className="block text-[10px] uppercase tracking-wide">Город</span>
          <AddressSuggest
            kind="city"
            variant="header"
            value={city}
            onChange={setCity}
            placeholder={city ? undefined : "Определяем…"}
          />
        </label>
        <nav className="flex items-center gap-1 md:gap-2">
          <HeaderLink href="/reels" label="Шортс">
            <IconShorts />
          </HeaderLink>
          <HeaderLink href="/messages" label="Чат" badge={unreadCount || undefined} pulse={unreadCount > 0}>
            <IconChat />
          </HeaderLink>
          {user?.role === "seller" && (
            <HeaderLink href="/seller" label="Продавец">
              <IconStore />
            </HeaderLink>
          )}
          <HeaderLink href={user ? "/cabinet" : "/login"} label={user ? user.name.split(" ")[0] : "Войти"}>
            <IconUser />
          </HeaderLink>
          <HeaderLink href="/favorites" label="Избранное" badge={favorites.length || undefined}>
            <IconHeart />
          </HeaderLink>
          <HeaderLink href="/cart" label="Корзина" badge={cartCount || undefined}>
            <IconCart />
          </HeaderLink>
        </nav>
      </Container>
    </header>
  );
}

function HeaderLink({
  href,
  label,
  badge,
  pulse,
  children,
}: {
  href: string;
  label: string;
  badge?: number;
  pulse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative flex min-w-[52px] flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] text-stone-600 hover:bg-stone-100 hover:text-ink"
    >
      <span className="relative">
        {children}
        {badge ? (
          <span
            className={`absolute -right-2 -top-1 grid min-w-[16px] place-items-center rounded-full bg-ember px-1 text-[10px] font-bold text-white ${
              pulse ? "animate-pulse" : ""
            }`}
          >
            {badge}
          </span>
        ) : null}
      </span>
      <span className="hidden sm:block">{label}</span>
    </Link>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
