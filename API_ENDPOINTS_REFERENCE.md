# Production Tracking API Endpoints Reference

## Base URL
```
http://localhost:5000/api/manufacturing
```

## Authentication
All endpoints require authentication token in header:
```
Authorization: Bearer <token>
```

---

## 📦 Product Wizard

### Get Product Wizard Details
Fetch product details with related sales orders, purchase orders, and inventory items.

**Endpoint**: `GET /products/:productId/wizard-details`

**Parameters**:
- `productId` (path) - Product ID

**Response**:
```json
{
  "product": {
    "id": 1,
    "name": "T-Shirt",
    "product_code": "TS001",
    "specifications": {},
    "barcode": "1234567890",
    "category": "Apparel",
    "subcategory": "T-Shirts"
  },
  "salesOrders": [
    {
      "id": 1,
      "order_number": "SO-2025-001",
      "total_quantity": 100,
      "delivery_date": "2025-03-01",
      "buyer_reference": "REF-001",
      "order_type": "bulk",
      "customer": {
        "id": 1,
        "name": "ABC Company"
      },
      "product_quantity": 50,
      "product_specifications": {}
    }
  ],
  "purchaseOrders": [
    {
      "id": 1,
      "po_number": "PO-2025-001",
      "project_name": "Project A",
      "total_amount": 50000,
      "expected_delivery_date": "2025-02-15",
      "sales_order_id": 1
    }
  ],
  "inventoryItems": [
    {
      "id": 1,
      "barcode": "INV-001",
      "quantity_available": 100,
      "unit": "pcs",
      "location": "Warehouse A"
    }
  ]
}
```

---

## 🔧 Stage Operations

### Get Stage Operations
Get all operations for a specific stage.

**Endpoint**: `GET /stages/:stageId/operations`

**Parameters**:
- `stageId` (path) - Production Stage ID

