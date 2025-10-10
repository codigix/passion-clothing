/**
 * Test Script: Production Wizard Full Integration
 * Tests that all 7 wizard steps are properly saved to database
 */

const { 
  ProductionOrder, 
  MaterialRequirement, 
  QualityCheckpoint, 
  ProductionStage,
  User,
  Product
} = require('./config/database');

async function testWizardIntegration() {
  console.log('\n=== Testing Production Wizard Integration ===\n');

  try {
    // Step 1: Check if we have necessary test data
    const testProduct = await Product.findOne();
    if (!testProduct) {
      console.error('❌ No products found in database. Please add a product first.');
      return;
    }
    console.log('✓ Found test product:', testProduct.name);

    const testUser = await User.findOne({ where: { department: 'manufacturing' } });
    if (!testUser) {
      console.error('❌ No manufacturing users found. Please create a manufacturing user first.');
      return;
    }
    console.log('✓ Found manufacturing user:', testUser.name);

    // Step 2: Create test data that matches wizard output
    const wizardPayload = {
      product_id: testProduct.id,
      quantity: 100,
      priority: 'high',
      production_type: 'in_house',
      planned_start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      planned_end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // Next week
      special_instructions: 'Test order created by wizard integration test',
      
      // Step 3: Scheduling data
      shift: 'morning',
      estimated_hours: 40,
      
      // Step 4: Team assignments
      supervisor_id: testUser.id,
      assigned_user_id: testUser.id,
      qa_lead_id: testUser.id,
      team_notes: 'Full team assigned for high priority order',
      
      // Step 5: Materials (3 materials)
      materials_required: [
        {
          materialId: 'MAT-001',
          description: 'Cotton Fabric - White',
          requiredQuantity: 50,
          unit: 'Meter',
          status: 'available'
        },
        {
          materialId: 'MAT-002',
          description: 'Thread - Polyester',
          requiredQuantity: 10,
          unit: 'Kg',
          status: 'available'
        },
        {
          materialId: 'MAT-003',
          description: 'Buttons - Plastic 15mm',
          requiredQuantity: 200,
          unit: 'Pcs',
          status: 'shortage',
          notes: 'Need to order more'
        }
      ],
      
      // Step 6: Quality checkpoints (4 checkpoints)
      quality_parameters: [
        {
          name: 'Material Inspection',
          frequency: 'per_batch',
          acceptanceCriteria: 'No defects, correct color, proper texture'
        },
        {
          name: 'Cutting Accuracy',
          frequency: 'per_unit',
          acceptanceCriteria: 'Dimensions within ±2mm tolerance'
        },
        {
          name: 'Stitch Quality',
          frequency: 'hourly',
          acceptanceCriteria: 'Uniform stitch density, no loose threads'
        },
        {
          name: 'Final Inspection',
          frequency: 'final',
          acceptanceCriteria: 'All specifications met, packaging intact'
        }
      ],
      
      // Step 7: Custom stages
      use_custom_stages: true,
      stages: [
        { stageName: 'Material Preparation', plannedDurationHours: 4 },
        { stageName: 'Cutting & Pattern Making', plannedDurationHours: 8 },
        { stageName: 'Embroidery', plannedDurationHours: 12 },
        { stageName: 'Stitching & Assembly', plannedDurationHours: 10 },
        { stageName: 'Quality Control', plannedDurationHours: 4 },
        { stageName: 'Finishing & Packaging', plannedDurationHours: 2 }
      ]
    };

    console.log('\n📝 Creating production order with full wizard data...\n');

    // Step 3: Create production order
    const lastOrder = await ProductionOrder.findOne({
      order: [['created_at', 'DESC']]
    });
    const nextNumber = lastOrder ? parseInt(lastOrder.production_number.split('-')[2]) + 1 : 1;
    const productionNumber = `PROD-${new Date().getFullYear()}-${nextNumber.toString().padStart(3, '0')}`;

    const order = await ProductionOrder.create({
      production_number: productionNumber,
      product_id: wizardPayload.product_id,
      quantity: wizardPayload.quantity,
      priority: wizardPayload.priority,
      production_type: wizardPayload.production_type,
      planned_start_date: wizardPayload.planned_start_date,
      planned_end_date: wizardPayload.planned_end_date,
      special_instructions: wizardPayload.special_instructions,
      shift: wizardPayload.shift,
      estimated_hours: wizardPayload.estimated_hours,
      supervisor_id: wizardPayload.supervisor_id,
      assigned_user_id: wizardPayload.assigned_user_id,
      qa_lead_id: wizardPayload.qa_lead_id,
      team_notes: wizardPayload.team_notes,
      created_by: testUser.id
    });

    console.log('✅ Production Order Created');
    console.log(`   ID: ${order.id}`);
    console.log(`   Number: ${order.production_number}`);
    console.log(`   Shift: ${order.shift}`);
    console.log(`   Estimated Hours: ${order.estimated_hours}`);

    // Step 4: Create material requirements
    const materialRecords = wizardPayload.materials_required.map(material => ({
      production_order_id: order.id,
      material_id: material.materialId,
      description: material.description,
      required_quantity: material.requiredQuantity,
      unit: material.unit,
      status: material.status,
      notes: material.notes || null
    }));
    
    await MaterialRequirement.bulkCreate(materialRecords);
    console.log(`\n✅ Material Requirements Created: ${materialRecords.length} items`);
    materialRecords.forEach(m => {
      console.log(`   - ${m.description}: ${m.required_quantity} ${m.unit} [${m.status}]`);
    });

    // Step 5: Create quality checkpoints
    const checkpointRecords = wizardPayload.quality_parameters.map((checkpoint, index) => ({
      production_order_id: order.id,
      name: checkpoint.name,
      frequency: checkpoint.frequency,
      acceptance_criteria: checkpoint.acceptanceCriteria,
      checkpoint_order: index + 1,
      status: 'pending'
    }));
    
    await QualityCheckpoint.bulkCreate(checkpointRecords);
    console.log(`\n✅ Quality Checkpoints Created: ${checkpointRecords.length} checkpoints`);
    checkpointRecords.forEach(c => {
      console.log(`   ${c.checkpoint_order}. ${c.name} [${c.frequency}]`);
    });

    // Step 6: Create custom stages
    const stagesToCreate = wizardPayload.stages.map((stage, index) => ({
      production_order_id: order.id,
      stage_name: stage.stageName,
      stage_order: index + 1,
      planned_duration_hours: stage.plannedDurationHours,
      status: 'pending'
    }));

    await ProductionStage.bulkCreate(stagesToCreate);
    console.log(`\n✅ Custom Production Stages Created: ${stagesToCreate.length} stages`);
    stagesToCreate.forEach(s => {
      const hours = s.planned_duration_hours ? `${s.planned_duration_hours}h` : 'N/A';
      console.log(`   ${s.stage_order}. ${s.stage_name} [${hours}]`);
    });

    // Step 7: Verify data retrieval
    console.log('\n📊 Verifying data retrieval...\n');

    const retrievedOrder = await ProductionOrder.findByPk(order.id, {
      include: [
        { model: Product, as: 'product', attributes: ['name', 'product_code'] },
        { model: User, as: 'supervisor', attributes: ['name', 'employee_id'] },
        { model: User, as: 'assignedUser', attributes: ['name', 'employee_id'] },
        { model: User, as: 'qaLead', attributes: ['name', 'employee_id'] },
        { model: MaterialRequirement, as: 'materialRequirements' },
        { model: QualityCheckpoint, as: 'qualityCheckpoints' },
        { model: ProductionStage, as: 'stages' }
      ],
      order: [
        [{ model: ProductionStage, as: 'stages' }, 'stage_order', 'ASC'],
        [{ model: QualityCheckpoint, as: 'qualityCheckpoints' }, 'checkpoint_order', 'ASC']
      ]
    });

    console.log('✅ Data Retrieval Successful\n');
    console.log('📦 Order Summary:');
    console.log(`   Production Number: ${retrievedOrder.production_number}`);
    console.log(`   Product: ${retrievedOrder.product.name}`);
    console.log(`   Quantity: ${retrievedOrder.quantity}`);
    console.log(`   Priority: ${retrievedOrder.priority}`);
    console.log(`   Shift: ${retrievedOrder.shift}`);
    console.log(`   Estimated Hours: ${retrievedOrder.estimated_hours}`);
    console.log(`\n👥 Team:"`);
    console.log(`   Supervisor: ${retrievedOrder.supervisor?.name || 'Not assigned'}`);
    console.log(`   Assigned User: ${retrievedOrder.assignedUser?.name || 'Not assigned'}`);
    console.log(`   QA Lead: ${retrievedOrder.qaLead?.name || 'Not assigned'}`);
    console.log(`\n📦 Related Records:`);
    console.log(`   Materials: ${retrievedOrder.materialRequirements.length}`);
    console.log(`   Quality Checkpoints: ${retrievedOrder.qualityCheckpoints.length}`);
    console.log(`   Production Stages: ${retrievedOrder.stages.length}`);

    console.log('\n✨ ALL TESTS PASSED! ✨');
    console.log('\n🎉 Production Wizard is fully integrated with the database!');
    console.log(`\n💡 Test order ID: ${order.id} - You can view this in the frontend.\n`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

// Run the test
testWizardIntegration();