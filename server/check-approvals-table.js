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

async function checkApprovalsTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check approvals table structure
    const [columns] = await sequelize.query('DESCRIBE approvals');
    console.log('📋 Approvals Table Columns:');
    console.log('================================');
    columns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });

    console.log('\n');

    // Get all GRN creation approval records
    const [approvals] = await sequelize.query(`
      SELECT *
      FROM approvals
      WHERE entity_type = 'grn_creation'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('📋 GRN Creation Approval Requests:');
    console.log('====================================');
    if (approvals.length === 0) {
      console.log('  ❌ No GRN creation approval requests found!');
    } else {
      console.log(`  Found ${approvals.length} request(s):\n`);
      approvals.forEach(approval => {
        console.log(JSON.stringify(approval, null, 2));
        console.log('---');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkApprovalsTable();