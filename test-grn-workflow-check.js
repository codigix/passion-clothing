const { User, Approval, PurchaseOrder } = require('./server/config/database');

async function checkGRNWorkflow() {
  try {
    console.log('🔍 Checking GRN Workflow Setup...\n');

    // Check for active inventory users
    const inventoryUsers = await User.findAll({
      where: { department: 'inventory', status: 'active' },
      attributes: ['id', 'name', 'email', 'department']
    });

    console.log('✅ Active Inventory Users:', inventoryUsers.length);
    inventoryUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    if (inventoryUsers.length === 0) {
      console.log('\n⚠️  WARNING: No active inventory users found!');
      console.log('   GRN requests cannot be assigned without inventory users.');
    }

    // Check for recent GRN creation requests
    const recentRequests = await Approval.findAll({
      where: { entity_type: 'grn_creation' },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'name'] }
      ]
    });

    console.log('\n📋 Recent GRN Creation Requests:', recentRequests.length);
    for (const req of recentRequests) {
      const po = await PurchaseOrder.findByPk(req.entity_id, {
        attributes: ['po_number', 'status']
      });
      console.log(`   - PO: ${po?.po_number || req.entity_id} | Status: ${req.status} | Assigned to: ${req.assignedUser?.name || 'Unassigned'}`);
    }

    // Check for POs in 'sent' status (ready for material received)
    const sentPOs = await PurchaseOrder.findAll({
      where: { status: 'sent' },
      attributes: ['id', 'po_number', 'status'],
      limit: 5
    });

    console.log('\n📦 POs Ready for "Material Received":', sentPOs.length);
    sentPOs.forEach(po => {
      console.log(`   - PO: ${po.po_number} (ID: ${po.id})`);
    });

    console.log('\n✅ Workflow check completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkGRNWorkflow();