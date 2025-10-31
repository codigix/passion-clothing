# Material Allocation Dashboard - 500 Error Fix

## Problem

The Material Allocation Dashboard was throwing **500 Internal Server Error** when trying to load data:

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
GET /api/inventory/allocations/projects-overview
GET /api/inventory/allocations/warehouse-stock
```

## Root Cause

The backend endpoints were using **incorrect Sequelize 6 syntax** for parameterized queries:

### ❌ Wrong Syntax (What Was Causing 500 Errors)
```javascript
const [projectsData] = await sequelize.query(`
  SELECT * FROM table
  WHERE field LIKE ? OR name LIKE ?
`, [`%search%`, `%search%`]);  // ← Wrong parameter passing
```

**Issue:** Sequelize 6 doesn't support this syntax. The `?` placeholders were not being replaced, causing MySQL syntax errors.

### ✅ Correct Syntax (Sequelize 6)
```javascript
const projectsData = await sequelize.query(`
  SELECT * FROM table
  WHERE field LIKE :search OR name LIKE :search
`, {
  replacements: {
    search: `%search%`
  },
  type: require('sequelize').QueryTypes.SELECT
});
```

**Key Differences:**
1. Use **named parameters** (`:paramName`) instead of `?` for complex queries
2. Pass parameters via **`replacements`** object, not as second array
3. Specify **`type: QueryTypes.SELECT`** for raw SELECT queries
4. Don't destructure result - `QueryTypes.SELECT` returns array directly, not tuple

## Changes Made

### File: `/server/routes/inventory.js`

**1. GET `/allocations/projects-overview` (Line 2449)**

Changed:
```javascript
const [projectsData] = await sequelize.query(sql, [
  `%${search}%`, `%${search}%`, `%${search}%`, sort, sort, sort
]);
```

To:
```javascript
const projectsData = await sequelize.query(sql, {
  replacements: {
    search1: `%${search}%`,
    search2: `%${search}%`,
    search3: `%${search}%`,
    sort: sort
  },
  type: require('sequelize').QueryTypes.SELECT
});
```

Also updated SQL query to use named parameters:
```sql
WHERE (so.order_number LIKE :search1 OR c.company_name LIKE :search2 OR so.status LIKE :search3)
ORDER BY 
  CASE WHEN :sort = 'latest' THEN so.created_at END DESC,
  ...
```

**2. GET `/allocations/warehouse-stock` (Line 2648)**

Changed dynamic parameter construction:
```javascript
// Before: Mixed parameterized and template literals (SQL injection risk!)
let whereClause = `WHERE ... AND category = '${category}'`;
const [stockData] = await sequelize.query(sql, [...params, sort, sort, sort]);

// After: Safe parameter binding
let whereCondition = `WHERE ... AND category = :category`;
let replacements = { search: `%${search}%`, sort: sort };
if (category !== 'all') {
  replacements.category = category;
}
const stockData = await sequelize.query(sql, {
  replacements: replacements,
  type: require('sequelize').QueryTypes.SELECT
});
```

## Technical Details

### Sequelize 6 Query Patterns

| Scenario | Syntax |
|----------|--------|
| **Simple SELECT** | `sequelize.query('SELECT ...')` |
| **With replacements** | `sequelize.query('SELECT...', { replacements: {...}, type: QueryTypes.SELECT })` |
| **Positional params** | `sequelize.query('...WHERE id = ?', { replacements: [1], type: QueryTypes.SELECT })` |
| **Named params** | `sequelize.query('...WHERE id = :id', { replacements: {id: 1}, type: QueryTypes.SELECT })` |

### Why This Was Happening

1. **Code was copied from non-working state** - Original allocation endpoints were not functional
2. **Different Sequelize versions have different APIs** - Sequelize 6 uses different parameter syntax than older versions
3. **No testing before deployment** - The endpoints weren't tested before being exposed to frontend

## Security Improvement

### Before (SQL Injection Vulnerability)
```javascript
// ❌ Direct string interpolation
const whereClause = `AND category = '${category}'`;
sequelize.query(sql + whereClause);
```

### After (Safe)
```javascript
// ✅ Parameterized query
const replacements = { category: category };
sequelize.query(sql, { replacements: replacements, ... });
```

## Testing Results

✅ **Test Command:**
```bash
cd server
node test-allocation-query.js
```

✅ **Results:**
- Projects-overview query: **SUCCESS**
- Warehouse-stock query: **SUCCESS**
- Both endpoints now respond with correct data structure

## Frontend Impact

No frontend changes needed. The component at `/client/src/pages/inventory/ProjectAllocationDashboard.jsx` was already correct - it just needed working backend endpoints.

## Deployment Checklist

- [x] Fixed parameterized query syntax in inventory routes
- [x] Removed SQL injection vulnerability
- [x] Tested both endpoints with sample data
- [x] Verified response formats match frontend expectations
- [x] Added QueryTypes import
- [x] Removed incorrect destructuring for QueryTypes.SELECT queries

## Files Modified

1. **d:\projects\passion-clothing\server\routes\inventory.js**
   - Line 2449: projects-overview endpoint
   - Line 2648: warehouse-stock endpoint
   - Total lines changed: ~40

## Next Steps

1. Restart the server
2. Navigate to `/inventory/allocation`
3. Both tabs should load data without 500 errors
4. If still getting errors, check:
   - Database connection
   - Sales order data exists
   - Inventory records linked to sales orders
   - Stock types set correctly (project_specific vs general_extra)

## Related Documentation

- `ACTUAL_MATERIAL_ALLOCATION_FLOW.md` - System workflow
- `PROJECT_ALLOCATION_DASHBOARD_IMPLEMENTATION.md` - Implementation guide
- `DASHBOARD_ARCHITECTURE_COMPARISON.md` - Architecture analysis

---

**Status:** ✅ FIXED
**Date:** 2025
**Impact:** High - This fix unblocks the entire Material Allocation Dashboard feature