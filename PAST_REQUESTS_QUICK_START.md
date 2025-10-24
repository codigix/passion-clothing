# Past Orders/Requests - Quick Start Guide

## What's New?

The Material Requirements page now displays **past orders/requests** separately from active ones, making it easier to track completed work!

## Where to Find It

**Navigation**: Manufacturing → Material Requirements (MRN)

## How It Works

### 1. **Active Requests** (Visible by Default)
- Shows all pending, approved, and in-progress material requests
- Includes quantity, status, priority, and more
- Use search and filters to find specific requests

### 2. **Past Orders/Requests** (Hidden by Default)
- Shows completed, fulfilled, rejected, or cancelled requests
- Click **"▶ SHOW Past Requests"** to expand
- Shows count of past requests next to the heading

## Page Layout

```
┌─────────────────────────────────────────────────┐
│ Material Requirements (MRN)                     │
├─────────────────────────────────────────────────┤
│ Statistics: Total | Pending | Approved | etc.   │
├─────────────────────────────────────────────────┤
│ 🔍 Search | 🎛️ Filters | 📊 View Mode (Table/Cards)
├─────────────────────────────────────────────────┤
│ 📋 ACTIVE REQUESTS (5)                          │
│ [Table or Cards showing active requests]        │
│                                                 │
│ 🏭 PAST ORDERS/REQUESTS (3)  ▶ SHOW            │ ← Click here
│ [Hidden until toggled]                          │
└─────────────────────────────────────────────────┘
```

## Features

| Feature | Description |
|---------|-------------|
| **Automatic Separation** | Active vs Past requests auto-categorized |
| **Toggle Control** | Show/Hide past requests with one click |
| **Multiple Views** | Table view or Card view for past requests |
| **Status Display** | Color-coded status badges (Green=Fulfilled, Red=Rejected, etc.) |
| **Search & Filter** | Works on both active and past requests |
| **View Details** | Click any request to see full details |
| **Statistics** | Real-time count of active and past requests |

## Status Colors

### Active Requests
- 🟡 **Yellow** = Pending
- 🟢 **Green** = Approved / In Progress  
- 🟠 **Orange** = Partially Fulfilled

### Past Requests
- 🟢 **Green** = Fulfilled ✓ (Complete)
- 🔴 **Red** = Rejected ✗ or Cancelled ✗
- 🟡 **Yellow** = Other statuses

## How to Use

### Find Active Material Requests
1. Page opens with **Active Requests** visible
2. Use search bar to find by:
   - Request number (e.g., "MRN-20250115-00001")
   - Material name (e.g., "Cotton Fabric")
   - Project name
3. Use filters to narrow down by:
   - Status (Pending, Approved, etc.)
   - Priority (Low, Medium, High, Urgent)
   - Project

### View Past Orders/Requests
1. Scroll down to **"Past Orders/Requests"** section
2. Click **"▶ SHOW Past Requests"** button
3. See all completed/fulfilled/rejected/cancelled requests
4. The button changes to **"▼ HIDE Past Requests"**
5. Collapsed requests show count: "Past Orders/Requests (X)"

### Switch Between Table and Card View
1. Click **"Table"** or **"Cards"** button at the top
2. **Table View**: Compact grid format, all columns visible
3. **Card View**: Large cards with all details visible
4. Choice applies to both active and past requests

### View Full Request Details
1. Find the request in either Active or Past section
2. Click **"View"** button in table view, or
3. Click **"View Details"** button on card view
4. Redirects to full request detail page

### Filter and Search Tips

| Task | How To |
|------|--------|
| Find by Request# | Search: "MRN-2025" |
| Find by Material | Search: "fabric name" |
| Find by Status | Use Status filter dropdown |
| Find by Priority | Use Priority filter dropdown |
| Find by Project | Use Project filter dropdown |
| Clear all filters | Click "Reset" button |

## View Modes

### Table View
```
Request #  │ Material    │ Status    │ Priority │ Created
MRN-001    │ Cotton      │ Fulfilled │ Medium   │ Jan 1
MRN-002    │ Polyester   │ Rejected  │ High     │ Jan 2
```

### Card View
```
┌─────────────────────┐
│ MRN-001             │
│ Cotton Fabric       │
│ Status: Fulfilled ✓ │
│ [View Details] btn  │
└─────────────────────┘
```

## Statistics Summary

The page shows these stats at the top:
- **Total Requests**: Sum of all requests (active + past)
- **Pending**: Waiting for approval
- **Approved**: Approved and ready/processing
- **Fulfilled**: Successfully completed ✓
- **Urgent Priority**: Number of urgent requests

## Mobile Usage

On phones and tablets:
- Active requests stack in single column
- Past requests cards also single column
- Toggle button always accessible
- Search bar responsive
- Filters available through dropdown

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Navigate between elements |
| Enter | Click focused button/link |
| Escape | Close dropdown menus |
| / | Focus search bar (if supported) |

## Common Scenarios

### Scenario 1: Track Completed Order
1. Order was created and fulfilled
2. Look in **"Past Orders/Requests"** section
3. Status shows **"FULFILLED"** in green
4. Check quantity issued vs requested

### Scenario 2: Investigate Rejected Request
1. Request was rejected due to issues
2. Click **"▶ SHOW Past Requests"**
3. Look for status **"REJECTED"** in red
4. Click **"View Details"** to see rejection reason

### Scenario 3: Find All Orders for a Project
1. Use **Project** filter dropdown
2. Select the specific project name
3. Both active and past requests filtered
4. Can see complete project history

### Scenario 4: Find Overdue Requests
1. Look in **Active Requests** section
2. Check **Created Date** vs current date
3. If older requests exist, they may need attention
4. Use filters to organize by date

## Tips & Tricks

✅ **Use Search First**: Fastest way to find specific requests  
✅ **Check View Mode**: Switch between Table/Cards based on preference  
✅ **Use Filters**: Better than search for broad filtering  
✅ **Sort by Priority**: Focus on urgent items first  
✅ **Review Statistics**: Quick overview of overall status  
✅ **Check Created Date**: See recent activity  
✅ **Past Requests Hidden**: Reduces clutter, but always accessible  

## Troubleshooting

### Problem: Can't Find a Request
- [ ] Try searching by request number
- [ ] Check if it's in past requests (might be completed)
- [ ] Try different search terms
- [ ] Check all projects, not just one

### Problem: Past Requests Button Not Working
- [ ] Refresh the page
- [ ] Check browser console for errors
- [ ] Clear browser cache
- [ ] Try a different browser

### Problem: Wrong Status Showing
- [ ] Refresh page to get latest data
- [ ] Check if status was updated recently
- [ ] Contact system admin if issue persists

### Problem: Can't See All Columns
- [ ] Use **Column Visibility** menu
- [ ] Switch to **Card View** for full details
- [ ] Scroll table horizontally
- [ ] Click **"Show All"** in column menu

## Visual Indicators

| Symbol | Meaning |
|--------|---------|
| ✓ | Request completed/fulfilled |
| ✗ | Request rejected/cancelled |
| ⏱ | Request pending |
| ▶ | Click to expand/show |
| ▼ | Click to collapse/hide |
| 🟢 | Fulfilled/Success |
| 🔴 | Rejected/Error |
| 🟡 | Pending/Warning |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + F | Browser find (search page) |
| Ctrl + R | Refresh page |
| Tab + Shift | Navigate backwards |

## Data Interpretation

### Quantity Fields
- **Qty Requested**: Amount you requested
- **Issued**: Amount actually provided
- **Difference**: If issued < requested, may be partially fulfilled

### Date Fields
- **Created**: When request was created
- **Required By**: Target completion date

### Status Meanings

| Status | Meaning | Action |
|--------|---------|--------|
| Pending | Waiting for review | Monitor for approval |
| Approved | Ready for processing | Check inventory |
| Fulfilled | Completed successfully | Review details if needed |
| Rejected | Request denied | Contact support |
| Cancelled | Request cancelled | May retry if needed |

## Export Options

Currently, you can:
1. Copy request number and manually track
2. Take screenshots of table/cards
3. Use browser print function (Ctrl+P) to PDF

*Future: Export to CSV/PDF planned*

## Performance Tips

- Past requests hidden by default for faster page load
- Use filters to reduce data displayed
- Table view faster than Card view on slow connections
- Search narrows results quickly

## Support & Help

For issues:
1. Check this guide first
2. Review the full documentation: `PAST_REQUESTS_FEATURE_GUIDE.md`
3. Contact system administrator
4. Check browser console for error messages

---

**Quick Reference Version**: 1.0  
**Last Updated**: January 2025

**Key Features at a Glance:**
✅ Past orders separate from active  
✅ Show/Hide toggle  
✅ Color-coded status  
✅ Search & filter support  
✅ Multiple view modes  
✅ Mobile responsive  
✅ No additional clicks for active requests  