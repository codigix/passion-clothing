const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

async function truncateAllTables() {
  console.log('\n🗑️  TRUNCATING ALL TABLES...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Get all tables except SequelizeMeta
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
      AND TABLE_NAME != 'SequelizeMeta'
    `);

    console.log(`📋 Found ${tables.length} tables to truncate\n`);

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Disabled foreign key checks\n');

    // Truncate all tables
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`🗑️  Truncating table: ${tableName}`);
      await sequelize.query(`TRUNCATE TABLE \`${tableName}\``);
    }

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n🔒 Re-enabled foreign key checks');

    console.log('\n✅ ALL TABLES TRUNCATED SUCCESSFULLY!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Create admin user: node create-admin-quick.js');
    console.log('   2. Add test data or start using the system\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

truncateAllTables();