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

async function checkInventoryData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Get all inventory items
    const [items] = await sequelize.query(`
      SELECT 
        id,
        product_name,
        product_code,
        barcode,
        product_type,
        current_stock,
        purchase_order_id,
        is_active,
        created_at
      FROM inventory
      ORDER BY created_at DESC
    `);

    console.log(`Total items in inventory: ${items.length}\n`);
    
    // Group by purchase_order_id status
    const withPO = items.filter(i => i.purchase_order_id !== null);
    const withoutPO = items.filter(i => i.purchase_order_id === null);
    
    console.log(`✅ Items WITH purchase_order_id: ${withPO.length}`);
    console.log(`❌ Items WITHOUT purchase_order_id: ${withoutPO.length}\n`);
    
    if (withoutPO.length > 0) {
      console.log('❌ Items WITHOUT PO (should be filtered):');
      console.log('================================================');
      withoutPO.forEach(item => {
        console.log(`ID: ${item.id}`);
        console.log(`Name: ${item.product_name || 'Unnamed Product'}`);
        console.log(`Barcode: ${item.barcode}`);
        console.log(`Type: ${item.product_type}`);
        console.log(`Quantity: ${item.current_stock}`);
        console.log(`PO ID: ${item.purchase_order_id}`);
        console.log(`Active: ${item.is_active}`);
        console.log(`Created: ${item.created_at}`);
        console.log('---');
      });
    }
    
    if (withPO.length > 0) {
      console.log('\n✅ Items WITH PO (should be visible):');
      console.log('================================================');
      withPO.forEach(item => {
        console.log(`ID: ${item.id}`);
        console.log(`Name: ${item.product_name || 'Unnamed Product'}`);
        console.log(`Barcode: ${item.barcode}`);
        console.log(`Type: ${item.product_type}`);
        console.log(`Quantity: ${item.current_stock}`);
        console.log(`PO ID: ${item.purchase_order_id}`);
        console.log(`Active: ${item.is_active}`);
        console.log('---');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkInventoryData();