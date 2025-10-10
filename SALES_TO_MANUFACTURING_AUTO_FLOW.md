# Sales to Manufacturing Automatic Production Request Flow

## Overview
This document describes the **automatic production request creation** when Sales sends orders to Procurement.

## 🔄 Complete Workflow

### Step 1: Sales Creates Sales Order
- Sales department creates a new Sales Order with customer details and product requirements
- Order status: `draft`

### Step 2: Sales Sends to Procurement
**Trigger**: Sales clicks "Send to Procurement" button on Sales Order

**What Happens Automatically**:
1. ✅ Sales Order is marked as `ready_for_procurement`
2. ✅ **Notification sent to Procurement** department
3. ✅ **Production Request AUTOMATICALLY created for Manufacturing** (NEW!)
4. ✅ **Notification sent to Manufacturing** department

### Step 3: Manufacturing Receives Production Request
- Manufacturing sees the new Production Request in their dashboard
- Request contains:
  - Request Number (PRQ-YYYYMMDD-XXXXX)
  - Sales Order reference
  - Project details
  - Product specifications
  - Quantity and delivery dates
  - Sales notes

### Step 4: Manufacturing Creates MRN (Material Request for Manufacturing)
- Manufacturing reviews the Production Request
- Creates Material Request for Manufacturing (MRN) against the project
- Specifies material requirements for production
- Forwards to Inventory department

## 📊 System Components

### Database Changes

#### New Migration: `20250115000000-add-sales-order-to-production-requests.js`
Adds support for Production Requests to be created from Sales Orders OR Purchase Orders.

**New Fields**:
- `sales_order_id` - Link to Sales Order (nullable)
- `sales_order_number` - Sales Order number for reference
- `sales_notes` - Notes from Sales department
- `po_id` - Made nullable (can be from SO or PO)
- `po_number` - Made nullable

**Run Migration**:
```bash
node server/scripts/runAddSalesOrderToProductionRequests.js
```

### Backend Changes

#### 1. Updated Model: `ProductionRequest.js`
```javascript
// Can now be created from Sales Order OR Purchase Order
sales_order_id: { type: INTEGER, allowNull: true }
sales_order_number: { type: STRING, allowNull: true }
sales_notes: { type: TEXT, allowNull: true }
po_id: { type: INTEGER, allowNull: true } // Changed to nullable
po_number: { type: STRING, allowNull: true } // Changed to nullable
```

#### 2. Updated Route: `sales.js`
**Endpoint**: `PUT /api/sales/orders/:id/send-to-procurement`

**New Logic**:
```javascript
// When Sales sends order to Procurement
1. Update Sales Order with procurement flags
2. Send notification to Procurement ✅
3. AUTO-CREATE Production Request:
   - Generate request number (PRQ-YYYYMMDD-XXXXX)
   - Extract product info from SO items
   - Create ProductionRequest record
   - Link to Sales Order
4. Send notification to Manufacturing ✅
```

#### 3. Updated Route: `productionRequest.js`
**Endpoint**: `GET /api/production-requests`

**Enhanced Response**:
```javascript
include: [
  { model: SalesOrder, as: 'salesOrder', include: [Customer] },
  { model: PurchaseOrder, as: 'purchaseOrder' },
  { model: User, as: 'requester' },
  { model: User, as: 'reviewer' }
]
```

#### 4. Updated Database Config: `database.js`
**New Associations**:
```javascript
SalesOrder.hasMany(ProductionRequest, { foreignKey: 'sales_order_id' })
ProductionRequest.belongsTo(SalesOrder, { foreignKey: 'sales_order_id' })
```

### Frontend Changes

#### 1. Updated Page: `ManufacturingProductionRequestsPage.jsx`
**Enhancements**:
- Shows Sales Order number OR PO number (whichever is present)
- Search includes `sales_order_number`
- Displays Sales Notes (green highlight) in addition to Procurement Notes
- "View SO" button for sales-originated requests
- "View PO" button for procurement-originated requests
- Button text: "Create MRN" (Material Request for Manufacturing)

**Visual Indicators**:
- 🟢 Green badge/button for Sales Orders
- 🔵 Blue badge/button for Purchase Orders

