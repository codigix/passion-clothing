const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseOrder = sequelize.define('PurchaseOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    po_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: PO-YYYYMMDD-XXXX'
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id'
      }
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      },
      comment: 'Customer for independent purchase orders'
    },
    project_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Project name for the purchase order'
    },
    linked_sales_order_id: {
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
    po_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expected_delivery_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of items with material requirements: item_code, material_type, spec, color, size, uom, quantity, price, remarks'
    },
    fabric_requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Detailed fabric requirements: fabric_type, color, hsn_code, gsm_quality, uom, required_quantity, rate_per_unit, total, supplier_name, expected_delivery_date, remarks'
    },
    accessories: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Accessories requirements: accessory_item, description, hsn_code, uom, required_quantity, rate_per_unit, total, supplier_name, expected_delivery_date, remarks'
    },
    cost_summary: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Cost breakdown: fabric_total, accessories_total, sub_total, gst_percentage, gst_amount, freight, grand_total'
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of attachment files: filename, url, uploaded_at'
    },
    total_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    tax_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    final_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'dispatched', 'in_transit', 'grn_requested', 'partial_received', 'received', 'completed', 'cancelled'),
      defaultValue: 'draft'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    payment_terms: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    delivery_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    terms_conditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    materials_source: {
      type: DataTypes.ENUM('sales_order', 'bill_of_materials', 'manual'),
      allowNull: true,
      defaultValue: null
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bom_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'bill_of_materials',
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
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approval_status: {
      type: DataTypes.ENUM('not_requested', 'pending', 'in_review', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'not_requested',
      comment: 'Approval lifecycle status for the purchase order'
    },
    approval_decision_note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes captured during procurement approval'
    },
    generated_from_sales_order: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates if this PO originated from a sales order workflow'
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    acknowledged_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    received_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    barcode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Unique barcode for the purchase order'
    },
    qr_code: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'QR code data containing PO details'
    },
    version_number: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Current version number of the PO'
    },
    change_history: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of all changes made to the PO with timestamps and user details'
    },
    last_edited_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User ID of the person who last edited the PO'
    },
    last_edited_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of last edit'
    },
    requires_reapproval: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Flag to indicate if PO requires re-approval after edits'
    }
  }, {
    tableName: 'purchase_orders',
    indexes: [
      { fields: ['po_number'] },
      { fields: ['vendor_id'] },
      { fields: ['product_id'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['po_date'] },
      { fields: ['expected_delivery_date'] },
      { fields: ['created_by'] },
      { fields: ['linked_sales_order_id'] },
      { fields: ['approval_status'] },
      { fields: ['generated_from_sales_order'] },
      { fields: ['version_number'] },
      { fields: ['last_edited_at'] },
      { fields: ['requires_reapproval'] },
      { fields: ['last_edited_by'] }
    ]
  });

  return PurchaseOrder;
};