import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage.jsx';
import DashboardLayout from './components/layout/DashboardLayout';

// Department Dashboards
import SalesDashboard from './pages/dashboards/SalesDashboard';
import ProcurementDashboard from './pages/dashboards/ProcurementDashboard';
import ChallanDashboard from './pages/dashboards/ChallanDashboard';
import InventoryDashboard from './pages/dashboards/InventoryDashboard';
import ManufacturingDashboard from './pages/dashboards/ManufacturingDashboard';
import OutsourcingDashboard from './pages/dashboards/OutsourcingDashboard';
import SamplesDashboard from './pages/dashboards/SamplesDashboard';
import ShipmentDashboard from './pages/dashboards/ShipmentDashboard';
import ShipmentDispatchPage from './pages/shipment/ShipmentDispatchPage';
import ShipmentTrackingPage from './pages/shipment/ShipmentTrackingPage';
import ShipmentReportsPage from './pages/shipment/ShipmentReportsPage';
import ShippingDashboardPage from './pages/shipment/ShippingDashboardPage';
import StoreDashboard from './pages/dashboards/StoreDashboard';
import FinanceDashboard from './pages/dashboards/FinanceDashboard';
import FinanceInvoicesPage from './pages/finance/FinanceInvoicesPage';
import FinancePaymentsPage from './pages/finance/FinancePaymentsPage';
import FinanceReportsPage from './pages/finance/FinanceReportsPage';
import AdminDashboard from './pages/dashboards/AdminDashboard';

// Samples Pages
import SamplesOrdersPage from './pages/samples/SamplesOrdersPage';
import SamplesTrackingPage from './pages/samples/SamplesTrackingPage';
import SamplesReportsPage from './pages/samples/SamplesReportsPage';
import SamplesConversionPage from './pages/samples/SamplesConversionPage';
import SamplesCreateRequestPage from './pages/samples/SamplesCreateRequestPage';

// Common Pages
import ProfilePage from './pages/ProfilePage';
import AttendancePage from './pages/AttendancePage';
import NotificationsPage from './pages/NotificationsPage';
import DevToolsPage from './pages/DevToolsPage';

// Sales Pages
import SalesOrdersPage from './pages/sales/SalesOrdersPage';
import SalesOrderDetailsPage from './pages/sales/SalesOrderDetailsPage';
import CreateSalesOrderPage from './pages/sales/CreateSalesOrderPage';
import SalesReportsPage from './pages/sales/SalesReportsPage';

// Procurement Pages
import PurchaseOrdersPage from './pages/procurement/PurchaseOrdersPage';
import PurchaseOrderDetailsPage from './pages/procurement/PurchaseOrderDetailsPage';
import CreatePurchaseOrderPage from './pages/procurement/CreatePurchaseOrderPage';
import PurchaseOrderForm from './pages/PurchaseOrderForm';
import BillOfMaterialsPage from './pages/procurement/BillOfMaterialsPage';
import VendorsPage from './pages/procurement/VendorsPage';
import VendorManagementPage from './pages/procurement/VendorManagementPage';
import ProcurementReportsPage from './pages/procurement/ProcurementReportsPage';
import GoodsReceiptPage from './pages/procurement/GoodsReceiptPage';
import VendorPerformancePage from './pages/procurement/VendorPerformancePage';
import PendingApprovalsPage from './pages/procurement/PendingApprovalsPage';

// Challan Pages
import ChallanRegisterPage from './pages/challans/ChallanRegisterPage';
import CreateChallanPage from './pages/challans/CreateChallanPage';

// Inventory Pages
import StockManagementPage from './pages/inventory/StockManagementPage';
import StockAlertsPage from './pages/inventory/StockAlertsPage';
import InventoryReportsPage from './pages/inventory/InventoryReportsPage';
import ProductsPage from './pages/inventory/ProductsPage';
import ProductBarcodeLookup from './components/ProductBarcodeLookup';
import ProductLifecyclePage from './pages/inventory/ProductLifecyclePage';
import GoodsReceiptNotePage from './pages/inventory/GoodsReceiptNotePage';
import CreateGRNPage from './pages/inventory/CreateGRNPage';
import UpdateGRNPage from './pages/inventory/UpdateGRNPage';
import GRNVerificationPage from './pages/inventory/GRNVerificationPage';
import AddGRNToInventoryPage from './pages/inventory/AddGRNToInventoryPage';
import POInventoryTrackingPage from './pages/inventory/POInventoryTrackingPage';

