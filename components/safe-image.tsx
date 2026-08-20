import Image, { type ImageProps } from "next/image";

const allowedHosts = new Set([
  "images.unsplash.com",
  "avatars.mds.yandex.net",
]);

function hostAllowed(hostname: string) {
  if (allowedHosts.has(hostname)) return true;
  return hostname.endsWith(".yandex.net") || hostname.endsWith(".mds.yandex.net");
}

function isRemoteAllowed(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && hostAllowed(url.hostname);
  } catch {
    return false;
  }
}

type Props = Omit<ImageProps, "src"> & { src: string };

export function SafeImage({ src, alt, className, fill, sizes, priority, ...rest }: Props) {
  if (isRemoteAllowed(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        className={className}
        fill={fill}
        sizes={sizes}
        priority={priority}
        {...rest}
      />
    );
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`} />
    );
  }

  const width = "width" in rest ? rest.width : undefined;
  const height = "height" in rest ? rest.height : undefined;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} width={width} height={height} />
  );
}
