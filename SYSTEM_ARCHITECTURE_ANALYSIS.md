# Passion ERP System - Complete System Analysis & Flowcharts

## 📊 Executive Summary

**Passion Clothing Factory ERP** is a comprehensive Enterprise Resource Planning system built with:
- **Frontend**: React 18 + Vite + Tailwind CSS (Port 3000)
- **Backend**: Node.js + Express + Sequelize ORM (Port 5000)
- **Database**: MySQL (AWS RDS)
- **Authentication**: JWT-based with Role-Based Access Control (RBAC)

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                       CLIENT (React 3000)                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Login → Auth Context → Protected Routes → Department Access  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────────────────┘
             │ Axios API Calls (JWT Bearer Token)
             │ Proxy: /api → localhost:5000/api
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   BACKEND (Express 5000)                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ CORS | Rate Limiting | Morgan Logging | Compression         │   │
│  │ Auth Middleware | Department Routing                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Routes: /api/auth, /api/sales, /api/procurement, /api/inventory │
│          /api/manufacturing, /api/shipment, /api/finance, ...     │
└────────────┬────────────────────────────────────────────────────────┘
             │ Sequelize ORM
             │ Connection Pooling (max 10)
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│            MySQL Database (AWS RDS)                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ passion_erp (Production Database)                           │   │
│  │ 39 Core Tables with Relationships & Indexes                │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Business Workflows

### 1️⃣ SALES TO PRODUCTION FLOW (Main Revenue Pipeline)

