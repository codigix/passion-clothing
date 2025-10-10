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
    async function addIndexIfMissing(tableName, columns, options) {
      try {
        const indexes = await queryInterface.showIndex(tableName);
        const indexExists = indexes.some(index => index.name === options.name);
        if (!indexExists) {
          await queryInterface.addIndex(tableName, columns, options);
          console.log(`✓ Added index ${options.name} to ${tableName}`);
        } else {
          console.log(`⊘ Index ${options.name} already exists in ${tableName}, skipping`);
        }
      } catch (error) {
        console.log(`⊘ Could not check/add index ${options.name}: ${error.message}`);
      }
    }

    // Add columns safely
    await addColumnIfMissing('purchase_orders', 'customer_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Customer for independent purchase orders'
    });

    await addColumnIfMissing('purchase_orders', 'project_name', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Project name for the purchase order'
    });

    // Add index for customer_id
    await addIndexIfMissing('purchase_orders', ['customer_id'], {
      name: 'idx_purchase_orders_customer_id'
    });
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

    // Helper function to remove index only if it exists
    async function removeIndexIfExists(tableName, indexName) {
      try {
        const indexes = await queryInterface.showIndex(tableName);
        const indexExists = indexes.some(index => index.name === indexName);
        if (indexExists) {
          await queryInterface.removeIndex(tableName, indexName);
          console.log(`✓ Removed index ${indexName} from ${tableName}`);
        } else {
          console.log(`⊘ Index ${indexName} doesn't exist in ${tableName}, skipping`);
        }
      } catch (error) {
        console.log(`⊘ Could not check/remove index ${indexName}: ${error.message}`);
      }
    }

    // Remove index and columns safely
    await removeIndexIfExists('purchase_orders', 'idx_purchase_orders_customer_id');
    await removeColumnIfExists('purchase_orders', 'project_name');
    await removeColumnIfExists('purchase_orders', 'customer_id');
  }
};