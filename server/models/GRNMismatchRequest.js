const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GRNMismatchRequest = sequelize.define('GRNMismatchRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    request_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: GMR-YYYYMMDD-XXXXX (GRN Mismatch Request)'
    },
    grn_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'goods_receipt_notes',
        key: 'id'
      },
      comment: 'Reference to the GRN with mismatches'
    },
    purchase_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'purchase_orders',
        key: 'id'
      },
      comment: 'Reference to the Purchase Order'
    },
    grn_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'GRN number for quick reference'
    },
    po_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'PO number for quick reference'
    },
    vendor_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Vendor name'
    },
    mismatch_type: {
      type: DataTypes.ENUM('shortage', 'overage', 'both'),
      allowNull: false,
      comment: 'Type of mismatch detected'
    },
    mismatch_items: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: `Array of mismatched items with structure:
        {
          item_name: string,
          color: string,
          gsm: string,
          uom: string,
          po_quantity: number,
          received_quantity: number,
          invoiced_quantity: number,
          shortage_quantity: number (if applicable),
          overage_quantity: number (if applicable),
          shortage_reason: string (optional),
          action_required: string (e.g., 'Accept shortage', 'Return overage'),
          notes: string
        }`
    },
    total_shortage_items: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Count of items with shortages'
    },
    total_overage_items: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Count of items with overages'
    },
    total_shortage_value: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Total value of shortage items'
    },
    total_overage_value: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Total value of overage items'
    },
    request_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Detailed description of mismatches and impact'
    },
    requested_action: {
      type: DataTypes.ENUM(
        'accept_shortage',           // Accept the shortage and close PO
        'return_overage',            // Return excess materials to vendor
        'wait_for_remaining',        // Wait for remaining materials from vendor
        'accept_and_adjust',         // Accept with price adjustment
        'request_replacement',       // Request replacement from vendor
        'cancel_remaining',          // Cancel remaining PO quantity
        'other'                      // Other (specify in notes)
      ),
      allowNull: false,
      comment: 'Action requested from Procurement team'
    },
    requested_action_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes about requested action'
    },
    status: {
      type: DataTypes.ENUM(
        'pending',              // Request created, awaiting procurement review
        'acknowledged',         // Procurement acknowledged receipt
        'under_review',         // Procurement reviewing the request
        'approved',             // Procurement approved the request
        'rejected',             // Procurement rejected the request
        'in_progress',          // Action in progress (e.g., coordinating with vendor)
        'resolved',             // Issue resolved
        'cancelled'             // Request cancelled
      ),
      defaultValue: 'pending',
      comment: 'Current status of the mismatch request'
    },
    approval_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Approval/rejection notes from procurement team'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Inventory user who created the request'
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Procurement user who reviewed/approved'
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when reviewed/approved'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'grn_mismatch_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['request_number'] },
      { fields: ['grn_id'] },
      { fields: ['purchase_order_id'] },
      { fields: ['po_number'] },
      { fields: ['grn_number'] },
      { fields: ['status'] },
      { fields: ['mismatch_type'] },
      { fields: ['requested_action'] },
      { fields: ['created_by'] },
      { fields: ['reviewed_by'] },
      { fields: ['created_at'] }
    ]
  });

  return GRNMismatchRequest;
};
