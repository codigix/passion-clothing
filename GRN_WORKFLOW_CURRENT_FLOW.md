# GRN (Goods Receipt Note) Creation Workflow - Current Flow

## 📊 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROCUREMENT DASHBOARD                               │
│                                                                             │
│  1️⃣ PO LIST DISPLAYED                                                       │
│     ├─ Status: draft, pending_approval, sent, acknowledged, dispatched...  │
│     ├─ Shows: PO Number, Vendor, Amount, Expected Delivery, Status         │
│     └─ Each PO has ACTION MENU                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    2️⃣ USER CLICKS "CREATE GRN" BUTTON                       │
│                         (from Action Menu on PO)                           │
│                                                                             │
│  Prerequisite Checks:                                                      │
│  ✓ PO Status must be: 'grn_approved' OR 'sent'                            │
│  ✓ No GRN already exists for this PO                                       │
│  ✓ User has 'inventory' or 'admin' role                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│              3️⃣ NAVIGATE TO CreateGRNPage (Route Parameter)                │
│                  URL: /inventory/grn/create?po_id=123                      │
│                                                                             │
│  GET Request to Backend:                                                   │
│  └─ GET /grn/create/:poId                                                 │
│     ├─ Fetch Purchase Order with all details                              │
│     ├─ Extract items: product_name, quantity, rate, unit, etc.           │
│     └─ Format data for GRN form                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                4️⃣ GRN FORM LOADS WITH PO DATA                               │
│                  (CreateGRNPage Component)                                 │
│                                                                             │
│  Form Fields:                                                              │
│  ├─ Received Date*                          [date input]                   │
│  ├─ Vendor Challan Number                   [text input]                   │
│  ├─ Supplier Invoice Number*                [text input]                   │
│  ├─ Remarks                                 [text input]                   │
│  │                                                                         │
│  └─ 3-WAY MATCHING TABLE (for each item):                                 │
│     ├─ Material Name                                                      │
│     ├─ Specs (Color, GSM, Width)                                          │
│     ├─ UOM (Unit of Measurement)                                          │
│     ├─ Ordered Qty (from PO) [read-only, blue bg]                        │
│     ├─ Invoiced Qty* (from supplier invoice) [editable, orange bg]        │
│     ├─ Received Qty* (actual receipt) [editable, green bg]                │
│     ├─ Weight                                [optional input]              │
│     └─ Remarks                               [optional input]              │
│                                                                             │
│  Smart Calculations:                                                       │
│  └─ Shortages = min(ordered, invoiced) - received                        │
│  └─ Overages = received - max(ordered, invoiced)                         │
│  └─ Invoice Mismatch = invoiced ≠ ordered                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│        5️⃣ USER ENTERS RECEIPT DATA & REAL-TIME VALIDATION                   │
│                                                                             │
│  As User Updates "Invoiced Qty" & "Received Qty":                         │
│  ├─ System auto-calculates: Shortage, Overage, Mismatches                │
│  ├─ Summary Stats Update:                                                 │
│  │  ├─ Perfect Matches ✓                                                 │
│  │  ├─ Shortages ⚠️                                                       │
│  │  ├─ Overages ⚠️                                                        │
│  │  └─ Invoice Mismatches ⚠️                                              │
│  │                                                                         │
│  └─ If Shortages > 0:                                                     │
│     └─ Alert Banner: "Shortage Detected! Vendor return will be created"  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                6️⃣ USER CLICKS "SAVE & VERIFY" BUTTON                        │
│                                                                             │
│  Validation:                                                               │
│  ✓ At least one item has received_qty > 0                                │
│  ✓ Received Date is selected                                              │
│  ✓ Supplier Invoice Number is filled                                      │
│  └─ If valid → Submit payload to backend                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│            7️⃣ BACKEND: CREATE GRN TRANSACTION (Atomic)                      │
│                POST /grn/from-po/:poId                                     │
│                                                                             │
│  Step A: Generate GRN Number                                              │
│  ├─ Format: GRN-YYYYMMDD-XXXXX                                           │
│  ├─ Example: GRN-20250117-00001                                          │
│  └─ Sequential counter resets daily                                       │
│                                                                             │
│  Step B: Map & Process Items                                              │
│  ├─ For each received item:                                              │
│  │  ├─ Extract: material_name, color, HSN, GSM, width, UOM              │
│  │  ├─ Calculate: shortage_qty, overage_qty                              │
│  │  ├─ Set: quality_status = 'pending_inspection'                       │
│  │  ├─ Flag: discrepancy_flag = (shortage | overage | invoice_mismatch)│
│  │  └─ Extract: rate, remarks for each item                             │
│  │                                                                         │
│  └─ Calculate: total_received_value = Σ(received_qty × rate)            │
│                                                                             │
│  Step C: Create GRN Record                                                │
│  ├─ Save GRN with status: 'received'                                     │
│  ├─ verification_status: 'pending'                                       │
│  ├─ created_by: current_user_id                                          │
│  └─ items_received: [mapped items array]                                 │
│                                                                             │
│  Step D: Update Purchase Order                                            │
│  ├─ PO Status → 'received'                                               │
│  └─ PO received_date → submission date                                   │
│                                                                             │
│  Step E: AUTO-GENERATE Vendor Return (if shortages)                      │
│  ├─ Check: shortageItems.length > 0 ?                                   │
│  │                                                                         │
│  ├─ YES → Create VendorReturn Record:                                    │
│  │  ├─ return_number: VR-YYYYMMDD-XXXXX (sequential)                   │
│  │  ├─ return_type: 'shortage'                                          │
│  │  ├─ items: [all shortage items with details]                         │
│  │  ├─ total_shortage_value: Σ(shortage_qty × rate)                    │
│  │  ├─ status: 'pending'                                                │
│  │  └─ remarks: "Auto-generated from GRN {grnNumber}. Shortage..."      │
│  │                                                                         │
│  └─ NO → Skip vendor return creation                                      │
│                                                                             │
│  Step F: Send Notifications                                              │
│  ├─ If shortages: Notify procurement team                                │
│  │  └─ Message: "Shortage detected in GRN {grnNumber}. VR created."     │
│  └─ Create audit logs                                                     │
│                                                                             │
│  💾 Transaction Commits (all-or-nothing)                                  │
│     └─ If any step fails → ALL CHANGES ROLLBACK                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│           8️⃣ BACKEND RESPONSE WITH METADATA                                 │
│                                                                             │
│  Response JSON:                                                            │
│  {                                                                         │
│    "grn": {                                                               │
│      "id": "grn-uuid",                                                   │
│      "grn_number": "GRN-20250117-00001",                                │
│      "status": "received",                                               │
│      "verification_status": "pending",                                   │
│      "items_received": [...]                                            │
│    },                                                                     │
│    "has_shortages": true,                                               │
│    "shortage_count": 2,                                                 │
│    "vendor_return_id": "vr-uuid",                                       │
│    "vendor_return_number": "VR-20250117-00001"                          │
│  }                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│             9️⃣ FRONTEND: POST-SUCCESS HANDLING                             │
│                                                                             │
│  Display Success Alert:                                                    │
│  ├─ If has_shortages:                                                    │
│  │  └─ "GRN created with 2 shortage(s). Vendor return auto-generated."  │
│  │                                                                         │
│  └─ Else:                                                                │
│     └─ "GRN created successfully!"                                      │
│                                                                             │
│  Auto-Redirect:                                                            │
│  └─ URL: /inventory/grn/{grnId}/verify                                   │
│     └─ Goes to GRN Verification Page (next step in workflow)             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│             🔟 GRN VERIFICATION PAGE (Next Step)                           │
│                                                                             │
│  This page allows:                                                         │
│  ├─ Review all items with discrepancies flagged                          │
│  ├─ Perform quality inspection                                            │
│  ├─ Set quality_status (pending_inspection → approved/rejected)          │
│  ├─ Approve GRN (verification_status → verified)                        │
│  └─ Move verified GRN to inventory system                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│          1️⃣1️⃣  INVENTORY INTEGRATION (Final Step)                          │
│                                                                             │
│  AddGRNToInventoryPage:                                                    │
│  ├─ Approve verified GRN                                                 │
│  ├─ Create inventory records for received items                          │
│  ├─ Generate barcodes for inventory                                      │
│  ├─ Create InventoryMovement logs                                        │
│  ├─ Update stock levels                                                  │
│  └─ Mark GRN as: inventory_added = true                                 │
│                                                                             │
│  After Approval:                                                           │
│  └─ PO Status may transition to 'completed'                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Status Transition Flow

```
Purchase Order
    ↓
[Status: draft/pending_approval/sent/acknowledged/dispatched]
    ↓
User clicks "Create GRN"
    ↓
[Validation: PO status = 'grn_approved' OR 'sent']
    ↓
CreateGRNPage Form
    ↓
User enters receipt data
    ↓
Submit to /grn/from-po/:poId
    ↓
GRN Created ✓
PO Status → 'received' ✓
VendorReturn Created (if shortages) ✓
Notifications Sent ✓
    ↓
Redirect to GRN Verification
    ↓
[GRN Status: received | Verification Status: pending]
    ↓
Quality Inspection & Approval
    ↓
[GRN Verification Status → verified]
    ↓
Add to Inventory
    ↓
[Inventory Added: true]
```

---

## 📋 Key Data Points in Workflow

### From ProcurementDashboard:

- **stats.totalPOs** - Total purchase orders
- **stats.openPOs** - Open/active POs
- **filteredOrders** - PO list with filters applied
- **visibleColumns** - User's column preference (localStorage)

### GRN Data Structure:

```javascript
{
  grn_number: "GRN-20250117-00001",      // Auto-generated
  purchase_order_id: "po-uuid",           // Link to PO
  received_date: "2025-01-17",            // Receiving date
  supplier_invoice_number: "INV-12345",   // Vendor invoice
  inward_challan_number: "DC-9999",       // Transport challan
  items_received: [
    {
      material_name: "Cotton Fabric",
      color: "Navy Blue",
      ordered_quantity: 100,
      invoiced_quantity: 98,              // May differ from order
      received_quantity: 95,              // Actual receipt
      shortage_quantity: 3,               // Calculated
      overage_quantity: 0,                // Calculated
      quality_status: "pending_inspection",
      discrepancy_flag: true,             // Has shortage
      rate: 150,
      total: 14250,
      remarks: "Slight damage on edges"
    }
  ],
  total_received_value: 14250,
  status: "received",
  verification_status: "pending",
  created_by: "user-id",
  created_at: "2025-01-17T10:30:00Z"
}
```

