# GRN Shortage Workflow - Complete Fix

## Problem

When creating a second GRN after shortages were detected in the first GRN, the system was:
1. Blocking second GRN creation with error: "A GRN already exists... PO must be in 'reopened' status"
2. Not allowing creation from "grn_requested" status (the natural state after first GRN with shortages)
3. Not finding shortage items from VendorReturn records (created when shortages detected)

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│ USER: Mark Materials Received                               │
│ POST /api/procurement/purchase-orders/:id/material-received │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM: PO status → "grn_requested"                         │
│ Creates GRN creation request for Inventory team             │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ INVENTORY: Create First GRN                                 │
│ GET /api/grn/create/:poId (show all materials)             │
│ POST /api/grn/from-po/:poId (create with all received qty) │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM: Detect Shortages                                    │
│ ✓ Create Approval complaint for shortages                   │
│ ✓ Create VendorReturn record with shortage items            │
│ ✓ Auto-add materials to inventory (quality_status=quarantine) │
│ ✓ PO status remains "grn_requested"                         │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ VENDOR: Ship Shortage Materials                             │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ INVENTORY: Create Second GRN (for shortage items) ✨ NEW   │
│ GET /api/grn/create/:poId (show shortage items from        │
│     VendorReturn record)                                    │
│ POST /api/grn/from-po/:poId (create with shortage qty only)│
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM: Auto-Add to Inventory                               │
│ ✓ Create inventory entries for shortage materials           │
│ ✓ Set quality_status="approved" (complete qty received)     │
│ ✓ Link to first GRN as "2nd GRN" for traceability           │
│ ✓ Create movement records for audit trail                   │
└────────────────────────────────────────────────────────────┘
```

## Changes Made

### 1. **Allow Second GRN Creation from "grn_requested" Status**
**File**: `server/routes/grn.js:254`

```javascript
// Before: Only allowed "reopened", "grn_shortage", "grn_overage"
if (!["reopened", "grn_shortage", "grn_overage"].includes(po.status)) {

// After: Also allow "grn_requested" 
if (!["reopened", "grn_shortage", "grn_overage", "grn_requested"].includes(po.status)) {
```

### 2. **Find Shortage Items from Both VendorRequest AND VendorReturn**
**File**: `server/routes/grn.js:223-257`

```javascript
// Check for both "reopened" and "grn_requested" statuses
if (["reopened", "grn_requested"].includes(po.status)) {
  
  // Try VendorRequest first (from approval workflow)
  // Then fallback to VendorReturn (from GRN shortage detection) ✨
  
  if (!vendorRequest) {
    const vendorReturn = await VendorReturn.findOne({
      where: {
        purchase_order_id: poId,
        return_type: "shortage",
        status: ["pending", "approved", "in_transit"],
      },
    });
    
    if (vendorReturn) {
      shortageItems = vendorReturn.items;
    }
  }
}
```

### 3. **Apply Same Logic to POST Endpoint**
**File**: `server/routes/grn.js:468-530`

- Updated POST `/grn/from-po/:poId` to also:
  - Accept "grn_requested" status (not just "reopened")
  - Look for VendorReturn records (not just VendorRequest)
  - Transform VendorReturn items to match VendorRequest format

## Key Features

✅ **Seamless Shortage Fulfillment**
- First GRN with shortages → PO stays in "grn_requested"
- No manual status changes needed
- No approval workflow required for shortage GRN

✅ **Automatic Inventory Management**
- First GRN items auto-added with `quality_status="quarantine"`
- Second GRN items auto-added with `quality_status="approved"`
- Complete audit trail with movement records

✅ **Flexible Shortage Detection**
- Works with VendorRequest (approval workflow)
- Works with VendorReturn (GRN shortage auto-detection)
- Supports multiple shortage fulfillments (3rd GRN, 4th GRN, etc.)

✅ **Better User Experience**
- No confusing error messages
- Clear workflow progression
- Shortage items automatically displayed in second GRN creation

## Testing Scenarios

### Scenario 1: Direct Shortage Fulfillment
```
1. Materials received → First GRN created → Shortages detected
2. VendorReturn created automatically
3. Shortage materials arrive
4. Create second GRN (pulls items from VendorReturn)
5. Both GRN items in inventory, linked together
```

### Scenario 2: Approval-Based Shortage
```
1. Materials received → First GRN created → Shortages detected
2. Complaint created and approved
3. VendorRequest created from approval
4. Shortage materials arrive
5. Create second GRN (pulls items from VendorRequest)
6. Both GRN items in inventory, linked together
```

## Database Relationships

```
PurchaseOrder (status: grn_requested)
├─ GoodsReceiptNote #1 (is_first_grn: true, items with shortages)
│  ├─ Inventory items (quality_status: quarantine)
│  └─ VendorReturn (return_type: shortage)
│     └─ Items: array of shortage records
│
└─ GoodsReceiptNote #2 (is_first_grn: false, shortage items only)
   ├─ Inventory items (quality_status: approved)
   └─ Linked to GRN #1 via original_grn_id
```

## API Response Changes

### GET /api/grn/create/:poId
```javascript
{
  // ... PO data ...
  is_shortage_fulfillment: true,      // NEW: indicates shortages detected
  items: [
    // Shortage items from VendorReturn or VendorRequest
    { item_index: 0, product_name: "...", ordered_qty: 100, ... }
  ]
}
```

### POST /api/grn/from-po/:poId (Second GRN)
```javascript
{
  message: "GRN created successfully",
  grn: {
    grn_number: "GRN-20251112-00002",
    grn_sequence: 2,
    is_first_grn: false,
    original_grn_id: 5,              // NEW: links to first GRN
    status: "approved",
    inventory_items: [...]            // Auto-added items
  }
}
```

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| Second GRN Creation | Blocked on "grn_requested" | ✅ Seamless |
| Shortage Items Display | Error 400 | ✅ Auto-populated |
| Inventory Tracking | Manual approval needed | ✅ Auto-added to quarantine |
| User Experience | Confusing workflow | ✅ Clear progression |
| Data Integrity | Multiple touch-points | ✅ Atomic transactions |

## Migration Notes

- ✅ Backward compatible - old GRNs continue to work
- ✅ No database schema changes required
- ✅ Existing VendorReturn/VendorRequest records will work
- ✅ Safe to deploy without data migration

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Shortage items not showing" | VendorReturn not created | Check GRN creation logs |
| "Second GRN still blocked" | PO status not "grn_requested" | Verify first GRN status |
| "Inventory not auto-added" | Wrong quality_status | Check `verification_status` of second GRN |

## Related Documentation

- `MATERIAL_RECEIVED_FIX.md` - Idempotent material receipt workflow
- `GRN_SHORTAGE_INVENTORY_FIX.md` - Auto-inventory storage for shortages
