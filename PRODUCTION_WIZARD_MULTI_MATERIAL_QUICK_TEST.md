# ⚡ Multi-Material Fix - Quick Test Guide

## 🎯 2-Minute Quick Test

### Step 1: Open Production Wizard
```
1. Go to: http://localhost:3000/manufacturing/wizard
2. You should see "Order Selection" step
```

### Step 2: Find a Project with 2+ Approvals
```
1. Look at the project list
2. Find one that shows "3 approvals" or similar
3. Click to expand it
```

### Step 3: Select Project & Check Console
```
1. Click first approval in expanded project
2. Open F12 DevTools → Console tab
3. Look for these logs:
   ✅ "🚀 Loading project-wise approvals: 42,43,44"
   ✅ "✅ Loaded 3 approvals for project"
   ✅ "📦 Approval #42: Found 2 materials"
   ✅ "📦 Approval #43: Found 2 materials"  ← KEY LINE
   ✅ "📦 Project Materials Summary:" { ... }
```

### Step 4: Check Materials Form
```
1. Scroll down to "Materials" section
2. Expected: Multiple materials from ALL approvals
   Before Fix: ~1 material
   After Fix: ~4-8 materials (from all products)
3. Verify no duplicates (if 2 products need "Thread", should be 1 row with summed qty)
```

### Step 5: Success Indicators
```
✅ All materials showing
✅ No materials missing
✅ Console shows "📦 Approval #X: Found Y materials" for each approval
✅ Toast message shows correct material count
✅ Form accepts and validates materials
```

---

## 📊 Test Scenarios

### Quick Check: Do I Have a Multi-Approval Project?

```
1. Go to Manufacturing Dashboard
2. Click on "Approved Productions" tab
3. Look for a project card showing:
   📦 SO-001234 • 2 approvals • 50+ materials
   ↑ "2 approvals" = This is what we need!
```

### If You Don't Have Multi-Approval Projects Yet:

**Create one quickly:**
1. Go to Sales Orders
2. Create sales order with 2 items (2 different products)
3. Create material requests for both items
4. Approve both requests
5. You now have a project with 2 approvals!

---

## 🔍 Detailed Verification Checklist

### Console Output Verification
```javascript
// EXPECTED in Console (copy-paste to verify):

// Line 1: Loading started
🚀 Loading project-wise approvals: 42,43

// Line 2: Approvals loaded
✅ Loaded 2 approvals for project

// Line 3-4: Material fetching (ONE PER APPROVAL)
📦 Approval #42: Found 2 materials
📦 Approval #43: Found 3 materials

// Line 5: Summary with statistics
📦 Project Materials Summary: {
  totalApprovals: 2,
  totalMaterialsProcessed: 5,      // 2 + 3
  uniqueMaterials: 4,               // After deduplication
  materials: [
    { description: "Cotton", quantity: 50, unit: "meters" },
    { description: "Thread", quantity: 30, unit: "rolls" },
    { description: "Denim", quantity: 100, unit: "meters" },
    { description: "Buttons", quantity: 200, unit: "pcs" }
  ]
}
```

### Materials Form Verification
```
Materials Section Should Show:
  ☐ Cotton Fabric - 50 meters
  ☐ Thread - 30 rolls  (merged from 10+20)
  ☐ Denim - 100 meters
  ☐ Buttons - 200 pcs
  
NOT showing: Duplicates, missing items, wrong quantities
```

### Toast Messages Verification
```
Expected toast messages (in order):
1. "🚀 Loading approved order details..."
2. "✅ Loaded 2 materials from 2 approvals (merged & deduplicated)"
3. (Optional) "⭐ Order details loaded successfully!"
```

---

## 🐛 Common Issues & Quick Fixes

### Issue 1: Only 1 Material Showing
```
Problem: Wizard still shows only 1 material, not all
Diagnosis:
  1. Open F12 Console
  2. Look for "📦 Approval #X: Found Y materials"
  3. If you see "Found 0 materials" on second approval:
     → Materials missing in that approval
     
Quick Fix:
  1. Verify approvals have materials attached
  2. Check if receipt verification is complete
  3. Try fallback by checking Materials_Requested in MRN
```

### Issue 2: Materials Duplicated Instead of Merged
```
Problem: Showing 2 rows of "Thread" instead of 1 merged row
Diagnosis:
  1. Open F12 Console
  2. Check: "uniqueMaterials: X" vs "totalMaterialsProcessed: Y"
  3. If X < Y but not enough: Deduplication issue
  
Quick Fix:
  1. Check if material_name/material_code is NULL
  2. System falls back to product_name
  3. May need to standardize field names
```

### Issue 3: Console Shows Warnings
```
Problem: See "⚠️ Failed to parse materials_requested"
Diagnosis:
  1. JSON parsing failed in that approval
  2. System should fall back to next source
  3. Check if data corrupted
  
Quick Fix:
  1. Refresh page and try again
  2. Check backend logs for data issues
  3. Manually verify approval data structure
```

