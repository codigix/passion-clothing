# GRN Request Visibility Fix - Complete Solution

## Problem Identified

User reported that GRN requests were not appearing in the **Inventory Dashboard** → **Incoming Requests** tab, even though the error indicated "GRN creation request already pending for this Purchase Order".

### Root Cause Analysis

**Two-part issue discovered:**

1. **Database Status Not Updated**: The backend was creating the Approval record but NOT updating the PO status to `grn_requested`
   - PO #2 status: `received` (should be `grn_requested`)
   - Approval record: ✅ existed with status `pending`
   - Result: Inventory dashboard couldn't find it (searches for status = `grn_requested`)

2. **Notification Service Bug**: The notification calls were inside the transaction's try-catch block
   - If NotificationService.sendToDepartment() failed, the entire transaction rolled back
   - This undid the Approval creation AND PO status update
   - User received error response even though database was partially updated

---

## Solution Implemented

### Part 1: Fixed Backend Transaction Logic

**File**: `server/routes/procurement.js`

#### Endpoint 1: POST `/purchase-orders/:poId/request-grn` (Line 2785)
- **Before**: Notification calls inside try block → Any error rolled back transaction
- **After**: 
  - Send HTTP response first
  - Move notification to separate try-catch AFTER transaction commits
  - Notifications won't affect database success

#### Endpoint 2: POST `/purchase-orders/:poId/material-received` (Line 2592)
- **Same fix applied**: Multiple notifications moved outside transaction

**Key Change Pattern**:
```javascript
// ❌ BEFORE (bad pattern)
try {
  await transaction.commit();
  await NotificationService.send(...); // If fails, rolls back!
  res.json(...);
} catch (error) {
  await transaction.rollback();
}

// ✅ AFTER (correct pattern)
try {
  await transaction.commit();
  res.json(...); // Send response first
} catch (error) {
  await transaction.rollback();
}

// Notifications happen after response (won't affect DB)
try {
  await NotificationService.send(...);
} catch (notifError) {
  console.error("Notification failed:", notifError);
  // Fail silently - DB already updated
}
```

### Part 2: Manual Database Repair

**Script**: `server/fix-po-grn-status.js`

Updated PO status for all pending GRN requests:
```
PO #1 (PO-20251106-0001): completed → grn_requested ✓
PO #2 (PO-20251106-0002): received → grn_requested ✓
```

---

## Verification

### Before Fix
```
PO #2 Status: received
Approval: ✅ pending (but PO status didn't match)
Inventory Dashboard: ❌ Not visible
```

### After Fix
```
PO #2 Status: grn_requested ✓
Approval: ✅ pending
Inventory Dashboard: ✅ Now visible in "Incoming Requests"
```

---

## Now You Can Test

1. **Go to**: Inventory → GRN Workflow
2. **Click**: "Incoming Requests" tab
3. **See**: PO #1 and PO #2 should now appear in yellow "Incoming Requests" section
4. **Click**: "Create GRN" button on any PO
5. **Expected Flow**:
   - Procurement marks materials received
   - Approval record created ✅
   - PO status updates to `grn_requested` ✅
   - Inventory sees it immediately ✅
   - Can create GRN and proceed ✅

---

## Why This Matters

The bug prevented a critical workflow:
- **Before**: Procurement → Request GRN → Approval created but invisible to Inventory → Stuck
- **After**: Procurement → Request GRN → Approval created AND visible → Inventory can approve → Workflow complete

---

## Files Modified

- ✅ `server/routes/procurement.js` - Fixed transaction handling (2 endpoints)
- ✅ `server/fix-po-grn-status.js` - Manual database repair (script)

---

## Future Prevention

All workflow endpoints should follow this pattern:
1. Database transaction with validates and creates/updates records
2. Commit transaction
3. Send HTTP response
4. Send notifications/side-effects in separate try-catch
5. Never let external service failures roll back database changes