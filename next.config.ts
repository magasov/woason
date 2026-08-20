import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