```
┌──────────────────────────────────────────────────────────────────────┐
│                    SALES DEPARTMENT (Create Order)                    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 1. Create Sales Order                                           │  │
│  │    - Order Number, Customer, Items, Qty, Delivery Date         │  │
│  │    - Fabric Type, Color, Special Instructions                  │  │
│  │    - Unit Price, Total Amount                                  │  │
│  │    - Status: DRAFT                                             │  │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────┬──────────────────────────────────────────────────────┘
                │ Event: SalesOrder Created
                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                 ADMIN APPROVAL (Optional Gate)                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 2. Admin Reviews Sales Order                                   │  │
│  │    - Check customer credit                                    │  │
│  │    - Verify delivery timeline                                │  │
│  │    Status: PENDING_APPROVAL                                  │  │
│  │                                                               │  │
│  │    ✓ APPROVE → Status: CONFIRMED                            │  │
│  │    ✗ REJECT → Status: REJECTED                              │  │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────┬──────────────────────────────────────────────────────┘
                │ If Status = CONFIRMED
                ▼
┌──────────────────────────────────────────────────────────────────────┐
│              PROCUREMENT DEPARTMENT (Purchase from Vendors)           │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 3. Create Purchase Order (PO)                                 │  │
│  │    - From Sales Order items & fabric specs                   │  │
│  │    - Auto-fetch from Bill of Materials                       │  │
│  │    - Select Vendor (Best Price/Delivery)                     │  │
│  │    - Items: Material, Qty, Unit Price, Delivery Date         │  │
│  │    - Status: DRAFT                                           │  │
│  │                                                               │  │
│  │    SEND TO ADMIN APPROVAL                                   │  │
│  │    Status: PENDING_APPROVAL                                 │  │
│  │                                                               │  │
│  │    ✓ ADMIN APPROVES → Status: APPROVED                      │  │
│  │    ✗ ADMIN REJECTS → Return to Procurement                  │  │
│  │                                                               │  │
│  │    Send to Vendor                                            │  │
│  │    Status: SENT → Waiting for ACK                            │  │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────┬──────────────────────────────────────────────────────┘
                │ Vendor Confirms → Status: ACKNOWLEDGED
                ▼
┌──────────────────────────────────────────────────────────────────────┐
│              INVENTORY DEPARTMENT (Receive Materials)                 │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 4. Goods Receipt Note (GRN) Created                          │  │
│  │    - Receive PO items from vendor                            │  │
│  │    - Check Qty, Quality, Expiry                              │  │
│  │    - Status: PENDING_VERIFICATION                             │  │
│  │                                                               │  │
│  │    VERIFY GOODS                                              │  │
│  │    - Inspect materials                                       │  │
│  │    - Status: VERIFIED                                        │  │
│  │                                                               │  │
│  │    ADD TO INVENTORY                                          │  │
│  │    - Update Stock Levels                                    │  │
│  │    - Assign Location/Bin                                    │  │
│  │    - Status: IN_INVENTORY                                   │  │
│  │                                                               │  │
│  │    Notify Manufacturing: Materials Ready                    │  │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────┬──────────────────────────────────────────────────────┘
                │ Event: Materials Available for Production
                ▼
┌──────────────────────────────────────────────────────────────────────┐
│           MANUFACTURING DEPARTMENT (Produce Goods)                    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 5. Material Receipt & Dispatch                                │  │
│  │    - Manufacturing requests materials from inventory          │  │
│  │    - Inventory creates Material Dispatch                      │  │
│  │    - Manufacturing Receives → MaterialReceipt                │  │
│  │    - Track quantities                                        │  │
│  │                                                               │  │
│  │ 6. Create Production Order                                   │  │
│  │    - Link to Sales Order                                    │  │
│  │    - Define stages: Cutting → Stitching → Embroidery →     │  │
│  │      Quality Check → Finishing                              │  │
│  │    - Qty to Produce, Dead Line                              │  │
│  │    - Status: PENDING                                         │  │
│  │                                                               │  │
│  │ 7. Track Production Stages                                   │  │
│  │    For each stage:                                          │  │
│  │    - START → Process Qty, Materials Used                   │  │
│  │    - PAUSE (if needed)                                      │  │
│  │    - QUALITY CHECK → Approved / Rejected                    │  │
│  │    - COMPLETE → Move to Next Stage                          │  │
│  │                                                               │  │
│  │    Option: Outsource to vendors (embroidery, printing)      │  │
│  │    - Send via Outward Challan                               │  │
│  │    - Receive back via Inward Challan                        │  │
│  │                                                               │  │
│  │ 8. Material Reconciliation (Final Stage)                     │  │
│  │    - Calculate Material Used vs. Planned                    │  │
│  │    - Leftover Materials returned to Inventory              │  │
│  │    - Audit Trail Complete                                  │  │
│  │                                                               │  │
│  │    Status: COMPLETED                                         │  │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────┬──────────────────────────────────────────────────────┘
                │ Event: Production Completed, Ready to Ship
                ▼
┌──────────────────────────────────────────────────────────────────────┐
│            SHIPMENT DEPARTMENT (Package & Deliver)                    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 9. Create Shipment                                            │  │
│  │    - Link to Production Order                                │  │
│  │    - Package goods                                           │  │
│  │    - Generate invoice                                        │  │
│  │    - Status: READY_FOR_DISPATCH                              │  │
│  │                                                               │  │
│  │ 10. Assign Courier Partner                                   │  │
│  │     - Select delivery method                                │  │
│  │     - Courier: DHL, FedEx, Local Partner                   │  │
│  │     - Generate tracking number                              │  │
│  │     - Status: DISPATCHED                                    │  │
│  │                                                               │  │
│  │ 11. Real-Time Tracking                                       │  │
│  │     - Courier Agent Login Portal                            │  │
│  │     - Scan QR Code to update status                         │  │
│  │     - Options:                                              │  │
│  │       • In Transit → Status: IN_TRANSIT                    │  │
│  │       • Out for Delivery → Status: OUT_FOR_DELIVERY        │  │
│  │       • Delivered ✓ → Status: DELIVERED                    │  │
│  │       • Failed/Exception → Status: PENDING_RETRY            │  │
│  │                                                               │  │
│  │ 12. Delivery Confirmation                                    │  │
│  │     - Customer signs                                        │  │
│  │     - Feedback/Rating                                       │  │
│  │     - Status: COMPLETED                                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────┬──────────────────────────────────────────────────────┘
                │ Event: Order Delivered Successfully
                ▼
┌──────────────────────────────────────────────────────────────────────┐
│             FINANCE DEPARTMENT (Invoice & Payment)                    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 13. Generate Invoice                                          │  │
│  │     - Auto-create from completed shipment                   │  │
│  │     - Items, Qty, Price, GST, Total                         │  │
│  │     - Status: PENDING_PAYMENT                               │  │
│  │                                                               │  │
│  │ 14. Payment Collection                                       │  │
│  │     - Invoice sent to customer                              │  │
│  │     - Customer pays (Cash/Online/Check)                     │  │
│  │     - Finance records payment                               │  │
│  │     - Status: PAID / PARTIALLY PAID                          │  │
│  │                                                               │  │
│  │ 15. Final Sales Order Status                                │  │
│  │     Status: COMPLETED ✓                                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 2️⃣ QUALITY CONTROL & REJECTION WORKFLOW

```
┌──────────────────────────────────────────────────────────────────────┐
│              QUALITY CONTROL CHECKPOINTS                              │
│                                                                       │
│  ┌─ Incoming Materials (GRN Stage) ──────────────────────────────┐  │
│  │  ✓ ACCEPT → Add to Inventory                                 │  │
│  │  ✗ REJECT → Create Rejection Record                          │  │
│  │             Contact Vendor (Replacement/Refund)              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─ Production Stages Quality Check ─────────────────────────────┐  │
│  │  At each stage completion:                                   │  │
│  │  - Inspect Processed Qty                                     │  │
│  │  - Approve Qty → Move to Next Stage                          │  │
│  │  - Reject Qty → Rework or Scrap                             │  │
│  │  - Add Quality Checkpoint Record                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─ Final Shipment Quality Check ────────────────────────────────┐  │
│  │  Before dispatch:                                            │  │
│  │  - Final inspection of packed goods                          │  │
│  │  - Verify count, quality, packaging                          │  │
│  │  - Take photos/video if needed                               │  │
│  │  - Clear for dispatch or hold for rework                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 3️⃣ MATERIAL FLOW DIAGRAM

