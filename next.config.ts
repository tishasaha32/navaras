import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Uploads go through server actions: a little above MAX_VIDEO_MB in lib/content/hub.ts.
    serverActions: { bodySizeLimit: "101mb" },
  },
};

export default nextConfig;
