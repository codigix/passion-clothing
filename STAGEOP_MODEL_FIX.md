# StageOperation Model Database Column Mismatch Fix

## 🐛 Issue
**Error**: `Unknown column 'StageOperation.outsource_cost' in 'field list'`

When accessing the Production Operations View or any endpoint that queries `stage_operations` table, the application crashed with a Sequelize database error.

### Root Cause
The `StageOperation` Sequelize model had a field definition that didn't match the actual database table:
- **Model field**: `outsource_cost` ❌
- **Database column**: `outsourcing_cost` ✅

Additionally, the model had duplicate field definitions:
- `quantity_processed`, `quantity_approved`, `quantity_rejected` were defined twice

## ✅ Fix Applied

### File Changed
`server/models/StageOperation.js`

### Changes Made
1. **Renamed field**: `outsource_cost` → `outsourcing_cost`
2. **Removed duplicate fields**: Deleted second occurrence of quantity fields (lines 108-119)

### Before
```javascript
outsource_cost: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
  comment: 'Cost for outsourced operation'
},
quantity_processed: {      // ❌ DUPLICATE
  type: DataTypes.INTEGER,
  defaultValue: 0
},
quantity_approved: {       // ❌ DUPLICATE
  type: DataTypes.INTEGER,
  defaultValue: 0
},
quantity_rejected: {       // ❌ DUPLICATE
  type: DataTypes.INTEGER,
  defaultValue: 0
},
```

### After
```javascript
outsourcing_cost: {        // ✅ Fixed name
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
  comment: 'Cost for outsourced operation'
},
// Duplicates removed ✅
```

## 🧪 Verification

### Step 1: Restart Server
After the fix, restart your development server:
```bash
npm run dev
```

### Step 2: Test Affected Endpoints
The following endpoints should now work without errors:

1. **Get Stage Operations**
   ```
   GET /api/manufacturing/stages/:stageId/operations
   ```

2. **Production Operations View**
   - Navigate to Manufacturing Dashboard
   - Click "Production Tracking" tab
   - Click eye icon (👁️) on any production order
   - Should load without database errors

### Expected Behavior
- ✅ No more `ER_BAD_FIELD_ERROR` errors
- ✅ Stage operations load successfully
- ✅ Production Operations View opens without errors
- ✅ All outsourcing features work correctly

## 📊 Database Column Reference

For reference, here are all columns in the `stage_operations` table:

| Column Name | Type | Null | Note |
|------------|------|------|------|
| id | int | NOT NULL | Primary key |
| production_stage_id | int | NOT NULL | Foreign key |
| operation_name | varchar(200) | NOT NULL | |
| operation_order | int | NOT NULL | |
| description | text | NULL | |
| status | enum | NULL | |
| start_time | datetime | NULL | |
| end_time | datetime | NULL | |
| assigned_to | int | NULL | User FK |
| quantity_processed | int | NULL | |
| quantity_approved | int | NULL | |
| quantity_rejected | int | NULL | |
| is_outsourced | tinyint(1) | NULL | |
| vendor_id | int | NULL | Vendor FK |
| challan_id | int | NULL | Outward challan FK |
| return_challan_id | int | NULL | Inward challan FK |
| **outsourcing_cost** | decimal(10,2) | NULL | ✅ Correct name |
| notes | text | NULL | |
| photos | json | NULL | |
| machine_id | varchar(50) | NULL | |
| work_order_number | varchar(100) | NULL | |
| expected_completion_date | datetime | NULL | |
| actual_completion_date | datetime | NULL | |
| design_files | json | NULL | |
| vendor_remarks | text | NULL | |
| outsourced_at | datetime | NULL | |
| received_at | datetime | NULL | |
| created_at | datetime | NOT NULL | |
| updated_at | datetime | NOT NULL | |

## 🔍 How This Issue Occurred

This type of mismatch typically happens when:
1. Database migrations are run that create/modify columns
2. Model definitions are manually updated but don't match migration changes
3. Column naming conventions change (e.g., `outsource` vs `outsourcing`)

## 🛡️ Prevention

To prevent similar issues in the future:

1. **Always Use Migrations**: Create migrations for schema changes
2. **Sync Model Definitions**: Keep models in sync with migration files
3. **Run Schema Checks**: Periodically verify models match database
4. **Use Sequelize Sync (Dev Only)**: Can help identify mismatches

### Quick Schema Check Script
Use the included script to verify table structure:
```bash
node check-stage-operations-schema.js
```

## 📝 Related Files
- `server/models/StageOperation.js` - Fixed model definition
- `server/routes/manufacturing.js` - Uses StageOperation model
- `client/src/pages/manufacturing/ProductionOperationsViewPage.jsx` - Frontend that triggers queries

## ✅ Status
**Fixed** - January 31, 2025

The StageOperation model now correctly matches the database schema. All production operations features should work without database errors.

---

**Fixed By**: Zencoder Assistant  
**Issue Type**: Database Schema Mismatch  
**Severity**: Critical (blocking feature)  
**Resolution Time**: < 5 minutes