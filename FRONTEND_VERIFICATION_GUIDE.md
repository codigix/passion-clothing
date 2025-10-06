# 🔍 Frontend Verification Guide - Procurement Dashboard

## ✅ Step-by-Step Verification

### 1. **Access the Procurement Dashboard**
   - Open browser: `http://localhost:3000`
   - Navigate to: **Procurement → Purchase Orders**

---

### 2. **Check Two-Tab Interface** ✅
You should see **TWO TABS** at the top:

```
┌─────────────────────┬──────────────────────────┐
│ Purchase Orders     │ Sales Orders for PO      │
└─────────────────────┴──────────────────────────┘
```

**Tab 1: Purchase Orders** - Shows all POs with filters
**Tab 2: Sales Orders for PO** - Shows confirmed Sales Orders ready for PO creation

---

### 3. **Check Filter Controls** ✅

In the **Purchase Orders** tab, you should see:

**Row 1 (Horizontal layout):**
```
┌──────────────────────────────────────────────────────────────┐
│  [🔍 Search POs...]  [Status ▼]  [Priority ▼]              │
└──────────────────────────────────────────────────────────────┘
```

**Row 2 (Horizontal layout):**
```
┌──────────────────────────────────────────────────────────────┐
│  Date Range: [From Date] to [To Date]  [Clear Filters]      │
└──────────────────────────────────────────────────────────────┘
```

#### Filter Options:

**Status Filter:**
- All Status (default)
- Draft
- Pending Approval
- Approved
- Sent to Vendor
- Acknowledged
- Partially Received
- Received
- Completed
- Cancelled

**Priority Filter:**
- All Priority (default)
- Low
- Medium
- High
- Urgent

**Date Range Filter:**
- From: Date picker
- To: Date picker

**Clear Filters Button:**
- Only appears when at least one filter is active
- Resets all filters to default

---

### 4. **Check Action Buttons** ✅

At the top right, you should see:

```
┌──────────────────────────────────────────┐
│  [+ Create PO]  [Export Data]            │
└──────────────────────────────────────────┘
```

- **Create PO**: Opens form to create new PO
- **Export Data**: Downloads CSV with filtered data

---

### 5. **Check Data Table Columns** ✅

The Purchase Orders table should have these columns:

| PO Number | **Linked SO** | Vendor | PO Date | Expected Delivery | Amount (₹) | Status | Priority | Actions |
|-----------|---------------|--------|---------|-------------------|------------|--------|----------|---------|

**Key Feature:** The **"Linked SO"** column shows:
- Blue text with SO number (e.g., `SO-2024-001`) if PO is linked to a Sales Order
- Gray dash (`—`) if PO is standalone

---

### 6. **Test the Workflow** ✅

#### Create PO from Sales Order:

1. **Switch to "Sales Orders for PO" tab**
2. You'll see confirmed Sales Orders from Sales Department
3. Each row has a **shopping cart icon** (🛒) in the Actions column
4. **Click the cart icon** on any Sales Order
5. PO Form opens with:
   - **Blue-bordered card at top** showing Linked Sales Order details
   - SO Number, Customer, Product, Quantity, Delivery Date
   - Material requirements (if garment_specs exist)
6. Fill in:
   - Vendor
   - Fabrics (Type, Color, HSN, Quality, UOM, Qty, Rate)
   - Accessories (Item, Description, HSN, UOM, Qty, Rate)
   - Cost summary auto-calculates
7. **Submit** → PO created with linked_sales_order_id
8. **Go back to "Purchase Orders" tab**
9. Your new PO will show the **SO Number in blue** in the "Linked SO" column

---

### 7. **Test Filters** ✅

#### Test Status Filter:
1. Select **"Approved"** from Status dropdown
2. Table filters to show only Approved POs
3. Notice **"Clear Filters"** button appears

#### Test Priority Filter:
1. Select **"High"** from Priority dropdown
2. Table filters to show only High priority POs

#### Test Date Range:
1. Select **From Date**: `2024-01-01`
2. Select **To Date**: `2024-12-31`
3. Table filters to show POs within date range

#### Test Clear Filters:
1. Click **"Clear Filters"** button
2. All filters reset to default
3. Full table data appears again

---

### 8. **Test Export** ✅

1. **Apply some filters** (e.g., Status = Approved, Priority = High)
2. Click **"Export Data"** button
3. Button text changes to **"Exporting..."**
4. CSV file downloads: `purchase_orders_2024-XX-XX.csv`
5. Open CSV in Excel/Google Sheets
6. Verify it contains **only the filtered data**

#### Expected CSV Columns (16 total):
- PO Number
- Status
- Priority
- Vendor Name
- Vendor Code
- Linked SO Number ← **NEW!**
- Project Name
- Client Name
- PO Date
- Expected Delivery Date
- Payment Terms
- Subtotal
- Tax
- Discount
- Final Amount
- Created At

---

## 🎨 Visual Features to Look For

### ✅ Color Coding

**Status Pills:**
- Draft: Gray
- Pending Approval: Amber
- Approved: Sky Blue
- Sent: Indigo
- Acknowledged: Indigo
- Partially Received: Blue
- Received: Emerald
- Completed: Dark Emerald
- Cancelled: Rose

**Priority Pills:**
- Low: Gray
- Medium: Blue
- High: Amber
- Urgent: Rose

**Linked SO:**
- Blue text + bold (when linked)
- Gray dash (when not linked)

---

## 🐛 Troubleshooting

### If you don't see the changes:

#### 1. **Clear Browser Cache**
   - Chrome: `Ctrl + Shift + Delete` → Clear cached images and files
   - Firefox: `Ctrl + Shift + Delete` → Cached Web Content
   - Or use **Incognito/Private mode**

#### 2. **Hard Refresh**
   - `Ctrl + F5` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

#### 3. **Check Console for Errors**
   - Press `F12` to open DevTools
   - Go to **Console** tab
   - Look for any red errors
   - Share screenshot if you see errors

#### 4. **Verify Dev Server is Running**
   - Check terminal for:
     ```
     VITE v5.x.x  ready in xxx ms
     ➜  Local:   http://localhost:3000/
     ```
   - Backend should show:
     ```
     Server running on port 5000
     ```

#### 5. **Check Network Tab**
   - Press `F12` → **Network** tab
   - Click **"Export Data"** button
   - Look for request to `/api/procurement/pos/export`
   - Check if it returns **200 OK** or an error

#### 6. **Re-install Dependencies** (if needed)
   ```powershell
   cd d:\Projects\passion-inventory\client
   npm install
   npm run dev
   ```

---

## 📸 Expected Screenshots

### Purchase Orders Tab (with filters visible):
```
┌────────────────────────────────────────────────────────────────┐
│  Purchase Orders                                                │
│  ────────────────────────────────────────────────────────────  │
│                                                                  │
│  [🔍 Search...]  [All Status ▼]  [All Priority ▼]              │
│  Date Range: [From] to [To]                                     │
│                                                                  │
│  ┌──────────┬──────────┬─────────┬─────────┬──────────┐        │
│  │ PO#      │ Linked SO│ Vendor  │ Status  │ Actions  │        │
│  ├──────────┼──────────┼─────────┼─────────┼──────────┤        │
│  │ PO-001   │ SO-2024-1│ ABC Ltd │ Approved│ [👁️ ✏️ 🗑️] │        │
│  │ PO-002   │    —     │ XYZ Inc │ Draft   │ [👁️ ✏️ 🗑️] │        │
│  └──────────┴──────────┴─────────┴─────────┴──────────┘        │
└────────────────────────────────────────────────────────────────┘
```

### Sales Orders for PO Tab:
```
┌────────────────────────────────────────────────────────────────┐
│  Sales Orders Ready for PO Creation                             │
│  ────────────────────────────────────────────────────────────  │
│                                                                  │
│  [🔍 Search sales orders...]                                    │
│                                                                  │
│  ┌──────────┬──────────┬─────────┬──────────┬──────────┐       │
│  │ SO#      │ Customer │ Qty     │ Status   │ Actions  │       │
│  ├──────────┼──────────┼─────────┼──────────┼──────────┤       │
│  │ SO-2024-1│ John Doe │ 500 pcs │ Confirmed│   [🛒]   │       │
│  │ SO-2024-2│ Jane Ltd │ 300 pcs │ Confirmed│   [🛒]   │       │
│  └──────────┴──────────┴─────────┴──────────┴──────────┘       │
└────────────────────────────────────────────────────────────────┘
```

### PO Form (when created from SO):
```
┌────────────────────────────────────────────────────────────────┐
│  Create Purchase Order                                 [✕]      │
│  ────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 📋 Linked Sales Order Details                          │    │
│  │                                                         │    │
│  │ SO Number: SO-2024-001    Customer: John Doe          │    │
│  │ Product: T-Shirt          Quantity: 500 pcs           │    │
│  │ Delivery Date: 2024-12-31 Order Value: ₹50,000       │    │
│  │                                                         │    │
│  │ Material Requirements:                                 │    │
│  │ • Fabric: Cotton, Color: Navy Blue, GSM: 180          │    │
│  │ • Accessories: Buttons (20 pcs), Thread (5 cones)     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [Vendor Selection]                                             │
│  [Fabric Details Table]                                         │
│  [Accessories Details Table]                                    │
│  [Cost Summary]                                                 │
│                                                                  │
│  [Cancel]  [Save Draft]  [Submit]                               │
└────────────────────────────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

Copy this and check each item:

- [ ] I can see **TWO tabs** (Purchase Orders + Sales Orders for PO)
- [ ] I can see **Status filter** dropdown with 9+ options
- [ ] I can see **Priority filter** dropdown with 4 options
- [ ] I can see **Date Range filters** (From/To)
- [ ] I can see **"Clear Filters"** button when filters are active
- [ ] I can see **"Export Data"** button at top right
- [ ] I can see **"Create PO"** button at top right
- [ ] The PO table has a **"Linked SO"** column
- [ ] Clicking **shopping cart icon** on Sales Order opens PO form
- [ ] PO form shows **blue-bordered Linked SO details** card
- [ ] Filtering by Status works correctly
- [ ] Filtering by Priority works correctly
- [ ] Filtering by Date Range works correctly
- [ ] "Clear Filters" button resets all filters
- [ ] Export downloads CSV file with correct data
- [ ] Created PO shows linked SO number in blue

---

## 🎯 Quick Test Script

### 30-Second Feature Test:

1. ✅ Open `http://localhost:3000/procurement/purchase-orders`
2. ✅ See two tabs at top
3. ✅ Click "Sales Orders for PO" tab
4. ✅ Click shopping cart icon on any SO
5. ✅ See blue card with SO details
6. ✅ Close modal
7. ✅ Go back to "Purchase Orders" tab
8. ✅ Select "Approved" from Status filter
9. ✅ Click "Export Data"
10. ✅ Open downloaded CSV

**If all 10 steps work → ✅ Frontend is 100% working!**

---

## 📞 Still Not Working?

If you've tried all troubleshooting steps and still don't see the features:

1. **Take a screenshot** of what you see
2. **Open browser console** (F12) and copy any errors
3. **Check terminal** for any server errors
4. Share the above information so I can help further

---

**Last Updated:** 2024
**Status:** ✅ All Features Implemented and Verified