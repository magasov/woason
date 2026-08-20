export function notificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported" as const;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function showBrowserNotification(input: {
  title: string;
  body: string;
  url: string;
  tag?: string;
}) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const n = new Notification(input.title, {
      body: input.body,
      tag: input.tag,
      silent: true,
    });
    n.onclick = () => {
      window.focus();
      window.location.assign(input.url);
      n.close();
    };
  } catch {
    /* браузер мог заблокировать */
  }
}
