# 📦 GRN Workflow - Complete Implementation Guide

## 🎯 Overview

This document describes the complete **Goods Receipt Note (GRN) + Verification Workflow** implemented in the Passion ERP system.

**Workflow:** Sales Order → Purchase Order → **Approval → GRN → Verification → Inventory**

---

## 🔄 Complete Workflow Steps

### **Step 1: Sales Order (SO)** 📋
**Department:** Sales  
**Page:** `/sales/orders/create`

- Sales team captures customer requirements
- Creates SO with materials, quantities, specs
- SO status: `confirmed`

---

### **Step 2: Purchase Order (PO)** 🛒
**Department:** Procurement  
**Page:** `/procurement/purchase-orders/create`

- Procurement creates PO from SO (or standalone)
- Selects vendor, adds items, pricing
- Click **"Send for Approval"**
- PO status changes to: `pending_approval`

---

### **Step 3: PO Approval** ✅
**Department:** Procurement Manager / Admin  
**Page:** `/procurement/pending-approvals`

**Actions:**
1. Sidebar shows badge with pending count (auto-updates every 30s)
2. Click "Pending Approvals" menu
3. Review PO details, items, vendor
4. Click "Approve Purchase Order"
5. Add approval notes (optional)

**What Happens:**
- PO status → `approved`
- Notification sent to inventory team
- **Materials NOT added to inventory yet**
- Vendor can now be contacted for delivery

**API Endpoint:** `POST /api/procurement/pos/:id/approve`

---

### **Step 4: Vendor Delivers Materials** 🚚
**Department:** Store / Inventory  

- Vendor delivers materials with challan & invoice
- Store team receives physical materials
- Checks package condition, challan number

---

### **Step 5: Create GRN** 📦
**Department:** Inventory / Store  
**Page:** `/inventory/grn/create?po_id=123`

**How to Create:**
1. Go to Purchase Orders list
2. Find approved PO
3. Click "Create GRN" button (or navigate to Create GRN page with PO ID)

**GRN Form Fields:**
- **Received Date:** Date materials arrived
- **Vendor Challan Number:** DC number from vendor
- **Supplier Invoice Number:** Invoice number
- **Items Table:** Shows all PO items

**For Each Item:**
- Ordered Qty (auto-filled from PO)
- **Received Qty:** Enter actual quantity received *(editable)*
- **Weight:** Enter actual weight if available *(optional)*
- **Remarks:** Any notes about condition

**Submit:**
- Click "Create GRN & Continue to Verification"
- GRN Number generated: `GRN-20250117-00001`
- Auto-redirects to Verification page

**API Endpoint:** `POST /api/grn/from-po/:poId`

**What Happens:**
- GRN created with status: `received`
- Verification status: `pending`
- PO status → `received`
- Notification sent to QC/Inventory team

---

### **Step 6: GRN Verification (Quality Check)** 🔍
**Department:** QC / Inventory  
**Page:** `/inventory/grn/:id/verify`

**Verification Checks:**
- **Quantity Match:** Compare ordered vs. received
- **Weight Verification:** Check if weight matches expectations
- **Quality:** GSM, color, condition, packaging
- **Visual Inspection:** Damage, defects

**Discrepancy Flags:**
- ☑️ Quantity Mismatch
- ☑️ Weight Mismatch
- ☑️ Quality Issue (Color, GSM, Condition)

**Two Outcomes:**

#### A) **Verified (No Issues)** ✅
- Click "Verify & Continue to Add Inventory"
- GRN verification_status → `verified`
- Auto-redirects to Add to Inventory page

#### B) **Discrepancy Found** ⚠️
- Check relevant discrepancy boxes
- Enter **Discrepancy Details** (required)
- Add verification notes
- Click "Report Discrepancy"
- GRN verification_status → `discrepancy`
- **Requires Manager Approval** before proceeding

**API Endpoint:** `POST /api/grn/:id/verify`

**What Happens:**
- Verification recorded with timestamp
- Notification sent to relevant team
- If verified → proceed to inventory
- If discrepancy → wait for approval

---

### **Step 7: Discrepancy Approval (If Needed)** ⚠️➡️✅
**Department:** Procurement Manager / Admin  
**Page:** `/inventory/grn` (List page with filter)

**Only if discrepancies were reported in Step 6**

