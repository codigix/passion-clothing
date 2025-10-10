'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('production_approvals', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      approval_number: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
        comment: 'Format: PRD-APV-YYYYMMDD-XXXXX'
      },
      mrn_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'project_material_requests',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Reference to the MRN request'
      },
      verification_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'material_verifications',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Reference to the verification record'
      },
      production_order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'production_orders',
          key: 'id'
        },
        comment: 'Reference to production order if created'
      },
      project_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Project name for this approval'
      },
      approval_status: {
        type: Sequelize.ENUM('approved', 'rejected', 'conditional'),
        allowNull: false,
        comment: 'Approval decision'
      },
      production_start_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Planned production start date'
      },
      material_allocations: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of material allocations'
      },
      approval_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notes from approver'
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Reason if rejected'
      },
      conditions: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Conditions if conditional approval'
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Manufacturing manager who approved'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Date and time of approval'
      },
      production_started: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether production has started'
      },
      production_started_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when production started'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('production_approvals', ['approval_number'], {
      unique: true,
      name: 'idx_production_approvals_approval_number'
    });
    await queryInterface.addIndex('production_approvals', ['mrn_request_id'], {
      name: 'idx_production_approvals_mrn_request_id'
    });
    await queryInterface.addIndex('production_approvals', ['verification_id'], {
      name: 'idx_production_approvals_verification_id'
    });
    await queryInterface.addIndex('production_approvals', ['approval_status'], {
      name: 'idx_production_approvals_approval_status'
    });
    await queryInterface.addIndex('production_approvals', ['production_started'], {
      name: 'idx_production_approvals_production_started'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('production_approvals');
  }
};