const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAndFixColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'passion_erp'
  });

  try {
    console.log('✅ Connected to database:', process.env.DB_NAME);
    
    // Check current columns
    console.log('\n📋 Checking current table structure...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM purchase_orders
    `);
    
    const existingColumns = columns.map(col => col.Field);
    console.log('Existing columns:', existingColumns.length);
    
    const requiredColumns = [
      'dispatched_at',
      'dispatch_tracking_number',
      'dispatch_courier_name',
      'dispatch_notes',
      'expected_arrival_date',
      'dispatched_by_user_id'
    ];
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All required columns already exist!');
      console.log('Required columns:', requiredColumns.join(', '));
      
      // Let's verify with a test query
      console.log('\n🧪 Testing a SELECT query...');
      const [testResult] = await connection.query(`
        SELECT id, po_number, dispatched_at, dispatch_tracking_number 
        FROM purchase_orders 
        LIMIT 1
      `);
      console.log('✅ Query successful! Columns are accessible.');
      
      await connection.end();
      return;
    }
    
    console.log('❌ Missing columns:', missingColumns.join(', '));
    console.log('\n🔧 Adding missing columns...\n');
    
    // Add each missing column
    for (const column of missingColumns) {
      try {
        let alterQuery = '';
        
        switch (column) {
          case 'dispatched_at':
            alterQuery = 'ALTER TABLE purchase_orders ADD COLUMN dispatched_at DATETIME NULL';
            break;
          case 'dispatch_tracking_number':
            alterQuery = 'ALTER TABLE purchase_orders ADD COLUMN dispatch_tracking_number VARCHAR(255) NULL';
            break;
          case 'dispatch_courier_name':
            alterQuery = 'ALTER TABLE purchase_orders ADD COLUMN dispatch_courier_name VARCHAR(255) NULL';
            break;
          case 'dispatch_notes':
            alterQuery = 'ALTER TABLE purchase_orders ADD COLUMN dispatch_notes TEXT NULL';
            break;
          case 'expected_arrival_date':
            alterQuery = 'ALTER TABLE purchase_orders ADD COLUMN expected_arrival_date DATETIME NULL';
            break;
          case 'dispatched_by_user_id':
            alterQuery = 'ALTER TABLE purchase_orders ADD COLUMN dispatched_by_user_id INT NULL';
            break;
        }
        
        console.log(`Adding ${column}...`);
        await connection.query(alterQuery);
        console.log(`✅ Added ${column}`);
        
      } catch (error) {
        console.error(`❌ Error adding ${column}:`, error.message);
      }
    }
    
    console.log('\n✅ All columns added successfully!');
    
    // Verify again
    console.log('\n🔍 Verifying final structure...');
    const [finalColumns] = await connection.query(`
      SHOW COLUMNS FROM purchase_orders WHERE Field IN (${requiredColumns.map(() => '?').join(',')})
    `, requiredColumns);
    
    console.log('Final verification:');
    finalColumns.forEach(col => {
      console.log(`  ✅ ${col.Field} - ${col.Type} - ${col.Null}`);
    });
    
    // Test query
    console.log('\n🧪 Testing SELECT query...');
    const [testResult] = await connection.query(`
      SELECT id, po_number, dispatched_at, dispatch_tracking_number, dispatch_courier_name 
      FROM purchase_orders 
      LIMIT 1
    `);
    console.log('✅ Query successful!');
    
    console.log('\n✨ MIGRATION COMPLETE! Please restart your server now.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await connection.end();
  }
}

checkAndFixColumns().catch(console.error);