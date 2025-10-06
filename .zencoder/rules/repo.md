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
- **Routes**: `/api/auth, /api/users, /api/roles, /api/challans, /api/sales, /api/procurement, /api/inventory, /api/manufacturing, /api/outsourcing, /api/shipments, /api/store, /api/finance, /api/reports, /api/admin, /api/samples`
- **Models**: User, Role, Permission, SalesOrder, PurchaseOrder, Challan, Inventory, ProductionOrder, ProductionStage, Rejection, Shipment, StoreStock, Invoice, Payment, Vendor, Customer, Product, Sample, Attendance
- **Security**: CORS, Helmet, rate limiting, compression, morgan
- **DB**: MySQL via Sequelize; `sequelize.sync({ alter: true })` on start

## Recent Enhancements
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