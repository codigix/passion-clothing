const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
const { Approval, PurchaseOrder, User, Vendor } = require('./server/config/database');

async function checkGRNRequests() {
  try {
    console.log('🔍 Checking GRN requests in database...\n');

    // Find all GRN creation approvals
    const approvals = await Approval.findAll({
      where: {
        entity_type: 'grn_creation'
      },
      order: [['created_at', 'DESC']]
    });

    console.log(`Found ${approvals.length} GRN creation approvals:\n`);

    for (const approval of approvals) {
      console.log(`📋 Approval ID: ${approval.id}`);
      console.log(`   Entity Type: ${approval.entity_type}`);
      console.log(`   Entity ID (PO): ${approval.entity_id}`);
      console.log(`   Status: ${approval.status}`);
      console.log(`   Stage: ${approval.stage_label}`);
      console.log(`   Assigned to User ID: ${approval.assigned_to_user_id}`);
      console.log(`   Created at: ${approval.created_at}`);
      console.log('');
    }

    // Check pending ones specifically
    const pending = await Approval.findAll({
      where: {
        entity_type: 'grn_creation',
        status: 'pending'
      },
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email', 'department'] }
      ]
    });

    console.log(`\n📌 Pending GRN requests: ${pending.length}\n`);
    
    for (const approval of pending) {
      const po = await PurchaseOrder.findByPk(approval.entity_id, {
        include: [{ model: Vendor, as: 'vendor' }]
      });
      
      console.log(`✅ Pending Request #${approval.id}`);
      console.log(`   PO: ${po?.po_number}`);
      console.log(`   Vendor: ${po?.vendor?.name}`);
      console.log(`   Assigned to: ${approval.assignedUser ? `${approval.assignedUser.name} (${approval.assignedUser.email})` : 'Unassigned'}`);
      console.log('');
    }

    // Check inventory users
    console.log('\n👥 Inventory Department Users:');
    const inventoryUsers = await User.findAll({
      where: { department: 'inventory' },
      attributes: ['id', 'name', 'email', 'status']
    });
    
    if (inventoryUsers.length === 0) {
      console.log('   ⚠️ No inventory users found!');
    } else {
      inventoryUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Status: ${user.status}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkGRNRequests();