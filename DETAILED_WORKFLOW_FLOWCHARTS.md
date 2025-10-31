# Passion ERP - Detailed Workflow Flowcharts

## 🎯 Complete End-to-End Sales Order Lifecycle

```
                         ┌─────────────────────┐
                         │  CUSTOMER CREATES   │
                         │   SALES ORDER       │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │  Order Details Captured:       │
                    │  - Customer Info               │
                    │  - Items & Quantities          │
                    │  - Fabric Type & Color        │
                    │  - Unit Price, Total Amount   │
                    │  - Delivery Date              │
                    │  Status: DRAFT                │
                    └───────────────┬────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │   ADMIN REVIEW & APPROVAL       │
                    │   (OPTIONAL GATE)               │
                    └──────────┬──────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
         ┌──────▼───────┐          ┌─────────▼──────┐
         │   APPROVE    │          │    REJECT      │
         │   Order      │          │    Order       │
         │   Status:    │          │    Status:     │
         │   CONFIRMED  │          │    REJECTED    │
         └──────┬───────┘          └────────────────┘
                │                         │
                ▼                         └──► [END - Order Cancelled]
    ┌───────────────────────────────────┐
    │ SEND TO PROCUREMENT DEPARTMENT    │
    │ Event: "Order Ready for PO"       │
    └───────────────┬───────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────────────┐
    │  PROCUREMENT: CREATE PURCHASE ORDER          │
    │  From Sales Order Items + Bill of Materials  │
    │  ─────────────────────────────────────────   │
    │  - Fetch items from Sales Order              │
    │  - Add fabric specifications                 │
    │  - Calculate quantities with waste %         │
    │  - Search for vendors (best price)           │
    │  - Create PO with all items                  │
    │  - Status: DRAFT                             │
    └───────────────┬────────────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────────────┐
    │  ADMIN: APPROVE PURCHASE ORDER               │
    │  (CRITICAL GATE)                             │
    │  - Review vendor credibility                 │
    │  - Check delivery timeline                   │
    │  - Verify pricing                            │
    │  - Status: PENDING_APPROVAL                  │
    └──────┬─────────────────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
 ┌──▼──┐      ┌──▼──┐
 │ ✓   │      │ ✗   │
 │APPR │      │REJ  │
 │OVE  │      │ECT  │
 └──┬──┘      └──┬──┘
    │            │
    ▼            ▼
┌────────┐   ┌──────────────┐
│APPROVED│   │Return to PO  │
│PO Ready│   │Procurement   │
│to Send │   │(Edit & Retry)│
└───┬────┘   └──────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ SEND TO VENDOR                          │
│ - PO Number, Items, Price, Delivery    │
│ - Status: SENT                          │
│ - Waiting for vendor acknowledgement    │
└─────────────┬───────────────────────────┘
              │
              ▼ [Vendor Confirms]
┌─────────────────────────────────────────┐
│ STATUS: ACKNOWLEDGED                    │
│ - Vendor confirmed receipt of PO        │
│ - Materials in production at vendor     │
│ - Notify Manufacturing (Materials soon) │
└─────────────┬───────────────────────────┘
              │
              ▼ [Materials Shipped by Vendor]
┌─────────────────────────────────────────┐
│ INVENTORY: RECEIVE MATERIALS (GRN)      │
│ - Receive goods from vendor             │
│ - Check quantity matches PO             │
│ - Inspect quality                       │
│ - Status: PENDING_VERIFICATION          │
└─────────────┬───────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │  QUALITY CHECK      │
    │  Inspect Materials  │
    └──┬────────────┬─────┘
       │            │
    ┌──▼──┐      ┌──▼──┐
    │PASS │      │FAIL │
    └──┬──┘      └──┬──┘
       │            │
       ▼            ▼
  ┌────────────┐  ┌──────────────────┐
  │VERIFIED ✓  │  │Create Rejection  │
  │Ready for   │  │Contact Vendor    │
  │Inventory   │  │Request Replacement
  └─────┬──────┘  └──────┬───────────┘
        │                │
        ▼                └──► [Materials Returned/Refunded]
  ┌──────────────────────────────────┐
  │ ADD TO INVENTORY                 │
  │ - Update Stock Levels            │
  │ - Assign Location/Bin            │
  │ - Barcode/QR Code Generated      │
  │ - Status: IN_INVENTORY ✓         │
  │ - Notify Manufacturing: Ready!   │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────┐
  │ MANUFACTURING: RECEIVE MATERIALS │
  │ - Create Material Receipt record │
  │ - Verify counts                  │
  │ - Status: RECEIVED               │
  │ - Now ready to start production  │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────┐
  │ MANUFACTURING: CREATE PRODUCTION │
  │ ORDER                            │
  │ - Link to Sales Order            │
  │ - Link to Approved Inventory     │
  │ - Define production stages       │
  │ - Qty to produce                 │
  │ - Delivery deadline              │
  │ - Status: PENDING                │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────┐
  │ START PRODUCTION: STAGE 1        │
  │ (e.g., CUTTING)                  │
  │ ──────────────────────────────    │
  │ - Consume materials from inventory│
  │ - Track quantity processed       │
  │ - Quality checkpoint             │
  │ - Approved/Rejected Qty          │
  │ - Status: COMPLETED              │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────┐
  │ [Repeat for each stage]          │
  │ STAGE 2: STITCHING               │
  │ STAGE 3: EMBROIDERY (Or          │
  │          Outsource via Challan)  │
  │ STAGE 4: QUALITY CHECK           │
  │ STAGE 5: FINISHING               │
  │ STAGE 6: FINAL INSPECTION        │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────┐
  │ MATERIAL RECONCILIATION (FINAL)  │
  │ - Calculate materials used       │
  │ - Calculate leftovers            │
  │ - Return leftover to inventory   │
  │ - Audit trail complete           │
  │ - Status: COMPLETED ✓            │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────┐
  │ READY FOR SHIPMENT               │
  │ - Production order linked to     │
  │   Sales Order & Inventory        │
  │ - Notify Shipment Department     │
  │ - Status: READY_FOR_SHIPMENT     │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────┐
  │ SHIPMENT: CREATE SHIPMENT        │
  │ - Link to Production Order       │
  │ - Package goods                  │
  │ - Generate invoice               │
  │ - QR Code generated              │
  │ - Status: READY_FOR_DISPATCH     │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────┐
  │ ASSIGN COURIER PARTNER           │
  │ - Select delivery method         │
  │ - Assign delivery address        │
  │ - Generate tracking number       │
  │ - Status: DISPATCHED ✓           │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────┐
  │ REAL-TIME TRACKING               │
  │ - Courier Agent scans QR code    │
  │ - Updates status via portal      │
  │                                  │
  │ Status Options:                  │
  │ • IN_TRANSIT                     │
  │ • OUT_FOR_DELIVERY               │
  │ • DELIVERED ✓                    │
  │ • FAILED/EXCEPTION               │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────┐
  │ DELIVERY CONFIRMATION            │
  │ - Customer receives goods        │
  │ - Customer signs/confirms        │
  │ - Feedback/Rating provided       │
  │ - Status: COMPLETED ✓            │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────┐
  │ GENERATE INVOICE                 │
  │ - Auto-create from shipment      │
  │ - Items, Qty, Price, Tax         │
  │ - Status: PENDING_PAYMENT        │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌──────────────────────────────────┐
  │ PAYMENT COLLECTION               │
  │ - Invoice sent to customer       │
  │ - Record payment (Cash/Online)   │
  │ - Status: PAID ✓                 │
  │ - Sales Order Status: COMPLETED  │
  └──────────────────────────────────┘

        🎉 ORDER COMPLETE & CLOSED 🎉
```