```
VENDORS → [GRN → Verification] → INVENTORY [Stock Levels, Location]
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
              [Dispatch]       [Project Stock]    [Store Stock]
                    │                 │                 │
                    ▼                 ▼                 ▼
            MANUFACTURING    PROJECT TRACKING     RETAIL/STORE
            - Materials      - Link to Sales      - Counter Sales
            - Tracking       - Qty Allocated      - Store Returns
            - Usage          - Stock Reserved     - Reorder

                PRODUCTION OPERATIONS:
                ├─ In-House: Cutting → Stitching → Embroidery → 
                │            Finishing → QC → Ready
                │
                └─ Outsourced: Send (Challan) → Work → 
                               Receive (Challan) → Quality Check → Ready

                [Final: Material Reconciliation]
                - Calculate Usage vs Planned
                - Leftover back to Inventory
```

---

## 🏢 Department Structure & Modules

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DEPARTMENT                         │
│  • User Management (Create/Edit/Delete Users)              │
│  • Role Management (Define Roles & Permissions)            │
│  • Courier Agent Management                                │
│  • System Configuration                                    │
│  • Dashboard with KPIs                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    SALES DEPARTMENT                         │
│  • Sales Orders (Create, View, Edit, Track)               │
│  • Sales Pipeline (Visualize Order Status)                │
│  • Customer Management                                     │
│  • Sales Reports & Analytics                              │
│  • Expected Delivery Dates                                │
│  • Dashboard with Revenue, Active Orders, etc.            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 PROCUREMENT DEPARTMENT                      │
│  • Purchase Orders (Create, Track)                         │
│  • Pending Approvals (Admin Gate)                          │
│  • Vendor Management                                       │
│  • Vendor Performance Tracking                             │
│  • Bill of Materials (BoM)                                 │
│  • Material Requests from Manufacturing                    │
│  • Production Requests                                     │
│  • Goods Receipt (GRN)                                     │
│  • Procurement Reports                                     │
│  • Dashboard with Active POs, Vendor Stats, etc.          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 INVENTORY DEPARTMENT                        │
│  • Unified Product/Stock Management                        │
│  • Stock Levels, Locations, Bin Management               │
│  • Stock Alerts (Low Stock Notifications)                 │
│  • Material Requests (MRN)                                │
│  • Stock Dispatch to Manufacturing                        │
│  • Goods Receipt Notes (GRN) Management                   │
│  • GRN Verification                                        │
│  • Project Material Tracking                              │
│  • Barcode/QR Code Generation & Scanning                 │
│  • Inventory Reports                                      │
│  • Dashboard with Stock Summary, Alerts, etc.             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              MANUFACTURING DEPARTMENT                       │
│  • Production Orders (Create, Track)                       │
│  • Production Wizard (Pre-fill from Approvals)            │
│  • Material Receipt & Dispatch                            │
│  • Stock Verification                                     │
│  • Production Approval Process                            │
│  • Production Tracking (Stage-by-Stage)                   │
│  • Production Operations (In-House & Outsourced)          │
│  • Quality Control                                        │
│  • Outsource Management (Vendors, Challans)               │
│  • Material Requirements Planning (MRP)                   │
│  • Manufacturing Reports                                  │
│  • Dashboard with Production Status, Delays, etc.         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  SHIPMENT DEPARTMENT                        │
│  • Incoming Orders (From Manufacturing)                    │
│  • Create Shipment (Package Goods)                         │
│  • Active Shipments (Real-Time Tracking)                   │
│  • Dispatched Orders (Courier Assignments)                │
│  • Tracking (View Current Status)                         │
│  • Courier Partner Integration                            │
│  • Courier Agent Portal (QR Scan Updates)                 │
│  • Shipment Reports & Analytics                          │
│  • Dashboard with Active Orders, Delivery Rates, etc.     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   FINANCE DEPARTMENT                        │
│  • Invoice Generation & Management                         │
│  • Payment Collection Tracking                             │
│  • Payment Methods: Cash, Online, Check, etc.             │
│  • Financial Reports & Analysis                           │
│  • Dashboard with Revenue, Outstanding Payments, etc.     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                CHALLANS DEPARTMENT                          │
│  • Challan Register (All Material Movements)              │
│  • Create Challan (Record Material Transfer)              │
│  • Inward/Outward Tracking                               │
│  • Vendor Material Transactions                           │
│  • Challan QR Code / Number Tracking                      │
│  • Dashboard with Material Flow Summary                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   STORE DEPARTMENT                          │
│  • Store Stock Management                                 │
│  • Counter Sales                                          │
│  • Store Returns                                          │
│  • Stock Reconciliation                                   │
│  • Retail Dashboard                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 SAMPLES DEPARTMENT                          │
│  • Sample Requests Creation                               │
│  • Sample Orders Tracking                                 │
│  • Sample Conversion (Sample → Production)                │
│  • Sample Reports & Analytics                             │
│  • Dashboard with Active Samples, etc.                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Core Database Tables (39 Tables)

```
Authentication & User Management:
├─ User (user_id, name, email, password_hash, department, status)
├─ Role (role_id, name, description)
├─ Permission (permission_id, name, description)
├─ UserRole (mapping: user ↔ role)

Business Entities:
├─ Customer (customer_id, name, email, phone, address, credit_limit)
├─ Vendor (vendor_id, name, email, phone, address, category, rating)
├─ Product (product_id, name, description, sku, category)
├─ Courier Partner (partner_id, name, contact, service_type)
├─ CourierAgent (agent_id, name, partner_id, phone, status)

Sales Module:
├─ SalesOrder (order_id, order_number, customer_id, status, total_amount, items JSON)
├─ SalesOrderHistory (track status changes)

Procurement Module:
├─ PurchaseOrder (po_id, po_number, vendor_id, status, items JSON, total_amount)
├─ Approval (approval_id, order_id, type, status, reviewer_notes)

Inventory Module:
├─ Inventory (inventory_id, product_id, name, quantity, location, category, material, description)
├─ InventoryMovement (track all stock movements)
├─ MaterialAllocation (allocate for projects)
├─ ProjectMaterialRequest (track project-wise material needs)
├─ GoodsReceiptNote (grn_id, po_id, status, received_qty, verified_qty)
├─ StoreStock (retail stock tracking)

Manufacturing Module:
├─ ProductionOrder (order_id, sales_order_id, project_reference, status, qty, stages)
├─ ProductionStage (stage details: name, qty_processed, qty_approved, qty_rejected)
├─ QualityCheckpoint (quality_id, stage_id, approved_qty, rejected_qty, notes)
├─ MaterialConsumption (track material usage per stage)
├─ MaterialRequirement (material_requirement_id, qty_needed, quantity, description)
├─ ProductionRequest (production_request_id, sales_order_id, status, created_at)
├─ MaterialDispatch (track materials sent to manufacturing)
├─ MaterialReceipt (track materials received by manufacturing)
├─ MaterialVerification (verify received materials)
├─ ProductionApproval (production_approval_id, status, qty_received, notes)
├─ StageOperation (detailed stage execution data)
├─ ProductionCompletion (completion tracking)
├─ BillOfMaterials (bom_id, product_id, components, quantities)

Shipment Module:
├─ Shipment (shipment_id, production_order_id, status, courier_partner_id)
├─ ShipmentTracking (tracking_id, shipment_id, status_update, timestamp, location)

Financial Module:
├─ Invoice (invoice_id, shipment_id, items, total_amount, tax, status)
├─ Payment (payment_id, invoice_id, amount, method, status, date)

Other Modules:
├─ Challan (challan_id, type [inward/outward], vendor_id, items)
├─ Sample (sample_id, product_id, description, status)
├─ Rejection (rejection_id, item_id, reason, qty_rejected)
├─ Notification (notification_id, user_id, message, status)
├─ Attendance (attendance_id, user_id, date, check_in, check_out)
├─ ProductLifecycle (track product status over time)
├─ ProductLifecycleHistory (audit trail for lifecycle changes)
├─ VendorReturn (returns from vendors)
└─ SalesOrderHistory (audit trail for sales orders)
```

---

## 🔐 Authentication & Authorization Flow

```
┌────────────────────────────────────────────────────────────┐
│              USER LOGIN & AUTHENTICATION                    │
│                                                             │
│  1. User enters Email + Password                           │
│  2. Backend validates credentials                          │
│  3. Generate JWT Token (expires in 24 hours)              │
│  4. Return Token + User Data (name, email, department)     │
│  5. Store Token in localStorage                           │
│                                                             │
│  JWT Token Structure:                                      │
│  ┌─ Header: { alg: "HS256", typ: "JWT" }                 │
│  ├─ Payload: { user_id, email, department, roles,        │
│  │            permissions, iat, exp }                    │
│  └─ Signature: Verified with JWT_SECRET                  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│           REQUEST WITH JWT TOKEN (All API Calls)           │
│                                                             │
│  Header: Authorization: Bearer <JWT_TOKEN>                 │
│  ├─ Backend extracts & verifies token                     │
│  ├─ Check token expiry                                    │
│  ├─ Validate user still exists in database                │
│  └─ Proceed with request if valid                         │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│         ROLE-BASED ACCESS CONTROL (RBAC)                   │
│                                                             │
│  User Has Roles → Roles Have Permissions                   │
│                                                             │
│  Example:                                                  │
│  ├─ User: "John" → Roles: [Manager, Procurement]          │
│  ├─ Manager Role → Permissions:                           │
│  │   • View All Orders                                    │
│  │   • Approve POs                                        │
│  │   • View Reports                                       │
│  │   • But NOT: Delete Users                              │
│  ├─ Procurement Role → Permissions:                        │
│  │   • Create PO                                          │
│  │   • View PO                                            │
│  │   • But NOT: Approve PO (Manager only)                │
│  │                                                         │
│  └─ Department-Level Access:                              │
│      Procurement user can ONLY access:                     │
│      • /procurement/* routes                              │
│      • Cannot access /manufacturing or /finance           │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│             EXPIRED TOKEN HANDLING                          │
│                                                             │
│  1. User makes API request with expired token              │
│  2. Backend returns 401 Unauthorized                       │
│  3. Frontend intercepts 401 error                          │
│  4. Auto-logout user                                       │
│  5. Clear token from localStorage                          │
│  6. Redirect to /login page                               │
│  7. User sees "Session expired, please log in again"      │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 API Architecture (RESTful)

```
BASE URL: http://localhost:5000/api

Authentication:
├─ POST   /auth/login              [email, password]
├─ POST   /auth/register           [name, email, password, department]
├─ GET    /auth/verify             [Verify JWT]
└─ POST   /auth/logout             [Invalidate token]

