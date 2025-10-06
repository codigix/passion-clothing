const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sample = sequelize.define('Sample', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sample_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: SMP-YYYYMMDD-XXXX'
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
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    sample_type: {
      type: DataTypes.ENUM('free', 'paid', 'development', 'approval'),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Detailed specifications for the sample'
    },
    cost_per_unit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    total_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    selling_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM(
        'requested', 'approved', 'in_production', 'ready', 
        'dispatched', 'delivered', 'approved_by_customer', 
        'rejected_by_customer', 'converted_to_order', 'cancelled'
      ),
      defaultValue: 'requested'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    requested_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expected_completion_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actual_completion_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dispatch_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delivery_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    customer_feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    customer_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    feedback_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    converted_to_order: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sales_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sales_orders',
        key: 'id'
      }
    },
    conversion_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    conversion_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    conversion_value: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    materials_used: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Materials and quantities used for sample'
    },
    production_time_hours: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of sample image URLs'
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    courier_details: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Courier company, tracking number, etc.'
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    return_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    return_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    return_condition: {
      type: DataTypes.ENUM('good', 'damaged', 'not_returned'),
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
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'samples',
    indexes: [
      { fields: ['sample_number'] },
      { fields: ['customer_id'] },
      { fields: ['product_id'] },
      { fields: ['sample_type'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['requested_date'] },
      { fields: ['converted_to_order'] },
      { fields: ['created_by'] },
      { fields: ['assigned_to'] }
    ]
  });

  return Sample;
};