---

## 🏭 Production Order - Detailed Stage Flow

```
                    ┌─────────────────────────┐
                    │  CREATE PRODUCTION      │
                    │  ORDER                  │
                    │  Status: PENDING        │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  MATERIAL RECEIPT       │
                    │  From Inventory/GRN     │
                    │  - Receive materials    │
                    │  - Verify quantities    │
                    │  Status: MATERIALS_RDY  │
                    └────────────┬─────────────┘
                                 │
      ┌──────────────────────────┴────────────────────────┐
      │                                                    │
      ▼                                                    ▼
┌──────────────────────────┐                    ┌──────────────────────────┐
│  QUALITY CHECK (Pass)    │                    │  QUALITY CHECK (Fail)    │
│                          │                    │                          │
│  ├─ Inspect materials    │                    │  ├─ Return to Vendor    │
│  ├─ Check certifications │                    │  ├─ Create Rejection    │
│  ├─ Verify specifications│                    │  ├─ Adjust quantities   │
│  └─ Approve             │                    │  └─ Update stock        │
│  Status: APPROVED        │                    │  Status: REJECTED       │
│                          │                    │                          │
└──────────────┬───────────┘                    └──────────────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  FOR EACH PRODUCTION STAGE   │
    │  (Loop through all stages)   │
    └──────────────┬───────────────┘
                   │
     ┌─────────────▼─────────────┐
     │  STAGE WORK TYPE CHOICE   │
     └──────┬────────────┬───────┘
            │            │
    ┌───────▼─────┐  ┌───▼────────┐
    │  IN-HOUSE   │  │ OUTSOURCED │
    └───────┬─────┘  └───┬────────┘
            │            │
            │            ▼
            │    ┌────────────────────────┐
            │    │ CREATE OUTWARD CHALLAN │
            │    │ - Select vendor        │
            │    │ - List materials       │
            │    │ - Transport details    │
            │    │ Status: SENT           │
            │    │ (Vendor receives work) │
            │    └────────────┬───────────┘
            │                 │
            │                 ▼
            │    ┌────────────────────────┐
            │    │ VENDOR COMPLETES WORK  │
            │    │ (embroidery, printing) │
            │    │ - Quality & timeline   │
            │    └────────────┬───────────┘
            │                 │
            │                 ▼
            │    ┌────────────────────────┐
            │    │ CREATE INWARD CHALLAN  │
            │    │ - Receive completed    │
            │    │ - Quality notes        │
            │    │ - Verify materials     │
            │    │ Status: RECEIVED       │
            │    └────────────┬───────────┘
            │                 │
            └────────┬────────┘
                     │
                     ▼
    ┌───────────────────────────────────┐
    │  START STAGE EXECUTION            │
    │  ────────────────────────────     │
    │  Stage Name: [CUTTING]            │
    │  - Start Date/Time                │
    │  - Assigned Workers               │
    │  - Sequence Number                │
    │  Status: IN_PROGRESS              │
    └──────────┬────────────────────────┘
               │
               ▼
    ┌───────────────────────────────────┐
    │  PROCESS MATERIALS                │
    │  ────────────────────────────     │
    │  - Consume from inventory         │
    │  - Track qty processed            │
    │  - Process waste/losses           │
    │  - Record timestamps              │
    │  Status: PROCESSING               │
    └──────────┬────────────────────────┘
               │
               ▼
    ┌───────────────────────────────────┐
    │  QUALITY CHECKPOINT               │
    │  ────────────────────────────     │
    │  Inspect Processed Goods:         │
    │  ├─ Approved Qty → Continue       │
    │  ├─ Rejected Qty → Rework/Scrap   │
    │  ├─ On-Hold Qty → Review          │
    │  └─ Record Quality Notes          │
    │  Status: QUALITY_CHECK_DONE       │
    └──────────┬────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌─────────────┐   ┌──────────────────┐
│  APPROVED ✓ │   │ REJECTED ✗       │
│  Qty → Next │   │ Rework / Scrap   │
│  Stage      │   │ Return to Stage  │
└────────┬────┘   └──────────────────┘
         │
         ▼
┌───────────────────────────────────┐
│  COMPLETE STAGE                   │
│  ─────────────────────────────    │
│  - End Date/Time                  │
│  - Duration calculation           │
│  - Approved Qty final             │
│  - Move Qty to next stage buffer  │
│  - Status: COMPLETED              │
└───────────┬───────────────────────┘
            │
    ┌───────▼────────┐
    │ More Stages?   │
    └───┬──────────┬─┘
        │          │
      YES         NO
        │          │
        │          ▼
        │   ┌──────────────────────────┐
        │   │  FINAL STAGE: MATERIAL   │
        │   │  RECONCILIATION          │
        │   │  ─────────────────────   │
        │   │  - Sum all material used │
        │   │  - Calculate total waste │
        │   │  - Compute leftovers     │
        │   │  - Return surplus to     │
        │   │    inventory             │
        │   │  Status: RECONCILED      │
        │   └────────────┬─────────────┘
        │                │
        └────────┬───────┘
                 │
                 ▼
        ┌──────────────────────────┐
        │  PRODUCTION COMPLETED ✓  │
        │  ─────────────────────   │
        │  - All stages done       │
        │  - Quality passed        │
        │  - Materials reconciled  │
        │  Status: COMPLETED       │
        │  - Ready for Shipment    │
        └──────────────────────────┘
```

