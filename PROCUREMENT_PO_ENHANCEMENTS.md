# Purchase Order (PO) System Enhancement - Sales Order Integration

## 📋 Overview
Enhanced the Purchase Order system to seamlessly integrate with Sales Orders, allowing procurement teams to create POs directly from confirmed sales orders with auto-populated material requirements and customer details.

---

## ✨ New Features

### 1. **Linked Sales Order Information**
- ✅ **Visual SO Details Card** - When creating PO from SO, displays comprehensive sales order information:
  - SO Number
  - Customer Name
  - Product Name/Type
  - Quantity (pieces)
  - Delivery Date
  - Order Value
  - Material Requirements (Fabric, Thread, etc.)

### 2. **Enhanced PO Form**
- ✅ **Auto-Population** - Fields automatically filled from Sales Order:
  - Customer information
  - Product details
  - Expected delivery date (from SO delivery date)
  - Material specifications
  - Special instructions
- ✅ **Read-Only SO Info** - Linked Sales Order details displayed in a highlighted section
- ✅ **Fabric & Accessories Sections** - Already existing, now enhanced with SO data

### 3. **Advanced Filters (Similar to Sales Dashboard)**
- ✅ **Status Filter** - Filter POs by:
  - Draft
  - Pending Approval
  - Approved
  - Sent to Vendor
  - Acknowledged
  - Partially Received
  - Received
  - Completed
  - Cancelled

- ✅ **Priority Filter** - Filter by:
  - Low
  - Medium
  - High
  - Urgent

- ✅ **Date Range Filter** - Filter POs by date range (from/to)
- ✅ **Clear Filters** - Quick button to reset all filters

### 4. **Export Functionality**
- ✅ **Export to CSV** - Download filtered Purchase Orders
- ✅ **Respects Filters** - Export applies current status, priority, and date filters
- ✅ **Loading State** - Shows "Exporting..." during download

### 5. **Enhanced Table Display**
- ✅ **Linked SO Column** - Shows which POs are created from Sales Orders
- ✅ **Vendor Details** - Name and vendor code
- ✅ **Status Pills** - Color-coded status badges
- ✅ **Priority Pills** - Visual priority indicators
- ✅ **Amount Formatting** - Indian currency format (₹)

### 6. **Two-Tab Interface**
- ✅ **Purchase Orders Tab** - Manage existing POs with advanced filters
- ✅ **Sales Orders for PO Tab** - View confirmed SOs waiting for PO creation

---

## 🔄 Workflow

### **Complete Sales → Procurement Flow:**

```
1. Sales Department
   ↓
   Creates Sales Order → Confirms Order → Sends to Procurement
   ↓
2. Procurement Dashboard
   ↓
   Views "Incoming Orders" → Clicks "Create PO"
   ↓
3. PO Form Opens
   ↓
   - Shows Linked SO Details (Customer, Product, Qty, Delivery Date)
   - Auto-populates Material Requirements
   - User Selects Vendor
   - Adds Fabric Details (Type, Color, HSN, GSM, UOM, Qty, Rate)
   - Adds Accessories (Buttons, Zippers, Thread, etc.)
   - Reviews Cost Summary (Subtotal, GST, Freight, Grand Total)
   ↓
4. Submit PO
   ↓
   - Backend creates PO linked to SO
   - Updates SO status to "procurement_created"
   - Sends notification to Sales Department
   - PO appears in "Purchase Orders" tab
   ↓
5. PO Management
   ↓
   - Track PO status (Approved → Sent → Acknowledged → Received)
   - Filter by status, priority, date
   - Export data for analysis
```

---

## 📊 PO Form Fields (As Per Requirements)

### **🔹 PO Header (Linked Info)**
| Field | Description | Auto-Filled |
|-------|-------------|-------------|
| PO Number | Auto-generated (e.g. PO-2025-0008) | ✅ |
| PO Date | Date of creation | ✅ |
| Linked Sales Order No. | From Sales Order | ✅ |
| Customer Name | From Sales Order | ✅ |
| Product Name / Code | From SO | ✅ |
| Product Type | e.g. Shirt / Trouser / Jacket | ✅ |
| Quantity (pcs) | Total garments to be produced | ✅ |
| Order Delivery Date | Taken from SO | ✅ |
| Procurement Officer | Logged-in user | ✅ |

### **🔹 Fabric Requirement Section**
| Field | Description |
|-------|-------------|
| Fabric Type | e.g. Cotton, Denim, Polyester |
| Color | Required color |
| HSN Code | Fabric category code |
| GSM / Quality | Fabric quality specification |
| UOM (Unit) | Meters / Kgs |
| Required Quantity | Calculated based on garment quantity |
| Rate per Unit (₹) | Supplier rate |
| Total (₹) | Auto = Qty × Rate |
| Supplier Name | Select from supplier master |
| Expected Delivery Date | Date by which material should arrive |
| Remarks | Optional notes |

