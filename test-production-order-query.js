const {
  ProductionOrder,
  ProductionStage,
  Rejection,
  SalesOrder,
  Product,
  User,
  Challan,
  MaterialRequirement,
  QualityCheckpoint,
  Vendor
} = require('./server/config/database');

const STAGE_INCLUDE = [
  {
    model: User,
    as: 'assignedUser',
    attributes: ['id', 'name', 'employee_id']
  },
  {
    model: Vendor,
    as: 'vendor',
    attributes: ['id', 'name', 'contact_person', 'phone', 'mobile', 'email']
  }
];

async function testQuery() {
  try {
    console.log('🔍 Testing production order query...\n');
    
    const productionOrder = await ProductionOrder.findByPk(3, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'product_code', 'specifications']
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'order_number', 'delivery_date', 'customer_id', 'status']
        },
        {
          model: User,
          as: 'supervisor',
          attributes: ['id', 'name', 'employee_id', 'department']
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'employee_id', 'department']
        },
        {
          model: User,
          as: 'qaLead',
          attributes: ['id', 'name', 'employee_id', 'department']
        },
        {
          model: MaterialRequirement,
          as: 'materialRequirements',
          attributes: [
            'id',
            'material_id',
            'description',
            'required_quantity',
            'allocated_quantity',
            'consumed_quantity',
            'unit',
            'status',
            'notes'
          ]
        },
        {
          model: QualityCheckpoint,
          as: 'qualityCheckpoints',
          attributes: [
            'id',
            'production_stage_id',
            'name',
            'frequency',
            'acceptance_criteria',
            'checkpoint_order',
            'status',
            'result',
            'checked_at',
            'checked_by',
            'notes'
          ],
          include: [
            {
              model: User,
              as: 'checker',
              attributes: ['id', 'name', 'employee_id']
            }
          ]
        },
        {
          model: ProductionStage,
          as: 'stages',
          attributes: [
            'id',
            'stage_name',
            'stage_order',
            'status',
            'planned_start_time',
            'planned_end_time',
            'planned_duration_hours',
            'actual_start_time',
            'actual_end_time',
            'actual_duration_hours',
            'quantity_processed',
            'quantity_approved',
            'quantity_rejected',
            'delay_reason',
            'notes',
            'assigned_to',
            'machine_id',
            'rejection_reasons',
            'is_embroidery',
            'is_printing',
            'customization_type',
            'outsource_type',
            'outsourced',
            'vendor_id',
            'outsource_cost'
          ],
          include: STAGE_INCLUDE
        },
        {
          model: Rejection,
          as: 'rejections',
          attributes: [
            'id',
            'stage_name',
            'rejected_quantity',
            'rejection_reason',
            'detailed_reason',
            'severity',
            'action_taken',
            'responsible_party',
            'responsible_person',
            'reported_by',
            'created_at'
          ]
        },
        {
          model: Challan,
          as: 'challans',
          attributes: ['id', 'challan_number', 'type', 'status', 'created_at']
        }
      ],
      order: [
        [{ model: ProductionStage, as: 'stages' }, 'stage_order', 'ASC'],
        [{ model: QualityCheckpoint, as: 'qualityCheckpoints' }, 'checkpoint_order', 'ASC']
      ]
    });

    if (!productionOrder) {
      console.log('❌ Production order not found');
      process.exit(1);
    }

    console.log('✅ Query successful!');
    console.log('\nProduction Order:', productionOrder.production_number);
    console.log('Status:', productionOrder.status);
    console.log('Product:', productionOrder.product ? productionOrder.product.name : 'null');
    console.log('Sales Order:', productionOrder.salesOrder ? productionOrder.salesOrder.order_number : 'null');
    console.log('Stages:', productionOrder.stages.length);
    console.log('Material Requirements:', productionOrder.materialRequirements.length);
    console.log('Quality Checkpoints:', productionOrder.qualityCheckpoints.length);
    console.log('Rejections:', productionOrder.rejections.length);
    console.log('Challans:', productionOrder.challans.length);

    await ProductionOrder.sequelize.close();
    console.log('\n✅ Test complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testQuery();