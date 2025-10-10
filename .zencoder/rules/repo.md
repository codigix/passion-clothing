# Passion ERP System — Repository Overview

## Summary
- **Stack**: React 18 + MUI 5 (client), Node.js + Express + Sequelize (MySQL) (server)
- **Auth**: JWT via `AuthContext` on client and `authenticateToken` middleware on server
- **Data**: Sequelize models with associations defined in `server/config/database.js`
- **Routing**: Client `react-router-dom@6`; Server under `/api/*`
- **State/Fetch**: react-query with axios instance at `client/src/utils/api.js`

## Client
- **Entry**: `client/src/index.js` → `App.js`
- **Layout**: `components/layout/DashboardLayout.js`, `Sidebar.js`
- **Auth**: `contexts/AuthContext.js`
- **Common Pages**: Login, Registration, Profile, Attendance, Notifications
- **Modules**:
  - **Sales**: orders, create order, reports
  - **Procurement**: purchase orders, vendors, reports
  - **Challans**: register, create
  - **Inventory**: stock, alerts, reports
  - **Manufacturing**: orders, tracking, quality, reports
  - **Admin**: users, roles, config
- **Utilities**: `utils/api.js` axios client (dev proxy → http://localhost:5000)

## Server
- **Entry**: `server/index.js`
- **Routes**: `/api/auth, /api/users, /api/roles, /api/challans, /api/sales, /api/procurement, /api/inventory, /api/manufacturing, /api/outsourcing, /api/shipments, /api/store, /api/finance, /api/reports, /api/admin, /api/samples, /api/production-requests`
- **Models**: User, Role, Permission, SalesOrder, PurchaseOrder, Challan, Inventory, ProductionOrder, ProductionRequest, ProductionStage, Rejection, Shipment, StoreStock, Invoice, Payment, Vendor, Customer, Product, Sample, Attendance
- **Security**: CORS, Helmet, rate limiting, compression, morgan
- **DB**: MySQL via Sequelize; Migrations-based schema management

## Recent Enhancements
- **Production Wizard Permission Fix**: Removed page-level permission gate blocking access (Jan 2025) ⭐ NEW
  - Wizard now accessible to all manufacturing users
  - Permission check only on submit button, not entire page
  - Clear visual warnings and disabled state if user lacks permission
  - Matches pattern used by other manufacturing pages
  - See: `PRODUCTION_WIZARD_PERMISSION_FIX.md`, `PRODUCTION_WIZARD_QUICK_FIX.md`, `GRANT_WIZARD_PERMISSION.sql`
- **Inventory-Product Merge**: Complete unification of Products into Inventory (Jan 2025)
  - Removed separate Products section from frontend navigation and routes
  - All product management now in unified EnhancedInventoryDashboard
  - Project-based stock tracking with Sales Order linkage
  - Auto-generated barcodes for all inventory items
  - Tab-based UI: All Stock | Factory Stock | Project Stock
  - Send to manufacturing with permanent stock deduction
  - ProjectMaterialDashboard for detailed project tracking
  - Complete stock history and audit trail
  - See: `INVENTORY_PRODUCT_MERGE_COMPLETE.md`, `FRONTEND_PRODUCTS_REMOVAL_SUMMARY.md`, `INVENTORY_MERGE_QUICKSTART.md`
- **PO Status Update & Notifications**: Enhanced PO creation workflow with instant feedback (Jan 2025) ⭐ NEW
  - Auto-updates Sales Order status to 'procurement_created' after PO creation
  - Saves bidirectional link between PurchaseOrder and SalesOrder (`linked_sales_order_id`)
  - Sends notifications to Sales and Procurement departments
  - Auto-navigates to dashboard after PO creation with success message
  - Shows "PO Created ✓" badge in dashboard immediately (green, clickable)
  - Lifecycle history tracking for audit trail
  - See: `PO_STATUS_UPDATE_ENHANCEMENT.md`, `PO_STATUS_QUICK_REFERENCE.md`
- **MRN to Production Flow System**: Complete Material Dispatch & Verification workflow (Jan 2025) ⭐ NEW
  - 4 new tables: material_dispatches, material_receipts, material_verifications, production_approvals
  - Complete flow: MRN → Dispatch → Receipt → Verification → Approval → Production
  - Stock dispatch from inventory with barcode tracking and inventory deduction
  - Material receipt in manufacturing with discrepancy reporting
  - QC verification with detailed checklist (quantity, quality, specs, damage, barcode)
  - Production approval by manager (approve/reject/conditional)
  - 4 new frontend pages: StockDispatchPage, MaterialReceiptPage, StockVerificationPage, ProductionApprovalPage
  - Photo upload support at each stage for audit trail
  - Automatic notifications and inventory movements integration
  - See: `MRN_FLOW_IMPLEMENTATION_COMPLETE.md`, `MRN_FLOW_QUICK_START.md`, `MRN_TO_PRODUCTION_COMPLETE_FLOW.md`
- **Production Request System**: Complete Sales → Manufacturing workflow (Jan 2025)
  - Standalone endpoint: `POST /api/sales/orders/:id/request-production`
  - Production request table with full sales order and purchase order support
  - Unique request numbers (PRQ-YYYYMMDD-XXXXX format)
  - Status tracking through full manufacturing lifecycle
  - Manufacturing receives automatic notifications
  - Supports both Sales Order and Purchase Order originated requests
  - See: `ERROR_FIX_PRODUCTION_REQUESTS.md`, `PRODUCTION_REQUESTS_TABLE_FIX_COMPLETE.md`
- **GRN Workflow**: Complete Goods Receipt Note + Verification workflow implemented (Jan 2025)
  - PO Approval → GRN Creation → Verification → Discrepancy Handling → Inventory Addition
  - Quality control checks, discrepancy management, full traceability
  - New pages: CreateGRNPage, GRNVerificationPage, AddGRNToInventoryPage
  - Modified PO approval to NOT add to inventory directly
  - See: `GRN_WORKFLOW_COMPLETE_GUIDE.md`
- **Purchase Orders**: Enhanced with customer selection, project name, and product autocomplete (Jan 2025)
- **Vendors Management**: Complete CRUD operations with advanced filtering and modern UI (Jan 2025)

## Gaps / Next Work
- **Products API**: No `/api/products` CRUD routes found; Product model exists (auto-created via GRN now)
- **Operations Execution**: Manufacturing operations flow requires confirmation of scope
- **GRN Photo Upload**: Add ability to attach photos during GRN creation
- **GRN Mobile**: Mobile app for GRN creation on warehouse floor

## Dev Scripts
- Root: `dev` runs server+client; `install-all` installs both
- Client: `start` CRA dev server; proxy to `http://localhost:5000`

## Testing
- **Framework**: Playwright for end-to-end testing
- **Test Location**: `tests/e2e/`
- **Configuration**: `playwright.config.ts`
- **Run Tests**: `npx playwright test`
- **Test Reports**: Available in `test-results/` and `playwright-report/`

## Env
- Client `.env(.example)` and Server `.env(.example)` present

---
Maintained by Zencoder assistant. Update as architecture evolves.