### VendorReturn Auto-Generated Data:

```javascript
{
  return_number: "VR-20250117-00001",
  purchase_order_id: "po-uuid",
  grn_id: "grn-uuid",
  vendor_id: "vendor-id",
  return_type: "shortage",
  items: [
    {
      material_name: "Cotton Fabric",
      shortage_qty: 3,
      shortage_value: 450,
      reason: "Quantity mismatch - shortage detected during GRN"
    }
  ],
  total_shortage_value: 450,
  status: "pending",
  created_by: "user-id"
}
```

---

## 🎯 Key Features

✅ **3-Way Matching**: Compares Ordered vs Invoiced vs Received quantities
✅ **Auto Discrepancy Detection**: Shortages, overages, invoice mismatches flagged
✅ **Auto Vendor Return**: Creates VR request automatically when shortages detected
✅ **Atomic Transactions**: All GRN, PO, VR records created together
✅ **Real-time Validation**: Form validates as user enters data
✅ **Audit Trail**: Tracks who created, when, and all changes
✅ **Quality Flagging**: Items with discrepancies marked for inspection
✅ **Sequential Numbering**: GRN and VR numbers follow date-based format

---

## 📍 Files Involved

- **Frontend**:
  - `client/src/pages/dashboards/ProcurementDashboard.jsx` - Main dashboard
  - `client/src/pages/inventory/CreateGRNPage.jsx` - GRN creation form
  - `client/src/pages/inventory/GRNVerificationPage.jsx` - Verification
- **Backend**:
  - `server/routes/grn.js` - GRN endpoints
  - `server/routes/procurement.js` - PO endpoints
  - `server/models/GoodsReceiptNote.js` - GRN model
  - `server/models/VendorReturn.js` - Vendor return model

---

## 🚀 Next Steps for Enhancement

Would you like to:

1. Add workflow status tracking UI?
2. Implement bulk GRN creation?
3. Add GRN approval levels?
4. Create GRN rejection/rework flow?
5. Add GRN history/audit trail view?
