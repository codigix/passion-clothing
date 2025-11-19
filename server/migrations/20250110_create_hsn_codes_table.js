'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('hsn_codes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: Sequelize.STRING(20),
        unique: true,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      gst_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0
      },
      unit_of_measure: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'Meters'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('hsn_codes', ['code']);
    await queryInterface.addIndex('hsn_codes', ['category']);
    await queryInterface.addIndex('hsn_codes', ['is_active']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('hsn_codes');
  }
};
