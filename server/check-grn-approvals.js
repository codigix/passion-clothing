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

async function checkGRNApprovals() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check pending GRN creation requests
    const [approvals] = await sequelize.query(`
      SELECT 
        id,
        entity_type,
        entity_id,
        status,
        assigned_to,
        created_at,
        metadata
      FROM approvals
      WHERE entity_type = 'grn_creation'
      ORDER BY created_at DESC
    `);

    console.log('📋 GRN Creation Approval Requests:');
    console.log('====================================');
    if (approvals.length === 0) {
      console.log('  ❌ No GRN creation approval requests found!');
      console.log('  \n  💡 This means:');
      console.log('     1. No one has requested GRN creation, OR');
      console.log('     2. All requests have been processed');
    } else {
      console.log(`  Found ${approvals.length} approval request(s):\n`);
      approvals.forEach(approval => {
        console.log(`Approval ID: ${approval.id}`);
        console.log(`  Type: ${approval.entity_type}`);
        console.log(`  PO ID: ${approval.entity_id}`);
        console.log(`  Status: ${approval.status}`);
        console.log(`  Assigned To (User ID): ${approval.assigned_to || 'Not assigned'}`);
        console.log(`  Created: ${approval.created_at}`);
        console.log(`  Metadata: ${approval.metadata}`);
        console.log('');
      });
    }

    // Check all approvals table to see what's there
    const [allApprovals] = await sequelize.query(`
      SELECT 
        entity_type,
        status,
        COUNT(*) as count
      FROM approvals
      GROUP BY entity_type, status
    `);

    console.log('\n📊 Summary of All Approvals:');
    console.log('====================================');
    if (allApprovals.length === 0) {
      console.log('  No approvals found in system');
    } else {
      allApprovals.forEach(row => {
        console.log(`  ${row.entity_type}: ${row.status} (${row.count} requests)`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

checkGRNApprovals();