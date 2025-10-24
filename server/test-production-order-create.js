require('dotenv').config();
const { ProductionOrder, Product, User, sequelize } = require('./config/database');

async function testCreate() {
  try {
    console.log('🔍 Testing production order creation...\n');

    // Find a valid product and user
    const product = await Product.findOne();
    const user = await User.findOne();

    if (!product) {
      console.error('❌ No products found in database');
      await sequelize.close();
      return;
    }

    if (!user) {
      console.error('❌ No users found in database');
      await sequelize.close();
      return;
    }

    console.log(`✅ Found product ID: ${product.id}, name: ${product.name}`);
    console.log(`✅ Found user ID: ${user.id}, name: ${user.name}\n`);

    // Try to create a minimal production order
    const testData = {
      production_number: 'PRD-TEST-' + Date.now(),
      product_id: product.id,
      quantity: 10,
      status: 'pending',
      priority: 'medium',
      production_type: 'in_house',
      planned_start_date: new Date(),
      planned_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      created_by: user.id
    };

    console.log('📝 Creating test production order with data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('');

    const productionOrder = await ProductionOrder.create(testData);

    console.log('✅ SUCCESS! Production order created:');
    console.log(`   ID: ${productionOrder.id}`);
    console.log(`   Number: ${productionOrder.production_number}`);
    console.log(`   Status: ${productionOrder.status}`);

    // Clean up test data
    await productionOrder.destroy();
    console.log('\n🧹 Test data cleaned up');

    await sequelize.close();
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\n📋 Error details:', error);
    await sequelize.close();
  }
}

testCreate();