const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BillOfMaterials = sequelize.define('BillOfMaterials', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bom_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'Format: BOM-YYYYMMDD-XXXX'
    },
    sales_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sales_orders',
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
    // Materials required for this product
    materials: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of materials with product_id, quantity, unit, specifications'
    },
    // Calculated totals
    total_material_cost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    },
    estimated_production_cost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    },
    // Status tracking
    status: {
      type: DataTypes.ENUM('draft', 'approved', 'procurement_created', 'materials_received', 'in_production', 'completed'),
      defaultValue: 'draft'
    },
    // Additional specifications from garment requirements
    fabric_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    fabric_gsm: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fabric_color: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    thread_colors: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    button_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    printing_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    embroidery_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Production requirements
    production_requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Cutting, stitching, finishing requirements'
    },
    // Notes and special instructions
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Audit fields
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
    tableName: 'bill_of_materials',
    timestamps: true,
    indexes: [
      {
        fields: ['sales_order_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['bom_number'],
        unique: true
      }
    ]
  });

  BillOfMaterials.associate = (models) => {
    BillOfMaterials.belongsTo(models.SalesOrder, {
      foreignKey: 'sales_order_id',
      as: 'salesOrder'
    });
    BillOfMaterials.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
    BillOfMaterials.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    BillOfMaterials.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver'
    });
    BillOfMaterials.hasMany(models.PurchaseOrder, {
      foreignKey: 'bom_id',
      as: 'purchaseOrders'
    });
  };

  return BillOfMaterials;
};