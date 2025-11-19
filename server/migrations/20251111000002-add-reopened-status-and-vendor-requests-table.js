'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `ALTER TABLE purchase_orders 
         MODIFY COLUMN status ENUM(
           'draft', 
           'pending_approval', 
           'approved', 
           'sent', 
           'acknowledged', 
           'dispatched', 
           'in_transit', 
           'grn_requested', 
           'partial_received', 
           'received', 
           'grn_shortage', 
           'grn_overage', 
           'reopened', 
           'excess_received', 
           'completed', 
           'cancelled'
         ) DEFAULT 'draft'`,
        { transaction }
      );

      await queryInterface.createTable('vendor_requests', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        request_number: {
          type: Sequelize.STRING(50),
          unique: true,
          allowNull: false,
          comment: 'Format: VRQ-YYYYMMDD-XXXXX'
        },
        purchase_order_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'purchase_orders',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        grn_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'goods_receipt_notes',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
          comment: 'Original GRN that detected the shortage/overage'
        },
        vendor_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'vendors',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        complaint_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'approvals',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Link to the shortage/overage complaint'
        },
        request_type: {
          type: Sequelize.ENUM('shortage', 'overage'),
          allowNull: false,
          comment: 'Type of discrepancy being addressed'
        },
        items: {
          type: Sequelize.JSON,
          allowNull: false,
          comment: 'Array of items with discrepancies'
        },
        total_value: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0.00,
          comment: 'Total value of shortage/overage items'
        },
        status: {
          type: Sequelize.ENUM('pending', 'sent', 'acknowledged', 'in_transit', 'fulfilled', 'cancelled'),
          defaultValue: 'pending',
          comment: 'Current status of the vendor request'
        },
        message_to_vendor: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Message sent to vendor explaining the discrepancy'
        },
        vendor_response: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Vendor response or acknowledgment'
        },
        expected_fulfillment_date: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Expected date for vendor to fulfill the request'
        },
        fulfillment_grn_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'goods_receipt_notes',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'GRN created when shortage items are received'
        },
        sent_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Timestamp when request was sent to vendor'
        },
        acknowledged_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Timestamp when vendor acknowledged the request'
        },
        fulfilled_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Timestamp when request was fulfilled'
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
        sent_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
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
      }, { transaction });

      await queryInterface.addIndex('vendor_requests', ['request_number'], { transaction });
      await queryInterface.addIndex('vendor_requests', ['purchase_order_id'], { transaction });
      await queryInterface.addIndex('vendor_requests', ['grn_id'], { transaction });
      await queryInterface.addIndex('vendor_requests', ['vendor_id'], { transaction });
      await queryInterface.addIndex('vendor_requests', ['status'], { transaction });
      await queryInterface.addIndex('vendor_requests', ['request_type'], { transaction });
      await queryInterface.addIndex('vendor_requests', ['fulfillment_grn_id'], { transaction });
      await queryInterface.addIndex('vendor_requests', ['created_by'], { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('vendor_requests', { transaction });

      await queryInterface.sequelize.query(
        `ALTER TABLE purchase_orders 
         MODIFY COLUMN status ENUM(
           'draft', 
           'pending_approval', 
           'approved', 
           'sent', 
           'acknowledged', 
           'dispatched', 
           'in_transit', 
           'grn_requested', 
           'partial_received', 
           'received', 
           'grn_shortage', 
           'grn_overage', 
           'excess_received', 
           'completed', 
           'cancelled'
         ) DEFAULT 'draft'`,
        { transaction }
      );
    });
  }
};
