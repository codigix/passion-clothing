const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VendorRequest = sequelize.define('VendorRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    request_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: VRQ-YYYYMMDD-XXXXX'
    },
    purchase_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'purchase_orders',
        key: 'id'
      }
    },
    grn_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'goods_receipt_notes',
        key: 'id'
      },
      comment: 'Original GRN that detected the shortage/overage'
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vendors',
        key: 'id'
      }
    },
    complaint_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'approvals',
        key: 'id'
      },
      comment: 'Link to the shortage/overage complaint'
    },
    request_type: {
      type: DataTypes.ENUM('shortage', 'overage'),
      allowNull: false,
      comment: 'Type of discrepancy being addressed'
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of items with discrepancies: material_id, material_name, ordered_qty, invoiced_qty, received_qty, shortage_qty/overage_qty, rate, value'
    },
    total_value: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Total value of shortage/overage items'
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'acknowledged', 'in_transit', 'fulfilled', 'cancelled'),
      defaultValue: 'pending',
      comment: 'Current status of the vendor request'
    },
    message_to_vendor: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Message sent to vendor explaining the discrepancy'
    },
    vendor_response: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Vendor response or acknowledgment'
    },
    expected_fulfillment_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expected date for vendor to fulfill the request'
    },
    fulfillment_grn_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'goods_receipt_notes',
        key: 'id'
      },
      comment: 'GRN created when shortage items are received'
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when request was sent to vendor'
    },
    acknowledged_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when vendor acknowledged the request'
    },
    fulfilled_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when request was fulfilled'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sent_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'vendor_requests',
    indexes: [
      { fields: ['request_number'] },
      { fields: ['purchase_order_id'] },
      { fields: ['grn_id'] },
      { fields: ['vendor_id'] },
      { fields: ['status'] },
      { fields: ['request_type'] },
      { fields: ['fulfillment_grn_id'] },
      { fields: ['created_by'] }
    ]
  });

  return VendorRequest;
};