**Actions:**
1. Filter GRNs by verification_status: `discrepancy`
2. Review discrepancy details
3. Manager decides: Approve or Reject

**Approve:**
- Accept materials despite discrepancy
- Add approval notes (reason for accepting)
- GRN verification_status → `approved`
- Can proceed to add to inventory

**Reject:**
- Reject the entire GRN
- Materials will NOT be added to inventory
- GRN verification_status → `rejected`
- Vendor may need to replace/refund

**API Endpoint:** `POST /api/grn/:id/approve-discrepancy`

---

### **Step 8: Add GRN to Inventory (Final Step)** 📦➡️💾
**Department:** Inventory  
**Page:** `/inventory/grn/:id/add-to-inventory`

**Prerequisites:**
- GRN verification_status must be: `verified` OR `approved`
- Inventory not already added

**Form:**
- Select **Warehouse Location** (dropdown)
  - Main Warehouse
  - Warehouse A/B
  - Rack-R1-FAB01, etc.

**What Happens When You Click "Add to Inventory":**

1. **Inventory Entries Created:**
   - One entry per GRN item
   - Unique barcode: `INV-20250117-00001`
   - QR code with full metadata

2. **Product Auto-Creation:**
   - If product doesn't exist, creates new Product record
   - Links inventory to Product

3. **Audit Trail:**
   - InventoryMovement record created
   - Type: `inward`
   - From: Vendor name
   - To: Selected warehouse location

4. **Status Updates:**
   - GRN inventory_added → `true`
   - GRN status → `approved` (final)
   - PO status → `completed`
   - PO inventory_updated → `true`

5. **Notifications:**
   - Sent to inventory team
   - Alerts procurement of completion

**API Endpoint:** `POST /api/grn/:id/add-to-inventory`

**Response:**
- Returns created inventory items
- Returns movement records
- Success message with count

**After Success:**
- Redirects to `/inventory/stock`
- Materials now available in system

---

## 📊 **Status Flow Summary**

### Purchase Order Statuses:
```
draft → pending_approval → approved → received → completed
```

### GRN Statuses:
```
received → inspected → approved (or rejected)
```

### GRN Verification Statuses:
```
pending → verified (direct path)
       → discrepancy → approved (after manager approval)
                   → rejected (materials rejected)
```

---

## 🗂️ **Database Schema**

### GoodsReceiptNote Table Fields:

**Core Fields:**
- `id` - Primary key
- `grn_number` - Auto-generated (GRN-YYYYMMDD-XXXXX)
- `purchase_order_id` - FK to PurchaseOrder
- `bill_of_materials_id` - FK to BOM (optional)
- `sales_order_id` - FK to SalesOrder (optional)

**Receipt Info:**
- `received_date` - When materials arrived
- `supplier_name` - Vendor name
- `supplier_invoice_number` - Invoice #
- `inward_challan_number` - DC/Challan #
- `items_received` - JSON array of items
- `total_received_value` - Total value

**Verification Workflow:**
- `verification_status` - ENUM: pending, verified, discrepancy, approved, rejected
- `verified_by` - FK to User
- `verification_date` - Timestamp
- `verification_notes` - Text
- `discrepancy_details` - JSON: {qty_mismatch, weight_mismatch, quality_issue, details}

**Discrepancy Approval:**
- `discrepancy_approved_by` - FK to User
- `discrepancy_approval_date` - Timestamp
- `discrepancy_approval_notes` - Text

**Inventory Addition:**
- `inventory_added` - Boolean
- `inventory_added_date` - Timestamp

**Legacy Fields:**
- `status` - ENUM: draft, received, inspected, approved, rejected
- `quality_inspector` - FK to User
- `approved_by` - FK to User
- `created_by` - FK to User

---

## 🎨 **UI/UX Features**

### **1. Pending Approvals Page**
**Path:** `/procurement/pending-approvals`

- **Real-time Badge:** Shows count, updates every 30s
- **Stats Cards:** Total orders, total value, urgent count
- **Action Buttons:**
  - View Details
  - Approve Order
  - Reject

**Modal:**
- Shows PO summary
- Lists all items
- Approval notes input
- Clear next-step messaging (GRN workflow)

---

### **2. Create GRN Page**
**Path:** `/inventory/grn/create?po_id=123`

