const {ProductionStage} = require('./server/config/database');

ProductionStage.describe().then(schema => {
  const outsourcingFields = [
    'is_embroidery',
    'is_printing', 
    'customization_type',
    'outsource_type',
    'outsourced',
    'vendor_id',
    'outsource_cost'
  ];
  
  console.log('Outsourcing fields in production_stages table:');
  outsourcingFields.forEach(field => {
    const exists = field in schema;
    console.log(`  ${field}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});