"use client";

import { SafeImage } from "./safe-image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { formatPrice, plural } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Container } from "./container";
import { IconChat, IconClose, IconHeart, IconShare } from "./icons";
import { SellerBadge } from "./seller-badge";

export function ReelsPlayer() {
  return (
    <Suspense fallback={<div className="grid h-64 place-items-center text-muted">Шортс…</div>}>
      <ReelsPlayerInner />
    </Suspense>
  );
}

function ReelsPlayerInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { reels, catalog, addToCart, toggleReelLike, reelLikes, addReelComment, user } = useStore();
  const startId = params.get("id");
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const startIndex = useMemo(() => {
    const i = reels.findIndex((r) => r.id === startId);
    return i >= 0 ? i : 0;
  }, [reels, startId]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ top: startIndex * el.clientHeight });
    setActive(startIndex);
  }, [startIndex]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollTop / Math.max(el.clientHeight, 1));
      setActive(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Container className="max-md:max-w-none max-md:px-0">
      <div className="reels-frame text-white">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="absolute left-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/40 backdrop-blur"
          aria-label="Закрыть"
        >
          <IconClose />
        </button>
        <div ref={scroller} className="reels-scroller">
          {reels.map((reel, index) => {
            const product = catalog.find((p) => p.id === reel.productId);
            if (!product) return null;
            const liked = reelLikes.includes(reel.id);
            return (
              <section key={reel.id} className="reel-slide relative overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(160deg, ${reel.gradient?.[0] || "#1c1917"}, ${reel.gradient?.[1] || "#e2571b"})` }}
                />
                <SafeImage
                  src={product.image}
                  alt={reel.title}
                  fill
                  className={`object-cover opacity-80 ${index === active && !paused ? "kenburns" : ""}`}
                  sizes="(max-width: 768px) 100vw, 1120px"
                  onClick={() => setPaused((v) => !v)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/25" />
                {index === active && <Progress duration={reel.durationSec} paused={paused} />}
                <div className="absolute right-3 top-[28%] z-10 flex flex-col items-center gap-3">
                  <Action
                    label={plural(reel.likes, "лайк", "лайка", "лайков")}
                    onClick={() => {
                      if (!user) {
                        router.push("/login?next=/reels");
                        return;
                      }
                      void toggleReelLike(reel.id);
                    }}
                  >
                    <IconHeart className={`h-6 w-6 ${liked ? "heart-pop text-ember" : ""}`} filled={liked} />
                  </Action>
                  <Action label="комменты" onClick={() => setCommentsFor(reel.id)}>
                    <IconChat className="h-6 w-6" />
                  </Action>
                  <Action
                    label={copied ? "скопировано" : "репост"}
                    onClick={async () => {
                      await navigator.clipboard.writeText(`${window.location.origin}/reels?id=${reel.id}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    <IconShare className="h-6 w-6" />
                  </Action>
                </div>
                <div className="absolute inset-x-0 bottom-0 z-10 p-4">
                  <Link href={`/shop/${reel.sellerId}`} className="text-sm font-medium text-white/80 hover:underline">
                    @{reel.sellerName}
                  </Link>
                  <h1 className="mt-1 text-lg font-bold md:text-xl">{reel.title}</h1>
                  <p className="mt-1 line-clamp-2 text-sm text-white/80">{reel.caption}</p>
                  <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                      <SafeImage src={product.image} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1">
                        <SellerBadge kind={product.sellerKind} />
                      </div>
                      <p className="line-clamp-1 text-sm">{product.title}</p>
                      <p className="font-bold">{formatPrice(product.price)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          router.push("/login?next=/reels");
                          return;
                        }
                        void addToCart(product.id);
                      }}
                      className="rounded-xl bg-ember px-3 py-2 text-sm font-semibold"
                    >
                      В корзину
                    </button>
                    <Link href={`/product/${product.id}`} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black">
                      Купить
                    </Link>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
        {commentsFor && (
          <CommentsSheet
            onClose={() => setCommentsFor(null)}
            comments={reels.find((r) => r.id === commentsFor)?.comments ?? []}
            onSubmit={(text) => {
              if (!user) {
                router.push("/login?next=/reels");
                return;
              }
              void addReelComment(commentsFor, text);
            }}
          />
        )}
      </div>
    </Container>
  );
}

function Progress({ duration, paused }: { duration: number; paused: boolean }) {
  return (
    <div className="absolute left-3 right-14 top-4 h-1 overflow-hidden rounded-full bg-white/25">
      <div
        className="h-full bg-white"
        style={{
          width: paused ? undefined : "100%",
          animation: paused ? "none" : `reelbar ${duration}s linear forwards`,
        }}
      />
      <style>{`@keyframes reelbar { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}

function Action({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-black/35 backdrop-blur">
        {children}
      </span>
      <span className="max-w-[72px] truncate text-[10px] text-white/80">{label}</span>
    </button>
  );
}

function CommentsSheet({
  onClose,
  comments,
  onSubmit,
}: {
  onClose: () => void;
  comments: { id: string; author: string; text: string; createdAt: string }[];
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");
  function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  }
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 max-h-[55%] rounded-t-3xl bg-stone-950 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold">Комментарии</p>
        <button type="button" onClick={onClose} aria-label="Закрыть">
          <IconClose />
        </button>
      </div>
      <div className="max-h-[28vh] space-y-3 overflow-y-auto">
        {comments.map((c) => (
          <div key={c.id}>
            <p className="text-sm font-semibold">{c.author}</p>
            <p className="text-sm text-white/80">{c.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать комментарий"
          className="h-11 flex-1 rounded-xl bg-white/10 px-3 text-sm outline-none"
        />
        <button type="submit" className="rounded-xl bg-ember px-4 text-sm font-semibold">
          Отправить
        </button>
      </form>
    </div>
  );
}
