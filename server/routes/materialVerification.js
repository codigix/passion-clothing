const express = require('express');
const router = express.Router();
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const db = require('../config/database');
const { Op } = require('sequelize');

// Generate verification number
const generateVerificationNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastVerification = await db.MaterialVerification.findOne({
    where: {
      verification_number: {
        [Op.like]: `MRN-VRF-${dateStr}-%`
      }
    },
    order: [['verification_number', 'DESC']]
  });

  let sequence = 1;
  if (lastVerification) {
    const lastSequence = parseInt(lastVerification.verification_number.split('-')[3]);
    sequence = lastSequence + 1;
  }

  return `MRN-VRF-${dateStr}-${sequence.toString().padStart(5, '0')}`;
};

// POST /api/material-verification/create - Create verification record
router.post('/create', authenticateToken, checkDepartment(['manufacturing']), async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const {
      mrn_request_id,
      receipt_id,
      verification_checklist,
      overall_result,
      issues_found,
      verification_notes,
      verification_photos
    } = req.body;

    // Validate receipt exists
    const receipt = await db.MaterialReceipt.findByPk(receipt_id);
    if (!receipt) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Receipt record not found' });
    }

    // Generate verification number
    const verification_number = await generateVerificationNumber();

    // Create verification record
    const verification = await db.MaterialVerification.create({
      verification_number,
      mrn_request_id,
      receipt_id,
      project_name: receipt.project_name,
      verification_checklist,
      overall_result,
      issues_found: issues_found || null,
      verification_notes,
      verification_photos: verification_photos || [],
      verified_by: req.user.id,
      verified_at: new Date(),
      approval_status: 'pending'
    }, { transaction });

    // Update receipt verification status
    const verificationStatus = overall_result === 'passed' ? 'verified' : 'failed';
    await receipt.update({
      verification_status: verificationStatus
    }, { transaction });

    // Create notification based on result
    const mrnRequest = await db.ProjectMaterialRequest.findByPk(mrn_request_id);
    const notificationType = overall_result === 'passed' ? 'verification_passed' : 'verification_failed';
    const notificationMessage = overall_result === 'passed'
      ? `Material verification passed for MRN ${mrnRequest.request_number}. Verification #: ${verification_number}`
      : `Material verification failed for MRN ${mrnRequest.request_number}. Verification #: ${verification_number}`;

    // Notify manufacturing manager
    await db.Notification.create({
      user_id: mrnRequest.created_by,
      type: notificationType,
      title: overall_result === 'passed' ? 'Verification Passed' : 'Verification Failed',
      message: notificationMessage,
      related_type: 'material_verification',
      related_id: verification.id,
      priority: overall_result === 'failed' ? 'high' : 'medium'
    }, { transaction });

    await transaction.commit();

    // Fetch complete verification with relations
    const completeVerification = await db.MaterialVerification.findByPk(verification.id, {
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.MaterialReceipt,
          as: 'receipt'
        },
        {
          model: db.User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Verification completed successfully',
      verification: completeVerification
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating verification:', error);
    res.status(500).json({ 
      message: 'Error creating verification', 
      error: error.message 
    });
  }
});

// GET /api/material-verification/:receiptId - Get verification by receipt ID
router.get('/:receiptId', authenticateToken, async (req, res) => {
  try {
    const { receiptId } = req.params;

    const verification = await db.MaterialVerification.findOne({
      where: { receipt_id: receiptId },
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.MaterialReceipt,
          as: 'receipt'
        },
        {
          model: db.User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found for this receipt' });
    }

    res.json({ verification });

  } catch (error) {
    console.error('Error fetching verification:', error);
    res.status(500).json({ 
      message: 'Error fetching verification', 
      error: error.message 
    });
  }
});

// GET /api/material-verification/list/pending-approval - Get pending approvals
router.get('/list/pending-approval', authenticateToken, checkDepartment(['manufacturing']), async (req, res) => {
  try {
    const verifications = await db.MaterialVerification.findAll({
      where: { 
        approval_status: 'pending',
        overall_result: 'passed'
      },
      include: [
        {
          model: db.ProjectMaterialRequest,
          as: 'mrnRequest'
        },
        {
          model: db.MaterialReceipt,
          as: 'receipt'
        },
        {
          model: db.User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['verified_at', 'DESC']]
    });

    res.json({ verifications });

  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({ 
      message: 'Error fetching pending verifications', 
      error: error.message 
    });
  }
});

// PUT /api/material-verification/:id/complete - Complete verification (manager approval)
router.put('/:id/complete', authenticateToken, checkDepartment(['manufacturing']), async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { approval_status, notes } = req.body;

    const verification = await db.MaterialVerification.findByPk(id);
    if (!verification) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Verification not found' });
    }

    await verification.update({
      approval_status,
      verification_notes: notes || verification.verification_notes
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'Verification status updated successfully',
      verification
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error updating verification:', error);
    res.status(500).json({ 
      message: 'Error updating verification', 
      error: error.message 
    });
  }
});

module.exports = router;