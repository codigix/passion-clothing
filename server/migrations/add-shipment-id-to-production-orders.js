/**
 * Migration: Add shipment_id column to production_orders table
 * This allows production orders to be linked to shipments when marked as "ready for shipment"
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Check if column already exists
      const table = await queryInterface.describeTable('production_orders', { transaction });
      
      if (!table.shipment_id) {
        // Add shipment_id column
        await queryInterface.addColumn(
          'production_orders',
          'shipment_id',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'shipments',
              key: 'id'
            },
            comment: 'Reference to shipment when production order is ready for shipment',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
          },
          { transaction }
        );

        // Add index on shipment_id for better query performance
        await queryInterface.addIndex(
          'production_orders',
          ['shipment_id'],
          {
            name: 'idx_production_orders_shipment_id',
            transaction
          }
        );

        console.log('✅ Successfully added shipment_id column to production_orders table');
      } else {
        console.log('⚠️  shipment_id column already exists in production_orders table');
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Check if column exists before removing
      const table = await queryInterface.describeTable('production_orders', { transaction });
      
      if (table.shipment_id) {
        // Remove index first
        try {
          await queryInterface.removeIndex(
            'production_orders',
            'idx_production_orders_shipment_id',
            { transaction }
          );
        } catch (e) {
          console.warn('Index not found, continuing with column removal');
        }

        // Remove shipment_id column
        await queryInterface.removeColumn(
          'production_orders',
          'shipment_id',
          { transaction }
        );

        console.log('✅ Successfully removed shipment_id column from production_orders table');
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback error:', error);
      throw error;
    }
  }
};