# Shipment Dashboard - Complete Test Scenarios

## ✅ Test Your Fix

Run these tests in order to verify everything is working correctly.

---

## Test 1: Check Database Connections

**Goal:** Verify all models are loaded correctly

```bash
# Check if server is running
curl http://localhost:3000/api/shipments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** Success response with shipments data (or empty array)

---

## Test 2: Verify Incoming Orders Endpoint

**Goal:** Test the fixed incoming orders endpoint

```bash
# Default - should use 'completed' status
curl "http://localhost:3000/api/shipments/orders/incoming" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "production_number": "PRO-20250117-0001",
      "production_status": "completed",
      "customer_name": "ABC Garments",
      "quantity": 100,
      "product_name": "T-Shirt",
      "items": [...],
      ...
    }
  ]
}
```

**If you see EMPTY array:**
- This is OK - means no ProductionOrders with "completed" status
- Go to Manufacturing → Create a test production order
- Mark it as "completed"
- Then test again

---

## Test 3: Test Status Mapping with Explicit Status

```bash
# Request with explicit ready_for_shipment status
curl "http://localhost:3000/api/shipments/orders/incoming?status=ready_for_shipment" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** Same result as Test 2 (should map to completed/quality_check)

---

## Test 4: Create a Test Shipment

**Prerequisite:** Need a ProductionOrder with status "completed"

```bash
# Step 1: If you have incoming orders from Test 2/3
# Use that order ID in the request below

# Create shipment for order ID 1
curl -X POST http://localhost:3000/api/shipments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sales_order_id": 5,
    "expected_delivery_date": "2025-02-15",
    "items": [
      {
        "product_id": 1,
        "quantity": 100,
        "unit": "pcs"
      }
    ],
    "total_quantity": 100,
    "shipping_address": "123 Main St, City",
    "courier_company": "FastShip",
    "shipping_cost": 500,
    "recipient_name": "John Doe",
    "recipient_phone": "9876543210"
  }'
```

**Expected Response:**
```json
{
  "message": "Shipment created successfully",
  "shipment": {
    "id": 3,
    "shipment_number": "SHP-20250117-0001",
    "status": "preparing",
    "sales_order_id": 5,
    ...
  }
}
```

**Note the shipment ID** (e.g., 3) - you'll use it in next tests

---

## Test 5: Update Shipment Status (THE FIX!)

**Goal:** Test the main fix - updating shipment status

```bash
# Update shipment ID 3 to "shipped"
curl -X PUT http://localhost:3000/api/orders/3/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "shipped",
    "department": "shipment",
    "action": "dispatch_shipment",
    "notes": "Shipment dispatched via FastShip"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "shipment status updated successfully",
  "order": {
    "id": 3,
    "status": "shipped",
    "type": "shipment"
  }
}
```

**Before Fix:** ❌ 500 Error - "Data truncated for column 'status'"  
**After Fix:** ✅ Success response with shipment info

---

## Test 6: Verify Shipment Tracking Entry

**Goal:** Confirm tracking entry was auto-created

```bash
# Get shipment details
curl http://localhost:3000/api/shipments/3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response Contains:**
```json
{
  "shipment": {
    "id": 3,
    "status": "shipped",
    "last_status_update": "2025-01-17T10:30:45.123Z",
    "trackingUpdates": [
      {
        "shipment_id": 3,
        "status": "preparing",
        "description": "Shipment created and preparing for dispatch",
        "timestamp": "2025-01-17T10:25:00.000Z"
      },
      {
        "shipment_id": 3,
        "status": "shipped",
        "description": "Status updated from preparing to shipped",
        "timestamp": "2025-01-17T10:30:45.123Z"
      }
    ]
  }
}
```

**Verify:** Last tracking entry shows your status update

---

## Test 7: Test All Shipment Status Transitions

```bash
# Test "in_transit"
curl -X PUT http://localhost:3000/api/orders/3/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "in_transit", "department": "shipment"}'

# Test "out_for_delivery"
curl -X PUT http://localhost:3000/api/orders/3/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "out_for_delivery", "department": "shipment"}'

