import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  typescript: {
    // Build will succeed even with type errors (Prisma generates types at build time on Vercel)
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: rootDir,
  },
};

export default nextConfig;
