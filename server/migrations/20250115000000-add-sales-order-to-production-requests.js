'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('production_requests');

    // Add sales_order_id column only if missing
    if (!table.sales_order_id) {
      await queryInterface.addColumn('production_requests', 'sales_order_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sales_orders',
          key: 'id'
        },
        comment: 'Reference to Sales Order (if created from SO)'
      });
    }

    // Add sales_order_number column only if missing
    if (!table.sales_order_number) {
      await queryInterface.addColumn('production_requests', 'sales_order_number', {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Sales Order Number for reference'
      });
    }

    // Add sales_notes column only if missing
    if (!table.sales_notes) {
      await queryInterface.addColumn('production_requests', 'sales_notes', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notes from Sales department'
      });
    }

    // Make po_id nullable (since it can be from SO or PO)
    await queryInterface.changeColumn('production_requests', 'po_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'purchase_orders',
        key: 'id'
      },
      comment: 'Reference to Purchase Order (if created from PO)'
    });

    // Make po_number nullable
    await queryInterface.changeColumn('production_requests', 'po_number', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'PO Number for reference'
    });

    // Add indexes for new columns, avoiding duplicates
    const indexes = await queryInterface.showIndex('production_requests');
    const hasSalesOrderIndex = indexes.some(({ name }) => name === 'production_requests_sales_order_id_idx');

    if (!hasSalesOrderIndex) {
      await queryInterface.addIndex('production_requests', ['sales_order_id'], {
        name: 'production_requests_sales_order_id_idx'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const indexes = await queryInterface.showIndex('production_requests');
    const hasSalesOrderIndex = indexes.some(({ name }) => name === 'production_requests_sales_order_id_idx');

    // Remove index when present
    if (hasSalesOrderIndex) {
      await queryInterface.removeIndex('production_requests', 'production_requests_sales_order_id_idx');
    }

    const table = await queryInterface.describeTable('production_requests');

    // Remove columns only if they exist
    if (table.sales_order_id) {
      await queryInterface.removeColumn('production_requests', 'sales_order_id');
    }

    if (table.sales_order_number) {
      await queryInterface.removeColumn('production_requests', 'sales_order_number');
    }

    if (table.sales_notes) {
      await queryInterface.removeColumn('production_requests', 'sales_notes');
    }

    // Revert po_id to NOT NULL if it is currently nullable
    await queryInterface.changeColumn('production_requests', 'po_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'purchase_orders',
        key: 'id'
      }
    });

    // Revert po_number to NOT NULL
    await queryInterface.changeColumn('production_requests', 'po_number', {
      type: Sequelize.STRING(50),
      allowNull: false
    });
  }
};