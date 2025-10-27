const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'passion_erp'
};

async function addColumns() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('🔄 Starting database migration...\n');
    
    // List of columns to add with their definitions
    const columns = [
      {
        name: 'version_number',
        definition: 'INT DEFAULT 1 COMMENT "Current version number of the PO"'
      },
      {
        name: 'change_history',
        definition: 'JSON COMMENT "Array of all changes made to the PO"'
      },
      {
        name: 'last_edited_by',
        definition: 'INT COMMENT "User ID of person who last edited the PO"'
      },
      {
        name: 'last_edited_at',
        definition: 'DATETIME COMMENT "Timestamp of last edit"'
      },
      {
        name: 'requires_reapproval',
        definition: 'BOOLEAN DEFAULT FALSE COMMENT "Flag to indicate if PO requires re-approval"'
      }
    ];
    
    // Try to add each column
    for (const col of columns) {
      try {
        await connection.query(
          `ALTER TABLE purchase_orders ADD COLUMN ${col.name} ${col.definition}`
        );
        console.log(`✅ Added column: ${col.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⏭️  Column ${col.name} already exists`);
        } else {
          console.error(`❌ Error adding ${col.name}:`, error.message);
        }
      }
    }
    
    // Try to add indexes
    const indexes = [
      { name: 'idx_version_number', column: 'version_number' },
      { name: 'idx_last_edited_at', column: 'last_edited_at' },
      { name: 'idx_requires_reapproval', column: 'requires_reapproval' }
    ];
    
    console.log('\n📊 Adding indexes...\n');
    
    for (const idx of indexes) {
      try {
        await connection.query(
          `CREATE INDEX ${idx.name} ON purchase_orders (${idx.column})`
        );
        console.log(`✅ Created index: ${idx.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`⏭️  Index ${idx.name} already exists`);
        } else {
          console.error(`❌ Error creating ${idx.name}:`, error.message);
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await connection.end();
  }
}

addColumns();