'use strict';

const tableExists = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  const normalizedTables = tables.map((t) => (typeof t === 'string' ? t.toLowerCase() : t.tableName?.toLowerCase()));
  return normalizedTables.includes(tableName.toLowerCase());
};

const describeTableIfExists = async (queryInterface, tableName) => {
  const exists = await tableExists(queryInterface, tableName);
  if (!exists) {
    return null;
  }

  return queryInterface.describeTable(tableName);
};

const columnExists = (tableDefinition, columnName) => {
  if (!tableDefinition) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(tableDefinition, columnName);
};

const addColumnIfMissing = async (queryInterface, tableName, columnName, columnDefinition) => {
  const tableDefinition = await describeTableIfExists(queryInterface, tableName);

  if (!tableDefinition) {
    return;
  }

  if (!columnExists(tableDefinition, columnName)) {
    await queryInterface.addColumn(tableName, columnName, columnDefinition);
  }
};

const changeColumnIfExists = async (queryInterface, tableName, columnName, columnDefinition) => {
  const tableDefinition = await describeTableIfExists(queryInterface, tableName);

  if (!tableDefinition) {
    return;
  }

  if (columnExists(tableDefinition, columnName)) {
    await queryInterface.changeColumn(tableName, columnName, columnDefinition);
  }
};

const removeColumnIfExists = async (queryInterface, tableName, columnName) => {
  const tableDefinition = await describeTableIfExists(queryInterface, tableName);

  if (!tableDefinition) {
    return;
  }

  if (columnExists(tableDefinition, columnName)) {
    await queryInterface.removeColumn(tableName, columnName);
  }
};

const addIndexIfMissing = async (queryInterface, tableName, fields, options) => {
  const exists = await tableExists(queryInterface, tableName);

  if (!exists) {
    return;
  }

  const indexes = await queryInterface.showIndex(tableName);
  const indexName = options?.name;

  if (indexName && indexes.some((index) => index.name === indexName)) {
    return;
  }

  await queryInterface.addIndex(tableName, fields, options);
};

const removeIndexIfExists = async (queryInterface, tableName, indexName) => {
  const exists = await tableExists(queryInterface, tableName);

  if (!exists) {
    return;
  }

  const indexes = await queryInterface.showIndex(tableName);

  if (indexes.some((index) => index.name === indexName)) {
    await queryInterface.removeIndex(tableName, indexName);
  }
};

const createTableIfMissing = async (queryInterface, tableName, attributes, options) => {
  const exists = await tableExists(queryInterface, tableName);

  if (!exists) {
    await queryInterface.createTable(tableName, attributes, options);
  }
};

const dropTableIfExists = async (queryInterface, tableName) => {
  const exists = await tableExists(queryInterface, tableName);

  if (exists) {
    await queryInterface.dropTable(tableName);
  }
};

