const { sequelize, ProductionOrder, Product, ProductionStage, User } = require('./server/config/database');

async function checkIssue() {
  try {
    console.log('🔍 Checking database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Check if tables exist
    console.log('🔍 Checking if tables exist...');
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log('Tables found:', tables.map(t => Object.values(t)[0]).join(', '));
    
    const hasProductionOrders = tables.some(t => Object.values(t)[0] === 'production_orders');
    const hasProducts = tables.some(t => Object.values(t)[0] === 'products');
    const hasProductionStages = tables.some(t => Object.values(t)[0] === 'production_stages');
    
    console.log('\n📊 Table Status:');
    console.log('  production_orders:', hasProductionOrders ? '✅' : '❌');
    console.log('  products:', hasProducts ? '✅' : '❌');
    console.log('  production_stages:', hasProductionStages ? '✅' : '❌');

    // Try to fetch production orders
    console.log('\n🔍 Trying to fetch production orders with associations...');
    try {
      const orders = await ProductionOrder.findAll({
        include: [
          { model: Product, as: 'product', attributes: ['id', 'name', 'product_code'] },
          { model: ProductionStage, as: 'stages', attributes: ['id', 'stage_name', 'status'] }
        ],
        limit: 5
      });
      console.log('✅ Successfully fetched', orders.length, 'production orders');
      if (orders.length > 0) {
        console.log('First order:', {
          id: orders[0].id,
          production_number: orders[0].production_number,
          product: orders[0].product ? orders[0].product.name : 'No product',
          stages: orders[0].stages ? orders[0].stages.length : 0
        });
      }
    } catch (error) {
      console.log('❌ Error fetching production orders:');
      console.log('  Message:', error.message);
      console.log('  Name:', error.name);
      if (error.original) {
        console.log('  SQL Error:', error.original.message);
      }
      console.log('\n  Stack:', error.stack);
    }

    // Check production_orders table structure
    console.log('\n🔍 Checking production_orders table structure...');
    const [columns] = await sequelize.query("DESCRIBE production_orders");
    console.log('Columns:', columns.map(c => c.Field).join(', '));
    
    // Check if production_approval_id column exists
    const hasApprovalId = columns.some(c => c.Field === 'production_approval_id');
    console.log('production_approval_id column:', hasApprovalId ? '✅' : '❌');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

checkIssue();