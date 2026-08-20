import { api } from "./api";

export type UploadKind = "product" | "avatar" | "banner" | "story" | "review";

const MAX_BYTES = 10 * 1024 * 1024;

export function assertImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Только изображения: JPG, PNG, WebP, GIF");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Файл больше 10 МБ");
  }
}

export async function uploadFiles(files: File[], kind: UploadKind): Promise<string[]> {
  if (!files.length) return [];
  for (const file of files) assertImageFile(file);

  const fd = new FormData();
  fd.append("kind", kind);
  for (const file of files) fd.append("files", file);

  try {
    const res = await api<{ urls?: string[]; items?: { url: string }[] }>("/api/v1/uploads", {
      method: "POST",
      auth: true,
      body: fd,
    });
    const urls = res.urls?.length ? res.urls : (res.items ?? []).map((item) => item.url).filter(Boolean);
    if (urls.length) return urls;
    throw new Error("сервер не вернул ссылки на файлы");
  } catch (e) {
    if (kind === "review") {
      throw e instanceof Error ? e : new Error("не удалось загрузить фото");
    }
    /* бэк ещё не подключён — локальный превью */
  }

  return files.map((file) => URL.createObjectURL(file));
}
