export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const WS_URL = API_URL.replace(/^http/, "ws") + "/ws";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type AuthBlob = {
  accessToken: string;
  refreshToken: string;
};

const AUTH_KEY = "woason-auth-v1";

export function readAuth(): AuthBlob | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthBlob;
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAuth(blob: AuthBlob | null) {
  if (typeof window === "undefined") return;
  if (!blob) localStorage.removeItem(AUTH_KEY);
  else localStorage.setItem(AUTH_KEY, JSON.stringify(blob));
}

let refreshLock: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (refreshLock) return refreshLock;
  refreshLock = (async () => {
    const auth = readAuth();
    if (!auth?.refreshToken) return false;
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: auth.refreshToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        writeAuth(null);
        return false;
      }
      writeAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return true;
    } catch {
      return false;
    } finally {
      refreshLock = null;
    }
  })();
  return refreshLock;
}

type ApiInit = RequestInit & { auth?: boolean };

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { auth = false, headers, ...rest } = init;
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const run = async (token?: string) => {
    const h = new Headers(headers);
    const isForm = typeof FormData !== "undefined" && rest.body instanceof FormData;
    if (rest.body && !isForm && !h.has("Content-Type")) h.set("Content-Type", "application/json");
    if (token) h.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...rest, headers: h });
  };

  let token = auth ? readAuth()?.accessToken : undefined;
  let res = await run(token);

  if (auth && res.status === 401) {
    const ok = await refreshTokens();
    if (ok) {
      token = readAuth()?.accessToken;
      res = await run(token);
    }
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, typeof data.error === "string" ? data.error : "ошибка сервера");
  }
  return data as T;
}

export type ListResponse<T> = { items: T[]; total: number };