**Response**:
```json
[
  {
    "id": 1,
    "production_stage_id": 1,
    "operation_name": "Fabric Inspection",
    "operation_order": 1,
    "description": "Inspect fabric for defects",
    "status": "pending",
    "start_time": null,
    "end_time": null,
    "assigned_to": 5,
    "quantity_processed": 0,
    "quantity_approved": 0,
    "quantity_rejected": 0,
    "is_outsourced": false,
    "vendor_id": null,
    "notes": null,
    "assignedUser": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

### Create Stage Operations
Create multiple operations for a stage.

**Endpoint**: `POST /stages/:stageId/operations`

**Parameters**:
- `stageId` (path) - Production Stage ID

**Request Body**:
```json
{
  "operations": [
    {
      "operation_name": "Fabric Inspection",
      "operation_order": 1,
      "description": "Inspect fabric for defects",
      "assigned_to": 5,
      "is_outsourced": false,
      "notes": "Check for color consistency"
    },
    {
      "operation_name": "Cutting",
      "operation_order": 2,
      "description": "Cut fabric according to markers",
      "assigned_to": 6,
      "is_outsourced": false
    }
  ]
}
```

**Response**: Array of created operations

### Update Operation
Update an operation's details.

**Endpoint**: `PUT /operations/:operationId`

**Parameters**:
- `operationId` (path) - Operation ID

**Request Body**:
```json
{
  "status": "in_progress",
  "assigned_to": 5,
  "quantity_processed": 50,
  "notes": "Updated notes"
}
```

**Response**: Updated operation object

### Start Operation
Start an operation (changes status from pending to in_progress).

**Endpoint**: `POST /operations/:operationId/start`

**Parameters**:
- `operationId` (path) - Operation ID

**Response**: Updated operation with status "in_progress" and start_time set

### Complete Operation
Complete an operation with quantities.

**Endpoint**: `POST /operations/:operationId/complete`

**Parameters**:
- `operationId` (path) - Operation ID

**Request Body**:
```json
{
  "quantity_processed": 100,
  "quantity_approved": 95,
  "quantity_rejected": 5,
  "notes": "Completed successfully"
}
```

**Response**: Updated operation with status "completed" and end_time set

---

## 📦 Material Consumption

### Get Material Consumption
Get all material consumption records for a production order.

**Endpoint**: `GET /orders/:orderId/materials`

**Parameters**:
- `orderId` (path) - Production Order ID

**Response**:
```json
[
  {
    "id": 1,
    "production_order_id": 1,
    "production_stage_id": 2,
    "stage_operation_id": 5,
    "inventory_id": 10,
    "material_id": 3,
    "material_barcode": "MAT-001",
    "quantity_allocated": 50,
    "quantity_used": 50,
    "quantity_returned": 0,
    "unit": "meters",
    "status": "consumed",
    "consumed_at": "2025-02-02T10:30:00Z",
    "consumed_by": 5,
    "notes": "Used for cutting",
    "productionStage": {
      "id": 2,
      "stage_name": "Cutting",
      "stage_order": 2
    },
    "stageOperation": {
      "id": 5,
      "operation_name": "Cutting"
    },
    "inventory": {
      "id": 10,
      "barcode": "MAT-001",
      "product": {
        "id": 3,
        "name": "Cotton Fabric",
        "product_code": "FAB-001",
        "category": "Fabric"
      }
    },
    "consumer": {
      "id": 5,
      "name": "John Doe"
    }
  }
]
```

### Record Material Consumption
Record material consumption for a production order.

**Endpoint**: `POST /orders/:orderId/materials/consume`

**Parameters**:
- `orderId` (path) - Production Order ID

**Request Body**:
```json
{
  "production_stage_id": 2,
  "stage_operation_id": 5,
  "inventory_id": 10,
  "material_barcode": "MAT-001",
  "quantity_used": 50,
  "unit": "meters",
  "notes": "Used for cutting operation"
}
```

**Response**: Created material consumption record

**Side Effects**:
- Inventory quantity_available is decreased
- InventoryMovement record is created

### Return Material to Inventory
Return unused materials to inventory.

**Endpoint**: `POST /materials/:consumptionId/return`

**Parameters**:
- `consumptionId` (path) - Material Consumption ID

**Request Body**:
```json
{
  "quantity_returned": 10,
  "notes": "Excess material returned"
}
```

**Response**: Updated material consumption record

**Side Effects**:
- Inventory quantity_available is increased
- InventoryMovement record is created
- Material consumption status updated to "returned" or "partially_consumed"

---

## ✅ Production Completion

### Get Production Completion
Get completion details for a production order.

**Endpoint**: `GET /orders/:orderId/completion`

**Parameters**:
- `orderId` (path) - Production Order ID

**Response**:
```json
{
  "id": 1,
  "production_order_id": 1,
  "required_quantity": 100,
  "produced_quantity": 98,
  "approved_quantity": 95,
  "rejected_quantity": 3,
  "all_quantity_received": false,
  "quantity_shortage_reason": "Material shortage",
  "all_materials_used": false,
  "material_return_summary": {
    "fabric": { "allocated": 100, "used": 95, "returned": 5 }
  },
  "material_return_notes": "Excess fabric returned to inventory",
  "completion_date": "2025-02-02T15:00:00Z",
  "completed_by": 5,
  "sent_to_shipment": true,
  "shipment_date": "2025-02-02T16:00:00Z",
  "shipment_id": 10,
  "notes": "Production completed successfully",
  "productionOrder": {
    "id": 1,
    "order_number": "PROD-2025-001",
    "product": {
      "id": 1,
      "name": "T-Shirt",
      "product_code": "TS001"
    },
    "salesOrder": {
      "id": 1,
      "order_number": "SO-2025-001"
    }
  },
  "completedBy": {
    "id": 5,
    "name": "John Doe"
  },
  "shipment": {
    "id": 10,
    "tracking_number": "SHIP-001",
    "status": "pending"
  }
}
```

### Complete Production
Complete a production order with verification.

**Endpoint**: `POST /orders/:orderId/complete`

**Parameters**:
- `orderId` (path) - Production Order ID

**Request Body**:
```json
{
  "required_quantity": 100,
  "produced_quantity": 98,
  "approved_quantity": 95,
  "rejected_quantity": 3,
  "all_quantity_received": false,
  "quantity_shortage_reason": "Material shortage led to 2 units short",
  "all_materials_used": false,
  "material_return_summary": {
    "fabric": {
      "material_id": 3,
      "material_name": "Cotton Fabric",
      "allocated": 100,
      "used": 95,
      "returned": 5,
      "unit": "meters"
    }
  },
  "material_return_notes": "5 meters of fabric returned to inventory",
  "notes": "Production completed with minor shortage"
}
```

**Response**: Created production completion record

**Validation**:
- All stages must be completed or skipped
- Returns 400 error if incomplete stages exist

**Side Effects**:
- Production order status changed to "completed"
- Production order actual_end_time set

### Send to Shipment
Mark production as sent to shipment.

**Endpoint**: `POST /orders/:orderId/send-to-shipment`

**Parameters**:
- `orderId` (path) - Production Order ID

**Request Body**:
```json
{
  "shipment_id": 10
}
```

**Response**: Updated production completion record

**Validation**:
- Production must be completed first
- Cannot send to shipment twice

---

## 📅 Stage Management

### Update Stage Dates and Status
Update stage start/end dates and status with validation.

**Endpoint**: `PATCH /stages/:stageId/dates`

**Parameters**:
- `stageId` (path) - Production Stage ID

**Request Body**:
```json
{
  "start_date": "2025-02-01T08:00:00Z",
  "end_date": "2025-02-02T17:00:00Z",
  "status": "in_progress"
}
```

**Response**: Updated production stage

**Status Transition Rules**:
- `pending` → `in_progress`: ✅ Allowed (auto-sets actual_start_time)
- `in_progress` → `completed`: ✅ Allowed (auto-sets actual_end_time)
- `pending` → `completed`: ❌ NOT ALLOWED
- Any → `on_hold`: ✅ Allowed
- Any → `skipped`: ✅ Allowed

**Validation**:
- Returns 400 error for invalid status transitions

---

## 🔐 Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid status transition from pending to completed"
}
```

### 404 Not Found
```json
{
  "message": "Production stage not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to fetch stage operations",
  "error": "Detailed error message"
}
```

---

## 📝 Usage Examples

### Example 1: Create Production with Operations

```javascript
// 1. Get product details
const productDetails = await api.get('/manufacturing/products/1/wizard-details');

// 2. Create production order (existing endpoint)
const productionOrder = await api.post('/manufacturing/orders', {
  product_id: 1,
  sales_order_id: productDetails.salesOrders[0].id,
  quantity: 100,
  // ... other fields
});

// 3. Create operations for each stage
for (const stage of productionOrder.stages) {
  const operations = getOperationTemplate(stage.stage_name, stage.outsourced);
  await api.post(`/manufacturing/stages/${stage.id}/operations`, {
    operations
  });
}
```

### Example 2: Track Operation Progress

```javascript
// 1. Start operation
await api.post(`/manufacturing/operations/${operationId}/start`);

// 2. Record material consumption
await api.post(`/manufacturing/orders/${orderId}/materials/consume`, {
  production_stage_id: stageId,
  stage_operation_id: operationId,
  inventory_id: inventoryId,
  material_barcode: 'MAT-001',
  quantity_used: 50,
  unit: 'meters'
});

// 3. Complete operation
await api.post(`/manufacturing/operations/${operationId}/complete`, {
  quantity_processed: 100,
  quantity_approved: 95,
  quantity_rejected: 5,
  notes: 'Completed successfully'
});
```

### Example 3: Complete Production

```javascript
// 1. Get material consumption summary
const materials = await api.get(`/manufacturing/orders/${orderId}/materials`);

// 2. Return unused materials
for (const material of materials) {
  if (material.quantity_allocated > material.quantity_used) {
    const returnQty = material.quantity_allocated - material.quantity_used;
    await api.post(`/manufacturing/materials/${material.id}/return`, {
      quantity_returned: returnQty,
      notes: 'Excess material returned'
    });
  }
}

// 3. Complete production
const completion = await api.post(`/manufacturing/orders/${orderId}/complete`, {
  required_quantity: 100,
  produced_quantity: 98,
  approved_quantity: 95,
  rejected_quantity: 3,
  all_quantity_received: false,
  quantity_shortage_reason: 'Material shortage',
  all_materials_used: true,
  notes: 'Production completed'
});

// 4. Send to shipment
await api.post(`/manufacturing/orders/${orderId}/send-to-shipment`, {
  shipment_id: shipmentId
});
```

---

## 🧪 Testing Endpoints

### Using cURL

```bash
# Get product wizard details
curl -X GET http://localhost:5000/api/manufacturing/products/1/wizard-details \
  -H "Authorization: Bearer YOUR_TOKEN"

# Start an operation
curl -X POST http://localhost:5000/api/manufacturing/operations/1/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Record material consumption
curl -X POST http://localhost:5000/api/manufacturing/orders/1/materials/consume \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "production_stage_id": 2,
    "inventory_id": 10,
    "material_barcode": "MAT-001",
    "quantity_used": 50,
    "unit": "meters"
  }'
```

### Using Postman

1. Import the collection (create one with all endpoints)
2. Set environment variable for `baseUrl` and `token`
3. Test each endpoint sequentially

---

**Last Updated**: 2025-02-02