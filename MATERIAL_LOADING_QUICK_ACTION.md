# 🚀 Material Loading - Quick Action Guide (5 Minutes)

## Do This Now

### Step 1: Start the App
```powershell
npm start
```

### Step 2: Open Browser Console
- Press **F12**
- Click **Console** tab
- Keep it open while testing

### Step 3: Test Material Loading

**Test Case A - With MRN:**
1. Go to `/manufacturing/wizard`
2. Step 1: Select a project/sales order
3. **Watch Console** - Should see:
   ```
   🔍 Searching for MRN with project_name: "SO-XXXXX"
   ✅ MRN Found: PMR-XXXXX
   📦 Loading X material(s) from MRN request
   ✅ Successfully loaded X materials
   ```
4. Step 4: Check if materials appear

**Test Case B - Look for Errors:**

If you see any of these:
```
⚠️ No MRN found for project_name
```
→ **MRN doesn't exist** - You need to create one

```
⚠️ MRN has no materials_requested field
```
→ **MRN empty** - Add materials to it

```
Failed to parse materials_requested: SyntaxError
```
→ **Database error** - Contact admin

---

## What Success Looks Like

✅ **Console Output:**
```
🔍 Searching for MRN with project_name: "SO-12345"
📨 MRN API Response: {requests: Array(1), ...}
✅ MRN Found: PMR-20250315-00001 ID: 42
📦 MRN materials_requested field contains 3 items
Materials structure: Array(3) [ {...}, {...}, {...} ]
✅ MRN Flow: 3 requested + 0 received = 3 to display
📦 Loading 3 material(s) from MRN request
Material 0: {material_name: "Cotton Fabric", ...}
Material 1: {material_name: "Thread", ...}
Material 2: {material_name: "Buttons", ...}
✅ Successfully loaded 3 materials
✅ Loaded 3 materials from MRN PMR-20250315-00001!
✅ Project details loaded successfully!
```

✅ **UI Display:**
- Step 4 shows: **"📦 Materials loaded from MRN"** (blue box)
- Shows count: **"3 material(s) fetched..."**
- Each material card shows:
  - Material ID/Code
  - Description
  - Required Quantity
  - Unit
  - Status
  - Other details (color, GSM, width if present)

---

## Common Issues & Quick Fixes

### Issue 1: "⚠️ No MRN found"

**Check 1: Does MRN exist?**
```sql
SELECT COUNT(*) FROM project_material_requests 
WHERE project_name LIKE '%SO-12345%';
```

**If count = 0:**
- MRN doesn't exist yet
- Create one by requesting materials
- Go to Procurement → Create MRN for this project

**If count > 0:**
- MRN exists but project_name doesn't match
- Check console log for exact project_name being searched
- Verify it matches the sales order project_name

---

### Issue 2: "⚠️ MRN has no materials_requested field"

**Check:**
```sql
SELECT materials_requested FROM project_material_requests WHERE id = 42;
```

**If NULL or empty:**
- Re-create the MRN with materials
- Or add materials using this SQL:

```sql
UPDATE project_material_requests
SET materials_requested = JSON_ARRAY(
  JSON_OBJECT('material_name', 'Cotton Fabric', 'quantity_required', 10, 'uom', 'meters'),
  JSON_OBJECT('material_name', 'Thread', 'quantity_required', 5, 'uom', 'spools')
)
WHERE id = 42;
```

---

### Issue 3: Materials Show in Console But Not in UI

**Likely Cause:** Form state issue

**Try:**
1. Refresh browser (F5)
2. Select project again
3. Check Step 4 again
4. If still not showing, check browser console for React errors

---

### Issue 4: Parse Error / Corrupted JSON

```
Failed to parse materials_requested: SyntaxError: ...
Raw materials_requested: "some corrupted text"
```

**Solution:**
1. Note the MRN ID from console
2. Contact database admin to fix materials_requested JSON
3. Or delete and recreate the MRN

---

## Quickest Verification

**Just need to confirm it works?**

```powershell
# 1. Start app
npm start

# 2. In browser, go to: http://localhost:3000/manufacturing/wizard

# 3. Console shows ✅? 
#    → WORKING ✅

# 3. Console shows ⚠️?
#    → Use troubleshooting above
```

---

## That's It!

The code is now updated with **comprehensive logging**. 

Use the console to **see exactly what's happening** and apply the fix from the issues section above.

**Any questions?** Check the detailed guide: `PRODUCTION_WIZARD_MATERIAL_LOADING_FIX.md`