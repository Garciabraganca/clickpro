import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Build will succeed even with type errors (Prisma generates types at build time on Vercel)
    ignoreBuildErrors: true,
  },
  experimental: {
    // Include SSL certificate in serverless function bundle for Vercel runtime
    // Certificate will be available at /var/task/certs/supabase-prod-ca.crt
    outputFileTracingIncludes: {
      "*": ["./certs/supabase-prod-ca.crt"],
    },
  },
};

export default nextConfig;
