'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // 1. Add new columns to production_stages table
      await queryInterface.addColumn('production_stages', 'start_date', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Start date of the stage'
      }, { transaction });

      await queryInterface.addColumn('production_stages', 'end_date', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'End date of the stage'
      }, { transaction });

      await queryInterface.addColumn('production_stages', 'operations', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of operations for this stage'
      }, { transaction });

      await queryInterface.addColumn('production_stages', 'outsource_type', {
        type: Sequelize.ENUM('none', 'printing', 'embroidery', 'both'),
        defaultValue: 'none',
        comment: 'Type of outsourcing for this stage'
      }, { transaction });

      await queryInterface.addColumn('production_stages', 'outsource_dispatch_date', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when materials were dispatched to vendor'
      }, { transaction });

      await queryInterface.addColumn('production_stages', 'outsource_return_date', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expected/actual return date from vendor'
      }, { transaction });

      await queryInterface.addColumn('production_stages', 'challan_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'challans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Challan for outsourced work'
      }, { transaction });

      // 2. Create stage_operations table
      await queryInterface.createTable('stage_operations', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        production_stage_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'production_stages',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        operation_name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Name of the operation'
        },
        operation_order: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Order of operation within the stage'
        },
        status: {
          type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'skipped'),
          defaultValue: 'pending'
        },
        start_time: {
          type: Sequelize.DATE,
          allowNull: true
        },
        end_time: {
          type: Sequelize.DATE,
          allowNull: true
        },
        assigned_to: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        machine_id: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Machine or equipment used'
        },
        quantity_processed: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        notes: {
          type: Sequelize.TEXT,
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // 3. Enhance material_consumption table
      const materialConsumptionExists = await queryInterface.showAllTables()
        .then(tables => tables.includes('material_consumption'));

      if (!materialConsumptionExists) {
        await queryInterface.createTable('material_consumption', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          production_order_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'production_orders',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          production_stage_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'production_stages',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          material_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'products',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          },
          material_barcode: {
            type: Sequelize.STRING(100),
            allowNull: true,
            comment: 'Barcode of the material item'
          },
          quantity_allocated: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0.00
          },
          quantity_used: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0.00
          },
          quantity_returned: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0.00
          },
          unit: {
            type: Sequelize.STRING(20),
            allowNull: false,
            defaultValue: 'pcs'
          },
          status: {
            type: Sequelize.ENUM('allocated', 'consumed', 'partially_consumed', 'returned'),
            defaultValue: 'allocated'
          },
          consumed_at: {
            type: Sequelize.DATE,
            allowNull: true
          },
          consumed_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          notes: {
            type: Sequelize.TEXT,
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
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        }, { transaction });
      } else {
        // Add new columns if table exists
        const columns = await queryInterface.describeTable('material_consumption');
        
        if (!columns.material_barcode) {
          await queryInterface.addColumn('material_consumption', 'material_barcode', {
            type: Sequelize.STRING(100),
            allowNull: true,
            comment: 'Barcode of the material item'
          }, { transaction });
        }

        if (!columns.quantity_returned) {
          await queryInterface.addColumn('material_consumption', 'quantity_returned', {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0.00
          }, { transaction });
        }
      }

      // 4. Create production_completion table
      await queryInterface.createTable('production_completion', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        production_order_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'production_orders',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        required_quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Total quantity required'
        },
        produced_quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Total quantity produced'
        },
        approved_quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Quantity approved in QC'
        },
        rejected_quantity: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          comment: 'Quantity rejected in QC'
        },
        all_quantity_received: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          comment: 'Whether all required quantity was produced'
        },
        quantity_shortage_reason: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Reason if quantity is short'
        },
        all_materials_used: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          comment: 'Whether all allocated materials were used'
        },
        material_return_summary: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Summary of materials returned to inventory'
        },
        material_return_notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        completion_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        completed_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        shipment_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'shipments',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        sent_to_shipment: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        shipment_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        notes: {
          type: Sequelize.TEXT,
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // 5. Add indexes
      await queryInterface.addIndex('stage_operations', ['production_stage_id'], { transaction });
      await queryInterface.addIndex('stage_operations', ['status'], { transaction });
      await queryInterface.addIndex('stage_operations', ['assigned_to'], { transaction });
      
      await queryInterface.addIndex('material_consumption', ['production_order_id'], { transaction });
      await queryInterface.addIndex('material_consumption', ['production_stage_id'], { transaction });
      await queryInterface.addIndex('material_consumption', ['material_barcode'], { transaction });
      await queryInterface.addIndex('material_consumption', ['status'], { transaction });
      
      await queryInterface.addIndex('production_completion', ['production_order_id'], { transaction });
      await queryInterface.addIndex('production_completion', ['shipment_id'], { transaction });
      await queryInterface.addIndex('production_completion', ['sent_to_shipment'], { transaction });

      await transaction.commit();
      console.log('✅ Production tracking system enhanced successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error enhancing production tracking system:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Drop tables
      await queryInterface.dropTable('production_completion', { transaction });
      await queryInterface.dropTable('stage_operations', { transaction });
      
      // Remove columns from production_stages
      await queryInterface.removeColumn('production_stages', 'challan_id', { transaction });
      await queryInterface.removeColumn('production_stages', 'outsource_return_date', { transaction });
      await queryInterface.removeColumn('production_stages', 'outsource_dispatch_date', { transaction });
      await queryInterface.removeColumn('production_stages', 'outsource_type', { transaction });
      await queryInterface.removeColumn('production_stages', 'operations', { transaction });
      await queryInterface.removeColumn('production_stages', 'end_date', { transaction });
      await queryInterface.removeColumn('production_stages', 'start_date', { transaction });

      await transaction.commit();
      console.log('✅ Production tracking enhancements rolled back');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error rolling back production tracking enhancements:', error);
      throw error;
    }
  }
};