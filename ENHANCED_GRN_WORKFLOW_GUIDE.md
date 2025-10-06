# Enhanced GRN Workflow with 3-Way Matching & Auto Vendor Returns

## Overview
This enhanced GRN (Goods Receipt Note) workflow implements a complete **3-way matching system** that compares:
1. **Ordered Quantity** (from Purchase Order)
2. **Invoiced Quantity** (from Vendor's Invoice)
3. **Received Quantity** (Actual physical count)

When discrepancies are detected (shortages, overages, or invoice mismatches), the system automatically creates vendor return requests and notifications.

---

## Workflow Steps

### Step 1: Purchase Order Approved
- Admin/Manager approves a Purchase Order
- PO status changes to `approved`
- Materials are ordered from vendor

### Step 2: Materials Received from Vendor
- Warehouse receives materials with:
  - Vendor Delivery Challan
  - Tax Invoice
  - Physical goods

### Step 3: Create GRN (Goods Receipt Note)
**Route:** `/inventory/grn/create?po_id={id}`

**Process:**
1. Select approved PO
2. System auto-fills **Ordered Quantities** from PO
3. User enters:
   - **Invoiced Quantities** (from vendor's invoice document)
   - **Received Quantities** (actual physical count)
   - Weight (optional)
   - Vendor challan number
   - Vendor invoice number
   - Received date
   - Remarks

**3-Way Matching Logic:**
```javascript
Ordered Qty (PO) vs Invoiced Qty (Invoice) vs Received Qty (Actual)

✓ Perfect Match: All three quantities match
⚠️ Shortage: Received < Min(Ordered, Invoiced)
⚠️ Overage: Received > Max(Ordered, Invoiced)
⚠️ Invoice Mismatch: Invoiced ≠ Ordered
```

**Auto Actions:**
- If **shortages detected**: System automatically creates Vendor Return Request
- All items tagged with discrepancy flags
- Notifications sent to procurement team

**API Endpoint:** `POST /api/grn/from-po/:poId`

**Request Payload:**
```json
{
  "received_date": "2025-01-15",
  "inward_challan_number": "DC-12345",
  "supplier_invoice_number": "INV-2025-001",
  "items_received": [
    {
      "item_index": 0,
      "ordered_qty": 100.00,
      "invoiced_qty": 95.00,  // Vendor claims 95m on invoice
      "received_qty": 90.00,   // Actually received only 90m
      "weight": 15.5,
      "remarks": "Shortage detected - 5m short from invoice, 10m short from PO"
    }
  ],
  "remarks": "Materials received on time, but quantities short"
}
```

**Response:**
```json
{
  "message": "GRN created with 1 shortage(s). Vendor return request auto-generated.",
  "grn": { /* GRN object */ },
  "vendor_return": { /* Auto-generated vendor return */ },
  "has_shortages": true,
  "shortage_count": 1,
  "next_step": "verification"
}
```

### Step 4: Verify GRN (Quality Check)
**Route:** `/inventory/grn/{id}/verify`

**Process:**
1. Quality inspector reviews GRN
2. Checks material quality, specifications
3. Verifies discrepancy reports
4. Decision:
   - **Verified**: No quality issues, proceed
   - **Discrepancy**: Quality issues found, needs approval

**API Endpoint:** `POST /api/grn/:id/verify`

**Request:**
```json
{
  "verification_status": "verified",  // or "discrepancy"
  "verification_notes": "All materials meet quality standards",
  "discrepancy_details": {  // Only if discrepancy
    "qty_mismatch": true,
    "weight_mismatch": false,
    "quality_issue": false,
    "details": "Quantity shortage confirmed"
  }
}
```

### Step 5: Add to Inventory
**Route:** `/inventory/grn/{id}/add-to-inventory`

**Process:**
1. After verification approved
2. System adds received quantities to inventory
3. Creates inventory movement records
4. Generates barcodes/QR codes
5. Updates PO status to `completed`

**API Endpoint:** `POST /api/grn/:id/add-to-inventory`

---

## Vendor Return Management

### Automatic Vendor Return Creation
When GRN is created with shortages, system auto-generates:

**Vendor Return Record:**
```javascript
{
  return_number: "VR-20250115-00001",
  purchase_order_id: 123,
  grn_id: 456,
  vendor_id: 78,
  return_type: "shortage",
  items: [
    {
      material_name: "Cotton Fabric - White",
      ordered_qty: 100.00,
      invoiced_qty: 95.00,
      received_qty: 90.00,
      shortage_qty: 10.00,  // PO ordered 100, received 90
      rate: 150.00,
      shortage_value: 1500.00,
      reason: "Quantity mismatch - shortage detected during GRN"
    }
  ],
  total_shortage_value: 1500.00,
  status: "pending",
  remarks: "Auto-generated from GRN-20250115-00001"
}
```

### Vendor Return Workflow States
1. **Pending**: Return request created, awaiting vendor acknowledgment
2. **Acknowledged**: Vendor confirmed the issue
3. **Resolved**: Resolution provided (credit note, replacement, refund)
4. **Disputed**: Vendor disputes the claim
5. **Closed**: Matter settled

### Resolution Types
- **Credit Note**: Vendor issues credit for shortage value
- **Replacement**: Vendor sends missing materials
- **Refund**: Vendor refunds the amount
- **Adjustment**: Mutual agreement on price/quantity adjustment
- **None**: Issue closed without resolution

### Manual Vendor Return Creation
For quality issues, wrong items, or damaged goods:

**API Endpoint:** `POST /api/vendor-returns`

**Request:**
```json
{
  "purchase_order_id": 123,
  "grn_id": 456,
  "return_type": "quality_issue",  // quality_issue, wrong_item, damaged, other
  "items": [
    {
      "material_name": "Fabric",
      "return_qty": 25.00,
      "rate": 150.00,
      "reason": "Quality not as per specifications",
      "remarks": "Color bleeding detected"
    }
  ],
  "remarks": "Quality issue - fabric does not meet GSM standards",
  "attachments": ["photo1.jpg", "photo2.jpg"]
}
```

### Vendor Return API Endpoints

#### Get All Vendor Returns
```
GET /api/vendor-returns?status=pending&vendor_id=123
```

#### Get Single Return
```
GET /api/vendor-returns/:id
```

#### Update Return Status
```
PATCH /api/vendor-returns/:id/status
{
  "status": "resolved",
  "vendor_response": "We will issue credit note for shortage value",
  "resolution_type": "credit_note",
  "resolution_amount": 1500.00,
  "resolution_notes": "Credit note #CN-2025-001 issued"
}
```

---

## Database Models

### VendorReturn Model
```javascript
{
  id: INTEGER (PK),
  return_number: STRING (unique),
  purchase_order_id: INTEGER (FK),
  grn_id: INTEGER (FK, optional),
  vendor_id: INTEGER (FK),
  return_type: ENUM('shortage', 'quality_issue', 'wrong_item', 'damaged', 'other'),
  return_date: DATE,
  items: JSON,
  total_shortage_value: DECIMAL(10,2),
  status: ENUM('pending', 'acknowledged', 'resolved', 'disputed', 'closed'),
  vendor_response: TEXT,
  vendor_response_date: DATE,
  resolution_type: ENUM('credit_note', 'replacement', 'refund', 'adjustment', 'none'),
  resolution_amount: DECIMAL(10,2),
  resolution_date: DATE,
  resolution_notes: TEXT,
  created_by: INTEGER (FK),
  approved_by: INTEGER (FK),
  approval_date: DATE,
  remarks: TEXT,
  attachments: JSON
}
```

### Updated GRN Items Structure
```javascript
items_received: [
  {
    material_name: STRING,
    color: STRING,
    hsn: STRING,
    gsm: STRING,
    uom: STRING,
    ordered_quantity: DECIMAL,      // From PO
    invoiced_quantity: DECIMAL,     // From Vendor Invoice  ← NEW
    received_quantity: DECIMAL,     // Actual count
    shortage_quantity: DECIMAL,     // Auto-calculated  ← NEW
    overage_quantity: DECIMAL,      // Auto-calculated  ← NEW
    weight: DECIMAL,
    rate: DECIMAL,
    total: DECIMAL,
    quality_status: STRING,
    discrepancy_flag: BOOLEAN,      // ← NEW
    remarks: STRING
  }
]
```

---

## User Interface Features

### Enhanced GRN Creation Page
**Visual Indicators:**
- 🟦 **Blue column**: Ordered Qty (read-only from PO)
- 🟧 **Orange column**: Invoiced Qty (editable - from vendor invoice)
- 🟩 **Green column**: Received Qty (editable - actual count)

**Color Coding:**
- 🟢 **Green**: Perfect match (all three quantities identical)
- 🔴 **Red**: Shortage detected (row background red)
- 🟡 **Yellow**: Overage detected (row background yellow)
- 🟠 **Orange**: Invoice vs PO mismatch

**Real-time Summary Card:**
```
┌─────────────────────────────────────────────┐
│ Discrepancy Summary                          │
├──────────────┬──────────────┬────────────────┤
│ ✓ Perfect: 5 │ ⚠️ Short: 2  │ ⚠️ Over: 1     │
│ 🔶 Invoice   │              │                │
│   Mismatch:1 │              │                │
└──────────────┴──────────────┴────────────────┘
```

**Shortage Alert Banner:**
When shortages detected, shows prominent alert:
```
⚠️ Shortage Detected!
2 item(s) have quantity shortages. A vendor return 
request will be automatically created.
```

---

## Notifications

### Auto-generated Notifications

1. **GRN Created with Shortage:**
```
Title: Vendor Shortage Detected
Message: Shortage detected in GRN GRN-20250115-00001 for 
         PO PO-2025-001. Vendor return request VR-20250115-00001 
         created. Total shortage value: ₹1,500.00
Type: vendor_shortage
```

2. **GRN Ready for Verification:**
```
Title: New GRN Pending Verification
Message: GRN GRN-20250115-00001 created for PO PO-2025-001. 
         Please verify received materials. ⚠️ Shortages detected!
Type: grn_verification
```

3. **Vendor Return Updated:**
```
Title: Vendor Return RESOLVED
Message: Vendor return VR-20250115-00001 for ABC Textiles 
         has been resolved.
Type: vendor_return_updated
```

---

## Benefits

### 1. Complete Traceability
- Track exact quantities at every stage
- Document all discrepancies with timestamps
- Maintain audit trail

### 2. Automatic Discrepancy Detection
- No manual calculation needed
- Real-time visual feedback
- Prevents inventory inaccuracies

### 3. Vendor Accountability
- Auto-generate return requests
- Track vendor performance
- Document shortages/quality issues

### 4. Financial Accuracy
- Accurate shortage value calculation
- Proper credit note tracking
- Reconciliation support

### 5. Regulatory Compliance
- GST/Tax compliance (invoice vs actual)
- Proper documentation
- Audit-ready records

---

## Example Scenarios

### Scenario 1: Perfect Receipt
```
Ordered:  100 meters
Invoiced: 100 meters
Received: 100 meters
Result: ✓ No issues, GRN approved, add to inventory
```

### Scenario 2: Vendor Shortage
```
Ordered:  100 meters
Invoiced: 95 meters  (Vendor claims shortage)
Received: 95 meters
Result: ⚠️ Invoice mismatch with PO, but received matches invoice
        Create vendor return for 5m shortage
```

### Scenario 3: Theft/Loss in Transit
```
Ordered:  100 meters
Invoiced: 100 meters
Received: 90 meters  (10m missing)
Result: 🔴 Critical shortage! Create vendor return
        Investigate - possible theft or damage in transit
```

### Scenario 4: Overage
```
Ordered:  100 meters
Invoiced: 100 meters
Received: 105 meters (5m extra)
Result: 🟡 Overage detected
        Accept extra or return to vendor
```

### Scenario 5: Multiple Issues
```
Item 1: Ordered 100, Invoiced 100, Received 100 ✓
Item 2: Ordered 50, Invoiced 45, Received 40 🔴 (Shortage)
Item 3: Ordered 75, Invoiced 75, Received 80 🟡 (Overage)

Result: Mixed - Create vendor return for Item 2 shortage
        Notify about Item 3 overage
```

---

## Testing Checklist

### GRN Creation
- [ ] Create GRN with all quantities matching
- [ ] Create GRN with shortage (received < ordered)
- [ ] Create GRN with overage (received > ordered)
- [ ] Create GRN with invoice mismatch
- [ ] Verify auto vendor return creation on shortage
- [ ] Check shortage value calculation

### Vendor Returns
- [ ] View list of vendor returns
- [ ] Filter by status, vendor, type
- [ ] Update return status to acknowledged
- [ ] Mark return as resolved with credit note
- [ ] Add manual vendor return for quality issue

### Notifications
- [ ] Verify shortage notification sent
- [ ] Verify GRN verification notification
- [ ] Check vendor return status notifications

### Inventory
- [ ] Verify only received quantities added to inventory
- [ ] Check inventory movement records
- [ ] Validate barcode/QR generation

---

## Future Enhancements

1. **Photo Upload**: Attach photos during GRN creation
2. **Mobile App**: Warehouse floor GRN creation via mobile
3. **Vendor Portal**: Vendors can view and respond to return requests
4. **Analytics Dashboard**: Vendor performance tracking
5. **Auto Email**: Send return requests to vendors automatically
6. **Integration**: Connect with accounting system for credit notes
7. **Barcode Scanning**: Scan vendor invoice barcodes for auto-fill

---

## Migration Notes

### For Existing System
If upgrading from old system:

1. **Database Migration**: Run to create `vendor_returns` table
2. **Update GRN Routes**: Enhanced with invoiced_qty support
3. **Update UI**: Replace old CreateGRNPage
4. **Test Thoroughly**: Use test POs before production

### Backward Compatibility
- Old GRNs without `invoiced_quantity` still work
- System defaults `invoiced_qty = ordered_qty` if not provided
- Existing workflow not disrupted

---

## Technical Stack

**Backend:**
- Node.js + Express
- Sequelize ORM
- MySQL Database
- Transaction support for data integrity

**Frontend:**
- React 18
- Tailwind CSS
- Lucide Icons
- Real-time calculation

**API Design:**
- RESTful endpoints
- JSON request/response
- Proper error handling
- Transaction rollback on failures

---

## Support & Documentation

**Related Files:**
- Server Model: `server/models/VendorReturn.js`
- Server Routes: `server/routes/vendorReturns.js`, `server/routes/grn.js`
- Database Config: `server/config/database.js`
- Frontend Page: `client/src/pages/inventory/CreateGRNPage.jsx`

**API Documentation:**
- GRN Endpoints: `/api/grn/*`
- Vendor Returns: `/api/vendor-returns/*`

---

**Last Updated:** January 2025  
**Maintained by:** Development Team