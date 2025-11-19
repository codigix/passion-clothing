const express = require('express');
const { PurchaseOrder, Vendor, Customer, User } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const PDFGenerationService = require('../utils/pdfGenerationService');
const EmailService = require('../utils/emailService');
const fs = require('fs');
const path = require('path');
const NotificationService = require('../utils/notificationService');

const router = express.Router();

// ============================================
// PDF GENERATION & EMAIL ENDPOINTS
// ============================================

/**
 * Generate PO and Invoice PDFs for a Purchase Order
 * POST /api/procurement/pos/:id/generate-pdfs
 */
router.post(
  '/pos/:id/generate-pdfs',
  authenticateToken,
  checkDepartment(['procurement', 'admin']),
  async (req, res) => {
    const transaction = await require('../config/database').sequelize.transaction();

    try {
      const { id } = req.params;

      // Get PO with vendor and customer data
      const purchaseOrder = await PurchaseOrder.findByPk(id, {
        include: [
          { model: Vendor, as: 'vendor' },
          { model: Customer, as: 'customer' }
        ],
        transaction
      });

      if (!purchaseOrder) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      // Update status to generating
      await purchaseOrder.update(
        { pdf_generation_status: 'generating' },
        { transaction }
      );

      // Generate PO PDF
      let poPdfResult;
      let invoicePdfResult;

      try {
        poPdfResult = await PDFGenerationService.generatePOPDF(
          purchaseOrder,
          purchaseOrder.vendor,
          purchaseOrder.customer
        );

        // Generate Invoice PDF
        invoicePdfResult = await PDFGenerationService.generateInvoicePDF(
          purchaseOrder,
          purchaseOrder.vendor
        );

        // Update purchase order with PDF paths
        await purchaseOrder.update(
          {
            po_pdf_path: poPdfResult.filePath,
            invoice_pdf_path: invoicePdfResult.filePath,
            po_pdf_generated_at: new Date(),
            invoice_pdf_generated_at: new Date(),
            pdf_generation_status: 'completed',
            pdf_error_message: null
          },
          { transaction }
        );

        await transaction.commit();

        res.json({
          success: true,
          message: 'PDFs generated successfully',
          data: {
            po_number: purchaseOrder.po_number,
            po_pdf: poPdfResult.url,
            invoice_pdf: invoicePdfResult.url,
            generated_at: new Date().toISOString()
          }
        });
      } catch (pdfError) {
        await purchaseOrder.update(
          {
            pdf_generation_status: 'failed',
            pdf_error_message: pdfError.message
          },
          { transaction }
        );
        await transaction.commit();

        return res.status(500).json({
          success: false,
          message: 'Failed to generate PDFs',
          error: pdfError.message
        });
      }
    } catch (error) {
      await transaction.rollback();
      console.error('PDF generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process PDF generation',
        error: error.message
      });
    }
  }
);

/**
 * Send PO and Invoice PDFs to Accounting Department
 * POST /api/procurement/pos/:id/send-to-accounting
 */
router.post(
  '/pos/:id/send-to-accounting',
  authenticateToken,
  checkDepartment(['procurement', 'admin']),
  async (req, res) => {
    const transaction = await require('../config/database').sequelize.transaction();

    try {
      const { id } = req.params;
      const { accounting_email } = req.body;

      // Get PO with vendor data
      const purchaseOrder = await PurchaseOrder.findByPk(id, {
        include: [{ model: Vendor, as: 'vendor' }],
        transaction
      });

      if (!purchaseOrder) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      // Check if PDFs are generated
      if (!purchaseOrder.po_pdf_path || !purchaseOrder.invoice_pdf_path) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'PDFs not yet generated. Please generate PDFs first.'
        });
      }

      // Send email to accounting department
      const emailResult = await EmailService.sendPOAndInvoiceToAccounting({
        poPdfPath: purchaseOrder.po_pdf_path,
        invoicePdfPath: purchaseOrder.invoice_pdf_path,
        purchaseOrder,
        vendor: purchaseOrder.vendor,
        recipientEmail: accounting_email || process.env.ACCOUNTING_DEPT_EMAIL,
        senderName: req.user.name
      });

      if (!emailResult.success) {
        await transaction.rollback();
        return res.status(500).json({
          success: false,
          message: 'Failed to send email to accounting',
          error: emailResult.message
        });
      }

      // Update purchase order with accounting notification info
      await purchaseOrder.update(
        {
          accounting_notification_sent: true,
          accounting_notification_sent_at: new Date(),
          accounting_sent_by: req.user.id
        },
        { transaction }
      );

      // Send notification to accounting department
      await NotificationService.sendToDepartment('accounting', {
        type: 'procurement',
        title: `Purchase Order & Invoice Received: ${purchaseOrder.po_number}`,
        message: `PO and Invoice for project "${purchaseOrder.project_name}" from vendor ${purchaseOrder.vendor.name} ready for approval`,
        priority: purchaseOrder.priority,
        related_entity_id: purchaseOrder.id,
        related_entity_type: 'purchase_order',
        metadata: {
          po_number: purchaseOrder.po_number,
          vendor_name: purchaseOrder.vendor.name,
          final_amount: purchaseOrder.final_amount,
          project_name: purchaseOrder.project_name
        }
      });

      await transaction.commit();

      res.json({
        success: true,
        message: `PO and Invoice sent to ${emailResult.email}`,
        data: {
          po_number: purchaseOrder.po_number,
          email_sent: emailResult.email,
          sent_at: purchaseOrder.accounting_notification_sent_at
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error sending to accounting:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send to accounting department',
        error: error.message
      });
    }
  }
);

