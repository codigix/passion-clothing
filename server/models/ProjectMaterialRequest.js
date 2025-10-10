const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProjectMaterialRequest = sequelize.define('ProjectMaterialRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    request_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: PMR-YYYYMMDD-XXXXX'
    },
    purchase_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Optional - only required for procurement-originated requests
      references: {
        model: 'purchase_orders',
        key: 'id'
      },
      comment: 'Reference to the Purchase Order (optional for manufacturing-originated requests)'
    },
    sales_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sales_orders',
        key: 'id'
      },
      comment: 'Reference to the Sales Order if linked'
    },
    project_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Project name from the PO'
    },
    requesting_department: {
      type: DataTypes.ENUM('manufacturing', 'procurement'),
      allowNull: false,
      defaultValue: 'manufacturing',
      comment: 'Department that originated the request'
    },
    request_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date when the request was created'
    },
    required_by_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date by when materials are required (for manufacturing requests)'
    },
    expected_delivery_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expected delivery date from vendor'
    },
    materials_requested: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of materials with tracking: material_name, material_code, description, quantity_required, uom, purpose, available_qty, issued_qty, balance_qty, status, remarks'
    },
    total_items: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total number of material items'
    },
    total_value: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Total value of all materials'
    },
    status: {
      type: DataTypes.ENUM(
        'pending',                   // Request created, awaiting review
        'pending_inventory_review',  // Manufacturing submitted, awaiting inventory review (MRN flow)
        'reviewed',                  // Manufacturing reviewed the request (Procurement flow)
        'forwarded_to_inventory',    // Manufacturing forwarded to inventory
        'stock_checking',            // Inventory checking stock availability
        'stock_available',           // All materials available in stock
        'partial_available',         // Some materials available
        'partially_issued',          // Some materials issued (MRN specific)
        'issued',                    // All materials issued (MRN specific)
        'stock_unavailable',         // Materials not available
        'pending_procurement',       // Materials unavailable, procurement request triggered (MRN specific)
        'materials_reserved',        // Materials reserved for project
        'materials_ready',           // Materials ready for production
        'materials_issued',          // Materials issued to manufacturing
        'completed',                 // Request fulfilled
        'cancelled'                  // Request cancelled
      ),
      defaultValue: 'pending',
      comment: 'Current status of the material request'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      comment: 'Priority level of the request'
    },
    stock_availability: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Stock availability details: material_name, requested_qty, available_qty, shortage_qty, status'
    },
    reserved_inventory_ids: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of inventory IDs reserved for this project'
    },
    triggered_procurement_ids: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of auto-generated procurement request IDs for unavailable materials'
    },
    procurement_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes from procurement team'
    },
    manufacturing_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes from manufacturing team'
    },
    inventory_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes from inventory team'
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of attachment files: filename, url, uploaded_at'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who created the request (procurement)'
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Manufacturing user who reviewed the request'
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when manufacturing reviewed the request'
    },
    forwarded_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Manufacturing user who forwarded to inventory'
    },
    forwarded_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when forwarded to inventory'
    },
    processed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Inventory user who processed the request'
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when inventory processed the request'
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when request was completed'
    }
  }, {
    tableName: 'project_material_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['request_number'] },
      { fields: ['purchase_order_id'] },
      { fields: ['sales_order_id'] },
      { fields: ['project_name'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['request_date'] },
      { fields: ['created_by'] },
      { fields: ['reviewed_by'] },
      { fields: ['forwarded_by'] },
      { fields: ['processed_by'] }
    ]
  });

  return ProjectMaterialRequest;
};