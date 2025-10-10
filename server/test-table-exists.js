const { sequelize, ProductionRequest } = require('./config/database');

async function testTable() {
  try {
    console.log('🔍 Testing database connection and table...\n');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected');
    console.log(`   Database: ${sequelize.config.database}`);
    console.log(`   Host: ${sequelize.config.host}`);
    
    // Try to describe the table
    console.log('\n📋 Checking production_requests table...');
    
    const [results] = await sequelize.query(
      `DESCRIBE production_requests`
    );
    
    console.log(`✅ Table exists with ${results.length} columns`);
    console.log('\nColumns:');
    results.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });
    
    // Try to query the table
    console.log('\n🧪 Testing query...');
    const count = await ProductionRequest.count();
    console.log(`✅ Query successful! Found ${count} production requests`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testTable();