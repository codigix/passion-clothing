const express = require("express");
const {
  Role,
  Permission,
  User,
  Inventory,
  StoreStock,
  SalesOrder,
  PurchaseOrder,
  ProductionOrder,
  Customer,
  Vendor,
  Product,
  Shipment,
  Payment,
  Sample,
  Approval,
  GoodsReceiptNote,
  BillOfMaterials,
} = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const { Op, QueryTypes } = require("sequelize");
const NotificationService = require("../utils/notificationService");
const router = express.Router();

// Get all roles
router.get("/roles", authenticateToken, async (req, res) => {
  try {
    // Fetch roles with permissions
    const roles = await Role.findAll({
      include: [{ model: Permission, as: "permissions" }],
      order: [["level", "ASC"]],
    });

    // Fetch user counts for each role separately
    const roleIds = roles.map((role) => role.id);
    const userCounts = await require("../config/database").sequelize.query(
      `SELECT role_id, COUNT(*) as count 
       FROM user_roles 
       WHERE role_id IN (:roleIds)
       GROUP BY role_id`,
      {
        replacements: { roleIds: roleIds.length > 0 ? roleIds : [0] },
        type: require("sequelize").QueryTypes.SELECT,
      }
    );

    // Create a map of role_id to user count
    const userCountMap = {};
    userCounts.forEach((row) => {
      userCountMap[row.role_id] = parseInt(row.count);
    });

    // Format the response to include userCount
    const formattedRoles = roles.map((role) => {
      const roleData = role.toJSON();
      roleData.userCount = userCountMap[role.id] || 0;
      roleData.status = roleData.status || "active";
      return roleData;
    });

    res.json({ roles: formattedRoles });
  } catch (error) {
    console.error("Roles fetch error:", error);
    console.error("Error details:", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch roles", error: error.message });
  }
});

// Create role
router.post("/roles", authenticateToken, async (req, res) => {
  try {
    const { name, display_name, description, department, level } = req.body;

    if (!name || !display_name || !department || !level) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const role = await Role.create({
      name,
      display_name,
      description,
      department,
      level,
      created_by: req.user.id,
    });

    res.status(201).json({
      message: "Role created successfully",
      role: {
        id: role.id,
        name: role.name,
        display_name: role.display_name,
        department: role.department,
        level: role.level,
      },
    });
  } catch (error) {
    console.error("Role creation error:", error);
    res.status(500).json({ message: "Failed to create role" });
  }
});

// Get all permissions
router.get("/permissions", authenticateToken, async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [
        ["module", "ASC"],
        ["resource", "ASC"],
        ["action", "ASC"],
      ],
    });

    res.json({ permissions });
  } catch (error) {
    console.error("Permissions fetch error:", error);
    res.status(500).json({ message: "Failed to fetch permissions" });
  }
});

// Get pending approvals (for admin approval dashboard)
router.get("/pending-approvals", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, entity_type } = req.query;
    const offset = (page - 1) * limit;

    const where = { status: "pending" };
    if (entity_type) {
      where.entity_type = entity_type;
    }

    // Fetch pending approvals
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

    // Fetch related entities for each approval WITH FULL DETAILS including items
    const enrichedApprovals = await Promise.all(
      approvals.map(async (approval) => {
        const approvalData = approval.toJSON();

        // Fetch the related entity based on type
        if (approval.entity_type === "purchase_order") {
          const po = await PurchaseOrder.findByPk(approval.entity_id, {
            include: [
              {
                model: Vendor,
                as: "vendor",
                attributes: [
                  "id",
                  "name",
                  "vendor_code",
                  "email",
                  "phone",
                  "company_name",
                ],
              },
              {
                model: Customer,
                as: "customer",
                attributes: ["id", "name", "customer_code", "email", "phone"],
                required: false,
              },
              {
                model: User,
                as: "creator",
                attributes: [
                  "id",
                  "name",
                  "employee_id",
                  "email",
                  "department",
                ],
              },
              {
                model: User,
                as: "approver",
                attributes: ["id", "name", "employee_id"],
                required: false,
              },
              {
                model: SalesOrder,
                as: "salesOrder",
                attributes: ["id", "order_number", "customer_id"],
                required: false,
              },
            ],
          });
          // All fields including items, fabric_requirements, accessories are automatically included
          approvalData.entity = po;
        } else if (approval.entity_type === "sales_order") {
          const so = await SalesOrder.findByPk(approval.entity_id, {
            include: [
              {
                model: Customer,
                as: "customer",
                attributes: [
                  "id",
                  "name",
                  "customer_code",
                  "email",
                  "phone",
                  "company_name",
                ],
              },
              {
                model: User,
                as: "creator",
                attributes: [
                  "id",
                  "name",
                  "employee_id",
                  "email",
                  "department",
                ],
              },
              {
                model: User,
                as: "approver",
                attributes: ["id", "name", "employee_id"],
                required: false,
              },
            ],
          });
          // All fields including items, garment_specifications are automatically included
          approvalData.entity = so;
        }

        return approvalData;
      })
    );

    // Also get direct purchase orders with pending_approval status (for backward compatibility) WITH FULL DETAILS
    const pendingPOs = await PurchaseOrder.findAll({
      where: { status: "pending_approval" },
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "id",
            "name",
            "vendor_code",
            "email",
            "phone",
            "company_name",
          ],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name", "customer_code", "email", "phone"],
          required: false,
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "employee_id", "email", "department"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name", "employee_id"],
          required: false,
        },
        {
          model: SalesOrder,
          as: "salesOrder",
          attributes: ["id", "order_number", "customer_id"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    // All PO fields including items, fabric_requirements, accessories are automatically included

    res.json({
      approvals: enrichedApprovals,
      purchaseOrders: pendingPOs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
      stats: {
        totalPendingApprovals: count,
        totalPendingPOs: pendingPOs.length,
        totalPOValue: pendingPOs.reduce(
          (sum, po) => sum + (parseFloat(po.final_amount) || 0),
          0
        ),
      },
    });
  } catch (error) {
    console.error("Pending approvals fetch error:", error);
    res.status(500).json({
      message: "Failed to fetch pending approvals",
      error: error.message,
    });
  }
});

// Get single pending approval with FULL details (for review before approval)
router.get("/pending-approvals/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const approval = await Approval.findByPk(id, {
      include: [
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "name", "email", "department", "employee_id"],
          required: false,
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "department", "employee_id"],
          required: false,
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "name", "email", "department", "employee_id"],
          required: false,
        },
      ],
    });

    if (!approval) {
      return res.status(404).json({ message: "Approval request not found" });
    }

    const approvalData = approval.toJSON();

    // Fetch the related entity with COMPLETE details including ALL items
    if (approval.entity_type === "purchase_order") {
      const po = await PurchaseOrder.findByPk(approval.entity_id, {
        include: [
          {
            model: Vendor,
            as: "vendor",
            attributes: [
              "id",
              "name",
              "vendor_code",
              "email",
              "phone",
              "company_name",
              "gst_number",
              "address",
            ],
          },
          {
            model: Customer,
            as: "customer",
            attributes: [
              "id",
              "name",
              "customer_code",
              "email",
              "phone",
              "company_name",
              "gst_number",
            ],
            required: false,
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "employee_id", "email", "department"],
          },
          {
            model: User,
            as: "approver",
            attributes: ["id", "name", "employee_id"],
            required: false,
          },
          {
            model: SalesOrder,
            as: "salesOrder",
            attributes: [
              "id",
              "order_number",
              "customer_id",
              "delivery_date",
              "total_quantity",
              "final_amount",
            ],
            required: false,
            include: [
              {
                model: Customer,
                as: "customer",
                attributes: ["id", "name", "customer_code"],
                required: false,
              },
            ],
          },
        ],
      });

      if (!po) {
        return res
          .status(404)
          .json({ message: "Related purchase order not found" });
      }

      // All PO fields are included: items, fabric_requirements, accessories, cost_summary, etc.
      approvalData.entity = po;
    } else if (approval.entity_type === "sales_order") {
      const so = await SalesOrder.findByPk(approval.entity_id, {
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: [
              "id",
              "name",
              "customer_code",
              "email",
              "phone",
              "company_name",
              "gst_number",
              "billing_address",
              "shipping_address",
            ],
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "employee_id", "email", "department"],
          },
          {
            model: User,
            as: "approver",
            attributes: ["id", "name", "employee_id"],
            required: false,
          },
          {
            model: PurchaseOrder,
            as: "linkedPurchaseOrder",
            attributes: ["id", "po_number", "status", "vendor_id"],
            required: false,
            include: [
              {
                model: Vendor,
                as: "vendor",
                attributes: ["id", "name", "vendor_code"],
                required: false,
              },
            ],
          },
        ],
      });

      if (!so) {
        return res
          .status(404)
          .json({ message: "Related sales order not found" });
      }

      // All SO fields are included: items, garment_specifications, design_files, etc.
      approvalData.entity = so;
    }

    res.json({ approval: approvalData });
  } catch (error) {
    console.error("Single approval fetch error:", error);
    res.status(500).json({
      message: "Failed to fetch approval details",
      error: error.message,
    });
  }
});

// Approve a pending request (Purchase Order, Sales Order, etc.)
router.post(
  "/pending-approvals/:id/approve",
  authenticateToken,
  async (req, res) => {
    const transaction =
      await require("../config/database").sequelize.transaction();

    try {
      const { id } = req.params;
      const { notes } = req.body;

      const approval = await Approval.findByPk(id, { transaction });

      if (!approval) {
        await transaction.rollback();
        return res.status(404).json({ message: "Approval request not found" });
      }

      if (approval.status !== "pending") {
        await transaction.rollback();
        return res.status(400).json({
          message: `Cannot approve. Approval is already ${approval.status}`,
        });
      }

      // Update approval record
      await approval.update(
        {
          status: "approved",
          reviewer_id: req.user.id,
          reviewed_at: new Date(),
          decision_notes: notes || "",
        },
        { transaction }
      );

      // Update the related entity (PO, SO, etc.)
      if (approval.entity_type === "purchase_order") {
        const po = await PurchaseOrder.findByPk(approval.entity_id, {
          include: [
            { model: Vendor, as: "vendor" },
            { model: Customer, as: "customer", required: false },
          ],
          transaction,
        });

        if (po) {
          await po.update(
            {
              status: "sent",
              approval_status: "approved",
              approved_by: req.user.id,
              approved_at: new Date(),
              approval_decision_note: notes || "",
            },
            { transaction }
          );

          // Send notification to procurement
          await NotificationService.sendToDepartment("procurement", {
            type: "procurement",
            title: `✅ PO ${po.po_number} Approved`,
            message: `Purchase Order ${
              po.po_number
            } has been approved and sent to vendor ${
              po.vendor?.name || "Unknown"
            }.`,
            priority:
              po.priority === "urgent" || po.priority === "high"
                ? "high"
                : "medium",
            related_entity_id: po.id,
            related_entity_type: "purchase_order",
            action_url: `/procurement/purchase-orders/${po.id}`,
            trigger_event: "po_approved",
            actor_id: req.user.id,
            metadata: { po_number: po.po_number, vendor_name: po.vendor?.name },
          });
        }
      } else if (approval.entity_type === "sales_order") {
        const so = await SalesOrder.findByPk(approval.entity_id, {
          include: [{ model: Customer, as: "customer" }],
          transaction,
        });

        if (so) {
          await so.update(
            {
              status: "confirmed",
              approval_status: "approved",
              approved_by: req.user.id,
              approved_at: new Date(),
              approval_decision_note: notes || "",
            },
            { transaction }
          );

          // Send notification to sales
          await NotificationService.sendToDepartment("sales", {
            type: "sales",
            title: `✅ SO ${so.order_number} Approved`,
            message: `Sales Order ${
              so.order_number
            } has been approved. Customer: ${so.customer?.name || "Unknown"}.`,
            priority:
              so.priority === "urgent" || so.priority === "high"
                ? "high"
                : "medium",
            related_entity_id: so.id,
            related_entity_type: "sales_order",
            action_url: `/sales/orders/${so.id}`,
            trigger_event: "so_approved",
            actor_id: req.user.id,
            metadata: {
              order_number: so.order_number,
              customer_name: so.customer?.name,
            },
          });
        }
      } else if (approval.entity_type === "grn_creation") {
        const po = await PurchaseOrder.findByPk(approval.entity_id, {
          include: [
            { model: Vendor, as: "vendor" },
            { model: Customer, as: "customer", required: false },
            { model: SalesOrder, as: "salesOrder", required: false },
            { model: BillOfMaterials, as: "billOfMaterials", required: false },
          ],
          transaction,
        });

        if (po) {
          // Generate GRN number: GRN-YYYYMMDD-XXXXX
          const today = new Date();
          const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
          const lastGRN = await GoodsReceiptNote.findOne({
            where: {
              grn_number: {
                [require("sequelize").Op.like]: `GRN-${dateStr}-%`,
              },
            },
            order: [["created_at", "DESC"]],
            transaction,
          });

          let sequence = 1;
          if (lastGRN) {
            const lastSequence = parseInt(lastGRN.grn_number.split("-")[2]);
            sequence = lastSequence + 1;
          }
          const grnNumber = `GRN-${dateStr}-${sequence
            .toString()
            .padStart(5, "0")}`;

          // Map PO items to GRN format with ordered quantities as initial received
          const poItems = po.items || [];
          const mappedItems = poItems.map((item, index) => ({
            item_index: index,
            product_id: item.product_id,
            product_name: item.product_name,
            product_code: item.product_code,
            ordered_qty: item.quantity,
            invoiced_qty: item.quantity, // Assume invoiced matches ordered
            received_qty: item.quantity, // Pre-fill with ordered, to be updated by inventory
            unit: item.unit,
            rate: item.rate,
            total: item.quantity * item.rate,
            weight: 0, // To be updated
            shortage_quantity: 0, // To be calculated later
            remarks: "", // To be updated
          }));

          // Calculate total received value
          const totalReceivedValue = mappedItems.reduce(
            (sum, item) => sum + item.total,
            0
          );

          // Create GRN automatically
          const grn = await GoodsReceiptNote.create(
            {
              grn_number: grnNumber,
              purchase_order_id: po.id,
              bill_of_materials_id: po.bom_id || null,
              sales_order_id: po.linked_sales_order_id || null,
              received_date: null, // To be set when materials arrive
              supplier_name: po.vendor.name,
              supplier_invoice_number: null, // To be set
              inward_challan_number: null, // To be set
              items_received: mappedItems,
              total_received_value: totalReceivedValue,
              status: "draft", // Draft until verified
              verification_status: "pending",
              remarks: `Auto-generated from PO ${po.po_number}`,
              attachments: [],
              created_by: req.user.id,
              inventory_added: false,
            },
            { transaction }
          );

          // Update PO status
          await po.update(
            {
              status: "grn_created",
              internal_notes: `${
                po.internal_notes || ""
              }\n\nGRN ${grnNumber} auto-created on ${new Date().toISOString()} by ${
                req.user.name
              }`,
            },
            { transaction }
          );

          // Send notification to inventory department
          await NotificationService.sendToDepartment("inventory", {
            type: "grn_created",
            title: `✅ GRN Auto-Created: ${grnNumber} for PO ${po.po_number}`,
            message: `GRN has been automatically created for Purchase Order ${po.po_number}. Please update with actual received quantities when materials arrive.`,
            priority: "high",
            related_entity_id: grn.id,
            related_entity_type: "grn",
            action_url: `/inventory/grn/${grn.id}`,
            trigger_event: "grn_auto_created",
            actor_id: req.user.id,
            metadata: {
              grn_number: grnNumber,
              po_number: po.po_number,
              vendor_name: po.vendor?.name,
              customer_name: po.customer?.name,
              project_name: po.project_name,
              approved_by: req.user.name,
            },
          });

          // Send notification to procurement
          await NotificationService.sendToDepartment("procurement", {
            type: "procurement",
            title: `✅ GRN Created: PO ${po.po_number}`,
            message: `GRN ${grnNumber} has been created for Purchase Order ${po.po_number}. Inventory will verify when materials arrive.`,
            priority: "medium",
            related_entity_id: po.id,
            related_entity_type: "purchase_order",
            action_url: `/procurement/purchase-orders/${po.id}`,
            trigger_event: "grn_created_for_po",
            actor_id: req.user.id,
            metadata: {
              grn_number: grnNumber,
              po_number: po.po_number,
              approved_by: req.user.name,
            },
          });
        }
      }

      await transaction.commit();

      res.json({
        message: `${
          approval.entity_type === "purchase_order"
            ? "Purchase Order"
            : approval.entity_type === "sales_order"
            ? "Sales Order"
            : "GRN Creation Request"
        } approved successfully`,
        approval,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Approval error:", error);
      res
        .status(500)
        .json({ message: "Failed to approve request", error: error.message });
    }
  }
);

// Reject a pending request (Purchase Order, Sales Order, etc.)
router.post(
  "/pending-approvals/:id/reject",
  authenticateToken,
  async (req, res) => {
    const transaction =
      await require("../config/database").sequelize.transaction();

    try {
      const { id } = req.params;
      const { notes } = req.body;

      if (!notes || notes.trim() === "") {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Rejection notes are required" });
      }

      const approval = await Approval.findByPk(id, { transaction });

      if (!approval) {
        await transaction.rollback();
        return res.status(404).json({ message: "Approval request not found" });
      }

      if (approval.status !== "pending") {
        await transaction.rollback();
        return res.status(400).json({
          message: `Cannot reject. Approval is already ${approval.status}`,
        });
      }

      // Update approval record
      await approval.update(
        {
          status: "rejected",
          reviewer_id: req.user.id,
          reviewed_at: new Date(),
          decision_notes: notes,
        },
        { transaction }
      );

      // Update the related entity (PO, SO, etc.)
      if (approval.entity_type === "purchase_order") {
        const po = await PurchaseOrder.findByPk(approval.entity_id, {
          include: [
            { model: Vendor, as: "vendor" },
            { model: User, as: "creator" },
          ],
          transaction,
        });

        if (po) {
          await po.update(
            {
              status: "draft", // Return to draft for revision
              approval_status: "rejected",
              approval_decision_note: notes,
            },
            { transaction }
          );

          // Send notification to creator and procurement
          await NotificationService.sendToDepartment("procurement", {
            type: "procurement",
            title: `❌ PO ${po.po_number} Rejected`,
            message: `Purchase Order ${po.po_number} has been rejected. Reason: ${notes}`,
            priority: "high",
            related_entity_id: po.id,
            related_entity_type: "purchase_order",
            action_url: `/procurement/purchase-orders/${po.id}`,
            trigger_event: "po_rejected",
            actor_id: req.user.id,
            metadata: { po_number: po.po_number, rejection_reason: notes },
          });
        }
      } else if (approval.entity_type === "sales_order") {
        const so = await SalesOrder.findByPk(approval.entity_id, {
          include: [
            { model: Customer, as: "customer" },
            { model: User, as: "creator" },
          ],
          transaction,
        });

        if (so) {
          await so.update(
            {
              status: "draft", // Return to draft for revision
              approval_status: "rejected",
              approval_decision_note: notes,
            },
            { transaction }
          );

          // Send notification to creator and sales
          await NotificationService.sendToDepartment("sales", {
            type: "sales",
            title: `❌ SO ${so.order_number} Rejected`,
            message: `Sales Order ${so.order_number} has been rejected. Reason: ${notes}`,
            priority: "high",
            related_entity_id: so.id,
            related_entity_type: "sales_order",
            action_url: `/sales/orders/${so.id}`,
            trigger_event: "so_rejected",
            actor_id: req.user.id,
            metadata: {
              order_number: so.order_number,
              rejection_reason: notes,
            },
          });
        }
      } else if (approval.entity_type === "grn_creation") {
        const po = await PurchaseOrder.findByPk(approval.entity_id, {
          include: [
            { model: Vendor, as: "vendor" },
            { model: Customer, as: "customer", required: false },
          ],
          transaction,
        });

        if (po) {
          await po.update(
            {
              status: "sent", // Return to sent status, GRN can be requested again
              internal_notes: `${
                po.internal_notes || ""
              }\n\nGRN creation request rejected on ${new Date().toISOString()} by ${
                req.user.name
              }. Reason: ${notes}`,
            },
            { transaction }
          );

          // Send notification to procurement
          await NotificationService.sendToDepartment("procurement", {
            type: "procurement",
            title: `❌ GRN Request Rejected: PO ${po.po_number}`,
            message: `Your GRN creation request for Purchase Order ${po.po_number} has been rejected. Reason: ${notes}`,
            priority: "high",
            related_entity_id: po.id,
            related_entity_type: "purchase_order",
            action_url: `/procurement/purchase-orders/${po.id}`,
            trigger_event: "grn_request_rejected",
            actor_id: req.user.id,
            metadata: {
              po_number: po.po_number,
              rejection_reason: notes,
              rejected_by: req.user.name,
            },
          });
        }
      }

      await transaction.commit();

      res.json({
        message: `${
          approval.entity_type === "purchase_order"
            ? "Purchase Order"
            : approval.entity_type === "sales_order"
            ? "Sales Order"
            : "GRN Creation Request"
        } rejected successfully`,
        approval,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Rejection error:", error);
      res
        .status(500)
        .json({ message: "Failed to reject request", error: error.message });
    }
  }
);

// System statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: "active" } });
    const totalRoles = await Role.count();
    const totalPermissions = await Permission.count();

    res.json({
      totalUsers,
      activeUsers,
      totalRoles,
      totalPermissions,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Failed to fetch admin statistics" });
  }
});

// Enhanced dashboard statistics
router.get("/dashboard-stats", authenticateToken, async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: "active" } });

    // Product and inventory stats
    const totalProducts = await Product.count();
    const totalInventoryValue = (await Inventory.sum("total_value")) || 0;
    const lowStockItems = await Inventory.count({
      where: {
        available_stock: {
          [Op.lte]: require("sequelize").col("minimum_level"),
        },
      },
    });

    // Sales stats
    const totalSalesOrders = await SalesOrder.count();
    const totalSalesValue = (await SalesOrder.sum("final_amount")) || 0;
    const pendingSalesOrders = await SalesOrder.count({
      where: { status: { [Op.in]: ["draft", "confirmed", "in_production"] } },
    });

    // Purchase stats
    const totalPurchaseOrders = await PurchaseOrder.count();
    const totalPurchaseValue = (await PurchaseOrder.sum("final_amount")) || 0;
    const pendingPurchaseOrders = await PurchaseOrder.count({
      where: { status: { [Op.in]: ["draft", "pending", "approved"] } },
    });

    // Production stats
    const totalProductionOrders = await ProductionOrder.count();
    const completedProductionOrders = await ProductionOrder.count({
      where: { status: "completed" },
    });

    // Customer and vendor stats
    const totalCustomers = await Customer.count();
    const totalVendors = await Vendor.count();

    // Store stock stats
    const totalStoreStock = (await StoreStock.sum("current_stock")) || 0;
    const totalStoreValue = (await StoreStock.sum("total_cost_value")) || 0;

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      inventory: {
        totalProducts,
        totalValue: parseFloat(totalInventoryValue),
        lowStockItems,
      },
      sales: {
        totalOrders: totalSalesOrders,
        totalValue: parseFloat(totalSalesValue),
        pendingOrders: pendingSalesOrders,
      },
      purchases: {
        totalOrders: totalPurchaseOrders,
        totalValue: parseFloat(totalPurchaseValue),
        pendingOrders: pendingPurchaseOrders,
      },
      production: {
        totalOrders: totalProductionOrders,
        completedOrders: completedProductionOrders,
      },
      business: {
        totalCustomers,
        totalVendors,
      },
      store: {
        totalStock: totalStoreStock,
        totalValue: parseFloat(totalStoreValue),
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
});

