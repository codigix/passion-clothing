/**
 * Migration: Add production_approval_id to production_orders table
 * This links production orders to the approval that triggered their creation
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('production_orders', 'production_approval_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'production_approvals',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Link to the production approval that triggered this order'
    });

    // Add index for better query performance
    await queryInterface.addIndex('production_orders', ['production_approval_id'], {
      name: 'idx_production_orders_approval_id'
    });

    console.log('✅ Added production_approval_id column to production_orders table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('production_orders', 'idx_production_orders_approval_id');
    await queryInterface.removeColumn('production_orders', 'production_approval_id');
    console.log('✅ Removed production_approval_id column from production_orders table');
  }
};