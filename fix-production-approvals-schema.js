const db = require('./server/config/database');

async function fixSchema() {
  try {
    console.log('🔧 Checking production_approvals table schema...\n');
    
    // Check current columns
    const [columns] = await db.sequelize.query('DESCRIBE production_approvals');
    console.log('Current columns:');
    console.table(columns);
    
    // Check if production_order_created column exists
    const hasColumn = columns.some(col => col.Field === 'production_order_created');
    
    if (!hasColumn) {
      console.log('\n⚠️  Missing column: production_order_created');
      console.log('Adding column...\n');
      
      await db.sequelize.query(`
        ALTER TABLE production_approvals 
        ADD COLUMN production_order_created BOOLEAN DEFAULT FALSE 
        AFTER approval_status
      `);
      
      console.log('✅ Column added successfully!');
    } else {
      console.log('\n✅ Column already exists!');
    }
    
    // Verify
    const [newColumns] = await db.sequelize.query('DESCRIBE production_approvals');
    console.log('\nUpdated schema:');
    console.table(newColumns);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixSchema();