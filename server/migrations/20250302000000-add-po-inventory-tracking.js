'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Helper function to check if table exists
    async function tableExists(tableName) {
      try {
        await queryInterface.describeTable(tableName);
        return true;
      } catch (error) {
        return false;
      }
    }

    // Helper function to safely get table description
    async function describeTableIfExists(tableName) {
      const exists = await tableExists(tableName);
      if (!exists) return null;
      return await queryInterface.describeTable(tableName);
    }

    // Helper function to check if column exists
    async function columnExists(tableName, columnName) {
      const table = await describeTableIfExists(tableName);
      return table && table[columnName] !== undefined;
    }

    // Helper function to add column only if it doesn't exist
    async function addColumnIfMissing(tableName, columnName, columnDefinition) {
      const exists = await columnExists(tableName, columnName);
      if (!exists) {
        await queryInterface.addColumn(tableName, columnName, columnDefinition);
        console.log(`✓ Added column ${columnName} to ${tableName}`);
      } else {
        console.log(`⊘ Column ${columnName} already exists in ${tableName}, skipping`);
      }
    }

    // Helper function to add index only if it doesn't exist
    async function addIndexIfMissing(tableName, columns, options = {}) {
      try {
        const indexes = await queryInterface.showIndex(tableName);
        const indexName = options.name || `${tableName}_${columns.join('_')}`;
        const indexExists = indexes.some(index => 
          index.name === indexName || 
          (JSON.stringify(index.fields) === JSON.stringify(columns))
        );
        if (!indexExists) {
          await queryInterface.addIndex(tableName, columns, options);
          console.log(`✓ Added index on ${columns.join(', ')} to ${tableName}`);
        } else {
          console.log(`⊘ Index on ${columns.join(', ')} already exists in ${tableName}, skipping`);
        }
      } catch (error) {
        console.log(`⊘ Could not check/add index on ${columns.join(', ')}: ${error.message}`);
      }
    }

    // Add purchase_order_id to inventory table
    await addColumnIfMissing('inventory', 'purchase_order_id', {
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
    await addColumnIfMissing('inventory', 'po_item_index', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Index of item in PO items array'
    });

    // Add initial_quantity to track original PO quantity
    await addColumnIfMissing('inventory', 'initial_quantity', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Initial quantity from PO'
    });

    // Add consumed_quantity to track usage
    await addColumnIfMissing('inventory', 'consumed_quantity', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Quantity consumed/used'
    });

    // Create inventory_movements table only if it doesn't exist
    const inventoryMovementsExists = await tableExists('inventory_movements');
    if (!inventoryMovementsExists) {
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
      console.log('✓ Created inventory_movements table');
    } else {
      console.log('⊘ inventory_movements table already exists, skipping');
    }

    // Add indexes
    await addIndexIfMissing('inventory', ['purchase_order_id']);
    await addIndexIfMissing('inventory_movements', ['inventory_id']);
    await addIndexIfMissing('inventory_movements', ['purchase_order_id']);
    await addIndexIfMissing('inventory_movements', ['sales_order_id']);
    await addIndexIfMissing('inventory_movements', ['movement_type']);
    await addIndexIfMissing('inventory_movements', ['movement_date']);
  },

  down: async (queryInterface, Sequelize) => {
    // Helper function to check if table exists
    async function tableExists(tableName) {
      try {
        await queryInterface.describeTable(tableName);
        return true;
      } catch (error) {
        return false;
      }
    }

    // Helper function to safely get table description
    async function describeTableIfExists(tableName) {
      const exists = await tableExists(tableName);
      if (!exists) return null;
      return await queryInterface.describeTable(tableName);
    }

    // Helper function to check if column exists
    async function columnExists(tableName, columnName) {
      const table = await describeTableIfExists(tableName);
      return table && table[columnName] !== undefined;
    }

    // Helper function to remove column only if it exists
    async function removeColumnIfExists(tableName, columnName) {
      const exists = await columnExists(tableName, columnName);
      if (exists) {
        await queryInterface.removeColumn(tableName, columnName);
        console.log(`✓ Removed column ${columnName} from ${tableName}`);
      } else {
        console.log(`⊘ Column ${columnName} doesn't exist in ${tableName}, skipping`);
      }
    }

    // Drop table only if it exists
    const inventoryMovementsExists = await tableExists('inventory_movements');
    if (inventoryMovementsExists) {
      await queryInterface.dropTable('inventory_movements');
      console.log('✓ Dropped inventory_movements table');
    } else {
      console.log('⊘ inventory_movements table does not exist, skipping');
    }

    // Remove columns from inventory
    await removeColumnIfExists('inventory', 'consumed_quantity');
    await removeColumnIfExists('inventory', 'initial_quantity');
    await removeColumnIfExists('inventory', 'po_item_index');
    await removeColumnIfExists('inventory', 'purchase_order_id');
  }
};