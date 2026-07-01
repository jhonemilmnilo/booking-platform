import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['100.125.65.69'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
