# ================================================================
# COMPLETE DATABASE RESET SCRIPT
# ================================================================
# This script will:
# 1. Create a full database backup
# 2. Truncate all tables (DELETE ALL DATA)
# 3. Optionally run seeders to create admin user
# 4. Restart the server
# ================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Red
Write-Host "⚠️  COMPLETE DATABASE RESET" -ForegroundColor Red
Write-Host "================================================================" -ForegroundColor Red
Write-Host "This will DELETE ALL DATA from ALL tables including:" -ForegroundColor Yellow
Write-Host "  ❌ All user accounts" -ForegroundColor Yellow
Write-Host "  ❌ All sales orders" -ForegroundColor Yellow
Write-Host "  ❌ All purchase orders" -ForegroundColor Yellow
Write-Host "  ❌ All production requests" -ForegroundColor Yellow
Write-Host "  ❌ All inventory items" -ForegroundColor Yellow
Write-Host "  ❌ All customers, vendors, products" -ForegroundColor Yellow
Write-Host "  ❌ EVERYTHING in the database" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Red
Write-Host ""

# Ask for MySQL password
$mysqlPassword = Read-Host "Enter MySQL root password" -AsString
if ([string]::IsNullOrWhiteSpace($mysqlPassword)) {
    Write-Host "❌ Password required. Exiting..." -ForegroundColor Red
    exit 1
}

# Test MySQL connection
Write-Host ""
Write-Host "🔍 Testing MySQL connection..." -ForegroundColor Cyan
$testResult = echo "SELECT 1;" | mysql -u root -p$mysqlPassword passion_erp 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ MySQL connection failed. Check password and database." -ForegroundColor Red
    exit 1
}
Write-Host "✅ MySQL connection successful" -ForegroundColor Green

# Create backup
Write-Host ""
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup_before_reset_$timestamp.sql"
Write-Host "📦 Creating full database backup..." -ForegroundColor Cyan
Write-Host "   Backup file: $backupFile" -ForegroundColor Gray

mysqldump -u root -p$mysqlPassword passion_erp > $backupFile 2>$null
if ($LASTEXITCODE -eq 0) {
    $backupSize = (Get-Item $backupFile).Length / 1MB
    Write-Host "✅ Backup created successfully ($([math]::Round($backupSize, 2)) MB)" -ForegroundColor Green
    Write-Host "   Location: $(Get-Location)\$backupFile" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Backup failed, but continuing..." -ForegroundColor Yellow
}

# Show current record counts
Write-Host ""
Write-Host "📊 Current database status:" -ForegroundColor Cyan
$countQuery = @"
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'sales_orders', COUNT(*) FROM sales_orders
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'production_requests', COUNT(*) FROM production_requests
UNION ALL SELECT 'production_orders', COUNT(*) FROM production_orders
UNION ALL SELECT 'inventory', COUNT(*) FROM inventory;
"@
echo $countQuery | mysql -u root -p$mysqlPassword passion_erp -t

# Final confirmation
Write-Host ""
Write-Host "================================================================" -ForegroundColor Red
Write-Host "⚠️  FINAL CONFIRMATION" -ForegroundColor Red
Write-Host "================================================================" -ForegroundColor Red
Write-Host "Type 'DELETE EVERYTHING' to proceed (case-sensitive):" -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -ne "DELETE EVERYTHING") {
    Write-Host ""
    Write-Host "❌ Reset cancelled. No changes made." -ForegroundColor Green
    Write-Host "   Your backup is saved at: $backupFile" -ForegroundColor Gray
    exit 0
}

# Execute truncate
Write-Host ""
Write-Host "🔥 Truncating all tables..." -ForegroundColor Red
mysql -u root -p$mysqlPassword passion_erp < truncate-all-tables.sql 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All tables truncated successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Truncate failed. Check error log." -ForegroundColor Red
    exit 1
}

# Ask about seeders
Write-Host ""
Write-Host "📝 Do you want to create initial admin user and roles? (Y/N)" -ForegroundColor Cyan
$runSeeders = Read-Host

if ($runSeeders -eq "Y" -or $runSeeders -eq "y") {
    Write-Host "🌱 Running database seeders..." -ForegroundColor Cyan
    Set-Location "server"
    node seeders/seed.js
    Set-Location ".."
    Write-Host "✅ Seeders completed" -ForegroundColor Green
    Write-Host ""
    Write-Host "Default admin credentials:" -ForegroundColor Yellow
    Write-Host "  Email: admin@example.com" -ForegroundColor White
    Write-Host "  Password: admin123" -ForegroundColor White
}

# Restart server
Write-Host ""
Write-Host "🔄 Restart server? (Y/N)" -ForegroundColor Cyan
$restartServer = Read-Host

if ($restartServer -eq "Y" -or $restartServer -eq "y") {
    Write-Host "🔄 Restarting server..." -ForegroundColor Cyan
    
    # Stop any running server processes
    Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*passion-clothing*"} | Stop-Process -Force
    
    Write-Host "✅ Server stopped. Start manually with: cd server && npm start" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "✅ DATABASE RESET COMPLETE" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host "📦 Backup saved: $backupFile" -ForegroundColor White
Write-Host "🗄️  All tables truncated (empty)" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start server: cd server && npm start" -ForegroundColor White
Write-Host "  2. Login with admin@example.com / admin123" -ForegroundColor White
Write-Host "  3. Create your users, products, etc." -ForegroundColor White
Write-Host ""
Write-Host "To restore backup (if needed):" -ForegroundColor Yellow
Write-Host "  mysql -u root -p passion_erp < $backupFile" -ForegroundColor Gray
Write-Host ""