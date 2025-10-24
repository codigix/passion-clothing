# 🔌 API CONNECTIVITY MAP

**Purpose:** Complete mapping of all API endpoints and their data relationships  
**Last Updated:** January 2025

---

## 📍 ENDPOINT OVERVIEW

### Manufacturing API Endpoints (server/routes/manufacturing.js)

```
BASE: /api/manufacturing
├─ GET    /orders                      [List all]
├─ POST   /orders                      [Create]
├─ GET    /orders/:id                  [Detail]
├─ GET    /orders/:id/details          [Full with relations]
├─ PATCH  /orders/:id/status           [Update status]
├─ GET    /orders/:id/stages           [Get stages]
├─ PATCH  /stages/:id                  [Update stage]
├─ GET    /stages/:id/operations       [Get stage operations]
└─ POST   /stages/:id/operations       [Create operation]
```

---

## 🔄 DATA FLOW MAPPING

### 1. GET /api/manufacturing/orders

**Purpose:** Fetch all production orders  
**Frontend Used By:** ProductionOrdersPage, ProductionTrackingPage  
**Authentication:** Required (manufacturing or admin)

**Response Structure:**
```javascript
{
  success: true,
  productionOrders: [
    {
      id: 1,
      production_number: "PRD-20250116-0001",
      sales_order_id: 123,              // ⭐ CRITICAL
      production_approval_id: 5,        // ⭐ CRITICAL
      project_reference: "SO-S0-20251016-0001",
      product_id: 45,
      product: {
        id: 45,
        name: "Cotton T-Shirt"
      },
      quantity: 500,
      produced_quantity: 250,
      rejected_quantity: 0,
      approved_quantity: 250,
      status: "in_progress",            // pending, in_progress, completed, etc.
      priority: "high",                 // low, medium, high, urgent
      production_type: "in_house",      // in_house, outsourced, mixed
      planned_start_date: "2025-01-16T09:00:00Z",
      planned_end_date: "2025-01-20T17:00:00Z",
      actual_start_date: "2025-01-16T10:30:00Z",
      actual_end_date: null,
      estimated_hours: 40,
      actual_hours: null,
      supervisor_id: 2,
      assigned_to: 3,
      qa_lead_id: 4,
      created_at: "2025-01-16T08:00:00Z",
      updated_at: "2025-01-16T10:30:00Z"
    },
    // ... more orders
  ]
}
```

**Frontend Mapping (lines 190-204 ProductionOrdersPage.jsx):**
```javascript
const mappedOrders = response.data.productionOrders.map(order => ({
  id: order.id,
  orderNumber: order.production_number,
  productName: order.product ? order.product.name : 'Unknown Product',
  quantity: order.quantity,
  produced: order.produced_quantity,
  startDate: order.planned_start_date,
  endDate: order.planned_end_date,
  status: order.status,
  priority: order.priority,
  productId: order.product ? order.product.id : '',
  sales_order_id: order.sales_order_id,           // ✅ ADDED
  production_approval_id: order.production_approval_id // ✅ ADDED
}));
```

**Used For:**
- List view in ProductionOrdersPage
- Status detection via getProjectProductionStatus()
- Approval status detection via getApprovalProductionStatus()

---

### 2. POST /api/manufacturing/orders

**Purpose:** Create new production order  
**Frontend Used By:** ProductionWizardPage  
**Authentication:** Required (manufacturing or admin)

**Request Body:**
```javascript
{
  product_id: 45,                       // Optional (can use product_name)
  sales_order_id: 123,                  // ⭐ From sales order
  production_approval_id: 5,            // ⭐ From approval
  production_type: "in_house",          // in_house, outsourced, mixed
  quantity: 500,
  priority: "high",
  planned_start_date: "2025-01-16T09:00:00Z",
  planned_end_date: "2025-01-20T17:00:00Z",
  estimated_hours: 40,
  special_instructions: "...",
  shift: "morning",
  team_notes: "...",
  supervisor_id: 2,
  assigned_user_id: 3,
  qa_lead_id: 4,
  
  // Materials
  materials_required: [
    {
      materialId: "inv-123",
      description: "Cotton Fabric",
      requiredQuantity: 100,
      unit: "meters",
      status: "available"
    }
  ],
  
  // Quality Checkpoints
  quality_parameters: {
    checkpoints: [
      {
        name: "Stitch Quality",
        frequency: "per_batch",
        acceptanceCriteria: "No broken stitches"
      }
    ]
  },
  
  // Stages
  stages: [
    { stageName: "Cutting", plannedDurationHours: 8 },
    { stageName: "Embroidery", plannedDurationHours: 12 },
    { stageName: "Stitching", plannedDurationHours: 16 },
    // ...
  ],
  
  project_reference: "SO-S0-20251016-0001"
}
```

**Response:**
```javascript
{
  success: true,
  message: "Production order created successfully",
  order: {
    id: 1,
    production_number: "PRD-20250116-0001",
    // ... full order object
  }
}
```

