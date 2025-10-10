# Test GRN Incoming Orders Workflow

## Current Status
The Inventory Dashboard incoming orders feature is working correctly, but no GRN requests exist yet.

## Test Steps

### Step 1: Check Existing POs
1. Login as **Procurement** user
2. Go to **Procurement → Purchase Orders**
3. Look for POs with status:
   - `sent` (approved, sent to vendor)
   - `acknowledged` (vendor confirmed receipt)
   - `partial_received` (partially delivered)

### Step 2: Request GRN Creation
1. Find a PO with status `sent`
2. Click the **"📋 Request GRN Creation"** button
3. Confirm the request

### Step 3: Verify in Inventory Dashboard
1. Login as **Inventory** user
2. Go to **Inventory Dashboard**
3. Click **"Incoming Orders"** tab
4. You should now see the PO with a "Create GRN" button

### Step 4: Check Sidebar Badge
1. Look at the sidebar
2. The **"Goods Receipt (GRN)"** menu item should show a red badge with count

## Expected Behavior

✅ After clicking "Request GRN Creation":
- GRN request appears in Inventory Dashboard → Incoming Orders
- Badge count updates in sidebar
- "Create GRN" button available

## Workflow Summary

```
PO Created
    ↓
Admin Approves (status → 'sent')
    ↓
Procurement clicks "Request GRN Creation" ← YOU ARE HERE
    ↓
Approval record created (entity_type='grn_creation')
    ↓
Appears in Inventory Incoming Orders ← WHAT YOU WANT TO SEE
    ↓
Inventory clicks "Create GRN"
    ↓
GRN Created and verified
    ↓
Add to Inventory
```

## Alternative: Auto-Create GRN Requests

If you want GRN requests to be created automatically when PO is approved:
- This would skip the manual "Request GRN Creation" step
- GRN requests would appear immediately after PO approval
- Let me know if you want this implemented