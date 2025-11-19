# GRN Hierarchy System - Quick Reference Card

## Current Issue (What You're Experiencing)

```
Error: "A GRN already exists for this Purchase Order. 
To create additional GRNs, the PO must be in 'reopened' status."

Current PO Status: grn_requested
```

## Quick Fix (3 Steps)

### Step 1: Check Status
```bash
curl -X GET http://localhost:3001/api/grn/diagnostics/:poId \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 2: Find & Approve Shortage Complaint
- Go to: **Procurement Dashboard → Pending Requests**
- Find: Approval with status = "pending" and stage_key = "grn_shortage_complaint"
- Action: Click **Approve**

### Step 3: Create Second GRN
```bash
GET /api/grn/create/:poId  # Get form with shortage items only
POST /api/grn/from-po/:poId # Submit the GRN
```

---

## Complete GRN Workflow

| Step | Action | PO Status Before | PO Status After |
|------|--------|------------------|-----------------|
| 1 | Create first GRN with all items | `grn_requested` | `received` OR `grn_shortage` |
| 2 | System auto-creates shortage complaint | `grn_shortage` | `grn_shortage` |
| 3 | Approve complaint in dashboard | `grn_shortage` | `reopened` ✓ |
| 4 | Create second GRN with shortage items | `reopened` | `received` OR `grn_shortage` |
| 5 | (Repeat if needed) OR Mark as completed | - | `completed` ✓ |

---

## Status Meanings

| Status | Meaning | What To Do |
|--------|---------|-----------|
| `grn_requested` | First GRN not yet created | Create 1st GRN |
| `received` | All items perfectly matched | Workflow complete ✓ |
| `grn_shortage` | Shortages detected, waiting approval | Approve complaint |
| `reopened` | Ready for 2nd+ GRN | Create next GRN |
| `completed` | All GRNs processed | Done ✓ |

---

## API Endpoints Cheat Sheet

### Check Status (Most Useful!)
```
GET /api/grn/diagnostics/:poId
```
Returns: Current workflow status, what to do next, any issues

### Get Form Data
```
GET /api/grn/create/:poId
```
Returns: All items if 1st GRN, only shortage items if 2nd+

### Create GRN
```
POST /api/grn/from-po/:poId
Body: { received_date, items_received, remarks, ... }
```
Returns: Success/failure with complaint details if shortages detected

### Approve Complaint
```
PATCH /api/approvals/:approvalId/approve
Body: { decision_note: "Approved" }
```
Side Effect: PO status automatically → "reopened"

### List Complaints
```
GET /api/approvals?stage_key=grn_shortage_complaint&status=pending
```
Returns: All pending shortage complaints waiting approval

---

## Common Errors & Fixes

### Error: "PO must be in 'reopened' status"
**Reason**: Shortage complaint not yet approved
**Fix**: 
1. Find complaint in Procurement Dashboard
2. Click Approve
3. Check PO status → should be "reopened"
4. Try again

### Error: "No items to receive"
**Reason**: Trying to create 1st GRN when items already received
**Fix**: Delete old test GRNs and reset PO (see cleanup script)

### Diagnostics says "Hierarchy issues detected"
**Reason**: Old test data with multiple GRNs marked as "first"
**Fix**: Use the SQL cleanup script to reset

---

## Test Data Cleanup

If stuck with bad test data:

### Option A: Auto-Fix Sequence Numbers
```sql
UPDATE goods_receipt_notes grn
SET grn_sequence = 1, is_first_grn = true
WHERE purchase_order_id = ? AND id = (
  SELECT MIN(id) FROM goods_receipt_notes 
  WHERE purchase_order_id = ?
);

UPDATE goods_receipt_notes grn
SET grn_sequence = 2, is_first_grn = false
WHERE purchase_order_id = ? AND id != (
  SELECT MIN(id) FROM goods_receipt_notes 
  WHERE purchase_order_id = ?
);

UPDATE purchase_orders 
SET status = 'grn_requested' 
WHERE id = ?;
```

### Option B: Complete Reset
```sql
DELETE FROM goods_receipt_notes WHERE purchase_order_id = ?;
DELETE FROM vendor_requests WHERE purchase_order_id = ?;
UPDATE purchase_orders SET status = 'grn_requested' WHERE id = ?;
```

See `GRN_DATA_CLEANUP.sql` for complete script

---

## Field Reference

### GRN Hierarchy Fields
- `is_first_grn`: true/false - Is this the 1st GRN for PO?
- `grn_sequence`: 1, 2, 3... - Which GRN is this?
- `original_grn_id`: ID of first GRN (for 2nd+ GRNs)

### Key Statuses
- **Purchase Order**: grn_requested → received / grn_shortage → reopened → completed
- **Approval**: pending → approved / rejected
- **Vendor Request**: pending → sent → acknowledged → in_transit → fulfilled

---

## Useful Links

- **Full Guide**: `GRN_HIERARCHY_WORKFLOW_GUIDE.md`
- **Database Cleanup**: `GRN_DATA_CLEANUP.sql`
- **Detailed Summary**: `GRN_FIXES_SUMMARY.md`

---

## Still Stuck? Debug Steps

1. **Get diagnostics**:
   ```
   GET /api/grn/diagnostics/1
   ```

2. **Check PO status**:
   ```
   SELECT id, po_number, status FROM purchase_orders WHERE id = 1;
   ```

3. **List all GRNs**:
   ```
   SELECT id, grn_number, grn_sequence, is_first_grn 
   FROM goods_receipt_notes WHERE purchase_order_id = 1;
   ```

4. **Find pending complaints**:
   ```
   SELECT * FROM approvals 
   WHERE entity_id = 1 AND status = 'pending';
   ```

5. **Check VendorRequests**:
   ```
   SELECT * FROM vendor_requests 
   WHERE purchase_order_id = 1;
   ```

---

## Contact & Support

For issues:
1. Use `/api/grn/diagnostics/:poId` first
2. Check recommendations in diagnostics
3. Use cleanup script if needed
4. Review full documentation in guide
