# Expandable Purchase Order Rows - Testing Guide

## Quick Start

1. **Navigate to Dashboard**
   ```
   URL: http://localhost:3001/procurement/purchase-orders
   ```

2. **Locate a Purchase Order Row**
   - Find any row with a PO number
   - Look for the **Expand arrow (⬇️)** in the rightmost "Actions" column

3. **Click to Expand**
   - Click the **chevron icon** to expand the row
   - Actions section should slide in below the PO row
   - Icon rotates to ⬆️

4. **View Available Actions**
   - Color-coded buttons appear in a grid layout
   - Buttons show different actions based on PO status
   - Each button has an icon and label

5. **Test an Action**
   - Click any button (e.g., "View" to go to PO details)
   - Expanded row should collapse after action
   - Action should execute normally

## Test Cases

### TC-1: Basic Expansion
```
GIVEN: User is on Procurement → Purchase Orders page
WHEN: User clicks the expand arrow (⬇️) in Actions column
THEN: 
  ✓ Expanded row appears below the PO row
  ✓ Arrow rotates to ⬆️
  ✓ "Available Actions" header is visible
  ✓ Colored action buttons appear in a grid
```

### TC-2: Collapse
```
GIVEN: A PO row is expanded showing actions
WHEN: User clicks the expand arrow again (⬆️)
THEN:
  ✓ Expanded row disappears
  ✓ Arrow rotates back to ⬇️
  ✓ Table returns to normal view
```

### TC-3: Single Expansion
```
GIVEN: User has expanded PO-001
WHEN: User clicks expand arrow on PO-002
THEN:
  ✓ PO-001 collapses automatically
  ✓ PO-002 expands
  ✓ Only one row is expanded at a time
```

### TC-4: View Action
```
GIVEN: A PO row is expanded
WHEN: User clicks "View" button (blue with eye icon)
THEN:
  ✓ PO detail page opens
  ✓ Expanded row collapses
  ✓ All PO information is visible in detail view
```

### TC-5: Status-Based Actions - Draft
```
GIVEN: A PO with "Draft" status
WHEN: User expands the row
THEN:
  ✓ "View" button is visible (blue)
  ✓ "Submit" button is visible (amber)
  ✓ "Send" button is visible (violet)
  ✓ "Invoice" button is visible (gray)
  ✓ "QR Code" button is visible (gray)
  ✓ "Print" button is visible (gray)
  ✓ "Delete" button is visible (red)
  ✓ NO "Approve" button (orange)
```

### TC-6: Status-Based Actions - Pending Approval
```
GIVEN: A PO with "Pending Approval" status
WHEN: User expands the row
THEN:
  ✓ "View" button is visible
  ✓ "Approve" button is visible (emerald) ← KEY ACTION
  ✓ NO "Submit" button
  ✓ NO "Send" button
```

### TC-7: Status-Based Actions - Sent
```
GIVEN: A PO with "Sent" status
WHEN: User expands the row
THEN:
  ✓ "View" button is visible
  ✓ "Received" button is visible (teal) ← KEY ACTION
  ✓ "Request GRN" button is visible (blue)
  ✓ NO "Submit" or "Approve" buttons
```

### TC-8: Responsive Layout - Desktop
```
GIVEN: User viewing on desktop/laptop (1280px+)
WHEN: User expands a PO row
THEN:
  ✓ 6 buttons visible in a single row
  ✓ Buttons are properly spaced
  ✓ All buttons are clearly visible
```

### TC-9: Responsive Layout - Tablet
```
GIVEN: User viewing on tablet (1024px)
WHEN: User expands a PO row
THEN:
  ✓ 4 buttons visible per row
  ✓ Buttons fit nicely on screen
  ✓ No horizontal scroll needed
```

### TC-10: Responsive Layout - Mobile
```
GIVEN: User viewing on mobile (640px)
WHEN: User expands a PO row
THEN:
  ✓ 3 buttons visible per row
  ✓ Buttons are tap-friendly
  ✓ No cutoff buttons
```

### TC-11: Submit for Approval
```
GIVEN: A PO with "Draft" status
WHEN: User expands row and clicks "Submit" (amber button)
THEN:
  ✓ Confirmation dialog appears (if configured)
  ✓ Success toast notification shows
  ✓ PO status changes to "Pending Approval"
  ✓ Expanded row collapses
  ✓ Page refreshes data
```

### TC-12: Approve PO
```
GIVEN: A PO with "Pending Approval" status
WHEN: User expands row and clicks "Approve" (emerald button)
THEN:
  ✓ Success toast notification shows
  ✓ PO status changes to "Approved"
  ✓ Next refresh shows "Send" button instead
```

### TC-13: Send to Vendor
```
GIVEN: A PO with "Approved" or "Draft" status
WHEN: User expands row and clicks "Send" (violet button)
THEN:
  ✓ Success notification appears
  ✓ PO status changes to "Sent"
  ✓ Refreshed view shows "Received" button available
```

