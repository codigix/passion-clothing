# 🔍 MATERIAL LOADING TROUBLESHOOTING GUIDE

## Quick Diagnosis

### Problem: "Validation Required" Error After Material Auto-Fill

**Step 1: Check Browser Console**
```
Press F12 → Go to Console tab → Look for:
```

#### ✅ Good Signs (All Systems Normal)
```
📦 Pre-filling materials from receipt: Array(3)
📦 Received materials structure: [
  { inventory_id: 5, material_code: "FAB-001", material_name: "Cotton", quantity_received: 100 },
  { inventory_id: 7, material_code: "ZIP-001", material_name: "Zipper", quantity_received: 10 }
]
✅ 2 material(s) loaded from receipt
```

#### ⚠️ Warning Signs (Some Materials Incomplete)
```
📦 Pre-filling materials from receipt: Array(3)
⚠️ Skipping material with incomplete data: { material_name: "Thread", quantity: undefined }
⚠️ Loaded 2 of 3 materials (some had missing data)
```

#### ❌ Critical Issues (All Materials Rejected)
```
📦 Pre-filling materials from receipt: Array(0)
OR
⚠️ Receipt materials are incomplete. Please add materials manually.
```

---

## Diagnostic Table

| Console Message | Problem | Solution |
|---|---|---|
| `✅ X material(s) loaded` | ✅ No issue | Materials loaded successfully |
| `⚠️ Loaded X of Y materials (some missing data)` | ⚠️ Some materials incomplete | Add missing materials manually |
| `⚠️ Receipt materials incomplete. Please add manually` | ❌ All rejected | Verify receipt data or add manually |
| `❌ Could not resolve product from ID/code: XXX` | Product not found | Check product exists in inventory |
| `📦 Pre-filling materials from request: Array(0)` | No materials source | Create materials or MRN |

---

## Step-by-Step Debugging

### Issue: Materials Show in Receipt But Not Populating Form

**Debug Steps**:

1. **Check Receipt Structure**
```javascript
// In Console, find the log entry:
📦 Received materials structure: [...]

// Each material should have:
{
  inventory_id: <NUMBER or null>,        // ← Check this
  material_code: "<STRING or undefined>", // ← Check this
  material_name: "<STRING>",             // ← Must have
  quantity_received: <NUMBER>            // ← Must have
}
```

2. **Identify Incomplete Materials**
```javascript
// Console shows:
⚠️ Skipping material with incomplete data: {
  material_name: "Thread",
  quantity_received: undefined  // ← Problem: quantity is missing
}

// Solution: Update receipt data with quantity
```

3. **Check Material ID Fields**
```javascript
// Material needs ONE of these:
- inventory_id: 5          ✓ Good
- material_code: "FAB-001" ✓ Good
- barcode_scanned: "123"   ✓ Good
- (all missing)            ✗ Problem → Material skipped
```

---

## Common Issues & Fixes

### Issue #1: "Validation Required" Error

**What It Means**: Form has empty material IDs

**How to Fix**:
```
1. Open F12 Console
2. Search for: ⚠️ Skipping material
3. Each warning shows why a material was rejected
4. Check the highlighted fields in form
5. Either:
   a) Manually add missing data to form, OR
   b) Fix the data source (receipt/MRN) and reload
```

---

### Issue #2: Materials Loaded But Only Some Appear

**What It Means**: Some materials were incomplete and filtered out

**How to Fix**:
```
1. Toast message shows: "⚠️ Loaded X of Y materials"
2. X = loaded (valid), Y = total
3. Missing Y-X materials were incomplete
4. Look at console warnings for details
5. Manually add the missing ones to form
```

---

### Issue #3: No Materials Loaded At All

**What It Means**: All materials were incomplete or none exist

**How to Fix**:
```
Check console for:
a) "⚠️ Receipt materials incomplete" → Receipt has no valid materials
b) "📦 Pre-filling materials from request" → Fallback to MRN materials
c) "No materials found in approvals" → Neither receipt nor MRN have materials

Solution: Manually add materials to form
```

---

### Issue #4: Wrong Product Shown ("Could not resolve product...")

**What It Means**: Product code doesn't match any product in inventory

**How to Fix**:
```
Console shows:
❌ Could not resolve product from ID/code: T-S-TSHI-2512

Solution:
1. Check if product "T-S-TSHI-2512" exists in Inventory
2. If not: Create it first
3. If yes: Check product_code matches exactly
4. Case-sensitive! "TSHI-2512" ≠ "tshi-2512"
```

---

## Material Data Quality Check

### Required Fields by Source

#### ✅ From Receipt (Highest Priority)
```javascript
{
  inventory_id: <MUST have>,     // Inventory item ID
  material_code: <fallback>,     // If no inventory_id
  material_name: <MUST have>,    // Material description
  quantity_received: <MUST have> // Amount received
}

Example - VALID:
{ inventory_id: 5, material_name: "Cotton", quantity_received: 100 } ✓

Example - INVALID:
{ inventory_id: null, material_code: null, material_name: "Cotton", quantity_received: 100 } ✗
// No inventory_id or material_code
```

#### ⚠️ From MRN (Middle Priority)
```javascript
{
  inventory_id: <MUST have>,     // Inventory item ID
  material_code: <fallback>,     // If no inventory_id
  material_name: <MUST have>,    // Material description
  quantity_required: <MUST have> // Amount needed
}
```

#### 🔄 From Sales Order (Last Priority)
```javascript
{
  product_id: <MUST have>,       // Product ID
  product_name: <MUST have>,     // Product description
  quantity: <MUST have>          // Amount ordered
}
```

---

## Console Log Reference

### What Each Log Entry Means

```javascript
// 1. Project Mode Indicator
🚀 Loading project-wise approvals: 42,43
→ Multiple approvals are being processed together

// 2. Data Retrieved
✅ Loaded 2 approvals for project
→ Successfully fetched all approvals for the project

// 3. Raw Material Data
📦 Pre-filling materials from receipt: Array(3)
→ Receipt contains 3 material entries (may have incomplete data)

// 4. Material Structure Details
📦 Received materials structure: { inventory_id: 5, material_code: "FAB-001", ... }
→ Shows exact fields and values in materials array

// 5. Filtering Results
📦 Approval #42: Found 3 materials
📦 Approval #42: Valid materials after filtering: 2
→ Found 3, but only 2 are complete → 1 was rejected

// 6. Rejection Reasons
⚠️ Approval #42: Skipping material with incomplete data: { material_name: "Thread" }
→ Shows the material that was rejected and why

// 7. Final Summary
📦 Project Materials Summary: {
  totalApprovals: 2,
  totalMaterialsProcessed: 5,
  skippedMaterials: 1,
  uniqueMaterials: 4,
  materials: [...]
}
→ Statistics about what was processed and merged
```

---

## Quick Test Scenarios

### Scenario 1: Perfect Scenario
```
Console Shows:
✅ 5 material(s) loaded from receipt
📦 Project Materials Summary: { uniqueMaterials: 5, skippedMaterials: 0 }

Form Shows:
✓ 5 rows with all fields filled
✓ No empty material IDs

Result: ✅ No action needed
```

### Scenario 2: Partial Data
```
Console Shows:
⚠️ Loaded 4 of 5 materials (some had missing data)
⚠️ Approval #42: Skipping material with incomplete data: { quantity_received: undefined }

Form Shows:
✓ 4 rows loaded
✓ 1 missing (need to add manually)

Result: ⚠️ Add missing material manually
```

### Scenario 3: All Data Incomplete
```
Console Shows:
⚠️ Receipt materials incomplete. Please add manually.

Form Shows:
⚠️ Empty materials list
✓ Manual add button available

Result: 🚨 Add all materials manually
```

---

## Recovery Steps

### If Materials Don't Load:

**Option 1: Reload Page**
```
1. Hard refresh: Ctrl+Shift+R
2. Navigate back to wizard
3. Try again - fallback system might work
```

**Option 2: Use Fallback Source**
```
1. If receipt isn't loading, MRN might work
2. Check console: "Pre-filling materials from request"
3. If both empty, check if approval has materials at all
```

**Option 3: Manual Entry**
```
1. Click "Add Material" button
2. Manually search for and add materials
3. Enter required quantities
4. Submit order
```

---

## Data Fixes at Source

### Fix Incomplete Receipt Data

**In Database**:
```sql
-- Check receipt_materials are complete
SELECT material_name, inventory_id, quantity_received
FROM material_receipt_items
WHERE inventory_id IS NULL OR quantity_received IS NULL;

-- Add missing inventory_ids
UPDATE material_receipt_items
SET inventory_id = (SELECT id FROM inventory WHERE product_code = material_code)
WHERE inventory_id IS NULL AND material_code IS NOT NULL;
```

---

## Performance Notes

- **Material filtering**: < 1ms for 100 items
- **Form population**: < 100ms
- **Console logging**: Minimal overhead
- **User experience**: Fast and responsive

---

## Common Error Messages Explained

| Error | Cause | Fix |
|-------|-------|-----|
| "Validation Required" | Empty material IDs in form | See Issue #1 |
| "Material sufficiency" | Materials missing quantity | Check console warnings |
| "Product not found" | Product code doesn't exist | Create product in inventory |
| "No materials found" | Receipt/MRN empty | Add materials manually |
| "Skipping material" | Incomplete data | Check material structure |

---

## When to Contact Support

✅ **You Can Fix**:
- Materials loading but some incomplete
- Missing materials to add manually
- Product code doesn't match

❌ **Need Support**:
- Console shows errors (non-warnings)
- Multiple materials completely missing
- Data appears corrupted
- Receipt/MRN not appearing at all

---

## Summary

```
✅ GOOD: Toast shows "Loaded X materials"
⚠️ OK: Toast shows "Loaded X of Y (some missing data)" → Add remaining manually
❌ BAD: Toast shows "incomplete - add manually" → All rejected, need manual work
```

Check console every time to understand what happened!
