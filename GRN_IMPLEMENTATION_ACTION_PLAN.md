# GRN Workflow - Implementation Action Plan
## Specific Code Changes & Enhancement Tasks

**Priority**: Phase-based implementation  
**Estimated Effort**: 10-15 development days  
**Status**: Ready for implementation

---

## 🎯 PHASE 1: VERIFY EXISTING COMPONENTS (Days 1-2)

### Task 1.1: Verify Procurement "Mark as Received" Endpoint
**File**: `server/routes/procurement.js`  
**Location**: Line ~2600 (based on code review)

**Status**: ✅ **VERIFIED - EXISTS**

**What to test**:
```bash
# Test endpoint
PUT /procurement/purchase-orders/:poId/mark-received

# Expected flow:
1. Find PO by ID
2. Check status in ["sent", "acknowledged"]
3. Update PO: status = "received", received_at = NOW()
4. Create Approval record for GRN request
5. Send notifications to inventory + procurement
6. Return success response
```

**Verification Checklist**:
- [ ] PO status updates correctly
- [ ] GRN request Approval record created
- [ ] Notifications sent to inventory department
- [ ] Notifications include action URL
- [ ] Response includes success message

---

### Task 1.2: Verify GRN Request Retrieval Endpoint
**File**: `server/routes/inventory.js`  
**Location**: Line ~1428

**Status**: ✅ **VERIFIED - EXISTS**

**Endpoint**:
```
GET /inventory/grn-requests
GET /inventory/grn-requests/:id
```

**What to test**:
```javascript
// Test flow
1. Fetch pending approvals where entity_type = "grn_creation"
2. Include PO details
3. Return formatted requests with:
   - po_number, vendor_name, po_date
   - expected_delivery_date, total_amount
   - items_count, requested_by, requested_date
   - status, stage_label, assigned_to
```

**Verification Checklist**:
- [ ] Fetches all pending GRN requests
- [ ] Includes PO details correctly
- [ ] Pagination works
- [ ] Filters by status work
- [ ] Includes assigned user info

---

### Task 1.3: Verify GRN Creation from PO
**File**: `server/routes/inventory.js` OR separate `grn.js` routes

**Status**: ✅ **VERIFIED - EXISTS**

**Endpoint**:
```
POST /grn/from-po/:poId
```

**What to test**:
```javascript
// Test 3-way matching:
// 1. Accurate: received === ordered
// 2. Short: received < ordered (auto-generate VR)
// 3. Excess: received > ordered (flag for approval)
```

**Verification Checklist**:
- [ ] Creates GRN with grn_number
- [ ] Performs 3-way matching correctly
- [ ] Detects shortages and creates VR
- [ ] Detects excess and flags for approval
- [ ] Updates PO status appropriately
- [ ] Sends correct notifications

---

### Task 1.4: Verify GRN Excess Approval Endpoints
**File**: `server/routes/inventory.js`

**Status**: ✅ **VERIFIED - EXISTS**

**Endpoint**:
```
POST /grn/:grnId/handle-excess
```

**What to test**:
```javascript
// Option A: Auto-reject
{
  "action": "auto_reject",
  "notes": "Returning excess to vendor"
}
// Result: VR created, GRN status = received

// Option B: Accept
{
  "action": "approve_excess",
  "notes": "Accepting extra stock"
}
// Result: No VR, GRN status = excess_received
```

**Verification Checklist**:
- [ ] Auto-reject creates Vendor Return
- [ ] Auto-reject updates GRN status correctly
- [ ] Accept excess doesn't create VR
- [ ] Accept excess updates GRN status correctly
- [ ] Both options send notifications
- [ ] PO status updates appropriately

---

### Task 1.5: Verify GRN Verification & Add to Inventory
**File**: `server/routes/inventory.js` OR `server/routes/grn.js`

**Status**: ✅ **VERIFIED - EXISTS**

**Endpoints**:
```
PUT /grn/:grnId/verify
POST /grn/:grnId/add-to-inventory
```

**What to test**:
```javascript
// Verify: Check quality and discrepancies
PUT /grn/:grnId/verify
{
  "verification_status": "verified",
  "inspection_notes": "All items OK",
  "discrepancy_details": { ... }
}

// Add to inventory: Create inventory records
POST /grn/:grnId/add-to-inventory
{
  "items": [
    {
      "item_id": 1,
      "stock_type": "project_specific",
      "sales_order_id": 5,
      "warehouse_location": "A-01-05"
    }
  ]
}
```

