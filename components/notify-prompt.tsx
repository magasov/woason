"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { notificationPermission, requestNotificationPermission } from "@/lib/notify";

const DISMISS_KEY = "woason-notify-dismissed";

export function NotifyPrompt() {
  const { user } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      setVisible(false);
      return;
    }
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    setVisible(notificationPermission() === "default");
  }, [user]);

  if (!visible) return null;

  async function enable() {
    const result = await requestNotificationPermission();
    setVisible(false);
    if (result !== "granted") localStorage.setItem(DISMISS_KEY, "1");
  }

  function later() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="fixed left-1/2 top-20 z-50 w-[min(22rem,calc(100vw-2.5rem))] -translate-x-1/2 rounded-2xl bg-paper p-4 shadow-xl ring-1 ring-stone-200">
      <p className="text-sm font-semibold">Уведомления о сообщениях</p>
      <p className="mt-1 text-sm text-muted">
        Разрешите браузеру — тогда новые смс придут даже если вкладка свёрнута.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => void enable()}
          className="h-9 rounded-xl bg-ink px-3 text-sm font-semibold text-paper"
        >
          Разрешить
        </button>
        <button type="button" onClick={later} className="h-9 rounded-xl px-3 text-sm text-muted">
          Позже
        </button>
      </div>
    </div>
  );
}
