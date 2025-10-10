const {GoodsReceiptNote, Inventory, InventoryMovement, sequelize} = require('./config/database');

(async () => {
  try {
    const grnId = 2;
    
    const grn = await GoodsReceiptNote.findByPk(grnId);
    
    if (!grn) {
      console.error('GRN not found');
      process.exit(1);
    }
    
    console.log(`Current status: ${grn.verification_status}`);
    
    // Reset GRN to pending
    await grn.update({
      verification_status: 'pending',
      verified_by: null,
      verification_date: null,
      inventory_added: false,
      inventory_added_date: null,
      status: 'received'
    });
    
    console.log(`✅ GRN #${grnId} reset to pending verification`);
    
    // Delete inventory items created from this GRN
    const deleted = await Inventory.destroy({
      where: { source_reference_number: grn.grn_number }
    });
    
    console.log(`✅ Deleted ${deleted} inventory items from previous verification`);
    
    // Delete inventory movements
    const deletedMovements = await InventoryMovement.destroy({
      where: { reference_number: grn.grn_number }
    });
    
    console.log(`✅ Deleted ${deletedMovements} inventory movements`);
    
    console.log('\n🎉 GRN reset complete! You can now verify it again.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();