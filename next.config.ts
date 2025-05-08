import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co", // Fixed: removed https:// prefix
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
        hostname: "*", // Allow images from any domain for API fetched images
        port: "",
        pathname: "/**",
      },
    ],
    // Add this to allow unoptimized images as a fallback option
    unoptimized: true,
  },
  // Add API route for placeholders
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
