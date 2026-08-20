const DADATA = "https://suggestions.dadata.ru/suggestions/api/4_1/rs";

export function dadataToken() {
  return process.env.DADATA_API_KEY || process.env.NEXT_PUBLIC_DADATA_API_KEY || "";
}

export function dadataSecret() {
  return process.env.DADATA_SECRET_KEY || "";
}

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip")?.trim() || req.headers.get("cf-connecting-ip")?.trim() || null;
}

export function isPrivateIp(ip: string) {
  return /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|::1|localhost)/i.test(ip);
}

export async function dadataRequest(path: string, init: RequestInit = {}) {
  const token = dadataToken();
  if (!token) {
    return { ok: false as const, status: 501, data: { error: "Нет DADATA_API_KEY" } };
  }
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Token ${token}`);
  const secret = dadataSecret();
  if (secret) headers.set("X-Secret", secret);
  const res = await fetch(`${DADATA}${path}`, {
    ...init,
    headers,
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    suggestions?: unknown;
    location?: unknown;
  };
  return { ok: res.ok, status: res.status, data };
}
