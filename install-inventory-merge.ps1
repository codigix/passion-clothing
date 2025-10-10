# Inventory & Product Merge - One-Command Installation
# Run this script to complete the entire setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Inventory & Product Merge Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Backend Dependencies
Write-Host "Step 1/4: Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "d:\Projects\passion-inventory\server"
npm install bwip-js
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Install Frontend Dependencies
Write-Host "Step 2/4: Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location "d:\Projects\passion-inventory\client"
npm install react-barcode
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Run Database Migration
Write-Host "Step 3/4: Running database migration..." -ForegroundColor Yellow
Set-Location "d:\Projects\passion-inventory\server"
node scripts/runMergeProductsInventory.js
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database migration completed" -ForegroundColor Green
} else {
    Write-Host "❌ Migration failed - Please check database connection" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Summary
Write-Host "Step 4/4: Installation Summary" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 What was installed:" -ForegroundColor White
Write-Host "   ✅ bwip-js (backend barcode generation)" -ForegroundColor Gray
Write-Host "   ✅ react-barcode (frontend barcode display)" -ForegroundColor Gray
Write-Host "   ✅ Database migration (products → inventory)" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor White
Write-Host "   1. Start the server: cd d:\Projects\passion-inventory; npm run dev" -ForegroundColor Gray
Write-Host "   2. Open browser: http://localhost:3000/inventory" -ForegroundColor Gray
Write-Host "   3. Test the new features!" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor White
Write-Host "   - Quick Start: INVENTORY_MERGE_QUICKSTART.md" -ForegroundColor Gray
Write-Host "   - Full Guide: INVENTORY_PRODUCT_MERGE_COMPLETE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")