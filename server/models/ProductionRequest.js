const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionRequest = sequelize.define('ProductionRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  request_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    comment: 'Format: PRQ-YYYYMMDD-XXXXX'
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sales_orders',
      key: 'id'
    },
    comment: 'Reference to Sales Order (if created from SO)'
  },
  sales_order_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Sales Order Number for reference'
  },
  po_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'purchase_orders',
      key: 'id'
    },
    comment: 'Reference to Purchase Order (if created from PO)'
  },
  po_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'PO Number for reference'
  },
  project_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  product_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  product_specifications: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Detailed specifications for production'
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  required_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  sales_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from Sales department'
  },
  procurement_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from Procurement department'
  },
  manufacturing_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from Manufacturing department'
  },
  status: {
    type: DataTypes.ENUM(
      'pending',           // Initial state - waiting for Manufacturing review
      'reviewed',          // Manufacturing has reviewed the request
      'in_planning',       // Production planning in progress
      'materials_checking', // Checking material availability
      'ready_to_produce',  // All materials available, ready to start
      'in_production',     // Production started
      'quality_check',     // Production completed, in QC
      'completed',         // Production completed and approved
      'on_hold',          // Request on hold
      'cancelled'         // Request cancelled
    ),
    defaultValue: 'pending'
  },
  production_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'production_orders',
      key: 'id'
    },
    comment: 'Linked production order once created'
  },
  requested_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'production_requests',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['request_number']
    },
    {
      fields: ['po_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['project_name']
    },
    {
      fields: ['required_date']
    }
  ]
});

  return ProductionRequest;
};