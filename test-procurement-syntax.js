try {
  const procurementRoutes = require('./server/routes/procurement.js');
  console.log('✅ Procurement routes loaded successfully - no syntax errors');
  process.exit(0);
} catch (error) {
  console.error('❌ Syntax error in procurement.js:', error.message);
  console.error(error.stack);
  process.exit(1);
}
