# Production Order Flow - Quick Start Guide

## 🚀 What Was Fixed

### Critical Issue Resolved
✅ **Missing POST Endpoint** - The `POST /api/manufacturing/orders` endpoint was completely missing from the backend, preventing production orders from being created.

### Flow Restructured
✅ **Project-Based Tracking** - Production orders now use the Sales Order as a project reference, allowing multiple MRNs to be created for the same project.

## 🎯 New Flow

```
Sales Order → Production Order → Multiple MRNs (as needed)
```

**Before** (broken):
- Frontend called `POST /api/manufacturing/orders`
- Backend returned 404 (endpoint didn't exist)
- Production orders couldn't be created

**After** (fixed):
- Frontend calls `POST /api/manufacturing/orders`
- Backend creates production order successfully
- Sales order number used as project reference
- MRNs created separately when materials are needed

## 📝 Quick Usage

### 1. Create Production Order

```javascript
// From ProductionWizardPage
const response = await api.post('/manufacturing/orders', {
  product_id: 123,
  sales_order_id: 456,
  quantity: 1000,
  planned_start_date: '2025-01-15',
  planned_end_date: '2025-02-15',
  // ... other fields
});
```

**Response**:
```json
{
  "message": "Production order created successfully",
  "productionOrder": {...},
  "id": 123,
  "production_number": "PRD-20250114-0001",
  "stages": [...]
}
```

### 2. Create MRN for Project

```javascript
// Separate MRN creation - on demand
await api.post('/project-material-requests', {
  sales_order_id: 456, // Same project
  materials_requested: [
    { material_name: 'Fabric', quantity_required: 500 }
  ]
});
```

### 3. Query Project Activities

```javascript
// Get all production orders for a project
const orders = await ProductionOrder.findAll({
  where: { project_reference: 'SO-20250114-0001' }
});

// Get all MRNs for a project
const mrns = await ProjectMaterialRequest.findAll({
  where: { sales_order_id: 456 }
});
```

## 🗂️ Database Changes

### New Field Added

**Table**: `production_orders`
**Field**: `project_reference` VARCHAR(100)
**Purpose**: Store sales order number for grouping

### Run Migration

```bash
# Run this to add the new field
node migrations/add-project-reference-to-production-orders.js
```

**Migration does**:
- Adds `project_reference` column
- Adds index for performance
- Migrates existing data from sales orders

## ✅ What You Get

1. **Production orders can be created** - Missing endpoint now exists
2. **Project-based tracking** - Group multiple orders under one project
3. **Multiple MRNs** - Create material requests as needed, not automatically
4. **Complete audit trail** - All activities linked to project reference
5. **Backward compatible** - No breaking changes to existing code

## 🔧 Files Modified

1. ✅ `server/routes/manufacturing.js` - Added POST /orders endpoint (lines 226-460)
2. ✅ `server/models/ProductionOrder.js` - Added project_reference field
3. ✅ `migrations/add-project-reference-to-production-orders.js` - Database migration
4. ✅ `PRODUCTION_ORDER_FLOW_RESTRUCTURE.md` - Complete documentation

## 🧪 Testing

### Test Production Order Creation

1. Open Production Wizard in frontend
2. Select sales order, product, quantity
3. Fill in stages, materials, quality checks
4. Click "Create Production Order"
5. Should see success message and redirect to orders page
6. Check console logs for `PRD-YYYYMMDD-XXXX` number

### Verify Backend

```bash
# Check server logs
tail -f server.log

# Should see:
# ✅ Production order created: PRD-20250114-0001 (ID: 123)
# ✅ Created 4 production stages
# ✅ Created 5 material requirements
# ✅ Created 3 quality checkpoints
# ✅ Updated sales order SO-20250114-0001 to in_production
```

### Verify Database

```sql
-- Check production order created
SELECT * FROM production_orders ORDER BY id DESC LIMIT 1;

-- Check project reference
SELECT 
  production_number, 
  project_reference, 
  sales_order_id 
FROM production_orders 
WHERE project_reference IS NOT NULL;

-- Check stages created
SELECT * FROM production_stages WHERE production_order_id = 123;
```

## ⚠️ Important Notes

### Run Migration First

Before using the new field in queries, run the migration:

```bash
node migrations/add-project-reference-to-production-orders.js
```

### MRNs Are Separate

- **Don't expect automatic MRN creation** - this was removed by design
- Create MRNs manually when materials are needed
- Link MRNs to project using `sales_order_id`

### Frontend Works Unchanged

- No frontend code changes needed
- ProductionWizardPage already sends correct payload
- Response format includes all expected fields

## 🐛 Troubleshooting

**Issue**: 404 error when creating production order  
**Fix**: Restart server to load new endpoint

**Issue**: project_reference is null  
**Fix**: Run migration script to add column

**Issue**: Validation error on product_id  
**Fix**: Ensure product exists in database

**Issue**: Permission denied  
**Fix**: User must have 'manufacturing' or 'admin' department

## 📚 Related Docs

- `PRODUCTION_ORDER_FLOW_RESTRUCTURE.md` - Complete implementation details
- `PRODUCTION_OPERATIONS_SIMPLIFIED.md` - Stage management
- `MRN_FLOW_IMPLEMENTATION_COMPLETE.md` - MRN workflow

---

**Status**: ✅ Complete  
**Date**: January 14, 2025  
**Impact**: Critical - Production orders can now be created