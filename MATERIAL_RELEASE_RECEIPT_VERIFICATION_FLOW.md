# 🏭 Material Release & Receipt Verification Workflow

## 📋 Overview

This document outlines the **complete workflow** from MRN request to production-ready materials, including:
1. **MRN Request Creation** (Manufacturing)
2. **Stock Release/Dispatch** (Inventory Manager)
3. **Material Receipt** (Manufacturing Department)
4. **Stock Verification** (Manufacturing Quality Check)
5. **Production Approval** (Ready for Production)

---

## 🔄 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      STEP 1: MRN REQUEST CREATION                        │
│                         (Manufacturing Department)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │  Manufacturing User  │
                        │  Creates MRN Request │
                        │  (CreateMRMPage)     │
                        └──────────────────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │  MRN Created         │
                        │  Request #: MRN-001  │
                        │  Status: PENDING     │
                        │  Materials Listed    │
                        └──────────────────────┘
                                    │
                                    ▼ 🔔 Notification
┌─────────────────────────────────────────────────────────────────────────┐
│                      STEP 2: INVENTORY REVIEW                            │
│                        (Inventory Department)                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │  Inventory Manager   │
                        │  Reviews MRN         │
                        │  Checks Stock        │
                        └──────────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        ▼                       ▼
            ┌────────────────┐      ┌────────────────────┐
            │ Stock Available│      │ Stock NOT Available│
            │ in Warehouse   │      │ Need Procurement   │
            └────────────────┘      └────────────────────┘
                        │                       │
                        │                       ▼
                        │           ┌────────────────────┐
                        │           │ Trigger Procurement│
                        │           │ (Out of Scope)     │
                        │           └────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   STEP 3: STOCK RELEASE/DISPATCH                         │
│                        (Inventory Manager)                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Inventory Manager Dashboard  │
                    │  • View Pending MRNs          │
                    │  • Select MRN-001             │
                    │  • Click "Release Stock"      │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Stock Release Form           │
                    │  ─────────────────────────    │
                    │  For each Material:           │
                    │  ✓ Verify Stock Availability  │
                    │  ✓ Select Inventory Items     │
                    │  ✓ Enter Release Quantity     │
                    │  ✓ Scan/Select Barcodes       │
                    │  ✓ Add Release Notes          │
                    │  ✓ Upload Photos (optional)   │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Generate Dispatch Details    │
                    │  ─────────────────────────    │
                    │  • Dispatch Number: DSP-001   │
                    │  • Dispatch Date & Time       │
                    │  • Released By: User Name     │
                    │  • Material List with Qty     │
                    │  • Barcode List               │
                    │  • Notes/Instructions         │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Inventory Action             │
                    │  ─────────────────────────    │
                    │  • Deduct from Stock          │
                    │  • Create Inventory Movement  │
                    │  • Reserve Items for Project  │
                    │  • Update MRN Status:         │
                    │    DISPATCHED_TO_MANUFACTURING│
                    └───────────────────────────────┘
                                    │
                                    ▼ 🔔 Notification
┌─────────────────────────────────────────────────────────────────────────┐
│                   STEP 4: MATERIAL RECEIPT                               │
│                      (Manufacturing Department)                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Manufacturing User           │
                    │  Receives Notification        │
                    │  "Materials dispatched for    │
                    │   MRN-001 - Ready to Receive" │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Navigate to MRN List         │
                    │  • Filter: DISPATCHED         │
                    │  • View MRN-001               │
                    │  • Click "Receive Materials"  │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Material Receipt Form        │
                    │  ─────────────────────────    │
                    │  Shows Dispatched Items:      │
                    │  For each Material:           │
                    │  • Material Name              │
                    │  • Dispatched Qty             │
                    │  • Barcode(s)                 │
                    │  ─────────────────────────    │
                    │  Actions:                     │
                    │  ✓ Scan/Verify Barcodes       │
                    │  ✓ Enter Received Quantity    │
                    │  ✓ Note any Discrepancies     │
                    │  ✓ Upload Photos (optional)   │
                    │  ✓ Add Receipt Notes          │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Create Material Receipt Note │
                    │  ─────────────────────────    │
                    │  • Receipt #: MRN-RCV-001     │
                    │  • Received Date & Time       │
                    │  • Received By: User Name     │
                    │  • Materials Received         │
                    │  • Discrepancies (if any)     │
                    │  • Update MRN Status:         │
                    │    RECEIVED_BY_MANUFACTURING  │
                    └───────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   STEP 5: STOCK VERIFICATION                             │
