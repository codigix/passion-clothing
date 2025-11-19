const { Invoice, PurchaseOrder, User, AuditTrail, Notification } = require('../config/database');
const notificationService = require('./notificationService');

class POApprovalWorkflowService {
  
  static async generateInvoiceFromPO(poId, approvedByUserId, reason = '') {
    try {
      console.log(`[Invoice Generation] Starting for PO ID: ${poId}`);
      const po = await PurchaseOrder.findByPk(poId, {
        include: [
          { model: User, as: 'approver', attributes: ['id', 'name', 'email', 'department'] }
        ]
      });

      if (!po) {
        throw new Error(`Purchase Order #${poId} not found`);
      }

      console.log(`[Invoice Generation] Found PO: ${po.po_number}, Amount: ${po.final_amount}`);

      const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      const invoiceData = {
        invoice_number: invoiceNumber,
        invoice_type: 'purchase',
        vendor_id: po.vendor_id,
        customer_id: po.customer_id,
        purchase_order_id: po.id,
        invoice_date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: po.items || [],
        subtotal: po.total_amount || 0,
        discount_percentage: po.discount_percentage || 0,
        discount_amount: po.discount_amount || 0,
        total_tax_amount: po.tax_amount || 0,
        total_amount: po.final_amount || 0,
        status: 'draft',
        payment_status: 'unpaid',
        payment_terms: po.payment_terms || 'Net 30',
        currency: 'INR',
        billing_address: po.delivery_address || '',
        shipping_address: po.delivery_address || '',
        internal_notes: `Generated from PO ${po.po_number} - Admin Approval Workflow`,
        reference_number: po.po_number,
        created_by: approvedByUserId,
        approved_by: approvedByUserId,
        approved_at: new Date()
      };

      const invoice = await Invoice.create(invoiceData);
      console.log(`[Invoice Generation] ✓ Invoice created: ${invoice.invoice_number}`);

      return invoice;
    } catch (error) {
      console.error('Error generating invoice from PO:', error.message);
      throw error;
    }
  }

  static async sendInvoiceToFinance(invoiceId, poNumber, vendorName, financeUserId = null) {
    try {
      console.log(`[Finance Notification] Starting for Invoice ID: ${invoiceId}, PO: ${poNumber}`);
      let recipientUserId = financeUserId;

      if (!recipientUserId) {
        console.log('[Finance Notification] Searching for finance users...');
        const financeUser = await User.findOne({
          where: { department: 'finance', status: 'active' },
          order: [['id', 'ASC']]
        });
        
        if (financeUser) {
          recipientUserId = financeUser.id;
          console.log(`[Finance Notification] Found finance user: ID ${recipientUserId}, Name: ${financeUser.name}`);
        } else {
          console.warn('[Finance Notification] No active finance users found in the system');
        }
      }

      if (!recipientUserId) {
        console.warn('[Finance Notification] Cannot send notification - no recipient found');
        return null;
      }

      const notificationPayload = {
        type: 'finance',
        title: `💰 New Invoice for PO ${poNumber}`,
        message: `Purchase Order ${poNumber} has been approved. Invoice is ready for payment processing. Vendor: ${vendorName}`,
        priority: 'high',
        recipient_user_id: recipientUserId,
        recipient_department: 'finance',
        related_entity_id: invoiceId,
        related_entity_type: 'invoice',
        action_url: `/finance/invoices/${invoiceId}`,
        trigger_event: 'invoice_generated_from_approved_po',
        metadata: {
          purchase_order_id: poNumber,
          vendor_name: vendorName,
          workflow_stage: 'payment_processing'
        }
      };

      console.log(`[Finance Notification] Sending notification to user ID: ${recipientUserId}`);
      const notification = await notificationService.sendToUser(recipientUserId, notificationPayload);
      console.log(`[Finance Notification] ✓ Notification sent: ${notification?.id}`);
      return notification;
    } catch (error) {
      console.error('[Finance Notification] Error:', error.message);
      throw error;
    }
  }

  static async createAuditTrail(entityType, entityId, action, statusBefore, statusAfter, performedByUserId, department, reason = '', metadata = {}) {
    try {
      const auditData = {
        entity_type: entityType,
        entity_id: entityId,
        action: action,
        status_before: statusBefore,
        status_after: statusAfter,
        performed_by: performedByUserId,
        department: department,
        reason: reason,
        metadata: metadata
      };

      const auditTrail = await AuditTrail.create(auditData);
      return auditTrail;
    } catch (error) {
      console.error('Error creating audit trail:', error);
      return null;
    }
  }

  static async executePOApprovalWorkflow(poId, approvedByUserId, approverName, approverDepartment, notes = '') {
    try {
      console.log(`\n[PO Workflow] ========== STARTING WORKFLOW FOR PO ID: ${poId} ==========`);
      const po = await PurchaseOrder.findByPk(poId, {
        include: [
          { model: User, as: 'vendor', attributes: ['name', 'email'] }
        ]
      });

      if (!po) {
        throw new Error(`Purchase Order #${poId} not found`);
      }

      console.log(`[PO Workflow] PO Details: ${po.po_number}, Status: ${po.status}, Amount: ${po.final_amount}`);

      const vendorName = po.vendor?.name || 'Unknown Vendor';
      const result = {
        success: false,
        po_number: po.po_number,
        invoice: null,
        notification: null,
        audit_trail: null,
        message: ''
      };

      try {
        console.log(`[PO Workflow] Step 1: Generating Invoice...`);
        const invoice = await this.generateInvoiceFromPO(poId, approvedByUserId, notes);
        result.invoice = invoice;
        console.log(`[PO Workflow] Step 1: ✓ Invoice generated`);

        console.log(`[PO Workflow] Step 2: Sending to Finance Department...`);
        const notification = await this.sendInvoiceToFinance(invoice.id, po.po_number, vendorName);
        result.notification = notification;
        console.log(`[PO Workflow] Step 2: ✓ Finance notification sent`);

        console.log(`[PO Workflow] Step 3: Creating Audit Trail...`);
        const auditTrail = await this.createAuditTrail(
          'purchase_order',
          poId,
          'approved',
          'pending_approval',
          'approved',
          approvedByUserId,
          approverDepartment,
          notes || 'PO approved and invoice sent to finance',
          {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            notification_id: notification?.id,
            vendor_name: vendorName
          }
        );
        result.audit_trail = auditTrail;
        console.log(`[PO Workflow] Step 3: ✓ Audit trail created`);

        result.success = true;
        result.message = `PO ${po.po_number} approved. Invoice INV-${invoice.invoice_number.split('-').pop()} generated and sent to Finance Department for payment processing.`;
        console.log(`[PO Workflow] ========== WORKFLOW COMPLETED SUCCESSFULLY ==========\n`);

        return result;
      } catch (workflowError) {
        console.error(`[PO Workflow] Error in approval workflow:`, workflowError.message);
        console.error(`[PO Workflow] Stack:`, workflowError.stack);
        
        await this.createAuditTrail(
          'purchase_order',
          poId,
          'approved',
          'pending_approval',
          'approved',
          approvedByUserId,
          approverDepartment,
          `PO approved with workflow error: ${workflowError.message}`,
          { error: workflowError.message }
        );

        result.success = false;
        result.message = `PO approved, but invoice generation failed: ${workflowError.message}`;
        console.log(`[PO Workflow] ========== WORKFLOW COMPLETED WITH ERRORS ==========\n`);
        return result;
      }
    } catch (error) {
      console.error('[PO Workflow] Fatal error executing workflow:', error.message);
      throw error;
    }
  }
}

module.exports = POApprovalWorkflowService;
