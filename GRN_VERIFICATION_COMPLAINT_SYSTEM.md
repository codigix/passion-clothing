# GRN Verification & Complaint System - Complete Implementation

## Overview
This system provides comprehensive GRN (Goods Receipt Note) verification with automatic complaint generation for discrepancies. When Inventory staff creates a GRN, the system:

1. **Compares 3-way matching**: PO Ordered Qty vs Invoice Qty vs Actual Received Qty
2. **Detects discrepancies**: Shortages, Overages, Invoice Mismatches
3. **Auto-creates complaints**: Logs issues in Procurement Dashboard for action
4. **Auto-verifies perfect matches**: Items that match perfectly are auto-approved
5. **Sends notifications**: Real-time alerts to Procurement team

---

## Implementation Details

### 1. Backend Changes

#### Updated: `server/routes/grn.js` - POST `/from-po/:poId`

**New Features:**
- **Shortage Detection**: Creates complaint record when received < expected
- **Overage Detection**: Creates complaint record when received > expected  
- **Invoice Mismatch Detection**: Tracks when invoice qty ≠ PO qty
- **Perfect Match Auto-Verification**: Auto-verifies GRN when all items match perfectly
- **Complaint Logging**: All discrepancies stored in Approvals table with details
- **Auto Status Update**: GRN automatically marked as verified or discrepancy

**Key Logic:**
```javascript
const shortageItems = mappedItems.filter(item => item.shortage_quantity > 0);
const overageItems = mappedItems.filter(item => item.overage_quantity > 0);
const invoiceMismatchItems = mappedItems.filter(item => item.invoiced_quantity !== item.ordered_quantity);
const perfectMatchItems = mappedItems.filter(item => 
  item.received_quantity === item.ordered_quantity &&
  item.received_quantity === item.invoiced_quantity
);
```

**Complaint Creation:**
- Creates Approval record with `request_type: "grn_shortage_complaint"`
- Creates Approval record with `request_type: "grn_overage_complaint"`
- Creates Approval record with `request_type: "grn_invoice_mismatch"`
- Each complaint includes detailed `approval_details` JSON with item-wise breakdown

#### New Endpoint: `server/routes/procurement.js` - GET `/dashboard/grn-complaints`

**Purpose**: Fetch all GRN complaints for Procurement Dashboard

**Parameters:**
- `status`: "all", "pending", "approved", "rejected"
- `type`: "all", "shortage", "overage", "invoice_mismatch"
- `limit`: Number of records (default: 50)
- `offset`: Pagination offset (default: 0)

**Returns:**
```json
{
  "complaints": [
    {
      "id": 123,
      "complaint_type": "shortage",
      "grn_number": "GRN-20250111-00001",
      "po_number": "PO-20250111-0001",
      "vendor_name": "ABC Fabrics",
      "status": "pending",
      "items_affected": [
        {
          "material_name": "Cotton Fabric",
          "ordered_qty": 100,
          "invoiced_qty": 100,
          "received_qty": 95,
          "shortage_qty": 5,
          "shortage_value": "2500.00"
        }
      ],
      "total_value": "2500.00",
      "action_required": "Approve shortage and coordinate with vendor for replacement",
      "created_at": "2025-01-11T10:30:00Z"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

#### Updated: `server/config/database.js` - Approval Model Associations

**New Associations Added:**
```javascript
Approval.belongsTo(User, { 
  foreignKey: "requested_by", 
  as: "requester" 
});
Approval.belongsTo(PurchaseOrder, {
  foreignKey: "entity_id",
  as: "relatedEntity",
  constraints: false,
  scope: { entity_type: "purchase_order" }
});
```

---

### 2. Frontend Changes

#### Updated: `client/src/pages/inventory/CreateGRNPage.jsx`

**New Features:**
- Enhanced success/error messages with detailed breakdowns
- Toast notifications showing complaint details
- Auto-redirect based on GRN verification status:
  - Perfect match → Inventory Addition page
  - Discrepancies → Verification page
- Added `react-hot-toast` import for better notifications

**Response Handling:**
```javascript
if (response.data.all_items_verified) {
  message = "✅ GRN CREATED & AUTO-VERIFIED! All items match perfectly.";
  nextPage = `/inventory/grn/${response.data.grn.id}/add-to-inventory`;
} else {
  message = "⚠️ GRN created with discrepancies...";
  nextPage = `/inventory/grn/${response.data.grn.id}/verify`;
}
```

---

### 3. Data Flow

#### GRN Creation Flow:

```
1. Inventory staff creates GRN via CreateGRNPage
   ├─ Enters received quantities
   ├─ Enters invoice details
   └─ Submits

