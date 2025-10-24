# Missing Orders API Endpoints Fix

## Issue
The frontend was calling endpoints that didn't exist on the server:
- `PUT /api/orders/:id/status` - Returns 404 Not Found
- `PUT /api/orders/:id/qr-code` - Returns 404 Not Found

These endpoints were being called from:
- **ManufacturingDashboard.jsx** (lines 555, 740) - when sending orders to manufacturing/shipment
- **InventoryDashboard.jsx** (lines 130, 158) - when receiving stock and sending to manufacturing

## Root Cause
The backend did not have a generic orders API route that could handle status updates for different types of orders (SalesOrder, PurchaseOrder, ProductionOrder).

## Solution
Created a new generic orders route (`/server/routes/orders.js`) that:

### 1. PUT `/api/orders/:id/status` Endpoint
- Accepts order ID and new status
- Automatically detects the order type (SalesOrder, PurchaseOrder, ProductionOrder)
- Updates the order status atomically with transaction support
- Updates QR code data for SalesOrders
- Maintains lifecycle history for audit trail
- Returns the updated order with type information

**Request Body:**
```json
{
  "status": "ready_for_shipment",
  "department": "shipment",
  "action": "sent_to_shipment",
  "notes": "Order ready for shipment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "sales_order status updated successfully",
  "order": {
    "id": 3,
    "status": "ready_for_shipment",
    "type": "sales_order"
  }
}
```

### 2. PUT `/api/orders/:id/qr-code` Endpoint
- Accepts order ID and QR code metadata
- Detects order type automatically
- Updates QR code tracking for SalesOrders
- Integrates with existing `updateOrderQRCode` utility

**Request Body:**
```json
{
  "status": "ready_for_shipment",
  "department": "shipment",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## Implementation Details

### New Files Created
- `/server/routes/orders.js` - Generic orders API route

### Modified Files
- `/server/index.js` - Registered new orders route

### Order Type Detection
The endpoints intelligently search for the order in this sequence:
1. SalesOrder (primary, most common)
2. PurchaseOrder (if not found in SalesOrder)
3. ProductionOrder (if not found in PurchaseOrder)

Returns 404 if order not found in any table.

### Features
- ✅ Atomic transactions for data consistency
- ✅ QR code automatic updates for SalesOrders
- ✅ Lifecycle history tracking
- ✅ User audit trail (last_updated_by)
- ✅ Automatic order type detection
- ✅ Error handling with meaningful messages
- ✅ Authentication required (JWT token)

## Testing

### Test Case 1: Update SalesOrder Status
```bash
curl -X PUT http://localhost:5000/api/orders/3/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ready_for_shipment",
    "department": "shipment",
    "action": "sent_to_shipment",
    "notes": "Order ready for shipment"
  }'
```

### Test Case 2: Update QR Code
```bash
curl -X PUT http://localhost:5000/api/orders/3/qr-code \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ready_for_shipment",
    "department": "shipment"
  }'
```

## Frontend Integration
The following frontend files will now work correctly:

1. **ManufacturingDashboard.jsx**
   - `handleSendToShipment()` - Line 740
   - `handleApproveProduction()` - Line 555

2. **InventoryDashboard.jsx**
   - `handleConfirmStockReceipt()` - Line 130
   - `handleSendToManufacturing()` - Line 158

## Database Models Support
Works with all exported models:
- ✅ SalesOrder
- ✅ PurchaseOrder
- ✅ ProductionOrder
- ✅ Any future order-like entities

## Error Handling

| Status Code | Error | Cause |
|------------|-------|-------|
| 404 | Order not found | ID doesn't exist in any order table |
| 400 | Status is required | Missing status in request body |
| 500 | Failed to update | Database/transaction error |

## Migration Guide
No database migration needed. The endpoint works with existing schema.

## Performance Impact
- Minimal: Simple primary key lookups with transaction support
- Transaction ensures data consistency without performance degradation
- QR code updates use existing utility functions

## Security
- Authentication required (JWT token)
- No department-based authorization restriction (flexible for cross-department flows)
- Transaction safety ensures no partial updates

## Future Enhancements
- Add optional department-based authorization checks
- Add status transition validation (prevent invalid state changes)
- Add bulk status update capability
- Add webhook support for status change notifications