export function isMediaSrc(src?: string | null): src is string {
  if (!src) return false;
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("blob:") ||
    src.startsWith("data:") ||
    (src.startsWith("/") && !src.startsWith("//"))
  );
}
