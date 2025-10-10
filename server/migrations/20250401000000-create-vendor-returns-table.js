'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Helper function to check if table exists
    const tableExists = async (tableName) => {
      try {
        await queryInterface.describeTable(tableName);
        return true;
      } catch (error) {
        return false;
      }
    };

    // Helper function to safely add an index
    const addIndexIfMissing = async (tableName, fields, options = {}) => {
      try {
        const indexes = await queryInterface.showIndex(tableName);
        
        // Check if an index already exists on these fields
        const indexExists = indexes.some(index => {
          const indexFields = index.fields.map(f => f.attribute);
          return JSON.stringify(indexFields.sort()) === JSON.stringify(fields.sort());
        });

        if (!indexExists) {
          await queryInterface.addIndex(tableName, fields, options);
          console.log(`✓ Added index on ${tableName}(${fields.join(', ')})`);
        } else {
          console.log(`⊘ Index already exists on ${tableName}(${fields.join(', ')})`);
        }
      } catch (error) {
        console.log(`⚠ Could not add index on ${tableName}(${fields.join(', ')}): ${error.message}`);
      }
    };

    // Create table only if it doesn't exist
    const exists = await tableExists('vendor_returns');
    if (!exists) {
      await queryInterface.createTable('vendor_returns', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        return_number: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        purchase_order_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'purchase_orders',
            key: 'id'
          }
        },
        grn_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'goods_receipt_notes',
            key: 'id'
          }
        },
        vendor_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'vendors',
            key: 'id'
          }
        },
        return_type: {
          type: Sequelize.ENUM('shortage', 'quality_issue', 'wrong_item', 'damaged', 'other'),
          allowNull: false
        },
        return_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        items: {
          type: Sequelize.JSON,
          allowNull: false
        },
        total_shortage_value: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.00
        },
        status: {
          type: Sequelize.ENUM('pending', 'acknowledged', 'resolved', 'disputed', 'closed'),
          defaultValue: 'pending'
        },
        vendor_response: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        vendor_response_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        resolution_type: {
          type: Sequelize.ENUM('credit_note', 'replacement', 'refund', 'adjustment', 'none'),
          allowNull: true
        },
        resolution_amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        },
        resolution_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        resolution_notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        approved_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        approval_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        remarks: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        attachments: {
          type: Sequelize.JSON,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });
      console.log('✓ Created table: vendor_returns');
    } else {
      console.log('⊘ Table already exists: vendor_returns');
    }

    // Add indexes (with safety checks)
    await addIndexIfMissing('vendor_returns', ['purchase_order_id']);
    await addIndexIfMissing('vendor_returns', ['grn_id']);
    await addIndexIfMissing('vendor_returns', ['vendor_id']);
    await addIndexIfMissing('vendor_returns', ['status']);
    await addIndexIfMissing('vendor_returns', ['return_number']);
    await addIndexIfMissing('vendor_returns', ['return_type']);
  },

  down: async (queryInterface, Sequelize) => {
    // Helper function to check if table exists
    const tableExists = async (tableName) => {
      try {
        await queryInterface.describeTable(tableName);
        return true;
      } catch (error) {
        return false;
      }
    };

    const exists = await tableExists('vendor_returns');
    if (exists) {
      await queryInterface.dropTable('vendor_returns');
      console.log('✓ Dropped table: vendor_returns');
    } else {
      console.log('⊘ Table does not exist: vendor_returns');
    }
  }
};