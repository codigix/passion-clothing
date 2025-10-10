'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Make purchase_order_id nullable
    await queryInterface.changeColumn('project_material_requests', 'purchase_order_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'purchase_orders',
        key: 'id'
      },
      comment: 'Reference to the Purchase Order (optional for manufacturing-originated requests)'
    });

    // 2. Add requesting_department field
    await queryInterface.addColumn('project_material_requests', 'requesting_department', {
      type: Sequelize.ENUM('manufacturing', 'procurement'),
      allowNull: false,
      defaultValue: 'manufacturing',
      comment: 'Department that originated the request',
      after: 'project_name'
    });

    // 3. Add required_by_date field
    await queryInterface.addColumn('project_material_requests', 'required_by_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Date by when materials are required (for manufacturing requests)',
      after: 'request_date'
    });

    // 4. Add triggered_procurement_ids field
    await queryInterface.addColumn('project_material_requests', 'triggered_procurement_ids', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of auto-generated procurement request IDs for unavailable materials',
      after: 'reserved_inventory_ids'
    });

    // 5. Update status enum to include new MRN-specific statuses
    // Note: In MySQL, we need to modify the ENUM by adding new values
    await queryInterface.sequelize.query(`
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

    console.log('✅ Enhanced project_material_requests table for MRN workflow');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes
    await queryInterface.removeColumn('project_material_requests', 'triggered_procurement_ids');
    await queryInterface.removeColumn('project_material_requests', 'required_by_date');
    await queryInterface.removeColumn('project_material_requests', 'requesting_department');
    
    // Revert status enum to original
    await queryInterface.sequelize.query(`
      ALTER TABLE project_material_requests 
      MODIFY COLUMN status ENUM(
        'pending',
        'reviewed',
        'forwarded_to_inventory',
        'stock_checking',
        'stock_available',
        'partial_available',
        'stock_unavailable',
        'materials_reserved',
        'materials_ready',
        'materials_issued',
        'completed',
        'cancelled'
      ) DEFAULT 'pending'
    `);

    // Make purchase_order_id NOT NULL again
    await queryInterface.changeColumn('project_material_requests', 'purchase_order_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'purchase_orders',
        key: 'id'
      }
    });

    console.log('✅ Reverted project_material_requests table changes');
  }
};