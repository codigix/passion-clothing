const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GoodsReceiptNote = sequelize.define('GoodsReceiptNote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  grn_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  purchase_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'purchase_orders',
      key: 'id'
    }
  },
  bill_of_materials_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Optional - GRN can be created from PO alone
    references: {
      model: 'bill_of_materials',
      key: 'id'
    }
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Optional - GRN can be created from PO alone
    references: {
      model: 'sales_orders',
      key: 'id'
    }
  },
  received_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  supplier_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  supplier_invoice_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  inward_challan_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  items_received: {
    type: DataTypes.JSON,
    allowNull: false,
    // Structure: [{ material_id, material_name, ordered_quantity, invoiced_quantity, received_quantity, unit, quality_status, remarks, variance_type }]
  },
  total_received_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('draft', 'received', 'inspected', 'approved', 'rejected', 'vendor_revert_requested'),
    defaultValue: 'draft'
  },
  inspection_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quality_inspector: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approval_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    // Array of file paths or URLs
  },
  // Verification workflow fields
  verification_status: {
    type: DataTypes.ENUM('pending', 'verified', 'discrepancy', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  verification_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verification_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discrepancy_details: {
    type: DataTypes.JSON,
    allowNull: true,
    // Structure: { qty_mismatch: boolean, weight_mismatch: boolean, quality_issue: boolean, details: string }
  },
  discrepancy_approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  discrepancy_approval_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  discrepancy_approval_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  inventory_added: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  inventory_added_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Vendor Revert/Dispute fields
  vendor_revert_requested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  vendor_revert_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vendor_revert_items: {
    type: DataTypes.JSON,
    allowNull: true,
    // Structure: [{ material_name, ordered_qty, received_qty, shortage_qty, notes }]
  },
  vendor_revert_requested_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  vendor_revert_requested_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  vendor_response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vendor_response_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'goods_receipt_notes',
  timestamps: true,
  indexes: [
    { fields: ['purchase_order_id'] },
    { fields: ['bill_of_materials_id'] },
    { fields: ['sales_order_id'] },
    { fields: ['status'] },
    { fields: ['verification_status'] },
    { fields: ['grn_number'] }
  ]
});

	return GoodsReceiptNote;
};