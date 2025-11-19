const { sequelize, HSNCode } = require('../config/database');
const seedHSNCodes = require('../seeders/seed-hsn-codes');

const setupHSNCodes = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established.');

    console.log('\nRunning HSN Codes migration...');
    const migrationPath = require('path').join(__dirname, '../migrations/20250110_create_hsn_codes_table');
    const migration = require(migrationPath);
    
    try {
      await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
      console.log('✓ HSN Codes table created.');
    } catch (error) {
      if (error.message.includes('ER_TABLE_EXISTS_ERROR') || error.message.includes('already exists')) {
        console.log('✓ HSN Codes table already exists.');
      } else {
        throw error;
      }
    }

    console.log('\nSeeding HSN Codes data...');
    await seedHSNCodes();
    console.log('✓ HSN Codes seeded successfully.');

    console.log('\n✅ HSN Codes setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up HSN Codes:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  setupHSNCodes().then(() => {
    if (!process.exitCode) {
      console.log('\nSetup complete. Exiting...');
    }
  });
}

module.exports = setupHSNCodes;