**Features:**
- **PO Info Card:** Shows PO details at top
- **Receipt Form:** Date, challan, invoice fields
- **Items Table:**
  - Ordered qty (read-only)
  - Received qty (editable, defaults to ordered)
  - Weight input
  - Remarks
  - **Status Badge:** Match ✓ or Variance ⚠️

**Highlights:**
- Yellow highlight for quantity variance
- Auto-detects mismatches
- Help text at bottom

---

### **3. GRN Verification Page**
**Path:** `/inventory/grn/:id/verify`

**Features:**
- **GRN Info Card:** Full GRN details
- **Warning Banner:** If variance detected
- **Items Table:**
  - Shows ordered, received, variance
  - Variance % calculation
  - Status badges
  - Yellow highlight for issues

**Verification Form:**
- Checkboxes for issues:
  - ☑️ Quantity Mismatch
  - ☑️ Weight Mismatch
  - ☑️ Quality Issue
- **Discrepancy Details:** Required if issue checked
- Verification notes

**Buttons:**
- "Report Discrepancy" (yellow)
- "Verify & Continue" (green)

---

### **4. Add to Inventory Page**
**Path:** `/inventory/grn/:id/add-to-inventory`

**Features:**
- **Success Banner:** Green, shows verification passed
- **GRN Info:** Summary card
- **Items Table:** Final list to be added
- **Location Selector:** Dropdown
- **Summary Card:** What will happen (blue box)

**Button:**
- "Add X Items to Inventory" (green)

---

### **5. GRN List Page**
**Path:** `/inventory/grn`

**Features:**
- **Filters:**
  - Status (draft, received, inspected, approved, rejected)
  - Verification Status (pending, verified, discrepancy, approved, rejected)
  - PO filter

**Table Columns:**
- GRN #
- PO #
- Supplier
- Received Date
- Status badge
- Verification status badge
- Value
- Actions (View, Verify, Add to Inventory, Delete)

**Action Buttons:**
- **View:** View details
- **Verify:** For pending verification
- **Add to Inventory:** For verified GRNs
- **Approve Discrepancy:** For managers (discrepancy status)

---

## 🔗 **API Endpoints**

### **PO Approval**
```http
POST /api/procurement/pos/:id/approve
Body: { notes: string }
Response: { message, purchase_order, next_step, workflow_info }
```

### **Create GRN from PO**
```http
POST /api/grn/from-po/:poId
Body: {
  received_date: string,
  inward_challan_number: string,
  supplier_invoice_number: string,
  items_received: [
    { item_index, ordered_qty, received_qty, weight, remarks }
  ],
  remarks: string
}
Response: { message, grn, next_step }
```

### **Verify GRN**
```http
POST /api/grn/:id/verify
Body: {
  verification_status: 'verified' | 'discrepancy',
  verification_notes: string,
  discrepancy_details: {
    qty_mismatch: boolean,
    weight_mismatch: boolean,
    quality_issue: boolean,
    details: string
  }
}
Response: { message, grn, next_step }
```

### **Approve Discrepancy**
```http
POST /api/grn/:id/approve-discrepancy
Body: {
  decision: 'approve' | 'reject',
  approval_notes: string
}
Response: { message, grn, next_step }
```

### **Add GRN to Inventory**
```http
POST /api/grn/:id/add-to-inventory
Body: { location: string }
Response: {
  message,
  grn,
  inventory_items: [...],
  movements: [...]
}
```

### **Get GRN List**
```http
GET /api/grn
Query: {
  page, limit, status, verification_status, po_id
}
Response: { grns: [...], pagination: {...} }
```

### **Get Single GRN**
```http
GET /api/grn/:id
Response: { ...grn with all associations }
```

---

## 🎯 **Testing Checklist**

### ✅ **Phase 1: PO Approval**
- [ ] Create PO with items
- [ ] Click "Send for Approval"
- [ ] Verify badge appears in sidebar
- [ ] Navigate to Pending Approvals
- [ ] Approve PO
- [ ] Verify PO status = `approved`
- [ ] Verify NO inventory created yet

### ✅ **Phase 2: GRN Creation**
- [ ] Navigate to Create GRN with PO ID
- [ ] Verify PO details pre-filled
- [ ] Enter challan & invoice numbers
- [ ] Edit received quantities
- [ ] Add weights
- [ ] Submit GRN
- [ ] Verify GRN created with correct number
- [ ] Verify auto-redirect to verification page

