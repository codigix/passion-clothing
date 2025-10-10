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

    // Check if table already exists
    const exists = await tableExists('project_material_requests');
    if (exists) {
      console.log('⊘ Table project_material_requests already exists, skipping creation');
      return;
    }

    console.log('✓ Creating project_material_requests table...');
    await queryInterface.createTable('project_material_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      request_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Format: PMR-YYYYMMDD-XXXXX'
      },
      purchase_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'purchase_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      project_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Project name from the PO'
      },
      request_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date when the request was created'
      },
      expected_delivery_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expected delivery date from vendor'
      },
      materials_requested: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of materials: material_name, color, hsn, gsm, width, uom, quantity, rate, total, description'
      },
      total_items: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total number of material items'
      },
      total_value: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Total value of all materials'
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'reviewed',
          'forwarded_to_inventory',
          'stock_checking',
          'stock_available',
          'partial_available',
          'stock_unavailable',
          'materials_reserved',
          'materials_ready',
          'materials_issued',
          'completed',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Current status of the material request'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium',
        comment: 'Priority level of the request'
      },
      stock_availability: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Stock availability details: material_name, requested_qty, available_qty, shortage_qty, status'
      },
      reserved_inventory_ids: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of inventory IDs reserved for this project'
      },
      procurement_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notes from procurement team'
      },
      manufacturing_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notes from manufacturing team'
      },
      inventory_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notes from inventory team'
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of attachment files: filename, url, uploaded_at'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Manufacturing user who reviewed the request'
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when manufacturing reviewed the request'
      },
      forwarded_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Manufacturing user who forwarded to inventory'
      },
      forwarded_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when forwarded to inventory'
      },
      processed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Inventory user who processed the request'
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when inventory processed the request'
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when request was completed'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Helper function to check if index exists (by comparing fields)
    async function addIndexIfMissing(tableName, fields, options = {}) {
      try {
        const indexes = await queryInterface.showIndex(tableName);
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        const indexExists = indexes.some(index => {
          const indexFields = index.fields ? index.fields.map(f => f.attribute) : [];
          return JSON.stringify(indexFields.sort()) === JSON.stringify(fieldArray.sort());
        });
        
        if (!indexExists) {
          await queryInterface.addIndex(tableName, fields, options);
          console.log(`  ✓ Added index on ${tableName}(${fieldArray.join(', ')})`);
        } else {
          console.log(`  ⊘ Index on ${tableName}(${fieldArray.join(', ')}) already exists, skipping`);
        }
      } catch (error) {
        console.error(`  ⚠ Error checking/adding index on ${tableName}(${fields}):`, error.message);
      }
    }

    // Add indexes for better query performance
    console.log('Adding indexes to project_material_requests...');
    await addIndexIfMissing('project_material_requests', ['request_number']);
    await addIndexIfMissing('project_material_requests', ['purchase_order_id']);
    await addIndexIfMissing('project_material_requests', ['sales_order_id']);
    await addIndexIfMissing('project_material_requests', ['project_name']);
    await addIndexIfMissing('project_material_requests', ['status']);
    await addIndexIfMissing('project_material_requests', ['priority']);
    await addIndexIfMissing('project_material_requests', ['request_date']);
    await addIndexIfMissing('project_material_requests', ['created_by']);
    await addIndexIfMissing('project_material_requests', ['reviewed_by']);
    await addIndexIfMissing('project_material_requests', ['forwarded_by']);
    await addIndexIfMissing('project_material_requests', ['processed_by']);
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

    const exists = await tableExists('project_material_requests');
    if (exists) {
      await queryInterface.dropTable('project_material_requests');
      console.log('✓ Dropped project_material_requests table');
    } else {
      console.log('⊘ Table project_material_requests does not exist, skipping drop');
    }
  }
};