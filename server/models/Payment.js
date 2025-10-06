const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    payment_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: PAY-YYYYMMDD-XXXX'
    },
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'invoices',
        key: 'id'
      }
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    payment_method: {
      type: DataTypes.ENUM(
        'cash', 'cheque', 'bank_transfer', 'upi', 'card', 
        'online_banking', 'wallet', 'credit_note', 'adjustment'
      ),
      allowNull: false
    },
    payment_mode: {
      type: DataTypes.ENUM('inward', 'outward'),
      allowNull: false,
      comment: 'inward = received, outward = paid'
    },
    reference_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Cheque number, transaction ID, etc.'
    },
    bank_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    account_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    cheque_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cheque_status: {
      type: DataTypes.ENUM('pending', 'cleared', 'bounced', 'cancelled'),
      allowNull: true
    },
    clearance_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending'
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'INR'
    },
    exchange_rate: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 1.0000
    },
    base_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Amount in base currency'
    },
    charges: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0.00,
      comment: 'Bank charges, processing fees, etc.'
    },
    net_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'amount - charges'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    receipt_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Path to payment receipt/proof'
    },
    reconciled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reconciled_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reconciled_by: {
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
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'payments',
    indexes: [
      { fields: ['payment_number'] },
      { fields: ['invoice_id'] },
      { fields: ['payment_date'] },
      { fields: ['payment_method'] },
      { fields: ['payment_mode'] },
      { fields: ['status'] },
      { fields: ['reference_number'] },
      { fields: ['reconciled'] },
      { fields: ['created_by'] }
    ]
  });

  return Payment;
};