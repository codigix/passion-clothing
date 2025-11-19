# GRN Hierarchy System - Complete Workflow Guide

## Overview

The GRN (Goods Receipt Note) hierarchy system provides a clear structure for handling multiple GRNs when shortages are detected. This guide explains the complete workflow and how to use the system.

## Complete Workflow

### Step 1: Create First GRN (With All Items)
- **Endpoint**: `POST /api/grn/from-po/:poId`
- **PO Status**: Must be `grn_requested`, `sent`, or `grn_approved`
- **Items Shown**: ALL items from the Purchase Order
- **What Happens**: 
  - GRN is created with `is_first_grn: true` and `grn_sequence: 1`
  - System checks each item for discrepancies (shortage, overage, invoice mismatch)
  - If items match perfectly: PO status becomes `received` ✓ (End of workflow)
  - If discrepancies detected: Complaints are created (next step)

### Step 2: Review Shortage Complaints (Auto-created)
- **Location**: Procurement Dashboard → Pending Requests
- **What Happens**:
  - If shortages detected: A `grn_shortage_complaint` approval is created
  - If overages detected: A `grn_overage_complaint` approval is created
  - A VendorReturn request is automatically created
  - Notifications are sent to procurement team and PO creator
  - PO status becomes `grn_shortage` or `grn_overage`

### Step 3: Approve Shortage Complaint
- **Endpoint**: `PATCH /api/approvals/:approvalId/approve`
- **PO Status After**: `reopened`
- **What Happens**:
  - The complaint is marked as approved
  - PO status automatically changes to `reopened`
  - A VendorRequest is created to track the shortage items
  - Vendor is notified to send replacement materials

### Step 4: Create Second GRN (With Only Shortage Items)
- **Endpoint**: `GET /api/grn/create/:poId` (to get form data)
- **Endpoint**: `POST /api/grn/from-po/:poId` (to submit)
- **PO Status**: Must be `reopened`
- **Items Shown**: ONLY shortage items from the shortage complaint
- **GRN Properties**: 
  - `is_first_grn: false`
  - `grn_sequence: 2`
  - `original_grn_id`: Links back to the first GRN
- **After Inspection**: If all shortage items are received correctly, PO becomes `completed`

### Step 5: Subsequent GRNs (If Needed)
- Same as Step 4, but:
  - `grn_sequence: 3, 4, ...` as needed
  - Each time shortages are detected again, the workflow repeats
  - The system supports unlimited GRNs per PO

## Status Transitions

```
draft → pending_approval → approved → sent → acknowledged → grn_requested
                                        ↓
                                   (Create 1st GRN)
                                        ↓
                           Perfect Match: received ✓
                                   OR
                           Discrepancies: grn_shortage / grn_overage
                                        ↓
                           (Approve shortage complaint)
                                        ↓
                           reopened (for 2nd+ GRN)
                                        ↓
                           (Create subsequent GRNs)
                                        ↓
                           completed ✓
```

## API Endpoints Reference

### Get GRN Form Data (Hierarchy-Aware)
```
GET /api/grn/create/:poId
Response:
{
  po_id: 1,
  po_number: "PO-20251112-0001",
  items: [...],  // ALL items if first GRN, ONLY shortage items if subsequent
  hierarchy: {
    is_first_grn: true/false,
    grn_sequence: 1, 2, 3, ...
    grn_label: "Original Receipt" or "Shortage Fulfillment Receipt",
    grn_status_badge: "1st GRN", "2nd GRN", etc.
  }
}
```

### Create GRN
```
POST /api/grn/from-po/:poId
Body:
{
  received_date: "2025-11-12",
  inward_challan_number: "...",
  supplier_invoice_number: "...",
  items_received: [...],
  remarks: "..."
}
```

### Approve Shortage Complaint
```
PATCH /api/approvals/:approvalId/approve
Body:
{
  decision_note: "Approved for replacement"
}
Response:
- PO status automatically changed to "reopened"
- VendorRequest created for shortage items
```

### Diagnostics (Troubleshooting)
```
GET /api/grn/diagnostics/:poId
Response:
{
  po_details: {...},
  grn_count: 2,
  grns: [...],
  workflow_status: {
    can_create_first_grn: false,
    can_create_subsequent_grn: true,
    expected_next_step: "Create subsequent GRN with shortage items"
  },
  hierarchy_issues: [],
  recommendations: [...]
}
```

## Troubleshooting

### Error: "A GRN already exists. PO must be in 'reopened' status"

**Cause**: You're trying to create a second GRN, but the PO is not in "reopened" status.

**Solution**: 
1. Check the Procurement Dashboard for pending shortage complaints
2. Go to "Pending Requests" or "Approvals"
3. Find the shortage complaint (grn_shortage_complaint) for this PO
4. Click "Approve" to approve the complaint
5. Wait for the PO status to change to "reopened"
6. Now try creating the second GRN again

### Using Diagnostics Endpoint

To understand your GRN status:

```bash
curl -X GET http://localhost:3001/api/grn/diagnostics/:poId \
  -H "Authorization: Bearer YOUR_TOKEN"
```

This will show:
- All GRNs for the PO with their sequence and hierarchy flags
- Pending approvals and complaints
- Vendor requests
- Any hierarchy issues detected
- Recommendations for next steps

### Hierarchy Issues Detected

If the diagnostics endpoint reports hierarchy issues:

**Issue**: "Found 2 GRN(s) with incorrect is_first_grn flag"

**Cause**: Multiple GRNs are marked as the first GRN (usually old test data)

**Solution**: 
1. Clear old test data from the database
2. Delete all GRNs for the PO: `DELETE FROM goods_receipt_notes WHERE purchase_order_id = ?`
3. Reset PO status to "grn_requested": `UPDATE purchase_orders SET status = 'grn_requested' WHERE id = ?`
4. Start fresh with the workflow

## Best Practices

1. **Always check for pending complaints** before creating a subsequent GRN
2. **Use the diagnostics endpoint** when you're unsure about status
3. **Approve complaints promptly** so the vendor can send replacement materials
4. **Inspect materials carefully** to avoid multiple rounds of shortages
5. **Document remarks** when there are discrepancies for audit purposes

## Key Fields in GRN Hierarchy

- `grn_sequence`: 1 for first, 2 for second, etc.
- `is_first_grn`: `true` only for the first GRN of a PO
- `original_grn_id`: Links subsequent GRNs back to the first one
- `shortage_fulfillment_metadata`: Contains original GRN info and complaint details

## Related Models

- **PurchaseOrder**: Main entity, status tracks workflow
- **GoodsReceiptNote**: Individual receipts with hierarchy flags
- **Approval**: Shortage/overage complaints that need approval
- **VendorReturn**: Tracks items to be returned/replaced
- **VendorRequest**: Tracks shortage fulfillment requests

## Support

For issues or clarification:
1. Use the `/api/grn/diagnostics/:poId` endpoint
2. Check the PO status and workflow_status in diagnostics
3. Review the recommendations provided
4. Contact your system administrator if data cleanup is needed
