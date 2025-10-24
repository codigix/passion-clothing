# Outsource Management Page - Verification & Testing Guide

**Date**: January 2025
**Component**: OutsourceManagementPage.jsx
**Route**: `/manufacturing/outsource`
**Status**: Ready for Testing

## Quick Start Verification

### Step 1: Navigate to the Page
1. Open your browser
2. Login to the application
3. Navigate to: **Manufacturing → Outsource Management**
4. Or directly visit: `http://localhost:3000/manufacturing/outsource`

### Step 2: Expected Page Layout
You should see:

```
┌─────────────────────────────────────────────────────────────┐
│ [Back] Outsource Management                    [Refresh] [+Create] │
├─────────────────────────────────────────────────────────────┤
│                    STATS CARDS (6)                          │
│ [Active] [Completed] [Delayed] [Vendors] [Quality] [On-Time] │
├─────────────────────────────────────────────────────────────┤
│  Search Box              | Filter Dropdown                  │
├─────────────────────────────────────────────────────────────┤
│  [Orders] [Vendors] [Quality] [Analytics] Tabs              │
├─────────────────────────────────────────────────────────────┤
│                    TAB CONTENT                              │
│                                                              │
│  Active Outsources Section                                  │
│  ├─ Order Card 1 (Expandable)                              │
│  ├─ Order Card 2 (Expandable)                              │
│                                                              │
│  Completed Outsources Section                              │
│  └─ Order Card 3 (Expandable)                              │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Verification Checklist

### A. Header & Navigation ✓
- [ ] Back button works and returns to Manufacturing dashboard
- [ ] Page title displays "Outsource Management"
- [ ] Subtitle shows "Complete outsourcing management dashboard"
- [ ] Refresh button exists and reloads data
- [ ] "+ Create Outsource" button is visible and clickable

### B. Statistics Cards (6 KPIs) ✓
Check all six cards are displayed with correct data:

1. **Active Orders**
   - [ ] Icon: Truck (blue)
   - [ ] Shows count of in-progress outsources
   - [ ] Subtitle: "In progress"

2. **Completed**
   - [ ] Icon: CheckCircle (green)
   - [ ] Shows count of completed outsources
   - [ ] Subtitle: "Done"

3. **Delayed**
   - [ ] Icon: AlertCircle (orange)
   - [ ] Shows count of overdue outsources
   - [ ] Subtitle: "Overdue"

4. **Total Vendors**
   - [ ] Icon: Building (purple)
   - [ ] Shows total vendor count
   - [ ] Subtitle: "Partnerships"

5. **Quality Score**
   - [ ] Icon: TrendingUp (amber)
   - [ ] Shows rating like "4.5/5"
   - [ ] Subtitle: "Average"

6. **On-Time %**
   - [ ] Icon: Calendar (indigo)
   - [ ] Shows percentage like "92%"
   - [ ] Subtitle: "Delivery"

### C. Search & Filter Bar ✓
- [ ] Search input field has placeholder text
- [ ] Search icon visible
- [ ] Filter dropdown with options:
  - [ ] "All Outsources"
  - [ ] "Full Outsource"
  - [ ] "Partial Outsource"
- [ ] Typing in search filters orders in real-time
- [ ] Selecting filter option works correctly

### D. Tab Navigation ✓
Four tabs should be visible:
1. **Orders Tab**
   - [ ] Shows order count in badge
   - [ ] Active by default
   - [ ] Displays "Active Outsources" and "Completed Outsources" sections

2. **Vendors Tab**
   - [ ] Shows vendor count in badge
   - [ ] Displays vendor directory grid

3. **Quality Tab**
   - [ ] Shows three quality metric cards
   - [ ] No count badge (shows "−")

4. **Analytics Tab**
   - [ ] Shows placeholder for future analytics
   - [ ] No count badge (shows "−")

### E. Orders Tab - Active/Completed Sections ✓

#### If you have outsourced orders:

**Active Outsources Section**
- [ ] Section header displays "Active Outsources"
- [ ] Each order shows:
  - [ ] Order number (e.g., "SO-2024-001")
  - [ ] Full/Partial badge (purple for full, orange for partial)
  - [ ] Product name and quantity
  - [ ] Count of active outsources (top right)
  - [ ] Expandable chevron icon

**Expandable Order Card Details**
- [ ] Click order to expand (chevron changes direction)
- [ ] Shows grid with:
  - [ ] Production Order
  - [ ] Status badge
  - [ ] Delivery Date
  - [ ] Total Outsource Cost
- [ ] Shows "Outsourced Stages" section with:
  - [ ] Stage name
  - [ ] Vendor name
  - [ ] Stage status badge
  - [ ] Stage cost
- [ ] Action buttons:
  - [ ] "View Details" button (blue)
  - [ ] "Track Outsource" button (green)
- [ ] Click again to collapse

**Completed Outsources Section**
- [ ] Similar layout to Active section
- [ ] Shows completed orders

#### If no orders exist:
- [ ] Empty state displays:
  - [ ] Package icon
  - [ ] "No outsource orders found" message
  - [ ] "Create your first outsource request to get started" suggestion

### F. Vendors Tab ✓

**Vendor Directory View**
- [ ] Shows grid of vendor cards (1, 2, or 3 columns depending on screen size)
- [ ] Each vendor card shows:
  - [ ] Vendor initial in colored circle
  - [ ] Vendor name
  - [ ] Status badge (ACTIVE, INACTIVE, etc.)
  - [ ] Phone number with icon
  - [ ] Email with icon
  - [ ] Location with icon
  - [ ] Grid showing:
    - [ ] Active Orders count
    - [ ] On-Time % percentage
  - [ ] "View Details" button (gray border)
  - [ ] "Create Order" button (blue)

**Buttons**
- [ ] "Manage Vendors" button in top right
- [ ] Clicking takes you to Vendor Management page

#### Empty state:
- [ ] Building icon
- [ ] "No vendors found" message
- [ ] "Add vendors to get started" suggestion

### G. Quality Tab ✓

Three quality metric cards should display:

1. **Average Quality Score**
   - [ ] Icon: CheckCircle (green)
   - [ ] Shows "4.5/5"
   - [ ] Subtitle: "Average Quality Score"
   - [ ] Explains: "Based on vendor ratings"

2. **Quality Issues**
   - [ ] Icon: AlertTriangle (yellow)
   - [ ] Shows "3"
   - [ ] Subtitle: "Quality Issues"
   - [ ] Explains: "This month"

3. **Acceptance Rate**
   - [ ] Icon: TrendingUp (blue)
   - [ ] Shows "92%"
   - [ ] Subtitle: "Acceptance Rate"
   - [ ] Explains: "On-time delivery"

### H. Analytics Tab ✓
- [ ] Shows placeholder message
- [ ] Icon: TrendingUp
- [ ] Text: "Performance analytics coming soon"
- [ ] Explains future functionality

### I. Create Outsource Dialog ✓

**Opening Dialog**
- [ ] Click "+ Create Outsource" button opens modal
- [ ] Modal has white background with rounded corners
- [ ] Title: "Create Outsource Request"
- [ ] Close button (X) in top right

**Step 1: Production Order Selection**
- [ ] Label: "Select Production Order *"
- [ ] Dropdown shows "Choose a production order..."
- [ ] Clicking shows list of available orders
- [ ] Each option shows: order_number - product_name (Qty)

**Step 2: Outsource Type** (After selecting order)
- [ ] Two radio buttons appear:
  - [ ] "Full Production Outsource"
  - [ ] "Partial (Specific Stages)"
- [ ] Full is selected by default

**Step 3: Stage Selection** (Only for Partial)
- [ ] Shows only when "Partial" is selected
- [ ] Displays all stages from selected order
- [ ] Each stage has checkbox
- [ ] Shows stage status in badge
- [ ] Can select/deselect multiple stages

**Step 4: Vendor Selection**
- [ ] Label: "Select Vendor *"
- [ ] Dropdown shows "Choose a vendor..."
- [ ] Lists all vendors

**Step 5: Expected Return Date**
- [ ] Label: "Expected Return Date *"
- [ ] Date input field with calendar picker

**Step 6: Transport Details**
- [ ] Label: "Transport / Carrier Details"
- [ ] Text input with placeholder: "e.g., XYZ Transport, AWB: 123456"
- [ ] Optional field

**Step 7: Estimated Cost**
- [ ] Label: "Estimated Cost"
- [ ] Number input field
- [ ] Optional field

**Step 8: Notes**
- [ ] Label: "Notes / Special Instructions"
- [ ] Textarea with rows
- [ ] Placeholder: "Add any special requirements or notes..."
- [ ] Optional field

**Action Buttons**
- [ ] "Cancel" button (gray, left)
- [ ] "Create Outsource" button (blue, right)
- [ ] Create button is disabled until:
  - [ ] Production order selected
  - [ ] Vendor selected
  - [ ] Expected return date filled
  - [ ] (For partial: at least one stage selected)
- [ ] Create button shows "Creating..." with spinner while submitting

### J. Responsiveness ✓

**Mobile (xs - 640px)**
- [ ] Stats cards: 2 columns
- [ ] Tabs still visible
- [ ] Vendor cards: 1 column
- [ ] No horizontal scrolling

**Tablet (md - 768px)**
- [ ] Stats cards: 3-4 columns
- [ ] Vendor cards: 2 columns
- [ ] Search bar takes 2 lines if needed

**Desktop (lg - 1024px+)**
- [ ] Stats cards: 6 columns
- [ ] Vendor cards: 3 columns
- [ ] Full width utilization

## Functional Testing

### Test 1: Create Full Production Outsource
1. [ ] Click "+ Create Outsource"
2. [ ] Select a production order
3. [ ] Choose "Full Production Outsource" (default)
4. [ ] Select a vendor
5. [ ] Pick an expected return date (in future)
6. [ ] Add optional details (carrier, cost, notes)
7. [ ] Click "Create Outsource"
8. [ ] **Expected**: Success toast message, dialog closes, data refreshes

### Test 2: Create Partial Outsource
1. [ ] Click "+ Create Outsource"
2. [ ] Select a production order
3. [ ] Choose "Partial (Specific Stages)" radio
4. [ ] Click stages to select them
5. [ ] Select a vendor
6. [ ] Pick return date
7. [ ] Click "Create Outsource"
8. [ ] **Expected**: Only selected stages marked as outsourced

### Test 3: Search Functionality
1. [ ] Type an order number in search box
2. [ ] **Expected**: Orders filtered in real-time
3. [ ] Clear search
4. [ ] Type a product name
5. [ ] **Expected**: Matching orders displayed

### Test 4: Filter Functionality
1. [ ] Click filter dropdown
2. [ ] Select "Full Outsource"
3. [ ] **Expected**: Only full outsource orders shown
4. [ ] Select "Partial Outsource"
5. [ ] **Expected**: Only partial outsource orders shown
6. [ ] Select "All Outsources"
7. [ ] **Expected**: All orders shown

### Test 5: Tab Navigation
1. [ ] Click "Vendors" tab
2. [ ] **Expected**: Vendor grid displays
3. [ ] Click "Quality" tab
4. [ ] **Expected**: Quality metrics display
5. [ ] Click "Orders" tab
6. [ ] **Expected**: Orders display again

### Test 6: Expand/Collapse Orders
1. [ ] Click an order card
2. [ ] **Expected**: Card expands showing details
3. [ ] Click again
4. [ ] **Expected**: Card collapses

### Test 7: Navigation Actions
1. [ ] In expanded order, click "View Details"
2. [ ] **Expected**: Navigate to order details page
3. [ ] Go back to outsource page
4. [ ] Click "Track Outsource"
5. [ ] **Expected**: Navigate to operations view

### Test 8: Refresh Data
1. [ ] Click refresh button (circular arrow)
2. [ ] **Expected**: Data reloads, no errors in console

## Data Verification

### Database Checks
```sql
-- Check for outsourced stages
SELECT COUNT(*) as outsourced_count 
FROM production_stages 
WHERE outsourced = 1;

