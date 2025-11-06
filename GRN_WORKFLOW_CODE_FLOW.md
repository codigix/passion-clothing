# GRN Workflow - Code Flow Reference

## 🔗 How ProcurementDashboard Triggers GRN Workflow

### 1. ProcurementDashboard → View PO List

**File**: `client/src/pages/dashboards/ProcurementDashboard.jsx` (Lines 193-400)

```javascript
// State Management
const [purchaseOrders, setPurchaseOrders] = useState([]); // All POs
const [filteredOrders, setFilteredOrders] = useState([]); // Filtered list
const [tabValue, setTabValue] = useState(0); // Active tab
const [filterStatus, setFilterStatus] = useState("all"); // Status filter
const [showActionMenu, setShowActionMenu] = useState(null); // Action menu ref

// Data Fetching
useEffect(() => {
  fetchDashboardData(); // Called on component mount
}, []);

// Fetch Purchase Orders
const fetchDashboardData = async () => {
  const poRes = await api.get("/procurement/pos?limit=10");
  setPurchaseOrders(poRes.data.purchaseOrders || []); // Display in table
};

// Apply Filters
useEffect(() => {
  applyPOFilters(); // Called when filters change
}, [
  purchaseOrders,
  searchTerm,
  statusFilterPO,
  priorityFilter,
  dateFrom,
  dateTo,
]);

// Filtered list updates whenever POs or filters change
const applyPOFilters = () => {
  let filtered = [...purchaseOrders];
  // Apply search, status, priority, date filters
  setFilteredOrders(filtered); // Update display
};
```

---

### 2. User Clicks "Create GRN" Action Button

**Where**: Right-click or Action Menu on any PO row

```javascript
// Action menu is opened by clicking on a PO row
const handleActionMenu = (event, po) => {
  setShowActionMenu(po.id);
  setMenuPosition({ x: event.clientX, y: event.clientY });
};

// Menu options displayed (in JSX rendering):
// ├─ View Details
// ├─ Edit
// ├─ Create GRN  ← USER CLICKS HERE
// ├─ View GRN
// ├─ Download
// └─ ...other actions
```

---

### 3. Navigate to GRN Creation Page

**Event Handler** (in ProcurementDashboard):

```javascript
const handleCreateGRN = (po) => {
  // Validation checks BEFORE navigation
  if (po.status !== "grn_approved" && po.status !== "sent") {
    toast.error("PO must be approved or sent to create GRN");
    return;
  }

  // Check if GRN already exists
  api
    .get(`/grn/create/${po.id}`)
    .then((res) => {
      if (res.data.grn_id) {
        toast.warning("GRN already exists for this PO");
        navigate(`/inventory/grn/${res.data.grn_id}/verify`);
        return;
      }

      // Navigate to Create GRN page with PO ID as query param
      navigate(`/inventory/grn/create?po_id=${po.id}`);
    })
    .catch((err) => {
      toast.error("Failed to validate PO for GRN creation");
    });
};
```

---

### 4. CreateGRNPage Component Loads

**File**: `client/src/pages/inventory/CreateGRNPage.jsx` (Lines 1-113)

```javascript
const CreateGRNPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const poId = searchParams.get("po_id"); // Extract from URL query param

  // Get PO ID from URL
  useEffect(() => {
    if (poId) {
      fetchPurchaseOrder(); // Load PO data
    }
  }, [poId]);

  // Fetch PO from backend
  const fetchPurchaseOrder = async () => {
    try {
      const response = await api.get(`/procurement/pos/${poId}`);
      const po = response.data;

      // Map PO items to form structure
      const items = (po.items || []).map((item, index) => {
        return {
          item_index: index,
          material_name:
            item.type === "fabric" ? item.fabric_name : item.item_name,
          color: item.color || "",
          gsm: item.gsm || "",
          uom: item.uom || "Meters",
          ordered_qty: parseFloat(item.quantity) || 0,
          invoiced_qty: parseFloat(item.quantity) || 0, // Default
          received_qty: parseFloat(item.quantity) || 0, // Default
          weight: "",
          remarks: "",
        };
      });

      setFormData((prev) => ({ ...prev, items_received: items }));
    } catch (error) {
      alert("Failed to fetch Purchase Order");
    }
  };
};
```

---

### 5. User Enters Receipt Data

**Form Input Handlers**:

