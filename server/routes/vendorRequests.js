const express = require("express");
const { Op } = require("sequelize");
const {
  VendorRequest,
  PurchaseOrder,
  GoodsReceiptNote,
  Vendor,
  User,
  Approval,
  Notification,
  sequelize,
} = require("../config/database");
const { authenticateToken, checkDepartment } = require("../middleware/auth");
const { sendReopenedPOToVendor, sendReopenedPOWhatsApp } = require("../utils/emailService");
const router = express.Router();

router.post(
  "/reopen-po-and-send-request",
  authenticateToken,
  checkDepartment(["procurement", "admin"]),
  async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { complaint_id } = req.body;

      if (!complaint_id) {
        await transaction.rollback();
        return res.status(400).json({ message: "Complaint ID is required" });
      }

      const complaint = await Approval.findByPk(complaint_id, {
        transaction,
      });

      if (!complaint) {
        await transaction.rollback();
        return res.status(404).json({ message: "Complaint not found" });
      }

      if (complaint.entity_type !== "purchase_order") {
        await transaction.rollback();
        return res.status(400).json({ message: "Invalid complaint type" });
      }

      const po = await PurchaseOrder.findByPk(complaint.entity_id, {
        include: [
          { model: Vendor, as: "vendor" },
          { model: User, as: "creator" },
        ],
        transaction,
      });

      if (!po) {
        await transaction.rollback();
        return res.status(404).json({ message: "Purchase order not found" });
      }

      const metadata = complaint.metadata || {};
      const requestType = metadata.complaint_type;

      if (!["shortage", "overage"].includes(requestType)) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ 
            message: "Invalid complaint type in metadata",
            debug: { 
              complaint_id,
              metadata,
              requestType 
            }
          });
      }

      let grnId = metadata.grn_id;
      
      if (!grnId) {
        const latestGrn = await GoodsReceiptNote.findOne({
          where: { purchase_order_id: po.id },
          order: [['created_at', 'DESC']],
          transaction,
        });
        
        if (latestGrn) {
          grnId = latestGrn.id;
          console.log(`GRN ID not in metadata, using latest GRN: ${grnId}`);
        } else {
          await transaction.rollback();
          return res.status(400).json({ 
            message: "GRN ID not found in complaint metadata and no GRN exists for this PO",
            debug: {
              complaint_id,
              po_id: po.id,
              metadata
            }
          });
        }
      }

      const grn = await GoodsReceiptNote.findByPk(grnId, { transaction });
      if (!grn) {
        await transaction.rollback();
        return res.status(404).json({ message: "GRN not found" });
      }

      const today = new Date();
      const requestDateStr = today
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");

      const lastRequest = await VendorRequest.findOne({
        where: {
          request_number: {
            [Op.like]: `VRQ-${requestDateStr}-%`,
          },
        },
        order: [["created_at", "DESC"]],
        transaction,
      });

      let requestSequence = 1;
      if (lastRequest) {
        const lastRequestSequence = parseInt(
          lastRequest.request_number.split("-")[2]
        );
        requestSequence = lastRequestSequence + 1;
      }

      const requestNumber = `VRQ-${requestDateStr}-${requestSequence
        .toString()
        .padStart(5, "0")}`;

      const itemsAffected = metadata.items_affected || [];
      const totalValue = parseFloat(
        requestType === "shortage"
          ? metadata.total_shortage_value || 0
          : metadata.total_overage_value || 0
      );

      let messageToVendor = "";
      if (requestType === "shortage") {
        messageToVendor = `Dear ${po.vendor.name},\n\nWe have identified a shortage in the materials received against Purchase Order ${po.po_number} (GRN: ${metadata.grn_number}).\n\nShortage Details:\n`;
        itemsAffected.forEach((item) => {
          messageToVendor += `- ${item.material_name}: Ordered ${item.ordered_qty}, Received ${item.received_qty}, Shortage ${item.shortage_qty}\n`;
        });
        messageToVendor += `\nTotal Shortage Value: ₹${totalValue.toFixed(
          2
        )}\n\nPlease arrange to send the shortage materials at the earliest. We are reopening this PO for the shortage items.\n\nRegards,\nProcurement Team`;
      } else {
        messageToVendor = `Dear ${po.vendor.name},\n\nWe have identified an overage in the materials received against Purchase Order ${po.po_number} (GRN: ${metadata.grn_number}).\n\nOverage Details:\n`;
        itemsAffected.forEach((item) => {
          messageToVendor += `- ${item.material_name}: Ordered ${item.ordered_qty}, Received ${item.received_qty}, Overage ${item.overage_qty}\n`;
        });
        messageToVendor += `\nTotal Overage Value: ₹${totalValue.toFixed(
          2
        )}\n\nPlease review and provide instructions on how to proceed with the excess materials.\n\nRegards,\nProcurement Team`;
      }

      const vendorRequest = await VendorRequest.create(
        {
          request_number: requestNumber,
          purchase_order_id: po.id,
          grn_id: grn.id,
          vendor_id: po.vendor_id,
          complaint_id: complaint.id,
          request_type: requestType,
          items: itemsAffected,
          total_value: totalValue,
          status: "sent",
          message_to_vendor: messageToVendor,
          sent_at: new Date(),
          created_by: req.user.id,
          sent_by: req.user.id,
        },
        { transaction }
      );

      await po.update(
        {
          status: "reopened",
        },
        { transaction }
      );

      await complaint.update(
        {
          status: "in_progress",
          metadata: {
            ...metadata,
            vendor_request_id: vendorRequest.id,
            vendor_request_number: requestNumber,
            po_reopened_at: new Date(),
            po_reopened_by: req.user.id,
          },
        },
        { transaction }
      );

      await Notification.create(
        {
          user_id: null,
          type: "vendor_request_sent",
          title: `🔔 Vendor Request Sent - ${requestType.toUpperCase()}`,
          message: `Vendor request ${requestNumber} sent to ${
            po.vendor.name
          } for ${requestType} in PO ${po.po_number}. Total value: ₹${totalValue.toFixed(2)}`,
          data: {
            vendor_request_id: vendorRequest.id,
            request_number: requestNumber,
            po_id: po.id,
            grn_id: grn.id,
            complaint_id: complaint.id,
            request_type: requestType,
          },
          read: false,
        },
        { transaction }
      );

      if (po.created_by) {
        await Notification.create(
          {
            user_id: po.created_by,
            type: "vendor_request_sent",
            title: `🔔 Vendor Request Sent for Your PO`,
            message: `A vendor request ${requestNumber} has been sent to ${
              po.vendor.name
            } for ${requestType} in your PO ${po.po_number}. The PO has been reopened.`,
            data: {
              vendor_request_id: vendorRequest.id,
              request_number: requestNumber,
              po_id: po.id,
              grn_id: grn.id,
              complaint_id: complaint.id,
              request_type: requestType,
            },
            read: false,
          },
          { transaction }
        );
      }

      await transaction.commit();

      const emailResult = { success: false };
      const whatsappResult = { success: false };

      try {
        if (po.vendor.email) {
          const emailRes = await sendReopenedPOToVendor(po, po.vendor, vendorRequest);
          emailResult.success = emailRes.success;
          emailResult.messageId = emailRes.messageId;
        }
      } catch (emailError) {
        console.error("Error sending email to vendor:", emailError);
        emailResult.error = emailError.message;
      }

      try {
        if (po.vendor.phone) {
          const whatsappRes = await sendReopenedPOWhatsApp(po, po.vendor, vendorRequest);
          whatsappResult.success = whatsappRes.success;
          whatsappResult.messageId = whatsappRes.messageId;
        }
      } catch (whatsappError) {
        console.error("Error sending WhatsApp to vendor:", whatsappError);
        whatsappResult.error = whatsappError.message;
      }

      res.status(201).json({
        message: "PO reopened and vendor request sent successfully",
        vendorRequest: {
          id: vendorRequest.id,
          request_number: requestNumber,
          status: vendorRequest.status,
          request_type: requestType,
          total_value: totalValue,
          message_to_vendor: messageToVendor,
        },
        po: {
          id: po.id,
          po_number: po.po_number,
          status: "reopened",
        },
        communication: {
          email: emailResult,
          whatsapp: whatsappResult,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error reopening PO and sending vendor request:", error);
      res.status(500).json({
        message: "Failed to reopen PO and send vendor request",
        error: error.message,
      });
    }
  }
);

