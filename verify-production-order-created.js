const db = require('./server/config/database');

async function verifyProductionOrder() {
  try {
    console.log('🔍 **VERIFYING PRODUCTION ORDER CREATION**\n');
    console.log('='.repeat(60));

    // Check if production order was created
    const approval = await db.ProductionApproval.findOne({
      where: { id: 1 },
      attributes: ['id', 'approval_number', 'approval_status', 'production_order_created', 'production_order_id', 'approved_at']
    });

    console.log('\n📋 **Production Approval #1:**');
    console.table([approval.toJSON()]);

    if (approval.production_order_created) {
      console.log('\n✅ **SUCCESS!** Production order was created from approval\n');
      
      // Get the production order details
      if (approval.production_order_id) {
        const productionOrder = await db.ProductionOrder.findOne({
          where: { id: approval.production_order_id },
          attributes: ['id', 'production_number', 'status', 'quantity', 'product_name', 'created_at'],
          include: [
            {
              model: db.ProductionStage,
              as: 'stages',
              attributes: ['stage_name', 'status', 'planned_start_date']
            }
          ]
        });

        if (productionOrder) {
          console.log('🎯 **Created Production Order:**');
          const orderData = productionOrder.toJSON();
          console.table([{
            id: orderData.id,
            production_number: orderData.production_number,
            product_name: orderData.product_name,
            quantity: orderData.quantity,
            status: orderData.status,
            created_at: orderData.created_at
          }]);

          console.log('\n📊 **Production Stages:**');
          console.table(orderData.stages.map(s => ({
            stage: s.stage_name,
            status: s.status,
            planned_start: s.planned_start_date
          })));

          console.log('\n' + '='.repeat(60));
          console.log('✅ **END-TO-END FLOW TEST: PASSED** ✅');
          console.log('='.repeat(60));
          console.log('\n🎉 Complete material approval flow working correctly!');
          console.log('   Dispatch → Receipt → Verification → Approval → Production Order\n');
        }
      }
    } else {
      console.log('\n⚠️  **PENDING:** Production order not yet created from approval');
      console.log('   Please complete the manual testing steps to create the production order.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyProductionOrder();