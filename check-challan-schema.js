const { Challan } = require('./server/config/database');

Challan.describe().then(schema => {
  console.log('Challan table columns:');
  Object.keys(schema).forEach(col => console.log(`  - ${col}`));
  
  const hasStageId = 'production_stage_id' in schema;
  console.log(`\n❓ Has production_stage_id? ${hasStageId ? '✅ YES' : '❌ NO'}`);
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});