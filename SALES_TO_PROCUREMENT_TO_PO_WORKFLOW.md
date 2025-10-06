# 📋 Sales Order → Procurement Approval → Purchase Order Workflow

## 🎯 Complete Workflow Overview

This document describes the **end-to-end workflow** from Sales Order creation through Procurement approval to Purchase Order creation.

---

## 🔄 **Complete Process Flow**

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SALES DEPARTMENT                              │
└─────────────────────────────────────────────────────────────────────┘
  1. Create Sales Order (Draft)
  2. Send to Procurement for Approval
     ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    PROCUREMENT DEPARTMENT                            │
└─────────────────────────────────────────────────────────────────────┘
  3. Review & Accept Sales Order
  4. Create Purchase Order from Approved SO
  5. Send PO to Vendor
     ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        VENDOR                                        │
└─────────────────────────────────────────────────────────────────────┘
  6. Vendor Acknowledges & Ships Materials
```

---

## 📝 **Detailed Step-by-Step Process**

### **STEP 1: Sales Creates Order (DRAFT)**
**Actor:** Sales Team  
**Location:** Sales Dashboard

1. Click **"+ Create Sales Order"**
2. Fill in order details:
   - Customer information
   - Product details (fabric, accessories)
   - Quantity, specifications
   - Delivery date
3. Click **"Save as Draft"**
4. **Status:** `DRAFT` ⚪
5. **Database:** `status = 'draft'`, `ready_for_procurement = false`

**Button Visible:** `📤 Send to Procurement` (Orange button)

---

### **STEP 2: Sales Sends to Procurement**
**Actor:** Sales Team  
**Location:** Sales Dashboard

1. Find the draft order in the table
2. Click **"📤 Send to Procurement"** button
3. Confirm the action
4. **Status Changes:** `DRAFT` (remains draft) ⚪
5. **Database:** `status = 'draft'`, `ready_for_procurement = true`

**Button Changes to:** `⏳ Awaiting Approval` (Indicator only, not clickable)

**Notification Sent:** Procurement team is notified

---

### **STEP 3: Procurement Reviews & Accepts** ✨ **NEW**
**Actor:** Procurement Team  
**Location:** Procurement Dashboard → "Incoming Orders" Tab

**What Procurement Sees:**

| Order # | Customer | Status | Actions |
|---------|----------|--------|---------|
| SO-001  | ABC Ltd  | ⏳ **PENDING APPROVAL** (Yellow) | 🔍 View QR, ✅ **Accept** |

**Actions:**
1. Review the order details
2. Click **"✅ Accept"** button
3. Confirm acceptance
4. **Status Changes:** `DRAFT` → `CONFIRMED` 
5. **Database:** 
   - `status = 'confirmed'`
   - `ready_for_procurement = true` (stays true)
   - `approved_by = [user_id]`
   - `approved_at = [timestamp]`

**Notification Sent:** Sales team is notified that order is confirmed

**Order Remains Visible** in Procurement Dashboard with updated status:

| Order # | Customer | Status | Actions |
|---------|----------|--------|---------|
| SO-001  | ABC Ltd  | ✅ **APPROVED** (Green) | 🔍 View QR, ➕ **Create PO** |

---

### **STEP 4: Procurement Creates Purchase Order** ✨ **NEW**
**Actor:** Procurement Team  
**Location:** Procurement Dashboard → "Incoming Orders" Tab

**Actions:**
1. Find the **APPROVED** sales order in the table
2. Click **"➕ Create PO"** button (Blue button, only visible for approved SOs)
3. System navigates to **Create Purchase Order** page
4. **Form is auto-filled** with Sales Order data:
   - ✅ Project Name (from customer name)
   - ✅ Customer ID
   - ✅ Expected Delivery Date
   - ✅ Items (fabric/accessories with quantities, specs)
   - ✅ Special Instructions
   - ✅ Internal Notes: "Linked to Sales Order: SO-XXX"

**Procurement Completes PO:**
1. Select **Vendor** (required)
2. Review/edit items and specifications
3. Add payment terms, delivery address
4. Set discount, tax, freight
5. Click **"Save as Draft"** or **"Send to Vendor"**

**PO Created:**
- **Database:** `linked_sales_order_id = [SO_ID]`
- **Status:** `draft` or `sent` (based on action)
- **Traceability:** PO is permanently linked to the original Sales Order

---

### **STEP 5: Send PO to Vendor**
**Actor:** Procurement Team  
**Location:** Purchase Orders Page

1. Open the created PO
2. Review details
3. Click **"Send to Vendor"**
4. **Status:** `sent`
5. Vendor receives PO (email/portal/print)

---

### **STEP 6: Track & Receive**
**Actor:** Procurement Team  
**Location:** Procurement Dashboard / Purchase Orders Page

**Vendor Acknowledges:**
- Update PO status to `acknowledged`

**Materials Received:**
- Create GRN (Goods Receipt Note)
- Update PO status to `received`
- Send to inventory

---

## 🎨 **Visual Status Indicators**

### **In Sales Dashboard:**

| SO Status | Button/Indicator | Color | Meaning |
|-----------|------------------|-------|---------|
| DRAFT (not sent) | 📤 Send to Procurement | Orange | Ready to send |
| DRAFT (sent) | ⏳ Awaiting Approval | Yellow/Gray | Waiting for procurement |
| CONFIRMED | ✅ CONFIRMED | Blue/Green | Approved by procurement |

### **In Procurement Dashboard (Incoming Orders Tab):**

| SO Status | Badge | Button | Color | Action Available |
|-----------|-------|--------|-------|------------------|
| DRAFT (sent) | ⏳ PENDING APPROVAL | ✅ Accept | Yellow | Accept order |
| CONFIRMED | ✅ APPROVED | ➕ Create PO | Green | Create purchase order |

---

## 💾 **Database Changes**

### **Sales Order Fields:**

| Field | Initial | After Send | After Accept | Purpose |
|-------|---------|------------|--------------|---------|
| `status` | `draft` | `draft` | `confirmed` | Order lifecycle |
| `ready_for_procurement` | `false` | `true` | `true` | Flag for procurement |
| `approved_by` | `null` | `null` | `[user_id]` | Who approved |
| `approved_at` | `null` | `null` | `[timestamp]` | When approved |

### **Purchase Order Fields:**

| Field | Value | Purpose |
|-------|-------|---------|
| `linked_sales_order_id` | `[SO_ID]` | Links PO to originating SO |
| `customer_id` | `[from SO]` | Customer from SO |
| `project_name` | `[from SO]` | Project tracking |
| `vendor_id` | `[selected]` | Vendor for procurement |
| `items` | `[from SO]` | Auto-filled items |

---

## 🔑 **Key Changes Made**

### **1. Procurement Dashboard Filter** (Lines 56-62)
**Before:**
```javascript
// Only showed DRAFT orders
const ordersForProcurement = orders.filter(order => 
  order.ready_for_procurement === true && order.status === 'draft'
);
```

**After:**
```javascript
// Shows both DRAFT (pending) and CONFIRMED (approved) orders
const ordersForProcurement = orders.filter(order => 
  order.ready_for_procurement === true && 
  (order.status === 'draft' || order.status === 'confirmed')
);
```

### **2. Conditional Button Display** (Lines 439-461)
```javascript
{/* Show Accept button only for DRAFT orders (pending approval) */}
{order.status === 'draft' && (
  <button onClick={() => handleAcceptOrder(order)} className="...">
    <CheckCircle /> Accept
  </button>
)}

