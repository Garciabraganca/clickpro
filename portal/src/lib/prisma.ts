import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    ""
  );
}

function createPrismaClient(connectionString: string) {
  return new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });
}

const connectionString = resolveDatabaseUrl();

const prismaClient = globalForPrisma.prisma
  ?? (connectionString ? createPrismaClient(connectionString) : null);

export const prisma: PrismaClient = prismaClient
  ?? new Proxy({} as PrismaClient, {
    get() {
      throw new Error(
        "DATABASE_URL não está configurada. Defina DATABASE_URL (ou POSTGRES_PRISMA_URL/POSTGRES_URL) no ambiente."
      );
    },
  });

if (process.env.NODE_ENV !== "production" && prismaClient) {
  globalForPrisma.prisma = prismaClient;
}
