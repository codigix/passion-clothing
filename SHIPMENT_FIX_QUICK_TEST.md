# Shipment Status & Courier Agent Fix - Quick Test Guide

## What Was Fixed

✅ **Invalid Status Error** - Frontend now sends valid status values (`'shipped'`, `'in_transit'`, etc.)
✅ **Status Transitions** - Shipments created with `'ready_to_ship'` status, enabling proper workflow
✅ **Foreign Key Constraints** - `courier_partner_id` properly set to null
✅ **Courier Agent Assignment** - Agents are correctly captured during dispatch

---

## Step-by-Step Testing

### Test 1: Create Shipment
1. Navigate to Shipment > Dispatch page
2. Click "Create Shipment" or navigate to a sales order
3. Fill in required fields:
   - Customer/Recipient details
   - Shipping address
   - Delivery date
   - Expected delivery date
4. **Expected Result**: Shipment created with status `'ready_to_ship'`
5. **Verify in Console**: Check Network tab > POST `/api/shipments` response
   ```json
   {
     "shipment": {
       "id": 1,
       "status": "ready_to_ship",  ← Should be this
       "shipment_number": "SHP-20250120-0001"
     }
   }
   ```

### Test 2: Dispatch Single Shipment
1. In Shipment Dispatch page, locate a shipment with status `'ready_to_ship'`
2. Click the **"Dispatch"** button on the shipment card
3. Fill the dispatch form:
   - **Courier Agent**: Select from dropdown (should show "Name (Company)")
   - **Tracking Number**: Enter or use auto-generated
   - **Location**: Warehouse (pre-filled)
4. Click **"Dispatch Now"**
5. **Expected Result**:
   - No "Data truncated" error
   - No "Data truncated for column 'status'" error
   - Success toast: "✓ Shipment dispatched successfully"
   - Shipment status changes to `'shipped'`
6. **Verify in Console**: Network tab > POST `/api/shipments/{id}/status`
   ```json
   {
     "status": "shipped",  ← Should be 'shipped', not 'dispatched'
     "courier_agent_id": 5,
     "tracking_number": "TRK-XYZ123"
   }
   ```

### Test 3: Verify Courier Agent Assignment
1. After dispatch, open the shipment details
2. Look for **Courier Agent** field
3. **Expected Result**: Should show the selected courier agent name and company
4. **Database Check** (optional):
   ```sql
   SELECT id, shipment_number, status, courier_agent_id, courier_partner_id 
   FROM shipments 
   WHERE id = [shipment_id];
   ```
   - `courier_agent_id` should have the agent ID
   - `courier_partner_id` should be NULL

### Test 4: Multiple Status Transitions
1. Dispatch a shipment (ready_to_ship → shipped) ✓
2. Click the shipment again, dispatch button should change
3. Click dispatch again to transition shipped → in_transit
4. **Expected Result**: Each transition should work without errors

### Test 5: Bulk Dispatch
1. Select multiple shipments (grid view, use checkboxes)
2. Click "Bulk Dispatch" button
3. **Expected Result**:
   - All selected shipments updated
   - Each transitions to correct status based on current state
   - No errors in console

---

## Error Scenarios to Verify Are Fixed

### ❌ NO LONGER OCCURS: "Data truncated for column 'status'"
- **Previously**: Frontend sent `status: 'dispatched'` (invalid ENUM value)
- **Now**: Frontend sends `status: 'shipped'` (valid ENUM value)

### ❌ NO LONGER OCCURS: "Cannot add or update child row: foreign key constraint"
- **Previously**: `courier_partner_id` was undefined
- **Now**: `courier_partner_id` is explicitly set to `null`

### ❌ NO LONGER OCCURS: "Invalid status transition"
- **Previously**: Tried to go from 'preparing' → 'shipped' (skipped states)
- **Now**: Goes from 'ready_to_ship' → 'shipped' (valid transition)

---

## Console Checks

### Check 1: Network Request Body
Open DevTools > Network > Post to `/api/shipments/{id}/status`

**Before (WRONG)**:
```json
{
  "status": "dispatched",  ← ❌ NOT IN ENUM
  "notes": "Dispatch",
  "tracking_number": "TRK-123"
}
```

**After (CORRECT)**:
```json
{
  "status": "shipped",  ← ✅ Valid ENUM value
  "notes": "Bulk dispatch",
  "tracking_number": "TRK-123",
  "courier_agent_id": 5
}
```

### Check 2: Shipment Status in Response
**Expected**:
```json
{
  "id": 1,
  "shipment_number": "SHP-20250120-0001",
  "status": "shipped",  ← ✅ Check it matches request
  "courier_agent": {
    "id": 5,
    "name": "John Doe",
    "company_name": "Express Logistics"
  },
  "courier_partner": null,  ← ✅ Should be null
  "tracking_number": "TRK-XYZ123"
}
```

### Check 3: Database Direct Query
```sql
-- Check shipment creation status
SELECT 
  shipment_number,
  status,
  courier_agent_id,
  courier_partner_id,
  created_at
FROM shipments
ORDER BY created_at DESC
LIMIT 1;

-- Expected columns:
-- status = 'ready_to_ship' (initially)
-- courier_agent_id = [agent_id] (if assigned)
-- courier_partner_id = NULL (always null for new shipments)
```

---

## Common Issues & Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Data truncated for column 'status'" | Status value not in ENUM | Verify frontend sends: `'shipped'`, `'in_transit'`, `'out_for_delivery'`, `'delivered'` |
| Foreign key constraint error | courier_partner_id is undefined | Backend now sets `courier_partner_id: null` explicitly |
| Courier Agent not loading | Agents not fetched | Check `/api/courier-agents` endpoint returns agents |
| "Invalid status transition" | Shipment status not 'ready_to_ship' | Recreate shipment - new ones start with 'ready_to_ship' |
| Dispatch button disabled | Missing courier agent | Select an agent from dropdown (required field) |

---

## Success Criteria

✅ All of the following should be true after testing:

- [ ] Shipments created with status `'ready_to_ship'`
- [ ] Dispatch button transitions to `'shipped'` without errors
- [ ] No "Data truncated" error messages
- [ ] No foreign key constraint violations
- [ ] Courier agents displayed and assigned correctly
- [ ] Status transitions follow: `ready_to_ship` → `shipped` → `in_transit` → `out_for_delivery` → `delivered`
- [ ] Bulk dispatch works with multiple shipments
- [ ] Console has no JavaScript errors
- [ ] Network requests show correct payload structure

---

## Rollback (If Needed)

If you need to revert these changes:

1. In `server/routes/shipments.js`:
   - Change status back to `'preparing'` in all three create endpoints
   - Change tracking entry status back to `'preparing'`

2. In `client/src/pages/shipment/ShipmentDispatchPage.jsx`:
   - Change `status: 'dispatched'` back in dispatch handlers

**NOT RECOMMENDED** - The current fix aligns with proper database schema and business logic.

---

## Additional Notes

- Shipments are now created **ready for immediate dispatch** (status `'ready_to_ship'`)
- This matches the user workflow: create shipment → dispatch with courier agent → track delivery
- Intermediate states (`'preparing'`, `'packed'`) are still supported for legacy shipments
- All status transitions are strictly validated by backend to prevent invalid states