const express = require("express");
const { Op } = require("sequelize");
const {
  Quotation,
  ClientRequirement,
  Vendor,
  sequelize
} = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

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

// GET all quotations
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { type, search, status } = req.query;
    const where = {};

    if (type) {
      where.quotation_type = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { quotation_number: { [Op.like]: `%${search}%` } },
        { rfq_no: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } },
        { vendor_name: { [Op.like]: `%${search}%` } },
        { product_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const quotations = await Quotation.findAll({
      where,
      include: [
        {
          model: ClientRequirement,
          as: "clientRequirement",
          required: false
        }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json(quotations);
  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({ message: "Failed to load quotations" });
  }
});

// GET single quotation
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [
        {
          model: ClientRequirement,
          as: "clientRequirement",
          required: false
        }
      ]
    });

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    res.json(quotation);
  } catch (error) {
    console.error("Error fetching quotation details:", error);
    res.status(500).json({ message: "Failed to load quotation details" });
  }
});

// POST create Received Quotation (from Vendor)
router.post("/received", authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      vendor_id,
      rfq_no,
      rfq_version,
      product_name,
      quantity,
      unit_price,
      discount_percentage,
      tax_percentage,
      remarks,
      valid_until
    } = req.body;

    if (!vendor_id) {
      await transaction.rollback();
      return res.status(400).json({ message: "Vendor is required" });
    }

    const vendor = await Vendor.findByPk(vendor_id, { transaction });
    if (!vendor) {
      await transaction.rollback();
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Calculations
    const qty = parseInt(quantity, 10) || 1;
    const price = parseFloat(unit_price) || 0;
    const discountPercent = parseFloat(discount_percentage) || 0;
    const taxPercent = parseFloat(tax_percentage) || 18;

    const totalAmount = qty * price;
    const discountAmount = (totalAmount * discountPercent) / 100;
    const taxableAmount = totalAmount - discountAmount;
    const taxAmount = (taxableAmount * taxPercent) / 100;
    const finalAmount = taxableAmount + taxAmount;

    const quotNo = await generateQuotationNumber(transaction);

    // Try to find a client requirement matching this RFQ
    let clientRequirementId = null;
    let customerName = "N/A";
    if (rfq_no) {
      // e.g. RFQ-002-0001 -> second block is the CR sequence: "002"
      const parts = rfq_no.split("-");
      if (parts[1]) {
        const reqNum = `CR-${parts[1]}`;
        const cr = await ClientRequirement.findOne({
          where: { requirement_number: reqNum },
          transaction
        });
        if (cr) {
          clientRequirementId = cr.id;
          customerName = cr.customer_name;
        }
      }
    }

    const quotation = await Quotation.create({
      quotation_number: quotNo,
      client_requirement_id: clientRequirementId,
      rfq_no: rfq_no || "N/A",
      rfq_version: rfq_version || "V1",
      quotation_type: "Received",
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      customer_name: customerName,
      product_name: product_name || "Materials / Services",
      quantity: qty,
      unit_price: price,
      total_amount: totalAmount,
      discount_percentage: discountPercent,
      discount_amount: discountAmount,
      tax_percentage: taxPercent,
      tax_amount: taxAmount,
      final_amount: finalAmount,
      status: "Received",
      remarks,
      valid_until: valid_until ? new Date(valid_until) : null
    }, { transaction });

    await transaction.commit();
    res.status(201).json(quotation);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating received quotation:", error);
    res.status(500).json({ message: "Failed to create received quotation" });
  }
});

// PATCH update quotation status (Approve/Reject)
router.patch("/:id/status", authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { status } = req.body;
    const quotation = await Quotation.findByPk(req.params.id, { transaction });
    if (!quotation) {
      await transaction.rollback();
      return res.status(404).json({ message: "Quotation not found" });
    }

    quotation.status = status;
    await quotation.save({ transaction });

    // If a Received quotation is approved, automatically reject others for the same RFQ
    if (quotation.quotation_type === "Received" && status === "Approved" && quotation.rfq_no) {
      await Quotation.update(
        { status: "Rejected" },
        {
          where: {
            rfq_no: quotation.rfq_no,
            id: { [Op.ne]: quotation.id },
            quotation_type: "Received"
          },
          transaction
        }
      );
    }

    await transaction.commit();
    res.json(quotation);
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating quotation status:", error);
    res.status(500).json({ message: "Failed to update quotation status" });
  }
});

// DELETE quotation
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    await quotation.destroy();
    res.json({ success: true, message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    res.status(500).json({ message: "Failed to delete quotation" });
  }
});

module.exports = router;
