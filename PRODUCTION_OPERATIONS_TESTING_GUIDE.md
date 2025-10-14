# Production Operations View - Testing Guide

## 🧪 Complete Testing Checklist

### Pre-Test Setup

#### 1. Ensure Test Data Exists
```sql
-- Check you have at least one production order
SELECT id, production_number, status FROM production_orders LIMIT 5;

-- Check production stages exist
SELECT id, production_order_id, stage_name, status FROM production_stages LIMIT 10;

-- Check vendors exist (for outsourcing tests)
SELECT id, company_name, name FROM vendors WHERE status = 'active' LIMIT 5;

-- Check material allocations exist (for reconciliation tests)
SELECT id, production_order_id, inventory_id, quantity_allocated 
FROM material_allocations LIMIT 5;
```

#### 2. User Permissions
Ensure your test user has:
- ✅ Department: `manufacturing` or `admin`
- ✅ Role: Manufacturing Manager / Production Supervisor
- ✅ Permissions: `manufacturing:view`, `manufacturing:edit`

---

## 📝 Test Cases

### Test Suite 1: Basic Stage Management

#### TC1.1: View Production Operations
**Steps:**
1. Login as manufacturing user
2. Navigate to Manufacturing Dashboard
3. Click "Production Tracking" tab
4. Locate any production order with status "in_progress" or "pending"
5. Click eye icon (👁️) in Actions column

**Expected:**
- ✅ Operations view page loads
- ✅ Production order number shown in header
- ✅ Product name and quantity displayed
- ✅ Overall progress bar visible
- ✅ Left sidebar shows all stages
- ✅ Stages are color-coded by status
- ✅ First active stage is auto-selected
- ✅ Stage details shown on right panel

**Status**: [ ] Pass [ ] Fail

---

#### TC1.2: Start a Stage
**Precondition:** Stage status is "pending"

**Steps:**
1. Select a pending stage from sidebar
2. Verify "Start Stage" button is visible
3. Click "Start Stage"

**Expected:**
- ✅ Success toast message appears
- ✅ Stage status changes to "in_progress"
- ✅ Stage badge turns blue
- ✅ Start time is automatically recorded
- ✅ "Pause" and "Complete" buttons now visible

**Status**: [ ] Pass [ ] Fail

---

#### TC1.3: Edit Stage Dates
**Steps:**
1. Select any stage
2. Click "Edit" button (top right)
3. Modify start date to yesterday's date
4. Modify start time to "09:00"
5. Modify end date to today's date
6. Modify end time to "17:00"
7. Click "Save Changes"

**Expected:**
- ✅ All fields become editable
- ✅ Date/time pickers are functional
- ✅ Duration auto-calculates (should show "1 day 8h" or "32h")
- ✅ Save button is enabled
- ✅ Success message appears after save
- ✅ Edit mode exits
- ✅ Fields show updated values

**Status**: [ ] Pass [ ] Fail

---

#### TC1.4: Add Notes to Stage
**Steps:**
1. Click "Edit" button
2. Scroll to "Notes" section
3. Add text: "Test note - Quality checked and approved"
4. Click "Save Changes"
5. Exit edit mode
6. Re-enter edit mode to verify

**Expected:**
- ✅ Notes field is editable
- ✅ Text is saved correctly
- ✅ Notes persist after save
- ✅ Notes are visible in view mode

**Status**: [ ] Pass [ ] Fail

---

#### TC1.5: Pause and Resume Stage
**Precondition:** Stage is "in_progress"

**Steps:**
1. Click "Pause" button
2. Verify status change
3. Click "Resume Stage" (previously "Start Stage")

**Expected:**
- ✅ Stage changes to "on_hold"
- ✅ Badge turns orange
- ✅ "Resume" button appears
- ✅ After resume, status returns to "in_progress"

**Status**: [ ] Pass [ ] Fail

---

#### TC1.6: Complete a Stage
**Precondition:** Stage is "in_progress"

**Steps:**
1. Ensure stage has start date/time
2. Click "Complete Stage" button
3. Confirm in popup (if any)

**Expected:**
- ✅ Stage status changes to "completed"
- ✅ Badge turns green
- ✅ End time automatically recorded
- ✅ Progress bar increases
- ✅ Next stage becomes active

**Status**: [ ] Pass [ ] Fail

---

#### TC1.7: Navigate Between Stages
**Steps:**
1. Click "Next Stage" button
2. Verify stage changes
3. Click "Previous Stage" button
4. Verify return to previous stage
5. Click different stage in sidebar

**Expected:**
- ✅ Next button navigates forward (if not last stage)
- ✅ Previous button navigates back (if not first stage)
- ✅ Buttons are disabled at boundaries
- ✅ Sidebar click works immediately
- ✅ Selected stage highlighted in red

**Status**: [ ] Pass [ ] Fail

---

### Test Suite 2: Outsourcing Flow

#### TC2.1: Identify Outsourcing Stages
**Steps:**
1. Navigate through all stages
2. Look for "Outsourcing Options" section

**Expected:**
- ✅ Section appears for: embroidery, printing, screen_printing, washing stages
- ✅ Section does NOT appear for: cutting, stitching, finishing, packaging
- ✅ Work type selector is visible
- ✅ Two buttons: "In-House" and "Outsourced"

**Status**: [ ] Pass [ ] Fail

---

#### TC2.2: Select Work Type
**Steps:**
1. Navigate to embroidery stage
2. Click "In-House" button
3. Verify selection
4. Click "Outsourced" button
5. Verify selection

**Expected:**
- ✅ In-House button: Green border when selected
- ✅ Outsourced button: Purple border when selected
- ✅ Toast message appears on selection
- ✅ Challan buttons appear when "Outsourced" selected

**Status**: [ ] Pass [ ] Fail

---

#### TC2.3: Create Outward Challan
**Precondition:** 
- Work type is "Outsourced"
- At least one active vendor exists

**Steps:**
1. Click "Create Outward Challan" button
2. Dialog opens
3. Fill in form:
   - Vendor: Select from dropdown
   - Quantity: 100
   - Expected Return Date: 7 days from now
   - Transport Mode: "Truck"
   - Vehicle Number: "MH01AB1234"
   - Notes: "Handle with care - delicate embroidery"
4. Click "Create Outward Challan"

**Expected:**
- ✅ Dialog opens with empty form
- ✅ Vendor dropdown is populated
- ✅ Quantity defaults to production order quantity
- ✅ All fields are editable
- ✅ Validation works (required fields)
- ✅ Success message after submission
- ✅ Dialog closes
- ✅ Challan appears in list below
- ✅ Challan shows: Number, Type (Outward), Status (Pending)

**Backend Verification:**
```sql
-- Check challan was created
SELECT * FROM challans WHERE type = 'outward' AND sub_type = 'outsourcing' 
ORDER BY created_at DESC LIMIT 1;
```

**Status**: [ ] Pass [ ] Fail

---

#### TC2.4: Create Inward Challan
**Precondition:** 
- Outward challan exists with status "pending"

**Steps:**
1. Click "Create Inward Challan" button
2. Dialog opens
3. Fill in form:
   - Outward Challan: Select from dropdown
   - Received Quantity: 95
   - Quality Notes: "Good quality work, meets standards"
   - Discrepancies: "5 pieces damaged during transport"
4. Click "Create Inward Challan"

**Expected:**
- ✅ Dialog opens
- ✅ Outward challan dropdown populated
- ✅ Shows challan number and vendor name
- ✅ All fields editable
- ✅ Success message after submission
- ✅ Dialog closes
- ✅ New challan appears in list (Type: Inward, Status: Completed)
- ✅ Outward challan status changes to "Completed"
- ✅ Stage quantity_processed updated to 95

**Backend Verification:**
```sql
-- Check inward challan created
SELECT * FROM challans WHERE type = 'inward' AND sub_type = 'outsourcing' 
ORDER BY created_at DESC LIMIT 1;

-- Verify outward challan status updated
SELECT status FROM challans WHERE id = <outward_challan_id>;

-- Check stage quantities updated
SELECT quantity_processed FROM production_stages WHERE id = <stage_id>;
```

**Status**: [ ] Pass [ ] Fail

---

#### TC2.5: View Challan List
**Steps:**
1. After creating challans, scroll to "Challans" section
2. Verify list displays

**Expected:**
- ✅ All challans for this stage are listed
- ✅ Shows challan number
- ✅ Shows type (Outward/Inward)
- ✅ Shows status (Pending/Completed)
- ✅ Most recent at top
- ✅ File icon visible

**Status**: [ ] Pass [ ] Fail

---

### Test Suite 3: Material Reconciliation

#### TC3.1: Identify Final Stage
**Steps:**
1. Navigate to last stage in the list
2. Verify it's marked as final stage

**Expected:**
- ✅ Material reconciliation section appears
- ✅ Section has amber/yellow background
- ✅ Warning text: "This is the final stage"
- ✅ "Open Material Reconciliation" button visible
- ✅ Section ONLY appears in last stage

