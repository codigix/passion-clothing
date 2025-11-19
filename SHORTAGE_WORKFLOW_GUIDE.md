# GRN Shortage/Overage Action Workflow

## Overview
This document describes the complete workflow for handling material shortages and overages detected during GRN (Goods Receipt Note) creation.

## Workflow Steps

### 1. **Shortage Detection (Automatic)**
When creating a GRN, if the received quantity is less than the invoiced quantity:
- System automatically creates a **shortage complaint** in the `approvals` table
- Complaint type: `grn_shortage_complaint`
- Status: `pending`
- Creates a **vendor return request** in the `vendor_returns` table
- Updates PO status to `grn_shortage`
- Sends notifications to:
  - All procurement department users
  - PO creator (if exists)
  - Broadcast notification to all users

**Database Records Created:**
```sql
-- Approval/Complaint Record
INSERT INTO approvals (
  entity_type: 'purchase_order',
  entity_id: <po_id>,
  stage_key: 'grn_shortage_complaint',
  status: 'pending',
  metadata: {
    grn_id: <grn_id>,
    grn_number: 'GRN-YYYYMMDD-XXXXX',
    complaint_type: 'shortage',
    po_number: 'PO-YYYYMMDD-XXXXX',
    vendor_name: 'Vendor Name',
    items_affected: [...],
    total_shortage_value: '1000.00',
    action_required: 'Approve shortage and coordinate with vendor for replacement'
  }
)

-- Vendor Return Record
INSERT INTO vendor_returns (
  return_number: 'VR-YYYYMMDD-XXXXX',
  purchase_order_id: <po_id>,
  grn_id: <grn_id>,
  vendor_id: <vendor_id>,
  return_type: 'shortage',
  status: 'pending',
  items: [...],
  total_shortage_value: 1000.00
)
```

### 2. **View Pending Requests (Procurement Dashboard)**
Navigate to: **Procurement Dashboard → Pending Requests Tab**

**What You'll See:**
- All shortage and overage complaints with status `pending` or `in_progress`
- Each card displays:
  - ⚠️ Material Shortage or 📦 Material Overage
  - GRN Number, PO Number, Vendor Name
  - Total shortage/overage value
  - Detailed table of affected items with quantities
  - Action required message

**API Endpoint:**
```
GET /api/approvals?entity_type=purchase_order&status=pending,in_progress
```

### 3. **Take Action on Shortage**

#### **Option A: Request Shortage Materials from Vendor**
Click the **"Request Shortage Materials"** button (purple button)

**What Happens:**
1. Creates a **vendor request** record in `vendor_requests` table
2. Generates unique request number: `VRQ-YYYYMMDD-XXXXX`
3. Updates PO status from `grn_shortage` → `reopened`
4. Updates complaint status from `pending` → `in_progress`
5. Adds vendor request metadata to complaint
6. Sends notifications to:
   - All procurement department users
   - PO creator
   - Broadcast notification

**API Endpoint:**
```
POST /api/vendor-requests/reopen-po-and-send-request
Body: { complaint_id: <complaint_id> }
```

**Vendor Request Record:**
```sql
INSERT INTO vendor_requests (
  request_number: 'VRQ-YYYYMMDD-XXXXX',
  purchase_order_id: <po_id>,
  grn_id: <grn_id>,
  vendor_id: <vendor_id>,
  complaint_id: <complaint_id>,
  request_type: 'shortage',
  status: 'sent',
  items: [...],
  total_value: 1000.00,
  message_to_vendor: 'Detailed message explaining shortage...'
)
```

#### **Option B: View GRN Details**
Click the **"View GRN"** button (blue button)
- Navigates to GRN details page
- Shows complete GRN information including shortage items

#### **Option C: View Purchase Order**
Click the **"View Purchase Order"** button (gray button)
- Navigates to PO details page
- Shows complete PO information

### 4. **Vendor Sends Shortage Materials**
When the vendor sends the shortage materials, create a new GRN for the same PO.

