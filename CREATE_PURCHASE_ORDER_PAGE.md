# Create Purchase Order Page

## Overview
A dedicated full-page form for creating purchase orders, similar to the Sales Order creation page. This replaces the modal-based approach with a comprehensive, user-friendly interface.

## Location
- **File**: `client/src/pages/procurement/CreatePurchaseOrderPage.jsx`
- **Route**: `/procurement/purchase-orders/create`

## Features

### 1. **Vendor & Order Information Section**
- **Vendor Selection** (Required): Dropdown to select vendor
- **Project Name**: Optional project name
- **Customer Selection**: Optional customer linking
- **Client Name**: Manual client name entry
- **PO Date**: Defaults to today
- **Expected Delivery Date** (Required): Minimum date is today
- **Priority**: Low, Medium, High, Urgent
- **Delivery Address**: Full delivery address

### 2. **Dynamic Items Section**
Add multiple items with two types:

#### **Fabric Items**
- Fabric Name
- Color
- HSN Code
- GSM (Grams per Square Meter)
- Width

#### **Accessories Items**
- Item Name
- Description

#### **Common Fields for All Items**
- Unit of Measure (UOM): Meters, Yards, Kilograms, Pieces, Sets, Dozens, Boxes
- Quantity
- Rate (₹)
- Total (Auto-calculated)
- Supplier (Auto-filled from selected vendor)
- Remarks

### 3. **Financial Details Section**
- **Discount Percentage**: 0-100%
- **Tax/GST Percentage**: 0%, 5%, 12%, 18%, 28%
- **Freight Charges**: Additional shipping costs
- **Payment Terms**: Custom payment terms text
- **Special Instructions**: Vendor-visible instructions
- **Terms & Conditions**: Legal terms
- **Internal Notes**: Private notes (not visible to vendor)

### 4. **Financial Summary Dashboard**
Auto-calculated display cards:
- Subtotal
- Discount Amount
- Tax Amount
- Freight Charges
- **Grand Total**

### 5. **Action Buttons**
- **Save Purchase Order**: Creates the PO as draft
- **Send to Vendor**: Marks PO as sent
- **Mark as Received**: Updates status to received
- **Generate QR Code**: Creates scannable QR code
- **Print PO**: Opens print dialog
- **View All Orders**: Returns to PO list page

## Usage Scenarios

### Scenario 1: Create New Purchase Order
1. Navigate to `/procurement/purchase-orders`
2. Click "Create PO" button
3. Fill in vendor and order details
4. Add items (fabric/accessories)
5. Configure financial details
6. Click "Save Purchase Order"

### Scenario 2: Create from Sales Order
1. In Sales Orders page, click "Create PO" on an order
2. System navigates to `/procurement/purchase-orders/create?from_sales_order=123`
3. Form auto-fills with:
   - Customer information
   - Project name
   - Items from sales order
   - Expected delivery date
   - Special instructions
   - Internal note with SO link
4. Select vendor and adjust details as needed
5. Save the purchase order

### Scenario 3: Quick Add Multiple Items
1. Fill basic order information
2. Click "Add Item" button repeatedly
3. Toggle between Fabric/Accessories type for each item
4. Fill quantities and rates
5. Watch totals calculate automatically

## Auto-Fill Features

### Vendor Selection Auto-Fill
When vendor is selected:
- All items' "Supplier" field auto-fills with vendor name
- New items added also get vendor name automatically

### Sales Order Auto-Fill
When creating from Sales Order:
- Project Name ← SO Customer Name or Project Title
- Customer ID ← SO Customer ID
- Client Name ← SO Customer Name
- Expected Delivery ← SO Delivery Date
- Priority ← SO Priority
- Special Instructions ← SO Special Instructions
- Items ← Mapped from SO items with appropriate type
- Internal Notes ← "Linked to Sales Order: SO-XXX"

### Item Total Calculation
- Total = Quantity × Rate
- Updates automatically when quantity or rate changes

