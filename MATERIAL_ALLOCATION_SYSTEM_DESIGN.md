# Material Allocation Dashboard - System Design & Architecture

## Current System Understanding

### 1. Data Model Overview

```
Sales Order (Project)
    ↓
Project Material Request (tracks what materials are needed)
    ├── Status: pending → stock_checking → stock_available → materials_reserved → materials_ready → issued
    ├── Materials Requested: Array of { material_name, qty_required, status, remarks }
    └── Reserved Inventory IDs: Links to actual Inventory items
        ↓
Inventory (Stock Management)
    ├── Fields:
    │   ├── stock_type: 'project_specific' | 'general_extra'
    │   ├── reserved_stock: Amount locked for projects
    │   ├── available_stock: current_stock - reserved_stock
    │   ├── sales_order_id: Links to project
    │   └── consumed_quantity: Tracking usage
    └── Movement: Dispatch → Manufacturing → Consumed/Issued
```

### 2. Material Allocation Flow

```
STEP 1: Manufacturing Creates Material Request
├── Project: Sales Order #SO-001
├── Materials Needed: Fabric 100m, Thread 20pcs
└── Status: pending_inventory_review

STEP 2: Inventory Checks Availability
├── Stock Checking: Look in Inventory table
├── Scenarios:
│   ├── stock_available: All materials found
│   ├── partial_available: Some materials found
│   └── stock_unavailable: Not enough stock
└── Status: stock_available / partial_available / stock_unavailable

STEP 3: Materials Reserved
├── Update Inventory.reserved_stock (lock the materials)
├── Update Inventory.available_stock (reduce available)
├── Link Inventory IDs to PMR.reserved_inventory_ids
└── Status: materials_reserved

STEP 4: Materials Dispatched
├── Create dispatch record
├── Move from warehouse to manufacturing
└── Status: materials_ready

STEP 5: Materials Issued
├── Inventory.consumed_quantity increases
├── Inventory.current_stock decreases
└── Status: materials_issued / completed
```

### 3. Key Concepts

#### Stock Types
- **project_specific**: Materials allocated for specific project (sales_order_id != null)
- **general_extra**: Warehouse general stock (sales_order_id = null)

#### Stock States (for single project)
```
Total Allocated = Sum of all Inventory items for project where stock_type='project_specific'
├── Reserved: Locked for project (Inventory.reserved_stock)
├── Dispatched: Sent to manufacturing (tracked via dispatch records)
├── Consumed: Used in production (Inventory.consumed_quantity)
└── Remaining: Not yet used (Inventory.current_stock - consumed_quantity)
```

#### Allocation Status States
- **Pending**: Request created, awaiting inventory review
- **Partial**: Some materials available, some need to be procured
- **Allocated**: Materials reserved in warehouse
- **Dispatched**: Materials sent to manufacturing floor
- **In Progress**: Materials being used (partially consumed)
- **Completed**: All materials consumed

## Material Allocation Dashboard Structure

### Tab 1: Projects Overview
Display all projects with their allocation status

```
┌─ Project Name ─┬─ Status ─┬─ Budget ─┬─ Allocated ─┬─ Dispatched ─┬─ Consumed ─┬─ Available ─┐
│ SO-001         │ In Use   │ 1000 M   │ 1000 M      │ 950 M        │ 850 M      │ 150 M       │
│ SO-002         │ Partial  │ 500 M    │ 300 M       │ 0 M          │ 0 M        │ 500 M       │
└────────────────┴──────────┴──────────┴─────────────┴──────────────┴────────────┴─────────────┘

Status Color Coding:
- Green: Normal (0-90% consumed)
- Orange: High Usage (90-110%)
- Red: Over-consumed (>110%)
```

### Tab 2: Project Details (Drill-down)
When clicking on a project