# Test "delivered"
curl -X PUT http://localhost:3000/api/orders/3/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "delivered", "department": "shipment"}'
```

**Expected:** All succeed with 200 status code

---

## Test 8: Test ProductionOrder Status Mapping

**Goal:** Test that ready_for_shipment maps to completed

**Prerequisites:**
- Existing ProductionOrder ID (let's say 2)
- That ProductionOrder has a linked SalesOrder ID (let's say 5)

```bash
# Update ProductionOrder 2 with ready_for_shipment
curl -X PUT http://localhost:3000/api/orders/2/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "ready_for_shipment",
    "department": "manufacturing",
    "action": "production_completed"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "production_order status updated successfully",
  "order": {
    "id": 2,
    "status": "completed",
    "type": "production_order"
  },
  "linkedSalesOrder": {
    "id": 5,
    "status": "ready_to_ship",
    "message": "Linked SalesOrder automatically updated to ready_to_ship"
  }
}
```

**Verify:**
- ProductionOrder status → "completed" ✅
- SalesOrder status → "ready_to_ship" ✅
- SalesOrder appears in ShipmentDashboard ready for shipment ✅

---

## Test 9: Error Handling - Invalid Status

**Goal:** Test that invalid statuses are rejected

```bash
# Try invalid shipment status
curl -X PUT http://localhost:3000/api/orders/3/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "invalid_status"}'
```

**Expected Response:**
```
500 Error: "Data truncated for column 'status' at row 1"
```

**Note:** This is expected - Sequelize validates ENUM before DB update  
**Workaround:** Use valid status values only

---

## Test 10: Error Handling - Order Not Found

**Goal:** Test handling of non-existent order

```bash
curl -X PUT http://localhost:3000/api/orders/99999/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "shipped"}'
```

**Expected Response:**
```json
{
  "message": "Order not found"
}
```

**Status Code:** 404

---

## Test 11: UI Test - ShipmentDashboard

**Goal:** Test through the web interface

### Steps:

1. **Navigate to Shipment Dashboard**
   - URL: `http://localhost:3000/shipment/dashboard` or menu link
   - Should load without errors

2. **Click "Incoming Orders" Tab**
   - Should show table of incoming orders
   - If empty: create and complete a ProductionOrder first
   - Click refresh button if needed

3. **View an Order**
   - Click eye icon to see order details
   - Should show: order number, customer, product, quantity

4. **Create Shipment**
   - Click truck icon on any order
   - Should navigate to shipment creation
   - Form should pre-fill with order data
   - Fill remaining fields and submit
   - Should succeed with shipment number (SHP-YYYYMMDD-XXXX)

5. **View Shipments Tab**
   - Click "Active Shipments" tab
   - Should show your newly created shipment
   - Status should be "preparing"
   - Click on shipment to view details

6. **Update Status**
   - From shipment details, update status
   - Change to "shipped", "in_transit", "delivered"
   - Should update without errors
   - Tracking timeline should update

---

## Quick Validation Checklist

- [ ] **Test 1:** API responds without connection errors
- [ ] **Test 2:** Incoming orders endpoint returns data or empty array
- [ ] **Test 3:** Status mapping works (ready_for_shipment → completed)
- [ ] **Test 4:** Can create shipment successfully
- [ ] **Test 5:** ✅ **MAIN TEST**: Can update shipment status without 500 error
- [ ] **Test 6:** Tracking entries auto-created for status changes
- [ ] **Test 7:** All status transitions succeed
- [ ] **Test 8:** ProductionOrder status mapping works correctly
- [ ] **Test 9:** Invalid statuses properly rejected
- [ ] **Test 10:** Not-found errors handled gracefully
- [ ] **Test 11:** Dashboard UI works end-to-end

---

## Success Indicators

✅ **Before vs After:**

| Aspect | Before | After |
|--------|--------|-------|
| Shipment status update | ❌ 500 error | ✅ Success |
| Error message | "Data truncated" | N/A |
| Incoming orders | ❌ None shown | ✅ Shows completed orders |
| Tracking entries | ❌ Not created | ✅ Auto-created |
| Status mapping | ❌ Not mapped | ✅ Intelligent mapping |
| Cross-order sync | ❌ Manual | ✅ Automatic |

---

## Troubleshooting Failed Tests

### Test 5 Still Fails with 500 Error?

1. **Restart server**
   ```bash
   # Kill existing Node process and restart
   npm start
   ```

2. **Clear cache**
   ```bash
   # Restart browser
   # Clear browser cache
   # Refresh page with Ctrl+F5
   ```

3. **Verify file changes**
   - Open `server/routes/orders.js`
   - Verify Shipment model is imported
   - Verify Shipment check is added in endpoint

4. **Check database**
   - Verify shipment with ID 3 exists
   - Check shipment status column type is ENUM

### Test 2 Returns Empty Array?

1. **Create a ProductionOrder**
   - Go to Manufacturing Dashboard
   - Create new production order
   - Mark as "completed"

2. **Verify Status**
   ```bash
   # Query database
   SELECT id, status FROM production_orders LIMIT 5;
   ```

3. **Retry Test 2**

### Test 11 Shows No Incoming Orders?

1. **Refresh the page** - `Ctrl+F5`
2. **Create a completed production order** first
3. **Check browser console** for JavaScript errors
4. **Verify backend API** is responding with Test 2

---

## Support

If tests are still failing:

1. Check browser console for error messages
2. Check server logs for backend errors
3. Verify database connection is working
4. Ensure all files were modified correctly
5. See `SHIPMENT_DASHBOARD_STATUS_FIX.md` for detailed technical info

---

**Happy Testing!** 🚀