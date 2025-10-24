# Manufacturing Dashboard - Quick 5-Minute Test Guide

## ⏱️ 5-Minute Test (Complete)

### Prerequisites (Already Done)
- ✅ Sales Order created
- ✅ Production Request created
- ✅ Material Request (MRN) created
- ✅ Material Dispatch created (status: pending)

---

## Test 1: Receive Materials (2 minutes)

**What to Do**:
1. Open Manufacturing Dashboard
2. Click "Material Flow" tab
3. Look for RED card: "Dispatches Awaiting Receipt"
4. Should show count ≥ 1
5. Click "Receive Materials" button

**Expected Result**:
- ✅ Modal opens with title "Receive Material"
- ✅ Shows Dispatch # (e.g., "DSP-20250115-00001")
- ✅ Shows Items count (e.g., "5")
- ✅ Has a text field for notes
- ✅ Has "Confirm Receipt" and "Cancel" buttons

**Confirm Action**:
1. (Optional) Add a note: "Materials received in good condition"
2. Click "✓ Confirm Receipt" button
3. Wait for processing...

**Verify Success**:
- ✅ Toast appears: "✅ Material received successfully"
- ✅ Modal closes
- ✅ RED card count decreases by 1
- ✅ YELLOW card count increases by 1

---

## Test 2: Verify Materials (2 minutes)

**What to Do**:
1. Still on "Material Flow" tab
2. Look for YELLOW card: "Receipts Awaiting Verification"
3. Should now show count ≥ 1 (increased from previous test)
4. Click "Verify Receipts" button

**Expected Result**:
- ✅ Modal opens with title "Verify Material"
- ✅ Shows Receipt # (e.g., "MRN-RCV-20250115-00001")
- ✅ Shows Items count (e.g., "5")
- ✅ Has a text field for notes
- ✅ Has "Confirm Verification" and "Cancel" buttons

**Confirm Action**:
1. (Optional) Add a note: "All materials verified and in good condition"
2. Click "✓ Confirm Verification" button
3. Wait for processing...

**Verify Success**:
- ✅ Toast appears: "✅ Material verified successfully"
- ✅ Modal closes
- ✅ YELLOW card count decreases by 1
- ✅ GREEN card count increases by 1

---

## Test 3: Approve Production (1 minute)

**What to Do**:
1. Still on "Material Flow" tab
2. Look for GREEN card: "Verifications Awaiting Approval"
3. Should now show count ≥ 1 (increased from previous test)
4. Click "Approve Production" button

**Expected Result**:
- ✅ Modal opens with title "Approve Production"
- ✅ Shows Verification # (e.g., "MRN-VRF-20250115-00001")
- ✅ Shows Result: "PASSED" (in green)
- ✅ Has a text field for notes
- ✅ Has "Approve Production" and "Cancel" buttons

**Confirm Action**:
1. (Optional) Add a note: "Production approved - materials ready"
2. Click "✓ Approve Production" button
3. Wait for processing...

**Verify Success**:
- ✅ Toast appears: "✅ Production approved successfully - Ready to start!"
- ✅ Modal closes
- ✅ GREEN card count decreases by 1
- ✅ All Material Flow cards now show "No items pending" or have count 0

---

## Test Results Summary

### If All Tests Pass ✅

| Test | Status | Evidence |
|------|--------|----------|
| Receive Materials | ✅ PASS | Toast message, count updated |
| Verify Materials | ✅ PASS | Toast message, count updated |
| Approve Production | ✅ PASS | Toast message, production ready |
| **TOTAL** | ✅ **ALL PASS** | Workflow working end-to-end |

### If Tests Fail ❌

**Check These**:

1. **Modal doesn't open**:
   - Press F12 to open DevTools
   - Go to Console tab
   - Look for any red error messages
   - Screenshot and report error

2. **Button doesn't respond**:
   - Check if button is disabled (grayed out)
   - Try refreshing page (F5)
   - Try different browser

3. **API Error message**:
   - Note the exact error message
   - Check backend server is running
   - Check database connection
   - Report error with screenshot

4. **Toast doesn't appear**:
   - Check volume settings not muted
   - Check browser notifications enabled
   - Toast should appear on right side of screen

---

## Database Verification (Advanced)

After all tests pass, verify data was created:

### Check Material Receipt Created:
```sql
SELECT * FROM material_receipts ORDER BY created_at DESC LIMIT 1;
```
Should return:
- receipt_number: MRN-RCV-{date}-{sequence}
- status: pending_verification OR verified
- dispatch_id: (not null)

### Check Material Verification Created:
```sql
SELECT * FROM material_verifications ORDER BY created_at DESC LIMIT 1;
```
Should return:
- verification_number: MRN-VRF-{date}-{sequence}
- overall_result: passed
- receipt_id: (not null)

### Check Production Approval Created:
```sql
SELECT * FROM production_approvals ORDER BY created_at DESC LIMIT 1;
```
Should return:
- approval_status: approved
- production_can_start: true
- verification_id: (not null)

---

## Browser DevTools Check

While running tests, keep DevTools open:

**Console Tab** (F12 → Console):
- Should show green messages: ✅ "Material received successfully"
- No red error messages
- No yellow warnings

**Network Tab** (F12 → Network):
- Should see POST requests to:
  - `/material-receipt/create` (Status: 200 or 201)
  - `/material-verification/create` (Status: 200 or 201)
  - `/production-approvals/create` (Status: 200 or 201)

**Elements Tab** (F12 → Elements):
- Modal should be visible when buttons clicked
- No layout issues
- Proper styling applied

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Button grayed out | Refresh page or no data available |
| Modal doesn't open | Check console for errors, try different browser |
| Toast doesn't show | Try refreshing page, check browser volume |
| API 404 error | Backend endpoint missing, restart server |
| API 500 error | Database error, check backend logs |
| Count doesn't update | Refresh page or wait for data to load |
| Empty card shows | No pending items in that category |

---

## Success Confirmation Checklist

After all 3 tests, confirm:

- [ ] Test 1: Receive Materials works
- [ ] Test 2: Verify Materials works
- [ ] Test 3: Approve Production works
- [ ] All toasts appear
- [ ] All counts update
- [ ] No console errors
- [ ] Modals open/close properly
- [ ] Notes field accepts input
- [ ] Cancel buttons work
- [ ] Dashboard doesn't break

**If ALL ✅ checked**: Manufacturing Dashboard is working perfectly! 🎉

---

## Report Issues

If any test fails, report:

1. **Test number** (1, 2, or 3)
2. **Step where it fails**
3. **Expected vs. actual behavior**
4. **Error message** (if any)
5. **Screenshot** (if possible)
6. **Browser & version**
7. **Console errors** (F12)

---

## Next Steps After Testing

✅ **If All Tests Pass**:
1. Test on different browsers (Chrome, Firefox, Safari)
2. Test on mobile devices
3. Deploy to production
4. Monitor error logs

❌ **If Tests Fail**:
1. Check console errors (F12)
2. Check backend logs
3. Verify database connection
4. Report issues with details

---

**⏱️ Total Time: 5 minutes**
**✅ Test Coverage: Complete workflow**
**🚀 Next Step: Deploy to production**
