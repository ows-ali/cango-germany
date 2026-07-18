import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*", "192.168.0.27", "matchbox-cheating-escapade.ngrok-free.dev"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
