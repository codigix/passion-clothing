# GRN Requests Username Field Fix - Summary

## Problem
The GRN requests API was failing with a **500 Internal Server Error**:
```
"Unknown column 'assignedUser.username' in 'field list'"
```

This error occurred because the code was trying to query a `username` field from the User model, but the User model doesn't have a `username` field.

## Root Cause
The User model only has these fields:
- `employee_id`
- `name`
- `email`
- `password`
- `phone`
- `department`
- `status`
- etc.

**There is NO `username` field.**

Multiple API endpoints were incorrectly trying to include `username` in their query attributes for User associations.

## Files Fixed

### 1. **server/routes/inventory.js** (4 occurrences)
   - Line 535: `assignedUser` attributes
   - Line 536: `reviewer` attributes
   - Line 549: `creator` attributes (in PO query)
   - Line 590-591: `assignedUser` and `reviewer` attributes (in single GRN request)
   - Line 603-604: `creator` and `approver` attributes

### 2. **server/routes/grn.js** (6 occurrences)
   - Lines 35-37: `creator`, `inspector`, `approver` attributes (list endpoint)
   - Lines 79-81: `creator`, `inspector`, `approver` attributes (single GRN endpoint)

### 3. **server/routes/vendorReturns.js** (4 occurrences)
   - Lines 36-37: `creator` and `approver` attributes (list endpoint)
   - Lines 75-76: `creator` and `approver` attributes (single return endpoint)

### 4. **server/scripts/checkUsers.js** (test script)
   - Line 13: User query attributes
   - Line 18: Console log output

## Changes Made
All instances of `'username'` in User model attribute arrays were replaced with `'email'`.

**Before:**
```javascript
attributes: ['id', 'name', 'username']
```

**After:**
```javascript
attributes: ['id', 'name', 'email']
```

## Testing
After these fixes, the following should work:
1. ✅ Sidebar badge showing GRN request count
2. ✅ Inventory dashboard showing incoming orders
3. ✅ GRN requests page loading properly
4. ✅ GRN creation workflow
5. ✅ Vendor returns functionality

## How to Verify
1. **Login as inventory user:**
   - Email: `inventory@pashion.com`
   - Password: `inventory123`

2. **Check the sidebar:**
   - Should see "Goods Receipt (GRN)" with a red badge showing "3"

3. **Navigate to GRN page:**
   - Click "Goods Receipt (GRN)" from sidebar
   - Should see 3 pending GRN requests without any errors

4. **Check browser console:**
   - No more 500 errors
   - API calls to `/api/inventory/grn-requests` should return successfully

## Impact
This was a **critical bug** that completely broke the GRN workflow for inventory users. The fix ensures that:
- GRN requests are now visible in the inventory dashboard
- The sidebar badge displays correctly
- All GRN-related API endpoints work properly
- Vendor returns functionality is also fixed

## Lesson Learned
When the User model was refactored to remove the `username` field in favor of using `email` as the primary identifier, not all references in the API routes were updated. This highlights the importance of:
1. Database schema consistency checks
2. Comprehensive testing after model changes
3. Using TypeScript or better type checking to catch these issues at compile time

---
**Fixed on:** January 2025
**Issue Type:** Database schema mismatch
**Severity:** Critical (P0)
**Status:** ✅ Resolved