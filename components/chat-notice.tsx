"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function ChatNotice() {
  const { incomingNotice, dismissIncomingNotice } = useStore();

  useEffect(() => {
    if (!incomingNotice) return;
    const t = window.setTimeout(() => dismissIncomingNotice(), 5000);
    return () => window.clearTimeout(t);
  }, [incomingNotice, dismissIncomingNotice]);

  if (!incomingNotice) return null;

  return (
    <Link
      href={`/chat/${incomingNotice.peerId}`}
      onClick={() => dismissIncomingNotice()}
      className="fixed bottom-5 right-5 z-50 w-[min(22rem,calc(100vw-2.5rem))] rounded-2xl bg-ink p-4 text-paper shadow-xl ring-1 ring-white/10"
    >
      <p className="text-[10px] uppercase tracking-wide text-ember">Новое сообщение</p>
      <p className="mt-1 truncate text-sm font-semibold">{incomingNotice.peerName}</p>
      <p className="mt-0.5 line-clamp-2 text-sm text-white/70">{incomingNotice.text}</p>
    </Link>
  );
}
