'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add outsourcing-related columns to stage_operations table
    await queryInterface.addColumn('stage_operations', 'is_outsourced', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this operation is outsourced to a vendor'
    });

    await queryInterface.addColumn('stage_operations', 'vendor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Vendor ID if outsourced'
    });

    await queryInterface.addColumn('stage_operations', 'work_order_number', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Work order number for outsourced operation'
    });

    await queryInterface.addColumn('stage_operations', 'expected_completion_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Expected completion date for outsourced work'
    });

    await queryInterface.addColumn('stage_operations', 'actual_completion_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Actual completion date when received from vendor'
    });

    await queryInterface.addColumn('stage_operations', 'design_files', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of design file URLs and metadata for outsourced operations'
    });

    await queryInterface.addColumn('stage_operations', 'vendor_remarks', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Remarks specific to vendor/outsourcing'
    });

    await queryInterface.addColumn('stage_operations', 'outsourced_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Date when work was sent to vendor'
    });

    await queryInterface.addColumn('stage_operations', 'received_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Date when work was received from vendor'
    });

    await queryInterface.addColumn('stage_operations', 'outsourcing_cost', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Cost for outsourced operation'
    });

    // Modify status enum to include 'outsourced' and 'received'
    await queryInterface.sequelize.query(`
      ALTER TABLE stage_operations 
      MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed', 'skipped', 'outsourced', 'received') 
      DEFAULT 'pending'
    `);

    // Add indexes for new fields
    await queryInterface.addIndex('stage_operations', ['is_outsourced'], {
      name: 'idx_stage_operations_is_outsourced'
    });

    await queryInterface.addIndex('stage_operations', ['vendor_id'], {
      name: 'idx_stage_operations_vendor_id'
    });

    await queryInterface.addIndex('stage_operations', ['work_order_number'], {
      name: 'idx_stage_operations_work_order_number'
    });

    console.log('✅ Added outsourcing support to stage_operations table');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('stage_operations', 'idx_stage_operations_is_outsourced');
    await queryInterface.removeIndex('stage_operations', 'idx_stage_operations_vendor_id');
    await queryInterface.removeIndex('stage_operations', 'idx_stage_operations_work_order_number');

    // Remove columns
    await queryInterface.removeColumn('stage_operations', 'is_outsourced');
    await queryInterface.removeColumn('stage_operations', 'vendor_id');
    await queryInterface.removeColumn('stage_operations', 'work_order_number');
    await queryInterface.removeColumn('stage_operations', 'expected_completion_date');
    await queryInterface.removeColumn('stage_operations', 'actual_completion_date');
    await queryInterface.removeColumn('stage_operations', 'design_files');
    await queryInterface.removeColumn('stage_operations', 'vendor_remarks');
    await queryInterface.removeColumn('stage_operations', 'outsourced_at');
    await queryInterface.removeColumn('stage_operations', 'received_at');
    await queryInterface.removeColumn('stage_operations', 'outsourcing_cost');

    // Restore original status enum
    await queryInterface.sequelize.query(`
      ALTER TABLE stage_operations 
      MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed', 'skipped') 
      DEFAULT 'pending'
    `);

    console.log('✅ Removed outsourcing support from stage_operations table');
  }
};