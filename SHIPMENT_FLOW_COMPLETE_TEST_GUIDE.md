# Complete Shipment Flow End-to-End Test Guide

This guide covers all aspects of the shipment workflow from incoming production orders to delivery tracking.

---

## Overview

The shipment flow consists of:
1. **Incoming Orders** - Production orders ready for shipment
2. **Shipment Creation** - Create shipments from production orders
3. **Shipment Management** - View, edit, track shipments
4. **Delivery Tracking** - Track in-transit and out-for-delivery shipments
5. **Courier Partners** - Manage courier relationships
6. **Performance Analytics** - Analyze delivery metrics

---

## Test Scenario 1: Incoming Orders Display

### Objective
Verify that incoming production orders are correctly displayed with all data fields properly populated.

### Prerequisites
- At least 2 production orders with status = "completed" or "quality_check"
- Production orders must have linked sales orders with customer data
- Sales orders must have product information and delivery addresses

### Steps to Test

1. **Navigate to Shipment Dashboard**
   - Go to: `Shipment & Delivery Dashboard`
   - Click on "Incoming Orders" tab (first tab)

2. **Verify Table Headers**
   ```
   Expected columns:
   - Order No.
   - Customer
   - Product
   - Quantity
   - Date
   - Actions
   ```

3. **Verify Data Population**
   | Field | Source | Expected Value |
   |-------|--------|-----------------|
   | Order No. | `sales_order_number` | Should NOT be "N/A" |
   | Customer | `customer_name` | Should NOT be "N/A" |
   | Product | `product_name` | Should NOT be "N/A" |
   | Quantity | `quantity` | Should show numeric value |
   | Date | `last_updated` | Should show formatted date |

4. **Data Validation Checklist**
   - [ ] Order Number displays correctly (SO-XXXX format)
   - [ ] Customer name is visible
   - [ ] Product name is shown (not "N/A")
   - [ ] Quantity is numeric (> 0)
   - [ ] Date is formatted (MM/DD/YYYY)
   - [ ] All rows are sorted by last updated (newest first)

5. **Expected Output**
   ```
   ✓ Incoming Orders Table shows:
     - SO-2025-001 | Acme Corp | Cotton T-Shirt | 500 | 01/15/2025
     - SO-2025-002 | Beta Ltd  | Polyester Pants | 300 | 01/14/2025
     - SO-2025-003 | Gamma Inc | Denim Jacket   | 150 | 01/13/2025
   ```

---

## Test Scenario 2: View Production Order Details

### Objective
Verify that production order details modal displays correctly with all information.

### Steps to Test

1. **Open Details Modal**
   - In Incoming Orders tab, click green "Eye" icon for any order
   - Modal should open showing "Production Order Details"

2. **Verify Modal Header**
   - Title shows "Production Order Details"
   - Blue info banner appears with text: "Ready for Shipment - This is a production order. Click 'Create Shipment' to create a shipment from this order."

3. **Verify Basic Information Section**
   | Field | Expected Content |
   |-------|-----------------|
   | Production Number | Should display production order number |
   | Order Number | Should display sales order number (e.g., SO-2025-001) |
   | Status | Should show production status (e.g., "COMPLETED") |
   | Production Type | Should show type (in_house, outsourced) |

4. **Verify Customer Information Section**
   - Customer Name: Populated from linked sales order
   - Recipient Name: Defaults to customer name
   - Phone Number: Populated from customer record
   - Email: Populated from customer record

5. **Verify Product Information Section**
   - Product Name: Not "N/A"
   - Product Code: Populated or "N/A"
   - Quantity: Numeric value (> 0)
   - Priority: high, medium, low, or "N/A"

6. **Verify Delivery Address Section**
   - Shipping address displayed in gray box
   - Should NOT show "N/A" (should have real address)

7. **Data Validation**
   - [ ] No fields show "undefined"
   - [ ] No fields crash the component
   - [ ] Dates are formatted correctly
   - [ ] Numbers are displayed as integers/floats (not strings)
   - [ ] All text fields have fallback values

---

## Test Scenario 3: Create Shipment from Incoming Order

### Objective
Verify shipment creation workflow from production orders.

### Steps to Test

1. **Navigate to Create Shipment**
   - In Incoming Orders tab, click blue "Truck" icon
   - Should navigate to shipment creation page
   - Page should pre-fill data from the production order

2. **Verify Pre-filled Data**
   | Field | Expected Value |
   |-------|-----------------|
   | Sales Order | Should be auto-selected |
   | Customer | Should be pre-filled |
   | Recipient Name | Should be pre-filled |
   | Recipient Phone | Should be pre-filled |
   | Delivery Address | Should be pre-filled |
   | Quantity | Should be auto-filled from production order |
   | Product Info | Should be from linked product |

3. **Fill Additional Shipment Fields**
   - Select courier partner
   - Set expected delivery date (7-10 days from now)
   - Enter shipping cost (e.g., ₹500)
   - Select shipping method (Standard/Express)

4. **Create Shipment**
   - Click "Create Shipment" button
   - Should show success toast: "Shipment created successfully"
   - Should be redirected to Shipment Dashboard

5. **Verify Shipment Created**
   - Go to "Active Shipments" tab
   - New shipment should appear at top of list
   - Status should be "PREPARING"
   - Should have auto-generated shipment number (SHP-YYYYMMDD-0001)

---

## Test Scenario 4: Active Shipments Display

### Objective
Verify that active shipments are displayed correctly with proper data mapping.

### Prerequisites
- At least one shipment created from previous test

### Steps to Test

1. **Navigate to Active Shipments Tab**
   - Click "Active Shipments" tab in Shipment Dashboard

2. **Verify Table Structure**
   ```
   Expected columns:
   - Shipment No.
   - Order No.
   - Customer
   - Delivery Address
   - Courier
   - Tracking No.
   - Expected Delivery
   - Status
   - Actions
   ```

3. **Verify Data Population**
   | Column | Expected Format | Null Handling |
   |--------|-----------------|----------------|
   | Shipment No. | SHP-YYYYMMDD-0001 | Display "N/A" if missing |
   | Order No. | SO-2025-001 | Display "N/A" if missing |
   | Customer | Customer Name + Phone | "N/A" for either field |
   | Address | Full address | "N/A" if missing |
   | Courier | Courier name | "N/A" if missing |
   | Tracking | TRK-XXXX or "Not assigned" | Handle both cases |
   | Exp. Delivery | MM/DD/YYYY format | "N/A" if missing |
   | Status | PREPARING/PACKED/SHIPPED | Never undefined |

4. **Verify Status Badge Colors**
   - PREPARING: Amber/Orange
   - PACKED: Blue
   - READY_TO_SHIP: Indigo
   - SHIPPED: Sky Blue
   - IN_TRANSIT: Blue
   - OUT_FOR_DELIVERY: Indigo
   - DELIVERED: Emerald/Green
   - FAILED_DELIVERY: Rose/Red
   - RETURNED: Rose/Red
   - CANCELLED: Gray

5. **Data Validation Checklist**
   - [ ] No "undefined" text visible
   - [ ] All dates formatted correctly (MM/DD/YYYY)
   - [ ] Status badges display with correct colors
   - [ ] Customer section shows both name and phone
   - [ ] Address doesn't overflow (truncate if needed)
   - [ ] Tracking button works (navigates to tracking page)

---

## Test Scenario 5: Shipment Details Modal

### Objective
Verify shipment details modal displays all shipment information correctly.

### Steps to Test

1. **Open Shipment Details**
   - In Active Shipments tab, click "Eye" icon for any shipment
   - Modal should open with title "Shipment Details"

2. **Verify Basic Information**
   - Shipment Number: Displayed correctly
   - Order Number: From linked sales order
   - Status: Color-coded badge
   - Tracking Number: "Not assigned" if empty

3. **Verify Customer Information**
   - Customer Name: From sales order customer
   - Recipient Name: Shipment-specific recipient
   - Phone Number: With phone icon
   - Email: With email icon

4. **Verify Product Information**
   - Product Name: From linked product or sales order
   - Product Code: Barcode or code
   - Quantity: Total quantity
   - Priority: Priority level

5. **Verify Shipping Information** (only for shipments, not production orders)
   - Courier Partner: Company name
   - Shipping Method: Standard/Express
   - Shipment Date: When order was shipped
   - Expected Delivery: Formatted date

6. **Verify Delivery Address**
   - Complete address in gray box
   - Properly formatted

7. **Verify Package Details** (only for shipments)
   - Total Quantity: Number of items
   - Total Weight: kg format or "N/A"
   - Shipping Cost: ₹ currency format

---

## Test Scenario 6: Filter and Search

### Objective
Verify filtering and search functionality works correctly.

### Steps to Test

1. **Search by Shipment Number**
   - Type shipment number (e.g., "SHP-2025") in search box
   - Table should filter to matching shipments
   - Should NOT show unrelated shipments

2. **Search by Order Number**
   - Type order number (e.g., "SO-") in search box
   - Should find matching sales orders

3. **Search by Customer Name**
   - Type customer name in search box
   - Should filter results

4. **Filter by Status**
   - Select "Preparing" from status dropdown
   - Should only show shipments with PREPARING status
   - Try each status and verify filtering

5. **Filter by Courier**
   - Select a courier from dropdown
   - Should only show shipments from that courier

6. **Combined Filters**
   - Apply Status + Courier filters together
   - Should show intersection of both criteria

---

## Test Scenario 7: Status Updates

### Objective
Verify shipment status can be updated and tracked correctly.

### Prerequisites
- Shipment with status = "PREPARING"

### Steps to Test

1. **Navigate to Edit Shipment**
   - In Active Shipments, click "Edit" (pencil) icon
   - Should open shipment edit form

2. **Update Status Flow**
   - PREPARING → PACKED
     - Click "Update Status" to "PACKED"
     - Should show success message
   
   - PACKED → READY_TO_SHIP
     - Update to "READY_TO_SHIP"
     - Verify status badge updates
   
   - READY_TO_SHIP → SHIPPED
     - Update to "SHIPPED"
     - Should assign tracking number (auto-generated)
   
   - SHIPPED → IN_TRANSIT
     - Update to "IN_TRANSIT"
     - Add location info (e.g., "Delhi Hub")

3. **Verify Tracking History**
   - View tracking timeline
   - Should show all status transitions
   - Each entry should have timestamp and creator
   - Latest update should be at top

4. **Delivery Status Updates**
   - Update to OUT_FOR_DELIVERY
     - Add location: "Out for Delivery - Delhi"
   
   - Update to DELIVERED
     - Add location: "Delivered to Customer"
     - Should show actual delivery date

5. **Error Scenarios**
   - Try to move from DELIVERED back to IN_TRANSIT (should fail or show warning)
   - Try to delete a DELIVERED shipment (should fail)

---

## Test Scenario 8: Delivery Tracking Tab

### Objective
Verify delivery tracking information displays correctly.

### Prerequisites
- Shipments with status IN_TRANSIT or OUT_FOR_DELIVERY

### Steps to Test

1. **Navigate to Delivery Tracking Tab**
   - Click "Delivery Tracking" tab in Shipment Dashboard

2. **Verify Tracking Display**
   - Should show shipments in transit or out for delivery
   - Limit to last 10 shipments (configurable)

3. **Verify Tracking Updates**
   | Field | Expected |
   |-------|----------|
   | Shipment No. | SHP-XXX format |
   | Status | IN_TRANSIT or OUT_FOR_DELIVERY |
   | Location | Current location |
   | Timestamp | Recent timestamp |
   | Remarks | Status description |

4. **Verify Real-time Updates**
   - Update a shipment's location via edit
   - Click "Refresh" button
   - Delivery Tracking should reflect new location within 2 seconds

---

## Test Scenario 9: Courier Partners Management

### Objective
Verify courier partner information displays correctly.

### Prerequisites
- At least 3 active courier partners in database

### Steps to Test

1. **Navigate to Courier Partners Tab**
   - Click "Courier Partners" tab

2. **Verify Partner List**
   - Should show active couriers
   - Display: Logo, Name, Contact, Rating, On-time %

3. **View Courier Details**
   - Click on any courier
   - Modal should show:
     - Full company details
     - Contact person
     - Phone and email
     - Service areas
     - Performance rating
     - On-time delivery %
     - Average delivery time

4. **Verify Performance Metrics**
   - Rating: 0-5 stars
   - On-time %: 0-100%
   - Avg Delivery: Days (numeric)

---

## Test Scenario 10: Performance Analytics

### Objective
Verify dashboard statistics and analytics display correctly.

### Steps to Test

1. **Navigate to Performance Analytics Tab**
   - Click "Performance Analytics" tab

2. **Verify KPI Cards**
   - Total Shipments: Should show total count
   - In Transit: Number of shipments in transit
   - Delivered: Number of completed deliveries
   - Delayed: Number of delayed shipments
   - On-Time Delivery %: Percentage (0-100%)
   - Avg Delivery Time: Days (numeric)

3. **Verify Charts** (if applicable)
   - Shipment status distribution (pie/bar chart)
   - Delivery performance over time
   - Courier partner comparison
   - On-time delivery trends

4. **Data Accuracy**
   - Verify counts match Active Shipments tab
   - Sample calculation: On-time % = (Delivered on time / Total Delivered) * 100

---

## Test Scenario 11: Export Functionality

### Objective
Verify shipment data can be exported as CSV.

### Steps to Test

1. **Open Export Dialog**
   - Click "Export" button in dashboard

2. **Select Filter Options** (if available)
   - Status filter
   - Date range filter
   - Courier filter