```
Project: SO-001 (Customer: ABC Corp)
├── Material Requirements Breakdown
│   ├── Fabric
│   │   ├── Budget: 100 M
│   │   ├── Allocated: 100 M (warehouse stock)
│   │   ├── Reserved: 100 M (locked)
│   │   ├── Dispatched: 95 M (to manufacturing)
│   │   ├── Consumed: 85 M (used in production)
│   │   └── Available: 15 M (remaining in warehouse)
│   │
│   └── Thread
│       ├── Budget: 20 pcs
│       ├── Allocated: 20 pcs
│       ├── Consumed: 18 pcs
│       └── Remaining: 2 pcs
│
├── Timeline
│   ├── Requested: 2025-01-15
│   ├── Stock Confirmed: 2025-01-16
│   ├── Materials Reserved: 2025-01-17
│   ├── Dispatched: 2025-01-18
│   └── Status: In Production
│
└── Consumption Analysis
    ├── Budget vs Actual: 85M / 100M (85% consumed)
    ├── Variance: +15M (under-consumed)
    ├── Rate: 8.5M per day
    └── Est. Completion: 2 days
```

### Tab 3: Material Request Status
Track all active material requests

```
┌─ Request ─┬─ Project ─┬─ Status ─┬─ Items ─┬─ Available ─┬─ Reserved ─┬─ Dispatched ─┐
│ PMR-001   │ SO-001    │ Issued   │ 3      │ ✓ 100%     │ ✓ 100%    │ ✓ 95%        │
│ PMR-002   │ SO-002    │ Reserved │ 2      │ ⚠ 60%      │ ⏳ Pending │ ⏳ Pending    │
│ PMR-003   │ SO-003    │ Stock NA │ 4      │ ❌ 0%      │ ❌ Failed  │ ❌ Failed     │
└───────────┴───────────┴──────────┴────────┴────────────┴────────────┴──────────────┘
```

### Tab 4: Warehouse Stock (General/Unallocated)
Show free stock not tied to any project

```
┌─ Material ─┬─ Category ─┬─ Current ─┬─ Reserved ─┬─ Available ─┬─ Unit Cost ─┬─ Total Value ─┐
│ Fabric A   │ Fabric     │ 500 M    │ 0 M        │ 500 M       │ 500         │ 250,000       │
│ Thread X   │ Thread     │ 1000 pcs │ 200 pcs    │ 800 pcs     │ 10          │ 10,000        │
└────────────┴────────────┴──────────┴────────────┴─────────────┴────────────┴───────────────┘
```

## Backend Endpoints Needed

### 1. Projects Allocation Overview
**GET** `/inventory/allocations/projects-overview`

Response:
```json
{
  "projects": [
    {
      "id": 1,
      "sales_order_id": 1,
      "order_number": "SO-001",
      "customer_name": "ABC Corp",
      "status": "in_use",
      "total_budget_quantity": 1000,
      "allocated_quantity": 1000,
      "reserved_quantity": 1000,
      "dispatched_quantity": 950,
      "consumed_quantity": 850,
      "available_quantity": 150,
      "utilization_percent": 85,
      "health_status": "normal",
      "material_requests": [
        {
          "request_number": "PMR-001",
          "status": "issued",
          "items_count": 3
        }
      ],
      "created_at": "2025-01-15"
    }
  ]
}
```

### 2. Project Material Details
**GET** `/inventory/allocations/projects/:salesOrderId`

Response:
```json
{
  "project": {
    "sales_order_id": 1,
    "order_number": "SO-001",
    "customer_name": "ABC Corp",
    "materials": [
      {
        "inventory_id": 10,
        "product_name": "Fabric A",
        "category": "fabric",
        "budget_quantity": 100,
        "allocated_quantity": 100,
        "reserved_stock": 100,
        "dispatched_quantity": 95,
        "consumed_quantity": 85,
        "available_quantity": 15,
        "unit_of_measurement": "meter",
        "unit_cost": 500,
        "location": "Warehouse A, Rack 1",
        "status": "in_use"
      }
    ],
    "timeline": {
      "requested_date": "2025-01-15",
      "stock_confirmed_date": "2025-01-16",
      "reserved_date": "2025-01-17",
      "dispatched_date": "2025-01-18"
    },
    "consumption_analysis": {
      "total_budget": 1000,
      "total_consumed": 850,
      "consumption_percent": 85,
      "variance": 150,
      "daily_consumption_rate": 8.5,
      "estimated_completion_days": 2
    }
  }
}
```

### 3. Material Requests Summary
**GET** `/inventory/allocations/material-requests`

Response:
```json
{
  "requests": [
    {
      "id": 1,
      "request_number": "PMR-001",
      "project_name": "SO-001",
      "status": "issued",
      "total_items": 3,
      "availability": {
        "available": 3,
        "partial": 0,
        "unavailable": 0,
        "availability_percent": 100
      },
      "reservation": {
        "reserved_items": 3,
        "pending_items": 0,
        "failed_items": 0,
        "reservation_percent": 100
      },
      "dispatch": {
        "dispatched_items": 3,
        "pending_items": 0,
        "failed_items": 0,
        "dispatch_percent": 100
      }
    }
  ]
}
```

### 4. Warehouse Stock (Unallocated)
**GET** `/inventory/allocations/warehouse-stock`

Response:
```json
{
  "stock": [
    {
      "id": 50,
      "product_name": "Fabric B",
      "category": "fabric",
      "current_stock": 500,
      "reserved_stock": 0,
      "available_stock": 500,
      "unit_of_measurement": "meter",
      "unit_cost": 600,
      "total_value": 300000,
      "location": "Warehouse B, Rack 5",
      "last_movement": "2025-01-20",
      "movement_type": "inward"
    }
  ],
  "summary": {
    "total_items": 45,
    "total_current_stock": 5000,
    "total_reserved": 0,
    "total_available": 5000,
    "total_value": 2500000
  }
}
```

## Database Queries Strategy

### Get Allocation Summary Per Project
```sql
SELECT 
  so.id as sales_order_id,
  so.order_number,
  c.company_name as customer_name,
  COUNT(DISTINCT inv.id) as material_count,
  SUM(CASE WHEN inv.stock_type='project_specific' THEN inv.current_stock ELSE 0 END) as total_allocated,
  SUM(CASE WHEN inv.stock_type='project_specific' THEN inv.reserved_stock ELSE 0 END) as total_reserved,
  SUM(CASE WHEN inv.stock_type='project_specific' THEN inv.consumed_quantity ELSE 0 END) as total_consumed,
  SUM(CASE WHEN inv.stock_type='project_specific' THEN (inv.current_stock - inv.consumed_quantity) ELSE 0 END) as remaining
FROM sales_orders so
LEFT JOIN customers c ON so.customer_id = c.id
LEFT JOIN inventory inv ON so.id = inv.sales_order_id
WHERE inv.is_active = true
GROUP BY so.id, so.order_number, c.company_name
ORDER BY so.created_at DESC;
```

### Get Materials for Specific Project
```sql
SELECT 
  inv.id,
  inv.product_name,
  inv.category,
  inv.current_stock as allocated_qty,
  inv.reserved_stock,
  inv.consumed_quantity,
  inv.unit_of_measurement,
  inv.unit_cost,
  inv.location,
  pmr.request_number,
  pmr.status as request_status
FROM inventory inv
LEFT JOIN project_material_requests pmr ON inv.sales_order_id = pmr.sales_order_id
WHERE inv.sales_order_id = ? AND inv.stock_type = 'project_specific'
ORDER BY inv.created_at ASC;
```

## Important Notes

1. **ProjectMaterialRequest (PMR)** - Tracks what's needed for a project
2. **Inventory** - Actual stock with allocation details via stock_type and reserved_stock
3. **Dispatch Records** - Track movement of materials
4. **Key Fields**:
   - `stock_type`: Determines if material is project-specific or warehouse general
   - `sales_order_id`: Links materials to specific project
   - `reserved_stock`: Amount locked for project (calculated field)
   - `consumed_quantity`: Amount used in production

5. **Dashboard Should NOT Copy SalesDashboard** - Different data model:
   - SalesDashboard: Order statuses, revenue, pipeline
   - Allocation Dashboard: Material tracking, availability, consumption
   - Different UI: Tables vs. cards, drill-down navigation, different metrics