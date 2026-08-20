"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { SafeImage } from "@/components/safe-image";
import { FileDrop } from "@/components/file-drop";
import { uploadFiles } from "@/lib/upload";

export default function SellerStoriesPage() {
  const { user, stories, addStory } = useStore();
  const shop = user?.seller;
  const [photo, setPhoto] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const mine = stories.filter((s) => shop && s.sellerId === shop.id);

  if (!shop) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!photo[0]) {
      setNote("Добавьте фото");
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      const [image] = await uploadFiles(photo, "story");
      const s = await addStory({ image, caption });
      if (s) {
        setPhoto([]);
        setCaption("");
        setNote("Сторис опубликован на странице магазина");
      } else setNote("Не удалось опубликовать");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Сторис</h1>
        <p className="text-sm text-muted">Кружок на странице магазина. Покупатели увидят его на витрине.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-paper p-5">
        <h2 className="font-semibold">Новый сторис</h2>
        <FileDrop
          files={photo}
          onChange={setPhoto}
          max={1}
          variant="banner"
          label="Фото сторис"
          hint="Перетащите файл или нажмите. Одно фото, до 10 МБ."
        />
        <input
          className="field"
          placeholder="Подпись"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        {note && <p className="text-sm text-ember">{note}</p>}
        <button
          type="submit"
          disabled={busy}
          className="h-10 w-full rounded-xl bg-ink text-sm font-semibold text-paper disabled:opacity-60"
        >
          {busy ? "Публикуем…" : "Опубликовать сторис"}
        </button>
      </form>
      <section className="rounded-2xl bg-paper p-5">
        <h2 className="font-semibold">Опубликованные</h2>
        {mine.length ? (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {mine.map((s) => (
              <li key={s.id} className="overflow-hidden rounded-2xl bg-stone-50">
                <div className="relative aspect-[3/4]">
                  <SafeImage src={s.image} alt="" fill className="object-cover" sizes="200px" />
                </div>
                <p className="line-clamp-2 px-3 py-2 text-xs text-muted">{s.caption}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">Пока нет сторис.</p>
        )}
        <Link href={`/shop/${shop.id}`} className="mt-4 inline-block text-sm text-ember">
          Смотреть на витрине
        </Link>
      </section>
      <style>{`.field{height:44px;width:100%;border-radius:12px;background:#f3f1eb;padding:0 12px;outline:none}`}</style>
    </div>
  );
}