3. **Export Data**
   - Choose "CSV" format
   - Click "Download"
   - File should download as `shipments_YYYY-MM-DD.csv`

4. **Verify CSV Content**
   - Headers: Shipment No., Order No., Customer, Status, Tracking No., etc.
   - Data rows match dashboard display
   - All dates formatted consistently
   - Currency values formatted correctly

---

## Test Scenario 12: Error Handling

### Objective
Verify proper error handling across shipment operations.

### Test Cases

1. **API Failures**
   - Simulate network error: Open DevTools → Network throttle
   - Try to load dashboard
   - Should show: "Failed to load..." toast or error message
   - Retry button should work

2. **Missing Data**
   - Try to create shipment without selecting courier
   - Should show validation error: "Please select a courier"
   - Try without delivery address
   - Should show validation error: "Delivery address is required"

3. **Invalid Transitions**
   - Try to move status backward (e.g., DELIVERED → SHIPPED)
   - Should show warning or prevent action

4. **Concurrent Operations**
   - Edit shipment in two browser tabs
   - Close one tab
   - Other tab should still work
   - Should show: "Shipment updated by another user" warning

---

## Data Field Completeness Checklist

### Incoming Orders Table
- [ ] No N/A values (except legitimate missing data)
- [ ] All numeric fields are numbers (not strings)
- [ ] All dates formatted as MM/DD/YYYY
- [ ] All rows sortable by date
- [ ] Quantities > 0

### Shipment Modal (Production Order)
- [ ] Shows blue "Ready for Shipment" banner
- [ ] Production Number displayed
- [ ] Order Number populated
- [ ] Customer Name populated
- [ ] Customer Phone populated
- [ ] Customer Email populated
- [ ] Product Name not "N/A"
- [ ] Quantity > 0
- [ ] Delivery Address populated
- [ ] No errors in console

### Shipment Modal (Actual Shipment)
- [ ] Shipment Number displayed
- [ ] Tracking Number shown (or "Not assigned")
- [ ] Courier Partner shown (or "N/A")
- [ ] Shipment Date formatted
- [ ] Expected Delivery Date formatted
- [ ] Total Weight shown (or "N/A")
- [ ] Shipping Cost formatted with ₹
- [ ] Address populated
- [ ] No errors in console

### Active Shipments Table
- [ ] No "undefined" text
- [ ] Shipment Numbers correct format
- [ ] Dates formatted consistently
- [ ] Status badges correct colors
- [ ] Customer phone displayed
- [ ] All rows clickable
- [ ] Tracking number is link (clickable)

---

## Null/N/A Handling Rules

| Scenario | Expected Behavior |
|----------|-------------------|
| Customer name missing | Show "N/A" |
| Phone missing | Show "N/A" with icon |
| Email missing | Show "N/A" with icon |
| Product name missing | Show "N/A" (never undefined) |
| Address missing | Show "N/A" (not blank) |
| Tracking number missing | Show "Not assigned" |
| Courier missing | Show "N/A" |
| Date missing | Show "N/A" |
| Quantity missing | Show "0" |
| Weight missing | Show "N/A" kg |
| Status missing | Show "UNKNOWN" |

---

## Performance Checklist

- [ ] Dashboard loads within 2 seconds
- [ ] Incoming orders load within 1 second
- [ ] Details modal opens within 500ms
- [ ] Shipment creation redirects within 1 second
- [ ] Status updates process within 2 seconds
- [ ] Search filters results in real-time (< 500ms)
- [ ] Export starts downloading within 1 second

---

## Browser Compatibility

Test on:
- [ ] Chrome 120+
- [ ] Firefox 121+
- [ ] Safari 17+
- [ ] Edge 120+
- [ ] Mobile Safari (iPad)
- [ ] Chrome Mobile (Android)

---

## Rollback Plan

If issues found:

1. **Data Display Issues**
   - Revert: `ShipmentDashboard.jsx` incoming orders section
   - Revert: `ShipmentDetailsDialog.jsx`

2. **API Issues**
   - Revert: `server/routes/shipments.js` `/orders/incoming` endpoint
   - Restore: Previous formatted orders structure

3. **Frontend Field Mapping**
   - Check: API response structure
   - Verify: Field names match (sales_order_number vs order_number)
   - Update: Modal component field access

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | | | ☐ Pass ☐ Fail |
| Product Owner | | | ☐ Approved |
| Tech Lead | | | ☐ Approved |

---

## Notes

- All tests should be performed in staging environment first
- Use test data created from database seeds
- Document any deviations from expected behavior
- Attach screenshots of any issues found
- Run tests after each deployment
