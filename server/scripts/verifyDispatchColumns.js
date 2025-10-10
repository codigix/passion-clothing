const { sequelize } = require('../config/database');

const verifyColumns = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connection established.\n');

    console.log('Checking purchase_orders table columns...');
    const [results] = await sequelize.query(`
      SHOW COLUMNS FROM purchase_orders 
      WHERE Field IN ('dispatched_at', 'dispatch_tracking_number', 'dispatch_courier_name', 
                      'dispatch_notes', 'expected_arrival_date', 'dispatched_by_user_id')
    `);

    console.log('\nFound columns:');
    results.forEach(col => {
      console.log(`  ✅ ${col.Field} (${col.Type})`);
    });

    if (results.length === 6) {
      console.log('\n✅ All dispatch tracking columns exist!');
      console.log('👉 Please restart your server to use them.');
    } else {
      console.log(`\n⚠️  Only ${results.length}/6 columns found. Migration may need to run again.`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
};

verifyColumns();