│                   (Manufacturing Quality Check)                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Manufacturing Supervisor     │
                    │  or Quality Inspector         │
                    │  • Navigate to MRN List       │
                    │  • Filter: RECEIVED           │
                    │  • View MRN-001               │
                    │  • Click "Verify Stock"       │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Stock Verification Form      │
                    │  ─────────────────────────    │
                    │  For each Material:           │
                    │  ✓ Physical Inspection        │
                    │  ✓ Quantity Verification      │
                    │  ✓ Quality Check              │
                    │  ✓ Specification Match        │
                    │  ✓ Damage/Defect Check        │
                    │  ✓ Verify Against BOM         │
                    │  ─────────────────────────    │
                    │  Verification Checklist:      │
                    │  □ Correct Material?          │
                    │  □ Correct Quantity?          │
                    │  □ Good Quality?              │
                    │  □ No Damage?                 │
                    │  □ Specs Match?               │
                    │  □ Barcodes Valid?            │
                    └───────────────────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        ▼                       ▼
            ┌──────────────────┐    ┌──────────────────┐
            │ ALL VERIFIED OK  │    │ ISSUES FOUND     │
            │                  │    │                  │
            └──────────────────┘    └──────────────────┘
                        │                       │
                        │                       ▼
                        │           ┌──────────────────────┐
                        │           │ Discrepancy Report   │
                        │           │ • Shortage           │
                        │           │ • Quality Issues     │
                        │           │ • Wrong Items        │
                        │           │ • Damage             │
                        │           │ Action:              │
                        │           │ • Return to Inventory│
                        │           │ • Request Replacement│
                        │           │ Status: VERIFICATION │
                        │           │         _FAILED      │
                        │           └──────────────────────┘
                        │                       │
                        │           🔔 Notify Inventory Manager
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   STEP 6: PRODUCTION APPROVAL                            │
│                      (Manufacturing Manager)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  All Materials Verified ✓     │
                    │  Manufacturing Manager        │
                    │  Reviews Verification Report  │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Final Approval Actions       │
                    │  ─────────────────────────    │
                    │  • Review Material List       │
                    │  • Check Verification Status  │
                    │  • Verify against BOM/Order   │
                    │  • Approve for Production     │
                    │  • Add Approval Notes         │
                    │  • Set Production Start Date  │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Materials Ready for Production│
                    │  ─────────────────────────    │
                    │  • Approval #: MRN-APP-001    │
                    │  • Approved By: Manager Name  │
                    │  • Approved Date & Time       │
                    │  • Production Start Date      │
                    │  • Update MRN Status:         │
                    │    APPROVED_FOR_PRODUCTION    │
                    │  • Create Material Allocation │
                    │  • Link to Production Order   │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  🎉 PRODUCTION CAN START       │
                    │  ─────────────────────────    │
                    │  • Materials Allocated        │
                    │  • Stock Reserved             │
                    │  • Ready for Floor            │
                    └───────────────────────────────┘
