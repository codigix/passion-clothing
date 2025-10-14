/**
 * Migration: Add project_reference field to production_orders
 * 
 * This migration adds a project_reference column to track which project/sales order
 * this production order belongs to. This enables:
 * - Multiple production orders for the same project
 * - Multiple MRNs linked to the same project
 * - Better tracking and grouping of production activities
 */

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 Adding project_reference column to production_orders...');
      
      // Add project_reference column
      await queryInterface.addColumn(
        'production_orders',
        'project_reference',
        {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: 'Project reference (usually sales_order_number) for grouping multiple production orders'
        },
        { transaction }
      );

      // Add index for better query performance
      await queryInterface.addIndex(
        'production_orders',
        ['project_reference'],
        {
          name: 'idx_production_orders_project_reference',
          transaction
        }
      );

      // Migrate existing data: populate project_reference from sales_order_number
      await queryInterface.sequelize.query(`
        UPDATE production_orders po
        INNER JOIN sales_orders so ON po.sales_order_id = so.id
        SET po.project_reference = so.order_number
        WHERE po.sales_order_id IS NOT NULL AND po.project_reference IS NULL
      `, { transaction });

      console.log('✅ Migration completed successfully');
      await transaction.commit();
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 Removing project_reference column from production_orders...');
      
      // Remove index first
      await queryInterface.removeIndex(
        'production_orders',
        'idx_production_orders_project_reference',
        { transaction }
      );

      // Remove column
      await queryInterface.removeColumn(
        'production_orders',
        'project_reference',
        { transaction }
      );

      console.log('✅ Rollback completed successfully');
      await transaction.commit();
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};