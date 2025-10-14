# Production Request Duplicate Prevention Fix

## 🐛 Issue Description

**Problem:** Multiple production requests were being created for the same sales order, causing:
- Duplicate entries in Manufacturing Dashboard "Incoming Orders" tab
- Confusion about which request to work on
- Data integrity issues
- Wasted resources tracking duplicate requests

**Example:**
```
PRQ-20251012-00001 → Sales Order: SO-123 → Customer: nitin kamble → Formal Shirt
PRQ-20251012-00002 → Sales Order: SO-123 → Customer: nitin kamble → Formal Shirt (DUPLICATE)
PRQ-20251012-00003 → Sales Order: SO-123 → Customer: nitin kamble → Formal Shirt (DUPLICATE)
```

## 🔍 Root Cause

1. **No Application Validation**: The `/api/sales/orders/:id/request-production` endpoint didn't check if a production request already existed before creating a new one

2. **No Database Constraint**: The `production_requests` table had no UNIQUE constraint on `sales_order_id` field

3. **User Behavior**: Users could click "Request Production" multiple times, creating duplicate requests

## ✅ Solution Implemented

### 1. Application-Level Validation (Immediate Fix)

**File:** `server/routes/sales.js`

Added duplicate check before creating production request:

```javascript
// CHECK FOR DUPLICATE: Prevent multiple production requests for same sales order
const existingRequest = await ProductionRequest.findOne({
  where: {
    sales_order_id: id,
    status: {
      [Op.notIn]: ['cancelled'] // Ignore cancelled requests
    }
  },
  transaction
});

if (existingRequest) {
  return res.status(409).json({ 
    message: 'Production request already exists for this sales order',
    existingRequest: {
      id: existingRequest.id,
      request_number: existingRequest.request_number,
      status: existingRequest.status,
      created_at: existingRequest.created_at
    }
  });
}
```

**Response:**
- ✅ **201 Created** - New production request created successfully
- ⚠️ **409 Conflict** - Production request already exists (returns existing request details)
- ❌ **400 Bad Request** - Invalid order state (draft/cancelled)
- ❌ **404 Not Found** - Sales order doesn't exist

### 2. Database-Level Constraint (Long-term Fix)

**File:** `server/migrations/add-unique-sales-order-constraint.js`

Adds UNIQUE index on `sales_order_id`:
- Prevents duplicates at database level
- Allows NULLs (for PO-based production requests)
- Provides secondary protection if application validation fails

## 🧹 Cleanup Existing Duplicates

### Step 1: Identify Duplicates

```sql
SELECT 
    pr.sales_order_id,
    so.order_number,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(pr.request_number) as request_numbers
FROM production_requests pr
LEFT JOIN sales_orders so ON pr.sales_order_id = so.id
WHERE pr.sales_order_id IS NOT NULL
    AND pr.status NOT IN ('cancelled')
GROUP BY pr.sales_order_id
HAVING COUNT(*) > 1;
```

### Step 2: Run Cleanup Script

```bash
mysql -u root -p passion_erp < cleanup-duplicate-production-requests.sql
```

The script will:
1. ✅ Create backup table (`production_requests_backup_20250112`)
2. ✅ Keep the **first (oldest)** production request for each sales order
3. ✅ Mark all others as `cancelled` with auto-generated note
4. ✅ Show summary of cleaned requests

### Step 3: Apply Database Migration (Optional but Recommended)

```bash
# Run migration to add unique constraint
node run-migration.js add-unique-sales-order-constraint
```

Or manually:
```sql
CREATE UNIQUE INDEX unique_sales_order_id 
ON production_requests(sales_order_id) 
WHERE sales_order_id IS NOT NULL;
```

## 🧪 Testing

### Test 1: Try Creating Duplicate

```bash
# Create first production request
curl -X POST http://localhost:5000/api/sales/orders/123/request-production \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response: 201 Created

# Try creating duplicate
curl -X POST http://localhost:5000/api/sales/orders/123/request-production \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response: 409 Conflict
{
  "message": "Production request already exists for this sales order",
  "existingRequest": {
    "id": 1,
    "request_number": "PRQ-20251012-00001",
    "status": "pending",
    "created_at": "2025-01-12T10:30:00Z"
  }
}
```

### Test 2: Verify in UI

