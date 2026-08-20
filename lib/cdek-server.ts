const CDEK_HOST = process.env.CDEK_API_URL || "https://api.edu.cdek.ru";

type TokenCache = { token: string; expiresAt: number };

let tokenCache: TokenCache | null = null;

function account() {
  return process.env.CDEK_ACCOUNT || "";
}

function secret() {
  return process.env.CDEK_SECURE || "";
}

export async function cdekToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.token;
  const id = account();
  const pass = secret();
  if (!id || !pass) return null;

  const url = new URL("/v2/oauth/token", CDEK_HOST);
  url.searchParams.set("grant_type", "client_credentials");
  url.searchParams.set("client_id", id);
  url.searchParams.set("client_secret", pass);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    message?: string;
    error?: string;
  };
  if (!res.ok || !data.access_token) return null;
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3500) * 1000,
  };
  return tokenCache.token;
}

export async function cdekFetch(path: string, init: RequestInit = {}) {
  const token = await cdekToken();
  if (!token) {
    return { ok: false as const, status: 501, data: { error: "Нет ключей CDEK_ACCOUNT / CDEK_SECURE" } };
  }
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const res = await fetch(`${CDEK_HOST}${path}`, { ...init, headers });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, data };
}

export function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    for (const key of ["cities", "offices", "items"]) {
      if (Array.isArray(rec[key])) return rec[key] as T[];
    }
    if ("code" in rec) return [data as T];
  }
  return [];
}

export type CdekTariff = {
  tariff_code: number;
  tariff_name?: string;
  tariff_description?: string;
  delivery_mode?: number;
  delivery_sum?: number;
  period_min?: number;
  period_max?: number;
};

export type CdekCity = {
  code: number;
  city?: string;
  full_name?: string;
  city_uuid?: string;
  country_code?: string;
};

export type CdekOffice = {
  code: string;
  name?: string;
  address?: string;
  address_comment?: string;
  work_time?: string;
  type?: string;
  location?: {
    city?: string;
    address?: string;
    address_full?: string;
    latitude?: number;
    longitude?: number;
  };
};

export type CdekOfficeOption = {
  code: string;
  name: string;
  address: string;
  workTime: string;
  type: string;
  city: string;
};

export function mapCdekOffice(o: CdekOffice): CdekOfficeOption {
  const city = o.location?.city || "";
  const address = o.location?.address || o.address || "";
  const title = [o.code, city, address].filter(Boolean).join(", ");
  return {
    code: o.code,
    name: title || o.code,
    address,
    workTime: o.work_time || "",
    type: o.type || "PVZ",
    city,
  };
}

export function pickCdekTariff(list: CdekTariff[]) {
  const parcel = list.filter((t) => [136, 137, 138, 139, 366, 368, 233, 234].includes(t.tariff_code));
  const pool = parcel.length ? parcel : list;
  return [...pool].sort((a, b) => (a.delivery_sum ?? 1e9) - (b.delivery_sum ?? 1e9))[0] || null;
}

export function etaFromTariff(t: CdekTariff) {
  const min = t.period_min ?? 2;
  const max = t.period_max ?? min + 2;
  if (min === max) return `${min} дн.`;
  return `${min}–${max} дн.`;
}
