"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { DEMO_PASSWORD } from "@/lib/data";
import { useStore } from "@/lib/store";

function LoginForm() {
  const { login, user } = useStore();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const [email, setEmail] = useState("shop@woason.ru");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);

  function dest(role: "seller" | "buyer") {
    if (next && next.startsWith("/")) return next;
    return role === "seller" ? "/seller" : "/cabinet";
  }

  useEffect(() => {
    if (!user) return;
    router.replace(dest(user.role === "seller" ? "seller" : "buyer"));
  }, [user, router, next]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err = await login(email, password);
    if (err) {
      setError(err);
      return;
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Вход</h1>
      <p className="mt-1 text-sm text-muted">Демо: maria@woason.ru или shop@woason.ru · пароль {DEMO_PASSWORD}</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-2xl bg-paper p-5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-11 w-full rounded-xl bg-stone-100 px-3 outline-none focus:ring-2 focus:ring-ink"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="h-11 w-full rounded-xl bg-stone-100 px-3 outline-none focus:ring-2 focus:ring-ink"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="h-11 w-full rounded-xl bg-ink font-semibold text-paper">
          Войти
        </button>
      </form>
      <p className="mt-4 text-sm text-muted">
        Нет аккаунта? <Link href="/register" className="font-medium text-ember">Бесплатная регистрация</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Загрузка…</p>}>
      <LoginForm />
    </Suspense>
  );
}

