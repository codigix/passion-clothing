const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StoreStock = sequelize.define('StoreStock', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    store_location: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'School store location or branch'
    },
    issued_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Quantity issued to store from main inventory'
    },
    sold_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Quantity sold by the store'
    },
    returned_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Quantity returned to main inventory'
    },
    current_stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'issued_quantity - sold_quantity - returned_quantity'
    },
    damaged_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Quantity damaged at store'
    },
    lost_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Quantity lost/stolen at store'
    },
    unit_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    selling_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    total_cost_value: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'current_stock * unit_cost'
    },
    total_selling_value: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'current_stock * selling_price'
    },
    sales_revenue: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'sold_quantity * selling_price'
    },
    profit_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'sales_revenue - (sold_quantity * unit_cost)'
    },
    minimum_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    maximum_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    reorder_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_issue_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_sale_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_return_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    season: {
      type: DataTypes.ENUM('summer', 'winter', 'monsoon', 'all_season'),
      defaultValue: 'all_season'
    },
    size_breakdown: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Size-wise stock breakdown'
    },
    color_breakdown: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Color-wise stock breakdown'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'discontinued'),
      defaultValue: 'active'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    store_manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    last_audit_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    audit_variance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Difference found during last audit'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'store_stock',
    indexes: [
      { fields: ['product_id'] },
      { fields: ['store_location'] },
      { fields: ['current_stock'] },
      { fields: ['status'] },
      { fields: ['season'] },
      { fields: ['store_manager_id'] },
      { fields: ['last_sale_date'] },
      { fields: ['product_id', 'store_location'] }
    ]
  });

  return StoreStock;
};