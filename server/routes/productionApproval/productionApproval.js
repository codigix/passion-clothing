const express = require('express');
const router = express.Router();
const { authenticateToken, checkDepartment } = require('../../middleware/auth');
const db = require('../../config/database');
const { Op } = require('sequelize');


// Generate approval number
const generateApprovalNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastApproval = await db.ProductionApproval.findOne({
    where: {
      approval_number: {
        [Op.like]: `PRD-APV-${dateStr}-%`
      }
    },
    order: [['approval_number', 'DESC']]
  });

  let sequence = 1;
  if (lastApproval) {
    const lastSequence = parseInt(lastApproval.approval_number.split('-')[3]);
    sequence = lastSequence + 1;
  }

  return `PRD-APV-${dateStr}-${sequence.toString().padStart(5, '0')}`;
};

// POST /api/production-approval/create - Create production approval
router.post('/create', authenticateToken, checkDepartment(['manufacturing']), async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const {
      mrn_request_id,
      verification_id,
      production_order_id,
      approval_status,
      production_start_date,
      material_allocations,
      approval_notes,
      rejection_reason,
      conditions
    } = req.body;

    // Validate verification exists and passed
    const verification = await db.MaterialVerification.findByPk(verification_id);
    if (!verification) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Verification record not found' });
    }

    if (verification.overall_result !== 'passed') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cannot approve materials that failed verification' });
    }

    // Generate approval number
    const approval_number = await generateApprovalNumber();

    // Create approval record
    const approval = await db.ProductionApproval.create({
      approval_number,
      mrn_request_id,
      verification_id,
      production_order_id: production_order_id || null,
      project_name: verification.project_name,
      approval_status,
      production_start_date: production_start_date || null,
      material_allocations: material_allocations || null,
      approval_notes,
      rejection_reason: rejection_reason || null,
      conditions: conditions || null,
      approved_by: req.user.id,
      approved_at: new Date(),
      production_started: false
    }, { transaction });

    // Update verification approval status
    await verification.update({
      approval_status: approval_status === 'approved' ? 'approved' : 'rejected'
    }, { transaction });

    // Update MRN request status
    const mrnRequest = await db.ProjectMaterialRequest.findByPk(mrn_request_id);
    const newStatus = approval_status === 'approved' ? 'materials_ready' : 'cancelled';
    await mrnRequest.update({
      status: newStatus,
      completed_at: approval_status === 'approved' ? new Date() : null
    }, { transaction });

    // If approved, create material allocations
    if (approval_status === 'approved' && material_allocations) {
      for (const allocation of material_allocations) {
        await db.MaterialAllocation.create({
          material_name: allocation.material_name,
          material_code: allocation.material_code,
          quantity_allocated: allocation.quantity_allocated,
          production_order_id: production_order_id,
          mrn_request_id: mrn_request_id,
          allocation_date: new Date(),
          allocated_by: req.user.id
        }, { transaction });
      }
    }

    // Create notification
    const notificationMessage = approval_status === 'approved'
      ? `Production approved for MRN ${mrnRequest.request_number}. Ready for production! Approval #: ${approval_number}`
      : `Production approval rejected for MRN ${mrnRequest.request_number}. Reason: ${rejection_reason}`;

    await db.Notification.create({
      recipient_user_id: mrnRequest.created_by,
      type: 'manufacturing',
      title: approval_status === 'approved' ? 'Production Approved' : 'Production Rejected',
      message: notificationMessage,
      related_entity_type: 'production_approval',
      related_entity_id: approval.id,
      priority: 'high'
    }, { transaction });

    await transaction.commit();

    // Fetch complete approval with relations
    const completeApproval = await db.ProductionApproval.findByPk(approval.id, {
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.MaterialVerification,
          as: 'verification'
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Production approval processed successfully',
      approval: completeApproval
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating production approval:', error);
    res.status(500).json({ 
      message: 'Error creating production approval', 
      error: error.message 
    });
  }
});

