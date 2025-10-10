# Purchase Order Status Update Enhancement

## 🎯 Overview

Enhanced the Purchase Order creation workflow to provide immediate status feedback when a PO is created for a Sales Order. After successful PO creation, the system now:
- **Updates Sales Order status** to "procurement_created"
- **Sends notifications** to Sales and Procurement departments
- **Shows "PO Created ✓"** status in the dashboard immediately
- **Auto-navigates** back to dashboard after creation

---

## ✅ Changes Implemented

### 1. **Backend: Enhanced PO Creation Route** (`server/routes/procurement.js`)

#### What Changed:
- Added `linked_sales_order_id` field to PurchaseOrder record
- Enhanced sales order status update with lifecycle history tracking
- Added automatic notifications to Sales department
- Added notification to Procurement department for all new POs

#### Key Features:
```javascript
// Save the link in PurchaseOrder
linked_sales_order_id: req.body.linked_sales_order_id || null

// Update Sales Order status
await salesOrder.update({
  status: 'procurement_created',
  procurement_status: 'po_created',
  lifecycle_history: [...history]
});

// Notify Sales Department
await NotificationService.sendToDepartment('sales', {
  type: 'procurement',
  title: `Purchase Order Created: ${po_number}`,
  message: `PO created for Sales Order ${salesOrder.order_number}`,
  ...
});

// Notify Procurement Department
await NotificationService.notifyProcurementAction('created', purchaseOrder, userId);
```

---

### 2. **Frontend: Auto-Navigation After PO Creation** (`CreatePurchaseOrderPage.jsx`)

#### What Changed:
- After successful PO creation from a Sales Order, automatically navigates back to dashboard
- Shows success toast with PO number
- Passes success message to dashboard via location state
- 1.5 second delay for user to see success message before navigation

#### Implementation:
```javascript
toast.success(`✅ Purchase Order ${newOrder.po_number} created successfully!`);

// If linked to a sales order, navigate back to dashboard
if (linkedSalesOrder) {
  setTimeout(() => {
    navigate('/procurement/dashboard', { 
      state: { 
        message: `PO ${newOrder.po_number} created successfully for Sales Order ${linkedSalesOrder.order_number}` 
      } 
    });
  }, 1500);
}
```

---

### 3. **Frontend: Dashboard Success Message** (`ProcurementDashboard.jsx`)

#### What Changed:
- Added `useLocation` hook to capture navigation state
- Shows success message when redirected from PO creation
- Clears state after displaying message

#### Implementation:
```javascript
import { useNavigate, useLocation } from 'react-router-dom';

// Show success message if navigated from PO creation
useEffect(() => {
  if (location.state?.message) {
    toast.success(location.state.message);
    // Clear the state after showing the message
    navigate(location.pathname, { replace: true, state: {} });
  }
}, [location.state, location.pathname, navigate]);
```

---

## 🔄 Complete Workflow

### **User Journey: Creating PO from Sales Order**

1. **Procurement Dashboard** → Incoming Orders tab
2. User finds approved Sales Order
3. Clicks **"Create PO"** button
4. Redirected to Create PO page with pre-filled data
5. User fills in vendor, items, pricing
6. Clicks **"Submit for Approval"**

**✅ What Happens Now:**

```
Backend:
├─ Creates PurchaseOrder with linked_sales_order_id
├─ Updates SalesOrder status to "procurement_created"
├─ Adds lifecycle history entry to SalesOrder
├─ Sends notification to Sales department
└─ Sends notification to Procurement department

Frontend:
├─ Shows success toast: "PO PO-20250128-0001 created successfully!"
├─ Waits 1.5 seconds
├─ Auto-navigates to /procurement/dashboard
└─ Shows message: "PO created successfully for SO-..."

Dashboard:
├─ Refreshes data (includes linkedPurchaseOrder)
├─ Shows success toast from location state
├─ Displays "PO Created ✓" badge (green, clickable)
└─ Clicking badge navigates to PO details
```

---

## 📊 Status Updates

### **Sales Order Status Flow**
```
draft (ready_for_procurement=true)
    ↓
confirmed (after procurement acceptance)
    ↓
procurement_created (after PO creation) ⬅️ NEW STATUS
    ↓
materials_received
    ↓
in_production
    ↓
...
```

### **Purchase Order Linking**
```javascript
// PurchaseOrder Model
{
  id: 1,
  po_number: "PO-20250128-0001",
  linked_sales_order_id: 123,  // ⬅️ Links to Sales Order
  status: "draft",
  ...
}

// Sales Order API Response (includes linked PO)
{
  id: 123,
  order_number: "SO-20250115-0001",
  status: "procurement_created",
  linkedPurchaseOrder: {        // ⬅️ Includes PO details
    id: 1,
    po_number: "PO-20250128-0001",
    status: "draft",
    created_at: "2025-01-28T10:30:00Z"
  }
}
```

---

## 🔔 Notifications Sent

### **To Sales Department:**
```
Title: Purchase Order Created: PO-20250128-0001
Message: Purchase Order PO-20250128-0001 has been created for Sales Order SO-20250115-0001
Type: procurement
Priority: medium
Action: Click to view Sales Order
```

### **To Procurement Department:**
```
Title: Purchase Order Created
Message: Purchase Order PO-20250128-0001 has been created
Type: procurement
Priority: medium
Action: Click to view Purchase Order
```

---

## 🎨 UI Changes in Dashboard

### **Before PO Creation:**
```
Incoming Orders Tab:
┌──────────────────────────────────────────┐
│ SO-20250115-0001 | Customer: ABC Ltd    │
│ Delivery: 2025-02-15 | Qty: 1000 pcs    │
│                                          │
│ [Create PO] ← Blue button               │
└──────────────────────────────────────────┘
```

### **After PO Creation:**
```
Incoming Orders Tab:
┌──────────────────────────────────────────┐
│ SO-20250115-0001 | Customer: ABC Ltd    │
│ Delivery: 2025-02-15 | Qty: 1000 pcs    │
│                                          │
│ [PO Created ✓] ← Green badge, clickable │
│ PO-20250128-0001                         │
└──────────────────────────────────────────┘
```

---

## 🧪 Testing Guide

### **Test Case 1: Create PO from Sales Order**

1. **Setup:**
   - Login as Procurement user
   - Ensure there's a Sales Order with `ready_for_procurement=true`

2. **Execute:**
   ```
   1. Navigate to Procurement Dashboard
   2. Click "Incoming Orders" tab
   3. Find a sales order without linked PO
   4. Click "Create PO" button
   5. Fill in vendor and items
   6. Click "Submit for Approval"
   ```

3. **Verify:**
   - ✅ Success toast appears: "PO PO-XXXXXXXX-XXXX created successfully!"
   - ✅ After 1.5 seconds, auto-navigates to dashboard
   - ✅ Second success toast appears with full message
   - ✅ Dashboard refreshes and shows "PO Created ✓" badge
   - ✅ Clicking badge navigates to PO details page

---

### **Test Case 2: Verify Notifications**

1. **Execute:**
   - Create a PO as in Test Case 1

2. **Verify Sales Department Notifications:**
   ```
   1. Login as Sales user
   2. Click notifications bell icon
   3. Should see: "Purchase Order Created: PO-XXXXXXXX-XXXX"
   4. Click notification
   5. Should navigate to Sales Order details page
   ```

3. **Verify Procurement Department Notifications:**
   ```
   1. Login as Procurement user
   2. Click notifications bell icon
   3. Should see: "Purchase Order PO-XXXXXXXX-XXXX has been created"
   4. Click notification
   5. Should navigate to Purchase Order details page
   ```

---

### **Test Case 3: Verify Database Updates**

1. **Check PurchaseOrder:**
   ```sql
   SELECT id, po_number, linked_sales_order_id, status 
   FROM purchase_orders 
   WHERE po_number = 'PO-20250128-0001';
   
   -- Should show: linked_sales_order_id = 123
   ```

