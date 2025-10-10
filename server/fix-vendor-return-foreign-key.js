require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixVendorReturnFK() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'passion_erp'
  });

  try {
    console.log('🔧 Fixing VendorReturn Foreign Key Constraint\n');
    console.log('=' .repeat(60));

    // Step 1: Check current foreign key
    console.log('\n📋 Step 1: Checking current foreign key...\n');
    const [currentFKs] = await connection.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'vendorreturn'
        AND COLUMN_NAME = 'grn_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [process.env.DB_NAME]);

    if (currentFKs.length > 0) {
      console.log(`Current FK: ${currentFKs[0].CONSTRAINT_NAME}`);
      console.log(`  ${currentFKs[0].COLUMN_NAME} -> ${currentFKs[0].REFERENCED_TABLE_NAME}(${currentFKs[0].REFERENCED_COLUMN_NAME})`);
      
      if (currentFKs[0].REFERENCED_TABLE_NAME === 'goods_receipt_notes') {
        console.log('\n✅ Foreign key is already correct! Points to goods_receipt_notes');
        return;
      }

      // Step 2: Drop the old foreign key
      console.log(`\n🗑️  Step 2: Dropping old foreign key: ${currentFKs[0].CONSTRAINT_NAME}...\n`);
      await connection.query(`
        ALTER TABLE vendorreturn
        DROP FOREIGN KEY ${currentFKs[0].CONSTRAINT_NAME}
      `);
      console.log('✅ Old foreign key dropped successfully');
    } else {
      console.log('ℹ️  No existing foreign key found for grn_id');
    }

    // Step 3: Create new foreign key pointing to correct table
    console.log('\n➕ Step 3: Creating new foreign key to goods_receipt_notes...\n');
    await connection.query(`
      ALTER TABLE vendorreturn
      ADD CONSTRAINT vendorreturn_grn_fk
      FOREIGN KEY (grn_id) 
      REFERENCES goods_receipt_notes(id)
      ON DELETE SET NULL 
      ON UPDATE CASCADE
    `);
    console.log('✅ New foreign key created successfully');

    // Step 4: Verify the change
    console.log('\n✔️  Step 4: Verifying the change...\n');
    const [newFKs] = await connection.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'vendorreturn'
        AND COLUMN_NAME = 'grn_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [process.env.DB_NAME]);

    if (newFKs.length > 0 && newFKs[0].REFERENCED_TABLE_NAME === 'goods_receipt_notes') {
      console.log('✅ VERIFICATION SUCCESSFUL!');
      console.log(`   ${newFKs[0].CONSTRAINT_NAME}: ${newFKs[0].COLUMN_NAME} -> ${newFKs[0].REFERENCED_TABLE_NAME}(${newFKs[0].REFERENCED_COLUMN_NAME})`);
    } else {
      console.log('❌ Verification failed');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Foreign Key Fix Complete!');
    console.log('=' .repeat(60));
    console.log('\n📌 Summary:');
    console.log('   - vendorreturn.grn_id now references goods_receipt_notes(id)');
    console.log('   - GRN creation with shortage detection should now work');
    console.log('\n⚠️  Next Step: Restart your Node.js server');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await connection.end();
  }
}

fixVendorReturnFK();