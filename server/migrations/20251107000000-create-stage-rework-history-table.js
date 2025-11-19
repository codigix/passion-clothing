'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stage_rework_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      production_stage_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'production_stages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      iteration_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Which rework iteration (1=original, 2=first rework, etc.)',
      },
      failure_reason: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Why this iteration failed QC',
      },
      failed_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Quantity that failed in this iteration',
      },
      rework_material_used: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Additional material consumed for rework',
      },
      additional_cost: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Cost incurred for rework',
      },
      status: {
        type: Sequelize.ENUM('failed', 'in_progress', 'completed'),
        defaultValue: 'failed',
      },
      failed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        comment: 'When this iteration failed',
      },
      failed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create indexes for performance
    await queryInterface.addIndex('stage_rework_history', ['production_stage_id']);
    await queryInterface.addIndex('stage_rework_history', ['iteration_number']);
    await queryInterface.addIndex('stage_rework_history', ['status']);
    await queryInterface.addIndex('stage_rework_history', ['failed_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stage_rework_history');
  },
};