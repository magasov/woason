"use client";

import { AddressSuggest } from "@/components/address-suggest";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { DeliveryMethod, UserRole } from "@/lib/types";

const sellerSteps = ["Контакты", "Магазин", "Доставка"];

export default function RegisterPage() {
  const { register, user, city: detectedCity } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<UserRole>("seller");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMethod[]>(["cdek", "pochta"]);
  const [city, setCity] = useState(detectedCity);
  const [error, setError] = useState<string | null>(null);

  const bars = role === "seller" ? sellerSteps : ["Контакты"];
  const lastFormStep = role === "seller" ? 2 : 0;

  useEffect(() => {
    if (detectedCity && !city) setCity(detectedCity);
  }, [detectedCity, city]);

  function toggleDelivery(method: DeliveryMethod) {
    setDelivery((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method],
    );
  }

  async function next(e: FormEvent) {
    e.preventDefault();
    if (step === 0) {
      if (!name || !email || !phone || password.length < 4) {
        setError("Заполните имя, email, телефон и пароль");
        return;
      }
      setError(null);
      if (role === "buyer") {
        await finish();
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!shopName) {
        setError("Укажите название магазина");
        return;
      }
      setError(null);
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!delivery.length) {
        setError("Выберите хотя бы один способ доставки");
        return;
      }
      await finish();
    }
  }

  async function finish() {
    const err = await register({
      name,
      email,
      phone,
      password,
      role,
      shopName,
      shopDescription,
      delivery,
      city: city.trim() || detectedCity,
    });
    if (err) {
      setError(err);
      setStep(0);
      return;
    }
    setError(null);
    setStep(3);
  }

  if (user && step === 3) {
    return (
      <div className="mx-auto flex h-full min-h-[50vh] max-w-md flex-col justify-center py-8 text-center">
        <p className="text-4xl">🎉</p>
        <h1 className="mt-3 text-2xl font-bold">Добро пожаловать в ВОАЗОН</h1>
        <p className="mt-2 text-muted">
          {user.role === "seller"
            ? "Магазин создан. Формат — розница, опт или дропшиппинг — выбираете при публикации каждого товара."
            : "Можно собирать корзину из магазинов и частных объявлений."}
        </p>
        <button
          type="button"
          onClick={() => router.push(user.role === "seller" ? "/seller" : "/")}
          className="mt-6 h-11 rounded-xl bg-ink px-6 font-semibold text-paper"
        >
          {user.role === "seller" ? "В кабинет" : "В ленту"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full min-h-full max-w-lg flex-col">
      <p className="text-sm font-medium text-ember">Бесплатная регистрация</p>
      <h1 className="mt-1 text-2xl font-bold">Стать частью WOAson</h1>
      <div className="mt-4 flex gap-2">
        {bars.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-ink" : "bg-stone-200"}`}
            title={s}
          />
        ))}
      </div>
      <form onSubmit={next} className="mt-6 space-y-3 rounded-2xl bg-paper p-5">
        {step === 0 && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <RoleChip active={role === "seller"} onClick={() => setRole("seller")}>
                Я продавец
              </RoleChip>
              <RoleChip active={role === "buyer"} onClick={() => setRole("buyer")}>
                Я покупатель
              </RoleChip>
            </div>
            <input className="field" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="field" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="field" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="field" placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </>
        )}
        {step === 1 && (
          <>
            <input className="field" placeholder="Название магазина" value={shopName} onChange={(e) => setShopName(e.target.value)} />
            <textarea
              className="field min-h-28 py-3"
              placeholder="Описание и чем торгуете"
              value={shopDescription}
              onChange={(e) => setShopDescription(e.target.value)}
            />
            <AddressSuggest
              kind="city"
              value={city}
              onChange={setCity}
              placeholder="Город магазина"
              inputClassName="field"
            />
            <p className="text-xs text-stone-400">
              Можно продавать в розницу, оптом и дропшиппингом — формат выбираете у каждого товара.
            </p>
          </>
        )}
        {step === 2 && (
          <>
            <p className="text-sm text-stone-600">Как будете отправлять заказы?</p>
            {(["cdek", "pochta", "pickup"] as DeliveryMethod[]).map((m) => (
              <label key={m} className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={delivery.includes(m)}
                  onChange={() => toggleDelivery(m)}
                />
                {m === "cdek" ? "СДЭК — расчёт и трек" : m === "pochta" ? "Почта России — по всей РФ" : "Самовывоз — встреча или склад"}
              </label>
            ))}
          </>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {step < 3 && (
          <button type="submit" className="h-11 w-full rounded-xl bg-ink font-semibold text-paper">
            {step === lastFormStep ? "Создать аккаунт" : "Далее"}
          </button>
        )}
      </form>
      <style>{`.field{height:44px;width:100%;border-radius:12px;background:#f3f1eb;padding:0 12px;outline:none}`}</style>
    </div>
  );
}

function RoleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-xl text-sm font-medium ${active ? "bg-ink text-paper" : "bg-stone-100"}`}
    >
      {children}
    </button>
  );
}
