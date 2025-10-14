const db = require('./server/config/database');

async function checkProductionApproval() {
  try {
    console.log('=== Checking Production Approvals ===\n');

    // Check if there are any production approvals
    const approvals = await db.ProductionApproval.findAll({
      attributes: ['id', 'mrn_request_id', 'verification_id', 'approval_status', 'production_started', 'approved_by'],
      limit: 10
    });

    console.log(`Found ${approvals.length} approval(s):\n`);
    approvals.forEach(approval => {
      console.log(`ID: ${approval.id}`);
      console.log(`  MRN Request ID: ${approval.mrn_request_id}`);
      console.log(`  Verification ID: ${approval.verification_id}`);
      console.log(`  Status: ${approval.approval_status}`);
      console.log(`  Production Started: ${approval.production_started}`);
      console.log(`  Approved By: ${approval.approved_by}`);
      console.log('');
    });

    // Try to fetch with includes like the route does
    console.log('=== Trying to fetch approval ID 1 with includes ===\n');
    
    const approval = await db.ProductionApproval.findByPk(1, {
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest',
          include: [
            {
              model: db.SalesOrder,
              as: 'salesOrder',
              attributes: ['id', 'order_number', 'customer_id', 'delivery_date', 'items', 'special_instructions'],
              include: [
                {
                  model: db.Customer,
                  as: 'customer',
                  attributes: ['id', 'name', 'email', 'phone', 'billing_address', 'shipping_address']
                }
              ]
            },
            {
              model: db.PurchaseOrder,
              as: 'purchaseOrder',
              attributes: ['id', 'po_number', 'vendor_id', 'total_amount', 'items', 'expected_delivery_date', 'project_name'],
              include: [
                {
                  model: db.Vendor,
                  as: 'vendor',
                  attributes: ['id', 'name', 'contact_person', 'email', 'phone']
                }
              ]
            }
          ]
        },
        {
          model: db.MaterialVerification,
          as: 'verification',
          include: [
            {
              model: db.MaterialReceipt,
              as: 'receipt',
              attributes: ['id', 'receipt_number', 'received_materials', 'total_items_received', 'project_name']
            }
          ]
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (approval) {
      console.log('✓ Successfully fetched approval with includes');
      console.log(`Approval ID: ${approval.id}`);
      console.log(`Status: ${approval.approval_status}`);
      console.log(`Has MRN Request: ${approval.mrnRequest ? 'Yes' : 'No'}`);
      console.log(`Has Verification: ${approval.verification ? 'Yes' : 'No'}`);
      console.log(`Has Approver: ${approval.approver ? 'Yes' : 'No'}`);
    } else {
      console.log('✗ No approval found with ID 1');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

checkProductionApproval();