-- Check vendors
SELECT COUNT(*) as vendor_count 
FROM vendors 
WHERE status = 'active';

-- Check outsource costs
SELECT SUM(outsource_cost) as total_cost 
FROM production_stages 
WHERE outsourced = 1;
```

### Expected Values
- [ ] At least 1 production order with outsourced stages
- [ ] At least 1 active vendor
- [ ] Stats showing correct calculations

## Browser Console Checks

**Errors to look for** (should be none):
- [ ] No red error messages
- [ ] No "undefined" values in logs
- [ ] No 404 or 500 status codes

**Success indicators**:
- [ ] `🚀 Outsource created:` messages when creating
- [ ] No CORS errors
- [ ] API responses logging correctly

To check:
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Perform actions and watch for errors
4. Look for success messages starting with 🚀

## Performance Checks

### Page Load Time
- [ ] Should load in < 3 seconds
- [ ] Stats appear instantly
- [ ] Orders load within 2 seconds

### Search Performance
- [ ] Typing in search is instant (no lag)
- [ ] Filter changes are instant
- [ ] No freezing when scrolling

### Memory Usage
- [ ] Monitor memory in DevTools
- [ ] Should not increase significantly
- [ ] No memory leaks after repeated actions

## Accessibility Checks

- [ ] All buttons have focus indicators
- [ ] Tab navigation works (press Tab key)
- [ ] Keyboard can submit forms (Enter key)
- [ ] Color contrast is sufficient (use Chrome DevTools)
- [ ] Alt text for icons (hover shows tooltips)

## Troubleshooting

### Issue: Page shows loading indefinitely
**Solution**:
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check network tab in DevTools
4. Refresh page (Ctrl+F5)

### Issue: Stats showing 0
**Solution**:
1. Verify database has outsourced stages
2. Check production orders have outsourced field
3. Run: `SELECT * FROM production_stages LIMIT 1;`
4. Look for `outsourced` column

### Issue: Dialog won't open
**Solution**:
1. Check browser console for JavaScript errors
2. Clear browser cache
3. Try in incognito mode
4. Verify React is loaded

### Issue: Vendor list empty
**Solution**:
1. Check vendors table has records: `SELECT * FROM vendors;`
2. Verify vendor status is 'active'
3. Check permissions for user

### Issue: Orders not showing as outsourced
**Solution**:
1. Verify `outsource_type` is set to 'full' or 'partial'
2. Check `outsourced` flag is true
3. Verify `vendor_id` is populated
4. Run: `SELECT * FROM production_stages WHERE outsourced = 1;`

## Test Results Template

```
Test Date: ___________
Tester: _______________
Browser: ______________
Screen Size: __________

✓ Passed | ✗ Failed | ⚠ Partial

[ ] Overall UI looks correct
[ ] All 6 stats cards display
[ ] Search functionality works
[ ] Filter dropdown works
[ ] All 4 tabs load content
[ ] Orders expand/collapse
[ ] Create dialog opens
[ ] Form validation works
[ ] Create button submits
[ ] Success message appears
[ ] Page responsive on mobile
[ ] No console errors
[ ] Navigation works

Issues Found:
1. ________________
2. ________________
3. ________________

Notes:
_____________________
_____________________
```

## Sign-Off

Once all items are verified, document:

- **Date Tested**: ___________
- **Tested By**: _______________
- **Status**: ✅ Ready for Production / ⚠️ Needs Fixes / ❌ Not Ready

---

**Questions?** Contact the development team or check the main documentation.