Sales Module:
├─ POST   /sales/orders                    [Create order]
├─ GET    /sales/orders                    [List orders]
├─ GET    /sales/orders/:id                [Get order details]
├─ PUT    /sales/orders/:id                [Update order]
├─ PUT    /sales/orders/:id/send-to-procurement
├─ GET    /sales/pipeline                  [Pipeline view]
├─ GET    /sales/dashboard/stats           [KPI stats]
└─ GET    /sales/export                    [Export orders]

Procurement Module:
├─ POST   /procurement/pos                 [Create PO]
├─ GET    /procurement/pos                 [List POs]
├─ GET    /procurement/pos?status=pending_approval
├─ GET    /procurement/pos/:id             [Get PO details]
├─ PUT    /procurement/pos/:id/status      [Update status/Approve]
├─ PATCH  /procurement/pos/:id             [Reject with reason]
├─ POST   /procurement/vendors             [Create vendor]
├─ GET    /procurement/vendors             [List vendors]
├─ GET    /procurement/bom                 [Bill of Materials]
├─ POST   /procurement/grn                 [Create GRN]
└─ GET    /procurement/dashboard/stats

Inventory Module:
├─ POST   /inventory                       [Add to inventory]
├─ GET    /inventory                       [List inventory]
├─ GET    /inventory?project_id=X          [Project stock]
├─ PATCH  /inventory/:id                   [Update stock]
├─ POST   /inventory/dispatch              [Dispatch stock]
├─ GET    /inventory/alerts                [Low stock alerts]
├─ POST   /inventory/grn                   [Add GRN to inventory]
├─ GET    /inventory/project/:project_id   [Project materials]
└─ GET    /inventory/reports

Manufacturing Module:
├─ POST   /manufacturing/orders            [Create production order]
├─ GET    /manufacturing/orders            [List orders]
├─ GET    /manufacturing/orders/:id        [Get order details]
├─ PUT    /manufacturing/orders/:id/stage  [Update stage status]
├─ PUT    /manufacturing/orders/:id/complete
├─ POST   /manufacturing/material-receipt  [Receive materials]
├─ POST   /manufacturing/quality           [Quality checkpoint]
├─ GET    /manufacturing/dashboard/stats
└─ POST   /manufacturing/outsource         [Outsource to vendor]

Shipment Module:
├─ POST   /shipments                       [Create shipment]
├─ GET    /shipments                       [List shipments]
├─ GET    /shipments/:id                   [Get shipment details]
├─ PUT    /shipments/:id/status            [Update status]
├─ PUT    /shipments/:id/tracking          [Add tracking update]
├─ GET    /shipments/:id/tracking          [Get tracking history]
├─ GET    /shipments/incoming              [Incoming orders]
├─ GET    /shipments/active                [Active shipments]
└─ GET    /shipments/dashboard/stats

Finance Module:
├─ POST   /finance/invoices                [Create invoice]
├─ GET    /finance/invoices                [List invoices]
├─ POST   /finance/payments                [Record payment]
├─ GET    /finance/payments                [List payments]
└─ GET    /finance/reports

Challans Module:
├─ POST   /challans                        [Create challan]
├─ GET    /challans                        [List challans]
├─ GET    /challans/register               [Challan register]
└─ GET    /challans/:id                    [Get challan details]

Admin Module:
├─ POST   /admin/users                     [Create user]
├─ GET    /admin/users                     [List users]
├─ PUT    /admin/users/:id                 [Update user]
├─ DELETE /admin/users/:id                 [Delete user]
├─ POST   /admin/roles                     [Create role]
├─ GET    /admin/roles                     [List roles]
├─ POST   /admin/permissions               [Create permission]
├─ GET    /admin/permissions               [List permissions]
└─ GET    /admin/dashboard/stats

