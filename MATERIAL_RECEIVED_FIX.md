# Material Received Endpoint - Idempotent Fix

## Problem

When users tried to mark materials as received via the `POST /api/procurement/purchase-orders/:poId/material-received` endpoint:

1. **First scenario**: Endpoint was called once and worked fine (materials marked received, GRN request created)
2. **Second call (retry)**: Same endpoint returned `400 Bad Request` with message "Materials already marked as received for this Purchase Order"
3. **Result**: 
   - PO status remained "send_to_vendor" (not updated to "received")
   - GRN request didn't appear in Inventory Dashboard
   - Users couldn't proceed with GRN creation workflow

## Root Cause

The endpoint had a strict check at line 2753:
```javascript
if (po.received_at) {
  return res.status(400).json({
    message: "Materials already marked as received for this Purchase Order"
  });
}
```

This prevented **idempotent** behavior - if the endpoint was called twice (intentionally or due to retry logic), it would fail on the second call.

## Solution Implemented

**File**: `server/routes/procurement.js` (lines 2744-2852)

### Changes Made

1. **Allow "received" status as valid input** (line 2745)
   ```javascript
   // Before: ["sent", "acknowledged"]
   // After: ["sent", "acknowledged", "received"]
   ```
   - Enables calling the endpoint even after materials are marked received

2. **Smart duplicate detection** (lines 2753-2778)
   - If materials are already marked received, check if GRN request/GRN exists
   - Only fail if both conditions met: `received_at` is set AND approval/GRN already exists
   - Otherwise, proceed with creation

3. **Conditional PO status update** (lines 2782-2795)
   - Only update `status` and `received_at` if not already set
   - Prevents unnecessary database operations on retries

4. **Idempotent approval creation** (lines 2804-2852)
   - Check if approval request already exists for this PO
   - Reuse existing approval instead of creating duplicate
   - Only update PO status to "grn_requested" if new approval created

5. **Clear response messaging** (line 2858-2860)
   - Indicates whether this is a new request or existing one
   - Helps users understand the workflow state

## Key Workflow

```
User clicks "Mark Materials Received"
↓
Endpoint checks PO status (sent/acknowledged/received) ✓
↓
Endpoint checks if materials already marked received
  ├─ If NO: Updates PO status → Creates approval request → Success
  └─ If YES: 
      ├─ Checks if GRN/approval exists
      ├─ If YES: Returns existing approval → Success (idempotent)
      └─ If NO: Creates approval request → Success
↓
PO status becomes "grn_requested"
↓
GRN creation request appears in Inventory Dashboard
↓
Inventory team can now create GRN
```

## Testing

Run the test to verify the fix:
```bash
node test-material-received-idempotent.js
```

Expected output:
- ✅ PO found with `received_at` already set
- ✅ Existing GRN and approval request detected
- ✅ Endpoint would now return 200 instead of 400

## Benefits

1. **Idempotent behavior**: Safe to call multiple times
2. **Better error recovery**: If first call partially fails, retry works
3. **User experience**: No more confusing 400 errors
4. **Workflow continuation**: GRN request properly created and visible in dashboard
5. **Data integrity**: Prevents duplicate approval requests

## Backward Compatibility

✅ **Fully backward compatible**
- Existing workflows continue to work
- No database schema changes
- Handles old POs already in "received" status
- No breaking changes to API response

## Related Endpoints

- `GET /api/procurement/purchase-orders/:poId` - Verify PO status
- `POST /api/grn/from-po/:poId` - Create GRN from PO
- `GET /api/inventory/incoming-requests` - View GRN requests in dashboard

## Future Improvements

1. Add webhook notifications when GRN request is created
2. Implement exponential backoff for automatic retries
3. Add metrics tracking for endpoint retry patterns
