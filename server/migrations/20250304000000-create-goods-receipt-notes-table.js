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

    // Helper function to add index only if it doesn't exist
    async function addIndexIfMissing(tableName, columns, options = {}) {
      try {
        const indexes = await queryInterface.showIndex(tableName);
        const indexName = options.name || `${tableName}_${columns.join('_')}`;
        const indexExists = indexes.some(index => 
          index.name === indexName || 
          (JSON.stringify(index.fields.map(f => f.attribute || f)) === JSON.stringify(columns))
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

    // Check if table already exists
    const grnTableExists = await tableExists('goods_receipt_notes');
    if (!grnTableExists) {
      await queryInterface.createTable('goods_receipt_notes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      grn_number: {
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
      bill_of_materials_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      sales_order_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      received_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      supplier_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      supplier_invoice_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      inward_challan_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      items_received: {
        type: Sequelize.JSON,
        allowNull: false
      },
      total_received_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      status: {
        type: Sequelize.ENUM('draft', 'received', 'inspected', 'approved', 'rejected'),
        defaultValue: 'draft'
      },
      inspection_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      quality_inspector: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
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
      verification_status: {
        type: Sequelize.ENUM('pending', 'verified', 'discrepancy', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      verified_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      verification_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      verification_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      discrepancy_details: {
        type: Sequelize.JSON,
        allowNull: true
      },
      discrepancy_approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      discrepancy_approval_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      discrepancy_approval_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      inventory_added: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      inventory_added_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Vendor Revert/Dispute fields
      vendor_revert_requested: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      vendor_revert_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      vendor_revert_items: {
        type: Sequelize.JSON,
        allowNull: true
      },
      vendor_revert_requested_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      vendor_revert_requested_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      vendor_response: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      vendor_response_date: {
        type: Sequelize.DATE,
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
      console.log('✓ Created goods_receipt_notes table');
    } else {
      console.log('⊘ goods_receipt_notes table already exists, skipping');
    }

    // Add indexes safely
    await addIndexIfMissing('goods_receipt_notes', ['purchase_order_id']);
    await addIndexIfMissing('goods_receipt_notes', ['bill_of_materials_id']);
    await addIndexIfMissing('goods_receipt_notes', ['sales_order_id']);
    await addIndexIfMissing('goods_receipt_notes', ['status']);
    await addIndexIfMissing('goods_receipt_notes', ['verification_status']);
    await addIndexIfMissing('goods_receipt_notes', ['grn_number']);
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

    // Drop table only if it exists
    const grnTableExists = await tableExists('goods_receipt_notes');
    if (grnTableExists) {
      await queryInterface.dropTable('goods_receipt_notes');
      console.log('✓ Dropped goods_receipt_notes table');
    } else {
      console.log('⊘ goods_receipt_notes table does not exist, skipping');
    }
  }
};