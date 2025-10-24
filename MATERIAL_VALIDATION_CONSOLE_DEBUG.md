# 🔍 MATERIAL VALIDATION - CONSOLE DEBUG GUIDE

## How to Read the Enhanced Logs

When you load the wizard and get "Validation Required", check the F12 Console for this detailed output:

---

## Example 1: ✅ SUCCESSFUL (All Materials Pass)

```console
📦 Pre-filling materials from receipt: Array(1)

📦 Received materials structure: [
  {
    inventory_id: 42,
    material_code: "FAB-001",
    material_name: "Cotton Fabric",
    description: "White Cotton",
    quantity_received: 50,
    barcode_scanned: "BC12345"
  }
]

📋 Material #1 Validation: {
  material_name: "Cotton Fabric",
  hasId: {
    result: true,        ← ✅ HAS ID
    inventory_id: 42,
    material_code: "FAB-001",
    barcode_scanned: "BC12345"
  },
  hasDescription: {
    result: true,        ← ✅ HAS DESCRIPTION
    material_name: "Cotton Fabric",
    name: undefined,
    description: "White Cotton"
  },
  hasQuantity: {
    result: true,        ← ✅ HAS QUANTITY
    quantity_received: 50,
    quantity: undefined,
    quantity_dispatched: undefined
  },
  willPass: "✅ PASS"
}

📊 Material Filter Results: {
  original: 1,
  filtered: 1,
  percentage: "100%"
}

✅ 1 material(s) loaded from receipt
```

**What this means**: Material has all required data, passed filter, and loaded ✅

---

## Example 2: ❌ FILTERED OUT (Missing Data)

```console
📦 Pre-filling materials from receipt: Array(1)

📦 Received materials structure: [
  {
    inventory_id: null,          ← ❌ NO ID
    material_code: null,
    material_name: "Cotton",     ← ✅ HAS NAME
    description: null,
    quantity_received: null,     ← ❌ NO QUANTITY
    barcode_scanned: null
  }
]

📋 Material #1 Validation: {
  material_name: "Cotton",
  hasId: {
    result: false,               ← ❌ MISSING ID
    inventory_id: null,
    material_code: null,
    barcode_scanned: null
  },
  hasDescription: {
    result: true,               ← ✅ HAS DESCRIPTION
    material_name: "Cotton",
    name: undefined,
    description: null
  },
  hasQuantity: {
    result: false,              ← ❌ MISSING QUANTITY
    quantity_received: null,
    quantity: undefined,
    quantity_dispatched: undefined
  },
  willPass: "❌ FILTERED"
}

⚠️ Material filtered due to missing: {
  missingId: true,             ← ❌
  missingDescription: false,   ← ✅
  missingQuantity: true,       ← ❌
  material: { ... }
}

📊 Material Filter Results: {
  original: 1,
  filtered: 0,
  percentage: "0%"
}

⚠️ Loaded 0 of 1 materials (some had missing data)
```

**What this means**: Material is missing ID and Quantity → Gets filtered out → Form validation fails

---

## Example 3: ⚠️ PARTIAL (Some Pass, Some Filtered)

```console
📦 Pre-filling materials from receipt: Array(3)

📋 Material #1 Validation: {
  material_name: "Fabric",
  hasId: { result: true, ... },
  hasDescription: { result: true, ... },
  hasQuantity: { result: true, ... },
  willPass: "✅ PASS"
}

📋 Material #2 Validation: {
  material_name: "Button",
  hasId: { result: false, ... },
  hasDescription: { result: true, ... },
  hasQuantity: { result: true, ... },
  willPass: "❌ FILTERED"
}

⚠️ Material filtered due to missing: {
  missingId: true,
  missingDescription: false,
  missingQuantity: false,
  material: { ... }
}

📋 Material #3 Validation: {
  material_name: "Thread",
  hasId: { result: true, ... },
  hasDescription: { result: true, ... },
  hasQuantity: { result: true, ... },
  willPass: "✅ PASS"
}

📊 Material Filter Results: {
  original: 3,
  filtered: 2,
  percentage: "67%"
}

⚠️ Loaded 2 of 3 materials (some had missing data)
```

**What this means**: 2 materials passed, 1 filtered → Form should show 2 materials

---

## Example 4: 📦 PROJECT-WISE (Multi-Approval)

```console
🚀 Loading project-wise approvals: "42,43"

✅ Loaded 2 approvals for project

📦 Approval #42: Found 3 materials

   📋 Material #1 Validation: {
     material_name: "Fabric",
     hasId: { result: true, ... },
     hasDescription: { result: true, ... },
     hasQuantity: { result: true, ... },
     willPass: "✅ PASS"
   }

   📋 Material #2 Validation: {
     material_name: "Button",
     hasId: { result: false, ... },       ← ❌ FILTERED
     ...
     willPass: "❌ FILTERED"
   }

   📋 Material #3 Validation: {
     material_name: "Thread",
     hasId: { result: true, ... },
     hasDescription: { result: true, ... },
     hasQuantity: { result: true, ... },
     willPass: "✅ PASS"
   }

📦 Approval #42: Valid materials after filtering: 2 (skipped: 1)

📦 Approval #43: Found 2 materials

   📋 Material #1 Validation: {
     material_name: "Fabric",
     ...
     willPass: "✅ PASS"
   }

   📋 Material #2 Validation: {
     material_name: "Accessories",
     ...
     willPass: "✅ PASS"
   }

📦 Approval #43: Valid materials after filtering: 2 (skipped: 0)

📦 Project Materials Summary: {
  uniqueMaterials: 3,
  totalQuantity: 120,
  skippedMaterials: 1
}

⚠️ Loaded 3 materials from 2 approvals (1 skipped)
```

