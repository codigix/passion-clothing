'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'sales_orders';

    async function describeTableSafe() {
      try {
        return await queryInterface.describeTable(tableName);
      } catch (error) {
        console.log(`⊘ Unable to describe table ${tableName}: ${error.message}`);
        return null;
      }
    }

    async function columnExists(columnName) {
      const table = await describeTableSafe();
      return table ? table[columnName] !== undefined : false;
    }

    async function addColumnIfMissing(columnName, definition) {
      const exists = await columnExists(columnName);
      if (exists) {
        console.log(`⊘ Column ${columnName} already exists on ${tableName}, skipping`);
        return;
      }

      await queryInterface.addColumn(tableName, columnName, definition);
      console.log(`✓ Added column ${columnName} to ${tableName}`);
    }

    async function addIndexIfMissing(columns, options) {
      try {
        const existingIndexes = await queryInterface.showIndex(tableName);
        const alreadyExists = existingIndexes.some((index) => index.name === options.name);
        if (alreadyExists) {
          console.log(`⊘ Index ${options.name} already exists on ${tableName}, skipping`);
          return;
        }

        await queryInterface.addIndex(tableName, columns, options);
        console.log(`✓ Added index ${options.name} to ${tableName}`);
      } catch (error) {
        console.log(`⊘ Unable to add index ${options.name}: ${error.message}`);
      }
    }

    await addColumnIfMissing('project_reference', {
      type: Sequelize.STRING(120),
      allowNull: true,
      comment: 'Project reference code used to link manufacturing orders'
    });

    await addColumnIfMissing('project_name', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Human-friendly project name for dashboards and reports'
    });

    await addIndexIfMissing(['project_reference'], {
      name: 'idx_sales_orders_project_reference'
    });
  },

  down: async (queryInterface) => {
    const tableName = 'sales_orders';

    async function describeTableSafe() {
      try {
        return await queryInterface.describeTable(tableName);
      } catch (error) {
        console.log(`⊘ Unable to describe table ${tableName}: ${error.message}`);
        return null;
      }
    }

    async function columnExists(columnName) {
      const table = await describeTableSafe();
      return table ? table[columnName] !== undefined : false;
    }

    async function removeColumnIfExists(columnName) {
      const exists = await columnExists(columnName);
      if (!exists) {
        console.log(`⊘ Column ${columnName} not present on ${tableName}, skipping removal`);
        return;
      }

      await queryInterface.removeColumn(tableName, columnName);
      console.log(`✓ Removed column ${columnName} from ${tableName}`);
    }

    async function removeIndexIfExists(indexName) {
      try {
        const existingIndexes = await queryInterface.showIndex(tableName);
        const hasIndex = existingIndexes.some((index) => index.name === indexName);
        if (!hasIndex) {
          console.log(`⊘ Index ${indexName} not present on ${tableName}, skipping removal`);
          return;
        }

        await queryInterface.removeIndex(tableName, indexName);
        console.log(`✓ Removed index ${indexName} from ${tableName}`);
      } catch (error) {
        console.log(`⊘ Unable to remove index ${indexName}: ${error.message}`);
      }
    }

    await removeIndexIfExists('idx_sales_orders_project_reference');
    await removeColumnIfExists('project_name');
    await removeColumnIfExists('project_reference');
  }
};