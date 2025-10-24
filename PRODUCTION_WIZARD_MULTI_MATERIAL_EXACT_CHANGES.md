# 🔧 Multi-Material Fix - Exact Code Changes

## 📍 File Location
```
d:\projects\passion-clothing\client\src\pages\manufacturing\ProductionWizardPage.jsx
```

---

## ✏️ Change #1: Material Fetching Logic

### Location: Lines 1050-1109

### BEFORE (Original Code)
```javascript
          // ✅ MERGE materials from all approvals
          const mergedMaterials = new Map();
          let totalMaterialsCount = 0;
          
          allApprovals.forEach((approval, idx) => {
            const materials = approval.verification?.receipt?.received_materials || [];
            materials.forEach(mat => {
              const key = mat.material_code || mat.material_name;
              if (!mergedMaterials.has(key)) {
                mergedMaterials.set(key, {
                  materialId: String(mat.inventory_id || mat.id),
                  description: mat.material_name || 'Material',
                  requiredQuantity: mat.quantity_received || 0,
                  unit: mat.unit || 'pcs',
                  status: 'available',
                  batchNumber: mat.batch_number,
                  warehouseLocation: mat.warehouse_location
                });
              } else {
                // Accumulate quantity if same material appears in multiple approvals
                const existing = mergedMaterials.get(key);
                existing.requiredQuantity += (mat.quantity_received || 0);
              }
              totalMaterialsCount++;
            });
          });
```

### AFTER (Fixed Code)
```javascript
          // ✅ MERGE materials from all approvals with fallback logic
          const mergedMaterials = new Map();
          let totalMaterialsCount = 0;
          
          allApprovals.forEach((approval, idx) => {
            // 1️⃣ PRIMARY: Try received materials from verification receipt
            let materialsToProcess = approval.verification?.receipt?.received_materials || [];
            
            // 2️⃣ FALLBACK: If no received materials, try materials_requested from MRN
            if (!materialsToProcess || materialsToProcess.length === 0) {
              const mrnRequest = approval.mrnRequest || {};
              try {
                const requested = mrnRequest.materials_requested;
                if (requested) {
                  materialsToProcess = typeof requested === 'string' 
                    ? JSON.parse(requested) 
                    : requested;
                }
              } catch (e) {
                console.warn(`⚠️ Failed to parse materials_requested for approval ${approval.id}:`, e);
              }
            }
            
            // 3️⃣ SECONDARY FALLBACK: Try items from sales order
            if (!materialsToProcess || materialsToProcess.length === 0) {
              const salesOrder = approval.mrnRequest?.salesOrder || {};
              try {
                const items = salesOrder.items;
                if (items) {
                  materialsToProcess = typeof items === 'string' 
                    ? JSON.parse(items) 
                    : items;
                }
              } catch (e) {
                console.warn(`⚠️ Failed to parse sales order items for approval ${approval.id}:`, e);
              }
            }
            
            console.log(`📦 Approval #${approval.id}: Found ${materialsToProcess?.length || 0} materials`);
            
            materialsToProcess?.forEach(mat => {
              const key = mat.material_code || mat.material_name || mat.product_name || `mat-${idx}`;
              if (!mergedMaterials.has(key)) {
                mergedMaterials.set(key, {
                  materialId: String(mat.inventory_id || mat.id || mat.product_id || ''),
                  description: mat.material_name || mat.product_name || mat.name || 'Material',
                  requiredQuantity: mat.quantity_received || mat.quantity_required || mat.quantity || 0,
                  unit: mat.unit || mat.uom || 'pcs',
                  status: 'available',
                  batchNumber: mat.batch_number,
                  warehouseLocation: mat.warehouse_location
                });
              } else {
                // Accumulate quantity if same material appears in multiple approvals
                const existing = mergedMaterials.get(key);
                existing.requiredQuantity += (mat.quantity_received || mat.quantity_required || mat.quantity || 0);
              }
              totalMaterialsCount++;
            });
          });
