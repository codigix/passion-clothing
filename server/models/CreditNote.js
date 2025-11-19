const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CreditNote = sequelize.define('CreditNote', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    credit_note_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: CN-YYYYMMDD-XXXX'
    },
    grn_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'goods_receipt_notes',
        key: 'id'
      },
      comment: 'Reference to the GRN with overage'
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
      allowNull: false,
      references: {
        model: 'vendors',
        key: 'id'
      }
    },
    credit_note_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    credit_note_type: {
      type: DataTypes.ENUM('full_return', 'partial_credit', 'adjustment'),
      allowNull: false,
      defaultValue: 'partial_credit',
      comment: 'full_return: all overage items to be returned, partial_credit: vendor provides credit, adjustment: both parties agree to adjust'
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of overage items: { material_id, material_name, overage_quantity, rate, unit, total_value, uom }'
    },
    subtotal_credit_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'Credit amount for overage items'
    },
    tax_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    total_credit_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'Total credit amount including tax'
    },
    status: {
      type: DataTypes.ENUM('draft', 'issued', 'accepted', 'rejected', 'settled', 'cancelled'),
      defaultValue: 'draft',
      comment: 'draft: created not sent, issued: sent to vendor, accepted: vendor accepted, rejected: vendor rejected, settled: credit processed, cancelled: no longer needed'
    },
    settlement_method: {
      type: DataTypes.ENUM('cash_credit', 'return_material', 'adjust_invoice', 'future_deduction'),
      allowNull: true,
      comment: 'How the credit will be settled'
    },
    settlement_status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    settlement_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when credit was settled'
    },
    settlement_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vendor_response: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Vendor response to credit note'
    },
    vendor_response_date: {
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
    issued_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    issued_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approved_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Internal remarks about the credit note'
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of attachment files'
    },
    pdf_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Path to generated credit note PDF'
    },
    invoice_adjustment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'invoices',
        key: 'id'
      },
      comment: 'Reference to related invoice for adjustment'
    }
  }, {
    tableName: 'credit_notes',
    timestamps: true,
    indexes: [
      { fields: ['credit_note_number'] },
      { fields: ['grn_id'] },
      { fields: ['purchase_order_id'] },
      { fields: ['vendor_id'] },
      { fields: ['status'] },
      { fields: ['settlement_status'] },
      { fields: ['credit_note_date'] },
      { fields: ['created_by'] },
      { fields: ['invoice_adjustment_id'] }
    ]
  });

  return CreditNote;
};