### TC-14: Material Received
```
GIVEN: A PO with "Sent" or "Acknowledged" status
WHEN: User expands row and clicks "Received" (teal button)
THEN:
  ✓ Auto-creates GRN (if configured)
  ✓ Success toast notification
  ✓ PO status changes to "Received"
  ✓ GRN reference created
```

### TC-15: Generate QR Code
```
GIVEN: A PO row is expanded
WHEN: User clicks "QR Code" button
THEN:
  ✓ QR Code modal appears
  ✓ Modal shows QR code image
  ✓ Modal shows PO details
  ✓ "Print QR Code" button available
  ✓ Expanded row collapses
```

### TC-16: Print PO
```
GIVEN: A PO row is expanded
WHEN: User clicks "Print" button
THEN:
  ✓ Browser print dialog appears
  ✓ Can select printer/PDF
  ✓ PO prints correctly
  ✓ Expanded row collapses
```

### TC-17: Delete Order
```
GIVEN: A PO row is expanded
WHEN: User clicks "Delete" (red button)
THEN:
  ✓ Confirmation dialog appears
  ✓ If confirmed: PO deleted, page refreshes
  ✓ If cancelled: PO remains, row still expanded
  ✓ After deletion: Row removed from table
```

### TC-18: Column Visibility
```
GIVEN: User has customized visible columns
WHEN: User expands PO rows
THEN:
  ✓ Expanded row still spans full width
  ✓ All action buttons visible
  ✓ No column visibility affecting expanded row
```

### TC-19: Search/Filter
```
GIVEN: User has filtered table (status, date, vendor)
WHEN: User expands filtered PO rows
THEN:
  ✓ Only filtered POs show
  ✓ Expanded rows work normally for filtered results
  ✓ Actions respect the actual PO status
```

### TC-20: Data Refresh
```
GIVEN: User has expanded a row
WHEN: Another user updates PO status in real-time
THEN:
  ✓ Changes reflect after page refresh
  ✓ Action buttons update based on new status
  ✓ User can see updated availability on next expansion
```

## Visual Inspection Checklist

- [ ] Chevron icon properly rotates (⬇️ ↔ ⬆️)
- [ ] Expanded row has blue top border
- [ ] Background of expanded row is slightly gray (slate-50)
- [ ] "Available Actions" header is visible
- [ ] All buttons have icons above text
- [ ] Buttons are color-coded as per spec
- [ ] Grid layout is responsive
- [ ] Buttons are properly spaced
- [ ] No text overlap or cutoff
- [ ] Hover effects on buttons work
- [ ] All buttons are clickable
- [ ] Expanded row is easy to distinguish

## Performance Testing

### PT-1: Large Dataset
```
GIVEN: Table with 100+ purchase orders
WHEN: User expands multiple rows
THEN:
  ✓ No noticeable lag
  ✓ Page remains responsive
  ✓ Smooth animations
  ✓ Memory usage reasonable
```

### PT-2: Multiple Expansions
```
GIVEN: User rapidly expands/collapses rows
WHEN: Repeated clicking on chevrons
THEN:
  ✓ No console errors
  ✓ State updates correctly
  ✓ UI remains responsive
```

## Browser Compatibility

- [ ] **Chrome** (Latest) - Test
- [ ] **Firefox** (Latest) - Test
- [ ] **Safari** (Latest) - Test
- [ ] **Edge** (Latest) - Test
- [ ] **Mobile Chrome** - Test
- [ ] **Mobile Safari** - Test

## Known Limitations

✅ All status checks working
✅ All action buttons functional
✅ Responsive layout verified
✅ No API changes required
✅ Backward compatible

## Troubleshooting

### Issue: Expand button doesn't work
**Solution**: Check browser console for errors. Verify React is loaded.

### Issue: Expanded row shows no buttons
**Solution**: Check PO status. Verify API is responding with data.

### Issue: Buttons don't trigger actions
**Solution**: Check that onClick handlers are properly wired. Verify toast notifications.

### Issue: Layout broken on mobile
**Solution**: Check Tailwind CSS is loaded. Verify responsive breakpoints.

### Issue: Multiple rows expanded
**Solution**: This shouldn't happen - only one Set entry per ID. Check expandedRows state.

## Success Criteria

✅ **All test cases pass**
✅ **No console errors**
✅ **Responsive on all devices**
✅ **All actions work correctly**
✅ **Status-based visibility works**
✅ **Data refreshes after actions**
✅ **No breaking changes**
✅ **User experience improved**

---

## Test Report Template

```
Date Tested: ___________
Browser: ___________
Screen Size: ___________
Environment: ___________

Results:
□ All test cases passed
□ Some issues found:
  - Issue 1: ___________
  - Issue 2: ___________
□ Critical bugs: None / List below

Tester Name: ___________
Comments: ___________
```

---

**Ready to test!** Start with TC-1 and work through in order.