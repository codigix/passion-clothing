# Purchase Order Approval Workflow - Complete Implementation

## Problem Identified

The admin panel was unable to display pending purchase order approval requests because:

1. **Missing "Submit for Approval" Endpoint**: There was no API endpoint to submit draft POs for admin approval
2. **Missing "Pending Approvals" Endpoint**: Admin panel couldn't fetch pending approval requests
3. **No Frontend Button**: Procurement users had no way to submit POs for approval from the UI

## Solution Implemented

### 1. Backend Changes

#### A. New Procurement Endpoint - Submit PO for Approval
**File**: `server/routes/procurement.js`

**Endpoint**: `POST /api/procurement/pos/:id/submit-for-approval`

**Functionality**:
- Changes PO status from `draft` → `pending_approval`
- Sets approval_status to `pending`
- Creates an Approval record in the database
- Sends notification to Admin department
- Only works for POs in `draft` status

**Request Body**:
```json
{
  "notes": "Optional notes for approval request"
}
```

**Response**:
```json
{
  "message": "Purchase Order submitted for approval successfully",
  "purchaseOrder": {
    "id": 1,
    "po_number": "PO-20250120-0001",
    "status": "pending_approval",
    "approval_status": "pending"
  }
}
```

#### B. New Admin Endpoint - Get Pending Approvals
**File**: `server/routes/admin.js`

**Endpoint**: `GET /api/admin/pending-approvals`

**Functionality**:
- Fetches all pending approval records from Approval table
- Enriches data with related entities (PurchaseOrder, SalesOrder)
- Also fetches POs with `pending_approval` status directly (for backward compatibility)
- Returns approval statistics

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)
- `entity_type` (optional filter: 'purchase_order', 'sales_order')

**Response**:
```json
{
  "approvals": [
    {
      "id": 1,
      "entity_type": "purchase_order",
      "entity_id": 5,
      "status": "pending",
      "stage_label": "Admin Approval Required",
      "created_at": "2025-01-20T10:30:00.000Z",
      "metadata": {
        "po_number": "PO-20250120-0001",
        "vendor_name": "Supreme Fabrics",
        "total_amount": 50000,
        "priority": "high"
      },
      "entity": {
        "id": 5,
        "po_number": "PO-20250120-0001",
        "vendor": { "name": "Supreme Fabrics" },
        "final_amount": 50000,
        "status": "pending_approval"
      }
    }
  ],
  "purchaseOrders": [...],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "pages": 1
  },
  "stats": {
    "totalPendingApprovals": 5,
    "totalPendingPOs": 5,
    "totalPOValue": 250000
  }
}
```

#### C. Updated Admin Routes Import
**File**: `server/routes/admin.js`

Added `Approval` model to imports:
```javascript
const { Role, Permission, User, Inventory, StoreStock, SalesOrder, 
        PurchaseOrder, ProductionOrder, Customer, Vendor, Product, 
        Shipment, Payment, Sample, Approval } = require('../config/database');
```

### 2. Frontend Changes

#### A. Updated Admin Dashboard
**File**: `client/src/pages/dashboards/AdminDashboard.jsx`

**Change**: Updated to fetch from new endpoint
```javascript
// OLD CODE:
const pendingPOResponse = await api.get('/procurement/pos', {
  params: { status: 'pending_approval' }
});

// NEW CODE:
const pendingApprovalsResponse = await api.get('/admin/pending-approvals');
const pos = pendingApprovalsResponse.data.purchaseOrders || [];
```

#### B. Updated Purchase Orders Page
**File**: `client/src/pages/procurement/PurchaseOrdersPage.jsx`

**New Function**: `handleSubmitForApproval`
```javascript
const handleSubmitForApproval = async (order) => {
  if (!window.confirm(`Submit Purchase Order ${order.po_number} for admin approval?`)) {
    return;
  }

  try {
    await api.post(`/procurement/pos/${order.id}/submit-for-approval`, {
      notes: 'Submitted for approval from procurement dashboard'
    });
    toast.success('Purchase order submitted for approval successfully!');
    fetchOrders();
    fetchSummary();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to submit for approval');
  }
};
```

**New UI Button**: Added "Submit for Approval" button in action menu
- Only visible for POs with status `draft`
- Orange themed button to differentiate from other actions
- Located in the dropdown action menu for each PO row

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PURCHASE ORDER WORKFLOW                   │
└─────────────────────────────────────────────────────────────┘

1. CREATE PO (Procurement User)
   │
   ├─> Status: draft
   │   approval_status: not_requested
   │
   v
   
2. SUBMIT FOR APPROVAL (Procurement User)
   │   [Button in PO List > Actions > Submit for Approval]
   │   [Endpoint: POST /procurement/pos/:id/submit-for-approval]
   │
   ├─> Status: pending_approval
   │   approval_status: pending
   │   
   ├─> Creates Approval record
   │   
   └─> Sends notification to Admin Department
   │
   v
   
3. ADMIN REVIEWS (Admin User)
   │   [Admin Dashboard shows pending approvals]
   │   [Endpoint: GET /admin/pending-approvals]
   │
   ├─> APPROVE
   │   │   [Endpoint: POST /procurement/pos/:id/approve]
   │   │
   │   ├─> Status: sent
   │   │   approval_status: approved
   │   │   
   │   └─> Notification to Procurement & Inventory
   │
   └─> REJECT (Future Enhancement)
       │
       ├─> Status: draft (or rejected)
       │   approval_status: rejected
       │   
       └─> Notification to Procurement
   │
   v
   
