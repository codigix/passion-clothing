#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// Add server node_modules to the require path
const serverPath = path.join(__dirname, 'server');
process.env.NODE_PATH = path.join(serverPath, 'node_modules');
require('module').Module._initPaths();

const { sequelize } = require('./server/config/database');

async function runMigration() {
  try {
    console.log('🔧 Starting migration: add-on-hold-status-to-sales-orders...');
    
    // Get the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add-on-hold-status-to-sales-orders.js');
    const migration = require(migrationPath);
    
    // Check if migrations table exists, create if not
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sequelizemeta (
        name VARCHAR(255) PRIMARY KEY,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Run the migration
    const queryInterface = sequelize.getQueryInterface();
    const Sequelize = require('sequelize');
    
    console.log('Running migration up...');
    await migration.up(queryInterface, Sequelize);
    
    // Record migration
    const migrationName = path.basename(migrationPath);
    await sequelize.query(`
      INSERT IGNORE INTO sequelizemeta (name) VALUES (?)
    `, { replacements: [migrationName] });
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();