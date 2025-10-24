# 🧪 MRN FIX - QUICK TEST GUIDE

## 🚀 Quick Start: Test the 3 Fixes in 5 Minutes

### TEST 1: Multiple MRN Materials Load (Fix #1)

**Setup:**
1. Go to Manufacturing Dashboard → Incoming Requests tab
2. Find an order with multiple material requests (or create 2 MRNs for same project)

**Test Steps:**
1. Click **"Start Production"** on the incoming order
2. Watch for these signs:
   - ✅ Should navigate to Production Wizard (NOT open a dialog)
   - ✅ Materials section should show toast: `"✅ X material(s) loaded from MRN for project"`
   - ✅ Check browser console for: `"✅ Merged X MRNs -> Y unique materials"`

**Expected Result:**
- If project has 2 MRNs with [Fabric, Thread] and [Buttons, Thread]:
  - Should show 3 unique materials (Thread merged, not duplicated)
  - Console should log: `"✅ Merged 2 MRNs -> 3 unique materials"`

---

### TEST 2: No Product Selection Dialog (Fix #2)

**Setup:**
1. Go to Manufacturing Dashboard → Incoming Requests tab
2. Have an incoming order ready

**Test Steps:**
1. Click **"Start Production"** button on any order
2. Verify:
   - ❌ ProductSelectionDialog should NOT appear
   - ✅ Should navigate to `/manufacturing/wizard?salesOrderId=XXX`
   - ✅ Wizard should have Sales Order pre-selected

**Expected Result:**
- Direct navigation to wizard
- No modal dialog asking for product selection
- Sales order already filled in the form

---

### TEST 3: Project-Wise Materials Auto-Load (Fix #3)

**Setup:**
1. Manually navigate to: `/manufacturing/wizard?salesOrderId=123`
2. Replace `123` with an actual sales order ID

**Test Steps:**
1. Wizard page loads
2. Check:
   - ✅ Sales order automatically selected
   - ✅ Materials section auto-populated
   - ✅ Console shows: `"📦 Auto-fetching MRN materials for project: ProjectName"`
   - ✅ Toast shows material count

**Expected Result:**
- Page auto-loads sales order data
- Materials auto-populate from MRN
- No manual material selection needed

---

## 🔍 Console Logs to Look For

### ✅ Correct Behavior Logs

```
✅ Merged 2 MRNs -> 4 unique materials for project: SO-123
📦 Auto-fetching MRN materials for project: SO-123
✅ Found 4 materials for project
📋 Materials prefilled: [...]
🟢 Loading sales order details from dashboard: 123
✅ Sales order loaded: {...}
```

### ❌ Error Logs (Should NOT see these)

```
Failed to fetch MRN materials (❌ Should not happen)
No materials found (❌ Check if MRN exists)
ProductSelectionDialog opening (❌ Should be removed)
Product selection required (❌ Old flow)
```

---

## 📊 Database Verification

### Check 1: Multiple MRNs for Project
```sql
SELECT id, request_number, project_name, status, created_at
FROM project_material_requests
WHERE status IN ('approved', 'forwarded', 'in_process')
AND project_name = 'SO-123'
ORDER BY created_at DESC;
```

**Expected**: Multiple rows for same project

### Check 2: Materials Count
```sql
SELECT 
  pmr.request_number,
  JSON_LENGTH(pmr.materials_requested) as material_count
FROM project_material_requests pmr
WHERE pmr.project_name = 'SO-123'
ORDER BY pmr.created_at DESC;
```

**Expected**: Each MRN has materials, total sum = what wizard displays

### Check 3: Production Orders (Project-Based)
```sql
SELECT 
  id, 
  production_number, 
  project_reference,
  CAST(REPLACE(specifications, '"', '') AS CHAR) as specs
FROM production_orders
WHERE project_reference = 'SO-123'
ORDER BY created_at DESC;
```

**Expected**: One order per project with all materials linked

---

## 🐛 Troubleshooting

### Issue: Still only 1 material showing

**Cause**: Backend endpoint still has `limit: 1`
```javascript
// ❌ Check if this line exists
const mrn = await ProjectMaterialRequest.findOne({ limit: 1 })

// ✅ Should be
const mrns = await ProjectMaterialRequest.findAll()
```

**Fix**: Apply backend changes from MATERIAL_REQUEST_MRN_FIX_COMPLETE.md

---

### Issue: Product selection dialog still appears

**Cause**: Old code still being imported
```javascript
// ❌ Check for these
import ProductSelectionDialog from "..."
<ProductSelectionDialog ... />

// ✅ Should be removed
```

**Fix**: Apply frontend changes from ManufacturingDashboard.jsx section

---

### Issue: MRN materials not auto-loading in wizard

**Cause**: Missing auto-fetch function call
```javascript
// ❌ Missing this
fetchMRNMaterialsForProject(projectName);

// ✅ Should be added to useEffect
```

**Fix**: Verify ProductionWizardPage.jsx has updated useEffect (line 1021-1024)

---

### Issue: "No materials found" toast even with MRNs

**Cause**: MRN status not in approved list
```javascript
// Check status must be one of these
status: { [Op.in]: ['approved', 'forwarded', 'in_process'] }
```

**Fix**: Create/update MRN to have one of these statuses

---

## 📋 Pre-Test Checklist

- [ ] Backend code updated (server/routes/manufacturing.js)
- [ ] Frontend code updated (ManufacturingDashboard.jsx)
- [ ] Wizard code updated (ProductionWizardPage.jsx)
- [ ] Browser cache cleared
- [ ] Backend restarted
- [ ] Frontend restarted
- [ ] Database has test data (Sales Orders, MRNs, Inventory)

---

## 🎯 Success Criteria

### All Tests Pass If:

✅ **Test 1**: Wizard receives ALL materials from multiple MRNs
✅ **Test 2**: Product selection dialog is completely removed
✅ **Test 3**: Materials auto-load when wizard opens with sales order ID
✅ **Console**: Shows "Merged X MRNs" message
✅ **Database**: Production order created with project_reference set
✅ **Toast**: Shows correct material count

---

## 📞 Quick Debug

### Run this to verify backend fix:

```bash
curl "http://localhost:5000/api/manufacturing/project/SO-123/mrn-materials" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Should see**:
- ✅ Multiple materials from multiple MRNs
- ✅ Merged list (no duplicates)
- ✅ Full inventory details for each material

### Check frontend in browser console:

```javascript
// Should log when starting production
console.log('✅ Starting production for project...')

// Should log when materials load
console.log('📦 Auto-fetching MRN materials...')
console.log('✅ Found X materials for project')
```

---

## ⏱️ Expected Timing

- **Page Load**: < 2 seconds
- **MRN Fetch**: < 1 second
- **Material Display**: < 500ms
- **Total Flow**: Click "Start Production" → Materials loaded = ~3 seconds

---

**Last Updated**: [Current Date]
**Status**: Ready for Testing ✅
