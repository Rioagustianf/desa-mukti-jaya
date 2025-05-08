import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "/**",
      },
    ],

    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/placeholder/:width/:height",
        destination: "/api/placeholder?width=:width&height=:height",
      },
    ];
  },
};

export default nextConfig;
