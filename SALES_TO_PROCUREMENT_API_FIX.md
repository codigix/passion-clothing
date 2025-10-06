# Sales to Procurement API Fix

## Issue
When trying to send a sales order from the Sales Dashboard to Procurement using the "Send to Procurement" action button, the API call was failing with a 500 error.

## Root Cause
The endpoint `/sales/orders/:id/send-to-procurement` was attempting to update the `SalesOrder` record with a field `procurement_status` that **does not exist** in the database schema.

### Specific Problems Found:

1. **Missing Field in Database**: The `procurement_status` field was being set but doesn't exist in the `SalesOrder` model
2. **Missing Customer Association**: The order was loaded without including the `customer` association, making customer data unavailable
3. **Poor Error Handling**: Frontend didn't show specific error messages to help diagnose the issue

## Changes Made

### 1. Backend - Sales Route (`server/routes/sales.js`)

**Fixed: Load Customer Association**
```javascript
const order = await SalesOrder.findByPk(req.params.id, {
  include: [
    {
      model: Customer,
      as: 'customer',
      attributes: ['id', 'name', 'customer_code', 'email', 'phone']
    }
  ]
});
```

**Fixed: Removed Non-Existent Field**
```javascript
// BEFORE (BROKEN)
await order.update({
  status: 'confirmed',
  approved_by: req.user.id,
  approved_at: new Date(),
  procurement_status: 'requested',  // ❌ Field doesn't exist!
  ready_for_procurement: true,
  ready_for_procurement_by: req.user.id,
  ready_for_procurement_at: new Date()
});

// AFTER (FIXED)
await order.update({
  status: 'confirmed',
  approved_by: req.user.id,
  approved_at: new Date(),
  ready_for_procurement: true,
  ready_for_procurement_by: req.user.id,
  ready_for_procurement_at: new Date()
});
```

**Improved: Better Error Response**
```javascript
res.json({ 
  message: 'Sales order sent to procurement successfully',
  order: {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    ready_for_procurement: order.ready_for_procurement,
    approved_by: order.approved_by,
    approved_at: order.approved_at
  }
});
```

### 2. Backend - Procurement Route (`server/routes/procurement.js`)

**Fixed: Accept Order Endpoint**
- Removed `procurement_status: 'accepted'` and `procurement_accepted_by` fields
- Used existing `approved_by` and `approved_at` fields instead
- Updated response to return valid fields

```javascript
// BEFORE (BROKEN)
await order.update({
  status: 'accepted_by_procurement',
  procurement_status: 'accepted',  // ❌ Field doesn't exist!
  procurement_accepted_by: req.user.id,  // ❌ Field doesn't exist!
  procurement_accepted_at: new Date(),  // ❌ Field doesn't exist!
  lifecycle_history: lifecycleHistory
});

// AFTER (FIXED)
await order.update({
  status: 'accepted_by_procurement',
  approved_by: req.user.id,
  approved_at: new Date(),
  lifecycle_history: lifecycleHistory
});
```

### 3. Frontend - Sales Dashboard (`client/src/pages/dashboards/SalesDashboard.jsx`)

**Improved: Better Error Handling**
```javascript
const handleSendToProcurement = async (order) => {
  if (window.confirm(`Are you sure you want to send order ${order.order_number} to procurement?`)) {
    try {
      const response = await api.put(`/sales/orders/${order.id}/send-to-procurement`);
      toast.success(response.data.message || 'Order sent to procurement successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error sending to procurement:', error);
      
      // Show specific error message
      const errorMessage = error.response?.data?.message || 'Failed to send order to procurement';
      const currentStatus = error.response?.data?.currentStatus;
      
      if (currentStatus) {
        toast.error(`${errorMessage}. Current status: ${currentStatus}`);
      } else {
        toast.error(errorMessage);
      }
    }
  }
};
```

## Database Fields Used

The fix uses **existing fields** from the `SalesOrder` model:

| Field | Type | Purpose |
|-------|------|---------|
| `status` | ENUM | Order status (draft → confirmed → accepted_by_procurement) |
| `ready_for_procurement` | BOOLEAN | Flag indicating order is ready for procurement |
| `ready_for_procurement_by` | INTEGER | User ID who marked it ready |
| `ready_for_procurement_at` | DATE | Timestamp when marked ready |
| `approved_by` | INTEGER | User ID who approved/accepted |
| `approved_at` | DATE | Timestamp of approval/acceptance |
| `lifecycle_history` | JSON | Array tracking all workflow events |