```javascript
// Handle form field changes
const handleInputChange = (field, value) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};

// Handle item table changes (invoiced_qty, received_qty, etc.)
const handleItemChange = (index, field, value) => {
  const updatedItems = [...formData.items_received];
  updatedItems[index][field] = value;
  setFormData((prev) => ({ ...prev, items_received: updatedItems }));

  // Real-time validation of shortages/overages
  calculateSummary(); // Recalculate stats
};

// Real-time calculation
const summary = formData.items_received.reduce(
  (acc, item) => {
    const orderedQty = parseFloat(item.ordered_qty);
    const invoicedQty = parseFloat(item.invoiced_qty);
    const receivedQty = parseFloat(item.received_qty);

    if (receivedQty < Math.min(orderedQty, invoicedQty)) acc.shortages++;
    if (receivedQty > Math.max(orderedQty, invoicedQty)) acc.overages++;
    if (invoicedQty !== orderedQty) acc.invoiceMismatches++;

    return acc;
  },
  { shortages: 0, overages: 0, invoiceMismatches: 0 }
);

// Display warning if shortages detected
{
  summary.shortages > 0 && (
    <div className="bg-red-50 border border-red-200 rounded p-4">
      <h3>Shortage Detected!</h3>
      <p>
        {summary.shortages} item(s) have quantity shortages. A vendor return
        request will be automatically created.
      </p>
    </div>
  );
}
```

---

### 6. User Submits GRN Form

**Submit Handler**:

```javascript
const handleSubmit = async () => {
  try {
    // Validation
    if (
      !formData.items_received.some((item) => parseFloat(item.received_qty) > 0)
    ) {
      alert("Please enter received quantities for at least one item");
      return;
    }

    setLoading(true);

    // Build payload (filter items with received_qty > 0)
    const payload = {
      received_date: formData.received_date,
      inward_challan_number: formData.inward_challan_number,
      supplier_invoice_number: formData.supplier_invoice_number,
      items_received: formData.items_received.filter(
        (item) => parseFloat(item.received_qty) > 0
      ),
      remarks: formData.remarks,
    };

    // POST to Backend: Create GRN
    const response = await api.post(`/grn/from-po/${poId}`, payload);

    // Handle success response
    const message = response.data.has_shortages
      ? `GRN created with ${response.data.shortage_count} shortage(s). 
         Vendor return request auto-generated.`
      : "GRN created successfully!";

    alert(message + " Redirecting to verification...");

    // Navigate to verification page
    navigate(`/inventory/grn/${response.data.grn.id}/verify`);
  } catch (error) {
    alert(error.response?.data?.message || "Failed to create GRN");
  } finally {
    setLoading(false);
  }
};
```

---

## 🔗 Backend Processing Flow

### Endpoint: `POST /grn/from-po/:poId`

**File**: `server/routes/grn.js` (Lines 172-450)

