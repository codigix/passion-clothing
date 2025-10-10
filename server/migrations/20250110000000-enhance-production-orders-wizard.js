'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add missing fields to production_orders table
    await queryInterface.addColumn('production_orders', 'qa_lead_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      comment: 'QA Lead responsible for quality checks'
    });

    await queryInterface.addColumn('production_orders', 'shift', {
      type: Sequelize.ENUM('morning', 'afternoon', 'evening', 'night', 'day', 'flexible'),
      allowNull: true,
      comment: 'Production shift schedule'
    });

    await queryInterface.addColumn('production_orders', 'team_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Notes about team assignments and responsibilities'
    });

    // 2. Create material_requirements table
    await queryInterface.createTable('material_requirements', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      production_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'production_orders',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      material_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Material ID or inventory item code'
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      required_quantity: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false
      },
      allocated_quantity: {
        type: Sequelize.DECIMAL(10, 3),
        defaultValue: 0.000
      },
      consumed_quantity: {
        type: Sequelize.DECIMAL(10, 3),
        defaultValue: 0.000
      },
      unit: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Meter, Kg, Pcs, etc.'
      },
      status: {
        type: Sequelize.ENUM('available', 'shortage', 'ordered', 'allocated', 'consumed'),
        defaultValue: 'available'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for material_requirements
    await queryInterface.addIndex('material_requirements', ['production_order_id']);
    await queryInterface.addIndex('material_requirements', ['material_id']);
    await queryInterface.addIndex('material_requirements', ['status']);

    // 3. Create quality_checkpoints table
    await queryInterface.createTable('quality_checkpoints', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      production_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'production_orders',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      production_stage_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'production_stages',
          key: 'id'
        },
        onDelete: 'SET NULL',
        comment: 'Optional: Link checkpoint to specific stage'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Checkpoint name/title'
      },
      frequency: {
        type: Sequelize.ENUM('per_batch', 'per_unit', 'per_stage', 'hourly', 'daily', 'final'),
        allowNull: false,
        defaultValue: 'per_batch'
      },
      acceptance_criteria: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'What makes this checkpoint pass'
      },
      checkpoint_order: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Order in which checkpoints should be performed'
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'passed', 'failed', 'skipped'),
        defaultValue: 'pending'
      },
      checked_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      checked_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      result: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Actual results/observations'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for quality_checkpoints
    await queryInterface.addIndex('quality_checkpoints', ['production_order_id']);
    await queryInterface.addIndex('quality_checkpoints', ['production_stage_id']);
    await queryInterface.addIndex('quality_checkpoints', ['status']);
    await queryInterface.addIndex('quality_checkpoints', ['frequency']);
    await queryInterface.addIndex('quality_checkpoints', ['checked_by']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables
    await queryInterface.dropTable('quality_checkpoints');
    await queryInterface.dropTable('material_requirements');

    // Remove columns from production_orders
    await queryInterface.removeColumn('production_orders', 'team_notes');
    await queryInterface.removeColumn('production_orders', 'shift');
    await queryInterface.removeColumn('production_orders', 'qa_lead_id');
  }
};