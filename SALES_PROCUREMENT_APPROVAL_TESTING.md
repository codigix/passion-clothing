# ✅ Sales Order → Procurement Approval - Testing Guide

## 🐛 Issue Fixed

**Problem:** "Send to Procurement" button was showing for `confirmed` orders instead of `draft` orders.

**Solution:** Button now correctly appears only for:
- Orders with status = `draft`
- Orders that haven't been sent yet (`ready_for_procurement = false`)

---

## 🧪 Testing Steps

### **Test 1: Create and Send Sales Order to Procurement**

#### Step 1.1: Create Sales Order as Draft
1. **Login as Sales User**
2. Navigate to: **Sales Dashboard**
3. Click: **"Create Sales Order"** button
4. Fill in order details:
   - Customer: Select or create
   - Products/Items
   - Delivery Date
   - Quantities
5. Click: **"Save as Draft"**
6. ✅ **Expected:** Order created with status badge showing "DRAFT" (gray)

#### Step 1.2: Send to Procurement
1. Find the newly created draft order in the orders table
2. Look at the **Actions** column (last column)
3. ✅ **Expected:** You should see:
   - 👁️ View button (blue)
   - ✏️ Edit button (purple)
   - 📱 QR Code button (green)
   - 📤 **Send to Procurement button (orange)** ← This should be visible!
4. Click: **📤 Send to Procurement** button
5. Confirm: Click "Yes" in the dialog
6. ✅ **Expected:** 
   - Success message: "Order sent to procurement successfully"
   - Order refreshes
   - 📤 button disappears
   - New indicator appears: **"⏳ Awaiting Approval"** (yellow badge)

---

### **Test 2: Procurement Receives and Approves Order**

#### Step 2.1: View Incoming Orders (Procurement)
1. **Login as Procurement User** (or switch to Procurement department)
2. Navigate to: **Procurement Dashboard**
3. Look at tabs: Click **"Incoming Orders"** tab
4. ✅ **Expected:** Badge showing count like "(1)" next to tab name
5. ✅ **Expected:** Table showing:
   - Order number (SO-XXXXXX-XXXX)
   - Customer name
   - Delivery date
   - Items/products
   - Status: "DRAFT"
   - Actions: **✅ Accept** button (green)

#### Step 2.2: Accept/Approve Order
1. Click: **✅ Accept** button
2. Confirm: Click "Yes" in the dialog
3. ✅ **Expected:**
   - Success message: "Order confirmed successfully. Sales department has been notified."
   - Order disappears from "Incoming Orders" tab
   - Order now appears in regular Purchase Orders list

---

### **Test 3: Verify Status Update on Sales Dashboard**

#### Step 3.1: Check Status on Sales Dashboard
1. **Switch back to Sales User** (or refresh Sales Dashboard)
2. Navigate to: **Sales Dashboard**
3. Find the order you sent to procurement
4. ✅ **Expected:** 
   - Status badge shows: **"CONFIRMED"** (blue)
   - "⏳ Awaiting Approval" indicator is gone
   - Status badge changed from gray to blue
   - Progress bar increased (10% → 25%)

#### Step 3.2: Verify Order Details
1. Click: **👁️ View** button on the confirmed order
2. ✅ **Expected:** Order details page shows:
   - Status: Confirmed
   - Confirmed By: [Procurement User Name]
   - Confirmed At: [Timestamp]
   - Lifecycle history updated

---

## 📊 Visual Flow After Fix

```
┌──────────────────────────────────────────────────────────────────┐
│                      SALES DASHBOARD                              │
│  Draft Order: SO-20250102-0001                                    │
│  Status: [DRAFT] (gray badge)                                     │
│  Actions: [👁️] [✏️] [📱] [📤 Send to Procurement] ← VISIBLE!    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Click "Send to Procurement"
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      SALES DASHBOARD                              │
│  Draft Order: SO-20250102-0001                                    │
│  Status: [DRAFT] (gray badge)                                     │
│  Actions: [👁️] [✏️] [📱] [⏳ Awaiting Approval] ← NEW!          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Notification sent
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                  PROCUREMENT DASHBOARD                            │
│  Tab: [Incoming Orders (1)] ← Badge count                         │
│                                                                    │
│  SO-20250102-0001 | Customer ABC | 100 pcs | [✅ Accept]         │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Click "Accept"
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      SALES DASHBOARD                              │
│  Confirmed Order: SO-20250102-0001                                │
│  Status: [CONFIRMED] (blue badge) ← STATUS CHANGED!              │
│  Confirmed by: Procurement User                                   │
│  Actions: [👁️] [✏️] [📱]                                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔍 What Changed in the Code

### Before Fix:
```javascript
{order.status === 'confirmed' && (
  <button onClick={handleSendToProcurement}>
    Send to Procurement
  </button>
)}
```
❌ Button only appeared for CONFIRMED orders (wrong!)

### After Fix:
```javascript
{/* Button for DRAFT orders not yet sent */}
{order.status === 'draft' && !order.ready_for_procurement && (
  <button onClick={handleSendToProcurement}>
    Send to Procurement
  </button>
)}

{/* Indicator for DRAFT orders waiting for approval */}
{order.status === 'draft' && order.ready_for_procurement && (
  <span>⏳ Awaiting Approval</span>
)}
```
✅ Button appears for DRAFT orders that haven't been sent yet  
✅ Shows "Awaiting Approval" indicator after sending

---

## 🎯 Expected Behavior Summary

| Order State | Status | ready_for_procurement | Actions Visible |
|-------------|--------|----------------------|-----------------|
| Just Created | `draft` | `false` | View, Edit, QR, **📤 Send to Procurement** |
| Sent to Procurement | `draft` | `true` | View, Edit, QR, **⏳ Awaiting Approval** |
| Approved by Procurement | `confirmed` | `true` | View, Edit, QR |

---

## 🚨 Common Issues & Solutions

### Issue 1: "Send to Procurement" button not visible
**Possible Causes:**
1. Order status is not "draft"
2. Order already sent (ready_for_procurement = true)
3. Page cache - need to refresh

**Solution:**
- Verify order status is "draft" in database
- Refresh page (F5)
- Check browser console for errors

---

### Issue 2: Procurement doesn't see incoming order
**Possible Causes:**
1. Order not actually sent (check ready_for_procurement flag)
2. Procurement user not in correct department
3. Filter applied on Incoming Orders tab

**Solution:**
- Check database: `SELECT * FROM sales_orders WHERE ready_for_procurement = true AND status = 'draft'`
- Verify user's department in Users table
- Remove any filters on Procurement Dashboard

---

### Issue 3: Status not updating after procurement accepts
**Possible Causes:**
1. API error (check browser console)
2. Permission issue
3. Database constraint error

**Solution:**
- Open browser DevTools (F12) → Network tab
- Click Accept button again
- Look for error response
- Check server logs

---

## 📝 Database Verification Queries

### Check order status after sending to procurement:
```sql
SELECT 
    id,
    order_number,
    status,
    ready_for_procurement,
    ready_for_procurement_by,
    ready_for_procurement_at
FROM sales_orders
WHERE order_number = 'SO-20250102-0001';
```

**Expected After Sending:**
- status: `draft`
- ready_for_procurement: `1` (true)
- ready_for_procurement_by: [Sales User ID]
- ready_for_procurement_at: [Timestamp]

### Check order status after procurement approval:
```sql
SELECT 
    id,
    order_number,
    status,
    ready_for_procurement,
    approved_by,
    approved_at
FROM sales_orders
WHERE order_number = 'SO-20250102-0001';
```

**Expected After Approval:**
- status: `confirmed`
- ready_for_procurement: `1` (true)
- approved_by: [Procurement User ID]
- approved_at: [Timestamp]

---

## ✅ Success Checklist

After testing, verify:

- [ ] Draft orders show "📤 Send to Procurement" button
- [ ] After sending, button disappears and "⏳ Awaiting Approval" appears
- [ ] Procurement sees order in "Incoming Orders" tab
- [ ] Procurement can click "Accept" to confirm order
- [ ] Sales Dashboard shows status changed to "Confirmed"
- [ ] Notifications sent to both departments
- [ ] Lifecycle history updated with approval details
- [ ] No console errors during the entire flow

---

## 🎉 Final Notes

The workflow is now **fully functional** and matches your requirements:

1. ✅ Create SO as draft in Sales Dashboard
2. ✅ Send SO request to Procurement Department
3. ✅ Procurement approves request
4. ✅ Status changes from "draft" to "confirmed"
5. ✅ Sales Dashboard updates automatically

**The fix ensures the button appears at the correct stage (DRAFT) instead of after confirmation (CONFIRMED).**

---

**Last Updated:** January 2025  
**Status:** ✅ Fixed and Ready for Testing