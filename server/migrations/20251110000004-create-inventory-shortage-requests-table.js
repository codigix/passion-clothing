module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inventory_shortage_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      request_number: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
      },
      request_type: {
        type: Sequelize.ENUM('shortage', 'overage'),
        allowNull: false,
        defaultValue: 'shortage'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id'
        }
      },
      product_code: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      product_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      current_stock: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0
      },
      minimum_stock: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0
      },
      required_quantity: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      uom: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
      },
      status: {
        type: Sequelize.ENUM('pending', 'pending_approval', 'approved', 'rejected', 'po_created', 'resolved'),
        defaultValue: 'pending'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejected_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rejected_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      related_po_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'purchase_orders',
          key: 'id'
        }
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('inventory_shortage_requests', ['request_number']);
    await queryInterface.addIndex('inventory_shortage_requests', ['product_id']);
    await queryInterface.addIndex('inventory_shortage_requests', ['status']);
    await queryInterface.addIndex('inventory_shortage_requests', ['request_type']);
    await queryInterface.addIndex('inventory_shortage_requests', ['priority']);
    await queryInterface.addIndex('inventory_shortage_requests', ['created_by']);
    await queryInterface.addIndex('inventory_shortage_requests', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('inventory_shortage_requests');
  }
};
