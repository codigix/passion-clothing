const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialDispatch = sequelize.define('MaterialDispatch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dispatch_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: DSP-YYYYMMDD-XXXXX'
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
    project_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Project name for this dispatch'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      comment: 'Final product these materials are for'
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Product name for quick reference without joins'
    },
    dispatched_materials: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of materials dispatched: material_name, material_code, quantity_dispatched, uom, barcode, batch_number, location'
    },
    total_items: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total number of material items dispatched'
    },
    dispatch_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes about the dispatch'
    },
    dispatch_photos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of photo URLs for dispatch evidence'
    },
    dispatch_slip_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL of generated dispatch slip PDF'
    },
    dispatched_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Inventory user who dispatched the materials'
    },
    dispatched_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date and time of dispatch'
    },
    received_status: {
      type: DataTypes.ENUM('pending', 'received', 'partial', 'discrepancy'),
      defaultValue: 'pending',
      comment: 'Whether materials have been received by manufacturing'
    }
  }, {
    tableName: 'material_dispatches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['dispatch_number'], unique: true },
      { fields: ['mrn_request_id'] },
      { fields: ['product_id'] },
      { fields: ['project_name'] },
      { fields: ['dispatched_by'] },
      { fields: ['dispatched_at'] },
      { fields: ['received_status'] }
    ]
  });

  return MaterialDispatch;
};