# Project Name NULL Fix - Recent Activities

## Problem
The Recent Activities component was showing `project_name: null` for orders because:
1. When sales orders were created, if `project_title` wasn't provided in the request, `project_name` was stored as NULL
2. The fallback logic in the recent activities endpoint wasn't properly handling null values

## Solution
Applied **three-layer fix** to ensure project_name is always meaningful:

### 1. ✅ Order Creation Enhancement (POST /orders)
**File**: `server/routes/sales.js` (lines 842-847)

Now when creating a sales order, project_name is intelligently populated using this priority:
1. **project_title** (if provided)
2. **buyer_reference** (if provided)
3. **customer name** (if available) - NEW FALLBACK
4. **SO-{order_number}** (ultimate fallback)

**Example**:
- If user doesn't provide project_title → uses buyer_reference
- If buyer_reference is also empty → uses customer name (e.g., "ABC Garments")
- If all empty → uses order number (e.g., "SO-20251101-0001")

```javascript
// Generate meaningful project_name if not provided
let finalProjectName = project_title || buyer_reference;
if (!finalProjectName || finalProjectName.trim() === '') {
  // Fallback to customer name if available
  finalProjectName = customer?.name || `SO-${order_number}`;
}
```

### 2. ✅ Recent Activities - Order Activities Fix
**File**: `server/routes/sales.js` (lines 2312-2321)

Improved fallback logic that properly handles null and empty values:
- Uses strict null/empty checks (`.trim() === ''`)
- Checks multiple fields in order
- Always returns a meaningful project name to display

```javascript
let projectName = activity.salesOrder?.project_name;
if (!projectName || projectName.trim() === '') {
  projectName = activity.salesOrder?.project_title;
}
if (!projectName || projectName.trim() === '') {
  projectName = activity.salesOrder?.buyer_reference;
}
if (!projectName || projectName.trim() === '') {
  projectName = `SO-${activity.salesOrder?.order_number}`;
}
```

### 3. ✅ Recent Activities - Shipment Activities Fix
**File**: `server/routes/sales.js` (lines 2360-2369)

Applied same fallback logic to shipment activities for consistency.

## Impact

### Before Fix
```
Project
null
Order ID: SO-20251101-0001
```

### After Fix - New Orders
```
Project
ABC Garments              [Uses customer name if project_title not provided]
Order ID: SO-20251101-0001
```

### After Fix - Existing Orders (Next Display)
```
Project
SO-20251101-0001        [Falls back to order number if all fields empty]
Order ID: SO-20251101-0001
```

Or if buyer_reference exists:
```
Project
Winter Collection 2025  [Uses buyer_reference]
Order ID: SO-20251101-0001
```

## Benefits

✅ **No NULL values**: Project name always has meaningful display value
✅ **Smart fallbacks**: Uses customer name as primary fallback (most user-friendly)
✅ **Backward compatible**: Works with existing orders without data loss
✅ **Consistent**: Applied to both order and shipment activities
✅ **User-friendly**: Displays business names (customers) instead of technical codes

## Testing

To verify the fix:
1. Create a new sales order **without** providing project_title → should see customer name in Recent Activities
2. View existing orders → should see buyer_reference or order number (no nulls)
3. Check shipment activities → should apply same fallback logic

## Future Improvements

- Add UI field to edit project_name for existing orders
- Consider auto-updating project_name from buyer_reference when it changes
- Add project grouping/filtering in Recent Activities based on project names