# UX Enhancement Automation Script
# Applies compact design system to all pages in the Passion ERP

Write-Host "🎨 Starting UX Enhancement Process..." -ForegroundColor Cyan
Write-Host ""

# Define the pages directory
$pagesDir = "d:\projects\passion-clothing\client\src\pages"

# Function to apply enhancements to a file
function Apply-UXEnhancements {
    param (
        [string]$filePath
    )
    
    if (-not (Test-Path $filePath)) {
        Write-Host "  ⚠️  File not found: $filePath" -ForegroundColor Yellow
        return
    }
    
    Write-Host "  📄 Processing: $filePath" -ForegroundColor Gray
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    
    # Page padding: p-6 -> p-4
    $content = $content -replace 'className="p-6\s+bg-', 'className="p-4 bg-'
    
    # Section margins: mb-6 -> mb-4 or mb-3
    $content = $content -replace 'mb-6', 'mb-4'
    
    # Large titles: text-3xl -> text-2xl
    $content = $content -replace 'text-3xl font-bold', 'text-2xl font-bold'
    
    # Medium titles: text-xl -> text-lg
    $content = $content -replace 'text-xl font-semibold', 'text-lg font-semibold'
    $content = $content -replace 'text-xl font-bold', 'text-lg font-bold'
    
    # Descriptions: mt-1 after titles
    $content = $content -replace '(<p className="[^"]*text-gray-600[^"]*)">', '$1 text-sm" mt-0.5>'
    
    # Card padding: p-6 -> p-3 (for stat cards and smaller containers)
    $content = $content -replace '(className="[^"]*?)p-6([^"]*?border border-gray)', '$1p-3$2'
    
    # Border radius: rounded-lg -> rounded-md
    $content = $content -replace 'rounded-lg', 'rounded-md'
    
    # Primary buttons: px-4 py-2 -> px-3 py-1.5
    $content = $content -replace 'px-4 py-2 bg-blue-600', 'px-3 py-1.5 bg-blue-600 text-sm'
    $content = $content -replace 'px-4 py-2 bg-green-600', 'px-3 py-1.5 bg-green-600 text-sm'
    $content = $content -replace 'px-4 py-2 bg-red-600', 'px-3 py-1.5 bg-red-600 text-sm'
    $content = $content -replace 'px-4 py-2 bg-purple-600', 'px-3 py-1.5 bg-purple-600 text-sm'
    $content = $content -replace 'px-4 py-2 bg-indigo-600', 'px-3 py-1.5 bg-indigo-600 text-sm'
    
    # Secondary buttons: px-4 py-2 border -> px-2.5 py-1.5 border
    $content = $content -replace 'px-4 py-2 border border-gray', 'px-2.5 py-1.5 border border-gray text-xs'
    
    # Button gaps: gap-2 -> gap-1.5
    $content = $content -replace '(flex items-center )gap-2', '$1gap-1.5'
    
    # Large gaps: gap-6 -> gap-3
    $content = $content -replace 'gap-6', 'gap-3'
    $content = $content -replace 'gap-4', 'gap-2'
    
    # Table headers: px-4 py-3 -> px-2 py-2, add text-xs
    $content = $content -replace '(<th[^>]*?)px-4 py-3', '$1px-2 py-2 text-xs'
    
    # Table cells: px-4 py-3 -> px-2 py-2, add text-sm
    $content = $content -replace '(<td[^>]*?)px-4 py-3', '$1px-2 py-2 text-sm'
    
    # Form labels: text-sm mb-2 -> text-xs mb-1
    $content = $content -replace 'text-sm font-medium text-gray-700 mb-2', 'text-xs font-medium text-gray-700 mb-1'
    
    # Input fields: px-4 py-2 -> px-3 py-1.5, add text-sm
    $content = $content -replace '(input[^>]*?)px-4 py-2([^>]*?)>', '$1px-3 py-1.5 text-sm$2>'
    $content = $content -replace '(select[^>]*?)px-4 py-2([^>]*?)>', '$1px-3 py-1.5 text-sm$2>'
    
    # Search icon positioning: left-3 top-3 -> left-2.5 top-2.5
    $content = $content -replace 'left-3 top-3', 'left-2.5 top-2.5'
    
    # Icon sizes: className="text-sm" -> size={14}
    $content = $content -replace '<(Fa\w+) className="text-sm"', '<$1 size={14}'
    
    # Button icon sizes
    $content = $content -replace '<(Fa\w+)([^>]*?) className="text-xs"', '<$1$2 size={12}'
    
    # Action button padding: p-2 rounded-lg -> p-1.5 rounded-md
    $content = $content -replace 'p-2 rounded-lg bg-', 'p-1.5 rounded-md bg-'
    
    # Status badge padding: px-2 py-1 -> px-1.5 py-0.5
    $content = $content -replace '(badge|status)[^>]*?px-2 py-1', '$1 px-1.5 py-0.5'
    
    # Progress bar heights: h-2 -> h-1.5
    $content = $content -replace 'h-2 bg-gray-200 rounded-full', 'h-1.5 bg-gray-200 rounded-full'
    $content = $content -replace 'h-2 rounded-full bg-', 'h-1.5 rounded-full bg-'
    
    # Tab panel padding: p-6 -> p-4
    $content = $content -replace '(<div className=.p-6.>)(\{children\})', '<div className="p-4">$2'
    
    # Tab button padding: py-4 -> py-2.5, text-sm -> text-xs
    $content = $content -replace 'py-4 px-2 font-medium text-sm', 'py-2.5 px-2 font-medium text-xs'
    
    # Add transition-colors where missing
    $content = $content -replace '(hover:bg-[^"]+)(")', '$1 transition-colors$2'
    
    # Add transition-shadow for cards
    $content = $content -replace '(hover:shadow-md)(")', '$1 transition-shadow$2'
    
    # Only write if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "  ✅ Enhanced: $(Split-Path $filePath -Leaf)" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ⏭️  No changes needed" -ForegroundColor DarkGray
        return $false
    }
}

# Counter for tracking progress
$totalFiles = 0
$enhancedFiles = 0

# Process Dashboard pages
Write-Host "📊 Processing Dashboard Pages..." -ForegroundColor Cyan
$dashboardPages = @(
    "dashboards\ProcurementDashboard.jsx",
    "dashboards\ManufacturingDashboard.jsx",
    "dashboards\InventoryDashboard.jsx",
    "dashboards\ChallanDashboard.jsx",
    "dashboards\ShipmentDashboard.jsx",
    "dashboards\FinanceDashboard.jsx",
    "dashboards\StoreDashboard.jsx",
    "dashboards\SamplesDashboard.jsx",
    "dashboards\AdminDashboard.jsx",
    "dashboards\OutsourcingDashboard.jsx"
)

foreach ($page in $dashboardPages) {
    $fullPath = Join-Path $pagesDir $page
    $totalFiles++
    if (Apply-UXEnhancements -filePath $fullPath) {
        $enhancedFiles++
    }
}

# Process Sales module
Write-Host ""
Write-Host "💰 Processing Sales Module..." -ForegroundColor Cyan
$salesPages = @(
    "sales\SalesOrdersPage.jsx",
    "sales\CreateSalesOrderPage.jsx",
    "sales\OrderDetailsPage.jsx",
    "sales\SalesReportsPage.jsx"
)

foreach ($page in $salesPages) {
    $fullPath = Join-Path $pagesDir $page
    $totalFiles++
    if (Apply-UXEnhancements -filePath $fullPath) {
        $enhancedFiles++
    }
}

# Process Procurement module
Write-Host ""
Write-Host "🛒 Processing Procurement Module..." -ForegroundColor Cyan
$procurementPages = @(
    "procurement\PurchaseOrdersPage.jsx",
    "procurement\CreatePurchaseOrderPage.jsx",
    "procurement\PendingApprovalsPage.jsx",
    "procurement\MaterialRequestsPage.jsx",
    "procurement\ProductionRequestsPage.jsx",
    "procurement\VendorsPage.jsx",
    "procurement\VendorManagementPage.jsx",
    "procurement\GoodsReceiptPage.jsx"
)