4. GRN CREATION (When materials arrive)
   [Existing GRN workflow continues...]
```

## Testing Guide

### Step 1: Create a Draft Purchase Order
1. Login as **procurement user** or **admin**
2. Navigate to **Procurement > Purchase Orders**
3. Click **Create PO**
4. Fill in the form:
   - Select Vendor
   - Add items/materials
   - Set delivery date
   - **Important**: Save as `draft` status
5. Submit the form

### Step 2: Submit PO for Approval
1. Go to **Procurement > Purchase Orders**
2. Find the draft PO you just created
3. Click the **three-dot menu** (Actions) for that PO
4. Click **Submit for Approval**
5. Confirm the action
6. ✅ You should see: "Purchase order submitted for approval successfully!"
7. The PO status should change to **Pending Approval**

### Step 3: View Pending Approvals in Admin Panel
1. Logout and login as **admin user**
   - Email: `admin@pashion.com`
   - Password: `admin123`
2. Navigate to **Admin Dashboard**
3. Check the **Pending Purchase Order Approvals** section
4. ✅ You should see the PO you just submitted
5. The card should show:
   - Total pending POs
   - Total value
   - Number of urgent requests

### Step 4: Approve the PO (Admin)
1. From Admin Dashboard, click on the pending PO
2. OR go to **Procurement > Purchase Orders**
3. Find the PO with status **Pending Approval**
4. Click **Actions > Approve PO**
5. ✅ The PO should be approved and status changes to **Sent**

### Step 5: Verify Notifications
1. Check the **Notifications** panel (bell icon)
2. You should see notifications for:
   - Admin: "New PO Approval Request"
   - Procurement (after approval): "PO Approved & Sent to Vendor"
   - Inventory (after approval): "Prepare for Material Receipt"

## API Endpoints Summary

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/procurement/pos/:id/submit-for-approval` | Procurement, Admin | Submit draft PO for admin approval |
| GET | `/api/admin/pending-approvals` | Admin | Get all pending approval requests |
| POST | `/api/procurement/pos/:id/approve` | Admin | Approve pending PO (existing) |

## Database Changes

### Approval Record Created
When a PO is submitted for approval, a record is created in the `approvals` table:

```sql
INSERT INTO approvals (
  entity_type,
  entity_id,
  stage_key,
  stage_label,
  sequence,
  status,
  created_by,
  metadata
) VALUES (
  'purchase_order',
  <po_id>,
  'admin_approval',
  'Admin Approval Required',
  1,
  'pending',
  <user_id>,
  {
    "po_number": "PO-...",
    "vendor_name": "...",
    "total_amount": 50000,
    "priority": "high"
  }
);
```

### PurchaseOrder Fields Updated
When submitted for approval:
- `status`: `'draft'` → `'pending_approval'`
- `approval_status`: `'not_requested'` → `'pending'`
- `approval_decision_note`: Stores submission notes

When approved:
- `status`: `'pending_approval'` → `'sent'`
- `approval_status`: `'pending'` → `'approved'`
- `approved_by`: Admin user ID
- `approved_at`: Timestamp

## Files Modified

### Backend (Server)
1. `server/routes/procurement.js` - Added submit-for-approval endpoint
2. `server/routes/admin.js` - Added pending-approvals endpoint, updated imports

### Frontend (Client)
3. `client/src/pages/procurement/PurchaseOrdersPage.jsx` - Added Submit for Approval button and handler
4. `client/src/pages/dashboards/AdminDashboard.jsx` - Updated to fetch from new endpoint

## Next Steps / Enhancements

1. **Rejection Workflow**: Add ability for admin to reject POs with reason
2. **Approval History**: Show approval timeline on PO details page
3. **Bulk Approval**: Allow admin to approve multiple POs at once
4. **Email Notifications**: Send email alerts for pending approvals
5. **Approval Levels**: Multi-level approval based on PO amount
6. **Auto-approval Rules**: Automatically approve POs below certain threshold
7. **Approval Dashboard Widget**: Dedicated approval queue component

## Troubleshooting

### "Submit for Approval" button not showing
- ✅ Ensure PO status is `draft`
- ✅ Check user has procurement or admin role
- ✅ Clear browser cache and reload

### Admin panel not showing pending POs
- ✅ Ensure at least one PO has been submitted for approval
- ✅ Check browser console for API errors
- ✅ Verify admin user is logged in
- ✅ Check `/api/admin/pending-approvals` endpoint returns data

### Notification not received
- ✅ Check notification settings in user profile
- ✅ Verify NotificationService is working
- ✅ Check `notifications` table in database

### Approval record not created
- ✅ Check database for `approvals` table
- ✅ Verify Approval model is imported correctly
- ✅ Check server logs for transaction errors

## Security Considerations

- ✅ Only Procurement and Admin users can submit POs for approval
- ✅ Only Admin users can approve POs
- ✅ Authentication required for all endpoints
- ✅ Department-level access control enforced
- ✅ Transaction rollback on errors prevents partial updates

## Performance Notes

- Pending approvals endpoint uses pagination (default 20 items)
- Includes related entity data (vendor, customer, creator) via Sequelize eager loading
- Indexes on `status` and `approval_status` fields ensure fast queries
- Statistics calculated in single query to minimize database calls

---

**Implementation Date**: January 20, 2025  
**Status**: ✅ Complete and Ready for Testing  
**Version**: 1.0