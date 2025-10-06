# Fix: Pending Approvals Not Showing

## 🐛 **Bug Report**
**Issue:** Purchase Orders with status `pending_approval` were being created successfully but were not appearing in the Admin Panel's "Pending Approvals" tab.

**Root Cause:** Field name mismatch between backend response and frontend expectations.

---

## 🔍 **Technical Analysis**

### Backend (procurement.js)
```javascript
// Line 279-286
res.json({
  purchaseOrders: rows,  // ← Backend returns "purchaseOrders"
  pagination: {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(count / limit)
  }
});
```

### Frontend (Before Fix)
```javascript
// PendingApprovalsPage.jsx - Line 41
const pos = response.data.pos || [];  // ← Looking for "pos" (not found!)

// Sidebar.jsx - Line 56
setPendingApprovalsCount(response.data.pos?.length || 0);  // ← Also wrong!
```

**Result:** The API returned data as `purchaseOrders`, but the frontend was looking for `pos`, resulting in an empty array.

---

## ✅ **Solution Applied**

### Files Fixed:

#### 1. **PendingApprovalsPage.jsx**
```javascript
// BEFORE (Line 41)
const pos = response.data.pos || [];

// AFTER (Line 41)
const pos = response.data.purchaseOrders || response.data.pos || [];
```

#### 2. **Sidebar.jsx** (Pending Approvals Badge Count)
```javascript
// BEFORE (Line 56)
setPendingApprovalsCount(response.data.pos?.length || 0);

// AFTER (Lines 56-57)
const pos = response.data.purchaseOrders || response.data.pos || [];
setPendingApprovalsCount(pos.length);
```

---

## 🧪 **Testing**

### Steps to Verify:
1. **Login** as Procurement or Admin user
2. **Create a new Purchase Order** via `/procurement/purchase-orders`
3. **Fill required fields:**
   - Vendor ✅
   - Expected Delivery Date ✅
   - At least 1 item ✅
4. **Click "Save Draft"** (automatically goes to `pending_approval` status)
5. **Navigate to:**
   - Admin Panel → "Pending Approvals" tab
   - OR: `/procurement/pending-approvals`
6. **Expected Result:** ✅ PO should appear in the list

### Sidebar Badge:
- **Check:** Procurement sidebar should show badge count next to "Pending Approvals"
- **Count:** Should match number of POs with status `pending_approval`

---

## 📊 **Impact**

### Before Fix:
- ❌ POs created but invisible in approval queue
- ❌ Admins couldn't see pending requests
- ❌ Workflow blocked (no way to approve)
- ❌ Badge count always showed 0

### After Fix:
- ✅ All pending POs visible in approval queue
- ✅ Admin can approve/reject orders
- ✅ Badge count shows correct number
- ✅ Complete workflow functional

---

## 🔄 **Related Components**

### This fix ensures compatibility with:
- **AdminDashboard.jsx** (already had fallback: `purchaseOrders || pos`)
- **Backend procurement routes** (unchanged)
- **PO creation workflow** (unchanged)
- **GRN workflow** (depends on approved POs)

---

## 📝 **Notes**

### Why use both `purchaseOrders` and `pos`?
The fix uses: `response.data.purchaseOrders || response.data.pos || []`

This approach:
1. **Primarily looks for** `purchaseOrders` (correct field from backend)
2. **Falls back to** `pos` (for backwards compatibility if backend changes)
3. **Defaults to** empty array (prevents crashes)

### Backend Consistency:
The backend route `/procurement/pos` (GET) returns different field names:
- GET `/procurement/pos` → `purchaseOrders`
- Some older endpoints might return `pos`

The frontend now handles both formats gracefully.

---

## ✨ **Status: RESOLVED**

**Date:** January 2025  
**Fixed By:** Zencoder AI Assistant  
**Files Modified:**
- `client/src/pages/procurement/PendingApprovalsPage.jsx`
- `client/src/components/layout/Sidebar.jsx`

**Testing:** Ready for user verification