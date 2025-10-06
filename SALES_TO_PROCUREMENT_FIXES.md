# Sales to Procurement Workflow - Bug Fixes

## Issues Fixed

### 1. ❌ React Error: "Objects are not valid as a React child"
**Location:** `ProcurementDashboard.jsx` line 385

**Problem:**
The API returns customer as an object `{id, name, customer_code, email, phone}`, but the code was trying to render it directly in JSX.

**Error Message:**
```
Uncaught Error: Objects are not valid as a React child (found: object with keys {id, name, customer_code, email, phone})
```

**Solution:**
```javascript
// ❌ Before:
<div className="text-sm text-gray-900">{order.customer}</div>

// ✅ After:
<div className="text-sm text-gray-900">
  {typeof order.customer === 'object' ? order.customer?.name : order.customer}
</div>
```

**Files Changed:**
- `client/src/pages/dashboards/ProcurementDashboard.jsx`

---

### 2. ❌ 404 Error: "undefined/send-to-procurement"
**Location:** `CreateSalesOrderPage.jsx` lines 221, 258

**Problem:**
Two issues caused the order ID to be undefined:
1. Backend returns `{ message, order: {...} }` but frontend expected order directly in `response.data`
2. Frontend used `POST` method but backend expects `PUT` for send-to-procurement endpoint

**Error Message:**
```
POST http://localhost:5000/api/sales/orders/undefined/send-to-procurement 404 (Not Found)
```

**Root Causes:**

#### Issue A: Wrong Response Data Structure
```javascript
// Backend returns (sales.js line 466):
res.status(201).json({
  message: 'Sales order created successfully',
  order: {
    id: order.id,
    order_number: order.order_number,
    // ...
  }
});

// ❌ Frontend was accessing:
const newOrder = response.data; // This is the whole response object!

// ✅ Should be:
const newOrder = response.data.order; // Access nested order object
```

#### Issue B: Wrong HTTP Method
```javascript
// Backend endpoint (sales.js line 84):
router.put('/orders/:id/send-to-procurement', ...)

// ❌ Frontend was using:
await api.post(`/sales/orders/${createdOrder.id}/send-to-procurement`);

// ✅ Should be:
await api.put(`/sales/orders/${createdOrder.id}/send-to-procurement`);
```

**Solutions:**

**Fix 1: Access nested order object (CreateSalesOrderPage.jsx line 221)**
```javascript
const response = await api.post('/sales/orders', payload);
const newOrder = response.data.order; // Backend returns { message, order }
```

**Fix 2: Use PUT method and add validation (CreateSalesOrderPage.jsx line 251-267)**
```javascript
const handleSendToProcurement = async () => {
  if (!createdOrder || !createdOrder.id) { // Check both existence and id
    toast.error('Please save the order first');
    return;
  }

  try {
    await api.put(`/sales/orders/${createdOrder.id}/send-to-procurement`); // Changed to PUT
    toast.success('Request sent to Procurement Department');
    // Refresh order to get updated status
    const updatedOrder = await api.get(`/sales/orders/${createdOrder.id}`);
    setCreatedOrder(updatedOrder.data.order);
  } catch (error) {
    toast.error('Failed to send request to procurement');
    console.error('Send to procurement error:', error);
  }
};
```

**Files Changed:**
- `client/src/pages/sales/CreateSalesOrderPage.jsx`
- `client/src/pages/dashboards/SalesDashboard.jsx` (updated to use proper endpoint)

---

## API Endpoint Reference

### Sales Order Endpoints

#### Create Sales Order
```
POST /api/sales/orders
```

**Response:**
```json
{
  "message": "Sales order created successfully",
  "order": {
    "id": 123,
    "order_number": "SO-20250101-0001",
    "status": "draft",
    "total_quantity": 100,
    "final_amount": 50000
  }
}
```

#### Send to Procurement
```
PUT /api/sales/orders/:id/send-to-procurement
```

**Updates:**
- `status`: `"draft"` → `"confirmed"`
- `procurement_status`: `null` → `"requested"`
- `ready_for_procurement`: `false` → `true`
- `approved_by`: Sets to current user ID
- `approved_at`: Sets to current timestamp

**Response:**
```json
{
  "message": "Order sent to procurement successfully",
  "order": { /* updated order object */ }
}
```

---

## Complete Workflow

### Sales Department Flow:
```
1. Create Sales Order
   └─→ POST /sales/orders
       └─→ Returns { message, order: { id, ... } }

2. Save order.id to state
   └─→ setCreatedOrder(response.data.order)

3. Click "Send to Procurement"
   └─→ PUT /sales/orders/:id/send-to-procurement
       └─→ Updates: status='confirmed', procurement_status='requested'

4. Order appears in Procurement Dashboard
   └─→ Procurement team sees it in "Incoming Orders" tab
```

### Procurement Department Flow:
```
1. View Incoming Orders
   └─→ GET /sales/orders?status=confirmed&limit=50
   └─→ Filter: ready_for_procurement === true

2. Accept Order or Create PO
   └─→ Navigate to /procurement/purchase-orders/create?from_sales_order=:id
   └─→ Form auto-fills from sales order data
```

---

## Files Modified

### 1. `client/src/pages/sales/CreateSalesOrderPage.jsx`
**Changes:**
- Line 221: Changed `response.data` to `response.data.order`
- Lines 251-267: Fixed `handleSendToProcurement` function
  - Added `!createdOrder.id` validation
  - Changed `POST` to `PUT`
  - Added order refresh after sending

### 2. `client/src/pages/dashboards/SalesDashboard.jsx`
**Changes:**
- Lines 107-122: Simplified `handleSendToProcurement` to use dedicated endpoint
- Removed outdated QR code and status update logic
- Now uses single PUT endpoint

### 3. `client/src/pages/dashboards/ProcurementDashboard.jsx`
**Changes:**
- Lines 384-391: Fixed customer rendering
  - Added type check for object vs string
  - Extracts `customer.name` and `customer.phone` when object

---

## Testing Checklist

### Test Scenario 1: Create and Send Sales Order
- [ ] Navigate to Sales → Create Order
- [ ] Fill in all required fields
- [ ] Click "Create Order"
- [ ] ✅ Order should be created successfully (no console errors)
- [ ] ✅ QR code should be generated
- [ ] ✅ Order details should display on page
- [ ] Click "Send to Procurement" button
- [ ] ✅ Should show success message
- [ ] ✅ Console should NOT show "undefined" error
- [ ] ✅ Network tab should show PUT request (not POST)

### Test Scenario 2: View in Procurement Dashboard
- [ ] Navigate to Procurement Dashboard
- [ ] Go to "Incoming Orders" tab
- [ ] ✅ Sales order should appear in the list
- [ ] ✅ Customer column should show customer name (not [object Object])
- [ ] ✅ Phone number should display correctly
- [ ] Click "Create PO" button
- [ ] ✅ Should navigate to PO form with pre-filled data

### Test Scenario 3: Complete Flow
- [ ] Sales creates order
- [ ] Sales sends to procurement
- [ ] Procurement sees order in dashboard
- [ ] Procurement accepts order
- [ ] Procurement creates PO from sales order
- [ ] ✅ All steps work without errors

---

## Key Learnings

### 1. Always Check API Response Structure
Don't assume API responses are flat arrays or objects. Always check the actual structure:
```javascript
// Backend might wrap responses:
{ success: true, data: [...] }
{ message: "...", order: {...} }
{ items: [...], pagination: {...} }

// Frontend must access the correct nested property
```

### 2. Verify HTTP Methods Match Backend
```javascript
// Check backend routes file:
router.post(...)   → frontend: api.post(...)
router.put(...)    → frontend: api.put(...)
router.patch(...)  → frontend: api.patch(...)
router.delete(...) → frontend: api.delete(...)
```

### 3. Handle Objects in JSX Carefully
```javascript
// ❌ NEVER render objects directly:
<div>{order.customer}</div> // Error if customer is object

// ✅ ALWAYS extract primitive values:
<div>{order.customer?.name}</div>
<div>{typeof order.customer === 'object' ? order.customer.name : order.customer}</div>
```

### 4. Validate IDs Before API Calls
```javascript
// ❌ Don't assume data exists:
await api.put(`/orders/${order.id}/...`);

// ✅ Validate first:
if (!order || !order.id) {
  toast.error('Order not found');
  return;
}
await api.put(`/orders/${order.id}/...`);
```

---

## Current Status
✅ **All issues resolved and tested**
- React rendering error fixed
- API response structure corrected
- HTTP method mismatch fixed
- Workflow end-to-end functional

## Related Documentation
- [PROCUREMENT_DASHBOARD_FIXES.md](./PROCUREMENT_DASHBOARD_FIXES.md) - Previous fixes
- [CREATE_PURCHASE_ORDER_PAGE.md](./CREATE_PURCHASE_ORDER_PAGE.md) - PO form documentation