### **🔹 Accessories Section**
| Field | Description |
|-------|-------------|
| Accessory Item | e.g. Buttons, Zippers, Threads, Hooks |
| Description | Type / Size / Color |
| HSN Code | As per item |
| UOM (Unit) | Gross / Box / Cone / Piece |
| Required Quantity | As per product BOM |
| Rate per Unit (₹) | Supplier rate |
| Total (₹) | Auto = Qty × Rate |
| Supplier Name | From accessory supplier master |
| Expected Delivery Date | Input manually |
| Remarks | Optional field |

### **🔹 Cost Summary**
| Field | Description |
|-------|-------------|
| Fabric Total (₹) | Auto total from fabric section |
| Accessories Total (₹) | Auto total from accessories section |
| Sub Total (₹) | Fabric + Accessories |
| GST (%) | As per supplier |
| Freight (₹) | Optional |
| Grand Total (₹) | Auto = Subtotal + GST + Freight |

---

## 🛠️ Technical Implementation

### **Frontend Changes**

#### **1. PurchaseOrderForm.jsx** (`client/src/components/procurement/`)
**Enhancements:**
- Added `linkedSalesOrder` prop to receive SO data
- Added visual SO details card (blue bordered section)
- Auto-displays: SO Number, Customer, Product, Quantity, Delivery Date, Order Value
- Shows material requirements if available in garment_specs
- Updated PropTypes to include `linkedSalesOrder`

#### **2. PurchaseOrdersPage.jsx** (`client/src/pages/procurement/`)
**Enhancements:**
- Added state: `filterStatus`, `filterPriority`, `dateFilter`, `exporting`
- Added `handleExport()` function for CSV export
- Modified `handleCreatePoFromSalesOrder()` to open form with SO data
- Updated form submission to use `/from-sales-order/:id` endpoint
- Added `filteredOrders` useMemo for client-side filtering
- Enhanced toolbar with:
  - Status dropdown filter
  - Priority dropdown filter
  - Date range inputs (from/to)
  - Clear filters button
- Added "Linked SO" column to show SO number
- Updated Export button with loading state
- Added `queryClient` initialization

#### **3. SalesDashboard.jsx** (`client/src/pages/dashboards/`)
**Previously Fixed:**
- Removed non-existent `/sales/customers/stats` endpoint
- Refactored `fetchDashboardData` to be accessible for refreshing after PO creation

---

### **Backend Routes**

#### **Existing (Already Implemented):**
1. **`POST /api/procurement/pos/from-sales-order/:salesOrderId`**
   - Creates PO linked to Sales Order
   - Validates SO status (must be confirmed or bom_generated)
   - Auto-populates delivery date from SO
   - Creates lifecycle history entry
   - Sends notification to sales department
   - Returns: PO details + updated SO status

2. **`GET /api/procurement/sales-orders-for-po`**
   - Returns confirmed sales orders ready for PO creation
   - Supports search parameter
   - Includes customer details

#### **Backend Enhancements Completed:**

**1. Export Endpoint ✅**
```javascript
// GET /api/procurement/pos/export
// Query params: status, priority, date_from, date_to, search
// Returns: CSV file with filtered POs including:
// - PO details (number, date, status, priority)
// - Vendor information (name, code)
// - Linked SO number
// - Financial data (amounts, tax, discount)
// - Timestamps and creator info
```

**2. Include Linked SO in PO Response ✅**
```javascript
// Updated GET /api/procurement/pos to include:
include: [
  { model: Vendor, as: 'vendor' },
  { model: User, as: 'creator' },
  { 
    model: SalesOrder, 
    as: 'linked_sales_order',
    attributes: ['id', 'order_number', 'status', 'delivery_date', 'total_quantity'],
    include: [
      { model: Customer, as: 'customer', attributes: ['id', 'name', 'customer_code'] }
    ],
    required: false
  }
]
```

---

## 📁 Files Modified

### Frontend:
1. ✅ `client/src/components/procurement/PurchaseOrderForm.jsx`
   - Added linkedSalesOrder prop
   - Added SO details display section
   - Updated PropTypes

2. ✅ `client/src/pages/procurement/PurchaseOrdersPage.jsx`
   - Added filter states
   - Added export functionality
   - Added filtering logic
   - Enhanced toolbar with filters
   - Added Linked SO column
   - Updated form integration

3. ✅ `client/src/pages/dashboards/SalesDashboard.jsx`
   - Fixed API endpoint issue (previously)
   - Refactored data fetching

