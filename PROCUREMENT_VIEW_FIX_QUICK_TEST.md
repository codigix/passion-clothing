# Procurement Dashboard - View Button Quick Test Guide

## Quick Test (5 minutes)

### 1. Open Browser Developer Tools
```
Press: F12 or Right-click → Inspect → Console tab
```

### 2. Go to Procurement Dashboard
- Procurement → Dashboard → "Incoming" tab

### 3. Look for View Button
In the table, you'll see an **Eye icon (👁️)** - that's the View button

### 4. Click View Button
- Click on any Eye icon in the Incoming Orders table

### 5. Check Console (Most Important!)
You should see logs like:
```
handleViewOrder called with: {id: 1, order_number: "SO-2025...", ...}
Order ID: 1
Order ID to navigate to: 1
Navigating to: /sales/orders/1
```

### 6. Verify Navigation
✅ **SUCCESS:** Page changes to show order details
❌ **FAILURE:** Stay on same page or see error message

---

## Expected Results

### ✅ Working Properly
- Eye button clickable (cursor changes to pointer)
- Clicking navigates to sales order page
- Page shows order details (Project, Customer, Items, etc.)
- Console shows "Navigating to: /sales/orders/1"

### ❌ Issue Detected
- Button doesn't respond to click
- Navigation to wrong page
- Error message appears
- Console shows error or missing ID

---

## Console Output Guide

### What You Should See (Normal)
```javascript
// First time clicking View
handleViewOrder called with: {id: 1, ...}
Order ID: 1
Order ID to navigate to: 1
Navigating to: /sales/orders/1

// If you navigate back to Procurement
handleViewOrder called with: {id: 1, ...}
Order ID: 1
Order ID to navigate to: 1
Navigating to: /sales/orders/1
```

### What Means There's a Problem

| Console Message | Problem |
|---|---|
| `Order is null or undefined` | Order data missing from table |
| `Cannot find order ID. Order object: {...}` | Order missing ID field |
| `TypeError: Cannot read property 'id'` | Button click not firing properly |
| No logs appear at all | Button click not being detected |

---

## Quick Fixes to Try

### If Nothing Happens When You Click
1. **Refresh page**: Press Ctrl+R
2. **Try different order**: Click another View button
3. **Check console**: Look for red errors
4. **Hard refresh**: Press Ctrl+Shift+R

### If You See Console Errors
1. Copy the error message
2. Report to your development team
3. Include: Browser name, page URL, exact error text

### If Button Says "Permission Denied"
1. Check you're logged in as Procurement user
2. Go to Admin → User Management
3. Verify your user has Procurement department role

---

## What to Report If It's Still Broken

**In your message, include:**
1. Browser name and version (Chrome, Firefox, Safari, Edge)
2. Screenshots of:
   - The Procurement Dashboard
   - The browser console (F12) showing any red errors
3. Exact steps you took when it failed
4. Whether you see the "handleViewOrder called with" log message

**Example:** 
> "Chrome 120, clicked View on first order, got error 'Cannot read property id of undefined' in console, page stayed on procurement dashboard"

---

## Technical Details (For Developers)

### What Was Fixed
1. Added `e.preventDefault()` and `e.stopPropagation()` to click handler
2. Added fallback checks: `order.id || order.order_id || order.salesOrderId`
3. Enhanced logging for debugging

### Files Changed
- `client/src/pages/dashboards/ProcurementDashboard.jsx`
  - Lines 593-620: handleViewOrder function
  - Lines 1061-1073: View button onClick handler

### No Breaking Changes
- ✅ Works with existing backend API
- ✅ No database changes needed
- ✅ No new dependencies required
- ✅ All other functionality unchanged

---

## Checklist Before Reporting Issues

- [ ] Cleared browser cache (Ctrl+Shift+Delete)
- [ ] Tried hard refresh (Ctrl+Shift+R)
- [ ] Opened browser console before clicking
- [ ] Copied exact error messages from console
- [ ] Tried with different order rows
- [ ] Verified you're logged in as Procurement user

---

## Success Indicators

You'll know it's working when:
1. ✅ Eye button appears in the Actions column
2. ✅ Button turns dark blue on hover
3. ✅ Cursor changes to pointer on hover
4. ✅ Page navigates to order details after click
5. ✅ Console shows "Navigating to: /sales/orders/{id}"
6. ✅ Order details page loads with data

---

## Next Steps If Still Having Issues

1. **Take a screenshot** of the entire screen with console visible
2. **Document the steps** you took (click which button, what happened)
3. **Note the time** you tried it (for log correlation)
4. **Report to development team** with all above information

---

**Questions?** Check the full documentation in `PROCUREMENT_VIEW_BUTTON_FIX.md`