## Workflow After Fix

### 1. Sales Sends to Procurement
```
POST /sales/orders/:id/send-to-procurement

Updates:
- status: 'draft' → 'confirmed'
- ready_for_procurement: true
- ready_for_procurement_by: current_user.id
- ready_for_procurement_at: now()
- approved_by: current_user.id
- approved_at: now()

Triggers:
- Notification to Procurement department
```

### 2. Procurement Accepts Order
```
PUT /procurement/sales-orders/:id/accept

Updates:
- status: 'confirmed' → 'accepted_by_procurement'
- approved_by: current_user.id (procurement user)
- approved_at: now()
- lifecycle_history: adds acceptance event

Triggers:
- Notification to Sales department
```

## Testing

### Manual Test Steps

1. **Login as Sales User**
2. **Navigate to Sales Dashboard**
3. **Find a draft sales order**
4. **Click "Send to Procurement" action button**
5. **Verify:**
   - ✅ Success message appears
   - ✅ Order status changes to "Confirmed"
   - ✅ Order appears in Procurement's "Incoming Orders"
   - ✅ Notification sent to Procurement department

6. **Login as Procurement User**
7. **Navigate to Procurement Dashboard**
8. **Click "Accept" on the incoming order**
9. **Verify:**
   - ✅ Success message appears
   - ✅ Order status changes to "Accepted by Procurement"
   - ✅ Order removed from "Incoming Orders" list
   - ✅ Notification sent to Sales department

### API Test (Using curl or Postman)

```bash
# Test Send to Procurement
curl -X PUT http://localhost:5000/api/sales/orders/1/send-to-procurement \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response
{
  "message": "Sales order sent to procurement successfully",
  "order": {
    "id": 1,
    "order_number": "SO-20250220-0001",
    "status": "confirmed",
    "ready_for_procurement": true,
    "approved_by": 5,
    "approved_at": "2025-02-20T10:30:00.000Z"
  }
}
```

## Error Messages

The fix provides clear error messages:

| Scenario | Error Message |
|----------|--------------|
| Order not found | "Sales order not found" |
| Order not in draft status | "Only draft orders can be sent to procurement. Current status: confirmed" |
| Order not ready for procurement | "Order must be confirmed and marked as ready for procurement before acceptance" |
| Database error | "Failed to send sales order to procurement" + error details |

## Files Modified

1. ✅ `server/routes/sales.js` - Fixed send-to-procurement endpoint
2. ✅ `server/routes/procurement.js` - Fixed accept order endpoint
3. ✅ `client/src/pages/dashboards/SalesDashboard.jsx` - Improved error handling

## Important Notes

### Field Naming Convention
The codebase uses **existing standard fields** for approval tracking:
- `approved_by` - User who approved/accepted
- `approved_at` - Timestamp of approval/acceptance

These fields are reused at different workflow stages rather than creating stage-specific fields like `procurement_accepted_by`.

### Status Tracking
Order status progression:
```
draft → confirmed → accepted_by_procurement → (further stages)
```

### Lifecycle History
All workflow events are recorded in the `lifecycle_history` JSON field:
```json
[
  {
    "timestamp": "2025-02-20T10:30:00.000Z",
    "stage": "procurement",
    "action": "order_accepted",
    "previous_status": "confirmed",
    "new_status": "accepted_by_procurement",
    "changed_by": 5,
    "changed_by_name": "John Doe",
    "notes": "Order accepted by procurement team"
  }
]
```

## Related Documentation

- `PROCUREMENT_WORKFLOW_ROLE_BASED_ACCESS.md` - Overall workflow documentation
- `QUICK_REFERENCE_ROLE_BASED_WORKFLOW.md` - Quick reference guide
- `PROCUREMENT_DASHBOARD_ENHANCEMENTS.md` - Dashboard features

## Next Steps

✅ **Issue Resolved** - API calls now work correctly

**Optional Enhancements:**
1. Add database migration to create `procurement_status` field if needed for more granular tracking
2. Add `procurement_accepted_by` and `procurement_accepted_at` fields for better audit trail
3. Add unit tests for the endpoints
4. Add integration tests for the workflow

---

**Fix Applied:** February 20, 2025  
**Status:** ✅ Resolved  
**Server Restart:** Required (restarted automatically)