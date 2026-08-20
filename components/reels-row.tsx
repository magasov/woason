"use client";

import { SafeImage } from "./safe-image";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { IconPlay } from "./icons";
import { formatPrice } from "@/lib/format";

export function ReelsRow() {
  const { reels, catalog } = useStore();

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold">Шортс</h2>
          <p className="text-sm text-muted">Короткие ролики 4:3 — обзор товара и кнопка «Купить»</p>
        </div>
        <Link href="/reels" className="text-sm font-medium text-ink">
          Смотреть все
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {reels.map((reel) => {
          const product = catalog.find((p) => p.id === reel.productId);
          if (!product) return null;
          return (
            <Link
              key={reel.id}
              href={`/reels?id=${reel.id}`}
              className="relative aspect-[4/3] w-[240px] shrink-0 overflow-hidden rounded-2xl bg-stone-900 text-white"
            >
              <SafeImage
                src={product.image}
                alt={reel.title}
                fill
                sizes="240px"
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/20 backdrop-blur">
                <IconPlay className="h-4 w-4" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <p className="line-clamp-2 text-[13px] font-semibold leading-tight">{reel.title}</p>
                <p className="mt-1 text-xs text-white/80">{formatPrice(product.price)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
