require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'passion_erp',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

async function testQueries() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB Connected\n');

    // Test projects-overview
    console.log('Testing projects-overview query...');
    const projectsData = await sequelize.query(`
      SELECT 
        so.id as sales_order_id,
        so.order_number,
        so.status as order_status,
        c.company_name as customer_name,
        COUNT(DISTINCT CASE WHEN inv.stock_type='project_specific' THEN inv.id END) as material_count
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN inventory inv ON so.id = inv.sales_order_id AND inv.is_active = 1
      WHERE (so.order_number LIKE :search1 OR c.company_name LIKE :search2 OR so.status LIKE :search3)
      GROUP BY so.id, so.order_number, so.status, c.company_name
      LIMIT 5
    `, {
      replacements: {
        search1: '%test%',
        search2: '%test%',
        search3: '%test%'
      },
      type: require('sequelize').QueryTypes.SELECT
    });
    
    console.log('✅ Projects-overview query Success!');
    console.log('Rows returned:', projectsData.length);
    if (projectsData.length > 0) {
      console.log('Sample:', projectsData[0]);
    }

    // Test warehouse-stock
    console.log('\nTesting warehouse-stock query...');
    const stockData = await sequelize.query(`
      SELECT 
        id,
        product_name,
        category,
        current_stock,
        reserved_stock
      FROM inventory
      WHERE (sales_order_id IS NULL OR stock_type = 'general_extra')
      AND is_active = 1
      AND (product_name LIKE :search OR category LIKE :search OR batch_number LIKE :search)
      ORDER BY id DESC
      LIMIT 5
    `, {
      replacements: {
        search: '%test%'
      },
      type: require('sequelize').QueryTypes.SELECT
    });
    
    console.log('✅ Warehouse-stock query Success!');
    console.log('Rows returned:', stockData.length);
    if (stockData.length > 0) {
      console.log('Sample:', stockData[0]);
    }

  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error('SQL:', e.sql);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testQueries();