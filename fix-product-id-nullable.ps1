# Fix: Make product_id optional in production_orders
# This script updates the database to allow NULL product_id values
# Run this from the project root directory: .\fix-product-id-nullable.ps1

Write-Host "🔧 Fixing product_id constraint in production_orders table..." -ForegroundColor Cyan
Write-Host ""

# Run the Node.js fix script
node "d:\projects\passion-clothing\fix-product-id-nullable.js"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Fix applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now create production orders without selecting a product." -ForegroundColor Green
    Write-Host "Materials will be fetched from the Material Request Number (MRN) instead." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Fix failed. Please check the error messages above." -ForegroundColor Red
}