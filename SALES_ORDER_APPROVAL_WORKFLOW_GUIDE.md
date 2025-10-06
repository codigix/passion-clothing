# Sales Order Approval Workflow - Complete Guide

## 🎯 Overview

This guide explains the **Sales Order → Procurement Approval** workflow that is already implemented in your system.

---

## 📊 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SALES DASHBOARD                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  [1] Create Sales Order
                      Save as DRAFT
                              │
                              ▼
                  [2] Click "Send to Procurement"
                      (Status stays: DRAFT)
                      (Flag: ready_for_procurement = true)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PROCUREMENT DASHBOARD                           │
│  → Tab: "Incoming Orders"                                        │
│  → Shows all Sales Orders waiting for confirmation               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  [3] Procurement Reviews Order
                      Click "Accept/Confirm Order"
                              │
                              ▼
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
   Status: DRAFT → CONFIRMED        Notification sent to Sales
   approved_by: [Procurement User]
   approved_at: [Timestamp]
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SALES DASHBOARD                              │
│  → Order status now shows: CONFIRMED                             │
│  → Ready to proceed with production/procurement                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Step-by-Step Instructions

### **STEP 1: Create Sales Order (Sales Department)**

1. **Navigate to:** Sales Dashboard
2. **Click:** "Create Sales Order" button (top right)
3. **Fill in order details:**
   - Customer information
   - Products/items
   - Delivery date
   - Payment terms
   - Specifications
4. **Click:** "Save as Draft"
5. **Result:** Order is created with status = `draft`

---

### **STEP 2: Send to Procurement for Approval (Sales Department)**

1. **Navigate to:** Sales Dashboard
2. **Find the draft order** in the orders list
3. **Click:** "Send to Procurement" button (📤 icon)
4. **Confirm:** Click "Yes" in the confirmation dialog

**What Happens:**
- Order remains in `draft` status
- `ready_for_procurement` flag is set to `true`
- Procurement department receives a notification
- Order appears in **Procurement Dashboard → Incoming Orders** tab

---

### **STEP 3: Review and Approve (Procurement Department)**

1. **Navigate to:** Procurement Dashboard
2. **Click:** "Incoming Orders" tab (shows count badge)
3. **Review:** You'll see all Sales Orders sent by Sales Department
   - Order details
   - Customer name
   - Items/products
   - Delivery date
   - Quantities

4. **Actions Available:**
   - **✅ Accept Order** → Confirms the order, changes status to `confirmed`
   - **👁️ View Details** → See complete order information
   - **📦 Create PO** → Start creating Purchase Orders for materials

5. **Click:** "Accept Order" or "Confirm Order" button
6. **Confirm:** Click "Yes" in the confirmation dialog

**What Happens:**
- Order status changes: `draft` → `confirmed`
- Sales department receives notification
- Order moves from "Incoming" to regular workflow
- Sales dashboard automatically reflects the new status

---

### **STEP 4: Verify on Sales Dashboard (Sales Department)**

1. **Navigate to:** Sales Dashboard
2. **Find the order** that was sent to procurement
3. **Verify:** Status should now show **"Confirmed"** (green badge)
4. **Proceed:** Order is now ready for:
   - BOM generation
   - Material procurement
   - Production planning

---

## 🔍 Key Features

### Database Fields Used

**SalesOrder Model:**
```javascript
{
  status: 'draft' | 'confirmed' | 'in_production' | ... ,
  ready_for_procurement: boolean,          // Flag when sent to procurement
  ready_for_procurement_by: user_id,       // Who sent it
  ready_for_procurement_at: timestamp,     // When sent
  approved_by: user_id,                    // Procurement user who confirmed
  approved_at: timestamp,                  // When confirmed
  lifecycle_history: JSON                  // Audit trail
}
```

### API Endpoints

| Endpoint | Method | Department | Purpose |
|----------|--------|------------|---------|
| `/api/sales/orders/:id/send-to-procurement` | PUT | Sales | Send SO to procurement |
| `/api/procurement/sales-orders/:id/accept` | PUT | Procurement | Accept and confirm SO |
| `/api/sales/orders` | GET | Both | List all sales orders |

### Notifications

**When Sales sends to Procurement:**
- Procurement department receives notification
- Title: "New Sales Order Request: SO-XXXXXX"
- Priority: High
- Action link: Navigate to Procurement Dashboard

**When Procurement confirms:**
- Sales department receives notification
- Title: "Order Confirmed: SO-XXXXXX"
- Priority: Normal
- Details: Confirmed by [Procurement User Name]

---

## 💡 Status Flow

```
Draft → Confirmed → In Production → Ready to Ship → Shipped → Delivered → Completed
  ↑                    ↑
  |                    |
  Sales Creates    Procurement
                   Confirms
```

---

## 🎨 UI Indicators

### Sales Dashboard

