# ACTUAL Material Allocation Flow - System Analysis

## Real-World Process (Not Dashboard Copy-Paste)

### 1. **Data Model Understanding**

**Inventory Table - Key Fields for Allocation:**
```sql
- sales_order_id       → Links material to a specific PROJECT
- stock_type           → ENUM: 'project_specific' (allocated to project) | 'general_extra' (warehouse stock)
- current_stock        → DECIMAL(10,2) - Physical quantity available for this item
- consumed_quantity    → DECIMAL(10,2) - Amount used in manufacturing
- reserved_stock       → DECIMAL(10,2) - Locked/reserved for pending work
- available_stock      → DECIMAL(10,2) - current_stock - reserved_stock (can be used)
- unit_cost            → Price per unit
- total_value          → calculated field (for reporting)
```

### 2. **Material Allocation Lifecycle**

```
Step 1: CREATION (Sales → Purchase → GRN)
├─ Sales Order created (project defined)
├─ Purchase Order created (materials listed)
└─ GRN received (inventory records created)
   └─ Inventory.sales_order_id = SO-123  ← LINKS TO PROJECT
   └─ Inventory.stock_type = 'project_specific'

Step 2: RESERVATION (Manufacturing → ProjectMaterialRequest)
├─ Manufacturing creates ProjectMaterialRequest (PMR-001)
├─ PMR specifies: project_name, materials_requested[], sales_order_id
└─ Inventory marks materials as reserved
   └─ Inventory.reserved_stock increases
   └─ Inventory.available_stock decreases

Step 3: DISPATCH (Inventory → Manufacturing Floor)
├─ Inventory generates MaterialDispatch (DSP-001)
├─ Materials physically sent to manufacturing floor
└─ InventoryMovement records: 'dispatch_to_manufacturing'
   └─ Inventory.current_stock DECREASES (moved from warehouse)

Step 4: CONSUMPTION (Manufacturing → Production)
├─ Production uses materials (Quality checks, assembly, etc.)
└─ Inventory.consumed_quantity INCREASES
   └─ Tracks actual usage vs allocated

Step 5: COMPLETION
└─ Dashboard shows: allocated vs consumed vs remaining
```

### 3. **Dashboard Data Model**

#### **Tab 1: Project-Wise Material Allocation**

**Source Data:**
```sql
SELECT 
  i.sales_order_id,
  so.order_number,
  so.customer_name,
  so.project_name,
  COUNT(DISTINCT i.id) as material_count,
  
  -- ALLOCATION: Initial budget for this project
  SUM(i.current_stock) as allocated_quantity,
  
  -- CONSUMPTION: How much has been used
  SUM(i.consumed_quantity) as consumed_quantity,
  
  -- REMAINING: Not yet used
  SUM(i.current_stock - i.consumed_quantity) as remaining_quantity,
  
  -- RESERVED: Locked for future use
  SUM(i.reserved_stock) as reserved_quantity,
  
  SUM(i.total_value) as total_project_value
  
FROM inventory i
LEFT JOIN sales_orders so ON i.sales_order_id = so.id
WHERE 
  i.stock_type = 'project_specific'
  AND i.is_active = 1
  AND i.sales_order_id IS NOT NULL
GROUP BY i.sales_order_id, so.id
```

**Calculated Metrics:**
- **Utilization %** = (consumed / allocated) * 100
- **Health Status**:
  - 🟢 GREEN: 0-80% consumed (comfortable, on track)
  - 🟡 YELLOW: 80-100% consumed (high usage, monitor)
  - 🔴 RED: >100% consumed (over-budget, critical)

**Visual Elements:**
- Material count badge
- Budget vs Consumed progress bar
- Health status indicator
- Expandable row showing detailed material breakdown

---

#### **Tab 2: Warehouse Stock (Unallocated/General)**

**Source Data:**
```sql
SELECT 
  i.id,
  i.product_name,
  i.category,
  i.current_stock,
  i.reserved_stock,
  i.available_stock,
  i.unit_cost,
  i.location,
  i.batch_number,
  i.reorder_level,
  (i.current_stock * i.unit_cost) as item_value
  
FROM inventory i
WHERE 
  i.stock_type = 'general_extra'  ← NOT linked to any project
  AND i.is_active = 1
  AND i.sales_order_id IS NULL     ← No project assignment
ORDER BY i.current_stock ASC  ← Show low-stock items first
```

