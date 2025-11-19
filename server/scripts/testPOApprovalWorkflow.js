const db = require('../config/database');
const { User, PurchaseOrder, Vendor } = db;

async function testWorkflow() {
  try {
    console.log('=== Testing PO Approval Workflow ===\n');

    // Step 1: Check Finance Users
    console.log('Step 1: Checking Finance Users...');
    const financeUsers = await User.findAll({
      where: { department: 'finance', status: 'active' }
    });
    console.log(`Found ${financeUsers.length} finance users:`, financeUsers.map(u => ({ id: u.id, name: u.name, email: u.email })));

    if (financeUsers.length === 0) {
      console.warn('⚠️  WARNING: No active finance users found in the system!');
      console.log('Create a finance department user first to receive notifications.');
    }

    // Step 2: Check Pending Approval POs
    console.log('\nStep 2: Checking Pending Approval POs...');
    const pendingPOs = await PurchaseOrder.findAll({
      where: { status: 'pending_approval' },
      include: [{ model: Vendor, as: 'vendor' }]
    });
    console.log(`Found ${pendingPOs.length} POs pending approval:`, pendingPOs.map(p => ({ id: p.id, po_number: p.po_number, vendor: p.vendor?.name })));

    if (pendingPOs.length === 0) {
      console.log('ℹ️  No POs available for approval testing.');
      console.log('Create and submit a PO for approval first.');
    } else {
      // Step 3: Test Invoice Generation
      console.log('\nStep 3: Testing Invoice Generation...');
      const POApprovalWorkflowService = require('../utils/poApprovalWorkflowService');
      const testPO = pendingPOs[0];
      
      try {
        const invoice = await POApprovalWorkflowService.generateInvoiceFromPO(testPO.id, 1, 'Test workflow');
        console.log('✓ Invoice generated successfully:', { invoice_number: invoice.invoice_number, id: invoice.id });
      } catch (error) {
        console.error('✗ Invoice generation failed:', error.message);
      }

      // Step 4: Test Finance Notification
      console.log('\nStep 4: Testing Finance Notification...');
      try {
        const notification = await POApprovalWorkflowService.sendInvoiceToFinance(1, testPO.po_number, testPO.vendor?.name);
        if (notification) {
          console.log('✓ Notification sent to finance:', { id: notification.id, recipient: notification.recipient_user_id, title: notification.title });
        } else {
          console.warn('⚠️  Notification was not sent (likely no finance users)');
        }
      } catch (error) {
        console.error('✗ Notification failed:', error.message);
      }

      // Step 5: Test Audit Trail
      console.log('\nStep 5: Testing Audit Trail...');
      try {
        const auditTrail = await POApprovalWorkflowService.createAuditTrail(
          'purchase_order',
          testPO.id,
          'approved',
          'pending_approval',
          'approved',
          1,
          'admin',
          'Test approval workflow',
          { test: true }
        );
        console.log('✓ Audit trail created:', { id: auditTrail.id, action: auditTrail.action });
      } catch (error) {
        console.error('✗ Audit trail failed:', error.message);
      }
    }

    console.log('\n=== Workflow Test Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

testWorkflow();
