const express = require("express");
const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  ClientRequirement,
  Quotation,
  sequelize
} = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Multer setup for handling 4 types of uploads
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueSuffix + "-" + sanitizedName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const uploadFields = upload.any();

// Helper to generate requirement number (CR-001, CR-002, etc.)
const generateRequirementNumber = async (transaction) => {
  const lastReq = await ClientRequirement.findOne({
    order: [["id", "DESC"]],
    transaction
  });

  let seq = 1;
  if (lastReq && lastReq.requirement_number) {
    const parts = lastReq.requirement_number.split("-");
    const lastSeq = parseInt(parts[1], 10);
    if (!isNaN(lastSeq)) {
      seq = lastSeq + 1;
    }
  }

  return `CR-${seq.toString().padStart(3, "0")}`;
};

// Helper to generate quotation number (QT-YYYYMMDD-XXXX)
const generateQuotationNumber = async (transaction) => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");

  const lastQuot = await Quotation.findOne({
    where: {
      quotation_number: {
        [Op.like]: `QT-${dateStr}-%`
      }
    },
    order: [["id", "DESC"]],
    transaction
  });

  let seq = 1;
  if (lastQuot) {
    const parts = lastQuot.quotation_number.split("-");
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) {
      seq = lastSeq + 1;
    }
  }

  return `QT-${dateStr}-${seq.toString().padStart(4, "0")}`;
};

// GET all client requirements with search, filters and statistics
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { search, status, category } = req.query;

    // Build where conditions
    const where = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.product_category = category;
    }

    if (search) {
      where[Op.or] = [
        { requirement_number: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } },
        { product_name: { [Op.like]: `%${search}%` } },
        { project_name: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get list of requirements
    const requirements = await ClientRequirement.findAll({
      where,
      include: [
        {
          model: Quotation,
          as: "quotation"
        }
      ],
      order: [["created_at", "DESC"]]
    });

    // Calculate statistics (for dashboard cards)
    const counts = await ClientRequirement.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"]
      ],
      group: ["status"]
    });

    const stats = {
      total: 0,
      Draft: 0,
      Review: 0,
      Approved: 0,
      "Quotation Generated": 0,
      "Converted to SO": 0
    };

    counts.forEach((item) => {
      const statusVal = item.getDataValue("status");
      const countVal = parseInt(item.getDataValue("count"), 10);
      stats[statusVal] = countVal;
      stats.total += countVal;
    });

    res.json({
      requirements,
      stats
    });
  } catch (error) {
    console.error("Error fetching client requirements:", error);
    res.status(500).json({ message: "Failed to load client requirements" });
  }
});

// GET single client requirement with quotation details
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const requirement = await ClientRequirement.findByPk(req.params.id, {
      include: [
        {
          model: Quotation,
          as: "quotation"
        }
      ]
    });

    if (!requirement) {
      return res.status(404).json({ message: "Client requirement not found" });
    }

    res.json(requirement);
  } catch (error) {
    console.error("Error fetching client requirement details:", error);
    res.status(500).json({ message: "Failed to load client requirement details" });
  }
});

