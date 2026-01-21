import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import crypto from "crypto";

function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    ""
  );
}

const connectionString = resolveDatabaseUrl();
if (!connectionString) {
  throw new Error("DATABASE_URL não está configurada.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(p: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(p, salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL ?? "adrbrag18@gmail.com";
  const pass = process.env.ADMIN_SEED_PASSWORD ?? "Adrbrag18@gmail.com";
  if (!email || !pass) throw new Error("Missing ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD");

  await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.SUPER_ADMIN,
      passwordHash: hashPassword(pass),
      name: "Andre (SUPER_ADMIN)"
    },
    create: {
      email,
      role: Role.SUPER_ADMIN,
      passwordHash: hashPassword(pass),
      name: "Andre (SUPER_ADMIN)"
    }
  });

  console.log("Admin created/updated:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
