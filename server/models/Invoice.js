const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: INV-YYYYMMDD-XXXX'
    },
    invoice_type: {
      type: DataTypes.ENUM('sales', 'purchase', 'service', 'credit_note', 'debit_note'),
      allowNull: false
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
      }
    },
    challan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'challans',
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
    purchase_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'purchase_orders',
        key: 'id'
      }
    },
    invoice_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of invoice items with product, quantity, rate, etc.'
    },
    subtotal: {
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
    tax_details: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Tax breakdown - CGST, SGST, IGST, etc.'
    },
    total_tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    shipping_charges: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0.00
    },
    other_charges: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0.00
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    paid_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    },
    outstanding_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'viewed', 'partial_paid', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'draft'
    },
    payment_status: {
      type: DataTypes.ENUM('unpaid', 'partial', 'paid', 'overpaid'),
      defaultValue: 'unpaid'
    },
    payment_terms: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'INR'
    },
    exchange_rate: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 1.0000
    },
    billing_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    terms_conditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reference_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'External reference like PO number, etc.'
    },
    pdf_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sent_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    viewed_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_payment_date: {
      type: DataTypes.DATE,
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
    }
  }, {
    tableName: 'invoices',
    indexes: [
      { fields: ['invoice_number'] },
      { fields: ['invoice_type'] },
      { fields: ['vendor_id'] },
      { fields: ['customer_id'] },
      { fields: ['status'] },
      { fields: ['payment_status'] },
      { fields: ['invoice_date'] },
      { fields: ['due_date'] },
      { fields: ['created_by'] }
    ]
  });

  return Invoice;
};