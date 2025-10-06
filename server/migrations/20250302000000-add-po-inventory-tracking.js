'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add purchase_order_id to inventory table
    await queryInterface.addColumn('inventory', 'purchase_order_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'purchase_orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add po_item_index to track which PO item this inventory belongs to
    await queryInterface.addColumn('inventory', 'po_item_index', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Index of item in PO items array'
    });

    // Add initial_quantity to track original PO quantity
    await queryInterface.addColumn('inventory', 'initial_quantity', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Initial quantity from PO'
    });

    // Add consumed_quantity to track usage
    await queryInterface.addColumn('inventory', 'consumed_quantity', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Quantity consumed/used'
    });

    // Create inventory_movements table
    await queryInterface.createTable('inventory_movements', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      inventory_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inventory',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      purchase_order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'purchase_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sales_order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sales_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      production_order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'production_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      movement_type: {
        type: Sequelize.ENUM('inward', 'outward', 'transfer', 'adjustment', 'return', 'consume'),
        allowNull: false
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      previous_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      new_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unit_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      total_cost: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      reference_number: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location_from: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      location_to: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      performed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      movement_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('inventory', ['purchase_order_id']);
    await queryInterface.addIndex('inventory_movements', ['inventory_id']);
    await queryInterface.addIndex('inventory_movements', ['purchase_order_id']);
    await queryInterface.addIndex('inventory_movements', ['sales_order_id']);
    await queryInterface.addIndex('inventory_movements', ['movement_type']);
    await queryInterface.addIndex('inventory_movements', ['movement_date']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop table
    await queryInterface.dropTable('inventory_movements');

    // Remove columns from inventory
    await queryInterface.removeColumn('inventory', 'consumed_quantity');
    await queryInterface.removeColumn('inventory', 'initial_quantity');
    await queryInterface.removeColumn('inventory', 'po_item_index');
    await queryInterface.removeColumn('inventory', 'purchase_order_id');
  }
};