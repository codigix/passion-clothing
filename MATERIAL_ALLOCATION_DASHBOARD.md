# Material Allocation Dashboard - Complete Documentation

## Overview
The new Material Allocation Dashboard provides a comprehensive drill-down view of project-wise material allocation with budget vs. actual usage analysis. This replaces the generic inventory view with a project-focused approach that clearly differentiates between warehouse stock and allocated materials.

## Features

### 1. **Projects Overview Tab**
- **Purpose**: See all projects with their material allocation status at a glance
- **Key Metrics**:
  - Budget Quantity: Total materials allocated to the project
  - Consumed Quantity: Materials used in production
  - Remaining Quantity: Materials still available for the project
  - Utilization Percentage: Consumption rate vs. budget
  - Status Indicator: Shows if project is normal, high usage, or over-consumed

- **Status Colors**:
  - 🟢 **Normal** (0-90%): Project is within budget
  - 🟠 **High Usage** (90-110%): Project is consuming materials quickly
  - 🔴 **Over Consumed** (>110%): Project has exceeded allocated materials

- **Search & Sort**:
  - Search by order number or customer name
  - Sort by: Latest First, High Usage, High Value

### 2. **Project Details Tab**
- **Access**: Click on any project card from the overview
- **Shows**:
  - Complete list of materials allocated to the project
  - For each material:
    - Product Name & Code
    - Category & Unit of Measurement
    - Remaining Quantity (in warehouse)
    - Consumed Quantity (used in production)
    - Currently In Use (production stages)
    - Material Value

- **Material Status Indicators**:
  - Green numbers = Available for production
  - Orange numbers = Already consumed
  - Blue numbers = Currently being used

### 3. **Cross-Project Comparison Tab**
- **Purpose**: Analyze material allocation patterns across all projects
- **Grouped By**:
  - Project Order Number
  - Material Category (Fabric, Thread, Buttons, etc.)
  - Product Name

- **Metrics Per Category**:
  - Material Variants: Number of different items in category
  - Remaining Quantity: Total stock remaining
  - Consumed Quantity: Total used
  - Usage Rate: Average consumption percentage
  - Total Value: Allocated budget

## API Endpoints

### 1. Get Material Allocation Overview
```
GET /inventory/material-allocation/overview
```
**Response**:
```json
{
  "success": true,
  "overview": [
    {
      "sales_order_id": 1,
      "order_number": "SO-2025-001",
      "customer_name": "ABC Company",
      "project_name": "Uniform Project A",
      "order_date": "2025-02-15",
      "total_materials": 12,
      "budget_quantity": 100.5,
      "allocated_quantity": 50.2,
      "consumed_quantity": 45.8,
      "remaining_quantity": 4.4,
      "variance": 45.7,
      "utilization_percentage": "45.60%",
      "total_value": 15000.50,
      "status": "normal"
    }
  ]
}
```

### 2. Get Project Material Details
```
GET /inventory/material-allocation/project/:salesOrderId
```
**Response**:
```json
{
  "success": true,
  "project": {
    "id": 1,
    "order_number": "SO-2025-001",
    "customer_name": "ABC Company",
    "project_name": "Uniform Project A",
    "status": "in_production",
    "order_date": "2025-02-15"
  },
  "summary": {
    "total_materials": 12,
    "total_remaining": 4.4,
    "total_consumed": 45.8,
    "total_value": 15000.50,
    "items_in_use": 3
  },
  "materials": [
    {
      "id": 1,
      "product_name": "Cotton Fabric",
      "product_code": "FAB-001",
      "barcode": "INV123456",
      "category": "fabric",
      "unit_of_measurement": "meter",
      "remaining_quantity": 25.5,
      "allocated_and_consumed": 74.5,
      "material_value": 3000.00,
      "po_number": "PO-2025-001",
      "currently_in_use": 2,
      "total_returned": 0
    }
  ]
}
```

### 3. Get Cross-Project Comparison
```
GET /inventory/material-allocation/comparison
```
**Response**:
```json
{
  "success": true,
  "comparison": [
    {
      "order_number": "SO-2025-001",
      "customer_name": "ABC Company",
      "categories": {
        "fabric": [
          {
            "product_name": "Cotton Fabric",
            "material_variants": 3,
            "remaining_qty": 25.5,
            "consumed_qty": 74.5,
            "total_value": 3000.00,
            "consumption_rate": 74.5
          }
        ]
      }
    }
  ]
}
```

## Database Queries Used

### Stock Type Distinction
- **`stock_type = 'general_extra'`**: Unallocated warehouse stock (not tied to any project)
- **`stock_type = 'project_specific'`**: Materials allocated to specific sales orders/projects

### Key Tables
- `inventory`: Main inventory table with stock_type and sales_order_id
- `sales_orders`: Project information (order_number, customer_name, project_name)
- `purchase_orders`: PO tracking (po_number, vendor_id)
- `material_allocations`: Tracks material allocation to production orders

## Visual Design

### Color Scheme
- **Green (#10b981)**: Available stock, normal status
- **Orange (#f59e0b)**: High usage, warning state
- **Red (#ef4444)**: Over-consumed, critical state
- **Blue (#3b82f6)**: Primary actions, information
- **Gray (#6b7280)**: Secondary information, labels

### Layout
- **Desktop**: 2-column grid for project cards
- **Tablet**: Responsive 1-2 column layout
- **Mobile**: Single column, optimized for mobile viewing

## Usage Workflow

### For Inventory Managers
1. Open `/inventory/allocation`
2. View all projects in the overview
3. Click on a specific project to see detailed material allocation
4. Export data or take actions from the project details view

### For Production Planning
1. Check Material Allocation → Projects Overview
2. Identify projects with high utilization rates
3. Click on project to see which materials are running low
4. Plan additional material requisitions if needed

### For Cost Analysts
1. Go to Comparison view
2. Analyze material usage patterns across projects
3. Identify cost drivers and over-consumption trends
4. Generate reports for management review

## Key Improvements Over Previous System

| Aspect | Before | After |
|--------|--------|-------|
| **View Structure** | All materials in one table | Drill-down by project |
| **Budget Tracking** | No budget vs actual comparison | Clear budget vs actual with variance |
| **Project Context** | Lost project association | Direct project details visible |
| **Analysis** | Limited filtering | Cross-project comparison available |
| **Status Visibility** | Manual calculation needed | Automated status indicators |
| **Warehouse vs Project** | Same view for both | Clear differentiation with tabs |

## Performance Considerations

### Query Optimization
- Uses indexed queries on `sales_order_id`, `stock_type`, `is_active`
- Material Allocation summary computed at query time
- Pagination available for large projects

### Caching Recommendations
- Cache overview data for 5 minutes (frequently viewed)
- Cache comparison data for 10 minutes (less frequently updated)
- Real-time refresh available via "Refresh" button

## Future Enhancements

1. **Material Reallocation**: Move materials between projects
2. **Predictive Analytics**: Forecast material shortages
3. **Variance Analysis Reports**: Export detailed variance reports
4. **Alerts**: Notify when project exceeds 90% utilization
5. **Integration**: Link to Purchase Requisition creation
6. **Batch Operations**: Bulk allocation/reallocation of materials
7. **Historical Tracking**: Timeline view of allocation changes

## Troubleshooting

### Issue: No projects showing in overview
- **Check**: Are there sales orders with `stock_type = 'project_specific'`?
- **Solution**: Ensure materials are properly tagged to projects during GRN verification

### Issue: Material quantities don't add up
- **Check**: Consider both `current_stock` and `consumed_quantity` fields
- **Calculation**: Budget = Remaining + Consumed + Over-consumed

### Issue: Slow loading on large datasets
- **Check**: Number of projects and materials
- **Solution**: Use pagination or filter by date range

## API Permissions

All endpoints require:
- Authentication token in header
- Department check: `['inventory', 'admin', 'procurement', 'manufacturing']`

## Notes

- The dashboard is read-only (no direct modification of allocation here)
- Actual material allocation happens during production order creation
- Returns are handled separately through material allocation status tracking
- All values are calculated in real-time from database

---

**Last Updated**: February 2025
**Version**: 1.0
**Status**: Production Ready