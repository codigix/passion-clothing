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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadFields = upload.fields([
  { name: "drawing", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "images", maxCount: 1 },
  { name: "specifications", maxCount: 1 }
]);

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
    
    // Extract uploads
    const attachments = {};
    if (req.files) {
      if (req.files.drawing) attachments.drawing = `/uploads/${req.files.drawing[0].filename}`;
      if (req.files.pdf) attachments.pdf = `/uploads/${req.files.pdf[0].filename}`;
      if (req.files.images) attachments.images = `/uploads/${req.files.images[0].filename}`;
      if (req.files.specifications) attachments.specifications = `/uploads/${req.files.specifications[0].filename}`;
    }
    
    const requirement = await ClientRequirement.create({
      requirement_number: reqNo,
      customer_name: req.body.customer_name,
      contact_person: req.body.contact_person,
      mobile_number: req.body.mobile_number,
      email: req.body.email,
      project_name: req.body.project_name,
      required_date: req.body.required_date ? new Date(req.body.required_date) : null,
      product_category: req.body.product_category,
      product_name: req.body.product_name,
      description: req.body.description,
      quantity: parseInt(req.body.quantity, 10) || 0,
      unit: req.body.unit || "Nos",
      material: req.body.material,
      dimensions: req.body.dimensions,
      weight: req.body.weight,
      color: req.body.color,
      finish: req.body.finish,
      tolerance: req.body.tolerance,
      attachments,
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
    
    // Extract uploads and merge with existing attachments
    const newAttachments = { ...(requirement.attachments || {}) };
    if (req.files) {
      if (req.files.drawing) newAttachments.drawing = `/uploads/${req.files.drawing[0].filename}`;
      if (req.files.pdf) newAttachments.pdf = `/uploads/${req.files.pdf[0].filename}`;
      if (req.files.images) newAttachments.images = `/uploads/${req.files.images[0].filename}`;
      if (req.files.specifications) newAttachments.specifications = `/uploads/${req.files.specifications[0].filename}`;
    }
    
    await requirement.update({
      customer_name: req.body.customer_name,
      contact_person: req.body.contact_person,
      mobile_number: req.body.mobile_number,
      email: req.body.email,
      project_name: req.body.project_name,
      required_date: req.body.required_date ? new Date(req.body.required_date) : null,
      product_category: req.body.product_category,
      product_name: req.body.product_name,
      description: req.body.description,
      quantity: parseInt(req.body.quantity, 10) || 0,
      unit: req.body.unit || "Nos",
      material: req.body.material,
      dimensions: req.body.dimensions,
      weight: req.body.weight,
      color: req.body.color,
      finish: req.body.finish,
      tolerance: req.body.tolerance,
      attachments: newAttachments,
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

module.exports = router;
