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

async function deleteStaleApproval() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // First, show the approval we're about to delete
    console.log('📋 Stale approval to be deleted:');
    console.log('================================');
    const [approvals] = await sequelize.query(
      'SELECT * FROM approvals WHERE id = 2'
    );
    
    if (approvals.length === 0) {
      console.log('⚠️  No approval found with ID 2');
      return;
    }
    
    console.log(JSON.stringify(approvals[0], null, 2));
    console.log('\n');

    // Delete the stale approval
    const [result] = await sequelize.query(
      'DELETE FROM approvals WHERE id = 2'
    );
    
    console.log('✅ Successfully deleted stale approval request!');
    console.log(`   Rows affected: ${result.affectedRows}`);
    
    // Verify deletion
    const [check] = await sequelize.query(
      'SELECT COUNT(*) as count FROM approvals WHERE id = 2'
    );
    
    if (check[0].count === 0) {
      console.log('✅ Verified: Approval no longer exists in database\n');
    }

    // Show remaining approvals
    const [remaining] = await sequelize.query(
      'SELECT id, entity_type, entity_id, status, stage_key, created_at FROM approvals ORDER BY created_at DESC LIMIT 10'
    );
    
    console.log('📋 Remaining approval requests:');
    console.log('================================');
    if (remaining.length === 0) {
      console.log('   No pending approvals ✓');
    } else {
      remaining.forEach(a => {
        console.log(`   ID ${a.id}: ${a.entity_type} (Entity: ${a.entity_id}) - ${a.status} - ${a.stage_key}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

deleteStaleApproval();