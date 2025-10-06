# Purchase Order System - Testing Guide

## 🧪 Test Scenarios

### **1. Create PO from Sales Order**

**Prerequisites:**
- A confirmed Sales Order exists in the system
- User has procurement or admin role

**Steps:**
1. Navigate to: **Procurement → Purchase Orders**
2. Click the **"Sales Orders for PO"** tab
3. Verify: List shows confirmed sales orders with customer details
4. Click the **shopping cart icon** next to a sales order
5. Verify: PO form opens with:
   - Blue "Linked Sales Order Details" card at the top
   - SO Number displayed
   - Customer Name displayed
   - Product Name/Type displayed
   - Quantity (pieces) displayed
   - Delivery Date displayed
   - Order Value displayed
   - Material Requirements (if garment_specs exists)

**Expected Result:** ✅ Form shows all SO details clearly

---

### **2. Submit PO from Sales Order**

**Prerequisites:**
- PO form opened from Sales Order (see Test 1)

**Steps:**
1. Select a **Vendor** from dropdown
2. Fill in **Items** (materials, quantities, rates)
3. Add **Payment Terms**
4. Set **Priority** (Low/Medium/High/Urgent)
5. Add optional **Special Instructions**
6. Click **"Create Purchase Order"**

**Backend Actions:**
- Creates PO with `linked_sales_order_id`
- Updates SO status to `procurement_created`
- Sends notification to sales department

**Expected Result:** ✅ PO created successfully, notification sent

---

### **3. Filter Purchase Orders by Status**

**Steps:**
1. Navigate to: **Procurement → Purchase Orders** (Tab 1)
2. Click **Status Filter** dropdown
3. Select a status (e.g., "Draft", "Approved", "Sent to Vendor")
4. Verify: Table shows only POs with selected status

**Expected Result:** ✅ Filtering works correctly

---

### **4. Filter Purchase Orders by Priority**

**Steps:**
1. In Purchase Orders tab
2. Click **Priority Filter** dropdown
3. Select a priority (Low/Medium/High/Urgent)
4. Verify: Table shows only POs with selected priority

**Expected Result:** ✅ Priority filtering works

---

### **5. Filter by Date Range**

**Steps:**
1. In Purchase Orders tab
2. Set **From Date** (e.g., 2025-01-01)
3. Set **To Date** (e.g., 2025-01-31)
4. Verify: Table shows only POs within date range

**Expected Result:** ✅ Date filtering works

---

### **6. Clear All Filters**

**Prerequisites:**
- At least one filter is active

**Steps:**
1. Apply any filter (status/priority/date)
2. Click **"Clear Filters"** button
3. Verify: All filters reset to default (All Orders)
4. Verify: Table shows all POs

**Expected Result:** ✅ Filters cleared, full list displayed

---

### **7. Export Purchase Orders to CSV**

**Steps:**
1. In Purchase Orders tab
2. Optionally apply filters (status, priority, date range)
3. Click **"Export Data"** button
4. Wait for download
5. Open downloaded CSV file
6. Verify columns:
   - PO Number
   - PO Date
   - Status
   - Priority
   - Vendor Name
   - Vendor Code
   - **Linked SO Number** (shows SO number or blank)
   - Total Quantity
   - Total Amount
   - Discount %
   - Tax %
   - Final Amount
   - Expected Delivery Date
   - Payment Terms
   - Created By
   - Special Instructions

**Expected Result:** ✅ CSV downloads with all data

---

### **8. Verify "Linked SO" Column in Table**

**Steps:**
1. In Purchase Orders tab
2. Locate "Linked SO" column
3. For POs created from Sales Orders: Shows SO number in **blue text**
4. For standalone POs: Shows **"—"** (dash)

**Expected Result:** ✅ Column displays correctly

---

### **9. Backend API - GET POs with Linked SO**