// Department overview
router.get("/department-overview", authenticateToken, async (req, res) => {
  try {
    const departments = [
      "sales",
      "inventory",
      "manufacturing",
      "procurement",
      "outsourcing",
      "shipment",
      "store",
      "finance",
      "admin",
      "samples",
    ];

    const departmentStats = {};

    for (const dept of departments) {
      const userCount = await User.count({ where: { department: dept } });
      const activeUserCount = await User.count({
        where: { department: dept, status: "active" },
      });

      departmentStats[dept] = {
        userCount,
        activeUserCount,
        department: dept,
      };
    }

    // Add department-specific metrics
    // Sales metrics
    departmentStats.sales.totalOrders = await SalesOrder.count();
    departmentStats.sales.pendingOrders = await SalesOrder.count({
      where: { status: { [Op.in]: ["draft", "confirmed", "in_production"] } },
    });
    departmentStats.sales.totalValue = parseFloat(
      (await SalesOrder.sum("final_amount")) || 0
    );

    // Inventory metrics
    departmentStats.inventory.totalItems = await Inventory.count();
    departmentStats.inventory.totalValue = parseFloat(
      (await Inventory.sum("total_value")) || 0
    );

    // Low stock items - use raw query for column comparison
    const lowStockResult = await require("../config/database").sequelize.query(
      `SELECT COUNT(*) as count FROM inventory WHERE available_stock <= minimum_level`,
      { type: require("sequelize").QueryTypes.SELECT }
    );
    departmentStats.inventory.lowStockItems = parseInt(
      lowStockResult[0]?.count || 0
    );

    // Manufacturing metrics
    departmentStats.manufacturing.totalOrders = await ProductionOrder.count();
    departmentStats.manufacturing.completedOrders = await ProductionOrder.count(
      {
        where: { status: "completed" },
      }
    );

    // Procurement metrics
    departmentStats.procurement.totalOrders = await PurchaseOrder.count();
    departmentStats.procurement.pendingOrders = await PurchaseOrder.count({
      where: { status: { [Op.in]: ["draft", "pending", "approved"] } },
    });
    departmentStats.procurement.totalValue = parseFloat(
      (await PurchaseOrder.sum("final_amount")) || 0
    );

    // Store metrics
    departmentStats.store.totalStock =
      (await StoreStock.sum("current_stock")) || 0;
    departmentStats.store.totalValue = parseFloat(
      (await StoreStock.sum("total_cost_value")) || 0
    );

    // Outsourcing metrics (outsourced production orders)
    departmentStats.outsourcing.totalOrders = await ProductionOrder.count({
      where: { production_type: { [Op.in]: ["outsourced", "mixed"] } },
    });
    departmentStats.outsourcing.completedOrders = await ProductionOrder.count({
      where: {
        production_type: { [Op.in]: ["outsourced", "mixed"] },
        status: "completed",
      },
    });

    // Shipment metrics
    departmentStats.shipment.totalShipments = await Shipment.count();
    departmentStats.shipment.pendingShipments = await Shipment.count({
      where: { status: { [Op.in]: ["preparing", "packed", "ready_to_ship"] } },
    });
    departmentStats.shipment.deliveredShipments = await Shipment.count({
      where: { status: "delivered" },
    });
    departmentStats.shipment.totalShippingCost = parseFloat(
      (await Shipment.sum("shipping_cost")) || 0
    );

    // Finance metrics
    departmentStats.finance.totalPayments = await Payment.count();
    departmentStats.finance.totalPaymentAmount = parseFloat(
      (await Payment.sum("amount")) || 0
    );
    departmentStats.finance.pendingPayments = await Payment.count({
      where: { status: "pending" },
    });
    departmentStats.finance.completedPayments = await Payment.count({
      where: { status: "completed" },
    });

    // Samples metrics
    departmentStats.samples.totalSamples = await Sample.count();
    departmentStats.samples.pendingSamples = await Sample.count({
      where: {
        status: { [Op.in]: ["requested", "approved", "in_production"] },
      },
    });
    departmentStats.samples.completedSamples = await Sample.count({
      where: { status: "delivered" },
    });
    departmentStats.samples.totalSampleCost = parseFloat(
      (await Sample.sum("total_cost")) || 0
    );

    res.json(departmentStats);
  } catch (error) {
    console.error("Department overview error:", error);
    res.status(500).json({ message: "Failed to fetch department overview" });
  }
});

// Stock overview
router.get("/stock-overview", authenticateToken, async (req, res) => {
  try {
    const totalInventoryItems = await Inventory.count();
    const totalInventoryValue = parseFloat(
      (await Inventory.sum("total_value")) || 0
    );
    const totalAvailableStock = (await Inventory.sum("available_stock")) || 0;
    const totalReservedStock = (await Inventory.sum("reserved_stock")) || 0;

    // Get low stock items using raw query for column comparison
    const lowStockResult = await require("../config/database").sequelize.query(
      `SELECT i.*, p.id as "product.id", p.name as "product.name" 
       FROM inventory i 
       LEFT JOIN products p ON i.product_id = p.id 
       WHERE i.available_stock <= i.minimum_level 
       ORDER BY i.available_stock ASC 
       LIMIT 10`,
      { type: require("sequelize").QueryTypes.SELECT }
    );
    const lowStockItems = lowStockResult;

    const topValueItems = await Inventory.findAll({
      include: [{ model: Product, as: "product" }],
      limit: 10,
      order: [["total_value", "DESC"]],
    });

    const storeStockSummary = await StoreStock.findAll({
      attributes: [
        "store_location",
        [
          require("sequelize").fn(
            "SUM",
            require("sequelize").col("current_stock")
          ),
          "totalStock",
        ],
        [
          require("sequelize").fn(
            "SUM",
            require("sequelize").col("total_cost_value")
          ),
          "totalValue",
        ],
      ],
      group: ["store_location"],
    });

    res.json({
      inventory: {
        totalItems: totalInventoryItems,
        totalValue: totalInventoryValue,
        availableStock: totalAvailableStock,
        reservedStock: totalReservedStock,
      },
      lowStockItems: lowStockItems.map((item) => ({
        id: item.id,
        productName: item.product?.name || "Unknown",
        currentStock: item.current_stock,
        availableStock: item.available_stock,
        minimumLevel: item.minimum_level,
        location: item.location,
      })),
      topValueItems: topValueItems.map((item) => ({
        id: item.id,
        productName: item.product?.name || "Unknown",
        totalValue: parseFloat(item.total_value),
        currentStock: item.current_stock,
        location: item.location,
      })),
      storeSummary: storeStockSummary.map((store) => ({
        location: store.store_location,
        totalStock: parseInt(store.dataValues.totalStock),
        totalValue: parseFloat(store.dataValues.totalValue || 0),
      })),
    });
  } catch (error) {
    console.error("Stock overview error:", error);
    res.status(500).json({ message: "Failed to fetch stock overview" });
  }
});

// Recent activities across all departments
router.get("/recent-activities", authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const activities = [];

    // Recent sales orders
    const recentSales = await SalesOrder.findAll({
      limit: 5,
      order: [["created_at", "DESC"]],
      include: [{ model: Customer, as: "customer", attributes: ["name"] }],
    });

    recentSales.forEach((order) => {
      activities.push({
        id: `sales_${order.id}`,
        type: "sales_order",
        department: "sales",
        description: `Sales order ${order.order_number} created`,
        amount: parseFloat(order.final_amount),
        customer: order.customer?.name,
        status: order.status,
        created_at: order.created_at,
        user: "Sales Team",
      });
    });

    // Recent purchase orders
    const recentPurchases = await PurchaseOrder.findAll({
      limit: 5,
      order: [["created_at", "DESC"]],
      include: [{ model: Vendor, as: "vendor", attributes: ["name"] }],
    });

    recentPurchases.forEach((order) => {
      activities.push({
        id: `purchase_${order.id}`,
        type: "purchase_order",
        department: "procurement",
        description: `Purchase order ${order.order_number} created`,
        amount: parseFloat(order.total_amount),
        vendor: order.vendor?.name,
        status: order.status,
        created_at: order.created_at,
        user: "Procurement Team",
      });
    });

    // Recent production orders
    const recentProduction = await ProductionOrder.findAll({
      limit: 5,
      order: [["created_at", "DESC"]],
    });

    recentProduction.forEach((order) => {
      activities.push({
        id: `production_${order.id}`,
        type: "production_order",
        department: "manufacturing",
        description: `Production order ${order.order_number} ${order.status}`,
        quantity: order.quantity,
        status: order.status,
        created_at: order.created_at,
        user: "Manufacturing Team",
      });
    });

    // Recent user activities (registrations/updates)
    const recentUsers = await User.findAll({
      limit: 5,
      order: [["created_at", "DESC"]],
      attributes: ["id", "name", "department", "created_at"],
    });

    recentUsers.forEach((user) => {
      activities.push({
        id: `user_${user.id}`,
        type: "user_registration",
        department: user.department || "admin",
        description: `New user ${user.name} registered`,
        user: user.name,
        created_at: user.created_at,
      });
    });

    // Sort all activities by created_at descending and limit
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const limitedActivities = activities.slice(0, limit);

    res.json({ activities: limitedActivities });
  } catch (error) {
    console.error("Recent activities error:", error);
    res.status(500).json({ message: "Failed to fetch recent activities" });
  }
});

// Audit logs - comprehensive system activity logs
router.get("/audit-logs", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Collect audit logs from various sources
    const auditLogs = [];

    // User-related activities
    const userChanges = await User.findAll({
      limit: 20,
      offset: 0,
      order: [["updated_at", "DESC"]],
      attributes: [
        "id",
        "name",
        "email",
        "department",
        "updated_at",
        "created_at",
      ],
    });

    userChanges.forEach((user) => {
      auditLogs.push({
        id: `user_update_${user.id}`,
        timestamp: user.updated_at,
        user: "System",
        action: "User Profile Updated",
        resource: "User",
        resource_id: user.id,
        details: `Updated profile for ${user.name} (${user.email})`,
        ip_address: "N/A",
        user_agent: "N/A",
        severity: "info",
      });
    });

    // Sales order activities
    const salesActivities = await SalesOrder.findAll({
      limit: 15,
      offset: 0,
      order: [["updated_at", "DESC"]],
      include: [{ model: Customer, as: "customer", attributes: ["name"] }],
    });

    salesActivities.forEach((order) => {
      auditLogs.push({
        id: `sales_${order.id}`,
        timestamp: order.updated_at,
        user: "Sales Team",
        action: `Order ${order.status}`,
        resource: "Sales Order",
        resource_id: order.id,
        details: `Order ${order.order_number} status changed to ${order.status}`,
        ip_address: "N/A",
        user_agent: "N/A",
        severity: "info",
      });
    });

    // Purchase order activities
    const purchaseActivities = await PurchaseOrder.findAll({
      limit: 15,
      offset: 0,
      order: [["updated_at", "DESC"]],
      include: [{ model: Vendor, as: "vendor", attributes: ["name"] }],
    });

    purchaseActivities.forEach((order) => {
      auditLogs.push({
        id: `purchase_${order.id}`,
        timestamp: order.updated_at,
        user: "Procurement Team",
        action: `Order ${order.status}`,
        resource: "Purchase Order",
        resource_id: order.id,
        details: `Order ${order.order_number} status changed to ${order.status}`,
        ip_address: "N/A",
        user_agent: "N/A",
        severity: "info",
      });
    });

    // Production activities
    const productionActivities = await ProductionOrder.findAll({
      limit: 15,
      offset: 0,
      order: [["updated_at", "DESC"]],
    });

    productionActivities.forEach((order) => {
      auditLogs.push({
        id: `production_${order.id}`,
        timestamp: order.updated_at,
        user: "Manufacturing Team",
        action: `Production ${order.status}`,
        resource: "Production Order",
        resource_id: order.id,
        details: `Production order ${order.production_number} status changed to ${order.status}`,
        ip_address: "N/A",
        user_agent: "N/A",
        severity: "info",
      });
    });

    // Sort all audit logs by timestamp descending
    auditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Paginate
    const paginatedLogs = auditLogs.slice(offset, offset + limit);
    const totalLogs = auditLogs.length;

    res.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total: totalLogs,
        pages: Math.ceil(totalLogs / limit),
      },
    });
  } catch (error) {
    console.error("Audit logs error:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

// System backup (stub)
router.get("/backup", authenticateToken, async (req, res) => {
  try {
    // TODO: Implement actual backup logic (database/files)
    // For now, just return a status message
    res.json({ message: "System backup triggered (stub)" });
  } catch (error) {
    console.error("Backup error:", error);
    res.status(500).json({ message: "Failed to trigger backup" });
  }
});

// System reports (stub)
router.get("/system-reports", authenticateToken, async (req, res) => {
  try {
    // TODO: Generate and return system reports (PDF/CSV/etc.)
    res.json({ message: "System reports generated (stub)" });
  } catch (error) {
    console.error("System reports error:", error);
    res.status(500).json({ message: "Failed to generate system reports" });
  }
});

// Export data (stub)
router.get("/export", authenticateToken, async (req, res) => {
  try {
    // TODO: Export admin data (users, roles, logs, etc.)
    res.json({ message: "Data export started (stub)" });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Failed to export data" });
  }
});

// Get comprehensive department-wise analytics
router.get("/departments-analytics", authenticateToken, async (req, res) => {
  try {
    const departments = [
      "sales",
      "procurement",
      "manufacturing",
      "inventory",
      "finance",
      "shipment",
      "store",
      "outsourcing",
      "samples",
      "admin"
    ];

    const departmentsAnalytics = {};

    for (const dept of departments) {
      // Get employees in department
      const employees = await User.findAll({
        where: { department: dept },
        attributes: ["id", "name", "email", "status", "created_at"],
        raw: true
      });

      // Get department-specific stats
      let deptStats = {
        department: dept,
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status === "active").length,
        employees: employees,
        projects: 0,
        activeProjects: 0,
        totalValue: 0,
        pendingItems: 0,
        completedItems: 0,
        kpis: {}
      };

      // Department-specific metrics
      if (dept === "sales") {
        const orders = await SalesOrder.findAll({
          attributes: ["id", "order_number", "status", "final_amount", "created_at"],
          raw: true
        });
        deptStats.projects = orders.length;
        deptStats.activeProjects = orders.filter(o => ["draft", "confirmed", "in_production"].includes(o.status)).length;
        deptStats.totalValue = parseFloat((await SalesOrder.sum("final_amount")) || 0);
        deptStats.completedItems = orders.filter(o => o.status === "delivered").length;
        deptStats.kpis = {
          ordersCount: orders.length,
          totalRevenue: deptStats.totalValue,
          avgOrderValue: deptStats.totalValue / (orders.length || 1),
          completionRate: ((deptStats.completedItems / orders.length) * 100 || 0).toFixed(2)
        };
      } else if (dept === "procurement") {
        const pos = await PurchaseOrder.findAll({
          attributes: ["id", "po_number", "status", "final_amount", "created_at"],
          raw: true
        });
        deptStats.projects = pos.length;
        deptStats.activeProjects = pos.filter(p => ["draft", "pending", "approved"].includes(p.status)).length;
        deptStats.totalValue = parseFloat((await PurchaseOrder.sum("final_amount")) || 0);
        deptStats.pendingItems = pos.filter(p => ["pending", "approved"].includes(p.status)).length;
        deptStats.completedItems = pos.filter(p => p.status === "received").length;
        deptStats.kpis = {
          posCount: pos.length,
          totalSpend: deptStats.totalValue,
          avgPOValue: deptStats.totalValue / (pos.length || 1),
          pendingApprovals: deptStats.pendingItems
        };
      } else if (dept === "manufacturing") {
        const orders = await ProductionOrder.findAll({
          attributes: ["id", "production_number", "status", "created_at"],
          raw: true
        });
        deptStats.projects = orders.length;
        deptStats.activeProjects = orders.filter(o => ["in_progress", "started"].includes(o.status)).length;
        deptStats.completedItems = orders.filter(o => o.status === "completed").length;
        deptStats.kpis = {
          productionOrders: orders.length,
          inProgress: deptStats.activeProjects,
          completed: deptStats.completedItems,
          completionRate: ((deptStats.completedItems / orders.length) * 100 || 0).toFixed(2)
        };
      } else if (dept === "inventory") {
        const items = await Inventory.findAll({
          attributes: ["id", "product_id", "available_stock", "total_value"],
          raw: true
        });
        deptStats.projects = items.length;
        deptStats.totalValue = parseFloat((await Inventory.sum("total_value")) || 0);
        const lowStock = items.filter(i => i.available_stock <= 10).length;
        deptStats.kpis = {
          totalItems: items.length,
          totalInventoryValue: deptStats.totalValue,
          lowStockItems: lowStock,
          avgItemValue: deptStats.totalValue / (items.length || 1)
        };
      } else if (dept === "shipment") {
        const shipments = await Shipment.findAll({
          attributes: ["id", "shipment_number", "status", "shipping_cost", "created_at"],
          raw: true
        });
        deptStats.projects = shipments.length;
        deptStats.activeProjects = shipments.filter(s => ["preparing", "packed", "ready_to_ship", "in_transit"].includes(s.status)).length;
        deptStats.completedItems = shipments.filter(s => s.status === "delivered").length;
        deptStats.totalValue = parseFloat((await Shipment.sum("shipping_cost")) || 0);
        deptStats.kpis = {
          totalShipments: shipments.length,
          inTransit: deptStats.activeProjects,
          delivered: deptStats.completedItems,
          totalShippingCost: deptStats.totalValue
        };
      } else if (dept === "store") {
        const stocks = await StoreStock.findAll({
          attributes: ["id", "current_stock", "total_cost_value"],
          raw: true
        });
        deptStats.totalValue = parseFloat((await StoreStock.sum("total_cost_value")) || 0);
        const totalStock = (await StoreStock.sum("current_stock")) || 0;
        deptStats.kpis = {
          totalStockItems: stocks.length,
          currentStockQuantity: totalStock,
          totalStoreValue: deptStats.totalValue,
          avgStockValue: deptStats.totalValue / (stocks.length || 1)
        };
      } else if (dept === "finance") {
        const payments = await Payment.findAll({
          attributes: ["id", "payment_number", "status", "amount", "created_at"],
          raw: true
        });
        deptStats.projects = payments.length;
        deptStats.totalValue = parseFloat((await Payment.sum("amount")) || 0);
        deptStats.pendingItems = payments.filter(p => p.status === "pending").length;
        deptStats.completedItems = payments.filter(p => p.status === "completed").length;
        deptStats.kpis = {
          totalTransactions: payments.length,
          totalAmount: deptStats.totalValue,
          pendingPayments: deptStats.pendingItems,
          completedPayments: deptStats.completedItems
        };
      } else if (dept === "samples") {
        const samples = await Sample.findAll({
          attributes: ["id", "sample_number", "status", "created_at"],
          raw: true
        });
        deptStats.projects = samples.length;
        deptStats.activeProjects = samples.filter(s => ["pending", "in_progress"].includes(s.status)).length;
        deptStats.completedItems = samples.filter(s => s.status === "completed").length;
        deptStats.kpis = {
          totalSamples: samples.length,
          inProgress: deptStats.activeProjects,
          completed: deptStats.completedItems
        };
      }

      departmentsAnalytics[dept] = deptStats;
    }

    res.json(departmentsAnalytics);
  } catch (error) {
    console.error("Departments analytics error:", error);
    res.status(500).json({ message: "Failed to fetch departments analytics", error: error.message });
  }
});

// Get specific department details with projects and employees
router.get("/department/:departmentName", authenticateToken, async (req, res) => {
  try {
    const { departmentName } = req.params;
    const validDepartments = [
      "sales",
      "procurement",
      "manufacturing",
      "inventory",
      "finance",
      "shipment",
      "store",
      "outsourcing",
      "samples",
      "admin"
    ];

    if (!validDepartments.includes(departmentName)) {
      return res.status(400).json({ message: "Invalid department name" });
    }

    // Get all employees in department
    const employees = await User.findAll({
      where: { department: departmentName },
      attributes: ["id", "name", "email", "phone", "status", "created_at"],
      raw: true
    });

    let departmentData = {
      department: departmentName,
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === "active").length,
      employees: employees,
      projects: [],
      stats: {},
      recentActivities: []
    };

    // Get department-specific data
    if (departmentName === "sales") {
      const orders = await SalesOrder.findAll({
        attributes: [
          "id",
          "order_number",
          "status",
          "final_amount",
          "created_at",
          "updated_at",
          "delivery_date"
        ],
        order: [["created_at", "DESC"]],
        limit: 50,
        raw: true
      });

      departmentData.projects = orders;
      departmentData.stats = {
        totalOrders: orders.length,
        totalRevenue: parseFloat((await SalesOrder.sum("final_amount")) || 0),
        pendingOrders: orders.filter(o => ["draft", "confirmed"].includes(o.status)).length,
        completedOrders: orders.filter(o => o.status === "delivered").length,
        inProductionOrders: orders.filter(o => o.status === "in_production").length
      };
    } else if (departmentName === "procurement") {
      const pos = await PurchaseOrder.findAll({
        attributes: [
          "id",
          "po_number",
          "status",
          "final_amount",
          "created_at",
          "updated_at"
        ],
        order: [["created_at", "DESC"]],
        limit: 50,
        raw: true
      });

      departmentData.projects = pos;
      departmentData.stats = {
        totalPOs: pos.length,
        totalSpend: parseFloat((await PurchaseOrder.sum("final_amount")) || 0),
        pendingApproval: pos.filter(p => p.status === "pending").length,
        approved: pos.filter(p => p.status === "approved").length,
        received: pos.filter(p => p.status === "received").length
      };
    } else if (departmentName === "manufacturing") {
      const orders = await ProductionOrder.findAll({
        attributes: [
          "id",
          "production_number",
          "status",
          "created_at",
          "updated_at"
        ],
        order: [["created_at", "DESC"]],
        limit: 50,
        raw: true
      });

      departmentData.projects = orders;
      departmentData.stats = {
        totalOrders: orders.length,
        inProgress: orders.filter(o => o.status === "in_progress").length,
        completed: orders.filter(o => o.status === "completed").length,
        pending: orders.filter(o => o.status === "pending").length
      };
    } else if (departmentName === "shipment") {
      const shipments = await Shipment.findAll({
        attributes: [
          "id",
          "shipment_number",
          "status",
          "shipping_cost",
          "created_at"
        ],
        order: [["created_at", "DESC"]],
        limit: 50,
        raw: true
      });

      departmentData.projects = shipments;
      departmentData.stats = {
        totalShipments: shipments.length,
        inTransit: shipments.filter(s => s.status === "in_transit").length,
        delivered: shipments.filter(s => s.status === "delivered").length,
        pending: shipments.filter(s => ["preparing", "packed", "ready_to_ship"].includes(s.status)).length,
        totalShippingCost: parseFloat((await Shipment.sum("shipping_cost")) || 0)
      };
    } else if (departmentName === "finance") {
      const payments = await Payment.findAll({
        attributes: [
          "id",
          "payment_number",
          "status",
          "amount",
          "created_at"
        ],
        order: [["created_at", "DESC"]],
        limit: 50,
        raw: true
      });

      departmentData.projects = payments;
      departmentData.stats = {
        totalTransactions: payments.length,
        totalAmount: parseFloat((await Payment.sum("amount")) || 0),
        pending: payments.filter(p => p.status === "pending").length,
        completed: payments.filter(p => p.status === "completed").length
      };
    } else if (departmentName === "inventory") {
      const items = await Inventory.findAll({
        attributes: [
          "id",
          "product_id",
          "available_stock",
          "total_value",
          "created_at"
        ],
        order: [["created_at", "DESC"]],
        limit: 50,
        raw: true
      });

      departmentData.projects = items;
      departmentData.stats = {
        totalItems: items.length,
        totalInventoryValue: parseFloat((await Inventory.sum("total_value")) || 0),
        lowStockItems: items.filter(i => i.available_stock <= 10).length,
        outOfStock: items.filter(i => i.available_stock === 0).length
      };
    }

    res.json(departmentData);
  } catch (error) {
    console.error("Department details error:", error);
    res.status(500).json({ message: "Failed to fetch department details", error: error.message });
  }
});