### ✅ **Phase 3: Verification (No Issues)**
- [ ] Review items table
- [ ] Enter verification notes
- [ ] Click "Verify"
- [ ] Verify redirect to Add to Inventory page
- [ ] Select location
- [ ] Add to inventory
- [ ] Verify inventory created
- [ ] Verify barcodes generated
- [ ] Verify PO status = `completed`

### ✅ **Phase 4: Verification (With Discrepancy)**
- [ ] Create new GRN
- [ ] Go to verification
- [ ] Check discrepancy boxes
- [ ] Enter discrepancy details
- [ ] Click "Report Discrepancy"
- [ ] Verify GRN status = `discrepancy`
- [ ] Manager approves discrepancy
- [ ] Proceed to add to inventory

### ✅ **Phase 5: Navigation & UI**
- [ ] Sidebar GRN menu item works
- [ ] GRN list page loads
- [ ] Filters work correctly
- [ ] Status badges display correctly
- [ ] Empty states show properly
- [ ] Modals open and close smoothly

---

## 🚨 **Troubleshooting**

### Issue: "Cannot approve PO, status is not 'pending_approval'"
**Solution:** PO must be in `pending_approval` status. Use "Send for Approval" button in PO form.

### Issue: "GRN not ready for verification"
**Solution:** GRN must have `verification_status` = `pending`. Check GRN was created properly.

### Issue: "Cannot add to inventory, GRN not verified"
**Solution:** GRN must be verified (`verified` or `approved` status). Complete verification first.

### Issue: "Discrepancy details required"
**Solution:** If you check any discrepancy box, you MUST enter details in the textarea.

### Issue: "GRN already added to inventory"
**Solution:** Cannot add same GRN twice. Check `inventory_added` field.

---

## 📝 **Migration Required**

Run this migration to add new GRN fields:

```bash
cd server
node scripts/runMigration.js 20250301000001-make-grn-fields-optional.js
```

Or use Sequelize CLI:
```bash
npx sequelize-cli db:migrate
```

---

## 🎓 **Training Guide**

### **For Store/Inventory Team:**
1. When vendor delivers, create GRN from approved PO
2. Enter actual quantities received
3. Verify quality, quantity, weight
4. If issues found, report discrepancy
5. Once verified, add to inventory

### **For Procurement Managers:**
1. Review pending PO approvals daily
2. Approve orders after verification
3. If discrepancies reported, review and decide
4. Monitor vendor performance

### **For Admins:**
1. Monitor complete workflow
2. Check GRN verification queue
3. Ensure no pending items stuck
4. Review reports regularly

---

## 📊 **Reports & Analytics**

### **Key Metrics:**
- GRNs pending verification
- Discrepancy rate by vendor
- Time from PO approval to inventory
- Quantity variance trends
- Rejected materials by reason

### **Dashboard Widgets:**
- Pending GRN count
- Verification backlog
- Discrepancies awaiting approval
- Inventory inward trend

---

## 🔐 **Permissions**

### **Department Access:**

| Action | Departments |
|--------|------------|
| Create GRN | Inventory, Admin |
| Verify GRN | Inventory, Admin |
| Approve Discrepancy | Procurement, Admin |
| Add to Inventory | Inventory, Admin |
| View GRN List | Procurement, Inventory, Admin |
| Delete GRN | Admin only |

---

## ✨ **Key Advantages**

1. **Complete Traceability:** Every material tracked from PO to inventory
2. **Quality Assurance:** Verification step ensures quality control
3. **Accountability:** Each step has user attribution
4. **Discrepancy Management:** Formal process for handling issues
5. **Audit Trail:** Full history via Inventory Movements
6. **Auto-Barcode:** Unique codes for all items
7. **Vendor Performance:** Track delivery accuracy

---

## 🚀 **Next Steps / Future Enhancements**

1. **Photo Upload:** Attach photos during GRN creation
2. **Barcode Scanning:** Scan vendor barcodes during receipt
3. **Weight Scale Integration:** Auto-capture weights
4. **Mobile App:** GRN creation on mobile
5. **Vendor Portal:** Vendors view GRN status
6. **Analytics Dashboard:** Visual reports
7. **Email Notifications:** Auto-send emails on status changes
8. **Batch Management:** Track multiple batches per GRN

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** Zencoder Assistant