{/* Show Create PO button only for CONFIRMED orders (already approved) */}
{order.status === 'confirmed' && (
  <button onClick={() => handleCreatePO(order)} className="...">
    <Plus /> Create PO
  </button>
)}
```

### **3. Enhanced Status Badge** (Lines 415-426)
```javascript
{order.status === 'draft' ? '⏳ PENDING APPROVAL' : 
 order.status === 'confirmed' ? '✅ APPROVED' : 
 order.status.replace(/_/g, ' ').toUpperCase()}
```

---

## 🧪 **Testing the Complete Workflow**

### **Test Scenario:**

1. **Login as Sales User**
   - Go to Sales Dashboard
   - Create new SO → Save as Draft
   - Click "📤 Send to Procurement"
   - Verify button changes to "⏳ Awaiting Approval"
   - Verify status is still "DRAFT"

2. **Login as Procurement User**
   - Go to Procurement Dashboard
   - Open "Incoming Orders" tab
   - **Verify:** SO appears with "⏳ PENDING APPROVAL" badge (yellow)
   - **Verify:** "✅ Accept" button is visible
   - Click "✅ Accept"
   - Confirm the action

3. **Check Order Status Changed**
   - **Verify:** Badge changes to "✅ APPROVED" (green)
   - **Verify:** "✅ Accept" button **disappears**
   - **Verify:** "➕ Create PO" button **appears** (blue)
   - **Verify:** Order **stays visible** in Incoming Orders tab

4. **Create Purchase Order**
   - Click "➕ Create PO" button
   - **Verify:** Navigates to Create PO page
   - **Verify:** Form is **auto-filled** with:
     - Project name
     - Customer
     - Expected delivery date
     - Items (fabric/accessories with all specs)
     - Special instructions
     - Internal notes: "Linked to SO: SO-XXX"
   - Select a **Vendor** (required)
   - Review/edit items
   - Add payment terms, delivery address
   - Click "Save as Draft" or "Send to Vendor"

5. **Verify PO Created**
   - Go to Purchase Orders page
   - **Verify:** New PO exists
   - **Verify:** PO shows linked SO in details
   - **Verify:** Column "Linked SO" shows SO number (if column visible)

6. **Verify Sales Dashboard**
   - Login as Sales User
   - Go to Sales Dashboard
   - **Verify:** SO status is "CONFIRMED" (blue badge)
   - **Verify:** No more approval buttons visible

---

## 🗂️ **API Endpoints Used**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sales/orders/:id/send-to-procurement` | PUT | Sales sends SO to procurement |
| `/api/procurement/sales-orders/:id/accept` | PUT | Procurement approves SO |
| `/api/sales/orders/:id` | GET | Fetch SO details for PO creation |
| `/api/procurement/pos` | POST | Create new PO |
| `/api/procurement/vendors` | GET | Fetch vendor list |
| `/api/sales/customers` | GET | Fetch customer list |

