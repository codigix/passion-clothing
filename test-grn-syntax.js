try {
  const grnRoutes = require('./server/routes/grn.js');
  console.log('✅ GRN routes loaded successfully - no syntax errors');
  process.exit(0);
} catch (error) {
  console.error('❌ Syntax error in grn.js:', error.message);
  console.error(error.stack);
  process.exit(1);
}