foreach ($page in $procurementPages) {
    $fullPath = Join-Path $pagesDir $page
    $totalFiles++
    if (Apply-UXEnhancements -filePath $fullPath) {
        $enhancedFiles++
    }
}

# Process Manufacturing module
Write-Host ""
Write-Host "🏭 Processing Manufacturing Module..." -ForegroundColor Cyan
$manufacturingPages = @(
    "manufacturing\ProductionOrdersPage.jsx",
    "manufacturing\ProductionWizard.jsx",
    "manufacturing\ProductionTrackingPage.jsx",
    "manufacturing\ProductionOperationsView.jsx",
    "manufacturing\QualityControlPage.jsx",
    "manufacturing\MaterialReceiptPage.jsx",
    "manufacturing\StockVerificationPage.jsx",
    "manufacturing\ProductionApprovalPage.jsx"
)

foreach ($page in $manufacturingPages) {
    $fullPath = Join-Path $pagesDir $page
    $totalFiles++
    if (Apply-UXEnhancements -filePath $fullPath) {
        $enhancedFiles++
    }
}

# Process Inventory module
Write-Host ""
Write-Host "📦 Processing Inventory Module..." -ForegroundColor Cyan
$inventoryPages = @(
    "inventory\EnhancedInventoryDashboard.jsx",
    "inventory\StockManagementPage.jsx",
    "inventory\GoodsReceiptNotePage.jsx",
    "inventory\MRNRequestsPage.jsx",
    "inventory\StockAlertsPage.jsx",
    "inventory\ProductsPage.jsx",
    "inventory\ProductLifecyclePage.jsx",
    "inventory\POInventoryTrackingPage.jsx",
    "inventory\MaterialRequestReviewPage.jsx",
    "inventory\StockDispatchPage.jsx"
)

foreach ($page in $inventoryPages) {
    $fullPath = Join-Path $pagesDir $page
    $totalFiles++
    if (Apply-UXEnhancements -filePath $fullPath) {
        $enhancedFiles++
    }
}

# Process Challans module
Write-Host ""
Write-Host "📋 Processing Challans Module..." -ForegroundColor Cyan
$challanPages = @(
    "challan\ChallanRegisterPage.jsx",
    "challan\CreateChallanPage.jsx",
    "challan\ChallanDetailsPage.jsx"
)

foreach ($page in $challanPages) {
    $fullPath = Join-Path $pagesDir $page
    $totalFiles++
    if (Apply-UXEnhancements -filePath $fullPath) {
        $enhancedFiles++
    }
}

# Process Other modules
Write-Host ""
Write-Host "🔧 Processing Other Modules..." -ForegroundColor Cyan
$otherPages = @(
    "shipment\ShipmentTrackingPage.jsx",
    "samples\SamplesManagementPage.jsx",
    "store\StoreStockManagementPage.jsx",
    "finance\InvoiceManagementPage.jsx",
    "finance\PaymentTrackingPage.jsx",
    "admin\UserManagementPage.jsx",
    "admin\RoleManagementPage.jsx",
    "AttendancePage.jsx"
)

foreach ($page in $otherPages) {
    $fullPath = Join-Path $pagesDir $page
    $totalFiles++
    if (Apply-UXEnhancements -filePath $fullPath) {
        $enhancedFiles++
    }
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ UX Enhancement Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Total files processed: $totalFiles" -ForegroundColor White
Write-Host "Files enhanced: $enhancedFiles" -ForegroundColor Green
Write-Host "Files unchanged: $($totalFiles - $enhancedFiles)" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review the changes in your IDE" -ForegroundColor White
Write-Host "  2. Test the application: npm start" -ForegroundColor White
Write-Host "  3. Check responsive design on mobile" -ForegroundColor White
Write-Host "  4. Verify readability and usability" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation: UX_ENHANCEMENT_COMPACT_DESIGN.md" -ForegroundColor Yellow
Write-Host ""