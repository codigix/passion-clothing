# Purchase Order Approval & Finance Workflow

## Overview
This workflow automates the process when a Purchase Order (PO) is approved by an admin. The system automatically:
1. **Generates an Invoice** from the PO
2. **Sends it to Finance Department** for payment processing
3. **Creates an Audit Trail** for compliance and tracking

## Workflow Stages

```
┌─────────────────┐
│  PO Pending      │
│  Approval        │
└────────┬─────────┘
         │
         ↓ (Admin approves)
┌─────────────────┐
│  PO Approved    │
│  Status: ready  │
└────────┬─────────┘
         │
         ↓ (Auto-triggered)
┌─────────────────────────────┐
│ 1. Generate Invoice         │
│    (From PO details)        │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│ 2. Send to Finance Dept     │
│    (Notification to users)  │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│ 3. Create Audit Trail       │
│    (Track all changes)      │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│ Finance Department:         │
│ - Reviews Invoice           │
│ - Processes Payment         │
│ - Updates Payment Status    │
└─────────────────────────────┘
```

## Technical Implementation

### 1. Database Structure

#### Audit Trail Table (`audit_trails`)
```sql
- id: INTEGER (Primary Key)
- entity_type: ENUM (purchase_order, invoice, payment, grn, production_order)
- entity_id: INTEGER (Reference to the entity)
- action: ENUM (created, updated, approved, rejected, sent, payment_initiated, payment_completed, viewed)
- status_before: VARCHAR(100)
- status_after: VARCHAR(100)
- performed_by: INTEGER (Reference to users)
- department: ENUM (finance, procurement, inventory, etc.)
- reason: TEXT
- metadata: JSON (Additional information)
- created_at: DATETIME
- updated_at: DATETIME
```

### 2. Service: POApprovalWorkflowService

**Location:** `server/utils/poApprovalWorkflowService.js`

#### Key Methods:

##### `generateInvoiceFromPO(poId, approvedByUserId, reason)`
- Creates an invoice from approved PO
- Sets invoice status to 'draft' and payment_status to 'unpaid'
- Links invoice to PO via `purchase_order_id` foreign key
- Returns: Invoice object

##### `sendInvoiceToFinance(invoiceId, poNumber, vendorName, financeUserId)`
- Finds active Finance Department users
- Creates notification targeting Finance Department
- Notification includes action URL to invoice
- Returns: Notification object

##### `createAuditTrail(entityType, entityId, action, statusBefore, statusAfter, performedByUserId, department, reason, metadata)`
- Records all actions for compliance
- Stores before/after status for change tracking
- Captures metadata about related entities
- Returns: AuditTrail record

##### `executePOApprovalWorkflow(poId, approvedByUserId, approverName, approverDepartment, notes)`
- Orchestrates the complete workflow
- Calls all above methods in sequence
- Returns comprehensive result object with status, invoice, notification, and audit trail

### 3. API Endpoint Integration

**Endpoint:** `POST /api/procurement/pos/:id/approve`

**Requirements:**
- User must be from 'admin' department
- PO must be in 'pending_approval' status

**Request Body:**
```json
{
  "notes": "Approved for payment processing"
}
```

**Response:**
```json
{
  "message": "Purchase Order approved and sent to vendor successfully",
  "purchase_order": { /* PO details */ },
  "workflow_result": {
    "success": true,
    "po_number": "PO-20251114-0001",
    "invoice": { /* Invoice details */ },
    "notification": { /* Notification details */ },
    "audit_trail": { /* Audit record */ },
    "message": "PO [PO#] approved. Invoice INV-[#] generated and sent to Finance Department for payment processing."
  },
  "next_step": "await_delivery_then_create_grn",
  "workflow_info": "PO has been sent to vendor. Invoice generated and sent to Finance Department for payment processing. When materials arrive, create GRN for quality verification before adding to inventory."
}
```

## Workflow Steps in Detail

### Step 1: PO Submission for Approval
```
Procurement Manager → Submits PO for Admin Approval
Status: pending_approval
Approval Status: pending
```

### Step 2: Admin Approval
```
Admin → Reviews PO → Clicks Approve
┌─ PO Status → 'approved'
├─ Approval Status → 'approved'
├─ Approved By → Admin User ID
└─ Approved Date → Current DateTime
```

### Step 3: Automatic Invoice Generation
```
System → Extracts PO Data → Creates Invoice
┌─ Invoice Number: INV-YYYYMMDD-XXXX (auto-generated)
├─ Type: 'purchase'
├─ Vendor ID: From PO
├─ Items: From PO items array
├─ Amount: From PO final_amount
├─ Status: 'draft'
├─ Payment Status: 'unpaid'
└─ Reference: PO number
```

### Step 4: Finance Department Notification
```
System → Queries Finance Users → Creates Notification
┌─ Type: 'finance'
├─ Priority: 'high' (if PO is urgent/high priority)
├─ Recipient: All active Finance Department users
├─ Message: Invoice details with action link
├─ Action URL: /finance/invoices/{invoiceId}
└─ Metadata: PO#, Vendor name, Amount, Workflow stage
```

### Step 5: Audit Trail Recording
```
System → Records Complete Action
┌─ Entity Type: 'purchase_order'
├─ Entity ID: PO ID
├─ Action: 'approved'
├─ Status Before: 'pending_approval'
├─ Status After: 'approved'
├─ Performed By: Admin User ID
├─ Department: 'admin'
├─ Reason: Admin notes
└─ Metadata: 
    ├─ invoice_id
    ├─ invoice_number
    ├─ notification_id
    └─ vendor_name
```

