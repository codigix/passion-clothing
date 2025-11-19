const express = require('express');
const router = express.Router();
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const db = require('../config/database');
const NotificationService = require('../utils/notificationService');
const {
  CreditNote,
  GoodsReceiptNote,
  PurchaseOrder,
  Vendor,
  User,
  Invoice
} = db;

const generateCreditNoteNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CN-${dateStr}-${random}`;
};

// Create credit note for GRN overage
router.post(
  '/',
  authenticateToken,
  checkDepartment(['admin', 'procurement', 'inventory']),
  async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const {
        grn_id,
        credit_note_type = 'partial_credit',
        tax_percentage = 0,
        settlement_method = null,
        remarks = null
      } = req.body;

      // Validate GRN exists and has overage
      const grn = await GoodsReceiptNote.findByPk(grn_id, {
        include: [
          { model: PurchaseOrder, as: 'purchaseOrder' }
        ],
        transaction
      });

      if (!grn) {
        await transaction.rollback();
        return res.status(404).json({ message: 'GRN not found' });
      }

      if (!grn.purchase_order_id) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: 'GRN is not associated with a Purchase Order' 
        });
      }

      if (!grn.vendor_id) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: 'Vendor is not associated to this GRN. Please ensure the Purchase Order has a vendor assigned.' 
        });
      }

      // Check if GRN has overage items
      const items = grn.items_received || [];
      const overageItems = items.filter(item => parseFloat(item.overage_quantity || 0) > 0);

      if (overageItems.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'No overage items found in this GRN'
        });
      }

      // Calculate credit amount
      const subtotal = overageItems.reduce((sum, item) => {
        const qty = parseFloat(item.overage_quantity || 0);
        const rate = parseFloat(item.rate || 0);
        return sum + (qty * rate);
      }, 0);

      const taxAmount = (subtotal * parseFloat(tax_percentage || 0)) / 100;
      const totalCredit = subtotal + taxAmount;

      // Create credit note
      const creditNoteNumber = generateCreditNoteNumber();
      const creditNote = await CreditNote.create(
        {
          credit_note_number: creditNoteNumber,
          grn_id,
          purchase_order_id: grn.purchase_order_id,
          vendor_id: grn.vendor_id,
          credit_note_date: new Date(),
          credit_note_type,
          items: overageItems.map(item => ({
            material_id: item.material_id || null,
            material_name: item.material_name,
            overage_quantity: parseFloat(item.overage_quantity || 0),
            rate: parseFloat(item.rate || 0),
            unit: item.unit || item.uom,
            total_value: parseFloat(item.overage_quantity || 0) * parseFloat(item.rate || 0),
            uom: item.uom
          })),
          subtotal_credit_amount: subtotal,
          tax_percentage: parseFloat(tax_percentage || 0),
          tax_amount: taxAmount,
          total_credit_amount: totalCredit,
          status: 'draft',
          settlement_method,
          settlement_status: 'pending',
          created_by: req.user.id,
          remarks
        },
        { transaction }
      );

      // Update GRN to mark that credit note is created
      await grn.update(
        {
          vendor_revert_reason: `Credit note generated: ${creditNoteNumber} for overage items`
        },
        { transaction }
      );

      await transaction.commit();

      // Send notification to finance/account department
      try {
        await NotificationService.sendToDepartment('finance', {
          type: 'credit_note_created',
          title: 'New Credit Note Created',
          description: `Credit note ${creditNoteNumber} created for ${grn.grn_number}`,
          message: `Credit note ${creditNoteNumber} of ₹${parseFloat(totalCredit.toFixed(2))} has been created for GRN ${grn.grn_number} from vendor ${grn.vendor_id}. Status: Draft. Action required: Review and approve.`,
          entity_type: 'credit_note',
          entity_id: creditNote.id,
          related_data: {
            credit_note_number: creditNoteNumber,
            grn_number: grn.grn_number,
            total_amount: parseFloat(totalCredit.toFixed(2)),
            settlement_method,
            credit_note_type
          },
          priority: 'high',
          action_url: `/finance/credit-notes/${creditNote.id}`
        });
      } catch (notifError) {
        console.error('Error sending notification to finance department:', notifError);
      }

      res.status(201).json({
        message: 'Credit note created successfully',
        creditNote,
        creditNoteNumber,
        totalCredit: parseFloat(totalCredit.toFixed(2))
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating credit note:', error);
      res.status(500).json({
        message: 'Failed to create credit note',
        error: error.message
      });
    }
  }
);

// Generate credit note from GRN (POST endpoint for automatic generation)
router.post(
  '/generate-from-grn/:grnId',
  authenticateToken,
  checkDepartment(['admin', 'procurement', 'inventory']),
  async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { tax_percentage = 0, settlement_method = null, remarks = null } = req.body;

      const grn = await GoodsReceiptNote.findByPk(req.params.grnId, {
        include: [
          { model: PurchaseOrder, as: 'purchaseOrder' }
        ],
        transaction
      });

      if (!grn) {
        await transaction.rollback();
        return res.status(404).json({ message: 'GRN not found' });
      }

      if (!grn.purchase_order_id) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: 'GRN is not associated with a Purchase Order' 
        });
      }

      if (!grn.vendor_id) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: 'Vendor is not associated to this GRN. Please ensure the Purchase Order has a vendor assigned.' 
        });
      }

      // Check if credit note already exists for this GRN
      const existingCreditNote = await CreditNote.findOne({
        where: { grn_id: req.params.grnId },
        transaction
      });

      if (existingCreditNote) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'Credit note already exists for this GRN',
          existingCreditNote
        });
      }

      const items = grn.items_received || [];
      const overageItems = items.filter(item => parseFloat(item.overage_quantity || 0) > 0);

      if (overageItems.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'No overage items found in this GRN',
          overageItems: []
        });
      }

      const subtotal = overageItems.reduce((sum, item) => {
        const qty = parseFloat(item.overage_quantity || 0);
        const rate = parseFloat(item.rate || 0);
        return sum + (qty * rate);
      }, 0);

      const taxAmount = (subtotal * parseFloat(tax_percentage || 0)) / 100;
      const totalCredit = subtotal + taxAmount;

      const creditNoteNumber = generateCreditNoteNumber();
      const creditNote = await CreditNote.create(
        {
          credit_note_number: creditNoteNumber,
          grn_id: req.params.grnId,
          purchase_order_id: grn.purchase_order_id,
          vendor_id: grn.vendor_id,
          credit_note_date: new Date(),
          credit_note_type: 'partial_credit',
          items: overageItems.map(item => ({
            material_id: item.material_id || null,
            material_name: item.material_name,
            overage_quantity: parseFloat(item.overage_quantity || 0),
            rate: parseFloat(item.rate || 0),
            unit: item.unit || item.uom,
            total_value: parseFloat(item.overage_quantity || 0) * parseFloat(item.rate || 0),
            uom: item.uom
          })),
          subtotal_credit_amount: subtotal,
          tax_percentage: parseFloat(tax_percentage || 0),
          tax_amount: taxAmount,
          total_credit_amount: totalCredit,
          status: 'draft',
          settlement_method,
          settlement_status: 'pending',
          created_by: req.user.id,
          remarks
        },
        { transaction }
      );

      await transaction.commit();

      // Send notification to finance/account department
      try {
        await NotificationService.sendToDepartment('finance', {
          type: 'credit_note_created',
          title: 'New Credit Note Generated',
          description: `Credit note ${creditNoteNumber} generated for ${grn.grn_number}`,
          message: `Credit note ${creditNoteNumber} of ₹${parseFloat(totalCredit.toFixed(2))} has been automatically generated for GRN ${grn.grn_number}. Status: Draft. Action required: Review and approve.`,
          entity_type: 'credit_note',
          entity_id: creditNote.id,
          related_data: {
            credit_note_number: creditNoteNumber,
            grn_number: grn.grn_number,
            total_amount: parseFloat(totalCredit.toFixed(2)),
            overage_items_count: overageItems.length
          },
          priority: 'high',
          action_url: `/finance/credit-notes/${creditNote.id}`
        });
      } catch (notifError) {
        console.error('Error sending notification to finance department:', notifError);
      }

      res.status(201).json({
        message: 'Credit note generated successfully',
        creditNote,
        overageItemsCount: overageItems.length,
        totalCredit: parseFloat(totalCredit.toFixed(2))
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error generating credit note:', error);
      res.status(500).json({
        message: 'Failed to generate credit note',
        error: error.message
      });
    }
  }
);

// Get all credit notes
router.get(
  '/',
  authenticateToken,
  checkDepartment(['admin', 'procurement', 'inventory', 'finance']),
  async (req, res) => {
    try {
      const { vendor_id, status, settlement_status, po_id, limit = 50, offset = 0 } = req.query;

      const where = {};
      if (vendor_id) where.vendor_id = vendor_id;
      if (status) where.status = status;
      if (settlement_status) where.settlement_status = settlement_status;
      if (po_id) where.purchase_order_id = po_id;

      const creditNotes = await CreditNote.findAndCountAll({
        where,
        include: [
          {
            model: GoodsReceiptNote,
            as: 'GRN',
            attributes: ['id', 'grn_number', 'received_date']
          },
          {
            model: PurchaseOrder,
            as: 'PurchaseOrder',
            attributes: ['id', 'po_number', 'po_date']
          },
          {
            model: Vendor,
            as: 'Vendor',
            attributes: ['id', 'vendor_name', 'contact_email']
          },
          {
            model: User,
            as: 'CreatedBy',
            attributes: ['id', 'username', 'email']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        total: creditNotes.count,
        count: creditNotes.rows.length,
        offset: parseInt(offset),
        limit: parseInt(limit),
        creditNotes: creditNotes.rows
      });
    } catch (error) {
      console.error('Error fetching credit notes:', error);
      res.status(500).json({
        message: 'Failed to fetch credit notes',
        error: error.message
      });
    }
  }
);

// Get credit note by ID
router.get(
  '/:id',
  authenticateToken,
  checkDepartment(['admin', 'procurement', 'inventory', 'finance']),
  async (req, res) => {
    try {
      const creditNote = await CreditNote.findByPk(req.params.id, {
        include: [
          {
            model: GoodsReceiptNote,
            as: 'GRN',
            attributes: ['id', 'grn_number', 'received_date', 'items_received']
          },
          {
            model: PurchaseOrder,
            as: 'PurchaseOrder',
            attributes: ['id', 'po_number', 'po_date', 'final_amount']
          },
          {
            model: Vendor,
            as: 'Vendor',
            attributes: ['id', 'vendor_name', 'contact_email', 'contact_number']
          },
          {
            model: User,
            as: 'CreatedBy',
            attributes: ['id', 'username', 'email']
          },
          {
            model: User,
            as: 'IssuedBy',
            attributes: ['id', 'username', 'email']
          },
          {
            model: User,
            as: 'ApprovedBy',
            attributes: ['id', 'username', 'email']
          }
        ]
      });

      if (!creditNote) {
        return res.status(404).json({ message: 'Credit note not found' });
      }

      res.json(creditNote);
    } catch (error) {
      console.error('Error fetching credit note:', error);
      res.status(500).json({
        message: 'Failed to fetch credit note',
        error: error.message
      });
    }
  }
);

// Update credit note
router.put(
  '/:id',
  authenticateToken,
  checkDepartment(['admin', 'procurement']),
  async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const {
        credit_note_type,
        tax_percentage,
        settlement_method,
        remarks
      } = req.body;

      const creditNote = await CreditNote.findByPk(req.params.id, { transaction });

      if (!creditNote) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Credit note not found' });
      }

      // Can only edit draft credit notes
      if (creditNote.status !== 'draft') {
        await transaction.rollback();
        return res.status(400).json({
          message: `Cannot edit credit note with status: ${creditNote.status}`
        });
      }

      // Recalculate totals if tax changes
      let subtotal = creditNote.subtotal_credit_amount;
      let taxAmount = subtotal * (parseFloat(tax_percentage || creditNote.tax_percentage) / 100);
      let totalCredit = subtotal + taxAmount;

      await creditNote.update(
        {
          credit_note_type: credit_note_type || creditNote.credit_note_type,
          tax_percentage: tax_percentage !== undefined ? parseFloat(tax_percentage) : creditNote.tax_percentage,
          tax_amount: taxAmount,
          total_credit_amount: totalCredit,
          settlement_method: settlement_method !== undefined ? settlement_method : creditNote.settlement_method,
          remarks: remarks || creditNote.remarks
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: 'Credit note updated successfully',
        creditNote
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating credit note:', error);
      res.status(500).json({
        message: 'Failed to update credit note',
        error: error.message
      });
    }
  }
);

// Issue credit note
router.post(
  '/:id/issue',
  authenticateToken,
  checkDepartment(['admin', 'procurement']),
  async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const creditNote = await CreditNote.findByPk(req.params.id, { transaction });

      if (!creditNote) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Credit note not found' });
      }

      if (creditNote.status !== 'draft') {
        await transaction.rollback();
        return res.status(400).json({
          message: `Credit note cannot be issued from status: ${creditNote.status}`
        });
      }

      await creditNote.update(
        {
          status: 'issued',
          issued_by: req.user.id,
          issued_date: new Date()
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: 'Credit note issued successfully',
        creditNote
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error issuing credit note:', error);
      res.status(500).json({
        message: 'Failed to issue credit note',
        error: error.message
      });
    }
  }
);

// Accept credit note (vendor accepts)
router.post(
  '/:id/accept',
  authenticateToken,
  async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { vendor_response } = req.body;

      const creditNote = await CreditNote.findByPk(req.params.id, { transaction });

      if (!creditNote) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Credit note not found' });
      }

      if (creditNote.status !== 'issued') {
        await transaction.rollback();
        return res.status(400).json({
          message: `Credit note cannot be accepted from status: ${creditNote.status}`
        });
      }

      await creditNote.update(
        {
          status: 'accepted',
          vendor_response: vendor_response || 'Accepted',
          vendor_response_date: new Date(),
          settlement_status: 'in_progress'
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: 'Credit note accepted',
        creditNote
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error accepting credit note:', error);
      res.status(500).json({
        message: 'Failed to accept credit note',
        error: error.message
      });
    }
  }
);

// Reject credit note
router.post(
  '/:id/reject',
  authenticateToken,
  async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { vendor_response } = req.body;

      const creditNote = await CreditNote.findByPk(req.params.id, { transaction });

      if (!creditNote) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Credit note not found' });
      }

      if (!['issued', 'accepted'].includes(creditNote.status)) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Credit note cannot be rejected from status: ${creditNote.status}`
        });
      }

      await creditNote.update(
        {
          status: 'rejected',
          vendor_response: vendor_response || 'Rejected',
          vendor_response_date: new Date(),
          settlement_status: 'failed'
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: 'Credit note rejected',
        creditNote
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error rejecting credit note:', error);
      res.status(500).json({
        message: 'Failed to reject credit note',
        error: error.message
      });
    }
  }
);

