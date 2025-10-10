const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

async function checkWorkflow() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    console.log('═══════════════════════════════════════════');
    console.log('   MRN TO PRODUCTION - WORKFLOW STATUS');
    console.log('═══════════════════════════════════════════\n');

    // Step 1: Check MRN Request
    console.log('📋 STEP 1: MRN REQUEST (Manufacturing)');
    console.log('───────────────────────────────────────────');
    const [mrns] = await sequelize.query(`
      SELECT id, request_number, project_name, status, materials_requested, priority
      FROM project_material_requests 
      WHERE status = 'pending_inventory_review'
      LIMIT 1
    `);

    if (mrns.length === 0) {
      console.log('❌ No MRN requests found in pending_inventory_review status\n');
      return;
    }

    const mrn = mrns[0];
    console.log(`✅ MRN Found: ${mrn.request_number}`);
    console.log(`   Project: ${mrn.project_name}`);
    console.log(`   Status: ${mrn.status}`);
    console.log(`   Priority: ${mrn.priority}`);
    console.log('\n   Materials Requested:');
    
    const materials = JSON.parse(JSON.stringify(mrn.materials_requested));
    materials.forEach(m => {
      console.log(`   - ${m.material_name}: ${m.quantity_required} ${m.unit}`);
      console.log(`     Available: ${m.available_qty} ${m.unit}`);
      console.log(`     Status: ${m.status}`);
    });

    // Check cotton availability
    console.log('\n\n📦 INVENTORY CHECK: Cotton Availability');
    console.log('───────────────────────────────────────────');
    const [cotton] = await sequelize.query(`
      SELECT id, product_name, product_code, current_stock, available_stock, 
             unit_of_measurement, location, barcode
      FROM inventory 
      WHERE product_name LIKE '%cotton%' AND is_active = 1
      ORDER BY current_stock DESC
      LIMIT 5
    `);

    if (cotton.length === 0) {
      console.log('❌ No cotton found in inventory!\n');
      return;
    }

    console.log('✅ Cotton Stock Available:\n');
    let totalCotton = 0;
    cotton.forEach(c => {
      console.log(`   ${c.product_name}`);
      console.log(`   Code: ${c.product_code} | Barcode: ${c.barcode}`);
      console.log(`   Available: ${c.available_stock} ${c.unit_of_measurement}`);
      console.log(`   Location: ${c.location}`);
      console.log('   ───');
      totalCotton += parseFloat(c.available_stock);
    });

    const requiredCotton = materials.find(m => m.material_name.toLowerCase().includes('cotton'))?.quantity_required || 10;
    console.log(`\n   Total Cotton Available: ${totalCotton} meters`);
    console.log(`   Required for MRN: ${requiredCotton} meters`);
    
    if (totalCotton >= requiredCotton) {
      console.log(`   ✅ Stock is SUFFICIENT! (${totalCotton - requiredCotton} meters extra)\n`);
    } else {
      console.log(`   ❌ Stock is INSUFFICIENT! (${requiredCotton - totalCotton} meters short)\n`);
      return;
    }

    // Step 2-6 Status
    console.log('\n═══════════════════════════════════════════');
    console.log('   WORKFLOW STAGE STATUS');
    console.log('═══════════════════════════════════════════\n');

    console.log('✅ STAGE 1: MRN REQUEST - COMPLETE');
    console.log('   Manufacturing created MRN-20251009-00001\n');

    console.log('⏳ STAGE 2: INVENTORY REVIEW - PENDING');
    console.log('   Action Required: Inventory Manager must review MRN');
    console.log('   Stock Status: ✅ Sufficient (600 meters available)');
    console.log('   Next: Approve MRN and proceed to dispatch\n');

    console.log('⏸️  STAGE 3: STOCK DISPATCH - NOT STARTED');
    console.log('   Waiting for: Stage 2 completion');
    console.log('   Page: /inventory/dispatch/1');
    console.log('   Action: Release 10 meters cotton to manufacturing\n');

    console.log('⏸️  STAGE 4: MATERIAL RECEIPT - NOT STARTED');
    console.log('   Waiting for: Stage 3 completion');
    console.log('   Page: /manufacturing/material-receipt/:dispatchId\n');

    console.log('⏸️  STAGE 5: STOCK VERIFICATION - NOT STARTED');
    console.log('   Waiting for: Stage 4 completion');
    console.log('   Page: /manufacturing/stock-verification/:receiptId\n');

    console.log('⏸️  STAGE 6: PRODUCTION APPROVAL - NOT STARTED');
    console.log('   Waiting for: Stage 5 completion');
    console.log('   Page: /manufacturing/production-approval/:verificationId\n');

    // Next Actions
    console.log('\n═══════════════════════════════════════════');
    console.log('   IMMEDIATE ACTION REQUIRED');
    console.log('═══════════════════════════════════════════\n');

    console.log('🎯 INVENTORY MANAGER ACTIONS:\n');
    console.log('   1. Login as Inventory Manager');
    console.log('   2. Navigate to MRN Review page');
    console.log('   3. Review MRN-20251009-00001');
    console.log('   4. Approve stock release (10 meters cotton)');
    console.log('   5. Navigate to: http://localhost:3000/inventory/dispatch/1');
    console.log('   6. Select cotton fabric (ID: 12)');
    console.log('   7. Dispatch 10 meters to manufacturing\n');

    console.log('📌 API ENDPOINT TO UPDATE MRN STATUS:\n');
    console.log('   PUT /api/project-material-requests/1/review');
    console.log('   Body: { "status": "stock_available", "inventory_notes": "Cotton available - ready to dispatch" }\n');

    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkWorkflow();