const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SalesOrder = sequelize.define('SalesOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: SO-YYYYMMDD-XXXX'
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
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
      comment: 'Final product to be manufactured'
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Product name for quick reference without joins'
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    delivery_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    buyer_reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Buyer Reference / Style Reference'
    },
    order_type: {
      type: DataTypes.ENUM('Knitted', 'Woven', 'Embroidery', 'Printing'),
      allowNull: true,
      comment: 'Type of order: Knitted/Woven/Embroidery/Printing'
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of items with item_code, product_type, style_no, fabric_type, color, size_breakdown, quantity, unit_price, remarks, etc.'
    },
    qr_code: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'QR code data containing comprehensive order information (large JSON)'
    },
    garment_specifications: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Garment-specific requirements: fabric_type, gsm, color, quality_specs, etc.'
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
      type: DataTypes.ENUM('draft', 'confirmed', 'bom_generated', 'procurement_created', 'materials_received', 'in_production', 'cutting_completed', 'printing_completed', 'stitching_completed', 'finishing_completed', 'qc_passed', 'ready_to_ship', 'shipped', 'delivered', 'completed', 'cancelled'),
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
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    billing_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true
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
      comment: 'Approval lifecycle status for the sales order'
    },
    approval_requested_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who initiated the approval request'
    },
    approval_requested_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when approval was requested'
    },
    approval_decision_note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes captured during approval decision'
    },
    approval_decided_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when approval decision was finalized'
    },
    ready_for_procurement: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Flag indicating the order is ready for procurement handoff'
    },
    ready_for_procurement_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who marked the order procurement ready'
    },
    ready_for_procurement_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the order was marked procurement ready'
    },
    procurement_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes intended for procurement during PO creation'
    },
    production_started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    production_completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    shipped_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lifecycle_history: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of lifecycle events with timestamps, status changes, remarks, and responsible users'
    },
    has_lifecycle_qr: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates if lifecycle QR tracking is enabled for the order'
    },
    lifecycle_qr_token: {
      type: DataTypes.STRING(120),
      allowNull: true,
      unique: true,
      comment: 'Token representing the linked lifecycle QR'
    },
    lifecycle_qr_status: {
      type: DataTypes.ENUM('pending', 'active', 'revoked', 'expired'),
      allowNull: true,
      comment: 'Lifecycle QR status at the order scope'
    },
    lifecycle_qr_generated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of the last lifecycle QR generation'
    },
    lifecycle_qr_last_scanned_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last recorded scan timestamp for the order-level QR'
    },
    lifecycle_qr_scan_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of lifecycle QR scans aggregated for the order'
    },
    advance_paid: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Advance payment received from customer'
    },
    balance_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Remaining balance to be paid'
    },
    invoice_status: {
      type: DataTypes.ENUM('pending', 'generated', 'sent', 'paid', 'overdue'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Invoice generation and payment status'
    },
    challan_status: {
      type: DataTypes.ENUM('pending', 'created', 'dispatched', 'delivered'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Delivery challan status'
    },
    procurement_status: {
      type: DataTypes.ENUM('not_requested', 'requested', 'po_created', 'materials_ordered', 'materials_received', 'completed'),
      allowNull: false,
      defaultValue: 'not_requested',
      comment: 'Procurement workflow status'
    },
    design_files: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of uploaded design/logo/artwork files'
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Generated invoice number'
    },
    invoice_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Invoice generation date'
    }
  }, {
    tableName: 'sales_orders',
    indexes: [
      { fields: ['order_number'] },
      { fields: ['customer_id'] },
      { fields: ['product_id'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['order_date'] },
      { fields: ['delivery_date'] },
      { fields: ['created_by'] },
      { fields: ['approval_status'] },
      { fields: ['ready_for_procurement'] },
      { fields: ['lifecycle_qr_token'] },
      { fields: ['lifecycle_qr_status'] },
      { fields: ['lifecycle_qr_generated_at'] },
      { fields: ['lifecycle_qr_last_scanned_at'] },
      { fields: ['invoice_status'] },
      { fields: ['challan_status'] },
      { fields: ['procurement_status'] }
    ]
  });

  return SalesOrder;
};