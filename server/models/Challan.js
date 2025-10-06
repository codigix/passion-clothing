const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Challan = sequelize.define('Challan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    challan_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: CHN-YYYYMMDD-XXXX'
    },
    type: {
      type: DataTypes.ENUM(
        'inward', 'outward', 'internal_transfer', 'sample_outward', 
        'sample_inward', 'return', 'dispatch', 'receipt'
      ),
      allowNull: false
    },
    sub_type: {
      type: DataTypes.ENUM(
        'purchase', 'sales', 'production', 'outsourcing', 'store_issue', 
        'store_return', 'sample', 'waste', 'adjustment'
      ),
      allowNull: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Reference to sales_orders, purchase_orders, or production_orders'
    },
    order_type: {
      type: DataTypes.ENUM('sales_order', 'purchase_order', 'production_order', 'sample_order'),
      allowNull: true
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
    sample_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'samples',
        key: 'id'
      }
    },
    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'inventory',
        key: 'id'
      }
    },
    store_stock_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'store_stock',
        key: 'id'
      }
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of items with product_id, quantity, rate, etc.'
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
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'),
      defaultValue: 'draft'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Internal notes not visible on printed challan'
    },
    barcode: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    qr_code: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pdf_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    expected_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actual_date: {
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
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    department: {
      type: DataTypes.ENUM(
        'sales', 'procurement', 'manufacturing', 'outsourcing', 
        'inventory', 'shipment', 'store', 'finance', 'samples'
      ),
      allowNull: false
    },
    location_from: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    location_to: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    transport_details: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Transport mode, vehicle number, driver details, etc.'
    }
  }, {
    tableName: 'challans',
    indexes: [
      { fields: ['status'] },
      { fields: ['type'] },
      { fields: ['department'] }
    ]
  });

  return Challan;
};