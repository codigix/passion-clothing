const { Sequelize } = require('sequelize');
const config = require('../config/config.js');

const sequelize = new Sequelize(config.development);

async function addMaterialsSourceColumn() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.');

    console.log('Adding materials_source column to purchase_orders table...');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'purchase_orders'
        AND COLUMN_NAME = 'materials_source'
    `);

    if (results.length > 0) {
      console.log('materials_source column already exists.');
      return;
    }

    // Add the column
    await sequelize.query(`
      ALTER TABLE purchase_orders
      ADD COLUMN materials_source ENUM('sales_order', 'bill_of_materials', 'manual') NULL DEFAULT NULL
    `);

    console.log('materials_source column added successfully.');

  } catch (error) {
    console.error('Error adding materials_source column:', error);
  } finally {
    await sequelize.close();
  }
}

addMaterialsSourceColumn();