**Verification Checklist**:
- [ ] Verify updates GRN verification_status
- [ ] Creates inventory records with correct fields
- [ ] Generates barcodes and QR codes
- [ ] Creates InventoryMovement records
- [ ] Updates PO status to completed
- [ ] Sends notifications to all departments

---

## 🎯 PHASE 2: ENHANCE INVENTORY DASHBOARD (Days 3-4)

### Task 2.1: Add GRN Request Card to Inventory Dashboard
**File**: `client/src/pages/dashboards/InventoryDashboard.jsx`

**Current Status**: ✅ **PARTIALLY EXISTS**
- File already fetches GRN requests
- Displays in incoming orders section
- Needs enhancement for visibility and UX

**Changes Needed**:

1. **Add stat card** for GRN requests:
```jsx
// Around line 200
<div className="grid grid-cols-4 gap-4 mb-6">
  <StatCard
    icon={<Package className="w-6 h-6" />}
    title="Incoming GRN Requests"
    value={incomingOrders?.length || 0}
    trend="+2 today"
    color="blue"
  />
  <StatCard
    icon={<AlertTriangle className="w-6 h-6" />}
    title="Pending Verification"
    value={pendingVerificationCount || 0}
    trend="3 overdue"
    color="orange"
  />
  <StatCard
    icon={<Clock className="w-6 h-6" />}
    title="Discrepancies"
    value={discrepancyCount || 0}
    trend="+1 this week"
    color="red"
  />
  <StatCard
    icon={<TrendingUp className="w-6 h-6" />}
    title="Overstock Pending"
    value={overstockCount || 0}
    trend="2 decisions needed"
    color="purple"
  />
</div>
```

2. **Add filter tabs** above incoming requests section:
```jsx
<div className="flex gap-4 mb-4 border-b">
  <button
    className={`px-4 py-2 font-semibold ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
    onClick={() => setActiveTab('all')}
  >
    All Requests ({incomingOrders?.length || 0})
  </button>
  <button
    className={`px-4 py-2 font-semibold ${activeTab === 'high-priority' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600'}`}
    onClick={() => setActiveTab('high-priority')}
  >
    High Priority ({highPriorityCount || 0})
  </button>
  <button
    className={`px-4 py-2 font-semibold ${activeTab === 'assigned' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
    onClick={() => setActiveTab('assigned')}
  >
    Assigned to Me ({assignedToMeCount || 0})
  </button>
</div>
```

3. **Add search and filters** for requests:
```jsx
<div className="flex gap-3 mb-4">
  <input
    type="text"
    placeholder="Search PO number, vendor..."
    className="flex-1 px-4 py-2 border rounded-lg"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  <button className="px-4 py-2 bg-gray-100 border rounded-lg">
    📅 Date Range
  </button>
</div>
```

4. **Enhance request cards** with action buttons:
```jsx
// Each request card should have:
<div className="border rounded-lg p-4 hover:shadow-md transition">
  <div className="flex justify-between items-start mb-3">
    <div>
      <h3 className="font-bold text-lg">{request.po_number}</h3>
      <p className="text-sm text-gray-600">{request.vendor_name}</p>
    </div>
    <span className={`px-3 py-1 rounded-full text-sm font-semibold 
      ${request.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
      {request.status}
    </span>
  </div>
  
  <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
    <div>
      <span className="text-gray-600">Amount</span>
      <p className="font-bold">₹{request.total_amount?.toLocaleString()}</p>
    </div>
    <div>
      <span className="text-gray-600">Items</span>
      <p className="font-bold">{request.items_count}</p>
    </div>
    <div>
      <span className="text-gray-600">Expected</span>
      <p className="font-bold text-sm">{formatDate(request.expected_delivery_date)}</p>
    </div>
    <div>
      <span className="text-gray-600">Requested</span>
      <p className="font-bold text-sm">{formatDate(request.requested_date)}</p>
    </div>
  </div>
  
  <div className="flex gap-2">
    <button 
      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      onClick={() => navigate(`/inventory/grn/create?po_id=${request.po_id}`)}
    >
      <Plus className="w-4 h-4" /> Create GRN
    </button>
    <button 
      className="px-3 py-2 border rounded-lg hover:bg-gray-100"
      onClick={() => viewRequestDetails(request.id)}
    >
      <Eye className="w-4 h-4" />
    </button>
    <button 
      className="px-3 py-2 border rounded-lg hover:bg-gray-100"
    >
      ⋮
    </button>
  </div>
</div>
```

**Frontend Code**:
- Location: `client/src/pages/dashboards/InventoryDashboard.jsx`
- Add state variables for tabs and filters
- Add useEffect to fetch stat counts
- Add filter functions
- Enhance request card rendering
- Add navigation handlers

**Testing Checklist**:
- [ ] Stat cards show correct counts
- [ ] Filter tabs work correctly
- [ ] Search filters results
- [ ] Date range works
- [ ] "Create GRN" button navigates correctly
- [ ] "View Details" opens modal
- [ ] Action menu appears on hover

---

### Task 2.2: Add "Incoming Requests" Tab to Inventory Dashboard
**File**: `client/src/pages/dashboards/InventoryDashboard.jsx`

**Current Status**: ⚠️ **NEEDS WORK**

**Add new tab in tabbed interface**:
```jsx
// Around line 180
const tabs = [
  { label: 'Overview', value: 0 },
  { label: 'Incoming GRN Requests', value: 1 }, // NEW
  { label: 'Pending Verification', value: 2 },  // NEW
  { label: 'Stock Management', value: 3 },
  { label: 'Project Allocation', value: 4 },
  { label: 'Alerts', value: 5 }
];
```

**Tab content for "Incoming GRN Requests"**:
- Full list of pending GRN requests
- Filters and search
- Quick action buttons
- Status indicators

**Tab content for "Pending Verification"**:
- GRNs awaiting quality verification
- Discrepancy indicators
- Approve/Reject buttons
- Notes field

---

## 🎯 PHASE 3: ADD PROCUREMENT DISCREPANCIES TAB (Days 5-6)

### Task 3.1: Create "Material Discrepancies" Tab in Procurement Dashboard
**File**: `client/src/pages/dashboards/ProcurementDashboard.jsx`

**Changes Needed**:

1. **Add new tab to ProcurementDashboard**:
```jsx
// Around line 196 where tabs are defined
const TAB_OPTIONS = [
  { label: 'Overview', value: 0 },
  { label: 'Purchase Orders', value: 1 },
  { label: 'Incoming Orders', value: 2 },
  { label: 'Material Discrepancies', value: 3 }, // NEW
  { label: 'Excess Approvals', value: 4 },       // EXISTING - enhance
  { label: 'Vendor Returns', value: 5 },         // NEW
];
```

2. **Add endpoint to fetch discrepancies**:
```javascript
// New API endpoint needed in procurement.js server route:
GET /procurement/material-discrepancies

// Returns:
{
  "discrepancies": [
    {
      "id": 1,
      "grn_number": "GRN-20250117-00001",
      "po_number": "PO-2025-001",
      "vendor_name": "Precision Textiles",
      "discrepancy_type": "shortage" | "excess",
      "affected_items": 2,
      "total_variance_value": 5000,
      "status": "pending" | "vendor_response_awaiting" | "resolved",
      "created_date": "2025-01-17",
      "vendor_return_id": 1,
      "vendor_return_status": "pending"
    }
  ]
}
```

3. **Create Material Discrepancies tab content**:
```jsx
// In ProcurementDashboard.jsx, add new TabPanel
<TabPanel value={3}>
  <MaterialDiscrepanciesTab 
    discrepancies={discrepancies}
    loading={loading}
    onRefresh={handleRefreshDiscrepancies}
  />
</TabPanel>
```

4. **Create MaterialDiscrepanciesTab component**:
```jsx
// File: client/src/components/procurement/MaterialDiscrepanciesTab.jsx
// Features:
// - List all GRNs with variances
// - Filter by type: Shortage, Excess
// - Filter by status: Pending, Resolved
// - Show vendor return details
// - Show procurement action status
// - Action buttons:
//   ├─ View GRN Details
//   ├─ Follow up with Vendor
//   ├─ View Vendor Return
//   └─ Mark as Resolved
```

**Backend Implementation**:

Add new endpoint in `server/routes/procurement.js`:
```javascript
// Get all GRNs with shortages/excess linked to this procurement's POs
router.get('/material-discrepancies', 
  authenticateToken, 
  checkDepartment(['procurement', 'admin']), 
  async (req, res) => {
    try {
      const { status, type } = req.query; // Optional filters
      
      // Find all GRNs with variances
      const discrepancies = await GoodsReceiptNote.findAll({
        where: {
          // Has items with variances
        },
        include: [
          {
            model: PurchaseOrder,
            as: 'purchaseOrder',
            include: [{ model: Vendor, as: 'vendor' }]
          },
          {
            model: VendorReturn,
            as: 'vendorReturns',
            required: false
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      // Transform and return
      const formatted = discrepancies.map(grn => ({
        id: grn.id,
        grn_number: grn.grn_number,
        po_number: grn.purchaseOrder?.po_number,
        vendor_name: grn.purchaseOrder?.vendor?.name,
        discrepancy_type: calculateVarianceType(grn.items_received),
        affected_items: countVarianceItems(grn.items_received),
        total_variance_value: calculateVarianceValue(grn.items_received),
        status: grn.status,
        vendor_returns: grn.vendorReturns || [],
        created_date: grn.created_at
      }));
      
      res.json({ discrepancies: formatted });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching discrepancies', error: error.message });
    }
  }
);
```

**Testing Checklist**:
- [ ] Tab displays with correct count
- [ ] Fetches all GRNs with discrepancies
- [ ] Filters by type work (Shortage, Excess)
- [ ] Filters by status work
- [ ] Shows vendor return details
- [ ] Action buttons navigate correctly
- [ ] Shows pending vendor responses
- [ ] Shows resolution status

---

### Task 3.2: Add Vendor Returns Tab to Procurement Dashboard
**File**: `client/src/pages/dashboards/ProcurementDashboard.jsx`

**Changes Needed**:

1. **Create VendorReturnsTab component**:
```jsx
// File: client/src/components/procurement/VendorReturnsTab.jsx
// Shows:
// - All vendor returns (shortage, excess, other)
// - VR number, type, vendor, amount
// - Status indicators
// - Related GRN information
// - Vendor response tracking
// - Actions: Follow up, Update status, Receive return
```

2. **Add backend endpoint for vendor returns by procurement**:
```javascript
router.get('/vendor-returns', 
  authenticateToken, 
  checkDepartment(['procurement', 'admin']),
  async (req, res) => {
    // Fetch vendor returns related to current user's POs
    // Include status, reason, amount, vendor response
  }
);
```

**Testing Checklist**:
- [ ] Tab displays all vendor returns
- [ ] Filters by type work
- [ ] Filters by status work
- [ ] Shows vendor response dates
- [ ] Shows debit/credit note status
- [ ] Action buttons work

---

## 🎯 PHASE 4: ENHANCE NOTIFICATIONS (Days 7-8)

### Task 4.1: Create Notification Templates
**File**: Create `server/utils/grnNotificationTemplates.js`

**Template Structure**:
```javascript
// Export notification templates for each stage

exports.MATERIAL_RECEIVED_NOTIFICATION = {
  stage: 'material_received',
  recipients: ['inventory'],
  template: {
    type: 'inventory',
    title: '📦 Materials Received - PO {{po_number}}',
    message: 'Materials from {{vendor_name}} have been received. Action: Create GRN to verify and add to inventory.',
    priority: 'high',
    action_url: '/inventory/grn/create?po_id={{po_id}}',
    expiration: 14 // days
  }
};

exports.GRN_SHORTAGE_NOTIFICATION = {
  stage: 'grn_shortage_detected',
  recipients: ['procurement'],
  template: {
    type: 'grn_discrepancy',
    title: '🔻 Shortage Detected - VR {{vr_number}} Created',
    message: '{{short_qty}} {{unit}} shortage on {{po_number}}. Vendor Return created for {{vendor_name}}. Amount: ₹{{shortage_value}}',
    priority: 'high',
    action_url: '/procurement/vendor-returns/{{vr_id}}',
    expiration: 7
  }
};

exports.GRN_EXCESS_NOTIFICATION = {
  stage: 'grn_excess_detected',
  recipients: ['inventory'],
  template: {
    type: 'grn_excess',
    title: '🔺 Excess Quantity - Decision Required {{grn_number}}',
    message: '{{excess_qty}} {{unit}} excess on {{po_number}}. Select option: Auto-reject or Accept excess.',
    priority: 'high',
    action_url: '/inventory/grn/{{grn_id}}/excess-approval',
    expiration: 2
  }
};

exports.GRN_VERIFIED_NOTIFICATION = {
  stage: 'grn_verified',
  recipients: ['procurement', 'inventory'],
  template: {
    type: 'grn_status',
    title: '✅ GRN Verified - {{grn_number}}',
    message: 'GRN for {{po_number}} has been verified and is ready for inventory addition.',
    priority: 'medium',
    action_url: '/inventory/grn/{{grn_id}}/add-to-inventory',
    expiration: 3
  }
};

exports.GRN_ADDED_TO_INVENTORY_NOTIFICATION = {
  stage: 'grn_added_to_inventory',
  recipients: ['procurement', 'inventory'],
  template: {
    type: 'inventory_update',
    title: '📋 GRN Added to Inventory - {{po_number}} Complete',
    message: 'Materials from {{po_number}} ({{item_count}} items) have been successfully added to inventory.',
    priority: 'low',
    action_url: '/inventory/stock/{{inventory_ids}}',
    expiration: 30
  }
};

exports.PROJECT_MATERIAL_ALLOCATED_NOTIFICATION = {
  stage: 'project_material_allocated',
  recipients: ['project_manager', 'inventory'],
  template: {
    type: 'project_update',
    title: '📦 Materials Received for {{project_name}}',
    message: '{{item_count}} items allocated to {{project_name}} ({{so_number}}). Customer: {{customer_name}}',
    priority: 'medium',
    action_url: '/inventory/project-allocation/{{project_id}}',
    expiration: 7
  }
};
```

### Task 4.2: Use Notification Templates in Workflow
**File**: Update `server/routes/procurement.js` and `server/routes/inventory.js`

**Refactor notifications to use templates**:
```javascript
// Instead of inline notifications, use:
const NotificationTemplates = require('../utils/grnNotificationTemplates');

// When materials marked as received:
await NotificationService.sendFromTemplate(
  NotificationTemplates.MATERIAL_RECEIVED_NOTIFICATION,
  {
    po_number: po.po_number,
    vendor_name: po.vendor.name,
    po_id: po.id
  }
);

// When shortage detected:
await NotificationService.sendFromTemplate(
  NotificationTemplates.GRN_SHORTAGE_NOTIFICATION,
  {
    short_qty: shortageQty,
    unit: item.unit,
    po_number: po.po_number,
    vendor_name: po.vendor.name,
    shortage_value: shortageValue,
    vr_number: vendorReturn.vr_number,
    vr_id: vendorReturn.id
  }
);
```

**Implement sendFromTemplate method**:
```javascript
// In server/utils/notificationService.js
static async sendFromTemplate(template, variables) {
  // Replace {{variable}} with actual values
  const message = replaceVariables(template.template.message, variables);
  const title = replaceVariables(template.template.title, variables);
  const action_url = replaceVariables(template.template.action_url, variables);
  
  // Send to all recipients
  for (const recipient of template.recipients) {
    await this.sendToDepartment(recipient, {
      type: template.template.type,
      title: title,
      message: message,
      priority: template.template.priority,
      action_url: action_url,
      expires_at: new Date(Date.now() + template.template.expiration * 24 * 60 * 60 * 1000)
    });
  }
}
```

**Testing Checklist**:
- [ ] All stage notifications send correctly
- [ ] Variables replaced properly in templates
- [ ] Notifications sent to correct departments
- [ ] Action URLs are valid
- [ ] Expiration dates calculated correctly
- [ ] Priority levels set appropriately

---

## 🎯 PHASE 5: ENHANCE PROJECT ALLOCATION DASHBOARD (Days 9-10)

### Task 5.1: Add Project Stock Allocation Summary
**File**: `client/src/pages/dashboards/InventoryDashboard.jsx` - Add new "Project Allocation" tab

**Features**:
```jsx
// Show per-project:
// - Project name & Sales Order number
// - Customer name
// - Materials allocated count
// - Total budget allocated
// - Consumed amount
// - Remaining budget
// - Budget utilization %
// - Color-coded alerts for over-budget projects

<div className="grid grid-cols-1 gap-4">
  {projects.map(project => (
    <ProjectAllocationCard
      key={project.id}
      project={project}
      onView={() => navigate(`/inventory/project-allocation/${project.sales_order_id}`)}
    />
  ))}
</div>
```

### Task 5.2: Enhance ProjectMaterialDashboard
**File**: `client/src/pages/inventory/ProjectMaterialDashboard.jsx` OR create new component

**Features**:
- List all materials allocated to project
- Show received, consumed, available quantities
- Show budget vs actual cost
- Show consumption timeline
- Alert if over-consuming

---

## 🎯 PHASE 6: TESTING & DOCUMENTATION (Days 11-15)

### Task 6.1: End-to-End Workflow Testing

**Test Scenario 1: Accurate Quantity**
```
1. Create PO with 100m fabric
2. Approve and send PO
3. Mark as received
4. Check GRN request in inventory
5. Create GRN with 100m received
6. Verify no variances
7. Verify quality
8. Add to inventory
9. Check stock created
✓ Expected: GRN completed, stock added, PO closed
```

**Test Scenario 2: Shortage**
```
1. Create PO with 100m fabric
2. Approve and send PO
3. Mark as received (100m expected)
4. Create GRN with 75m received
5. Check Vendor Return auto-generated
6. Check shortage notification to procurement
7. Verify quality on 75m
8. Add 75m to inventory
9. Check procurement receives VR notification
✓ Expected: VR created, 75m added, 25m shortage flagged
```

**Test Scenario 3: Excess - Auto-Reject**
```
1. Create PO with 100m fabric
2. Approve and send PO
3. Mark as received (100m expected)
4. Create GRN with 125m received
5. Check excess flag notification
6. Navigate to excess approval
7. Select "Option A: Auto-Reject"
8. Confirm Vendor Return created for 25m excess
9. Check excess notification to procurement
10. Verify 100m added to inventory only
✓ Expected: VR for excess, 100m in inventory, 25m to return
```

**Test Scenario 4: Excess - Accept**
```
1. Create PO with 100m fabric
2. Approve and send PO
3. Mark as received (100m expected)
4. Create GRN with 125m received
5. Check excess flag notification
6. Navigate to excess approval
7. Select "Option B: Accept"
8. Confirm NO Vendor Return created
9. Check acceptance notification
10. Verify 125m added to inventory
✓ Expected: No VR, 125m in inventory, PO status excess_received
```

**Test Scenario 5: Project Allocation**
```
1. Create PO linked to Sales Order SO-001
2. Receive and create GRN
3. Select "Project Specific" when adding to inventory
4. Specify Sales Order SO-001
5. Check stock appears in project allocation
6. Verify budget tracking
7. Consume materials via MRN
8. Check consumed quantity updates
✓ Expected: Stock allocated to project, consumption tracked
```

### Task 6.2: User Acceptance Testing
- [ ] Procurement team tests marking materials received
- [ ] Inventory team tests creating GRNs
- [ ] Inventory team tests excess approval
- [ ] Inventory team tests adding to inventory
- [ ] Project managers test allocation tracking
- [ ] Procurement team tests vendor return workflows

### Task 6.3: Create User Documentation

**Document 1: Procurement Guide**
```markdown
# GRN Workflow - Procurement Team Guide

## Marking Materials as Received
1. Go to Procurement Dashboard
2. Find PO in "Purchase Orders" tab
3. Click action menu
4. Select "Mark as Received"
5. Confirm
6. ✅ GRN request created automatically
7. Check notification in Inventory Dashboard

## Following Up on Discrepancies
1. Check "Material Discrepancies" tab
2. Review shortages and excesses
3. For shortages: Follow up with vendor
4. For excesses: Monitor inventory decision
5. Update Vendor Return status as needed
```

**Document 2: Inventory Team Guide**
```markdown
# GRN Workflow - Inventory Team Guide

## Creating a GRN
1. See "Incoming GRN Requests" on dashboard
2. Click "Create GRN"
3. Verify received quantities
4. Check for quality issues
5. Submit - system calculates variances

## Handling Excess
1. Receive notification about excess
2. Navigate to "Excess Approval"
3. Review details
4. Choose: Auto-reject OR Accept
5. Submit decision

## Verifying Quality
1. Open GRN from "Pending Verification" tab
2. Check each item
3. Note any damage/defects
4. Approve or flag discrepancies
5. Manager approves if needed

## Adding to Inventory
1. Open verified GRN
2. For each item, select:
   - Stock type (General or Project)
   - Warehouse location
   - Batch number
3. Click "Add to Inventory"
4. ✅ Stock created and ready for use
```

**Document 3: Troubleshooting Guide**
```markdown
# Common Issues & Solutions

## Issue: GRN Request not appearing in Inventory
- Check: PO status should be "received"
- Check: GRN request Approval record exists
- Solution: Manually create from PO if needed

## Issue: Can't add to inventory after verification
- Check: GRN verification_status is "approved"
- Check: All items have been verified
- Solution: Complete verification first

## Issue: Project allocation not updating
- Check: Stock type is "project_specific"
- Check: Sales Order ID is correct
- Solution: Re-add to inventory with correct allocation

## Issue: Notifications not received
- Check: User department setting
- Check: Notification preferences
- Solution: Check notification history in dashboard
```

---

## 📋 IMPLEMENTATION SUMMARY

### Files to Modify:
1. `client/src/pages/dashboards/InventoryDashboard.jsx` - Add GRN request cards & tabs
2. `client/src/pages/dashboards/ProcurementDashboard.jsx` - Add discrepancies tab
3. `server/routes/procurement.js` - Add material discrepancies endpoint
4. `server/utils/grnNotificationTemplates.js` - Create templates file (NEW)
5. `server/utils/notificationService.js` - Add template support

### Files to Create:
1. `client/src/components/procurement/MaterialDiscrepanciesTab.jsx` - NEW
2. `client/src/components/procurement/VendorReturnsTab.jsx` - NEW
3. `client/src/components/inventory/ProjectAllocationCard.jsx` - NEW
4. `server/utils/grnNotificationTemplates.js` - NEW

### Testing Files:
1. `test/grn-workflow.test.js` - E2E tests
2. `test/procurement-discrepancies.test.js` - Procurement tests
3. `test/inventory-allocation.test.js` - Allocation tests

---

## ✅ SUCCESS CRITERIA

### Before Implementation:
- [ ] All existing endpoints verified and working
- [ ] Team trained on current workflow
- [ ] Test data prepared

### After Phase 1 (Verification):
- [ ] All endpoints tested successfully
- [ ] No errors in current workflow
- [ ] Performance acceptable

### After Phase 2 (Inventory Enhancement):
- [ ] GRN requests visible on dashboard
- [ ] Stat cards show correct numbers
- [ ] Filters and search work
- [ ] Navigation to GRN creation works

### After Phase 3 (Procurement Tab):
- [ ] Material Discrepancies tab visible
- [ ] All discrepancies listed correctly
- [ ] Vendor Returns shown
- [ ] Navigation works

### After Phase 4 (Notifications):
- [ ] All notifications send at correct time
- [ ] Template variables replaced correctly
- [ ] Users receive in their department
- [ ] Action URLs valid

### After Phase 5 (Project Allocation):
- [ ] Project allocation visible
- [ ] Budget tracking works
- [ ] Consumption updates real-time
- [ ] Over-budget warnings trigger

### After Phase 6 (Testing & Docs):
- [ ] All workflows tested end-to-end
- [ ] Users trained
- [ ] Documentation complete
- [ ] Ready for production

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] All code reviewed and approved
- [ ] Tests passing (unit + E2E)
- [ ] Performance acceptable
- [ ] Security review completed
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] User training completed
- [ ] Support team trained
- [ ] Monitoring configured
- [ ] Go live date scheduled

---

## 📞 SUPPORT & ESCALATION

**Questions about workflow**?
- Contact: Project Manager
- Time: Within 2 hours

**Technical issues**?
- Contact: Lead Developer
- Slack: #grn-workflow-support

**Production issues**?
- Contact: DevOps Lead
- Escalation: Technical Director

---

**Document Status**: Ready for Implementation  
**Start Date**: [To be scheduled]  
**Expected Completion**: 2-3 weeks  
**Last Updated**: January 2025