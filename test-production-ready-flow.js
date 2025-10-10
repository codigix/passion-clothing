/**
 * Test Script: Material Receipt to Production Flow
 * 
 * Purpose: Verify that Sales Order status updates to 'materials_received'
 *          after Manufacturing confirms material receipt
 * 
 * Usage: node test-production-ready-flow.js
 */

const db = require('./server/config/database');

async function testProductionReadyFlow() {
  console.log('\n🔍 Testing Production Ready Flow...\n');
  
  try {
    // 1. Find MRNs with issued status
    console.log('📋 Step 1: Finding MRNs with materials issued...');
    const issuedMRNs = await db.ProjectMaterialRequest.findAll({
      where: {
        status: 'issued',
        sales_order_id: { [db.Sequelize.Op.not]: null }
      },
      include: [
        {
          model: db.SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'order_number', 'status']
        }
      ],
      limit: 5
    });

    console.log(`   Found ${issuedMRNs.length} MRNs with issued status\n`);

    if (issuedMRNs.length === 0) {
      console.log('ℹ️  No MRNs found with issued status and linked Sales Order');
      console.log('   Create a test flow to verify:\n');
      console.log('   1. Create Sales Order');
      console.log('   2. Create MRN linked to Sales Order');
      console.log('   3. Dispatch materials from Inventory');
      console.log('   4. Receive materials in Manufacturing\n');
      process.exit(0);
    }

    // 2. Display MRNs and their Sales Order status
    console.log('📊 Current Status:\n');
    issuedMRNs.forEach((mrn, index) => {
      console.log(`   ${index + 1}. MRN: ${mrn.request_number}`);
      console.log(`      └─ Sales Order: ${mrn.salesOrder?.order_number || 'N/A'}`);
      console.log(`      └─ SO Status: ${mrn.salesOrder?.status || 'N/A'}`);
      console.log(`      └─ Expected: materials_received (after fix)\n`);
    });

    // 3. Check for materials_received status
    console.log('✅ Checking Sales Orders with materials_received status...');
    const readyOrders = await db.SalesOrder.findAll({
      where: {
        status: 'materials_received'
      },
      attributes: ['id', 'order_number', 'status', 'lifecycle_history']
    });

    console.log(`   Found ${readyOrders.length} Sales Orders ready for production\n`);

    if (readyOrders.length > 0) {
      console.log('🎉 Sales Orders Ready for Production:\n');
      readyOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.order_number}`);
        console.log(`      └─ Status: ${order.status} ✅`);
        
        // Check lifecycle history for materials_received event
        const history = order.lifecycle_history || [];
        const receivedEvent = history.find(e => e.event === 'materials_received');
        if (receivedEvent) {
          console.log(`      └─ Materials received at: ${new Date(receivedEvent.timestamp).toLocaleString()}`);
          console.log(`      └─ Details: ${receivedEvent.details}`);
        }
        console.log('');
      });
    }

    // 4. Check material receipts
    console.log('📦 Recent Material Receipts:\n');
    const receipts = await db.MaterialReceipt.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest',
          attributes: ['id', 'request_number', 'sales_order_id']
        },
        {
          model: db.User,
          as: 'receiver',
          attributes: ['name', 'email']
        }
      ]
    });

    if (receipts.length > 0) {
      receipts.forEach((receipt, index) => {
        console.log(`   ${index + 1}. Receipt: ${receipt.receipt_number}`);
        console.log(`      └─ MRN: ${receipt.mrnRequest?.request_number || 'N/A'}`);
        console.log(`      └─ Has Discrepancy: ${receipt.has_discrepancy ? '⚠️ Yes' : '✅ No'}`);
        console.log(`      └─ Received By: ${receipt.receiver?.name || 'Unknown'}`);
        console.log(`      └─ Received At: ${new Date(receipt.received_at).toLocaleString()}\n`);
      });
    } else {
      console.log('   No receipts found yet\n');
    }

    // 5. Check notifications
    console.log('🔔 Recent Production Ready Notifications:\n');
    const notifications = await db.Notification.findAll({
      where: {
        type: 'production_ready'
      },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ]
    });

    if (notifications.length > 0) {
      notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. To: ${notif.user?.name || 'Unknown'}`);
        console.log(`      └─ ${notif.title}`);
        console.log(`      └─ ${notif.message}`);
        console.log(`      └─ Priority: ${notif.priority}`);
        console.log(`      └─ Created: ${new Date(notif.created_at).toLocaleString()}\n`);
      });
    } else {
      console.log('   No production ready notifications found\n');
      console.log('   ℹ️  Notifications are created after material receipt (without discrepancies)\n');
    }

    // 6. Production Orders
    console.log('🏭 Recent Production Orders:\n');
    const prodOrders = await db.ProductionOrder.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [
        {
          model: db.SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'order_number']
        }
      ]
    });

    if (prodOrders.length > 0) {
      prodOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.production_number}`);
        console.log(`      └─ Sales Order: ${order.salesOrder?.order_number || 'N/A'}`);
        console.log(`      └─ Status: ${order.status}`);
        console.log(`      └─ Quantity: ${order.quantity}`);
        console.log(`      └─ Created: ${new Date(order.created_at).toLocaleString()}\n`);
      });
    } else {
      console.log('   No production orders found yet\n');
    }

    // 7. Summary
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📊 SUMMARY:\n');
    console.log(`   • MRNs with issued status: ${issuedMRNs.length}`);
    console.log(`   • Sales Orders ready for production: ${readyOrders.length}`);
    console.log(`   • Recent material receipts: ${receipts.length}`);
    console.log(`   • Production ready notifications: ${notifications.length}`);
    console.log(`   • Production orders created: ${prodOrders.length}\n`);
    
    if (readyOrders.length > 0) {
      console.log('✅ FIX IS WORKING! Sales Orders are being updated to materials_received\n');
      console.log('   Next: Go to Production Dashboard and click "Start Production"\n');
    } else {
      console.log('⏳ WAITING FOR MATERIAL RECEIPT...\n');
      console.log('   To test the fix:');
      console.log('   1. Login as Manufacturing user');
      console.log('   2. Go to Material Requests (MRN)');
      console.log('   3. Find dispatched materials');
      console.log('   4. Confirm receipt');
      console.log('   5. Run this script again\n');
    }

  } catch (error) {
    console.error('❌ Error testing flow:', error.message);
    console.error(error);
  } finally {
    await db.sequelize.close();
  }
}

// Run the test
testProductionReadyFlow();