---

## 📦 Shipment & Delivery Workflow

```
                    ┌─────────────────────────┐
                    │ PRODUCTION COMPLETED    │
                    │ Ready for Shipment      │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  CREATE SHIPMENT        │
                    │  ─────────────────────  │
                    │  - Link Production      │
                    │  - Package goods        │
                    │  - Generate QR Code     │
                    │  - Create invoice       │
                    │  Status: READY_FOR_DISP │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  SELECT COURIER PARTNER │
                    │  ─────────────────────  │
                    │  - DHL, FedEx, Local    │
                    │  - Calculate shipping   │
                    │  - Assign tracking #    │
                    │  - Print label/slip     │
                    │  Status: ASSIGNED       │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │ PREPARE FOR DISPATCH    │
                    │ ─────────────────────   │
                    │ - Final quality check   │
                    │ - Weight/dimensions     │
                    │ - Insurance (if needed) │
                    │ - Handover to courier   │
                    │ Status: READY_TO_SEND   │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  DISPATCH SHIPMENT      │
                    │  ─────────────────────  │
                    │ - Courier picks up      │
                    │ - Generate pod          │
                    │ - Status: DISPATCHED    │
                    │ - Tracking available    │
                    └────────────┬─────────────┘
                                 │
                    ╔════════════▼═════════════╗
                    ║  REAL-TIME TRACKING     ║
                    ║  (Courier Agent Portal) ║
                    ╚════════════╤═════════════╝
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌─────────────┐   ┌──────────────┐  ┌─────────────┐
        │IN TRANSIT   │   │OUT FOR DELIV │  │EXCEPTION    │
        │             │   │ERY           │  │             │
        │ - En route  │   │              │  │ - Damaged   │
        │ - Hub/Sort  │   │ - Delivery   │  │ - Wrong addr│
        │ - Tracking  │   │   vehicle    │  │ - Refused   │
        │   QR Scan   │   │ - Final stop │  │ - Retry?    │
        └────────┬────┘   └──────┬───────┘  └──────┬──────┘
                 │                │                │
                 │                ▼                │
                 │        ┌────────────────┐      │
                 │        │  DELIVERED ✓   │      │
                 │        │  ──────────    │      │
                 │        │ - Signed by    │      │
                 │        │   customer     │      │
                 │        │ - Photos       │      │
                 │        │ - Feedback     │      │
                 │        │ - Rating: 5★   │      │
                 │        │ Status: COMPL  │      │
                 │        └────────┬───────┘      │
                 │                 │              │
                 └────────┬────────┘              │
                          │                       │
                          │ [Retry Attempt]      │
                          │                       │
                          └───────────┬───────────┘
                                      │
                        ┌─────────────▼──────────┐
                        │  DELIVERY CONFIRMED    │
                        │  ──────────────────    │
                        │ - Update inventory     │
                        │ - Generate invoice     │
                        │ - Sales order complete │
                        │ - Notify customer      │
                        │ - Status: COMPLETED ✓ │
                        └────────────────────────┘

                    🎉 ORDER FULFILLED 🎉
```

