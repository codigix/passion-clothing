# 🏭 MRN to Production - Complete Material Flow

## 📋 **Your Requirement:**
> "After received MRN request, Inventory Manager releases stock against particular project. Once stock received to Manufacturing Department, they check all stock should be there as expected. Once approved, get ready for production."

---

## 🔄 **Complete 6-Stage Flow**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 1: MRN REQUEST                                                       │
│  (Manufacturing Department)                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Manufacturing creates Material Request Note (MRN)                        │
│  • Select Production Request/Project                                        │
│  • List required materials with quantities                                 │
│  • Set priority & required-by date                                         │
│  • Status: pending → pending_inventory_review                              │
│  • Notification sent to Inventory Manager                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 2: INVENTORY REVIEW                                                  │
│  (Inventory Manager)                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Inventory Manager reviews MRN request                                   │
│  • System checks stock availability for each material                      │
│  • Shows: Required Qty vs Available Qty vs Shortfall                      │
│  • Decision:                                                               │
│    ✅ Stock Available → Proceed to Release                                │
│    ⚠️ Partial Stock → Issue available, forward rest to Procurement        │
│    ❌ No Stock → Forward to Procurement                                   │
│  • Status: pending_inventory_review → stock_checked                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 3: STOCK RELEASE (DISPATCH)                                         │
│  (Inventory Manager)                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Create Material Dispatch Note                                           │
│  • Dispatch Number: DSP-YYYYMMDD-XXXXX                                     │
│  • Select materials by barcode/SKU                                         │
│  • Scan barcodes for each item being dispatched                           │
│  • Enter actual dispatched quantities                                      │
│  • Upload photos (optional - packing evidence)                            │
│  • Add dispatch notes                                                      │
│  • System Actions:                                                         │
│    - Deduct from inventory stock                                          │
│    - Create inventory movement record                                     │
│    - Store dispatch record in DB                                          │
│    - Generate dispatch slip (PDF)                                         │
│    - Send notification to Manufacturing                                   │
│  • Status: stock_checked → dispatched_to_manufacturing                     │
│  • MRN stored with dispatch details                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 4: MATERIAL RECEIPT                                                  │
│  (Manufacturing Department - Receiving Staff)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Manufacturing receives materials from Inventory                         │
│  • Create Material Receipt Note                                           │
│  • Receipt Number: MRN-RCV-YYYYMMDD-XXXXX                                 │
│  • Scan/verify each barcode                                               │
│  • Count actual received quantities                                       │
│  • Compare: Dispatched Qty vs Received Qty                                │
│  • Report discrepancies:                                                   │
│    - Shortage (less quantity)                                             │
│    - Damage (quality issue)                                               │
│    - Wrong item (incorrect material)                                      │
│  • Upload photos (evidence of receipt/issues)                             │
│  • Add receipt notes                                                       │
│  • System Actions:                                                         │
│    - Store receipt record in DB                                           │
│    - Link to dispatch record                                              │
│    - Generate receipt note (PDF)                                          │
│    - If discrepancy: Notify Inventory Manager                            │
│    - If OK: Proceed to verification                                      │
│  • Status: dispatched_to_manufacturing → received_by_manufacturing         │
│  • Receipt stored in Inventory records                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 5: STOCK VERIFICATION                                                │
│  (Manufacturing QC / Supervisor)                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Manufacturing QC checks "all stock should be there as expected"         │
│  • Verification Number: MRN-VRF-YYYYMMDD-XXXXX                             │
│  • For each material, verify:                                              │
│    □ Correct Quantity? (matches requirement)                               │
│    □ Good Quality? (no damage, proper condition)                           │
│    □ Specifications Match? (correct material/specs)                        │
│    □ Barcodes Valid? (scannable, readable)                                 │
│    □ Documentation OK? (dispatch slip, labels)                             │
│  • Upload photos (inspection evidence)                                     │
│  • Result for each item: ✅ Pass or ❌ Fail                                │
│  • Overall Result:                                                         │
│    ✅ All Pass → verification_passed                                       │
│    ❌ Any Fail → verification_failed                                       │
│  • If Failed:                                                              │
│    - Document issues                                                       │
│    - Notify Inventory Manager                                             │
│    - Request replacement/correction                                       │
│    - Status: received_by_manufacturing → verification_failed               │
│  • If Passed:                                                              │
│    - All materials verified OK                                            │
│    - Ready for production approval                                        │
│    - Status: received_by_manufacturing → under_verification → verified     │
│  • Verification stored in records                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  STAGE 6: PRODUCTION APPROVAL                                               │
│  (Manufacturing Manager)                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Manufacturing Manager reviews verification report                       │
│  • Confirms: "All stock is there as expected" ✅                           │
│  • Final approval for production                                          │
│  • Actions:                                                                │
│    - Set production start date                                            │
│    - Allocate materials to production order                               │
│    - Create material allocations in system                                │
│    - Link MRN → Production Order                                          │
│    - Add final approval notes                                             │
│  • Status: verified → approved_for_production → ready_for_production       │
│  • Notification sent to Production Team                                    │
│  • System marks: "GET READY FOR PRODUCTION" 🚀                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
                        🎯 PRODUCTION CAN START
