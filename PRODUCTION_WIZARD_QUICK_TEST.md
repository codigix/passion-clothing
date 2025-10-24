# Production Wizard - Quick Test Guide

## 🚀 Quick Test (5 minutes)

### **Step 1: Initial Page Load**
```
✅ EXPECTED:
- No material fields visible
- Message: "⚠️ Project Not Selected"
- Clean form, no placeholder data
```

**Action:**
1. Navigate to `/manufacturing/wizard`
2. Go to Step 4 (Materials tab)
3. Verify you see "⚠️ Project Not Selected" message
4. ❌ Should NOT see empty material input fields

---

### **Step 2: Select Project**
```
✅ EXPECTED:
- Loading message appears: "🔄 Loading materials..."
- After 2-3 seconds, success message: "📦 Materials loaded from MRN"
- Shows count like: "3 material(s) fetched"
- Material cards appear with data
```

**Action:**
1. Go to Step 1 (Select Project)
2. Click dropdown "-- Select a project/sales order --"
3. Select ANY project from the list
4. Wait 2-3 seconds
5. Check Step 1 shows green success box
6. Check browser console:
   ```
   ✅ Sales order loaded:
   ✅ MRN loaded with X requested materials
   📦 Loading X material(s) from MRN request
   ✅ Loaded X materials from MRN!
   ```

---

### **Step 3: View Loaded Materials**
```
✅ EXPECTED:
- Go to Step 4
- Each material shows:
  • Material ID (gray/disabled)
  • Description (gray/disabled) 
  • Required Qty (white/editable)
  • Unit (gray/disabled)
  • Status dropdown (white/editable)
- Can see "📋 Sourced from MRN" section in purple
```

**Action:**
1. Go to Step 4 (Materials)
2. Look at first material card
3. Try clicking "Material ID" field - should be locked
4. Try clicking "Required Qty" field - should be editable
5. Try clicking "Status" dropdown - should be editable

---

### **Step 4: Change Project Selection**
```
✅ EXPECTED:
- Go back to Step 1
- Select DIFFERENT project from dropdown
- All old data clears
- New project data loads
- Previous materials gone, new ones appear
```

**Action:**
1. In Step 1, change project selection
2. Check console for: "🔄 Sales order changed. Resetting dependent fields..."
3. Go to Step 2 - should show DIFFERENT product/quantity
4. Go to Step 4 - should show DIFFERENT materials
5. Verify NO old data from previous project remains

---

### **Step 5: Add Extra Material**
```
✅ EXPECTED:
- "➕ Add Additional Material" button visible
- Click it
- New blank material form appears
- Can fill in all fields
- Can submit with mixed (MRN + manual) materials
```

**Action:**
1. In Step 4, click "➕ Add Additional Material"
2. New material row appears
3. Fill in: ID, Description, Qty, Unit, Status
4. Try to continue through wizard

---

## 🐛 Common Issues & Solutions

### **Issue: Materials Not Appearing**

**Check #1: Browser Console**
```javascript
// You should see these logs:
✅ MRN loaded with X requested materials
📦 Loading X material(s) from MRN request
```

If NOT present:
- ❌ MRN not fetched → Check next issue

**Check #2: Network Tab**
```
Open DevTools → Network tab
Select project
Look for: GET /material-requests?project_name=...
Click it → Response tab → Should show materials_requested array
```

If returns empty `[]`:
- ❌ No MRN record in database for this project
- ✅ Solution: Create MRN for test project first

**Check #3: API Response Structure**
Should look like:
```json
{
  "requests": [
    {
      "id": 123,
      "request_number": "MRN-001",
      "materials_requested": [
        {
          "id": 1,
          "material_name": "Cotton Fabric",
          "quantity_required": 100,
          "uom": "meters",
          "color": "Blue"
        }
      ]
    }
  ]
}
```

If different structure:
- ✅ Update fallback chains in line 795-809

---

### **Issue: Old Data Still Showing**

**Solution:**
1. Open DevTools
2. Application tab → Clear all site data
3. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Try again

---

### **Issue: Form Won't Submit**

**Check #1: Materials Required**
- Materials step requires at least 1 material
- If no MRN: Use "Add Material" button to manually add one

**Check #2: Validation Errors**
```javascript
// In console:
console.log(methods.formState.errors);
// Shows which fields have validation issues
```

---

## ✅ Complete Verification Checklist

### **Pre-Conditions:**
- [ ] At least 1 sales order in database
- [ ] At least 1 Material Request (MRN) linked to a sales order
- [ ] MRN has materials in `materials_requested` field

### **Test Cases:**

**TC-1: Fresh Load**
- [ ] Page loads
- [ ] Step 4 shows warning, no empty fields
- [ ] No placeholder data

**TC-2: Project Selection**
- [ ] Select project
- [ ] Project details load (check console)
- [ ] Step 2 auto-fills with product info
- [ ] Step 4 shows materials

**TC-3: Material Display**
- [ ] Each material has 5+ fields
- [ ] Some fields disabled (from MRN)
- [ ] Some fields editable (Qty, Status)
- [ ] Color/GSM/Width show if present

**TC-4: Project Change**
- [ ] Change project selection
- [ ] Old data cleared
- [ ] New project data loaded
- [ ] Old materials gone

**TC-5: No Materials Edge Case**
- [ ] Select project with no MRN
- [ ] Step 4 shows yellow warning
- [ ] Can manually add materials

**TC-6: Form Submission**
- [ ] Fill all steps correctly
- [ ] Submit form
- [ ] Production order created
- [ ] Success message shows

---

## 📊 Expected Output in Console

After selecting a project, you should see:

```
📋 Fetching sales order details for ID: 123
✅ Sales order loaded: Object
✅ Purchase order linked: Object
✅ MRN loaded with 3 requested materials
📦 Loading 3 material(s) from MRN request
✅ Loaded 3 materials from MRN SO-123!
Project details loaded successfully!
```

---

## 🎯 Success Criteria

All of these should be TRUE:

- [ ] ✅ No placeholder data before project selection
- [ ] ✅ Materials fetch automatically when project selected
- [ ] ✅ MRN-sourced fields are disabled (gray background)
- [ ] ✅ Only Qty and Status remain editable
- [ ] ✅ Changing project clears old data
- [ ] ✅ Different projects show different materials
- [ ] ✅ Can manually add materials if none exist
- [ ] ✅ Form submission works with loaded materials
- [ ] ✅ Production order created with correct data

---

## 📝 If Tests Fail

### **Scenario 1: Materials not showing**
1. Check if MRN exists: `SELECT * FROM material_requests WHERE project_name LIKE '%SO-{id}%';`
2. If empty: Create MRN manually for test project
3. Retest

### **Scenario 2: Old data persists**
1. Clear browser cache
2. Hard refresh page
3. Check if form reset logic triggered (console log)
4. Retest

### **Scenario 3: Form won't submit**
1. Check validation errors: `console.log(methods.formState.errors)`
2. Ensure all required fields filled
3. Ensure at least 1 material added
4. Retest

---

## 🚀 Ready to Deploy?

✅ YES if ALL test cases pass
✅ YES if console shows all expected messages
✅ YES if data flows correctly through all 8 steps

❌ NOT READY if ANY test case fails
❌ NOT READY if materials don't load from MRN
❌ NOT READY if validation errors appear

---

**Time Estimate:** ~5 minutes to verify all fixes
**Difficulty:** Easy - Just follow the checklist
**Tools Needed:** Browser, DevTools, 1 test project with MRN