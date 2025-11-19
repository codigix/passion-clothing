module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const transaction = await queryInterface.sequelize.transaction();
      
      // Check if columns already exist
      const tableDescription = await queryInterface.describeTable('goods_receipt_notes', { transaction });
      
      const columnsToAdd = [];
      
      if (!tableDescription.grn_sequence) {
        columnsToAdd.push(
          queryInterface.addColumn(
            'goods_receipt_notes',
            'grn_sequence',
            {
              type: Sequelize.INTEGER,
              allowNull: false,
              defaultValue: 1,
              comment: 'Sequence number for GRN against same PO (1st GRN, 2nd GRN, etc.)'
            },
            { transaction }
          )
        );
      }
      
      if (!tableDescription.is_first_grn) {
        columnsToAdd.push(
          queryInterface.addColumn(
            'goods_receipt_notes',
            'is_first_grn',
            {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: true,
              comment: 'Whether this is the first GRN for the PO'
            },
            { transaction }
          )
        );
      }
      
      if (!tableDescription.original_grn_id) {
        columnsToAdd.push(
          queryInterface.addColumn(
            'goods_receipt_notes',
            'original_grn_id',
            {
              type: Sequelize.INTEGER,
              allowNull: true,
              references: {
                model: 'goods_receipt_notes',
                key: 'id'
              },
              comment: 'Reference to first GRN when this is a shortage fulfillment GRN'
            },
            { transaction }
          )
        );
      }
      
      if (!tableDescription.shortage_fulfillment_metadata) {
        columnsToAdd.push(
          queryInterface.addColumn(
            'goods_receipt_notes',
            'shortage_fulfillment_metadata',
            {
              type: Sequelize.JSON,
              allowNull: true,
              comment: 'Metadata for shortage fulfillment: { original_grn_number, vendor_request_id, vendor_request_number, complaint_date }'
            },
            { transaction }
          )
        );
      }
      
      if (columnsToAdd.length > 0) {
        await Promise.all(columnsToAdd);
        console.log(`Added ${columnsToAdd.length} columns to goods_receipt_notes table`);
      } else {
        console.log('All columns already exist in goods_receipt_notes table');
      }
      
      await transaction.commit();
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const transaction = await queryInterface.sequelize.transaction();
      
      const tableDescription = await queryInterface.describeTable('goods_receipt_notes', { transaction });
      
      const columnsToRemove = [];
      
      if (tableDescription.grn_sequence) {
        columnsToRemove.push(
          queryInterface.removeColumn('goods_receipt_notes', 'grn_sequence', { transaction })
        );
      }
      
      if (tableDescription.is_first_grn) {
        columnsToRemove.push(
          queryInterface.removeColumn('goods_receipt_notes', 'is_first_grn', { transaction })
        );
      }
      
      if (tableDescription.original_grn_id) {
        columnsToRemove.push(
          queryInterface.removeColumn('goods_receipt_notes', 'original_grn_id', { transaction })
        );
      }
      
      if (tableDescription.shortage_fulfillment_metadata) {
        columnsToRemove.push(
          queryInterface.removeColumn('goods_receipt_notes', 'shortage_fulfillment_metadata', { transaction })
        );
      }
      
      if (columnsToRemove.length > 0) {
        await Promise.all(columnsToRemove);
        console.log(`Removed ${columnsToRemove.length} columns from goods_receipt_notes table`);
      }
      
      await transaction.commit();
    } catch (error) {
      console.error('Rollback error:', error);
      throw error;
    }
  }
};
