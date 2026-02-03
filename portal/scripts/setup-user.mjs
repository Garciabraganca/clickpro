import pg from 'pg';
import crypto from 'crypto';
import fs from 'fs';

const { Pool } = pg;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function generateCuid() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `c${timestamp}${random}`;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não está definida');
  }

  console.log('Conectando ao banco de dados...');
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Testar conexão
    const testResult = await pool.query('SELECT 1 as test');
    console.log('✅ Conexão com o banco de dados OK');

    // Verificar se a tabela User existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'User'
      ) as exists
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('📦 Tabelas não existem. Criando schema...');

      // Ler e executar a migration
      const migrationPath = '/home/user/clickpro/portal/prisma/migrations/20260114163731_init/migration.sql';
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      await pool.query(migrationSql);
      console.log('✅ Schema criado com sucesso');
    } else {
      console.log('✅ Tabelas já existem');
    }

    // Dados do usuário (normalize email to lowercase for consistent storage)
    const rawEmail = 'adrbrag18@gmail.com';
    const email = rawEmail.toLowerCase().trim();
    const password = 'Andre180416@';
    const name = 'Andre (SUPER_ADMIN)';
    const passwordHash = hashPassword(password);

    // Verificar se o usuário já existe
    const userCheck = await pool.query(
      'SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (userCheck.rows.length > 0) {
      // Atualizar usuário existente (also normalize email to lowercase)
      await pool.query(
        'UPDATE "User" SET email = $1, "passwordHash" = $2, role = $3, "updatedAt" = NOW() WHERE LOWER(email) = LOWER($4)',
        [email, passwordHash, 'SUPER_ADMIN', email]
      );
      console.log(`✅ Usuário atualizado: ${email}`);
    } else {
      // Criar novo usuário
      const userId = generateCuid();
      await pool.query(
        `INSERT INTO "User" (id, email, name, "passwordHash", role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [userId, email, name, passwordHash, 'SUPER_ADMIN']
      );
      console.log(`✅ Usuário criado: ${email}`);
    }

    // Verificar o usuário criado
    const verifyUser = await pool.query(
      'SELECT id, email, name, role FROM "User" WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    console.log('\n📋 Dados do usuário:');
    console.log(verifyUser.rows[0]);

    console.log('\n🎉 Setup concluído com sucesso!');
    console.log(`\nVocê pode agora fazer login com:`);
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
