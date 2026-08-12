import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Allow Cursor Cloud preview hosts to load /_next assets without warnings.
  allowedDevOrigins: ["*.agent.cvm.dev", "*.cvm.dev"],
};

export default nextConfig;
