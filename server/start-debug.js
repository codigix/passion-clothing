// Debug server startup
console.log('Starting server in debug mode...\n');

try {
  console.log('Loading express...');
  const express = require('express');
  
  console.log('Loading environment...');
  require('dotenv').config();
  
  console.log('Loading database...');
  const { sequelize } = require('./config/database');
  
  console.log('Loading routes...');
  console.log('  - auth');
  const authRoutes = require('./routes/auth');
  console.log('  - users');
  const userRoutes = require('./routes/users');
  console.log('  - inventory');
  const inventoryRoutes = require('./routes/inventory');
  console.log('  - grn');
  const grnRoutes = require('./routes/grn');
  
  console.log('\n✅ All modules loaded successfully!');
  console.log('Starting full server...\n');
  
  require('./index.js');
  
} catch (error) {
  console.error('\n❌ ERROR LOADING MODULES:');
  console.error(error);
  process.exit(1);
}