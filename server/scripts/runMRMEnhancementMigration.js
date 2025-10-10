const { sequelize } = require('../config/database');
const Sequelize = require('sequelize');

async function runMigration() {
  try {
    console.log('🔄 Running MRM Enhancement Migration...');
    console.log('Adding: requesting_department, required_by_date, triggered_procurement_ids');
    console.log('');

    const queryInterface = sequelize.getQueryInterface();

    // 1. Make purchase_order_id nullable
    console.log('1️⃣ Making purchase_order_id nullable...');
    await queryInterface.changeColumn('project_material_requests', 'purchase_order_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'purchase_orders',
        key: 'id'
      },
      comment: 'Reference to the Purchase Order (optional for manufacturing-originated requests)'
    });
    console.log('   ✅ Done');

    // 2. Check if requesting_department exists
    console.log('2️⃣ Checking and adding requesting_department...');
    try {
      const [results] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'project_material_requests' 
        AND COLUMN_NAME = 'requesting_department'
      `);
      
      if (results.length === 0) {
        await queryInterface.addColumn('project_material_requests', 'requesting_department', {
          type: Sequelize.ENUM('manufacturing', 'procurement'),
          allowNull: false,
          defaultValue: 'manufacturing',
          comment: 'Department that originated the request',
          after: 'project_name'
        });
        console.log('   ✅ requesting_department added');
      } else {
        console.log('   ℹ️ requesting_department already exists');
      }
    } catch (error) {
      console.error('   ⚠️ Error with requesting_department:', error.message);
    }

    // 3. Check if required_by_date exists
    console.log('3️⃣ Checking and adding required_by_date...');
    try {
      const [results] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'project_material_requests' 
        AND COLUMN_NAME = 'required_by_date'
      `);
      
      if (results.length === 0) {
        await queryInterface.addColumn('project_material_requests', 'required_by_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date by when materials are required (for manufacturing requests)',
          after: 'request_date'
        });
        console.log('   ✅ required_by_date added');
      } else {
        console.log('   ℹ️ required_by_date already exists');
      }
    } catch (error) {
      console.error('   ⚠️ Error with required_by_date:', error.message);
    }

    // 4. Check if triggered_procurement_ids exists
    console.log('4️⃣ Checking and adding triggered_procurement_ids...');
    try {
      const [results] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'project_material_requests' 
        AND COLUMN_NAME = 'triggered_procurement_ids'
      `);
      
      if (results.length === 0) {
        await queryInterface.addColumn('project_material_requests', 'triggered_procurement_ids', {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Array of auto-generated procurement request IDs for unavailable materials',
          after: 'reserved_inventory_ids'
        });
        console.log('   ✅ triggered_procurement_ids added');
      } else {
        console.log('   ℹ️ triggered_procurement_ids already exists');
      }
    } catch (error) {
      console.error('   ⚠️ Error with triggered_procurement_ids:', error.message);
    }

    // 5. Update status enum
    console.log('5️⃣ Updating status enum values...');
    await sequelize.query(`
      ALTER TABLE project_material_requests 
      MODIFY COLUMN status ENUM(
        'pending',
        'pending_inventory_review',
        'reviewed',
        'forwarded_to_inventory',
        'stock_checking',
        'stock_available',
        'partial_available',
        'partially_issued',
        'issued',
        'stock_unavailable',
        'pending_procurement',
        'materials_reserved',
        'materials_ready',
        'materials_issued',
        'completed',
        'cancelled'
      ) DEFAULT 'pending' 
      COMMENT 'Current status of the material request'
    `);
    console.log('   ✅ Status enum updated');

    console.log('');
    console.log('✅ ✅ ✅ MRM Enhancement Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runMigration();