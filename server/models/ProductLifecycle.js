const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductLifecycle = sequelize.define('ProductLifecycle', {
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
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Product barcode for tracking'
    },
    batch_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Batch number for this product instance'
    },
    serial_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Unique serial number for this product instance'
    },
    current_stage: {
      type: DataTypes.ENUM(
        'created', 'material_allocated', 'in_production', 'cutting', 
        'embroidery', 'printing', 'stitching', 'finishing', 'ironing', 
        'quality_check', 'packing', 'ready_for_dispatch', 'dispatched', 
        'in_transit', 'delivered', 'returned', 'rejected'
      ),
      defaultValue: 'created'
    },
    current_status: {
      type: DataTypes.ENUM('active', 'on_hold', 'completed', 'cancelled', 'returned'),
      defaultValue: 'active'
    },
    production_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'production_orders',
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
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Quantity of products in this lifecycle instance'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Current physical location of the product'
    },
    estimated_completion_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actual_completion_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estimated_delivery_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actual_delivery_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    quality_status: {
      type: DataTypes.ENUM('pending', 'passed', 'failed', 'rework_required'),
      defaultValue: 'pending'
    },
    quality_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total_production_time_hours: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true
    },
    total_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    shipping_details: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Shipping information including tracking number, carrier, etc.'
    },
    delivery_address: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Delivery address details'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    qr_token: {
      type: DataTypes.STRING(120),
      allowNull: true,
      unique: true,
      comment: 'Unique token identifying the lifecycle QR'
    },
    qr_payload: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Cached payload embedded within the lifecycle QR'
    },
    qr_status: {
      type: DataTypes.ENUM('pending', 'active', 'revoked', 'expired'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Status of the lifecycle QR token'
    },
    qr_generated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the QR was last generated'
    },
    qr_last_scanned_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the QR was last scanned'
    },
    qr_scan_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of recorded scans for this lifecycle QR'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    last_updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'product_lifecycle',
    indexes: [
      { fields: ['product_id'] },
      { fields: ['barcode'] },
      { fields: ['batch_number'] },
      { fields: ['serial_number'] },
      { fields: ['current_stage'] },
      { fields: ['current_status'] },
      { fields: ['production_order_id'] },
      { fields: ['sales_order_id'] },
      { fields: ['customer_id'] },
      { fields: ['quality_status'] },
      { fields: ['qr_token'] },
      { fields: ['qr_status'] },
      { fields: ['qr_generated_at'] },
      { fields: ['qr_last_scanned_at'] },
      { fields: ['created_at'] },
      { fields: ['estimated_delivery_date'] },
      { fields: ['actual_delivery_date'] }
    ]
  });

  return ProductLifecycle;
};