### Financial Calculations
```
Subtotal = Sum of all item totals
Discount Amount = Subtotal × (Discount % / 100)
After Discount = Subtotal - Discount Amount
Tax Amount = After Discount × (Tax % / 100)
Grand Total = After Discount + Tax Amount + Freight Charges
```

## URL Parameters

### `from_sales_order`
- **Example**: `/procurement/purchase-orders/create?from_sales_order=45`
- **Effect**: Fetches sales order #45 and auto-fills the form
- **Toast Notification**: "Loaded data from Sales Order: SO-XXX"

## State Management
- Form data stored in local state
- Vendor/Customer options fetched from API
- Real-time validation
- Linked sales order fetched on mount if parameter present

## API Endpoints Used

### GET Requests
- `/procurement/vendors` - Fetch vendor list
- `/sales/customers` - Fetch customer list
- `/sales/orders/:id` - Fetch linked sales order (if applicable)

### POST Requests
- `/procurement/pos` - Create new purchase order

### PUT Requests
- `/procurement/pos/:id` - Update PO status (send to vendor, mark received)

## Success Flow
1. User fills form and clicks "Save Purchase Order"
2. Validation checks:
   - Vendor selected
   - Expected delivery date provided
   - At least one valid item present
3. POST request to `/procurement/pos`
4. Success response returns created PO with `po_number`
5. Toast notification: "Purchase order created successfully!"
6. QR code data generated
7. Success badge displays: "Order Created: PO-XXX"
8. Action buttons enable for next steps

## Error Handling
- **No Vendor**: "Please select a vendor"
- **No Delivery Date**: "Expected delivery date is required"
- **No Items**: "At least one valid item is required"
- **API Error**: Shows error message from server or generic error
- Toast notifications for all errors

## Design Pattern
Follows the same design pattern as `CreateSalesOrderPage`:
- Full-page layout (not modal)
- Sectioned form with clear headers
- Card-based sections with borders and shadows
- Grid-based responsive layouts
- Color-coded action buttons
- Real-time calculations
- Auto-save behavior with disabled fields after save

## Integration Points

### Navigation Flow
```
PurchaseOrdersPage 
  → Click "Create PO" 
  → CreatePurchaseOrderPage
  → Save
  → View All Orders (back to PurchaseOrdersPage)
```

### Sales Order Integration
```
SalesOrdersPage 
  → Click "Create PO" on order
  → PurchaseOrdersPage (intercepts create_from_so param)
  → Redirects to CreatePurchaseOrderPage with from_sales_order param
  → Auto-fills form from SO data
```

### QR Code Integration
- Uses `QRCodeDisplay` component
- Generates QR with `generateOrderQRData(order, 'purchase')`
- Modal overlay for QR display
- Scannable for quick PO lookup

## Styling
- TailwindCSS utility classes
- Consistent color scheme:
  - Primary: Blue (Save, Print)
  - Purple: Send to Vendor
  - Green: Mark as Received
  - Indigo: QR Code
  - Gray: Neutral actions
- Hover effects on all interactive elements
- Disabled states for unavailable actions
- Responsive grid layouts (md:grid-cols-2, lg:grid-cols-3)

## Future Enhancements
- [ ] Multi-step wizard option
- [ ] Draft auto-save every 30 seconds
- [ ] Item templates for common purchases
- [ ] Vendor-specific terms pre-fill
- [ ] Approval workflow integration
- [ ] PDF preview before printing
- [ ] Bulk item import from CSV
- [ ] Historical price suggestions

## Testing Checklist
- [ ] Create PO with fabric items
- [ ] Create PO with accessory items
- [ ] Create PO with mixed items
- [ ] Create from linked sales order
- [ ] Verify auto-calculations
- [ ] Test vendor auto-fill
- [ ] Test all action buttons
- [ ] Test QR code generation
- [ ] Test form validation
- [ ] Test responsive layout on mobile
- [ ] Test print functionality

---
*Created: January 2025*
*Last Updated: January 2025*