# Production Order Flow - Testing Checklist

## 🧪 Pre-Testing Setup

### 1. Verify Files Are in Place

```bash
# Check route file
ls server/routes/manufacturing.js

# Check model file  
ls server/models/ProductionOrder.js

# Check migration files
ls migrations/add-project-reference-to-production-orders.js
ls run-production-order-migration.js
```

### 2. Backup Database

```bash
mysqldump -u root -p passion_erp > backup_before_testing.sql
```

### 3. Run Database Migration

```bash
node run-production-order-migration.js
```

**Expected Output**:
```
============================================================
🚀 Production Order Project Reference Migration
============================================================

📡 Testing database connection...
✅ Database connection established

🔧 Running migration...

🔧 Adding project_reference column to production_orders...
✅ Migration completed successfully

============================================================
✅ Migration completed successfully!
============================================================

📊 Summary:
  • Added project_reference column to production_orders
  • Added index for better query performance
  • Migrated existing data from sales_orders
```

### 4. Verify Migration

```sql
-- Connect to MySQL
mysql -u root -p passion_erp

-- Check column exists
DESCRIBE production_orders;
-- Should see: project_reference | varchar(100) | YES | MUL | NULL

-- Check index exists
SHOW INDEX FROM production_orders;
-- Should see: idx_production_orders_project_reference

-- Check data migrated
SELECT id, production_number, sales_order_id, project_reference 
FROM production_orders 
LIMIT 10;
```

## 🔧 Backend Testing

### 1. Restart Server

```bash
# Stop server if running
Ctrl+C

# Start server
node server/index.js
# or
npm run server
```

**Expected Output**:
```
Database connection established successfully.
Skipping auto-sync. Database tables assumed to exist.
🚀 Pashion ERP Server running on port 5000
📊 Environment: development
🔗 API Base URL: http://localhost:5000/api
```

### 2. Test API Endpoint

```bash
# Test endpoint exists
curl -X OPTIONS http://localhost:5000/api/manufacturing/orders
# Should return 200, not 404

# Test endpoint with authentication (replace TOKEN)
curl -X POST http://localhost:5000/api/manufacturing/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "sales_order_id": 1,
    "quantity": 100,
    "planned_start_date": "2025-01-15",
    "planned_end_date": "2025-02-15"
  }'
```

**Expected Response** (200 or 201):
```json
{
  "message": "Production order created successfully",
  "productionOrder": {...},
  "id": 123,
  "production_number": "PRD-20250114-0001",
  "stages": [...]
}
```

### 3. Check Server Logs

Look for these log messages:
```
✅ Production order created: PRD-YYYYMMDD-XXXX (ID: ...)
✅ Created N production stages
✅ Created N material requirements  
✅ Created N quality checkpoints
✅ Updated sales order SO-YYYYMMDD-XXXX to in_production
```

## 🖥️ Frontend Testing

### 1. Open Production Wizard

1. Login to the application
2. Navigate to: Manufacturing → Production Wizard
3. Or go to: http://localhost:3000/manufacturing/wizard

### 2. Fill Out Form - Step 1: Order Selection

- Select "Create New Production Order"
- Or select from "Approved Productions" if available

### 3. Fill Out Form - Step 2: Order Details

**Required Fields**:
- Product: Select from dropdown
- Quantity: Enter number (e.g., 1000)
- Production Type: In-house / Outsourced / Mixed
- Priority: Low / Medium / High / Urgent
- Sales Order: Select from dropdown (optional but recommended)

### 4. Fill Out Form - Step 3: Scheduling

**Required Fields**:
- Planned Start Date: Select date
- Planned End Date: Select date (must be after start date)
- Expected Hours: Enter number (e.g., 320)
- Shift: Select shift

### 5. Fill Out Form - Step 4: Materials

Add at least one material:
- Material ID: Enter ID or barcode
- Description: Enter material name
- Required Quantity: Enter number
- Unit: Select unit (pieces, meters, kg, etc.)

### 6. Fill Out Form - Step 5: Quality

Add quality checkpoints:
- Checkpoint Name: e.g., "Visual Inspection"
- Frequency: Per Batch / Per Piece / Daily
- Acceptance Criteria: e.g., "No defects visible"

### 7. Fill Out Form - Step 6: Team

**Optional Fields**:
- Supervisor: Select user
- Assigned To: Select user
- QA Lead: Select user
- Team Notes: Enter notes

### 8. Fill Out Form - Step 7: Customization

**Option 1**: Use Default Stages (Recommended for first test)
- Leave "Use Custom Stages" unchecked

**Option 2**: Use Custom Stages
- Check "Use Custom Stages"
- Default stages will appear (Cutting, Stitching, Finishing, Quality Check)
- Modify as needed

### 9. Submit Form

Click "Create Production Order"

**Expected Behavior**:
1. ✅ Loading indicator appears
2. ✅ Success message: "Production order created successfully with operations"
3. ✅ Redirect to Manufacturing → Production Orders page
4. ✅ New order appears in list with status "Pending"

**If Error Occurs**:
1. Check browser console (F12)
2. Check server logs
3. Verify all required fields are filled
4. Verify product_id exists in database
5. Verify user has manufacturing or admin department

## 🔍 Verification

### 1. Check Database

```sql
-- Find the newly created production order
SELECT * FROM production_orders 
ORDER BY id DESC LIMIT 1;

-- Verify project_reference is set
SELECT 
  production_number,
  sales_order_id,
  project_reference,
  status
FROM production_orders 
WHERE project_reference IS NOT NULL
ORDER BY id DESC LIMIT 5;

-- Check stages were created
SELECT 
  ps.production_order_id,
  po.production_number,
  ps.stage_name,
  ps.stage_order,
  ps.status
FROM production_stages ps
JOIN production_orders po ON ps.production_order_id = po.id
WHERE po.id = (SELECT MAX(id) FROM production_orders);

-- Check material requirements
SELECT * FROM material_requirements
WHERE production_order_id = (SELECT MAX(id) FROM production_orders);

-- Check quality checkpoints
SELECT * FROM quality_checkpoints
WHERE production_order_id = (SELECT MAX(id) FROM production_orders);
```

### 2. Check Sales Order Updated

```sql
-- Verify sales order status changed to in_production
SELECT 
  id,
  order_number,
  status,
  production_started_at
FROM sales_orders
WHERE id = (SELECT sales_order_id FROM production_orders ORDER BY id DESC LIMIT 1);
```

### 3. Check Notifications Created

```sql
-- Check notification was sent
SELECT * FROM notifications
WHERE related_entity_type = 'production_order'
ORDER BY id DESC LIMIT 5;
```

## 🔄 Test Project-Based Tracking

### 1. Create Multiple Production Orders for Same Project

**Test Case**: Create 2 production orders for the same sales order

1. Create first production order
   - Sales Order: SO-20250114-0001
   - Quantity: 500
   - Product: T-Shirt

2. Create second production order
   - Sales Order: SO-20250114-0001 (same)
   - Quantity: 500  
   - Product: T-Shirt

**Expected Result**:
```sql
SELECT production_number, project_reference, quantity
FROM production_orders
WHERE project_reference = 'SO-20250114-0001';

-- Should show:
-- PRD-20250114-0001 | SO-20250114-0001 | 500
-- PRD-20250114-0002 | SO-20250114-0001 | 500
```

### 2. Create Multiple MRNs for Same Project

**Test Case**: Create 2 MRNs for the same sales order

1. Navigate to: Manufacturing → Material Requests
2. Create MRN #1:
   - Sales Order: SO-20250114-0001
   - Material: Fabric
   - Quantity: 1000 meters

3. Create MRN #2:
   - Sales Order: SO-20250114-0001 (same)
   - Material: Buttons
   - Quantity: 5000 pieces

**Expected Result**:
```sql
SELECT 
  mrn.request_number,
  mrn.sales_order_id,
  so.order_number,
  mrn.request_type
FROM project_material_requests mrn
JOIN sales_orders so ON mrn.sales_order_id = so.id
WHERE so.order_number = 'SO-20250114-0001';

-- Should show both MRNs linked to same project
```

### 3. Query All Project Activities