// POST create client requirement
router.post("/", authenticateToken, uploadFields, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const reqNo = await generateRequirementNumber(transaction);

    // Parse products array
    let products = [];
    if (req.body.products) {
      try {
        products = JSON.parse(req.body.products);
      } catch (err) {
        console.error("Failed to parse products:", err);
      }
    }

    // Extract uploads and map to products dynamically
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        const match = file.fieldname.match(/^product_(\d+)_(.+)$/);
        if (match) {
          const productIndex = parseInt(match[1], 10);
          const fieldName = match[2];
          if (products[productIndex]) {
            if (!products[productIndex].attachments) {
              products[productIndex].attachments = {};
            }
            products[productIndex].attachments[fieldName] = `/uploads/${file.filename}`;
          }
        }
      });
    }

    // Legacy fallback details from first product if available
    const firstProduct = products[0] || {};
    const legacyAttachments = firstProduct.attachments || {};

    const requirement = await ClientRequirement.create({
      requirement_number: reqNo,
      customer_name: req.body.customer_name,
      contact_person: req.body.contact_person,
      mobile_number: req.body.mobile_number,
      email: req.body.email,
      customer_address: req.body.customer_address,
      customer_gstin: req.body.customer_gstin,
      customer_location: req.body.customer_location,
      project_name: req.body.project_name,
      enquiry_source: req.body.enquiry_source,
      priority: req.body.priority || 'Normal',
      required_date: req.body.required_date ? new Date(req.body.required_date) : null,
      product_category: firstProduct.product_category || req.body.product_category,
      product_name: firstProduct.product_name || req.body.product_name || "Multiple Products",
      description: req.body.description,
      quantity: parseInt(firstProduct.quantity || req.body.quantity, 10) || 0,
      unit: firstProduct.unit || req.body.unit || "Nos",
      material: firstProduct.clothing_data?.fabric_type || req.body.material,
      dimensions: req.body.dimensions,
      weight: req.body.weight,
      color: (firstProduct.clothing_data?.colors || []).join(", ") || req.body.color,
      finish: req.body.finish,
      tolerance: req.body.tolerance,
      delivery_address: req.body.delivery_address,
      expected_delivery_date: req.body.expected_delivery_date ? new Date(req.body.expected_delivery_date) : null,
      currency: req.body.currency || 'INR ₹',
      payment_terms: req.body.payment_terms,
      target_price: req.body.target_price,
      payment_mode: req.body.payment_mode,
      sampling_required: req.body.sampling_required,
      sample_qty: req.body.sample_qty,
      internal_notes: req.body.internal_notes,
      customer_special_instructions: req.body.customer_special_instructions,
      requested_by: req.body.requested_by,
      approved_by: req.body.approved_by,
      priority_flag: req.body.priority_flag || 'Normal',
      attachments: legacyAttachments,
      products: products,
      dynamic_fields: req.body.dynamic_fields ? (() => { try { return JSON.parse(req.body.dynamic_fields); } catch (e) { return {}; } })() : {},
      mfg_requirements: req.body.mfg_requirements ? (() => { try { return JSON.parse(req.body.mfg_requirements); } catch (e) { return {}; } })() : {},
      variant_rows: req.body.variant_rows ? (() => { try { return JSON.parse(req.body.variant_rows); } catch (e) { return []; } })() : [],
      status: req.body.status || "Draft"
    }, { transaction });

    await transaction.commit();
    res.status(201).json(requirement);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating client requirement:", error);
    res.status(500).json({ message: "Failed to create client requirement" });
  }
});

// PUT update client requirement
router.put("/:id", authenticateToken, uploadFields, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const requirement = await ClientRequirement.findByPk(req.params.id, { transaction });
    if (!requirement) {
      await transaction.rollback();
      return res.status(404).json({ message: "Client requirement not found" });
    }

    // Parse products array
    let products = [];
    if (req.body.products) {
      try {
        products = JSON.parse(req.body.products);
      } catch (err) {
        console.error("Failed to parse products:", err);
      }
    }

    // Extract uploads and map to products dynamically
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        const match = file.fieldname.match(/^product_(\d+)_(.+)$/);
        if (match) {
          const productIndex = parseInt(match[1], 10);
          const fieldName = match[2];
          if (products[productIndex]) {
            if (!products[productIndex].attachments) {
              products[productIndex].attachments = {};
            }
            products[productIndex].attachments[fieldName] = `/uploads/${file.filename}`;
          }
        }
      });
    }

    // Legacy fallback details from first product if available
    const firstProduct = products[0] || {};
    const legacyAttachments = firstProduct.attachments || {};

    await requirement.update({
      customer_name: req.body.customer_name,
      contact_person: req.body.contact_person,
      mobile_number: req.body.mobile_number,
      email: req.body.email,
      customer_address: req.body.customer_address,
      customer_gstin: req.body.customer_gstin,
      customer_location: req.body.customer_location,
      project_name: req.body.project_name,
      enquiry_source: req.body.enquiry_source,
      priority: req.body.priority || requirement.priority,
      required_date: req.body.required_date ? new Date(req.body.required_date) : null,
      product_category: firstProduct.product_category || req.body.product_category,
      product_name: firstProduct.product_name || req.body.product_name || "Multiple Products",
      description: req.body.description,
      quantity: parseInt(firstProduct.quantity || req.body.quantity, 10) || 0,
      unit: firstProduct.unit || req.body.unit || "Nos",
      material: firstProduct.clothing_data?.fabric_type || req.body.material,
      dimensions: req.body.dimensions,
      weight: req.body.weight,
      color: (firstProduct.clothing_data?.colors || []).join(", ") || req.body.color,
      finish: req.body.finish,
      tolerance: req.body.tolerance,
      delivery_address: req.body.delivery_address,
      expected_delivery_date: req.body.expected_delivery_date ? new Date(req.body.expected_delivery_date) : null,
      currency: req.body.currency || requirement.currency,
      payment_terms: req.body.payment_terms,
      target_price: req.body.target_price,
      payment_mode: req.body.payment_mode,
      sampling_required: req.body.sampling_required,
      sample_qty: req.body.sample_qty,
      internal_notes: req.body.internal_notes,
      customer_special_instructions: req.body.customer_special_instructions,
      requested_by: req.body.requested_by,
      approved_by: req.body.approved_by,
      priority_flag: req.body.priority_flag || requirement.priority_flag,
      attachments: legacyAttachments,
      products: products,
      dynamic_fields: req.body.dynamic_fields ? (() => { try { return JSON.parse(req.body.dynamic_fields); } catch (e) { return {}; } })() : requirement.dynamic_fields,
      mfg_requirements: req.body.mfg_requirements ? (() => { try { return JSON.parse(req.body.mfg_requirements); } catch (e) { return {}; } })() : requirement.mfg_requirements,
      variant_rows: req.body.variant_rows ? (() => { try { return JSON.parse(req.body.variant_rows); } catch (e) { return []; } })() : requirement.variant_rows,
      status: req.body.status || requirement.status
    }, { transaction });

    await transaction.commit();
    res.json(requirement);
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating client requirement:", error);
    res.status(500).json({ message: "Failed to update client requirement" });
  }
});

// PATCH status update
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const requirement = await ClientRequirement.findByPk(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: "Client requirement not found" });
    }

    requirement.status = status;
    await requirement.save();

    res.json(requirement);
  } catch (error) {
    console.error("Error updating client requirement status:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// POST generate quotation from client requirement
router.post("/:id/generate-quotation", authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const requirement = await ClientRequirement.findByPk(req.params.id, { transaction });
    if (!requirement) {
      await transaction.rollback();
      return res.status(404).json({ message: "Client requirement not found" });
    }

    const unitPrice = parseFloat(req.body.unit_price) || 0;
    const discountPercent = parseFloat(req.body.discount_percentage) || 0;
    const taxPercent = parseFloat(req.body.tax_percentage) || 18;
    const remarks = req.body.remarks;
    const validUntil = req.body.valid_until ? new Date(req.body.valid_until) : null;

    // Calculations
    const qty = requirement.quantity;
    const totalAmount = qty * unitPrice;
    const discountAmount = (totalAmount * discountPercent) / 100;
    const taxableAmount = totalAmount - discountAmount;
    const taxAmount = (taxableAmount * taxPercent) / 100;
    const finalAmount = taxableAmount + taxAmount;

    const quotNo = await generateQuotationNumber(transaction);

    const quotation = await Quotation.create({
      quotation_number: quotNo,
      client_requirement_id: requirement.id,
      customer_name: requirement.customer_name,
      product_name: requirement.product_name,
      quantity: qty,
      unit_price: unitPrice,
      total_amount: totalAmount,
      discount_percentage: discountPercent,
      discount_amount: discountAmount,
      tax_percentage: taxPercent,
      tax_amount: taxAmount,
      final_amount: finalAmount,
      valid_until: validUntil,
      status: "Draft",
      remarks
    }, { transaction });

    // Update requirement status
    requirement.status = "Quotation Generated";
    await requirement.save({ transaction });

    await transaction.commit();
    res.status(201).json({ quotation, requirement });
  } catch (error) {
    await transaction.rollback();
    console.error("Error generating quotation:", error);
    res.status(500).json({ message: "Failed to generate quotation" });
  }
});

// GET quotation by requirement ID
router.get("/quotations/:id", authenticateToken, async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      where: { client_requirement_id: req.params.id }
    });

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found for this requirement" });
    }

    res.json(quotation);
  } catch (error) {
    console.error("Error fetching quotation:", error);
    res.status(500).json({ message: "Failed to load quotation" });
  }
});

