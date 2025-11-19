const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinancialRecord = sequelize.define('FinancialRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoice_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'invoices',
      key: 'id'
    }
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  record_number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  record_type: {
    type: DataTypes.ENUM('debit', 'credit', 'journal_entry'),
    defaultValue: 'debit'
  },
  account_head: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  project_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'recorded', 'approved', 'rejected'),
    defaultValue: 'recorded'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recorded_by_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  recorded_by_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  recorded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  approved_by_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  approved_by_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'financial_records',
  timestamps: true,
  underscored: true
});

  return FinancialRecord;
};
