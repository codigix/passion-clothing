# 🔴 URGENT: Fix 500 Errors After Product ID Implementation

## Problem
After updating the Sequelize models with `product_id` and `product_name` fields, the server is throwing 500 errors because:
- ✅ Models have the new fields (in code)
- ❌ Database tables DON'T have the columns yet
- ❌ Sequelize tries to query non-existent columns → 500 error

## Error Symptoms
```
Failed to load resource: the server responded with a status of 500
/api/sales/orders?limit=100&status=confirmed - 500
ProductionWizardPage fetch errors
```

## ⚡ IMMEDIATE FIX (2 minutes)

### Option A: Run Migration Script (RECOMMENDED)
```powershell
# 1. Stop the server (Ctrl+C if running)

# 2. Run the migration script
cd d:\Projects\passion-clothing
node add-product-id-tracking.js

# 3. Restart the server
npm run dev
```

### Option B: Temporarily Revert Models (If you want to delay migration)

If you want to revert the model changes and add product tracking later:

1. **Revert the 8 model files** to their previous versions
2. **Restart the server**
3. **Run migration when ready**

## Why This Happened

When I updated the models, I added:
```javascript
product_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: { model: 'products', key: 'id' }
},
product_name: {
  type: DataTypes.STRING(200),
  allowNull: true
}
```

These fields exist in **JavaScript code** but not in **MySQL database** yet.

## ✅ Verification After Fix

After running the migration and restarting:

1. **Check server starts without errors**
```powershell
npm run dev
# Should see: "Server running on port 5000"
```

2. **Verify columns exist**
```sql
DESCRIBE sales_orders;
DESCRIBE purchase_orders;
-- Should show product_id and product_name columns
```

3. **Test the endpoints**
- Open browser: http://localhost:3000
- Navigate to Production Wizard
- Should load without 500 errors

## 🎯 What Migration Script Does

The `add-product-id-tracking.js` script:
1. ✅ Checks if columns already exist (safe to re-run)
2. ✅ Adds product_id and product_name to 8 tables
3. ✅ Creates indexes for performance
4. ✅ Shows SQL for linking existing data
5. ✅ Takes ~30 seconds to complete

## 📋 Complete Steps

```powershell
# Terminal 1: Stop server
# Press Ctrl+C

# Terminal 1: Run migration
node add-product-id-tracking.js

# Wait for: "✅ Migration completed successfully!"

# Terminal 1: Start server
npm run dev

# Wait for: "Server running on port 5000"

# Terminal 2: (if needed) Start client
cd client
npm start
```

## 🔄 Alternative: Manual Column Addition

If migration script fails, manually add columns:

```sql
-- Run in MySQL Workbench or CLI
USE erp_system; -- or your database name

ALTER TABLE sales_orders 
  ADD COLUMN product_id INT NULL,
  ADD COLUMN product_name VARCHAR(200) NULL,
  ADD INDEX idx_product_id (product_id);

ALTER TABLE purchase_orders 
  ADD COLUMN product_id INT NULL,
  ADD COLUMN product_name VARCHAR(200) NULL,
  ADD INDEX idx_product_id (product_id);

ALTER TABLE goods_receipt_notes 
  ADD COLUMN product_id INT NULL,
  ADD COLUMN product_name VARCHAR(200) NULL,
  ADD INDEX idx_product_id (product_id);

ALTER TABLE project_material_requests 
  ADD COLUMN product_id INT NULL,
  ADD COLUMN product_name VARCHAR(200) NULL,
  ADD INDEX idx_product_id (product_id);

ALTER TABLE material_dispatches 
  ADD COLUMN product_id INT NULL,
  ADD COLUMN product_name VARCHAR(200) NULL,
  ADD INDEX idx_product_id (product_id);

ALTER TABLE material_receipts 
  ADD COLUMN product_id INT NULL,
  ADD COLUMN product_name VARCHAR(200) NULL,
  ADD INDEX idx_product_id (product_id);

ALTER TABLE material_verifications 
  ADD COLUMN product_id INT NULL,
  ADD COLUMN product_name VARCHAR(200) NULL,
  ADD INDEX idx_product_id (product_id);

ALTER TABLE production_approvals 
  ADD COLUMN product_id INT NULL,
  ADD COLUMN product_name VARCHAR(200) NULL,
  ADD INDEX idx_product_id (product_id);
```

Then restart server:
```powershell
npm run dev
```

## ⚠️ Important Notes

1. **Fields are nullable** - existing data won't break
2. **No data loss** - this only adds columns
3. **Backward compatible** - old records work fine
4. **Safe to run** - migration checks before adding

## 🎊 After Fix

Once migration completes:
- ✅ 500 errors will be gone
- ✅ All pages will load normally
- ✅ Product ID fields available (but empty for old records)
- ✅ New orders can track product IDs
- ✅ Ready to implement frontend product selection

## Need Help?

If migration fails, check:
1. MySQL is running
2. `.env` file has correct DB credentials
3. Database exists
4. User has ALTER TABLE permissions

---
**TL;DR: Run `node add-product-id-tracking.js` then restart server**