2. Backend processes GRN (POST /grn/from-po/:poId)
   ├─ Maps items from PO
   ├─ Compares quantities (3-way matching)
   ├─ Detects discrepancies
   ├─ Auto-creates complaint records
   ├─ Auto-verifies perfect matches
   ├─ Updates GRN status
   └─ Sends notifications to Procurement

3. Response returned with details
   ├─ If perfect match: GRN marked verified
   └─ If discrepancies: GRN marked for verification

4. Frontend displays results and redirects
   ├─ Perfect match → Inventory Addition
   └─ Discrepancies → Verification + Complaints visible in Procurement Dashboard
```

---

### 4. Complaint Record Structure

**Stored in: Approvals Table**

```json
{
  "id": 123,
  "request_type": "grn_shortage_complaint",
  "entity_type": "purchase_order",
  "entity_id": 456,
  "status": "pending",
  "department": "procurement",
  "stage_label": "GRN Shortage Complaint - 3 item(s)",
  "approval_details": {
    "grn_number": "GRN-20250111-00001",
    "complaint_type": "shortage",
    "po_number": "PO-20250111-0001",
    "vendor_name": "ABC Fabrics",
    "items_affected": [
      {
        "material_name": "Cotton Fabric",
        "ordered_qty": 100,
        "invoiced_qty": 100,
        "received_qty": 95,
        "shortage_qty": 5,
        "shortage_value": "2500.00",
        "remarks": "Damaged in transit"
      }
    ],
    "total_shortage_value": "2500.00",
    "action_required": "Approve shortage and coordinate with vendor for replacement",
    "created_at": "2025-01-11T10:30:00Z"
  },
  "requested_by": 1,
  "created_at": "2025-01-11T10:30:00Z"
}
```

---

### 5. Complaint Types

#### Type 1: Shortage Complaint
- **Trigger**: `received_qty < MIN(ordered_qty, invoiced_qty)`
- **Action**: Coordinate with vendor for replacement/credit
- **Auto-create**: VendorReturn record of type "shortage"

#### Type 2: Overage Complaint
- **Trigger**: `received_qty > MAX(ordered_qty, invoiced_qty)`
- **Action**: Verify with vendor for extra billing or return
- **Example**: Ordered 100, Received 110

#### Type 3: Invoice Mismatch
- **Trigger**: `invoiced_qty ≠ ordered_qty` (and no shortage/overage)
- **Action**: Verify invoice accuracy with vendor
- **Example**: PO ordered 100, Invoice shows 105

---

### 6. Perfect Match Auto-Verification

**Criteria:**
```
received_qty === ordered_qty AND received_qty === invoiced_qty
```

**When All Items Match:**
- GRN.verification_status = "verified"
- GRN.status = "verified"
- GRN.verified_by = current_user_id
- GRN.verification_date = NOW
- GRN.verification_notes = "Auto-verified: All items match perfectly (Ordered = Invoiced = Received)"

**Frontend Behavior:**
- Shows ✅ success message
- Redirects to Inventory Addition page (next step)
- User can directly add to inventory without manual verification

---

### 7. Notifications

#### Shortage Notification:
```
Title: ⚠️ GRN Shortage Detected
Message: Shortage detected in GRN-20250111-00001 for PO PO-20250111-0001. 
         Vendor return request VR-20250111-00001 created. 
         Total shortage value: ₹2500.00. 
         Complaint logged in Procurement Dashboard.
Type: vendor_shortage
```

#### Overage Notification:
```
Title: 📦 GRN Overage Detected
Message: Overage detected in GRN-20250111-00001 for PO PO-20250111-0001. 
         3 item(s) received more than ordered. 
         Total overage value: ₹5000.00. 
         Complaint logged in Procurement Dashboard.
Type: vendor_overage
```

#### Invoice Mismatch Notification:
```
Title: 🔍 GRN Invoice Mismatch
Message: Invoice discrepancy in GRN-20250111-00001 for PO PO-20250111-0001. 
         2 item(s) have invoice quantities different from PO. 
         Complaint logged in Procurement Dashboard.