**Automatic Fulfillment Detection:**
When creating a GRN for a PO that has an active vendor request (status: `sent`, `acknowledged`, or `in_transit`):
1. System detects the active vendor request
2. Marks vendor request status as `fulfilled`
3. Links the fulfillment GRN: `fulfillment_grn_id`
4. Updates PO status from `reopened` → `completed`
5. Sends fulfillment notification to procurement team

**Code Location:** `server/routes/grn.js:779-832`

### 5. **Track Vendor Requests**
Navigate to: **Procurement Dashboard → Vendor Returns Tab**

**What You'll See:**
- All vendor return requests with status `pending` or `approved`
- Each card displays:
  - Return number (VR-YYYYMMDD-XXXXX)
  - Return type (shortage/overage)
  - Total value
  - Number of items
  - Creation date
  - Status badge (yellow for pending, green for approved)

**API Endpoint:**
```
GET /api/vendor-returns?status=pending,approved
```

## Status Lifecycle

### Purchase Order Status Flow
```
grn_shortage → reopened → completed
```

### Complaint Status Flow
```
pending → in_progress
```

### Vendor Request Status Flow
```
pending → sent → acknowledged → in_transit → fulfilled
```

## Key Features

### ✅ Automatic Detection
- No manual intervention needed for shortage detection
- System automatically creates complaints and vendor returns

### ✅ Comprehensive Notifications
- Procurement team gets notified immediately
- PO creator gets targeted notification
- Broadcast notification for visibility

### ✅ Transaction Safety
- All database operations wrapped in transactions
- Automatic rollback on errors
- Data consistency guaranteed

### ✅ Audit Trail
- Complete history of all actions
- Timestamps for all status changes
- Metadata tracking for all decisions

### ✅ User-Friendly Interface
- Clear visual indicators (colors, icons)
- Detailed information cards
- Multiple action buttons for different workflows
- Tooltips for button explanations

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/approvals` | GET | Fetch complaints with filters |
| `/api/approvals/:id` | GET | Get specific complaint details |
| `/api/vendor-requests/reopen-po-and-send-request` | POST | Create vendor request and reopen PO |
| `/api/vendor-requests` | GET | Fetch all vendor requests |
| `/api/vendor-requests/:id` | GET | Get specific vendor request |
| `/api/vendor-requests/:id/acknowledge` | PATCH | Vendor acknowledgment |
| `/api/vendor-returns` | GET | Fetch vendor returns |
| `/api/grn` | POST | Create GRN (with auto-fulfillment detection) |

## Database Tables Involved

1. **approvals** - Stores shortage/overage complaints
2. **vendor_requests** - Tracks vendor requests for shortage materials
3. **vendor_returns** - Tracks vendor return requests
4. **purchase_orders** - PO status updates
5. **goods_receipt_notes** - GRN records with shortage detection
6. **notifications** - User notifications

## Testing Checklist

- [ ] Create GRN with shortage → Verify complaint created
- [ ] Check Procurement Dashboard → Verify complaint appears in Pending Requests
- [ ] Click "Request Shortage Materials" → Verify vendor request created
- [ ] Verify PO status changed to `reopened`
- [ ] Verify complaint status changed to `in_progress`
- [ ] Create new GRN for same PO → Verify vendor request marked as `fulfilled`
- [ ] Verify PO status changed to `completed`
- [ ] Check notifications sent to correct users
- [ ] Verify all data in Vendor Returns tab

## Important Notes

1. **GRN ID in Metadata**: All complaints now include `grn_id` in metadata for easy navigation
2. **Multiple Statuses**: The approvals API supports filtering by multiple statuses (pending, in_progress)
3. **Stage Key Filtering**: Can filter by specific complaint types (grn_shortage_complaint, grn_overage_complaint)
4. **Department-Based Notifications**: Only active procurement department users receive notifications
5. **Transaction Safety**: All operations are wrapped in database transactions

## Future Enhancements

- [ ] Email notifications to vendors
- [ ] Vendor portal for acknowledgment
- [ ] SLA tracking for fulfillment
- [ ] Credit note workflow for overages
- [ ] Bulk action support
- [ ] Advanced filtering and search
- [ ] Export to Excel/PDF
- [ ] Analytics dashboard for shortage trends
