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

    // Check if table already exists
    const exists = await tableExists('production_requests');
    if (exists) {
      console.log('⊘ Table production_requests already exists, skipping creation');
      return;
    }

    console.log('✓ Creating production_requests table...');
    await queryInterface.createTable('production_requests', {
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
        comment: 'Format: PR-YYYYMMDD-XXXXX'
      },
      po_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'purchase_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      po_number: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      project_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      product_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      product_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      product_specifications: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Technical specifications, dimensions, materials, etc.'
      },
      quantity: {
        type: Sequelize.DECIMAL(15, 3),
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      required_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'reviewed',
          'in_planning',
          'materials_checking',
          'ready_to_produce',
          'in_production',
          'quality_check',
          'completed',
          'on_hold',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending'
      },
      procurement_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      manufacturing_notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
      requested_by: {
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
        onDelete: 'SET NULL'
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Add indexes for better query performance (with safety checks)
    console.log('Adding indexes to production_requests...');
    await addIndexIfMissing('production_requests', ['po_id']);
    await addIndexIfMissing('production_requests', ['status']);
    await addIndexIfMissing('production_requests', ['priority']);
    await addIndexIfMissing('production_requests', ['project_name']);
    await addIndexIfMissing('production_requests', ['requested_by']);
    await addIndexIfMissing('production_requests', ['production_order_id']);
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

    const exists = await tableExists('production_requests');
    if (exists) {
      await queryInterface.dropTable('production_requests');
      console.log('✓ Dropped production_requests table');
    } else {
      console.log('⊘ Table production_requests does not exist, skipping drop');
    }
  }
};