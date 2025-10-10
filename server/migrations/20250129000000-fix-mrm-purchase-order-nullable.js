'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔧 Making purchase_order_id nullable in project_material_requests...');
    
    try {
      // Check if table exists
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('project_material_requests')) {
        console.log('⊘ Table project_material_requests does not exist, skipping...');
        return;
      }

      // Check current column definition
      const [columns] = await queryInterface.sequelize.query(`
        DESCRIBE project_material_requests
      `);
      
      const purchaseOrderCol = columns.find(c => c.Field === 'purchase_order_id');
      
      if (!purchaseOrderCol) {
        console.log('⊘ Column purchase_order_id does not exist, skipping...');
        return;
      }
      
      if (purchaseOrderCol.Null === 'YES') {
        console.log('✓ Column purchase_order_id already allows NULL, no change needed');
        return;
      }

      // Modify the column to allow NULL
      await queryInterface.changeColumn('project_material_requests', 'purchase_order_id', {
        type: Sequelize.INTEGER,
        allowNull: true, // Changed from false to true
        references: {
          model: 'purchase_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      console.log('✅ Successfully changed purchase_order_id to allow NULL');
      console.log('   This enables standalone MRN creation from Manufacturing without a PO');
      
    } catch (error) {
      console.error('❌ Error modifying column:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔙 Reverting purchase_order_id to NOT NULL...');
    
    try {
      await queryInterface.changeColumn('project_material_requests', 'purchase_order_id', {
        type: Sequelize.INTEGER,
        allowNull: false, // Revert back to NOT NULL
        references: {
          model: 'purchase_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      console.log('✅ Reverted purchase_order_id to NOT NULL');
      
    } catch (error) {
      console.error('❌ Error reverting column:', error.message);
      throw error;
    }
  }
};