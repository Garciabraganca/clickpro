import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  pool: Pool;
};

function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    ""
  );
}

function validateDatabaseUrl(url: string): void {
  if (!url) {
    throw new Error(
      "DATABASE_URL não está configurada. Defina DATABASE_URL (ou POSTGRES_PRISMA_URL/POSTGRES_URL) no ambiente."
    );
  }

  // Check if URL starts with valid PostgreSQL protocol
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    throw new Error(
      `DATABASE_URL inválida: deve começar com "postgresql://" ou "postgres://". ` +
      `Valor atual: "${url.substring(0, 30)}..." ` +
      `Formato esperado: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require`
    );
  }

  // Parse the URL to validate its structure
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      `DATABASE_URL mal formatada: não é uma URL válida. ` +
      `Formato esperado: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require`
    );
  }

  // Check for common placeholder or invalid hostnames
  const invalidHostnames = ["base", "host", "hostname", "localhost:port", "your-host", "your_host", "HOST"];
  if (invalidHostnames.includes(parsed.hostname)) {
    throw new Error(
      `DATABASE_URL contém hostname inválido "${parsed.hostname}". ` +
      `Por favor, configure com o endereço real do seu banco de dados PostgreSQL. ` +
      `Exemplo para Neon: postgresql://user:pass@ep-xxx-xxx-123456.us-east-2.aws.neon.tech/mydb?sslmode=require`
    );
  }

  // Check if hostname looks like a placeholder
  if (!parsed.hostname || parsed.hostname === "undefined" || parsed.hostname === "null") {
    throw new Error(
      `DATABASE_URL não contém um hostname válido. ` +
      `Formato esperado: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require`
    );
  }
}

function createPrismaClient() {
  const connectionString = resolveDatabaseUrl();

  // Validate the connection string before attempting to connect
  validateDatabaseUrl(connectionString);

  const pool = globalForPrisma.pool || new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
