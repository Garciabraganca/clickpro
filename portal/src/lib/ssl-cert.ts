import "server-only";
import * as fs from "fs";
import * as path from "path";

/**
 * SSL Certificate Path Resolver for Vercel Serverless Functions
 * 
 * This utility ensures the SSL certificate is available at runtime by:
 * 1. First checking if SUPABASE_CA_CERT environment variable contains the cert content
 * 2. If so, writing it to /tmp/supabase-ca.crt (always writable in serverless)
 * 3. Falling back to file-based paths if the env var is not set
 * 
 * Usage:
 *   const certPath = ensureSslCert();
 *   // Use certPath in your database connection string
 */

const TMP_CERT_PATH = "/tmp/supabase-ca.crt";

// Possible file paths where the cert might exist (in order of preference)
const CERT_FILE_PATHS = [
  "./certs/supabase-prod-ca.crt",                    // Local development
  path.join(process.cwd(), "certs/supabase-prod-ca.crt"), // Relative to cwd
  "/var/task/certs/supabase-prod-ca.crt",            // Vercel default
  "/var/task/portal/certs/supabase-prod-ca.crt",    // Vercel when root is repo root
];

/**
 * Ensures the SSL certificate is available and returns its path.
 * 
 * Priority:
 * 1. If SUPABASE_CA_CERT env var is set, writes to /tmp and returns that path
 * 2. If cert already exists in /tmp, returns /tmp path
 * 3. Falls back to checking file paths in CERT_FILE_PATHS order
 * 
 * @returns The path to the SSL certificate, or null if not found/configured
 */
export function ensureSslCert(): string | null {
  // Priority 1: Use SUPABASE_CA_CERT environment variable (most reliable)
  const certContent = process.env.SUPABASE_CA_CERT;
  if (certContent) {
    try {
      // Write cert content to /tmp (always writable in serverless)
      fs.writeFileSync(TMP_CERT_PATH, certContent, { mode: 0o600 });
      console.log(`[SSL] Certificate written to ${TMP_CERT_PATH} from SUPABASE_CA_CERT env var`);
      return TMP_CERT_PATH;
    } catch (err) {
      console.error(`[SSL] Failed to write cert to ${TMP_CERT_PATH}:`, err);
      // Continue to fallback methods
    }
  }

  // Priority 2: Check if cert already exists in /tmp
  if (fs.existsSync(TMP_CERT_PATH)) {
    console.log(`[SSL] Using existing certificate at ${TMP_CERT_PATH}`);
    return TMP_CERT_PATH;
  }

  // Priority 3: Check file paths (for local dev or when cert is bundled)
  for (const certPath of CERT_FILE_PATHS) {
    try {
      if (fs.existsSync(certPath)) {
        console.log(`[SSL] Found certificate at ${certPath}`);
        return certPath;
      }
    } catch {
      // Ignore errors for paths that don't exist
    }
  }

  console.log("[SSL] No SSL certificate found. SSL cert path will not be set.");
  return null;
}

/**
 * Gets diagnostic information about SSL certificate availability.
 * Useful for debugging in production environments.
 */
export function getSslCertDiagnostics(): {
  envVarSet: boolean;
  tmpCertExists: boolean;
  filePaths: Array<{ path: string; exists: boolean }>;
  cwd: string;
  activePath: string | null;
} {
  const envVarSet = !!process.env.SUPABASE_CA_CERT;
  const tmpCertExists = fs.existsSync(TMP_CERT_PATH);
  
  const filePaths = CERT_FILE_PATHS.map((p) => ({
    path: p,
    exists: fs.existsSync(p),
  }));

  const activePath = ensureSslCert();

  return {
    envVarSet,
    tmpCertExists,
    filePaths,
    cwd: process.cwd(),
    activePath,
  };
}
