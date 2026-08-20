"use client";

import { useEffect, useState } from "react";
import { SafeImage } from "./safe-image";
import { IconClose } from "./icons";

export function ProductGallery({
  title,
  images,
}: {
  title: string;
  images: string[];
}) {
  const photos = images.length ? images : [];
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const current = photos[index] || photos[0];

  useEffect(() => {
    setIndex(0);
  }, [photos[0]]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  if (!current) {
    return <div className="aspect-square rounded-3xl bg-paper" />;
  }

  return (
    <>
      <div className="flex gap-3">
        {photos.length > 1 && (
          <div className="hidden w-16 shrink-0 flex-col gap-2 md:flex">
            {photos.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                className={`relative h-16 w-16 overflow-hidden rounded-xl ring-2 transition ${
                  i === index ? "ring-ink" : "ring-transparent hover:ring-stone-300"
                }`}
              >
                <SafeImage src={src} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative mx-auto block w-full overflow-hidden rounded-3xl bg-paper shadow-[0_18px_50px_-28px_rgba(26,24,20,0.45)]"
            style={{ maxWidth: 560, aspectRatio: "1 / 1" }}
            aria-label="Открыть фото"
          >
            <SafeImage
              src={current}
              alt={title}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 560px"
              priority
            />
            <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
              Увеличить
            </span>
          </button>
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden no-scrollbar">
              {photos.map((src, i) => (
                <button
                  key={`${src}-m-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 ${
                    i === index ? "ring-ink" : "ring-transparent"
                  }`}
                >
                  <SafeImage src={src} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/88 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal
          aria-label="Галерея"
        >
          <button
            type="button"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
            aria-label="Закрыть"
            onClick={() => setOpen(false)}
          >
            <IconClose />
          </button>
          <div className="relative h-[min(86vh,860px)] w-[min(92vw,860px)]" onClick={(e) => e.stopPropagation()}>
            <SafeImage src={current} alt={title} fill className="object-contain" sizes="860px" />
          </div>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-white/15 text-xl text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i - 1 + photos.length) % photos.length);
                }}
                aria-label="Предыдущее"
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-white/15 text-xl text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i + 1) % photos.length);
                }}
                aria-label="Следующее"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