const dropEnumTypeIfExists = async (queryInterface, typeName) => {
  try {
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${typeName}"`);
  } catch (error) {
    // Ignore for dialects that do not support DROP TYPE (e.g., MySQL)
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    // --- Sales Orders: approval & procurement coordination fields ---
    await addColumnIfMissing(queryInterface, 'sales_orders', 'approval_status', {
      type: Sequelize.ENUM('not_requested', 'pending', 'in_review', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'not_requested',
      comment: 'Approval lifecycle status for the sales order'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'approval_requested_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who initiated the approval request'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'approval_requested_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when approval was requested'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'approval_decision_note', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Notes captured during approval decision'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'approval_decided_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when approval decision was finalized'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'ready_for_procurement', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Flag indicating sales order is ready to generate procurement documents'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'ready_for_procurement_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who marked the order as ready for procurement'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'ready_for_procurement_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when order was marked procurement-ready'
    });

    await addColumnIfMissing(queryInterface, 'sales_orders', 'procurement_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Notes intended for procurement during PO creation'
    });

    await addIndexIfMissing(queryInterface, 'sales_orders', ['approval_status'], {
      name: 'sales_orders_approval_status_idx'
    });

    await addIndexIfMissing(queryInterface, 'sales_orders', ['ready_for_procurement'], {
      name: 'sales_orders_ready_for_procurement_idx'
    });

    // --- Sales Order History table ---
    await createTableIfMissing(queryInterface, 'sales_order_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      sales_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sales_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Sales order associated with this lifecycle event'
      },
      status_from: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Previous status before transition'
      },
      status_to: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Status after transition'
      },
      approval_status_from: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Previous approval status before transition'
      },
      approval_status_to: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Approval status after transition'
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Additional context or remarks for the transition'
      },
      performed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who performed the action'
      },
      performed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Timestamp when the transition occurred'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Serialized metadata describing the lifecycle event'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await addIndexIfMissing(queryInterface, 'sales_order_history', ['sales_order_id', 'performed_at'], {
      name: 'sales_order_history_order_performed_idx'
    });

    await addIndexIfMissing(queryInterface, 'sales_order_history', ['performed_by'], {
      name: 'sales_order_history_performed_by_idx'
    });

    // --- Purchase Orders: approval metadata ---
    await addColumnIfMissing(queryInterface, 'purchase_orders', 'approval_status', {
      type: Sequelize.ENUM('not_requested', 'pending', 'in_review', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'not_requested',
      comment: 'Approval lifecycle status for the purchase order'
    });

    await addColumnIfMissing(queryInterface, 'purchase_orders', 'approval_decision_note', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Notes captured during procurement approval'
    });

    await addColumnIfMissing(queryInterface, 'purchase_orders', 'generated_from_sales_order', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates if this PO originated from a sales order workflow'
    });

    await addIndexIfMissing(queryInterface, 'purchase_orders', ['approval_status'], {
      name: 'purchase_orders_approval_status_idx'
    });

    await addIndexIfMissing(queryInterface, 'purchase_orders', ['generated_from_sales_order'], {
      name: 'purchase_orders_generated_from_sales_order_idx'
    });

    // --- Notifications: richer context for workflow triggers ---
    await addColumnIfMissing(queryInterface, 'notifications', 'trigger_event', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Key representing the event that generated the notification'
    });

    await addColumnIfMissing(queryInterface, 'notifications', 'actor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User responsible for the action that generated the notification'
    });

    await addColumnIfMissing(queryInterface, 'notifications', 'target_role', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Role key targeted by this notification when not tied to a specific role record'
    });

    await addIndexIfMissing(queryInterface, 'notifications', ['trigger_event'], {
      name: 'notifications_trigger_event_idx'
    });

    await addIndexIfMissing(queryInterface, 'notifications', ['actor_id'], {
      name: 'notifications_actor_idx'
    });

    // --- Approval workflow table ---
    await createTableIfMissing(queryInterface, 'approvals', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      entity_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Type of entity tied to this approval (sales_order, purchase_order, etc.)'
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Identifier of the entity requiring approval'
      },
      stage_key: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Stable key identifying the approval stage'
      },
      stage_label: {
        type: Sequelize.STRING(120),
        allowNull: false,
        comment: 'Human readable label for the approval stage'
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Ordering of the stage within the workflow'
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'approved', 'rejected', 'skipped', 'canceled'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Current status of this approval stage'
      },
      assigned_to_role_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Role responsible for reviewing this stage'
      },
      assigned_to_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Specific user responsible for this stage (if applicable)'
      },
      reviewer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who issued the decision for this stage'
      },
      decision_note: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Reviewer notes captured at decision time'
      },
      decided_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when the decision was recorded'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Serialized data for workflow orchestration'
      },
      due_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Optional due date for this approval stage'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who created the approval record'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await addIndexIfMissing(queryInterface, 'approvals', ['entity_type', 'entity_id', 'sequence'], {
      name: 'approvals_entity_sequence_idx'
    });

    await addIndexIfMissing(queryInterface, 'approvals', ['status'], {
      name: 'approvals_status_idx'
    });

    await addIndexIfMissing(queryInterface, 'approvals', ['assigned_to_user_id'], {
      name: 'approvals_assigned_user_idx'
    });

    await addIndexIfMissing(queryInterface, 'approvals', ['assigned_to_role_id'], {
      name: 'approvals_assigned_role_idx'
    });
  },

  async down(queryInterface) {
    await removeIndexIfExists(queryInterface, 'approvals', 'approvals_assigned_role_idx');
    await removeIndexIfExists(queryInterface, 'approvals', 'approvals_assigned_user_idx');
    await removeIndexIfExists(queryInterface, 'approvals', 'approvals_status_idx');
    await removeIndexIfExists(queryInterface, 'approvals', 'approvals_entity_sequence_idx');
    await dropTableIfExists(queryInterface, 'approvals');

    await removeIndexIfExists(queryInterface, 'notifications', 'notifications_actor_idx');
    await removeIndexIfExists(queryInterface, 'notifications', 'notifications_trigger_event_idx');
    await removeColumnIfExists(queryInterface, 'notifications', 'target_role');
    await removeColumnIfExists(queryInterface, 'notifications', 'actor_id');
    await removeColumnIfExists(queryInterface, 'notifications', 'trigger_event');

    await removeIndexIfExists(queryInterface, 'purchase_orders', 'purchase_orders_generated_from_sales_order_idx');
    await removeIndexIfExists(queryInterface, 'purchase_orders', 'purchase_orders_approval_status_idx');
    await removeColumnIfExists(queryInterface, 'purchase_orders', 'generated_from_sales_order');
    await removeColumnIfExists(queryInterface, 'purchase_orders', 'approval_decision_note');
    await removeColumnIfExists(queryInterface, 'purchase_orders', 'approval_status');

    await removeIndexIfExists(queryInterface, 'sales_order_history', 'sales_order_history_performed_by_idx');
    await removeIndexIfExists(queryInterface, 'sales_order_history', 'sales_order_history_order_performed_idx');
    await dropTableIfExists(queryInterface, 'sales_order_history');

    await removeIndexIfExists(queryInterface, 'sales_orders', 'sales_orders_ready_for_procurement_idx');
    await removeIndexIfExists(queryInterface, 'sales_orders', 'sales_orders_approval_status_idx');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'procurement_notes');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'ready_for_procurement_at');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'ready_for_procurement_by');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'ready_for_procurement');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'approval_decided_at');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'approval_decision_note');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'approval_requested_at');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'approval_requested_by');
    await removeColumnIfExists(queryInterface, 'sales_orders', 'approval_status');

    await dropEnumTypeIfExists(queryInterface, 'enum_sales_orders_approval_status');
    await dropEnumTypeIfExists(queryInterface, 'enum_purchase_orders_approval_status');
    await dropEnumTypeIfExists(queryInterface, 'enum_approvals_status');
  }
};