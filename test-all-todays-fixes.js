const { 
  ProductionOrder, 
  ProductionStage, 
  StageOperation,
  Challan,
  Vendor,
  User
} = require('./server/config/database');

async function testAllFixes() {
  console.log('🧪 Testing all today\'s fixes...\n');
  
  // Test 1: Production order detail fetch
  console.log('1️⃣ Testing production order detail fetch...');
  try {
    const order = await ProductionOrder.findByPk(3, {
      include: [
        {
          model: ProductionStage,
          as: 'stages',
          include: [
            {
              model: Vendor,
              as: 'vendor',
              attributes: ['id', 'name', 'contact_person', 'phone', 'mobile', 'email']
            }
          ]
        }
      ]
    });
    
    if (order) {
      console.log('   ✅ Production order loads successfully');
      console.log(`   📦 Order: ${order.production_number}, Stages: ${order.stages?.length || 0}`);
    } else {
      console.log('   ⚠️  Order #3 not found (may not exist yet)');
    }
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
  }
  
  // Test 2: Stage challans endpoint (simulated query)
  console.log('\n2️⃣ Testing stage challans query...');
  try {
    const stage = await ProductionStage.findOne();
    if (stage) {
      const stageOps = await StageOperation.findAll({
        where: { production_stage_id: stage.id },
        attributes: ['id', 'challan_id', 'return_challan_id']
      });
      
      console.log(`   ✅ Stage operations query works`);
      console.log(`   📋 Found ${stageOps.length} operations for stage ${stage.id}`);
      
      if (stageOps.length > 0) {
        const challanIds = [];
        stageOps.forEach(op => {
          if (op.challan_id) challanIds.push(op.challan_id);
          if (op.return_challan_id) challanIds.push(op.return_challan_id);
        });
        
        if (challanIds.length > 0) {
          const challans = await Challan.findAll({
            where: { id: challanIds },
            include: [
              { model: User, as: 'creator' },
              { model: Vendor, as: 'vendor', 
                attributes: ['id', 'name', 'contact_person', 'phone', 'mobile', 'email'] 
              }
            ]
          });
          console.log(`   ✅ Challans fetch works: ${challans.length} challans`);
        } else {
          console.log(`   ℹ️  No challans linked to operations yet`);
        }
      }
    } else {
      console.log('   ⚠️  No production stages found');
    }
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
  }
  
  // Test 3: Vendor table schema
  console.log('\n3️⃣ Testing vendor table schema...');
  try {
    const schema = await Vendor.describe();
    const hasPhone = 'phone' in schema;
    const hasMobile = 'mobile' in schema;
    const hasContactNumber = 'contact_number' in schema;
    
    console.log(`   phone: ${hasPhone ? '✅' : '❌'}`);
    console.log(`   mobile: ${hasMobile ? '✅' : '❌'}`);
    console.log(`   contact_number: ${hasContactNumber ? '✅ (unexpected!)' : '❌ (correct)'}`);
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
  }
  
  console.log('\n✅ All tests completed!');
  process.exit(0);
}

testAllFixes().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});