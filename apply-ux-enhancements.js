#!/usr/bin/env node
/**
 * UX Enhancement Automation Script
 * Applies compact design system to all pages in the Passion ERP
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Starting UX Enhancement Process...\n');

const pagesDir = path.join(__dirname, 'client', 'src', 'pages');

// Function to apply enhancements to a file
function applyUXEnhancements(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File not found: ${filePath}`);
    return false;
  }

  console.log(`  📄 Processing: ${path.basename(filePath)}`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Page padding: p-6 -> p-4
  content = content.replace(/className="p-6\s+bg-/g, 'className="p-4 bg-');

  // Section margins: mb-6 -> mb-4
  content = content.replace(/\bmb-6\b/g, 'mb-4');

  // Large titles: text-3xl -> text-2xl
  content = content.replace(/text-3xl font-bold/g, 'text-2xl font-bold');

  // Medium titles: text-xl -> text-lg
  content = content.replace(/text-xl font-semibold/g, 'text-lg font-semibold');
  content = content.replace(/text-xl font-bold/g, 'text-lg font-bold');

  // Card padding: p-6 -> p-3 (for cards with borders)
  content = content.replace(/(className="[^"]*?)p-6([^"]*?border border-gray)/g, '$1p-3$2');

  // Border radius: rounded-lg -> rounded-md
  content = content.replace(/\brounded-lg\b/g, 'rounded-md');

  // Primary buttons with background color
  content = content.replace(/px-4 py-2 bg-blue-600/g, 'px-3 py-1.5 bg-blue-600 text-sm');
  content = content.replace(/px-4 py-2 bg-green-600/g, 'px-3 py-1.5 bg-green-600 text-sm');
  content = content.replace(/px-4 py-2 bg-red-600/g, 'px-3 py-1.5 bg-red-600 text-sm');
  content = content.replace(/px-4 py-2 bg-purple-600/g, 'px-3 py-1.5 bg-purple-600 text-sm');
  content = content.replace(/px-4 py-2 bg-indigo-600/g, 'px-3 py-1.5 bg-indigo-600 text-sm');

  // Secondary buttons with borders
  content = content.replace(/px-4 py-2 border border-gray/g, 'px-2.5 py-1.5 border border-gray text-xs');

  // Button gaps
  content = content.replace(/(flex items-center )gap-2/g, '$1gap-1.5');

  // Large gaps
  content = content.replace(/\bgap-6\b/g, 'gap-3');
  content = content.replace(/\bgap-4\b/g, 'gap-2');

  // Table headers
  content = content.replace(/(<th[^>]*?)px-4 py-3/g, '$1px-2 py-2 text-xs');

  // Table cells
  content = content.replace(/(<td[^>]*?)px-4 py-3/g, '$1px-2 py-2');

  // Form labels
  content = content.replace(/text-sm font-medium text-gray-700 mb-2/g, 'text-xs font-medium text-gray-700 mb-1');

  // Search icon positioning
  content = content.replace(/left-3 top-3/g, 'left-2.5 top-2.5');

  // Action button padding
  content = content.replace(/p-2 rounded-md bg-/g, 'p-1.5 rounded-md bg-');

  // Status badge padding
  content = content.replace(/px-2 py-1 rounded-full/g, 'px-1.5 py-0.5 rounded-full');

  // Progress bar heights
  content = content.replace(/h-2 bg-gray-200 rounded-full/g, 'h-1.5 bg-gray-200 rounded-full');
  content = content.replace(/h-2 rounded-full bg-/g, 'h-1.5 rounded-full bg-');

  // Tab button padding
  content = content.replace(/py-4 px-2 font-medium text-sm/g, 'py-2.5 px-2 font-medium text-xs');

  // Add transition classes where missing in hover states
  content = content.replace(/(hover:bg-[a-z]+-[0-9]+)(\s+")/g, '$1 transition-colors$2');
  content = content.replace(/(hover:shadow-md)(\s+")/g, '$1 transition-shadow$2');

  // Icon sizes - convert className to size prop for lucide icons
  content = content.replace(/<([\w]+)(\s+[^>]*?)className="w-4 h-4"/g, '<$1$2size={14}');
  content = content.replace(/<([\w]+)(\s+[^>]*?)className="w-5 h-5"/g, '<$1$2size={16}');

  // Only write if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Enhanced: ${path.basename(filePath)}`);
    return true;
  } else {
    console.log(`  ⏭️  No changes needed`);
    return false;
  }
}

// Process files
let totalFiles = 0;
let enhancedFiles = 0;

const dashboardPages = [
  'dashboards/ProcurementDashboard.jsx',
  'dashboards/ManufacturingDashboard.jsx',
  'dashboards/InventoryDashboard.jsx',
  'dashboards/ChallanDashboard.jsx',
  'dashboards/ShipmentDashboard.jsx',
  'dashboards/FinanceDashboard.jsx',
  'dashboards/StoreDashboard.jsx',
  'dashboards/SamplesDashboard.jsx',
  'dashboards/AdminDashboard.jsx',
  'dashboards/OutsourcingDashboard.jsx'
];

console.log('📊 Processing Dashboard Pages...');
dashboardPages.forEach(page => {
  const fullPath = path.join(pagesDir, page);
  totalFiles++;
  if (applyUXEnhancements(fullPath)) {
    enhancedFiles++;
  }
});

const salesPages = [
  'sales/SalesOrdersPage.jsx',
  'sales/CreateSalesOrderPage.jsx',
  'sales/OrderDetailsPage.jsx',
  'sales/SalesReportsPage.jsx'
];

console.log('\n💰 Processing Sales Module...');
salesPages.forEach(page => {
  const fullPath = path.join(pagesDir, page);
  totalFiles++;
  if (applyUXEnhancements(fullPath)) {
    enhancedFiles++;
  }
});

const procurementPages = [
  'procurement/PurchaseOrdersPage.jsx',
  'procurement/CreatePurchaseOrderPage.jsx',
  'procurement/PendingApprovalsPage.jsx',
  'procurement/MaterialRequestsPage.jsx',
  'procurement/ProductionRequestsPage.jsx',
  'procurement/VendorsPage.jsx',
  'procurement/VendorManagementPage.jsx',
  'procurement/GoodsReceiptPage.jsx'
];

console.log('\n🛒 Processing Procurement Module...');
procurementPages.forEach(page => {
  const fullPath = path.join(pagesDir, page);
  totalFiles++;
  if (applyUXEnhancements(fullPath)) {
    enhancedFiles++;
  }
});

const manufacturingPages = [
  'manufacturing/ProductionOrdersPage.jsx',
  'manufacturing/ProductionWizard.jsx',
  'manufacturing/ProductionTrackingPage.jsx',
  'manufacturing/ProductionOperationsView.jsx',
  'manufacturing/QualityControlPage.jsx',
  'manufacturing/MaterialReceiptPage.jsx',
  'manufacturing/StockVerificationPage.jsx',
  'manufacturing/ProductionApprovalPage.jsx'
];

console.log('\n🏭 Processing Manufacturing Module...');
manufacturingPages.forEach(page => {
  const fullPath = path.join(pagesDir, page);
  totalFiles++;
  if (applyUXEnhancements(fullPath)) {
    enhancedFiles++;
  }
});

const inventoryPages = [
  'inventory/EnhancedInventoryDashboard.jsx',
  'inventory/StockManagementPage.jsx',
  'inventory/GoodsReceiptNotePage.jsx',
  'inventory/MRNRequestsPage.jsx',
  'inventory/StockAlertsPage.jsx',
  'inventory/ProductsPage.jsx',
  'inventory/ProductLifecyclePage.jsx',
  'inventory/POInventoryTrackingPage.jsx',
  'inventory/MaterialRequestReviewPage.jsx',
  'inventory/StockDispatchPage.jsx',
  'inventory/ProjectMaterialDashboard.jsx'
];

console.log('\n📦 Processing Inventory Module...');
inventoryPages.forEach(page => {
  const fullPath = path.join(pagesDir, page);
  totalFiles++;
  if (applyUXEnhancements(fullPath)) {
    enhancedFiles++;
  }
});

const challanPages = [
  'challan/ChallanRegisterPage.jsx',
  'challan/CreateChallanPage.jsx',
  'challan/ChallanDetailsPage.jsx'
];

console.log('\n📋 Processing Challans Module...');
challanPages.forEach(page => {
  const fullPath = path.join(pagesDir, page);
  totalFiles++;
  if (applyUXEnhancements(fullPath)) {
    enhancedFiles++;
  }
});

const otherPages = [
  'shipment/ShipmentTrackingPage.jsx',
  'samples/SamplesManagementPage.jsx',
  'store/StoreStockManagementPage.jsx',
  'finance/InvoiceManagementPage.jsx',
  'finance/PaymentTrackingPage.jsx',
  'admin/UserManagementPage.jsx',
  'admin/RoleManagementPage.jsx',
  'AttendancePage.jsx',
  'ProfilePage.jsx'
];

console.log('\n🔧 Processing Other Modules...');
otherPages.forEach(page => {
  const fullPath = path.join(pagesDir, page);
  totalFiles++;
  if (applyUXEnhancements(fullPath)) {
    enhancedFiles++;
  }
});

// Summary
console.log('\n═══════════════════════════════════════');
console.log('✨ UX Enhancement Complete!');
console.log('═══════════════════════════════════════');
console.log(`Total files processed: ${totalFiles}`);
console.log(`Files enhanced: ${enhancedFiles}`);
console.log(`Files unchanged: ${totalFiles - enhancedFiles}`);
console.log('');
console.log('📝 Next Steps:');
console.log('  1. Review the changes in your IDE');
console.log('  2. Test the application');
console.log('  3. Check responsive design on mobile');
console.log('  4. Verify readability and usability');
console.log('');
console.log('📚 Documentation: UX_ENHANCEMENT_COMPACT_DESIGN.md');
console.log('');