// Helper to upsert Quotation from Approved RFQ version
const upsertQuotationFromApprovedRFQ = async (requirement, rfqRecord, transaction) => {
  const { Quotation } = require("../config/database");

  // Sum up items
  const rfqItems = rfqRecord.rfqItems || [];
  let totalAmount = 0;
  let totalDiscountAmount = 0;
  let totalTaxAmount = 0;
  let totalFinalAmount = 0;
  let totalQty = 0;

  rfqItems.forEach(item => {
    const qty = parseInt(item.quantity, 10) || 0;
    const rate = parseFloat(item.unit_cost) || 0;
    const itemTotal = qty * rate;
    const discountPct = parseFloat(item.discount_percentage) || 0;
    const itemDiscount = (itemTotal * discountPct) / 100;
    const taxable = itemTotal - itemDiscount;
    const gstPct = parseFloat(item.gst_percentage) || 18;
    const itemTax = (taxable * gstPct) / 100;
    const itemFinal = taxable + itemTax;

    totalQty += qty;
    totalAmount += itemTotal;
    totalDiscountAmount += itemDiscount;
    totalTaxAmount += itemTax;
    totalFinalAmount += itemFinal;
  });

  // Check if a quotation already exists for this client requirement
  let quotation = await Quotation.findOne({
    where: { client_requirement_id: requirement.id },
    transaction
  });

  const firstItem = rfqItems[0] || {};
  const discountPct = parseFloat(firstItem.discount_percentage) || 0;
  const taxPct = parseFloat(firstItem.gst_percentage) || 18;
  const unitPrice = parseFloat(firstItem.unit_cost) || 0;

  if (quotation) {
    // Update existing quotation
    quotation.rfq_no = rfqRecord.rfq_number;
    quotation.rfq_version = rfqRecord.version;
    quotation.product_name = requirement.product_name || firstItem.product_name || "Custom Product";
    quotation.quantity = totalQty || requirement.quantity;
    quotation.unit_price = unitPrice;
    quotation.total_amount = totalAmount;
    quotation.discount_percentage = discountPct;
    quotation.discount_amount = totalDiscountAmount;
    quotation.tax_percentage = taxPct;
    quotation.tax_amount = totalTaxAmount;
    quotation.final_amount = totalFinalAmount;
    quotation.status = "Pending"; // New quotation starts as Pending
    await quotation.save({ transaction });
  } else {
    // Create new quotation
    const quotNo = await generateQuotationNumber(transaction);
    quotation = await Quotation.create({
      quotation_number: quotNo,
      client_requirement_id: requirement.id,
      customer_name: requirement.customer_name,
      product_name: requirement.product_name || firstItem.product_name || "Custom Product",
      quantity: totalQty || requirement.quantity,
      unit_price: unitPrice,
      total_amount: totalAmount,
      discount_percentage: discountPct,
      discount_amount: totalDiscountAmount,
      tax_percentage: taxPct,
      tax_amount: totalTaxAmount,
      final_amount: totalFinalAmount,
      status: "Pending", // New quotation starts as Pending
      rfq_no: rfqRecord.rfq_number,
      rfq_version: rfqRecord.version,
      quotation_type: "Sent"
    }, { transaction });
  }

  // Update client requirement status to "Quotation Generated"
  requirement.status = "Quotation Generated";
  await requirement.save({ transaction });

  return quotation;
};

// POST send RFQ
router.post("/:id/rfq", authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const requirement = await ClientRequirement.findByPk(req.params.id, { transaction });
    if (!requirement) {
      await transaction.rollback();
      return res.status(404).json({ message: "Client requirement not found" });
    }

    const { rfqItems, sendEmail, sendWhatsApp } = req.body;

    // Determine the next version
    const history = requirement.rfq_history ? [...requirement.rfq_history] : [];
    const nextVersionSeq = history.length + 1;
    const version = `V${nextVersionSeq}`;

    // Generate RFQ number: RFQ-XXXX-0001
    const reqSeq = requirement.requirement_number.split("-")[1] || "0000";
    const rfqNumber = `RFQ-${reqSeq}-${nextVersionSeq.toString().padStart(4, "0")}`;

    // Generate RFQ PDF with version
    const PDFGenerationService = require("../utils/pdfGenerationService");
    const pdfResult = await PDFGenerationService.generateRFQPDF(requirement, rfqItems, version);

    // Mark any previous Sent/Approved versions as Revised
    history.forEach(record => {
      if (record.status === "Sent" || record.status === "Approved") {
        record.status = "Revised";
      }
    });

    // Set status to "Sent" initially
    const newRfqRecord = {
      version: version,
      rfq_number: rfqNumber,
      date: new Date().toISOString(),
      rfqItems: rfqItems,
      status: "Sent",
      pdf_path: pdfResult.success ? `/uploads/pdfs/${pdfResult.filename}` : null
    };

    history.push(newRfqRecord);
    requirement.rfq_history = history;
    requirement.products = rfqItems;

    // Mark JSON fields as changed for Sequelize persistence
    requirement.changed('rfq_history', true);
    requirement.changed('products', true);

    // Update requirement status to "Review"
    requirement.status = "Review";

    await requirement.save({ transaction });

    await transaction.commit();

    const emailService = require("../utils/emailService");

    let emailSent = false;
    let whatsAppSent = false;

    if (sendEmail) {
      try {
        await emailService.sendRFQToCustomer(requirement, rfqItems, version);
        emailSent = true;
      } catch (err) {
        console.error("Failed to send RFQ email:", err);
      }
    }

    if (sendWhatsApp) {
      try {
        await emailService.sendRFQWhatsApp(requirement, rfqItems);
        whatsAppSent = true;
      } catch (err) {
        console.error("Failed to send RFQ WhatsApp:", err);
      }
    }

    res.json({
      success: true,
      message: `RFQ ${version} generated and sent successfully to the customer.`,
      emailSent,
      whatsAppSent,
      requirement
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error processing RFQ:", error);
    res.status(500).json({ message: "Failed to process RFQ" });
  }
});

