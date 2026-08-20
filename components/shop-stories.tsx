"use client";

import { useEffect, useState } from "react";
import { SafeImage } from "./safe-image";
import type { ShopStory } from "@/lib/types";
import { IconClose } from "./icons";

export function ShopStories({
  items,
  shopName,
}: {
  items: ShopStory[];
  shopName: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  if (!items.length) return null;

  return (
    <section>
      <h2 className="font-semibold">Сторис</h2>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {items.map((story, i) => (
          <button
            key={story.id}
            type="button"
            onClick={() => setOpen(i)}
            className="flex w-[72px] shrink-0 flex-col items-center gap-1"
          >
            <span className="relative h-16 w-16 overflow-hidden rounded-full bg-stone-200 p-[2px] ring-2 ring-ember">
              <span className="relative block h-full w-full overflow-hidden rounded-full">
                <SafeImage src={story.image} alt="" fill className="object-cover" sizes="64px" />
              </span>
            </span>
            <span className="line-clamp-2 w-full text-center text-[10px] leading-tight text-muted">
              {story.caption}
            </span>
          </button>
        ))}
      </div>
      {open !== null && (
        <StoryViewer
          items={items}
          index={open}
          shopName={shopName}
          onClose={() => setOpen(null)}
          onIndex={setOpen}
        />
      )}
    </section>
  );
}

function StoryViewer({
  items,
  index,
  shopName,
  onClose,
  onIndex,
}: {
  items: ShopStory[];
  index: number;
  shopName: string;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const story = items[index];

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (index < items.length - 1) onIndex(index + 1);
      else onClose();
    }, 4500);
    return () => window.clearTimeout(t);
  }, [index, items.length, onClose, onIndex]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-ink">
        <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
          {items.map((s, i) => (
            <span key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <span className={`block h-full bg-white ${i < index ? "w-full" : i === index ? "w-full animate-pulse" : "w-0"}`} />
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-8 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white"
          aria-label="Закрыть"
        >
          <IconClose />
        </button>
        <div className="relative aspect-[9/16] w-full">
          <SafeImage src={story.image} alt={story.caption} fill className="object-cover" sizes="400px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-xs text-white/70">{shopName}</p>
            <p className="mt-1 text-lg font-semibold">{story.caption}</p>
          </div>
          <button
            type="button"
            className="absolute inset-y-0 left-0 w-1/3"
            aria-label="Назад"
            onClick={() => (index > 0 ? onIndex(index - 1) : onClose())}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 w-1/3"
            aria-label="Дальше"
            onClick={() => (index < items.length - 1 ? onIndex(index + 1) : onClose())}
          />
        </div>
      </div>
    </div>
  );
}
