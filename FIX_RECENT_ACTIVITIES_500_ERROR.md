# Fix: Recent Activities 500 Error - Post Project Name Deployment

## 🐛 The Problem

After the Project Name system deployment, the Recent Activities component started throwing a **500 Internal Server Error**:

```
GET http://localhost:3000/api/sales/dashboard/recent-activities?limit=10 500 (Internal Server Error)
```

**Root Cause**: The backend code was trying to query `project_name` from both `shipments` and `production_orders` tables, but these columns didn't exist in the database yet.

**Error Message**:
```
Unknown column 's.project_name' in 'field list'
```

---

## ✅ Solution Applied

### Step 1: Database Migration ✅ COMPLETED

Executed the migration script to add `project_name` columns:

```sql
-- Add project_name to production_orders table
ALTER TABLE production_orders 
ADD COLUMN project_name VARCHAR(200) 
COMMENT 'Human-friendly project name for dashboards and reports'
AFTER team_notes;

-- Add project_name to shipments table  
ALTER TABLE shipments 
ADD COLUMN project_name VARCHAR(200) 
COMMENT 'Human-friendly project name for dashboards and reports'
AFTER created_by;

-- Create indexes for performance
CREATE INDEX idx_production_orders_project_name ON production_orders(project_name);
CREATE INDEX idx_shipments_project_name ON shipments(project_name);

-- Populate from sales_orders (auto-executed in migration)
UPDATE production_orders po
SET po.project_name = (
  SELECT so.project_name 
  FROM sales_orders so 
  WHERE so.id = po.sales_order_id 
  LIMIT 1
)
WHERE po.project_name IS NULL 
AND po.sales_order_id IS NOT NULL;

UPDATE shipments s
SET s.project_name = (
  SELECT so.project_name 
  FROM sales_orders so 
  WHERE so.id = s.sales_order_id 
  LIMIT 1
)
WHERE s.project_name IS NULL 
AND s.sales_order_id IS NOT NULL;
```

**Status**: ✅ COMPLETED
- Added `project_name` column to `shipments` table
- Added `project_name` column to `production_orders` table
- Created performance indexes on both columns
- Auto-populated from related sales orders

---

### Step 2: Backend Restart (Required!)

The backend server needs to be restarted to pick up the database schema changes.

**Option A: Using PM2**
```bash
pm2 restart all
# or
pm2 restart passion-erp-backend
```

**Option B: Manual Restart**
1. Stop the backend server (Ctrl+C if running locally)
2. Start it again with `npm start` or your usual startup command

**Option C: Docker (if applicable)**
```bash
docker restart passion-erp-backend
```

---

### Step 3: Verify the Fix

**Test in Browser Console** (after backend restart):
```javascript
// Open DevTools (F12) → Console tab
// Wait 5-10 seconds for page to load
// Check if there are NO red errors about "recent-activities"
```

**Monitor Backend Logs**:
```bash
pm2 logs passion-erp-backend

# Look for: No errors about project_name
# Should see successful queries being logged
```

**Test API Directly**:
```bash
# Using curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/sales/dashboard/recent-activities?limit=5

# Or in browser: go to http://yourapp/dashboard (Sales module)
# Recent Activities should load without errors
```

---

## 📊 Verification Checklist

After applying the fix, verify:

- [ ] Backend server restarted successfully
- [ ] No 500 errors in browser console
- [ ] Recent Activities component loads on dashboard
- [ ] Can see project names in activities cards
- [ ] No `Unknown column` errors in backend logs
- [ ] Sales Orders page shows project details correctly
- [ ] Production Orders page shows project details correctly
- [ ] Purchase Orders page shows project details correctly

---

## 🔧 What Was Fixed

**Backend (sales.js - Lines 2209-2434)**:
- The `/api/sales/dashboard/recent-activities` endpoint includes `project_name` in queries:
  - Line 2228: Includes `project_name` from SalesOrder in SalesOrderHistory query
  - Line 2252: Includes `project_name` from SalesOrder in Shipment query
  - Lines 2319-2328: Uses `project_name` as primary title for activities
  - Lines 2367-2376: Uses `project_name` for shipment activities

**Database**:
- ✅ Added `project_name` column to `shipments` table
- ✅ Added `project_name` column to `production_orders` table  
- ✅ Created indexes for performance optimization
- ✅ Auto-populated from related sales orders

**Models** (Already included in deployment):
- ✅ `server/models/Shipment.js` - has `project_name` field definition
- ✅ `server/models/ProductionOrder.js` - has `project_name` field definition

---

## 🚨 Troubleshooting

### Still Getting 500 Error After Restart?

**Check 1: Verify columns exist**
```bash
mysql -u root -p passion_erp
mysql> DESCRIBE shipments;  # Should show project_name
mysql> DESCRIBE production_orders;  # Should show project_name
```

**Check 2: Check backend logs**
```bash
pm2 logs passion-erp-backend --lines 50

# Look for:
# - Connection errors → Check database is running
# - SQL errors → Run migration again
# - Module not found → Run npm install
```

**Check 3: Clear browser cache**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear cache in DevTools → Application → Clear Storage

**Check 4: Verify backend port**
```bash
# Check if backend is running
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # Mac/Linux
```

### Migration Didn't Run?

If columns still don't exist in database:

```bash
# Re-run migration manually
cd d:\projects\passion-clothing
mysql -u root -p passion_erp < add-project-name-columns.sql

# Verify it worked
mysql -u root -p passion_erp
mysql> SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name='shipments' AND column_name='project_name';
# Should return 1
```

---

## 📝 Summary of Changes

| Component | Status | Details |
|-----------|--------|---------|
| **Database Migration** | ✅ Complete | Added `project_name` columns to 2 tables |
| **Shipments Table** | ✅ Fixed | Column added, indexed, populated |
| **Production Orders Table** | ✅ Fixed | Column added, indexed, populated |
| **Backend Models** | ✅ Ready | Models already have field definitions |
| **Backend Routes** | ✅ Ready | Routes already query the new columns |
| **Frontend Components** | ✅ Ready | ProjectIdentifier component available |
| **Backend Restart** | ⏳ REQUIRED | Must restart for changes to take effect |

---

## 🎯 Next Steps

1. ✅ Database migration executed
2. ⏳ **Restart backend server** (CRITICAL - Do this now!)
3. ⏳ Test Recent Activities loads without error
4. ⏳ Verify project names display correctly
5. ⏳ Monitor for any remaining issues

---

## 📞 Support

If issues persist after these steps:

1. Check backend logs: `pm2 logs passion-erp-backend`
2. Verify database connection: `mysql -u root -p passion_erp`
3. Run diagnostic again: `node server/diagnose-recent-activities-error.js`
4. Contact development team with logs

---

**Document Version**: 1.0  
**Created**: January 15, 2025  
**Issue**: Recent Activities 500 Error After Project Name Deployment  
**Status**: 🟢 FIXED (pending backend restart)