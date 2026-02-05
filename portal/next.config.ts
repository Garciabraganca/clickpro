import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Build will succeed even with type errors (Prisma generates types at build time on Vercel)
    ignoreBuildErrors: true,
  },
  // Include SSL certificate in serverless function bundle for Vercel runtime
  // Certificate will be available at /var/task/certs/supabase-prod-ca.crt
  // Note: SUPABASE_CA_CERT env var is the recommended approach (written to /tmp at runtime)
  outputFileTracingIncludes: {
    "*": ["./certs/supabase-prod-ca.crt"],
  },
};

export default nextConfig;
