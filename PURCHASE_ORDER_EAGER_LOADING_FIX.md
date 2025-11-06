# Purchase Order Eager Loading Fix

## Problem

When updating a purchase order via PATCH `/api/procurement/pos/:id`, the server returned a 500 error:

```
EagerLoadingError [SequelizeEagerLoadingError]: User is associated to PurchaseOrder multiple times.
To identify the correct association, you must use the 'as' keyword to specify the alias of the association
you want to include.
```

## Root Cause

The PurchaseOrder model has **three foreign keys** referencing the User table:

1. `created_by` → User (created the order)
2. `approved_by` → User (approver)
3. `last_edited_by` → User (last person to edit)

However, in `server/config/database.js`, only **two associations** were defined:

- `PurchaseOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })`
- `PurchaseOrder.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' })`

Missing association:

- `PurchaseOrder.belongsTo(User, { foreignKey: 'last_edited_by', as: 'lastEditor' })` ❌

Additionally, in `server/routes/procurement.js` line 1166, the code was trying to include a non-existent `'editor'` alias.

## Solution

### 1. Added Missing Association (database.js)

Added the missing User association for `last_edited_by`:

```javascript
// Line 133 in server/config/database.js
PurchaseOrder.belongsTo(User, {
  foreignKey: "last_edited_by",
  as: "lastEditor",
});
```

This allows Sequelize to properly distinguish between the three User relationships.

### 2. Removed Problematic Include (procurement.js)

**Before:**

```javascript
const purchaseOrder = await PurchaseOrder.findByPk(id, {
  include: [{ model: User, as: "editor", attributes: ["id", "name"] }],
});
```

**After:**

```javascript
const purchaseOrder = await PurchaseOrder.findByPk(id);
```

**Reasoning:**

- The initial fetch at line 1165 only loads the PO for manipulation purposes
- The User data wasn't being used before the update
- Proper includes with all correct associations happen at line 1313-1318 after the update completes
- This is more efficient and avoids the association ambiguity error

### 3. Verified Final Includes (procurement.js)

The final fetch after update (lines 1311-1318) correctly includes all three User associations:

```javascript
const updatedOrder = await PurchaseOrder.findByPk(id, {
  include: [
    { model: Vendor, as: 'vendor', ... },
    { model: User, as: 'creator', ... },              // created_by ✓
    { model: User, as: 'approver', ..., required: false },  // approved_by ✓
    { model: User, as: 'lastEditor', ..., required: false } // last_edited_by ✓
  ]
});
```

## Files Modified

1. **server/config/database.js** (Line 133) - Added missing association
2. **server/routes/procurement.js** (Line 1165) - Removed problematic include

## Testing

To verify the fix:

1. Start the server: `npm run dev` or `npm start`
2. Navigate to Procurement Dashboard
3. Click edit/update on a purchase order
4. The PATCH request should now complete successfully without 500 errors

The PO will now properly load with all user information (creator, approver, and last editor) in the response.

## Impact

- ✅ Fixes the 500 error when updating purchase orders
- ✅ Enables proper version history tracking with user information
- ✅ Allows full audit trail with user details for all edits
- ✅ No breaking changes to existing functionality
- ✅ Performance optimized by removing unnecessary early include
