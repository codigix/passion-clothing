# Project Name Display System - Complete Implementation Guide

**Date**: January 15, 2025  
**Status**: ✅ In Progress  
**Scope**: System-wide Project Name + Order ID Display Enhancement

---

## 📋 Overview

This document outlines the comprehensive system enhancement to display **Project Name** as the primary identifier with **Order ID** displayed beneath it across all tables throughout the system.

### Key Features
- ✅ Unified project identification across all modules
- ✅ Stacked display format (Project Name over Order ID)
- ✅ Consistent user experience throughout the system
- ✅ Responsive design with copy-to-clipboard functionality
- ✅ Applied to Sales, Manufacturing, Procurement, and Shipment modules

---

## 🔄 Implementation Progress

### Phase 1: Database Layer ✅ COMPLETED

#### Models Updated
1. **SalesOrder** - Already has `project_name` field
2. **ProductionOrder** - ✅ Added `project_name` field
3. **PurchaseOrder** - Already has `project_name` field
4. **Shipment** - ✅ Added `project_name` field

#### Migration Script
- **File**: `add-project-name-columns.sql`
- **Purpose**: Add project_name columns to production_orders and shipments tables
- **Features**:
  - Adds VARCHAR(200) project_name column
  - Creates performance indexes
  - Auto-populates from sales_orders for existing records
  - Includes verification queries

#### Execution Steps
```sql
-- Run the migration script
mysql -u root -p < add-project-name-columns.sql

-- Or in MySQL client:
source /path/to/add-project-name-columns.sql
```

---

### Phase 2: Frontend Component ✅ COMPLETED

#### ProjectIdentifier Component
- **File**: `client/src/components/common/ProjectIdentifier.jsx`
- **Purpose**: Reusable component for displaying project + order identifier

#### Features
- **Display Formats**: Stacked layout with icon support
- **Sizes**: small, default, large
- **Type Support**: sales, production, purchase, shipment
- **Interactive**: Copy to clipboard, hover effects, tooltips
- **Responsive**: Works on mobile and desktop

#### Usage Example
```jsx
<ProjectIdentifier
  projectName={order.project_name}
  orderId={order.order_number}
  type="sales"
  size="small"
/>
```

---

### Phase 3: Frontend Tables Updated ✅ IN PROGRESS

#### ✅ Sales Orders Page
- **File**: `client/src/pages/sales/SalesOrdersPage.jsx`
- **Changes**:
  - Imported ProjectIdentifier component
  - Changed header from "SO Number" → "Project Details"
  - Updated table rows to display ProjectIdentifier
  - Updated card view to show project info
  - Applied to both table and card view modes

#### ✅ Production Orders Page
- **File**: `client/src/pages/manufacturing/ProductionOrdersPage.jsx`
- **Changes**:
  - Imported ProjectIdentifier component
  - Changed header from "Order Number" → "Project Details"
  - Updated table rows to display ProjectIdentifier
  - Added projectName to data mapping
  - Type set to "production"

#### ✅ Purchase Orders Page
- **File**: `client/src/pages/procurement/PurchaseOrdersPage.jsx`
- **Changes**:
  - Imported ProjectIdentifier component
  - Changed header from "PO Number" → "Project Details"
  - Updated table rows to display ProjectIdentifier
  - Type set to "purchase"
  - Maintained existing project_name column visibility toggle

#### ⏳ Shipment Pages (TODO)
- **Files**:
  - `client/src/pages/shipment/ShippingDashboardPage.jsx`
  - `client/src/pages/shipment/ShipmentDispatchPage.jsx`
  - `client/src/pages/shipment/ShipmentReportsPage.jsx`
- **Status**: Requires further investigation for table structure
- **Action**: Need to add ProjectIdentifier to shipment display areas

---

### Phase 4: Backend API Updates ⏳ IN PROGRESS

#### Current Status
- APIs may already return project_name from sales_orders
- Need to verify that all list endpoints include project_name in responses

#### Endpoints to Verify/Update

**Sales Orders**
- `GET /sales/orders` - Check if includes project_name

**Production Orders**
- `GET /manufacturing/orders` - Check if includes project_name

**Purchase Orders**
- `GET /procurement/pos` - Already has project_name column