**Status Indicators:**
- 🔴 OUT_OF_STOCK: current_stock = 0
- 🟠 LOW_STOCK: current_stock ≤ reorder_level
- 🟡 CRITICAL: current_stock ≤ (reorder_level * 0.5)
- 🟢 NORMAL: current_stock > reorder_level

---

### 4. **Key Differences from SalesDashboard**

| Aspect | SalesDashboard | MaterialAllocationDashboard |
|--------|---|---|
| **Data Model** | Orders (Sales transactions) | Stock (Physical inventory) |
| **Primary View** | Revenue pipeline | Material consumption |
| **Grouping** | By order status | By project (sales_order_id) |
| **Metrics** | Total value, completion % | Allocated vs Consumed |
| **Drill-Down** | Order items | Material details |
| **Tables** | Orders table | Projects + Warehouse stock |
| **Color Coding** | Status-based | Health-based (utilization) |

---

### 5. **Backend Endpoints Needed**

#### **GET `/inventory/allocations/projects-overview`**
- Returns all projects with allocation summary
- Filters: search by order_number/customer, sort by latest/highest_usage/highest_value
- Response includes project-level KPIs

#### **GET `/inventory/allocations/project/:salesOrderId`**
- Drill-down into specific project
- Returns detailed materials list
- Shows per-material consumption analysis
- Includes associated ProjectMaterialRequests

#### **GET `/inventory/allocations/warehouse-stock`**
- Returns only unallocated stock (stock_type='general_extra')
- Filters: category, search
- Highlights low-stock and out-of-stock items

---

### 6. **Frontend Structure**

```
MaterialAllocationDashboard/
├── Tab 1: Projects Overview
│   ├── KPI Cards: Total Projects, Total Allocated, Total Consumed, Avg Utilization
│   ├── Projects Table (sortable/searchable)
│   │   ├── Order #, Customer, Materials, Budget, Consumed, Util%, Health
│   │   └── Expandable Row
│   │       ├── Material List
│   │       ├── Associated PMRs
│   │       └── Consumption Analysis
│   │
├── Tab 2: Warehouse Stock
│   ├── KPI Cards: Total Items, Current Stock, Reserved, Available, Total Value, Low Stock Count
│   ├── Stock Table (category filter, search)
│   │   └── Product, Category, Current, Reserved, Available, Cost, Location, Status
│   │
└── Tab 3: Allocation History (Future Enhancement)
    └── Timeline of allocations and consumption
```

---

### 7. **Critical Business Rules**

1. **Stock Type Distinction**
   - `project_specific`: Materials allocated to a sales order/project
   - `general_extra`: Warehouse general stock (not assigned to any project)

2. **Consumption Tracking**
   - consumed_quantity increases as manufacturing uses materials
   - Should NEVER exceed allocated (current_stock)
   - Red flag if consumption > allocation (over-used)

3. **Reserved vs Consumed**
   - reserved_stock: Pre-allocated but not yet issued
   - consumed_quantity: Actually used in production
   - Both are subtracted from available_stock in different ways

4. **Allocation Date**
   - Tracked at first receipt (GRN creation)
   - Once allocated to a project, cannot be moved to another project
   - Leftover materials stay in that project's allocation

---

### 8. **NOT Included in Dashboard**

❌ Revenue/pricing metrics (that's SalesDashboard)
❌ Sales pipeline stages
❌ Customer information (only for context)
❌ Order status (only for context)
❌ Procurement/vendor data
❌ Manual allocation UI (read-only view only)
❌ Re-allocation functionality

---

## Summary

**This is a STOCK CONSUMPTION TRACKER, not a sales dashboard.**

The dashboard answers:
- ✅ How much material was allocated to each project?
- ✅ How much has been consumed so far?
- ✅ What's remaining to be used?
- ✅ Are we over-consuming any material?
- ✅ What warehouse stock is available for new projects?

NOT:
- ❌ How much revenue?
- ❌ What's the sales pipeline?
- ❌ How many orders?
- ❌ Can we manually allocate materials? (that happens elsewhere)