---

## 💰 Financial & Invoice Workflow

```
        ┌─────────────────────────────┐
        │  SHIPMENT DELIVERED         │
        │  Customer received goods    │
        └────────────┬────────────────┘
                     │
        ┌────────────▼────────────────┐
        │  GENERATE INVOICE           │
        │  (Auto-from Shipment)       │
        │  ────────────────────────   │
        │  - Order number             │
        │  - Items & Qty              │
        │  - Unit price               │
        │  - Subtotal                 │
        │  - Tax (GST) calculation    │
        │  - Total amount             │
        │  - Due date                 │
        │  Status: PENDING_PAYMENT    │
        └────────────┬────────────────┘
                     │
        ┌────────────▼────────────────┐
        │  SEND INVOICE TO CUSTOMER   │
        │  ────────────────────────   │
        │  - Email invoice            │
        │  - Payment options          │
        │  - Due date reminder        │
        │  - Track in Finance system  │
        │  Status: SENT               │
        └────────────┬────────────────┘
                     │
        ┌────────────▼────────────────┐
        │  CUSTOMER PAYMENT OPTIONS   │
        └────────────┬────────────────┘
                     │
        ┌────────────┼────────────────┐
        │            │                │
        ▼            ▼                ▼
    ┌────────┐  ┌────────┐      ┌──────────┐
    │ CASH   │  │ ONLINE │      │ CHEQUE   │
    │ PAYMENT│  │TRANSFER│      │ PAYMENT  │
    │ (POD)  │  │(Bank)  │      │(Clearing)│
    └───┬────┘  └───┬────┘      └────┬─────┘
        │           │                │
        └───────────┼────────────────┘
                    │
        ┌───────────▼──────────────┐
        │  RECORD PAYMENT          │
        │  ──────────────────────  │
        │  - Date received         │
        │  - Amount (Full/Partial) │
        │  - Method used           │
        │  - Reference # if online │
        │  - Add to receipt        │
        └───────────┬──────────────┘
                    │
        ┌───────────▼──────────────┐
        │  PAYMENT PROCESSING      │
        └────┬─────────────┬───────┘
             │             │
             │             │
        ┌────▼──┐    ┌─────▼───┐
        │ FULLY  │    │PARTIALLY│
        │ PAID ✓ │    │ PAID    │
        └────┬───┘    └─────┬───┘
             │              │
             │              ▼
             │      ┌──────────────────┐
             │      │SEND REMINDER     │
             │      │Due for remainder │
             │      │Next payment due  │
             │      └────────────────┘
             │
             ▼
    ┌───────────────────────────┐
    │ UPDATE INVOICE STATUS     │
    │ ──────────────────────    │
    │ Status: PAID              │
    │ Amount: Received          │
    │ Balance Due: $0           │
    │ Mark as settled           │
    └───────────┬───────────────┘
                │
    ┌───────────▼───────────────┐
    │ GENERATE PAYMENT RECEIPT  │
    │ ──────────────────────    │
    │ - Invoice number          │
    │ - Amount paid             │
    │ - Payment date            │
    │ - Method                  │
    │ - Issued to customer      │
    │ Status: COMPLETED ✓       │
    └───────────┬───────────────┘
                │
    ┌───────────▼───────────────┐
    │ REVENUE RECOGNITION       │
    │ ──────────────────────    │
    │ - Add to revenue reports  │
    │ - Update financial KPIs   │
    │ - Year-to-date totals     │
    │ - Customer account updated│
    │ Status: RECORDED          │
    └───────────────────────────┘

        🎉 TRANSACTION COMPLETE 🎉
```