/**
 * Download PO PDF
 * GET /api/procurement/pos/:id/download-pdf
 */
router.get(
  '/pos/:id/download-pdf',
  authenticateToken,
  checkDepartment(['procurement', 'admin', 'accounting']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const purchaseOrder = await PurchaseOrder.findByPk(id);
      if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      if (!purchaseOrder.po_pdf_path || !fs.existsSync(purchaseOrder.po_pdf_path)) {
        return res.status(404).json({ message: 'PDF not available for download' });
      }

      const filename = `PO_${purchaseOrder.po_number}.pdf`;
      res.download(purchaseOrder.po_pdf_path, filename, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).json({ message: 'Failed to download PDF' });
        }
      });
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ message: 'Failed to download PDF', error: error.message });
    }
  }
);

/**
 * Download Invoice PDF
 * GET /api/procurement/pos/:id/download-invoice
 */
router.get(
  '/pos/:id/download-invoice',
  authenticateToken,
  checkDepartment(['procurement', 'admin', 'accounting']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const purchaseOrder = await PurchaseOrder.findByPk(id);
      if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      if (!purchaseOrder.invoice_pdf_path || !fs.existsSync(purchaseOrder.invoice_pdf_path)) {
        return res.status(404).json({ message: 'Invoice PDF not available' });
      }

      const filename = `INVOICE_${purchaseOrder.po_number}.pdf`;
      res.download(purchaseOrder.invoice_pdf_path, filename, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).json({ message: 'Failed to download invoice' });
        }
      });
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ message: 'Failed to download invoice', error: error.message });
    }
  }
);

/**
 * Get PDF Generation Status
 * GET /api/procurement/pos/:id/pdf-status
 */
router.get(
  '/pos/:id/pdf-status',
  authenticateToken,
  checkDepartment(['procurement', 'admin', 'accounting']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const purchaseOrder = await PurchaseOrder.findByPk(id, {
        attributes: [
          'po_number',
          'pdf_generation_status',
          'po_pdf_generated_at',
          'invoice_pdf_generated_at',
          'accounting_notification_sent',
          'accounting_notification_sent_at',
          'pdf_error_message'
        ]
      });

      if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      res.json({
        po_number: purchaseOrder.po_number,
        pdf_status: purchaseOrder.pdf_generation_status,
        po_generated_at: purchaseOrder.po_pdf_generated_at,
        invoice_generated_at: purchaseOrder.invoice_pdf_generated_at,
        accounting_notified: purchaseOrder.accounting_notification_sent,
        accounting_notified_at: purchaseOrder.accounting_notification_sent_at,
        error_message: purchaseOrder.pdf_error_message
      });
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ message: 'Failed to check PDF status', error: error.message });
    }
  }
);

/**
 * Regenerate PDFs (if needed)
 * POST /api/procurement/pos/:id/regenerate-pdfs
 */
router.post(
  '/pos/:id/regenerate-pdfs',
  authenticateToken,
  checkDepartment(['procurement', 'admin']),
  async (req, res) => {
    const transaction = await require('../config/database').sequelize.transaction();

    try {
      const { id } = req.params;

      const purchaseOrder = await PurchaseOrder.findByPk(id, {
        include: [
          { model: Vendor, as: 'vendor' },
          { model: Customer, as: 'customer' }
        ],
        transaction
      });

      if (!purchaseOrder) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      // Delete old PDFs if they exist
      if (purchaseOrder.po_pdf_path && fs.existsSync(purchaseOrder.po_pdf_path)) {
        fs.unlinkSync(purchaseOrder.po_pdf_path);
      }
      if (purchaseOrder.invoice_pdf_path && fs.existsSync(purchaseOrder.invoice_pdf_path)) {
        fs.unlinkSync(purchaseOrder.invoice_pdf_path);
      }

      // Generate new PDFs
      const poPdfResult = await PDFGenerationService.generatePOPDF(
        purchaseOrder,
        purchaseOrder.vendor,
        purchaseOrder.customer
      );

      const invoicePdfResult = await PDFGenerationService.generateInvoicePDF(
        purchaseOrder,
        purchaseOrder.vendor
      );

      // Update with new PDF paths
      await purchaseOrder.update(
        {
          po_pdf_path: poPdfResult.filePath,
          invoice_pdf_path: invoicePdfResult.filePath,
          po_pdf_generated_at: new Date(),
          invoice_pdf_generated_at: new Date(),
          pdf_generation_status: 'completed',
          pdf_error_message: null
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        success: true,
        message: 'PDFs regenerated successfully',
        data: {
          po_number: purchaseOrder.po_number,
          regenerated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Regenerate PDFs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to regenerate PDFs',
        error: error.message
      });
    }
  }
);

module.exports = router;