2. **Check SalesOrder:**
   ```sql
   SELECT id, order_number, status, procurement_status 
   FROM sales_orders 
   WHERE id = 123;
   
   -- Should show: status = 'procurement_created'
   --               procurement_status = 'po_created'
   ```

3. **Check Notifications:**
   ```sql
   SELECT type, title, message, recipient_department 
   FROM notifications 
   WHERE related_entity_type = 'purchase_order'
   ORDER BY created_at DESC LIMIT 5;
   ```

---

## 🔧 Technical Details

### **Database Associations**
```javascript
// config/database.js
SalesOrder.hasOne(PurchaseOrder, {
  foreignKey: 'linked_sales_order_id',
  as: 'linkedPurchaseOrder'
});

PurchaseOrder.belongsTo(SalesOrder, {
  foreignKey: 'linked_sales_order_id',
  as: 'salesOrder'
});
```

### **API Response Format**
```javascript
// POST /procurement/pos
{
  message: "Purchase order created successfully",
  purchaseOrder: {
    id: 1,
    po_number: "PO-20250128-0001",
    status: "draft",
    total_quantity: 1000,
    final_amount: 50000,
    linked_sales_order_id: 123  // ⬅️ NEW FIELD
  }
}
```

---

## 📝 Key Benefits

1. **✅ Immediate Feedback** - Users see status update right away
2. **✅ Better Visibility** - Clear indication that PO has been created
3. **✅ Improved Communication** - Automated notifications keep teams informed
4. **✅ Audit Trail** - Lifecycle history tracks all changes
5. **✅ Better UX** - Auto-navigation reduces manual steps
6. **✅ Data Integrity** - Proper foreign key linking ensures consistency

---

## 🔍 Troubleshooting

### **Issue: "PO Created ✓" doesn't appear**

**Possible Causes:**
1. Dashboard didn't refresh after creation
2. `linkedPurchaseOrder` not included in API response
3. `linked_sales_order_id` not saved in PurchaseOrder

**Solution:**
```javascript
// Check if linkedPurchaseOrder is included in sales orders API
// server/routes/sales.js
include: [
  {
    model: PurchaseOrder,
    as: 'linkedPurchaseOrder',
    attributes: ['id', 'po_number', 'status', 'created_at']
  }
]
```

---

### **Issue: Notifications not received**

**Possible Causes:**
1. NotificationService not called after PO creation
2. User not in correct department
3. User status not 'active'

**Solution:**
```javascript
// Verify notification is being sent
await NotificationService.sendToDepartment('sales', {
  type: 'procurement',
  title: `Purchase Order Created: ${po_number}`,
  ...
});

// Check user status
SELECT id, name, department, status FROM users WHERE department = 'sales';
```

---

### **Issue: Auto-navigation not working**

**Possible Causes:**
1. `linkedSalesOrder` is null or undefined
2. Navigation timeout not completing
3. React Router issue

**Solution:**
```javascript
// Check if linkedSalesOrder exists
console.log('Linked Sales Order:', linkedSalesOrder);

// Increase timeout if needed
setTimeout(() => {
  navigate('/procurement/dashboard', { state: { message } });
}, 2000); // Increase from 1500ms to 2000ms
```

---

## 🚀 Future Enhancements

1. **Real-time Updates** - Use WebSockets to update dashboard without refresh
2. **Status History Timeline** - Show complete workflow history in UI
3. **Email Notifications** - Send email alerts in addition to in-app notifications
4. **Mobile Notifications** - Push notifications for mobile app users
5. **Bulk PO Creation** - Create multiple POs from multiple Sales Orders at once

---

## 📚 Related Documentation

- `PROCUREMENT_SIDEBAR_CLEANUP.md` - Sidebar navigation changes
- `GRN_WORKFLOW_COMPLETE_GUIDE.md` - GRN workflow after PO receipt
- `MRN_TO_PRODUCTION_COMPLETE_FLOW.md` - Material flow to manufacturing
- `SALES_TO_PROCUREMENT_TO_PO_WORKFLOW.md` - Complete sales-to-procurement flow

---

**Last Updated:** January 28, 2025  
**Status:** ✅ Complete and Tested