require('dotenv').config();
const db = require('../config/database');

async function checkInventory() {
  try {
    const items = await db.Inventory.findAll();
    console.log('Total items in Inventory:', items.length);
    items.forEach(item => {
      console.log(`- ID: ${item.id}, Name: ${item.product_name || item.name}, Cost: ${item.unit_cost || item.cost_price || item.price}, Unit: ${item.unit_of_measurement || item.unit}`);
    });
  } catch (err) {
    console.error('Error listing inventory:', err);
  }
}

checkInventory();
