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
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'vendors',
      key: 'id'
    },
    comment: 'Vendor associated with this GRN (denormalized from PO for reliability)'
  },
  bill_of_materials_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'bill_of_materials',
      key: 'id'
    }
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sales_orders',
      key: 'id'
    }
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
  },
  total_received_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('draft', 'received', 'inspected', 'approved', 'rejected', 'vendor_revert_requested', 'excess_received'),
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
  },
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
  },
  grn_sequence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Sequence number for GRN against same PO (1st GRN, 2nd GRN, etc.)'
  },
  is_first_grn: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this is the first GRN for the PO'
  },
  original_grn_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'goods_receipt_notes',
      key: 'id'
    },
    comment: 'Reference to first GRN when this is a shortage fulfillment GRN'
  },
  shortage_fulfillment_metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Metadata for shortage fulfillment: { original_grn_number, vendor_request_id, vendor_request_number, complaint_date }'
  }
}, {
  tableName: 'goods_receipt_notes',
  timestamps: true,
  indexes: [
    { fields: ['purchase_order_id'] },
    { fields: ['vendor_id'] },
    { fields: ['bill_of_materials_id'] },
    { fields: ['sales_order_id'] },
    { fields: ['product_id'] },
    { fields: ['status'] },
    { fields: ['verification_status'] },
    { fields: ['grn_number'] }
  ]
});

	return GoodsReceiptNote;
};
