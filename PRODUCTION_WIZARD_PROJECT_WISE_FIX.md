# Production Wizard - Project-Wise Order Selection Fix ✅

## Overview
The Production Wizard's order selection step now displays approvals **grouped by project (sales order)** instead of flat individual approvals. This matches the project-wise restructuring in ProductionOrdersPage and provides a clearer, more intuitive workflow.

---

## What Changed

### 1. **New State Variable** 
```javascript
const [approvedOrdersGrouped, setApprovedOrdersGrouped] = useState([]); // Project-wise grouped orders
```
- Stores approvals grouped by sales order/project
- Complements existing `approvedOrders` (flat list) for backward compatibility

### 2. **Enhanced `fetchApprovedOrders()` Function**
**Location**: `ProductionWizardPage.jsx` lines 609-657

**Changes**:
- Groups all approvals by `sales_order.order_number` (project key)
- Creates project objects with:
  - `projectKey`: Unique identifier (SO number)
  - `projectName`: Sales order number
  - `salesOrderId`: Linked sales order ID
  - `customerName`: Customer from sales order
  - `approvals`: Array of all approvals for this project
  - `totalMaterials`: Count of materials across all approvals

**Code**:
```javascript
const groupedByProject = {};

approvals.forEach(approval => {
  const salesOrder = approval.mrnRequest?.salesOrder;
  const projectKey = salesOrder?.order_number || salesOrder?.id || 'Unknown';
  
  if (!groupedByProject[projectKey]) {
    groupedByProject[projectKey] = {
      projectKey,
      projectName: salesOrder?.order_number || 'N/A',
      salesOrderId: salesOrder?.id,
      customerName: salesOrder?.customer?.name || 'Unknown',
      approvals: [],
      totalMaterials: 0,
    };
  }
  
  groupedByProject[projectKey].approvals.push(approval);
  const materialsCount = approval.verification?.receipt?.received_materials?.length || 0;
  groupedByProject[projectKey].totalMaterials += materialsCount;
});

const groupedProjects = Object.values(groupedByProject);
setApprovedOrdersGrouped(groupedProjects);
```

### 3. **Completely Redesigned `OrderSelectionStep` Component**
**Location**: `ProductionWizardPage.jsx` lines 1941-2151

**New Features**:

#### A. **Project Cards with Expandable Approvals**
- Each project displayed as a clickable card showing:
  - 📦 Project name (SO number)
  - 👤 Customer name
  - Badge: Number of approvals
  - Badge: Total materials count

#### B. **Collapsible Approval List**
- Click project card to expand/collapse
- Shows all approvals within project as sub-items
- Each approval shows:
  - Approval ID
  - Receipt number
  - Material count badge
  - Highlight when selected

#### C. **Enhanced UI/UX**
- Visual hierarchy with color coding:
  - Blue theme for selected project
  - Gray theme for unselected
  - Green badges for materials
  - Blue badges for approval counts
- Smooth transitions and hover effects
- Max-height scrollable list for many projects
- Loading spinner while fetching
- Empty state with helpful message

#### D. **Improved User Flow**
```
1. User sees list of projects
2. Clicks project to expand
3. Views all approvals in that project
4. Selects specific approval (or auto-first when expanding)
5. Clicks "Load Order Details" to fetch data
6. Materials from all approvals auto-merge when project is from ProductionOrdersPage
```

### 4. **Backward Compatibility**
- Old single-approval flow still works via URL parameter: `?approvalId=123`
- Project-wise flow via: `?projectApprovals=id1,id2,id3&salesOrderId=123`
- Both flows supported in existing useEffect handlers

---

## User Experience Changes

### Before
```
Approved Order dropdown:
- Approval #1 • SO-001 • Customer A • Qty: 50
- Approval #2 • SO-001 • Customer A • Qty: 50  ← Same project, different row!
- Approval #3 • SO-002 • Customer B • Qty: 30
```
❌ No indication that approvals 1-2 belong to same project
❌ User must understand relationship manually
❌ Confusing to select which approval when multiple for same project

