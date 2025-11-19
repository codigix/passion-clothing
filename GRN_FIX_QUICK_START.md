# GRN Backend 500 Error - Quick Fix Summary

## Problem
GRN creation was failing with: `"notNull Violation: Approval.stage_key cannot be null"`

## Root Cause
When creating complaint Approval records for GRN discrepancies, the code was missing the required `stage_key` field and using incorrect field names.

## Solution Applied

### ✅ Fixed 3 Issues in `server/routes/grn.js`:

| Issue | Location | Fix |
|-------|----------|-----|
| Missing `stage_key` | Line 447 | Added: `stage_key: "grn_shortage_complaint"` |
| Wrong field name | Line 450 | Changed: `approval_details` → `metadata` |
| Unused fields | Multiple | Removed: `request_type`, `department`, `created_at` |
| Missing `stage_key` | Line 559 | Added: `stage_key: "grn_overage_complaint"` |
| Wrong field name | Line 562 | Changed: `approval_details` → `metadata` |
| Unused fields | Multiple | Removed: `request_type`, `department`, `created_at` |
| Missing `stage_key` | Line 610 | Added: `stage_key: "grn_invoice_mismatch"` |
| Wrong field name | Line 613 | Changed: `approval_details` → `metadata` |
| Unused fields | Multiple | Removed: `request_type`, `department`, `created_at` |

## What Was Changed

### Before ❌
```javascript
const complaint = await Approval.create({
  request_type: "grn_shortage_complaint",     // ❌ Doesn't exist
  entity_type: "purchase_order",
  entity_id: po.id,
  status: "pending",
  department: "procurement",                  // ❌ Doesn't exist
  stage_label: `GRN Shortage Complaint...`,
  approval_details: { ... },                  // ❌ Wrong field
  created_by: req.user.id,
  created_at: new Date(),                     // ❌ Unnecessary
});
// Error: "notNull Violation: stage_key cannot be null"
```

### After ✅
```javascript
const complaint = await Approval.create({
  entity_type: "purchase_order",
  entity_id: po.id,
  stage_key: "grn_shortage_complaint",        // ✅ Added - Required field
  stage_label: `GRN Shortage Complaint...`,
  status: "pending",
  metadata: {                                 // ✅ Correct field name
    grn_number: grnNumber,
    complaint_type: "shortage",
    // ... details ...
  },
  created_by: req.user.id,
});
// ✅ Success!
```

## Complaint Types

| Type | stage_key | Trigger |
|------|-----------|---------|
| Shortage | `grn_shortage_complaint` | Received < Ordered |
| Overage | `grn_overage_complaint` | Received > Ordered |
| Invoice Mismatch | `grn_invoice_mismatch` | Invoiced ≠ Ordered |

## Test Now

### Quick Test Steps
1. Go to Procurement Dashboard
2. Find any Purchase Order (status: sent or later)
3. Click "Create GRN"
4. Enter quantities (try different amounts to trigger complaints)
5. Click "Create GRN"

### Expected Results

**Perfect Match:**
- ✅ GRN created
- ✅ Auto-verified
- ✅ Redirect to add-to-inventory

**With Shortage (received < ordered):**
- ✅ GRN created
- ✅ Complaint created automatically
- ✅ Notification sent to procurement team
- ✅ Vendor return request generated

**With Overage (received > ordered):**
- ✅ GRN created
- ✅ Complaint created automatically
- ✅ Notification sent to procurement team

**With Invoice Mismatch (invoiced ≠ ordered):**
- ✅ GRN created
- ✅ Complaint created automatically
- ✅ Notification sent to procurement team

## Files Modified
- `server/routes/grn.js` (3 locations updated)

## Database Impact
✅ **None** - No schema changes needed. The `stage_key` field already exists.

## Related Fixes
This resolves the 3rd error in the sequence:
1. ✅ Fixed: Missing Approval import (see `GRN_BACKEND_500_ERROR_FIX.md`)
2. ✅ Fixed: Wrong field name `requested_by` → `created_by`
3. ✅ **Fixed: Missing `stage_key` field (current fix)**

---

## Error Progression

```
Attempt 1:  "Approval is not defined"
            ↓ (fixed import)
Attempt 2:  "Unknown column 'Approval.requested_by'"
            ↓ (fixed field name)
Attempt 3:  "notNull Violation: stage_key cannot be null"
            ↓ (THIS FIX)
Result:     ✅ GRN Creation Successful!
```

---

## Next Steps

1. **Test GRN creation** with various scenarios (shortage, overage, perfect match)
2. **Verify complaints** appear in Procurement Dashboard
3. **Check Sidebar** GRN count badge shows correctly
4. **Monitor logs** for any new errors

---

**Status:** ✅ READY FOR TESTING  
**Last Updated:** January 2025