// PATCH update RFQ version status (Approve RFQ)
router.patch("/:id/rfq/:version/status", authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const requirement = await ClientRequirement.findByPk(req.params.id, { transaction });
    if (!requirement) {
      await transaction.rollback();
      return res.status(404).json({ message: "Client requirement not found" });
    }

    const { version } = req.params;
    const { status } = req.body; // e.g. "Approved"

    const history = requirement.rfq_history ? [...requirement.rfq_history] : [];
    const targetIdx = history.findIndex(r => r.version === version);
    if (targetIdx === -1) {
      await transaction.rollback();
      return res.status(404).json({ message: `RFQ version ${version} not found` });
    }

    // Set other versions to "Revised" if this one is approved, or keep them
    history.forEach((record, idx) => {
      if (idx === targetIdx) {
        record.status = status;
      } else if (status === 'Approved' && (record.status === 'Sent' || record.status === 'Approved')) {
        record.status = 'Revised';
      }
    });

    requirement.rfq_history = history;

    // If approved, promote the approved RFQ items to requirement.products
    if (status === 'Approved') {
      const approvedRecord = history[targetIdx];
      
      // Merge approved RFQ items with existing product specifications to prevent losing fields like clothing_data
      const existingProducts = requirement.products || [];
      requirement.products = approvedRecord.rfqItems.map((item, index) => {
        const existing = existingProducts[index] || {};
        return {
          ...existing,
          ...item,
          clothing_data: {
            ...(existing.clothing_data || {}),
            ...(item.clothing_data || {})
          },
          category_details: {
            ...(existing.category_details || {}),
            ...(item.category_details || {})
          }
        };
      });

      // Update active main columns for legacy support:
      const firstProduct = approvedRecord.rfqItems[0] || {};
      requirement.quantity = approvedRecord.rfqItems.reduce((s, p) => s + (parseInt(p.quantity, 10) || 0), 0);

      if (!requirement.attachments) {
        requirement.attachments = {};
      }
      requirement.attachments.unit_cost = firstProduct.unit_cost;
      requirement.attachments.gst_percentage = firstProduct.gst_percentage;

      // Update requirement status to Quotation Generated on RFQ Approval
      requirement.status = "Quotation Generated";

      // Mark JSON fields as changed for Sequelize persistence
      requirement.changed('rfq_history', true);
      requirement.changed('products', true);

      await requirement.save({ transaction });

      // Automatically upsert Quotation record
      await upsertQuotationFromApprovedRFQ(requirement, approvedRecord, transaction);
    } else {
      // Mark JSON fields as changed for Sequelize persistence
      requirement.changed('rfq_history', true);
      await requirement.save({ transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: `RFQ ${version} status updated to ${status}`,
      requirement
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating RFQ status:", error);
    res.status(500).json({ message: "Failed to update RFQ status" });
  }
});

// DELETE client requirement
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const requirement = await ClientRequirement.findByPk(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: "Client requirement not found" });
    }

    if (requirement.status === 'Converted to SO') {
      return res.status(400).json({ message: "Cannot delete a requirement that is already converted to a Sales Order" });
    }

    // Delete associated quotation
    await Quotation.destroy({
      where: { client_requirement_id: requirement.id }
    });

    await requirement.destroy();
    res.json({ success: true, message: "Client requirement deleted successfully" });
  } catch (error) {
    console.error("Error deleting client requirement:", error);
    res.status(500).json({ message: "Failed to delete client requirement" });
  }
});

module.exports = router;
