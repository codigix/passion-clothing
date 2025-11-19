const { sequelize } = require('./config/database');

async function addVendorIdColumn() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    
    const columnExists = await queryInterface.describeTable('goods_receipt_notes')
      .then(columns => !!columns.vendor_id);
    
    if (columnExists) {
      console.log('✅ vendor_id column already exists in goods_receipt_notes table');
      return;
    }
    
    await queryInterface.addColumn('goods_receipt_notes', 'vendor_id', {
      type: require('sequelize').INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id'
      },
      comment: 'Vendor associated with this GRN (denormalized from PO for reliability)'
    });
    
    await queryInterface.addIndex('goods_receipt_notes', ['vendor_id']);
    
    console.log('✅ Successfully added vendor_id column to goods_receipt_notes table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding vendor_id column:', error.message);
    process.exit(1);
  }
}

addVendorIdColumn();