### After
```
Projects with Approvals:
┌─────────────────────────────────────────┐
│ 📦 SO-001                  ▾           │
│ 👤 Customer A  • 2 approvals • 45 items│
└─────────────────────────────────────────┘
  ├─ Approval #1 • Receipt: RCP-001 • 25 items ✓
  └─ Approval #2 • Receipt: RCP-002 • 20 items

┌─────────────────────────────────────────┐
│ 📦 SO-002                              │
│ 👤 Customer B  • 1 approval  • 30 items│
└─────────────────────────────────────────┘
```
✅ Clear project grouping
✅ Approval count visible at glance
✅ Material count per project
✅ Intuitive hierarchy

---

## Integration Points

### 1. **From ProductionOrdersPage**
When user clicks "Create Production Order" on project card:
```
ProductionOrdersPage
  ↓
  Navigates to wizard with: ?projectApprovals=id1,id2&salesOrderId=123
  ↓
ProductionWizardPage
  ↓
  Line 969-1065: useEffect detects projectApprovals parameter
  ↓
  - Fetches all approvals in parallel
  - Extracts project details from first approval
  - Merges materials from all approvals using Map
  - Pre-fills form with SO, customer, dates, materials
  ↓
  User sees fully pre-filled form
```

### 2. **Standalone Wizard Access**
When user enters `/manufacturing/wizard` directly:
```
OrderSelectionStep renders
  ↓
  User selects project from grouped list
  ↓
  User clicks specific approval
  ↓
  User clicks "Load Order Details"
  ↓
  Single approval's data loaded and form pre-filled
```

### 3. **Legacy Single-Approval Flow**
When URL parameter: `?approvalId=123`:
```
Existing useEffect (line 958-966) handles it
  ↓
  Fetches single approval details
  ↓
  Pre-fills form with that approval's data
  ↓
  Works as before
```

---

## Technical Implementation

### State Management
```javascript
// New state in ProductionWizardPage
const [approvedOrdersGrouped, setApprovedOrdersGrouped] = useState([]);

// Updated in fetchApprovedOrders()
setApprovedOrdersGrouped(groupedProjects);

// Passed to OrderSelectionStep
<OrderSelectionStep
  approvedOrdersGrouped={approvedOrdersGrouped}
  ...
/>
```

### Component Updates
```javascript
// OrderSelectionStep receives grouped data
const OrderSelectionStep = ({
  approvedOrdersGrouped,  // ← NEW: Project-wise grouped approvals
  ...
})

// Local state for expansion
const [expandedProject, setExpandedProject] = useState(null);

// Click handler for project
const handleProjectSelect = (project) => {
  if (expandedProject?.projectKey === project.projectKey) {
    setExpandedProject(null);
  } else {
    setExpandedProject(project);
    // Auto-select first approval in project
    if (project.approvals?.length > 0) {
      setValue('orderSelection.productionApprovalId', project.approvals[0].id);
    }
  }
};
```

---

## Testing Checklist

### ✅ Project Grouping
- [ ] Wizard loads with multiple projects
- [ ] Each project shows correct approval count
- [ ] Material count sums across all approvals
- [ ] Customer name displays correctly

### ✅ Expansion Behavior
- [ ] Clicking project expands to show approvals
- [ ] First approval auto-selected when expanded
- [ ] Clicking again collapses project
- [ ] Only one project expanded at a time

### ✅ Approval Selection
- [ ] Clicking approval highlights it
- [ ] Selected approval ID stored in form
- [ ] "Load Order Details" button becomes active when approval selected
- [ ] Button text changes to "Loading..." while fetching

### ✅ Wizard Flow from ProductionOrdersPage
- [ ] Click "Create Production Order" on project card
- [ ] Wizard opens with `?projectApprovals=id1,id2&salesOrderId=123`
- [ ] Console shows: `✅ Loaded X approvals for project`
- [ ] Console shows: `📦 Merged X materials → Y unique items`
- [ ] Form pre-filled with:
  - [ ] Sales order ID
  - [ ] Customer name
  - [ ] Planned end date
  - [ ] All materials merged (no duplicates)

### ✅ Single Approval Selection (Wizard Only)
- [ ] Select project from wizard dropdown
- [ ] Expand project
- [ ] Click specific approval
- [ ] Click "Load Order Details"
- [ ] Only that approval's data loaded
- [ ] Form populated correctly

### ✅ Backward Compatibility
- [ ] Legacy `?approvalId=123` flow still works
- [ ] Old flat approval list still available in code
- [ ] Both flows don't conflict

### ✅ Empty State
- [ ] When no approved projects exist
- [ ] Shows: "📭 No approved projects found..."
- [ ] Message is helpful and guides user

### ✅ Loading State
- [ ] Shows spinner + text while fetching
- [ ] Spinner uses blue color
- [ ] Text is clear: "Loading approved projects..."

---

## Console Logs for Debugging

When wizard is used, check console for these logs:

### From `fetchApprovedOrders()`
```
✅ Grouped 5 approvals into 2 projects
```

### From `OrderSelectionStep`
```
🚀 Project selected: SO-001
✅ Approval selected: 42
```

### From ProjectApprovals useEffect
```
🚀 Loading project-wise approvals: 42,43,44
✅ Loaded 3 approvals for project
📦 Merged 45 materials → 35 unique items
```

---

## Files Modified

### Primary Changes
- **ProductionWizardPage.jsx**
  - Lines 465: Added `approvedOrdersGrouped` state
  - Lines 609-657: Enhanced `fetchApprovedOrders()` with grouping logic
  - Lines 1437-1446: Updated OrderSelectionStep props
  - Lines 1467: Updated useMemo dependency array
  - Lines 1941-2151: Complete redesign of `OrderSelectionStep` component

### No Changes Needed
- ✅ ProductionOrdersPage.jsx (already working)
- ✅ Backend endpoints (using existing APIs)
- ✅ Database schema (no migrations needed)

---

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **UI Display** | Flat list | Grouped by project |
| **Clarity** | Ambiguous relationships | Clear hierarchy |
| **Material Count** | Hidden | Visible per project |
| **Approval Count** | Unclear | Visible badge |
| **User Clicks** | More manual | Clearer intent |
| **Error Prone** | Yes (easy to select wrong) | No (projects clearly marked) |
| **Mobile-Friendly** | Scrollable list | Collapsible groups |
| **Performance** | O(n) lookups | O(1) with grouping |

---

## Future Enhancements

1. **Search/Filter Projects**
   - Add search box to filter by project name or customer
   - Real-time filtering with debounce

2. **Sort Projects**
   - By date created (newest first)
   - By customer name (A-Z)
   - By material count (ascending/descending)

3. **Batch Approval Selection**
   - Allow selecting multiple projects at once
   - Create merged production order from multiple projects
   - Enhanced bulk workflow

4. **Project Details Modal**
   - Click project to see full details
   - Show approval timeline
   - Show material breakdown

5. **Materials Preview**
   - Expand project to show material summary
   - Inline preview of materials without going to form

---

## Rollout Plan

### Phase 1: Deploy
- [ ] Push code changes
- [ ] Deploy to staging
- [ ] Run test checklist above

### Phase 2: User Testing
- [ ] Internal team tests wizard
- [ ] Verify all flows work
- [ ] Check console logs for errors
- [ ] Test on mobile devices

### Phase 3: Production Release
- [ ] Monitor error logs
- [ ] Check user feedback
- [ ] Monitor performance metrics
- [ ] Be ready to roll back if needed

### Phase 4: Documentation
- [ ] Update user guides
- [ ] Create tutorial screenshots
- [ ] Share with team

---

## Rollback Plan

If issues found:
```bash
# Revert ProductionWizardPage.jsx to previous version
git revert <commit-hash>

# OR manually comment out lines 465, 609-657, 1941-2151
# And use original flat approvals list
```

The system remains backward compatible, so old flows will continue working even with new code.

---

## Success Criteria

✅ **Achieved**:
- Project-wise grouping in wizard
- Expandable/collapsible approval lists
- Material count per project
- Approval count per project
- Clear visual hierarchy
- Backward compatible flows
- No breaking changes

**Status**: ✅ **READY FOR TESTING**

---

## Related Documentation

- `APPROVED_PRODUCTIONS_PROJECT_WISE_RESTRUCTURE.md` - ProductionOrdersPage changes
- `APPROVED_PRODUCTIONS_QUICK_START.md` - Testing guide
- `PRODUCTION_WIZARD_QUICK_FIX.md` - Quick reference guide
