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

async function checkMRNFlowStatus() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check if MRN flow tables exist
    const tables = [
      'project_material_requests',
      'material_dispatches',
      'material_receipts',
      'material_verifications',
      'production_approvals'
    ];

    console.log('📊 MRN FLOW - DATABASE STATUS\n');
    console.log('================================\n');

    for (const table of tables) {
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = results[0].count;
        console.log(`✅ ${table.padEnd(30)} | ${count} records`);
      } catch (error) {
        console.log(`❌ ${table.padEnd(30)} | TABLE NOT FOUND`);
      }
    }

    console.log('\n================================\n');

    // Check MRN requests
    console.log('📋 PROJECT MATERIAL REQUESTS (MRN):');
    console.log('====================================\n');
    
    const [mrns] = await sequelize.query(`
      SELECT id, request_number, project_name, status, 
             requested_by, requested_date, created_at
      FROM project_material_requests 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    if (mrns.length === 0) {
      console.log('   No MRN requests found.\n');
    } else {
      mrns.forEach(mrn => {
        console.log(`   ID: ${mrn.id} | ${mrn.request_number || 'No Number'}`);
        console.log(`   Project: ${mrn.project_name || 'N/A'}`);
        console.log(`   Status: ${mrn.status}`);
        console.log(`   Requested: ${mrn.requested_date || mrn.created_at}`);
        console.log(`   ---`);
      });
    }

    // Check material dispatches
    try {
      const [dispatches] = await sequelize.query(`
        SELECT id, dispatch_number, mrn_request_id, dispatched_at, dispatched_by
        FROM material_dispatches 
        ORDER BY dispatched_at DESC 
        LIMIT 5
      `);

      console.log('\n📦 MATERIAL DISPATCHES:');
      console.log('========================\n');
      
      if (dispatches.length === 0) {
        console.log('   No dispatches found.\n');
      } else {
        dispatches.forEach(d => {
          console.log(`   ID: ${d.id} | ${d.dispatch_number}`);
          console.log(`   MRN Request ID: ${d.mrn_request_id}`);
          console.log(`   Dispatched: ${d.dispatched_at}`);
          console.log(`   ---`);
        });
      }
    } catch (error) {
      console.log('\n📦 MATERIAL DISPATCHES: Table not available\n');
    }

    // Check material receipts
    try {
      const [receipts] = await sequelize.query(`
        SELECT id, receipt_number, mrn_request_id, dispatch_id, received_at, has_discrepancy
        FROM material_receipts 
        ORDER BY received_at DESC 
        LIMIT 5
      `);

      console.log('\n📥 MATERIAL RECEIPTS:');
      console.log('======================\n');
      
      if (receipts.length === 0) {
        console.log('   No receipts found.\n');
      } else {
        receipts.forEach(r => {
          console.log(`   ID: ${r.id} | ${r.receipt_number}`);
          console.log(`   MRN Request ID: ${r.mrn_request_id} | Dispatch ID: ${r.dispatch_id}`);
          console.log(`   Received: ${r.received_at}`);
          console.log(`   Discrepancy: ${r.has_discrepancy ? '⚠️ YES' : '✅ NO'}`);
          console.log(`   ---`);
        });
      }
    } catch (error) {
      console.log('\n📥 MATERIAL RECEIPTS: Table not available\n');
    }

    // Check material verifications
    try {
      const [verifications] = await sequelize.query(`
        SELECT id, verification_number, mrn_request_id, receipt_id, verification_result, verified_at
        FROM material_verifications 
        ORDER BY verified_at DESC 
        LIMIT 5
      `);

      console.log('\n✅ MATERIAL VERIFICATIONS:');
      console.log('===========================\n');
      
      if (verifications.length === 0) {
        console.log('   No verifications found.\n');
      } else {
        verifications.forEach(v => {
          console.log(`   ID: ${v.id} | ${v.verification_number}`);
          console.log(`   MRN Request ID: ${v.mrn_request_id} | Receipt ID: ${v.receipt_id}`);
          console.log(`   Result: ${v.verification_result.toUpperCase()}`);
          console.log(`   Verified: ${v.verified_at}`);
          console.log(`   ---`);
        });
      }
    } catch (error) {
      console.log('\n✅ MATERIAL VERIFICATIONS: Table not available\n');
    }

    // Check production approvals
    try {
      const [approvals] = await sequelize.query(`
        SELECT id, approval_number, mrn_request_id, verification_id, approval_status, approved_at
        FROM production_approvals 
        ORDER BY approved_at DESC 
        LIMIT 5
      `);

      console.log('\n🏭 PRODUCTION APPROVALS:');
      console.log('=========================\n');
      
      if (approvals.length === 0) {
        console.log('   No production approvals found.\n');
      } else {
        approvals.forEach(a => {
          console.log(`   ID: ${a.id} | ${a.approval_number}`);
          console.log(`   MRN Request ID: ${a.mrn_request_id} | Verification ID: ${a.verification_id}`);
          console.log(`   Status: ${a.approval_status.toUpperCase()}`);
          console.log(`   Approved: ${a.approved_at}`);
          console.log(`   ---`);
        });
      }
    } catch (error) {
      console.log('\n🏭 PRODUCTION APPROVALS: Table not available\n');
    }

    console.log('\n================================');
    console.log('SYSTEM STATUS SUMMARY');
    console.log('================================\n');
    
    // Overall status
    const [mrnCount] = await sequelize.query(`SELECT COUNT(*) as count FROM project_material_requests`);
    console.log(`📋 Total MRN Requests: ${mrnCount[0].count}`);
    
    try {
      const [dispatchCount] = await sequelize.query(`SELECT COUNT(*) as count FROM material_dispatches`);
      console.log(`📦 Total Dispatches: ${dispatchCount[0].count}`);
    } catch (e) {
      console.log(`📦 Total Dispatches: N/A (table missing)`);
    }
    
    try {
      const [receiptCount] = await sequelize.query(`SELECT COUNT(*) as count FROM material_receipts`);
      console.log(`📥 Total Receipts: ${receiptCount[0].count}`);
    } catch (e) {
      console.log(`📥 Total Receipts: N/A (table missing)`);
    }
    
    try {
      const [verificationCount] = await sequelize.query(`SELECT COUNT(*) as count FROM material_verifications`);
      console.log(`✅ Total Verifications: ${verificationCount[0].count}`);
    } catch (e) {
      console.log(`✅ Total Verifications: N/A (table missing)`);
    }
    
    try {
      const [approvalCount] = await sequelize.query(`SELECT COUNT(*) as count FROM production_approvals`);
      console.log(`🏭 Total Production Approvals: ${approvalCount[0].count}`);
    } catch (e) {
      console.log(`🏭 Total Production Approvals: N/A (table missing)`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkMRNFlowStatus();