# Database Missing Table Fix - Production Requests

## Problem
**Error:** `Table 'passion_erp.production_requests' doesn't exist`

When trying to create a production request from a sales order, the database returns an error because the `production_requests` table has not been created in the MySQL database.

### Why This Happened
The production request migrations exist but were never run on the database. The server uses migrations for schema changes (not auto-sync), so the table needs to be created manually by running the migrations.

## Solution

### Step 1: Run the Production Request Migrations

```bash
# Navigate to server directory
cd server

# Run the production request migrations script
node scripts/runProductionRequestMigrations.js
```

This will:
1. Create the `production_requests` table
2. Add sales order support columns
3. Set up proper indexes and foreign keys

### Step 2: Restart the Server

After running the migrations, restart your server:

```bash
npm run dev
```

## What Gets Created

### Table: `production_requests`

**Core Fields:**
- `id` - Primary key
- `request_number` - Unique (format: PRQ-YYYYMMDD-XXXXX)
- `project_name` - Project name
- `product_name` - Product name
- `product_description` - Text description
- `product_specifications` - JSON specifications
- `quantity` - Decimal(10,2)
- `unit` - Unit of measurement
- `priority` - ENUM('low', 'medium', 'high', 'urgent')
- `required_date` - Required delivery date

**Source Tracking (either SO or PO):**
- `sales_order_id` - Reference to Sales Order (nullable)
- `sales_order_number` - SO number for reference (nullable)
- `po_id` - Reference to Purchase Order (nullable)
- `po_number` - PO number for reference (nullable)

**Status Management:**
- `status` - ENUM with multiple states (pending, reviewed, in_planning, etc.)
- `production_order_id` - Linked production order (nullable)

**Notes:**
- `sales_notes` - Notes from Sales department
- `procurement_notes` - Notes from Procurement
- `manufacturing_notes` - Notes from Manufacturing

**Audit Fields:**
- `requested_by` - User ID who created request
- `reviewed_by` - User ID who reviewed (nullable)
- `reviewed_at` - Review timestamp (nullable)
- `completed_at` - Completion timestamp (nullable)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Indexes Created:**
- `request_number` - Unique index
- `po_id` - Foreign key index
- `sales_order_id` - Foreign key index
- `status` - Status filter index
- `priority` - Priority filter index
- `project_name` - Project search index
- `requested_by` - User filter index
- `production_order_id` - Production order link index

## Verification

After running the migration, verify the table exists:

```sql
-- Check if table exists
SHOW TABLES LIKE 'production_requests';

-- Check table structure
DESCRIBE production_requests;

-- Check indexes
SHOW INDEXES FROM production_requests;
```

## Related Files

**Migrations:**
- `server/migrations/20251008000000-create-production-requests-table.js`
- `server/migrations/20250115000000-add-sales-order-to-production-requests.js`

**Model:**
- `server/models/ProductionRequest.js`

**Routes:**
- `server/routes/productionRequest.js` - GET /api/production-requests
- `server/routes/sales.js` - POST /api/sales/orders/:id/request-production

**Frontend:**
- `client/src/pages/procurement/ProductionRequestsPage.jsx`
- `client/src/pages/sales/SalesOrdersPage.jsx`

## Migration Script Details

The `runProductionRequestMigrations.js` script:
1. Connects to the database
2. Runs both migrations in order
3. Provides clear progress messages
4. Handles common errors (table exists, column exists)
5. Closes database connection cleanly

## Troubleshooting

### Table Already Exists Error
If you get `ER_TABLE_EXISTS_ERROR`, the migration was already run. The table exists but may be incomplete.

**Check what columns exist:**
```sql
DESCRIBE production_requests;
```

**Compare with model definition** in `server/models/ProductionRequest.js`

### Column Already Exists Error
If you get `ER_DUP_FIELDNAME`, one migration ran but not both. Run individual migrations:

```bash
# Run only the second migration
node scripts/runMigration.js 20250115000000-add-sales-order-to-production-requests.js
```

### Foreign Key Errors
Ensure these tables exist before running migrations:
- `sales_orders`
- `purchase_orders`
- `production_orders`
- `users`

## Alternative: Manual SQL

If the Node.js migration fails, you can create the table manually using SQL:

```sql
-- See the migration file for the complete SQL CREATE TABLE statement
-- server/migrations/20251008000000-create-production-requests-table.js
```

## Prevention

**For Future Migrations:**
1. Always run migrations when pulling new code
2. Check `server/migrations/` directory for new files
3. Add migration scripts to deployment process
4. Document all schema changes in migration files

## Testing After Fix

1. **Load Production Requests Page:**
   - Navigate to `/procurement/production-requests`
   - Should load without 500 error

2. **Create Production Request from Sales Order:**
   - Go to Sales Orders page
   - Click "Request Production" on any approved order
   - Should create successfully without 404 or 500 errors

3. **Verify Data:**
   ```sql
   SELECT * FROM production_requests LIMIT 5;
   ```

---

**Status:** ✅ Fixed
**Date:** 2025-01-15
**Related Issues:** 500 Internal Server Error, 404 Not Found on production requests