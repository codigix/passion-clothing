# Production Wizard Enhancement - Complete Implementation Guide

## Overview
Enhanced Production Wizard module with automated order selection, data fetching, stage customization with outsourcing support, and real-time production tracking.

## ✨ New Features

### 1. **Approved Incoming Order Selection**
- Users select from **approved Material Receipts** (MRN flow)
- Only shows orders that have:
  - ✅ Passed quality verification
  - ✅ Received production approval
  - ✅ Not yet started production

### 2. **Automatic Data Fetching**
When an order is selected, the system automatically fetches:
- **Sales Order Details**: Customer info, delivery dates, special instructions
- **Purchase Order Details**: Vendor info, items, project name
- **Material Specifications**: All received materials with quantities
- **Project Data**: Project name, priority, timeline requirements

### 3. **Enhanced Stage Customization**
Production stages can be fully customized:
- Default stages: Cutting → Stitching → Printing/Embroidery → Finishing → QC → Packaging
- Add/remove/reorder stages as needed
- **Outsourcing Toggle** for Printing and Embroidery stages:
  - ✅ In-house processing
  - ✅ Outsource to vendor with work order creation

### 4. **Outsourcing Workflow**
For outsourced stages (Printing/Embroidery):
- **Vendor Selection**: Choose from approved vendors
- **Work Order Generation**: Automatic work order number assignment
- **Design Files**: Upload design files (images, specs, etc.)
- **Timeline Management**: Set expected completion dates
- **Cost Tracking**: Record outsourcing costs
- **Status Tracking**: outsourced → received → completed

### 5. **Real-time Production Tracking**
- Automatic task assignment to departments/vendors
- Stage status updates (pending → in_progress → completed)
- Progress percentage calculation
- Completion report generation
- Automatic inventory notifications

---

## 🗄️ Database Changes

### Modified Table: `stage_operations`
New columns added for outsourcing support:

| Column | Type | Description |
|--------|------|-------------|
| `is_outsourced` | BOOLEAN | Whether operation is outsourced |
| `vendor_id` | INTEGER | Foreign key to vendors table |
| `work_order_number` | VARCHAR(50) | Work order number |
| `expected_completion_date` | DATE | Expected completion from vendor |
| `actual_completion_date` | DATE | Actual completion date |
| `design_files` | JSON | Array of file URLs and metadata |
| `vendor_remarks` | TEXT | Remarks for/from vendor |
| `outsourced_at` | DATE | When sent to vendor |
| `received_at` | DATE | When received from vendor |
| `outsourcing_cost` | DECIMAL(10,2) | Cost for outsourced work |

**Status Enum Updated:**
- Before: `'pending', 'in_progress', 'completed', 'skipped'`
- After: `'pending', 'in_progress', 'completed', 'skipped', 'outsourced', 'received'`

---

## 🔌 Backend API Enhancements

### New Endpoints

#### 1. Get Approved Orders for Production
```
GET /api/production-approval/list/approved
```
**Returns:** List of approved material receipts with full order details
- Includes Sales Order, Purchase Order, Materials, Customer, Vendor info
- Only returns orders where `approval_status = 'approved'` AND `production_started = false`

**Response:**
```json
{
  "approvals": [
    {
      "id": 1,
      "approval_number": "PRD-APV-20250128-00001",
      "project_name": "Summer Collection 2025",
      "approved_at": "2025-01-28T10:00:00Z",
      "mrnRequest": {
        "id": 5,
        "request_number": "PMR-20250128-00001",
        "project_name": "Summer Collection 2025",
        "salesOrder": {
          "id": 10,
          "order_number": "SO-2025-00010",
          "customer": { "name": "ABC Fashion Store" },
          "items": [...]
        },
        "purchaseOrder": {
          "id": 8,
          "po_number": "PO-2025-00008",
          "vendor": { "name": "Fabric Suppliers Ltd" },
          "items": [...]
        }
      },
      "verification": {
        "receipt": {
          "receipt_number": "MRN-RCV-20250128-00001",
          "received_materials": [...]
        }
      }
    }
  ]
}
```

#### 2. Get Full Approval Details
```
GET /api/production-approval/:id/details
```
**Returns:** Complete approval details with all related data for auto-filling wizard

**Response:**
```json
{
  "approval": {
    "id": 1,
    "project_name": "Summer Collection 2025",
    "material_allocations": [...],
    "mrnRequest": {
      "salesOrder": {
        "items": [
          {
            "product_id": 15,
            "product_name": "Cotton T-Shirt",
            "quantity": 500,
            "specifications": "..."
          }
        ]
      },
      "purchaseOrder": {
        "items": [...],
        "delivery_date": "2025-02-15"
      }
    },
    "verification": {
      "receipt": {
        "received_materials": [
          {
            "material_name": "Cotton Fabric",
            "quantity_received": 250,
            "uom": "meters"
          }
        ]
      }
    }
  }
}
```

