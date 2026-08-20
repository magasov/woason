import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.mds.yandex.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.yandex.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ir.ozone.ru",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.woason.ru",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