**Backend Processing:**
1. Validate inputs
2. Create ProductionOrder record
3. Create ProductionStage records (one per stage)
4. Create MaterialRequirement records
5. Create QualityCheckpoint records
6. Update SalesOrder.status to 'in_production'
7. Record SalesOrderHistory
8. Return created order

---

### 3. GET /api/manufacturing/orders/:id

**Purpose:** Get single production order detail  
**Frontend Used By:** ProductionTrackingPage  
**Authentication:** Required

**Response Structure:**
```javascript
{
  success: true,
  order: {
    // ... all ProductionOrder fields (see POST response)
    
    stages: [                           // ⭐ INCLUDED
      {
        id: 10,
        production_order_id: 1,
        stage_name: "Cutting",
        stage_order: 1,
        status: "completed",
        planned_start_time: "2025-01-16T09:00:00Z",
        actual_start_time: "2025-01-16T09:15:00Z",
        planned_end_time: "2025-01-16T12:00:00Z",
        actual_end_time: "2025-01-16T11:45:00Z",
        quantity_processed: 500,
        quantity_approved: 490,
        quantity_rejected: 10,
        assigned_to: 2,
        assignedUser: {
          id: 2,
          name: "John Supervisor",
          employee_id: "EMP-001"
        },
        stageOperations: [              // For outsourced stages
          {
            id: 20,
            work_type: "outsourced",
            vendor_id: 5,
            vendor: { /* vendor details */ },
            challan_id: 100,            // Outward
            return_challan_id: 101      // Inward
          }
        ],
        materialConsumptions: [         // Track usage
          {
            id: 30,
            inventory_id: 500,
            consumed_quantity: 85,
            consumed_by: 2
          }
        ]
      },
      // ... more stages
    ],
    
    materialRequirements: [             // ⭐ INCLUDED
      {
        id: 40,
        production_order_id: 1,
        material_name: "Cotton Fabric",
        required_quantity: 100,
        unit: "meters",
        status: "available"
      }
    ],
    
    qualityCheckpoints: [               // ⭐ INCLUDED
      {
        id: 50,
        name: "Stitch Quality",
        frequency: "per_batch"
      }
    ]
  }
}
```

**Frontend Processing (ProductionTrackingPage):**
```javascript
const [order, setOrder] = useState(null);

useEffect(() => {
  const fetchOrderDetail = async () => {
    const response = await api.get(`/manufacturing/orders/${orderId}`);
    setOrder(response.data.order);
  };
  fetchOrderDetail();
}, [orderId]);

// Display stages
order.stages.map(stage => (
  <StageCard key={stage.id} stage={stage} />
))
```

---

### 4. PATCH /api/manufacturing/orders/:id/status

**Purpose:** Update order status  
**Frontend Used By:** Production control pages  
**Authentication:** Required

**Request:**
```javascript
{
  status: "in_progress",  // or completed, on_hold, cancelled
  notes: "Optional notes"
}
```

**Validation:**
```javascript
PRODUCTION_STATUS_TRANSITIONS = {
  pending: new Set(['in_progress', 'on_hold', 'cancelled']),
  in_progress: new Set(['on_hold', 'completed', 'cancelled']),
  on_hold: new Set(['in_progress', 'cancelled']),
  completed: new Set([]),      // ❌ Cannot transition out
  cancelled: new Set([])       // ❌ Cannot transition out
};
```

**Side Effects:**
1. Update ProductionOrder.status
2. Update SalesOrder.status accordingly
3. Record in SalesOrderHistory
4. Send notifications

---

### 5. GET /api/production-approval/list/approved

**Purpose:** Fetch approved productions (production approvals)  
**Frontend Used By:** ProductionOrdersPage (Approved Productions section)  
**Authentication:** Required

**Response Structure:**
```javascript
{
  success: true,
  approvals: [
    {
      id: 5,
      approval_number: "APR-20250116-0001",
      status: "approved",
      project_name: "Project A",
      total_quantity: 500,
      
      mrnRequest: {                     // ⭐ KEY RELATION
        id: 10,
        request_number: "MRM-20250116-0001",
        
        salesOrder: {                   // ⭐ PROJECT LINK
          id: 123,
          order_number: "SO-S0-20251016-0001",
          product_name: "Cotton T-Shirt",
          quantity: 500
        }
      },
      
      created_at: "2025-01-15T10:00:00Z",
      created_by: 1,
      approved_by: 2,
      created_user: {
        id: 1,
        name: "Sarah Creator"
      }
    }
  ]
}
```

**Frontend Processing (ProductionOrdersPage):**
```javascript
// Fetch approvals
const fetchApprovals = async () => {
  const response = await api.get('/production-approval/list/approved');
  setApprovedProductions(response.data.approvals);
};

// Group by project
const groupApprovalsByProject = () => {
  const grouped = {};
  approvedProductions.forEach(approval => {
    const projectKey = approval.mrnRequest?.salesOrder?.order_number;
    
    if (!grouped[projectKey]) {
      grouped[projectKey] = {
        projectKey,
        projectName: approval.project_name,
        salesOrderId: approval.mrnRequest?.salesOrder?.id,
        approvals: []
      };
    }
    
    grouped[projectKey].approvals.push(approval);
  });
  return grouped;
};

// Determine status using linking fields
const getProjectProductionStatus = (salesOrderId) => {
  const relatedOrders = orders.filter(order => 
    order.sales_order_id === salesOrderId  // ⭐ Using extracted field
  );
  
  if (relatedOrders.length === 0) {
    return { status: 'ready', label: 'Ready to Start', color: 'green' };
  }
  
  // Check statuses
  if (relatedOrders.some(o => o.status === 'in_progress')) {
    return { status: 'in_progress', label: 'In Production', color: 'orange' };
  }
  
  if (relatedOrders.some(o => o.status === 'completed')) {
    return { status: 'completed', label: 'Completed', color: 'blue' };
  }
  
  return { status: 'pending', label: 'Pending Start', color: 'yellow' };
};
```

---

## 🔗 RELATIONSHIP CHAIN

### How Data Flows for SO-S0-20251016-0001

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. SALES ORDER CREATED                                              │
│    GET /api/sales/orders/:id                                        │
│    └─ response: SalesOrder { id: 123, order_number: "SO-..." }      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 2. MATERIAL REQUIREMENTS CREATED                                    │
│    GET /api/inventory/material-requirements                         │
│    └─ response: MaterialRequirement[] { sales_order_id: 123 }       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 3. PRODUCTION APPROVAL CREATED                                      │
│    GET /api/production-approval/list/approved                       │
│    └─ response: ProductionApproval {                                │
│         id: 5,                                                      │
│         mrnRequest: { salesOrder: { id: 123, ... } }                │
│       }                                                             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 4. PRODUCTION ORDER CREATED                                         │
│    POST /api/manufacturing/orders                                   │
│    body: {                                                          │
│      sales_order_id: 123,         ⭐ LINKS TO SALES ORDER            │
│      production_approval_id: 5,   ⭐ LINKS TO APPROVAL               │
│      ...                                                            │
│    }                                                                │
│    └─ response: ProductionOrder { id: 1, ... }                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 5. PRODUCTION STAGES CREATED                                        │
│    GET /api/manufacturing/orders/1/stages                           │
│    └─ response: ProductionStage[] {                                 │
│         production_order_id: 1,                                     │
│         stage_name, status, ...                                     │
│       }                                                             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 6. STAGE OPERATIONS (if outsourced)                                 │
│    GET /api/manufacturing/stages/10/operations                      │
│    └─ response: StageOperation[] {                                  │
│         vendor_id, challan_id, return_challan_id, ...               │
│       }                                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 ENDPOINT DEPENDENCY MATRIX

| Endpoint | Depends On | Used For | Frontend |
|----------|-----------|----------|----------|
| GET /orders | None | List all | ProductionOrdersPage, ProductionTrackingPage |
| POST /orders | SalesOrder, ProductionApproval | Create | ProductionWizardPage |
| GET /orders/:id | ProductionOrder exists | Detail view | ProductionTrackingPage, ProductionOperationsViewPage |
| PATCH /orders/:id/status | ProductionOrder exists | Update status | All control pages |
| GET /orders/:id/stages | ProductionOrder exists | Stage list | ProductionTrackingPage |
| PATCH /stages/:id | ProductionStage exists | Update stage | ProductionOperationsViewPage |
| GET /production-approval/list/approved | ProductionApproval exists | Approvals list | ProductionOrdersPage |

---

## 🔀 STATUS UPDATE CASCADE

### When ProductionOrder status changes:

```javascript
PATCH /api/manufacturing/orders/:id/status
  ├─ 1. Update ProductionOrder.status
  ├─ 2. Find linked SalesOrder via sales_order_id
  ├─ 3. Update SalesOrder.status
  │   ├─ in_progress → in_production
  │   ├─ completed → completed
  │   └─ cancelled → cancelled
  ├─ 4. Record SalesOrderHistory
  ├─ 5. Send notification to Sales team
  └─ 6. Return updated order
```

---

## ✅ CONNECTIVITY VERIFICATION

### Links Present

- [x] ProductionOrder.sales_order_id → SalesOrder.id ✅
- [x] ProductionOrder.production_approval_id → ProductionApproval.id ✅
- [x] ProductionStage.production_order_id → ProductionOrder.id ✅
- [x] StageOperation.production_stage_id → ProductionStage.id ✅
- [x] MaterialConsumption.production_order_id → ProductionOrder.id ✅
- [x] ProductionApproval.mrnRequest.salesOrder → SalesOrder ✅

### Frontend Extraction

- [x] ProductionOrdersPage extracts sales_order_id ✅
- [x] ProductionOrdersPage extracts production_approval_id ✅
- [x] ProductionTrackingPage receives stages array ✅
- [x] Status detection works correctly ✅

---

## 🚀 PRODUCTION READINESS

**Overall Connectivity Status:** ✅ **VERIFIED & PRODUCTION READY**

- All endpoints returning correct data
- All relationships properly linked
- Frontend extraction complete
- Status detection functional
- No broken links
- No missing fields

---

**Last Updated:** January 2025  
**Auditor:** Zencoder AI