## 📋 Notifications

### To Procurement Department
```
Title: New Sales Order Request: SO-20250115-0001
Message: Sales Order SO-20250115-0001 has been sent to procurement and awaiting acceptance
Action: /procurement/create-po?so_id=123
Priority: high
```

### To Manufacturing Department
```
Title: New Production Request: PRQ-20250115-00001
Message: Production Request PRQ-20250115-00001 created for Sales Order SO-20250115-0001. 
         Please review and create Material Request for Manufacturing (MRN).
Action: /manufacturing/production-requests/456
Priority: high (or SO priority)
Metadata:
  - Sales Order Number
  - Customer Name
  - Project Name
  - Product Name
  - Total Quantity
  - Required Date
```

## 🎯 User Experience

### Sales Department
1. Create Sales Order
2. Click "Send to Procurement"
3. **Receive confirmation**: "Sales order sent to procurement and production request created for manufacturing successfully"
4. Done! No additional steps needed

### Manufacturing Department
1. Receive notification about new Production Request
2. Navigate to Manufacturing > Production Requests
3. See new request with:
   - Sales Order reference (green badge)
   - Customer information
   - Product specifications
   - Sales notes
4. Click "Create MRN" to start material planning
5. Create Material Request for Manufacturing (MRN)

### Procurement Department
1. Receive notification about Sales Order
2. Review and create Purchase Order
3. Continue existing PO workflow

## 🔍 How to Identify Request Source

### In Manufacturing Dashboard
**From Sales Order**:
- Shows: "Sales Order: SO-20250115-0001" (green)
- Button: "View SO" (green)
- Notes: "Sales Notes" section visible

**From Purchase Order**:
- Shows: "PO Number: PO-20250115-0001" (blue)
- Button: "View PO" (gray)
- Notes: "Procurement Notes" section visible

## 🚀 Testing the Flow

### Test Scenario
1. **Login as Sales User**
2. Create a new Sales Order:
   - Customer: Test Customer
   - Products: Add items with descriptions
   - Delivery Date: Set future date
   - Priority: High
3. **Send to Procurement**:
   - Click "Send to Procurement" button
   - Verify success message
4. **Login as Manufacturing User**
5. Check Production Requests:
   - Navigate to Manufacturing > Production Requests
   - Find the new request (PRQ-YYYYMMDD-XXXXX)
   - Verify Sales Order link is visible
   - Verify customer and product information
6. **Click "View SO"**:
   - Should navigate to Sales Order Details page
7. **Click "Create MRN"**:
   - Should navigate to request processing page

## 📈 Benefits

### ✅ Automation
- No manual Production Request creation needed
- Reduces human error
- Faster workflow

### ✅ Transparency
- Manufacturing immediately knows about new orders
- Clear traceability from SO → Production Request → MRN
- All departments stay informed

### ✅ Efficiency
- Parallel processing (Procurement AND Manufacturing start simultaneously)
- Faster production planning
- Better resource allocation

## 🔧 Technical Notes

### Request Number Format
- **Sales-originated**: `PRQ-YYYYMMDD-XXXXX`
- Sequence resets daily
- Unique per request

### Data Extraction from Sales Order
```javascript
// Product information
product_name: items[0]?.description || items[0]?.product_name
product_description: Summary of all items
quantity: Sum of all item quantities
unit: First item's unit

// Project information
project_name: order.project_name || `SO-${order_number}`

// Specifications
product_specifications: {
  items: All order items,
  customer_name: Customer name,
  garment_specifications: Garment specs from SO
}
```

### Status Flow
```
pending → reviewed → in_planning → materials_checking → 
ready_to_produce → in_production → quality_check → completed
```

## 🔗 Related Documentation
- `PROJECT_MATERIAL_REQUEST_WORKFLOW.md` - Material Request workflow
- `GRN_WORKFLOW_COMPLETE_GUIDE.md` - Goods Receipt workflow
- `SALES_TO_PROCUREMENT_TO_PO_WORKFLOW.md` - Sales to Procurement flow

---

**Last Updated**: January 2025  
**Feature**: Automatic Production Request Creation  
**Status**: ✅ Implemented and Active