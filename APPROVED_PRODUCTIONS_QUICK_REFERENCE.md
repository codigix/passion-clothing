# Approved Productions Tab - Quick Reference

## 🎯 What It Does
Shows all materials that have been approved by management and are ready to start production.

## 📍 Location
**Manufacturing Dashboard → Tab 2: "Approved Productions"**

## 🚀 Quick Access
- Click "Approved Productions" stat card in dashboard header
- Or navigate to "Approved Productions" tab manually

---

## 📊 What You See

### Stat Card
```
┌─────────────────────────────┐
│ Approved Productions    [✓] │
│        5                    │
│ Ready to start production   │
└─────────────────────────────┘
```

### Table View
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Approval No.      Project Name       MRN Request    Materials    Actions    │
├──────────────────────────────────────────────────────────────────────────────┤
│ PRD-APV-2025...   Spring Collection  MRN-2025...    5 items      [Start]    │
│ ✓ Approved        SO: SO-2025-001                   Cotton       [View]     │
│                                                      Thread                  │
│                                                      +3 more                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔘 Actions

### Start Production (Green Button)
**What it does:**
- Opens Production Wizard
- Auto-fills ALL data from approval:
  - Product information
  - Quantity to produce
  - Materials allocated
  - Special instructions
  - Sales order link
- Creates production order with full traceability

**When to use:**
- Ready to begin production immediately
- Materials verified and approved
- Resources available

**Result:**
- Production order created
- Approval marked as "production started"
- Disappears from approved list
- Moves to "Active Orders" tab

### View Details (Gray Button)
**What it does:**
- Shows full approval details
- Displays verification results
- Shows quality check results
- Lists all materials

**When to use:**
- Need to review before starting
- Want to see quality notes
- Need to check material details

**Result:**
- Opens Production Approval page
- Can review and return to dashboard

---

## 📋 Data Displayed

### Approval Number
- Format: `PRD-APV-YYYYMMDD-XXXXX`
- Unique identifier
- Badge shows "✓ Approved" status

### Project Name
- Main project identifier
- Shows linked Sales Order number below
- Example: "Spring Collection 2025 (SO: SO-2025-001)"

### MRN Request
- Material Request Number
- Links to the original material request
- Format: `MRN-YYYYMMDD-XXXXX`

### Materials
- Shows total count (e.g., "5 items")
- Lists first 2 materials by name
- Shows "+X more" if more than 2
- Example:
  ```
  5 items
  Cotton Fabric
  Thread
  +3 more
  ```

### Approved By
- Name of approving manager
- Shows who granted approval

### Approved At
- Date of approval (top line)
- Time of approval (bottom line)
- Example:
  ```
  1/23/2025
  10:30:45 AM
  ```

---

## 🔄 Complete Workflow

```
1. Material Verification ✓
   └─> QC checks passed

2. Production Approval ✓
   └─> Manager approved

3. APPROVED PRODUCTIONS TAB ⭐ (YOU ARE HERE)
   └─> Waiting to start

4. Click "Start Production"
   └─> Opens Production Wizard

5. Production Wizard
   └─> Data auto-filled from approval
   └─> Review and adjust
   └─> Submit

6. Production Order Created ✓
   └─> Approval marked "started"
   └─> Moves to "Active Orders"

7. Production Execution
   └─> Stage-by-stage tracking
```

---

## 💡 Key Benefits

### For Manufacturing Staff
- **Single view** of all approved materials
- **No missed opportunities** - everything in one place
- **Quick start** - one-click to Production Wizard
- **Full context** - see project, materials, approvals
- **No manual data entry** - everything pre-filled

### For Managers
- **Visibility** - see what's approved but not started
- **Tracking** - know what's waiting for production
- **Accountability** - see who approved what and when
- **Traceability** - complete audit trail

---

## 🎨 Visual Indicators

### Badge Colors
- 🟢 **Green**: "✓ Approved" - ready to start
- 🟢 **Green button**: "Start Production" - primary action
- ⚪ **Gray button**: "View Details" - secondary action

### Stat Card Icon
- ☑️ **CheckSquare**: Represents approved/ready status

### Tab Badge
- 🟢 **Green circle**: Shows count of approved productions
- Disappears when count is 0

---

## 🔍 How to Find This Feature

### Navigation Path 1 (Recommended)
1. Open Manufacturing Dashboard
2. Look at stat cards in header
3. Click "Approved Productions" card
4. Tab opens automatically

### Navigation Path 2
1. Open Manufacturing Dashboard
2. Look at tabs below stat cards
3. Click "Approved Productions" tab (2nd tab)
4. View list

---

## ❓ Common Questions

### Q: Why don't I see any approvals?
**A:** Approvals appear here only after:
1. Materials dispatched from inventory
2. Materials received in manufacturing
3. QC verification completed
4. Manager approved the materials
5. Production NOT yet started

### Q: What happens after I click "Start Production"?
**A:** 
1. Production Wizard opens
2. All data auto-filled from approval
3. You review and submit
4. Production order created
5. Approval removed from this list
6. Order appears in "Active Orders" tab

### Q: Can I view an approval without starting production?
**A:** Yes! Click "View Details" button to review without starting.

### Q: How do I know what materials are included?
**A:** 
- Count shown in "Materials" column
- First 2 materials listed
- Click "View Details" for complete list

### Q: Who can access this tab?
**A:** All manufacturing department users can view this tab.

### Q: Can I filter or search the list?
**A:** Currently shows all approved productions sorted by approval date (newest first). Filtering/search may be added in future updates.

---

## 🚨 Important Notes

### Must-Know Facts
1. **Approvals disappear after starting**: Once you start production, the approval is marked and removed from this list
2. **One-time action**: Each approval can only start production once
3. **Pre-filled data**: The wizard gets ALL data from approval - no manual entry needed
4. **Full traceability**: Production order links back to approval for audit trail

### Best Practices
1. **Review before starting**: Click "View Details" if unsure
2. **Check materials**: Verify material list matches requirements
3. **Verify resources**: Ensure workers and machines available before starting
4. **Start promptly**: Don't let approved materials sit idle
5. **Use wizard prefill**: Don't ignore auto-filled data - it's from verified sources

---

## 📱 Mobile/Responsive
- Table scrolls horizontally on mobile
- Stat cards stack vertically
- Buttons remain accessible
- All features available on mobile

---

## 🔗 Related Pages

### Connected Features
- **Production Wizard** (`/manufacturing/production-wizard`) - Create production orders
- **Production Approval** (`/manufacturing/production-approval/:id`) - View approval details
- **Active Orders** (Tab 3) - Track in-progress production
- **Material Receipts** (Tab 2) - Material flow tracking

### Documentation
- `APPROVED_PRODUCTIONS_TAB_IMPLEMENTATION.md` - Full implementation details
- `PRODUCTION_APPROVAL_TO_ORDER_COMPLETE_FLOW.md` - Complete workflow
- `MRN_TO_PRODUCTION_COMPLETE_FLOW.md` - Material flow documentation

---

## 🎯 Quick Actions Cheat Sheet

| Want to... | Click... |
|------------|----------|
| Start production immediately | Green "Start Production" button |
| Review approval details | Gray "View Details" button |
| Create new production order | "Create Production Order" header button |
| Refresh the list | Navigate away and back (auto-refreshes) |
| See material details | Click "View Details" |
| Navigate to Active Orders | Click "Active Orders" tab (Tab 3) |

---

## ✅ Success Criteria

You know the feature is working when:
1. ✅ Stat card shows count matching table rows
2. ✅ Tab badge shows same count as stat card
3. ✅ "Start Production" opens wizard with data
4. ✅ Approval disappears after starting production
5. ✅ Empty state shows when no approvals exist
6. ✅ All columns display correct information
7. ✅ "View Details" navigates to approval page

---

*Quick Reference Guide - Manufacturing Department*  
*Last Updated: January 2025*