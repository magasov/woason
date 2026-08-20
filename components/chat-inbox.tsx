"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { IconChat } from "./icons";
import { SafeImage } from "./safe-image";

function when(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function ChatInbox({ peerId }: { peerId?: string }) {
  const { user, messages, threads, sendMessage, markThreadRead, findShop, loadChat, setActiveChatPeer } =
    useStore();
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const myId = user?.id;

  const list = useMemo(() => {
    const rows = [...threads];
    if (peerId && peerId !== myId && !rows.some((t) => t.peerId === peerId)) {
      rows.unshift({
        id: `tmp-${peerId}`,
        sellerId: peerId,
        buyerId: myId || "",
        peerId,
        peerName: findShop(peerId)?.shopName || "Собеседник",
        lastText: "Начните переписку",
        lastAt: "",
        unread: 0,
      });
    }
    return rows;
  }, [threads, peerId, myId, findShop]);

  const thread = useMemo(() => {
    if (!myId || !peerId) return [];
    return messages.filter(
      (m) =>
        (m.sellerId === myId && m.buyerId === peerId) || (m.sellerId === peerId && m.buyerId === myId),
    );
  }, [messages, myId, peerId]);

  const shop = peerId ? findShop(peerId) : undefined;
  const peerName = shop?.shopName || list.find((t) => t.peerId === peerId)?.peerName || "Собеседник";
  const lastId = thread.at(-1)?.id;

  useEffect(() => {
    if (user && peerId) void loadChat(peerId).catch(() => undefined);
  }, [user, peerId, loadChat]);

  useEffect(() => {
    if (!peerId) {
      setActiveChatPeer(null);
      return;
    }
    setActiveChatPeer(peerId);
    return () => setActiveChatPeer(null);
  }, [peerId, setActiveChatPeer]);

  useEffect(() => {
    if (user && peerId) void markThreadRead(peerId);
  }, [user, peerId, markThreadRead]);

  useEffect(() => {
    stickToBottom.current = true;
  }, [peerId]);

  useEffect(() => {
    const el = scroller.current;
    if (!el || !stickToBottom.current) return;
    el.scrollTop = el.scrollHeight;
  }, [lastId, peerId]);

  if (!user) {
    return (
      <div className="py-16 text-center">
        <p>Чтобы писать в чат, войдите.</p>
        <Link
          href={`/login?next=${encodeURIComponent(peerId ? `/chat/${peerId}` : "/messages")}`}
          className="mt-3 inline-block text-ember"
        >
          Войти
        </Link>
      </div>
    );
  }

  if (peerId && myId === peerId) {
    return (
      <div className="py-16 text-center">
        <p>Это ваш магазин.</p>
        <Link href={`/shop/${peerId}`} className="mt-3 inline-block text-ember">
          К витрине
        </Link>
      </div>
    );
  }

  function onSend() {
    if (!peerId || !text.trim()) return;
    stickToBottom.current = true;
    void sendMessage(peerId, text);
    setText("");
  }

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
  }

  return (
    <div className="flex h-[calc(100vh-var(--header-h)-4rem)] overflow-hidden rounded-2xl bg-paper">
      <aside
        className={`min-h-0 w-full shrink-0 overflow-hidden border-stone-200 md:w-[300px] md:border-r lg:w-[340px] ${
          peerId ? "hidden md:flex md:flex-col" : "flex flex-col"
        }`}
      >
        <div className="shrink-0 border-b border-stone-100 px-4 py-4">
          <p className="text-xs text-muted">Сообщения</p>
          <h1 className="text-lg font-bold">Люди</h1>
        </div>
        <ul className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
          {list.map((t) => {
            const active = t.peerId === peerId;
            const name = t.peerName || findShop(t.peerId)?.shopName || t.peerId;
            const logo = findShop(t.peerId)?.logo || "👤";
            return (
              <li key={t.peerId}>
                <Link
                  href={`/chat/${t.peerId}`}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                    active ? "bg-ink text-paper" : "hover:bg-stone-100"
                  }`}
                >
                  <Avatar logo={logo} name={name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{name}</p>
                      {t.unread > 0 && (
                        <span className="grid min-w-[18px] place-items-center rounded-full bg-ember px-1.5 text-[10px] font-bold text-white">
                          {t.unread}
                        </span>
                      )}
                    </div>
                    <p className={`mt-0.5 line-clamp-1 text-xs ${active ? "text-white/60" : "text-muted"}`}>
                      {t.lastText}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
          {!list.length && (
            <p className="px-3 py-8 text-center text-sm text-muted">
              Пока никого нет — напишите продавцу со страницы магазина.
            </p>
          )}
        </ul>
      </aside>

      <section className={`min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${peerId ? "flex" : "hidden md:flex"}`}>
        {peerId ? (
          <>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-100 px-4 py-3 md:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/messages" className="text-sm text-muted md:hidden">
                  ←
                </Link>
                <Avatar logo={shop?.logo || "👤"} name={peerName} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{peerName}</p>
                  <p className="text-xs text-muted">Личный чат</p>
                </div>
              </div>
              {shop && (
                <Link href={`/shop/${peerId}`} className="shrink-0 text-sm text-ember">
                  В магазин
                </Link>
              )}
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-6">
              <div
                ref={scroller}
                onScroll={onScroll}
                className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain"
              >
                {thread.map((m) => {
                  const mine = m.fromId === myId;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[min(36rem,80%)] rounded-2xl px-3 py-2 text-sm ${
                          mine ? "bg-ink text-paper" : "bg-stone-100 text-ink"
                        }`}
                      >
                        <p>{m.text}</p>
                        <p className={`mt-1 text-[10px] ${mine ? "text-white/50" : "text-muted"}`}>
                          {when(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {!thread.length && (
                  <p className="py-10 text-center text-sm text-muted">
                    Напишите первое сообщение — это личный чат.
                  </p>
                )}
              </div>
              <form
                className="mt-3 flex shrink-0 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSend();
                }}
              >
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Сообщение"
                  className="h-11 flex-1 rounded-xl bg-stone-100 px-3 text-sm outline-none focus:ring-2 focus:ring-ink"
                />
                <button type="submit" className="h-11 rounded-xl bg-ink px-4 text-sm font-semibold text-paper">
                  Отправить
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-stone-100 text-muted">
              <IconChat className="h-7 w-7" />
            </span>
            <p className="mt-4 text-lg font-semibold">Выберите, кому написать</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Слева список людей. Откройте диалог — переписка появится здесь.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Avatar({ logo, name }: { logo: string; name: string }) {
  if (logo.startsWith("http")) {
    return (
      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-stone-200">
        <SafeImage src={logo} alt="" fill className="object-cover" sizes="40px" />
      </span>
    );
  }
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stone-100 text-lg">
      {logo || name.slice(0, 1)}
    </span>
  );
}
