# Production Operations View - Simplified Implementation

## Overview
This document describes the simplified Production Operations View with support for outsourcing (embroidery/printing) and material reconciliation (final stage).

## ✨ Key Features

### 1. **Simplified Stage Management**
- ✅ Clean, minimal interface
- ✅ Edit start date and end date with time
- ✅ No complex substages or detailed operations
- ✅ Quick action buttons: Start, Pause, Complete, Hold
- ✅ Progress tracking across all stages
- ✅ Stage-by-stage navigation

### 2. **Outsourcing Flow (Embroidery & Printing Stages)**

#### Supported Stages
- Embroidery
- Printing
- Screen Printing
- Washing

#### Work Type Selection
- **In-House**: Work done internally
- **Outsourced**: Work sent to external vendor

#### Outward Challan (Sending to Vendor)
When outsourcing, you can create an outward challan with:
- Vendor selection
- Quantity to send
- Expected return date
- Transport details (mode, vehicle number)
- Special instructions

**Process:**
1. Select work type as "Outsourced"
2. Click "Create Outward Challan"
3. Fill in vendor details and items
4. Submit - challan is created and stage marked as in-progress

#### Inward Challan (Receiving from Vendor)
After vendor completes work, record receipt with:
- Link to outward challan
- Received quantity
- Quality inspection notes
- Any discrepancies

**Process:**
1. Click "Create Inward Challan"
2. Select the corresponding outward challan
3. Enter received quantity
4. Add quality notes and discrepancies
5. Submit - inward challan created, outward challan marked complete

#### Challan Tracking
- All challans for the stage are displayed
- Shows challan number, type (outward/inward), and status
- Easy reference for audit trail

### 3. **Material Reconciliation (Final Stage)**

When you reach the final production stage, the system helps you:

#### Features
- Calculate actual material consumption
- Track wastage
- Identify leftover materials
- Automatically return leftovers to inventory

#### Process
1. **Open Reconciliation**: Click "Open Material Reconciliation" button
2. **Review Materials**: See all allocated materials with:
   - Allocated quantity
   - Current consumed quantity
   - Current wasted quantity
   - Calculated leftover
3. **Update Actuals**: Edit:
   - Actual consumed amount
   - Actual wasted amount
   - System auto-calculates leftover
4. **Submit**: Complete reconciliation
   - Leftover materials returned to inventory
   - Inventory quantities updated
   - Inventory movement records created

#### Example
```
Material: Cotton Fabric
- Allocated: 100 meters
- Consumed: 85 meters (editable)
- Wasted: 5 meters (editable)
- Leftover: 10 meters (auto-calculated)

After submission:
✓ 10 meters returned to inventory
✓ Inventory movement recorded
✓ Material allocation updated
```

## 🔌 Backend Endpoints

### Outsourcing APIs

#### Create Outward Challan
```http
POST /api/manufacturing/stages/:stageId/outsource/outward
Authorization: Bearer <token>

Body:
{
  "vendor_id": 1,
  "items": [
    {
      "product_name": "T-Shirts",
      "quantity": 100,
      "rate": 50,
      "description": "Embroidery work"
    }
  ],
  "expected_return_date": "2025-02-15",
  "notes": "Handle with care",
  "transport_details": {
    "mode": "Truck",
    "vehicle_number": "MH01AB1234"
  }
}

Response:
{
  "message": "Outward challan created successfully",
  "challan": { ... }
}
```

#### Create Inward Challan
```http
POST /api/manufacturing/stages/:stageId/outsource/inward
Authorization: Bearer <token>

Body:
{
  "outward_challan_id": 123,
  "items": [...],
  "received_quantity": 95,
  "quality_notes": "Good quality work",
  "discrepancies": "5 pieces damaged"
}

Response:
{
  "message": "Inward challan created successfully",
  "challan": { ... },
  "stage_updated": true
}
```

#### Get Stage Challans
```http
GET /api/manufacturing/stages/:stageId/challans
Authorization: Bearer <token>

Response:
{
  "challans": [
    {
      "id": 123,
      "challan_number": "CHN-20250131-0001",
      "type": "outward",
      "status": "pending",
      "vendor": { ... }
    }
  ]
}
```

### Material Reconciliation APIs

#### Get Materials for Reconciliation
```http
GET /api/manufacturing/orders/:orderId/materials/reconciliation
Authorization: Bearer <token>

Response:
{
  "materials": [
    {
      "id": 1,
      "inventory_id": 45,
      "item_name": "Cotton Fabric",
      "category": "fabric",
      "barcode": "BAR-001",
      "unit": "meters",
      "quantity_allocated": 100,
      "quantity_consumed": 80,
      "quantity_wasted": 5,
      "quantity_returned": 0,
      "quantity_remaining": 15,
      "status": "in_use"
    }
  ]
}
```

#### Submit Material Reconciliation
```http
POST /api/manufacturing/orders/:orderId/materials/reconcile
Authorization: Bearer <token>

Body:
{
  "materials": [
    {
      "allocation_id": 1,
      "actual_consumed": 85,
      "actual_wasted": 5,
      "leftover_quantity": 10,
      "notes": "Slightly more fabric used than expected"
    }
  ],
  "notes": "Final stage reconciliation completed"
}

Response:
{
  "message": "Material reconciliation completed successfully",
  "reconciliation_results": [
    {
      "item": "Cotton Fabric",
      "leftover_returned": 10,
      "new_inventory_quantity": 510
    }
  ]
}
```

## 📋 User Flow Examples

### Example 1: In-House Production
1. Navigate to Production Tracking
2. Click eye icon on production order
3. Select stage (e.g., "Cutting")
4. Click "Start Stage"
5. Edit start/end dates as needed
6. Add notes
7. Click "Complete Stage"
8. Move to next stage

### Example 2: Outsourced Embroidery
1. Navigate to Embroidery stage
2. Select "Outsourced" work type
3. Click "Create Outward Challan"
4. Select vendor (e.g., "ABC Embroidery Works")
5. Enter quantity: 500 pieces
6. Set expected return date
7. Add transport details
8. Submit challan
9. [After vendor completes work]
10. Click "Create Inward Challan"
11. Select the outward challan
12. Enter received quantity: 490 pieces
13. Add quality notes: "Good quality, 10 pieces rejected"
14. Submit
15. Stage quantities updated automatically

### Example 3: Final Stage Material Reconciliation
1. Navigate to final stage (e.g., "Packaging")
2. Stage status: "In Progress"
3. Click "Open Material Reconciliation"
4. Review all materials:
   - Fabric: 100m allocated, update consumed to 88m
   - Thread: 50 spools allocated, update consumed to 47
   - Buttons: 1000 pcs allocated, update consumed to 980
5. System calculates leftovers:
   - Fabric: 12m leftover
   - Thread: 3 spools leftover
   - Buttons: 20 pcs leftover
6. Click "Complete Reconciliation"
7. Success! All leftovers returned to inventory
8. Inventory movements recorded
9. Complete the final stage

## 🎨 UI Components

### Stage Sidebar
- Left panel showing all stages
- Color-coded status indicators:
  - ✅ Green: Completed
  - 🔵 Blue: In Progress
  - 🟠 Orange: On Hold
  - ⚪ Gray: Pending
- Click to switch between stages

### Stage Details Panel
- **Header**: Stage name and status badge
- **Edit Button**: Toggle edit mode
- **Date/Time Fields**: 
  - Start Date & Time
  - End Date & Time
  - Auto-calculated Duration
- **Notes**: Text area for stage-specific notes
- **Outsourcing Options**: (if applicable)
  - Work type selector
  - Challan creation buttons
  - Existing challans list
- **Material Reconciliation**: (if last stage)
  - Warning about final stage
  - Reconciliation button
- **Quick Actions**:
  - Previous Stage
  - Start/Pause/Complete
  - Next Stage

### Material Reconciliation Dialog
- Modal overlay
- Table with columns:
  - Material Name
  - Allocated Quantity
  - Consumed (editable)
  - Wasted (editable)
  - Leftover (calculated)
