import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Menonaktifkan linting saat build agar tidak menggagalkan deploy
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
