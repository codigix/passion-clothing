const { sequelize } = require('../config/database');
require('dotenv').config();

/**
 * Script to truncate all tables except user-related tables
 * This will delete all data but preserve the table structure
 * 
 * PRESERVED TABLES (not truncated):
 * - users
 * - roles
 * - permissions
 * - user_roles (junction table)
 * - role_permissions (junction table)
 * - user_permissions (junction table)
 */

const PRESERVED_TABLES = [
  'users',
  'roles',
  'permissions',
  'user_roles',
  'role_permissions',
  'user_permissions'
];

async function truncateAllTables() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get all table names
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_TYPE = 'BASE TABLE'
    `);

    const tableNames = tables.map(t => t.TABLE_NAME);
    console.log(`📊 Found ${tableNames.length} tables in database\n`);

    // Filter out preserved tables
    const tablesToTruncate = tableNames.filter(
      table => !PRESERVED_TABLES.includes(table.toLowerCase())
    );

    console.log('🔒 PRESERVED TABLES (will NOT be truncated):');
    PRESERVED_TABLES.forEach(table => {
      if (tableNames.includes(table)) {
        console.log(`   ✓ ${table}`);
      }
    });
    console.log('');

    console.log(`🗑️  TABLES TO TRUNCATE (${tablesToTruncate.length} tables):`);
    tablesToTruncate.forEach(table => {
      console.log(`   • ${table}`);
    });
    console.log('');

    // Confirm before proceeding
    console.log('⚠️  WARNING: This will DELETE ALL DATA from the tables listed above!');
    console.log('⚠️  This action CANNOT be undone!\n');

    // Wait 3 seconds to allow user to cancel
    console.log('Starting in 3 seconds... Press Ctrl+C to cancel');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Starting in 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Starting in 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('');

    // Disable foreign key checks
    console.log('🔓 Disabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Truncate each table
    let successCount = 0;
    let errorCount = 0;

    for (const table of tablesToTruncate) {
      try {
        await sequelize.query(`TRUNCATE TABLE \`${table}\``);
        console.log(`   ✅ Truncated: ${table}`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Failed to truncate ${table}:`, error.message);
        errorCount++;
      }
    }

    // Re-enable foreign key checks
    console.log('\n🔒 Re-enabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n' + '='.repeat(60));
    console.log('📊 TRUNCATION SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully truncated: ${successCount} tables`);
    console.log(`❌ Failed to truncate: ${errorCount} tables`);
    console.log(`🔒 Preserved (not truncated): ${PRESERVED_TABLES.length} tables`);
    console.log('='.repeat(60));

    console.log('\n✨ Database truncation completed!');
    console.log('💡 User accounts, roles, and permissions are preserved.');

  } catch (error) {
    console.error('\n❌ Error during truncation:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
truncateAllTables();