```

### What Changed
```diff
- const materials = approval.verification?.receipt?.received_materials || [];
+ // 1️⃣ PRIMARY: Try received materials from verification receipt
+ let materialsToProcess = approval.verification?.receipt?.received_materials || [];
+
+ // 2️⃣ FALLBACK: If no received materials, try materials_requested from MRN
+ if (!materialsToProcess || materialsToProcess.length === 0) {
+   const mrnRequest = approval.mrnRequest || {};
+   try {
+     const requested = mrnRequest.materials_requested;
+     if (requested) {
+       materialsToProcess = typeof requested === 'string' 
+         ? JSON.parse(requested) 
+         : requested;
+     }
+   } catch (e) {
+     console.warn(`⚠️ Failed to parse materials_requested for approval ${approval.id}:`, e);
+   }
+ }
+
+ // 3️⃣ SECONDARY FALLBACK: Try items from sales order
+ if (!materialsToProcess || materialsToProcess.length === 0) {
+   const salesOrder = approval.mrnRequest?.salesOrder || {};
+   try {
+     const items = salesOrder.items;
+     if (items) {
+       materialsToProcess = typeof items === 'string' 
+         ? JSON.parse(items) 
+         : items;
+     }
+   } catch (e) {
+     console.warn(`⚠️ Failed to parse sales order items for approval ${approval.id}:`, e);
+   }
+ }
+
+ console.log(`📦 Approval #${approval.id}: Found ${materialsToProcess?.length || 0} materials`);
-
- materials.forEach(mat => {
-   const key = mat.material_code || mat.material_name;
+ materialsToProcess?.forEach(mat => {
+   const key = mat.material_code || mat.material_name || mat.product_name || `mat-${idx}`;
-     description: mat.material_name || 'Material',
-     requiredQuantity: mat.quantity_received || 0,
-     unit: mat.unit || 'pcs',
+     description: mat.material_name || mat.product_name || mat.name || 'Material',
+     requiredQuantity: mat.quantity_received || mat.quantity_required || mat.quantity || 0,
+     unit: mat.unit || mat.uom || 'pcs',
```

---

## ✏️ Change #2: Enhanced Field Mapping

### Location: Lines 1093-1101 (Material object creation)

### BEFORE
```javascript
                materialId: String(mat.inventory_id || mat.id),
                description: mat.material_name || 'Material',
                requiredQuantity: mat.quantity_received || 0,
                unit: mat.unit || 'pcs',
```

### AFTER
```javascript
                materialId: String(mat.inventory_id || mat.id || mat.product_id || ''),
                description: mat.material_name || mat.product_name || mat.name || 'Material',
                requiredQuantity: mat.quantity_received || mat.quantity_required || mat.quantity || 0,
                unit: mat.unit || mat.uom || 'pcs',
```

### What Changed
```diff
- materialId: String(mat.inventory_id || mat.id),
+ materialId: String(mat.inventory_id || mat.id || mat.product_id || ''),

- description: mat.material_name || 'Material',
+ description: mat.material_name || mat.product_name || mat.name || 'Material',

- requiredQuantity: mat.quantity_received || 0,
+ requiredQuantity: mat.quantity_received || mat.quantity_required || mat.quantity || 0,

- unit: mat.unit || 'pcs',
+ unit: mat.unit || mat.uom || 'pcs',
```

### Why These Changes
```
materialId:
  OLD: mat.inventory_id || mat.id
  NEW: mat.inventory_id || mat.id || mat.product_id || ''
  REASON: Sales order items use product_id, not inventory_id

description:
  OLD: mat.material_name || 'Material'
  NEW: mat.material_name || mat.product_name || mat.name || 'Material'
  REASON: Different sources use different field names (product_name vs material_name)

requiredQuantity:
  OLD: mat.quantity_received || 0
  NEW: mat.quantity_received || mat.quantity_required || mat.quantity || 0
  REASON: MRN uses quantity_required, SO items use quantity
          Need to check all sources

unit:
  OLD: mat.unit || 'pcs'
  NEW: mat.unit || mat.uom || 'pcs'
  REASON: Some data sources use 'uom' (Unit of Measure) instead of 'unit'
```

---

## ✏️ Change #3: Quantity Accumulation Update

### Location: Lines 1103-1105 (Quantity merging for duplicates)

### BEFORE
```javascript
                // Accumulate quantity if same material appears in multiple approvals
                const existing = mergedMaterials.get(key);
                existing.requiredQuantity += (mat.quantity_received || 0);
```

### AFTER
```javascript
                // Accumulate quantity if same material appears in multiple approvals
                const existing = mergedMaterials.get(key);
                existing.requiredQuantity += (mat.quantity_received || mat.quantity_required || mat.quantity || 0);
```

### What Changed
```diff
- existing.requiredQuantity += (mat.quantity_received || 0);
+ existing.requiredQuantity += (mat.quantity_received || mat.quantity_required || mat.quantity || 0);
```

### Why
When accumulating quantities from different sources, must check all quantity fields like the primary assignment.

---

## ✏️ Change #4: Toast Message Enhancement

### Location: Lines 1111-1118 (Success notification)

### BEFORE
```javascript
          // Update form with merged materials
          const materialsArray = Array.from(mergedMaterials.values());
          if (materialsArray.length > 0) {
            methods.setValue('materials.items', materialsArray, { shouldValidate: true });
            toast.success(`✅ Loaded ${materialsArray.length} materials from ${allApprovals.length} approvals (merged)`);
          }
          
          console.log(`📦 Merged ${totalMaterialsCount} materials -> ${mergedMaterials.size} unique items`);
```

### AFTER
```javascript
          // Update form with merged materials
          const materialsArray = Array.from(mergedMaterials.values());
          if (materialsArray.length > 0) {
            methods.setValue('materials.items', materialsArray, { shouldValidate: true });
            toast.success(`✅ Loaded ${materialsArray.length} materials from ${allApprovals.length} approvals (merged & deduplicated)`);
          } else {
            toast.info('ℹ️ No materials found in approvals. You can add them manually.');
          }
          
          console.log(`📦 Project Materials Summary:`, {
            totalApprovals: allApprovals.length,
            totalMaterialsProcessed: totalMaterialsCount,
            uniqueMaterials: mergedMaterials.size,
            materials: Array.from(mergedMaterials.entries()).map(([key, mat]) => ({
              key,
              description: mat.description,
              quantity: mat.requiredQuantity,
              unit: mat.unit
            }))
          });
```

### What Changed
```diff
- toast.success(`✅ Loaded ${materialsArray.length} materials from ${allApprovals.length} approvals (merged)`);
+ toast.success(`✅ Loaded ${materialsArray.length} materials from ${allApprovals.length} approvals (merged & deduplicated)`);

+ } else {
+   toast.info('ℹ️ No materials found in approvals. You can add them manually.');
+ }

- console.log(`📦 Merged ${totalMaterialsCount} materials -> ${mergedMaterials.size} unique items`);
+ console.log(`📦 Project Materials Summary:`, {
+   totalApprovals: allApprovals.length,
+   totalMaterialsProcessed: totalMaterialsCount,
+   uniqueMaterials: mergedMaterials.size,
+   materials: Array.from(mergedMaterials.entries()).map(([key, mat]) => ({
+     key,
+     description: mat.description,
+     quantity: mat.requiredQuantity,
+     unit: mat.unit
+   }))
+ });
```

### Why
- Clearer toast message mentioning deduplication
- Handle edge case when no materials found
- Detailed console logging for debugging

---

## 📋 Summary of Changes

| Change | Type | Lines | Impact |
|--------|------|-------|--------|
| **3-Tier Material Fetching** | Logic | 1050-1088 | PRIMARY: Critical |
| **Enhanced Field Mapping** | Robustness | 1093-1101 | MEDIUM: Supports more sources |
| **Quantity Accumulation** | Consistency | 1103-1105 | SMALL: Consistency fix |
| **Toast & Logging** | UX/Debug | 1111-1130 | MEDIUM: Better feedback |

---

## 🧪 Testing Changes

### To Verify Change #1 (3-Tier Fetching)
```
1. Open F12 Console
2. Look for: "📦 Approval #X: Found Y materials"
3. Should see ONE line per approval
4. If seeing "Found 0 materials" for any approval:
   → System is trying fallbacks (correct behavior)
5. If seeing "⚠️ Failed to parse":
   → Error handling is working (continues to next source)
```

### To Verify Change #2 (Field Mapping)
```
1. Open F12 Console
2. Look at "Project Materials Summary"
3. Check each material object:
   - key: should be populated (material_code, name, or product_name)
   - description: should match form display
   - quantity: should be correct number
   - unit: should be valid (pcs, meters, rolls, etc)
```

### To Verify Change #3 (Quantity Accumulation)
```
1. Select project where 2 approvals need same material
   (e.g., both need "Thread")
2. Check form:
   - Should show SINGLE "Thread" row
   - Quantity should be SUMMED (10 + 20 = 30)
   - NOT duplicate rows
3. Console: "uniqueMaterials: X" should be less than "totalMaterialsProcessed: Y"
```

### To Verify Change #4 (Toast & Logging)
```
1. Open F12 Console
2. Look for "📦 Project Materials Summary:"
3. Should be detailed object with all fields
4. Verify toast message says "(merged & deduplicated)"
5. If no materials: should see "ℹ️ No materials found..."
```

---

## ✅ Backward Compatibility Check

### Existing Single-Approval Flow
```javascript
// OLD: User navigates with approvalId=42
const approvalId = searchParams.get('approvalId');
if (approvalId) {
  fetchOrderDetails(approvalId);  // Uses OLD logic
}

// NEW: Project-wise flow only for projectApprovals parameter
const projectApprovals = searchParams.get('projectApprovals');
if (projectApprovals && salesOrderId && !searchParams.get('approvalId')) {
  // Uses NEW logic
}
```

✅ **Result**: Both flows work independently, no breaking changes

---

## 🔄 Code Flow After Changes

```
useEffect (project-wise loading) triggered
    ↓
projectApprovals parameter detected
    ↓
Fetch ALL approval details (Promise.all)
    ↓
FOR EACH approval:
    ↓
  1️⃣ Try: approval.verification?.receipt?.received_materials
    ↓ (if empty)
  2️⃣ Try: approval.mrnRequest?.materials_requested
    ↓ (if empty)
  3️⃣ Try: approval.mrnRequest?.salesOrder?.items
    ↓
  Log: "📦 Approval #X: Found Y materials"
    ↓
  Process materials with enhanced field mapping
    ↓
  Add to mergedMaterials Map (with deduplication)
    ↓
Create form data from merged materials
    ↓
Set form: methods.setValue('materials.items', materialsArray)
    ↓
Show success toast + detailed console log
    ↓
✅ Complete!
```

---

## 🎯 Key Implementation Details

### Material Key Strategy
```javascript
// Priority order for deduplication key
const key = mat.material_code || mat.material_name || mat.product_name || `mat-${idx}`;

// Why this order:
// 1. material_code: Most specific, unique identifier
// 2. material_name: Descriptive name, usually unique
// 3. product_name: Fallback if names not set
// 4. mat-${idx}: Absolute fallback to prevent duplicates
```

### Try-Catch Strategy
```javascript
try {
  materialsToProcess = typeof requested === 'string' 
    ? JSON.parse(requested) 
    : requested;
} catch (e) {
  console.warn(`⚠️ Failed to parse materials_requested for approval ${approval.id}:`, e);
  // If parsing fails, materialsToProcess remains []
  // Then next source is tried
  // If all fail, approval is skipped (acceptable edge case)
}
```

### Fallback Chain
```javascript
let materialsToProcess = [...];

// Check current value
if (!materialsToProcess || materialsToProcess.length === 0) {
  // Try next source
  materialsToProcess = [...];
}

// Check again
if (!materialsToProcess || materialsToProcess.length === 0) {
  // Try last source
  materialsToProcess = [...];
}

// Use whatever we have (could still be empty)
materialsToProcess?.forEach(mat => {
  // Process...
});
```

---

## 📊 Lines Changed Summary

```
Total Lines Added:    ~60 (new fallback logic + enhanced mapping)
Total Lines Modified: ~15 (existing logic updates)
Total Lines Deleted:  ~5 (simplified conditions)
Net Change:           +50 lines

Impact Radius:
  - File: 1 (ProductionWizardPage.jsx)
  - Functions: 1 (useEffect for project-wise loading)
  - Components: 0 (data only)
  - Dependencies: 0 (no new imports)
  - Backend APIs: 0 (no changes)
  - Database: 0 (no migrations)
```

---

## 🚀 Deployment Checklist

Before deploying:
```
☐ Changes match this documentation
☐ No extra/accidental modifications
☐ Tested with 2+ product project
☐ Console logs verified
☐ Toast messages tested
☐ Backward compatibility confirmed
☐ No merge conflicts
☐ Code formatting consistent
☐ No linting errors
☐ Bundle size check (should be minimal)
```

---

## 📝 Rollback Instructions

If issues occur:

**Option 1: Revert to Original (< 2 minutes)**
```
1. In ProductionWizardPage.jsx
2. Replace lines 1050-1130 with original code
3. Save file
4. Restart frontend: npm start
5. Verify single-approval flow still works
```

**Option 2: Disable Project-wise (Temporary)**
```
1. Comment out lines 1003-1098 (entire useEffect)
2. Keep single-approval flow working (approvalId parameter)
3. Users can still use wizard, just not project-wise
```

---

## ✨ Summary

**Total code changes**: ~50 lines across 4 logical sections
**Complexity**: Medium (multiple fallbacks, but well-structured)
**Risk**: Low (isolated changes, easy rollback)
**Impact**: High (fixes critical multi-product workflow)
**Status**: ✅ Ready for deployment