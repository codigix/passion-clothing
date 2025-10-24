# Outsource Management - Quick Start Guide

## Accessing the Page
1. Login to Passion ERP
2. Navigate to **Manufacturing** → **Outsource Management**
3. Or click directly: `/manufacturing/outsource`

## Dashboard Overview
```
┌─────────────────────────────────────────────────┐
│         Outsource Management Dashboard          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Active: 5  │  Completed: 12  │  Delayed: 1   │
│  Total Cost: ₹2.5L                            │
│                                                 │
├─────────────────────────────────────────────────┤
│  [Search]  [Filter]  [Refresh]  [+ Create]     │
├─────────────────────────────────────────────────┤
│  [Active]  [Completed]                         │
│                                                 │
│  □ Order SO-2024-001 - T-Shirt x100           │
│    └─ Expand for details                      │
│                                                 │
│  □ Order SO-2024-002 - Jacket x50             │
│    └─ Expand for details                      │
└─────────────────────────────────────────────────┘
```

## Common Tasks

### Task 1: Create Full Production Outsource

**Scenario:** Send entire T-Shirt order to vendor for full production

**Steps:**
1. Click **[+ Create Outsource]** button
2. In dialog, select **Production Order**: `SO-2024-001 - T-Shirt (100 units)`
3. Select **Outsource Type**: `Full Production Outsource` (radio button)
4. Select **Vendor**: `ABC Textiles Ltd. - Contact: John Smith`
5. Set **Expected Return Date**: `2025-02-15`
6. Enter **Transport Details**: `XYZ Transport - AWB: TRK123456`
7. Enter **Estimated Cost**: `50000`
8. Add **Notes**: `Standard production. Please follow attached specifications.`
9. Click **[Create Outsource]**

**Expected Result:**
- All production stages sent to vendor
- Challan created and tracked
- Order status updated to "outsourced"
- Staff receives notification

---

### Task 2: Create Partial Outsource - Embroidery Only

**Scenario:** Keep regular stitching in-house but outsource embroidery

**Steps:**
1. Click **[+ Create Outsource]** button
2. Select **Production Order**: `SO-2024-003 - Jacket (50 units)`
3. Select **Outsource Type**: `Partial (Specific Stages)` (radio button)
4. **Stages appear below** - Check only: `☑ Embroidery`
5. Select **Vendor**: `Embroidery Experts Ltd. - Contact: Sarah Wilson`
6. Set **Expected Return Date**: `2025-02-10`
7. Enter **Transport Details**: `Local Courier - Pickup: 10:00 AM`
8. Enter **Estimated Cost**: `15000`
9. Add **Notes**: `Special embroidery pattern required. See attached design file.`
10. Click **[Create Outsource]**

**Expected Result:**
- Only embroidery stage goes to specialist vendor
- Other stages (cutting, stitching, finishing, QC) continue in-house
- Embroidery specialist receives materials
- In-house team waits for embroidery completion

---

### Task 3: Create Multi-Vendor Partial Outsource

**Scenario:** Different vendors for different stages

**Step 1: Outsource Embroidery**
1. Create outsource for `SO-2024-004 - Dress (75 units)`
2. Select stage: `Embroidery`
3. Vendor: `Embroidery Experts`
4. Cost: `12000`
5. Submit

**Step 2: Outsource Printing**
1. Create second outsource for same order `SO-2024-004`
2. Select stage: `Printing`
3. Vendor: `Print Masters`
4. Cost: `8000`
5. Submit

**Step 3: Keep In-House**
- Cutting: In-house team
- Stitching: In-house team
- Finishing: In-house team
- Quality Check: In-house team

**Expected Result:**
- Order split across multiple vendors
- Each vendor handles specialty work
- In-house handles standard operations
- Total outsource cost: ₹20,000

---

### Task 4: Monitor Active Outsources

**Steps:**
1. Go to **Outsource Management** page
2. Click **[Active Outsources]** tab (already selected)
3. View list showing currently outsourced orders
4. See stats at top:
   - **Active**: Count of ongoing outsources
   - **Cost**: Total investment in outsourcing

**Each Order Card Shows:**
- Order number and product
- Number of stages outsourced
- Outsource type (Full/Partial)
- Active count

**To See Details:**
1. Click anywhere on order card to expand
2. See:
   - All outsourced stages
   - Vendor names
   - Individual stage costs
   - Stage status (pending, in_progress, completed)

---

### Task 5: Track Outsourced Order Progress

**Steps:**
1. Go to **Outsource Management**
2. Find and expand your order card
3. Click **[Track Outsource]** button (green)
4. Opens **Production Operations View** with real-time tracking
5. See:
   - Stage progress bar
   - Actual vs planned dates
   - Material status
   - Quality checkpoints
   - Challan status

---

### Task 6: Search Orders

**Scenario:** Find specific outsourced order

**By Order Number:**
1. Type in search: `SO-2024-001`
2. Results filter instantly

**By Product Name:**
1. Type in search: `T-Shirt`
2. Shows all T-Shirt related outsources

**By Product Code:**
1. Type in search: `TSH-001`
2. Shows orders for that product code

---

### Task 7: Filter by Outsource Type

**Steps:**
1. Click **[Filter dropdown]**
2. Select:
   - **All Outsources**: Show everything
   - **Full Outsource**: Show complete production outsources
   - **Partial Outsource**: Show stage-specific outsources

**Example:**
- Filter: "Full Outsource"
- Shows: 3 orders fully outsourced to vendors

---

### Task 8: View Completed Outsources

**Steps:**
1. Click **[Completed]** tab at top
2. View all successfully completed outsource operations
3. See:
   - Order numbers
   - Completion dates
   - Final costs
   - Vendor feedback

---

## Key Metrics Explained

### Stats Cards at Top

| Metric | Meaning | Example |
|--------|---------|---------|
| **Active** | Outsources currently in progress | 5 = 5 orders being outsourced |
| **Completed** | Successfully completed | 12 = 12 finished outsources |
| **Delayed** | Exceeded expected return date | 1 = 1 order overdue |
| **Total Cost** | Sum of all outsource costs | ₹2.5L = 2,50,000 rupees |

---

## Common Scenarios

### Scenario A: Rush Order with Specialized Vendor
```
Order: SO-2024-100
Status: URGENT - Delivery: Tomorrow
Action: Full outsource to rush vendor
Cost: ₹75,000 (premium)
Result: Vendor produces immediately
```

### Scenario B: Embroidery Specialist Work
```
Order: SO-2024-101
Product: Designer Shirt (embroidery required)
Action: Partial outsource - only embroidery stage
Vendor: Embroidery Expert Ltd.
Cost: ₹8,000 per unit
Result: Specialist handles embroidery, in-house does rest
```

### Scenario C: Cost Optimization
```
Order: SO-2024-102
Multiple Small Orders (consolidate)
Action: Combine similar orders → single vendor
Vendor: Bulk Production House
Cost Savings: 20%
Result: Economies of scale achieved
```

### Scenario D: Capacity Management
```
Order: SO-2024-103
In-house capacity: FULL (at 100%)
Action: Partial outsource of less critical stages
Vendor: Secondary production partner
Benefit: Free up in-house for priority work
```

---

## Validation Rules

### Required Fields
- ✅ **Production Order**: Must select
- ✅ **Outsource Type**: Must choose (Full or Partial)
- ✅ **Stages** (Partial only): Minimum 1 stage
- ✅ **Vendor**: Must select
- ✅ **Return Date**: Must specify

### Optional Fields
- Transport details: Recommended but optional
- Cost: Can estimate or leave blank
- Notes: Add details as needed

### Error Messages
```
"Please select at least one stage"
→ Solution: Check stage checkboxes for partial outsource

"Please fill in all required fields"
→ Solution: Verify Order, Type, Vendor, and Date all selected

"Failed to create outsource request"
→ Solution: Check network, refresh page, try again
```

---

## Tips & Tricks

