const { Sequelize } = require('./server/node_modules/sequelize');
require('dotenv').config({ path: './server/.env' });

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

async function verifyGRNTable() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database\n');

    // Check if table exists
    const [tables] = await sequelize.query(
      "SHOW TABLES LIKE 'goods_receipt_notes'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Table goods_receipt_notes does not exist');
      process.exit(1);
    }

    console.log('✅ Table goods_receipt_notes exists\n');

    // Get table structure
    const [columns] = await sequelize.query(
      "DESCRIBE goods_receipt_notes"
    );

    console.log('📋 Table Structure:');
    console.log('═'.repeat(80));
    columns.forEach(col => {
      console.log(`${col.Field.padEnd(35)} ${col.Type.padEnd(25)} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n✅ GRN table is ready for use!');
    console.log('\n🔄 Please restart your server to ensure changes are loaded.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

verifyGRNTable();