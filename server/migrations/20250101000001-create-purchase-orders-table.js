'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      let tableCreated = false;

      try {
        await queryInterface.createTable('purchase_orders', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          po_number: {
            type: Sequelize.STRING(50),
            unique: true,
            allowNull: false,
            comment: 'Format: PO-YYYYMMDD-XXXX'
          },
          vendor_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'vendors',
              key: 'id'
            }
          },
          linked_sales_order_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'sales_orders',
              key: 'id'
            }
          },
          po_date: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          expected_delivery_date: {
            type: Sequelize.DATE,
            allowNull: true
          },
          items: {
            type: Sequelize.JSON,
            allowNull: false,
            comment: 'Array of items with material requirements: item_code, material_type, spec, color, size, uom, quantity, price, remarks'
          },
          fabric_requirements: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Detailed fabric requirements: fabric_type, color, hsn_code, gsm_quality, uom, required_quantity, rate_per_unit, total, supplier_name, expected_delivery_date, remarks'
          },
          accessories: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Accessories requirements: accessory_item, description, hsn_code, uom, required_quantity, rate_per_unit, total, supplier_name, expected_delivery_date, remarks'
          },
          cost_summary: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Cost breakdown: fabric_total, accessories_total, sub_total, gst_percentage, gst_amount, freight, grand_total'
          },
          attachments: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Array of attachment files: filename, url, uploaded_at'
          },
          total_quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
          },
          total_amount: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.0
          },
          discount_percentage: {
            type: Sequelize.DECIMAL(5, 2),
            defaultValue: 0.0
          },
          discount_amount: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0.0
          },
          tax_percentage: {
            type: Sequelize.DECIMAL(5, 2),
            defaultValue: 0.0
          },
          tax_amount: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0.0
          },
          final_amount: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.0
          },
          status: {
            type: Sequelize.ENUM('draft', 'sent', 'acknowledged', 'partial_received', 'received', 'completed', 'cancelled'),
            defaultValue: 'draft'
          },
          priority: {
            type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
            defaultValue: 'medium'
          },
          payment_terms: {
            type: Sequelize.STRING(100),
            allowNull: true
          },
          delivery_address: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          terms_conditions: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          materials_source: {
            type: Sequelize.ENUM('sales_order', 'bill_of_materials', 'manual'),
            allowNull: true,
            defaultValue: null
          },
          special_instructions: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          internal_notes: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          bom_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'bill_of_materials',
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
          created_at: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false
          }
        }, { transaction });

        tableCreated = true;
      } catch (error) {
        const tableAlreadyExists = error?.original?.code === 'ER_TABLE_EXISTS_ERROR';

        if (!tableAlreadyExists) {
          throw error;
        }
      }

      // Ensure indexes exist without creating duplicates
      const [existingIndexes] = await queryInterface.sequelize.query(
        'SHOW INDEX FROM `purchase_orders`',
        { transaction }
      );

      const existingIndexNames = new Set(existingIndexes.map((index) => index.Key_name));

      const indexesToEnsure = [
        { fields: ['po_number'], name: 'purchase_orders_po_number' },
        { fields: ['vendor_id'], name: 'purchase_orders_vendor_id' },
        { fields: ['linked_sales_order_id'], name: 'purchase_orders_linked_sales_order_id' },
        { fields: ['status'], name: 'purchase_orders_status' },
        { fields: ['po_date'], name: 'purchase_orders_po_date' }
      ];

      for (const index of indexesToEnsure) {
        if (!existingIndexNames.has(index.name)) {
          await queryInterface.addIndex('purchase_orders', index.fields, {
            name: index.name,
            transaction
          });
        }
      }

      await transaction.commit();

      // If table already existed, optionally synchronize ENUM values
      if (!tableCreated) {
        const enumColumns = [
          { table: 'purchase_orders', column: 'status', values: ['draft', 'sent', 'acknowledged', 'partial_received', 'received', 'completed', 'cancelled'] },
          { table: 'purchase_orders', column: 'priority', values: ['low', 'medium', 'high', 'urgent'] },
          { table: 'purchase_orders', column: 'materials_source', values: ['sales_order', 'bill_of_materials', 'manual'] }
        ];

        for (const { table, column, values } of enumColumns) {
          await queryInterface.changeColumn(table, column, {
            type: Sequelize.ENUM(...values),
            allowNull: column !== 'status' && column !== 'priority'
          });
        }
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable('purchase_orders', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};