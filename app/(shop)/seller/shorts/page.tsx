"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function SellerShortsPage() {
  const { user, catalog, reels, addReel } = useStore();
  const shop = user?.seller;
  const myProducts = catalog.filter((p) => shop && p.sellerId === shop.id);
  const mine = reels.filter((r) => shop && r.sellerId === shop.id);
  const [productId, setProductId] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [note, setNote] = useState<string | null>(null);

  if (!shop) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const id = productId || myProducts[0]?.id;
    if (!id) {
      setNote("Сначала добавьте товар");
      return;
    }
    const r = await addReel({ productId: id, title, caption });
    if (r) {
      setTitle("");
      setCaption("");
      setNote("Шортс добавлен");
    } else setNote("Не удалось опубликовать");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Шортс</h1>
        <p className="text-sm text-muted">Короткий обзор к товару из витрины.</p>
      </div>
      <form onSubmit={onSubmit} className="rounded-2xl bg-paper p-5">
        <h2 className="font-semibold">Новый шортс</h2>
        <select className="field mt-3" value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Товар для ролика</option>
          {myProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <input className="field mt-2" placeholder="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="field mt-2" placeholder="Подпись" value={caption} onChange={(e) => setCaption(e.target.value)} />
        {note && <p className="mt-2 text-sm text-ember">{note}</p>}
        <button type="submit" className="mt-3 h-10 w-full rounded-xl bg-ink text-sm font-semibold text-paper">
          Добавить шортс
        </button>
      </form>
      <section className="rounded-2xl bg-paper p-5">
        <h2 className="font-semibold">Ваши ролики</h2>
        {mine.length ? (
          <ul className="mt-3 space-y-2">
            {mine.map((r) => (
              <li key={r.id}>
                <Link href={`/reels?id=${r.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-4 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{r.title || "Без названия"}</span>
                    <span className="text-xs text-muted">{r.caption}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">{r.likes} ♥</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">Роликов пока нет.</p>
        )}
        <Link href="/reels" className="mt-4 inline-block text-sm text-ember">
          Открыть ленту шортс
        </Link>
      </section>
      <style>{`.field{height:44px;width:100%;border-radius:12px;background:#f3f1eb;padding:0 12px;outline:none}`}</style>
    </div>
  );
}