```javascript
router.post(
  "/from-po/:poId",
  authenticateToken,
  checkDepartment(["inventory", "admin"]),
  async (req, res) => {
    // 🔄 Start transaction (all-or-nothing)
    const transaction = await sequelize.transaction();

    try {
      const { poId } = req.params;
      const {
        received_date,
        inward_challan_number,
        supplier_invoice_number,
        items_received, // User-submitted items
        remarks,
        attachments,
      } = req.body;

      // ✅ Step 1: Validate & Fetch Purchase Order
      const po = await PurchaseOrder.findByPk(poId, {
        include: [
          { model: Vendor, as: "vendor" },
          { model: Customer, as: "customer" },
          { model: SalesOrder, as: "salesOrder" },
        ],
        transaction,
      });

      if (!po) {
        return res.status(404).json({ message: "Purchase Order not found" });
      }

      // ✅ Step 2: Generate GRN Number (Sequential)
      // Format: GRN-YYYYMMDD-XXXXX
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");

      const lastGRN = await GoodsReceiptNote.findOne({
        where: {
          grn_number: { [Op.like]: `GRN-${dateStr}-%` },
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

      // ✅ Step 3: Map & Process Items
      // This is where 3-way matching happens
      const poItems = po.items || [];
      const mappedItems = items_received.map((receivedItem) => {
        const poItem = poItems[receivedItem.item_index];

        const orderedQty = parseFloat(poItem.quantity);
        const invoicedQty = receivedItem.invoiced_qty
          ? parseFloat(receivedItem.invoiced_qty)
          : orderedQty;
        const receivedQty = parseFloat(receivedItem.received_qty);

        // Detect discrepancies
        const hasShortage = receivedQty < Math.min(orderedQty, invoicedQty);
        const hasOverage = receivedQty > Math.max(orderedQty, invoicedQty);
        const invoiceVsOrderMismatch = invoicedQty !== orderedQty;

        // Extract material name with fallback
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
          hsn: poItem.hsn_code || "",
          gsm: poItem.gsm || "",
          width: poItem.width || "",
          uom: poItem.unit || "Meters",
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

      // ✅ Step 4: Calculate Total Received Value
      const totalReceivedValue = mappedItems.reduce(
        (sum, item) => sum + item.total,
        0
      );

      // ✅ Step 5: Create GRN Record
      const grnData = {
        grn_number: grnNumber,
        purchase_order_id: po.id,
        received_date: received_date || new Date(),
        supplier_name: po.vendor.name,
        supplier_invoice_number: supplier_invoice_number || null,
        inward_challan_number: inward_challan_number || null,
        items_received: mappedItems,
        total_received_value: totalReceivedValue,
        status: "received",
        verification_status: "pending",
        remarks: remarks || "",
        created_by: req.user.id,
        inventory_added: false,
      };

      const grn = await GoodsReceiptNote.create(grnData, { transaction });

      // ✅ Step 6: Update Purchase Order Status
      await po.update(
        {
          status: "received",
          received_date: received_date || new Date(),
        },
        { transaction }
      );

      // ✅ Step 7: Auto-Generate Vendor Return (if shortages)
      const shortageItems = mappedItems.filter(
        (item) => item.shortage_quantity > 0
      );
      let vendorReturn = null;

      if (shortageItems.length > 0) {
        // Generate return number
        const returnDateStr = today
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");
        const lastReturn = await VendorReturn.findOne({
          where: { return_number: { [Op.like]: `VR-${returnDateStr}-%` } },
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
            purchase_order_id: po.id,
            grn_id: grn.id,
            vendor_id: po.vendor_id,
            return_type: "shortage",
            return_date: new Date(),
            items: shortageItems.map((item) => ({
              material_name: item.material_name,
              shortage_qty: item.shortage_quantity,
              shortage_value: item.shortage_quantity * item.rate,
              reason: "Quantity mismatch - shortage detected during GRN",
            })),
            total_shortage_value: totalShortageValue,
            status: "pending",
            created_by: req.user.id,
            remarks: `Auto-generated from GRN ${grnNumber}.`,
          },
          { transaction }
        );
      }

      // ✅ Step 8: Create Notification
      await Notification.create(
        {
          type: "grn_created",
          title: `GRN ${grnNumber} Created`,
          message:
            shortageItems.length > 0
              ? `GRN created with ${shortageItems.length} shortage(s).`
              : "GRN created successfully.",
          department: "procurement",
          metadata: { grn_id: grn.id, po_id: po.id },
        },
        { transaction }
      );

      // ✅ Commit Transaction (all changes saved)
      await transaction.commit();

      // Return success response
      res.json({
        message: "GRN created successfully",
        grn: grn.toJSON(),
        has_shortages: shortageItems.length > 0,
        shortage_count: shortageItems.length,
        vendor_return: vendorReturn ? vendorReturn.toJSON() : null,
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      console.error("Error creating GRN:", error);
      res.status(500).json({
        message: "Failed to create GRN",
        error: error.message,
      });
    }
  }
);
```

---

## 📊 Data Flow Diagram (Code References)

