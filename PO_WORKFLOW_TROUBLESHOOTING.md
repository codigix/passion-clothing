# PO Approval Workflow - Troubleshooting Guide

## Prerequisites Checklist

Before the workflow will work, verify these requirements:

### 1. **Database Migration Applied** ✓
```bash
npm run migrate
# or
node server/scripts/runAuditTrailMigration.js
```

Check if table exists:
```sql
SELECT * FROM audit_trails LIMIT 1;
```

### 2. **Finance Department User Exists** ✓

Query to check:
```sql
SELECT id, name, email, department, status 
FROM users 
WHERE department = 'finance' AND status = 'active';
```

**If no finance users exist:**
- Create a finance user via the system UI, or
- Run this query:
```sql
INSERT INTO users (employee_id, name, email, password, department, status, created_at, updated_at)
VALUES ('FIN001', 'Finance Manager', 'finance@company.com', 'hashed_password_here', 'finance', 'active', NOW(), NOW());
```

### 3. **Database Models are Registered** ✓

Verify in `server/config/database.js`:
- ✓ AuditTrail is imported (line ~113)
- ✓ AuditTrail is exported in db object (line ~1089)

### 4. **Workflow Service is Properly Connected** ✓

Verify in `server/routes/procurement.js`:
- Line 2349: `const POApprovalWorkflowService = require("../utils/poApprovalWorkflowService");`
- Line 2397: `workflowResult = await POApprovalWorkflowService.executePOApprovalWorkflow(...)`

## Testing the Workflow

### Step 1: Create a Finance User

1. Open the system and login as Admin
2. Go to Admin → Users
3. Create new user with:
   - Department: **Finance**
   - Status: **Active**
   - Email: finance@company.com

### Step 2: Create a PO

1. Go to Procurement → Create Purchase Order
2. Fill in all required fields:
   - Vendor (required)
   - PO items with material details
   - Expected delivery date
3. Click **Create Purchase Order**
4. Status should be: **draft**

### Step 3: Submit for Approval

1. In the PO details page, click **Submit for Approval**
2. Add optional notes
3. Click **Submit**
4. Status should change to: **pending_approval**

### Step 4: Approve the PO (As Admin)

1. Login as Admin (if not already)
2. Go to Procurement → Purchase Orders
3. Filter by status: **pending_approval**
4. Click on the PO
5. Click **Approve PO**
6. Add optional notes
7. Click **Approve**

### Expected Results:

✓ PO status changes to **approved**  
✓ Invoice is created automatically  
✓ Finance department receives notification  
✓ Audit trail records the action  

## Debugging the Workflow

### Check Server Logs

When you approve a PO, look for these log messages:

```
[PO Workflow] ========== STARTING WORKFLOW FOR PO ID: 123 ==========
[Invoice Generation] Starting for PO ID: 123
[Invoice Generation] Found PO: PO-20251114-0001, Amount: 50000.00
[Invoice Generation] ✓ Invoice created: INV-20251114-1234
[Finance Notification] Starting for Invoice ID: 1, PO: PO-20251114-0001
[Finance Notification] Searching for finance users...
[Finance Notification] Found finance user: ID 5, Name: Finance Manager
[Finance Notification] Sending notification to user ID: 5
[Finance Notification] ✓ Notification sent: 15
[PO Workflow] ========== WORKFLOW COMPLETED SUCCESSFULLY ==========
```

### If Invoice Not Generated

**Error message:** `[Invoice Generation] Error generating invoice from PO:`

**Check:**
1. Does PO have `final_amount` value?
2. Is PO in 'pending_approval' status when queried?
3. Check database for PO details:
```sql
SELECT id, po_number, status, final_amount, vendor_id FROM purchase_orders WHERE po_number = 'PO-20251114-0001';
```

### If Finance Not Notified

**Error message:** `[Finance Notification] No active finance users found in the system`

**Check:**
1. Finance user exists in database:
```sql
SELECT * FROM users WHERE department = 'finance' AND status = 'active';
```

2. If finance user exists, check notification table:
```sql
SELECT * FROM notifications 
WHERE recipient_department = 'finance' 
ORDER BY created_at DESC 
LIMIT 1;
```

3. Check if notification was created but not delivered:
```sql
SELECT id, type, title, status, recipient_user_id 
FROM notifications 
WHERE trigger_event = 'invoice_generated_from_approved_po' 
ORDER BY created_at DESC 
LIMIT 1;
```

### If Audit Trail Not Created

**Check:**
1. Table exists and is accessible:
```sql
SELECT * FROM audit_trails LIMIT 1;
```

2. Check for audit entries for the PO:
```sql
SELECT * FROM audit_trails 
WHERE entity_type = 'purchase_order' 
AND entity_id = 123 
ORDER BY created_at DESC;
```

## Manual Test Script

Run the test script to verify all components:

```bash
node server/scripts/testPOApprovalWorkflow.js
```

Output should show:
```
=== Testing PO Approval Workflow ===

Step 1: Checking Finance Users...
Found 1 finance users: [{id: 5, name: 'Finance Manager', ...}]

Step 2: Checking Pending Approval POs...
Found 1 POs pending approval: [{id: 1, po_number: 'PO-20251114-0001', ...}]

Step 3: Testing Invoice Generation...
✓ Invoice generated successfully: {invoice_number: 'INV-20251114-1234', id: 1}

Step 4: Testing Finance Notification...
✓ Notification sent to finance: {id: 15, recipient: 5, title: '...'}

Step 5: Testing Audit Trail...
✓ Audit trail created: {id: 20, action: 'approved'}

=== Workflow Test Complete ===
```

