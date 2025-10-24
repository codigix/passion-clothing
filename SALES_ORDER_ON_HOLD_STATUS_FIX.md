# Sales Order On-Hold Status Fix

## 🐛 Issue
**Error:** `Data truncated for column 'status' at row 1`

When attempting to pause a production order, the system threw a database error:
```
UPDATE `sales_orders` SET `status`=?,`updated_at`=? WHERE `id` = ?
Parameters: [ 'on_hold', '2025-10-18 07:26:25', 2 ]
Error: Data truncated for column 'status' at row 1
```

## 🔍 Root Cause
The `sales_orders` table's `status` column was defined as an ENUM with these values:
```
'draft', 'confirmed', 'bom_generated', 'procurement_created', 'materials_received', 
'in_production', 'cutting_completed', 'printing_completed', 'stitching_completed', 
'finishing_completed', 'qc_passed', 'ready_to_ship', 'shipped', 'delivered', 
'completed', 'cancelled'
```

However, when a **production order is paused**, the system tries to set the linked sales order's status to `'on_hold'`, which was **missing from the ENUM**.

### Status Flow
1. Production order paused → status becomes `'on_hold'` ✓ (ProductionOrder model has this)
2. System calls `updateLinkedSalesOrder()` to sync status
3. Attempts to update SalesOrder.status to `'on_hold'` ✗ (Not in ENUM)
4. Database rejects the invalid ENUM value → Error

## ✅ Solution

### 1. Updated Model
**File:** `server/models/SalesOrder.js`

Added `'on_hold'` to the status ENUM:
```javascript
status: {
  type: DataTypes.ENUM(
    'draft', 'confirmed', 'bom_generated', 'procurement_created', 
    'materials_received', 'in_production', 'on_hold', 'cutting_completed', 
    'printing_completed', 'stitching_completed', 'finishing_completed', 
    'qc_passed', 'ready_to_ship', 'shipped', 'delivered', 'completed', 'cancelled'
  ),
  defaultValue: 'draft'
}
```

### 2. Database Migration
**File:** `migrations/add-on-hold-status-to-sales-orders.js`

Ran migration to update the MySQL ENUM column:
```sql
ALTER TABLE sales_orders 
MODIFY COLUMN status ENUM(
  'draft', 'confirmed', 'bom_generated', 'procurement_created', 
  'materials_received', 'in_production', 'on_hold', 'cutting_completed', 
  'printing_completed', 'stitching_completed', 'finishing_completed', 
  'qc_passed', 'ready_to_ship', 'shipped', 'delivered', 'completed', 'cancelled'
) DEFAULT 'draft'
```

**Migration Status:** ✅ Applied successfully

## 📋 Changes Summary

| Component | Change | Details |
|-----------|--------|---------|
| **SalesOrder Model** | Added ENUM value | `'on_hold'` added to status field |
| **Database Schema** | Updated ENUM | Modified sales_orders.status column |
| **Migration** | Created & Applied | `add-on-hold-status-to-sales-orders.js` |

## 🧪 Testing

To verify the fix works:

1. **Navigate to:** Manufacturing → Production Tracking
2. **Find a production order** in "in_progress" status
3. **Click the pause button** on any order
4. **Expected result:** Order pauses successfully without 500 error
5. **Verify:** Both ProductionOrder and SalesOrder show 'on_hold' status

### Test Cases
- ✅ Pause production order (status → 'on_hold')
- ✅ Resume production order (status → 'in_progress')
- ✅ View production tracking dashboard
- ✅ Check sales order status updates correctly

## 🔗 Related Code

### updateLinkedSalesOrder() Function
**Location:** `server/routes/manufacturing.js:109`

```javascript
const updateLinkedSalesOrder = async (productionOrder, newStatus, userId, transaction) => {
  if (!productionOrder?.sales_order_id) return;
  
  const salesOrder = await SalesOrder.findByPk(productionOrder.sales_order_id, { transaction });
  if (!salesOrder) return;
  
  const derivedStatus = newStatus === 'cancelled' ? 'cancelled' : deriveOrderStatusFromStage(null, newStatus);
  await salesOrder.update({ status: derivedStatus }, { transaction });
  // ... update QR code and history
};
```

### Affected Endpoints
- `POST /api/manufacturing/orders/:id/pause` - Pause production order
- `POST /api/manufacturing/orders/:id/resume` - Resume production order
- `POST /api/manufacturing/orders/:id/complete` - Complete production order

## 📊 Impact

**Severity:** High - Blocked pause functionality  
**Scope:** Production pausing workflow  
**Fix Complexity:** Low - Single ENUM addition  
**Rollback:** Reversible via migration down

## 🚀 Deployment Notes

1. Deploy updated `SalesOrder.js` model
2. Run migration: `migrations/add-on-hold-status-to-sales-orders.js`
3. Restart server
4. Test pause/resume workflow
5. No data migration needed (existing records unaffected)

## 📝 References

- Production Order Model: `server/models/ProductionOrder.js`
- SalesOrder Model: `server/models/SalesOrder.js`
- Manufacturing Routes: `server/routes/manufacturing.js`
- Error Log: Occurred on `/api/manufacturing/orders/24/pause` endpoint

---

**Status:** ✅ RESOLVED  
**Date Fixed:** 2025-01-18  
**Tested:** Yes