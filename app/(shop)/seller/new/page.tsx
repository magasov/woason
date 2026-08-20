"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { categories } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { Condition, DeliveryMethod, SellerTradeType } from "@/lib/types";
import { tradeTypeHint, tradeTypeLabel } from "@/lib/format";
import { CategoryIcon } from "@/components/category-icon";
import { FileDrop, MAX_PRODUCT_PHOTOS } from "@/components/file-drop";
import { uploadFiles } from "@/lib/upload";

const tradeOptions: SellerTradeType[] = ["retail", "wholesale", "dropship"];

function NewProductForm() {
  const { user, addProduct, catalog } = useStore();
  const router = useRouter();
  const search = useSearchParams();
  const preset = search.get("category");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("990");
  const [oldPrice, setOldPrice] = useState("");
  const [category, setCategory] = useState(
    preset && categories.some((c) => c.slug === preset) ? preset : "dom",
  );
  const [condition, setCondition] = useState<Condition>("new");
  const [tradeType, setTradeType] = useState<SellerTradeType>("retail");
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user?.seller) return null;
  const shopId = user.seller.id;
  const catCounts = new Map<string, number>();
  for (const p of catalog) {
    if (p.sellerId === shopId) catCounts.set(p.category, (catCounts.get(p.category) ?? 0) + 1);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user?.seller) return;
    if (!title.trim() || !Number(price)) {
      setError("Нужны название и цена");
      return;
    }
    if (!photos.length) {
      setError("Добавьте хотя бы одно фото");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const urls = await uploadFiles(photos, "product");
      if (!urls.length) {
        setError("Не удалось загрузить фото");
        return;
      }
      const shop = user.seller;
      const delivery: DeliveryMethod[] = shop.delivery.length ? shop.delivery : ["cdek", "pochta"];
      const product = await addProduct({
        title: title.trim(),
        description: description.trim() || "Товар продавца WOAson",
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        sellerKind: condition === "used" ? "private" : "shop",
        condition,
        category,
        image: urls[0],
        images: urls,
        city: shop.city || "Москва",
        weightKg: 0.5,
        inStock: 10,
        delivery,
        tags: ["своё"],
        tradeType,
      });
      if (product) router.push(`/product/${product.id}`);
      else setError("Не удалось опубликовать. Проверьте, что вы вошли как продавец.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setBusy(false);
    }
  }

  const catName = categories.find((c) => c.slug === category)?.name ?? "Категория";

  return (
    <div className="space-y-4">
      <div>
        <Link href="/seller" className="text-sm text-ember">
          ← Кабинет
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Новый товар</h1>
        <p className="text-sm text-muted">Выберите категорию — форма откроется уже с разделом. Сейчас: {catName}.</p>
      </div>
      <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl bg-paper p-4 lg:sticky lg:top-[calc(var(--header-h)+20px)] lg:self-start">
          <p className="mb-3 text-sm font-semibold">Категория</p>
          <div className="grid max-h-[70vh] grid-cols-1 gap-1 overflow-y-auto no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${
                  category === c.slug ? "bg-ink text-paper" : "text-ink hover:bg-stone-100"
                }`}
              >
                <CategoryIcon slug={c.slug} className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                <span className={`text-[11px] ${category === c.slug ? "text-white/60" : "text-muted"}`}>
                  {catCounts.get(c.slug) ?? 0} шт.
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <section className="space-y-3 rounded-2xl bg-paper p-5">
            <p className="text-sm font-semibold">Карточка</p>
            <label className="block text-xs font-medium text-muted">Название</label>
            <input className="field" placeholder="Как товар увидят покупатели" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label className="block text-xs font-medium text-muted">Описание</label>
            <textarea
              className="field min-h-32 py-3"
              placeholder="Материал, размер, состояние, комплектация"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Цена ₽</label>
                <input className="field" placeholder="990" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Старая цена</label>
                <input className="field" placeholder="необязательно" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
              </div>
            </div>
            <label className="block text-xs font-medium text-muted">Состояние</label>
            <select className="field" value={condition} onChange={(e) => setCondition(e.target.value as Condition)}>
              <option value="new">Новое</option>
              <option value="used">Б/у</option>
            </select>
          </section>

          <section className="space-y-3 rounded-2xl bg-paper p-5">
            <p className="text-sm font-semibold">Как продаёте</p>
            {tradeOptions.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTradeType(type)}
                className={`w-full rounded-2xl px-4 py-3 text-left ring-1 ${
                  tradeType === type ? "bg-ink text-paper ring-ink" : "bg-stone-50 text-ink ring-stone-200"
                }`}
              >
                <span className="block text-sm font-semibold">{tradeTypeLabel[type]}</span>
                <span className={`mt-0.5 block text-xs ${tradeType === type ? "text-white/75" : "text-muted"}`}>
                  {type === "dropship" ? "Видно только вам. Покупатели увидят «Розница»." : tradeTypeHint[type]}
                </span>
              </button>
            ))}
          </section>

          <section className="space-y-3 rounded-2xl bg-paper p-5">
            <p className="text-sm font-semibold">Фото</p>
            <FileDrop
              files={photos}
              onChange={setPhotos}
              max={MAX_PRODUCT_PHOTOS}
              variant="grid"
              label={`Фото товара · ${photos.length} из ${MAX_PRODUCT_PHOTOS}`}
              hint="Перетащите файлы сюда или нажмите. Первое фото — обложка."
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="h-11 w-full rounded-xl bg-ink font-semibold text-paper disabled:opacity-60"
            >
              {busy ? "Публикуем…" : "Опубликовать"}
            </button>
          </section>
        </div>
      </form>
      <style>{`.field{height:44px;width:100%;border-radius:12px;background:#f3f1eb;padding:0 12px;outline:none}`}</style>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Загрузка…</p>}>
      <NewProductForm />
    </Suspense>
  );
}
