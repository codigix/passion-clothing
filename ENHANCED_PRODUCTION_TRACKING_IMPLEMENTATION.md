# Enhanced Production Tracking System - Implementation Guide

## Overview
This implementation provides a comprehensive production tracking system with:
- ✅ Detailed stage operations for each manufacturing stage
- ✅ Start/end dates and status tracking for all operations
- ✅ Barcode-based material consumption tracking
- ✅ Outsourcing workflow with automatic challan creation
- ✅ Final product overview with quality checks
- ✅ Material return to inventory functionality
- ✅ Collapsed accordion view for completed productions
- ✅ Send to shipment functionality

## Database Schema

### New Tables Created

#### 1. `stage_operations`
Tracks individual operations within each production stage.

**Key Fields:**
- `production_stage_id` - Parent stage
- `operation_name` - Name of the operation
- `operation_order` - Sequence number
- `status` - pending/in_progress/completed/skipped/failed
- `start_time` / `end_time` - Actual timestamps
- `is_outsourced` - Whether this operation is outsourced
- `vendor_id` - Vendor for outsourced work
- `challan_id` / `return_challan_id` - Dispatch and return challans
- `quantity_processed/approved/rejected` - Quantity tracking
- `photos` - JSON array of photo URLs

#### 2. `material_consumptions`
Tracks barcode-based material usage during production.

**Key Fields:**
- `production_order_id` - Production order
- `production_stage_id` - Stage where material used
- `stage_operation_id` - Specific operation
- `inventory_id` - Inventory item used
- `barcode` - Scanned barcode
- `quantity_used` - Quantity consumed
- `consumed_at` / `consumed_by` - Tracking info

#### 3. `production_completions`
Final production overview and shipment tracking.

**Key Fields:**
- `production_order_id` - One-to-one with production order
- `required_quantity` / `produced_quantity` - Quantity tracking
- `all_quantity_received` - Boolean with reason if false
- `all_materials_used` - Boolean tracking
- `remaining_materials` - JSON array of unused materials
- `material_returned_to_inventory` - Return status
- `total_duration_hours` / `efficiency_percentage` - Performance metrics
- `quality_passed` / `quality_notes` - QC summary
- `ready_for_shipment` / `sent_to_shipment_at` - Shipment status
- `shipment_id` - Link to shipment record

## Manufacturing Stages

### 1. Material Calculation
Checking and verifying materials before production.

**Operations:**
1. Review Production Request
2. Verify Material Availability
3. Calculate Exact Quantities
4. Create Material Requisition
5. Approve Material Plan

### 2. Cutting
Fabric cutting operations.

**Operations:**
1. Prepare Cutting Table
2. Fabric Spreading
3. Pattern Marking
4. Cut Fabric
5. Bundle and Label
6. Quality Check

### 3. Embroidery/Printing
Outsourced decorative operations.

**Operations:**
1. Design Selection
2. Prepare Work Order
3. **Send to Vendor** (auto-creates dispatch challan) 🔄
4. **Track Vendor Progress** (outsourced) 🔄
5. **Receive from Vendor** (auto-creates return challan) 🔄
6. Quality Inspection

### 4. Stitching
Garment assembly operations.

**Operations:**
1. Prepare Sewing Machines
2. Thread Color Matching
3. Assemble Garment Parts
4. Seam Finishing
5. Attach Accessories
6. In-line Quality Check

### 5. Finishing
Final garment finishing.

**Operations:**
1. Thread Trimming
2. Washing
3. Drying
4. Ironing/Pressing
5. Spot Cleaning
6. Final Touch-up

### 6. Quality Control
Final quality inspection.

**Operations:**
1. Visual Inspection
2. Measurement Check
3. Color Consistency
4. Stitch Quality
5. Accessories Check
6. Final Approval

### 7. Packaging
Packaging for shipment.

**Operations:**
1. Fold Garments
2. Attach Tags
3. Pack in Poly Bags
4. Box Packing
5. Carton Labeling
6. Ready for Shipment

## API Endpoints

### Stage Operations

#### Get Operations for Stage
```http
GET /api/manufacturing/stages/:stageId/operations
```

**Response:**
```json
{
  "operations": [
    {
      "id": 1,
      "operation_name": "Fabric Spreading",
      "operation_order": 2,
      "status": "completed",
      "start_time": "2025-01-20T09:00:00Z",
      "end_time": "2025-01-20T09:30:00Z",
      "quantity_processed": 100,
      "assigned_to": 5,
      "assignedUser": {
        "name": "John Doe"
      }
    }
  ]
}
```

#### Start Operation
```http
POST /api/manufacturing/operations/:operationId/start
```

**Request Body:**
```json
{
  "assigned_to": 5,
  "notes": "Starting fabric spreading"
}
```

#### Complete Operation
```http
POST /api/manufacturing/operations/:operationId/complete
```

**Request Body:**
```json
{
  "quantity_processed": 100,
  "quantity_approved": 98,
  "quantity_rejected": 2,
  "notes": "Operation completed",
  "photos": ["url1.jpg", "url2.jpg"]
}
```