**Status**: [ ] Pass [ ] Fail

---

#### TC3.2: Open Material Reconciliation Dialog
**Precondition:**
- In final stage
- Stage status is "in_progress"
- Material allocations exist for this production order

**Steps:**
1. Click "Open Material Reconciliation" button
2. Wait for dialog to load

**Expected:**
- ✅ Modal dialog opens
- ✅ Title: "Material Reconciliation"
- ✅ Subtitle explains the purpose
- ✅ Table displays with columns:
  - Material
  - Allocated
  - Consumed
  - Wasted
  - Leftover
- ✅ All materials shown
- ✅ Allocated quantities are correct
- ✅ Consumed fields are editable (input boxes)
- ✅ Wasted fields are editable (input boxes)
- ✅ Leftover is calculated and read-only

**Status**: [ ] Pass [ ] Fail

---

#### TC3.3: Calculate Material Leftovers
**Steps:**
1. In reconciliation dialog, locate first material
2. Note allocated quantity (e.g., 100)
3. Edit consumed: 85
4. Edit wasted: 5
5. Observe leftover calculation

**Expected:**
- ✅ Leftover auto-calculates immediately
- ✅ Formula: Leftover = Allocated - Consumed - Wasted
- ✅ In example: 100 - 85 - 5 = 10
- ✅ Leftover shows in green if > 0
- ✅ Leftover shows in gray if = 0
- ✅ Negative values handled gracefully

**Status**: [ ] Pass [ ] Fail

---

#### TC3.4: Update Multiple Materials
**Steps:**
1. Update all materials in the list:
   - Material 1: Consumed 85, Wasted 5, Leftover 10
   - Material 2: Consumed 47, Wasted 3, Leftover 0
   - Material 3: Consumed 980, Wasted 20, Leftover 0

**Expected:**
- ✅ All fields update independently
- ✅ Each leftover calculates correctly
- ✅ No interference between rows
- ✅ Values persist while dialog open

**Status**: [ ] Pass [ ] Fail

---

#### TC3.5: Submit Material Reconciliation
**Steps:**
1. Verify all materials updated
2. Click "Complete Reconciliation" button
3. Wait for processing

**Expected:**
- ✅ Loading indicator appears (if any)
- ✅ Success message: "Material reconciliation completed! Leftover materials returned to inventory."
- ✅ Dialog closes
- ✅ Can't reopen reconciliation (or shows as completed)

**Backend Verification:**
```sql
-- Check material allocations updated
SELECT 
  id,
  inventory_id,
  quantity_allocated,
  quantity_consumed,
  quantity_wasted,
  quantity_returned,
  status
FROM material_allocations 
WHERE production_order_id = <order_id>;

-- Check inventory quantities increased
SELECT id, item_name, quantity FROM inventory 
WHERE id IN (SELECT inventory_id FROM material_allocations WHERE production_order_id = <order_id>);

-- Check inventory movements created
SELECT * FROM inventory_movements 
WHERE reference_type = 'production_order' 
AND reference_id = <order_id> 
AND movement_type = 'return'
ORDER BY created_at DESC;
```

**Expected Data:**
- ✅ `material_allocations.quantity_consumed` = actual consumed
- ✅ `material_allocations.quantity_wasted` = actual wasted
- ✅ `material_allocations.quantity_returned` = leftover
- ✅ `material_allocations.status` = 'consumed' or 'partially_returned'
- ✅ `inventory.quantity` increased by leftover amount
- ✅ `inventory_movements` records exist for each leftover

**Status**: [ ] Pass [ ] Fail

---

#### TC3.6: Verify Inventory Updated
**Manual Check:**
1. Navigate to Inventory Dashboard
2. Search for materials that had leftovers
3. Check current quantity

**Expected:**
- ✅ Quantity increased by leftover amount
- ✅ Inventory movement history shows "Return from Production"
- ✅ Movement has production order reference
- ✅ Movement timestamp is recent

**Status**: [ ] Pass [ ] Fail

---

### Test Suite 4: Edge Cases & Error Handling

#### TC4.1: No Vendors Available
**Precondition:** No active vendors in system

**Steps:**
1. Navigate to outsourcing stage
2. Select "Outsourced"
3. Click "Create Outward Challan"
4. Check vendor dropdown

**Expected:**
- ✅ Dropdown shows "Select Vendor" placeholder
- ✅ No vendors in list
- ✅ Can't submit without vendor
- ✅ Validation error if attempted

