const sequelize = require('./server/config/database').sequelize;

(async () => {
  try {
    // Check if column exists
    const result = await sequelize.query('DESCRIBE shipments');
    const columns = result[0].map(r => r.Field);
    
    if (!columns.includes('recipient_email')) {
      console.log('Adding recipient_email column...');
      await sequelize.query(`
        ALTER TABLE shipments 
        ADD COLUMN recipient_email VARCHAR(100) 
        AFTER recipient_phone
      `);
      console.log('✅ Column added successfully!');
    } else {
      console.log('✅ Column already exists');
    }
    
    // Verify
    const result2 = await sequelize.query('DESCRIBE shipments');
    const columns2 = result2[0].map(r => r.Field);
    console.log('Has recipient_email now:', columns2.includes('recipient_email'));
    
    console.log('\n🎉 Fix complete! The 500 error should be resolved.');
    
  } catch(e) {
    console.log('❌ Error:', e.message);
    process.exit(1);
  }
  process.exit(0);
})();