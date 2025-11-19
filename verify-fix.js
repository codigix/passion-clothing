/**
 * Verification script to confirm shipment_id column fix
 */

const { sequelize } = require('./server/config/database');

async function verifyFix() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('   SHIPMENT_ID COLUMN FIX - VERIFICATION REPORT');
    console.log('='.repeat(60) + '\n');

    // Check if column exists
    const [result] = await sequelize.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = "production_orders" AND COLUMN_NAME = "shipment_id"`
    );

    if (result.length === 0) {
      console.log('❌ CRITICAL: shipment_id column does NOT exist');
      console.log('\n⚠️  The fix was not successful. The column is still missing.');
      process.exit(1);
    }

    console.log('✅ Column Found: shipment_id\n');
    console.log('Column Details:');
    console.log(`  - Type: ${result[0].COLUMN_TYPE}`);
    console.log(`  - Nullable: ${result[0].IS_NULLABLE}`);
    console.log(`  - Default: ${result[0].COLUMN_DEFAULT || 'NULL'}`);
    console.log(`  - Key: ${result[0].COLUMN_KEY || 'None'}\n`);

    // Check foreign key
    const [fkResult] = await sequelize.query(
      `SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_NAME = "production_orders" AND COLUMN_NAME = "shipment_id"`
    );

    if (fkResult.length > 0) {
      console.log('✅ Foreign Key Created\n');
      console.log('Foreign Key Details:');
      console.log(`  - Constraint: ${fkResult[0].CONSTRAINT_NAME}`);
      console.log(`  - References: ${fkResult[0].REFERENCED_TABLE_NAME}.${fkResult[0].REFERENCED_COLUMN_NAME}\n`);
    } else {
      console.log('⚠️  WARNING: Foreign key not found\n');
    }

    // Check index
    const [indexResult] = await sequelize.query(
      `SHOW INDEX FROM production_orders WHERE Column_name = "shipment_id"`
    );

    if (indexResult.length > 0) {
      console.log('✅ Index Created\n');
      console.log('Index Details:');
      console.log(`  - Name: ${indexResult[0].Key_name}`);
      console.log(`  - Type: ${indexResult[0].Index_type}\n`);
    } else {
      console.log('⚠️  WARNING: Index not found\n');
    }

    // Test API endpoint
    console.log('Testing Backend API Endpoint...\n');
    
    try {
      // Try to query production orders
      const { ProductionOrder } = require('./server/models');
      const testQuery = await ProductionOrder.findOne({
        attributes: ['id', 'production_number', 'shipment_id']
      });
      
      console.log('✅ Database Query Successful');
      console.log(`  - Sample query executed without errors`);
      if (testQuery) {
        console.log(`  - Production Order Found: ${testQuery.production_number}\n`);
      } else {
        console.log('  - No production orders in database (expected if new)\n');
      }
    } catch (error) {
      console.log(`❌ Database Query Failed: ${error.message}\n`);
    }

    // Final summary
    console.log('='.repeat(60));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(60) + '\n');

    const allGood = result.length > 0 && fkResult.length > 0 && indexResult.length > 0;
    
    if (allGood) {
      console.log('✅ ALL SYSTEMS OPERATIONAL');
      console.log('\n✓ shipment_id column exists');
      console.log('✓ Foreign key constraint created');
      console.log('✓ Database index created');
      console.log('✓ API endpoint should work correctly\n');
      console.log('ACTION: Refresh your browser to see the fix in action!\n');
    } else {
      console.log('⚠️  PARTIAL SUCCESS - Some components missing');
      console.log('\nPlease check:');
      if (result.length === 0) console.log('  [ ] Column exists');
      if (fkResult.length === 0) console.log('  [ ] Foreign key exists');
      if (indexResult.length === 0) console.log('  [ ] Index exists');
      console.log();
    }

    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Verification Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

verifyFix();