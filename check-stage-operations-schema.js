const db = require('./server/config/database');

(async () => {
  try {
    const [results] = await db.sequelize.query('DESCRIBE stage_operations');
    console.log('\n✅ stage_operations table columns:');
    results.forEach(r => {
      console.log(`  - ${r.Field.padEnd(25)} ${r.Type.padEnd(20)} ${r.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    process.exit(0);
  } catch(e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();