```sql
-- Get complete project overview
SELECT 
  'Sales Order' as type,
  order_number as number,
  status,
  created_at
FROM sales_orders
WHERE order_number = 'SO-20250114-0001'

UNION ALL

SELECT 
  'Production Order' as type,
  production_number as number,
  status,
  created_at
FROM production_orders
WHERE project_reference = 'SO-20250114-0001'

UNION ALL

SELECT 
  'MRN' as type,
  request_number as number,
  status,
  created_at
FROM project_material_requests
WHERE sales_order_id = (
  SELECT id FROM sales_orders WHERE order_number = 'SO-20250114-0001'
)
ORDER BY created_at;
```

## ✅ Success Criteria

### Critical Tests (Must Pass)

- [x] Migration runs without errors
- [x] project_reference column exists
- [ ] Server starts without errors
- [ ] POST /manufacturing/orders endpoint exists (not 404)
- [ ] Production order created via frontend wizard
- [ ] Production number generated (PRD-YYYYMMDD-XXXX)
- [ ] Stages created correctly
- [ ] Material requirements saved
- [ ] Quality checkpoints created
- [ ] Sales order status updated to in_production
- [ ] Notification sent
- [ ] project_reference field populated

### Optional Tests (Should Pass)

- [ ] Multiple production orders for same project
- [ ] Multiple MRNs for same project
- [ ] Query all project activities works
- [ ] Existing production orders still work
- [ ] Production order start/stop/pause works

## 🐛 Troubleshooting

### Issue: Migration Fails

**Error**: "Column already exists"
```bash
# This is OK - column was already added
# Verify with:
mysql -u root -p -e "DESCRIBE passion_erp.production_orders" | grep project_reference
```

**Error**: "Table not found"
```bash
# Create tables first
node server/index.js  # This will create tables
# Then run migration again
```

### Issue: Server Won't Start

**Error**: "Cannot find module"
```bash
# Install dependencies
npm install
```

**Error**: "Database connection failed"
```bash
# Check .env file has correct credentials
# Check MySQL server is running
```

### Issue: 404 on POST /manufacturing/orders

**Check**:
1. Server restarted after code changes?
2. Route file loaded? (check server logs for "Manufacturing routes module loaded")
3. Correct URL? (should be /api/manufacturing/orders)
4. Authentication header included?

### Issue: Permission Denied

**Error**: "You don't have permission to access this resource"

**Fix**:
```sql
-- Update user department to manufacturing or admin
UPDATE users SET department = 'manufacturing' WHERE id = YOUR_USER_ID;
```

### Issue: Validation Error

**Error**: "Missing required fields"

**Check**:
- product_id is provided and exists
- quantity is positive number
- planned_start_date is valid date
- planned_end_date is valid date and after start date

### Issue: project_reference is NULL

**Check**:
1. sales_order_id was provided in request
2. Sales order exists in database
3. Migration ran successfully

**Manual Fix**:
```sql
-- Update existing records
UPDATE production_orders po
JOIN sales_orders so ON po.sales_order_id = so.id
SET po.project_reference = so.order_number
WHERE po.project_reference IS NULL;
```

## 📋 Test Results Template

```markdown
## Test Execution Results

**Date**: _________
**Tester**: _________
**Environment**: Development / Staging / Production

### Pre-Testing
- [ ] Database backed up
- [ ] Migration ran successfully
- [ ] Server restarted

### Backend Tests
- [ ] POST endpoint exists (not 404)
- [ ] Production order created via API
- [ ] All fields saved correctly
- [ ] Server logs show success messages

### Frontend Tests
- [ ] Wizard opens successfully
- [ ] Form validation works
- [ ] Production order created
- [ ] Success message displayed
- [ ] Redirect to orders page works

### Database Verification
- [ ] project_reference column exists
- [ ] Production order saved
- [ ] Stages created
- [ ] Materials saved
- [ ] Quality checkpoints saved
- [ ] Sales order updated
- [ ] Notification created

### Project Tracking Tests
- [ ] Multiple orders for same project
- [ ] Multiple MRNs for same project
- [ ] Query by project_reference works

### Issues Found
1. _________
2. _________

### Notes
_________
```

---

**Testing Priority**: 🔴 Critical  
**Estimated Time**: 30-45 minutes  
**Required**: Yes - Blocks production workflow