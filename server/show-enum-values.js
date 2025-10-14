/**
 * Display Valid ENUM Values for Products and Sales Orders
 * Use this to create missing records with correct ENUM values
 */

const { sequelize } = require('./config/database');

async function showEnumValues() {
  console.log('📋 Valid ENUM Values for Creating Records\n');
  console.log('='.repeat(100));

  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Get Products table structure
    console.log('\n🛍️  PRODUCTS TABLE - Valid ENUM Values');
    console.log('-'.repeat(100));
    
    const [productsColumns] = await sequelize.query(`
      SELECT 
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${sequelize.config.database}'
        AND TABLE_NAME = 'products'
        AND DATA_TYPE = 'enum'
      ORDER BY ORDINAL_POSITION
    `);

    if (productsColumns.length > 0) {
      productsColumns.forEach(col => {
        console.log(`\n${col.COLUMN_NAME}:`);
        console.log(`  Type: ${col.COLUMN_TYPE}`);
        console.log(`  Nullable: ${col.IS_NULLABLE}`);
        console.log(`  Default: ${col.COLUMN_DEFAULT || 'None'}`);
        
        // Extract ENUM values
        const match = col.COLUMN_TYPE.match(/enum\((.*)\)/);
        if (match) {
          const values = match[1].split(',').map(v => v.replace(/'/g, '').trim());
          console.log(`  Valid Values: ${values.join(', ')}`);
        }
      });
    }

    // Get Sales Orders table structure
    console.log('\n\n📦 SALES_ORDERS TABLE - Valid ENUM Values');
    console.log('-'.repeat(100));
    
    const [salesOrderColumns] = await sequelize.query(`
      SELECT 
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${sequelize.config.database}'
        AND TABLE_NAME = 'sales_orders'
        AND DATA_TYPE = 'enum'
      ORDER BY ORDINAL_POSITION
    `);

    if (salesOrderColumns.length > 0) {
      salesOrderColumns.forEach(col => {
        console.log(`\n${col.COLUMN_NAME}:`);
        console.log(`  Type: ${col.COLUMN_TYPE}`);
        console.log(`  Nullable: ${col.IS_NULLABLE}`);
        console.log(`  Default: ${col.COLUMN_DEFAULT || 'None'}`);
        
        const match = col.COLUMN_TYPE.match(/enum\((.*)\)/);
        if (match) {
          const values = match[1].split(',').map(v => v.replace(/'/g, '').trim());
          console.log(`  Valid Values: ${values.join(', ')}`);
        }
      });
    }

    // Show example SQL for creating Product
    console.log('\n\n✨ EXAMPLE SQL: Create "Formal Shirt" Product');
    console.log('-'.repeat(100));
    console.log(`
INSERT INTO products (
  product_code,
  name,
  description,
  category,
  product_type,
  unit_of_measurement,
  status,
  created_by,
  created_at,
  updated_at
) VALUES (
  'PRD-FORMAL-SHIRT-001',
  'Formal Shirt',
  'Formal Shirt - Men\\'s wear',
  '<CHOOSE FROM category ENUM ABOVE>',
  '<CHOOSE FROM product_type ENUM ABOVE>',
  '<CHOOSE FROM unit_of_measurement ENUM ABOVE>',
  'active',
  1,
  NOW(),
  NOW()
);
    `);

    // Show example SQL for creating Sales Order
    console.log('\n✨ EXAMPLE SQL: Create Sales Order "SO-SO-20251012-0001"');
    console.log('-'.repeat(100));
    console.log(`
-- First, get the customer ID
SELECT id, name FROM customers WHERE name LIKE '%nitin kamble%';

-- Then create the sales order
INSERT INTO sales_orders (
  order_number,
  customer_id,
  product_id,
  product_name,
  order_date,
  delivery_date,
  order_type,
  items,
  total_quantity,
  total_amount,
  final_amount,
  status,
  priority,
  approval_status,
  created_by,
  created_at,
  updated_at
) VALUES (
  'SO-SO-20251012-0001',
  <CUSTOMER_ID_FROM_ABOVE_QUERY>,
  (SELECT id FROM products WHERE name = 'Formal Shirt' LIMIT 1),
  'Formal Shirt',
  '2025-10-12',
  '2025-11-12',
  '<CHOOSE FROM order_type ENUM ABOVE>',
  JSON_ARRAY(JSON_OBJECT(
    'product_id', (SELECT id FROM products WHERE name = 'Formal Shirt' LIMIT 1),
    'product_name', 'Formal Shirt',
    'quantity', 1000,
    'unit_price', 0,
    'total_price', 0
  )),
  1000,
  0,
  0,
  'pending',
  'medium',
  'pending',
  1,
  NOW(),
  NOW()
);
    `);

    // Show re-run migration command
    console.log('\n✨ AFTER CREATING RECORDS: Re-run Migration');
    console.log('-'.repeat(100));
    console.log(`
Once you've created the Product and Sales Order with valid ENUM values:

cd server
node fix-all-material-flow-nulls.js

This will:
✅ Find the newly created product "Formal Shirt"
✅ Find the newly created sales order "SO-SO-20251012-0001"  
✅ Update all material flow records with proper product_id and sales_order_id
✅ Establish complete referential integrity
    `);

    console.log('\n' + '='.repeat(100));

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

showEnumValues();