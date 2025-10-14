/**
 * Test script to diagnose ProjectMaterialRequest query issue
 */

const path = require('path');
const { Sequelize } = require(path.join(__dirname, 'server', 'node_modules', 'sequelize'));
require(path.join(__dirname, 'server', 'node_modules', 'dotenv')).config({ path: './server/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log
  }
);

async function testQuery() {
  try {
    console.log('🔍 Testing ProjectMaterialRequest query...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Test simple query
    console.log('1. Testing simple SELECT...');
    const [simpleResult] = await sequelize.query(
      'SELECT * FROM project_material_requests LIMIT 1'
    );
    console.log('✅ Simple query works. Columns:', Object.keys(simpleResult[0] || {}));
    console.log('   Has product_id?', simpleResult[0]?.hasOwnProperty('product_id') ? '✅' : '❌');
    console.log('   Has product_name?', simpleResult[0]?.hasOwnProperty('product_name') ? '✅' : '❌');

    // Test with department filter (what the frontend is doing)
    console.log('\n2. Testing with requesting_department filter...');
    const [deptResult] = await sequelize.query(
      `SELECT * FROM project_material_requests 
       WHERE requesting_department = 'manufacturing' 
       LIMIT 1`
    );
    console.log('✅ Department filter works. Results:', deptResult.length);

    // Test with joins (what the route is doing)
    console.log('\n3. Testing with JOINs (like the route does)...');
    const [joinResult] = await sequelize.query(
      `SELECT pmr.*, po.po_number, so.order_number
       FROM project_material_requests pmr
       LEFT JOIN purchase_orders po ON pmr.purchase_order_id = po.id
       LEFT JOIN sales_orders so ON pmr.sales_order_id = so.id
       WHERE pmr.requesting_department = 'manufacturing'
       LIMIT 1`
    );
    console.log('✅ JOIN query works. Results:', joinResult.length);

    // Check for any weird column issues
    console.log('\n4. Checking project_material_requests schema...');
    const [schema] = await sequelize.query(
      'DESCRIBE project_material_requests'
    );
    console.log('\n📋 Columns:');
    schema.forEach(col => {
      if (col.Field.includes('product')) {
        console.log(`   ✨ ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
      }
    });

    // Check if there are any foreign key issues
    console.log('\n5. Checking foreign keys...');
    const [fks] = await sequelize.query(
      `SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
         AND TABLE_NAME = 'project_material_requests'
         AND REFERENCED_TABLE_NAME IS NOT NULL`
    );
    console.log('Foreign keys:');
    fks.forEach(fk => {
      console.log(`   ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });

    // Check if products table exists (required for FK)
    console.log('\n6. Checking if products table exists...');
    const [tables] = await sequelize.query(
      `SHOW TABLES LIKE 'products'`
    );
    if (tables.length > 0) {
      console.log('✅ products table exists');
      const [productCount] = await sequelize.query('SELECT COUNT(*) as count FROM products');
      console.log(`   Contains ${productCount[0].count} products`);
    } else {
      console.log('❌ products table does NOT exist - this could be the issue!');
    }

    console.log('\n✅ All diagnostic queries completed successfully!');
    console.log('\n💡 If you see this message, the database schema is fine.');
    console.log('   The 500 error might be in the Sequelize model associations.');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n📋 Full error:');
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

testQuery();