Courier Agent Module:
├─ POST   /courier-agents/login            [Agent login]
├─ GET    /courier-agents/assigned         [Assigned shipments]
├─ PUT    /courier-agents/shipments/:id    [Update shipment status]
└─ POST   /courier-agents/qr-scan          [QR code scan]
```

---

## 🎯 Key Features & Capabilities

### ✅ Smart Automation
- Auto-generate Purchase Orders from Sales Orders
- Auto-update Sales Order status through workflow
- Auto-send notifications on status changes
- Auto-create Material Dispatch records
- Auto-link Production Orders to Shipments
- Auto-generate Invoices on shipment completion

### ✅ Real-Time Tracking
- Production Order progress (% completion)
- Shipment Live Tracking (GPS + Manual Updates)
- QR Code scanning by Courier Agents
- Material movement tracking
- Inventory level real-time updates

### ✅ Quality Management
- Multi-point Quality Checkpoints
- Material rejection handling
- Production stage quality tracking
- Vendor performance ratings
- Quality control dashboard

### ✅ Material Management
- Project-based stock allocation
- Material dispatch & receipt tracking
- Inventory reconciliation
- Low stock alerts
- Material consumption tracking
- Outsourced work material flow (Challans)

### ✅ Financial Integration
- Auto-invoice generation
- Payment tracking (multiple methods)
- Outstanding payment reports
- Revenue analytics

### ✅ Analytics & Reports
- Sales performance dashboards
- Production efficiency reports
- Vendor performance analytics
- Inventory movement reports
- Financial reports

### ✅ Role-Based Access
- Department-level isolation
- Permission-based feature access
- Admin approval workflows
- Manager dashboards with KPIs

---

## 📊 System Statistics

| Category | Count |
|----------|-------|
| **Database Tables** | 39 |
| **Backend Routes** | 21 Modules |
| **Frontend Pages** | 85+ Pages |
| **User Roles** | Configurable (Admin, Manager, User) |
| **Departments** | 11 (Sales, Procurement, Manufacturing, etc.) |
| **API Endpoints** | 80+ RESTful endpoints |
| **Notifications** | Real-time alerts on status changes |
| **Max Concurrent Users** | 10 (DB connection pool) |
| **Request Timeout** | 10 seconds |
| **Token Expiry** | 24 hours |

---

## 🚀 Technology Stack

### Frontend
```
Framework: React 18.2
Build Tool: Vite 5.4
Styling: Tailwind CSS 3.4
UI Components: Lucide React Icons
HTTP Client: Axios 1.6
State Management: React Hooks
Routing: React Router 6
Form Validation: Joi (frontend)
Notifications: React Hot Toast
```

### Backend
```
Runtime: Node.js
Framework: Express 4.18
ORM: Sequelize 6.35
Database: MySQL 8+
Authentication: JWT (jsonwebtoken)
Password Hashing: Bcrypt
Validation: Joi
Security: Helmet, CORS, Rate Limiting
Logging: Morgan
Compression: gzip
Error Handling: Global middleware
```

### DevOps
```
Frontend Dev Server: Vite (localhost:3000)
Backend Dev Server: Express (localhost:5000)
Database: AWS RDS MySQL
Process Manager: Nodemon (dev)
Package Manager: npm
Version Control: Git
```

---

## 📝 Data Validation & Security

- **Input Validation**: Joi schema validation on all inputs
- **SQL Injection Prevention**: Parameterized queries via Sequelize ORM
- **XSS Prevention**: React auto-escapes content
- **CSRF Protection**: Via same-site cookies
- **Rate Limiting**: 1000 requests per 15 minutes per IP
- **CORS**: Restricted to localhost:3000
- **Password Hashing**: bcrypt with salt rounds
- **HTTPS Ready**: Helmet headers configured

---

## 🔧 System Configuration

### Environment Variables (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=passion_erp
DB_USER=admin
DB_PASSWORD=C0digix$309
JWT_SECRET=passion_erp_super_secret_jwt_key_2024...
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Frontend Configuration
```
VITE_API_BASE_URL=/api (proxied via Vite dev server)
Production: http://localhost:5000/api
```

---

## 📞 Support & Maintenance

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Backend offline | Server not running | Run `npm start` in server directory |
| API 404 errors | Wrong endpoint | Check API_ENDPOINTS_REFERENCE.md |
| Database connection failed | RDS unreachable | Check AWS RDS security groups |
| Token expired | Session too long | Auto-logout implemented |
| CORS errors | Wrong origin | Verify CORS_ORIGIN in .env |

---

**System Ready for Production! 🎉**