router.get(
  "/vendor-requests",
  authenticateToken,
  checkDepartment(["procurement", "admin"]),
  async (req, res) => {
    try {
      const { status, request_type, vendor_id } = req.query;

      const where = {};
      if (status) where.status = status;
      if (request_type) where.request_type = request_type;
      if (vendor_id) where.vendor_id = vendor_id;

      const vendorRequests = await VendorRequest.findAll({
        where,
        include: [
          {
            model: PurchaseOrder,
            as: "purchaseOrder",
            include: [{ model: Vendor, as: "vendor" }],
          },
          {
            model: GoodsReceiptNote,
            as: "grn",
          },
          {
            model: GoodsReceiptNote,
            as: "fulfillmentGrn",
          },
          {
            model: Approval,
            as: "complaint",
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "sender",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      res.json(vendorRequests);
    } catch (error) {
      console.error("Error fetching vendor requests:", error);
      res.status(500).json({
        message: "Failed to fetch vendor requests",
        error: error.message,
      });
    }
  }
);

router.get(
  "/vendor-requests/:id",
  authenticateToken,
  checkDepartment(["procurement", "admin"]),
  async (req, res) => {
    try {
      const vendorRequest = await VendorRequest.findByPk(req.params.id, {
        include: [
          {
            model: PurchaseOrder,
            as: "purchaseOrder",
            include: [{ model: Vendor, as: "vendor" }],
          },
          {
            model: GoodsReceiptNote,
            as: "grn",
          },
          {
            model: GoodsReceiptNote,
            as: "fulfillmentGrn",
          },
          {
            model: Approval,
            as: "complaint",
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "sender",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      if (!vendorRequest) {
        return res.status(404).json({ message: "Vendor request not found" });
      }

      res.json(vendorRequest);
    } catch (error) {
      console.error("Error fetching vendor request:", error);
      res.status(500).json({
        message: "Failed to fetch vendor request",
        error: error.message,
      });
    }
  }
);

router.patch(
  "/vendor-requests/:id/acknowledge",
  authenticateToken,
  checkDepartment(["procurement", "admin"]),
  async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { vendor_response, expected_fulfillment_date } = req.body;

      const vendorRequest = await VendorRequest.findByPk(req.params.id, {
        transaction,
      });

      if (!vendorRequest) {
        await transaction.rollback();
        return res.status(404).json({ message: "Vendor request not found" });
      }

      await vendorRequest.update(
        {
          status: "acknowledged",
          vendor_response,
          expected_fulfillment_date,
          acknowledged_at: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: "Vendor request acknowledged successfully",
        vendorRequest,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error acknowledging vendor request:", error);
      res.status(500).json({
        message: "Failed to acknowledge vendor request",
        error: error.message,
      });
    }
  }
);

module.exports = router;
