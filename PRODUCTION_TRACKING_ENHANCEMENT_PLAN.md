# Production Tracking Enhancement Plan

## Overview
Comprehensive production tracking system with detailed stage operations, material tracking, and shipment integration.

## Key Requirements

### 1. Production Wizard Enhancement
- **Product Selection Dropdown**: Select from existing products
- **Auto-populate Data**: 
  - Quantity from sales order
  - PO number
  - Product barcodes
  - Material requirements
- **Customization Options**:
  - Printing (In-house/Outsource)
  - Embroidery (In-house/Outsource)
- **Submit**: "Ready to Production" button

### 2. Production Stages with Operations

#### Stage 1: Calculate Material
- **Operations**:
  - Review material requirements
  - Check material availability
  - Verify barcode assignments
- **Fields**: Start Date, End Date, Status, Notes
- **Status**: Must be "In Progress" when started (not "Complete")

#### Stage 2: Cutting
- **Operations**:
  - Fabric cutting
  - Pattern matching
  - Quality check
- **Fields**: Start Date, End Date, Status, Quantity Cut, Rejected Qty, Notes

#### Stage 3: Embroidery/Printing
- **Type Selection**: In-house or Outsource
- **If Outsource**:
  - Vendor selection
  - Dispatch date
  - Expected return date
  - Challan generation
- **If In-house**:
  - Machine assignment
  - Operator assignment
- **Operations**: Design application, Quality check
- **Fields**: Start Date, End Date, Status, Quantity Processed, Notes

#### Stage 4: Stitching
- **Operations**:
  - Assembly
  - Seam quality check
  - Measurement verification
- **Fields**: Start Date, End Date, Status, Quantity Stitched, Rejected Qty, Notes

#### Stage 5: Finishing
- **Operations**:
  - Ironing/Pressing
  - Button/Zipper attachment
  - Tag attachment
  - Final inspection
- **Fields**: Start Date, End Date, Status, Quantity Finished, Notes

#### Stage 6: Quality Check
- **Operations**:
  - Final quality inspection
  - Packaging
  - Barcode verification
- **Fields**: Start Date, End Date, Status, Approved Qty, Rejected Qty, Notes

### 3. Production Completion Overview
- **Required Quantity Check**: 
  - ✓ All required quantity received
  - ✗ Reason for shortage
- **Material Usage Check**:
  - ✓ All material used
  - ✗ Calculate remaining material by barcode
  - Return excess to inventory
- **Final Status**: Production Done → Send to Shipment

### 4. Shipment Integration
- **After Completion**: 
  - Collapse production stages (accordion view)
  - Show summary only
  - Create shipment record
  - Update inventory

## Database Schema Updates

### ProductionStage Table (Enhanced)
```sql
- start_date (DATE)
- end_date (DATE)
- status (ENUM: 'pending', 'in_progress', 'completed', 'on_hold')
- operations (JSON) - Array of operation objects
- outsource_type (ENUM: 'none', 'printing', 'embroidery', 'both')
- outsource_vendor_id (INT)
- outsource_dispatch_date (DATE)
- outsource_return_date (DATE)
- challan_id (INT)
```

### StageOperation Table (New)
```sql
- id (INT, PK)
- production_stage_id (INT, FK)
- operation_name (VARCHAR)
- operation_order (INT)
- status (ENUM: 'pending', 'in_progress', 'completed')
- start_time (DATETIME)
- end_time (DATETIME)
- assigned_to (INT, FK to users)
- notes (TEXT)
```

### MaterialConsumption Table (Enhanced)
```sql
- id (INT, PK)
- production_order_id (INT, FK)
- production_stage_id (INT, FK)
- material_barcode (VARCHAR)
- quantity_used (DECIMAL)
- quantity_returned (DECIMAL)
- status (ENUM: 'allocated', 'consumed', 'returned')
```

### ProductionCompletion Table (New)
```sql
- id (INT, PK)
- production_order_id (INT, FK)
- required_quantity (INT)
- produced_quantity (INT)
- approved_quantity (INT)
- rejected_quantity (INT)
- all_materials_used (BOOLEAN)
- material_return_notes (TEXT)
- completion_date (DATETIME)
- completed_by (INT, FK to users)
- shipment_id (INT, FK)
```

## API Endpoints

### Production Wizard
- `GET /api/manufacturing/products` - Get products for dropdown
- `GET /api/manufacturing/products/:id/details` - Get product details with materials
- `POST /api/manufacturing/production-orders` - Create production order

### Production Tracking
- `GET /api/manufacturing/production-orders/:id/tracking` - Get full tracking data
- `PUT /api/manufacturing/stages/:id/start` - Start a stage (sets to in_progress)
- `PUT /api/manufacturing/stages/:id/update` - Update stage details
- `PUT /api/manufacturing/stages/:id/complete` - Complete a stage
- `POST /api/manufacturing/stages/:id/operations` - Add/update operations
- `POST /api/manufacturing/stages/:id/outsource` - Setup outsource details

### Material Tracking
- `GET /api/manufacturing/production-orders/:id/materials` - Get material usage
- `POST /api/manufacturing/production-orders/:id/materials/consume` - Record material consumption
- `POST /api/manufacturing/production-orders/:id/materials/return` - Return excess material

### Production Completion
- `POST /api/manufacturing/production-orders/:id/complete` - Complete production
- `GET /api/manufacturing/production-orders/:id/completion-overview` - Get completion summary
- `POST /api/manufacturing/production-orders/:id/send-to-shipment` - Create shipment

## Frontend Components

### 1. EnhancedProductionWizard.jsx
- Product selection dropdown
- Auto-populate fields
- Customization options
- Material preview

### 2. ProductionTrackingDashboard.jsx
- List of production orders
- Status overview
- Quick actions

### 3. StageTrackingPanel.jsx
- Stage details
- Operations list
- Start/End date pickers
- Status management
- Outsource configuration

### 4. MaterialTrackingPanel.jsx
- Material allocation view
- Barcode scanner integration
- Consumption tracking
- Return to inventory

### 5. ProductionCompletionDialog.jsx
- Completion checklist
- Material reconciliation
- Quality summary
- Send to shipment

### 6. ProductionSummaryAccordion.jsx
- Collapsed view after completion
- Key metrics
- Shipment status

## Implementation Steps

1. ✅ Create database migrations
2. ✅ Update models
3. ✅ Create API endpoints
4. ✅ Build frontend components
5. ✅ Integrate barcode scanning
6. ✅ Test complete workflow
7. ✅ Deploy and document

## Status Workflow

```
Pending → In Progress → Completed
         ↓
      On Hold (can resume to In Progress)
```

**Important**: When a stage starts, it MUST be set to "In Progress", not "Complete".