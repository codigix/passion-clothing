# Test Database Connection
# Verifies that MySQL is running and the database is properly configured

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Connection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0

# Test 1: MySQL is installed
Write-Host "Test 1: Checking MySQL installation..." -ForegroundColor Yellow
$MySQLPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if (Test-Path $MySQLPath) {
    Write-Host "[PASS] MySQL found at $MySQLPath" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "[FAIL] MySQL not found at $MySQLPath" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 2: MySQL can be started
Write-Host "Test 2: Testing MySQL connection..." -ForegroundColor Yellow
try {
    $result = & $MySQLPath -u root -proot -e "SELECT 1" 2>&1
    if ($result -match "1") {
        Write-Host "[PASS] Successfully connected to MySQL" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "[FAIL] Could not connect to MySQL" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "[FAIL] Error connecting to MySQL: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 3: Database exists
Write-Host "Test 3: Checking if passion_erp database exists..." -ForegroundColor Yellow
try {
    $result = & $MySQLPath -u root -proot -e "SELECT 1 FROM passion_erp.users LIMIT 1" 2>&1
    if ($? -eq $true) {
        Write-Host "[PASS] passion_erp database exists" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "[FAIL] passion_erp database not found" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "[FAIL] Error: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 4: Count tables
Write-Host "Test 4: Checking database tables..." -ForegroundColor Yellow
try {
    $result = & $MySQLPath -u root -proot -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='passion_erp'" 2>&1
    $tableCount = $result[-1] -split '\s+' | Where-Object { $_ -match '^\d+$' } | Select-Object -First 1
    if ($tableCount -gt 40) {
        Write-Host "[PASS] Database has $tableCount tables" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "[WARN] Database has only $tableCount tables (expected 40+)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[FAIL] Error: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 5: Count users
Write-Host "Test 5: Checking users in database..." -ForegroundColor Yellow
try {
    $result = & $MySQLPath -u root -proot passion_erp -e "SELECT COUNT(*) as count FROM users" 2>&1
    $userCount = $result[-1] -split '\s+' | Where-Object { $_ -match '^\d+$' } | Select-Object -First 1
    if ($userCount -gt 0) {
        Write-Host "[PASS] Found $userCount users in database" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "[WARN] No users found in database" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[FAIL] Error: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 6: Check .env configuration
Write-Host "Test 6: Checking .env configuration..." -ForegroundColor Yellow
$envFile = "d:\projects\passion-clothing\server\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "DB_HOST=localhost" -and $envContent -match "DB_USER=root") {
        Write-Host "[PASS] .env is correctly configured" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "[FAIL] .env has incorrect configuration" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "[FAIL] .env file not found" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "All tests passed! Ready to start the application." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: start-app.ps1" -ForegroundColor White
    Write-Host "  2. Open http://localhost:3000 in browser" -ForegroundColor White
} else {
    Write-Host "Some tests failed. Please review the errors above." -ForegroundColor Red
}

Write-Host ""