// Settle credit note
router.post(
  '/:id/settle',
  authenticateToken,
  checkDepartment(['admin', 'procurement', 'finance']),
  async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { settlement_method, settlement_notes } = req.body;

      const creditNote = await CreditNote.findByPk(req.params.id, { transaction });

      if (!creditNote) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Credit note not found' });
      }

      if (creditNote.status !== 'accepted') {
        await transaction.rollback();
        return res.status(400).json({
          message: `Credit note can only be settled from 'accepted' status, current: ${creditNote.status}`
        });
      }

      await creditNote.update(
        {
          status: 'settled',
          settlement_method: settlement_method || creditNote.settlement_method,
          settlement_status: 'completed',
          settlement_date: new Date(),
          settlement_notes: settlement_notes || creditNote.settlement_notes,
          approved_by: req.user.id,
          approved_date: new Date()
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: 'Credit note settled successfully',
        creditNote
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error settling credit note:', error);
      res.status(500).json({
        message: 'Failed to settle credit note',
        error: error.message
      });
    }
  }
);

// Cancel credit note
router.post(
  '/:id/cancel',
  authenticateToken,
  checkDepartment(['admin', 'procurement']),
  async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { remarks } = req.body;

      const creditNote = await CreditNote.findByPk(req.params.id, { transaction });

      if (!creditNote) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Credit note not found' });
      }

      if (['settled', 'rejected'].includes(creditNote.status)) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Cannot cancel credit note with status: ${creditNote.status}`
        });
      }

      await creditNote.update(
        {
          status: 'cancelled',
          remarks: (creditNote.remarks || '') + `\nCancelled: ${remarks || ''}`
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: 'Credit note cancelled',
        creditNote
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error cancelling credit note:', error);
      res.status(500).json({
        message: 'Failed to cancel credit note',
        error: error.message
      });
    }
  }
);

// Get credit note summary for a vendor
router.get(
  '/vendor/:vendorId/summary',
  authenticateToken,
  checkDepartment(['admin', 'procurement', 'finance']),
  async (req, res) => {
    try {
      const creditNotes = await CreditNote.findAll({
        where: { vendor_id: req.params.vendorId },
        attributes: ['id', 'credit_note_number', 'status', 'settlement_status', 'total_credit_amount', 'created_at']
      });

      const summary = {
        total_credit_notes: creditNotes.length,
        total_credit_amount: creditNotes.reduce((sum, cn) => sum + parseFloat(cn.total_credit_amount || 0), 0),
        by_status: {},
        by_settlement_status: {}
      };

      creditNotes.forEach(cn => {
        summary.by_status[cn.status] = (summary.by_status[cn.status] || 0) + 1;
        summary.by_settlement_status[cn.settlement_status] = (summary.by_settlement_status[cn.settlement_status] || 0) + 1;
      });

      res.json({
        vendor_id: req.params.vendorId,
        summary,
        creditNotes
      });
    } catch (error) {
      console.error('Error fetching vendor credit summary:', error);
      res.status(500).json({
        message: 'Failed to fetch vendor credit summary',
        error: error.message
      });
    }
  }
);

module.exports = router;
