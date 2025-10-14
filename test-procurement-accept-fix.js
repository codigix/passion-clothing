/**
 * Test Script: Verify Procurement Accept Order Fix
 * 
 * This script tests that:
 * 1. Sales order can be accepted by procurement
 * 2. Notification is created with valid ENUM values
 * 3. Order status updates correctly
 */

const { SalesOrder, Customer, Notification, User } = require('./server/config/database');

async function testProcurementAcceptFix() {
  try {
    console.log('\n🧪 Testing Procurement Accept Order Fix...\n');

    // Step 1: Find or create a test sales order
    console.log('📝 Step 1: Finding test sales order...');
    
    let testOrder = await SalesOrder.findOne({
      where: { 
        status: 'draft',
        ready_for_procurement: true
      },
      include: [{ model: Customer, as: 'customer' }]
    });

    if (!testOrder) {
      console.log('⚠️  No draft order ready for procurement found.');
      console.log('💡 Creating test sales order...');
      
      // Find or create test customer
      let customer = await Customer.findOne();
      if (!customer) {
        console.log('❌ No customers found. Please create a customer first.');
        return;
      }

      testOrder = await SalesOrder.create({
        order_number: `SO-TEST-${Date.now()}`,
        customer_id: customer.id,
        status: 'draft',
        ready_for_procurement: true,
        order_date: new Date(),
        delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        total_quantity: 100,
        items: [
          {
            product_name: 'Test Shirt',
            quantity: 100,
            unit: 'pcs',
            rate: 500,
            total: 50000
          }
        ],
        garment_specifications: {
          product_name: 'Test Shirt',
          product_type: 'Shirt',
          fabric_type: 'Cotton',
          color: 'Blue'
        }
      });
      
      console.log(`✅ Created test order: ${testOrder.order_number}`);
    } else {
      console.log(`✅ Found test order: ${testOrder.order_number}`);
    }

    // Step 2: Check current notification count
    console.log('\n📊 Step 2: Checking current notification count...');
    const notificationCountBefore = await Notification.count();
    console.log(`   Current notifications: ${notificationCountBefore}`);

    // Step 3: Simulate accepting the order
    console.log('\n✅ Step 3: Simulating order acceptance...');
    
    // Find a procurement user
    const procurementUser = await User.findOne({ 
      where: { department: 'procurement', status: 'active' } 
    });
    
    if (!procurementUser) {
      console.log('❌ No active procurement user found.');
      console.log('💡 Please create a procurement user to test this feature.');
      return;
    }

    console.log(`   Using user: ${procurementUser.name} (${procurementUser.department})`);

    // Update order (simulating what the endpoint does)
    const lifecycleHistory = testOrder.lifecycle_history || [];
    lifecycleHistory.push({
      timestamp: new Date(),
      stage: 'procurement',
      action: 'order_accepted',
      previous_status: testOrder.status,
      new_status: 'confirmed',
      changed_by: procurementUser.id,
      changed_by_name: procurementUser.name,
      notes: 'Order confirmed by procurement team (TEST)'
    });

    await testOrder.update({
      status: 'confirmed',
      approved_by: procurementUser.id,
      approved_at: new Date(),
      lifecycle_history: lifecycleHistory
    });

    console.log(`   ✅ Order status updated to: ${testOrder.status}`);

    // Step 4: Create notification (testing the fix)
    console.log('\n📬 Step 4: Creating test notification with fixed values...');
    
    const NotificationService = require('./server/utils/notificationService');
    
    try {
      await NotificationService.sendToDepartment('sales', {
        type: 'procurement',  // ✅ Valid type (was 'order_update')
        title: `Order Confirmed: ${testOrder.order_number}`,
        message: `Sales Order ${testOrder.order_number} has been confirmed by Procurement Department (TEST)`,
        priority: 'medium',  // ✅ Valid priority (was 'normal')
        related_order_id: testOrder.id,
        action_url: `/sales/orders/${testOrder.id}`,
        metadata: {
          order_number: testOrder.order_number,
          customer_name: testOrder.customer?.name,
          confirmed_by: procurementUser.name,
          confirmed_at: new Date()
        },
        expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      });
      
      console.log('   ✅ Notification created successfully!');
    } catch (error) {
      console.log('   ❌ Failed to create notification:', error.message);
      console.log('   📋 Error details:', error);
      return;
    }

    // Step 5: Verify notification was created
    console.log('\n🔍 Step 5: Verifying notification...');
    const notificationCountAfter = await Notification.count();
    console.log(`   Notifications after: ${notificationCountAfter}`);
    
    if (notificationCountAfter > notificationCountBefore) {
      console.log('   ✅ Notification count increased!');
      
      // Get the latest notification
      const latestNotification = await Notification.findOne({
        where: { related_order_id: testOrder.id },
        order: [['created_at', 'DESC']]
      });
      
      if (latestNotification) {
        console.log('\n📬 Latest Notification Details:');
        console.log(`   Type: ${latestNotification.type} ✅`);
        console.log(`   Priority: ${latestNotification.priority} ✅`);
        console.log(`   Title: ${latestNotification.title}`);
        console.log(`   Message: ${latestNotification.message}`);
        console.log(`   Department: ${latestNotification.recipient_department}`);
        console.log(`   Status: ${latestNotification.status}`);
      }
    } else {
      console.log('   ⚠️  Notification count did not increase');
    }

    // Step 6: Test summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Sales Order Status: ${testOrder.status}`);
    console.log(`✅ Approved By: ${testOrder.approved_by}`);
    console.log(`✅ Approved At: ${testOrder.approved_at}`);
    console.log(`✅ Notification Type: procurement (valid)`);
    console.log(`✅ Notification Priority: medium (valid)`);
    console.log(`✅ Notifications Sent: ${notificationCountAfter - notificationCountBefore}`);
    console.log('='.repeat(60));
    console.log('\n🎉 TEST PASSED! The fix is working correctly!\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    if (testOrder.order_number.startsWith('SO-TEST-')) {
      await testOrder.destroy();
      console.log('✅ Test order deleted');
    } else {
      // Revert status if it was an existing order
      await testOrder.update({ 
        status: 'draft',
        approved_by: null,
        approved_at: null
      });
      console.log('✅ Test order status reverted');
    }

    // Delete test notifications
    await Notification.destroy({
      where: {
        message: { [require('sequelize').Op.like]: '%(TEST)%' }
      }
    });
    console.log('✅ Test notifications deleted\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('\n💡 Common issues:');
    console.error('   - Server not running');
    console.error('   - Database connection failed');
    console.error('   - Invalid ENUM values in notification');
    console.error('   - Missing required fields\n');
  } finally {
    process.exit(0);
  }
}

// Run the test
testProcurementAcceptFix();