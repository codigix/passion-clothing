# Purchase Order Form Enhancements

## Overview
Enhanced the Purchase Order creation form to support both sales order-linked and independent purchase orders with proper customer, project, and product selection.

## Changes Made

### 1. Backend Changes

#### Database Schema
- **Added fields to PurchaseOrder model:**
  - `customer_id` (INTEGER, references customers table) - For independent POs
  - `project_name` (STRING(200)) - Project name for PO

#### API Endpoints
- **New Endpoint:** `GET /api/sales/customers`
  - Returns list of active customers
  - Supports search by name, customer_code, or company_name
  - Used for customer dropdown in independent PO creation

#### Database Associations
- Added `PurchaseOrder.belongsTo(Customer)` association
- Added customer details to PO fetch queries

#### Migration
- Created migration: `20250220000001-add-customer-project-to-purchase-orders.js`
- Adds `customer_id` and `project_name` columns to `purchase_orders` table
- Adds index on `customer_id` for performance

### 2. Frontend Changes

#### New Hook
- **Created:** `client/src/hooks/useCustomers.js`
  - Fetches customers from `/api/sales/customers`
  - Supports search functionality
  - Integrated with react-query

#### PurchaseOrdersPage Updates
- Imported and used `useCustomers` hook
- Created `customerOptions` array for dropdown
- Passed `customerOptions` to `PurchaseOrderForm` component

#### PurchaseOrderForm Updates
- **New Props:**
  - `customerOptions` - Array of customer options for dropdown

- **New Form Fields:**
  - `customer_id` - Stores selected customer ID
  - `project_name` - Already existed, now properly integrated

- **Conditional UI:**
  - When creating from Sales Order: Shows client name as disabled text field (read-only)
  - When creating independent PO: Shows customer dropdown (required)
  - Project name shown in both cases (editable for independent, read-only for SO-linked)

- **Product Selection:**
  - Changed from dropdown to autocomplete input with datalist
  - Users can type to search products
  - Provides better UX for large product lists

- **Form State:**
  - Added `productSearchTerms` state to track search input per item
  - Properly initializes customer_id from linkedSalesOrder when applicable

## Features

### Independent Purchase Order Creation
1. **Customer Selection:**
   - Dropdown with all active customers
   - Format: "Customer Name (CUSTOMER_CODE)"
   - Required field
   - Automatically updates client_name field

2. **Project Selection:**
   - Text input for project name
   - Optional field
   - Free text entry

3. **Vendor Selection:**
   - Dropdown (existing functionality)
   - Required field

4. **Product Selection:**
   - Autocomplete input with datalist
   - Type to search products
   - Shows suggestions as you type
   - Better for large product catalogs

### Sales Order-Linked Purchase Order Creation
1. **Customer Information:**
   - Pre-filled from sales order
   - Displayed as read-only text
   - No customer dropdown shown

2. **Project Information:**
   - Pre-filled from sales order customer name
   - Displayed as read-only

3. **Other Fields:**
   - Same as independent PO creation

## Usage

### Creating Independent Purchase Order
1. Click "Create PO" button
2. Select customer from dropdown (required)
3. Enter project name (optional)
4. Select vendor (required)
5. Set dates, priority, and status
6. Add items with autocomplete product search
7. Enter financial details
8. Submit

### Creating PO from Sales Order
1. Click "Create PO" from sales order row
2. Customer and project pre-filled from SO
3. Select vendor (required)
4. Review and adjust dates
5. Add items with autocomplete product search
6. Enter financial details
7. Submit

## Running the Migration

```powershell
# Navigate to server directory
Set-Location "d:\Projects\passion-inventory\server"

# Run the migration
npx sequelize-cli db:migrate

# Or run with Node.js
node -e "const { sequelize } = require('./config/database'); require('./migrations/20250220000001-add-customer-project-to-purchase-orders').up(sequelize.getQueryInterface(), require('sequelize'));"
```

## Testing

### Test Customers API
```powershell
# Start the server
npm run dev

# Test customer endpoint (in another terminal)
curl http://localhost:5000/api/sales/customers -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Form
1. Login to the application
2. Navigate to Procurement > Purchase Orders
3. Click "Create PO" button
4. Verify customer dropdown appears
5. Select a customer
6. Enter project name
7. Select vendor
8. Try autocomplete product search
9. Complete and submit form

### Test Sales Order Integration
1. Navigate to Sales > Sales Orders
2. Find a confirmed sales order
3. Click "Create PO from Sales Order"
4. Verify customer name is pre-filled and read-only
5. Verify project is pre-filled
6. Complete and submit form

## Files Modified

### Backend
- `server/models/PurchaseOrder.js` - Added customer_id and project_name fields
- `server/routes/sales.js` - Added GET /customers endpoint
- `server/routes/procurement.js` - Added customer association to PO queries
- `server/config/database.js` - Added PurchaseOrder-Customer association
- `server/migrations/20250220000001-add-customer-project-to-purchase-orders.js` - New migration

### Frontend
- `client/src/hooks/useCustomers.js` - New hook for fetching customers
- `client/src/pages/procurement/PurchaseOrdersPage.jsx` - Added customer fetching and passing
- `client/src/components/procurement/PurchaseOrderForm.jsx` - Enhanced form with conditional fields

## Benefits

1. **Flexibility:** Supports both independent and SO-linked purchase orders
2. **Data Integrity:** Proper customer tracking for all POs
3. **Better UX:** Autocomplete product search improves usability
4. **Project Tracking:** Ability to associate POs with specific projects
5. **Consistent Data:** Customer information properly linked in database
6. **Scalability:** Autocomplete works better with large product catalogs

## Future Enhancements

1. Add project master table for project dropdown
2. Add customer search/filter in dropdown
3. Add product search with additional details (stock, price)
4. Add recent customers quick selection
5. Add project templates for common PO types