```

---

## 📊 **Status Flow (Complete)**

```
pending
   ↓
pending_inventory_review ← MRN created by Manufacturing
   ↓
stock_checking ← Inventory checks availability
   ↓
   ├─→ stock_available (All materials available)
   ├─→ partial_available (Some materials available)
   └─→ stock_unavailable (No materials, forward to Procurement)
   ↓
stock_checked ← Inventory approves release
   ↓
dispatched_to_manufacturing ← Inventory releases stock (Dispatch created) ⭐
   ↓
received_by_manufacturing ← Manufacturing receives (Receipt created) ⭐
   ↓
under_verification ← Manufacturing QC verifying
   ↓
   ├─→ verification_failed ← Issues found (return/replacement)
   │      ↓
   │   (back to Inventory for correction)
   │
   └─→ verification_passed ← All checks OK ⭐
          ↓
       approved_for_production ← Manager final approval ⭐
          ↓
       ready_for_production ← GET READY FOR PRODUCTION 🚀
          ↓
       in_production ← Production started
          ↓
       completed ← MRN fulfilled
```

---

## 🗄️ **Database Tables Needed**

### ✅ **Already Exists:**
1. **project_material_requests** - Main MRN table (already has all statuses)

### ⭐ **NEW Tables to Create:**

#### 2. **material_dispatches** (Inventory → Manufacturing)
```sql
CREATE TABLE material_dispatches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dispatch_number VARCHAR(50) UNIQUE NOT NULL, -- DSP-YYYYMMDD-XXXXX
  mrn_request_id INT NOT NULL,
  project_name VARCHAR(200),
  dispatched_by INT NOT NULL, -- Inventory Manager user_id
  dispatched_at DATETIME NOT NULL,
  materials_dispatched JSON NOT NULL, -- [{material_name, dispatched_qty, unit, barcodes: []}]
  dispatch_notes TEXT,
  dispatch_photos JSON, -- [{filename, url}]
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (mrn_request_id) REFERENCES project_material_requests(id),
  FOREIGN KEY (dispatched_by) REFERENCES users(id)
);
```

#### 3. **material_receipts** (Manufacturing Receiving)
```sql
CREATE TABLE material_receipts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  receipt_number VARCHAR(50) UNIQUE NOT NULL, -- MRN-RCV-YYYYMMDD-XXXXX
  mrn_request_id INT NOT NULL,
  dispatch_id INT NOT NULL,
  project_name VARCHAR(200),
  received_by INT NOT NULL, -- Manufacturing user_id
  received_at DATETIME NOT NULL,
  materials_received JSON NOT NULL, -- [{material_name, dispatched_qty, received_qty, discrepancy_type, discrepancy_qty, notes}]
  has_discrepancy BOOLEAN DEFAULT FALSE,
  discrepancy_details JSON, -- [{material_name, issue_type, shortage_qty, reason}]
  receipt_notes TEXT,
  receipt_photos JSON,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (mrn_request_id) REFERENCES project_material_requests(id),
  FOREIGN KEY (dispatch_id) REFERENCES material_dispatches(id),
  FOREIGN KEY (received_by) REFERENCES users(id)
);
```

#### 4. **material_verifications** (Manufacturing QC)
```sql
CREATE TABLE material_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  verification_number VARCHAR(50) UNIQUE NOT NULL, -- MRN-VRF-YYYYMMDD-XXXXX
  mrn_request_id INT NOT NULL,
  receipt_id INT NOT NULL,
  project_name VARCHAR(200),
  verified_by INT NOT NULL, -- QC/Supervisor user_id
  verified_at DATETIME NOT NULL,
  materials_verification JSON NOT NULL, -- [{material_name, quantity_ok, quality_ok, specs_match, no_damage, barcodes_valid, result: pass/fail, notes}]
  verification_result ENUM('passed', 'failed', 'partial') NOT NULL,
  verification_notes TEXT,
  verification_photos JSON,
  issues_found JSON, -- [{material_name, issue_description, severity}]
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (mrn_request_id) REFERENCES project_material_requests(id),
  FOREIGN KEY (receipt_id) REFERENCES material_receipts(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);
