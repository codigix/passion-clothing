# Vendors Page - Test Checklist

## Pre-requisites
- ✅ Backend server running on port 5000
- ✅ Frontend running on port 3000
- ✅ User logged in with procurement or admin role
- ✅ Database migrations applied

---

## 🧪 Quick Test Checklist

### 1. Page Access & Display
- [ ] Navigate to: **Procurement → Vendors**
- [ ] Page loads without errors
- [ ] Statistics cards display correctly
- [ ] Table shows existing vendors (or empty message)
- [ ] All UI elements visible and styled correctly

### 2. Create Vendor (Happy Path)
- [ ] Click **"Add Vendor"** button
- [ ] Modal opens with title "Add New Vendor"
- [ ] Fill required fields:
  ```
  Vendor Name: ABC Fabrics Ltd
  Vendor Type: Material Supplier
  ```
- [ ] Click **"Create Vendor"**
- [ ] Success toast: "Vendor created successfully"
- [ ] Modal closes automatically
- [ ] New vendor appears in table
- [ ] Vendor code auto-generated (e.g., VEN0001)

### 3. Create Vendor (Validation)
- [ ] Click **"Add Vendor"**
- [ ] Leave name empty → Click Create
- [ ] Error message: "Vendor name is required"
- [ ] Enter name, leave vendor_type → Click Create
- [ ] Error message: "Vendor type is required"
- [ ] Enter invalid email: "notanemail"
- [ ] Error message: "Invalid email format"
- [ ] Enter GST: "12345" (too short)
- [ ] Error message: "GST number must be 15 characters"
- [ ] Enter PAN: "ABCDE" (too short)
- [ ] Error message: "PAN number must be 10 characters"
- [ ] Fill all required fields correctly
- [ ] Form submits successfully

### 4. View Vendor Details
- [ ] Find any vendor in table
- [ ] Click **eye icon** (View)
- [ ] Modal opens in read-only mode
- [ ] Title shows: "Vendor Details"
- [ ] Vendor code displayed
- [ ] All sections visible (Basic Info, Contact, Address, Tax/Financial)
- [ ] All fields are disabled/read-only
- [ ] Only "Close" button visible (no Save/Update button)
- [ ] Click **"Close"**
- [ ] Modal closes

### 5. Edit Vendor
- [ ] Find any vendor in table
- [ ] Click **pencil icon** (Edit)
- [ ] Modal opens in edit mode
- [ ] Title shows: "Edit Vendor"
- [ ] Form pre-filled with existing data
- [ ] Modify vendor name: "ABC Fabrics Ltd Updated"
- [ ] Change rating to: 4.5
- [ ] Change status to: Active
- [ ] Click **"Update Vendor"**
- [ ] Success toast: "Vendor updated successfully"
- [ ] Modal closes
- [ ] Table shows updated information
- [ ] Click View → Verify changes saved

### 6. Delete Vendor (No POs)
- [ ] Create a test vendor without purchase orders
- [ ] Click **trash icon** (Delete)
- [ ] Confirmation dialog appears
- [ ] Dialog shows vendor name
- [ ] Click **"Cancel"** → Dialog closes, vendor still exists
- [ ] Click Delete icon again
- [ ] Click **"Delete"** → Confirmation proceeds
- [ ] Success toast: "Vendor deleted successfully"
- [ ] Vendor removed from table

### 7. Delete Vendor (With POs)
- [ ] Find vendor with purchase orders
- [ ] Click **trash icon** (Delete)
- [ ] Confirmation dialog shows warning about POs
- [ ] Click **"Delete"**
- [ ] Error toast: "Cannot delete vendor with X purchase order(s)"
- [ ] Vendor remains in table

### 8. Search Functionality
- [ ] Create vendors:
  - Name: "ABC Fabrics", Code: VEN0001
  - Name: "XYZ Embroidery", Code: VEN0002
- [ ] In search box, type: "ABC"
- [ ] Only ABC Fabrics shows
- [ ] Clear search
- [ ] Type: "VEN0001"
- [ ] Only vendor with VEN0001 shows
- [ ] Clear search
- [ ] Type: "embroidery" (lowercase)
- [ ] XYZ Embroidery shows (case-insensitive)
- [ ] Clear search → All vendors appear

### 9. Filter by Status
- [ ] Create vendors with different statuses:
  - Vendor 1: Active
  - Vendor 2: Inactive
  - Vendor 3: Active
- [ ] Click **"Filters"** button
- [ ] Filter panel expands
- [ ] Select Status: **Active**
- [ ] Table shows only active vendors
- [ ] Select Status: **Inactive**
- [ ] Table shows only inactive vendors
- [ ] Select Status: **All Status**
- [ ] Table shows all vendors

### 10. Filter by Vendor Type
- [ ] Create vendors with different types:
  - Vendor 1: Material Supplier
  - Vendor 2: Service Provider
  - Vendor 3: Both
- [ ] In filters, select Type: **Material Supplier**
- [ ] Table shows only material suppliers
- [ ] Select Type: **Service Provider**
- [ ] Table shows only service providers
- [ ] Select Type: **Both**
- [ ] Table shows vendors with type "Both"
- [ ] Select Type: **All Types**
- [ ] Table shows all vendors

### 11. Filter by Category
- [ ] Create vendors with different categories:
  - Vendor 1: Fabric
  - Vendor 2: Accessories
  - Vendor 3: Embroidery
- [ ] In filters, select Category: **Fabric**
- [ ] Table shows only fabric vendors
- [ ] Select Category: **Accessories**
- [ ] Table shows only accessories vendors
- [ ] Click **"Clear Filters"** button
- [ ] All filters reset to "All"
- [ ] Table shows all vendors

