# Project-Based Tracking Implementation - Complete Guide

## Overview
This document outlines the comprehensive system-wide changes to implement **project name as the primary key** for all data fetching and tracking across the manufacturing module. The project name (created during Sales Order creation as "Project / Order Title") is now the central identifier.

---

## Changes Summary

### 1. **Production Wizard (ProductionWizardPage.jsx)** ✅ COMPLETED

#### What Changed:
- **Removed**: Product selection boxes (Primary Product & Associated Products)
- **Removed**: Product validation schema requirements
- **Kept**: Materials auto-loaded from the project (sales order)
- **Result**: Simplified form that uses project name only as primary selection

#### Key Modifications:

**Before:**
```
Materials Tab had:
- Primary Product dropdown (REQUIRED)
- Associated Products multi-select (REQUIRED)
- Product selection validation
```

**After:**
```
Materials Tab now has:
- No product selection
- Materials auto-load from project
- Only material verification (quantity, unit, status)
- Project name = primary identifier
```

#### Schema Changes:
- ❌ Removed `productId` from `orderDetailsSchema`
- ❌ Removed `productIds` from `materialsSchema`
- ✅ Kept materials items array (for verification only)

#### Code Changes:
1. Line 45: Removed `productIds` requirement from materialsSchema
2. Line 93: Removed `productId` requirement from orderDetailsSchema
3. Line 178-195: Cleaned up default values - removed all product references
4. Line 1963-1988: Removed product selection UI from MaterialsStep component
5. Line 811-820: Removed product ID auto-fill logic
6. Line 927: Removed product change watchers

#### How It Works Now:
```
User Flow:
1. Select approved order (project name) → Order Selection step
2. Materials auto-load from sales order/production request
3. Verify materials → Materials step
4. Complete remaining steps (quality, team, scheduling, etc.)
5. Submit production order
```

---

### 2. **Production Dashboard (ProductionDashboardPage.jsx)** ✅ COMPLETED

#### What Changed:
- **Added**: Stage-by-stage tracking table view
- **Added**: Toggle between Cards and Table view
- **Added**: Start/Pause/Complete buttons for stages
- **Added**: Real-time stage progress tracking

#### New Features:

**Stage Tracking Table Columns:**
| Column | Details |
|--------|---------|
| **Project** | Production number + Sales order reference |
| **Stage** | Current/active stage name |
| **Status** | pending, in_progress, on_hold, completed |
| **Progress** | Visual progress bar + status text |
| **Quantities** | Processed, Approved, Rejected counts |
| **Start Time** | When stage began (formatted date/time) |
| **End Time** | When stage ended or "In Progress" |
| **Actions** | Start, Pause, Complete buttons |

#### Code Added:
1. **State Management** (Line 12-13):
   ```javascript
   const [activeTab, setActiveTab] = useState('cards');
   const [stageActionLoading, setStageActionLoading] = useState({});
   ```

2. **Stage Action Handler** (Line 52-74):
   ```javascript
   const handleStageAction = async (stageId, action) => {
     // Handles: start, pause, stop, complete
     // Updates stage status in real-time
     // Refreshes data after action
   }
   ```

3. **StageTrackingTable Component** (Line 162-260):
   - Displays only currently active stage per order
   - Shows all required tracking information
   - Includes action buttons with loading states

4. **View Toggle** (Line 376-390):
   - Cards View: Display as cards (original)
   - Table View: Display as comprehensive table

#### How It Works:
```
Desktop:
- Click "Table View" button
- See all active orders with their current stage
- Click Start/Pause/Complete to manage stages
- Real-time updates after actions

Mobile:
- Cards View is more mobile-friendly
- Table View available with horizontal scroll
```

#### Database Integration:
- Fetches from `/manufacturing/orders?page=1&limit=20`
- Updates stages via `PATCH /manufacturing/stages/{stageId}`
- Status mapping: start→in_progress, pause→on_hold, complete→completed

---

### 3. **Production Tracking Page (ProductionTrackingPage.jsx)** 🔄 READY FOR ENHANCEMENT

#### Current Status:
- Uses mock data for fallback
- Can be enhanced to use project name as primary key

#### Recommended Enhancements (Next Phase):
```
1. Add project name selector at top
2. Fetch all production orders for that project
3. Show stage-by-stage breakdown
4. Link to production operations view
5. Show real-time stage tracking similar to dashboard
```