// Get employee-wise performance metrics for a department
router.get("/department/:departmentName/employee-performance", authenticateToken, async (req, res) => {
  try {
    const { departmentName } = req.params;

    const employees = await User.findAll({
      where: { department: departmentName },
      attributes: ["id", "name", "email", "status", "created_at"],
      raw: true
    });

    const employeeMetrics = [];

    for (const emp of employees) {
      let metrics = {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        status: emp.status,
        joinDate: emp.created_at,
        assignedTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        performance: "N/A"
      };

      // Get performance data based on department
      if (departmentName === "sales") {
        // Could be connected via created_by field
        metrics.assignedTasks = 0;
      } else if (departmentName === "procurement") {
        metrics.assignedTasks = 0;
      } else if (departmentName === "manufacturing") {
        metrics.assignedTasks = 0;
      }

      employeeMetrics.push(metrics);
    }

    res.json({
      department: departmentName,
      totalEmployees: employees.length,
      employees: employeeMetrics
    });
  } catch (error) {
    console.error("Employee performance error:", error);
    res.status(500).json({ message: "Failed to fetch employee performance", error: error.message });
  }
});

// Export data (stub)
router.get("/export", authenticateToken, async (req, res) => {
  try {
    // TODO: Export admin data (users, roles, logs, etc.)
    res.json({ message: "Data export started (stub)" });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Failed to export data" });
  }
});

module.exports = router;