## Common Issues & Solutions

### Issue: "Cannot approve. PO status is 'draft'. Must be in 'pending_approval' status."

**Solution:** PO must first be submitted for approval by procurement before admin can approve it.

```
Step: Submit for Approval (Procurement) → Submit
Status: pending_approval
THEN: Approve (Admin) → Approve
```

### Issue: Invoice created but Finance never received notification

**Causes:**
1. No active finance users (see prerequisites)
2. Finance user exists but status is 'inactive'
3. Notification service threw error silently

**Debug:**
```sql
-- Check if finance user is active
SELECT * FROM users WHERE department = 'finance';

-- Check if notification was created
SELECT * FROM notifications 
WHERE related_entity_type = 'invoice' 
ORDER BY created_at DESC LIMIT 5;
```

### Issue: PO approval succeeds but workflow returns error

**Check response:**
```json
{
  "workflow_result": {
    "success": false,
    "message": "PO approved, but invoice generation failed: ..."
  }
}
```

This means:
- PO was successfully approved ✓
- But workflow encountered an error ✗
- Check server logs for detailed error message
- Run test script to isolate the issue

### Issue: "AuditTrail is not defined" or similar model error

**Solution:** Restart the server

```bash
# Kill any running server
Ctrl+C

# Start fresh
npm start
```

If error persists:
1. Verify AuditTrail is in `server/config/database.js`
2. Run migration again
3. Check database for audit_trails table

## Monitoring the Workflow

### Check Workflow Execution

```sql
-- View all PO approvals
SELECT 
  a.id,
  a.entity_id,
  a.action,
  a.status_before,
  a.status_after,
  a.performed_by,
  a.reason,
  a.created_at
FROM audit_trails a
WHERE a.entity_type = 'purchase_order' 
AND a.action = 'approved'
ORDER BY a.created_at DESC;
```

### Check Invoice Generation

```sql
-- View invoices generated from POs
SELECT 
  i.id,
  i.invoice_number,
  i.purchase_order_id,
  i.vendor_id,
  i.total_amount,
  i.status,
  i.created_at
FROM invoices i
WHERE i.invoice_type = 'purchase'
ORDER BY i.created_at DESC;
```

### Check Finance Notifications

```sql
-- View notifications sent to finance
SELECT 
  n.id,
  n.title,
  n.message,
  n.recipient_user_id,
  n.status,
  n.created_at
FROM notifications n
WHERE n.trigger_event = 'invoice_generated_from_approved_po'
ORDER BY n.created_at DESC;
```

## Performance & Logs

### Enable Detailed Logging

The workflow now includes comprehensive logging. Check your server console for:

1. **Workflow Start:** `[PO Workflow] ========== STARTING WORKFLOW FOR PO ID: XXX ==========`
2. **Invoice Generation:** `[Invoice Generation] ✓ Invoice created: INV-XXXXXXX`
3. **Finance Notification:** `[Finance Notification] ✓ Notification sent: XXX`
4. **Completion:** `[PO Workflow] ========== WORKFLOW COMPLETED SUCCESSFULLY ==========`

### Expected Execution Time

- Invoice Generation: ~100-200ms
- Finance Notification: ~50-100ms
- Audit Trail: ~50-100ms
- **Total:** ~200-400ms

If taking longer, check:
- Database query performance
- Server load
- Network latency to database

## Support Commands

### Reset Workflow for Testing

To test workflow multiple times, you can:

1. **Revert PO to draft:**
```sql
UPDATE purchase_orders 
SET status = 'draft', 
    approval_status = 'not_requested',
    approved_by = NULL,
    approved_date = NULL
WHERE po_number = 'PO-20251114-0001';
```

2. **Delete generated invoice:**
```sql
DELETE FROM invoices 
WHERE purchase_order_id = (SELECT id FROM purchase_orders WHERE po_number = 'PO-20251114-0001');
```

3. **Clear notifications:**
```sql
DELETE FROM notifications 
WHERE trigger_event = 'invoice_generated_from_approved_po';
```

4. **Clear audit trail:**
```sql
DELETE FROM audit_trails 
WHERE entity_type = 'purchase_order' AND entity_id = (SELECT id FROM purchase_orders WHERE po_number = 'PO-20251114-0001');
```

## Verification Checklist

- [ ] Audit trail table exists in database
- [ ] AuditTrail model is imported in database.js
- [ ] AuditTrail is exported in db object
- [ ] Finance user exists with department='finance' and status='active'
- [ ] Workflow service has detailed logging
- [ ] Server can start without errors
- [ ] Test script runs successfully
- [ ] PO can be approved without errors
- [ ] Invoice is created in database
- [ ] Notification is sent to finance user
- [ ] Audit trail record is created
- [ ] Finance user receives notification in UI

## Next Steps

Once the workflow is verified working:

1. **Setup Email Integration** (Optional)
   - Send invoice PDF to finance via email
   - Email reminders for pending payments

2. **Add Payment Processing** (Future)
   - Finance team marks invoice as paid
   - Payment record created
   - Audit trail updated

3. **Create Reporting** (Future)
   - PO approval turnaround time
   - Payment processing KPIs
   - Audit compliance reports