---

## Data Flow Architecture

### Project-Based Identification

```
Sales Order (Project/Order Title)
    ↓
Production Order (project_reference = sales order number)
    ↓
Production Stages (linked via production_order.id)
    ↓
Materials (fetched from MRN/Inventory for that project)
    ↓
All Tracking & Reporting (project-centric)
```

### Fetch Patterns

**Production Wizard:**
```javascript
// Select project/approved order
const approvalId = watch('orderSelection.productionApprovalId');

// Auto-load materials for that project
const materials = approvalOrder?.mrnRequest?.materials_requested;

// Submit with project reference
POST /manufacturing/orders {
  production_approval_id: approvalId,
  project_reference: approvalOrder?.salesOrder?.order_number,
  materials: materials // auto-filled
}
```

**Production Dashboard:**
```javascript
// Fetch all active production orders
GET /manufacturing/orders?page=1&limit=20

// Show their current stages
activeStage = order.stages?.find(s => s.status === 'in_progress') 
  || order.stages?.[0];

// Update stage status
PATCH /manufacturing/stages/{stageId} { status: 'in_progress' }
```

---

## Key Implementation Details

### 1. Material Auto-Loading
**How it works:**
- User selects approved production order in Order Selection step
- System fetches that order's materials from `mrnRequest`
- Materials auto-populate in Materials step
- User only verifies quantities, not product selection
- Project name is the key

### 2. Project as Primary Key
**Benefits:**
- All related data centralized under one project
- Single point of reference for reports
- Easier to track related orders
- Consistent across all modules

**Usage across system:**
```
Sales Order: order_number = "SO-001"
Production Approval: contains SO-001 reference
Production Order: project_reference = "SO-001"
Production Stages: linked to production_order
Inventory Dispatch: for "SO-001"
Manufacturing Receipt: for "SO-001"
Quality Control: for "SO-001"
```

### 3. Stage Management
**Status Transitions:**
```
pending → in_progress (Start button)
in_progress → on_hold (Pause button)
in_progress → completed (Complete button)
on_hold → in_progress (Resume button)
on_hold → completed (Complete button)
```

**Real-time Updates:**
- Table shows only active stage per order
- Status updates instantly after button click
- Data refreshes from API
- UI reflects new status with appropriate color coding

---

## Testing Checklist

### Production Wizard
- [ ] Product selection boxes removed
- [ ] Product validation not blocking form
- [ ] Materials auto-load from selected project
- [ ] Form can be submitted without product selection
- [ ] Project name correctly passed to backend

### Production Dashboard

**Cards View:**
- [ ] Shows production cards normally
- [ ] View toggle works
- [ ] Cards show correct order info

**Table View:**
- [ ] View toggle to table works
- [ ] Only active stages shown
- [ ] All columns display correctly
- [ ] Start button works on pending stages
- [ ] Pause button works on in_progress stages
- [ ] Complete button works on in_progress stages
- [ ] Loading states show during actions
- [ ] Data refreshes after each action
- [ ] Action buttons disabled while loading
- [ ] Times format correctly

**Modal:**
- [ ] Click "View" opens production order modal
- [ ] Modal scrolls properly
- [ ] Modal closes when clicking Close
- [ ] Real data displays in modal
- [ ] All stages shown in modal

### Production Tracking
- [ ] Can be accessed from Production Dashboard
- [ ] Shows project-based data
- [ ] Stage tracking displays correctly
- [ ] Edit modal functions properly

---

## File Changes Summary

### Modified Files:
1. **`client/src/pages/manufacturing/ProductionWizardPage.jsx`** (2397 → ~2350 lines)
   - Removed product selection schema requirements
   - Removed product selection UI
   - Removed product watchers and validation
   - Simplified materials step description

2. **`client/src/pages/manufacturing/ProductionDashboardPage.jsx`** (359 → ~460 lines)
   - Added stage action handler
   - Added stage tracking table component
   - Added view toggle buttons
   - Enhanced active orders section

### New Documentation:
- This file: `PROJECT_BASED_TRACKING_IMPLEMENTATION.md`

---

## Database Schema Notes

