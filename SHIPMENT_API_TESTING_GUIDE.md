# 🧪 Shipment API Testing Guide

## Quick Start

### Step 1: Restart Your Backend
```powershell
# Kill existing process
Stop-Process -Name "node" -Force

# Restart server
npm start
# You should see: "Server running on port 5000"
```

### Step 2: Test in Browser

Go to: `http://localhost:3000/shipment`

---

## Test Case 1: Create Shipment ✅

**What to do:**
1. Click any order's "Create Shipment" button (blue)
2. Fill in the form:
   - Courier Company: `FedEx` or `DHL`
   - Tracking Number: Auto-generated ✅
   - Expected Delivery: Tomorrow or later
   - Recipient Name: `John Doe`
   - Phone: `+1-555-1234`
   - Email: `john@example.com`
   - Address: `123 Main St, City, State`
3. Click "Create Shipment"

**Expected Result:**
```
✅ Success message appears
✅ Green confirmation screen displays
✅ Shows shipment details
✅ Shows "Track Shipment" button (not "Create Shipment")
```

**If it fails:**
```
❌ Check browser console (F12)
❌ Look for error message
❌ Check server logs
```

---

## Test Case 2: Prevent Duplicate Shipment ❌

**What to do:**
1. Try to create a shipment for the SAME order twice
2. Click "Create Shipment" on same order again

**Expected Result:**
```
❌ Error message appears: "A shipment already exists for this order"
✅ User is not allowed to create duplicate
```

---

## Test Case 3: Update Shipment Status ✅

**What to do:**
1. After creating a shipment, go to Shipping Dashboard
2. Click "Track Shipment" button (green)
3. In the modal, update status:
   - Current: "Pending"
   - Change to: "Preparing"
   - Click "Update Status"

**Expected Result:**
```
✅ Status updates successfully
✅ Tracking history shows new entry
✅ No 500 errors in console
✅ Status badge updates in table
```

---

## Test Case 4: Invalid Status Transition ❌

**What to do:**
1. Try to jump from "pending" directly to "delivered"
2. Select "delivered" status
3. Click "Update Status"

**Expected Result:**
```
❌ Error message: "Invalid status transition from 'pending' to 'delivered'"
✅ Status not changed
```

---

## Browser Console Checks

### Open Developer Tools: F12

### ✅ Check #1: No 400 Errors
```javascript
// ❌ BAD (You should NOT see this):
Failed to load resource: the server responded with a status of 400 (Bad Request)

// ✅ GOOD (You should see this):
✅ Shipment created successfully!
```

### ✅ Check #2: No 500 Errors
```javascript
// ❌ BAD (You should NOT see this):
Failed to load resource: the server responded with a status of 500

// ✅ GOOD (You should see this):
Status updated successfully
```

### ✅ Check #3: Check Network Tab
1. Open Dev Tools → Network tab
2. Create shipment
3. Look for `POST /api/shipments/create-from-order/3`:
   - Status: **201** (Created) ✅ GOOD
   - Status: **400** (Bad Request) ❌ BAD
   - Status: **404** (Not Found) ❌ BAD
   - Status: **500** (Server Error) ❌ BAD

---

## Server Log Checks

### What to Look For

**In Server Terminal:**

### ✅ Good Signs:
```
[2025-01-18 10:30:45] POST /shipments/create-from-order/3 - 201 Created
[2025-01-18 10:31:00] PATCH /shipments/2/status - 200 OK
[2025-01-18 10:31:05] Shipment status updated successfully
```

### ❌ Bad Signs:
```
[2025-01-18 10:30:45] Error creating shipment: Cannot read property 'sales_order_id'
[2025-01-18 10:31:00] Status update error: QR code update failed
[2025-01-18 10:31:05] PATCH /shipments/2/status - 500 Error
```

---

## API Testing with Postman/cURL

### Test 1: Create Shipment

**cURL:**
```bash
curl -X POST http://localhost:5000/api/shipments/create-from-order/3 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courier_company": "FedEx",
    "tracking_number": "TRK-20250118-1234",
    "expected_delivery_date": "2025-01-25",
    "shipping_address": "123 Main St, City, State",
    "recipient_name": "John Doe",
    "recipient_phone": "+1-555-1234",
    "recipient_email": "john@example.com",
    "notes": "Handle with care"
  }'
```

**Expected Response (201):**
```json
{
  "message": "Shipment created successfully",
  "shipment": {
    "id": 2,
    "shipment_number": "SHP-20250118-0001",
    "status": "pending",
    "courier_company": "FedEx",
    "tracking_number": "TRK-20250118-1234",
    ...
  }
}
```

