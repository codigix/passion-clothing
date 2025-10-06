# Test Plan: Purchase Order Form Enhancements

## Pre-requisites
- Server running on port 5000
- Client running on port 3000 (or appropriate port)
- At least one customer in the database
- At least one vendor in the database
- At least one product in the database

## Test Cases

### 1. Test Customers API Endpoint
**Endpoint:** `GET /api/sales/customers`

**Expected:**
- Returns list of active customers
- Each customer has: id, customer_code, name, company_name, email, phone

**Test Steps:**
1. Login to the application
2. Open browser console
3. Run:
```javascript
fetch('/api/sales/customers', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log(data));
```

**Expected Result:**
```json
{
  "customers": [
    {
      "id": 1,
      "customer_code": "CUST001",
      "name": "Customer Name",
      "company_name": "Company Name",
      "email": "customer@example.com",
      "phone": "1234567890"
    }
  ]
}
```

---

### 2. Test Independent Purchase Order Creation

**Steps:**
1. Navigate to: Procurement > Purchase Orders
2. Click "Create PO" button
3. Modal should open with title "Create Purchase Order"

**Verify Step 1 - Basic Information:**
- [ ] Customer/Client dropdown is visible (required)
- [ ] Customer dropdown shows all active customers
- [ ] Project Name text input is visible
- [ ] Vendor dropdown is visible (required)
- [ ] PO Date is pre-filled with today's date
- [ ] Expected Delivery date field is visible
- [ ] Priority dropdown is visible (default: medium)
- [ ] Status dropdown is visible (default: draft)

**Fill Form:**
1. Select a customer from dropdown
2. Enter project name: "Test Project ABC"
3. Select a vendor
4. Set expected delivery date (future date)
5. Click "Next"

**Verify Step 2 - Items:**
- [ ] Item section is visible
- [ ] Product field is an INPUT (not dropdown)
- [ ] Type in product field shows autocomplete suggestions
- [ ] Can select product from suggestions
- [ ] Description, HSN, UOM, Quantity, Rate fields visible
- [ ] Can add multiple items
- [ ] Can remove items
- [ ] Total is calculated correctly

**Fill Items:**
1. Type product name in product field
2. Select from autocomplete
3. Enter quantity and rate
4. Click "Next"

**Verify Step 3 - Financial Details:**
- [ ] Payment terms field visible
- [ ] Delivery address field visible
- [ ] Discount percentage field visible
- [ ] Tax percentage field visible (default: 12%)
- [ ] Freight charges field visible
- [ ] Subtotal calculated correctly
- [ ] Grand total calculated correctly

**Fill Financial Details:**
1. Enter payment terms
2. Enter delivery address
3. Set discount: 5%
4. Set tax: 12%
5. Enter freight: 500

**Submit:**
1. Click "Create" button
2. Success toast should appear
3. Modal should close
4. New PO should appear in the table

**Verify Database:**
- [ ] PO has customer_id set
- [ ] PO has project_name set
- [ ] PO has correct items
- [ ] PO has correct totals

---

### 3. Test Purchase Order from Sales Order

**Steps:**
1. Navigate to: Procurement > Purchase Orders
2. Switch to "Sales Orders for PO" tab
3. Find a sales order
4. Click "Create PO" button (shopping cart icon)
5. Modal should open

**Verify Pre-filled Data:**
- [ ] Title shows "Creating PO from Sales Order: SO-XXXXX"
- [ ] Client Name field is DISABLED and pre-filled from SO
- [ ] Project Name field is DISABLED and pre-filled
- [ ] Expected delivery date pre-filled from SO
- [ ] Vendor dropdown is editable
- [ ] Other fields are editable

**Fill Form:**
1. Select a vendor
2. Add/modify items if needed
3. Fill financial details
4. Click "Create"

**Verify:**
- [ ] PO created successfully
- [ ] PO has linked_sales_order_id set
- [ ] PO has customer info from SO
- [ ] Success message shows SO number

---

### 4. Test Product Autocomplete

**Steps:**
1. Create new PO (either independent or from SO)
2. Navigate to Items step
3. Click in product field

**Verify:**
- [ ] Field is a text input (not dropdown)
- [ ] Placeholder says "Type to search products..."
- [ ] Typing shows autocomplete suggestions
- [ ] Selecting suggestion fills product_id
- [ ] Product name is displayed in input after selection
- [ ] Clearing input clears product_id

**Test Cases:**
1. Type partial product name: "Shirt"
   - Should show all products with "Shirt" in name
2. Select a product from list
   - Input should show selected product name
3. Clear the input
   - Product ID should be cleared
4. Type again and select different product
   - Should update to new product

---

### 5. Test View Mode

**Steps:**
1. Find existing PO in table
2. Click eye icon (View)
3. Modal opens in view mode

**Verify:**
- [ ] Title shows "View Purchase Order"
- [ ] PO Number is displayed
- [ ] All sections visible (no steps)
- [ ] All fields are DISABLED/readonly
- [ ] No "Next" or "Back" buttons
- [ ] Only "Close" button visible
- [ ] Customer/client name visible
- [ ] Project name visible
- [ ] Product names visible (not inputs)

---

### 6. Test Edit Mode

**Steps:**
1. Find existing PO in table
2. Click edit icon (Edit)
3. Modal opens in edit mode

**Verify:**
- [ ] Title shows "Edit Purchase Order"
- [ ] Form shows step navigation
- [ ] All fields are editable (except client if from SO)
- [ ] Customer dropdown visible for independent POs
- [ ] Product autocomplete works
- [ ] Can update values
- [ ] "Update" button visible instead of "Create"

**Test Update:**
1. Change project name
2. Update an item quantity
3. Update discount percentage
4. Click "Update"
5. Success toast appears
6. Changes saved to database

---

### 7. Test Validation

**Required Fields Test:**
1. Create new PO
2. Try to proceed without filling required fields

**Verify:**
- [ ] Customer required (for independent PO)
- [ ] Vendor required
- [ ] PO Date required
- [ ] Expected Delivery required
- [ ] Form should not submit without required fields

---

### 8. Test Edge Cases

**Multiple Items:**
1. Create PO with 5+ items
   - [ ] All items display correctly
   - [ ] Can remove any item
   - [ ] Totals calculate correctly

**Large Discount:**
1. Create PO with 100% discount
   - [ ] Grand total should account for discount
   - [ ] Should not go negative

**No Products:**
1. Type non-existent product name
   - [ ] No suggestions shown
   - [ ] Can still enter description manually
   - [ ] Form should accept PO with description-only items

**Cancel Actions:**
1. Fill form partially
2. Click "Cancel" or X button
   - [ ] Modal closes
   - [ ] No data saved
   - [ ] Can reopen form fresh

---

## Success Criteria

✅ All test cases pass
✅ No console errors
✅ Data saves correctly to database
✅ UI is responsive and user-friendly
✅ Customer and project fields work for independent POs
✅ Sales order-linked POs work correctly
✅ Product autocomplete provides good UX
✅ Form validation works properly

## Known Limitations

1. Project name is free text (no master table yet)
2. Product autocomplete uses HTML datalist (basic functionality)
3. Client name stored as text in addition to customer_id for display purposes

## Future Enhancements

1. Advanced product search with filters
2. Project master table with dropdown
3. Customer quick search in dropdown
4. Recent vendors/customers quick access
5. Template-based PO creation