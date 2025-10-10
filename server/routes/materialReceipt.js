const express = require('express');
const router = express.Router();
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const db = require('../config/database');
const { Op } = require('sequelize');

// Generate receipt number
const generateReceiptNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastReceipt = await db.MaterialReceipt.findOne({
    where: {
      receipt_number: {
        [Op.like]: `MRN-RCV-${dateStr}-%`
      }
    },
    order: [['receipt_number', 'DESC']]
  });

  let sequence = 1;
  if (lastReceipt) {
    const lastSequence = parseInt(lastReceipt.receipt_number.split('-')[3]);
    sequence = lastSequence + 1;
  }

  return `MRN-RCV-${dateStr}-${sequence.toString().padStart(5, '0')}`;
};

// POST /api/material-receipt/create - Create material receipt
router.post('/create', authenticateToken, checkDepartment(['manufacturing']), async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const {
      mrn_request_id,
      dispatch_id,
      received_materials,
      has_discrepancy,
      discrepancy_details,
      receipt_notes,
      receipt_photos
    } = req.body;

    // Validate dispatch exists
    const dispatch = await db.MaterialDispatch.findByPk(dispatch_id);
    if (!dispatch) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Dispatch record not found' });
    }

    // Generate receipt number
    const receipt_number = await generateReceiptNumber();

    // Calculate total items received
    const total_items_received = received_materials.length;

    // Create receipt record
    const receipt = await db.MaterialReceipt.create({
      receipt_number,
      mrn_request_id,
      dispatch_id,
      project_name: dispatch.project_name,
      received_materials,
      total_items_received,
      has_discrepancy: has_discrepancy || false,
      discrepancy_details: discrepancy_details || null,
      receipt_notes,
      receipt_photos: receipt_photos || [],
      received_by: req.user.id,
      received_at: new Date(),
      verification_status: 'pending'
    }, { transaction });

    // Update dispatch received status
    const receivedStatus = has_discrepancy ? 'discrepancy' : 'received';
    await dispatch.update({
      received_status: receivedStatus
    }, { transaction });

    // Update MRN request status
    const mrnRequest = await db.ProjectMaterialRequest.findByPk(mrn_request_id);
    await mrnRequest.update({
      status: has_discrepancy ? 'partially_issued' : 'issued'
    }, { transaction });

    // 🎯 Update Sales Order status to enable Start Production button
    if (mrnRequest.sales_order_id && !has_discrepancy) {
      const salesOrder = await db.SalesOrder.findByPk(mrnRequest.sales_order_id);
      if (salesOrder) {
        await salesOrder.update({
          status: 'materials_received',
          lifecycle_history: [
            ...(salesOrder.lifecycle_history || []),
            {
              event: 'materials_received',
              timestamp: new Date(),
              user: req.user.id,
              details: `Materials received from inventory. Receipt #: ${receipt_number}`
            }
          ]
        }, { transaction });
        
        console.log(`✅ Sales Order ${salesOrder.order_number} status updated to 'materials_received'`);
      }
    }

    // Create notifications
    const notificationType = has_discrepancy ? 'material_discrepancy' : 'material_received';
    const notificationMessage = has_discrepancy 
      ? `Materials received with discrepancies for MRN ${mrnRequest.request_number}. Receipt #: ${receipt_number}`
      : `Materials successfully received for MRN ${mrnRequest.request_number}. Receipt #: ${receipt_number}`;

    // Notify inventory about material receipt
    await db.Notification.create({
      user_id: dispatch.dispatched_by,
      type: notificationType,
      title: has_discrepancy ? 'Material Discrepancy Found' : 'Materials Received',
      message: notificationMessage,
      related_type: 'material_receipt',
      related_id: receipt.id,
      priority: has_discrepancy ? 'high' : 'medium'
    }, { transaction });

    // 🔔 Notify manufacturing that they can start production (if no discrepancy)
    if (mrnRequest.sales_order_id && !has_discrepancy) {
      await db.Notification.create({
        user_id: req.user.id, // Manufacturing user who received materials
        type: 'production_ready',
        title: '✅ Ready for Production',
        message: `All materials received for MRN ${mrnRequest.request_number}. You can now start production!`,
        related_type: 'sales_order',
        related_id: mrnRequest.sales_order_id,
        priority: 'high'
      }, { transaction });
    }

    await transaction.commit();

    // Fetch complete receipt with relations
    const completeReceipt = await db.MaterialReceipt.findByPk(receipt.id, {
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.MaterialDispatch,
          as: 'dispatch'
        },
        {
          model: db.User,
          as: 'receiver',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Materials received successfully',
      receipt: completeReceipt
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating receipt:', error);
    res.status(500).json({ 
      message: 'Error creating receipt', 
      error: error.message 
    });
  }
});

// GET /api/material-receipt/:dispatchId - Get receipt by dispatch ID
router.get('/:dispatchId', authenticateToken, async (req, res) => {
  try {
    const { dispatchId } = req.params;

    const receipt = await db.MaterialReceipt.findOne({
      where: { dispatch_id: dispatchId },
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.MaterialDispatch,
          as: 'dispatch'
        },
        {
          model: db.User,
          as: 'receiver',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found for this dispatch' });
    }

    res.json({ receipt });

  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ 
      message: 'Error fetching receipt', 
      error: error.message 
    });
  }
});

// GET /api/material-receipt/list/pending-verification - Get pending verification
router.get('/list/pending-verification', authenticateToken, checkDepartment(['manufacturing']), async (req, res) => {
  try {
    const receipts = await db.MaterialReceipt.findAll({
      where: { verification_status: 'pending' },
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.MaterialDispatch,
          as: 'dispatch'
        },
        {
          model: db.User,
          as: 'receiver',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['received_at', 'DESC']]
    });

    res.json({ receipts });

  } catch (error) {
    console.error('Error fetching pending receipts:', error);
    res.status(500).json({ 
      message: 'Error fetching pending receipts', 
      error: error.message 
    });
  }
});

// PUT /api/material-receipt/:id/discrepancy - Update discrepancy details
router.put('/:id/discrepancy', authenticateToken, checkDepartment(['manufacturing']), async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { discrepancy_details, receipt_notes } = req.body;

    const receipt = await db.MaterialReceipt.findByPk(id);
    if (!receipt) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Receipt not found' });
    }

    await receipt.update({
      has_discrepancy: true,
      discrepancy_details,
      receipt_notes
    }, { transaction });

    // Update dispatch status
    await db.MaterialDispatch.update(
      { received_status: 'discrepancy' },
      { where: { id: receipt.dispatch_id }, transaction }
    );

    await transaction.commit();

    res.json({
      message: 'Discrepancy details updated successfully',
      receipt
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error updating discrepancy:', error);
    res.status(500).json({ 
      message: 'Error updating discrepancy', 
      error: error.message 
    });
  }
});

module.exports = router;