### 12. Combined Filters & Search
- [ ] Set filters:
  - Status: Active
  - Type: Material Supplier
- [ ] Enter search: "ABC"
- [ ] Results match all criteria (Active AND Material Supplier AND "ABC" in name)
- [ ] Clear search → Filters still active
- [ ] Clear filters → Search still active
- [ ] Clear both → All vendors shown

### 13. Statistics Cards
- [ ] Note current Total Vendors count
- [ ] Create a new vendor
- [ ] Total Vendors count increases by 1
- [ ] Note Active Vendors count
- [ ] Change a vendor status to Inactive
- [ ] Active count decreases by 1
- [ ] Create Material Supplier vendor
- [ ] Material Suppliers count increases by 1
- [ ] Create Service Provider vendor
- [ ] Service Providers count increases by 1

### 14. Form Field Validations
- [ ] Open Create/Edit form
- [ ] GST Number: Type lowercase → Auto-converts to UPPERCASE
- [ ] PAN Number: Type lowercase → Auto-converts to UPPERCASE
- [ ] Rating: Try to enter 6 → Should not allow (max 5)
- [ ] Credit Limit: Enter negative → Should not allow (min 0)
- [ ] Credit Days: Enter negative → Should not allow (min 0)
- [ ] Email: Enter valid email → No error
- [ ] Email: Enter invalid email → Shows error

### 15. Responsive Design
- [ ] Resize browser to mobile width (< 640px)
- [ ] Page adapts to mobile layout
- [ ] Buttons stack vertically
- [ ] Table scrolls horizontally
- [ ] Modal fits mobile screen
- [ ] Form fields stack vertically
- [ ] Resize to tablet width (640-1024px)
- [ ] Layout adjusts appropriately
- [ ] Resize to desktop width (> 1024px)
- [ ] Full layout with all columns visible

### 16. Error Handling
- [ ] Stop backend server
- [ ] Try to load vendors page
- [ ] Should show loading state → then error
- [ ] Try to create vendor
- [ ] Should show error toast: "Failed to create vendor"
- [ ] Start backend server
- [ ] Refresh page → Should work normally

### 17. Loading States
- [ ] Clear browser cache
- [ ] Load vendors page
- [ ] Loading indicator shows while fetching
- [ ] Table appears when data loads
- [ ] Click create vendor → Submit
- [ ] Button shows "Creating..." (disabled)
- [ ] Success → Button returns to normal

### 18. Toast Notifications
- [ ] Create vendor → Shows success toast (green)
- [ ] Update vendor → Shows success toast (green)
- [ ] Delete vendor → Shows success toast (green)
- [ ] Try invalid operation → Shows error toast (red)
- [ ] Toasts auto-dismiss after few seconds
- [ ] Multiple toasts can stack

### 19. Table Features
- [ ] Create 20+ vendors
- [ ] Table displays all vendors
- [ ] Scrollable if content exceeds page height
- [ ] Color-coded status badges work correctly
- [ ] Color-coded vendor type badges work correctly
- [ ] Rating displays with star icon
- [ ] Contact info displays in multiple lines
- [ ] Location info displays city and state
- [ ] Actions column always visible (right-aligned)
- [ ] Hover effects on action buttons work

### 20. Modal Behavior
- [ ] Open create modal
- [ ] Click outside modal → Modal stays open (no accidental close)
- [ ] Click X button → Modal closes
- [ ] Press Escape key → Modal closes
- [ ] Click Cancel button → Modal closes
- [ ] Form data cleared when reopening
- [ ] Open edit modal
- [ ] Data pre-fills correctly
- [ ] Switch between create/edit/view → No data leakage

---

## ✅ Test Results Summary

| Category | Total Tests | Passed | Failed | Notes |
|----------|-------------|--------|--------|-------|
| Page Display | 5 | | | |
| Create Vendor | 10 | | | |
| View Vendor | 7 | | | |
| Edit Vendor | 7 | | | |
| Delete Vendor | 8 | | | |
| Search | 7 | | | |
| Filters | 14 | | | |
| Statistics | 7 | | | |
| Validation | 8 | | | |
| Responsive | 6 | | | |
| Error Handling | 5 | | | |
| Loading States | 4 | | | |
| Notifications | 5 | | | |
| Table Features | 10 | | | |
| Modal Behavior | 9 | | | |
| **TOTAL** | **112** | | | |

---

## 🐛 Bug Report Template

If you find any issues, report using this format:

```
**Bug Title:** [Short description]

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Enter...
4. See error

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Copy any console errors]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Screen Size: [Desktop/Tablet/Mobile]
```

---

## 📝 Test Notes

### Known Limitations:
1. Vendor code is auto-generated (cannot be customized)
2. Cannot filter by multiple categories simultaneously
3. No pagination (all vendors loaded at once)
4. No export functionality yet

### Performance Notes:
- Test with large dataset (100+ vendors)
- Check search performance
- Check filter performance
- Monitor memory usage

### Browser Compatibility:
- Test in Chrome (primary)
- Test in Firefox
- Test in Safari
- Test in Edge

---

## ✨ Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No visual glitches
- ✅ All CRUD operations working
- ✅ All validations working
- ✅ All filters working
- ✅ Search working correctly
- ✅ Responsive on all screen sizes
- ✅ Professional appearance
- ✅ Fast performance (< 2s load time)
- ✅ Clear user feedback (toasts, loading states)

---

## 🎉 When All Tests Pass

Congratulations! The Vendors Management system is fully functional and ready for production use.

**Next Steps:**
1. Deploy to staging environment
2. Conduct user acceptance testing
3. Create user training materials
4. Deploy to production
5. Monitor for issues
6. Gather user feedback
7. Plan future enhancements