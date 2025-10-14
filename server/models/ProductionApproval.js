const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionApproval = sequelize.define('ProductionApproval', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    approval_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: PRD-APV-YYYYMMDD-XXXXX'
    },
    mrn_request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'project_material_requests',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Reference to the MRN request'
    },
    verification_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'material_verifications',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Reference to the verification record'
    },
    production_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'production_orders',
        key: 'id'
      },
      comment: 'Reference to production order if created'
    },
    project_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Project name for this approval'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      comment: 'Final product to be manufactured'
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Product name for quick reference without joins'
    },
    approval_status: {
      type: DataTypes.ENUM('approved', 'rejected', 'conditional'),
      allowNull: false,
      comment: 'Approval decision'
    },
    production_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Planned production start date'
    },
    material_allocations: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of material allocations: material_name, material_code, quantity_allocated, production_order_id, allocation_date'
    },
    approval_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes from approver'
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason if rejected'
    },
    conditions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Conditions if conditional approval'
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Manufacturing manager who approved'
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date and time of approval'
    },
    production_started: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether production has started'
    },
    production_started_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when production started'
    }
  }, {
    tableName: 'production_approvals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['approval_number'], unique: true },
      { fields: ['mrn_request_id'] },
      { fields: ['verification_id'] },
      { fields: ['production_order_id'] },
      { fields: ['product_id'] },
      { fields: ['project_name'] },
      { fields: ['approval_status'] },
      { fields: ['approved_by'] },
      { fields: ['approved_at'] },
      { fields: ['production_started'] }
    ]
  });

  return ProductionApproval;
};