/**
 * Migration script to normalize all user emails to lowercase.
 *
 * This fixes login issues caused by mixed-case emails stored in the database.
 * The login endpoint searches for lowercase emails, so any user with a mixed-case
 * email stored in the database won't be found.
 *
 * Usage:
 *   DATABASE_URL="your-database-url" node scripts/normalize-emails.mjs
 */
import pg from 'pg';

const { Pool } = pg;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Test connection
    await pool.query('SELECT 1 as test');
    console.log('Database connection OK');

    // Find all users with non-lowercase emails
    const usersResult = await pool.query(`
      SELECT id, email
      FROM "User"
      WHERE email != LOWER(email)
    `);

    const usersToFix = usersResult.rows;

    if (usersToFix.length === 0) {
      console.log('All user emails are already normalized. Nothing to do.');
      return;
    }

    console.log(`Found ${usersToFix.length} user(s) with non-normalized emails:`);
    usersToFix.forEach(u => console.log(`  - ${u.email}`));

    // Check for potential conflicts (two users with same email, different case)
    const conflictCheck = await pool.query(`
      SELECT LOWER(email) as normalized_email, COUNT(*) as count
      FROM "User"
      GROUP BY LOWER(email)
      HAVING COUNT(*) > 1
    `);

    if (conflictCheck.rows.length > 0) {
      console.error('\nERROR: Found duplicate emails that would conflict after normalization:');
      conflictCheck.rows.forEach(c => console.error(`  - ${c.normalized_email} (${c.count} users)`));
      console.error('\nPlease resolve these duplicates manually before running this migration.');
      process.exit(1);
    }

    // Update all emails to lowercase
    console.log('\nNormalizing emails...');

    for (const user of usersToFix) {
      const normalizedEmail = user.email.toLowerCase().trim();
      await pool.query(
        'UPDATE "User" SET email = $1, "updatedAt" = NOW() WHERE id = $2',
        [normalizedEmail, user.id]
      );
      console.log(`  Updated: ${user.email} -> ${normalizedEmail}`);
    }

    console.log(`\nSuccessfully normalized ${usersToFix.length} email(s).`);

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
