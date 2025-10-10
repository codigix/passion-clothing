const express = require('express');
const router = express.Router();
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const db = require('../config/database');
const { Op } = require('sequelize');

// Generate dispatch number
const generateDispatchNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastDispatch = await db.MaterialDispatch.findOne({
    where: {
      dispatch_number: {
        [Op.like]: `DSP-${dateStr}-%`
      }
    },
    order: [['dispatch_number', 'DESC']]
  });

  let sequence = 1;
  if (lastDispatch) {
    const lastSequence = parseInt(lastDispatch.dispatch_number.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `DSP-${dateStr}-${sequence.toString().padStart(5, '0')}`;
};

// POST /api/material-dispatch/create - Create new dispatch
router.post('/create', authenticateToken, checkDepartment(['inventory']), async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const {
      mrn_request_id,
      dispatched_materials,
      dispatch_notes,
      dispatch_photos
    } = req.body;

    // Detailed validation logging
    console.log('📦 Creating material dispatch...');
    console.log('   MRN Request ID:', mrn_request_id);
    console.log('   Materials count:', dispatched_materials?.length);
    console.log('   User:', req.user.id, req.user.name);

    // Validate required fields
    if (!mrn_request_id) {
      await transaction.rollback();
      return res.status(400).json({ message: 'MRN request ID is required' });
    }

    if (!dispatched_materials || !Array.isArray(dispatched_materials) || dispatched_materials.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Dispatched materials are required and must be a non-empty array' });
    }

    // Validate MRN request exists
    const mrnRequest = await db.ProjectMaterialRequest.findByPk(mrn_request_id);
    if (!mrnRequest) {
      await transaction.rollback();
      return res.status(404).json({ message: 'MRN request not found' });
    }

    console.log('   ✅ MRN Request found:', mrnRequest.request_number);

    // Generate dispatch number
    const dispatch_number = await generateDispatchNumber();
    console.log('   ✅ Generated dispatch number:', dispatch_number);

    // Calculate total items
    const total_items = dispatched_materials.length;

    // Create dispatch record
    const dispatch = await db.MaterialDispatch.create({
      dispatch_number,
      mrn_request_id,
      project_name: mrnRequest.project_name,
      dispatched_materials,
      total_items,
      dispatch_notes,
      dispatch_photos: dispatch_photos || [],
      dispatched_by: req.user.id,
      dispatched_at: new Date(),
      received_status: 'pending'
    }, { transaction });

    // Update MRN request status
    await mrnRequest.update({
      status: 'materials_issued',
      processed_by: req.user.id,
      processed_at: new Date()
    }, { transaction });

    // Create inventory movements for each material
    for (const material of dispatched_materials) {
      // Only create inventory movement if inventory_id exists
      if (material.inventory_id) {
        await db.InventoryMovement.create({
          inventory_id: material.inventory_id,
          movement_type: 'dispatch_to_manufacturing',
          quantity: -material.quantity_dispatched,
          reference_type: 'material_dispatch',
          reference_id: dispatch.id,
          notes: `Dispatched to manufacturing for project: ${mrnRequest.project_name}`,
          performed_by: req.user.id
        }, { transaction });

        // Update inventory quantity
        const inventory = await db.Inventory.findByPk(material.inventory_id);
        if (inventory) {
          await inventory.update({
            quantity: inventory.quantity - material.quantity_dispatched
          }, { transaction });
        }
      } else {
        console.log(`   ⚠️ Skipping inventory movement for ${material.material_name} - no inventory_id`);
      }
    }

    // Create notification for manufacturing
    await db.Notification.create({
      user_id: mrnRequest.created_by,
      type: 'material_dispatched',
      title: 'Materials Dispatched',
      message: `Materials for MRN ${mrnRequest.request_number} have been dispatched. Dispatch #: ${dispatch_number}`,
      related_type: 'material_dispatch',
      related_id: dispatch.id,
      priority: 'high'
    }, { transaction });

    await transaction.commit();

    // Fetch complete dispatch with relations
    const completeDispatch = await db.MaterialDispatch.findByPk(dispatch.id, {
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.User,
          as: 'dispatcher',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Materials dispatched successfully',
      dispatch: completeDispatch
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error creating dispatch:', error);
    console.error('   Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error creating dispatch', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/material-dispatch/:mrnId - Get dispatch by MRN request ID
router.get('/:mrnId', authenticateToken, async (req, res) => {
  try {
    const { mrnId } = req.params;

    const dispatch = await db.MaterialDispatch.findOne({
      where: { mrn_request_id: mrnId },
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.User,
          as: 'dispatcher',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!dispatch) {
      return res.status(404).json({ message: 'Dispatch not found for this MRN' });
    }

    res.json({ dispatch });

  } catch (error) {
    console.error('Error fetching dispatch:', error);
    res.status(500).json({ 
      message: 'Error fetching dispatch', 
      error: error.message 
    });
  }
});

// GET /api/material-dispatch/list/all - Get all dispatches
router.get('/list/all', authenticateToken, async (req, res) => {
  try {
    const dispatches = await db.MaterialDispatch.findAll({
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.User,
          as: 'dispatcher',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['dispatched_at', 'DESC']]
    });

    res.json({ dispatches });

  } catch (error) {
    console.error('Error fetching dispatches:', error);
    res.status(500).json({ 
      message: 'Error fetching dispatches', 
      error: error.message 
    });
  }
});

// GET /api/material-dispatch/pending - Get pending dispatches (not received)
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const dispatches = await db.MaterialDispatch.findAll({
      where: { received_status: 'pending' },
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.User,
          as: 'dispatcher',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['dispatched_at', 'DESC']]
    });

    res.json({ dispatches });

  } catch (error) {
    console.error('Error fetching pending dispatches:', error);
    res.status(500).json({ 
      message: 'Error fetching pending dispatches', 
      error: error.message 
    });
  }
});

module.exports = router;