### Key Fields for Project Tracking:
```sql
-- SalesOrder
- order_number (used as project identifier)
- project_title / order_title (display name)

-- ProductionOrder
- project_reference (links to SalesOrder.order_number)
- production_approval_id (links to ProductionApproval)

-- ProductionStage
- production_order_id (links to ProductionOrder)
- stage_name (cutting, stitching, etc.)
- status (pending, in_progress, on_hold, completed)
- start_time, end_time (tracking)
- quantity_processed, quantity_approved, quantity_rejected

-- MaterialDispatch/MRN
- sales_order_id / project_reference
- materials_requested / materials_dispatched
```

---

## API Endpoints Used

### Current Integration:
```
GET /manufacturing/orders?page=1&limit=20
  ↳ Fetch all production orders with related stages

PATCH /manufacturing/stages/{stageId}
  ↳ Update stage status (start, pause, complete)

GET /manufacturing/approvals?limit=50&status=approved
  ↳ Fetch approved production requests for wizard

POST /manufacturing/orders
  ↳ Create new production order with project reference
```

### Expected Fields in Response:
```javascript
{
  productionOrders: [{
    id,
    production_number,
    project_reference, // "SO-001"
    status,
    priority,
    quantity,
    produced_quantity,
    approved_quantity,
    rejected_quantity,
    planned_end_date,
    salesOrder: {
      order_number,
      customer: { name }
    },
    stages: [{
      id,
      stage_name,
      status,
      quantity_processed,
      quantity_approved,
      quantity_rejected,
      start_time,
      end_time
    }]
  }]
}
```

---

## Deployment Checklist

- [ ] Backend confirms project_reference field in production_orders
- [ ] Backend has PATCH /manufacturing/stages/{id} endpoint
- [ ] Materials auto-load working with project reference
- [ ] All API responses include required fields
- [ ] Database migration completed for any schema changes
- [ ] Test with real project data
- [ ] Verify stage transitions on backend
- [ ] Check role-based access for stage actions

---

## Performance Optimizations

### Implemented:
- ✅ Parallel API calls in wizard (faster data loading)
- ✅ Single-stage display in table (reduced DOM elements)
- ✅ Lazy loading of modals
- ✅ Debounced field watchers removed (faster form)

### Recommended for Phase 2:
- [ ] Implement pagination for large datasets
- [ ] Add caching for order data
- [ ] Implement WebSocket for real-time stage updates
- [ ] Add batch update for multiple stage actions

---

## User Experience Flow

### Production Wizard
```
Step 1: Select Order
  ↓ (user selects project/approved order)
Step 2: Project loaded with auto-materials
  ↓ (materials auto-populated from project)
Step 3: User verifies quantities
  ↓ (no product selection needed)
Step 4-7: Complete remaining steps
  ↓
Submit: Production order created with project reference
```

### Production Dashboard
```
View: Active Production Orders (Cards/Table)
  ├─ Cards View: Visual cards for quick overview
  └─ Table View: Detailed stage-by-stage tracking
     ├─ See all stages for all projects
     ├─ Identify bottlenecks
     ├─ Take quick actions (Start/Pause/Complete)
     └─ Real-time status updates
```

---

## Known Limitations & Future Enhancements

### Current Limitations:
1. Product name for project not displayed (only project number shown)
2. Stage comments/notes not shown in table view
3. No bulk actions on multiple stages
4. No stage history view
5. No predictive analytics

### Future Enhancements (Phase 2+):
- [ ] Show actual project title from sales order
- [ ] Add stage comments visible in table/modal
- [ ] Bulk stage actions
- [ ] Stage history timeline
- [ ] Performance analytics
- [ ] Automated stage progression
- [ ] Material cost tracking
- [ ] Quality metrics dashboard

---

## Support & Troubleshooting

### Issue: Product selection boxes still showing
**Solution:** Clear browser cache and reload page. Check that ProductionWizardPage.jsx changes are deployed.

### Issue: Materials not auto-loading
**Solution:** Check that approval order has mrnRequest with materials_requested. Verify API response structure.

### Issue: Stage action buttons not working
**Solution:** Check backend for PATCH /manufacturing/stages/{id} endpoint. Verify user permissions.

### Issue: Table view showing empty
**Solution:** Check if orders have stages populated. Verify API response includes stages array.

---

## Questions & Feedback

For any questions or issues regarding this implementation, please refer to:
- Backend team: Verify API endpoints and project_reference handling
- Database team: Confirm schema supports project-based queries
- QA team: Use testing checklist above for validation

---

**Last Updated:** January 2025
**Status:** ✅ Ready for Testing
**Version:** 1.0