### 💡 Tip 1: Consolidate Orders
Group multiple small orders to one vendor for better pricing.

### 💡 Tip 2: Stage Sequencing
If outsourcing multiple stages, consider sequence:
- Embroidery → Printing → Washing (logical order)
- Not: Washing → Embroidery → Printing (illogical)

### 💡 Tip 3: Add Detailed Notes
```
Good notes: "Use specification file attached. Follow color chart attached. 
Quality check required before return."

Vague notes: "Make it nice"
```

### 💡 Tip 4: Monitor Deadlines
Set return dates with buffer:
- Actual delivery: Feb 15
- Return from vendor: Feb 13
- Buffer for issues: Feb 14
- Set return date: Feb 12

### 💡 Tip 5: Cost Tracking
Update estimated cost with actual cost:
- Estimated: ₹50,000
- Actual invoice: ₹52,500
- Helps with budgeting and vendor negotiations

---

## Quick Reference

### Navigation Paths
```
Dashboard → Manufacturing → Outsource Management
OR
/manufacturing/outsource
```

### Tab Shortcuts
- **Active**: See current outsources (press Tab 1)
- **Completed**: See finished outsources (press Tab 2)

### Button Shortcuts
- **+ Create Outsource**: New outsource request
- **[Search icon]**: Quick find
- **[Filter icon]**: Filter by type
- **[Refresh icon]**: Reload data
- **[View Details]**: See full order
- **[Track Outsource]**: Real-time progress

### Keyboard Navigation
- **Tab**: Move between fields
- **Enter**: Submit form
- **Esc**: Close dialog
- **↑ ↓**: Navigate lists

---

## Troubleshooting

### Issue: "Production Order Not Found"
```
Problem: Selected order doesn't load
Solution: 
1. Refresh page (F5)
2. Check if order exists in system
3. Contact admin if issue persists
```

### Issue: "Vendor List Empty"
```
Problem: No vendors to select
Solution:
1. Go to Procurement → Vendors
2. Add new vendors
3. Ensure vendor status is "Active"
4. Return to Outsource Management
```

### Issue: "Create Button Disabled"
```
Problem: Can't submit outsource request
Solution:
1. Fill ALL required fields
2. For partial: Select at least 1 stage
3. Check date is in future
4. Verify all dropdowns have selection
```

### Issue: "Search Not Working"
```
Problem: No results from search
Solution:
1. Click Refresh button
2. Wait for data to load
3. Try different search term
4. Check for typos
```

---

## When to Use What

### Use Full Outsource When:
✅ Vendor has complete production capability
✅ Single vendor relationship preferred
✅ Reduced coordination needed
✅ Order complexity low
✅ Time critical

### Use Partial Outsource When:
✅ Specialized stages needed
✅ In-house capacity available
✅ Cost optimization important
✅ Quality control flexibility needed
✅ Multiple vendor relationships beneficial

---

## Next Steps

1. ✅ **Log in** to Passion ERP
2. ✅ **Navigate** to Outsource Management
3. ✅ **Create** your first outsource request
4. ✅ **Monitor** progress through Operations View
5. ✅ **Track** completion and costs

---

## Support

**Need Help?**
- Check documentation: OUTSOURCE_MANAGEMENT_PAGE_IMPLEMENTATION.md
- Contact Manufacturing Team Lead
- Email: manufacturing@passion-clothing.com
- Internal Chat: #manufacturing-support

**Reporting Issues?**
- Include: Order number, step taken, error message
- Attach: Screenshots if available
- Time: When issue occurred

---

## Summary

| Feature | Purpose | Access |
|---------|---------|--------|
| Create Outsource | New outsource request | [+ Create] button |
| Active Tab | Monitor current outsources | [Active] tab |
| Completed Tab | View finished outsources | [Completed] tab |
| Search | Find specific orders | Search box |
| Filter | Filter by type | Filter dropdown |
| Track | Real-time progress | [Track] button |
| Expand | See order details | Click card |
| Stats | Key metrics | Top of page |

**Happy Outsourcing!** 🚀