/**
 * Quick fix script to add missing shipment_id column to production_orders table
 * Uses the server's existing Sequelize connection
 */

const { sequelize } = require('./server/config/database');

async function fixShipmentIdColumn() {
  try {
    console.log('🔍 Checking if shipment_id column exists...\n');

    // Check if column exists
    const [result] = await sequelize.query(
      'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = "production_orders" AND COLUMN_NAME = "shipment_id"'
    );

    if (result.length > 0) {
      console.log('✅ shipment_id column already exists!');
      console.log('No action needed.');
      process.exit(0);
    }

    console.log('❌ shipment_id column MISSING - Adding it now...\n');

    // Add the column with transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Add column
      await sequelize.query(`
        ALTER TABLE production_orders
        ADD COLUMN shipment_id INT DEFAULT NULL
      `, { transaction });

      console.log('✓ Added shipment_id column');

      // Add foreign key
      await sequelize.query(`
        ALTER TABLE production_orders
        ADD CONSTRAINT fk_production_orders_shipment
          FOREIGN KEY (shipment_id) REFERENCES shipments(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      `, { transaction });

      console.log('✓ Added foreign key constraint');

      // Add index
      await sequelize.query(`
        ALTER TABLE production_orders
        ADD INDEX idx_production_orders_shipment_id (shipment_id)
      `, { transaction });

      console.log('✓ Added index for performance\n');

      await transaction.commit();

      console.log('✅ Successfully added shipment_id column!\n');
      console.log('Changes made:');
      console.log('  ✓ Added shipment_id INT column (nullable)');
      console.log('  ✓ Added foreign key constraint to shipments table');
      console.log('  ✓ Added index for query performance\n');

      // Verify the column was added
      const [verify] = await sequelize.query('DESCRIBE production_orders shipment_id');
      console.log('✅ Verification successful - Column is present');
      console.log('✅ Fix complete! The Manufacturing Dashboard should now work.\n');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

fixShipmentIdColumn().then(() => {
  console.log('🔄 Restart the backend server: npm start');
  console.log('🔄 Refresh browser to test the fix\n');
  process.exit(0);
});