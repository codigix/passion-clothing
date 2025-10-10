const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialReceipt = sequelize.define('MaterialReceipt', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    receipt_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: MRN-RCV-YYYYMMDD-XXXXX'
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
    dispatch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'material_dispatches',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Reference to the dispatch record'
    },
    project_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Project name for this receipt'
    },
    received_materials: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of materials received: material_name, material_code, quantity_dispatched, quantity_received, uom, barcode_scanned, condition, remarks'
    },
    total_items_received: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total number of material items received'
    },
    has_discrepancy: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether there are any discrepancies'
    },
    discrepancy_details: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of discrepancies: material_name, issue_type (shortage/damage/wrong_item), expected_qty, received_qty, description'
    },
    receipt_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes about the receipt'
    },
    receipt_photos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of photo URLs for receipt evidence'
    },
    received_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Manufacturing user who received the materials'
    },
    received_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date and time of receipt'
    },
    verification_status: {
      type: DataTypes.ENUM('pending', 'verified', 'failed'),
      defaultValue: 'pending',
      comment: 'QC verification status'
    }
  }, {
    tableName: 'material_receipts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['receipt_number'], unique: true },
      { fields: ['mrn_request_id'] },
      { fields: ['dispatch_id'] },
      { fields: ['project_name'] },
      { fields: ['received_by'] },
      { fields: ['received_at'] },
      { fields: ['has_discrepancy'] },
      { fields: ['verification_status'] }
    ]
  });

  return MaterialReceipt;
};