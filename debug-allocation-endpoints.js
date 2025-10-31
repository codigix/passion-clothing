const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'passion_erp',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      timezone: 'system'
    }
  }
);

async function testQueries() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Test 1: Projects Overview Query
    console.log('\n========== Testing Projects Overview Query ==========');
    try {
      const [projectsData] = await sequelize.query(`
        SELECT 
          so.id as sales_order_id,
          so.order_number,
          so.status as order_status,
          c.company_name as customer_name,
          COUNT(DISTINCT CASE WHEN inv.stock_type='project_specific' THEN inv.id END) as material_count,
          SUM(CASE WHEN inv.stock_type='project_specific' THEN inv.current_stock ELSE 0 END) as total_allocated,
          SUM(CASE WHEN inv.stock_type='project_specific' THEN inv.reserved_stock ELSE 0 END) as total_reserved,
          SUM(CASE WHEN inv.stock_type='project_specific' THEN inv.consumed_quantity ELSE 0 END) as total_consumed,
          SUM(CASE WHEN inv.stock_type='project_specific' THEN (inv.current_stock - inv.consumed_quantity) ELSE 0 END) as remaining_quantity,
          so.created_at,
          so.total_price,
          so.quantity as order_quantity
        FROM sales_orders so
        LEFT JOIN customers c ON so.customer_id = c.id
        LEFT JOIN inventory inv ON so.id = inv.sales_order_id AND inv.is_active = 1
        WHERE (so.order_number LIKE ? OR c.company_name LIKE ? OR so.status LIKE ?)
        GROUP BY so.id, so.order_number, so.status, c.company_name, so.created_at, so.total_price, so.quantity
        ORDER BY so.created_at DESC
        LIMIT 5
      `, ['%test%', '%test%', '%test%']);
      
      console.log('✅ Projects Overview Query Success');
      console.log('Rows returned:', projectsData.length);
      if (projectsData.length > 0) {
        console.log('Sample:', projectsData[0]);
      }
    } catch (e) {
      console.error('❌ Projects Overview Query Failed:', e.message);
      console.error('Full Error:', e);
    }

    // Test 2: Warehouse Stock Query
    console.log('\n========== Testing Warehouse Stock Query ==========');
    try {
      const [stockData] = await sequelize.query(`
        SELECT 
          id,
          product_name,
          category,
          current_stock,
          reserved_stock,
          current_stock - reserved_stock as available_stock,
          unit_of_measurement,
          unit_cost,
          total_value,
          location,
          batch_number,
          reorder_level,
          last_movement_date,
          movement_type
        FROM inventory
        WHERE (sales_order_id IS NULL OR stock_type = 'general_extra')
        AND is_active = 1
        AND (product_name LIKE ? OR category LIKE ? OR batch_number LIKE ?)
        AND category = ?
        ORDER BY last_movement_date DESC
        LIMIT 5
      `, ['%test%', '%test%', '%test%', 'fabric']);
      
      console.log('✅ Warehouse Stock Query Success');
      console.log('Rows returned:', stockData.length);
      if (stockData.length > 0) {
        console.log('Sample:', stockData[0]);
      }
    } catch (e) {
      console.error('❌ Warehouse Stock Query Failed:', e.message);
      console.error('Full Error:', e);
    }

    // Test 3: Check table structures
    console.log('\n========== Checking Table Structures ==========');
    try {
      const [soColumns] = await sequelize.query('DESCRIBE sales_orders');
      console.log('✅ sales_orders table exists');
      console.log('Columns:', soColumns.map(c => c.Field).slice(0, 10));
    } catch (e) {
      console.error('❌ sales_orders table error:', e.message);
    }

    try {
      const [custColumns] = await sequelize.query('DESCRIBE customers');
      console.log('✅ customers table exists');
      console.log('Columns:', custColumns.map(c => c.Field).slice(0, 10));
    } catch (e) {
      console.error('❌ customers table error:', e.message);
    }

    try {
      const [invColumns] = await sequelize.query('DESCRIBE inventory');
      console.log('✅ inventory table exists');
      console.log('Columns:', invColumns.map(c => c.Field).slice(0, 15));
    } catch (e) {
      console.error('❌ inventory table error:', e.message);
    }

    // Test 4: Check data
    console.log('\n========== Checking Data ==========');
    try {
      const [soCount] = await sequelize.query('SELECT COUNT(*) as count FROM sales_orders');
      console.log('✅ Sales Orders Count:', soCount[0].count);
    } catch (e) {
      console.error('❌ Sales Orders Count Error:', e.message);
    }

    try {
      const [custCount] = await sequelize.query('SELECT COUNT(*) as count FROM customers');
      console.log('✅ Customers Count:', custCount[0].count);
    } catch (e) {
      console.error('❌ Customers Count Error:', e.message);
    }

    try {
      const [invCount] = await sequelize.query('SELECT COUNT(*) as count FROM inventory WHERE is_active = 1');
      console.log('✅ Inventory Count (Active):', invCount[0].count);
    } catch (e) {
      console.error('❌ Inventory Count Error:', e.message);
    }

  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testQueries();