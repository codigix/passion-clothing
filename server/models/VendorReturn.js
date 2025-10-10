const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VendorReturn = sequelize.define('VendorReturn', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    return_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
      allowNull: true,
      references: {
        model: 'goods_receipt_notes',
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
    return_type: {
      type: DataTypes.ENUM('shortage', 'quality_issue', 'wrong_item', 'damaged', 'other'),
      allowNull: false
    },
    return_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      // Structure: [{ material_name, ordered_qty, invoiced_qty, received_qty, shortage_qty, reason, remarks }]
    },
    total_shortage_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM('pending', 'acknowledged', 'resolved', 'disputed', 'closed'),
      defaultValue: 'pending'
    },
    vendor_response: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vendor_response_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolution_type: {
      type: DataTypes.ENUM('credit_note', 'replacement', 'refund', 'adjustment', 'none'),
      allowNull: true
    },
    resolution_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    resolution_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolution_notes: {
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
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approval_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      // Array of file paths (photos, documents)
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['purchase_order_id'] },
      { fields: ['grn_id'] },
      { fields: ['vendor_id'] },
      { fields: ['status'] },
      { fields: ['return_number'] },
      { fields: ['return_type'] }
    ]
  });

  return VendorReturn;
};