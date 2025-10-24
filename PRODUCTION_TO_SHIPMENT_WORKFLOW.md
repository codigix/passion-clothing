# Production Complete → Shipment Ready Workflow

## Overview
This document describes the complete workflow when production is finished, including material reconciliation and automatic shipment creation.

## Workflow Steps

### 1. **Production Completion Trigger** (Automatic)
- When all production stages are marked as "completed"
- System automatically detects this state
- Shows "Complete Production & Ready for Shipment" dialog

### 2. **Material Reconciliation Dialog**
User reviews leftover materials and decides:
- **Option A**: Return leftover materials to inventory
- **Option B**: Hold materials (don't return)
- **Option C**: Partially return specific materials

### 3. **Inventory Update** (If returning materials)
- Leftover materials automatically added back to inventory
- Each item tracked with source reference (production order ID)
- Inventory audit trail created

### 4. **Shipment Creation** (Automatic)
- Creates shipment record with status "preparing"
- Links to sales order
- Copies items from production order
- Sets expected delivery date (configurable)

### 5. **Production Order Status Update**
- Mark as "completed"
- Record completion timestamp
- Store material reconciliation data

### 6. **Shipment Dashboard Display**
- Shows all shipments with status "preparing" or "ready_to_ship"
- Displays "Pending Shipments" tab with ready-for-shipment orders
- Quick action buttons for dispatch/packaging

## Database Changes

### New Fields (if needed):
- `ProductionOrder.material_reconciliation_data` (JSON) - stores leftover material info
- `ProductionOrder.completed_at` (DATE) - completion timestamp
- `Shipment.production_order_id` (FK) - links shipment to production

### Status Values:
- ProductionOrder: `completed`
- Shipment: `preparing` → `packed` → `ready_to_ship` → `shipped`

## API Endpoints

### New Endpoint: Complete Production & Create Shipment
```
POST /manufacturing/orders/:orderId/complete-and-ship

Request Body:
{
  "material_reconciliation": {
    "return_to_inventory": true,
    "leftover_materials": [
      {
        "inventory_id": 123,
        "quantity_used": 50,
        "quantity_leftover": 10,
        "return_to_stock": true
      }
    ],
    "notes": "Materials returned successfully"
  },
  "shipment_details": {
    "expected_delivery_date": "2025-01-15",
    "shipping_address": "Customer address",
    "special_instructions": "Handle with care"
  }
}

Response:
{
  "success": true,
  "production_order": { ... },
  "shipment": { ... },
  "material_movements": [ ... ]
}
```

## Frontend Components

### 1. **Production Operations View Enhancement**
- Add "Complete & Ready for Shipment" button
- Only shows when all stages are completed
- Triggers material reconciliation dialog

### 2. **Material Reconciliation Dialog**
- Shows list of materials used in production
- Display: Material Name | Used Qty | Leftover Qty | Return?
- Summary of total materials to return
- Confirm/Cancel buttons

### 3. **Completion Success Screen**
- Shows production order summary
- Material reconciliation summary
- Shipment creation confirmation
- Auto-redirect to Shipment Dashboard (3 sec)

### 4. **Shipment Dashboard Updates**
- Add "Ready for Shipment" tab/filter
- Show orders ready for dispatch
- Quick actions: Pack, Ship, Print Label

## Implementation Checklist

### Backend
- [ ] Add database migration for new fields (if needed)
- [ ] Create `/manufacturing/orders/:orderId/complete-and-ship` endpoint
- [ ] Implement material reconciliation logic
- [ ] Implement shipment creation logic
- [ ] Add transaction support (rollback on error)
- [ ] Add validation checks
- [ ] Add notifications

### Frontend
- [ ] Update ProductionOperationsViewPage with completion button
- [ ] Create MaterialReconciliationDialog component
- [ ] Create ProductionCompletionSuccessDialog component
- [ ] Update ShipmentDashboard to show pending shipments
- [ ] Add auto-navigation after completion
- [ ] Add loading/error states

### Testing
- [ ] Test with completed production orders
- [ ] Test material reconciliation scenarios
- [ ] Test shipment creation
- [ ] Test error handling (no materials, invalid order)
- [ ] Test dashboard display
- [ ] Test auto-navigation

## User Experience Flow

```
Production Stages All Completed
            ↓
Show "Complete Production" button
            ↓
Click button
            ↓
Material Reconciliation Dialog
            ↓
Review materials & select return option
            ↓
Click "Confirm"
            ↓
[Backend Processing]
- Update production order → completed
- Return materials to inventory
- Create shipment → preparing
- Create notifications
            ↓
Success Screen (3 sec)
            ↓
Auto-redirect to Shipment Dashboard
```

## Status Transitions

### Production Order
```
pending → in_progress → [stages] → completed
                                      ↓
                                 [Material Reconciliation]
                                      ↓
                                    [Inventory Update]
```

### Shipment
```
preparing → packed → ready_to_ship → shipped → in_transit → delivered
```

## Example Scenarios

### Scenario 1: All materials used, none leftover
- Material reconciliation shows 0 leftover
- No materials returned to inventory
- Shipment created immediately
- Confirmation shows "No materials returned"

### Scenario 2: Partial materials used
- Materials with leftovers shown
- User selects which to return
- Selected materials added back to inventory
- Others held for future use
- Shipment created with actual used quantities

### Scenario 3: Defective items produced
- Production completed but with rejected quantity
- Shipment includes only approved quantity
- Rejected items tracked separately
- Material reconciliation excludes defective qty

## Error Handling

- **No active production stages**: Can't complete
- **Materials not verified**: Block completion
- **No approved quantity**: Show warning
- **Inventory full**: Show error, allow retry
- **Shipment creation fails**: Rollback all changes

## Notifications

When production completes:
1. **Manufacturing**: "Production order #{id} completed"
2. **Shipment**: "New shipment ready for dispatch"
3. **Sales**: "Order #{id} ready for shipment"
4. **Inventory**: "Materials reconciled, #{qty} items returned"

## Future Enhancements

1. **Batch Shipments**: Combine multiple completed orders into one shipment
2. **Smart Routing**: Auto-select courier based on delivery location
3. **Insurance Options**: Calculate and offer insurance for shipment
4. **COD Support**: Enable cash-on-delivery for specific orders
5. **Return Management**: Track return shipments after delivery
6. **Fulfillment Rules**: Auto-complete based on quality checks