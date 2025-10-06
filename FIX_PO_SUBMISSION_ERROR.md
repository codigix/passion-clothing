# Fix: Unable to Send PO Request to Admin

## Problem
Getting errors when trying to create/submit Purchase Order for approval:
- 400 Bad Request  
- 500 Internal Server Error
- "Access token required"

## Root Causes Fixed

### 1. ✅ Notification Service Errors (500 Error) - FIXED
- **Issue**: Wrong association alias in `notificationService.js`
- **Fix Applied**: Changed `as: 'role'` to `as: 'roles'` (line 29)
- **Issue**: Invalid enum values for notification type and priority
- **Fix Applied**: Updated to use valid enum values in procurement routes

### 2. ⚠️ Authentication Error (401 Error) - ACTION REQUIRED
- **Issue**: "Access token required" means you're not authenticated
- **Action**: You need to login again

### 3. ⚠️ Validation Error (400 Error) - CHECK REQUIRED
- **Issue**: Missing required fields or invalid data in PO form
- **Action**: Verify all required fields are filled

---

## 🔧 TROUBLESHOOTING STEPS

### Step 1: Check if You're Logged In

1. **Open Browser Console** (F12 → Console tab)

2. **Run this command:**
   ```javascript
   console.log('Token:', localStorage.getItem('token'));
   console.log('User:', localStorage.getItem('user'));
   ```

3. **Expected Result:**
   - If you see `Token: null` → **You need to login!**
   - If you see a long string → You're logged in ✅

### Step 2: Re-Login

If token is missing:

1. **Logout** (if you see any user info in header)
2. **Login again** with your credentials
3. **Try creating PO again**

### Step 3: Check Required Fields

When creating a PO, ensure you fill:

**✅ Required Fields:**
- **Vendor** (must be selected)
- **Expected Delivery Date** (must be set)
- **At least ONE item** with:
  - Type (Fabric or Accessories)
  - Item Name/Fabric Name
  - Quantity
  - Rate
  - UOM (Unit of Measurement)

### Step 4: Test with Minimal Data

Try creating a simple PO with minimal data:

1. **Select a Vendor** ✅
2. **Set Expected Delivery Date** ✅  
3. **Add ONE item:**
   - Type: Fabric
   - Fabric Name: "Test Fabric"
   - Color: "Blue"
   - Quantity: 10
   - UOM: "Meters"
   - Rate: 100
4. **Click "Save Draft"** or "Send for Approval"

---

## 🎯 QUICK TEST

### Test If Server is Working:

1. **Open a new terminal**

2. **Run this command:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify" -Method Get -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"}
   ```
   Replace `YOUR_TOKEN_HERE` with your actual token from localStorage.

3. **Expected Result:**
   - If successful → Server authentication is working ✅
   - If error → Token is invalid/expired ❌

---

## 📋 WHAT WAS FIXED

### Backend Fixes Applied:

1. **server/utils/notificationService.js** (Line 29)
   ```javascript
   // ❌ Before:
   include: [{ model: Role, as: 'role' }]
   
   // ✅ After:
   include: [{ model: Role, as: 'roles' }]
   ```

2. **server/routes/procurement.js** (Lines 1313-1349)
   ```javascript
   // ❌ Before:
   type: 'po_approved_sent_to_vendor',
   priority: 'normal',
   related_order_id: po.id
   
   // ✅ After:
   type: 'procurement',
   priority: 'medium',
   related_entity_id: po.id,
   related_entity_type: 'purchase_order',
   trigger_event: 'po_approved_sent_to_vendor'
   ```

3. **Server Restarted** ✅

---

## 🚨 CURRENT ACTION REQUIRED

### You Need To:

1. **Login to the application again**
   - Go to `/login`
   - Enter your credentials
   - Login as a user with Procurement or Admin department

2. **Try creating a PO again**
   - Fill all required fields
   - Click "Save Draft" or "Send for Approval"

3. **Check browser console for errors**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for any red error messages
   - Share them if the issue persists

---

## 📊 HOW THE WORKFLOW WORKS NOW

### PO Creation Flow:

1. **User creates PO** → Status: `draft` or `pending_approval`
2. **User clicks "Send for Approval"** → Status: `pending_approval`
3. **Admin approves PO** → Status: `sent` + Notifications sent ✅
4. **Procurement receives notification** 📧
5. **Inventory receives notification** 📧
6. **Vendor receives PO** 📧

### Automated After Admin Approval:

✅ PO status changed to `sent`  
✅ Notification sent to Procurement Department  
✅ Notification sent to Inventory Department  
✅ Success toast message displayed  
✅ PO removed from "Pending Approvals" list

---

## 🔍 DEBUGGING COMMANDS

### Check if you're authenticated:
```javascript
// Run in browser console (F12)
const token = localStorage.getItem('token');
console.log('Authenticated:', !!token);
console.log('Token:', token);
```

### Check API connection:
```javascript
// Run in browser console (F12)
fetch('http://localhost:5000/api/auth/verify', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Test PO creation:
```javascript
// Run in browser console (F12)
const testPO = {
  vendor_id: 1, // Change to a valid vendor ID
  expected_delivery_date: '2025-02-20',
  items: [{
    type: 'fabric',
    fabric_name: 'Test Fabric',
    color: 'Blue',
    quantity: 10,
    rate: 100,
    uom: 'Meters',
    total: 1000
  }],
  priority: 'medium',
  status: 'pending_approval',
  discount_percentage: 0,
  tax_percentage: 12,
  freight: 0
};

fetch('http://localhost:5000/api/procurement/pos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify(testPO)
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## ✅ NEXT STEPS

1. **Login again** → Get fresh authentication token
2. **Try creating a simple PO** → Test with minimal data
3. **Check if it works** → Should see success message
4. **If still failing** → Share the browser console errors

---

**The backend is fixed. Now you just need to ensure you're properly authenticated!** 🚀