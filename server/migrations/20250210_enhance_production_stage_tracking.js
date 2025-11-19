'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to production_stages for enhanced tracking
    await queryInterface.addColumn('production_stages', 'is_late', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'True if stage exceeded planned_end_time'
    });

    await queryInterface.addColumn('production_stages', 'late_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Reason for delay if stage is late'
    });

    await queryInterface.addColumn('production_stages', 'is_frozen', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'True if stage is frozen due to being late - prevents further changes'
    });

    await queryInterface.addColumn('production_stages', 'rework_iteration', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      comment: 'Which iteration of this stage (1=first, 2=rework, etc.)'
    });

    await queryInterface.addColumn('production_stages', 'total_material_used', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Total quantity of material consumed in this stage'
    });

    await queryInterface.addColumn('production_stages', 'quality_approved', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether all quality checkpoints have been approved for this stage'
    });

    await queryInterface.addColumn('production_stages', 'approved_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When the stage was approved by QA'
    });

    await queryInterface.addColumn('production_stages', 'approved_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who approved the stage'
    });

    // Create stage_rework_history table
    await queryInterface.createTable('stage_rework_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      production_stage_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'production_stages', key: 'id' },
        onDelete: 'CASCADE'
      },
      iteration_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Which rework iteration (1=original, 2=first rework, etc.)'
      },
      failure_reason: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Why this iteration failed QC'
      },
      failed_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Quantity that failed in this iteration'
      },
      rework_material_used: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Additional material consumed for rework'
      },
      additional_cost: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Cost incurred for rework'
      },
      status: {
        type: Sequelize.ENUM('failed', 'in_progress', 'completed'),
        defaultValue: 'failed'
      },
      failed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        comment: 'When this iteration failed'
      },
      failed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    }, {
      indexes: [
        { fields: ['production_stage_id'] },
        { fields: ['iteration_number'] },
        { fields: ['status'] }
      ]
    });

    // Create material_returns table
    await queryInterface.createTable('material_returns', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      production_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'production_orders', key: 'id' },
        onDelete: 'CASCADE'
      },
      return_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        comment: 'When materials are being returned'
      },
      status: {
        type: Sequelize.ENUM('pending_approval', 'approved', 'returned', 'rejected'),
        defaultValue: 'pending_approval'
      },
      total_materials: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of materials being returned with quantities'
      },
      approval_notes: {
        type: Sequelize.TEXT,
        comment: 'Notes during approval'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      returned_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      returned_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        comment: 'If rejected, why?'
      },
      inventory_movement_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'inventory_movements', key: 'id' },
        comment: 'Reference to the inventory movement created when materials are returned'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    }, {
      indexes: [
        { fields: ['production_order_id'] },
        { fields: ['status'] },
        { fields: ['return_date'] }
      ]
    });

    // Add index for better query performance
    await queryInterface.addIndex('production_stages', ['is_late'], {
      name: 'idx_production_stages_is_late'
    });

    await queryInterface.addIndex('production_stages', ['is_frozen'], {
      name: 'idx_production_stages_is_frozen'
    });

    await queryInterface.addIndex('production_stages', ['quality_approved'], {
      name: 'idx_production_stages_quality_approved'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables
    await queryInterface.dropTable('material_returns', { cascade: true });
    await queryInterface.dropTable('stage_rework_history', { cascade: true });

    // Remove columns from production_stages
    const tableDescription = await queryInterface.describeTable('production_stages');
    
    if (tableDescription.is_late) {
      await queryInterface.removeColumn('production_stages', 'is_late');
    }
    if (tableDescription.late_reason) {
      await queryInterface.removeColumn('production_stages', 'late_reason');
    }
    if (tableDescription.is_frozen) {
      await queryInterface.removeColumn('production_stages', 'is_frozen');
    }
    if (tableDescription.rework_iteration) {
      await queryInterface.removeColumn('production_stages', 'rework_iteration');
    }
    if (tableDescription.total_material_used) {
      await queryInterface.removeColumn('production_stages', 'total_material_used');
    }
    if (tableDescription.quality_approved) {
      await queryInterface.removeColumn('production_stages', 'quality_approved');
    }
    if (tableDescription.approved_at) {
      await queryInterface.removeColumn('production_stages', 'approved_at');
    }
    if (tableDescription.approved_by) {
      await queryInterface.removeColumn('production_stages', 'approved_by');
    }

    // Remove indexes
    try {
      await queryInterface.removeIndex('production_stages', 'idx_production_stages_is_late');
    } catch (e) { /* ignore */ }
    try {
      await queryInterface.removeIndex('production_stages', 'idx_production_stages_is_frozen');
    } catch (e) { /* ignore */ }
    try {
      await queryInterface.removeIndex('production_stages', 'idx_production_stages_quality_approved');
    } catch (e) { /* ignore */ }
  }
};