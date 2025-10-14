require('dotenv').config({ path: './server/.env' });
const { Inventory, sequelize } = require('./server/config/database');

async function checkInventory() {
  try {
    console.log('🔍 Checking Inventory Data...\n');

    const inventoryItems = await Inventory.findAll({
      attributes: ['id', 'name', 'type', 'quantity', 'unit', 'barcode', 'sales_order_number'],
      order: [['created_at', 'DESC']],
      limit: 20
    });

    console.log(`📦 Total Inventory Items Found: ${inventoryItems.length}\n`);
    
    inventoryItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}`);
      console.log(`   Type: ${item.type}`);
      console.log(`   Quantity: ${item.quantity} ${item.unit}`);
      console.log(`   Barcode: ${item.barcode || 'N/A'}`);
      console.log(`   Sales Order: ${item.sales_order_number || 'N/A'}`);
      console.log('   ---');
    });

    await sequelize.close();
    console.log('\n✅ Inventory check complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkInventory();