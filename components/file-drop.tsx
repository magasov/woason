"use client";

import { DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "./safe-image";
import { isMediaSrc } from "@/lib/media";

export const MAX_PRODUCT_PHOTOS = 12;
export const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/gif,image/avif";

type Variant = "grid" | "avatar" | "banner";

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
  variant?: Variant;
  existingUrl?: string;
  label?: string;
  hint?: string;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export function FileDrop({
  files,
  onChange,
  max = 1,
  variant = "grid",
  existingUrl,
  label,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const leftover = Math.max(0, max - files.length);
  const showExisting = leftover === max && isMediaSrc(existingUrl);

  const add = useCallback(
    (list: FileList | File[]) => {
      const incoming = Array.from(list).filter(isImageFile);
      if (!incoming.length) {
        setError("Только изображения: JPG, PNG, WebP, GIF");
        return;
      }
      const tooBig = incoming.find((file) => file.size > 10 * 1024 * 1024);
      if (tooBig) {
        setError("Файл больше 10 МБ");
        return;
      }
      const next = max === 1 ? incoming.slice(0, 1) : [...files, ...incoming].slice(0, max);
      if (max > 1 && files.length + incoming.length > max) {
        setError(`Максимум ${max} фото`);
      } else {
        setError(null);
      }
      onChange(next);
    },
    [files, max, onChange],
  );

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    add(e.dataTransfer.files);
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
    setError(null);
  }

  const dropClass = over
    ? "border-ember bg-ember/5"
    : "border-stone-200 bg-stone-50 hover:border-stone-300";

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-medium text-muted">{label}</p>}
      {leftover > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 text-center transition ${dropClass} ${
            variant === "avatar" ? "h-36" : variant === "banner" ? "h-32" : "h-36"
          }`}
        >
          <span className="text-sm font-semibold text-ink">
            {over ? "Отпустите файлы" : "Перетащите сюда или нажмите"}
          </span>
          <span className="mt-1 text-xs text-muted">
            {hint ||
              (max === 1
                ? "Одно изображение, до 10 МБ"
                : `До ${max} фото · JPG, PNG, WebP · до 10 МБ`)}
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_IMAGES}
        multiple={max > 1}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) add(e.target.files);
          e.target.value = "";
        }}
      />

      {variant === "avatar" && (previews[0] || showExisting) && (
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-stone-100 ring-1 ring-stone-200">
            <SafeImage src={previews[0] || existingUrl || ""} alt="" fill className="object-cover" sizes="80px" />
          </div>
          {files.length > 0 && (
            <button type="button" className="text-sm text-muted hover:text-ink" onClick={() => onChange([])}>
              Убрать
            </button>
          )}
        </div>
      )}

      {variant === "banner" && (previews[0] || showExisting) && (
        <div className="relative h-32 overflow-hidden rounded-2xl bg-stone-100">
          <SafeImage src={previews[0] || existingUrl || ""} alt="" fill className="object-cover" sizes="640px" />
          {files.length > 0 && (
            <button
              type="button"
              className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium"
              onClick={() => onChange([])}
            >
              Убрать
            </button>
          )}
        </div>
      )}

      {variant === "grid" && previews.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((url, i) => (
            <li key={`${files[i]?.name}-${i}`} className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
              <SafeImage src={url} alt="" fill className="object-cover" sizes="160px" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-white">
                  Обложка
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-sm leading-none"
                aria-label="Удалить фото"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {variant === "grid" && leftover === max && showExisting && (
        <div className="relative h-40 overflow-hidden rounded-xl bg-stone-100">
          <SafeImage src={existingUrl} alt="" fill className="object-cover" sizes="480px" />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
