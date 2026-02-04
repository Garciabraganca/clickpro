import { NextResponse } from "next/server";
import { getSslCertDiagnostics } from "@/lib/ssl-cert";

/**
 * Debug endpoint to diagnose SSL certificate path issues on Vercel
 * 
 * GET /api/debug/ssl
 * 
 * Returns information about:
 * - Current working directory
 * - Whether SUPABASE_CA_CERT env var is set
 * - Which certificate file paths exist
 * - The active certificate path being used
 * 
 * WARNING: This endpoint should be removed or protected in production.
 * It is intended for temporary debugging only.
 */
export async function GET() {
  // Only allow in non-production or with explicit debug flag
  const allowDebug = process.env.NODE_ENV !== "production" || 
                     process.env.ALLOW_SSL_DEBUG === "true";
  
  if (!allowDebug) {
    return NextResponse.json(
      { error: "Debug endpoint disabled in production. Set ALLOW_SSL_DEBUG=true to enable." },
      { status: 403 }
    );
  }

  try {
    const diagnostics = getSslCertDiagnostics();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      diagnostics: {
        cwd: diagnostics.cwd,
        envVarSet: diagnostics.envVarSet,
        envVarLength: process.env.SUPABASE_CA_CERT?.length ?? 0,
        tmpCertExists: diagnostics.tmpCertExists,
        activePath: diagnostics.activePath,
        filePaths: diagnostics.filePaths,
      },
      recommendation: diagnostics.activePath 
        ? `Certificate found at: ${diagnostics.activePath}`
        : "No certificate found. Set SUPABASE_CA_CERT env var with the certificate content.",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