### Backend:
1. ✅ `server/routes/procurement.js`
   - ✅ Added export endpoint (GET /api/procurement/pos/export)
   - ✅ Updated GET /pos to include linked Sales Order with customer details

---

## 🎯 Key Benefits

1. **Seamless Integration** - Direct SO → PO workflow without manual data entry
2. **Error Reduction** - Auto-populated fields prevent typos and data mismatch
3. **Traceability** - Clear link between Sales Orders and Purchase Orders
4. **Advanced Filtering** - Quick access to POs by status, priority, date
5. **Data Export** - Generate reports for analysis
6. **Visual Clarity** - Color-coded status and priority indicators
7. **User Experience** - Matches Sales Dashboard interface familiarity

---

## 🚀 Usage Instructions

### **For Procurement Team:**

1. **View Incoming Sales Orders:**
   - Navigate to: Procurement → Purchase Orders
   - Click "Sales Orders for PO" tab
   - See list of confirmed sales orders

2. **Create PO from Sales Order:**
   - Click the shopping cart icon next to an SO
   - Review auto-filled SO details (Customer, Product, Qty, Delivery Date)
   - Select Vendor
   - Fill Fabric Requirements:
     - Type, Color, HSN, Quality, UOM, Quantity, Rate
   - Fill Accessories:
     - Item, Description, HSN, UOM, Quantity, Rate
   - Review Cost Summary (auto-calculated)
   - Click "Create Purchase Order"

3. **Filter Purchase Orders:**
   - Use Status dropdown (Draft, Approved, Sent, etc.)
   - Use Priority dropdown (Low, Medium, High, Urgent)
   - Set Date Range (From → To)
   - Click "Clear Filters" to reset

4. **Export Data:**
   - Apply desired filters
   - Click "Export Data" button
   - CSV file downloads automatically

5. **View Linked SO:**
   - Check "Linked SO" column in table
   - Blue text indicates SO-linked POs

---

## ✅ Testing Checklist

- [x] Create PO from Sales Order shows SO details
- [x] SO data auto-populates correctly
- [x] Filter by status works
- [x] Filter by priority works
- [x] Date range filter works
- [x] Clear filters resets all filters
- [x] Export button downloads CSV
- [x] Linked SO column displays correctly
- [x] Form submission creates PO with linked_sales_order_id
- [x] Backend includes linked SO in GET response ✅ **COMPLETED**
- [x] Export endpoint exists on backend ✅ **COMPLETED**

---

## ✅ Backend Implementation Complete

All backend features have been successfully implemented:

### **1. Export Endpoint ✅**
- **Route:** `GET /api/procurement/pos/export`
- **Features:**
  - Filters by status, priority, date range, and search term
  - Includes linked Sales Order information
  - Generates CSV with 16 columns
  - Proper CSV escaping for special characters
  - Timestamped filename for tracking
  - Authentication and department authorization

### **2. Enhanced PO Retrieval ✅**
- **Route:** `GET /api/procurement/pos`
- **Features:**
  - Includes linked Sales Order with customer details
  - Fetches order_number, status, delivery_date, total_quantity
  - Includes customer name and code
  - Left join (required: false) to show POs without linked SOs
  - Maintains all existing filters and pagination

---

## 📝 Notes

- System now provides complete Sales → Procurement traceability
- UI/UX matches Sales Dashboard for consistency
- All auto-calculations working (Fabric Total, Accessories Total, GST, Grand Total)
- Existing PO form fabric/accessories tables retained and enhanced
- Two-tab interface keeps workflows separate but connected
- Export functionality ready (pending backend endpoint)

---

---

## 🎉 Implementation Complete

**Status:** ✅ **FULLY COMPLETED** (Frontend + Backend)

### Summary of Changes:

**Frontend:**
- ✅ Enhanced PO form with linked Sales Order display
- ✅ Advanced filtering (status, priority, date range)
- ✅ CSV export functionality
- ✅ "Linked SO" column in data table
- ✅ Two-tab interface for PO management
- ✅ Clear filters button

**Backend:**
- ✅ Export endpoint with CSV generation
- ✅ Include linked Sales Order in all PO responses
- ✅ Proper filtering support
- ✅ Customer details included

**Total Files Modified:** 4
1. `client/src/components/procurement/PurchaseOrderForm.jsx`
2. `client/src/pages/procurement/PurchaseOrdersPage.jsx`
3. `client/src/pages/dashboards/SalesDashboard.jsx`
4. `server/routes/procurement.js`

---

**Last Updated:** January 2025  
**Author:** Zencoder AI Assistant  
**Version:** 1.0