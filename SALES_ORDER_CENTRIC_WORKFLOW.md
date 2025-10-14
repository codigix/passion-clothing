# Sales Order-Centric Production Workflow

## Overview
This document explains the **Sales Order-centric workflow** where all production activities are organized around Sales Orders.

## Workflow Architecture

```
Sales Order (Parent)
    ├── Customer Information
    ├── Product Details
    ├── Material Requests (MRN)
    │   └── Requested Materials
    ├── Material Receipts
    │   └── Received Materials
    ├── Production Approvals
    │   └── Approval Status & Notes
    └── Production Orders
        ├── Production Stages
        ├── Material Allocations
        └── Quality Checkpoints
```

## New API Endpoints

### 1. Get Approved Sales Orders
**Endpoint:** `GET /api/manufacturing/approved-sales-orders`

**Purpose:** Fetch all sales orders that are approved/confirmed and ready for production

**Response:**
```json
{
  "salesOrders": [
    {
      "id": 1,
      "order_number": "SO-20240115-0001",
      "customer_name": "ABC Company",
      "product_name": "Cotton T-Shirt",
      "product_code": "PRD-001",
      "total_quantity": 500,
      "delivery_date": "2024-02-15",
      "status": "confirmed",
      "special_instructions": "Rush order",
      "buyer_reference": "REF-123",
      "order_type": "Knitted"
    }
  ]
}
```

### 2. Get Sales Order Production Details
**Endpoint:** `GET /api/manufacturing/sales-orders/:id/production-details`

**Purpose:** Fetch complete details of a sales order including all related data for production

**Response:**
```json
{
  "salesOrder": {
    "id": 1,
    "order_number": "SO-20240115-0001",
    "customer_name": "ABC Company",
    "customer_email": "contact@abc.com",
    "product_id": 5,
    "product_name": "Cotton T-Shirt",
    "product_code": "PRD-001",
    "product_specifications": {...},
    "total_quantity": 500,
    "delivery_date": "2024-02-15",
    "special_instructions": "Rush order",
    "garment_specifications": {...},
    "items": [...]
  },
  "materialRequests": [
    {
      "id": 10,
      "request_number": "MRN-20240115-0001",
      "status": "approved"
    }
  ],
  "requestedMaterials": [
    {
      "material_code": "FAB-001",
      "description": "Cotton Fabric",
      "quantity_required": 100,
      "unit": "meters"
    }
  ],
  "receivedMaterials": [
    {
      "material_code": "FAB-001",
      "quantity_received": 100,
      "condition": "good",
      "barcode": "BAR123456"
    }
  ],
  "productionApprovals": [
    {
      "id": 5,
      "approval_status": "approved",
      "approved_by": "John Doe",
      "approval_notes": "All materials verified"
    }
  ],
  "existingProductionOrders": [
    {
      "id": 20,
      "production_number": "PRD-20240115-0001",
      "status": "in_progress",
      "quantity": 500
    }
  ]
}
```

## Production Order Creation Flow

### Step 1: Select Approved Sales Order
```javascript
// Frontend: Fetch approved sales orders
const response = await api.get('/manufacturing/approved-sales-orders');
const salesOrders = response.data.salesOrders;
```

### Step 2: Fetch Complete Sales Order Details
```javascript
// When user selects a sales order
const salesOrderId = selectedSalesOrder.id;
const response = await api.get(`/manufacturing/sales-orders/${salesOrderId}/production-details`);

// Response contains everything needed:
const {
  salesOrder,           // Customer, product, quantities, dates
  requestedMaterials,   // Materials that were requested
  receivedMaterials,    // Materials that were received and verified
  productionApprovals,  // Approval history
  existingProductionOrders // Check if already in production
} = response.data;
```

### Step 3: Auto-populate Production Order Form
```javascript
// Auto-fill form with sales order data
form.setValue('orderDetails.productId', salesOrder.product_id);
form.setValue('orderDetails.quantity', salesOrder.total_quantity);
form.setValue('orderDetails.salesOrderId', salesOrder.id);
form.setValue('orderDetails.specialInstructions', salesOrder.special_instructions);

// Auto-fill materials from received materials
form.setValue('materials.items', receivedMaterials.map(m => ({
  materialId: m.material_code || m.barcode,
  description: m.description || m.material_name,
  requiredQuantity: m.quantity_received,
  unit: m.unit || 'pieces',
  status: 'available',
  barcode: m.barcode
})));
```