## Finance Department Actions

Once the Finance Department receives the notification:

1. **Review Invoice**
   - Check invoice details
   - Verify amounts match PO
   - Review payment terms

2. **Create Payment** (Via Finance Module)
   - Process payment to vendor
   - Update Invoice payment_status
   - Create payment record with audit trail

3. **Mark as Paid**
   - Invoice status → 'paid'
   - Payment status → 'paid'
   - Create payment completion audit entry

## Data Relationships

```
┌─────────────────┐
│ Purchase Order  │
│      (PO)       │
└────────┬────────┘
         │ 1:1 (via purchase_order_id)
         │
    ┌────↓───────┐
    │  Invoice   │
    │  (INV)     │
    └────┬───────┘
         │ 1:1 (via invoice_id)
         │
    ┌────↓───────────────┐
    │  Payment Record    │
    │  (Payment)         │
    └─────────────────────┘

Audit Trail tracks all changes:
  PO → approved  [Audit Entry 1]
  INV → created  [Audit Entry 2]
  INV → sent     [Audit Entry 3]
  Payment → created [Audit Entry 4]
```

## Notifications

### Procurement Department (Existing)
- **Title:** ✅ PO [PO#] Approved - Ready to Send to Vendor
- **Message:** Procurement can now send PO to vendor
- **Action:** Navigate to PO details

### Inventory Department (Existing)
- **Title:** 📦 Prepare for Material Receipt - PO [PO#]
- **Message:** Prepare for GRN creation
- **Action:** Navigate to PO details

### Finance Department (New)
- **Title:** 💰 New Invoice for PO [PO#]
- **Message:** Invoice ready for payment processing - Vendor: [Name]
- **Action:** Navigate to invoice details
- **Priority:** High (if PO is urgent/high priority)

## Audit Trail Queries

### View All PO Approvals
```sql
SELECT * FROM audit_trails 
WHERE entity_type = 'purchase_order' 
AND action = 'approved'
ORDER BY created_at DESC;
```

### View Invoice Generation from PO
```sql
SELECT * FROM audit_trails 
WHERE entity_type = 'purchase_order' 
AND action = 'approved'
AND metadata LIKE '%invoice%'
ORDER BY created_at DESC;
```

### View Finance Department Payment Actions
```sql
SELECT * FROM audit_trails 
WHERE department = 'finance'
AND action IN ('payment_initiated', 'payment_completed')
ORDER BY created_at DESC;
```

### Trace Complete Flow for a PO
```sql
SELECT * FROM audit_trails 
WHERE entity_type = 'purchase_order' 
AND entity_id = {po_id}
ORDER BY created_at ASC;
```

## Error Handling

### Graceful Workflow Failure
If invoice generation fails:
- PO is still marked as approved (critical operation successful)
- Error is logged in console
- Audit trail records the approval with error metadata
- Response includes warning message to admin
- Finance notification may be delayed/manual

### Retry Mechanism
If notification to Finance fails:
- System logs the error
- Admin can manually trigger notification via UI (future feature)
- Audit trail captures all attempts

## Security & Compliance

1. **Role-Based Access**
   - Only Admin can approve POs
   - Only Finance can process payments
   - Procurement manages vendor communication

2. **Audit Trail Immutability**
   - All actions permanently recorded
   - Cannot be modified or deleted
   - Tracks who, what, when, and why

3. **Department Separation**
   - Procurement creates PO
   - Admin approves PO
   - Finance processes payment
   - Inventory manages materials

4. **Data Integrity**
   - Transaction-based PO update
   - Foreign key relationships enforced
   - Validation at each step

## Migration & Setup

1. **Run Migration:**
   ```bash
   npm run migrate
   # or
   node server/scripts/runAuditTrailMigration.js
   ```

2. **Verify Table Creation:**
   ```bash
   SELECT * FROM audit_trails LIMIT 1;
   ```

3. **Test Workflow:**
   - Create a draft PO
   - Submit for approval
   - Approve as Admin
   - Check Finance notifications
   - Verify audit trail record

## Future Enhancements

1. **Email Integration**
   - Send invoice PDF to Finance via email
   - Email reminders for pending payments

2. **Payment Workflow**
   - Automatic payment calculation based on terms
   - Payment reconciliation with GRN

3. **Reporting**
   - PO approval turnaround time
   - Payment processing KPIs
   - Audit trail compliance reports

4. **Dashboard**
   - Finance dashboard showing pending invoices
   - Approval workflow status
   - Payment status tracking

## Testing Checklist

- [ ] PO approval triggers invoice creation
- [ ] Invoice amount matches PO amount
- [ ] Finance department receives notification
- [ ] Audit trail records action with correct status transition
- [ ] Multiple approvals create multiple audit entries
- [ ] Workflow handles missing Finance users gracefully
- [ ] Invoice PDF generation works
- [ ] Payment status updates from Finance module

## Support & Troubleshooting

**Invoice not generated?**
- Check database audit trail for errors
- Verify PO has valid vendor_id
- Check server logs for workflow service errors

**Finance not notified?**
- Verify Finance users exist in system
- Check notification service status
- Review audit trail metadata for notification ID

**Audit trail not recording?**
- Verify audit_trails table exists
- Check database permissions
- Review migration execution logs
