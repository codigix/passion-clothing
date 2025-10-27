# Testing Guide - Incoming Orders Live Status Feature

## Pre-Test Checklist ✅

Before testing, ensure:
- [ ] Both backend and frontend servers are running
- [ ] Database is connected and has test data
- [ ] You have shipment user permissions
- [ ] Browser dev tools available (F12)

---

## Test Scenarios

### Test 1: Initial Load ✅ BASIC
**Goal**: Verify incoming orders load with new status fields

**Steps**:
1. Navigate to Shipment Dashboard → Incoming Orders tab
2. Verify table loads with data
3. Check for new "Status" column

**Expected Result**:
- ✅ Orders display
- ✅ Status column shows "Ready for Shipment" (yellow badge)
- ✅ All orders have status badges
- ✅ No console errors

**Verification**:
```javascript
// In browser console (F12)
// Check if orders have shipment info:
JSON.stringify(incomingOrders[0], null, 2)
// Should show: can_create_shipment: true, is_dispatched: false, is_delivered: false
```

---

### Test 2: Live Update Button ✅ UI
**Goal**: Verify Live/Manual toggle works

**Steps**:
1. Look for "Live" button (green) at top-right
2. Verify it shows "Live" when ON
3. Click button to toggle to "Manual"
4. Verify button changes to gray "Manual"
5. Click again to toggle back to "Live"

**Expected Result**:
- ✅ Live button visible and clickable
- ✅ Changes color: green (ON) ↔ gray (OFF)
- ✅ Text changes: "Live" ↔ "Manual"

---

### Test 3: Create Shipment ✅ CORE
**Goal**: Verify shipment creation and status update

**Steps**:
1. Find an order with "Ready for Shipment" status
2. Click the **Truck 🚚** button
3. Fill in shipment details (see Create Shipment page)
4. Submit the form
5. Wait for confirmation
6. **Check Incoming Orders tab** - should show updated status

**Expected Result**:
- ✅ Shipment created successfully
- ✅ Order status changes from yellow to blue/purple
- ✅ Creates "In Transit" or similar status
- ✅ Truck button disappears
- ✅ Link button appears (optional)

**Verification**:
```javascript
// Check if shipment was linked
console.log(incomingOrders[0].shipment_status)
// Should show: 'in_transit', 'packed', or other status (not null)
```

---

### Test 4: Live Auto-Refresh ✅ AUTO
**Goal**: Verify data refreshes every 10 seconds

**Steps**:
1. Open browser console (F12)
2. Look for timestamps or add logging
3. Keep Incoming Orders tab active
4. Wait 15 seconds
5. Check if data refreshed (order count, timestamps)

**Expected Result**:
- ✅ Data refreshes automatically
- ✅ No manual action needed
- ✅ No errors in console
- ✅ Only refreshes when on Incoming Orders tab

**Verification**:
```javascript
// In console, add tracking:
let lastRefresh = Date.now();
// Wait 15 seconds and check if incomingOrders updates
// Look for network requests in Network tab showing API calls every ~10 seconds
```

---

### Test 5: Disable "Create Shipment" After Dispatch ✅ CRITICAL
**Goal**: Verify Truck button disappears after shipment creation

**Steps**:
1. Create a shipment for an order (Test 3)
2. Look at that order in Incoming Orders
3. Verify Truck button is **NOT visible**
4. Try to click where button was (should do nothing)

**Expected Result**:
- ✅ Truck button gone/hidden
- ✅ Cannot create duplicate shipment
- ✅ Only "Eye" and "Link" buttons visible
- ✅ Row has blue background

**Verification**:
```javascript
// Check order properties:
const order = incomingOrders.find(o => o.shipment_number);
console.log('can_create_shipment:', order.can_create_shipment) // false
console.log('is_dispatched:', order.is_dispatched) // true
```

---

### Test 6: Status Badges Color Coding ✅ UI
**Goal**: Verify status badges show correct colors

**Steps**:
1. Look at status column in table
2. Verify colors match:
   - Yellow = Ready for Shipment
   - Blue = In Transit
   - Purple = Out for Delivery
   - Green = Delivered

**Expected Result**:
- ✅ Colors match legend
- ✅ Text is readable
- ✅ No color overlaps or issues

**Reference Colors**:
```
- Ready: bg-yellow-100 text-yellow-700 (yellow badge)
- In Transit: bg-blue-100 text-blue-700 (blue badge)
- Out for Delivery: bg-purple-100 text-purple-700 (purple badge)
- Delivered: bg-green-100 text-green-700 (green badge)
```

---

### Test 7: Delivered Orders Hidden ✅ FILTERING
**Goal**: Verify delivered orders excluded

**Steps**:
1. Manually create/mark an order as "delivered" (database)
2. Refresh the page
3. Verify delivered order **NOT in list**
4. Go to Active Shipments tab and look there

**Expected Result**:
- ✅ Delivered orders hidden from Incoming Orders
- ✅ Count decreases
- ✅ Can see in Active Shipments tab instead

**Database Check**:
```sql
-- Check if delivered shipment exists
SELECT * FROM shipments WHERE status = 'delivered' LIMIT 1;
-- If exists, its order should NOT appear in Incoming Orders list
```

---

### Test 8: Manual Refresh Mode ✅ MANUAL
**Goal**: Verify Manual mode allows on-demand refresh

**Steps**:
1. Click "Live" button to switch to "Manual"
2. Button should turn gray and say "Manual"
3. Make a change (create shipment in another window)
4. Click main "Refresh" button
5. Verify data updates

**Expected Result**:
- ✅ Auto-refresh stops (no 10-second updates)
- ✅ Manual refresh works when clicked
- ✅ Data updates on demand

---

### Test 9: Tab Switching ✅ AUTO
**Goal**: Verify auto-refresh stops when leaving tab

**Steps**:
1. Stay on Incoming Orders with "Live" mode ON
2. Count console logs or API calls (~1 every 10 sec)
3. Switch to another tab (e.g., Active Shipments)
4. Wait 15 seconds
5. No auto-refresh should happen
6. Switch back to Incoming Orders
7. Auto-refresh should resume

**Expected Result**:
- ✅ Auto-refresh active only on Incoming Orders tab
- ✅ Stops when you leave
- ✅ Resumes when you return
- ✅ Saves bandwidth

---

### Test 10: Multiple Shipments ✅ STRESS
**Goal**: Verify system handles multiple orders correctly

**Steps**:
1. Create 5+ orders ready for shipment
2. Create shipments for 3 of them
3. Verify:
   - Ready orders: Yellow, Truck visible ✅
   - Dispatched orders: Blue, Truck hidden ✅
   - Colors and statuses mix correctly

**Expected Result**:
- ✅ Each order shows correct status independently
- ✅ No cross-contamination
- ✅ All buttons work as expected

---

### Test 11: Real-Time Update Scenario ✅ INTEGRATION
**Goal**: End-to-end test of live status updates

**Steps**:
1. Open Incoming Orders tab in browser window A
2. Open same in browser window B (or different user)
3. In Window B, create a shipment for an order
4. In Window A, wait 10 seconds
5. Verify status updates without manual refresh

**Expected Result**:
- ✅ Window A sees status change automatically
- ✅ Live updates work across sessions
- ✅ No manual refresh needed
- ✅ Status consistent everywhere

---

### Test 12: Error Handling ✅ EDGE
**Goal**: Verify graceful error handling

**Steps**:
1. Stop backend server
2. Try to refresh (Incoming Orders should error gracefully)
3. Restart backend
4. Data should resume loading
5. No "hard crash" should occur

**Expected Result**:
- ✅ Toast error message shows
- ✅ Page doesn't crash
- ✅ Retry button available
- ✅ Resume on server restart

---

## Browser Console Testing

### Copy-Paste Verification Scripts