1. Go to **Sales Dashboard** → Select an order
2. Click **"Request Production"** button
3. ✅ First click: Creates production request successfully
4. ⚠️ Second click: Shows error "Production request already exists"
5. Navigate to **Manufacturing Dashboard** → **Incoming Orders** tab
6. ✅ Only ONE production request visible for each sales order

### Test 3: Cancelled Requests Can Be Recreated

```sql
-- Cancel existing request
UPDATE production_requests 
SET status = 'cancelled' 
WHERE sales_order_id = 123;

-- Try creating new request (should succeed)
-- POST /api/sales/orders/123/request-production
-- Response: 201 Created ✅
```

## 📊 Validation Queries

### Check for Remaining Duplicates
```sql
SELECT 
    sales_order_id,
    COUNT(*) as count,
    GROUP_CONCAT(request_number) as requests
FROM production_requests
WHERE sales_order_id IS NOT NULL
    AND status NOT IN ('cancelled')
GROUP BY sales_order_id
HAVING COUNT(*) > 1;
```

**Expected Result:** No rows (all duplicates cleaned)

### View Cancelled Duplicates
```sql
SELECT 
    request_number,
    sales_order_id,
    status,
    manufacturing_notes
FROM production_requests
WHERE manufacturing_notes LIKE '%AUTO-CANCELLED%'
ORDER BY created_at;
```

### View Active Production Requests
```sql
SELECT 
    pr.request_number,
    so.order_number as sales_order,
    pr.product_name,
    pr.status,
    pr.created_at
FROM production_requests pr
LEFT JOIN sales_orders so ON pr.sales_order_id = so.id
WHERE pr.status NOT IN ('cancelled')
ORDER BY pr.created_at DESC;
```

## 🚀 Deployment Steps

### Immediate Deployment (No Downtime)

1. **Deploy Backend Fix:**
   ```bash
   cd server
   # Changes are in sales.js - no restart needed if using nodemon
   # Otherwise: pm2 restart passion-erp
   ```

2. **Clean Existing Duplicates:**
   ```bash
   mysql -u root -p passion_erp < cleanup-duplicate-production-requests.sql
   ```

3. **Verify Fix:**
   - Check Manufacturing Dashboard
   - Try creating production request twice
   - Confirm only one request appears

### Optional: Add Database Constraint

```bash
# Apply migration
node run-migration.js add-unique-sales-order-constraint

# Or run SQL manually
mysql -u root -p passion_erp -e "
  CREATE UNIQUE INDEX unique_sales_order_id 
  ON production_requests(sales_order_id) 
  WHERE sales_order_id IS NOT NULL;
"
```

## 🔄 Rollback Plan

If something goes wrong:

### Restore from Backup
```sql
-- Restore production_requests table
DROP TABLE production_requests;
RENAME TABLE production_requests_backup_20250112 TO production_requests;
```

### Revert Code Changes
```bash
cd server/routes
git checkout sales.js
```

### Remove Database Constraint
```sql
DROP INDEX unique_sales_order_id ON production_requests;
```

## 📝 Key Changes Summary

| Component | Change | Impact |
|-----------|--------|--------|
| **Backend API** | Added duplicate check in `/api/sales/orders/:id/request-production` | Prevents duplicate requests |
| **Database** | Optional UNIQUE constraint on `sales_order_id` | Extra protection at DB level |
| **Cleanup Script** | SQL script to mark existing duplicates as cancelled | Cleans existing data |
| **Migration** | Migration file for database constraint | Automated DB schema update |

## ⚠️ Important Notes

1. **Cancelled Requests:** The validation ignores cancelled requests, allowing recreation if needed

2. **PO-Based Requests:** Production requests created from Purchase Orders (not Sales Orders) are unaffected since they have `sales_order_id = NULL`

3. **Existing Duplicates:** Must run cleanup script before applying database constraint, otherwise constraint creation will fail

4. **User Experience:** Users will now see a clear error message if they try to create duplicate production requests

## 🎯 Success Criteria

- ✅ No duplicate production requests for same sales order
- ✅ Clear error message when attempting to create duplicate
- ✅ Manufacturing Dashboard shows only one request per sales order
- ✅ Existing duplicates cleaned up (marked as cancelled)
- ✅ No impact on PO-based production requests
- ✅ Can recreate production request after cancelling existing one

## 📞 Support

If you encounter issues:

1. Check backend logs: `tail -f server.log`
2. Verify database state using validation queries above
3. Ensure cleanup script ran successfully
4. Contact development team with error details

---

**Fixed:** January 12, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready