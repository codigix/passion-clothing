'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if stage_operation_id column exists
    const tableDescription = await queryInterface.describeTable('material_consumption');
    
    if (!tableDescription.stage_operation_id) {
      await queryInterface.addColumn('material_consumption', 'stage_operation_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'stage_operations',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        after: 'production_stage_id'
      });
      
      await queryInterface.addIndex('material_consumption', ['stage_operation_id']);
    }
    
    if (!tableDescription.inventory_id) {
      await queryInterface.addColumn('material_consumption', 'inventory_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'inventory',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        after: 'stage_operation_id'
      });
      
      await queryInterface.addIndex('material_consumption', ['inventory_id']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('material_consumption', 'inventory_id');
    await queryInterface.removeColumn('material_consumption', 'stage_operation_id');
  }
};