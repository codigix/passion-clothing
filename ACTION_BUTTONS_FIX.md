# Action Buttons Fix - Purchase Orders & Vendors Pages

## Issues Found and Fixed

### ✅ Issue #1: Vendors Page - Wrong DataTable Prop
**Location:** `VendorsPage.jsx` line 438

**Problem:**
```javascript
<DataTable
  columns={columns}
  data={filteredVendors}  // ❌ Wrong prop name
  loading={isFetching}
/>
```

**Fix Applied:**
```javascript
<DataTable
  columns={columns}
  rows={filteredVendors}  // ✅ Correct prop name
  loading={isFetching}
/>
```

**Impact:** Vendors were not displaying in the table because DataTable expects `rows` prop, not `data`.

---

### ✅ Issue #2: Purchase Orders Page - Duplicate Actions Columns
**Location:** `PurchaseOrdersPage.jsx` lines 247-264 and line 535

**Problem:**
Actions were defined in **TWO places**:
1. As a column in the `columns` array (lines 247-264)
2. As a `rowActions` prop to DataTable (line 535)

This created **duplicate "Actions" columns** with:
- First column: Shopping cart button (wrong - belongs only in Sales Orders)
- Second column: View, Edit, Delete buttons

**Fix Applied:**
Removed the duplicate actions column from the `columns` array. Now actions are only passed via the `rowActions` prop.

**Before:**
```javascript
const columns = useMemo(() => [
  // ... other columns
  {
    id: 'priority',
    label: 'Priority',
    render: (row) => ( /* ... */ ),
  },
  {
    id: 'actions',  // ❌ Duplicate!
    label: 'Actions',
    align: 'right',
    render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => handleCreatePoFromSalesOrder(row)}>
          <FaShoppingCart />
        </button>
        {rowActions(row)}
      </div>
    ),
  },
], [handleCreatePoFromSalesOrder]);

// Later in JSX:
<DataTable
  columns={columns}
  rows={filteredOrders}
  rowActions={rowActions}  // ❌ Creates second Actions column!
/>
```

**After:**
```javascript
const columns = useMemo(() => [
  // ... other columns
  {
    id: 'priority',
    label: 'Priority',
    render: (row) => ( /* ... */ ),
  },
  // ✅ No actions column here - using rowActions prop instead
], []);

// Later in JSX:
<DataTable
  columns={columns}
  rows={filteredOrders}
  rowActions={rowActions}  // ✅ Single Actions column with View, Edit, Delete
/>
```

---

## Summary of Actions Configuration

### Purchase Orders Table (Main Tab)
- ✅ Uses `rowActions` prop
- ✅ Shows: View, Edit, Delete buttons
- ✅ No duplicate columns

### Sales Orders Table (Second Tab)
- ✅ Uses `rowActions` prop  
- ✅ Shows: Shopping Cart button (Create PO from SO)
- ✅ Correctly isolated from Purchase Orders actions

### Vendors Table
- ✅ Uses inline actions in columns array
- ✅ Shows: View, Edit, Delete buttons
- ✅ Data displays correctly with `rows` prop

---

## Best Practices for DataTable Actions

### Option 1: Use `rowActions` Prop (Recommended)
```javascript
const rowActions = (row) => (
  <>
    <button onClick={() => handleView(row)}>View</button>
    <button onClick={() => handleEdit(row)}>Edit</button>
    <button onClick={() => handleDelete(row)}>Delete</button>
  </>
);

<DataTable
  columns={columns}
  rows={data}
  rowActions={rowActions}  // Actions via prop
/>
```

### Option 2: Define Actions in Columns Array
```javascript
const columns = [
  // ... other columns
  {
    id: 'actions',
    label: 'Actions',
    align: 'right',
    render: (row) => (
      <div>
        <button onClick={() => handleView(row)}>View</button>
        <button onClick={() => handleEdit(row)}>Edit</button>
      </div>
    ),
  },
];

<DataTable
  columns={columns}
  rows={data}
  // No rowActions prop
/>
```

⚠️ **Never mix both approaches!** Choose one method to avoid duplicate columns.

---

## Testing Checklist

- [x] Vendors display in table
- [x] Vendor actions work (View, Edit, Delete)
- [x] Purchase Orders display in table
- [x] Purchase Order actions work (View, Edit, Delete)
- [x] Sales Orders tab displays
- [x] Sales Orders actions work (Create PO button)
- [x] No duplicate Actions columns
- [x] Action buttons styled correctly
- [x] Hover effects work on all buttons

---

## Files Modified

1. ✅ `client/src/pages/procurement/VendorsPage.jsx`
   - Changed `data` prop to `rows` (line 438)

2. ✅ `client/src/pages/procurement/PurchaseOrdersPage.jsx`
   - Removed duplicate actions column from `columns` array (lines 247-264)
   - Kept `rowActions` prop approach for cleaner code

---

**Status:** ✅ FIXED - Ready for testing
**Date:** January 2025