- Submit/Cancel buttons
- Info message about auto-return

## 🔒 Permissions

Required permissions:
- `manufacturing:view` - View production orders
- `manufacturing:edit` - Edit stages and dates
- `manufacturing:outsource` - Create challans (if needed)

Department access:
- Manufacturing
- Admin

## 📝 Database Schema

### Challans Table (Existing)
- `type`: 'outward' | 'inward'
- `sub_type`: 'outsourcing'
- `order_id`: Links to production order
- `vendor_id`: Vendor reference
- `items`: JSON array of items
- `status`: 'draft' | 'pending' | 'completed' | 'cancelled'

### Material Allocations Table (Existing)
- `quantity_allocated`: Total allocated
- `quantity_consumed`: Used quantity
- `quantity_wasted`: Wastage
- `quantity_returned`: Leftover returned
- `status`: 'allocated' | 'in_use' | 'consumed' | 'partially_returned'
- `reconciliation_notes`: Final notes

### Inventory Movements Table (Existing)
- `movement_type`: 'return' (for leftovers)
- `quantity`: Returned amount
- `reference_type`: 'production_order'
- `reference_id`: Production order ID

## 🚀 Testing Guide

### Test Case 1: Simple Stage Completion
1. ✓ Start stage
2. ✓ Edit start date/time
3. ✓ Edit end date/time
4. ✓ Verify duration calculation
5. ✓ Add notes
6. ✓ Complete stage
7. ✓ Verify stage status changes

### Test Case 2: Outsourcing Flow
1. ✓ Select outsourcing stage
2. ✓ Choose "Outsourced" work type
3. ✓ Create outward challan with vendor
4. ✓ Verify challan appears in list
5. ✓ Create inward challan
6. ✓ Verify stage quantities updated
7. ✓ Check both challans linked

### Test Case 3: Material Reconciliation
1. ✓ Navigate to final stage
2. ✓ Open reconciliation dialog
3. ✓ Verify all materials listed
4. ✓ Edit consumed/wasted quantities
5. ✓ Verify leftover auto-calculation
6. ✓ Submit reconciliation
7. ✓ Check inventory quantities updated
8. ✓ Verify movement records created

## 🎯 Benefits

1. **Simplified Interface**: No complex substages, easy to use
2. **Outsourcing Support**: Complete challan flow for external work
3. **Material Tracking**: Automatic leftover return to inventory
4. **Audit Trail**: All challans and movements recorded
5. **Real-time Updates**: Stage progress and material status
6. **Vendor Management**: Track outsourced work by vendor
7. **Cost Control**: Know exactly what's consumed vs wasted
8. **Inventory Accuracy**: Automatic reconciliation and return

## 📌 Important Notes

1. **Outsourcing Stages**: System automatically detects embroidery, printing, screen_printing, and washing stages
2. **Leftover Return**: Materials are returned to inventory only after reconciliation submission
3. **Challan Linking**: Inward challans must reference an existing outward challan
4. **Final Stage Only**: Material reconciliation appears only in the last production stage
5. **Edit Mode**: Dates can only be edited in edit mode
6. **Stage Order**: Maintain stage sequence for proper flow

## 🔧 Customization

### Add More Outsourcing Stages
Edit `isOutsourcingStage()` function:
```javascript
const isOutsourcingStage = (stageName) => {
  const outsourcingStages = [
    'embroidery', 
    'printing', 
    'screen_printing', 
    'washing',
    'dyeing',  // Add new stage
    'pleating' // Add new stage
  ];
  return outsourcingStages.some(stage => 
    stageName.toLowerCase().includes(stage)
  );
};
```

### Modify Reconciliation Logic
Edit `handleReconciliationSubmit()` to add custom business rules.

## 📞 Support

For issues or questions:
1. Check backend logs for API errors
2. Verify permissions in user profile
3. Ensure vendors are created before outsourcing
4. Check material allocations before reconciliation

---

**Last Updated**: January 31, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready