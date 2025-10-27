const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Shipment = sequelize.define('Shipment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    shipment_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: SHP-YYYYMMDD-XXXX'
    },
    sales_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sales_orders',
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
    shipment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expected_delivery_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    actual_delivery_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of items being shipped'
    },
    total_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_weight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Total weight in kg'
    },
    total_volume: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Total volume in cubic meters'
    },
    packaging_details: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Number of boxes, bags, etc.'
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    courier_company: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    courier_partner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courier_partners',
        key: 'id'
      }
    },
    courier_agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courier_agents',
        key: 'id'
      },
      comment: 'Reference to courier_agents table'
    },
    tracking_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    shipping_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    insurance_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    cod_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM(
        'preparing', 'packed', 'ready_to_ship', 'shipped', 
        'in_transit', 'out_for_delivery', 'delivered', 
        'failed_delivery', 'returned', 'cancelled'
      ),
      defaultValue: 'preparing'
    },
    shipping_method: {
      type: DataTypes.ENUM('standard', 'express', 'overnight', 'same_day', 'pickup'),
      defaultValue: 'standard'
    },
    payment_mode: {
      type: DataTypes.ENUM('prepaid', 'cod', 'credit'),
      defaultValue: 'prepaid'
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    delivery_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    recipient_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    recipient_phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    recipient_email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    delivery_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_status_update: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tracking_updates: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of tracking status updates'
    },
    proof_of_delivery: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Image or document path'
    },
    delivery_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    delivery_feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    return_reason: {
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
    }
  }, {
    tableName: 'shipments',
    indexes: [
      { fields: ['shipment_number'] },
      { fields: ['sales_order_id'] },
      { fields: ['status'] },
      { fields: ['tracking_number'] },
      { fields: ['shipment_date'] },
      { fields: ['expected_delivery_date'] },
      { fields: ['courier_company'] },
      { fields: ['courier_agent_id'] },
      { fields: ['created_by'] }
    ]
  });

  return Shipment;
};