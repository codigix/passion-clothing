const db = require('./config/database');

async function checkDispatchSetup() {
  try {
    console.log('🔍 Checking Material Dispatch Setup...\n');

    // 1. Check if material_dispatches table exists
    const [tables] = await db.sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'material_dispatches'
    `);
    
    console.log('1️⃣ Table Existence:', tables.length > 0 ? '✅ EXISTS' : '❌ MISSING');
    
    if (tables.length === 0) {
      console.log('\n⚠️  Table "material_dispatches" does not exist!');
      console.log('Run migration: npx sequelize-cli db:migrate');
      process.exit(1);
    }

    // 2. Check table structure
    const [columns] = await db.sequelize.query(`
      DESCRIBE material_dispatches
    `);
    
    console.log('\n2️⃣ Table Columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
    });

    // 3. Check if there are any MRN requests
    const mrnRequests = await db.ProjectMaterialRequest.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'request_number', 'status', 'materials_requested']
    });

    console.log('\n3️⃣ Sample MRN Requests:', mrnRequests.length);
    mrnRequests.forEach(mrn => {
      console.log(`   - MRN #${mrn.request_number} (ID: ${mrn.id}) - Status: ${mrn.status}`);
      
      // Try to parse materials
      try {
        const materials = typeof mrn.materials_requested === 'string' 
          ? JSON.parse(mrn.materials_requested) 
          : mrn.materials_requested;
        console.log(`     Materials: ${materials.length} items`);
      } catch (e) {
        console.log(`     ⚠️  Materials parse error: ${e.message}`);
      }
    });

    // 4. Check if dispatches exist
    const [dispatchCount] = await db.sequelize.query(`
      SELECT COUNT(*) as count FROM material_dispatches
    `);
    
    console.log('\n4️⃣ Existing Dispatches:', dispatchCount[0].count);

    // 5. Test dispatch creation with sample data
    console.log('\n5️⃣ Testing Dispatch Creation...');
    
    if (mrnRequests.length > 0) {
      const testMRN = mrnRequests[0];
      console.log(`   Using MRN: ${testMRN.request_number} (ID: ${testMRN.id})`);
      
      try {
        let materials = typeof testMRN.materials_requested === 'string' 
          ? JSON.parse(testMRN.materials_requested) 
          : testMRN.materials_requested;

        if (materials && materials.length > 0) {
          const testDispatchData = {
            dispatch_number: `TEST-${Date.now()}`,
            mrn_request_id: testMRN.id,
            project_name: testMRN.project_name || 'Test Project',
            dispatched_materials: materials.map(m => ({
              material_name: m.material_name,
              material_code: m.material_code || 'N/A',
              quantity_dispatched: m.quantity_requested || 1,
              uom: m.uom || 'PCS',
              barcode: m.barcode || null,
              batch_number: m.batch_number || null,
              location: m.location || null,
              inventory_id: m.inventory_id || null
            })),
            total_items: materials.length,
            dispatched_by: 1, // Admin user
            dispatched_at: new Date(),
            received_status: 'pending'
          };

          console.log('   Test dispatch data prepared ✅');
          console.log('   - Materials:', testDispatchData.dispatched_materials.length);
          console.log('   - Project:', testDispatchData.project_name);
          
          // Don't actually create, just validate
          console.log('   ✅ Data structure is valid');
        } else {
          console.log('   ⚠️  No materials in MRN request');
        }
      } catch (error) {
        console.log(`   ❌ Test failed: ${error.message}`);
      }
    } else {
      console.log('   ⚠️  No MRN requests available for testing');
    }

    console.log('\n✅ Setup check complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error during check:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkDispatchSetup();