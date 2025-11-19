const express = require("express");
const router = express.Router();
const {
  GoodsReceiptNote,
  PurchaseOrder,
  BillOfMaterials,
  SalesOrder,
  Inventory,
  InventoryMovement,
  Product,
  User,
  Vendor,
  Customer,
  Notification,
  VendorReturn,
  Approval,
  VendorRequest,
  Challan,
} = require("../config/database");
const { authenticateToken, checkDepartment } = require("../middleware/auth");
const {
  generateBarcode,
  generateBatchBarcode,
  generateInventoryQRData,
} = require("../utils/barcodeUtils");

// Get all GRNs
router.get(
  "/",
  authenticateToken,
  checkDepartment(["procurement", "inventory", "admin"]),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        verification_status,
        po_id,
      } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (verification_status)
        whereClause.verification_status = verification_status;
      if (po_id) whereClause.purchase_order_id = po_id;

      const { count, rows: grns } = await GoodsReceiptNote.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: PurchaseOrder,
            as: "purchaseOrder",
            include: [
              { model: Vendor, as: "vendor" },
              { model: Customer, as: "customer" },
            ],
          },
          { model: BillOfMaterials, as: "billOfMaterials", required: false },
          {
            model: SalesOrder,
            as: "salesOrder",
            required: false,
            include: [{ model: Customer, as: "customer" }],
          },
          { model: User, as: "creator", attributes: ["id", "email", "name"] },
          {
            model: User,
            as: "inspector",
            attributes: ["id", "email", "name"],
            required: false,
          },
          {
            model: User,
            as: "approver",
            attributes: ["id", "email", "name"],
            required: false,
          },
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [["created_at", "DESC"]],
      });

      const grnWithHierarchy = grns.map(grn => {
        let label = grn.is_first_grn ? "Original Receipt" : "Shortage Fulfillment Receipt";
        let badge = grn.is_first_grn ? "1st GRN" : `${grn.grn_sequence === 2 ? "2nd" : grn.grn_sequence + "th"} GRN`;
        
        return {
          ...grn.toJSON(),
          hierarchy: {
            is_first_grn: grn.is_first_grn,
            grn_sequence: grn.grn_sequence,
            grn_label: label,
            grn_status_badge: badge,
          }
        };
      });

      res.json({
        grns: grnWithHierarchy,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error fetching GRNs:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch GRNs", error: error.message });
    }
  }
);

// Get single GRN
router.get(
  "/:id",
  authenticateToken,
  checkDepartment(["procurement", "inventory", "admin"]),
  async (req, res) => {
    try {
      const grn = await GoodsReceiptNote.findByPk(req.params.id, {
        include: [
          {
            model: PurchaseOrder,
            as: "purchaseOrder",
            include: [
              { model: Vendor, as: "vendor" },
              { model: Customer, as: "customer" },
            ],
          },
          { model: BillOfMaterials, as: "billOfMaterials", required: false },
          {
            model: SalesOrder,
            as: "salesOrder",
            required: false,
            include: [{ model: Customer, as: "customer" }],
          },
          { model: User, as: "creator", attributes: ["id", "email", "name"] },
          {
            model: User,
            as: "inspector",
            attributes: ["id", "email", "name"],
            required: false,
          },
          {
            model: User,
            as: "approver",
            attributes: ["id", "email", "name"],
            required: false,
          },
        ],
      });

      if (!grn) {
        return res.status(404).json({ message: "GRN not found" });
      }

      let label = grn.is_first_grn ? "Original Receipt" : "Shortage Fulfillment Receipt";
      let badge = grn.is_first_grn ? "1st GRN" : `${grn.grn_sequence === 2 ? "2nd" : grn.grn_sequence + "th"} GRN`;

      const grnData = {
        ...grn.toJSON(),
        hierarchy: {
          is_first_grn: grn.is_first_grn,
          grn_sequence: grn.grn_sequence,
          grn_label: label,
          grn_status_badge: badge,
          original_grn_id: grn.original_grn_id,
          shortage_fulfillment_metadata: grn.shortage_fulfillment_metadata,
        }
      };

      res.json(grnData);
    } catch (error) {
      console.error("Error fetching GRN:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch GRN", error: error.message });
    }
  }
);

// Get PO data for GRN creation form
router.get(
  "/create/:poId",
  authenticateToken,
  checkDepartment(["inventory", "admin"]),
  async (req, res) => {
    try {
      const { poId } = req.params;

      const po = await PurchaseOrder.findByPk(poId, {
        include: [
          { model: Vendor, as: "vendor" },
          { model: Customer, as: "customer", required: false },
          { model: SalesOrder, as: "salesOrder", required: false },
          { model: BillOfMaterials, as: "billOfMaterials", required: false },
        ],
      });

      if (!po) {
        return res.status(404).json({ message: "Purchase Order not found" });
      }

      // Check if PO status allows GRN creation
      const allowedStatuses = ["grn_approved", "sent", "reopened", "grn_requested"];
      if (!allowedStatuses.includes(po.status)) {
        return res.status(400).json({
          message:
            "GRN creation not allowed for this PO. Status must be: grn_approved, sent, reopened, or grn_requested.",
        });
      }

      // For reopened or grn_requested POs, check if this is a shortage fulfillment
      let isReopenedForShortage = false;
      let shortageItems = [];
      let vendorRequest = null;
      const { VendorReturn } = require("../config/database");

      if (["reopened", "grn_requested"].includes(po.status)) {
        // First try VendorRequest (from approval workflow)
        vendorRequest = await VendorRequest.findOne({
          where: {
            purchase_order_id: poId,
            request_type: "shortage",
            status: ["sent", "acknowledged", "in_transit", "pending", "draft"],
          },
          order: [["created_at", "DESC"]],
        });

        // If no VendorRequest, try VendorReturn (from GRN shortage detection)
        if (!vendorRequest) {
          const vendorReturn = await VendorReturn.findOne({
            where: {
              purchase_order_id: poId,
              return_type: "shortage",
              status: ["pending", "approved", "in_transit"],
            },
            order: [["created_at", "DESC"]],
          });

          if (vendorReturn) {
            isReopenedForShortage = true;
            shortageItems = (vendorReturn.items || []).map((item) => ({
              ...item,
              shortage_qty: item.shortage_qty,
              shortage_quantity: item.shortage_qty,
            }));
          }
        } else {
          isReopenedForShortage = true;
          shortageItems = vendorRequest.items || [];
        }
      }

      // Check for existing GRNs for this PO to determine hierarchy
      const existingGRNs = await GoodsReceiptNote.findAll({
        where: { purchase_order_id: poId },
        order: [["created_at", "ASC"]],
        attributes: ["id", "grn_number", "grn_sequence", "is_first_grn", "created_at"],
      });

      let isFirstGRN = true;
      let grnSequence = 1;
      let shouldShowAllItems = true;

      if (existingGRNs.length > 0) {
        isFirstGRN = false;
        grnSequence = existingGRNs.length + 1;
        
        if (!["reopened", "grn_shortage", "grn_overage", "grn_requested"].includes(po.status)) {
          return res.status(400).json({
            message: "A GRN already exists for this Purchase Order. To create additional GRNs, the PO must be in 'reopened', 'grn_requested', 'grn_shortage', or 'grn_overage' status.",
            grn_id: existingGRNs[0].id,
            existing_grns: existingGRNs,
            current_po_status: po.status,
            workflow: {
              step_1: "First GRN created with shortage/overage detected",
              step_2: "PO status changes to 'grn_requested' (ready for shortage GRN)",
              step_3: "When shortage materials are received, create second GRN with shortages",
              step_4: "Second GRN materials automatically added to inventory with status tracking"
            },
            next_step: `PO is in '${po.status}' status. Please check workflow or material receipt status.`,
          });
        }
        
        shouldShowAllItems = false;
      }

      let items = [];

      // Decision logic: show all items for first GRN, only shortage items for subsequent
      if (!isFirstGRN && isReopenedForShortage && shortageItems.length > 0) {
        // For reopened PO with shortage (2nd+ GRN), show only shortage items
        items = shortageItems.map((item, index) => ({
          item_index: index,
          product_id: item.product_id || null,
          product_name: item.material_name,
          product_code: item.product_code || "",
          ordered_qty: item.shortage_qty || item.shortage_quantity || 0,
          unit: item.uom || item.unit || "Meters",
          rate: item.rate || 0,
          amount: (item.shortage_qty || item.shortage_quantity || 0) * (item.rate || 0),
          received_qty: 0,
          weight: 0,
          remarks: `Shortage fulfillment - Original ordered: ${item.ordered_qty}, Received: ${item.received_qty}`,
          color: item.color || "",
          hsn: item.hsn || "",
          gsm: item.gsm || "",
          width: item.width || "",
          description: item.description || "",
        }));
      } else {
        // For normal PO (first GRN) or reopened without shortage items, show all items
        items = (po.items || []).map((item, index) => ({
          item_index: index,
          product_id: item.product_id,
          product_name: item.product_name,
          product_code: item.product_code,
          ordered_qty: item.quantity,
          unit: item.unit,
          rate: item.rate,
          amount: item.amount,
          received_qty: 0,
          weight: 0,
          remarks: "",
        }));
      }

      // Determine GRN label and status badge
      let grnLabel = "Original Receipt";
      let grnStatusBadge = "1st GRN";
      if (!isFirstGRN) {
        grnLabel = "Shortage Fulfillment Receipt";
        grnStatusBadge = `${grnSequence === 2 ? "2nd" : grnSequence + "th"} GRN`;
      }

      // Fetch associated challan for this PO
      const challan = await Challan.findOne({
        where: {
          order_id: poId,
          order_type: 'purchase_order',
          type: 'inward',
          sub_type: 'purchase'
        },
        order: [['created_at', 'DESC']]
      });

      // Format PO data for GRN form
      const grnData = {
        po_id: po.id,
        po_number: po.po_number,
        po_date: po.po_date,
        total_amount: po.total_amount,
        project_name: po.project_name,
        customer: po.customer
          ? {
              id: po.customer.id,
              name: po.customer.name,
            }
          : null,
        vendor: {
          id: po.vendor.id,
          name: po.vendor.name,
        },
        order_date: po.order_date,
        expected_delivery_date: po.expected_delivery_date,
        items: items,
        
        challan: challan ? {
          id: challan.id,
          challan_number: challan.challan_number,
          status: challan.status
        } : null,
        
        hierarchy: {
          is_first_grn: isFirstGRN,
          grn_sequence: grnSequence,
          grn_label: grnLabel,
          grn_status_badge: grnStatusBadge,
          existing_grns_count: existingGRNs.length,
          existing_grns: existingGRNs,
        },
        
        is_shortage_fulfillment: isReopenedForShortage,
        vendor_request_id: vendorRequest?.id || null,
        vendor_request_number: vendorRequest?.request_number || null,
      };

      res.json(grnData);
    } catch (error) {
      console.error("Error fetching PO for GRN creation:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch PO data", error: error.message });
    }
  }
);

// Create GRN from Purchase Order
router.post(
  "/from-po/:poId",
  authenticateToken,
  checkDepartment(["inventory", "admin"]),
  async (req, res) => {
    const transaction =
      await require("../config/database").sequelize.transaction();

    try {
      const { poId } = req.params;
      const {
        received_date,
        inward_challan_number,
        supplier_invoice_number,
        items_received, // Array: [{ item_index, ordered_qty, invoiced_qty, received_qty, weight, remarks }]
        remarks,
        attachments,
      } = req.body;

      console.log("=== GRN Creation Debug ===");
      console.log("PO ID:", poId);
      console.log("Items received count:", items_received?.length);
      console.log("Items received sample:", items_received?.[0]);

      // Get PO with vendor details
      const po = await PurchaseOrder.findByPk(poId, {
        include: [
          { model: Vendor, as: "vendor" },
          { model: Customer, as: "customer" },
          { model: SalesOrder, as: "salesOrder" },
        ],
      });

      if (!po) {
        await transaction.rollback();
        return res.status(404).json({ message: "Purchase Order not found" });
      }

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

      // Check if this is a shortage fulfillment GRN
      let isShortageFulfillment = false;
      let originalGRNReference = null;
      let vendorRequest = null;
      let isFirstGRN = true;
      let grnSequence = 1;
      let originalFirstGRN = null;
      
      // Get all existing GRNs for this PO to determine sequence
      const existingGRNsForPO = await GoodsReceiptNote.findAll({
        where: { purchase_order_id: poId },
        order: [["created_at", "ASC"]],
        attributes: ["id", "grn_number", "is_first_grn"],
        transaction,
      });

      if (existingGRNsForPO.length > 0) {
        isFirstGRN = false;
        grnSequence = existingGRNsForPO.length + 1;
        originalFirstGRN = existingGRNsForPO[0];
      }
      
      if (["reopened", "grn_requested"].includes(po.status)) {
        const { VendorReturn } = require("../config/database");
        
        // First try VendorRequest
        vendorRequest = await VendorRequest.findOne({
          where: {
            purchase_order_id: poId,
            request_type: "shortage",
            status: ["sent", "acknowledged", "in_transit", "pending", "draft"],
          },
          order: [["created_at", "DESC"]],
          transaction,
        });

        // If no VendorRequest, try VendorReturn (from GRN shortage detection)
        if (!vendorRequest) {
          const vendorReturn = await VendorReturn.findOne({
            where: {
              purchase_order_id: poId,
              return_type: "shortage",
              status: ["pending", "approved", "in_transit"],
            },
            order: [["created_at", "DESC"]],
            transaction,
          });

          if (vendorReturn) {
            isShortageFulfillment = true;
            // Get the associated GRN
            const originalGRN = await GoodsReceiptNote.findByPk(vendorReturn.grn_id, {
              attributes: ["id", "grn_number"],
              transaction,
            });
            
            if (originalGRN) {
              originalGRNReference = {
                grn_id: originalGRN.id,
                grn_number: originalGRN.grn_number,
                vendor_return_id: vendorReturn.id,
                vendor_return_number: vendorReturn.return_number,
              };
            }
            
            // Transform VendorReturn items to match VendorRequest format
            vendorRequest = {
              items: (vendorReturn.items || []).map((item) => ({
                ...item,
                shortage_qty: item.shortage_qty || item.shortage_quantity,
              })),
            };
          }
        } else {
          isShortageFulfillment = true;
          const originalGRN = await GoodsReceiptNote.findByPk(vendorRequest.grn_id, {
            attributes: ["id", "grn_number"],
            transaction,
          });
          
          if (originalGRN) {
            originalGRNReference = {
              grn_id: originalGRN.id,
              grn_number: originalGRN.grn_number,
              vendor_request_id: vendorRequest.id,
              vendor_request_number: vendorRequest.request_number,
            };
          }
        }
      }

      // Map items from PO or vendor request (for shortage fulfillment)
      let sourceItems = [];
      
      if (isShortageFulfillment && vendorRequest) {
        sourceItems = vendorRequest.items || [];
        console.log("Shortage fulfillment - using vendor request items:", sourceItems.length);
      } else {
        sourceItems = po.items || [];
        console.log("Normal GRN - using PO items:", sourceItems.length);
      }

      if (sourceItems.length > 0) {
        console.log(
          "Source Item sample structure:",
          JSON.stringify(sourceItems[0], null, 2)
        );
      }

      const mappedItems = items_received.map((receivedItem) => {
        const sourceItem = sourceItems[receivedItem.item_index];

        if (!sourceItem) {
          throw new Error(
            `Invalid item_index: ${receivedItem.item_index}. Source has ${sourceItems.length} items.`
          );
        }

        let orderedQty, materialName, color, hsn, gsm, width, description, uom, rate;

        if (isShortageFulfillment) {
          orderedQty = parseFloat(sourceItem.shortage_qty || sourceItem.shortage_quantity || 0);
          materialName = sourceItem.material_name;
          color = sourceItem.color || "";
          hsn = sourceItem.hsn || "";
          gsm = sourceItem.gsm || "";
          width = sourceItem.width || "";
          description = sourceItem.description || "";
          uom = sourceItem.uom || sourceItem.unit || "Meters";
          rate = parseFloat(sourceItem.rate) || 0;
        } else {
          orderedQty = parseFloat(sourceItem.quantity);
          
          if (sourceItem.type === "fabric") {
            materialName =
              sourceItem.fabric_name ||
              sourceItem.material_name ||
              sourceItem.name ||
              sourceItem.item_name ||
              "Unknown Fabric";
          } else {
            materialName =
              sourceItem.item_name ||
              sourceItem.material_name ||
              sourceItem.name ||
              sourceItem.fabric_name ||
              "Unknown Item";
          }
          
          color = sourceItem.color || "";
          hsn = sourceItem.hsn || sourceItem.hsn_code || "";
          gsm = sourceItem.gsm || "";
          width = sourceItem.width || "";
          description = sourceItem.description || "";
          uom = sourceItem.uom || sourceItem.unit || "Meters";
          rate = parseFloat(sourceItem.rate) || 0;
        }

        const invoicedQty = receivedItem.invoiced_qty
          ? parseFloat(receivedItem.invoiced_qty)
          : orderedQty;
        const receivedQty = parseFloat(receivedItem.received_qty);

        const hasShortage = receivedQty < Math.min(orderedQty, invoicedQty);
        const hasOverage = receivedQty > Math.max(orderedQty, invoicedQty);
        const invoiceVsOrderMismatch = invoicedQty !== orderedQty;

        return {
          material_name: materialName,
          color: color,
          hsn: hsn,
          gsm: gsm,
          width: width,
          description: description,
          uom: uom,
          ordered_quantity: orderedQty,
          invoiced_quantity: invoicedQty,
          received_quantity: receivedQty,
          shortage_quantity: hasShortage
            ? Math.min(orderedQty, invoicedQty) - receivedQty
            : 0,
          overage_quantity: hasOverage
            ? receivedQty - Math.max(orderedQty, invoicedQty)
            : 0,
          weight: receivedItem.weight ? parseFloat(receivedItem.weight) : null,
          rate: rate,
          total: receivedQty * rate,
          quality_status: "pending_inspection",
          discrepancy_flag: hasShortage || hasOverage || invoiceVsOrderMismatch,
          remarks: receivedItem.remarks || "",
          is_shortage_fulfillment: isShortageFulfillment,
        };
      });

      // Calculate total received value
      const totalReceivedValue = mappedItems.reduce(
        (sum, item) => sum + item.total,
        0
      );

      console.log("=== Creating GRN ===");
      console.log("Mapped Items:", JSON.stringify(mappedItems, null, 2));

      // Create GRN
      const grnData = {
        grn_number: grnNumber,
        purchase_order_id: po.id,
        vendor_id: po.vendor_id,
        bill_of_materials_id: null,
        sales_order_id: po.linked_sales_order_id || null,
        received_date: received_date || new Date(),
        supplier_name: po.vendor.name,
        supplier_invoice_number: supplier_invoice_number || null,
        inward_challan_number: inward_challan_number || null,
        items_received: mappedItems,
        total_received_value: totalReceivedValue,
        status: "received",
        verification_status: "pending",
        remarks: isShortageFulfillment && originalGRNReference
          ? `${remarks || ''}\n\nShortage fulfillment for original GRN ${originalGRNReference.grn_number} (Vendor Request: ${originalGRNReference.vendor_request_number})`.trim()
          : remarks || "",
        attachments: attachments || [],
        created_by: req.user.id,
        inventory_added: false,
        
        grn_sequence: grnSequence,
        is_first_grn: isFirstGRN,
        original_grn_id: isShortageFulfillment ? originalFirstGRN?.id : null,
        shortage_fulfillment_metadata: isShortageFulfillment && originalGRNReference ? {
          is_shortage_fulfillment: true,
          original_grn_id: originalGRNReference.grn_id,
          original_grn_number: originalGRNReference.grn_number,
          vendor_request_id: originalGRNReference.vendor_request_id,
          vendor_request_number: originalGRNReference.vendor_request_number,
          complaint_date: new Date(),
        } : null,
        
        metadata: originalGRNReference ? {
          is_shortage_fulfillment: true,
          original_grn_id: originalGRNReference.grn_id,
          original_grn_number: originalGRNReference.grn_number,
          vendor_request_id: originalGRNReference.vendor_request_id,
          vendor_request_number: originalGRNReference.vendor_request_number,
        } : null,
      };

      console.log("GRN Data being saved:", JSON.stringify(grnData, null, 2));

      const grn = await GoodsReceiptNote.create(grnData, { transaction });

      // AUTO-ADD RECEIVED ITEMS TO INVENTORY IMMEDIATELY
      // This ensures inventory is tracked even when shortages are detected
      console.log("=== AUTO-ADDING ITEMS TO INVENTORY ===");
      const createdInventoryItems = [];
      const createdMovements = [];

      for (let i = 0; i < mappedItems.length; i++) {
        const item = mappedItems[i];
        if (!item.received_quantity || parseFloat(item.received_quantity) <= 0) {
          continue;
        }

        try {
          // Try to find or create product
          let product = null;
          const productName = item.material_name;

          if (productName) {
            product = await Product.findOne({
              where: { name: productName },
              transaction,
            });

            if (!product) {
              const isFabric = item.color || item.gsm || item.width;
              const category = isFabric ? "fabric" : "accessories";
              const productType = isFabric ? "raw_material" : "accessory";

              let unitOfMeasurement = "meter";
              if (item.uom) {
                const uomLower = item.uom.toLowerCase();
                if (uomLower.includes("meter") || uomLower.includes("mtr")) {
                  unitOfMeasurement = "meter";
                } else if (uomLower.includes("piece") || uomLower.includes("pcs")) {
                  unitOfMeasurement = "piece";
                } else if (uomLower.includes("kg") || uomLower.includes("kilogram")) {
                  unitOfMeasurement = "kg";
                } else if (uomLower.includes("gram") || uomLower.includes("gm")) {
                  unitOfMeasurement = "gram";
                } else if (uomLower.includes("yard")) {
                  unitOfMeasurement = "yard";
                } else if (uomLower.includes("dozen")) {
                  unitOfMeasurement = "dozen";
                } else if (uomLower.includes("set")) {
                  unitOfMeasurement = "set";
                } else if (uomLower.includes("liter") || uomLower.includes("litre")) {
                  unitOfMeasurement = "liter";
                }
              }

              product = await Product.create(
                {
                  product_code: `PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  name: productName,
                  description: item.description || "",
                  category: category,
                  product_type: productType,
                  unit_of_measurement: unitOfMeasurement,
                  hsn_code: item.hsn || null,
                  color: item.color || null,
                  cost_price: parseFloat(item.rate) || 0,
                  selling_price: parseFloat(item.rate) * 1.2 || 0,
                  specifications: {
                    gsm: item.gsm || null,
                    width: item.width || null,
                    source: "grn_auto_created",
                  },
                  minimum_stock_level: 10,
                  reorder_level: 20,
                  status: "active",
                  is_batch_tracked: true,
                  created_by: req.user.id,
                },
                { transaction }
              );
            }
          }

          // Generate barcode and batch number
          const barcode = generateBarcode("INV");
          const batchBarcode = generateBatchBarcode(po.po_number, i);

          // Prepare QR code data
          const inventoryDataForQR = {
            id: null, // Will be set after creation
            barcode: barcode,
            product_id: null,
            location: "Main Warehouse",
            current_stock: item.received_quantity,
            batch_number: batchBarcode,
          };

          const qr_code = generateInventoryQRData(inventoryDataForQR, po.po_number);

          // Determine quality status based on shortage
          let qualityStatus = "approved";
          if (item.shortage_quantity > 0) {
            qualityStatus = "quarantine"; // Mark shortage items as quarantine for review
          }

          // Determine unit of measurement from item.uom
          let unitOfMeasurement = "piece";
          if (item.uom) {
            const uomLower = item.uom.toLowerCase();
            if (uomLower.includes("meter") || uomLower.includes("mtr")) {
              unitOfMeasurement = "meter";
            } else if (uomLower.includes("piece") || uomLower.includes("pcs")) {
              unitOfMeasurement = "piece";
            } else if (uomLower.includes("kg") || uomLower.includes("kilogram")) {
              unitOfMeasurement = "kg";
            } else if (uomLower.includes("gram") || uomLower.includes("gm")) {
              unitOfMeasurement = "gram";
            } else if (uomLower.includes("yard")) {
              unitOfMeasurement = "yard";
            } else if (uomLower.includes("dozen")) {
              unitOfMeasurement = "dozen";
            } else if (uomLower.includes("set")) {
              unitOfMeasurement = "set";
            } else if (uomLower.includes("liter") || uomLower.includes("litre")) {
              unitOfMeasurement = "liter";
            }
          }

          const isFabric = item.color || item.gsm || item.width;
          const category = isFabric ? "fabric" : "raw_material";

          // Create inventory entry
          const inventoryData = {
            product_id: product ? product.id : null,
            purchase_order_id: po.id,
            po_item_index: i,
            product_code: product ? product.product_code : barcode,
            product_name: item.material_name || "Unnamed Material",
            description: item.description || item.material_name || "",
            category: category,
            product_type: isFabric ? "raw_material" : "raw_material",
            unit_of_measurement: unitOfMeasurement,
            hsn_code: item.hsn || null,
            color: item.color || null,
            specifications: {
              gsm: item.gsm || null,
              width: item.width || null,
              uom: item.uom || null,
              source: "grn_received",
              grn_number: grnNumber,
            },
            cost_price: parseFloat(item.rate) || 0,
            selling_price: parseFloat(item.rate) * 1.2 || 0,
            location: "Main Warehouse",
            batch_number: batchBarcode,
            serial_number: null,
            current_stock: parseFloat(item.received_quantity),
            initial_quantity: parseFloat(item.received_quantity),
            consumed_quantity: 0,
            reserved_stock: 0,
            available_stock: parseFloat(item.received_quantity),
            minimum_level: 0,
            maximum_level: parseFloat(item.received_quantity) * 2,
            reorder_level: parseFloat(item.received_quantity) * 0.2,
            unit_cost: parseFloat(item.rate) || 0,
            total_value: parseFloat(item.total) || 0,
            last_purchase_date: new Date(),
            quality_status: qualityStatus,
            condition: "new",
            notes: item.shortage_quantity > 0 
              ? `Received from GRN: ${grnNumber}, PO: ${po.po_number}. ⚠️ SHORTAGE: ${item.shortage_quantity} ${item.uom || 'units'} short (expected ${item.ordered_quantity}, received ${item.received_quantity})`
              : `Received from GRN: ${grnNumber}, PO: ${po.po_number}`,
            barcode: barcode,
            qr_code: qr_code,
            is_active: true,
            movement_type: "inward",
            last_movement_date: new Date(),
            project_id: po.customer_id || null,
            stock_type: po.linked_sales_order_id ? "project_specific" : "general_extra",
            created_by: req.user.id,
            updated_by: req.user.id,
          };

          const inventoryItem = await Inventory.create(inventoryData, { transaction });
          createdInventoryItems.push(inventoryItem);

          console.log(`✓ Inventory item ${i + 1} created: ${item.material_name} (${item.received_quantity} ${item.uom})`);

          // Create inventory movement record
          const movement = await InventoryMovement.create(
            {
              inventory_id: inventoryItem.id,
              purchase_order_id: po.id,
              movement_type: "inward",
              quantity: parseFloat(item.received_quantity),
              previous_quantity: 0,
              new_quantity: parseFloat(item.received_quantity),
              unit_cost: parseFloat(item.rate) || 0,
              total_cost: parseFloat(item.total) || 0,
              location_from: po.vendor.name,
              location_to: "Main Warehouse",
              reference_number: grnNumber,
              performed_by: req.user.id,
              movement_date: new Date(),
              notes: `Auto-added from GRN: ${grnNumber}, PO: ${po.po_number}. Unit: ${item.uom || "Meters"}`,
              metadata: {
                grn_id: grn.id,
                po_number: po.po_number,
                item_index: i,
                uom: item.uom || "Meters",
                auto_added: true,
              },
            },
            { transaction }
          );
          createdMovements.push(movement);

          console.log(`✓ Inventory movement ${i + 1} created for tracking`);
        } catch (invError) {
          console.error(`✗ Failed to auto-add inventory item ${i + 1}:`, invError.message);
          // Don't fail the entire GRN creation if inventory add fails
          // Just log it and continue
        }
      }

      // Update GRN to mark inventory as added
      if (createdInventoryItems.length > 0) {
        await grn.update(
          {
            inventory_added: true,
            inventory_added_date: new Date(),
          },
          { transaction }
        );
        console.log(`✓ GRN marked as inventory_added (${createdInventoryItems.length} items)`);
      }

      // Determine PO status based on discrepancies (will be updated after checking items)
      let poStatus = "received"; // Default status

      // Check for discrepancies (shortages, overages, invoice mismatches)
      const shortageItems = mappedItems.filter(
        (item) => item.shortage_quantity > 0
      );
      const overageItems = mappedItems.filter(
        (item) => item.overage_quantity > 0
      );
      const invoiceMismatchItems = mappedItems.filter(
        (item) => item.invoiced_quantity !== item.ordered_quantity
      );
      const perfectMatchItems = mappedItems.filter(
        (item) => 
          item.received_quantity === item.ordered_quantity &&
          item.received_quantity === item.invoiced_quantity
      );

      let vendorReturn = null;
      const complaints = [];

      // Create complaint for SHORTAGES
      if (shortageItems.length > 0) {
        const totalShortageValue = shortageItems.reduce(
          (sum, item) => sum + item.shortage_quantity * item.rate,
          0
        );

        const complaint = await Approval.create(
          {
            entity_type: "purchase_order",
            entity_id: po.id,
            stage_key: "grn_shortage_complaint",
            stage_label: `GRN Shortage Complaint - ${shortageItems.length} item(s)`,
            status: "pending",
            metadata: {
              grn_id: grn.id,
              grn_number: grnNumber,
              complaint_type: "shortage",
              po_number: po.po_number,
              vendor_name: po.vendor.name,
              items_affected: shortageItems.map((item) => ({
                material_name: item.material_name,
                ordered_qty: item.ordered_quantity,
                invoiced_qty: item.invoiced_quantity,
                received_qty: item.received_quantity,
                shortage_qty: item.shortage_quantity,
                shortage_value: (item.shortage_quantity * item.rate).toFixed(2),
                remarks: item.remarks,
              })),
              total_shortage_value: totalShortageValue.toFixed(2),
              action_required: "Approve shortage and coordinate with vendor for replacement",
              created_at: new Date(),
            },
            created_by: req.user.id,
          },
          { transaction }
        );
        complaints.push(complaint);

        // Generate return number: VR-YYYYMMDD-XXXXX
        const returnDateStr = today
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");
        const lastReturn = await VendorReturn.findOne({
          where: {
            return_number: {
              [require("sequelize").Op.like]: `VR-${returnDateStr}-%`,
            },
          },
          order: [["created_at", "DESC"]],
          transaction,
        });

        let returnSequence = 1;
        if (lastReturn) {
          const lastReturnSequence = parseInt(
            lastReturn.return_number.split("-")[2]
          );
          returnSequence = lastReturnSequence + 1;
        }
        const returnNumber = `VR-${returnDateStr}-${returnSequence
          .toString()
          .padStart(5, "0")}`;

        // Create vendor return request
        vendorReturn = await VendorReturn.create(
          {
            return_number: returnNumber,
            purchase_order_id: po.id,
            grn_id: grn.id,
            vendor_id: po.vendor_id,
            return_type: "shortage",
            return_date: new Date(),
            items: shortageItems.map((item) => ({
              material_name: item.material_name,
              color: item.color,
              uom: item.uom,
              ordered_qty: item.ordered_quantity,
              invoiced_qty: item.invoiced_quantity,
              received_qty: item.received_quantity,
              shortage_qty: item.shortage_quantity,
              rate: item.rate,
              shortage_value: item.shortage_quantity * item.rate,
              reason: "Quantity mismatch - shortage detected during GRN",
              remarks: item.remarks,
            })),
            total_shortage_value: totalShortageValue,
            status: "pending",
            created_by: req.user.id,
            remarks: `Auto-generated from GRN ${grnNumber}. Shortage detected in ${shortageItems.length} item(s).`,
          },
          { transaction }
        );

        // Create broadcast notification for all users
        await Notification.create(
          {
            user_id: null,
            type: "vendor_shortage",
            title: "⚠️ GRN Shortage Detected",
            message: `Shortage detected in GRN ${grnNumber} for PO ${
              po.po_number
            }. Vendor return request ${returnNumber} created. Total shortage value: ₹${totalShortageValue.toFixed(
              2
            )}. Complaint logged in Procurement Dashboard.`,
            data: { grn_id: grn.id, po_id: po.id, return_id: vendorReturn.id, complaint_id: complaint.id },
            read: false,
          },
          { transaction }
        );

        // Send targeted notifications to procurement department
        const procurementUsers = await require("../config/database").User.findAll({
          where: { department: "procurement", status: "active" },
          transaction,
        });

        for (const procUser of procurementUsers) {
          await Notification.create(
            {
              user_id: procUser.id,
              type: "procurement_action_required",
              title: "🔔 Shortage Request - Action Required",
              message: `Material shortage in PO ${po.po_number} (GRN ${grnNumber}). ${shortageItems.length} item(s) short, total value: ₹${totalShortageValue.toFixed(2)}. Vendor return ${returnNumber} created. Please review and approve in Pending Requests.`,
              data: { grn_id: grn.id, po_id: po.id, return_id: vendorReturn.id, complaint_id: complaint.id, action_type: "shortage" },
              read: false,
            },
            { transaction }
          );
        }

        // Send notification to PO creator
        if (po.created_by) {
          await Notification.create(
            {
              user_id: po.created_by,
              type: "vendor_shortage",
              title: "⚠️ Shortage in Your PO",
              message: `Shortage detected in GRN ${grnNumber} for your PO ${
                po.po_number
              }. ${shortageItems.length} item(s) short. Vendor return ${returnNumber} created. Total shortage: ₹${totalShortageValue.toFixed(
                2
              )}. Please review and coordinate with vendor.`,
              data: { grn_id: grn.id, po_id: po.id, return_id: vendorReturn.id, complaint_id: complaint.id },
              read: false,
            },
            { transaction }
          );
        }

        // Update PO status to indicate shortage
        poStatus = "grn_shortage";
      }

      // Create complaint for OVERAGES
      if (overageItems.length > 0) {
        const totalOverageValue = overageItems.reduce(
          (sum, item) => sum + item.overage_quantity * item.rate,
          0
        );

        const complaint = await Approval.create(
          {
            entity_type: "purchase_order",
            entity_id: po.id,
            stage_key: "grn_overage_complaint",
            stage_label: `GRN Overage Complaint - ${overageItems.length} item(s)`,
            status: "pending",
            metadata: {
              grn_id: grn.id,
              grn_number: grnNumber,
              complaint_type: "overage",
              po_number: po.po_number,
              vendor_name: po.vendor.name,
              items_affected: overageItems.map((item) => ({
                material_name: item.material_name,
                ordered_qty: item.ordered_quantity,
                invoiced_qty: item.invoiced_quantity,
                received_qty: item.received_quantity,
                overage_qty: item.overage_quantity,
                overage_value: (item.overage_quantity * item.rate).toFixed(2),
                remarks: item.remarks,
              })),
              total_overage_value: totalOverageValue.toFixed(2),
              action_required: "Approve overage, coordinate with vendor for credit note or return",
              created_at: new Date(),
            },
            created_by: req.user.id,
          },
          { transaction }
        );
        complaints.push(complaint);

        // Create broadcast notification for all users
        await Notification.create(
          {
            user_id: null,
            type: "vendor_overage",
            title: "📦 GRN Overage Detected",
            message: `Overage detected in GRN ${grnNumber} for PO ${
              po.po_number
            }. ${overageItems.length} item(s) received more than ordered. Total overage value: ₹${totalOverageValue.toFixed(
              2
            )}. Complaint logged in Procurement Dashboard.`,
            data: { grn_id: grn.id, po_id: po.id, complaint_id: complaint.id },
            read: false,
          },
          { transaction }
        );

        // Send targeted notifications to procurement department
        const procurementUsers = await require("../config/database").User.findAll({
          where: { department: "procurement", status: "active" },
          transaction,
        });

        for (const procUser of procurementUsers) {
          await Notification.create(
            {
              user_id: procUser.id,
              type: "procurement_action_required",
              title: "🔔 Overage Request - Action Required",
              message: `Material overage in PO ${po.po_number} (GRN ${grnNumber}). ${overageItems.length} item(s) over, total value: ₹${totalOverageValue.toFixed(2)}. Please review and decide action (accept/return/credit note) in Pending Requests.`,
              data: { grn_id: grn.id, po_id: po.id, complaint_id: complaint.id, action_type: "overage" },
              read: false,
            },
            { transaction }
          );
        }

        // Send notification to PO creator
        if (po.created_by) {
          await Notification.create(
            {
              user_id: po.created_by,
              type: "vendor_overage",
              title: "📦 Overage in Your PO",
              message: `Overage detected in GRN ${grnNumber} for your PO ${
                po.po_number
              }. ${overageItems.length} item(s) received more than ordered. Total overage: ₹${totalOverageValue.toFixed(
                2
              )}. Please review and decide on action (accept/return/credit note).`,
              data: { grn_id: grn.id, po_id: po.id, complaint_id: complaint.id },
              read: false,
            },
            { transaction }
          );
        }

        // Update PO status to indicate overage (only if not already shortage)
        if (poStatus !== "grn_shortage") {
          poStatus = "grn_overage";
        }
      }

      // Create complaint for INVOICE MISMATCHES (Invoice != PO qty)
      if (invoiceMismatchItems.length > 0 && shortageItems.length === 0 && overageItems.length === 0) {
        const complaint = await Approval.create(
          {
            entity_type: "purchase_order",
            entity_id: po.id,
            stage_key: "grn_invoice_mismatch",
            stage_label: `GRN Invoice Mismatch - ${invoiceMismatchItems.length} item(s)`,
            status: "pending",
            metadata: {
              grn_number: grnNumber,
              complaint_type: "invoice_mismatch",
              po_number: po.po_number,
              vendor_name: po.vendor.name,
              items_affected: invoiceMismatchItems.map((item) => ({
                material_name: item.material_name,
                ordered_qty: item.ordered_quantity,
                invoiced_qty: item.invoiced_quantity,
                received_qty: item.received_quantity,
                mismatch_notes: `Invoice shows ${item.invoiced_quantity} but PO ordered ${item.ordered_quantity}`,
              })),
              action_required: "Verify invoice accuracy with vendor and resolve discrepancy",
              created_at: new Date(),
            },
            created_by: req.user.id,
          },
          { transaction }
        );
        complaints.push(complaint);

        // Create notification
        await Notification.create(
          {
            user_id: null,
            type: "vendor_mismatch",
            title: "🔍 GRN Invoice Mismatch",
            message: `Invoice discrepancy in GRN ${grnNumber} for PO ${po.po_number}. ${invoiceMismatchItems.length} item(s) have invoice quantities different from PO. Complaint logged in Procurement Dashboard.`,
            data: { grn_id: grn.id, po_id: po.id, complaint_id: complaint.id },
            read: false,
          },
          { transaction }
        );
      }

      // Create notification for verification team
      await Notification.create(
        {
          user_id: null, // Send to inventory/QC department
          type: "grn_verification",
          title: "New GRN Pending Verification",
          message: `GRN ${grnNumber} created for PO ${
            po.po_number
          }. Please verify received materials.${
            shortageItems.length > 0 ? " ⚠️ Shortages detected!" : ""
          }`,
          data: { grn_id: grn.id, po_id: po.id },
          read: false,
        },
        { transaction }
      );

      // Update GRN verification status based on discrepancies
      let verificationStatus = "verified"; // Default to verified for perfect matches
      let grnStatus = "verified"; // Will be auto-approved for perfect matches

      if (shortageItems.length > 0 || overageItems.length > 0 || invoiceMismatchItems.length > 0) {
        verificationStatus = "discrepancy";
        grnStatus = "received"; // Needs manual verification
      }

      // Update GRN with verification status
      if (perfectMatchItems.length === mappedItems.length && mappedItems.length > 0) {
        // All items are perfect matches - auto-verify
        await grn.update(
          {
            verification_status: "verified",
            status: "inspected",
            verified_by: req.user.id,
            verification_date: new Date(),
            verification_notes: "Auto-verified: All items match perfectly (Ordered = Invoiced = Received)",
          },
          { transaction }
        );
      } else if (shortageItems.length > 0 || overageItems.length > 0 || invoiceMismatchItems.length > 0) {
        // Discrepancies detected
        await grn.update(
          {
            verification_status: "discrepancy",
            status: "received",
          },
          { transaction }
        );
      }

      // Update vendor request if this is a shortage fulfillment
      if (vendorRequest) {
        await vendorRequest.update(
          {
            status: "fulfilled",
            fulfillment_grn_id: grn.id,
            fulfilled_at: new Date(),
          },
          { transaction }
        );

        await po.update(
          {
            status: "completed",
            received_date: received_date || new Date(),
          },
          { transaction }
        );

        await Notification.create(
          {
            user_id: null,
            type: "vendor_request_sent",
            title: "✅ Vendor Request Fulfilled",
            message: `Vendor request ${vendorRequest.request_number} has been fulfilled. Shortage materials received via GRN ${grnNumber}.`,
            data: {
              vendor_request_id: vendorRequest.id,
              request_number: vendorRequest.request_number,
              grn_id: grn.id,
              grn_number: grnNumber,
              po_id: po.id,
            },
            read: false,
          },
          { transaction }
        );
      } else {
        await po.update(
          {
            status: poStatus,
            received_date: received_date || new Date(),
          },
          { transaction }
        );
      }

      await transaction.commit();

      // Build response message
      let message = "";
      if (perfectMatchItems.length === mappedItems.length && mappedItems.length > 0) {
        message = "✅ GRN created successfully! All items verified (perfect match).";
      } else {
        const issues = [];
        if (shortageItems.length > 0) issues.push(`${shortageItems.length} shortage(s)`);
        if (overageItems.length > 0) issues.push(`${overageItems.length} overage(s)`);
        if (invoiceMismatchItems.length > 0) issues.push(`${invoiceMismatchItems.length} invoice mismatch(es)`);
        message = `⚠️ GRN created with discrepancies: ${issues.join(", ")}. Complaints logged in Procurement Dashboard.`;
      }

      res.status(201).json({
        message: `✅ ${message} ${createdInventoryItems.length > 0 ? `\n✅ ${createdInventoryItems.length} item(s) automatically added to inventory.` : ""}`,
        grn,
        vendor_return: vendorReturn,
        complaints,
        has_shortages: shortageItems.length > 0,
        shortage_count: shortageItems.length,
        has_overages: overageItems.length > 0,
        overage_count: overageItems.length,
        has_invoice_mismatches: invoiceMismatchItems.length > 0,
        invoice_mismatch_count: invoiceMismatchItems.length,
        perfect_match_count: perfectMatchItems.length,
        all_items_verified: perfectMatchItems.length === mappedItems.length,
        inventory_items_created: createdInventoryItems.length,
        inventory_items: createdInventoryItems,
        inventory_movements: createdMovements,
        next_step: perfectMatchItems.length === mappedItems.length ? "none_needed" : "review_shortages",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating GRN from PO:", error);
      res
        .status(500)
        .json({ message: "Failed to create GRN", error: error.message });
    }
  }
);

// Create GRN from MRN (Material Request)
router.post(
  "/from-mrn/:mrnId",
  authenticateToken,
  checkDepartment(["inventory", "admin"]),
  async (req, res) => {
    const transaction =
      await require("../config/database").sequelize.transaction();

    try {
      const { mrnId } = req.params;
      const {
        received_date,
        inward_challan_number,
        supplier_invoice_number,
        items_received, // Array: [{ item_index, received_qty, weight, remarks }]
        remarks,
        attachments,
      } = req.body;

      console.log("=== GRN Creation from MRN Debug ===");
      console.log("MRN ID:", mrnId);

      // Get MRN with all details
      const mrn =
        await require("../config/database").ProjectMaterialRequest.findByPk(
          mrnId,
          {
            include: [
              {
                model: require("../config/database").PurchaseOrder,
                as: "purchaseOrder",
                include: [
                  { model: require("../config/database").Vendor, as: "vendor" },
                  {
                    model: require("../config/database").Customer,
                    as: "customer",
                  },
                ],
              },
              {
                model: require("../config/database").SalesOrder,
                as: "salesOrder",
                required: false,
                include: [
                  {
                    model: require("../config/database").Customer,
                    as: "customer",
                  },
                ],
              },
              {
                model: require("../config/database").User,
                as: "creator",
                attributes: ["id", "email", "name"],
              },
            ],
            transaction,
          }
        );

      if (!mrn) {
        await transaction.rollback();
        return res.status(404).json({ message: "Material Request not found" });
      }

      if (
        mrn.status !== "pending" &&
        mrn.status !== "reviewed" &&
        mrn.status !== "forwarded_to_inventory"
      ) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "MRN is not in a valid state for GRN creation" });
      }

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

      // Map items from MRN with received quantities
      const mrnItems = mrn.items || [];
      console.log("MRN Items count:", mrnItems.length);

      const mappedItems = items_received.map((receivedItem) => {
        const mrnItem = mrnItems[receivedItem.item_index];

        if (!mrnItem) {
          throw new Error(
            `Invalid item_index: ${receivedItem.item_index}. MRN has ${mrnItems.length} items.`
          );
        }

        const requestedQty = parseFloat(mrnItem.quantity);
        const receivedQty = parseFloat(receivedItem.received_qty);

        return {
          material_name: mrnItem.material_name,
          color: mrnItem.color || "",
          hsn: mrnItem.hsn || "",
          gsm: mrnItem.gsm || "",
          width: mrnItem.width || "",
          description: mrnItem.description || "",
          uom: mrnItem.unit || mrnItem.uom || "Units",
          ordered_quantity: requestedQty,
          invoiced_quantity: requestedQty, // For MRN, invoiced = requested
          received_quantity: receivedQty,
          shortage_quantity:
            receivedQty < requestedQty ? requestedQty - receivedQty : 0,
          overage_quantity:
            receivedQty > requestedQty ? receivedQty - requestedQty : 0,
          weight: receivedItem.weight ? parseFloat(receivedItem.weight) : null,
          rate: parseFloat(mrnItem.rate) || 0,
          total: receivedQty * (parseFloat(mrnItem.rate) || 0),
          quality_status: "pending_inspection",
          discrepancy_flag: receivedQty !== requestedQty,
          remarks: receivedItem.remarks || "",
          purpose: mrnItem.purpose || "",
        };
      });

      // Calculate total received value
      const totalReceivedValue = mappedItems.reduce(
        (sum, item) => sum + item.total,
        0
      );

      console.log("=== Creating GRN from MRN ===");
      console.log("Mapped Items:", JSON.stringify(mappedItems, null, 2));

      // Create GRN
      const grnData = {
        grn_number: grnNumber,
        purchase_order_id: mrn.purchase_order_id,
        vendor_id: mrn.purchaseOrder?.vendor_id,
        bill_of_materials_id: null,
        sales_order_id: mrn.sales_order_id || null,
        received_date: received_date || new Date(),
        supplier_name: mrn.purchaseOrder?.vendor?.name || "Internal",
        supplier_invoice_number: supplier_invoice_number || null,
        inward_challan_number: inward_challan_number || null,
        items_received: mappedItems,
        total_received_value: totalReceivedValue,
        status: "received",
        verification_status: "pending",
        remarks: remarks || `Created from MRN ${mrn.request_number}`,
        attachments: attachments || [],
        created_by: req.user.id,
        inventory_added: false,
        created_from_mrn: true,
        mrn_id: mrn.id,
      };

      console.log("GRN Data being saved:", JSON.stringify(grnData, null, 2));

      const grn = await GoodsReceiptNote.create(grnData, { transaction });

      // Update MRN status to accepted
      await mrn.update(
        {
          status: "accepted",
          processed_date: new Date(),
          processed_by: req.user.id,
        },
        { transaction }
      );

      // Send notification
      const NotificationService = require("../utils/notificationService");
      await NotificationService.notifyInventoryAction("grn_created", {
        grn_number: grnNumber,
        mrn_number: mrn.request_number,
        project_name: mrn.project_name,
        total_items: mappedItems.length,
        total_value: totalReceivedValue,
      });

      await transaction.commit();

      res.status(201).json({
        message: "GRN created successfully from MRN",
        grn,
        mrn_updated: true,
        next_step: "verification",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating GRN from MRN:", error);
      res
        .status(500)
        .json({
          message: "Failed to create GRN from MRN",
          error: error.message,
        });
    }
  }
);

// Verify GRN (Quality Check)
router.post(
  "/:id/verify",
  authenticateToken,
  checkDepartment(["inventory", "admin"]),
  async (req, res) => {
    const transaction =
      await require("../config/database").sequelize.transaction();

    try {
      const {
        verification_status, // 'verified' or 'discrepancy'
        verification_notes,
        discrepancy_details, // { qty_mismatch: bool, weight_mismatch: bool, quality_issue: bool, details: string }
      } = req.body;

      const grn = await GoodsReceiptNote.findByPk(req.params.id, {
        include: [{ model: PurchaseOrder, as: "purchaseOrder" }],
        transaction,
      });

      if (!grn) {
        await transaction.rollback();
        return res.status(404).json({ message: "GRN not found" });
      }

      if (
        grn.verification_status !== "pending" &&
        grn.verification_status !== "discrepancy"
      ) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: `GRN already ${grn.verification_status}` });
      }

      // Update GRN with verification details
      await grn.update(
        {
          verification_status,
          verified_by: req.user.id,
          verification_date: new Date(),
          verification_notes: verification_notes || "",
          discrepancy_details:
            verification_status === "discrepancy" ? discrepancy_details : null,
          status:
            verification_status === "verified" || verification_status === "discrepancy"
              ? "inspected"
              : "received",
        },
        { transaction }
      );

      let nextStep = "";
      let notificationMessage = "";

      if (
        verification_status === "verified" ||
        verification_status === "discrepancy"
      ) {
        // Add to inventory - verified items clean, discrepancy items marked for review
        console.log(
          `=== Auto-adding GRN to inventory (${verification_status}) ===`
        );

        const createdInventoryItems = [];
        const createdMovements = [];
        const items = grn.items_received || [];
        const location = "Main Warehouse"; // Default location for auto-addition

        // Process each item
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (
            !item.received_quantity ||
            parseFloat(item.received_quantity) <= 0
          ) {
            continue;
          }

          // Try to find or create product
          let product = null;
          const productName = item.material_name;

          if (productName) {
            product = await Product.findOne({
              where: { name: productName },
              transaction,
            });

            if (!product) {
              // Determine category and product type
              const isFabric = item.color || item.gsm || item.width;
              const category = isFabric ? "fabric" : "accessories";
              const productType = isFabric ? "raw_material" : "accessory";

              // Determine unit of measurement
              let unitOfMeasurement = "meter";
              if (item.uom) {
                const uomLower = item.uom.toLowerCase();
                if (uomLower.includes("meter") || uomLower.includes("mtr")) {
                  unitOfMeasurement = "meter";
                } else if (
                  uomLower.includes("piece") ||
                  uomLower.includes("pcs")
                ) {
                  unitOfMeasurement = "piece";
                } else if (
                  uomLower.includes("kg") ||
                  uomLower.includes("kilogram")
                ) {
                  unitOfMeasurement = "kg";
                } else if (
                  uomLower.includes("gram") ||
                  uomLower.includes("gm")
                ) {
                  unitOfMeasurement = "gram";
                } else if (uomLower.includes("yard")) {
                  unitOfMeasurement = "yard";
                } else if (uomLower.includes("dozen")) {
                  unitOfMeasurement = "dozen";
                } else if (uomLower.includes("set")) {
                  unitOfMeasurement = "set";
                } else if (
                  uomLower.includes("liter") ||
                  uomLower.includes("litre")
                ) {
                  unitOfMeasurement = "liter";
                }
              }

              product = await Product.create(
                {
                  product_code: `PRD-${Date.now()}-${Math.floor(
                    Math.random() * 1000
                  )}`,
                  name: productName,
                  description: item.description || "",
                  category: category,
                  product_type: productType,
                  unit_of_measurement: unitOfMeasurement,
                  hsn_code: item.hsn || null,
                  color: item.color || null,
                  cost_price: parseFloat(item.rate) || 0,
                  selling_price: parseFloat(item.rate) * 1.2 || 0, // 20% markup
                  specifications: {
                    gsm: item.gsm || null,
                    width: item.width || null,
                    source: "grn_auto_created",
                  },
                  minimum_stock_level: 10,
                  reorder_level: 20,
                  status: "active",
                  is_batch_tracked: true,
                  created_by: req.user.id,
                },
                { transaction }
              );
            }
          }

          // Generate unique barcode and batch number using utility functions
          const barcode = generateBarcode("INV");
          const batchBarcode = generateBatchBarcode(
            grn.purchaseOrder.po_number,
            i
          );

          // Prepare inventory item data for QR code generation
          const inventoryData = {
            id: null, // Will be set after creation
            barcode: barcode,
            product_id: product ? product.id : null,
            location: location,
            current_stock: item.received_quantity,
            batch_number: batchBarcode,
          };

          const qr_code = generateInventoryQRData(
            inventoryData,
            grn.purchaseOrder.po_number
          );

          // Determine category and product type for inventory
          const isFabricInv = item.color || item.gsm || item.width;
          const categoryInv = isFabricInv ? "fabric" : "raw_material";
          const productTypeInv = isFabricInv ? "raw_material" : "raw_material";

          // Determine unit of measurement from item.uom
          let unitOfMeasurementInv = "piece";
          if (item.uom) {
            const uomLower = item.uom.toLowerCase();
            if (uomLower.includes("meter") || uomLower.includes("mtr")) {
              unitOfMeasurementInv = "meter";
            } else if (uomLower.includes("piece") || uomLower.includes("pcs")) {
              unitOfMeasurementInv = "piece";
            } else if (
              uomLower.includes("kg") ||
              uomLower.includes("kilogram")
            ) {
              unitOfMeasurementInv = "kg";
            } else if (uomLower.includes("gram") || uomLower.includes("gm")) {
              unitOfMeasurementInv = "gram";
            } else if (uomLower.includes("yard")) {
              unitOfMeasurementInv = "yard";
            } else if (uomLower.includes("dozen")) {
              unitOfMeasurementInv = "dozen";
            } else if (uomLower.includes("set")) {
              unitOfMeasurementInv = "set";
            } else if (
              uomLower.includes("liter") ||
              uomLower.includes("litre")
            ) {
              unitOfMeasurementInv = "liter";
            }
          }

          // Create inventory entry with barcode, QR code, AND all product details
          let inventoryItem;
          try {
            inventoryItem = await Inventory.create(
              {
                product_id: product ? product.id : null,
                purchase_order_id: grn.purchase_order_id,
                po_item_index: i,
                // PRODUCT DETAILS (merged fields from Inventory model)
                product_code: product ? product.product_code : barcode,
                product_name: item.material_name || "Unnamed Material",
                description: item.description || item.material_name || "",
                category: categoryInv,
                product_type: productTypeInv,
                unit_of_measurement: unitOfMeasurementInv,
                hsn_code: item.hsn || null,
                color: item.color || null,
                specifications: {
                  gsm: item.gsm || null,
                  width: item.width || null,
                  uom: item.uom || null,
                  source: "grn_auto_verified",
                  grn_number: grn.grn_number,
                },
                cost_price: parseFloat(item.rate) || 0,
                selling_price: parseFloat(item.rate) * 1.2 || 0, // 20% markup
                // STOCK AND LOCATION
                location: location,
                batch_number: batchBarcode,
                serial_number: null,
                current_stock: parseFloat(item.received_quantity),
                initial_quantity: parseFloat(item.received_quantity),
                consumed_quantity: 0,
                reserved_stock: 0,
                available_stock: parseFloat(item.received_quantity),
                minimum_level: 0,
                maximum_level: parseFloat(item.received_quantity) * 2,
                reorder_level: parseFloat(item.received_quantity) * 0.2,
                unit_cost: parseFloat(item.rate) || 0,
                total_value: parseFloat(item.total) || 0,
                last_purchase_date: new Date(),
                quality_status:
                  verification_status === "discrepancy" &&
                  (item.shortage_quantity > 0 || item.overage_quantity > 0)
                    ? "quarantine"
                    : item.quality_status === "pending_inspection" ||
                        item.quality_status === "passed"
                      ? "approved"
                      : item.quality_status || "approved",
                condition: "new",
                notes: `Received from GRN: ${grn.grn_number}, PO: ${grn.purchaseOrder.po_number}${
                  verification_status === "discrepancy" &&
                  (item.shortage_quantity > 0 || item.overage_quantity > 0)
                    ? ` - Shortage: ${item.shortage_quantity || 0}`
                    : ""
                }`,
                barcode: barcode,
                qr_code: qr_code,
                is_active: true,
                movement_type: "inward",
                last_movement_date: new Date(),
                // Set stock type based on whether it has a linked sales order
                project_id: grn.sales_order_id
                  ? grn.purchaseOrder.customer_id
                  : null,
                stock_type: grn.sales_order_id
                  ? "project_specific"
                  : "general_extra",
                created_by: req.user.id,
                updated_by: req.user.id,
              },
              { transaction }
            );

            createdInventoryItems.push(inventoryItem);

            // Create inventory movement record
            await InventoryMovement.create(
              {
                inventory_id: inventoryItem.id,
                purchase_order_id: grn.purchase_order_id,
                sales_order_id: grn.sales_order_id || null,
                movement_type: "inward",
                quantity: parseFloat(item.received_quantity),
                previous_quantity: 0,
                new_quantity: parseFloat(item.received_quantity),
                unit_cost: parseFloat(item.rate) || 0,
                total_cost: parseFloat(item.total) || 0,
                reference_number: grn.grn_number,
                notes: `Auto-added from verified GRN ${grn.grn_number}`,
                location_to: location,
                performed_by: req.user.id,
              },
              { transaction }
            );

            createdMovements.push(inventoryItem);
          } catch (invError) {
            console.error(
              `Failed to create inventory item ${i + 1}:`,
              invError.message
            );
            throw invError;
          }
        }

        // Update GRN to mark as added to inventory
        await grn.update(
          {
            inventory_added: true,
            inventory_added_date: new Date(),
            status: "approved",
          },
          { transaction }
        );

        if (verification_status === "verified") {
          nextStep = "completed";
          notificationMessage = `GRN ${grn.grn_number} verified and automatically added to inventory. ${createdInventoryItems.length} items added with barcodes generated.`;
        } else {
          // Discrepancy - items added to inventory but marked as quarantine
          nextStep = "review_quarantine";
          notificationMessage = `GRN ${grn.grn_number} has shortages/overages. ${createdInventoryItems.length} items added to inventory in quarantine status. Pending vendor request for remaining materials.`;
        }
      } else {
        // Should not reach here, but handle gracefully
        nextStep = "pending";
        notificationMessage = `GRN ${grn.grn_number} verification status: ${verification_status}`;
      }

      // Create notification
      await Notification.create(
        {
          user_id: null, // Send to procurement/inventory managers
          type:
            nextStep === "add_to_inventory"
              ? "grn_verified"
              : "grn_discrepancy",
          title:
            verification_status === "verified"
              ? "GRN Verified"
              : "GRN Discrepancy Found",
          message: notificationMessage,
          data: { grn_id: grn.id, po_id: grn.purchase_order_id },
          read: false,
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: "GRN verification completed",
        grn,
        next_step: nextStep,
        inventory_items_added:
          verification_status === "verified" ? createdInventoryItems.length : 0,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error verifying GRN:", error);
      res
        .status(500)
        .json({ message: "Failed to verify GRN", error: error.message });
    }
  }
);

// Approve Discrepancy
router.post(
  "/:id/approve-discrepancy",
  authenticateToken,
  checkDepartment(["procurement", "admin"]),
  async (req, res) => {
    const transaction =
      await require("../config/database").sequelize.transaction();

    try {
      const { approval_notes, decision } = req.body; // decision: 'approve' or 'reject'

      const grn = await GoodsReceiptNote.findByPk(req.params.id, {
        include: [{ model: PurchaseOrder, as: "purchaseOrder" }],
        transaction,
      });

      if (!grn) {
        await transaction.rollback();
        return res.status(404).json({ message: "GRN not found" });
      }

      if (grn.verification_status !== "discrepancy") {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "GRN does not have discrepancy status" });
      }

      const newStatus = decision === "approve" ? "approved" : "rejected";

      await grn.update(
        {
          verification_status: newStatus,
          discrepancy_approved_by: req.user.id,
          discrepancy_approval_date: new Date(),
          discrepancy_approval_notes: approval_notes || "",
          status: newStatus,
        },
        { transaction }
      );

      let nextStep = decision === "approve" ? "add_to_inventory" : "completed";
      let inventoryItemsAdded = 0;

      // If approved, automatically add to inventory
      if (decision === "approve") {
        console.log("=== Auto-adding approved GRN to inventory ===");

        const createdInventoryItems = [];
        const createdMovements = [];
        const items = grn.items_received || [];
        const location = "Main Warehouse"; // Default location for auto-addition

        // Process each item
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (
            !item.received_quantity ||
            parseFloat(item.received_quantity) <= 0
          ) {
            continue;
          }

          // Try to find or create product
          let product = null;
          const productName = item.material_name;

          if (productName) {
            product = await Product.findOne({
              where: { name: productName },
              transaction,
            });

            if (!product) {
              // Determine category and product type
              const isFabric = item.color || item.gsm || item.width;
              const category = isFabric ? "fabric" : "accessories";
              const productType = isFabric ? "raw_material" : "accessory";

              // Determine unit of measurement
              let unitOfMeasurement = "meter";
              if (item.uom) {
                const uomLower = item.uom.toLowerCase();
                if (uomLower.includes("meter") || uomLower.includes("mtr")) {
                  unitOfMeasurement = "meter";
                } else if (
                  uomLower.includes("piece") ||
                  uomLower.includes("pcs")
                ) {
                  unitOfMeasurement = "piece";
                } else if (
                  uomLower.includes("kg") ||
                  uomLower.includes("kilogram")
                ) {
                  unitOfMeasurement = "kg";
                } else if (
                  uomLower.includes("gram") ||
                  uomLower.includes("gm")
                ) {
                  unitOfMeasurement = "gram";
                } else if (uomLower.includes("yard")) {
                  unitOfMeasurement = "yard";
                } else if (uomLower.includes("dozen")) {
                  unitOfMeasurement = "dozen";
                } else if (uomLower.includes("set")) {
                  unitOfMeasurement = "set";
                } else if (
                  uomLower.includes("liter") ||
                  uomLower.includes("litre")
                ) {
                  unitOfMeasurement = "liter";
                }
              }

              product = await Product.create(
                {
                  product_code: `PRD-${Date.now()}-${Math.floor(
                    Math.random() * 1000
                  )}`,
                  name: productName,
                  description: item.description || "",
                  category: category,
                  product_type: productType,
                  unit_of_measurement: unitOfMeasurement,
                  hsn_code: item.hsn || null,
                  color: item.color || null,
                  cost_price: parseFloat(item.rate) || 0,
                  selling_price: parseFloat(item.rate) * 1.2 || 0, // 20% markup
                  specifications: {
                    gsm: item.gsm || null,
                    width: item.width || null,
                    source: "grn_auto_created",
                  },
                  minimum_stock_level: 10,
                  reorder_level: 20,
                  status: "active",
                  is_batch_tracked: true,
                  created_by: req.user.id,
                },
                { transaction }
              );
            }
          }

          // Generate unique barcode and batch number using utility functions
          const barcode = generateBarcode("INV");
          const batchBarcode = generateBatchBarcode(
            grn.purchaseOrder.po_number,
            i
          );

          // Prepare inventory item data for QR code generation
          const inventoryData = {
            id: null, // Will be set after creation
            barcode: barcode,
            product_id: product ? product.id : null,
            location: location,
            current_stock: item.received_quantity,
            batch_number: batchBarcode,
          };

          const qr_code = generateInventoryQRData(
            inventoryData,
            grn.purchaseOrder.po_number
          );

          // Determine category and product type for inventory
          const isFabricInv2 = item.color || item.gsm || item.width;
          const categoryInv2 = isFabricInv2 ? "fabric" : "raw_material";
          const productTypeInv2 = isFabricInv2
            ? "raw_material"
            : "raw_material";

          // Determine unit of measurement from item.uom
          let unitOfMeasurementInv2 = "piece";
          if (item.uom) {
            const uomLower = item.uom.toLowerCase();
            if (uomLower.includes("meter") || uomLower.includes("mtr")) {
              unitOfMeasurementInv2 = "meter";
            } else if (uomLower.includes("piece") || uomLower.includes("pcs")) {
              unitOfMeasurementInv2 = "piece";
            } else if (
              uomLower.includes("kg") ||
              uomLower.includes("kilogram")
            ) {
              unitOfMeasurementInv2 = "kg";
            } else if (uomLower.includes("gram") || uomLower.includes("gm")) {
              unitOfMeasurementInv2 = "gram";
            } else if (uomLower.includes("yard")) {
              unitOfMeasurementInv2 = "yard";
            } else if (uomLower.includes("dozen")) {
              unitOfMeasurementInv2 = "dozen";
            } else if (uomLower.includes("set")) {
              unitOfMeasurementInv2 = "set";
            } else if (
              uomLower.includes("liter") ||
              uomLower.includes("litre")
            ) {
              unitOfMeasurementInv2 = "liter";
            }
          }

          // Create inventory entry with barcode, QR code, AND all product details
          let inventoryItem;
          try {
            inventoryItem = await Inventory.create(
              {
                product_id: product ? product.id : null,
                purchase_order_id: grn.purchase_order_id,
                po_item_index: i,
                // PRODUCT DETAILS (merged fields from Inventory model)
                product_code: product ? product.product_code : barcode,
                product_name: item.material_name || "Unnamed Material",
                description: item.description || item.material_name || "",
                category: categoryInv2,
                product_type: productTypeInv2,
                unit_of_measurement: unitOfMeasurementInv2,
                hsn_code: item.hsn || null,
                color: item.color || null,
                specifications: {
                  gsm: item.gsm || null,
                  width: item.width || null,
                  uom: item.uom || null,
                  source: "grn_discrepancy_approved",
                  grn_number: grn.grn_number,
                },
                cost_price: parseFloat(item.rate) || 0,
                selling_price: parseFloat(item.rate) * 1.2 || 0, // 20% markup
                // STOCK AND LOCATION
                location: location,
                batch_number: batchBarcode,
                serial_number: null,
                current_stock: parseFloat(item.received_quantity),
                initial_quantity: parseFloat(item.received_quantity),
                consumed_quantity: 0,
                reserved_stock: 0,
                available_stock: parseFloat(item.received_quantity),
                minimum_level: 0,
                maximum_level: parseFloat(item.received_quantity) * 2,
                reorder_level: parseFloat(item.received_quantity) * 0.2,
                unit_cost: parseFloat(item.rate) || 0,
                total_value: parseFloat(item.total) || 0,
                last_purchase_date: new Date(),
                quality_status:
                  item.quality_status === "pending_inspection" ||
                  item.quality_status === "passed"
                    ? "approved"
                    : item.quality_status || "approved",
                condition: "new",
                notes: `Received from GRN: ${grn.grn_number}, PO: ${grn.purchaseOrder.po_number}`,
                barcode: barcode,
                qr_code: qr_code,
                is_active: true,
                movement_type: "inward",
                last_movement_date: new Date(),
                // Set stock type based on whether it has a linked sales order
                project_id: grn.sales_order_id
                  ? grn.purchaseOrder.customer_id
                  : null,
                stock_type: grn.sales_order_id
                  ? "project_specific"
                  : "general_extra",
                created_by: req.user.id,
                updated_by: req.user.id,
              },
              { transaction }
            );

            createdInventoryItems.push(inventoryItem);

            // Create inventory movement record
            await InventoryMovement.create(
              {
                inventory_id: inventoryItem.id,
                purchase_order_id: grn.purchase_order_id,
                sales_order_id: grn.sales_order_id || null,
                movement_type: "inward",
                quantity: parseFloat(item.received_quantity),
                previous_quantity: 0,
                new_quantity: parseFloat(item.received_quantity),
                unit_cost: parseFloat(item.rate) || 0,
                total_cost: parseFloat(item.total) || 0,
                reference_number: grn.grn_number,
                notes: `Auto-added from approved GRN ${grn.grn_number}`,
                location_to: location,
                performed_by: req.user.id,
              },
              { transaction }
            );

            createdMovements.push(inventoryItem);
          } catch (invError) {
            console.error(
              `Failed to create inventory item ${i + 1}:`,
              invError.message
            );
            throw invError;
          }
        }

        // Update GRN to mark as added to inventory
        await grn.update(
          {
            inventory_added: true,
            inventory_added_date: new Date(),
            status: "approved",
          },
          { transaction }
        );

        nextStep = "completed";
        inventoryItemsAdded = createdInventoryItems.length;
      }

      // Create notification
      await Notification.create(
        {
          user_id: null,
          type: "grn_discrepancy_resolved",
          title: `GRN Discrepancy ${
            decision === "approve" ? "Approved" : "Rejected"
          }`,
          message: `GRN ${grn.grn_number} discrepancy has been ${decision}d. ${
            decision === "approve"
              ? `${inventoryItemsAdded} items added to inventory with barcodes generated.`
              : "Rejected by manager."
          }`,
          data: { grn_id: grn.id, po_id: grn.purchase_order_id },
          read: false,
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: `Discrepancy ${decision}d successfully`,
        grn,
        next_step: nextStep,
        inventory_items_added: inventoryItemsAdded,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error approving discrepancy:", error);
      res
        .status(500)
        .json({
          message: "Failed to approve discrepancy",
          error: error.message,
        });
    }
  }
);

// Add GRN to Inventory (Final Step)
router.post(
  "/:id/add-to-inventory",
  authenticateToken,
  checkDepartment(["inventory", "admin"]),
  async (req, res) => {
    const transaction =
      await require("../config/database").sequelize.transaction();

    try {
      console.log("=== Starting Add to Inventory ===");
      const { location = "Main Warehouse" } = req.body;

      const grn = await GoodsReceiptNote.findByPk(req.params.id, {
        include: [
          { model: PurchaseOrder, as: "purchaseOrder" },
          { model: SalesOrder, as: "salesOrder" },
        ],
        transaction,
      });

      if (!grn) {
        await transaction.rollback();
        return res.status(404).json({ message: "GRN not found" });
      }

      // Check if verification is complete
      if (!["verified", "approved"].includes(grn.verification_status)) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Cannot add to inventory. GRN verification status is '${grn.verification_status}'. Must be verified or approved.`,
        });
      }

      if (grn.inventory_added) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "GRN already added to inventory" });
      }

      const createdInventoryItems = [];
      const createdMovements = [];
      const items = grn.items_received || [];

      // Process each item
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (
          !item.received_quantity ||
          parseFloat(item.received_quantity) <= 0
        ) {
          continue;
        }

        // Try to find or create product
        let product = null;
        const productName = item.material_name;

        if (productName) {
          product = await Product.findOne({
            where: { name: productName },
            transaction,
          });

          if (!product) {
            // Determine category and product type
            const isFabric = item.color || item.gsm || item.width;
            const category = isFabric ? "fabric" : "accessories";
            const productType = isFabric ? "raw_material" : "accessory";

            // Determine unit of measurement
            let unitOfMeasurement = "meter";
            if (item.uom) {
              const uomLower = item.uom.toLowerCase();
              if (uomLower.includes("meter") || uomLower.includes("mtr")) {
                unitOfMeasurement = "meter";
              } else if (
                uomLower.includes("piece") ||
                uomLower.includes("pcs")
              ) {
                unitOfMeasurement = "piece";
              } else if (
                uomLower.includes("kg") ||
                uomLower.includes("kilogram")
              ) {
                unitOfMeasurement = "kg";
              } else if (uomLower.includes("gram") || uomLower.includes("gm")) {
                unitOfMeasurement = "gram";
              } else if (uomLower.includes("yard")) {
                unitOfMeasurement = "yard";
              } else if (uomLower.includes("dozen")) {
                unitOfMeasurement = "dozen";
              } else if (uomLower.includes("set")) {
                unitOfMeasurement = "set";
              } else if (
                uomLower.includes("liter") ||
                uomLower.includes("litre")
              ) {
                unitOfMeasurement = "liter";
              }
            }

            console.log("Creating new product with data:", {
              product_code: `PRD-${Date.now()}-${Math.floor(
                Math.random() * 1000
              )}`,
              name: productName,
              category: category,
              product_type: productType,
              unit_of_measurement: unitOfMeasurement,
            });

            product = await Product.create(
              {
                product_code: `PRD-${Date.now()}-${Math.floor(
                  Math.random() * 1000
                )}`,
                name: productName,
                description: item.description || "",
                category: category,
                product_type: productType,
                unit_of_measurement: unitOfMeasurement,
                hsn_code: item.hsn || null,
                color: item.color || null,
                cost_price: parseFloat(item.rate) || 0,
                selling_price: parseFloat(item.rate) * 1.2 || 0, // 20% markup
                specifications: {
                  gsm: item.gsm || null,
                  width: item.width || null,
                  source: "grn_auto_created",
                },
                minimum_stock_level: 10,
                reorder_level: 20,
                status: "active",
                is_batch_tracked: true,
                created_by: req.user.id,
              },
              { transaction }
            );

            console.log("Product created successfully:", product.id);
          }
        }

        // Generate unique barcode and batch number using utility functions
        const barcode = generateBarcode("INV");
        const batchBarcode = generateBatchBarcode(
          grn.purchaseOrder.po_number,
          i
        );

        // Prepare inventory item data for QR code generation
        const inventoryData = {
          id: null, // Will be set after creation
          barcode: barcode,
          product_id: product ? product.id : null,
          location: location,
          current_stock: item.received_quantity,
          batch_number: batchBarcode,
        };

        const qr_code = generateInventoryQRData(
          inventoryData,
          grn.purchaseOrder.po_number
        );

        console.log(`Creating inventory item ${i + 1}:`, {
          product_id: product ? product.id : null,
          location: location,
          batch_number: batchBarcode,
          current_stock: parseFloat(item.received_quantity),
          quality_status:
            item.quality_status === "pending_inspection" ||
            item.quality_status === "passed"
              ? "approved"
              : item.quality_status || "approved",
          movement_type: "inward",
        });

        // Determine category and product type
        const isFabric = item.color || item.gsm || item.width;
        const category = isFabric ? "fabric" : "raw_material";
        const productType = isFabric ? "raw_material" : "raw_material";

        // Determine unit of measurement from item.uom
        let unitOfMeasurement = "piece";
        if (item.uom) {
          const uomLower = item.uom.toLowerCase();
          if (uomLower.includes("meter") || uomLower.includes("mtr")) {
            unitOfMeasurement = "meter";
          } else if (uomLower.includes("piece") || uomLower.includes("pcs")) {
            unitOfMeasurement = "piece";
          } else if (uomLower.includes("kg") || uomLower.includes("kilogram")) {
            unitOfMeasurement = "kg";
          } else if (uomLower.includes("gram") || uomLower.includes("gm")) {
            unitOfMeasurement = "gram";
          } else if (uomLower.includes("yard")) {
            unitOfMeasurement = "yard";
          } else if (uomLower.includes("dozen")) {
            unitOfMeasurement = "dozen";
          } else if (uomLower.includes("set")) {
            unitOfMeasurement = "set";
          } else if (uomLower.includes("liter") || uomLower.includes("litre")) {
            unitOfMeasurement = "liter";
          }
        }

        // Create inventory entry with barcode, QR code, AND all product details
        let inventoryItem;
        try {
          inventoryItem = await Inventory.create(
            {
              product_id: product ? product.id : null,
              purchase_order_id: grn.purchase_order_id,
              po_item_index: i,
              // PRODUCT DETAILS (merged fields from Inventory model)
              product_code: product ? product.product_code : barcode,
              product_name: item.material_name || "Unnamed Material",
              description: item.description || item.material_name || "",
              category: category,
              product_type: productType,
              unit_of_measurement: unitOfMeasurement,
              hsn_code: item.hsn || null,
              color: item.color || null,
              specifications: {
                gsm: item.gsm || null,
                width: item.width || null,
                uom: item.uom || null,
                source: "grn_received",
                grn_number: grn.grn_number,
              },
              cost_price: parseFloat(item.rate) || 0,
              selling_price: parseFloat(item.rate) * 1.2 || 0, // 20% markup
              // STOCK AND LOCATION
              location: location,
              batch_number: batchBarcode,
              serial_number: null,
              current_stock: parseFloat(item.received_quantity),
              initial_quantity: parseFloat(item.received_quantity),
              consumed_quantity: 0,
              reserved_stock: 0,
              available_stock: parseFloat(item.received_quantity),
              minimum_level: 0,
              maximum_level: parseFloat(item.received_quantity) * 2,
              reorder_level: parseFloat(item.received_quantity) * 0.2,
              unit_cost: parseFloat(item.rate) || 0,
              total_value: parseFloat(item.total) || 0,
              last_purchase_date: new Date(),
              quality_status:
                item.quality_status === "pending_inspection" ||
                item.quality_status === "passed"
                  ? "approved"
                  : item.quality_status || "approved",
              condition: "new",
              notes: `Received from GRN: ${grn.grn_number}, PO: ${grn.purchaseOrder.po_number}`,
              barcode: barcode,
              qr_code: qr_code,
              is_active: true,
              movement_type: "inward",
              last_movement_date: new Date(),
              // Set stock type based on whether it has a linked sales order
              project_id: grn.sales_order_id
                ? grn.purchaseOrder.customer_id
                : null,
              stock_type: grn.sales_order_id
                ? "project_specific"
                : "general_extra",
              created_by: req.user.id,
              updated_by: req.user.id,
            },
            { transaction }
          );
          console.log(
            `✓ Inventory item ${i + 1} created successfully:`,
            inventoryItem.id
          );
        } catch (invError) {
          console.error(
            `✗ Failed to create inventory item ${i + 1}:`,
            invError.message
          );
          console.error("Full error:", invError);
          throw invError;
        }

        createdInventoryItems.push(inventoryItem);

        // Create inventory movement record
        console.log(`Creating inventory movement ${i + 1}:`, {
          inventory_id: inventoryItem.id,
          movement_type: "inward",
          quantity: parseFloat(item.received_quantity),
          previous_quantity: 0,
          new_quantity: parseFloat(item.received_quantity),
        });

        let movement;
        try {
          movement = await InventoryMovement.create(
            {
              inventory_id: inventoryItem.id,
              purchase_order_id: grn.purchase_order_id,
              movement_type: "inward",
              quantity: parseFloat(item.received_quantity),
              previous_quantity: 0, // First entry, so previous is 0
              new_quantity: parseFloat(item.received_quantity),
              unit_cost: parseFloat(item.rate) || 0,
              total_cost: parseFloat(item.total) || 0,
              location_from: grn.supplier_name,
              location_to: location,
              reference_number: grn.grn_number,
              performed_by: req.user.id,
              movement_date: new Date(),
              notes: `Added from GRN: ${grn.grn_number}, PO: ${
                grn.purchaseOrder.po_number
              }. Unit: ${item.uom || "Meters"}`,
              metadata: {
                grn_id: grn.id,
                po_number: grn.purchaseOrder.po_number,
                item_index: i,
                uom: item.uom || "Meters",
              },
            },
            { transaction }
          );
          console.log(
            `✓ Inventory movement ${i + 1} created successfully:`,
            movement.id
          );
        } catch (movError) {
          console.error(
            `✗ Failed to create inventory movement ${i + 1}:`,
            movError.message
          );
          console.error("Full error:", movError);
          throw movError;
        }

        createdMovements.push(movement);
      }

      // Update GRN
      await grn.update(
        {
          inventory_added: true,
          inventory_added_date: new Date(),
          status: "approved", // Final status
        },
        { transaction }
      );

      // Update PO status
      await grn.purchaseOrder.update(
        {
          status: "completed",
          inventory_updated: true,
        },
        { transaction }
      );

      // Create notification
      await Notification.create(
        {
          type: "inventory",
          title: "Materials Added to Inventory",
          message: `${createdInventoryItems.length} items from GRN ${grn.grn_number} added to inventory successfully.`,
          priority: "medium",
          status: "sent",
          recipient_department: "inventory",
          related_entity_id: grn.id,
          related_entity_type: "grn",
          action_url: `/inventory?grn=${grn.grn_number}`,
          metadata: {
            grn_id: grn.id,
            grn_number: grn.grn_number,
            po_id: grn.purchase_order_id,
            po_number: grn.purchaseOrder.po_number,
            inventory_count: createdInventoryItems.length,
          },
          trigger_event: "grn_added_to_inventory",
          actor_id: req.user.id,
          created_by: req.user.id,
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: "GRN successfully added to inventory",
        grn,
        inventory_items: createdInventoryItems,
        movements: createdMovements,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error adding GRN to inventory:", error);
      res
        .status(500)
        .json({
          message: "Failed to add GRN to inventory",
          error: error.message,
        });
    }
  }
);

// Old endpoints - kept for backward compatibility but marked as deprecated
router.post(
  "/",
  authenticateToken,
  checkDepartment(["procurement", "admin"]),
  async (req, res) => {
    res.status(400).json({
      message: "Deprecated: Use POST /grn/from-po/:poId instead",
      new_endpoint: "/api/grn/from-po/:poId",
    });
  }
);

router.put(
  "/:id/inspect",
  authenticateToken,
  checkDepartment(["inventory", "admin"]),
  async (req, res) => {
    res.status(400).json({
      message: "Deprecated: Use POST /grn/:id/verify instead",
      new_endpoint: "/api/grn/:id/verify",
    });
  }
);
router.post(
  "/:id/request-vendor-revert",
  authenticateToken,
  checkDepartment(["inventory", "admin"]),
  async (req, res) => {
    try {
      const grnId = req.params.id;
      const { reason, shortage_items, notes } = req.body;

      console.log("=== Vendor Revert Request ===");
      console.log("GRN ID:", grnId);
      console.log("Reason:", reason);
      console.log("Shortage items:", JSON.stringify(shortage_items, null, 2));
      console.log("Notes:", notes);

      // 🔍 Find GRN from database
      const grn = await GoodsReceiptNote.findByPk(req.params.id, {
        include: [{ model: PurchaseOrder, as: "purchaseOrder" }],
      });

      if (!grn) {
        return res.status(404).json({ message: "GRN not found" });
      }

      // ✅ Update status and vendor revert fields with request body data
      grn.status = "vendor_revert_requested";
      grn.vendor_revert_requested = true;
      grn.vendor_revert_requested_by = req.user.id;
      grn.vendor_revert_requested_date = new Date();

      // Save the reason, items, and notes from request body
      grn.vendor_revert_reason = notes ? `${reason}: ${notes}` : reason;
      grn.vendor_revert_items = shortage_items || [];

      await grn.save();

      console.log("✅ Vendor revert request saved successfully");

      // 📦 Return updated data from database
      res.json({
        message: "Vendor revert requested successfully",
        grn: {
          id: grn.id,
          grn_number: grn.grn_number,
          status: grn.status,
          po_id: grn.purchase_order_id,
          vendor_id: grn.purchaseOrder ? grn.purchaseOrder.vendor_id : null,
          total_quantity: grn.total_quantity,
          total_amount: grn.total_amount,
          received_date: grn.received_date,
          vendor_revert_reason: grn.vendor_revert_reason,
          vendor_revert_items: grn.vendor_revert_items,
        },
      });
    } catch (error) {
      console.error("Error in /request-vendor-revert:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);
router.put(
  "/:id/approve",
  authenticateToken,
  checkDepartment(["procurement", "admin"]),
  async (req, res) => {
    res.status(400).json({
      message: "Deprecated: Use POST /grn/:id/add-to-inventory instead",
      new_endpoint: "/api/grn/:id/add-to-inventory",
    });
  }
);

// Update draft GRN with actual received quantities (for auto-created GRNs)
router.put(
  "/:id/update-received",
  authenticateToken,
  checkDepartment(["inventory", "admin"]),
  async (req, res) => {
    const transaction =
      await require("../config/database").sequelize.transaction();

    try {
      const {
        received_date,
        inward_challan_number,
        supplier_invoice_number,
        items_received, // Array: [{ item_index, ordered_qty, invoiced_qty, received_qty, weight, remarks }]
        remarks,
        attachments,
      } = req.body;

      const grn = await GoodsReceiptNote.findByPk(req.params.id, {
        include: [{ model: PurchaseOrder, as: "purchaseOrder" }],
        transaction,
      });

      if (!grn) {
        await transaction.rollback();
        return res.status(404).json({ message: "GRN not found" });
      }

      if (grn.status !== "draft") {
        await transaction.rollback();
        return res
          .status(400)
          .json({
            message: "Only draft GRNs can be updated with received quantities",
          });
      }

      // Map items from request to GRN format with actual received quantities
      const poItems = grn.purchaseOrder.items || [];
      const mappedItems = items_received.map((receivedItem) => {
        const poItem = poItems[receivedItem.item_index];

        if (!poItem) {
          throw new Error(
            `Invalid item_index: ${receivedItem.item_index}. PO has ${poItems.length} items.`
          );
        }

        const orderedQty = parseFloat(poItem.quantity);
        const invoicedQty = receivedItem.invoiced_qty
          ? parseFloat(receivedItem.invoiced_qty)
          : orderedQty;
        const receivedQty = parseFloat(receivedItem.received_qty);

        // Detect discrepancies
        const hasShortage = receivedQty < Math.min(orderedQty, invoicedQty);
        const hasOverage = receivedQty > Math.max(orderedQty, invoicedQty);
        const invoiceVsOrderMismatch = invoicedQty !== orderedQty;

        // Extract material name with multiple fallback options
        let materialName = "";
        if (poItem.type === "fabric") {
          materialName =
            poItem.fabric_name ||
            poItem.material_name ||
            poItem.name ||
            poItem.item_name ||
            "Unknown Fabric";
        } else {
          materialName =
            poItem.item_name ||
            poItem.material_name ||
            poItem.name ||
            poItem.fabric_name ||
            "Unknown Item";
        }

        return {
          material_name: materialName,
          color: poItem.color || "",
          hsn: poItem.hsn || poItem.hsn_code || "",
          gsm: poItem.gsm || "",
          width: poItem.width || "",
          description: poItem.description || "",
          uom: poItem.uom || poItem.unit || "Meters",
          ordered_quantity: orderedQty,
          invoiced_quantity: invoicedQty,
          received_quantity: receivedQty,
          shortage_quantity: hasShortage
            ? Math.min(orderedQty, invoicedQty) - receivedQty
            : 0,
          overage_quantity: hasOverage
            ? receivedQty - Math.max(orderedQty, invoicedQty)
            : 0,
          weight: receivedItem.weight ? parseFloat(receivedItem.weight) : null,
          rate: parseFloat(poItem.rate) || 0,
          total: receivedQty * (parseFloat(poItem.rate) || 0),
          quality_status: "pending_inspection",
          discrepancy_flag: hasShortage || hasOverage || invoiceVsOrderMismatch,
          remarks: receivedItem.remarks || "",
        };
      });

      // Calculate total received value
      const totalReceivedValue = mappedItems.reduce(
        (sum, item) => sum + item.total,
        0
      );

      // Update GRN
      await grn.update(
        {
          received_date: received_date || new Date(),
          supplier_invoice_number: supplier_invoice_number || null,
          inward_challan_number: inward_challan_number || null,
          items_received: mappedItems,
          total_received_value: totalReceivedValue,
          status: "received", // Now ready for verification
          remarks: remarks || grn.remarks,
          attachments: attachments || grn.attachments,
        },
        { transaction }
      );

      // Update PO status
      await grn.purchaseOrder.update(
        {
          status: "received",
          received_date: received_date || new Date(),
        },
        { transaction }
      );

      // Check for shortages and create vendor return request if needed
      const shortageItems = mappedItems.filter(
        (item) => item.shortage_quantity > 0
      );
      let vendorReturn = null;

      if (shortageItems.length > 0) {
        // Generate return number: VR-YYYYMMDD-XXXXX
        const today = new Date();
        const returnDateStr = today
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");
        const lastReturn = await VendorReturn.findOne({
          where: {
            return_number: {
              [require("sequelize").Op.like]: `VR-${returnDateStr}-%`,
            },
          },
          order: [["created_at", "DESC"]],
          transaction,
        });

        let returnSequence = 1;
        if (lastReturn) {
          const lastReturnSequence = parseInt(
            lastReturn.return_number.split("-")[2]
          );
          returnSequence = lastReturnSequence + 1;
        }
        const returnNumber = `VR-${returnDateStr}-${returnSequence
          .toString()
          .padStart(5, "0")}`;

        // Calculate total shortage value
        const totalShortageValue = shortageItems.reduce(
          (sum, item) => sum + item.shortage_quantity * item.rate,
          0
        );

        // Create vendor return request
        vendorReturn = await VendorReturn.create(
          {
            return_number: returnNumber,
            purchase_order_id: grn.purchase_order_id,
            grn_id: grn.id,
            vendor_id: grn.purchaseOrder.vendor_id,
            return_type: "shortage",
            return_date: new Date(),
            items: shortageItems.map((item) => ({
              material_name: item.material_name,
              color: item.color,
              uom: item.uom,
              ordered_qty: item.ordered_quantity,
              invoiced_qty: item.invoiced_quantity,
              received_qty: item.received_quantity,
              shortage_qty: item.shortage_quantity,
              rate: item.rate,
              shortage_value: item.shortage_quantity * item.rate,
              reason: "Quantity mismatch - shortage detected during GRN",
              remarks: item.remarks,
            })),
            total_shortage_value: totalShortageValue,
            status: "pending",
            created_by: req.user.id,
            remarks: `Auto-generated from GRN ${grn.grn_number}. Shortage detected in ${shortageItems.length} item(s).`,
          },
          { transaction }
        );

        // Create notification for procurement team about shortage
        await Notification.create(
          {
            user_id: null,
            type: "vendor_shortage",
            title: "Vendor Shortage Detected",
            message: `Shortage detected in GRN ${grn.grn_number} for PO ${
              grn.purchaseOrder.po_number
            }. Vendor return request ${returnNumber} created. Total shortage value: ₹${totalShortageValue.toFixed(
              2
            )}`,
            data: {
              grn_id: grn.id,
              po_id: grn.purchase_order_id,
              return_id: vendorReturn.id,
            },
            read: false,
          },
          { transaction }
        );
      }

      // Create notification for verification team
      await Notification.create(
        {
          user_id: null, // Send to inventory/QC department
          type: "grn_verification",
          title: "GRN Ready for Verification",
          message: `GRN ${
            grn.grn_number
          } updated with received quantities. Please verify materials.${
            shortageItems.length > 0 ? " ⚠️ Shortages detected!" : ""
          }`,
          data: { grn_id: grn.id, po_id: grn.purchase_order_id },
          read: false,
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message:
          shortageItems.length > 0
            ? `GRN updated with ${shortageItems.length} shortage(s). Vendor return request auto-generated. Ready for verification.`
            : "GRN updated successfully. Ready for verification.",
        grn,
        vendor_return: vendorReturn,
        has_shortages: shortageItems.length > 0,
        shortage_count: shortageItems.length,
        next_step: "verification",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error updating GRN received quantities:", error);
      res
        .status(500)
        .json({ message: "Failed to update GRN", error: error.message });
    }
  }
);

// Delete GRN (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  checkDepartment(["admin"]),
  async (req, res) => {
    try {
      const grn = await GoodsReceiptNote.findByPk(req.params.id);
      if (!grn) {
        return res.status(404).json({ message: "GRN not found" });
      }

      if (grn.inventory_added) {
        return res
          .status(400)
          .json({
            message: "Cannot delete GRN that has been added to inventory",
          });
      }

      await grn.destroy();
      res.json({ message: "GRN deleted successfully" });
    } catch (error) {
      console.error("Error deleting GRN:", error);
      res
        .status(500)
        .json({ message: "Failed to delete GRN", error: error.message });
    }
  }
);

// Handle excess quantities in GRN
router.post(
  "/:id/handle-excess",
  authenticateToken,
  checkDepartment(["inventory", "procurement", "admin"]),
  async (req, res) => {
    const transaction =
      await require("../config/database").sequelize.transaction();

    try {
      const { grnId: grnIdParam } = req.params;
      const { action, notes } = req.body;
      const grnId = req.params.id;

      if (!["auto_reject", "approve_excess"].includes(action)) {
        await transaction.rollback();
        return res
          .status(400)
          .json({
            message: "Invalid action. Must be auto_reject or approve_excess",
          });
      }

      // Fetch GRN with all details
      const grn = await GoodsReceiptNote.findByPk(grnId, {
        include: [
          {
            model: PurchaseOrder,
            as: "purchaseOrder",
            include: [{ model: Vendor, as: "vendor" }],
          },
        ],
        transaction,
      });

      if (!grn) {
        await transaction.rollback();
        return res.status(404).json({ message: "GRN not found" });
      }

      // Get excess items
      const excessItems = (grn.items_received || []).filter(
        (item) => item.overage_quantity > 0
      );

      if (excessItems.length === 0) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "No excess quantities found in this GRN" });
      }

      const totalExcessValue = excessItems.reduce(
        (sum, item) => sum + item.overage_quantity * item.rate,
        0
      );

      let response = {};

      if (action === "auto_reject") {
        // Option A: Auto-reject excess and create vendor return
        const today = new Date();
        const returnDateStr = today
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");

        const lastReturn = await VendorReturn.findOne({
          where: {
            return_number: {
              [require("sequelize").Op.like]: `VR-${returnDateStr}-%`,
            },
          },
          order: [["created_at", "DESC"]],
          transaction,
        });

        let returnSequence = 1;
        if (lastReturn) {
          const lastReturnSequence = parseInt(
            lastReturn.return_number.split("-")[2]
          );
          returnSequence = lastReturnSequence + 1;
        }
        const returnNumber = `VR-${returnDateStr}-${returnSequence
          .toString()
          .padStart(5, "0")}`;

        // Create vendor return for excess
        const vendorReturn = await VendorReturn.create(
          {
            return_number: returnNumber,
            purchase_order_id: grn.purchase_order_id,
            grn_id: grn.id,
            vendor_id: grn.purchaseOrder.vendor_id,
            return_type: "excess",
            return_date: new Date(),
            items: excessItems.map((item) => ({
              material_name: item.material_name,
              color: item.color,
              uom: item.uom,
              ordered_qty: item.ordered_quantity,
              invoiced_qty: item.invoiced_quantity,
              received_qty: item.received_quantity,
              excess_qty: item.overage_quantity,
              rate: item.rate,
              excess_value: item.overage_quantity * item.rate,
              reason:
                "Excess quantity received - rejected and returned to vendor",
              remarks: item.remarks,
            })),
            total_excess_value: totalExcessValue,
            status: "pending",
            created_by: req.user.id,
            remarks: `Auto-generated from GRN ${
              grn.grn_number
            } - Excess quantities. ${notes || ""}`,
          },
          { transaction }
        );

        // Update GRN verification status
        await grn.update(
          {
            verification_status: "approved",
            status: "received", // Keep as received - only ordered qty accepted
            excess_handled: true,
            excess_action: "auto_rejected",
            excess_handling_notes: notes || "",
            excess_handling_date: new Date(),
            excess_handling_by: req.user.id,
          },
          { transaction }
        );

        // Update PO status - remains 'received' (not 'excess_received')
        await grn.purchaseOrder.update(
          {
            status: "received",
          },
          { transaction }
        );

        // Create notification
        await Notification.create(
          {
            user_id: null,
            type: "excess_rejected",
            title: "Excess Quantity Auto-Rejected",
            message: `Excess quantity in GRN ${
              grn.grn_number
            } has been auto-rejected. Vendor Return ${returnNumber} created. Total excess value: ₹${totalExcessValue.toFixed(
              2
            )}`,
            data: {
              grn_id: grn.id,
              po_id: grn.purchase_order_id,
              return_id: vendorReturn.id,
            },
            read: false,
          },
          { transaction }
        );

        response = {
          message: "Excess quantity rejected and Vendor Return created",
          grn: grn,
          vendor_return: vendorReturn,
          action_taken: "auto_reject",
          total_excess_value: totalExcessValue,
        };
      } else if (action === "approve_excess") {
        // Option B: Approve excess and update PO status to 'excess_received'

        // Update GRN verification status
        await grn.update(
          {
            verification_status: "approved",
            status: "excess_received",
            excess_handled: true,
            excess_action: "approved",
            excess_handling_notes: notes || "",
            excess_handling_date: new Date(),
            excess_handling_by: req.user.id,
          },
          { transaction }
        );

        // Update PO status to 'excess_received'
        await grn.purchaseOrder.update(
          {
            status: "excess_received",
          },
          { transaction }
        );

        // Create notification
        await Notification.create(
          {
            user_id: null,
            type: "excess_approved",
            title: "Excess Quantity Approved",
            message: `Excess quantity in GRN ${
              grn.grn_number
            } has been approved. Additional inventory will be added. Total excess value: ₹${totalExcessValue.toFixed(
              2
            )}`,
            data: { grn_id: grn.id, po_id: grn.purchase_order_id },
            read: false,
          },
          { transaction }
        );

        response = {
          message:
            "Excess quantity approved. Full received quantity will be added to inventory.",
          grn: grn,
          action_taken: "approve_excess",
          total_excess_value: totalExcessValue,
          next_step: "add_to_inventory",
        };
      }

      await transaction.commit();
      res.json(response);
    } catch (error) {
      await transaction.rollback();
      console.error("Error handling excess quantity:", error);
      res
        .status(500)
        .json({
          message: "Failed to handle excess quantity",
          error: error.message,
        });
    }
  }
);

router.post(
  "/:id/create-mismatch-request",
  authenticateToken,
  checkDepartment(["inventory", "admin"]),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { mismatch_items, requested_action, requested_action_notes, request_description } = req.body;

      // Fetch GRN with related data
      const grn = await GoodsReceiptNote.findByPk(id, {
        include: [
          {
            model: PurchaseOrder,
            as: "purchaseOrder",
            include: [{ model: Vendor, as: "vendor" }],
          },
        ],
      });

      if (!grn) {
        return res.status(404).json({ message: "GRN not found" });
      }

      // Validate mismatch items
      if (!mismatch_items || !Array.isArray(mismatch_items) || mismatch_items.length === 0) {
        return res.status(400).json({ message: "At least one mismatched item must be provided" });
      }

      if (!requested_action) {
        return res.status(400).json({ message: "Requested action is required" });
      }

      // Calculate totals
      let total_shortage_items = 0;
      let total_overage_items = 0;
      let total_shortage_value = 0;
      let total_overage_value = 0;
      let mismatch_type = null;

      mismatch_items.forEach((item) => {
        if (item.shortage_quantity > 0) {
          total_shortage_items++;
          total_shortage_value += item.shortage_quantity * (item.rate || 0);
        }
        if (item.overage_quantity > 0) {
          total_overage_items++;
          total_overage_value += item.overage_quantity * (item.rate || 0);
        }
      });

      if (total_shortage_items > 0 && total_overage_items > 0) {
        mismatch_type = "both";
      } else if (total_shortage_items > 0) {
        mismatch_type = "shortage";
      } else if (total_overage_items > 0) {
        mismatch_type = "overage";
      } else {
        return res.status(400).json({ message: "No valid shortages or overages found in items" });
      }

      // Generate request number
      const { GRNMismatchRequest } = require("../config/database");
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const lastRequest = await GRNMismatchRequest.findOne({
        where: {
          request_number: {
            [require("sequelize").Op.like]: `GMR-${dateStr}-%`,
          },
        },
        order: [["id", "DESC"]],
      });

      let sequence = 1;
      if (lastRequest) {
        const lastSequence = parseInt(lastRequest.request_number.split("-")[2]);
        sequence = lastSequence + 1;
      }

      const request_number = `GMR-${dateStr}-${String(sequence).padStart(5, "0")}`;

      // Create mismatch request
      const mismatchRequest = await GRNMismatchRequest.create(
        {
          request_number,
          grn_id: grn.id,
          purchase_order_id: grn.purchase_order_id,
          grn_number: grn.grn_number,
          po_number: grn.purchaseOrder.po_number,
          vendor_name: grn.purchaseOrder.vendor?.name || "Unknown Vendor",
          mismatch_type,
          mismatch_items,
          total_shortage_items,
          total_overage_items,
          total_shortage_value: parseFloat(total_shortage_value.toFixed(2)),
          total_overage_value: parseFloat(total_overage_value.toFixed(2)),
          request_description,
          requested_action,
          requested_action_notes,
          status: "pending",
          created_by: req.user.id,
        },
        { transaction }
      );

      // Create notification for procurement team
      await Notification.create(
        {
          user_id: null,
          type: "grn_mismatch_request",
          title: `GRN Mismatch Request - ${mismatch_type === "both" ? "Shortage & Overage" : mismatch_type === "shortage" ? "Shortage" : "Overage"}`,
          message: `Material mismatch detected in GRN ${grn.grn_number} (PO: ${grn.purchaseOrder.po_number}). ${mismatch_type === "shortage" ? `${total_shortage_items} item(s) with shortage (₹${total_shortage_value.toFixed(2)})` : mismatch_type === "overage" ? `${total_overage_items} item(s) with overage (₹${total_overage_value.toFixed(2)})` : `${total_shortage_items} shortage and ${total_overage_items} overage items (Total: ₹${(total_shortage_value + total_overage_value).toFixed(2)})`}. Request: ${request_number}`,
          data: {
            grn_id: grn.id,
            po_id: grn.purchase_order_id,
            mismatch_request_id: mismatchRequest.id,
            request_number,
          },
          read: false,
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: "Mismatch request created successfully",
        mismatch_request: mismatchRequest,
        request_number,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating mismatch request:", error);
      res.status(500).json({
        message: "Failed to create mismatch request",
        error: error.message,
      });
    }
  }
);

router.get(
  "/mismatch-requests",
  authenticateToken,
  checkDepartment(["procurement", "inventory", "admin"]),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status, grn_id, po_id } = req.query;
      const offset = (page - 1) * limit;

      const { GRNMismatchRequest } = require("../config/database");

      const whereClause = {};
      if (status) whereClause.status = status;
      if (grn_id) whereClause.grn_id = grn_id;
      if (po_id) whereClause.purchase_order_id = po_id;

      const { count, rows: requests } = await GRNMismatchRequest.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: GoodsReceiptNote,
            as: "grn",
            attributes: ["id", "grn_number", "received_date"],
          },
          {
            model: PurchaseOrder,
            as: "purchaseOrder",
            attributes: ["id", "po_number", "po_date"],
            include: [{ model: Vendor, as: "vendor" }],
          },
          { model: User, as: "creator", attributes: ["id", "email", "name"] },
          { model: User, as: "reviewer", attributes: ["id", "email", "name"] },
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [["created_at", "DESC"]],
      });

      res.json({
        mismatch_requests: requests,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error fetching mismatch requests:", error);
      res.status(500).json({
        message: "Failed to fetch mismatch requests",
        error: error.message,
      });
    }
  }
);

router.get(
  "/mismatch-requests/:id",
  authenticateToken,
  checkDepartment(["procurement", "inventory", "admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { GRNMismatchRequest } = require("../config/database");

      const mismatchRequest = await GRNMismatchRequest.findByPk(id, {
        include: [
          {
            model: GoodsReceiptNote,
            as: "grn",
            attributes: ["id", "grn_number", "received_date"],
          },
          {
            model: PurchaseOrder,
            as: "purchaseOrder",
            attributes: ["id", "po_number", "po_date", "final_amount"],
            include: [{ model: Vendor, as: "vendor" }],
          },
          { model: User, as: "creator", attributes: ["id", "email", "name"] },
          { model: User, as: "reviewer", attributes: ["id", "email", "name"] },
        ],
      });

      if (!mismatchRequest) {
        return res.status(404).json({ message: "Mismatch request not found" });
      }

      res.json(mismatchRequest);
    } catch (error) {
      console.error("Error fetching mismatch request:", error);
      res.status(500).json({
        message: "Failed to fetch mismatch request",
        error: error.message,
      });
    }
  }
);

router.post(
  "/mismatch-requests/:id/approve",
  authenticateToken,
  checkDepartment(["procurement", "admin"]),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { approval_notes } = req.body;
      const { GRNMismatchRequest } = require("../config/database");

      const mismatchRequest = await GRNMismatchRequest.findByPk(id, {
        include: [
          { model: GoodsReceiptNote, as: "grn" },
          { model: PurchaseOrder, as: "purchaseOrder" },
        ],
      });

      if (!mismatchRequest) {
        return res.status(404).json({ message: "Mismatch request not found" });
      }

      if (mismatchRequest.status !== "pending") {
        return res.status(400).json({ message: "Only pending requests can be approved" });
      }

      await mismatchRequest.update(
        {
          status: "approved",
          approval_notes,
          reviewed_by: req.user.id,
          reviewed_at: new Date(),
        },
        { transaction }
      );

      // Create notification for inventory team
      await Notification.create(
        {
          user_id: null,
          type: "grn_mismatch_approved",
          title: "GRN Mismatch Request Approved",
          message: `Mismatch request ${mismatchRequest.request_number} has been approved by Procurement. Action: ${mismatchRequest.requested_action}`,
          data: {
            grn_id: mismatchRequest.grn_id,
            po_id: mismatchRequest.purchase_order_id,
            mismatch_request_id: mismatchRequest.id,
          },
          read: false,
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: "Mismatch request approved successfully",
        mismatch_request: mismatchRequest,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error approving mismatch request:", error);
      res.status(500).json({
        message: "Failed to approve mismatch request",
        error: error.message,
      });
    }
  }
);

router.post(
  "/mismatch-requests/:id/reject",
  authenticateToken,
  checkDepartment(["procurement", "admin"]),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { approval_notes } = req.body;
      const { GRNMismatchRequest } = require("../config/database");

      const mismatchRequest = await GRNMismatchRequest.findByPk(id, {
        include: [
          { model: GoodsReceiptNote, as: "grn" },
          { model: PurchaseOrder, as: "purchaseOrder" },
        ],
      });

      if (!mismatchRequest) {
        return res.status(404).json({ message: "Mismatch request not found" });
      }

      if (mismatchRequest.status !== "pending") {
        return res.status(400).json({ message: "Only pending requests can be rejected" });
      }

      await mismatchRequest.update(
        {
          status: "rejected",
          approval_notes,
          reviewed_by: req.user.id,
          reviewed_at: new Date(),
        },
        { transaction }
      );

      // Create notification for inventory team
      await Notification.create(
        {
          user_id: null,
          type: "grn_mismatch_rejected",
          title: "GRN Mismatch Request Rejected",
          message: `Mismatch request ${mismatchRequest.request_number} has been rejected by Procurement. Reason: ${approval_notes || "No reason provided"}`,
          data: {
            grn_id: mismatchRequest.grn_id,
            po_id: mismatchRequest.purchase_order_id,
            mismatch_request_id: mismatchRequest.id,
          },
          read: false,
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: "Mismatch request rejected successfully",
        mismatch_request: mismatchRequest,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error rejecting mismatch request:", error);
      res.status(500).json({
        message: "Failed to reject mismatch request",
        error: error.message,
      });
    }
  }
);

// Diagnostics endpoint - helps understand GRN hierarchy and workflow status
router.get(
  "/diagnostics/:poId",
  authenticateToken,
  checkDepartment(["procurement", "inventory", "admin"]),
  async (req, res) => {
    try {
      const { poId } = req.params;

      const po = await PurchaseOrder.findByPk(poId, {
        include: [
          { model: Vendor, as: "vendor" },
          { model: Customer, as: "customer", required: false },
        ],
      });

      if (!po) {
        return res.status(404).json({ message: "Purchase Order not found" });
      }

      const grns = await GoodsReceiptNote.findAll({
        where: { purchase_order_id: poId },
        order: [["created_at", "ASC"]],
        attributes: [
          "id",
          "grn_number",
          "grn_sequence",
          "is_first_grn",
          "created_at",
          "status",
          "verification_status",
        ],
      });

      const approvals = await Approval.findAll({
        where: { entity_id: poId, entity_type: "purchase_order" },
        order: [["created_at", "DESC"]],
        attributes: ["id", "stage_key", "status", "created_at"],
      });

      const vendorRequests = await VendorRequest.findAll({
        where: { purchase_order_id: poId },
        order: [["created_at", "DESC"]],
        attributes: [
          "id",
          "request_number",
          "request_type",
          "status",
          "created_at",
        ],
      });

      const hierarchyIssues = [];
      if (grns.length > 1) {
        const wrongSequence = grns.filter(
          (grn, idx) => grn.grn_sequence !== idx + 1
        );
        if (wrongSequence.length > 0) {
          hierarchyIssues.push(
            `Found ${wrongSequence.length} GRN(s) with incorrect sequence numbers`
          );
        }

        const wrongIsFirst = grns.filter(
          (grn, idx) => grn.is_first_grn !== (idx === 0)
        );
        if (wrongIsFirst.length > 0) {
          hierarchyIssues.push(
            `Found ${wrongIsFirst.length} GRN(s) with incorrect is_first_grn flag`
          );
        }
      }

      const shortageComplaints = approvals.filter(
        (a) => a.stage_key === "grn_shortage_complaint"
      );

      const diagnostics = {
        po_details: {
          po_id: po.id,
          po_number: po.po_number,
          status: po.status,
          vendor: po.vendor?.name,
        },
        grn_count: grns.length,
        grns,
        approvals_count: approvals.length,
        shortage_complaints: shortageComplaints,
        vendor_requests: vendorRequests,
        hierarchy_issues: hierarchyIssues,
        workflow_status: {
          can_create_first_grn: grns.length === 0,
          can_create_subsequent_grn:
            grns.length > 0 &&
            (po.status === "reopened" ||
              po.status === "grn_shortage" ||
              po.status === "grn_overage"),
          expected_next_step:
            grns.length === 0
              ? "Create first GRN with all items"
              : po.status === "reopened" ||
                  po.status === "grn_shortage" ||
                  po.status === "grn_overage"
                ? "Create subsequent GRN with shortage items"
                : po.status === "grn_requested"
                ? "First GRN not yet created"
                : "PO is in completed or final state",
        },
        recommendations:
          hierarchyIssues.length > 0
            ? [
                "Hierarchy issues detected. Consider clearing old test data and recreating GRNs.",
                "Use the database or a cleanup script to delete old test GRNs for a fresh start.",
              ]
            : ["Workflow appears to be correct"],
      };

      res.json(diagnostics);
    } catch (error) {
      console.error("Error in diagnostics:", error);
      res.status(500).json({
        message: "Failed to get diagnostics",
        error: error.message,
      });
    }
  }
);

router.post(
  "/:id/send-overage-notification",
  authenticateToken,
  checkDepartment(["procurement", "admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const grn = await GoodsReceiptNote.findByPk(id, {
        include: [
          { model: PurchaseOrder, as: "purchaseOrder" },
          { model: Vendor, as: "vendor" },
        ],
      });

      if (!grn) {
        return res.status(404).json({ message: "GRN not found" });
      }

      const po = grn.purchaseOrder;
      if (!po) {
        return res.status(400).json({ message: "Associated PO not found" });
      }

      const vendor = po.vendor || grn.vendor;
      if (!vendor) {
        return res.status(400).json({ message: "Vendor information not found" });
      }

      if (!vendor.email && !vendor.phone) {
        return res.status(400).json({
          message: "Vendor has no email or phone number configured",
        });
      }

      const grnItems = grn.items || [];
      const overageItems = grnItems.filter((item) => (item.overage_qty || item.overage_quantity) > 0);

      if (overageItems.length === 0) {
        return res.status(400).json({
          message: "No overage items found in this GRN",
        });
      }

      const totalOverageValue = overageItems.reduce(
        (sum, item) =>
          sum + ((item.overage_qty || item.overage_quantity) || 0) * (item.rate || 0),
        0
      );

      const { sendOverageMaterialToVendor, sendOverageMaterialWhatsApp } =
        require("../utils/emailService");

      const emailResult = { success: false };
      const whatsappResult = { success: false };

      if (vendor.email) {
        try {
          const emailRes = await sendOverageMaterialToVendor(
            {
              grn_number: grn.grn_number,
              po_number: po.po_number,
              grn_date: grn.grn_date,
            },
            vendor,
            overageItems.map((item) => ({
              material_name: item.material_name || item.item_code || "N/A",
              ordered_qty: item.ordered_qty || item.quantity_expected,
              received_qty: item.received_qty || item.quantity_received,
              overage_qty: item.overage_qty || item.overage_quantity,
              uom: item.uom,
              rate: item.rate || item.unit_price,
            })),
            totalOverageValue
          );
          emailResult.success = emailRes.success;
          emailResult.messageId = emailRes.messageId;
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          emailResult.error = emailError.message;
        }
      }

      if (vendor.phone) {
        try {
          const whatsappRes = await sendOverageMaterialWhatsApp(
            {
              grn_number: grn.grn_number,
              po_number: po.po_number,
              grn_date: grn.grn_date,
            },
            vendor,
            overageItems.map((item) => ({
              material_name: item.material_name || item.item_code || "N/A",
              ordered_qty: item.ordered_qty || item.quantity_expected,
              received_qty: item.received_qty || item.quantity_received,
              overage_qty: item.overage_qty || item.overage_quantity,
              uom: item.uom,
              rate: item.rate || item.unit_price,
            })),
            totalOverageValue
          );
          whatsappResult.success = whatsappRes.success;
          whatsappResult.messageId = whatsappRes.messageId;
        } catch (whatsappError) {
          console.error("Error sending WhatsApp:", whatsappError);
          whatsappResult.error = whatsappError.message;
        }
      }

      res.json({
        message: "Overage material notification sent successfully",
        grn: {
          id: grn.id,
          grn_number: grn.grn_number,
          overage_items_count: overageItems.length,
          total_overage_value: totalOverageValue,
        },
        communication: {
          email: emailResult,
          whatsapp: whatsappResult,
        },
      });
    } catch (error) {
      console.error("Error sending overage notification:", error);
      res.status(500).json({
        message: "Failed to send overage notification",
        error: error.message,
      });
    }
  }
);

module.exports = router;