#### Outsource Operation
```http
POST /api/manufacturing/operations/:operationId/outsource
```

**Request Body:**
```json
{
  "vendor_id": 3,
  "items": [
    {
      "description": "Embroidery work",
      "quantity": 100,
      "unit": "pieces"
    }
  ],
  "notes": "Custom design embroidery"
}
```

**Creates automatic dispatch challan and links to operation**

#### Receive Outsourced Work
```http
POST /api/manufacturing/operations/:operationId/receive
```

**Request Body:**
```json
{
  "quantity_received": 98,
  "quantity_approved": 95,
  "quantity_rejected": 3,
  "notes": "2 pieces missing",
  "photos": ["received1.jpg"]
}
```

**Creates automatic return challan from vendor**

### Material Consumption

#### Record Material Usage
```http
POST /api/manufacturing/orders/:orderId/consume-material
```

**Request Body:**
```json
{
  "stage_id": 5,
  "operation_id": 12,
  "barcode": "FAB-2025-001-12345",
  "quantity_used": 5.5,
  "unit": "meters",
  "notes": "Used for cutting"
}
```

**System automatically:**
- Verifies barcode exists in inventory
- Deducts from project stock
- Creates consumption record
- Updates material requirement tracking

#### Get Material Consumption
```http
GET /api/manufacturing/orders/:orderId/material-consumption
```

**Response:**
```json
{
  "consumptions": [
    {
      "id": 1,
      "barcode": "FAB-2025-001-12345",
      "inventory": {
        "name": "Cotton Fabric",
        "color": "Blue"
      },
      "quantity_used": 5.5,
      "unit": "meters",
      "consumed_at": "2025-01-20T10:30:00Z",
      "consumer": {
        "name": "John Doe"
      },
      "stage": {
        "stage_name": "cutting"
      },
      "operation": {
        "operation_name": "Cut Fabric"
      }
    }
  ],
  "summary": {
    "total_items": 5,
    "total_cost": 5000.00
  }
}
```

### Production Completion

#### Complete Production
```http
POST /api/manufacturing/orders/:orderId/complete
```

**Request Body:**
```json
{
  "produced_quantity": 98,
  "approved_quantity": 95,
  "rejected_quantity": 3,
  "all_quantity_received": false,
  "quantity_shortfall_reason": "Material shortage in last batch",
  "all_materials_used": false,
  "remaining_materials": [
    {
      "inventory_id": 15,
      "barcode": "FAB-2025-001-12346",
      "quantity_remaining": 2.5,
      "unit": "meters"
    }
  ],
  "quality_passed": true,
  "quality_notes": "All quality checks passed",
  "notes": "Production completed successfully"
}
```

**System automatically:**
- Creates `production_completions` record
- Calculates efficiency and duration
- Updates production order status to 'completed'
- Returns remaining materials to factory stock (if requested)
- Sends notifications to relevant departments

#### Return Materials to Inventory
```http
POST /api/manufacturing/completions/:completionId/return-materials
```

**Request Body:**
```json
{
  "materials": [
    {
      "inventory_id": 15,
      "barcode": "FAB-2025-001-12346",
      "quantity_returned": 2.5,
      "condition": "good",
      "notes": "Unused material from production"
    }
  ]
}
```

**System automatically:**
- Deducts from project stock
- Adds back to factory stock
- Creates inventory movement records
- Updates `material_returned_to_inventory` flag

#### Send to Shipment
```http
POST /api/manufacturing/completions/:completionId/send-to-shipment
```

**Request Body:**
```json
{
  "shipment_details": {
    "courier_partner_id": 2,
    "delivery_address": "...",
    "estimated_delivery_date": "2025-01-25"
  }
}
```

**System automatically:**
- Creates shipment record
- Links completion to shipment
- Updates `sent_to_shipment_at` timestamp
- Sends notifications to logistics team
- Marks production order as 'shipped'

#### Get Production Completion
```http
GET /api/manufacturing/completions/:orderId
```

**Response:**
```json
{
  "completion": {
    "id": 1,
    "production_order_id": 10,
    "required_quantity": 100,
    "produced_quantity": 98,
    "approved_quantity": 95,
    "rejected_quantity": 3,
    "all_quantity_received": false,
    "quantity_shortfall_reason": "Material shortage",
    "all_materials_used": false,
    "remaining_materials": [...],
    "material_returned_to_inventory": true,
    "total_duration_hours": 48.5,
    "efficiency_percentage": 95.5,
    "quality_passed": true,
    "ready_for_shipment": true,
    "completed_at": "2025-01-20T18:00:00Z",
    "completedBy": {
      "name": "Production Manager"
    },
    "productionOrder": {
      "production_number": "PRO-2025-001",
      "product": {
        "name": "Custom Saree"
      }
    }
  }
}
```

## Frontend Integration

### Production Tracking Page Updates

**Key Features:**
1. **Expanded View** - Shows all stages and operations with start/end dates
2. **Material Tracking** - Barcode scanner integration for material consumption
3. **Operation Actions** - Start, pause, complete, skip operations
4. **Outsourcing** - Special UI for outsourced operations with vendor selection
5. **Photo Upload** - Attach photos at each operation
6. **Real-time Status** - Live status updates for all operations

**Collapsed View (After Completion):**
```jsx
<Accordion>
  <AccordionSummary>
    <Box>
      <Typography>PRO-2025-001 - Custom Saree</Typography>
      <Chip label="Completed" color="success" />
      <Typography variant="caption">
        Completed: Jan 20, 2025 6:00 PM
      </Typography>
    </Box>
    <Button variant="contained">Send to Shipment</Button>
  </AccordionSummary>
  <AccordionDetails>
    {/* Detailed completion summary */}
  </AccordionDetails>
</Accordion>
```

### Material Consumption Component

```jsx
<MaterialConsumptionDialog
  open={open}
  productionOrderId={orderId}
  stageId={currentStage.id}
  operationId={currentOperation.id}
  onScan={(barcode) => {
    // Auto-fetch inventory details
    // Show quantity input
    // Record consumption
  }}
  onClose={() => setOpen(false)}
/>
```

### Outsourcing Workflow Component

```jsx
<OutsourcingDialog
  operation={operation}
  onSendToVendor={async (vendorId, items) => {
    // Create dispatch challan
    // Update operation status
    // Send notification to vendor
  }}
  onReceiveFromVendor={async (data) => {
    // Create return challan
    // Record quantities
    // Complete operation
  }}
/>
```

## Installation Steps

### 1. Run Migration
```bash
cd server
npx sequelize-cli db:migrate
```

### 2. Test API Endpoints
Use the test script to verify all endpoints:
```bash
node test-enhanced-production-tracking.js
```

### 3. Update Frontend
Install the updated frontend components:
```bash
cd client
npm install
```

### 4. Restart Servers
```bash
# From root directory
npm run dev
```

## Usage Workflow

### Starting Production with Operations

1. **Start Production Order** (existing flow)
2. **System auto-creates stage operations** based on templates
3. **For each stage:**
   - View all operations
   - Start each operation individually
   - Track start/end times
   - Record material consumption with barcode
   - Upload photos at each step
   - Complete operation with quantities

### Handling Outsourced Work (Embroidery)

1. **Reach Embroidery Stage**
2. **Operation: "Send to Vendor"**
   - Select vendor
   - System creates dispatch challan automatically
   - Material deducted from inventory
   - Status: "outsourced"

3. **Track Progress** (manual updates)
   - Add notes about vendor progress
   - Set expected completion date

4. **Operation: "Receive from Vendor"**
   - Enter received quantities
   - System creates return challan automatically
   - Material added back to inventory
   - Mark defects/rejections
   - Upload photos

### Material Tracking

**At any operation:**
1. Click "Record Material Usage"
2. Scan barcode or enter manually
3. System shows:
   - Material name
   - Available quantity
   - Current location
4. Enter quantity used
5. System automatically:
   - Deducts from project stock
   - Creates consumption record
   - Updates material requirements

### Completing Production

**When all stages complete:**
1. System shows "Complete Production" button
2. Open completion dialog:
   - **Quantity Summary**
     - Required: 100
     - Produced: 98
     - Approved: 95
     - Rejected: 3
   - ☐ All required quantity received?
     - If No → Enter reason
   - **Material Summary**
     - Shows all materials used
     - ☐ All materials consumed?
     - If No → List remaining materials
   - **Quality Summary**
     - ☐ Quality checks passed?
     - Enter quality notes
3. Submit completion
4. **If materials remain:**
   - System shows "Return Materials" dialog
   - Scan/select materials to return
   - System moves from project → factory stock
5. **Production card collapses** to single line
6. Shows "Send to Shipment" button

### Sending to Shipment

1. Click "Send to Shipment" on completed production
2. Enter shipment details:
   - Courier partner
   - Tracking number
   - Estimated delivery
3. System:
   - Creates shipment record
   - Links to sales order
   - Sends notifications
   - Archives production in "Completed" section

## Key Benefits

✅ **Complete Visibility** - Track every operation with timestamps
✅ **Material Accountability** - Barcode-based tracking prevents waste
✅ **Outsourcing Integration** - Automatic challan creation for vendors
✅ **Quality Tracking** - QC at every operation
✅ **Efficient Returns** - Easy material return to inventory
✅ **Clean UI** - Collapsed view for completed productions
✅ **Audit Trail** - Complete history of all activities
✅ **Photo Documentation** - Visual proof at each stage

## Database Relationships

```
ProductionOrder
  ├── ProductionStages (many)
  │   ├── StageOperations (many)
  │   │   ├── MaterialConsumptions (many)
  │   │   ├── Challan (dispatch)
  │   │   └── Challan (return)
  │   └── MaterialConsumptions (many)
  └── ProductionCompletion (one)
      └── Shipment (one)
```

## Next Steps

1. **Run the migration** to create new tables
2. **Test API endpoints** with the provided test script
3. **Update frontend components** to use new operations
4. **Train users** on new workflow
5. **Monitor and optimize** based on usage

---

**Implementation Date:** January 2025
**Status:** ✅ Ready for Deployment
**Maintained by:** Zencoder AI Assistant