**Shipments**
- `GET /shipments` - Need to verify project_name inclusion

#### Backend Enhancement Script
- **Purpose**: Auto-populate project_name from sales_orders
- **Coverage**: Production Orders, Shipments
- **Execution**: `node populate-project-names.js`

---

## 🗂️ File Structure

```
project-root/
├── Database
│   └── add-project-name-columns.sql         ✅ Created
│
├── Backend Scripts
│   └── populate-project-names.js             ⏳ To Create
│
├── Frontend Components
│   └── client/src/components/common/
│       └── ProjectIdentifier.jsx             ✅ Created
│
└── Frontend Pages Updated
    ├── client/src/pages/sales/
    │   └── SalesOrdersPage.jsx              ✅ Updated
    ├── client/src/pages/manufacturing/
    │   └── ProductionOrdersPage.jsx         ✅ Updated
    ├── client/src/pages/procurement/
    │   └── PurchaseOrdersPage.jsx           ✅ Updated
    └── client/src/pages/shipment/
        ├── ShippingDashboardPage.jsx        ⏳ To Update
        ├── ShipmentDispatchPage.jsx         ⏳ To Update
        └── ShipmentReportsPage.jsx          ⏳ To Update
```

---

## 📊 Display Format Examples

### Stacked Display (Implemented)
```
┌────────────────────┐
│ 📋 Project XYZ     │
│ SO-20250115-0001   │
└────────────────────┘
```

**Features:**
- Project name in bold, larger font
- Order ID in monospace font below
- Icon indicating order type
- Hover effects and copy indicator
- Tooltip showing full details

---

## 🔧 Deployment Checklist

- [ ] Run database migration (`add-project-name-columns.sql`)
- [ ] Verify tables have project_name columns
- [ ] Deploy ProjectIdentifier component
- [ ] Deploy updated Sales Orders page
- [ ] Deploy updated Production Orders page
- [ ] Deploy updated Purchase Orders page
- [ ] Update Shipment pages (pending)
- [ ] Verify all APIs return project_name
- [ ] Test copy-to-clipboard functionality
- [ ] Test responsive design on mobile
- [ ] Test on all major browsers

---

## 📋 Data Population Strategy

### Automatic Population
When a record is created (Sales Order, etc.), the project_name is set explicitly in the application.

### Backfill for Existing Records
The migration script auto-populates project_name from related sales_orders for:
- Production Orders
- Shipments

### Manual Entry
Users can manually set project_name when creating new orders in all modules.

---

## 🚀 Next Steps

1. **Run Database Migration**
   - Execute `add-project-name-columns.sql` on production database

2. **Create Backend Population Script**
   - File: `populate-project-names.js`
   - Purpose: Bulk update existing records

3. **Update Remaining Pages**
   - Shipment Dashboard
   - Shipment Dispatch
   - Shipment Reports
   - Any other table-based pages

4. **API Response Verification**
   - Test all list endpoints
   - Confirm project_name is included
   - Add if missing

5. **Testing & Validation**
   - Full system testing
   - Cross-browser testing
   - Mobile responsiveness check
   - User acceptance testing

6. **Documentation Update**
   - Update user manuals
   - Create training materials
   - Document API changes

---

## 🆘 Troubleshooting

### Issue: Project names not showing
**Solution**: 
- Verify database migration was successful
- Check if backend includes project_name in API responses
- Clear browser cache and restart

### Issue: Copy-to-clipboard not working
**Solution**:
- Check browser console for errors
- Ensure HTTPS on production (copy API requires secure context)
- Test on different browser

### Issue: Component not displaying correctly
**Solution**:
- Verify ProjectIdentifier component is imported
- Check CSS classes are loading
- Inspect browser DevTools for styling issues

---

## 📞 Support & Questions

For questions or issues:
1. Check this document first
2. Review component code comments
3. Check browser console for errors
4. Contact development team

---

## 📝 Change Log

- **2025-01-15**: Initial implementation
  - Created ProjectIdentifier component
  - Updated SalesOrdersPage
  - Updated ProductionOrdersPage
  - Updated PurchaseOrdersPage
  - Created migration scripts
  - Created this documentation