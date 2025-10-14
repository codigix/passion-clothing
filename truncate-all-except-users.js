/**
 * Truncate All Tables Except Users/Roles/Permissions
 * 
 * This script will:
 * - Keep: users, roles, permissions, user_roles
 * - Delete: ALL business data (sales, procurement, manufacturing, inventory, etc.)
 */

require('dotenv').config({ path: './server/.env' });
const { Sequelize } = require('./server/node_modules/sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log,
  }
);

async function truncateAllExceptUsers() {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Disable foreign key checks
    console.log('\n🔓 Disabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Tables to KEEP (authentication and authorization)
    const keepTables = ['users', 'roles', 'permissions', 'user_roles'];

    // Get all tables
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
      AND TABLE_TYPE = 'BASE TABLE'
    `);

    console.log(`\n📊 Found ${tables.length} tables in database`);

    // Filter tables to truncate (all except keepTables)
    const tablesToTruncate = tables
      .map(t => t.TABLE_NAME)
      .filter(tableName => !keepTables.includes(tableName));

    console.log(`\n✅ Keeping ${keepTables.length} tables:`);
    keepTables.forEach(t => console.log(`   - ${t}`));

    console.log(`\n🗑️  Truncating ${tablesToTruncate.length} tables:`);
    tablesToTruncate.forEach(t => console.log(`   - ${t}`));

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will DELETE ALL DATA from these tables!');
    console.log('⚠️  Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Truncate each table
    let truncatedCount = 0;
    for (const tableName of tablesToTruncate) {
      try {
        await sequelize.query(`TRUNCATE TABLE \`${tableName}\``);
        console.log(`   ✅ Truncated: ${tableName}`);
        truncatedCount++;
      } catch (error) {
        console.error(`   ❌ Failed to truncate ${tableName}:`, error.message);
      }
    }

    // Re-enable foreign key checks
    console.log('\n🔒 Re-enabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✅ COMPLETE!');
    console.log(`   - Truncated: ${truncatedCount} tables`);
    console.log(`   - Preserved: ${keepTables.length} tables (users, roles, permissions)`);
    console.log('\n🎯 Your user accounts are safe - you can still login!');
    console.log('📦 All business data has been cleared - ready for fresh start!');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    
    // Try to re-enable foreign key checks even on error
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {
      // Ignore
    }
    
    await sequelize.close();
    process.exit(1);
  }
}

// Run the truncation
truncateAllExceptUsers();