**What this means**: 
- Approval #42: 2 of 3 materials passed
- Approval #43: 2 of 2 materials passed  
- Total: 3 unique materials after deduplication

---

## Validation Rules Reference

Each material MUST have:

### 1. An ID (from ANY of these):
```javascript
✅ mat.inventory_id      (preferred)
✅ mat.material_code     (fallback 1)
✅ mat.product_id        (fallback 2)
✅ mat.id                (fallback 3)
✅ mat.barcode_scanned   (fallback 4)
```
**Missing ALL** → ❌ FILTERED

### 2. A Description (from ANY of these):
```javascript
✅ mat.material_name     (preferred)
✅ mat.product_name      (fallback 1)
✅ mat.name              (fallback 2)
✅ mat.description       (fallback 3)
```
**Missing ALL** → ❌ FILTERED

### 3. A Quantity (from ANY of these):
```javascript
✅ mat.quantity_received     (preferred)
✅ mat.quantity_required     (fallback 1)
✅ mat.quantity             (fallback 2)
✅ mat.quantity_dispatched  (fallback 3)
```
**Missing ALL** → ❌ FILTERED

---

## How to Fix "Validation Required" Error

### Step 1: Check Console
```
F12 → Console Tab → Look for logs
```

### Step 2: Find "Validation" Messages
```
Search for:  "❌ FILTERED"  OR  "⚠️ Material filtered"
```

### Step 3: Identify Missing Field
```console
⚠️ Material filtered due to missing: {
  missingId: true,           ← This one is missing!
  missingDescription: false,
  missingQuantity: false,
  material: { ... }
}
```

### Step 4: Choose Action

**If NO materials loaded (0%):**
→ Manually add materials using "Add Material" button

**If SOME materials loaded (0-99%):**
→ Manually add the filtered materials

**If ALL materials loaded (100%):**
→ Problem is not material loading
→ Check form validation (other fields)

---

## Common Issues & Fixes

| Issue | Console Shows | Fix |
|-------|---------------|-----|
| No materials load | `Array(0)` | Receipt empty or add manually |
| One material filtered | `missingId: true` | Ensure inventory_id is set |
| All filtered | `missingDescription: true` | Ensure material_name is set |
| Quantity problem | `missingQuantity: true` | Ensure quantity_received is set |

---

## Technical Details

### Material Object Example (What to Look For)

**Good Material** 🟢
```javascript
{
  inventory_id: 123,
  material_code: "FAB-001",
  material_name: "Cotton Fabric",
  description: "White Cotton 100%",
  quantity_received: 50,
  barcode_scanned: "BC123456",
  uom: "meters"
}
```

**Bad Material** 🔴
```javascript
{
  inventory_id: null,      ← ❌ NULL
  material_code: null,     ← ❌ NULL
  material_name: null,     ← ❌ NULL
  description: null,       ← ❌ NULL
  quantity_received: null, ← ❌ NULL
  barcode_scanned: null,   ← ❌ NULL
  uom: "meters"
}
```

---

## Quick Debugging Workflow

1. **Load Wizard** → Production Order form appears
2. **Wait for logs** → Console fills with diagnostic info
3. **Scroll console** → Find "📋 Material #X Validation:" messages
4. **Check willPass** → Look for ✅ PASS or ❌ FILTERED
5. **For ❌ FILTERED** → Note which fields are `result: false`
6. **Backend team** → Tell them which field is missing from material data
7. **Form** → Add missing materials manually OR wait for fix

---

## Questions to Ask Backend Team

If materials are consistently filtered:

1. **"Which field is NULL?"** 
   - Check console for `missingId`, `missingDescription`, or `missingQuantity`

2. **"Which backend table stores this?"**
   - material_receipts? MRN? Sales Order?

3. **"What's the data structure?"**
   - Paste the material object from console

4. **"Can we populate [field] automatically?"**
   - inventory_id: Should be set during receipt creation
   - material_name: Should come from product catalog
   - quantity_received: Should be entered during receipt

---

## Success Indicators

✅ **Everything working:**
```
Array(X)  →  📋 Material #X Validation: willPass "✅ PASS"  →  Filter 100%  →  Toast Success
```

✅ **Partial working:**
```
Array(X)  →  Mix of ✅ and ❌  →  Filter <100%  →  Toast Warning
```

❌ **Not working:**
```
Array(0)  →  No validation logs  →  Toast: "Incomplete"
```

---

## For Backend Developers

If you see filtered materials, the root cause is usually:

1. **Material Receipt NOT storing `inventory_id`**
   - Solution: Set `inventory_id` when creating receipt items

2. **Material Name coming from wrong field**
   - Solution: Ensure `material_name` is populated (not just `name`)

3. **Quantity NOT transferred from MRN**
   - Solution: Copy `quantity_requested` → `quantity_received` during receipt

4. **Fallback chain incomplete**
   - Solution: Verify at least ONE field exists for ID, Description, Quantity

---

## File Locations

- **Frontend Validation Code**: `ProductionWizardPage.jsx` lines 936-962, 995-1020, 1179-1204
- **Console Logs**: Detailed messages shown at lines 945-950, 1003-1008, 1186-1192
- **Filtering Logic**: Lines 937-962 (received), 996-1020 (requested), 1179-1204 (project)