#### 3. Mark Production Started
```
PUT /api/production-approval/:id/start-production
```
**Body:**
```json
{
  "production_order_id": 123
}
```
**Effect:**
- Sets `production_started = true`
- Links production order to approval
- Updates MRN request status
- Sends notifications

---

## 🎨 Frontend Implementation

### Step 0: Order Selection (NEW)

**Component:** `OrderSelectionStep`

**Features:**
- Dropdown/searchable list of approved orders
- Display: Project Name • Order Number • Approval Date
- Preview panel showing order summary
- "Auto-fill Details" button

**Auto-fill Logic:**
```javascript
const handleOrderSelect = async (approvalId) => {
  const { data } = await api.get(`/production-approval/${approvalId}/details`);
  
  // Auto-populate form fields
  methods.setValue('orderDetails.productId', data.approval.mrnRequest.salesOrder.items[0].product_id);
  methods.setValue('orderDetails.quantity', data.approval.mrnRequest.salesOrder.items[0].quantity);
  methods.setValue('orderDetails.salesOrderId', data.approval.mrnRequest.sales_order_id);
  
  // Auto-populate materials
  const materials = data.approval.verification.receipt.received_materials.map(mat => ({
    materialId: mat.material_code,
    description: mat.material_name,
    requiredQuantity: mat.quantity_received,
    unit: mat.uom,
    status: 'available'
  }));
  methods.setValue('materials.items', materials);
  
  // Set project info
  setProjectName(data.approval.project_name);
  setApprovalId(approvalId);
};
```

### Enhanced Customization Step

**Component:** `CustomizationStep`

**New Features:**
- Each stage has an "Outsourcing" toggle
- When outsourcing enabled for Printing/Embroidery:
  - Vendor dropdown appears
  - Work order number field (auto-generated)
  - Expected completion date picker
  - Design file upload button
  - Vendor remarks text area

**Form Schema:**
```javascript
const stageSchema = yup.object({
  stageName: yup.string().required(),
  plannedDurationHours: yup.number().nullable(),
  isOutsourced: yup.boolean().default(false),
  vendorId: yup.string().when('isOutsourced', {
    is: true,
    then: schema => schema.required('Vendor is required for outsourced operations')
  }),
  expectedCompletionDate: yup.date().nullable(),
  designFiles: yup.array().of(yup.object({
    filename: yup.string(),
    url: yup.string(),
    size: yup.number()
  })),
  vendorRemarks: yup.string().nullable()
});
```

### Enhanced Form Submission

**Modified Payload:**
```javascript
const buildPayload = (values, approvalId) => {
  return {
    // Link to approval
    approval_id: approvalId,
    
    // Order details
    product_id: values.orderDetails.productId,
    quantity: values.orderDetails.quantity,
    sales_order_id: values.orderDetails.salesOrderId,
    
    // Materials
    materials: values.materials.items,
    
    // Custom stages with outsourcing
    custom_stages: values.customization.stages.map((stage, index) => ({
      stage_name: stage.stageName,
      stage_order: index + 1,
      planned_duration_hours: stage.plannedDurationHours,
      
      // Outsourcing details
      operations: stage.isOutsourced ? [{
        operation_name: stage.stageName,
        is_outsourced: true,
        vendor_id: stage.vendorId,
        expected_completion_date: stage.expectedCompletionDate,
        design_files: stage.designFiles,
        vendor_remarks: stage.vendorRemarks,
        status: 'outsourced'
      }] : []
    })),
    
    // Other details...
  };
};
```

---

## 📋 Production Workflow

### Complete Flow:

```
1. Material Receipt Verified & Approved
   ↓
2. Approval appears in Production Wizard
   ↓
3. User selects approval → Auto-fills all data
   ↓
4. User customizes stages
   - Marks Printing as "Outsourced"
   - Selects vendor
   - Uploads design files
   - Sets completion date
   ↓
5. User submits Production Order
   ↓
6. System creates:
   - Production Order record
   - Production Stages
   - Stage Operations (with vendor assignment)
   - Material allocations
   - Quality checkpoints
   ↓
7. System updates:
   - Approval: production_started = true
   - MRN status: materials_ready → in_production
   ↓
8. Notifications sent to:
   - Manufacturing team (in-house stages)
   - Selected vendors (outsourced stages)
   - Inventory department
   ↓
9. Production tracking begins:
   - In-house stages: Team updates status
   - Outsourced stages: Vendor updates status
   ↓
10. Upon stage completion:
    - Update stage status
    - Calculate progress %
    - Notify next stage
    ↓
11. Upon full completion:
    - Generate completion report
    - Notify inventory for dispatch
    - Update stock levels
```

---

## 🚀 Installation & Setup

### 1. Run Database Migration
```bash
node run-outsourcing-migration.js
```

### 2. Restart Backend
```bash
cd server
npm start
```

### 3. Verify Migration
```sql
-- Check new columns exist
DESCRIBE stage_operations;

-- Check status enum values
SHOW COLUMNS FROM stage_operations WHERE Field = 'status';
```

---

## 🧪 Testing Guide

### Test Case 1: Select Approved Order
1. Navigate to Production Wizard
2. See list of approved orders
3. Select an order
4. Verify all fields auto-populate correctly

### Test Case 2: Outsource Printing Stage
1. Go to Customization step
2. Enable custom stages
3. Add "Printing" stage
4. Toggle "Outsource" → ON
5. Select vendor from dropdown
6. Upload design file
7. Set expected completion date
8. Submit order
9. Verify work order created with vendor assignment

### Test Case 3: Track Outsourced Stage
1. Go to Production Tracking page
2. Find production order with outsourced stage
3. Verify status shows "outsourced"
4. Update status to "received"
5. Verify notification sent

### Test Case 4: Complete Production
1. Complete all stages (in-house + outsourced)
2. Verify completion report generated
3. Verify inventory notification sent
4. Check approval marked as production_started = true

---

## 📊 Database Schema Reference

```sql
-- Enhanced stage_operations table
CREATE TABLE stage_operations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  production_stage_id INT NOT NULL,
  operation_name VARCHAR(100) NOT NULL,
  operation_order INT DEFAULT 0,
  status ENUM('pending', 'in_progress', 'completed', 'skipped', 'outsourced', 'received'),
  
  -- Existing fields
  start_time DATETIME,
  end_time DATETIME,
  assigned_to INT,
  machine_id VARCHAR(50),
  quantity_processed INT DEFAULT 0,
  notes TEXT,
  
  -- NEW: Outsourcing fields
  is_outsourced BOOLEAN DEFAULT FALSE,
  vendor_id INT,
  work_order_number VARCHAR(50),
  expected_completion_date DATE,
  actual_completion_date DATE,
  design_files JSON,
  vendor_remarks TEXT,
  outsourced_at DATETIME,
  received_at DATETIME,
  outsourcing_cost DECIMAL(10,2),
  
  FOREIGN KEY (production_stage_id) REFERENCES production_stages(id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  
  INDEX idx_is_outsourced (is_outsourced),
  INDEX idx_vendor_id (vendor_id),
  INDEX idx_work_order_number (work_order_number)
);
```

---

## 🔐 Permissions Required

| Action | Department | Permission |
|--------|-----------|------------|
| View approved orders | Manufacturing | `manufacturing.read.production_approval` |
| Create production order | Manufacturing | `manufacturing.create.production_order` |
| Customize stages | Manufacturing | `manufacturing.update.production_stage` |
| Assign vendors | Manufacturing | `manufacturing.update.stage_operation` |
| Start production | Manufacturing | `manufacturing.update.production_approval` |

---

## 📝 API Quick Reference

```javascript
// Get approved orders
GET /api/production-approval/list/approved

// Get full order details
GET /api/production-approval/:id/details

// Create production order
POST /api/manufacturing/orders
Body: { approval_id, ...orderData }

// Start production
PUT /api/production-approval/:id/start-production
Body: { production_order_id }

// Update operation status
PATCH /api/manufacturing/operations/:id
Body: { status, vendor_id, expected_completion_date }
```

---

## 🎯 Next Steps

1. ✅ **Phase 1 Complete**: Backend API & Database
2. 🔄 **Phase 2 In Progress**: Frontend Production Wizard
3. ⏳ **Phase 3 Pending**: Production Tracking Enhancement
4. ⏳ **Phase 4 Pending**: Completion Reports & Notifications

---

## 📞 Support

For issues or questions:
- Check server logs: `server/server.log`
- Review migration: `server/migrations/20250128_add_outsourcing_to_stage_operations.js`
- API documentation: `API_ENDPOINTS_REFERENCE.md`

---

**Last Updated:** January 28, 2025  
**Version:** 1.0  
**Status:** Phase 1 Complete ✅