```

#### 5. **production_approvals** (Final Approval)
```sql
CREATE TABLE production_approvals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  approval_number VARCHAR(50) UNIQUE NOT NULL, -- PRD-APV-YYYYMMDD-XXXXX
  mrn_request_id INT NOT NULL,
  verification_id INT NOT NULL,
  production_order_id INT, -- Optional - if production order already exists
  project_name VARCHAR(200),
  approved_by INT NOT NULL, -- Manufacturing Manager user_id
  approved_at DATETIME NOT NULL,
  production_start_date DATE,
  materials_allocated JSON, -- Material allocation details
  approval_status ENUM('approved', 'rejected', 'conditional') NOT NULL,
  approval_notes TEXT,
  rejection_reason TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (mrn_request_id) REFERENCES project_material_requests(id),
  FOREIGN KEY (verification_id) REFERENCES material_verifications(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

---

## 🎨 **Frontend Pages Needed**

### ✅ **Already Exists:**
1. ✅ `/manufacturing/material-requests/create` - CreateMRMPage (Manufacturing creates MRN)
2. ✅ `/manufacturing/material-requests` - MRMListPage (Manufacturing views MRNs)
3. ✅ `/inventory/mrn/:id` - MaterialRequestReviewPage (Inventory reviews MRN)

### ⭐ **NEW Pages to Create:**

#### **Inventory Pages (2 new):**
4. ⭐ `/inventory/mrn/:id/dispatch` - **StockDispatchPage**
   - Release stock form
   - Barcode scanning
   - Create dispatch note
   - Upload photos

5. ⭐ `/inventory/dispatches` - **DispatchHistoryPage**
   - View all dispatches
   - Track dispatch status
   - Reprint dispatch notes

#### **Manufacturing Pages (4 new):**
6. ⭐ `/manufacturing/material-requests/:id/receive` - **MaterialReceiptPage**
   - Receive materials
   - Verify quantities
   - Report discrepancies
   - Upload photos

7. ⭐ `/manufacturing/material-requests/:id/verify` - **StockVerificationPage**
   - QC verification checklist
   - Per-material inspection
   - Photo documentation
   - Pass/Fail results

8. ⭐ `/manufacturing/material-requests/:id/approve` - **ProductionApprovalPage**
   - Review verification report
   - Final approval
   - Set production start date
   - Allocate materials

9. ⭐ `/manufacturing/receipts` - **MaterialReceiptsHistoryPage**
   - View all receipts
   - Track receipt status
   - Reprint receipts

---

## 🔔 **Notifications (Complete)**

| # | Event | Trigger | Who Gets Notified | Message |
|---|-------|---------|-------------------|---------|
| 1 | MRN Created | Manufacturing creates MRN | Inventory Manager | "New material request for [Project]" |
| 2 | Stock Checked | Inventory reviews stock | Manufacturing (Creator) | "Stock availability: [Available/Partial/None]" |
| 3 | Stock Dispatched | Inventory releases stock | Manufacturing (Creator + Receiving) | "Materials dispatched: DSP-XXX" |
| 4 | Materials Received | Manufacturing receives | Inventory Manager | "Receipt confirmed: MRN-RCV-XXX" |
| 5 | Discrepancy Found | Receipt has issues | Inventory Manager | "Discrepancy reported: [details]" |
| 6 | Verification Failed | QC finds issues | Inventory Manager | "Verification failed: [issues]" |
| 7 | Verification Passed | QC approves | Manufacturing Manager | "Materials verified, pending approval" |
| 8 | Production Approved | Manager approves | Production Team | "Ready for production: [Project]" |

---

## 🎯 **Key Features - "MRN & Receipt Stored in Inventory"**

### ✅ **What Gets Stored:**

1. **MRN Request** (project_material_requests table)
   - Original request from Manufacturing
   - Materials requested with quantities
   - Status tracking throughout lifecycle

2. **Dispatch Record** (material_dispatches table) ⭐
   - What was dispatched from inventory
   - Barcodes, quantities, photos
   - Dispatch slip PDF
   - Inventory deduction record

3. **Receipt Record** (material_receipts table) ⭐
   - What Manufacturing actually received
   - Discrepancies (if any)
   - Receipt photos
   - Receipt note PDF

4. **Verification Record** (material_verifications table) ⭐
   - QC inspection results
   - Per-material verification
   - Issues found (if any)
   - Verification photos

5. **Approval Record** (production_approvals table) ⭐
   - Final approval for production
   - Production start date
   - Material allocations

6. **Inventory Movement** (inventory_movements table - already exists)
   - Automatic entry when stock dispatched
   - Tracks inventory deduction
   - Links to dispatch record

### ✅ **Storage & Retrieval:**
- All records stored in **MySQL database**
- Linked via foreign keys (MRN → Dispatch → Receipt → Verification → Approval)
- Full audit trail maintained
- Photos stored in file system, paths in DB
- PDFs generated and stored for each stage
- Can be retrieved anytime via MRN request ID
- Inventory Manager can view full history

---

## 🧪 **Test Scenario - Full Flow**

### **Happy Path:**
1. ✅ Manufacturing creates MRN for Project "ABC-2025"
   - Requests: Cotton Fabric (100m), Thread (10 spools)
   - Status: `pending_inventory_review`

2. ✅ Inventory Manager reviews MRN
   - Stock check: Cotton Fabric (120m available), Thread (15 spools available)
   - Status: `stock_available` → `stock_checked`

3. ✅ Inventory Manager dispatches stock
   - Creates DSP-20250115-0001
   - Scans barcodes: INV-001, INV-002, INV-003
   - Uploads packing photo
   - Stock deducted from inventory
   - Status: `dispatched_to_manufacturing`

4. ✅ Manufacturing receives materials
   - Creates MRN-RCV-20250115-0001
   - Counts: Cotton Fabric (100m ✅), Thread (10 spools ✅)
   - No discrepancies
   - Uploads receipt photo
   - Status: `received_by_manufacturing`

5. ✅ Manufacturing QC verifies
   - Creates MRN-VRF-20250115-0001
   - Checks: Quantity ✅, Quality ✅, Specs ✅, No Damage ✅
   - Result: All Pass ✅
   - Uploads inspection photos
   - Status: `verification_passed`

6. ✅ Manufacturing Manager approves
   - Creates PRD-APV-20250115-0001
   - Sets production start: 2025-01-16
   - Allocates materials to Production Order
   - Status: `approved_for_production` → `ready_for_production`

7. 🚀 **Production Team can start!**

---

## 🚀 **Development Phases**

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1** | 1 day | Backend: material_dispatches table + API |
| **Phase 2** | 1 day | Backend: material_receipts table + API |
| **Phase 3** | 1 day | Backend: material_verifications table + API |
| **Phase 4** | 1 day | Backend: production_approvals table + API |
| **Phase 5** | 2 days | Frontend: Inventory pages (Dispatch + History) |
| **Phase 6** | 3 days | Frontend: Manufacturing pages (Receive + Verify + Approve) |
| **Phase 7** | 1 day | Notifications + Testing |
| **Total** | ~10 days | **Complete System** |

---

## 📝 **API Endpoints Summary**

### **Dispatch APIs:**
- `POST /api/material-dispatch/create` - Create dispatch from MRN
- `GET /api/material-dispatch/:mrnId` - Get dispatch details
- `GET /api/material-dispatch/history` - All dispatches

### **Receipt APIs:**
- `POST /api/material-receipt/create` - Create receipt from dispatch
- `GET /api/material-receipt/:dispatchId` - Get receipt details
- `PUT /api/material-receipt/:id/discrepancy` - Report discrepancy

### **Verification APIs:**
- `POST /api/material-verification/create` - Create verification
- `GET /api/material-verification/:receiptId` - Get verification
- `PUT /api/material-verification/:id/complete` - Complete verification

### **Approval APIs:**
- `POST /api/production-approval/create` - Approve for production
- `GET /api/production-approval/:verificationId` - Get approval
- `PUT /api/production-approval/:id/start-production` - Start production

---

## ✅ **Review Checklist**

Before starting development, confirm:

- [ ] Flow matches your business process?
- [ ] All 6 stages clear?
- [ ] Storage in DB confirmed (MRN + Dispatch + Receipt + Verification)?
- [ ] Status transitions correct?
- [ ] QC verification checklist adequate?
- [ ] Production approval process OK?
- [ ] Photo upload at all stages?
- [ ] Barcode scanning workflow clear?
- [ ] Discrepancy handling adequate?
- [ ] Notification recipients correct?

---

## 🎯 **Your Concern: "MRN request will go"**

**Issue:** When you click on MRN request, it disappears or goes away.

**Likely Causes:**
1. **UI Issue:** Card-based MRMListPage might not be showing MRNs properly after status change
2. **Filter Issue:** Page might be filtering by status, hiding dispatched MRNs
3. **Navigation Issue:** Clicking redirects but doesn't show details

**Solution:** We'll fix this in the implementation by:
- Adding proper status filtering
- Showing all MRN stages
- Better navigation between stages
- Clear indicators of current stage

---

## 🚀 **Ready to Start?**

**Please confirm:**

1. ✅ Does this flow match your requirements?
2. ✅ Do you want all 4 new tables (Dispatch, Receipt, Verification, Approval)?
3. ✅ Should we start with Phase 1 (Dispatch table + API)?
4. ✅ Or do you want to fix the "MRN disappearing" issue first?

**Just say:**
- "YES, start Phase 1" - I'll create Dispatch table + API
- "Fix MRN issue first" - I'll investigate MRMListPage
- "Modify flow" - Tell me what to change

---

*Complete Flow Document - Ready for Implementation*
*Created: $(Get-Date)*