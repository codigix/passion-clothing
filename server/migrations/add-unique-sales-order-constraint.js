/**
 * Migration: Add unique constraint on sales_order_id in production_requests table
 * 
 * This prevents multiple production requests from being created for the same sales order.
 * Note: Run cleanup-duplicate-production-requests.sql BEFORE running this migration
 * to ensure there are no existing duplicates.
 */

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // Add a unique index on sales_order_id (allowing NULLs for PO-based requests)
    // MySQL allows multiple NULLs in a unique index, so PO-based requests are unaffected
    await queryInterface.addIndex('production_requests', ['sales_order_id'], {
      unique: true,
      name: 'unique_sales_order_id',
      where: {
        sales_order_id: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    console.log('✅ Added unique constraint on production_requests.sales_order_id');
  },

  down: async (queryInterface) => {
    // Remove the unique index
    await queryInterface.removeIndex('production_requests', 'unique_sales_order_id');
    
    console.log('✅ Removed unique constraint from production_requests.sales_order_id');
  }
};