**Draft Orders (before sending to procurement):**
- Badge: Gray "Draft"
- Action button: 📤 "Send to Procurement"

**Draft Orders (after sending, waiting for procurement):**
- Badge: Gray "Draft"
- Indicator: "📋 Sent to Procurement - Awaiting Confirmation"
- No "Send to Procurement" button (already sent)

**Confirmed Orders (after procurement approval):**
- Badge: Blue "Confirmed"
- Show: "✅ Confirmed by [Procurement User]"
- Show: Timestamp of confirmation

### Procurement Dashboard

**Incoming Orders Tab:**
- Shows count badge: "(X)" where X is number of pending orders
- Each order shows:
  - Order number
  - Customer name
  - Delivery date
  - Total quantity
  - Items preview
  - Action buttons: Accept | View | Create PO

---

## 🔐 Permissions

### Sales Department
- ✅ Create sales orders
- ✅ Save as draft
- ✅ Send to procurement
- ❌ Cannot confirm own orders
- ✅ View all sales orders

### Procurement Department
- ✅ View incoming sales orders
- ✅ Accept/confirm sales orders
- ✅ Create purchase orders
- ✅ View all sales orders (read-only)
- ❌ Cannot create sales orders

### Admin Department
- ✅ All permissions from both departments

---

## 🐛 Troubleshooting

### "Send to Procurement" button not visible
**Causes:**
1. Order status is not "draft"
2. Order already sent to procurement
3. User doesn't have "sales" department permission

**Solution:** Check order status and user department

---

### Procurement doesn't see incoming orders
**Causes:**
1. Order not sent from sales dashboard
2. Filter applied on Procurement Dashboard
3. Order status changed before sending

**Solution:** 
1. Verify on Sales Dashboard that order was sent
2. Check "Incoming Orders" tab specifically
3. Verify `ready_for_procurement` flag in database

---

### Status not updating on Sales Dashboard
**Causes:**
1. Page not refreshed after procurement confirmation
2. Cache issue

**Solution:**
1. Refresh the page (F5)
2. Dashboard auto-refreshes on navigation

---

## 📊 Database Query Examples

### Find all orders waiting for procurement approval
```sql
SELECT * FROM sales_orders 
WHERE status = 'draft' 
AND ready_for_procurement = true 
AND approved_by IS NULL;
```

### Find all confirmed orders by procurement
```sql
SELECT so.*, u.name as confirmed_by_user 
FROM sales_orders so
LEFT JOIN users u ON so.approved_by = u.id
WHERE so.status = 'confirmed' 
AND so.approved_by IS NOT NULL;
```

---

## 🎯 Success Criteria

✅ **Sales can:**
- Create sales orders as drafts
- Send drafts to procurement for approval
- See updated status after procurement confirms

✅ **Procurement can:**
- View all incoming sales order requests
- Review order details before confirming
- Confirm orders with one click
- Create purchase orders from confirmed sales orders

✅ **System:**
- Maintains audit trail (who sent, who approved, when)
- Sends notifications to appropriate departments
- Updates status automatically
- Shows real-time counts on dashboards

---

## 🔄 Complete Example

**Timeline:**

| Time | User | Action | Status | Flag |
|------|------|--------|--------|------|
| 10:00 AM | Sales User A | Create SO-20250102-0001 | draft | ready_for_procurement: false |
| 10:05 AM | Sales User A | Send to Procurement | draft | ready_for_procurement: true |
| 10:06 AM | System | Notify Procurement | draft | - |
| 10:15 AM | Procurement User B | Review order | draft | - |
| 10:20 AM | Procurement User B | Click "Accept Order" | **confirmed** | approved_by: User B |
| 10:21 AM | System | Notify Sales | confirmed | - |
| 10:22 AM | Sales User A | Views dashboard | **confirmed** | ✅ Ready for production |

---

## 📝 Notes

1. **Order remains in draft until procurement confirms** - This is intentional to prevent premature production
2. **Multiple approvers possible** - System tracks who approved via `approved_by` field
3. **Audit trail maintained** - All status changes logged in `lifecycle_history`
4. **Notifications are asynchronous** - May take a few seconds to appear
5. **Real-time updates** - Dashboard refreshes automatically when returning from other pages

---

## 🚨 Important Points

⚠️ **Once sent to procurement, Sales cannot modify the order** - Request must be accepted or rejected first

⚠️ **Procurement cannot edit sales order details** - They can only confirm or request changes

⚠️ **Status "Confirmed" is required** - Before creating Purchase Orders or starting production

⚠️ **Notifications depend on user's department** - Ensure users are assigned to correct departments

---

## 📧 Need Help?

If you encounter issues:
1. Check the browser console for errors (F12)
2. Verify user department assignments in Admin → Users
3. Check network tab for failed API calls
4. Review server logs for backend errors

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** ✅ Fully Implemented and Working