Type: vendor_mismatch
```

---

## Usage Instructions

### For Inventory Staff (Creating GRN):

1. Navigate to **Inventory → GRN Workflow → Incoming Requests**
2. Click **Create GRN** on a Purchase Order
3. Fill in received quantities (compare with PO and invoice)
4. If quantities don't match:
   - System shows discrepancies in real-time
   - **⚠️ RED rows** = Shortages
   - **📦 YELLOW rows** = Overages
   - **🔍 ORANGE rows** = Invoice mismatches
5. Click **Create GRN & Proceed to Verification**
6. System processes and:
   - ✅ **Perfect Match**: Auto-verifies → Go to Inventory Addition
   - ⚠️ **Discrepancies**: Creates complaints → Go to Verification page

### For Procurement Staff (Handling Complaints):

1. Navigate to **Procurement Dashboard**
2. Go to **Complaints** tab (to be added)
3. Filter by:
   - Status: Pending, Approved, Rejected
   - Type: Shortage, Overage, Invoice Mismatch
4. View complaint details:
   - Which items affected
   - Quantities mismatch details
   - Suggested action
5. Approve or take action:
   - Coordinate with vendor
   - Approve shortage/overage
   - Request credit note or return

---

## API Endpoints Reference

### Create GRN with Auto-Complaint Generation
```
POST /api/grn/from-po/:poId
```

**Request Body:**
```json
{
  "received_date": "2025-01-11",
  "inward_challan_number": "DC-12345",
  "supplier_invoice_number": "INV-12345",
  "items_received": [
    {
      "item_index": 0,
      "ordered_qty": 100,
      "invoiced_qty": 100,
      "received_qty": 95,
      "weight": 47.5,
      "remarks": "Damaged in transit"
    }
  ],
  "remarks": "Check item 1 for damage"
}
```

**Response:**
```json
{
  "message": "⚠️ GRN created with discrepancies: 1 shortage(s)...",
  "grn": { /* GRN details */ },
  "complaints": [ /* Array of complaint records */ ],
  "has_shortages": true,
  "shortage_count": 1,
  "all_items_verified": false,
  "next_step": "verification"
}
```

### Get GRN Complaints
```
GET /api/procurement/dashboard/grn-complaints?status=pending&type=shortage&limit=50&offset=0
```

**Response:**
```json
{
  "complaints": [ /* Array of complaints */ ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

---

## Testing Scenarios

### Scenario 1: Perfect Match (All quantities match)
1. Create GRN with:
   - Ordered: 100, Invoiced: 100, Received: 100
2. Expected: ✅ Auto-verified, redirect to inventory addition

### Scenario 2: Shortage Detection
1. Create GRN with:
   - Ordered: 100, Invoiced: 100, Received: 95
2. Expected: ⚠️ Shortage complaint created, needs verification

### Scenario 3: Overage Detection
1. Create GRN with:
   - Ordered: 100, Invoiced: 100, Received: 110
2. Expected: 📦 Overage complaint created, needs verification

### Scenario 4: Invoice Mismatch
1. Create GRN with:
   - Ordered: 100, Invoiced: 105, Received: 105
2. Expected: 🔍 Invoice mismatch complaint created

### Scenario 5: Multiple Items with Mixed Results
1. Create GRN with multiple items:
   - Item 1: 100/100/100 (perfect match)
   - Item 2: 50/50/45 (shortage)
   - Item 3: 75/75/80 (overage)
2. Expected: 2 complaints created, Item 1 auto-verified

---

## Future Enhancements

1. **Complaints Tab in Procurement Dashboard**
   - Filter by type and status
   - Approve/reject complaints
   - Track resolution

2. **Auto-Approval for Minor Discrepancies**
   - Allow setting tolerance % for shortages/overages
   - Auto-approve if within tolerance

3. **Batch GRN Processing**
   - Process multiple POs at once
   - Bulk complaint generation

4. **Vendor Performance Scoring**
   - Track complaint frequency per vendor
   - Alert on poor performance

5. **Email Notifications**
   - Send detailed complaint reports to Procurement Manager
   - Automatic reminders for pending complaints

---

## Files Modified

1. ✅ `server/routes/grn.js` - Enhanced GRN creation with complaint generation
2. ✅ `server/routes/procurement.js` - New endpoint for fetching complaints
3. ✅ `server/config/database.js` - Added Approval model associations
4. ✅ `client/src/pages/inventory/CreateGRNPage.jsx` - Enhanced UI feedback

---

## Status: ✅ IMPLEMENTATION COMPLETE

All backend endpoints are functional and ready for integration with Procurement Dashboard UI.