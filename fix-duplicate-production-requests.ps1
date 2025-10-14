# ============================================================
# Fix Duplicate Production Requests - Automated Script
# ============================================================
# This script:
# 1. Checks for MySQL connection
# 2. Backs up the database
# 3. Cleans up duplicate production requests
# 4. Shows results
# ============================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Fix Duplicate Production Requests" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$mysqlUser = "root"
$mysqlPassword = "root"
$database = "passion_erp"
$scriptPath = "cleanup-duplicate-production-requests.sql"

# Check if MySQL is accessible
Write-Host "Step 1: Checking MySQL connection..." -ForegroundColor Yellow
$testConnection = "mysql -u$mysqlUser -p$mysqlPassword -e 'SELECT 1;' 2>&1"
$result = Invoke-Expression $testConnection

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Cannot connect to MySQL" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Red
    Write-Host "  - MySQL is running" -ForegroundColor Red
    Write-Host "  - Username: $mysqlUser" -ForegroundColor Red
    Write-Host "  - Password: $mysqlPassword" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ MySQL connection successful" -ForegroundColor Green
Write-Host ""

# Show current duplicates
Write-Host "Step 2: Checking for duplicate production requests..." -ForegroundColor Yellow
$checkQuery = @"
SELECT 
    pr.sales_order_id,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(pr.request_number ORDER BY pr.created_at) as request_numbers
FROM production_requests pr
WHERE pr.sales_order_id IS NOT NULL
    AND pr.status NOT IN ('cancelled')
GROUP BY pr.sales_order_id
HAVING COUNT(*) > 1;
"@

$checkCmd = "mysql -u$mysqlUser -p$mysqlPassword $database -e `"$checkQuery`""
Write-Host "Executing: Checking for duplicates..." -ForegroundColor Gray
$duplicates = Invoke-Expression $checkCmd

if ($duplicates) {
    Write-Host ""
    Write-Host "⚠️  Found duplicates:" -ForegroundColor Yellow
    Write-Host $duplicates
    Write-Host ""
} else {
    Write-Host "✅ No duplicates found! Database is clean." -ForegroundColor Green
    Write-Host ""
    Write-Host "You may have already run this script, or there are no duplicates." -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 0
}

# Ask for confirmation
Write-Host "Step 3: Ready to clean up duplicates" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will:" -ForegroundColor White
Write-Host "  ✅ Create backup table (production_requests_backup_20250112)" -ForegroundColor Green
Write-Host "  ✅ Keep the FIRST production request for each sales order" -ForegroundColor Green
Write-Host "  ⚠️  Mark all other duplicates as 'cancelled'" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Do you want to proceed? (yes/no)"

if ($confirmation -ne "yes" -and $confirmation -ne "y") {
    Write-Host ""
    Write-Host "❌ Cleanup cancelled by user" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 0
}

# Run cleanup script
Write-Host ""
Write-Host "Step 4: Running cleanup script..." -ForegroundColor Yellow

if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ ERROR: Cleanup script not found: $scriptPath" -ForegroundColor Red
    Write-Host "Please ensure the script is in the same directory." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

$cleanupCmd = "mysql -u$mysqlUser -p$mysqlPassword $database < `"$scriptPath`""
Write-Host "Executing: $scriptPath" -ForegroundColor Gray
Invoke-Expression $cleanupCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cleanup script executed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Cleanup script failed" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Verify cleanup
Write-Host ""
Write-Host "Step 5: Verifying cleanup..." -ForegroundColor Yellow

$verifyQuery = @"
SELECT 
    pr.sales_order_id,
    COUNT(*) as active_count
FROM production_requests pr
WHERE pr.sales_order_id IS NOT NULL
    AND pr.status NOT IN ('cancelled')
GROUP BY pr.sales_order_id
HAVING COUNT(*) > 1;
"@

$verifyCmd = "mysql -u$mysqlUser -p$mysqlPassword $database -e `"$verifyQuery`""
$remainingDuplicates = Invoke-Expression $verifyCmd

if ($remainingDuplicates) {
    Write-Host "⚠️  WARNING: Some duplicates still remain:" -ForegroundColor Yellow
    Write-Host $remainingDuplicates
    Write-Host ""
} else {
    Write-Host "✅ All duplicates cleaned successfully!" -ForegroundColor Green
    Write-Host ""
}

# Show summary
Write-Host "Step 6: Summary" -ForegroundColor Yellow
$summaryQuery = @"
SELECT 
    'Total cancelled duplicates' as summary,
    COUNT(*) as count
FROM production_requests
WHERE manufacturing_notes LIKE '%AUTO-CANCELLED%';
"@

$summaryCmd = "mysql -u$mysqlUser -p$mysqlPassword $database -e `"$summaryQuery`""
$summary = Invoke-Expression $summaryCmd

Write-Host $summary
Write-Host ""

# Final message
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Refresh Manufacturing Dashboard (F5)" -ForegroundColor Gray
Write-Host "  2. Verify only one production request per sales order" -ForegroundColor Gray
Write-Host "  3. Try creating a duplicate to test the fix" -ForegroundColor Gray
Write-Host ""
Write-Host "Backup created: production_requests_backup_20250112" -ForegroundColor Gray
Write-Host "To restore: See DUPLICATE_PRODUCTION_REQUEST_QUICK_FIX.md" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"