// GET /api/production-approval/list/approved - Get approved productions
// IMPORTANT: Specific routes MUST come BEFORE catch-all routes like /:id
router.get('/list/approved', authenticateToken, checkDepartment(['manufacturing']), async (req, res) => {
  try {
    const approvals = await db.ProductionApproval.findAll({
      where: { 
        approval_status: 'approved',
        production_started: false
      },
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest',
          include: [
            {
              model: db.SalesOrder,
              as: 'salesOrder',
              attributes: ['id', 'order_number', 'customer_id', 'delivery_date', 'items'],
              include: [
                {
                  model: db.Customer,
                  as: 'customer',
                  attributes: ['id', 'name', 'email', 'phone']
                }
              ]
            },
            {
              model: db.PurchaseOrder,
              as: 'purchaseOrder',
              attributes: ['id', 'po_number', 'vendor_id', 'total_amount', 'items'],
              include: [
                {
                  model: db.Vendor,
                  as: 'vendor',
                  attributes: ['id', 'name', 'contact_person', 'email']
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
              attributes: ['id', 'receipt_number', 'received_materials', 'total_items_received']
            }
          ]
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['approved_at', 'DESC']]
    });

    res.json({ approvals });

  } catch (error) {
    console.error('Error fetching approved productions:', error);
    res.status(500).json({ 
      message: 'Error fetching approved productions', 
      error: error.message 
    });
  }
});

// GET /api/production-approval/:id/details - Get full approval details for Production Wizard
// This specific route MUST come BEFORE the catch-all /:verificationId route
router.get('/:id/details', authenticateToken, checkDepartment(['manufacturing']), async (req, res) => {
  try {
    const { id } = req.params;

    const approval = await db.ProductionApproval.findByPk(id, {
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
              attributes: ['id', 'receipt_number', 'received_materials', 'total_items_received', 'project_name', 'dispatch_id'],
              include: [
                {
                  model: db.MaterialDispatch,
                  as: 'dispatch',
                  attributes: ['id', 'dispatch_number', 'dispatched_materials', 'project_name']
                }
              ]
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

    if (!approval) {
      return res.status(404).json({ message: 'Approval not found' });
    }

    if (approval.approval_status !== 'approved') {
      return res.status(400).json({ message: 'Only approved orders can be used for production' });
    }

    if (approval.production_started) {
      return res.status(400).json({ message: 'Production already started for this approval' });
    }

    res.json({ approval });

  } catch (error) {
    console.error('Error fetching approval details:', error);
    res.status(500).json({ 
      message: 'Error fetching approval details', 
      error: error.message 
    });
  }
});

// GET /api/production-approval/by-verification/:verificationId - Get approval by verification ID
router.get('/by-verification/:verificationId', authenticateToken, async (req, res) => {
  try {
    const { verificationId } = req.params;

    const approval = await db.ProductionApproval.findOne({
      where: { verification_id: verificationId },
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.MaterialVerification,
          as: 'verification'
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!approval) {
      return res.status(404).json({ message: 'Approval not found for this verification' });
    }

    res.json({ approval });

  } catch (error) {
    console.error('Error fetching approval by verification:', error);
    res.status(500).json({ 
      message: 'Error fetching approval', 
      error: error.message 
    });
  }
});

// GET /api/production-approval/:approvalId - Get approval by approval ID (primary key)
router.get('/:approvalId', authenticateToken, async (req, res) => {
  try {
    const { approvalId } = req.params;

    const approval = await db.ProductionApproval.findByPk(approvalId, {
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.MaterialVerification,
          as: 'verification'
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!approval) {
      return res.status(404).json({ message: 'Approval not found' });
    }

    res.json({ approval });

  } catch (error) {
    console.error('Error fetching approval:', error);
    res.status(500).json({ 
      message: 'Error fetching approval', 
      error: error.message 
    });
  }
});

// PUT /api/production-approval/:id/start-production - Start production
router.put('/:id/start-production', authenticateToken, checkDepartment(['manufacturing']), async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { production_order_id } = req.body;

    const approval = await db.ProductionApproval.findByPk(id);
    if (!approval) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Approval not found' });
    }

    if (approval.approval_status !== 'approved') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Can only start production for approved requests' });
    }

    await approval.update({
      production_started: true,
      production_started_at: new Date(),
      production_order_id: production_order_id || approval.production_order_id
    }, { transaction });

    // Update MRN request to completed
    await db.ProjectMaterialRequest.update(
      { status: 'completed' },
      { where: { id: approval.mrn_request_id }, transaction }
    );

    await transaction.commit();

    res.json({
      message: 'Production started successfully',
      approval
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error starting production:', error);
    res.status(500).json({ 
      message: 'Error starting production', 
      error: error.message 
    });
  }
});
module.exports = router;