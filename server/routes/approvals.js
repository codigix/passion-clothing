const express = require("express");
const router = express.Router();
const { Approval, PurchaseOrder, Vendor, User, VendorRequest, GoodsReceiptNote } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const { Op } = require("sequelize");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      entity_type, 
      status, 
      stage_key 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};

    if (entity_type) {
      where.entity_type = entity_type;
    }

    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      where.status = { [Op.in]: statusArray };
    }

    if (stage_key) {
      const stageKeyArray = stage_key.split(',').map(s => s.trim());
      where.stage_key = { [Op.in]: stageKeyArray };
    }

    const { count, rows: approvals } = await Approval.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "name", "email", "department"],
          required: false,
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "department"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const enrichedApprovals = await Promise.all(
      approvals.map(async (approval) => {
        const approvalData = approval.toJSON();

        if (approval.entity_type === "purchase_order") {
          const po = await PurchaseOrder.findByPk(approval.entity_id, {
            include: [
              {
                model: Vendor,
                as: "vendor",
                attributes: ["id", "name", "vendor_code", "email", "phone", "company_name"],
              },
              {
                model: User,
                as: "creator",
                attributes: ["id", "name", "employee_id", "email", "department"],
                required: false,
              },
            ],
          });
          approvalData.entity = po;
        }

        return approvalData;
      })
    );

    res.json({
      approvals: enrichedApprovals,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching approvals:", error);
    res.status(500).json({ 
      message: "Failed to fetch approvals", 
      error: error.message 
    });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const approval = await Approval.findByPk(id, {
      include: [
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "name", "email", "department"],
          required: false,
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "department"],
          required: false,
        },
      ],
    });

    if (!approval) {
      return res.status(404).json({ message: "Approval not found" });
    }

    const approvalData = approval.toJSON();

    if (approval.entity_type === "purchase_order") {
      const po = await PurchaseOrder.findByPk(approval.entity_id, {
        include: [
          {
            model: Vendor,
            as: "vendor",
            attributes: ["id", "name", "vendor_code", "email", "phone", "company_name"],
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "employee_id", "email", "department"],
            required: false,
          },
        ],
      });
      approvalData.entity = po;
    }

    res.json(approvalData);
  } catch (error) {
    console.error("Error fetching approval:", error);
    res.status(500).json({ 
      message: "Failed to fetch approval", 
      error: error.message 
    });
  }
});

router.patch("/:id/approve", authenticateToken, async (req, res) => {
  const transaction = await require("../config/database").sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { decision_note } = req.body;

    const approval = await Approval.findByPk(id, { transaction });
    if (!approval) {
      await transaction.rollback();
      return res.status(404).json({ message: "Approval not found" });
    }

    if (approval.status !== "pending" && approval.status !== "in_progress") {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "Approval has already been processed" 
      });
    }

    await approval.update({
      status: "approved",
      reviewer_id: req.user.id,
      decision_note: decision_note || null,
      decided_at: new Date(),
    }, { transaction });

    if (approval.entity_type === "purchase_order" && approval.stage_key === "grn_shortage_complaint") {
      const po = await PurchaseOrder.findByPk(approval.entity_id, { transaction });
      if (po) {
        await po.update({ status: "reopened" }, { transaction });

        const shortageItems = approval.metadata?.items_affected || [];
        if (shortageItems.length > 0 && approval.metadata?.grn_id) {
          const totalValue = shortageItems.reduce((sum, item) => {
            const itemValue = parseFloat(item.shortage_value || 0);
            return sum + itemValue;
          }, 0);

          await VendorRequest.create({
            purchase_order_id: po.id,
            grn_id: approval.metadata.grn_id,
            vendor_id: po.vendor_id,
            complaint_id: approval.id,
            request_type: "shortage",
            request_number: `SR-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString().slice(2, 7)}`,
            items: shortageItems.map(item => ({
              material_name: item.material_name,
              product_code: item.product_code || "",
              shortage_qty: item.shortage_qty,
              shortage_quantity: item.shortage_qty,
              ordered_qty: item.ordered_qty,
              received_qty: item.received_qty,
              rate: item.rate || 0,
              uom: item.uom || "Meters"
            })),
            total_value: totalValue,
            status: "sent",
            sent_at: new Date(),
            created_by: req.user.id
          }, { transaction });
        }
      }
    }

    await transaction.commit();

    res.json({ 
      message: "Approval approved successfully", 
      approval 
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error approving approval:", error);
    res.status(500).json({ 
      message: "Failed to approve", 
      error: error.message 
    });
  }
});

router.patch("/:id/reject", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { decision_note } = req.body;

    const approval = await Approval.findByPk(id);
    if (!approval) {
      return res.status(404).json({ message: "Approval not found" });
    }

    if (approval.status !== "pending" && approval.status !== "in_progress") {
      return res.status(400).json({ 
        message: "Approval has already been processed" 
      });
    }

    await approval.update({
      status: "rejected",
      reviewer_id: req.user.id,
      decision_note: decision_note || "Rejected",
      decided_at: new Date(),
    });

    res.json({ 
      message: "Approval rejected successfully", 
      approval 
    });
  } catch (error) {
    console.error("Error rejecting approval:", error);
    res.status(500).json({ 
      message: "Failed to reject", 
      error: error.message 
    });
  }
});

module.exports = router;