---

## 🏗️ Data Model Relationships

```
USER MANAGEMENT:
User (1) ←─ has many ─→ (M) Role
Role (1) ←─ has many ─→ (M) Permission
User (1) ←─ many-to-many ─→ (M) Department

SALES:
Customer (1) ←─ has many ─→ (M) SalesOrder
SalesOrder (1) ←─ has many ─→ (M) SalesOrderHistory
SalesOrder (1) ←─ has one ─→ (1) ProductionOrder

PROCUREMENT:
PurchaseOrder (1) ←─ has many ─→ (M) PurchaseOrderItem
Vendor (1) ←─ has many ─→ (M) PurchaseOrder
PurchaseOrder (1) ←─ has one ─→ (1) GoodsReceiptNote
PurchaseOrder (1) ← linked to → (1) SalesOrder

INVENTORY:
Inventory (1) ←─ has many ─→ (M) InventoryMovement
Inventory (1) ←─ has many ─→ (M) MaterialAllocation
GoodsReceiptNote (1) ←─ has many ─→ (M) InventoryItem
Inventory (1) ← links to → (1) Project

MANUFACTURING:
SalesOrder (1) ←─ triggers ─→ (1) ProductionRequest
ProductionRequest (1) ←─ creates ─→ (1) ProductionOrder
ProductionOrder (1) ←─ has many ─→ (M) ProductionStage
ProductionStage (1) ←─ has many ─→ (M) QualityCheckpoint
ProductionOrder (1) ←─ uses ─→ (M) MaterialConsumption
ProductionOrder (1) ←─ has many ─→ (M) StageOperation
ProductionOrder (1) ←─ linked to ─→ (1) Shipment

SHIPMENT:
ProductionOrder (1) ←─ has one ─→ (1) Shipment
Shipment (1) ← assigned to → (M) CourierPartner
Shipment (1) ←─ has many ─→ (M) ShipmentTracking
Shipment (1) ←─ has one ─→ (1) CourierAgent
CourierAgent (1) ← works for → (M) CourierPartner

FINANCE:
Shipment (1) ←─ generates ─→ (1) Invoice
Invoice (1) ← receives payment → (M) Payment
Invoice (1) ← relates to → (1) SalesOrder

QUALITY:
ProductionStage (1) ← has checkpoint → (1) QualityCheckpoint
GoodsReceiptNote (1) ← needs review → (1) MaterialVerification
ProductionApproval (1) ← approves → (1) ProductionOrder

EXTERNAL:
PurchaseOrder (1) ← relates to → (1) BillOfMaterials
ProductionOrder (1) ← has audit → (1) ProductionCompletion
SalesOrder (1) ← tracked by → (1) SalesOrderHistory
MaterialDispatch (1) ← precedes → (1) MaterialReceipt
```

---

## 🎭 Role-Based Access Control (RBAC) Matrix

```
┌──────────────────┬──────────┬────────────┬──────────┬──────────┬────────────┐
│ Feature / Module │ Admin    │ Manager    │ User     │ Readonly │ Dept Head  │
├──────────────────┼──────────┼────────────┼──────────┼──────────┼────────────┤
│ User Management  │ CRUD     │ View       │ View Own │ View     │ Create     │
│ Role Management  │ CRUD     │ View       │ View     │ View     │ View       │
│ PO Approval      │ APPROVE  │ VIEW       │ -        │ -        │ APPROVE    │
│ Create PO        │ Yes      │ Yes        │ Yes      │ -        │ Yes        │
│ Create SO        │ Yes      │ Yes        │ Yes      │ -        │ Yes        │
│ Create Shipment  │ Yes      │ Yes        │ Yes      │ -        │ Yes        │
│ View Reports     │ All      │ Dept Rpts  │ Own Data │ All (RO) │ Dept Rpts  │
│ Approve Invoice  │ Yes      │ Yes        │ -        │ -        │ Yes        │
│ System Config    │ Yes      │ -          │ -        │ -        │ -          │
└──────────────────┴──────────┴────────────┴──────────┴──────────┴────────────┘

Key:
- CRUD = Create, Read, Update, Delete
- APPROVE = Can approve/reject actions
- View = Read-only access
- Own Data = Only see their own records
- RO = Read-Only
- - = No access
```

---

## 🔄 Status Transitions & State Machine

```
SALES ORDER STATUS FLOW:
DRAFT
  ├─ APPROVE → PENDING_APPROVAL
  ├─ SUBMIT → PENDING_APPROVAL (if auto-approval enabled)
  └─ CANCEL → CANCELLED

PENDING_APPROVAL
  ├─ APPROVE → CONFIRMED
  ├─ REJECT → REJECTED
  └─ HOLD → PENDING_APPROVAL

CONFIRMED
  ├─ SEND_TO_PROCUREMENT → PROCUREMENT_CREATED
  └─ CANCEL → CANCELLED

PROCUREMENT_CREATED
  ├─ IN_PRODUCTION → IN_PRODUCTION
  └─ DELAY → DELAYED

IN_PRODUCTION
  ├─ QUALITY_CHECK_PASS → READY_TO_SHIP
  └─ QUALITY_CHECK_FAIL → QC_FAILED

READY_TO_SHIP
  ├─ DISPATCH → SHIPPED
  └─ HOLD → READY_TO_SHIP

SHIPPED
  ├─ IN_TRANSIT → SHIPPED
  └─ DELIVERED → DELIVERED

DELIVERED
  ├─ CONFIRM_DELIVERY → COMPLETED
  └─ ISSUE_REPORTED → PENDING_RESOLUTION

COMPLETED ✓
  └─ [TERMINAL STATE]

CANCELLED [TERMINAL STATE]
REJECTED [TERMINAL STATE]
PENDING_RESOLUTION → COMPLETED

─────────────────────────────────────────

PURCHASE ORDER STATUS FLOW:
DRAFT
  ├─ SUBMIT → PENDING_APPROVAL
  └─ CANCEL → CANCELLED

PENDING_APPROVAL
  ├─ APPROVE → APPROVED
  ├─ REJECT → REJECTED
  └─ REQUEST_CHANGES → DRAFT

APPROVED
  ├─ SEND → SENT
  └─ HOLD → APPROVED

SENT
  ├─ ACKNOWLEDGE → ACKNOWLEDGED
  ├─ DELIVERY_DATE_UPDATE → SENT
  └─ CANCEL → CANCELLED

ACKNOWLEDGED
  ├─ IN_TRANSIT → IN_TRANSIT
  ├─ DELAY_NOTIF → IN_TRANSIT
  └─ PARTIAL_DELIVERY → PARTIALLY_RECEIVED

IN_TRANSIT
  ├─ RECEIVE → RECEIVED
  └─ DELIVERY_ISSUE → IN_TRANSIT

RECEIVED
  ├─ VERIFY → VERIFIED
  ├─ QUALITY_ISSUE → QUALITY_REVIEW
  └─ PARTIAL_ACCEPTANCE → PARTIAL_ACCEPTED

VERIFIED
  ├─ INVOICE_CREATED → INVOICED
  └─ COMPLETE → COMPLETED ✓

COMPLETED ✓ [TERMINAL STATE]
CANCELLED [TERMINAL STATE]
REJECTED [TERMINAL STATE]
QUALITY_REVIEW → VERIFIED or REJECTED

─────────────────────────────────────────

PRODUCTION ORDER STATUS FLOW:
PENDING → STARTED → IN_PROGRESS → COMPLETED → READY_FOR_SHIPMENT → SHIPPED → DELIVERED

Each stage: PENDING → IN_PROGRESS → COMPLETED (with quality checkpoints)

─────────────────────────────────────────

SHIPMENT STATUS FLOW:
READY_FOR_DISPATCH
  ├─ ASSIGN_COURIER → ASSIGNED
  └─ HOLD → READY_FOR_DISPATCH

ASSIGNED
  ├─ DISPATCH → DISPATCHED
  └─ CANCEL → CANCELLED

DISPATCHED
  ├─ SCAN_QR (Courier) → IN_TRANSIT
  ├─ IN_TRANSIT (Manual) → IN_TRANSIT
  └─ EXCEPTION → EXCEPTION

IN_TRANSIT
  ├─ OUT_FOR_DELIVERY → OUT_FOR_DELIVERY
  ├─ LOCATION_UPDATE → IN_TRANSIT
  └─ DELAY → IN_TRANSIT

OUT_FOR_DELIVERY
  ├─ DELIVERED → DELIVERED
  ├─ FAILED → DELIVERY_FAILED
  └─ RETRY → OUT_FOR_DELIVERY

DELIVERED ✓
  ├─ CONFIRM → COMPLETED ✓
  └─ ISSUE → PENDING_RESOLUTION

COMPLETED ✓ [TERMINAL STATE]
CANCELLED [TERMINAL STATE]
DELIVERY_FAILED → OUT_FOR_DELIVERY (retry) or RETURN_TO_WAREHOUSE
EXCEPTION → [Investigation] → IN_TRANSIT (retry) or CANCELLED
```

---

## 🚀 System Performance Metrics

```
Response Times:
├─ Authentication (Login): < 500ms
├─ Dashboard Load: < 1s
├─ List View (100 items): < 1.5s
├─ Create Record: < 800ms
├─ Update Record: < 600ms
├─ Generate Report: < 3s
├─ Export to CSV: < 5s
└─ Real-time Tracking: < 100ms updates

Database:
├─ Max Concurrent Users: 10
├─ Connection Pool Size: 10
├─ Query Timeout: 30 seconds
├─ Idle Connection Timeout: 10 seconds
├─ Acquire Timeout: 30 seconds
└─ Active Connections: Auto-managed

API:
├─ Rate Limit: 1000 requests per 15 minutes
├─ Request Timeout: 10 seconds
├─ Max Payload: 10MB (file uploads)
├─ Compression: gzip enabled
└─ Error Response Time: < 100ms

Frontend:
├─ Initial Load: < 3s
├─ Page Navigation: < 500ms
├─ Form Submission: < 1s
└─ Real-time Updates: < 500ms

Uptime Target:
├─ Overall: 99.5%
├─ Business Hours: 99.9%
├─ Scheduled Maintenance: During off-peak hours
└─ Database Backups: Daily (automated)
```

---

**End of Detailed Workflow Flowcharts**

*Last Updated: Jan 2025*
*Version: 1.0 (Production)*