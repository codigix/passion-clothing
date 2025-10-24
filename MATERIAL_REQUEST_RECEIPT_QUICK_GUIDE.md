# Material Request & Receipt - Quick Reference Guide

## 🚀 Quick Start

### Access Material Requirements Page
**Path:** Manufacturing Dashboard → Material Requirements (MRN)

### Access Material Receipts  
**Path:** Production Dashboard → Switch Tab → Material Receipts

---

## 📊 Material Requirements Page Features

### View Modes
Toggle between two display formats:

**Table View** (Default)
- Compact view with all details in rows
- Easier for filtering and searching
- Best for desktop
- Column customization available

**Cards View**
- Visual card layout
- Grouped by material
- Better for overview
- Touch-friendly

### Column Customization

**How to Use:**
1. Click **"Columns"** button (purple)
2. Check/uncheck columns you want to show
3. Use **"Show All"** or **"Reset"** buttons
4. Your preference is saved automatically

**Always Visible Columns:**
- Request # (shows request identifier)
- Actions (View Details button)

**Optional Columns:**
- Material Name, Project, Quantity Requested
- Unit, Issued Quantity, Status, Priority
- Created Date

### Search Functionality

**Searches across:**
- ✓ Request Number (e.g., "MR-001")
- ✓ Material Name (e.g., "Fabric")
- ✓ Project Name (e.g., "SO-2024-001")
- ✓ PO Number

**Example searches:**
- `MR-001` → Find specific request
- `Cotton` → Find cotton materials
- `SO-2024` → Find requests for SO-2024 project

### Filters Panel

**Toggle Filters:** Click **"Filters"** button

#### Filter Options:

1. **Status Filter**
   - All Statuses (default)
   - Pending (awaiting approval)
   - Approved (ready to issue)
   - Rejected
   - In Progress
   - Fulfilled (completely issued)
   - Partially Fulfilled
   - Cancelled

2. **Priority Filter**
   - All Priorities
   - Low (routine)
   - Medium (standard)
   - High (important)
   - Urgent (asap)

3. **Project Filter**
   - All Projects
   - [Dropdown of active projects]

### Using Multiple Filters Together

**Example: Find urgent pending requests for a project**
1. Status = "Pending"
2. Priority = "Urgent"
3. Project = "SO-2024-001"
4. Result: Shows only matching requests

**To Reset:** Click **"Reset"** button in filters

---

## 📦 Material Receipt Tab (in Production Dashboard)

### Overview
Shows all material receipts received from suppliers/dispatches.

### Search Box
**Searches across:**
- ✓ Receipt Number
- ✓ Dispatch Number  
- ✓ Project Name
- ✓ Material Names

### Filter Panels (Expandable)

**Click "Filters" button to expand filter options**

#### 1. Status Filter (Dropdown)
- **All Status** (default)
- **Received** ✓ (green - all items received OK)
- **Discrepancy** ✗ (red - quantity/quality issue)
- **Pending** ⏳ (yellow - not yet processed)

#### 2. Date From (Date Picker)
- Select start date
- Shows receipts received on or after this date
- Leave empty to include all past dates

#### 3. Date To (Date Picker)
- Select end date  
- Shows receipts received on or before this date
- Leave empty to include all future dates

**Useful date ranges:**
- Last 7 days: From = 7 days ago, To = today
- Last 30 days: From = 30 days ago, To = today
- This month: From = 1st of month, To = today
- Specific period: Set both dates

#### 4. Project Filter
- Type project name/number
- Partial match supported (e.g., "SO-2024")
- Case-insensitive

#### 5. Material Type Filter
- Type material name/type
- Partial match supported (e.g., "Fabric")
- Finds materials with matching names

### Combining Filters

**Example 1: Find discrepancies this week**
- Status: "Discrepancy"
- Date From: 7 days ago
- Result: All problem receipts from the week

**Example 2: Find all cotton materials received in January**
- Material Type: "Cotton"
- Date From: 2024-01-01
- Date To: 2024-01-31
- Result: All cotton receipts from January

**Example 3: Find complete project deliveries**
- Project: "SO-2024-001"
- Status: "Received"
- Result: All successfully received materials for this project

### Table Columns Explained

| Column | Shows | Notes |
|--------|-------|-------|
| **Receipt #** | Receipt ID | Unique identifier |
| **Dispatch #** | Source dispatch | Which dispatch this receipt came from |
| **Project** | Project name | Associated project/order |
| **Materials** | Item count | Shows number of items + preview |
| **Status** | Receipt condition | Color coded (green/red/yellow) |
| **Received By** | Person's name | Who received it |
| **Date** | Receipt date | When it was received |

### Reading the Materials Column
Shows preview of materials received:

Example:
```
3 items
Fabric (100 kg)
+2 more
```

- **3 items** = Total materials in receipt
- **Fabric (100 kg)** = First item details
- **+2 more** = Additional items (click to expand if available)

### Status Indicators

**Green Badge - "RECEIVED"**
- All materials received in good condition
- Quantities match expectations
- Ready to process

**Red Badge - "DISCREPANCY"**  
- Quantity mismatch
- Quality/condition issue
- Damaged items reported
- Needs investigation

**Yellow Badge - "PENDING"**
- Receipt not yet verified
- Awaiting QC check
- Under processing

### Reset Filters

Click **"Reset Filters"** to:
- Clear all search terms
- Reset all date filters
- Clear project filter
- Clear material type filter
- Show all receipts again

---

## 💡 Common Tasks

### Find All Pending Material Requests
1. Go to Material Requirements
2. Status Filter: "Pending"
3. View all requests awaiting approval

### Check Discrepancies This Week
1. Go to Production Dashboard
2. Select "Material Receipts" tab
3. Filters: Status = "Discrepancy"
4. Set date range: Last 7 days
5. Review all problem receipts

### View Materials for Specific Project
1. Material Requirements: Project = "SO-2024-001"
   OR
2. Material Receipts: Project = "SO-2024-001"

### Find High Priority Urgent Items
1. Material Requirements tab
2. Priority Filter: "Urgent"
3. Status Filter: "Pending"
4. Review urgent pending requests

### Check Cotton Material Flow
1. Material Requirements: Search = "Cotton"
   AND/OR
2. Material Receipts: Material Type = "Cotton"

---

## 🎯 Tips & Tricks

### Save Time
- **Use Table View** for quick searches
- **Use Cards View** for overview/presentation
- **Combine multiple filters** for precise results
- **Save column preferences** by setting once

### Mobile Usage
- **Scroll table horizontally** to see all columns
- **Use search** more than filters for faster results
- **Tap column menu** to reduce visible columns

### Common Issues

**No results showing:**
- Check if filters are too restrictive
- Click "Reset Filters" to start over
- Try search instead of filters

**Can't find a receipt:**
- Use search with partial match (e.g., "SO-2024")
- Check date range filters
- Try searching by material name

**Column preferences not saving:**
- Clear browser cache
- Check if cookies/storage is disabled
- Try again in private/incognito mode

---

## 📱 Responsive Design

### Desktop
- All columns visible
- Full-width table
- All buttons show text

### Tablet  
- 3-4 columns visible (others hidden)
- Table scrolls horizontally
- Some buttons show icons only

### Mobile
- 2-3 columns visible
- Table scrolls left/right
- Buttons show icons
- Optimized spacing

---

## 🔄 Filter Logic

### How Filters Work Together

**All filters use AND logic:**
- Status = "Pending" **AND**
- Priority = "Urgent" **AND**  
- Project = "SO-2024"

Results: Only requests matching ALL criteria shown

**NOT OR logic:**
- Status = "Pending" **OR** "Approved"
- To get this: You must apply filter twice separately

### Clearing Filters

**Individual reset:** Just change the dropdown back to "All" or clear text

**Bulk reset:** Click **"Reset"** button to clear everything

---

## 📊 Data Accuracy

- **Material Requirements**: Shows all pending/approved requests
- **Material Receipts**: Shows verified receipts from last 90 days
- **Status updates**: Real-time from database
- **Search**: Indexed for fast results

---

## 🚨 Important Notes

1. **Discrepancies**: When status shows "DISCREPANCY", contact receiving department
2. **Date Filters**: Use for compliance/audit trails
3. **Project Tracking**: Ensures all materials accounted for
4. **Priority Levels**: "Urgent" needs immediate attention
5. **Material Type Search**: Helps with batch operations

---

## 📞 Need Help?

If filters aren't working:
- Try **Reset Filters**
- Check if data exists for selected filters
- Refresh the page
- Check browser console (F12) for errors

If columns disappeared:
- Click **Show All** in column menu
- Or click **Reset** in column menu

---

## 🎓 Learning Path

**Day 1: Basics**
1. ✓ Open Material Requirements
2. ✓ Toggle between Table/Cards
3. ✓ Use search box
4. ✓ Apply single filter

**Day 2: Advanced**
1. ✓ Customize columns
2. ✓ Combine multiple filters
3. ✓ Open Material Receipts tab
4. ✓ Use date range filters

**Day 3: Expert**
1. ✓ Optimize columns for workflow
2. ✓ Use advanced filter combinations
3. ✓ Monitor discrepancies
4. ✓ Generate reports from filtered data

---

**Version:** 1.0  
**Last Updated:** January 2025  
**For Issues:** Contact Manufacturing Department IT Support