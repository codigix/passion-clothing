
const express = require('express');

const { Op, fn, col } = require('sequelize');
const {
  ProductionOrder,
  ProductionStage,
  Rejection,
  SalesOrder,
  Product,
  User,
  Challan,
  MaterialAllocation,
  Inventory,
  InventoryMovement,
  MaterialRequirement,
  QualityCheckpoint,
  StageOperation,
  MaterialConsumption,
  ProductionCompletion,
  Shipment,
  Vendor,
  Customer,
  PurchaseOrder
} = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const { updateOrderQRCode } = require('../utils/qrCodeUtils');
const NotificationService = require('../utils/notificationService');
const { createOperationsForStage } = require('../utils/stageTemplates');

console.log('Manufacturing routes module loaded.');

const router = express.Router();

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

// Get production order detail
router.get(
  '/orders/:id',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      console.log(`[DEBUG] Fetching production order ID: ${req.params.id}`);
      const productionOrder = await ProductionOrder.findByPk(req.params.id, {
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
        console.log(`[DEBUG] Production order ${req.params.id} not found`);
        return res.status(404).json({ message: 'Production order not found' });
      }

      console.log(`[DEBUG] Production order ${req.params.id} loaded successfully`);
      const completedStages = productionOrder.stages.filter(
        (stage) => stage.status === 'completed'
      ).length;
      const progressPercentage = productionOrder.stages.length
        ? Math.round((completedStages / productionOrder.stages.length) * 100)
        : 0;

      res.json({
        productionOrder: {
          id: productionOrder.id,
          production_number: productionOrder.production_number,
          status: productionOrder.status,
          priority: productionOrder.priority,
          production_type: productionOrder.production_type,
          quantity: productionOrder.quantity,
          produced_quantity: productionOrder.produced_quantity,
          approved_quantity: productionOrder.approved_quantity,
          rejected_quantity: productionOrder.rejected_quantity,
          planned_start_date: productionOrder.planned_start_date,
          planned_end_date: productionOrder.planned_end_date,
          actual_start_date: productionOrder.actual_start_date,
          actual_end_date: productionOrder.actual_end_date,
          estimated_hours: productionOrder.estimated_hours,
          actual_hours: productionOrder.actual_hours,
          special_instructions: productionOrder.special_instructions,
          shift: productionOrder.shift,
          team_notes: productionOrder.team_notes,
          progress_percentage: progressPercentage,
          product: productionOrder.product,
          salesOrder: productionOrder.salesOrder,
          supervisor: productionOrder.supervisor,
          assignedUser: productionOrder.assignedUser,
          qaLead: productionOrder.qaLead,
          materialRequirements: productionOrder.materialRequirements,
          qualityCheckpoints: productionOrder.qualityCheckpoints,
          stages: productionOrder.stages,
          rejections: productionOrder.rejections,
          challans: productionOrder.challans
        }
      });
    } catch (error) {
      console.error(`[ERROR] Production order ${req.params.id} fetch failed:`, error);
      console.error('[ERROR] Stack trace:', error.stack);
      console.error('[ERROR] Error name:', error.name);
      console.error('[ERROR] Error message:', error.message);
      res.status(500).json({ 
        message: 'Failed to fetch production order detail',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Helper function to generate production number
const generateProductionNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastOrder = await ProductionOrder.findOne({
    where: {
      production_number: {
        [Op.like]: `PRD-${dateStr}-%`
      }
    },
    order: [['production_number', 'DESC']]
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.production_number.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `PRD-${dateStr}-${sequence.toString().padStart(4, '0')}`;
};

// POST /api/manufacturing/orders - Create new production order
router.post('/orders', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  const transaction = await ProductionOrder.sequelize.transaction();
  
  try {
    const {
      product_id,
      sales_order_id,
      production_approval_id,
      production_type,
      quantity,
      priority,
      planned_start_date,
      planned_end_date,
      estimated_hours,
      special_instructions,
      shift,
      team_notes,
      materials_required,
      quality_parameters,
      supervisor_id,
      assigned_user_id,
      qa_lead_id,
      stages
    } = req.body;

    // Validate required fields
    if (!product_id || !quantity || !planned_start_date || !planned_end_date) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Missing required fields: product_id, quantity, planned_start_date, planned_end_date' 
      });
    }

    // Validate and sanitize user IDs (must be integers or null)
    const sanitizeUserId = (value) => {
      if (!value || value === '' || value === 'null' || value === 'undefined') return null;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
    };

    const validatedSupervisorId = sanitizeUserId(supervisor_id);
    const validatedAssignedUserId = sanitizeUserId(assigned_user_id);
    const validatedQaLeadId = sanitizeUserId(qa_lead_id);

    // Fetch sales order to get project reference
    let projectReference = null;
    let salesOrder = null;
    if (sales_order_id) {
      salesOrder = await SalesOrder.findByPk(sales_order_id);
      if (salesOrder) {
        // Use sales order number as project reference
        projectReference = salesOrder.order_number;
      }
    }

    // Generate production number
    const production_number = await generateProductionNumber();

    // Create production order with project reference
    const productionOrder = await ProductionOrder.create({
      production_number,
      sales_order_id: sales_order_id || null,
      production_approval_id: production_approval_id || null,
      project_reference: projectReference,
      product_id,
      quantity,
      production_type: production_type || 'in_house',
      priority: priority || 'medium',
      status: 'pending',
      planned_start_date,
      planned_end_date,
      estimated_hours: estimated_hours || null,
      special_instructions: special_instructions || null,
      shift: shift || null,
      team_notes: team_notes || null,
      created_by: req.user.id,
      assigned_to: validatedAssignedUserId,
      supervisor_id: validatedSupervisorId,
      qa_lead_id: validatedQaLeadId,
      specifications: {
        created_from: production_approval_id ? 'approval' : 'direct'
      }
    }, { transaction });

    console.log(`✅ Production order created: ${production_number} (ID: ${productionOrder.id})`);

    // Create production stages if provided
    let createdStages = [];
    if (stages && Array.isArray(stages) && stages.length > 0) {
      for (const stageData of stages) {
        const stage = await ProductionStage.create({
          production_order_id: productionOrder.id,
          stage_name: stageData.stage_name,
          stage_order: stageData.stage_order,
          status: 'pending',
          planned_duration_hours: stageData.planned_duration_hours || null,
          is_printing: stageData.is_printing || false,
          is_embroidery: stageData.is_embroidery || false,
          customization_type: stageData.customization_type || 'none',
          outsourced: stageData.outsourced || false,
          vendor_id: stageData.vendor_id || null,
          outsource_type: stageData.outsource_type || null
        }, { transaction });
        
        createdStages.push(stage);
      }
      console.log(`✅ Created ${createdStages.length} production stages`);
    }

    // Create material requirements if provided
    let createdMaterialReqs = [];
    if (materials_required && Array.isArray(materials_required) && materials_required.length > 0) {
      for (const material of materials_required) {
        const materialReq = await MaterialRequirement.create({
          production_order_id: productionOrder.id,
          material_id: material.material_id || null,
          description: material.description,
          required_quantity: material.required_quantity,
          unit: material.unit || 'pieces',
          status: material.status || 'pending'
        }, { transaction });
        
        createdMaterialReqs.push(materialReq);
      }
      console.log(`✅ Created ${createdMaterialReqs.length} material requirements`);
    }

    // Create quality checkpoints if provided
    let createdCheckpoints = [];
    if (quality_parameters?.checkpoints && Array.isArray(quality_parameters.checkpoints)) {
      for (let i = 0; i < quality_parameters.checkpoints.length; i++) {
        const checkpoint = quality_parameters.checkpoints[i];
        const qc = await QualityCheckpoint.create({
          production_order_id: productionOrder.id,
          production_stage_id: null, // Order-level checkpoints
          name: checkpoint.name,
          frequency: checkpoint.frequency || 'per_batch',
          acceptance_criteria: checkpoint.acceptance_criteria,
          checkpoint_order: i + 1,
          status: 'pending'
        }, { transaction });
        
        createdCheckpoints.push(qc);
      }
      console.log(`✅ Created ${createdCheckpoints.length} quality checkpoints`);
    }

    // Auto-start production when validations pass
    const firstStage = (createdStages.length ? createdStages : await ProductionStage.findAll({
      where: { production_order_id: productionOrder.id },
      order: [['stage_order', 'ASC']],
      transaction
    }))[0]?.get ? (createdStages.length ? createdStages[0] : (await ProductionStage.findAll({
      where: { production_order_id: productionOrder.id },
      order: [['stage_order', 'ASC']],
      transaction
    }))[0]) : (createdStages.length ? createdStages[0] : (await ProductionStage.findAll({
      where: { production_order_id: productionOrder.id },
      order: [['stage_order', 'ASC']],
      transaction
    }))[0]);

    if (!firstStage) {
      throw new Error('Production order created without any stages. At least one stage is required to start production.');
    }

    // Start the first stage
    await firstStage.update({
      status: 'in_progress',
      actual_start_time: new Date()
    }, { transaction });

    // Update production order status
    await productionOrder.update({
      status: firstStage.stage_name || 'in_production',
      actual_start_date: new Date()
    }, { transaction });

    // Update sales order status if linked
    if (sales_order_id && salesOrder) {
      await salesOrder.update({
        status: 'in_production',
        production_started_at: new Date()
      }, { transaction });
      
      console.log(`✅ Updated sales order ${salesOrder.order_number} to in_production`);
    }

    // Update QR code if linked to sales order
    if (sales_order_id) {
      await updateOrderQRCode(sales_order_id, firstStage.stage_name || 'in_production');
    }

    // Send notifications for creation and start events
    await NotificationService.notifyManufacturingUpdate(productionOrder, firstStage.stage_name || 'production', 'created', req.user.id);
    await NotificationService.notifyManufacturingUpdate(productionOrder, firstStage.stage_name || 'production', 'started', req.user.id);

    await transaction.commit();

    // Fetch complete order with relations
    const completeOrder = await ProductionOrder.findByPk(productionOrder.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'product_code', 'specifications']
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'order_number', 'customer_id', 'delivery_date']
        },
        {
          model: ProductionStage,
          as: 'stages',
          attributes: ['id', 'stage_name', 'stage_order', 'status', 'planned_duration_hours', 
                      'is_printing', 'is_embroidery', 'customization_type', 'outsourced', 'vendor_id'],
          include: STAGE_INCLUDE
        },
        {
          model: MaterialRequirement,
          as: 'materialRequirements',
          attributes: ['id', 'material_id', 'description', 'required_quantity', 'unit', 'status']
        },
        {
          model: QualityCheckpoint,
          as: 'qualityCheckpoints',
          attributes: ['id', 'name', 'frequency', 'acceptance_criteria', 'checkpoint_order', 'status']
        }
      ]
    });

    res.status(201).json({
      message: 'Production order created and started successfully',
      productionOrder: completeOrder,
      // Legacy support for frontend
      id: completeOrder.id,
      production_number: completeOrder.production_number,
      stages: completeOrder.stages
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error creating production order:', error);
    res.status(500).json({ 
      message: 'Failed to create production order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Stage endpoints
router.get('/stages/:id', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const stage = await ProductionStage.findByPk(req.params.id, {
      include: [
        {
          model: ProductionOrder,
          as: 'productionOrder',
          include: [
            {
              model: SalesOrder,
              as: 'salesOrder',
              attributes: ['id', 'order_number', 'status']
            }
          ]
        },
        ...STAGE_INCLUDE
      ]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    res.json({ stage });
  } catch (error) {
    console.error('Stage detail fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch stage detail' });
  }
});

router.get('/stages/:id/challans', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const stage = await ProductionStage.findByPk(req.params.id);
    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    // Find all stage operations for this stage
    const stageOperations = await StageOperation.findAll({
      where: { production_stage_id: req.params.id },
      attributes: ['id', 'challan_id', 'return_challan_id']
    });

    // Collect all challan IDs (both outward and return)
    const challanIds = new Set();
    stageOperations.forEach(op => {
      if (op.challan_id) challanIds.add(op.challan_id);
      if (op.return_challan_id) challanIds.add(op.return_challan_id);
    });

    // If no challans found, return empty array
    if (challanIds.size === 0) {
      return res.json({ challans: [] });
    }

    // Fetch all challans
    const challans = await Challan.findAll({
      where: {
        id: { [Op.in]: Array.from(challanIds) }
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'employee_id'],
          required: false
        },
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'name', 'contact_person', 'phone', 'mobile', 'email'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ challans });
  } catch (error) {
    console.error('[ERROR] Stage challans fetch error:', error);
    console.error('[ERROR] Stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch stage challans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create Outward Challan for Outsourcing
router.post('/stages/:id/outsource/outward', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { vendor_id, items, expected_return_date, notes, transport_details } = req.body;
    
    const stage = await ProductionStage.findByPk(req.params.id, {
      include: [{ model: ProductionOrder, as: 'productionOrder' }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    // Create outward challan
    const challan = await Challan.create({
      challan_number: `CHN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      type: 'outward',
      sub_type: 'outsourcing',
      department: 'manufacturing',
      vendor_id,
      items: JSON.stringify(items),
      expected_return_date,
      notes,
      transport_details: JSON.stringify(transport_details || {}),
      status: 'pending',
      created_by: req.user.id
    });

    // Create stage operation linking the challan
    await StageOperation.create({
      production_stage_id: stage.id,
      operation_name: `Outsourced to ${vendor_id}`,
      operation_type: 'outsourcing',
      status: 'in_progress',
      challan_id: challan.id,
      started_at: new Date()
    });

    // Update stage to mark as outsourced
    await stage.update({
      outsourced: true,
      vendor_id,
      status: 'in_progress'
    });

    res.json({ 
      message: 'Outward challan created successfully', 
      challan 
    });
  } catch (error) {
    console.error('[ERROR] Outward challan creation error:', error);
    console.error('[ERROR] Stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to create outward challan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create Inward Challan for Outsourcing
router.post('/stages/:id/outsource/inward', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { outward_challan_id, items, received_quantity, quality_notes, discrepancies } = req.body;
    
    const stage = await ProductionStage.findByPk(req.params.id);

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    // Get the outward challan
    const outwardChallan = await Challan.findByPk(outward_challan_id);
    if (!outwardChallan) {
      return res.status(404).json({ message: 'Outward challan not found' });
    }

    // Create inward/return challan
    const inwardChallan = await Challan.create({
      challan_number: `CHN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      type: 'inward',
      sub_type: 'outsourcing',
      department: 'manufacturing',
      vendor_id: outwardChallan.vendor_id,
      items: JSON.stringify(items),
      received_quantity,
      quality_notes,
      discrepancies,
      status: 'completed',
      created_by: req.user.id
    });

    // Update the outward challan status
    await outwardChallan.update({ status: 'completed' });

    // Update stage operation with return challan
    const stageOp = await StageOperation.findOne({
      where: {
        production_stage_id: stage.id,
        challan_id: outward_challan_id
      }
    });

    if (stageOp) {
      await stageOp.update({
        return_challan_id: inwardChallan.id,
        status: 'completed',
        completed_at: new Date()
      });
    }

    res.json({ 
      message: 'Inward challan created successfully', 
      challan: inwardChallan,
      stage_updated: true
    });
  } catch (error) {
    console.error('[ERROR] Inward challan creation error:', error);
    console.error('[ERROR] Stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to create inward challan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const deriveOrderStatusFromStage = (stageName, fallback) => {
  if (!stageName) return fallback || 'in_production';
  const normalized = stageName.toLowerCase();
  const stageDrivenStatuses = new Set([
    'cutting',
    'embroidery',
    'stitching',
    'finishing',
    'quality_check',
    'printing',
    'washing'
  ]);
  return stageDrivenStatuses.has(normalized) ? normalized : (fallback || 'in_production');
};

// Update stage details (general update endpoint)
router.put('/stages/:id', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { status, actual_start_time, actual_end_time, notes } = req.body;
    
    const stage = await ProductionStage.findByPk(req.params.id, {
      include: [{ model: ProductionOrder, as: 'productionOrder' }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (actual_start_time !== undefined) updateData.actual_start_time = actual_start_time;
    if (actual_end_time !== undefined) updateData.actual_end_time = actual_end_time;
    if (notes !== undefined) updateData.notes = notes;

    // Update the stage
    await stage.update(updateData);

    // Update QR code if we have a sales order and status changed
    if (stage.productionOrder && stage.productionOrder.sales_order_id && status) {
      const derivedStatus = deriveOrderStatusFromStage(stage.stage_name, status);
      await updateOrderQRCode(stage.productionOrder.sales_order_id, derivedStatus);
    }

    res.json({ 
      message: 'Stage updated successfully', 
      stage 
    });
  } catch (error) {
    console.error('[ERROR] Stage update error:', error);
    console.error('[ERROR] Stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to update stage',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/stages/:id/start', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { notes } = req.body;
    const stage = await ProductionStage.findByPk(req.params.id, {
      include: [{ model: ProductionOrder, as: 'productionOrder' }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    if (!['pending', 'on_hold'].includes(stage.status)) {
      return res.status(400).json({ message: `Cannot start stage from status '${stage.status}'` });
    }

    const prevIncomplete = await ProductionStage.count({
      where: {
        production_order_id: stage.production_order_id,
        stage_order: { [Op.lt]: stage.stage_order },
        status: { [Op.notIn]: ['completed', 'skipped'] }
      }
    });

    if (prevIncomplete > 0) {
      return res.status(400).json({ message: 'Previous stages must be completed or skipped before starting this stage' });
    }

    await stage.update({
      status: 'in_progress',
      actual_start_time: stage.actual_start_time || new Date(),
      notes: notes || stage.notes
    });

    const order = stage.productionOrder;
    if (order) {
      const derivedStatus = deriveOrderStatusFromStage(stage.stage_name, order.status);
      await order.update({
        actual_start_date: order.actual_start_date || new Date(),
        status: derivedStatus
      });

      if (order.sales_order_id) {
        await updateOrderQRCode(order.sales_order_id, derivedStatus);

        await NotificationService.notifyManufacturingUpdate(order, stage.stage_name, 'started', req.user.id);
      }
    }

    res.json({ message: 'Stage started', stage });
  } catch (error) {
    console.error('[ERROR] Stage start error:', error);
    console.error('[ERROR] Stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to start stage',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
router.post('/stages/:id/pause', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { delay_reason, notes } = req.body;
    const stage = await ProductionStage.findByPk(req.params.id, {
      include: [{ model: ProductionOrder, as: 'productionOrder' }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    if (stage.status !== 'in_progress') {
      return res.status(400).json({ message: `Cannot pause stage from status '${stage.status}'` });
    }

    await stage.update({
      status: 'on_hold',
      delay_reason: delay_reason || stage.delay_reason,
      notes: notes || stage.notes
    });

    const order = stage.productionOrder;
    if (order?.sales_order_id) {
      await updateOrderQRCode(order.sales_order_id, 'production_paused');

      await NotificationService.notifyManufacturingUpdate(order, stage.stage_name, 'paused', req.user.id);
    }

    res.json({ message: 'Stage paused', stage });
  } catch (error) {
    console.error('Stage pause error:', error);
    res.status(500).json({ message: 'Failed to pause stage' });
  }
});

// Stop production order
router.post('/stages/:id/resume', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { notes } = req.body;
    const stage = await ProductionStage.findByPk(req.params.id, {
      include: [{ model: ProductionOrder, as: 'productionOrder' }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    if (stage.status !== 'on_hold') {
      return res.status(400).json({ message: `Cannot resume stage from status '${stage.status}'` });
    }

    await stage.update({
      status: 'in_progress',
      notes: notes || stage.notes
    });

    const order = stage.productionOrder;
    if (order) {
      const derivedStatus = deriveOrderStatusFromStage(stage.stage_name, order.status);
      await order.update({ status: derivedStatus });

      if (order.sales_order_id) {
        await updateOrderQRCode(order.sales_order_id, derivedStatus);

        await NotificationService.notifyManufacturingUpdate(order, stage.stage_name, 'resumed', req.user.id);
      }
    }

    res.json({ message: 'Stage resumed', stage });
  } catch (error) {
    console.error('Stage resume error:', error);
    res.status(500).json({ message: 'Failed to resume stage' });
  }
});

router.post('/stages/:id/complete', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const {
      quantity_processed = 0,
      quantity_approved = 0,
      quantity_rejected = 0,
      notes
    } = req.body;

    const stage = await ProductionStage.findByPk(req.params.id, {
      include: [{ model: ProductionOrder, as: 'productionOrder' }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    if (stage.status !== 'in_progress') {
      return res.status(400).json({ message: `Cannot complete stage from status '${stage.status}'` });
    }

    const processed = Number(quantity_processed) || 0;
    const approved = Number(quantity_approved) || 0;
    const rejected = Number(quantity_rejected) || 0;

    if (processed < 0 || approved < 0 || rejected < 0) {
      return res.status(400).json({ message: 'Quantities cannot be negative' });
    }

    if (approved + rejected > processed) {
      return res.status(400).json({ message: 'Approved + Rejected cannot exceed Processed quantity' });
    }

    const now = new Date();
    const start = stage.actual_start_time ? new Date(stage.actual_start_time) : now;
    const durationHours = (now - start) / (1000 * 60 * 60);

    await stage.update({
      status: 'completed',
      actual_end_time: now,
      actual_duration_hours: durationHours,
      quantity_processed: processed,
      quantity_approved: approved,
      quantity_rejected: rejected,
      notes: notes || stage.notes
    });

    const order = stage.productionOrder;
    if (order) {
      const allStages = await ProductionStage.findAll({
        where: { production_order_id: order.id }
      });
      const completedCount = allStages.filter((s) => s.status === 'completed').length;
      const progress = Math.round((completedCount / Math.max(1, allStages.length)) * 100);
      const aggregateApproved = allStages.reduce((sum, s) => sum + (s.quantity_approved || 0), 0);
      const aggregateRejected = allStages.reduce((sum, s) => sum + (s.quantity_rejected || 0), 0);

      await order.update({
        progress_percentage: progress,
        approved_quantity: aggregateApproved,
        rejected_quantity: aggregateRejected,
        produced_quantity: aggregateApproved + aggregateRejected,
        status: progress === 100 ? 'completed' : order.status,
        actual_end_date: progress === 100 ? now : order.actual_end_date
      });

      if (order.sales_order_id) {
        await updateOrderQRCode(order.sales_order_id, order.status);

        await NotificationService.notifyManufacturingUpdate(order, stage.stage_name, 'completed', req.user.id);
      }
    }

    res.json({ message: 'Stage completed', stage });
  } catch (error) {
    console.error('Stage complete error:', error);
    res.status(500).json({ message: 'Failed to complete stage' });
  }
});

router.post('/stages/:id/hold', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { delay_reason, notes } = req.body;
    const stage = await ProductionStage.findByPk(req.params.id, {
      include: [{ model: ProductionOrder, as: 'productionOrder' }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    if (!['pending', 'in_progress'].includes(stage.status)) {
      return res.status(400).json({ message: `Cannot put on hold from status '${stage.status}'` });
    }

    await stage.update({
      status: 'on_hold',
      delay_reason: delay_reason || stage.delay_reason,
      notes: notes || stage.notes
    });

    const order = stage.productionOrder;
    if (order?.sales_order_id) {
      await updateOrderQRCode(order.sales_order_id, 'production_paused');

      await NotificationService.notifyManufacturingUpdate(order, stage.stage_name, 'paused', req.user.id);
    }

    res.json({ message: 'Stage put on hold', stage });
  } catch (error) {
    console.error('Stage hold error:', error);
    res.status(500).json({ message: 'Failed to hold stage' });
  }
});

router.post('/stages/:id/skip', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { notes } = req.body;
    const stage = await ProductionStage.findByPk(req.params.id, {
      include: [{ model: ProductionOrder, as: 'productionOrder' }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    if (!['pending', 'on_hold'].includes(stage.status)) {
      return res.status(400).json({ message: `Cannot skip stage from status '${stage.status}'` });
    }

    await stage.update({
      status: 'skipped',
      actual_start_time: stage.actual_start_time || new Date(),
      actual_end_time: new Date(),
      notes: notes || stage.notes
    });

    const order = stage.productionOrder;
    if (order?.sales_order_id) {
      await updateOrderQRCode(order.sales_order_id, order.status);

      await NotificationService.notifyManufacturingUpdate(order, stage.stage_name, 'skipped', req.user.id);
    }

    res.json({ message: 'Stage skipped', stage });
  } catch (error) {
    console.error('Stage skip error:', error);
    res.status(500).json({ message: 'Failed to skip stage' });
  }
});

router.post('/stages/:id/rejections', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const stage = await ProductionStage.findByPk(req.params.id, {
      include: [{ model: ProductionOrder, as: 'productionOrder' }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    if (stage.status !== 'completed') {
      return res.status(400).json({ message: 'Rejections can only be logged after stage completion' });
    }

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    for (const item of items) {
      if (!item || typeof item.reason !== 'string') {
        return res.status(400).json({ message: 'Each item must include a reason (string)' });
      }
      const quantity = Number(item.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Each item must have a positive quantity' });
      }
    }

    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    if (totalQuantity > (stage.quantity_rejected || 0)) {
      return res.status(400).json({ message: 'Sum of item quantities cannot exceed stage rejected quantity' });
    }

    const records = items.map((item) => ({
      production_order_id: stage.production_order_id,
      stage_name: stage.stage_name,
      rejected_quantity: Number(item.quantity),
      rejection_reason: item.reason,
      detailed_reason: item.notes || null,
      severity: 'minor',
      action_taken: 'pending',
      responsible_party: 'internal',
      responsible_person: null,
      vendor_id: stage.vendor_id || null,
      reported_by: req.user.id
    }));

    const createdRejections = await Rejection.bulkCreate(records);

    const previous = Array.isArray(stage.rejection_reasons) ? stage.rejection_reasons : [];
    const summaryItems = items.map((item) => ({
      reason: item.reason,
      quantity: Number(item.quantity),
      notes: item.notes || null
    }));
    await stage.update({ rejection_reasons: [...previous, ...summaryItems] });

    const order = stage.productionOrder;
    if (order?.sales_order_id) {
      await NotificationService.notifyManufacturingUpdate(order, stage.stage_name, 'rejected', req.user.id);
    }

    res.status(201).json({
      message: 'Rejections logged',
      count: createdRejections.length,
      items: createdRejections.map((record) => ({
        id: record.id,
        reason: record.rejection_reason,
        quantity: record.rejected_quantity
      }))
    });
  } catch (error) {
    console.error('Stage rejections error:', error);
    res.status(500).json({ message: 'Failed to log rejections' });
  }
});

router.post('/stages/:id/hold', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { delay_reason, notes } = req.body;
    const stage = await ProductionStage.findByPk(req.params.id, {
      include: [{ model: ProductionOrder, as: 'productionOrder' }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    if (!['pending', 'in_progress'].includes(stage.status)) {
      return res.status(400).json({ message: `Cannot put on hold from status '${stage.status}'` });
    }

    await stage.update({
      status: 'on_hold',
      delay_reason: delay_reason || stage.delay_reason,
      notes: notes || stage.notes
    });

    const order = stage.productionOrder;
    if (order?.sales_order_id) {
      await updateOrderQRCode(order.sales_order_id, 'production_paused');

      await NotificationService.notifyManufacturingUpdate(order, stage.stage_name, 'paused', req.user.id);
    }

    res.json({ message: 'Stage put on hold', stage });
  } catch (error) {
    console.error('Stage hold error:', error);
    res.status(500).json({ message: 'Failed to hold stage' });
  }
});

router.post('/stages/:id/skip', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { notes } = req.body;
    const stage = await ProductionStage.findByPk(req.params.id, {
      include: [{ model: ProductionOrder, as: 'productionOrder' }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    if (!['pending', 'on_hold'].includes(stage.status)) {
      return res.status(400).json({ message: `Cannot skip stage from status '${stage.status}'` });
    }

    await stage.update({
      status: 'skipped',
      actual_start_time: stage.actual_start_time || new Date(),
      actual_end_time: new Date(),
      notes: notes || stage.notes
    });

    const order = stage.productionOrder;
    if (order?.sales_order_id) {
      await updateOrderQRCode(order.sales_order_id, order.status);

      await NotificationService.notifyManufacturingUpdate(order, stage.stage_name, 'skipped', req.user.id);
    }

    res.json({ message: 'Stage skipped', stage });
  } catch (error) {
    console.error('Stage skip error:', error);
    res.status(500).json({ message: 'Failed to skip stage' });
  }
});

// Get manufacturing dashboard statistics
router.get('/dashboard/stats', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    console.log('=== MANUFACTURING DASHBOARD STATS START ===');
    
    // Total production orders
    const totalOrders = await ProductionOrder.count();
    console.log('Total orders:', totalOrders);
    
    // Active orders (in_progress, pending, on_hold)
    const activeOrders = await ProductionOrder.count({
      where: {
        status: { [Op.in]: ['pending', 'in_progress', 'on_hold'] }
      }
    });
    console.log('Active orders:', activeOrders);
    
    // Completed orders
    const completedOrders = await ProductionOrder.count({
      where: {
        status: 'completed'
      }
    });
    console.log('Completed orders:', completedOrders);
    
    // Delayed orders (planned_end_date is in the past and status is not completed)
    const now = new Date();
    const delayedOrders = await ProductionOrder.count({
      where: {
        planned_end_date: { [Op.lt]: now },
        status: { [Op.notIn]: ['completed', 'cancelled'] }
      }
    });
    console.log('Delayed orders:', delayedOrders);
    
    // Calculate efficiency (completed vs total)
    const efficiency = totalOrders > 0 
      ? Math.round((completedOrders / totalOrders) * 100) 
      : 0;
    console.log('Efficiency:', efficiency);
    
    console.log('=== MANUFACTURING DASHBOARD STATS END ===');
    
    res.json({
      totalOrders,
      activeOrders,
      completedOrders,
      delayedOrders,
      efficiency
    });
  } catch (error) {
    console.error('Manufacturing dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

// Get production orders
router.get('/orders', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      production_type,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      if (statusArray.length === 1) {
        where.status = statusArray[0];
      } else {
        where.status = { [Op.in]: statusArray };
      }
    }
    if (priority) where.priority = priority;

    if (production_type) where.production_type = production_type;

    if (search) {
      where[Op.or] = [
        { production_number: { [Op.like]: `%${search}%` } },
        { '$product.name$': { [Op.like]: `%${search}%` } },
        { '$salesOrder.order_number$': { [Op.like]: `%${search}%` } },
        { '$supervisor.name$': { [Op.like]: `%${search}%` } }
      ];
    }

    const { rows: productionOrders, count } = await ProductionOrder.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'product_code', 'specifications']
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'order_number', 'customer_id', 'status']
        },
        {
          model: User,
          as: 'supervisor',
          attributes: ['id', 'name', 'employee_id']
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'employee_id']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.json({
      productionOrders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Production orders fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch production orders' });
  }
});

// Update production order status
router.patch('/orders/:id/status', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { status, reason } = req.body;

    const order = await ProductionOrder.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Production order not found' });
    }

    await order.update({ status });

    if (status === 'on_hold' && reason) {
      order.status_notes = reason;
      await order.save();
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Update production stage status
router.patch('/orders/:orderId/stages/:stageId/status', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { status, reason } = req.body;
    const { orderId, stageId } = req.params;

    const stage = await ProductionStage.findOne({
      where: {
        id: stageId,
        production_order_id: orderId
      },
      include: [
        {
          model: ProductionOrder,
          as: 'productionOrder',
          attributes: ['id', 'status']
        }
      ]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Production stage not found' });
    }

    await stage.update({ status });

    if (status === 'in_progress') {
      stage.actual_start_time = stage.actual_start_time || new Date();
      await stage.save();
    }

    if (status === 'completed') {
      stage.actual_end_time = new Date();
      stage.actual_duration_hours = stage.actual_end_time
        ? Math.round((stage.actual_end_time - (stage.actual_start_time || new Date())) / (1000 * 60 * 60))
        : null;
      await stage.save();
    }

    if (status === 'on_hold' && reason) {
      stage.delay_reason = reason;
      await stage.save();
    }

    res.json({ message: 'Stage status updated successfully', stage });
  } catch (error) {
    console.error('Update stage status error:', error);
    res.status(500).json({ message: 'Failed to update stage status' });
  }
});

// Update production stage details
router.patch(
  '/orders/:orderId/stages/:stageId',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    const { orderId, stageId } = req.params;
    const { status, remarks, completed_by } = req.body;

    try {
      // Check if stage exists
      const [stageCheck] = await db.query(
        'SELECT * FROM production_stages WHERE id = ? AND order_id = ?',
        [stageId, orderId]
      );

      if (!stageCheck || stageCheck.length === 0) {
        return res.status(404).json({ message: 'Stage not found for this order.' });
      }

      // Update the stage record
      await db.query(
        `UPDATE production_stages
         SET status = ?, remarks = ?, completed_by = ?, updated_at = NOW()
         WHERE id = ? AND order_id = ?`,
        [status, remarks, completed_by, stageId, orderId]
      );

      res.status(200).json({
        message: 'Stage updated successfully.',
        orderId,
        stageId,
        updatedStatus: status,
      });
    } catch (error) {
      console.error('Error updating production stage:', error);
      res.status(500).json({
        message: 'Internal Server Error while updating stage.',
        error: error.message,
      });
    }
  }
);

router.get(
  '/orders/:orderId/stages',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    const { orderId } = req.params;

    try {
      const [stages] = await db.query(
        'SELECT * FROM production_stages WHERE order_id = ? ORDER BY id ASC',
        [orderId]
      );

      if (!stages || stages.length === 0) {
        return res.status(404).json({ message: 'No stages found for this order.' });
      }

      res.status(200).json({ stages });
    } catch (error) {
      console.error('Error fetching production stages:', error);
      res.status(500).json({
        message: 'Internal Server Error while fetching stages.',
        error: error.message,
      });
    }
  }
);

// ------------------------------------------------------------
// POST: Create a new production stage for an order
// ------------------------------------------------------------
router.post(
  '/orders/:orderId/stages',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    const { orderId } = req.params;
    const { stage_name, assigned_to, status = 'pending', remarks = '' } = req.body;

    try {
      await db.query(
        `INSERT INTO production_stages
         (order_id, stage_name, assigned_to, status, remarks, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [orderId, stage_name, assigned_to, status, remarks]
      );

      res.status(201).json({ message: 'New production stage created successfully.' });
    } catch (error) {
      console.error('Error creating new production stage:', error);
      res.status(500).json({
        message: 'Internal Server Error while creating stage.',
        error: error.message,
      });
    }
  }
);

// ------------------------------------------------------------
// DELETE: Remove a production stage
// ------------------------------------------------------------
router.delete(
  '/orders/:orderId/stages/:stageId',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    const { orderId, stageId } = req.params;

    try {
      const [result] = await db.query(
        'DELETE FROM production_stages WHERE id = ? AND order_id = ?',
        [stageId, orderId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Stage not found or already deleted.' });
      }

      res.status(200).json({ message: 'Stage deleted successfully.' });
    } catch (error) {
      console.error('Error deleting stage:', error);
      res.status(500).json({
        message: 'Internal Server Error while deleting stage.',
        error: error.message,
      });
    }
  }
);

// ------------------------------------------------------------
// GET: Fetch approved sales orders for production wizard
// Sales Order-centric approach: Get all approved sales orders ready for production
// ------------------------------------------------------------
router.get(
  '/approved-sales-orders',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      // Fetch sales orders that are approved/confirmed and ready for production
      const salesOrders = await SalesOrder.findAll({
        where: {
          status: {
            [Op.in]: ['confirmed', 'approved']
          }
        },
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'name', 'company_name', 'email', 'phone']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'product_code', 'category', 'specifications']
          }
        ],
        order: [['order_date', 'DESC']]
      });

      res.json({
        salesOrders: salesOrders.map(so => ({
          id: so.id,
          order_number: so.order_number,
          customer_id: so.customer_id,
          customer_name: so.customer?.name || so.customer?.company_name || 'N/A',
          product_id: so.product_id,
          product_name: so.product_name || so.product?.name || 'N/A',
          product_code: so.product?.product_code || 'N/A',
          total_quantity: so.total_quantity,
          delivery_date: so.delivery_date,
          order_date: so.order_date,
          status: so.status,
          special_instructions: so.special_instructions,
          buyer_reference: so.buyer_reference,
          order_type: so.order_type,
          items: so.items
        }))
      });
    } catch (error) {
      console.error('Error fetching approved sales orders:', error);
      res.status(500).json({
        message: 'Failed to fetch approved sales orders',
        error: error.message
      });
    }
  }
);

// ------------------------------------------------------------
// GET: Fetch complete sales order details for production wizard
// Returns: Sales Order + Product + Materials + Approvals + Everything needed
// ------------------------------------------------------------
router.get(
  '/sales-orders/:id/production-details',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const salesOrderId = req.params.id;

      // Fetch sales order with all related data
      const salesOrder = await SalesOrder.findByPk(salesOrderId, {
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'name', 'company_name', 'email', 'phone', 'billing_address', 'shipping_address']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'product_code', 'category', 'specifications', 'description']
          }
        ]
      });

      if (!salesOrder) {
        return res.status(404).json({ message: 'Sales order not found' });
      }

      // Fetch material requests related to this sales order
      const { ProjectMaterialRequest } = require('../config/database');
      const materialRequests = await ProjectMaterialRequest.findAll({
        where: { sales_order_id: salesOrderId },
        attributes: ['id', 'request_number', 'materials_requested', 'status', 'created_at'],
        order: [['created_at', 'DESC']]
      });

      // Fetch production approvals related to this sales order
      const { ProductionApproval, MaterialVerification, MaterialReceipt } = require('../config/database');
      const productionApprovals = await ProductionApproval.findAll({
        include: [
          {
            model: ProjectMaterialRequest,
            as: 'mrnRequest',
            where: { sales_order_id: salesOrderId },
            required: true
          },
          {
            model: MaterialVerification,
            as: 'verification',
            include: [
              {
                model: MaterialReceipt,
                as: 'receipt',
                attributes: ['id', 'receipt_number', 'received_materials', 'total_items_received', 'project_name']
              }
            ]
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['approved_at', 'DESC']]
      });

      // Parse items from sales order
      let items = [];
      try {
        items = typeof salesOrder.items === 'string' ? JSON.parse(salesOrder.items) : salesOrder.items;
      } catch (e) {
        console.warn('Failed to parse sales order items:', e);
      }

      // Parse materials from material requests
      let allMaterials = [];
      for (const mrn of materialRequests) {
        try {
          const materials = typeof mrn.materials_requested === 'string' 
            ? JSON.parse(mrn.materials_requested) 
            : mrn.materials_requested;
          if (Array.isArray(materials)) {
            allMaterials = [...allMaterials, ...materials];
          }
        } catch (e) {
          console.warn('Failed to parse materials_requested:', e);
        }
      }

      // Parse received materials from approvals
      let receivedMaterials = [];
      for (const approval of productionApprovals) {
        if (approval.verification?.receipt?.received_materials) {
          try {
            const materials = typeof approval.verification.receipt.received_materials === 'string'
              ? JSON.parse(approval.verification.receipt.received_materials)
              : approval.verification.receipt.received_materials;
            if (Array.isArray(materials)) {
              receivedMaterials = [...receivedMaterials, ...materials];
            }
          } catch (e) {
            console.warn('Failed to parse received_materials:', e);
          }
        }
      }

      // Check if production order already exists for this sales order
      const existingProductionOrders = await ProductionOrder.findAll({
        where: { sales_order_id: salesOrderId },
        attributes: ['id', 'production_number', 'status', 'quantity', 'created_at'],
        order: [['created_at', 'DESC']]
      });

      res.json({
        salesOrder: {
          id: salesOrder.id,
          order_number: salesOrder.order_number,
          customer_id: salesOrder.customer_id,
          customer_name: salesOrder.customer?.name || salesOrder.customer?.company_name || 'N/A',
          customer_email: salesOrder.customer?.email,
          customer_phone: salesOrder.customer?.phone,
          product_id: salesOrder.product_id,
          product_name: salesOrder.product_name || salesOrder.product?.name || 'N/A',
          product_code: salesOrder.product?.product_code || 'N/A',
          product_specifications: salesOrder.product?.specifications,
          total_quantity: salesOrder.total_quantity,
          delivery_date: salesOrder.delivery_date,
          order_date: salesOrder.order_date,
          status: salesOrder.status,
          special_instructions: salesOrder.special_instructions,
          buyer_reference: salesOrder.buyer_reference,
          order_type: salesOrder.order_type,
          garment_specifications: salesOrder.garment_specifications,
          items: items
        },
        materialRequests: materialRequests.map(mrn => ({
          id: mrn.id,
          request_number: mrn.request_number,
          status: mrn.status,
          created_at: mrn.created_at
        })),
        requestedMaterials: allMaterials,
        receivedMaterials: receivedMaterials,
        productionApprovals: productionApprovals.map(approval => ({
          id: approval.id,
          approval_status: approval.approval_status,
          approved_at: approval.approved_at,
          approved_by: approval.approver?.name,
          approval_notes: approval.approval_notes,
          production_started: approval.production_started
        })),
        existingProductionOrders: existingProductionOrders.map(po => ({
          id: po.id,
          production_number: po.production_number,
          status: po.status,
          quantity: po.quantity,
          created_at: po.created_at
        }))
      });
    } catch (error) {
      console.error('Error fetching sales order production details:', error);
      res.status(500).json({
        message: 'Failed to fetch sales order production details',
        error: error.message
      });
    }
  }
);

// ------------------------------------------------------------
// GET: Fetch product wizard details (product info + related sales orders)
// ------------------------------------------------------------
router.get(
  '/products/:id/wizard-details',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const productId = req.params.id;

      // Fetch product details
      const product = await Product.findByPk(productId, {
        attributes: ['id', 'name', 'product_code', 'category', 'specifications', 'description']
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Fetch related sales orders for this product
      const salesOrders = await SalesOrder.findAll({
        where: {
          product_id: productId,
          status: {
            [Op.in]: ['pending', 'confirmed', 'in_production']
          }
        },
        attributes: [
          'id',
          'order_number',
          'customer_id',
          'total_quantity',
          'delivery_date',
          'status',
          'special_instructions'
        ],
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'name', 'company_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        product: {
          id: product.id,
          name: product.name,
          product_code: product.product_code,
          category: product.category,
          specifications: product.specifications,
          description: product.description
        },
        salesOrders: salesOrders.map(so => ({
          id: so.id,
          order_number: so.order_number,
          customer_id: so.customer_id,
          customer_name: so.customer?.name || so.customer?.company_name || 'N/A',
          product_quantity: so.total_quantity,
          delivery_date: so.delivery_date,
          status: so.status,
          special_instructions: so.special_instructions
        }))
      });
    } catch (error) {
      console.error('Error fetching product wizard details:', error);
      res.status(500).json({
        message: 'Failed to fetch product wizard details',
        error: error.message
      });
    }
  }
);

// Get Materials for Reconciliation
router.get('/orders/:orderId/materials/reconciliation', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    const productionOrder = await ProductionOrder.findByPk(orderId);
    if (!productionOrder) {
      return res.status(404).json({ message: 'Production order not found' });
    }

    // Get all material allocations for this order
    const materials = await MaterialAllocation.findAll({
      where: { production_order_id: orderId },
      include: [
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'product_name', 'category', 'barcode', 'unit_of_measurement']
        }
      ]
    });

    // Format materials with reconciliation data
    const formattedMaterials = materials.map(allocation => {
      const remaining = allocation.quantity_allocated - 
                       (allocation.quantity_consumed || 0) - 
                       (allocation.quantity_wasted || 0) - 
                       (allocation.quantity_returned || 0);
      
      return {
        id: allocation.id,
        inventory_id: allocation.inventory_id,
        item_name: allocation.inventory?.product_name || 'Unknown',
        category: allocation.inventory?.category || 'N/A',
        barcode: allocation.inventory?.barcode || '',
        unit: allocation.inventory?.unit_of_measurement || 'piece',
        quantity_allocated: allocation.quantity_allocated,
        quantity_consumed: allocation.quantity_consumed || 0,
        quantity_wasted: allocation.quantity_wasted || 0,
        quantity_returned: allocation.quantity_returned || 0,
        quantity_remaining: remaining,
        status: allocation.status || 'in_use'
      };
    });

    res.json({ materials: formattedMaterials });
  } catch (error) {
    console.error('[ERROR] Material reconciliation fetch error:', error);
    console.error('[ERROR] Stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch materials for reconciliation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Submit Material Reconciliation
router.post('/orders/:orderId/materials/reconcile', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { materials, notes } = req.body;
    
    const productionOrder = await ProductionOrder.findByPk(orderId);
    if (!productionOrder) {
      return res.status(404).json({ message: 'Production order not found' });
    }

    const reconciliationResults = [];

    // Process each material reconciliation
    for (const material of materials) {
      const allocation = await MaterialAllocation.findByPk(material.allocation_id, {
        include: [{ model: Inventory, as: 'inventory' }]
      });

      if (!allocation) {
        console.warn(`Allocation ${material.allocation_id} not found, skipping`);
        continue;
      }

      // Update the material allocation
      await allocation.update({
        quantity_consumed: material.actual_consumed,
        quantity_wasted: material.actual_wasted,
        quantity_returned: material.leftover_quantity,
        status: 'reconciled',
        notes: material.notes || notes
      });

      // Return leftover materials to inventory
      if (material.leftover_quantity > 0) {
        const inventory = allocation.inventory;
        const newQuantity = parseFloat(inventory.quantity_on_hand) + parseFloat(material.leftover_quantity);
        
        await inventory.update({
          quantity_on_hand: newQuantity
        });

        // Create inventory movement record
        await InventoryMovement.create({
          inventory_id: inventory.id,
          movement_type: 'return',
          quantity: material.leftover_quantity,
          from_location: 'manufacturing',
          to_location: 'warehouse',
          reference_type: 'production_order',
          reference_id: orderId,
          notes: `Material reconciliation - leftover returned from Production Order ${productionOrder.order_number}`,
          performed_by: req.user.id
        });

        reconciliationResults.push({
          item: inventory.product_name,
          leftover_returned: material.leftover_quantity,
          new_inventory_quantity: newQuantity
        });
      }
    }

    res.json({ 
      message: 'Material reconciliation completed successfully',
      reconciliation_results: reconciliationResults
    });
  } catch (error) {
    console.error('[ERROR] Material reconciliation error:', error);
    console.error('[ERROR] Stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to complete material reconciliation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
