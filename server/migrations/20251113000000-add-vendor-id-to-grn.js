module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('goods_receipt_notes', 'vendor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id'
      },
      comment: 'Vendor associated with this GRN (denormalized from PO for reliability)'
    });

    await queryInterface.addIndex('goods_receipt_notes', ['vendor_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('goods_receipt_notes', ['vendor_id']);
    await queryInterface.removeColumn('goods_receipt_notes', 'vendor_id');
  }
};