```
ProcurementDashboard
    │
    ├─ fetchDashboardData()
    │  └─ GET /procurement/pos?limit=10
    │     └─ setPurchaseOrders(data)
    │
    ├─ applyPOFilters()
    │  └─ setFilteredOrders(filtered)
    │
    └─ renderPurchaseOrdersTable()
       ├─ Display: PO Number, Vendor, Amount, Status
       └─ Action Menu on each row
          │
          ├─ View Details → ViewPODetailsPage
          ├─ Edit → EditPOPage
          │
          ✓ Create GRN ← USER CLICKS
            │
            ├─ Validation: Check PO status
            │  └─ if (status !== 'grn_approved' && status !== 'sent')
            │     return error
            │
            ├─ Check if GRN exists
            │  └─ GET /grn/create/:poId
            │
            └─ navigate(`/inventory/grn/create?po_id=${po.id}`)
               │
               └─ CreateGRNPage Component
                  │
                  ├─ useEffect(() => fetchPurchaseOrder())
                  │  └─ GET /procurement/pos/:poId
                  │     └─ Map PO items to form structure
                  │
                  ├─ Form Rendering
                  │  ├─ Receipt Information (date, challan, invoice, remarks)
                  │  └─ 3-Way Matching Table
                  │     ├─ Item details (material, color, UOM)
                  │     ├─ Ordered Qty (from PO)
                  │     ├─ Invoiced Qty (from invoice) [editable]
                  │     ├─ Received Qty (actual) [editable]
                  │     └─ Auto-calculate: shortage, overage
                  │
                  ├─ Real-time Validation
                  │  └─ handleItemChange() → calculateSummary()
                  │     ├─ Count shortages
                  │     ├─ Count overages
                  │     └─ Display warning alert
                  │
                  └─ handleSubmit()
                     │
                     ├─ Validate form
                     │  └─ Check: at least 1 item with received_qty > 0
                     │
                     ├─ Build payload
                     │  └─ Filter items with received_qty > 0
                     │
                     └─ POST /grn/from-po/:poId
                        │
                        │ [Backend Transaction Starts]
                        │
                        ├─ Generate GRN Number: GRN-YYYYMMDD-XXXXX
                        │
                        ├─ Map & Process Items
                        │  ├─ Extract material names (with fallback logic)
                        │  ├─ Calculate shortages/overages
                        │  ├─ Flag discrepancies
                        │  └─ Set quality_status = 'pending_inspection'
                        │
                        ├─ Create GRN Record
                        │  └─ GoodsReceiptNote.create()
                        │
                        ├─ Update PO Status
                        │  └─ PO.status = 'received'
                        │
                        ├─ Check for Shortages
                        │  └─ if (shortageItems.length > 0)
                        │
                        ├─ Auto-Generate Vendor Return (if shortages)
                        │  ├─ Generate VR Number: VR-YYYYMMDD-XXXXX
                        │  ├─ Link to GRN & PO
                        │  └─ Set status = 'pending'
                        │
                        ├─ Create Notification
                        │  └─ Notify procurement team
                        │
                        ├─ Commit Transaction
                        │  └─ All changes saved atomically
                        │
                        │ [Backend Transaction Ends]
                        │
                        └─ Return Response
                           ├─ grn object
                           ├─ has_shortages: true/false
                           ├─ shortage_count: N
                           └─ vendor_return object (if created)
                              │
                              └─ Frontend Alert
                                 ├─ "GRN created with N shortage(s).
                                 │   Vendor return auto-generated."
                                 │  OR
                                 └─ "GRN created successfully!"
                                    │
                                    └─ navigate(`/inventory/grn/${grnId}/verify`)
                                       │
                                       └─ GRNVerificationPage
                                          ├─ Review items with discrepancies
                                          ├─ Perform quality inspection
                                          ├─ Approve GRN
                                          └─ Add to Inventory
```

---

## 🎯 Key Transactions & Atomic Operations

### ✅ Single Transaction Encompasses:

1. **GRN Creation** - Generate number, save record
2. **PO Update** - Change status to 'received'
3. **Vendor Return Creation** - Auto-generate if shortages exist
4. **Notification Creation** - Alert procurement team

### ❌ If ANY step fails:

- **All changes ROLLBACK**
- Database remains in consistent state
- No orphaned records

---

## 💾 Local Storage & State Management

**ProcurementDashboard uses localStorage for:**

```javascript
// Column visibility preferences
const [visibleColumns, setVisibleColumns] = useState(() => {
  const saved = localStorage.getItem("procurementDashboardVisibleColumns");
  if (saved) {
    return JSON.parse(saved);
  }
  return AVAILABLE_COLUMNS.filter((col) => col.defaultVisible).map(
    (col) => col.id
  );
});

// Save when changed
const toggleColumn = (columnId) => {
  const newVisible = visibleColumns.includes(columnId)
    ? visibleColumns.filter((id) => id !== columnId)
    : [...visibleColumns, columnId];

  setVisibleColumns(newVisible);
  localStorage.setItem(
    "procurementDashboardVisibleColumns",
    JSON.stringify(newVisible)
  );
};
```

---

## 🔔 Notifications Flow

### When GRN Created:

**Recipient**: Procurement & Inventory Teams

**Notification Data**:

```javascript
{
  type: 'grn_created',
  title: 'GRN GRN-20250117-00001 Created',
  message: 'GRN created with 2 shortage(s).',
  department: 'procurement',
  metadata: {
    grn_id: 'uuid',
    po_id: 'uuid',
    grn_number: 'GRN-20250117-00001',
    shortage_count: 2
  },
  created_at: timestamp,
  read: false
}
```

**When VR Auto-Generated**:

```javascript
{
  type: 'vendor_return_created',
  title: 'Vendor Return VR-20250117-00001 Created',
  message: 'Auto-generated from GRN due to shortage',
  department: 'procurement',
  metadata: {
    vendor_return_id: 'uuid',
    grn_id: 'uuid',
    return_number: 'VR-20250117-00001',
    total_shortage_value: 450
  }
}
```

---

## 📝 Audit Trail

All GRN-related actions are logged:

```javascript
{
  action: 'GRN_CREATED',
  entity: 'GoodsReceiptNote',
  entity_id: 'grn-uuid',
  user_id: 'user-uuid',
  user_email: 'user@example.com',
  changes: {
    before: {},
    after: {
      grn_number: 'GRN-20250117-00001',
      status: 'received',
      items_count: 5,
      has_shortages: true
    }
  },
  timestamp: '2025-01-17T10:30:00Z'
}
```
