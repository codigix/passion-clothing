/**
 * Quick Fix: Make product_id nullable in production_orders
 * 
 * This script modifies the production_orders table to make product_id optional,
 * since materials are now fetched directly from MRN/Sales Order instead of 
 * requiring a product selection.
 * 
 * Usage: node fix-product-id-nullable.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'passion_erp',
  port: process.env.DB_PORT || 3306,
};

const fixProductId = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Modify the product_id column to be nullable
    console.log('🔧 Making product_id nullable in production_orders table...');
    await connection.execute(`
      ALTER TABLE production_orders 
      MODIFY COLUMN product_id INT NULL
      COMMENT 'Product ID (optional - materials fetched from MRN/Sales Order instead)'
    `);
    
    console.log('✅ Successfully made product_id nullable');
    console.log('✅ Production orders can now be created without selecting a product');
    console.log('   Materials will be fetched from the Material Request Number (MRN) instead');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing product_id:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
};

fixProductId();