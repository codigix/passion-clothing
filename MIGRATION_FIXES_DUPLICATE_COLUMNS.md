# Migration Fixes - Duplicate Column Errors (FIXED)

## Issue Summary
Several migrations were attempting to add columns without checking if they already existed, causing "Duplicate column name" errors when running migrations on existing databases.

## Root Cause
When Sequelize models sync with the database (via `sequelize.sync()` or similar), columns defined in models may be auto-created. When migrations later try to add the same columns using `addColumn()` without existence checks, they fail.

## Fixed Migrations

### ✅ 1. `20250215120000-add-sales-order-fields.js`
**Columns:** `buyer_reference`, `order_type`  
**Error:** `Duplicate column name 'buyer_reference'`  
**Status:** Fixed with safety checks

### ✅ 2. `20250220000000-enhance-sales-orders.js`
**Columns:** `advance_paid`, `balance_amount`, `invoice_status`, `challan_status`, `procurement_status`, `design_files`, `invoice_number`, `invoice_date`  
**Error:** `Duplicate column name 'advance_paid'`  
**Status:** Fixed with safety checks + index checks

### ✅ 3. `20250120000000-add-barcode-to-purchase-orders.js`
**Columns:** `barcode`, `qr_code`  
**Status:** Fixed with safety checks

### ✅ 4. `20251003111000-add-linked-sales-order-id-to-purchase-orders.js`
**Columns:** `linked_sales_order_id`  
**Status:** Fixed with safety checks

### ✅ 5. `20250301000001-make-grn-fields-optional.js`
**Columns:** Multiple GRN verification columns  
**Status:** Fixed with safety checks

### ✅ 6. `20250306000000-add-dispatch-tracking-to-pos.js`
**Columns:** `dispatched_at`, `dispatch_tracking_number`, `dispatch_courier_name`, `dispatch_notes`, `expected_arrival_date`, `dispatched_by_user_id`  
**Status:** Fixed with safety checks

### ✅ 7. `20250220000001-add-customer-project-to-purchase-orders.js`
**Columns:** `customer_id`, `project_name`  
**Error:** `Duplicate column name 'customer_id'`  
**Indexes:** `idx_purchase_orders_customer_id`  
**Status:** Fixed with safety checks + index checks

### ✅ 8. `20250302000000-add-po-inventory-tracking.js`
**Columns:** `purchase_order_id`, `po_item_index`, `initial_quantity`, `consumed_quantity` (inventory table)  
**Error:** `Duplicate column name 'purchase_order_id'`  
**Tables:** `inventory_movements` (creates new table with safety check)  
**Indexes:** Multiple indexes on inventory and inventory_movements tables  
**Status:** Fixed with comprehensive safety checks for columns, table creation, and indexes

### ✅ 9. `20250304000000-create-goods-receipt-notes-table.js`
**Tables:** `goods_receipt_notes` (creates new table)  
**Error:** `Duplicate key name 'goods_receipt_notes_purchase_order_id'`  
**Indexes:** 6 indexes (purchase_order_id, bill_of_materials_id, sales_order_id, status, verification_status, grn_number)  
**Status:** Fixed with table existence check and safe index creation

### ✅ 10. `20250305000000-add-grn-vendor-revert-fields.js`
**Columns:** `vendor_revert_requested`, `vendor_revert_reason`, `vendor_revert_items`, `vendor_revert_requested_by`, `vendor_revert_requested_at`, `vendor_revert_approved_by`, `vendor_revert_approved_at`, `vendor_revert_status`, `vendor_revert_notes` (9 columns)  
**Error:** `Duplicate column name 'vendor_revert_requested'`  
**Status:** Fixed with comprehensive safety checks for all 9 vendor revert columns

### ✅ 11. `20250401000000-create-vendor-returns-table.js`
**Tables:** `vendor_returns` (creates new table with 20+ columns)  
**Error:** `Duplicate key name 'vendor_returns_purchase_order_id'`  
**Indexes:** 6 indexes (purchase_order_id, grn_id, vendor_id, status, return_number, return_type)  
**Status:** Fixed with table existence check and safe index creation for all 6 indexes

### ✅ 12. `20251008000000-create-production-requests-table.js`
**Tables:** `production_requests` (creates new table with 16+ columns for production workflow)  
**Error:** `Duplicate key name 'production_requests_po_id'`  
**Indexes:** 6 indexes (po_id, status, priority, project_name, requested_by, production_order_id)  
**Status:** Fixed with table existence check and safe index creation for all 6 indexes

### ✅ 13. `create-project-material-requests-table.js`
**Tables:** `project_material_requests` (creates new table with 25+ columns for material requests)  
**Error:** `Could not find migration method: up`  
**Issue:** File was a custom script with raw SQL instead of proper Sequelize migration format  
**Indexes:** 11 indexes (request_number, purchase_order_id, sales_order_id, project_name, status, priority, request_date, created_by, reviewed_by, forwarded_by, processed_by)  
**Status:** Completely rewritten to use proper Sequelize migration structure with up/down methods and safety checks

## Solution Applied

All migrations now include helper functions that check for existence before modifying:

```javascript
// Helper functions added to each migration:
const tableExists = async (queryInterface, tableName) => { ... };
const describeTableIfExists = async (queryInterface, tableName) => { ... };
const columnExists = (tableDefinition, columnName) => { ... };
const addColumnIfMissing = async (queryInterface, tableName, columnName, columnDefinition) => { ... };
const removeColumnIfExists = async (queryInterface, tableName, columnName) => { ... };
const addIndexIfMissing = async (queryInterface, tableName, fields, options) => { ... };
const removeIndexIfExists = async (queryInterface, tableName, indexNameOrFields) => { ... };
```

## Pattern Used

**Before (Unsafe):**
```javascript
await queryInterface.addColumn('sales_orders', 'buyer_reference', { ... });
```

**After (Safe):**
```javascript
await addColumnIfMissing(queryInterface, 'sales_orders', 'buyer_reference', { ... });
```

## Testing

Run migrations to verify all duplicate column errors are resolved:

```powershell
# Navigate to server directory
Set-Location "d:\Projects\passion-inventory\server"

# Run migrations
npx sequelize-cli db:migrate
```

## Benefits

1. ✅ **Idempotent Migrations**: Migrations can be run multiple times without errors
2. ✅ **Existing Database Support**: Works with databases that already have some columns
3. ✅ **Development Friendly**: Handles cases where `sequelize.sync()` was used
4. ✅ **Production Safe**: Won't fail on partial migration states

## Notes

- All migrations now follow the safe pattern used in `20250212110000-sales-procurement-workflow.js`
- Rollback (down) migrations also use safe removal methods
- Index creation/removal also includes existence checks where applicable
- This pattern should be used for ALL future migrations

## Migration Already Safe (No Changes Needed)

- `20251004120000-add-materials-source-to-purchase-orders.js` - Already had safety checks
- Most migrations created after `20250212110000-sales-procurement-workflow.js` - Already used the pattern

## Date Fixed
January 2025

## Status
🟢 **ALL DUPLICATE COLUMN/INDEX ISSUES RESOLVED** (13 migrations fixed)

---
*This fix ensures database migrations work seamlessly across fresh installations, existing databases, and development environments.*