// Manufacturing Pages
import ProductionOrdersPage from './pages/manufacturing/ProductionOrdersPage';
import ProductionTrackingPage from './pages/manufacturing/ProductionTrackingPage';
import QualityControlPage from './pages/manufacturing/QualityControlPage';
import ManufacturingReportsPage from './pages/manufacturing/ManufacturingReportsPage';
import ProductionWizardPage from './pages/manufacturing/ProductionWizardPage';
import ProductionDashboardPage from './pages/manufacturing/ProductionDashboardPage';

// Admin Pages
import UserManagementPage from './pages/admin/UserManagementPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import SystemConfigPage from './pages/admin/SystemConfigPage.jsx';

// Store Pages
import StoreReturnsPage from './pages/store/StoreReturnsPage';
import StoreStockManagementPage from './pages/store/StoreStockManagementPage';

function App() {
  const { user, loading, canAccessDepartment } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Protected Route Wrapper
  const ProtectedDashboard = ({ department, children }) => {
    if (!canAccessDepartment(department)) {
      return <Navigate to={`/${user.department}/dashboard`} replace />;
    }
    return children;
  };

  return (
    <DashboardLayout>
      <Routes>
        {/* Dashboard Routes based on Department */}
        <Route path="/" element={<Navigate to={`/${user.department}/dashboard`} replace />} />
        
        {/* Department root routes for sidebar navigation */}
        <Route path="/sales" element={<ProtectedDashboard department="sales"><SalesDashboard /></ProtectedDashboard>} />
        <Route path="/procurement" element={<ProtectedDashboard department="procurement"><ProcurementDashboard /></ProtectedDashboard>} />
        <Route path="/challans" element={<ProtectedDashboard department="challans"><ChallanDashboard /></ProtectedDashboard>} />
        <Route path="/inventory" element={<ProtectedDashboard department="inventory"><InventoryDashboard /></ProtectedDashboard>} />
        <Route path="/manufacturing" element={<ProtectedDashboard department="manufacturing"><ManufacturingDashboard /></ProtectedDashboard>} />
        <Route path="/outsourcing" element={<ProtectedDashboard department="outsourcing"><OutsourcingDashboard /></ProtectedDashboard>} />
        <Route path="/samples" element={<ProtectedDashboard department="samples"><SamplesDashboard /></ProtectedDashboard>} />
        <Route path="/shipment" element={<ProtectedDashboard department="shipment"><ShipmentDashboard /></ProtectedDashboard>} />
        <Route path="/store" element={<ProtectedDashboard department="store"><StoreDashboard /></ProtectedDashboard>} />
        <Route path="/finance" element={<ProtectedDashboard department="finance"><FinanceDashboard /></ProtectedDashboard>} />
        <Route path="/admin" element={<ProtectedDashboard department="admin"><AdminDashboard /></ProtectedDashboard>} />
        
        {/* Dashboard sub-routes */}
        <Route path="/sales/dashboard" element={<ProtectedDashboard department="sales"><SalesDashboard /></ProtectedDashboard>} />
        <Route path="/procurement/dashboard" element={<ProtectedDashboard department="procurement"><ProcurementDashboard /></ProtectedDashboard>} />
        <Route path="/challans/dashboard" element={<ProtectedDashboard department="challans"><ChallanDashboard /></ProtectedDashboard>} />
        <Route path="/inventory/dashboard" element={<ProtectedDashboard department="inventory"><InventoryDashboard /></ProtectedDashboard>} />
        <Route path="/manufacturing/dashboard" element={<ProtectedDashboard department="manufacturing"><ManufacturingDashboard /></ProtectedDashboard>} />
        <Route path="/outsourcing/dashboard" element={<ProtectedDashboard department="outsourcing"><OutsourcingDashboard /></ProtectedDashboard>} />
        <Route path="/samples/dashboard" element={<ProtectedDashboard department="samples"><SamplesDashboard /></ProtectedDashboard>} />
        <Route path="/shipment/dashboard" element={<ProtectedDashboard department="shipment"><ShipmentDashboard /></ProtectedDashboard>} />
        <Route path="/store/dashboard" element={<ProtectedDashboard department="store"><StoreDashboard /></ProtectedDashboard>} />
        <Route path="/finance/dashboard" element={<ProtectedDashboard department="finance"><FinanceDashboard /></ProtectedDashboard>} />
        <Route path="/admin/dashboard" element={<ProtectedDashboard department="admin"><AdminDashboard /></ProtectedDashboard>} />

        {/* Sales Routes */}
        <Route path="/sales/orders" element={<SalesOrdersPage />} />
        <Route path="/sales/orders/create" element={<CreateSalesOrderPage />} />
        <Route path="/sales/orders/:id" element={<SalesOrderDetailsPage />} />
        <Route path="/sales/reports" element={<SalesReportsPage />} />

        {/* Procurement Routes */}
        <Route path="/procurement/pending-approvals" element={<PendingApprovalsPage />} />
        <Route path="/procurement/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="/procurement/purchase-orders/create" element={<CreatePurchaseOrderPage />} />
        <Route path="/procurement/purchase-orders/:id" element={<PurchaseOrderDetailsPage />} />
        <Route path="/procurement/vendors" element={<VendorsPage />} />
        <Route path="/procurement/vendor-management" element={<VendorManagementPage />} />
        <Route path="/procurement/bill-of-materials" element={<BillOfMaterialsPage />} />
        <Route path="/procurement/goods-receipt" element={<GoodsReceiptPage />} />
        <Route path="/procurement/vendor-performance" element={<VendorPerformancePage />} />
        <Route path="/procurement/reports" element={<ProcurementReportsPage />} />

        {/* Challan Routes */}
        <Route path="/challans/register" element={<ChallanRegisterPage />} />
        <Route path="/challans/create" element={<CreateChallanPage />} />

        {/* Inventory Routes */}
        <Route path="/inventory/products" element={<ProductsPage />} />
        <Route path="/inventory/barcode-lookup" element={<ProductBarcodeLookup />} />
        <Route path="/inventory/lifecycle" element={<ProductLifecyclePage />} />
        <Route path="/inventory/stock" element={<StockManagementPage />} />
        <Route path="/inventory/alerts" element={<StockAlertsPage />} />
        <Route path="/inventory/grn" element={<GoodsReceiptNotePage />} />
        <Route path="/inventory/grn/create" element={<CreateGRNPage />} />
        <Route path="/inventory/grn/update/:id" element={<UpdateGRNPage />} />
        <Route path="/inventory/grn/:id/verify" element={<GRNVerificationPage />} />
        <Route path="/inventory/grn/:id/add-to-inventory" element={<AddGRNToInventoryPage />} />
        <Route path="/inventory/goods-receipt" element={<GoodsReceiptNotePage />} />
        <Route path="/inventory/from-po/:poId" element={<POInventoryTrackingPage />} />
        <Route path="/inventory/reports" element={<InventoryReportsPage />} />

        {/* Manufacturing Routes */}
        <Route path="/manufacturing/orders" element={<ProductionOrdersPage />} />
        <Route path="/manufacturing/tracking" element={<ProductionTrackingPage />} />
        <Route path="/manufacturing/quality" element={<QualityControlPage />} />
        <Route path="/manufacturing/wizard" element={<ProductionWizardPage />} />
        <Route path="/manufacturing/dashboard" element={<ProductionDashboardPage />} />
        <Route path="/manufacturing/reports" element={<ManufacturingReportsPage />} />

        {/* Outsourcing Routes */}
        <Route path="/outsourcing/outward" element={<div>Outward Challans Page</div>} />
        <Route path="/outsourcing/inward" element={<div>Inward Challans Page</div>} />
        <Route path="/outsourcing/tracking" element={<div>Vendor Tracking Page</div>} />

        {/* Samples Routes */}
        <Route path="/samples/orders" element={<SamplesOrdersPage />} />
        <Route path="/samples/tracking" element={<SamplesTrackingPage />} />
        <Route path="/samples/reports" element={<SamplesReportsPage />} />
        <Route path="/samples/conversion" element={<SamplesConversionPage />} />
        <Route path="/samples/create" element={<SamplesCreateRequestPage />} />

        {/* Shipment Routes */}
        <Route path="/shipment/dispatch" element={<ShipmentDispatchPage />} />
        <Route path="/shipment/tracking" element={<ShipmentTrackingPage />} />
        <Route path="/shipment/reports" element={<ShipmentReportsPage />} />

        {/* Store Routes */}
        <Route path="/store/stock" element={<StoreStockManagementPage />} />
        <Route path="/store/sales" element={<div>Store Sales Page</div>} />
        <Route path="/store/returns" element={<StoreReturnsPage />} />
        <Route path="/store/reports" element={<div>Store Reports Page</div>} />

        {/* Finance Routes */}
        <Route path="/finance/invoices" element={<FinanceInvoicesPage />} />
        <Route path="/finance/payments" element={<FinancePaymentsPage />} />
        <Route path="/finance/reports" element={<FinanceReportsPage />} />

        {/* Admin Routes */}
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/roles" element={<RoleManagementPage />} />
        <Route path="/admin/config" element={<SystemConfigPage />} />

        {/* Common Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/devtools" element={<DevToolsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;