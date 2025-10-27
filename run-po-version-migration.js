const { sequelize } = require('./server/config/database');

async function runMigration() {
  try {
    console.log('🔄 Starting PO version history migration...');
    
    const queryInterface = sequelize.getQueryInterface();
    const Sequelize = require('sequelize');
    
    // Check if columns already exist
    const table = await queryInterface.describeTable('purchase_orders');
    
    const columnsToAdd = [
      { name: 'version_number', exists: !!table.version_number },
      { name: 'change_history', exists: !!table.change_history },
      { name: 'last_edited_by', exists: !!table.last_edited_by },
      { name: 'last_edited_at', exists: !!table.last_edited_at },
      { name: 'requires_reapproval', exists: !!table.requires_reapproval }
    ];
    
    console.log('📋 Column status:');
    columnsToAdd.forEach(col => {
      console.log(`  ${col.exists ? '✅' : '❌'} ${col.name}`);
    });
    
    // Add version_number column
    if (!table.version_number) {
      console.log('➕ Adding version_number column...');
      await queryInterface.addColumn('purchase_orders', 'version_number', {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: 'Current version number of the PO'
      });
      console.log('✅ version_number added');
    }
    
    // Add change_history column
    if (!table.change_history) {
      console.log('➕ Adding change_history column...');
      await queryInterface.addColumn('purchase_orders', 'change_history', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of all changes made to the PO'
      });
      console.log('✅ change_history added');
    }
    
    // Add last_edited_by column
    if (!table.last_edited_by) {
      console.log('➕ Adding last_edited_by column...');
      await queryInterface.addColumn('purchase_orders', 'last_edited_by', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'User ID of person who last edited the PO'
      });
      console.log('✅ last_edited_by added');
    }
    
    // Add last_edited_at column
    if (!table.last_edited_at) {
      console.log('➕ Adding last_edited_at column...');
      await queryInterface.addColumn('purchase_orders', 'last_edited_at', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp of last edit'
      });
      console.log('✅ last_edited_at added');
    }
    
    // Add requires_reapproval column
    if (!table.requires_reapproval) {
      console.log('➕ Adding requires_reapproval column...');
      await queryInterface.addColumn('purchase_orders', 'requires_reapproval', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Flag to indicate if PO requires re-approval after edits'
      });
      console.log('✅ requires_reapproval added');
    }
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();