---

### Test 2: Update Status

**cURL:**
```bash
curl -X PATCH http://localhost:5000/api/shipments/2/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "preparing",
    "notes": "Packing order"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Shipment status updated from pending to preparing",
  "shipment": {
    "id": 2,
    "status": "preparing",
    "last_status_update": "2025-01-18T10:35:00Z",
    ...
  }
}
```

---

## Troubleshooting

### Problem: Still getting 400 errors

**Check list:**
1. ✅ Did you restart the server? (`npm start`)
2. ✅ Did changes save to `shipments.js`? (Check file timestamp)
3. ✅ Does sales_order_id exist? (Check database)
4. ✅ Is there already a shipment? (Check Shipments table)

**Solution:**
```powershell
# Clear Node cache and restart
npm run clean
npm install
npm start
```

---

### Problem: Still getting 500 errors

**Check list:**
1. ✅ Check server logs for specific error
2. ✅ Is QR code function failing? (Check logs for "QR code update failed")
3. ✅ Is tracking entry failing? (Check logs for "Tracking entry creation failed")
4. ✅ Check if sales order exists in database

**Solution:**
```powershell
# Restart with debugging
SET NODE_ENV=development
npm start
# Now 500 responses will show error messages
```

---

### Problem: Form validation errors

**Check list:**
1. ✅ Did you fill all required fields? (Name, Phone, Address, Date)
2. ✅ Is delivery date in the future? (Not today or past)
3. ✅ Is courier company selected? (Must select from dropdown)
4. ✅ Are there available agents? (If yes, must select one)

**Solution:**
- Check each field has a value
- Check delivery date is tomorrow or later
- Select courier from the search dropdown
- Select an agent if the dropdown appears

---

## Success Criteria Checklist

- [ ] ✅ No 400 errors when creating shipment
- [ ] ✅ No 500 errors when updating status
- [ ] ✅ Shipment number auto-generates (SHP-YYYYMMDD-XXXX)
- [ ] ✅ Status defaults to "pending"
- [ ] ✅ Can update status (pending → preparing → ...)
- [ ] ✅ Cannot create duplicate shipment
- [ ] ✅ Cannot update status without valid transition
- [ ] ✅ QR code update errors don't break the endpoint
- [ ] ✅ Tracking entries are created (or gracefully fail)
- [ ] ✅ Status updates reflect in dashboard

---

## Performance Benchmarks

**What to expect:**

| Operation | Time | Status |
|-----------|------|--------|
| Create Shipment | 200-300ms | ✅ Fast |
| Update Status | 100-200ms | ✅ Fast |
| Get Shipments | 200-400ms | ✅ Fast |
| Error Response | 50-100ms | ✅ Fast |

---

## What's Different

### Before This Fix:
```
Create Shipment Form
  ↓
POST /shipments/create-from-order/3
  ↓
❌ 400 Bad Request (Endpoint doesn't exist)
  ↓
❌ Error toast: "Failed to create shipment"
```

### After This Fix:
```
Create Shipment Form
  ↓
POST /shipments/create-from-order/3
  ↓
✅ Endpoint exists and processes request
  ↓
✅ Validates sales order
  ✅ Prevents duplicates
  ✅ Creates shipment
  ✅ Returns 201 Created
  ↓
✅ Success screen displays
```

---

## Still Having Issues?

### Gather this information:

1. **Error Message**: What does it say?
2. **Browser Console**: Any errors? (F12 → Console)
3. **Server Logs**: What does the terminal show?
4. **Exact Steps**: What did you do before the error?
5. **Screenshot**: Show the error screen

Then contact support with this info.

---

## Files Modified

```
✅ /server/routes/shipments.js
   - Added POST /create-from-order/:salesOrderId
   - Fixed PATCH /:id/status error handling
   - Fixed POST /:id/status error handling

✅ /client/src/pages/shipment/CreateShipmentPage.jsx
   - Fixed undefined deliveryAddress references
```

---

## When You're Done Testing

### ✅ Everything Working?
```
Great! You're ready to deploy.
npm run build
npm start (production)
```

### ❌ Still Seeing Errors?
```
1. Check the troubleshooting section above
2. Check file timestamps (were changes saved?)
3. Clear Node modules: npm install
4. Restart server: npm start
5. Try again
```

---

**Last Updated**: January 18, 2025  
**Status**: ✅ Ready to Test