```

---

## 📊 Status Flow

| Step | Status | Department | Next Action |
|------|--------|------------|-------------|
| 1 | `pending` | Manufacturing | Wait for Inventory |
| 2 | `pending_inventory_review` | Inventory | Review & Check Stock |
| 3 | `stock_checked` | Inventory | Release Materials |
| 3 | `dispatched_to_manufacturing` | Inventory → Mfg | Transport Materials |
| 4 | `received_by_manufacturing` | Manufacturing | Verify Stock |
| 5 | `under_verification` | Manufacturing QC | Inspect Materials |
| 5a | `verification_failed` | Manufacturing | Report Issues |
| 5b | `verification_passed` | Manufacturing | Approve for Production |
| 6 | `approved_for_production` | Manufacturing | Start Production |
| 7 | `in_production` | Manufacturing | Consume Materials |
| 8 | `completed` | Manufacturing | Close MRN |

---

## 🗂️ Database Schema Requirements

### **1. New Table: `material_dispatches`**

Tracks material releases from Inventory to Manufacturing.

```sql
CREATE TABLE material_dispatches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dispatch_number VARCHAR(50) UNIQUE NOT NULL,  -- DSP-YYYYMMDD-XXXXX
  mrn_request_id INT NOT NULL,                   -- Link to MRN
  project_name VARCHAR(200),
  
  -- Dispatch Details
  dispatch_date DATETIME NOT NULL,
  dispatched_by INT NOT NULL,                    -- Inventory Manager
  dispatch_notes TEXT,
  
  -- Materials
  materials_dispatched JSON NOT NULL,            -- Array of materials with barcodes
  total_items INT DEFAULT 0,
  
  -- Inventory Movement
  inventory_movement_ids JSON,                   -- Track inventory deductions
  
  -- Status
  status ENUM('dispatched', 'in_transit', 'received', 'partially_received', 'cancelled') DEFAULT 'dispatched',
  
  -- Attachments
  photos JSON,                                   -- Dispatch photos
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (mrn_request_id) REFERENCES project_material_requests(id),
  FOREIGN KEY (dispatched_by) REFERENCES users(id)
);
```

### **2. New Table: `material_receipts`**

Tracks material receipt by Manufacturing department.

```sql
CREATE TABLE material_receipts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,    -- MRN-RCV-YYYYMMDD-XXXXX
  mrn_request_id INT NOT NULL,
  dispatch_id INT NOT NULL,
  project_name VARCHAR(200),
  
  -- Receipt Details
  receipt_date DATETIME NOT NULL,
  received_by INT NOT NULL,                      -- Manufacturing User
  receipt_notes TEXT,
  
  -- Materials
  materials_received JSON NOT NULL,              -- Array with received quantities
  total_items INT DEFAULT 0,
  
  -- Discrepancies
  has_discrepancies BOOLEAN DEFAULT FALSE,
  discrepancies JSON,                            -- Shortages, damages, wrong items
  
  -- Status
  status ENUM('received', 'discrepancy_reported', 'verified', 'approved') DEFAULT 'received',
  
  -- Attachments
  photos JSON,                                   -- Receipt photos
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (mrn_request_id) REFERENCES project_material_requests(id),
  FOREIGN KEY (dispatch_id) REFERENCES material_dispatches(id),
  FOREIGN KEY (received_by) REFERENCES users(id)
);
```

### **3. New Table: `material_verifications`**

Tracks quality verification by Manufacturing QC/Supervisor.

```sql
CREATE TABLE material_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  verification_number VARCHAR(50) UNIQUE NOT NULL, -- MRN-VRF-YYYYMMDD-XXXXX
  mrn_request_id INT NOT NULL,
  receipt_id INT NOT NULL,
  project_name VARCHAR(200),
  
  -- Verification Details
  verification_date DATETIME NOT NULL,
  verified_by INT NOT NULL,                      -- QC Inspector/Supervisor
  verification_notes TEXT,
  
  -- Verification Results
  materials_verification JSON NOT NULL,          -- Per material verification
  
  -- Checklist Results
  quantity_verified BOOLEAN DEFAULT FALSE,
  quality_verified BOOLEAN DEFAULT FALSE,
  specifications_verified BOOLEAN DEFAULT FALSE,
  damage_check_passed BOOLEAN DEFAULT FALSE,
  barcodes_verified BOOLEAN DEFAULT FALSE,
  
  -- Overall Result
  verification_result ENUM('passed', 'failed', 'partial') NOT NULL,
  issues_found JSON,                             -- Array of issues
  
  -- Actions Taken
  rejection_items JSON,                          -- Items rejected
  replacement_requested BOOLEAN DEFAULT FALSE,
  
  -- Approval
  approved_by INT,                               -- Manufacturing Manager
  approved_at DATETIME,
  approval_notes TEXT,
  
  -- Status
  status ENUM('pending_approval', 'approved', 'rejected', 'return_requested') DEFAULT 'pending_approval',
  
  -- Attachments
  photos JSON,                                   -- Verification photos
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (mrn_request_id) REFERENCES project_material_requests(id),
  FOREIGN KEY (receipt_id) REFERENCES material_receipts(id),
  FOREIGN KEY (verified_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

### **4. Update Existing Table: `project_material_requests`**

Add new status values:

```sql
ALTER TABLE project_material_requests 
MODIFY COLUMN status ENUM(
  'pending',
  'pending_inventory_review',
  'stock_checked',
  'dispatched_to_manufacturing',      -- NEW
  'received_by_manufacturing',         -- NEW
  'under_verification',                -- NEW
  'verification_failed',               -- NEW
  'verification_passed',               -- NEW
  'approved_for_production',           -- NEW
  'partially_issued',
  'issued',
  'in_production',                     -- NEW
  'completed',
  'cancelled'
);
```

Add new fields:

```sql
ALTER TABLE project_material_requests
ADD COLUMN dispatch_id INT,
ADD COLUMN receipt_id INT,
ADD COLUMN verification_id INT,
ADD COLUMN approved_for_production_by INT,
ADD COLUMN approved_for_production_at DATETIME,
ADD COLUMN production_start_date DATE,
ADD FOREIGN KEY (dispatch_id) REFERENCES material_dispatches(id),
ADD FOREIGN KEY (receipt_id) REFERENCES material_receipts(id),
ADD FOREIGN KEY (verification_id) REFERENCES material_verifications(id),
ADD FOREIGN KEY (approved_for_production_by) REFERENCES users(id);
```

---

## 🎯 Frontend Pages Required

### **Inventory Department:**

1. **Pending MRN List** (`/inventory/material-requests`)
   - View all MRNs awaiting stock release
   - Filter by project, priority
   - "Release Stock" action button

2. **Stock Release Form** (`/inventory/material-requests/:id/release`)
   - Material selection with barcodes
   - Quantity input
   - Photo upload
   - Generate dispatch note

3. **Dispatch History** (`/inventory/dispatches`)
   - View all dispatches
   - Track delivery status
   - Resend/Cancel options

### **Manufacturing Department:**

4. **Material Receipt Page** (`/manufacturing/material-requests/:id/receive`)
   - Scan barcodes
   - Enter received quantities
   - Report discrepancies
   - Photo upload
   - Generate receipt note

5. **Stock Verification Page** (`/manufacturing/material-requests/:id/verify`)
   - Verification checklist
   - Quality inspection form
   - Issue reporting
   - Approve/Reject actions

6. **Production Approval Page** (`/manufacturing/material-requests/:id/approve`)
   - Final review
   - Production start date
   - Material allocation
   - Approve for production

7. **Enhanced MRN List** (`/manufacturing/material-requests`)
   - Add filters for new statuses
   - Show dispatch/receipt/verification info
   - Action buttons per status

---

## 🔔 Notification Events

| Event | Recipients | Message |
|-------|-----------|---------|
| MRN Created | Inventory Manager | "New material request MRN-001 for Project XYZ" |
| Stock Released/Dispatched | Manufacturing User (Creator) | "Materials dispatched for MRN-001 - Ready to receive" |
| Materials Received | Inventory Manager | "Materials received for MRN-001 by Manufacturing" |
| Verification Failed | Inventory Manager | "Verification failed for MRN-001 - Issues found" |
| Verification Passed | Manufacturing Manager | "Stock verified for MRN-001 - Pending approval" |
| Approved for Production | Production Team | "Materials approved - Production can start for MRN-001" |

---

## 📋 Material Data Structure

### **materials_dispatched** (in `material_dispatches`)

```json
[
  {
    "material_id": 101,
    "material_name": "Cotton Fabric - White",
    "material_code": "FAB-CTN-WHT-001",
    "requested_qty": 500,
    "dispatched_qty": 500,
    "unit": "meters",
    "inventory_items": [
      {
        "inventory_id": 1501,
        "barcode": "INV-20250101-0001",
        "quantity": 300,
        "location": "Warehouse A - Rack 5"
      },
      {
        "inventory_id": 1502,
        "barcode": "INV-20250102-0015",
        "quantity": 200,
        "location": "Warehouse A - Rack 6"
      }
    ],
    "notes": "High quality, urgent delivery"
  }
]
```

### **materials_received** (in `material_receipts`)

```json
[
  {
    "material_id": 101,
    "material_name": "Cotton Fabric - White",
    "dispatched_qty": 500,
    "received_qty": 490,
    "unit": "meters",
    "barcodes_verified": ["INV-20250101-0001", "INV-20250102-0015"],
    "discrepancy": {
      "type": "shortage",
      "shortage_qty": 10,
      "reason": "Damaged during transport"
    },
    "notes": "10 meters found damaged"
  }
]
```

### **materials_verification** (in `material_verifications`)

```json
[
  {
    "material_id": 101,
    "material_name": "Cotton Fabric - White",
    "received_qty": 490,
    "verified_qty": 490,
    "unit": "meters",
    "verification_checks": {
      "quantity_ok": true,
      "quality_ok": true,
      "specifications_match": true,
      "no_damage": true,
      "barcodes_valid": true
    },
    "result": "passed",
    "inspector_notes": "All checks passed"
  }
]
```

---

## 🚀 Development Phases

### **Phase 1: Backend API (Stock Release)**
- Create `material_dispatches` table migration
- Create MaterialDispatch model
- Create API endpoints:
  - `POST /api/inventory/mrn/:id/release-stock`
  - `GET /api/inventory/dispatches`
  - `GET /api/inventory/dispatches/:id`
- Update MRN status workflow

### **Phase 2: Backend API (Material Receipt)**
- Create `material_receipts` table migration
- Create MaterialReceipt model
- Create API endpoints:
  - `POST /api/manufacturing/mrn/:id/receive-materials`
  - `GET /api/manufacturing/receipts`
  - `GET /api/manufacturing/receipts/:id`
  - `POST /api/manufacturing/receipts/:id/report-discrepancy`

### **Phase 3: Backend API (Verification & Approval)**
- Create `material_verifications` table migration
- Create MaterialVerification model
- Create API endpoints:
  - `POST /api/manufacturing/mrn/:id/verify-stock`
  - `GET /api/manufacturing/verifications/:id`
  - `POST /api/manufacturing/mrn/:id/approve-for-production`
- Create Material Allocation on approval

### **Phase 4: Frontend (Inventory)**
- Stock Release Form page
- Dispatch tracking page
- Update Inventory Dashboard with dispatch stats

### **Phase 5: Frontend (Manufacturing)**
- Material Receipt page
- Stock Verification page
- Production Approval page
- Update MRN List with new statuses

### **Phase 6: Notifications & Testing**
- Implement all notification triggers
- End-to-end testing
- Role-based permission testing

---

## ✅ Success Criteria

- ✅ Inventory can release stock against MRN with barcode tracking
- ✅ Manufacturing can receive materials and report discrepancies
- ✅ Manufacturing can verify stock quality before production
- ✅ Manufacturing manager can approve materials for production
- ✅ Complete audit trail from request → dispatch → receipt → verification → approval
- ✅ Notifications at each stage
- ✅ Photo attachments supported at all stages
- ✅ Discrepancy management with return workflow
- ✅ Integration with existing Material Allocation system

---

## 🎯 Next Steps

**Please review this workflow and confirm:**

1. ✅ Is the flow correct for your business process?
2. ✅ Any additional fields needed in forms?
3. ✅ Any missing steps or checks?
4. ✅ Role permissions correct?
5. ✅ Should we proceed with Phase 1 development?

Once confirmed, I'll start with **Phase 1: Backend API for Stock Release**.

---

*Document created: $(Get-Date)*
*Status: Awaiting Approval*