### Issue 4: Wizard Crashes
```
Problem: Clicking project causes error/crash
Diagnosis:
  1. Open F12 Console
  2. Look for red errors
  3. Check if it's in the parsing logic
  
Quick Fix:
  1. Try single approval (approvalId=X instead)
  2. Check approval data structure in Network tab
  3. Verify mrnRequest/salesOrder exists
```

---

## ✅ Rollout Verification Checklist

Before marking as "Production Ready":

```
☐ Tested with 2-product project
☐ Tested with missing receipt scenario
☐ Verified deduplication working
☐ Console logs showing correct data
☐ Material quantities accurate
☐ No duplicate rows in form
☐ Toast messages helpful
☐ Can create production order with merged materials
☐ No JavaScript errors in console
☐ Mobile responsive still works
☐ Previous single-approval flow still works
☐ Fallback to approvalId=X parameter works
```

---

## 🎉 Success Indicators

### You Know It's Working When:

1. **Multi-Material Display**
   ```
   Project with 2 products → Shows ALL materials from both
   Before: ~1-2 materials
   After: ~4-8 materials
   ```

2. **Smart Deduplication**
   ```
   Both products need "Thread"
   Approval 1: Thread 10 rolls
   Approval 2: Thread 20 rolls
   Result: Thread 30 rolls (merged, not duplicated)
   ```

3. **Console Tells the Story**
   ```
   📦 Approval #1: Found 2 materials
   📦 Approval #2: Found 3 materials
   totalMaterialsProcessed: 5
   uniqueMaterials: 4  ← Less than 5 = deduplication worked!
   ```

4. **User Experience**
   ```
   ✅ All materials auto-filled
   ✅ No missing materials
   ✅ Quantities correct
   ✅ No manual adding needed
   ✅ Ready to create production order
   ```

---

## 📋 Test Report Template

Use this to report your test results:

```markdown
## Test Results - Multi-Material Fix

**Tester**: [Your Name]
**Date**: [Date]
**Browser**: [Chrome/Firefox/etc]

### Test 1: Project with 2 Products
- [ ] Materials loaded from both products
- [ ] Console shows both approval lookups
- [ ] Quantities merged correctly
- [ ] Status: ✅ PASS / ❌ FAIL

### Test 2: Missing Receipt Fallback
- [ ] First approval uses MRN fallback
- [ ] Second approval uses receipt
- [ ] All materials present
- [ ] Status: ✅ PASS / ❌ FAIL

### Test 3: Deduplication
- [ ] Duplicate material keys merged
- [ ] Quantities summed
- [ ] Single row shown
- [ ] Status: ✅ PASS / ❌ FAIL

### Test 4: Production Order Creation
- [ ] Form submits successfully
- [ ] All materials included
- [ ] Production order created
- [ ] Status: ✅ PASS / ❌ FAIL

### Overall Result: ✅ READY FOR DEPLOYMENT
```

---

## 🚀 Deployment Readiness

### Pre-Deployment Checklist
```
☐ All tests passed
☐ Console logs verified
☐ No JavaScript errors
☐ Backward compatibility confirmed (old approvalId works)
☐ Performance acceptable
☐ Mobile tested
☐ Fallback scenarios work
```

### Post-Deployment Monitoring
```
1. Monitor console errors (1st hour)
2. Check user feedback on material loading
3. Watch for complaints about missing materials
4. Verify production orders creating successfully
5. If issues found, rollback (< 2 minutes)
```

---

## 💡 Tips for Testing

### Best Test Projects
```
✅ Projects with:
   - 2-3 products
   - Mixed approval states (some with receipts, some without)
   - Different material types
   - Quantity variations
   
Example:
  Project: SO-001234
  ├─ Approval #42 (Shirt) - With Receipt - 2 materials
  ├─ Approval #43 (Pants) - NO Receipt - 3 materials
  └─ Approval #44 (Jacket) - With Receipt - 2 materials
  
This exercises ALL code paths!
```

### Console Debugging Tips
```
1. Filter Console for "Approval" to see per-approval logs
2. Search for "📦" emoji to find material summaries
3. Look for "⚠️" warnings (fallback scenarios)
4. Count approvals in logs vs expected
5. Verify material counts add up
```

---

## 🎯 What NOT to Test

```
❌ Don't test with single-approval projects
   (Won't exercise multi-material code path)

❌ Don't test without opening console
   (You won't see the success indicators)

❌ Don't test with incomplete projects
   (Materials might legitimately be missing)

❌ Don't test production environment first
   (Always test staging first)
```

---

## 📞 Support

If tests fail:
1. Collect F12 console output (full text)
2. Note which test case failed
3. Check if backend services running
4. Verify test data exists
5. Report with browser/OS info

---

## ✨ Summary

**What to Expect**: Projects with 2+ products now load ALL materials correctly

**Quick Check**: F12 Console should show "📦 Approval #X: Found Y materials" multiple times

**Success**: Form shows merged materials from all approvals without duplicates

**Time**: 2-5 minutes to verify