**Test API Endpoint:**
```bash
GET /api/procurement/pos
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "purchaseOrders": [
    {
      "id": 1,
      "po_number": "PO-20250120-0001",
      "status": "draft",
      "priority": "medium",
      "vendor": {
        "id": 5,
        "name": "ABC Textiles",
        "vendor_code": "V-001"
      },
      "linked_sales_order": {
        "id": 10,
        "order_number": "SO-2025-0015",
        "status": "procurement_created",
        "delivery_date": "2025-02-15",
        "total_quantity": 500,
        "customer": {
          "id": 3,
          "name": "XYZ Garments Ltd",
          "customer_code": "C-003"
        }
      },
      "creator": {
        "id": 2,
        "name": "John Doe",
        "employee_id": "EMP-002"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "pages": 2
  }
}
```

**Expected Result:** ✅ Response includes linked_sales_order with customer

---

### **10. Backend API - Export CSV**

**Test API Endpoint:**
```bash
GET /api/procurement/pos/export?status=draft&priority=high&date_from=2025-01-01&date_to=2025-01-31
Authorization: Bearer <token>
```

**Expected Response:**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename=purchase_orders_<timestamp>.csv`
- CSV file with 16 columns and filtered data

**Expected Result:** ✅ CSV file downloads with filtered data

---

## 🔍 Edge Cases to Test

### **Test 1: PO without Linked SO**
- Create standalone PO (not from Sales Order)
- Verify: "Linked SO" column shows "—"
- Verify: No SO details card in form

### **Test 2: Export with No Filters**
- Don't apply any filters
- Export all POs
- Verify: All records exported

### **Test 3: Export with All Filters**
- Apply status + priority + date range
- Export
- Verify: Only matching records exported

### **Test 4: Sales Order with No garment_specs**
- Create PO from SO without garment_specs
- Verify: Material requirements section doesn't show

### **Test 5: Multiple POs from Same SO**
- Create multiple POs for the same Sales Order
- Verify: All POs link correctly to SO
- Verify: SO status updates appropriately

---

## ✅ Success Criteria

All tests should pass:
- ✅ PO form displays linked SO information
- ✅ PO creation from SO works end-to-end
- ✅ Status filtering works
- ✅ Priority filtering works
- ✅ Date range filtering works
- ✅ Clear filters button works
- ✅ Export downloads CSV with correct data
- ✅ "Linked SO" column displays correctly
- ✅ Backend includes linked SO in responses
- ✅ CSV export endpoint works with filters

---

## 🐛 Common Issues & Solutions

### Issue: "Linked SO" column shows "undefined"
**Solution:** Restart backend server to load updated procurement routes

### Issue: Export button doesn't download
**Solution:** Check browser console for errors, verify backend endpoint exists

### Issue: Filters don't apply
**Solution:** Check filteredOrders useMemo in PurchaseOrdersPage.jsx

### Issue: SO details don't show in form
**Solution:** Verify linkedSalesOrder prop is passed correctly

### Issue: Backend error: "linked_sales_order association not found"
**Solution:** Check database.js associations, ensure SalesOrder model is associated with PurchaseOrder

---

## 📊 Test Data Setup

### Create Test Sales Order:
```sql
INSERT INTO SalesOrders (
  order_number, customer_id, status, delivery_date, 
  total_quantity, order_value, garment_specs
) VALUES (
  'SO-TEST-001', 1, 'confirmed', '2025-02-28',
  1000, 50000, 
  '{"fabric_type": "Cotton", "fabric_quantity": 1500, "fabric_unit": "meters", "thread_type": "Polyester"}'
);
```

### Create Test Vendor:
```sql
INSERT INTO Vendors (
  name, vendor_code, email, phone, address
) VALUES (
  'Test Fabric Supplier', 'V-TEST-001', 'test@vendor.com', '9876543210', 'Test Address'
);
```

---

**Testing Completed By:** _________________  
**Date:** _________________  
**Result:** ✅ PASS / ❌ FAIL  
**Notes:** _________________________________