### Step 4: Create Production Order
```javascript
// Submit production order linked to sales order
const productionOrder = await api.post('/manufacturing/orders', {
  sales_order_id: salesOrder.id,
  product_id: salesOrder.product_id,
  quantity: salesOrder.total_quantity,
  materials_required: receivedMaterials,
  // ... other fields
});
```

## Benefits of Sales Order-Centric Approach

### ✅ Single Source of Truth
- Sales Order is the parent entity
- All data flows from the sales order
- Easy to track entire lifecycle

### ✅ Simplified Data Flow
```
Sales Order → Material Request → Material Receipt → Production Approval → Production Order
```

### ✅ Better Traceability
- Track all materials against specific sales order
- Link multiple production orders to same sales order
- View complete history in one place

### ✅ Reduced Complexity
- No need to navigate through multiple approval layers
- Direct access to all related data
- Cleaner frontend logic

## Database Schema

### Production Orders Table
```sql
CREATE TABLE production_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  production_number VARCHAR(50) UNIQUE NOT NULL,
  sales_order_id INT,  -- Links to sales order
  project_reference VARCHAR(100),  -- Sales order number for grouping
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  status ENUM(...),
  -- ... other fields
  FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id)
);
```

### Key Relationships
- `production_orders.sales_order_id` → `sales_orders.id`
- `production_orders.project_reference` → `sales_orders.order_number`
- `material_requests.sales_order_id` → `sales_orders.id`
- `production_approvals` → `material_requests` → `sales_orders`

## Migration Status

✅ **Database Migration Completed**
- Added `project_reference` column to `production_orders` table
- Added index for better query performance
- Migrated existing data from sales orders

✅ **API Endpoints Added**
- `/api/manufacturing/approved-sales-orders` - List approved sales orders
- `/api/manufacturing/sales-orders/:id/production-details` - Get complete details

## Next Steps for Frontend Integration

### 1. Update Production Wizard Page
Replace the current "Select Approved Order" dropdown with "Select Sales Order":

```javascript
// Old approach (via production approval)
const approvedOrders = await api.get('/production-approval/list/approved');

// New approach (direct sales orders)
const salesOrders = await api.get('/manufacturing/approved-sales-orders');
```

### 2. Fetch Sales Order Details
When user selects a sales order:

```javascript
const handleSalesOrderSelect = async (salesOrderId) => {
  const response = await api.get(`/manufacturing/sales-orders/${salesOrderId}/production-details`);
  
  // Auto-populate form with all data
  populateFormFromSalesOrder(response.data);
};
```

### 3. Update Form Population Logic
Simplify the data extraction logic since everything comes from one endpoint:

```javascript
const populateFormFromSalesOrder = (data) => {
  const { salesOrder, receivedMaterials } = data;
  
  // Product details
  methods.setValue('orderDetails.productId', salesOrder.product_id);
  methods.setValue('orderDetails.quantity', salesOrder.total_quantity);
  
  // Materials
  methods.setValue('materials.items', receivedMaterials.map(m => ({
    materialId: m.material_code,
    description: m.description,
    requiredQuantity: m.quantity_received,
    unit: m.unit,
    status: 'available'
  })));
};
```

## Testing

### Test Scenario 1: List Approved Sales Orders
```bash
curl -X GET http://localhost:5000/api/manufacturing/approved-sales-orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Scenario 2: Get Sales Order Details
```bash
curl -X GET http://localhost:5000/api/manufacturing/sales-orders/1/production-details \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Scenario 3: Create Production Order
```bash
curl -X POST http://localhost:5000/api/manufacturing/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sales_order_id": 1,
    "product_id": 5,
    "quantity": 500,
    "planned_start_date": "2024-01-20",
    "planned_end_date": "2024-02-10"
  }'
```

## Troubleshooting

### Issue: Sales orders not showing
**Solution:** Check sales order status. Only orders with status `confirmed` or `approved` are shown.

### Issue: Materials not loading
**Solution:** Ensure material requests and receipts are linked to the sales order via `sales_order_id`.

### Issue: Production order creation fails
**Solution:** Verify that `project_reference` column exists in database (run migration if needed).

## Summary

The Sales Order-centric approach provides:
- ✅ Cleaner architecture
- ✅ Better data organization
- ✅ Easier tracking and reporting
- ✅ Simplified frontend logic
- ✅ Single source of truth for all production activities

All production activities now flow from the Sales Order, making it easier to manage and track the entire production lifecycle.