**Status**: [ ] Pass [ ] Fail

---

#### TC4.2: No Outward Challan for Inward
**Steps:**
1. Click "Create Inward Challan"
2. Check dropdown

**Expected:**
- ✅ Dropdown shows "Select Outward Challan"
- ✅ If no pending outward challans, dropdown is empty
- ✅ Can't submit without selection
- ✅ Validation error if attempted

**Status**: [ ] Pass [ ] Fail

---

#### TC4.3: No Material Allocations
**Precondition:** Production order has no material allocations

**Steps:**
1. Navigate to final stage
2. Click "Open Material Reconciliation"

**Expected:**
- ✅ Dialog opens
- ✅ Table shows empty or message: "No materials allocated"
- ✅ Can close dialog
- ✅ No errors in console

**Status**: [ ] Pass [ ] Fail

---

#### TC4.4: Network Error Handling
**Steps:**
1. Open browser DevTools
2. Go to Network tab
3. Throttle to "Offline"
4. Try any action (start stage, create challan, etc.)

**Expected:**
- ✅ Error toast message appears
- ✅ User-friendly error message
- ✅ Page doesn't crash
- ✅ Can retry after connection restored

**Status**: [ ] Pass [ ] Fail

---

#### TC4.5: Permission Denied
**Steps:**
1. Login as user without manufacturing permissions
2. Try to access operations view

**Expected:**
- ✅ Access denied message or redirect
- ✅ No data leakage
- ✅ Clear error message

**Status**: [ ] Pass [ ] Fail

---

### Test Suite 5: UI/UX Testing

#### TC5.1: Responsive Design
**Steps:**
1. Resize browser window to different widths:
   - Desktop: 1920px
   - Laptop: 1366px
   - Tablet: 768px

**Expected:**
- ✅ Layout adjusts gracefully
- ✅ No horizontal scroll
- ✅ Buttons remain accessible
- ✅ Text is readable
- ✅ Dialogs fit screen

**Status**: [ ] Pass [ ] Fail

---

#### TC5.2: Color Contrast & Accessibility
**Steps:**
1. Check all stage status badges
2. Check button colors
3. Check text on colored backgrounds

**Expected:**
- ✅ Text is clearly readable
- ✅ Sufficient contrast ratio (WCAG AA)
- ✅ Icons are visible
- ✅ No color-only information

**Status**: [ ] Pass [ ] Fail

---

#### TC5.3: Loading States
**Steps:**
1. Monitor loading states during:
   - Initial page load
   - Stage switching
   - Dialog opening
   - Form submission

**Expected:**
- ✅ Loading spinner or skeleton shown
- ✅ Buttons disabled during processing
- ✅ No double-submission possible
- ✅ Clear visual feedback

**Status**: [ ] Pass [ ] Fail

---

#### TC5.4: Toast Messages
**Steps:**
1. Trigger various actions
2. Observe toast messages

**Expected:**
- ✅ Success messages are green/positive
- ✅ Error messages are red/negative
- ✅ Messages auto-dismiss after 3-5 seconds
- ✅ Messages are clear and actionable

**Status**: [ ] Pass [ ] Fail

---

## 📊 Test Summary

### Test Results
- **Total Test Cases**: 29
- **Passed**: ___ / 29
- **Failed**: ___ / 29
- **Skipped**: ___ / 29

### Critical Issues Found
1. 
2. 
3. 

### Minor Issues Found
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 

---

## 🔍 Browser Compatibility

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if available)

### Browser-Specific Issues
| Browser | Issue | Severity |
|---------|-------|----------|
|         |       |          |

---

## 🚀 Performance Testing

### Load Time Benchmarks
- [ ] Initial page load: < 2 seconds
- [ ] Stage switch: < 500ms
- [ ] Dialog open: < 300ms
- [ ] Form submission: < 1 second

### Measured Times
| Action | Time | Status |
|--------|------|--------|
| Page load | | |
| Stage switch | | |
| Create challan | | |
| Reconciliation | | |

---

## 📝 Test Environment

**Date**: ________________
**Tester**: ________________
**Environment**: Development / Staging / Production
**Database**: ________________
**Server**: ________________
**Browser**: ________________ (Version: ______)
**Screen Resolution**: ________________

---

## ✅ Sign-Off

**Tested By**: ________________
**Date**: ________________
**Status**: Pass / Fail / Conditional Pass
**Comments**: 
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Approved By**: ________________
**Date**: ________________

---

**Testing Guide Version**: 1.0.0
**Last Updated**: January 31, 2025