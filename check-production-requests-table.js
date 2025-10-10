const { sequelize } = require('./server/config/database');

async function checkTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check if table exists
    const [tables] = await sequelize.query(
      "SHOW TABLES LIKE 'production_requests'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Table production_requests does NOT exist');
      return;
    }
    
    console.log('✅ Table production_requests EXISTS\n');

    // Get table structure
    const [columns] = await sequelize.query(
      "DESCRIBE production_requests"
    );
    
    console.log('📋 Table Structure:');
    console.log('===================');
    columns.forEach(col => {
      console.log(`${col.Field.padEnd(30)} ${col.Type.padEnd(20)} ${col.Null} ${col.Key} ${col.Default || ''}`);
    });

    console.log('\n📊 Total Columns:', columns.length);

    // Check for sales_order columns
    const hasSalesOrderId = columns.some(c => c.Field === 'sales_order_id');
    const hasSalesOrderNumber = columns.some(c => c.Field === 'sales_order_number');
    const hasSalesNotes = columns.some(c => c.Field === 'sales_notes');

    console.log('\n🔍 Sales Order Support:');
    console.log('  sales_order_id:', hasSalesOrderId ? '✅' : '❌');
    console.log('  sales_order_number:', hasSalesOrderNumber ? '✅' : '❌');
    console.log('  sales_notes:', hasSalesNotes ? '✅' : '❌');

    // Check indexes
    const [indexes] = await sequelize.query(
      "SHOW INDEXES FROM production_requests"
    );
    
    console.log('\n📑 Indexes:');
    const uniqueIndexes = [...new Set(indexes.map(i => i.Key_name))];
    uniqueIndexes.forEach(idx => {
      console.log(`  - ${idx}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTable();