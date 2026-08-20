"use client";

import { AddressSuggest } from "@/components/address-suggest";
import { CdekSuggest } from "@/components/cdek-suggest";
import { SafeImage } from "@/components/safe-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { calculateCdek, loadCdekOffices, type CdekOfficeOption, type CdekQuote } from "@/lib/cdek";
import { quoteDelivery } from "@/lib/delivery";
import { deliveryLabel, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { DeliveryMethod } from "@/lib/types";

export default function CheckoutPage() {
  const { cart, findProduct, city, address: savedAddress, setAddress: persistAddress, user, placeOrder } = useStore();
  const router = useRouter();
  const [address, setAddress] = useState(savedAddress);
  const [delivery, setDelivery] = useState<DeliveryMethod>("cdek");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cdekQuote, setCdekQuote] = useState<CdekQuote | null>(null);
  const [offices, setOffices] = useState<CdekOfficeOption[]>([]);
  const [officeCode, setOfficeCode] = useState("");
  const [cdekCity, setCdekCity] = useState(city);
  const [cdekQuery, setCdekQuery] = useState("");

  useEffect(() => {
    if (savedAddress && !address) setAddress(savedAddress);
  }, [savedAddress, address]);

  useEffect(() => {
    if (city && !cdekCity) setCdekCity(city);
  }, [city, cdekCity]);

  const rows = cart
    .map((c) => {
      const product = c.product || findProduct(c.productId);
      return product ? { ...c, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const methods = useMemo(() => {
    const all = new Set<DeliveryMethod>();
    rows.forEach((r) => r.product.delivery.forEach((m) => all.add(m)));
    return Array.from(all);
  }, [rows]);

  const weight = rows.reduce((s, r) => s + r.product.weightKg * r.qty, 0);
  const goods = rows.reduce((s, r) => s + r.product.price * r.qty, 0);
  const fromCity = rows[0]?.product.city || "Москва";
  const destCity = cdekCity || city;
  const localQuote = quoteDelivery(delivery, destCity, weight);
  const quote =
    delivery === "cdek" && cdekQuote?.price != null
      ? { price: cdekQuote.price, eta: cdekQuote.eta || localQuote.eta }
      : localQuote;

  useEffect(() => {
    if (!methods.includes("cdek") || !destCity) return;
    let cancelled = false;
    void calculateCdek(fromCity, destCity, weight).then((q) => {
      if (!cancelled) setCdekQuote(q);
    });
    void loadCdekOffices(destCity).then((list) => {
      if (!cancelled) setOffices(list);
    });
    return () => {
      cancelled = true;
    };
  }, [fromCity, destCity, weight, methods]);

  function quoteFor(method: DeliveryMethod) {
    if (method === "cdek" && cdekQuote?.price != null) {
      return { price: cdekQuote.price, eta: cdekQuote.eta || localQuote.eta };
    }
    return quoteDelivery(method, destCity, weight);
  }

  function pickOffice(o: CdekOfficeOption) {
    setOfficeCode(o.code);
    if (o.city) setCdekCity(o.city);
    const line = o.address || o.name;
    setAddress(line);
    persistAddress(line);
    setCdekQuery(o.name);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login?next=/checkout");
      return;
    }
    if (delivery === "cdek" && !officeCode && !address.trim()) return;
    if (delivery === "pochta" && !address.trim()) return;
    setBusy(true);
    setError(null);
    const result = await placeOrder({
      address: address.trim() || `Самовывоз, ${destCity}`,
      delivery,
    });
    setBusy(false);
    if (typeof result === "string") {
      setError(result);
      return;
    }
    if (result.confirmationUrl) {
      window.location.href = result.confirmationUrl;
      return;
    }
    router.push(`/orders/${result.order.id}`);
  }

  if (!rows.length) {
    return (
      <div className="py-8 text-center">
        Корзина пуста. <Link href="/" className="text-ember">В ленту</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-2xl font-bold">Оформление</h1>
        <div className="rounded-2xl bg-paper p-4">
          <p className="font-semibold">Доставка в {destCity || "…"}</p>
          <div className="mt-3 space-y-2">
            {methods.map((m) => {
              const q = quoteFor(m);
              return (
                <label key={m} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-3 text-sm">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="delivery"
                      checked={delivery === m}
                      onChange={() => setDelivery(m)}
                    />
                    {deliveryLabel[m]} · {q.eta}
                  </span>
                  <b>{q.price ? formatPrice(q.price) : "0 ₽"}</b>
                </label>
              );
            })}
          </div>

          {delivery === "cdek" && (
            <>
              <CdekSuggest
                className="mt-3"
                required
                value={cdekQuery}
                placeholder="Город или пункт выдачи СДЭК"
                onChange={setCdekQuery}
                onPickCity={(c) => {
                  setCdekCity(c.city);
                  setOfficeCode("");
                  setAddress("");
                }}
                onPickOffice={pickOffice}
              />
              {offices.length > 0 && (
                <div className="mt-3 max-h-56 overflow-auto rounded-xl bg-zinc-50 p-2">
                  <p className="px-1 pb-1 text-xs text-muted">Пункт выдачи СДЭК</p>
                  {offices.map((o) => (
                    <label key={o.code} className="flex cursor-pointer gap-2 rounded-lg px-2 py-2 text-sm hover:bg-white">
                      <input
                        type="radio"
                        name="cdek-office"
                        checked={officeCode === o.code}
                        onChange={() => pickOffice(o)}
                      />
                      <span className="min-w-0">
                        <span className="block font-medium">{o.name}</span>
                        <span className="block text-xs text-muted">{o.address}</span>
                        {o.workTime ? <span className="block text-xs text-muted">{o.workTime}</span> : null}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </>
          )}

          {delivery === "pochta" && (
            <AddressSuggest
              required
              kind="address"
              cityBoost={city}
              value={address}
              onChange={(next) => {
                setAddress(next);
                persistAddress(next);
              }}
              placeholder="Адрес для Почты России"
              className="mt-3"
            />
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="h-12 w-full rounded-xl bg-ink font-semibold text-paper">
          {busy ? "Оформляем…" : `Оплатить ${formatPrice(goods + quote.price)}`}
        </button>
        {!user && <p className="text-sm text-zinc-500">Для заказа войдите или зарегистрируйтесь.</p>}
      </form>
      <aside className="h-fit rounded-2xl bg-paper p-4">
        <p className="font-semibold">Состав</p>
        <ul className="mt-3 space-y-3">
          {rows.map(({ product, qty }) => (
            <li key={product.id} className="flex gap-2 text-sm">
              <span className="relative h-12 w-10 overflow-hidden rounded-md">
                <SafeImage src={product.image} alt="" fill className="object-cover" sizes="40px" />
              </span>
              <span className="min-w-0 flex-1 line-clamp-2">{product.title}</span>
              <span className="font-medium">×{qty}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-zinc-100 pt-3 text-sm">
          <p className="flex justify-between"><span>Товары</span><b>{formatPrice(goods)}</b></p>
          <p className="flex justify-between"><span>Доставка</span><b>{formatPrice(quote.price)}</b></p>
          <p className="flex justify-between text-base"><span>Итого</span><b>{formatPrice(goods + quote.price)}</b></p>
        </div>
      </aside>
    </div>
  );
}
