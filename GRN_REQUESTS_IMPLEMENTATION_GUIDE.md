# GRN Request Approval Workflow Implementation Guide

## Overview
Implemented a complete GRN (Goods Receipt Note) request approval workflow that separates concerns between Procurement and Inventory departments:

- **Procurement Dashboard**: Sends GRN requests after materials are received
- **Inventory Dashboard**: Receives GRN requests and creates/manages GRNs

## Architecture

### Workflow Flow
```
Procurement Dashboard
    ↓
1. Mark materials as received (status → "in_transit"/"dispatched")
2. Click "Request GRN" button
3. PO status changes to "grn_requested"
4. Inventory department is notified
    ↓
Inventory Dashboard (GRN Workflow)
    ↓
1. View "Incoming Requests" tab
2. See all POs with status "grn_requested"
3. Click "Create GRN" button for each request
4. Proceed with normal GRN verification workflow
5. Handle discrepancies (shortages/excess)
6. Complete GRN workflow
7. Materials stored in inventory
```

## Implementation Details

### 1. Procurement Dashboard Changes

**File**: `d:\projects\passion-clothing\client\src\pages\dashboards\ProcurementDashboard.jsx`

#### New Handler Added:
```javascript
const handleRequestGRN = async (order) => {
  if (!window.confirm(`Send GRN request for PO ${order.po_number} to Inventory Department?`)) {
    return;
  }

  try {
    await api.patch(`/procurement/pos/${order.id}`, {
      status: "grn_requested",
    });
    toast.success(
      `GRN request sent for PO ${order.po_number}! Inventory Department has been notified.`
    );
    fetchDashboardData();
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to request GRN");
  }
};
```

#### New Action Button Added:
- Button appears when PO status is: `in_transit`, `dispatched`, `partial_received`, or `received` (without approved verification)
- Located in Purchase Orders table actions
- Shows orange "Request GRN" button with Receipt icon
- Requires confirmation before sending request

#### When to Show "Request GRN" Button:
```
Status: in_transit
Status: dispatched
Status: partial_received
Status: received (verification_status != approved)
```

### 2. Inventory Dashboard Changes (GRN Workflow Dashboard)

**File**: `d:\projects\passion-clothing\client\src\pages\inventory\GRNWorkflowDashboard.jsx`

#### State Updates:
```javascript
const [activeTab, setActiveTab] = useState("incoming");
const [incomingGRNRequests, setIncomingGRNRequests] = useState([]);
```

#### Data Fetching:
```javascript
const fetchAllData = async () => {
  // Fetch existing GRNs
  const response = await api.get(`/grn${query}`);
  setGrns(response.data.grns || []);

  // Fetch incoming GRN requests (POs with grn_requested status)
  const incomingRes = await api.get("/procurement/pos?status=grn_requested&limit=50");
  setIncomingGRNRequests(incomingRes.data.purchaseOrders || []);
};
```

#### New Handler:
```javascript
const handleCreateGRNFromRequest = async (po) => {
  try {
    window.location.href = `/inventory/grn/create?from_po=${po.id}`;
  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to create GRN");
  }
};
```

#### New UI Elements:

**Tabs** (at top of dashboard):
- `Incoming Requests` - Shows POs with status "grn_requested" from Procurement
- `All GRNs` - Shows all created GRNs (existing functionality)
- Each tab shows badge with count

**Incoming Requests Display**:
- Yellow border cards for visual distinction
- Shows PO Number with "grn_requested" status badge
- Displays key info: Vendor, Project, Total Qty, Amount
- Two action buttons per card:
  1. "Create GRN" (blue button) - Creates GRN from this PO request
  2. "View PO" (gray button) - Opens PO details in Procurement

## Features

### Procurement Dashboard
✅ Shows "Request GRN" button only when appropriate (after materials received)
✅ Confirmation dialog before sending request
✅ Toast notifications for success/error
✅ Auto-refreshes dashboard after request
✅ Updates PO status to "grn_requested"

### Inventory Dashboard
✅ New "Incoming Requests" tab showing all pending GRN requests
✅ Incoming requests fetched from Procurement (status = "grn_requested")
✅ Quick access to create GRN from request
✅ Link back to PO for reference
✅ Request count badge on tab
✅ Empty state when no requests pending
✅ Maintains existing GRN workflow functionality

## User Experience

### For Procurement User:
1. Receives sales order → Creates PO
2. Sends PO to vendor → Marks as "sent"
3. Receives materials → Clicks "Received" button
4. When ready for QC → Clicks "Request GRN" button
5. Receives confirmation notification
6. PO now visible to Inventory department

### For Inventory User:
1. Opens GRN Workflow Dashboard
2. Clicks "Incoming Requests" tab
3. Sees list of POs waiting for GRN creation
4. Clicks "Create GRN" on any request
5. Proceeds with normal GRN workflow (verify, handle discrepancies, approve)
6. Upon completion, materials added to inventory

## API Endpoints Used

### Procurement Dashboard:
- `PATCH /procurement/pos/{id}` - Update PO status to "grn_requested"

### Inventory Dashboard:
- `GET /procurement/pos?status=grn_requested&limit=50` - Fetch incoming requests
- `GET /grn` - Fetch all GRNs (existing)

## Status Transitions

### Purchase Order Status Flow:
```
draft → pending_approval → approved → sent → 
(materials arrive)
in_transit/dispatched/partial_received → 
(User clicks "Request GRN")
grn_requested → 
(GRN created in inventory)
received/excess_received/short_received → 
(GRN verification)
completed
```

## Error Handling

- ✅ Confirmation dialogs prevent accidental requests
- ✅ Toast notifications for all outcomes
- ✅ API error messages displayed to user
- ✅ Graceful empty states when no data
- ✅ Loading indicators during data fetch

## Styling

**Colors Used**:
- Incoming Requests: Yellow badge (#fbbf24 / yellow-400)
- Create GRN button: Blue (#2563eb / blue-600)
- Request GRN button: Orange (#ea580c / orange-600)
- Status badges: Yellow-100 background, Yellow-700 text

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard React hooks (useState, useEffect)
- Uses lucide-react icons
- Uses Tailwind CSS for styling

## Testing Checklist

- [ ] Procurement user can see "Request GRN" button after materials received
- [ ] Confirmation dialog appears when clicking "Request GRN"
- [ ] PO status changes to "grn_requested" after sending request
- [ ] Inventory user sees incoming request in "Incoming Requests" tab
- [ ] Incoming request count badge updates correctly
- [ ] "Create GRN" button navigates to GRN creation page
- [ ] "View PO" button opens PO details
- [ ] Empty states display correctly
- [ ] Loading states display correctly
- [ ] Search and filter work on "All GRNs" tab
- [ ] Tab switching works smoothly

## Notes

- The "Request GRN" button is conditional and only shows for appropriate PO statuses
- All existing GRN workflow functionality remains unchanged
- Incoming requests are fetched fresh each time dashboard loads
- Tab state defaults to "incoming" to show pending requests first
- Both tabs share the same data fetch but display different datasets

## Future Enhancements

Potential improvements:
- Email notifications to Inventory when GRN request received
- GRN request expiry/SLA tracking
- Batch GRN creation for multiple requests
- Advanced filtering on Incoming Requests
- Export incoming requests to Excel
- Auto-create GRN on material receipt (if configured)
- Request history/audit trail