// Send sales order to procurement (dedicated endpoint)
const express = require("express");
const { Op, fn, col, literal } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  SalesOrder,
  Customer,
  User,
  ProductionOrder,
  Challan,
  Product,
  Vendor,
  PurchaseOrder,
  ProductionRequest,
  Invoice,
  SalesOrderHistory,
  Shipment,
  sequelize,
} = require("../config/database");
const { authenticateToken, checkDepartment } = require("../middleware/auth");
const NotificationService = require("../utils/notificationService");

const router = express.Router();

// Multer configuration for design file uploads
const uploadDir = path.join(__dirname, '../uploads');

// Ensure temp upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueSuffix + '-' + sanitizedName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const generateProductionRequestNumber = async (transaction) => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
  const lastRequest = await ProductionRequest.findOne({
    where: {
      request_number: {
        [Op.like]: `PRQ-${dateStr}-%`,
      },
    },
    order: [["created_at", "DESC"]],
    transaction,
  });

  let sequence = 1;
  if (lastRequest) {
    const lastSequence = parseInt(lastRequest.request_number.split("-")[2], 10);
    sequence = Number.isNaN(lastSequence) ? 1 : lastSequence + 1;
  }

  return `PRQ-${dateStr}-${sequence.toString().padStart(5, "0")}`;
};

const buildProductionRequestPayloadFromOrder = (
  order,
  requestNumber,
  userId
) => {
  const orderItems = order.items || [];
  const productSummary = orderItems
    .map(
      (item) =>
        `${item.description || item.product_name || "Product"} (${
          item.quantity
        } ${item.unit || "pcs"})`
    )
    .join(", ");

  const totalQuantity = orderItems.reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0),
    0
  );

  return {
    request_number: requestNumber,
    sales_order_id: order.id,
    sales_order_number: order.order_number,
    project_name:
      order.project_name || order.project_title || `SO-${order.order_number}`,
    product_name:
      orderItems[0]?.description ||
      orderItems[0]?.product_name ||
      "Multiple Products",
    product_description: productSummary,
    product_specifications: {
      items: orderItems,
      customer_name: order.customer?.name,
      garment_specifications: order.garment_specifications,
    },
    quantity: totalQuantity,
    unit: orderItems[0]?.unit || "pcs",
    priority: order.priority || "medium",
    required_date: order.delivery_date,
    sales_notes: `Production request for Sales Order ${
      order.order_number
    }. Customer: ${order.customer?.name || "N/A"}`,
    status: "pending",
    requested_by: userId,
  };
};

const sendProductionRequestNotification = async (
  productionRequest,
  order,
  transaction
) => {
  await NotificationService.sendToDepartment(
    "manufacturing",
    {
      type: "manufacturing",
      title: `New Production Request: ${productionRequest.request_number}`,
      message: `Production Request ${productionRequest.request_number} created for Sales Order ${order.order_number}. Please review and create Material Request for Manufacturing (MRN).`,
      priority: order.priority || "high",
      related_order_id: order.id,
      related_entity_id: productionRequest.id,
      related_entity_type: "production_request",
      action_url: `/manufacturing/production-requests/${productionRequest.id}`,
      metadata: {
        request_number: productionRequest.request_number,
        sales_order_number: order.order_number,
        customer_name: order.customer?.name || "N/A",
        project_name: productionRequest.project_name,
        total_quantity: productionRequest.quantity,
        product_name: productionRequest.product_name,
        required_date: order.delivery_date,
      },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    transaction
  );
};

// Create production request from sales order (standalone endpoint)
router.post(
  "/orders/:id/request-production",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    const transaction =
      await require("../config/database").sequelize.transaction();

    try {
      const { id } = req.params;

      // Get sales order with customer details
      const order = await SalesOrder.findByPk(id, {
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["id", "name", "customer_code", "email", "phone"],
          },
        ],
        transaction,
      });

      if (!order) {
        await transaction.rollback();
        return res.status(404).json({
          message: "Sales order not found",
        });
      }

      // Check if order is in a valid state
      if (order.status === "cancelled" || order.status === "draft") {
        await transaction.rollback();
        return res.status(400).json({
          message: `Cannot create production request for ${order.status} order`,
        });
      }

      // ✅ CHECK FOR DUPLICATE: Prevent multiple production requests for same sales order
      const existingRequest = await ProductionRequest.findOne({
        where: {
          sales_order_id: id,
          status: {
            [Op.notIn]: ["cancelled"], // Ignore cancelled requests
          },
        },
        transaction,
      });

      if (existingRequest) {
        await transaction.rollback();
        return res.status(409).json({
          message: "Production request already exists for this sales order",
          existingRequest: {
            id: existingRequest.id,
            request_number: existingRequest.request_number,
            status: existingRequest.status,
            created_at: existingRequest.created_at,
          },
        });
      }

      // Generate and create production request
      const requestNumber = await generateProductionRequestNumber(transaction);
      const payload = buildProductionRequestPayloadFromOrder(
        order,
        requestNumber,
        req.user.id
      );
      const productionRequest = await ProductionRequest.create(payload, {
        transaction,
      });

      // Send notification to manufacturing
      await sendProductionRequestNotification(
        productionRequest,
        order,
        transaction
      );

      await transaction.commit();

      res.json({
        message: "Production request created successfully",
        productionRequest: {
          id: productionRequest.id,
          request_number: productionRequest.request_number,
          project_name: productionRequest.project_name,
          status: productionRequest.status,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Create production request error:", error);
      res.status(500).json({
        message: "Failed to create production request",
        error: error.message,
      });
    }
  }
);

// Get all customers
router.get("/customers", authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    const where = { status: "active" };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { customer_code: { [Op.like]: `%${search}%` } },
        { company_name: { [Op.like]: `%${search}%` } },
      ];
    }

    const customers = await Customer.findAll({
      where,
      attributes: [
        "id",
        "customer_code",
        "name",
        "company_name",
        "email",
        "phone",
      ],
      order: [["name", "ASC"]],
    });

    res.json({ customers });
  } catch (error) {
    console.error("Customers fetch error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch customers", error: error.message });
  }
});

const generatePurchaseOrderNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  const lastPurchaseOrder = await PurchaseOrder.findOne({
    where: {
      po_number: {
        [Op.like]: `PO-${dateStr}-%`,
      },
    },
    order: [["created_at", "DESC"]],
  });

  let sequence = 1;

  if (lastPurchaseOrder) {
    const lastSequence = parseInt(
      lastPurchaseOrder.po_number.split("-")[2],
      10
    );
    sequence = Number.isNaN(lastSequence) ? 1 : lastSequence + 1;
  }

  return `PO-${dateStr}-${sequence.toString().padStart(4, "0")}`;
};

// Generate sales order number
const generateOrderNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  const lastOrder = await SalesOrder.findOne({
    where: {
      order_number: {
        [Op.like]: `SO-${dateStr}-%`,
      },
    },
    order: [["created_at", "DESC"]],
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.order_number.split("-")[2], 10);
    sequence = Number.isNaN(lastSequence) ? 1 : lastSequence + 1;
  }

  return `SO-${dateStr}-${sequence.toString().padStart(4, "0")}`;
};

// Send sales order to procurement (dedicated endpoint)
router.put(
  "/orders/:id/send-to-procurement",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    const transaction =
      await require("../config/database").sequelize.transaction();

    try {
      const order = await SalesOrder.findByPk(req.params.id, {
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["id", "name", "customer_code", "email", "phone"],
          },
        ],
      });

      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ message: "Sales order not found" });
      }

      if (order.status !== "draft") {
        await transaction.rollback();
        return res.status(400).json({
          message: "Only draft orders can be sent to procurement",
          currentStatus: order.status,
        });
      }

      // Update procurement flags only - status remains 'draft' until procurement accepts
      await order.update(
        {
          ready_for_procurement: true,
          ready_for_procurement_by: req.user.id,
          ready_for_procurement_at: new Date(),
        },
        { transaction }
      );

      // Send notification to procurement department
      await NotificationService.sendToDepartment(
        "procurement",
        {
          type: "procurement",
          title: `New Sales Order Request: ${order.order_number}`,
          message: `Sales Order ${order.order_number} has been sent to procurement and awaiting acceptance`,
          priority: "high",
          related_order_id: order.id,
          action_url: `/procurement/create-po?so_id=${order.id}`,
          metadata: {
            order_number: order.order_number,
            customer_name: order.customer?.name || "N/A",
            total_quantity: order.total_quantity,
            delivery_date: order.delivery_date,
            status: "draft",
          },
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        transaction
      );

      // ALSO create Production Request to Manufacturing department
      // Generate and send production request for manufacturing
      const requestNumber = await generateProductionRequestNumber(transaction);
      const payload = buildProductionRequestPayloadFromOrder(
        order,
        requestNumber,
        req.user.id
      );
      const productionRequest = await ProductionRequest.create(payload, {
        transaction,
      });
      await sendProductionRequestNotification(
        productionRequest,
        order,
        transaction
      );

      await transaction.commit();

      res.json({
        message:
          "Sales order sent to procurement and production request created for manufacturing successfully",
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          ready_for_procurement: order.ready_for_procurement,
          approved_by: order.approved_by,
          approved_at: order.approved_at,
        },
        productionRequest: {
          id: productionRequest.id,
          request_number: productionRequest.request_number,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Send to procurement error:", error);
      res.status(500).json({
        message: "Failed to send sales order to procurement",
        error: error.message,
      });
    }
  }
);
router.get(
  "/orders",
  authenticateToken,
  checkDepartment(["sales", "admin", "procurement"]),
  async (req, res) => {
    try {
      console.log("=== SALES ORDERS FETCH START ===");
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        customer_id,
        date_from,
        date_to,
        search,
      } = req.query;
      console.log("Query params:", {
        page,
        limit,
        status,
        priority,
        customer_id,
        date_from,
        date_to,
        search,
      });

      const offset = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (customer_id) where.customer_id = customer_id;

      if (date_from || date_to) {
        where.order_date = {};
        if (date_from) where.order_date[Op.gte] = new Date(date_from);
        if (date_to) where.order_date[Op.lte] = new Date(`${date_to} 23:59:59`);
      }

      if (search) {
        where[Op.or] = [
          { order_number: { [Op.like]: `%${search}%` } },
          { special_instructions: { [Op.like]: `%${search}%` } },
        ];
      }

      console.log("Where clause:", where);

      console.log("Fetching sales orders...");
      const { count, rows } = await SalesOrder.findAndCountAll({
        where,
        attributes: {
          include: [
            "id",
            "order_number",
            "customer_id",
            "product_id",
            "product_name",
            "order_date",
            "delivery_date",
            "buyer_reference",
            "order_type",
            "items",
            "qr_code",
            "garment_specifications",
            "total_quantity",
            "total_amount",
            "discount_percentage",
            "discount_amount",
            "tax_percentage",
            "tax_amount",
            "final_amount",
            "status",
            "priority",
            "payment_terms",
            "shipping_address",
            "billing_address",
            "special_instructions",
            "internal_notes",
            "created_by",
            "approved_by",
            "approved_at",
            "created_at",
            "updated_at",
            "project_name",
            "project_reference",
            "ready_for_procurement",
          ],
        },
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["id", "name", "customer_code", "email", "phone"],
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "employee_id"],
          },
          {
            model: ProductionOrder,
            as: "productionOrders",
            attributes: ["id", "production_number", "status"],
          },
          {
            model: PurchaseOrder,
            as: "linkedPurchaseOrder",
            attributes: ["id", "po_number", "status", "po_date"],
            required: false, // LEFT JOIN to include sales orders even without POs
          },
        ],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });

      console.log("Fetched orders:", rows.length, "total count:", count);

      const responseData = {
        orders: rows,
        pagination: {
          total: count,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(count / limit),
        },
      };

      res.json(responseData);
      console.log("=== SALES ORDERS FETCH END ===");
    } catch (error) {
      console.error("Sales orders fetch error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        message: "Failed to fetch sales orders",
        error: error.message,
      });
    }
  }
);

// Get single sales order
router.get(
  "/orders/:id",
  authenticateToken,
  checkDepartment([
    "sales",
    "admin",
    "procurement",
    "manufacturing",
    "inventory",
    "shipment",
  ]),
  async (req, res) => {
    try {
      const order = await SalesOrder.findByPk(req.params.id, {
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
              "billing_address",
              "shipping_address",
              "gst_number",
            ],
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "employee_id"],
          },
          {
            model: User,
            as: "approver",
            attributes: ["id", "name", "employee_id"],
          },
          {
            model: ProductionOrder,
            as: "productionOrders",
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["id", "name", "product_code"],
              },
            ],
          },
          {
            model: Challan,
            as: "challans",
            attributes: ["id", "challan_number", "type", "status"],
          },
        ],
      });

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      res.json({ order });
    } catch (error) {
      console.error("Sales order fetch error:", error);
      res.status(500).json({ message: "Failed to fetch sales order" });
    }
  }
);

// Get sales orders summary for dropdowns
router.get(
  "/orders/summary",
  authenticateToken,
  checkDepartment(["sales", "admin", "manufacturing"]),
  async (req, res) => {
    try {
      const {
        status = "confirmed",
        product_id,
        limit = 100,
        search,
      } = req.query;

      const where = {};

      if (status) {
        where.status = Array.isArray(status) ? status : [status];
      }

      if (search) {
        where[Op.or] = [
          { order_number: { [Op.like]: `%${search}%` } },
          { special_instructions: { [Op.like]: `%${search}%` } },
        ];
      }

      const include = [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name"],
        },
      ];

      if (product_id) {
        include.push({
          model: Product,
          as: "products",
          attributes: ["id", "name"],
          through: { attributes: [] },
        });
      }

      const orders = await SalesOrder.findAll({
        where: {
          ...(where.status && { status: { [Op.in]: where.status } }),
          ...(where[Op.or] ? { [Op.or]: where[Op.or] } : {}),
        },
        include,
        order: [["created_at", "DESC"]],
        limit: Math.min(parseInt(limit, 10), 200),
      });

      res.json({
        orders: orders.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer ? order.customer.name : null,
          delivery_date: order.delivery_date,
          status: order.status,
        })),
      });
    } catch (error) {
      console.error("Sales orders summary fetch error:", error);
      res.status(500).json({ message: "Failed to fetch sales orders summary" });
    }
  }
);

// Create new sales order
router.post("/orders", authenticateToken, async (req, res) => {
  try {
    const {
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      delivery_date,
      buyer_reference,
      order_type,
      items,
      discount_percentage = 0,
      tax_percentage = 0,
      payment_terms,
      shipping_address,
      billing_address,
      special_instructions,
      priority = "medium",
      garment_specifications,
      project_title,
    } = req.body;

    // Validate required fields
    if (
      (!customer_id && !customer_name) ||
      !delivery_date ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Customer, delivery date, and items are required" });
    }

    let customer;
    if (customer_id) {
      // If customer_id is provided, find existing customer
      customer = await Customer.findByPk(customer_id);
      if (!customer) {
        return res.status(400).json({ message: "Customer not found" });
      }
    } else if (customer_name) {
      // If customer_name is provided, find or create customer
      customer = await Customer.findOne({
        where: { name: customer_name.trim() },
      });
      if (!customer) {
        // Generate customer code
        const customerCode = `CUST${Date.now().toString().slice(-6)}`;
        customer = await Customer.create({
          customer_code: customerCode,
          name: customer_name.trim(),
          email: customer_email || null,
          phone: customer_phone || null,
          customer_type: "business",
          created_by: req.user.id,
        });
      }
    } else {
      return res
        .status(400)
        .json({ message: "Customer information is required" });
    }

    // Validate line items
    const validatedItems = items.map((item, index) => {
      if (!item.product_id || !item.description) {
        throw new Error(
          `Item ${index + 1}: product_id and description are required`
        );
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Item ${index + 1}: quantity must be greater than 0`);
      }
      if (!item.unit_price || item.unit_price <= 0) {
        throw new Error(`Item ${index + 1}: unit_price must be greater than 0`);
      }

      return {
        product_id: item.product_id,
        item_code: item.item_code || null,
        product_type: item.product_type || null,
        style_number: item.style_number || null,
        fabric_type: item.fabric_type || null,
        color: item.color || null,
        size_breakdown: item.size_breakdown || null,
        description: item.description,
        specifications: item.specifications || null,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
        unit_of_measure: item.unit_of_measure || "pcs",
        tax_percentage:
          item.tax_percentage !== undefined
            ? parseFloat(item.tax_percentage)
            : null,
        discount_percentage:
          item.discount_percentage !== undefined
            ? parseFloat(item.discount_percentage)
            : null,
        total: parseFloat(item.quantity) * parseFloat(item.unit_price),
        remarks: item.remarks || null,
      };
    });

    // Calculate totals
    const total_quantity = validatedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const gross_amount = validatedItems.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const discount_amount = (gross_amount * discount_percentage) / 100;
    const net_after_discount = gross_amount - discount_amount;
    const tax_amount = (net_after_discount * tax_percentage) / 100;
    const final_amount = net_after_discount + tax_amount;

    // Generate order number
    const order_number = await generateOrderNumber();

    const qrSnapshot = {
      order_number,
      customer_id: customer.id,
      total_quantity,
      final_amount,
      delivery_date,
      status: "draft",
      created_at: new Date().toISOString(),
    };

    // Generate QR code data
    const qrCodeData = JSON.stringify(qrSnapshot);

    // Generate meaningful project_name if not provided
    let finalProjectName = project_title || buyer_reference;
    if (!finalProjectName || finalProjectName.trim() === '') {
      // Fallback to customer name if available
      finalProjectName = customer?.name || `SO-${order_number}`;
    }

    const order = await SalesOrder.create({
      order_number,
      customer_id: customer.id,
      order_date: new Date(),
      delivery_date,
      buyer_reference,
      order_type,
      items: validatedItems,
      total_quantity,
      total_amount: gross_amount,
      discount_percentage,
      discount_amount,
      tax_percentage,
      tax_amount,
      final_amount,
      advance_paid: 0,
      balance_amount: final_amount,
      payment_terms,
      shipping_address,
      billing_address,
      special_instructions,
      priority,
      garment_specifications,
      project_name: finalProjectName,
      qr_code: qrCodeData,
      created_by: req.user.id,
      status: "draft",
      invoice_status: "pending",
      challan_status: "pending",
      procurement_status: "not_requested",
    });

    // Send notification to sales team and management
    await NotificationService.sendToDepartment("sales", {
      type: "order",
      title: `New Sales Order Created: ${order_number}`,
      message: `Sales Order ${order_number} has been created for ${customer.name} with ${total_quantity} items`,
      priority: "medium",
      related_order_id: order.id,
      action_url: `/sales/orders/${order.id}`,
      metadata: {
        order_number,
        customer_name: customer.name,
        total_quantity,
        final_amount,
        delivery_date,
      },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.status(201).json({
      message: "Sales order created successfully",
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_quantity: order.total_quantity,
        final_amount: order.final_amount,
      },
    });
  } catch (error) {
    console.error("Sales order creation error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create sales order" });
  }
});

// Update sales order
router.put(
  "/orders/:id",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      const order = await SalesOrder.findByPk(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      // Only allow updates if order is in draft or confirmed status
      if (!["draft", "confirmed"].includes(order.status)) {
        return res
          .status(400)
          .json({ message: "Cannot update order in current status" });
      }

      const {
        delivery_date,
        buyer_reference,
        order_type,
        items,
        discount_percentage,
        tax_percentage,
        payment_terms,
        shipping_address,
        billing_address,
        special_instructions,
        priority,
      } = req.body;

      const updateData = {};

      if (delivery_date) updateData.delivery_date = delivery_date;
      if (buyer_reference !== undefined)
        updateData.buyer_reference = buyer_reference;
      if (order_type) updateData.order_type = order_type;
      if (payment_terms) updateData.payment_terms = payment_terms;
      if (shipping_address) updateData.shipping_address = shipping_address;
      if (billing_address) updateData.billing_address = billing_address;
      if (special_instructions !== undefined)
        updateData.special_instructions = special_instructions;
      if (priority) updateData.priority = priority;

      if (items) {
        const validatedItems = items.map((item, index) => {
          if (!item.product_id || !item.description) {
            throw new Error(
              `Item ${index + 1}: product_id and description are required`
            );
          }
          if (!item.quantity || item.quantity <= 0) {
            throw new Error(
              `Item ${index + 1}: quantity must be greater than 0`
            );
          }
          if (!item.unit_price || item.unit_price <= 0) {
            throw new Error(
              `Item ${index + 1}: unit_price must be greater than 0`
            );
          }

          return {
            product_id: item.product_id,
            item_code: item.item_code || null,
            product_type: item.product_type || null,
            style_number: item.style_number || null,
            fabric_type: item.fabric_type || null,
            color: item.color || null,
            size_breakdown: item.size_breakdown || null,
            description: item.description,
            specifications: item.specifications || null,
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unit_price),
            unit_of_measure: item.unit_of_measure || "pcs",
            tax_percentage:
              item.tax_percentage !== undefined
                ? parseFloat(item.tax_percentage)
                : null,
            discount_percentage:
              item.discount_percentage !== undefined
                ? parseFloat(item.discount_percentage)
                : null,
            total: parseFloat(item.quantity) * parseFloat(item.unit_price),
            remarks: item.remarks || null,
          };
        });

        updateData.items = validatedItems;
        updateData.total_quantity = validatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        updateData.total_amount = validatedItems.reduce(
          (sum, item) => sum + item.total,
          0
        );

        const discount_perc =
          discount_percentage !== undefined
            ? discount_percentage
            : order.discount_percentage;
        const tax_perc =
          tax_percentage !== undefined ? tax_percentage : order.tax_percentage;

        updateData.discount_percentage = discount_perc;
        updateData.tax_percentage = tax_perc;
        updateData.discount_amount =
          (updateData.total_amount * discount_perc) / 100;
        const net_after_discount =
          updateData.total_amount - updateData.discount_amount;
        updateData.tax_amount = (net_after_discount * tax_perc) / 100;
        updateData.final_amount = net_after_discount + updateData.tax_amount;
      }

      if (discount_percentage !== undefined)
        updateData.discount_percentage = discount_percentage;
      if (tax_percentage !== undefined)
        updateData.tax_percentage = tax_percentage;

      const previousStatus = order.status;

      await order.update(updateData);

      await order.reload({
        include: [
          { model: Customer, as: "customer", attributes: ["id", "name"] },
        ],
      });

      if (updateData.status && updateData.status !== previousStatus) {
        await recordSalesOrderLifecycleEvent(
          order,
          updateData.status,
          req.user.id,
          req.body.status_note
        );
        await NotificationService.notifyOrderStatusChange(
          order,
          previousStatus,
          updateData.status,
          req.user.id
        );
      }

      res.json({ message: "Sales order updated successfully", order });
    } catch (error) {
      console.error("Sales order update error:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to update sales order" });
    }
  }
);

// Confirm sales order
router.put(
  "/orders/:id/confirm",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      const order = await SalesOrder.findByPk(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      if (order.status !== "draft") {
        return res
          .status(400)
          .json({ message: "Only draft orders can be confirmed" });
      }

      await order.update({
        status: "confirmed",
        approved_by: req.user.id,
        approved_at: new Date(),
        ready_for_procurement: true,
        ready_for_procurement_by: req.user.id,
        ready_for_procurement_at: new Date(),
      });

      // Send notification to procurement department
      await NotificationService.sendToDepartment("procurement", {
        type: "order",
        title: `Sales Order Confirmed: ${order.order_number}`,
        message: `Sales Order ${order.order_number} has been confirmed and requires procurement action`,
        priority: "high",
        related_order_id: order.id,
        action_url: `/procurement/create-po?so_id=${order.id}`,
        metadata: {
          order_number: order.order_number,
          customer_name: order.customer?.name,
          total_quantity: order.total_quantity,
          delivery_date: order.delivery_date,
          status: "confirmed",
        },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      res.json({ message: "Sales order confirmed successfully" });
    } catch (error) {
      console.error("Sales order confirmation error:", error);
      res.status(500).json({ message: "Failed to confirm sales order" });
    }
  }
);

// Cancel sales order
router.put(
  "/orders/:id/cancel",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      const { cancellation_reason } = req.body;

      if (!cancellation_reason) {
        return res
          .status(400)
          .json({ message: "Cancellation reason is required" });
      }

      const order = await SalesOrder.findByPk(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      if (["completed", "delivered", "cancelled"].includes(order.status)) {
        return res
          .status(400)
          .json({ message: "Cannot cancel order in current status" });
      }

      await order.update({
        status: "cancelled",
        internal_notes: `${
          order.internal_notes || ""
        }\nCancelled: ${cancellation_reason}`,
      });

      res.json({ message: "Sales order cancelled successfully" });
    } catch (error) {
      console.error("Sales order cancellation error:", error);
      res.status(500).json({ message: "Failed to cancel sales order" });
    }
  }
);

// Delete sales order (soft delete)
router.delete(
  "/orders/:id",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      const order = await SalesOrder.findByPk(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      if (!["draft", "cancelled"].includes(order.status)) {
        return res
          .status(400)
          .json({ message: "Only draft or cancelled orders can be deleted" });
      }

      await order.destroy();

      res.json({ message: "Sales order deleted successfully" });
    } catch (error) {
      console.error("Sales order deletion error:", error);
      res.status(500).json({ message: "Failed to delete sales order" });
    }
  }
);

// Get sales dashboard statistics
router.get(
  "/dashboard/stats",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      console.log("=== SALES DASHBOARD STATS START ===");
      const { period = "month" } = req.query;
      console.log("Period:", period);

      let dateFilter = {};
      const now = new Date();

      switch (period) {
        case "today": {
          const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
          dateFilter = { [Op.between]: [todayStart, todayEnd] };
          break;
        }
        case "week": {
          const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = { [Op.gte]: weekStart };
          break;
        }
        case "month": {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = { [Op.gte]: monthStart };
          break;
        }
        case "year": {
          const yearStart = new Date(now.getFullYear(), 0, 1);
          dateFilter = { [Op.gte]: yearStart };
          break;
        }
        default:
          break;
      }

      const whereCreatedAt = Object.keys(dateFilter).length
        ? { created_at: dateFilter }
        : {};
      console.log("Where filter:", whereCreatedAt);

      console.log("Fetching order statistics...");
      // Order statistics by status
      const orderStats = await SalesOrder.findAll({
        attributes: [
          "status",
          [fn("COUNT", col("id")), "count"],
          [fn("SUM", col("final_amount")), "total_amount"],
        ],
        where: whereCreatedAt,
        group: ["status"],
      });
      console.log("Order stats fetched:", orderStats.length, "records");

      console.log("Fetching total orders...");
      // Total orders and revenue
      const totalOrders = await SalesOrder.count({ where: whereCreatedAt });
      console.log("Total orders:", totalOrders);

      console.log("Fetching total revenue...");
      const totalRevenue = await SalesOrder.sum("final_amount", {
        where: {
          ...whereCreatedAt,
          status: { [Op.in]: ["completed", "delivered"] },
        },
      });
      console.log("Total revenue:", totalRevenue);

      console.log("Fetching pending orders...");
      // Pending orders (confirmed but not completed)
      const pendingOrders = await SalesOrder.count({
        where: {
          status: { [Op.in]: ["confirmed", "in_production", "ready_to_ship"] },
        },
      });
      console.log("Pending orders:", pendingOrders);

      console.log("Fetching overdue orders...");
      // Overdue orders
      const overdueOrders = await SalesOrder.count({
        where: {
          delivery_date: { [Op.lt]: new Date() },
          status: { [Op.notIn]: ["completed", "delivered", "cancelled"] },
        },
      });
      console.log("Overdue orders:", overdueOrders);

      console.log("Fetching top customers...");
      // Top customers by revenue
      const topCustomers = await SalesOrder.findAll({
        attributes: [
          [col("SalesOrder.customer_id"), "customer_id"],
          [fn("COUNT", col("SalesOrder.id")), "orders_count"],
          [fn("SUM", col("SalesOrder.final_amount")), "revenue"],
        ],
        where: whereCreatedAt,
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["id", "name", "customer_code"],
          },
        ],
        group: ["SalesOrder.customer_id", "customer.id"],
        order: [[literal("revenue"), "DESC"]],
        limit: 5,
      });
      console.log("Top customers fetched:", topCustomers.length, "records");

      console.log("Fetching trend data...");
      // Monthly trend for charts
      const trendData = await SalesOrder.findAll({
        attributes: [
          [fn("DATE_FORMAT", col("order_date"), "%Y-%m"), "month"],
          [fn("COUNT", col("id")), "orders"],
          [fn("SUM", col("final_amount")), "revenue"],
        ],
        where: whereCreatedAt,
        group: [literal("DATE_FORMAT(order_date, '%Y-%m')")],
        order: [[literal("DATE_FORMAT(order_date, '%Y-%m')"), "ASC"]],
        limit: 12,
      });
      console.log("Trend data fetched:", trendData.length, "records");

      const responseData = {
        orderStats: orderStats.map((stat) => ({
          status: stat.status,
          count: parseInt(stat.dataValues.count, 10),
          total_amount: parseFloat(stat.dataValues.total_amount || 0),
        })),
        totalOrders,
        totalRevenue: totalRevenue || 0,
        pendingOrders,
        overdueOrders,
        topCustomers: topCustomers.map((entry) => ({
          id: entry.customer?.id,
          name: entry.customer?.name,
          customer_code: entry.customer?.customer_code,
          orders: parseInt(entry.getDataValue("orders_count"), 10),
          revenue: parseFloat(entry.getDataValue("revenue") || 0),
        })),
        trend: trendData.map((entry) => ({
          month: entry.getDataValue("month"),
          orders: parseInt(entry.getDataValue("orders"), 10),
          revenue: parseFloat(entry.getDataValue("revenue") || 0),
        })),
      };

      console.log("Response data prepared, sending...");
      res.json(responseData);
      console.log("=== SALES DASHBOARD STATS END ===");
    } catch (error) {
      console.error("Sales dashboard stats error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        message: "Failed to fetch sales statistics",
        error: error.message,
      });
    }
  }
);

// Get sales pipeline
router.get(
  "/pipeline",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      const pipeline = await SalesOrder.findAll({
        attributes: [
          "status",
          [fn("COUNT", col("id")), "count"],
          [fn("SUM", col("final_amount")), "value"],
        ],
        group: ["status"],
        order: [
          [
            literal(`
          CASE status
            WHEN 'draft' THEN 1
            WHEN 'confirmed' THEN 2
            WHEN 'in_production' THEN 3
            WHEN 'ready_to_ship' THEN 4
            WHEN 'shipped' THEN 5
            WHEN 'delivered' THEN 6
            WHEN 'completed' THEN 7
            ELSE 8
          END
        `),
          ],
        ],
      });

      res.json({
        pipeline: pipeline.map((stage) => ({
          status: stage.status,
          count: parseInt(stage.dataValues.count, 10),
          value: parseFloat(stage.dataValues.value || 0),
        })),
      });
    } catch (error) {
      console.error("Sales pipeline error:", error);
      res.status(500).json({ message: "Failed to fetch sales pipeline" });
    }
  }
);

// Export sales orders to CSV
router.get(
  "/export",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      const { status, date_from, date_to, format = "csv" } = req.query;

      const where = {};

      // Apply filters
      if (status && status !== "all") {
        where.status = status;
      }

      if (date_from || date_to) {
        where.order_date = {};
        if (date_from) where.order_date[Op.gte] = new Date(date_from);
        if (date_to) where.order_date[Op.lte] = new Date(`${date_to} 23:59:59`);
      }

      const orders = await SalesOrder.findAll({
        where,
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["id", "name", "customer_code", "email", "phone"],
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "employee_id"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      if (format === "csv") {
        // Set headers for CSV download
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="sales_orders.csv"'
        );

        // CSV header
        let csv =
          "Order Number,Customer Name,Customer Code,Customer Phone,Order Date,Delivery Date,Status,Total Quantity,Total Amount,Final Amount,Created By\n";

        // CSV rows
        orders.forEach((order) => {
          const row = [
            order.order_number,
            order.customer?.name || "",
            order.customer?.customer_code || "",
            order.customer?.phone || "",
            order.order_date
              ? new Date(order.order_date).toLocaleDateString()
              : "",
            order.delivery_date
              ? new Date(order.delivery_date).toLocaleDateString()
              : "",
            order.status,
            order.total_quantity,
            order.total_amount,
            order.final_amount,
            order.creator?.name || "",
          ]
            .map((field) => `"${field}"`)
            .join(",");
          csv += row + "\n";
        });

        res.send(csv);
      } else {
        res
          .status(400)
          .json({ message: "Unsupported export format. Use format=csv" });
      }
    } catch (error) {
      console.error("Sales export error:", error);
      res.status(500).json({ message: "Failed to export sales orders" });
    }
  }
);

// Update sales order status
router.put(
  "/orders/:id/status",
  authenticateToken,
  checkDepartment(["admin", "manufacturing", "procurement"]),
  async (req, res) => {
    try {
      const { status, notes } = req.body;
      const order = await SalesOrder.findByPk(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      // Validate status transition
      const validStatuses = [
        "draft",
        "confirmed",
        "bom_generated",
        "procurement_created",
        "materials_received",
        "in_production",
        "cutting_completed",
        "printing_completed",
        "stitching_completed",
        "finishing_completed",
        "qc_passed",
        "ready_to_ship",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // IMPORTANT: Sales department cannot change status after sending to procurement
      // They can only create draft orders and send them to procurement
      // Status changes are managed by other departments (procurement, manufacturing, etc.)

      // Update lifecycle history
      const lifecycleHistory = order.lifecycle_history || [];
      lifecycleHistory.push({
        timestamp: new Date(),
        previous_status: order.status,
        new_status: status,
        changed_by: req.user.id,
        changed_by_name: req.user.name,
        notes: notes || "",
      });

      await order.update({
        status,
        lifecycle_history: lifecycleHistory,
        ...(status === "in_production" && {
          production_started_at: new Date(),
        }),
        ...(status === "completed" && { production_completed_at: new Date() }),
        ...(status === "shipped" && { shipped_at: new Date() }),
        ...(status === "delivered" && { delivered_at: new Date() }),
      });

      res.json({ message: "Order status updated successfully", order });
    } catch (error) {
      console.error("Status update error:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  }
);

// Generate invoice for sales order
router.post(
  "/orders/:id/generate-invoice",
  authenticateToken,
  checkDepartment(["sales", "admin", "finance"]),
  async (req, res) => {
    try {
      const order = await SalesOrder.findByPk(req.params.id, {
        include: [
          { model: Customer, as: "customer" },
          { model: User, as: "creator" },
        ],
      });

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      if (order.invoice_status === "generated") {
        return res
          .status(400)
          .json({ message: "Invoice already generated for this order" });
      }

      // Generate invoice number
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const invoiceNumber = `INV-${dateStr}-${order.id
        .toString()
        .padStart(4, "0")}`;

      // Calculate invoice totals
      const subtotal = parseFloat(order.final_amount || 0);
      const paidAmount = parseFloat(order.advance_paid || 0);
      const outstandingAmount = subtotal - paidAmount;

      // Create invoice record
      const invoice = await Invoice.create({
        invoice_number: invoiceNumber,
        invoice_type: "sales",
        customer_id: order.customer_id,
        sales_order_id: order.id,
        invoice_date: new Date(),
        due_date:
          order.delivery_date ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now if no delivery date
        items: order.items || [],
        subtotal: subtotal,
        total_amount: subtotal,
        paid_amount: paidAmount,
        outstanding_amount: outstandingAmount,
        status: "sent",
        payment_status: outstandingAmount > 0 ? "partial" : "paid",
        payment_terms: "Net 30",
        currency: "INR",
        billing_address: order.customer?.billing_address,
        shipping_address: order.customer?.shipping_address,
        notes: `Invoice for Sales Order ${order.order_number}`,
        created_by: req.user.id,
      });

      await order.update({
        invoice_status: "generated",
        invoice_number: invoiceNumber,
        invoice_date: new Date(),
      });

      // Send notification
      await NotificationService.notifyInvoiceAction(
        "created",
        invoice,
        req.user.id
      );

      res.json({
        message: "Invoice generated successfully",
        invoice: {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          invoice_date: invoice.invoice_date,
          total_amount: invoice.total_amount,
          paid_amount: invoice.paid_amount,
          outstanding_amount: invoice.outstanding_amount,
          status: invoice.status,
          payment_status: invoice.payment_status,
        },
      });
    } catch (error) {
      console.error("Invoice generation error:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  }
);

// Create challan for sales order
router.post(
  "/orders/:id/create-challan",
  authenticateToken,
  checkDepartment(["sales", "admin", "shipment"]),
  async (req, res) => {
    try {
      const {
        vehicle_number,
        driver_name,
        driver_phone,
        dispatch_date,
        notes,
      } = req.body;
      const order = await SalesOrder.findByPk(req.params.id, {
        include: [{ model: Customer, as: "customer" }],
      });

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      // Check if challan already exists
      const existingChallan = await Challan.findOne({
        where: {
          order_id: order.id,
          order_type: "sales_order",
          type: "outward",
          sub_type: "sales",
        },
      });

      if (existingChallan) {
        return res
          .status(400)
          .json({ message: "Challan already exists for this order" });
      }

      // Calculate totals
      const total_quantity = order.items
        ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
        : 0;
      const total_amount = order.items
        ? order.items.reduce(
            (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0),
            0
          )
        : 0;

      // Generate challan number
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const challanNumber = `CHN-${dateStr}-${order.id
        .toString()
        .padStart(4, "0")}`;

      // Prepare transport details
      const transport_details = {};
      if (vehicle_number) transport_details.vehicle_number = vehicle_number;
      if (driver_name) transport_details.driver_name = driver_name;
      if (driver_phone) transport_details.driver_phone = driver_phone;

      // Create challan
      const challan = await Challan.create({
        challan_number: challanNumber,
        type: "outward",
        sub_type: "sales",
        order_id: order.id,
        order_type: "sales_order",
        customer_id: order.customer_id,
        items: order.items || [],
        total_quantity,
        total_amount,
        status: "draft",
        priority: order.priority || "medium",
        notes: notes || null,
        expected_date: dispatch_date || new Date(),
        transport_details:
          Object.keys(transport_details).length > 0 ? transport_details : null,
        department: "sales",
        created_by: req.user.id,
        barcode: challanNumber, // Using challan number as barcode
      });

      // Update order status
      await order.update({
        status: "ready_to_ship",
        challan_created: true,
      });

      res.status(201).json({
        message: "Challan created successfully",
        challan: {
          id: challan.id,
          challan_number: challan.challan_number,
          status: challan.status,
          total_quantity: challan.total_quantity,
          total_amount: challan.total_amount,
        },
      });
    } catch (error) {
      console.error("Challan creation error:", error);
      res.status(500).json({ message: "Failed to create challan" });
    }
  }
);

// Upload design files for sales order
router.post(
  "/orders/:id/upload-design",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      const { files } = req.body; // Array of file objects {name, url, type, uploadedBy, uploadedAt}

      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ message: "Files array is required" });
      }

      const order = await SalesOrder.findByPk(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      const existingFiles = order.design_files || [];
      const updatedFiles = [
        ...existingFiles,
        ...files.map((file) => ({
          ...file,
          uploaded_by: req.user.id,
          uploaded_by_name: req.user.name,
          uploaded_at: new Date(),
        })),
      ];

      await order.update({
        design_files: updatedFiles,
      });

      res.json({
        message: "Design files uploaded successfully",
        files: updatedFiles,
      });
    } catch (error) {
      console.error("Design upload error:", error);
      res.status(500).json({ message: "Failed to upload design files" });
    }
  }
);

// Get PO status for sales order
router.get(
  "/orders/:id/po-status",
  authenticateToken,
  checkDepartment(["sales", "admin", "procurement"]),
  async (req, res) => {
    try {
      const order = await SalesOrder.findByPk(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      // Find related purchase orders
      const purchaseOrders = await PurchaseOrder.findAll({
        where: {
          linked_sales_order_id: req.params.id,
        },
        include: [
          {
            model: Vendor,
            as: "vendor",
            attributes: ["id", "name", "vendor_code"],
          },
        ],
      });

      res.json({
        order_number: order.order_number,
        procurement_status: order.procurement_status,
        purchase_orders: purchaseOrders.map((po) => ({
          id: po.id,
          po_number: po.po_number,
          vendor: po.vendor?.name,
          status: po.status,
          total_amount: po.total_amount,
          expected_delivery_date: po.expected_delivery_date,
        })),
      });
    } catch (error) {
      console.error("PO status fetch error:", error);
      res.status(500).json({ message: "Failed to fetch PO status" });
    }
  }
);

// Track order (public endpoint for QR code scanning)
router.get("/track/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await SalesOrder.findOne({
      where: { order_number: orderNumber },
      include: [
        { model: Customer, as: "customer", attributes: ["name", "phone"] },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update scan count
    await order.update({
      lifecycle_qr_last_scanned_at: new Date(),
      lifecycle_qr_scan_count: order.lifecycle_qr_scan_count + 1,
    });

    res.json({
      order_number: order.order_number,
      customer_name: order.customer?.name,
      status: order.status,
      delivery_date: order.delivery_date,
      total_quantity: order.total_quantity,
      lifecycle_history: order.lifecycle_history || [],
      last_updated: order.updatedAt,
    });
  } catch (error) {
    console.error("Order tracking error:", error);
    res.status(500).json({ message: "Failed to track order" });
  }
});

// Get sales dashboard summary
router.get(
  "/dashboard/summary",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      const { date_from, date_to } = req.query;

      const where = {};
      if (date_from || date_to) {
        where.order_date = {};
        if (date_from) where.order_date[Op.gte] = new Date(date_from);
        if (date_to) where.order_date[Op.lte] = new Date(`${date_to} 23:59:59`);
      }

      // Total orders count
      const totalOrders = await SalesOrder.count({ where });

      // Orders by status
      const pendingOrders = await SalesOrder.count({
        where: { ...where, status: "draft" },
      });
      const inProductionOrders = await SalesOrder.count({
        where: {
          ...where,
          status: {
            [Op.in]: [
              "in_production",
              "cutting_completed",
              "printing_completed",
              "stitching_completed",
              "finishing_completed",
            ],
          },
        },
      });
      const deliveredOrders = await SalesOrder.count({
        where: { ...where, status: "delivered" },
      });

      // Financial summary
      const totalValueResult = await SalesOrder.findOne({
        where,
        attributes: [
          [fn("SUM", col("final_amount")), "total"],
          [fn("SUM", col("advance_paid")), "advance"],
          [fn("SUM", col("balance_amount")), "balance"],
        ],
        raw: true,
      });

      // Orders by procurement status
      const procurementRequested = await SalesOrder.count({
        where: { ...where, procurement_status: "requested" },
      });
      const materialsReceived = await SalesOrder.count({
        where: { ...where, procurement_status: "materials_received" },
      });

      // Invoice status
      const invoicesPending = await SalesOrder.count({
        where: { ...where, invoice_status: "pending" },
      });
      const invoicesGenerated = await SalesOrder.count({
        where: { ...where, invoice_status: "generated" },
      });

      res.json({
        summary: {
          total_orders: totalOrders,
          pending_orders: pendingOrders,
          in_production_orders: inProductionOrders,
          delivered_orders: deliveredOrders,
          total_value: parseFloat(totalValueResult?.total || 0),
          advance_collected: parseFloat(totalValueResult?.advance || 0),
          balance_due: parseFloat(totalValueResult?.balance || 0),
          procurement_requested: procurementRequested,
          materials_received: materialsReceived,
          invoices_pending: invoicesPending,
          invoices_generated: invoicesGenerated,
        },
      });
    } catch (error) {
      console.error("Dashboard summary error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  }
);

// Update advance payment
router.put(
  "/orders/:id/payment",
  authenticateToken,
  checkDepartment(["sales", "admin", "finance"]),
  async (req, res) => {
    try {
      const { advance_paid } = req.body;
      const order = await SalesOrder.findByPk(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      const balance_amount =
        parseFloat(order.final_amount) - parseFloat(advance_paid);

      await order.update({
        advance_paid: parseFloat(advance_paid),
        balance_amount: balance_amount,
      });

      res.json({
        message: "Payment updated successfully",
        order: {
          advance_paid: order.advance_paid,
          balance_amount: order.balance_amount,
        },
      });
    } catch (error) {
      console.error("Payment update error:", error);
      res.status(500).json({ message: "Failed to update payment" });
    }
  }
);

// Get process tracker and recent activities for a sales order
router.get(
  "/orders/:id/process-tracker",
  authenticateToken,
  checkDepartment(["sales", "admin", "manufacturing", "shipment"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { Shipment, SalesOrderHistory } = require("../config/database");

      const order = await SalesOrder.findByPk(id, {
        include: [
          { model: Customer, as: "customer", attributes: ["name"] },
          {
            model: ProductionOrder,
            as: "productionOrders",
            attributes: ["id", "status", "created_at", "updated_at"],
          },
        ],
      });

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      // Get shipment information
      const shipment = await Shipment.findOne({
        where: { sales_order_id: id },
        attributes: [
          "id",
          "status",
          "created_at",
          "updated_at",
          "expected_delivery_date",
          "awb_number",
        ],
      });

      // Build process timeline
      const timeline = [
        {
          stage: "Draft",
          icon: "📋",
          status: "completed",
          timestamp: order.createdAt,
          description: "Order created",
        },
        {
          stage: "Procurement",
          icon: "🛒",
          status: [
            "draft",
            "pending_approval",
            "confirmed",
            "in_production",
            "ready_to_ship",
            "shipped",
            "delivered",
            "completed",
          ].includes(order.status)
            ? "completed"
            : "pending",
          timestamp: order.procurement_status ? order.updatedAt : null,
          description: order.procurement_status || "Awaiting procurement",
        },
        {
          stage: "Manufacturing",
          icon: "🏭",
          status:
            order.productionOrders && order.productionOrders.length > 0
              ? "completed"
              : order.status === "in_production"
              ? "in_progress"
              : "pending",
          timestamp:
            order.productionOrders && order.productionOrders.length > 0
              ? order.productionOrders[0].created_at
              : null,
          description:
            order.productionOrders && order.productionOrders.length > 0
              ? `${order.productionOrders.length} production order(s)`
              : "Awaiting manufacturing",
        },
        {
          stage: "Shipment",
          icon: "🚚",
          status: shipment
            ? "completed"
            : order.status === "ready_to_ship"
            ? "in_progress"
            : "pending",
          timestamp: shipment ? shipment.created_at : null,
          description: shipment
            ? shipment.awb_number
              ? `AWB: ${shipment.awb_number}`
              : "Shipment created"
            : "Awaiting shipment",
        },
        {
          stage: "Delivery",
          icon: "📦",
          status:
            order.status === "delivered"
              ? "completed"
              : order.status === "shipped"
              ? "in_progress"
              : "pending",
          timestamp: order.status === "delivered" ? order.updatedAt : null,
          description:
            order.status === "delivered" ? "Delivered" : "Awaiting delivery",
        },
      ];

      // Get recent activities (last 10)
      const activities = await SalesOrderHistory.findAll({
        where: { sales_order_id: id },
        include: [
          { model: User, as: "performedBy", attributes: ["name", "email"] },
        ],
        order: [["created_at", "DESC"]],
        limit: 10,
      });

      // Get current status description
      const statusDescriptions = {
        draft: "Draft - Order being prepared",
        pending_approval: "Awaiting approval",
        confirmed: "Order confirmed",
        procurement_created: "Procurement in progress",
        in_production: "Manufacturing in progress",
        ready_to_ship: "Ready for shipment",
        shipped: "Shipped to customer",
        delivered: "Successfully delivered",
        completed: "Order completed",
        cancelled: "Order cancelled",
      };

      const currentStatus =
        statusDescriptions[order.status] || order.status.replace(/_/g, " ");
      const lastUpdated = order.updatedAt
        ? new Date(order.updatedAt).toLocaleString("en-IN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";

      res.json({
        order_number: order.order_number,
        customer_name: order.customer?.name || "N/A",
        current_status: currentStatus,
        last_updated: lastUpdated,
        timeline: timeline.filter((t) => t.timestamp || t.status === "pending"),
        recent_activities: activities.map((activity) => ({
          action: activity.action,
          description: activity.description,
          timestamp: new Date(activity.created_at).toLocaleString("en-IN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          performed_by: activity.performedBy?.name || "System",
          status_from: activity.status_from,
          status_to: activity.status_to,
        })),
      });
    } catch (error) {
      console.error("Process tracker error:", error);
      res.status(500).json({ message: "Failed to fetch process tracker data" });
    }
  }
);

// Get recent activities dashboard (all orders)
router.get(
  "/dashboard/recent-activities",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      // Get recent sales order activities
      const activities = await SalesOrderHistory.findAll({
        include: [
          {
            model: SalesOrder,
            as: "salesOrder",
            attributes: [
              "id",
              "order_number",
              "status",
              "product_name",
              "items",
              "project_name",
              "project_reference",
            ],
            include: [
              { model: Customer, as: "customer", attributes: ["name"] },
            ],
          },
          { model: User, as: "performedBy", attributes: ["name", "email"] },
        ],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
      });

      // Get recent shipment activities
      const shipments = await Shipment.findAll({
        include: [
          {
            model: SalesOrder,
            as: "salesOrder",
            attributes: [
              "id",
              "order_number",
              "product_name",
              "items",
              "project_name",
              "project_reference",
            ],
            include: [
              { model: Customer, as: "customer", attributes: ["name"] },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: 5,
        raw: false,
      });

      // Format activities
      const formattedActivities = activities.map((activity) => {
        const createdDate = activity.performed_at
          ? new Date(activity.performed_at)
          : new Date();

        // Generate action description from status transition - only if statuses are different
        let actionDescription = activity.status_to;
        if (
          activity.status_from &&
          activity.status_from !== activity.status_to
        ) {
          actionDescription = `${activity.status_from} → ${activity.status_to}`;
        }

        // Get proper user name
        const userName = activity.performedBy?.name
          ? activity.performedBy.name
          : activity.performedBy?.email
          ? activity.performedBy.email.split("@")[0]
          : null;

        // Get proper customer name
        const customerName =
          activity.salesOrder?.customer?.name || "Unknown Customer";

        // Get product name - try product_name field first, fallback to items
        let productName = activity.salesOrder?.product_name;
        if (
          !productName &&
          activity.salesOrder?.items &&
          activity.salesOrder.items.length > 0
        ) {
          productName =
            activity.salesOrder.items[0].product_name ||
            activity.salesOrder.items[0].product_type;
        }

        // Map status to stage description
        const stageMap = {
          pending: "Pending",
          accepted: "Accepted",
          procurement_created: "Procurement Started",
          in_production: "In Production",
          production_complete: "Production Complete",
          ready_for_shipment: "Ready for Shipment",
          shipped: "Shipped",
          delivered: "Delivered",
          cancelled: "Cancelled",
        };

        const stage = stageMap[activity.status_to] || activity.status_to;

        // Get project name - try project_name field first, then project_title, fallback to buyer_reference or order_number
        let projectName = activity.salesOrder?.project_name;
        if (!projectName || projectName.trim() === '') {
          projectName = activity.salesOrder?.project_title;
        }
        if (!projectName || projectName.trim() === '') {
          projectName = activity.salesOrder?.buyer_reference;
        }
        if (!projectName || projectName.trim() === '') {
          projectName = `SO-${activity.salesOrder?.order_number}`;
        }

        return {
          id: `order-${activity.id}`,
          type: "order_activity",
          icon: "📋",
          title: projectName,
          description:
            activity.note || `Status changed to ${activity.status_to}`,
          customer: customerName,
          product_name: productName,
          timestamp: createdDate,
          performed_by: userName,
          related_id: activity.salesOrder?.id,
          order_number: activity.salesOrder?.order_number,
          order_id: activity.salesOrder?.id,
          status: activity.status_to,
          stage: stage,
        };
      });

      // Format shipment activities
      const shipmentActivities = shipments.map((shipment) => {
        const createdDate = shipment.created_at
          ? new Date(shipment.created_at)
          : new Date();

        // Get proper customer name
        const customerName =
          shipment.salesOrder?.customer?.name || "Unknown Customer";

        // Get product name - try salesOrder first, then shipment items
        let productName = shipment.salesOrder?.product_name;
        if (!productName && shipment.items && shipment.items.length > 0) {
          productName =
            shipment.items[0].product_name || shipment.items[0].product_type;
        }

        // Get project name - try project_name field first, then project_title, fallback to buyer_reference or order_number
        let shipmentProjectName = shipment.salesOrder?.project_name;
        if (!shipmentProjectName || shipmentProjectName.trim() === '') {
          shipmentProjectName = shipment.salesOrder?.project_title;
        }
        if (!shipmentProjectName || shipmentProjectName.trim() === '') {
          shipmentProjectName = shipment.salesOrder?.buyer_reference;
        }
        if (!shipmentProjectName || shipmentProjectName.trim() === '') {
          shipmentProjectName = `SO-${shipment.salesOrder?.order_number}`;
        }

        return {
          id: `shipment-${shipment.id}`,
          type: "shipment_activity",
          icon: "🚚",
          title: shipmentProjectName,
          description: `Status: ${shipment.status}${
            shipment.awb_number ? ` | AWB: ${shipment.awb_number}` : ""
          }`,
          customer: customerName,
          product_name: productName || null,
          timestamp: createdDate,
          performed_by: null,
          related_id: shipment.salesOrder?.id,
          order_number: shipment.salesOrder?.order_number,
          order_id: shipment.salesOrder?.id,
          status: shipment.status,
          stage: "Shipment",
        };
      });

      // Combine and sort by timestamp
      const allActivities = [...formattedActivities, ...shipmentActivities]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, parseInt(limit))
        .map((activity) => {
          // Safe date formatting with fallback
          let formattedTime = "N/A";
          try {
            const date = new Date(activity.timestamp);
            if (!isNaN(date.getTime())) {
              formattedTime = date.toLocaleString("en-IN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
            }
          } catch (e) {
            console.error("Date formatting error:", e);
          }
          return {
            ...activity,
            timestamp: formattedTime,
          };
        });

      res.json({
        activities: allActivities,
        total_count: allActivities.length,
      });
    } catch (error) {
      console.error("Recent activities error:", error);
      res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  }
);

// Download invoice as PDF
router.get(
  "/orders/:id/invoice",
  authenticateToken,
  async (req, res) => {
    let doc;
    try {
      const order = await SalesOrder.findByPk(req.params.id, {
        include: [
          { model: Customer, as: "customer" },
          { model: Product, as: "product" },
        ],
      });

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      // Find or create invoice
      let invoice = await Invoice.findOne({
        where: { sales_order_id: order.id },
      });
      
      if (!invoice) {
        // Auto-generate invoice if it doesn't exist
        console.log("Creating invoice for order:", order.id, order.order_number);
        
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
        const invoiceNumber = `INV-${dateStr}-${order.id
          .toString()
          .padStart(4, "0")}`;

        const subtotal = parseFloat(order.final_amount || 0);
        const paidAmount = parseFloat(order.advance_paid || 0);
        const outstandingAmount = subtotal - paidAmount;

        invoice = await Invoice.create({
          invoice_number: invoiceNumber,
          invoice_type: "sales",
          customer_id: order.customer_id,
          sales_order_id: order.id,
          invoice_date: new Date(),
          due_date:
            order.delivery_date ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          items: order.items || [],
          subtotal: subtotal,
          total_amount: subtotal,
          paid_amount: paidAmount,
          outstanding_amount: outstandingAmount,
          status: "sent",
          payment_status: outstandingAmount > 0 ? "partial" : "paid",
          payment_terms: "Net 30",
          currency: "INR",
          billing_address: order.customer?.billing_address,
          shipping_address: order.customer?.shipping_address,
          notes: `Invoice for Sales Order ${order.order_number}`,
          created_by: req.user?.id || 1,
        });

        await order.update({
          invoice_status: "generated",
          invoice_number: invoiceNumber,
          invoice_date: new Date(),
        });
      }

      // Log order data for debugging
      console.log("=== Invoice PDF Generation ===");
      console.log("Order ID:", order.id);
      console.log("Order Number:", order.order_number);
      console.log("Customer Name:", order.customer?.name);
      console.log("Items Count:", order.items?.length || 0);
      console.log("Total Amount:", order.final_amount);
      console.log("Invoice Number:", invoice.invoice_number);
      
      // Generate PDF using pdfkit
      const PDFDocument = require("pdfkit");
      doc = new PDFDocument({ margin: 40, size: 'A4' });
      
      // Set response headers FIRST
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Invoice-${order.order_number}.pdf"`
      );

      // Handle errors on the PDF document
      doc.on('error', (err) => {
        console.error("PDF Generation Error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to generate invoice PDF" });
        } else {
          res.end();
        }
      });

      // Pipe to response
      doc.pipe(res);

      try {
        // Header
        doc.fontSize(24);
        doc.font('Helvetica', 'bold');
        doc.text("INVOICE", { align: "center" });
        doc.fontSize(11);
        doc.font('Helvetica', 'normal');
        doc.text("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", { align: "center" });
        
        // Invoice Details
        doc.moveDown(0.5);
        doc.fontSize(9);
        doc.font('Helvetica', 'bold');
        
        const col1 = 50;
        const col2 = 280;
        const col3 = 430;
        let currentY = doc.y;
        
        // Row 1
        doc.text("Invoice #:", col1, currentY);
        doc.font('Helvetica', 'normal');
        doc.text(invoice.invoice_number || "N/A", col1 + 80, currentY);
        
        doc.font('Helvetica', 'bold');
        doc.text("Order #:", col2, currentY);
        doc.font('Helvetica', 'normal');
        doc.text(order.order_number || "N/A", col2 + 65, currentY);
        
        // Row 2
        currentY += 18;
        doc.font('Helvetica', 'bold');
        doc.text("Invoice Date:", col1, currentY);
        doc.font('Helvetica', 'normal');
        doc.text(new Date(invoice.invoice_date).toLocaleDateString("en-IN"), col1 + 80, currentY);
        
        doc.font('Helvetica', 'bold');
        doc.text("Order Date:", col2, currentY);
        doc.font('Helvetica', 'normal');
        doc.text(new Date(order.order_date).toLocaleDateString("en-IN"), col2 + 65, currentY);
        
        // Row 3
        currentY += 18;
        doc.font('Helvetica', 'bold');
        doc.text("Delivery Date:", col1, currentY);
        doc.font('Helvetica', 'normal');
        doc.text(new Date(order.delivery_date).toLocaleDateString("en-IN"), col1 + 80, currentY);
        
        if (order.order_type) {
          doc.font('Helvetica', 'bold');
          doc.text("Order Type:", col2, currentY);
          doc.font('Helvetica', 'normal');
          doc.text(order.order_type, col2 + 65, currentY);
        }
        
        // Row 4 - Optional fields
        if (order.buyer_reference || order.project_name) {
          currentY += 18;
          if (order.buyer_reference) {
            doc.font('Helvetica', 'bold');
            doc.text("Buyer Ref:", col1, currentY);
            doc.font('Helvetica', 'normal');
            doc.text(order.buyer_reference, col1 + 80, currentY);
          }
          
          if (order.project_name) {
            doc.font('Helvetica', 'bold');
            doc.text("Project:", col2, currentY);
            doc.font('Helvetica', 'normal');
            doc.text(order.project_name, col2 + 65, currentY);
          }
        }
        
        doc.moveDown(1.2);

        // Customer details
        doc.fontSize(11);
        doc.font('Helvetica', 'bold');
        doc.text("Bill To:", { underline: true });
        doc.fontSize(9);
        doc.font('Helvetica', 'normal');
        doc.text(order.customer?.name || "N/A");
        if (order.customer?.email) {
          doc.text(`Email: ${order.customer.email}`);
        }
        if (order.customer?.phone) {
          doc.text(`Phone: ${order.customer.phone}`);
        }
        if (order.customer?.billing_address) {
          doc.text(order.customer.billing_address, { width: 250 });
        }
        
        // Shipping address if different
        if (order.shipping_address && order.shipping_address !== order.customer?.billing_address) {
          doc.moveDown(0.3);
          doc.fontSize(11);
          doc.font('Helvetica', 'bold');
          doc.text("Ship To:", { underline: true });
          doc.fontSize(9);
          doc.font('Helvetica', 'normal');
          doc.text(order.shipping_address, { width: 250 });
        }
        
        doc.moveDown(0.5);

        // Product/Order Specifications
        if (order.garment_specifications) {
          const specs = order.garment_specifications;
          doc.fontSize(10);
          doc.font('Helvetica', 'bold');
          doc.text("Product Specifications:");
          doc.fontSize(9);
          doc.font('Helvetica', 'normal');
          
          if (specs.product_type) doc.text(`Product Type: ${specs.product_type}`);
          if (specs.fabric_type) doc.text(`Fabric: ${specs.fabric_type}`);
          if (specs.color) doc.text(`Color: ${specs.color}`);
          if (specs.gsm) doc.text(`GSM: ${specs.gsm}`);
          
          doc.moveDown(0.3);
        }
        
        // Items table header
        doc.fontSize(10);
        doc.font('Helvetica', 'bold');
        const tableTop = doc.y;
        doc.text("Item Details", 50, tableTop);
        doc.text("Qty", 300, tableTop);
        doc.text("Unit Price", 360, tableTop);
        doc.text("Amount", 480, tableTop);
        doc.font('Helvetica', 'normal');
        
        doc.moveTo(50, tableTop + 12).lineTo(550, tableTop + 12).stroke();
        
        let itemY = tableTop + 20;
        doc.fontSize(8);
        
        // Items
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item, idx) => {
            const amount = (item.quantity || 0) * (item.unit_price || 0);
            
            // Build item description
            let desc = item.description || item.product_name || "Product";
            if (item.style_no) desc += ` (Style: ${item.style_no})`;
            if (item.fabric_type) desc += ` - ${item.fabric_type}`;
            if (item.color) desc += ` - ${item.color}`;
            
            // Draw item row
            doc.text(desc, 50, itemY, { width: 240, lineBreak: true });
            doc.text((item.quantity || 0).toString(), 300, itemY);
            doc.text(`₹${(item.unit_price || 0).toFixed(2)}`, 360, itemY);
            doc.text(`₹${amount.toFixed(2)}`, 480, itemY);
            itemY += 20;
            
            if (item.remarks) {
              doc.fontSize(7);
              doc.text(`Remarks: ${item.remarks}`, 50, itemY, { width: 480 });
              doc.fontSize(8);
              itemY += 12;
            }
          });
        }

        doc.moveTo(50, itemY).lineTo(550, itemY).stroke();
        itemY += 10;

        // Totals section
        doc.fontSize(9);
        const subtotal = order.total_amount || order.final_amount || 0;
        const discount = order.discount_amount || 0;
        const tax = order.tax_amount || 0;
        const total = order.final_amount || subtotal - discount + tax;
        
        // Subtotal
        doc.text("Subtotal:", 350, itemY);
        doc.text(`₹${subtotal.toFixed(2)}`, 480, itemY);
        itemY += 15;
        
        // Discount
        if (discount > 0 || order.discount_percentage > 0) {
          const discountPercent = order.discount_percentage || 0;
          doc.text(`Discount${discountPercent > 0 ? ` (${discountPercent}%)` : ''}:`, 350, itemY);
          doc.text(`₹${discount.toFixed(2)}`, 480, itemY);
          itemY += 15;
        }
        
        // Tax
        if (tax > 0 || order.tax_percentage > 0) {
          const taxPercent = order.tax_percentage || 0;
          doc.text(`Tax${taxPercent > 0 ? ` (${taxPercent}%)` : ''}:`, 350, itemY);
          doc.text(`₹${tax.toFixed(2)}`, 480, itemY);
          itemY += 15;
        }
        
        // Total
        doc.fontSize(11);
        doc.font('Helvetica', 'bold');
        doc.text("Total Amount:", 350, itemY);
        doc.text(`₹${total.toFixed(2)}`, 480, itemY);
        doc.font('Helvetica', 'normal');
        itemY += 15;

        // Payment information
        const paidAmount = order.advance_paid || 0;
        if (paidAmount > 0) {
          doc.fontSize(9);
          doc.text("Advance Paid:", 350, itemY);
          doc.text(`₹${paidAmount.toFixed(2)}`, 480, itemY);
          itemY += 15;
        }

        const balance = total - paidAmount;
        doc.fontSize(10);
        doc.font('Helvetica', 'bold');
        doc.text("Balance Due:", 350, itemY);
        doc.text(`₹${balance.toFixed(2)}`, 480, itemY);
        doc.font('Helvetica', 'normal');
        
        doc.moveDown(1);

        // Additional information section
        if (order.special_instructions || order.payment_terms) {
          doc.fontSize(9);
          doc.font('Helvetica', 'bold');
          doc.text("Additional Information:", 50);
          doc.fontSize(8);
          doc.font('Helvetica', 'normal');
          
          if (order.payment_terms) {
            doc.text(`Payment Terms: ${order.payment_terms}`);
          }
          
          if (order.special_instructions) {
            doc.text(`Special Instructions: ${order.special_instructions}`, { width: 450, align: 'left' });
          }
        }

        // Footer
        doc.moveDown(1);
        doc.fontSize(8);
        if (order.payment_terms) {
          doc.text(`Payment Terms: ${order.payment_terms}`, { align: "center" });
        }
        doc.text("Thank you for your business!", { align: "center" });

        // Finalize PDF
        doc.end();
      } catch (docError) {
        console.error("PDF document generation error:", docError);
        doc.end();
      }
    } catch (error) {
      console.error("Invoice download error:", error);
      // Only send error response if headers haven't been sent
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to generate invoice PDF" });
      } else {
        res.end();
      }
    }
  }
);

// Upload design files for an order
router.post(
  "/orders/:id/upload-design-files",
  authenticateToken,
  upload.array('files', 5),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verify the order exists
      const order = await SalesOrder.findByPk(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files provided" });
      }

      // Create order-specific uploads directory
      const orderUploadsDir = path.join(__dirname, '../uploads', 'design-files', String(id));
      if (!fs.existsSync(orderUploadsDir)) {
        fs.mkdirSync(orderUploadsDir, { recursive: true });
      }

      const uploadedFiles = [];
      const errors = [];

      // Move uploaded files to the order-specific directory
      for (const file of req.files) {
        try {
          const tempPath = file.path;
          const targetPath = path.join(orderUploadsDir, file.filename);
          
          // Verify temp file exists before moving
          if (!fs.existsSync(tempPath)) {
            console.warn(`Temp file not found: ${tempPath}`);
            errors.push(file.originalname);
            continue;
          }

          // Move/rename the file
          fs.renameSync(tempPath, targetPath);
          
          // Verify the file was moved successfully
          if (!fs.existsSync(targetPath)) {
            console.warn(`File move verification failed: ${targetPath}`);
            errors.push(file.originalname);
            continue;
          }

          uploadedFiles.push({
            filename: file.filename,
            originalname: file.originalname
          });
          console.log(`File uploaded successfully: ${file.originalname} -> ${file.filename}`);
        } catch (err) {
          console.error(`Failed to move file ${file.originalname}:`, err);
          errors.push(file.originalname);
        }
      }

      // Update order with design file metadata
      if (uploadedFiles.length > 0 && order.garment_specifications) {
        const currentFiles = order.garment_specifications.design_files || [];
        // Store file metadata for reference
        const newFiles = uploadedFiles.map(f => ({
          storedName: f.filename,
          originalName: f.originalname
        }));
        const allFiles = [...currentFiles, ...newFiles];
        
        order.garment_specifications.design_files = allFiles;
        await order.update({
          garment_specifications: order.garment_specifications
        });
      }

      res.json({
        message: "Files uploaded successfully",
        uploaded: uploadedFiles,
        failed: errors
      });
    } catch (error) {
      console.error('Design file upload error:', error);
      res.status(500).json({ message: "Failed to upload design files" });
    }
  }
);

// Download individual design file
router.get(
  "/orders/:id/design-file/:fileName",
  authenticateToken,
  async (req, res) => {
    try {
      const { id, fileName } = req.params;

      // Verify the order exists and user has access
      const order = await SalesOrder.findByPk(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Decode the filename (which could be the stored name or original name)
      const decodedFileName = decodeURIComponent(fileName);
      
      // Validate filename to prevent directory traversal
      if (decodedFileName.includes('..') || decodedFileName.includes('/') || decodedFileName.includes('\\')) {
        return res.status(400).json({ message: "Invalid file name" });
      }

      // Try to find the file - it could be stored with generated name
      const orderDesignFilesDir = path.join(__dirname, '../uploads', 'design-files', String(id));
      let filePath = path.join(orderDesignFilesDir, decodedFileName);
      let downloadName = decodedFileName;

      // If not found directly, try to find by original name in metadata
      if (!fs.existsSync(filePath) && order.garment_specifications?.design_files) {
        const fileMetadata = order.garment_specifications.design_files.find(f => 
          f.originalName === decodedFileName || f === decodedFileName
        );
        if (fileMetadata) {
          const storedName = fileMetadata.storedName || fileMetadata;
          filePath = path.join(orderDesignFilesDir, storedName);
          downloadName = fileMetadata.originalName || decodedFileName;
        }
      }
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`Design file not found: ${filePath}`);
        return res.status(404).json({ message: "File not found" });
      }

      // Send the file with original name
      res.download(filePath, downloadName, (err) => {
        if (err) {
          console.error('File download error:', err);
        }
      });
    } catch (error) {
      console.error('Design file download error:', error);
      res.status(500).json({ message: "Failed to download design file" });
    }
  }
);

// Send invoice to accounting department
router.post(
  "/orders/:id/send-invoice-to-accounting",
  authenticateToken,
  async (req, res) => {
    try {
      const order = await SalesOrder.findByPk(req.params.id, {
        include: [
          { model: Customer, as: "customer" },
          { model: User, as: "creator" },
        ],
      });

      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      // Find or create invoice
      let invoice = await Invoice.findOne({
        where: { sales_order_id: order.id },
      });

      if (!invoice) {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
        const invoiceNumber = `INV-${dateStr}-${order.id
          .toString()
          .padStart(4, "0")}`;

        const subtotal = parseFloat(order.final_amount || 0);
        const paidAmount = parseFloat(order.advance_paid || 0);

        invoice = await Invoice.create({
          invoice_number: invoiceNumber,
          invoice_type: "sales",
          customer_id: order.customer_id,
          sales_order_id: order.id,
          invoice_date: new Date(),
          due_date:
            order.delivery_date ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          items: order.items || [],
          subtotal: subtotal,
          total_amount: subtotal,
          paid_amount: paidAmount,
          outstanding_amount: subtotal - paidAmount,
          status: "generated",
          notes: `Invoice generated for ${order.order_number}`,
        });
      }

      // Send notification to finance/accounting department
      try {
        const financeUsers = await User.findAll({
          where: { department: "finance" },
        });

        if (financeUsers.length > 0) {
          await NotificationService.notifyUsers(
            financeUsers.map((u) => u.id),
            `Invoice sent for processing`,
            `Invoice ${invoice.invoice_number} for order ${order.order_number} (Customer: ${order.customer?.name}) has been sent to accounting. Amount: ₹${order.final_amount}`,
            {
              type: "invoice_sent",
              sales_order_id: order.id,
              invoice_id: invoice.id,
              invoice_number: invoice.invoice_number,
              order_number: order.order_number,
            },
            req.user.id
          );
        }
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
      }

      // Create history entry
      try {
        await SalesOrderHistory.create({
          sales_order_id: order.id,
          action: "invoice_sent_to_accounting",
          description: `Invoice ${invoice.invoice_number} sent to accounting department by ${req.user.username}`,
          changed_by_id: req.user.id,
        });
      } catch (historyError) {
        console.error("Failed to create history entry:", historyError);
      }

      res.json({
        message: "Invoice sent to accounting department successfully",
        invoice: {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          status: invoice.status,
        },
      });
    } catch (error) {
      console.error("Send invoice to accounting error:", error);
      res
        .status(500)
        .json({
          message: "Failed to send invoice to accounting",
          error: error.message,
        });
    }
  }
);

// Get top customers by revenue
router.get(
  "/dashboard/customer-insights",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      const topCustomers = await SalesOrder.findAll({
        attributes: [
          [col("SalesOrder.customer_id"), "customer_id"],
          [fn("COUNT", col("SalesOrder.id")), "orders_count"],
          [fn("SUM", col("SalesOrder.final_amount")), "total_revenue"],
          [fn("AVG", col("SalesOrder.final_amount")), "avg_order_value"],
        ],
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["id", "name", "customer_code", "email", "phone"],
            required: true,
          },
        ],
        group: ["SalesOrder.customer_id", "customer.id"],
        order: [[literal("total_revenue"), "DESC"]],
        limit: 10,
        subQuery: false,
      });

      const repeatCustomers = await SalesOrder.findAll({
        attributes: [
          [col("SalesOrder.customer_id"), "customer_id"],
          [fn("COUNT", col("SalesOrder.id")), "orders_count"],
        ],
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["id", "name"],
            required: true,
          },
        ],
        group: ["SalesOrder.customer_id", "customer.id"],
        having: sequelize.where(fn("COUNT", col("SalesOrder.id")), Op.gt, 1),
        raw: false,
      });

      res.json({
        topCustomers: topCustomers.map((entry) => ({
          id: entry.customer?.id,
          name: entry.customer?.name,
          customer_code: entry.customer?.customer_code,
          orders: parseInt(entry.getDataValue("orders_count"), 10),
          revenue: parseFloat(entry.getDataValue("total_revenue") || 0),
          avg_order_value: parseFloat(
            entry.getDataValue("avg_order_value") || 0
          ),
        })),
        repeat_customers_count: repeatCustomers.length,
      });
    } catch (error) {
      console.error("Customer insights error:", error);
      res.status(500).json({ message: "Failed to fetch customer insights" });
    }
  }
);

// Get delivery performance metrics
router.get(
  "/dashboard/delivery-performance",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      const now = new Date();

      const completedOrders = await SalesOrder.count({
        where: { status: ["completed", "delivered"] },
      });

      const overdueOrders = await SalesOrder.count({
        where: {
          delivery_date: { [Op.lt]: now },
          status: { [Op.notIn]: ["completed", "delivered", "cancelled"] },
        },
      });

      const onTimeOrders = await SalesOrder.count({
        where: {
          status: { [Op.in]: ["completed", "delivered"] },
          delivery_date: { [Op.gte]: now },
        },
      });

      const lateOrders = await SalesOrder.count({
        where: {
          status: { [Op.in]: ["completed", "delivered"] },
          delivery_date: { [Op.lt]: now },
        },
      });

      const onTimeRate =
        completedOrders > 0
          ? ((onTimeOrders / completedOrders) * 100).toFixed(1)
          : 0;

      const deliveryStats = await SalesOrder.findAll({
        attributes: [
          "status",
          [fn("COUNT", col("id")), "count"],
          [fn("AVG", col("delivery_date")), "avg_delivery_date"],
        ],
        group: ["status"],
        raw: true,
      });

      res.json({
        on_time_rate: parseFloat(onTimeRate),
        completed_orders: completedOrders,
        overdue_orders: overdueOrders,
        on_time_orders: onTimeOrders,
        late_orders: lateOrders,
        delivery_by_status: deliveryStats.map((stat) => ({
          status: stat.status,
          count: parseInt(stat.count, 10),
        })),
      });
    } catch (error) {
      console.error("Delivery performance error:", error);
      res.status(500).json({ message: "Failed to fetch delivery performance" });
    }
  }
);

// Get pending actions (orders awaiting approval/procurement/production)
router.get(
  "/dashboard/pending-actions",
  authenticateToken,
  checkDepartment(["sales", "admin"]),
  async (req, res) => {
    try {
      const pendingApproval = await SalesOrder.findAll({
        where: { status: "pending_approval" },
        attributes: ["id", "order_number", "customer_id", "final_amount", "created_at"],
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["name"],
          },
        ],
        limit: 10,
        order: [["created_at", "ASC"]],
      });

      const pendingProcurement = await SalesOrder.findAll({
        where: {
          ready_for_procurement: true,
          status: "draft",
        },
        attributes: ["id", "order_number", "customer_id", "final_amount", "created_at"],
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["name"],
          },
        ],
        limit: 10,
        order: [["created_at", "ASC"]],
      });

      const pendingProduction = await SalesOrder.findAll({
        where: {
          status: { [Op.in]: ["confirmed"] },
        },
        attributes: ["id", "order_number", "customer_id", "total_quantity", "created_at"],
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["name"],
          },
        ],
        limit: 10,
        order: [["created_at", "ASC"]],
      });

      res.json({
        pending_approval: pendingApproval.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          customer: order.customer?.name,
          amount: parseFloat(order.final_amount || 0),
          days_pending: Math.floor(
            (Date.now() - new Date(order.created_at)) / (1000 * 60 * 60 * 24)
          ),
        })),
        pending_approval_count: pendingApproval.length,
        pending_procurement: pendingProcurement.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          customer: order.customer?.name,
          amount: parseFloat(order.final_amount || 0),
          days_pending: Math.floor(
            (Date.now() - new Date(order.created_at)) / (1000 * 60 * 60 * 24)
          ),
        })),
        pending_procurement_count: pendingProcurement.length,
        pending_production: pendingProduction.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          customer: order.customer?.name,
          quantity: order.total_quantity,
          days_pending: Math.floor(
            (Date.now() - new Date(order.created_at)) / (1000 * 60 * 60 * 24)
          ),
        })),
        pending_production_count: pendingProduction.length,
      });
    } catch (error) {
      console.error("Pending actions error:", error);
      res.status(500).json({ message: "Failed to fetch pending actions" });
    }
  }
);

module.exports = router;