---

## 🎯 **Benefits of This Workflow**

✅ **Complete Traceability:** Every PO is linked to its originating SO  
✅ **Approval Control:** Procurement must approve before PO creation  
✅ **Auto-Fill Efficiency:** No manual re-entry of order details  
✅ **Status Visibility:** Clear indicators at each stage  
✅ **No Lost Orders:** Approved orders stay visible until PO is created  
✅ **Audit Trail:** Database tracks who approved and when  
✅ **Multi-Department Coordination:** Sales and Procurement stay in sync  

---

## 🐛 **Troubleshooting**

### **Issue: "Accept" button not appearing**
- **Check:** Is the order status "draft"?
- **Check:** Is `ready_for_procurement = true`?
- **Check:** Does user have procurement permissions?

### **Issue: "Create PO" button not appearing**
- **Check:** Is the order status "confirmed"?
- **Check:** Is `ready_for_procurement = true`?
- **Solution:** Order must be accepted first

### **Issue: Approved order disappeared from dashboard**
- **Check:** Old code was filtering only `status = 'draft'`
- **Solution:** Code now updated to show both draft and confirmed

### **Issue: PO form not auto-filling**
- **Check:** Is SO ID in URL parameter `?from_sales_order=123`?
- **Check:** Does SO have items data?
- **Check:** Browser console for API errors

---

## 📊 **Workflow State Diagram**

```
Sales Order States:
┌──────────────┐
│   CREATED    │ (status: 'draft', ready_for_procurement: false)
│   (Draft)    │
└──────┬───────┘
       │ [Sales: Send to Procurement]
       ↓
┌──────────────┐
│ PENDING      │ (status: 'draft', ready_for_procurement: true)
│ APPROVAL     │
└──────┬───────┘
       │ [Procurement: Accept]
       ↓
┌──────────────┐
│  APPROVED    │ (status: 'confirmed', ready_for_procurement: true)
│ (Confirmed)  │
└──────┬───────┘
       │ [Procurement: Create PO]
       ↓
┌──────────────┐
│ PO CREATED   │ (Purchase Order with linked_sales_order_id)
└──────────────┘
```

---

## 📚 **Related Files**

### **Modified:**
- `client/src/pages/dashboards/ProcurementDashboard.jsx`
  - Lines 56-62: Filter logic updated
  - Lines 415-426: Status badge enhanced
  - Lines 439-461: Conditional button display

### **Already Implemented (No Changes Needed):**
- `client/src/pages/dashboards/SalesDashboard.jsx` (from previous fix)
- `client/src/pages/procurement/CreatePurchaseOrderPage.jsx`
- `client/src/components/procurement/EnhancedPurchaseOrderForm.jsx`
- `server/routes/sales.js` (send-to-procurement endpoint)
- `server/routes/procurement.js` (accept endpoint)

---

## ✅ **Acceptance Criteria**

- [x] Sales can send draft orders to procurement
- [x] Procurement sees pending orders in "Incoming Orders" tab
- [x] Procurement can accept orders
- [x] Accepted orders **remain visible** in Procurement Dashboard
- [x] "Accept" button only shows for pending (draft) orders
- [x] "Create PO" button only shows for approved (confirmed) orders
- [x] Clicking "Create PO" opens creation page with pre-filled data
- [x] PO is linked to original SO via `linked_sales_order_id`
- [x] Status badges are clear and color-coded
- [x] Both departments see updated statuses in real-time

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** Zencoder Assistant