**Check Live Refresh Active**:
```javascript
// Run in console
let count = 0;
const original = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('/shipments/orders/incoming')) {
    count++;
    console.log(`[AUTO-REFRESH] API call #${count} at`, new Date().toLocaleTimeString());
  }
  return original.apply(this, args);
};
// Wait 30 seconds and check count - should be ~3 calls
```

**Check Order Status Fields**:
```javascript
// Run in console
const orders = document.querySelectorAll('tbody tr');
orders.forEach((row, i) => {
  console.log(`Order ${i + 1}:`, {
    status: row.querySelector('[class*="yellow"], [class*="blue"], [class*="purple"]')?.textContent,
    hasCreateBtn: !!row.querySelector('[title*="Create"]'),
    hasTrackBtn: !!row.querySelector('[title*="tracking"]'),
    hasBlueBackground: row.classList.toString().includes('blue-50')
  });
});
```

**Monitor Auto-Refresh Interval**:
```javascript
// Check if interval is set up
setInterval(() => {
  const now = new Date().toLocaleTimeString();
  console.log(`✓ Still running at ${now}`);
}, 10000);
```

---

## Performance Testing

### Measure Refresh Performance
```javascript
// In console
console.time('incoming-orders-fetch');
await fetch('/api/shipments/orders/incoming').then(r => r.json());
console.timeEnd('incoming-orders-fetch');
// Should complete in < 500ms
```

### Monitor Memory
- Open DevTools Memory tab
- Create multiple shipments
- Verify no memory leaks
- Should stay stable

---

## Network Testing

### Check API Calls
1. Open DevTools → Network tab
2. Stay on Incoming Orders tab for 30 seconds
3. Filter by XHR/Fetch
4. Look for `/shipments/orders/incoming` calls
5. Should see calls every ~10 seconds

**Expected Pattern**:
```
✓ GET /shipments/orders/incoming  (0-2 sec)
✓ GET /shipments/orders/incoming  (10-12 sec)
✓ GET /shipments/orders/incoming  (20-22 sec)
✓ GET /shipments/orders/incoming  (30-32 sec)
```

---

## Regression Testing

### Verify Existing Features Still Work
- [ ] View shipment details (Eye icon)
- [ ] Navigate to Create Shipment page
- [ ] Sort/filter in Active Shipments tab
- [ ] Main Refresh button works
- [ ] Export functionality (if available)
- [ ] Search/filter in other tabs

---

## Test Results Template

```
TEST DATE: ___________
TESTED BY: ___________
ENVIRONMENT: Development / Staging / Production

✅ Test 1: Initial Load - PASS / FAIL
   Notes: ________________

✅ Test 2: Live Button - PASS / FAIL
   Notes: ________________

✅ Test 3: Create Shipment - PASS / FAIL
   Notes: ________________

✅ Test 4: Auto-Refresh - PASS / FAIL
   Notes: ________________

✅ Test 5: Disable Button - PASS / FAIL
   Notes: ________________

✅ Test 6: Status Colors - PASS / FAIL
   Notes: ________________

✅ Test 7: Delivered Hidden - PASS / FAIL
   Notes: ________________

✅ Test 8: Manual Mode - PASS / FAIL
   Notes: ________________

✅ Test 9: Tab Switch - PASS / FAIL
   Notes: ________________

✅ Test 10: Multiple Orders - PASS / FAIL
   Notes: ________________

✅ Test 11: Real-Time Update - PASS / FAIL
   Notes: ________________

✅ Test 12: Error Handling - PASS / FAIL
   Notes: ________________

OVERALL RESULT: ✅ PASS / ❌ FAIL

Issues Found:
- Issue 1: ________________
- Issue 2: ________________

Sign-off: ___________
```

---

## Success Criteria ✅

All tests should PASS for feature to be production-ready:

- ✅ Live auto-refresh works (10-second interval)
- ✅ Status badges display correctly
- ✅ Truck button disappears after shipment creation
- ✅ Delivered orders hidden automatically
- ✅ Manual refresh mode available
- ✅ No console errors
- ✅ No duplicate shipments possible
- ✅ Status updates reflect in real-time
- ✅ Performance acceptable (< 500ms API calls)
- ✅ Auto-refresh stops when switching tabs

---

## Quick Test (5 Minutes)

If short on time, run these critical tests:

1. **Test 3**: Create Shipment ⭐
2. **Test 4**: Auto-Refresh ⭐
3. **Test 5**: Disable Button ⭐
4. **Test 11**: Real-Time Update ⭐

If all 4 pass, feature is working correctly! ✅