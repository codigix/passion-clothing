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

async function checkGRNStatus() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check all GRN records
    const [grns] = await sequelize.query(`
      SELECT 
        id,
        grn_number,
        purchase_order_id,
        status,
        verification_status,
        inventory_added,
        created_at
      FROM goods_receipt_notes
      ORDER BY created_at DESC
    `);

    console.log('📦 GRN Records in Database:');
    console.log('================================');
    if (grns.length === 0) {
      console.log('  ❌ No GRN records found!');
      console.log('  This explains why verification fails.');
    } else {
      grns.forEach(grn => {
        console.log(`\nGRN ID: ${grn.id}`);
        console.log(`  Number: ${grn.grn_number}`);
        console.log(`  PO ID: ${grn.purchase_order_id}`);
        console.log(`  Status: ${grn.status}`);
        console.log(`  Verification: ${grn.verification_status}`);
        console.log(`  Added to Inventory: ${grn.inventory_added ? '✅ YES' : '❌ NO'}`);
        console.log(`  Created: ${grn.created_at}`);
      });
    }

    console.log('\n');

    // Check PO statuses that might need GRN
    const [pos] = await sequelize.query(`
      SELECT 
        id,
        po_number,
        status,
        created_at
      FROM purchase_orders
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('📋 All Purchase Orders:');
    console.log('================================');
    if (pos.length === 0) {
      console.log('  No POs found');
    } else {
      pos.forEach(po => {
        console.log(`\nPO ID: ${po.id}`);
        console.log(`  Number: ${po.po_number}`);
        console.log(`  Status: ${po.status}`);
        console.log(`  Created: ${po.created_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

checkGRNStatus();