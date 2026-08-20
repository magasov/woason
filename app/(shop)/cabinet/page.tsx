"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AddressSuggest } from "@/components/address-suggest";
import { CabinetDashboard } from "@/components/cabinet-dashboard";
import { CabinetReviews } from "@/components/cabinet-reviews";
import { FileDrop } from "@/components/file-drop";
import { FunnelDiagram } from "@/components/funnel-diagram";
import { ProductGrid } from "@/components/product-card";
import { formatPrice, statusLabel } from "@/lib/format";
import { useStore } from "@/lib/store";
import { uploadFiles } from "@/lib/upload";

const NAV: { tab: string; label: string; icon: IconName }[] = [
  { tab: "home", label: "Главная", icon: "home" },
  { tab: "orders", label: "Заказы", icon: "box" },
  { tab: "purchases", label: "Покупки", icon: "bag" },
  { tab: "favorites", label: "Избранное", icon: "heart" },
  { tab: "reviews", label: "Отзывы и вопросы", icon: "chat" },
  { tab: "returns", label: "Возвраты", icon: "undo" },
  { tab: "pay", label: "Способы оплаты", icon: "card" },
  { tab: "requisites", label: "Реквизиты", icon: "doc" },
  { tab: "finance", label: "Финансы", icon: "wallet" },
  { tab: "resale", label: "Ресейл", icon: "refresh" },
  { tab: "profile", label: "Личные данные", icon: "id" },
  { tab: "devices", label: "Ваши устройства", icon: "phone" },
  { tab: "support", label: "Поддержка", icon: "help" },
  { tab: "settings", label: "Настройки", icon: "gear" },
];

export default function CabinetPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Загрузка…</p>}>
      <CabinetInner />
    </Suspense>
  );
}

function CabinetInner() {
  const params = useSearchParams();
  const tab = params.get("tab") || "home";
  const { user, orders, favoriteProducts, catalog, cart, logout, ready, city, address, setAddress, pendingReviews } = useStore();
  const mine = orders.filter((o) => o.buyerId === user?.id);
  const delivered = mine.filter((o) => o.status === "delivered");
  const waitingReviews = pendingReviews.length;
  const recent = catalog.slice(0, 12);
  const picks = catalog.filter((p) => p.oldPrice && p.oldPrice > p.price).slice(0, 16);

  if (!ready) {
    return <p className="text-sm text-muted">Загрузка…</p>;
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <p>Нужно войти.</p>
        <Link href="/login" className="mt-3 inline-block text-ember">
          Войти
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full min-w-0 max-w-full shrink-0 space-y-3 overflow-hidden lg:sticky lg:top-[calc(var(--header-h)-50px)] lg:self-start lg:overflow-visible lg:w-[300px] lg:max-w-[300px]">
        <div className="rounded-2xl bg-paper p-4">
          <Link href="/cabinet?tab=profile" className="flex items-start gap-2">
            <PinIcon />
            <span className="min-w-0 break-words text-sm font-semibold leading-snug">
              {address || city || "Укажите адрес"}
            </span>
          </Link>
          <div className="mt-3 flex items-start justify-between gap-3 text-sm">
            <span className="text-muted">Ваши данные</span>
            <Link href="/cabinet?tab=profile" className="shrink-0 text-right text-ember">
              Управлять
              <span className="block text-[11px] text-muted">в WOAson ID</span>
            </Link>
          </div>
        </div>

        <Link
          href="/cabinet?tab=finance"
          className="block rounded-2xl bg-gradient-to-br from-ember to-ember-dark p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">WOAson Club</p>
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-white/20 px-1.5 text-xs font-bold">
              3
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold leading-snug">Персональная скидка до 40%</p>
          <p className="mt-1 text-xs text-white/80">Оплата при получении до 84 900 ₽</p>
        </Link>

        <nav className="overflow-hidden rounded-2xl bg-paper py-2">
          {NAV.map((item) => {
            const active = tab === item.tab;
            return (
              <Link
                key={item.tab}
                href={item.tab === "home" ? "/cabinet" : `/cabinet?tab=${item.tab}`}
                className={`flex min-w-0 items-center gap-3 px-4 py-2.5 text-sm ${
                  active ? "bg-stone-100 font-semibold text-ink" : "text-stone-600 hover:bg-stone-50 hover:text-ink"
                }`}
              >
                <MenuIcon name={item.icon} />
                <span className="min-w-0 truncate">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href={user.role === "seller" ? "/seller" : "/register"}
            className="flex min-w-0 items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-ink"
          >
            <MenuIcon name="briefcase" />
            <span className="min-w-0 truncate">Покупайте как бизнес</span>
          </Link>
        </nav>
      </aside>

      <div className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden space-y-4">
        {tab === "home" && (
          <CabinetDashboard
            name={user.name}
            favoritesCount={favoriteProducts.length}
            purchasesCount={delivered.length}
            waitingReviews={waitingReviews}
            cartCount={cart.reduce((s, i) => s + i.qty, 0)}
            orders={mine}
            recent={recent}
            picks={picks}
          />
        )}
        {tab === "orders" && <OrdersPane orders={mine} />}
        {tab === "purchases" && <OrdersPane orders={delivered} empty="Покупок пока нет." />}
        {tab === "favorites" && (
          <Section title="Избранное">
            {favoriteProducts.length ? (
              <ProductGrid
                items={favoriteProducts}
                className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3"
              />
            ) : (
              <Empty text="Пока пусто. Добавляйте товары сердцем на карточке." />
            )}
          </Section>
        )}
        {tab === "reviews" && <CabinetReviews />}
        {tab === "returns" && (
          <Section title="Возвраты">
            <Empty text="Возвратов нет." />
          </Section>
        )}
        {tab === "pay" && (
          <Section title="Способы оплаты">
            <p className="text-sm text-muted">Оплата при получении и карта. Способ выбирается при оформлении.</p>
          </Section>
        )}
        {tab === "requisites" && (
          <Section title="Реквизиты">
            <dl className="space-y-2 text-sm">
              <Row k="Имя" v={user.name} />
              <Row k="Email" v={user.email} />
              <Row k="Телефон" v={user.phone} />
            </dl>
          </Section>
        )}
        {tab === "finance" && (
          <Section title="Финансы">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold tracking-tight">{formatPrice(0)}</p>
                <p className="mt-1 text-sm text-muted">Кошелёк</p>
              </div>
              <button type="button" className="h-10 rounded-xl bg-ink px-4 text-sm font-semibold text-paper">
                Пополнить
              </button>
            </div>
          </Section>
        )}
        {tab === "resale" && (
          <Section title="Ресейл">
            <Empty text="Выкуп и перепродажа — в следующей версии." />
          </Section>
        )}
        {tab === "profile" && (
          <Section title="Личные данные в WOAson ID">
            <ProfileScheme
              name={user.name}
              orders={mine.length}
              favorites={favoriteProducts.length}
              cart={cart.reduce((s, i) => s + i.qty, 0)}
            />
            <ProfileAvatar />
            <dl className="mt-4 space-y-2 text-sm">
              <Row k="Имя" v={user.name} />
              <Row k="Email" v={user.email} />
              <Row k="Телефон" v={user.phone} />
              <Row k="Город" v={city || "—"} />
            </dl>
            <p className="mt-4 mb-2 text-sm font-medium">Адрес доставки</p>
            <AddressSuggest
              kind="address"
              cityBoost={city}
              value={address}
              onChange={setAddress}
              placeholder="Город, улица, дом, квартира"
            />
          </Section>
        )}
        {tab === "devices" && (
          <Section title="Ваши устройства">
            <Empty text="Список устройств появится после входов с других браузеров." />
          </Section>
        )}
        {tab === "support" && (
          <Section title="Поддержка">
            <p className="text-sm text-muted">Напишите продавцу или в чат — ответим в рабочее время.</p>
            <Link href="/messages" className="mt-3 inline-block rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper">
              Открыть сообщения
            </Link>
          </Section>
        )}
        {tab === "settings" && (
          <Section title="Настройки">
            <p className="text-sm text-muted">
              {user.name} · {user.email}
            </p>
            {user.role === "seller" && (
              <Link href="/seller" className="mt-3 inline-block rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper">
                Кабинет продавца
              </Link>
            )}
            <button type="button" onClick={logout} className="mt-3 block text-sm text-muted hover:text-ink">
              Выйти
            </button>
          </Section>
        )}
      </div>
    </div>
  );
}

function ProfileAvatar() {
  const { user, updateProfile } = useStore();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function save() {
    if (!files[0]) return;
    setBusy(true);
    setNote(null);
    try {
      const [url] = await uploadFiles(files, "avatar");
      if (url) {
        await updateProfile({ avatar: url });
        setFiles([]);
        setNote("Аватар сохранён");
      }
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Не удалось загрузить");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <FileDrop
        files={files}
        onChange={setFiles}
        max={1}
        variant="avatar"
        existingUrl={user?.avatar}
        label="Аватар"
        hint="Перетащите фото или нажмите. До 10 МБ."
      />
      {files.length > 0 && (
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="h-10 rounded-xl bg-ink px-4 text-sm font-semibold text-paper disabled:opacity-60"
        >
          {busy ? "Сохраняем…" : "Сохранить аватар"}
        </button>
      )}
      {note && <p className="text-sm text-ember">{note}</p>}
    </div>
  );
}

function OrdersPane({
  orders,
  empty = "Заказов пока нет.",
}: {
  orders: { id: string; status: keyof typeof statusLabel; total: number }[];
  empty?: string;
}) {
  return (
    <Section title="Заказы">
      {orders.length ? (
        <ul className="space-y-2">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="flex min-w-0 justify-between gap-3 rounded-xl bg-stone-50 px-4 py-3 text-sm">
                <span className="min-w-0 truncate">
                  {o.id} · {statusLabel[o.status]}
                </span>
                <b className="shrink-0">{formatPrice(o.total)}</b>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty text={empty} />
      )}
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 max-w-full overflow-visible rounded-2xl bg-paper p-5">
      <h1 className="mb-4 text-xl font-bold">{title}</h1>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted">{text}</p>;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex min-w-0 justify-between gap-4 rounded-xl bg-stone-50 px-3 py-2">
      <dt className="shrink-0 text-muted">{k}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{v}</dd>
    </div>
  );
}

function ProfileScheme({
  name,
  orders,
  favorites,
  cart,
}: {
  name: string;
  orders: number;
  favorites: number;
  cart: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-ink p-4 text-white sm:p-5">
      <FunnelDiagram
        className=""
        title="Путь в кабинете"
        steps={[
          { label: "Профиль", value: name.split(" ")[0] || "вы", href: "/cabinet?tab=profile", hint: "WOAson ID", lit: true },
          { label: "Избранное", value: String(favorites), href: "/cabinet?tab=favorites", hint: "отложили" },
          { label: "Корзина", value: String(cart), href: "/cart", hint: "к покупке" },
          { label: "Заказы", value: String(orders), href: "/cabinet?tab=orders", hint: "оформлено" },
        ]}
      />
    </div>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-ember" fill="none" aria-hidden>
      <path
        d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

type IconName =
  | "home"
  | "box"
  | "bag"
  | "heart"
  | "chat"
  | "undo"
  | "card"
  | "doc"
  | "wallet"
  | "refresh"
  | "id"
  | "phone"
  | "help"
  | "gear"
  | "briefcase";

function MenuIcon({ name }: { name: IconName }) {
  const common = "h-5 w-5 shrink-0";
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M4 11.5 12 5l8 6.5V20H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "box":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M4 8h16v11H4zM4 8l8 4 8-4M12 12v7" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "bag":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path
            d="M12 20s-6.5-4.2-9-7.5C1 9.8 1.6 6.2 4.6 4.8 6.7 3.8 9 4.4 12 6.8c3-2.4 5.3-3 7.4-2 3 1.4 3.6 5 1.6 7.7C18.5 15.8 12 20 12 20z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M5 6h14v10H9l-4 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "undo":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M8 7H4v4M4 8a8 8 0 1 1-1 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "card":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M7 4h8l4 4v12H7zM15 4v4h4" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "wallet":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M4 7h16v12H4zM4 7V6a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="16" cy="13" r="1" fill="currentColor" />
        </svg>
      );
    case "refresh":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M20 12a8 8 0 1 1-2.3-5.7M20 5v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "id":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5 19c1-3 3.5-5 7-5s6 2 7 5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M11 18h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "help":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.7.3-1.2.8-1.2 1.6V14" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="17" r=".8" fill="currentColor" />
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
    case "briefcase":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 8V6h6v2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
  }
}
