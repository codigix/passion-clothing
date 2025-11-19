# Setup Local MySQL Database for Passion ERP
# This script creates the database and imports all table structures and data

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Passion ERP - Local MySQL Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$MySQLPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
$MySQLExe = Join-Path $MySQLPath "mysql.exe"
$MySQLDumpPath = "d:\projects\passion-clothing\dump"
$EnvFile = "d:\projects\passion-clothing\server\.env"

# Check if MySQL is installed
Write-Host "Step 1: Checking MySQL installation..." -ForegroundColor Yellow
if (-not (Test-Path $MySQLExe)) {
    Write-Host "ERROR: MySQL not found at $MySQLExe" -ForegroundColor Red
    Write-Host "Please install MySQL 8.0 Community Server first"
    exit 1
}
Write-Host "[OK] MySQL found" -ForegroundColor Green
Write-Host ""

# Step 1: Create database
Write-Host "Step 2: Creating database..." -ForegroundColor Yellow
$createDB = @"
CREATE DATABASE IF NOT EXISTS passion_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
"@

try {
    $createDB | & $MySQLExe -u root -proot 2>&1 | Out-Null
    Write-Host "[OK] Database created successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create database" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}
Write-Host ""

# Step 2: Import all SQL dump files
Write-Host "Step 3: Importing table structures and data..." -ForegroundColor Yellow
$dumpFiles = Get-ChildItem $MySQLDumpPath -Filter "passion_erp_*.sql" | Sort-Object Name

$imported = 0
$failed = 0

foreach ($file in $dumpFiles) {
    Write-Host "  >> Importing $($file.Name)... " -NoNewline
    
    try {
        $sqlContent = Get-Content $file.FullName -Raw
        $sqlContent | & $MySQLExe -u root -proot passion_erp 2>&1 | Out-Null
        Write-Host "[OK]" -ForegroundColor Green
        $imported++
    } catch {
        Write-Host "[FAILED]" -ForegroundColor Red
        Write-Host "     Error: $($_.Exception.Message)"
        $failed++
    }
}

Write-Host ""
Write-Host "Imported: $imported tables, Failed: $failed" -ForegroundColor Cyan
Write-Host ""

# Step 3: Verify database
Write-Host "Step 4: Verifying database setup..." -ForegroundColor Yellow
$verifySQL = "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='passion_erp';"

try {
    $result = & $MySQLExe -u root -proot -e $verifySQL 2>&1
    $tableCount = $result[-1] -split '\s+' | Where-Object { $_ -match '^\d+$' } | Select-Object -First 1
    Write-Host "[OK] Database tables count: $tableCount" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Could not verify database" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Check and display user count
Write-Host "Step 5: Checking data..." -ForegroundColor Yellow
$checkUsersSQL = "SELECT COUNT(*) as count FROM users;"
try {
    $result = & $MySQLExe -u root -proot passion_erp -e $checkUsersSQL 2>&1
    $userCount = $result[-1] -split '\s+' | Where-Object { $_ -match '^\d+$' } | Select-Object -First 1
    Write-Host "[OK] Users in database: $userCount" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Could not count users" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Verify .env configuration
Write-Host "Step 6: Verifying .env configuration..." -ForegroundColor Yellow
if (Test-Path $EnvFile) {
    $envContent = Get-Content $EnvFile
    if ($envContent -match "DB_HOST=localhost" -and $envContent -match "DB_USER=root" -and $envContent -match "DB_PASSWORD=root") {
        Write-Host "[OK] .env file is correctly configured" -ForegroundColor Green
    } else {
        Write-Host "[WARN] .env file needs configuration" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARN] .env file not found" -ForegroundColor Yellow
}
Write-Host ""

# Final status
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database Configuration:" -ForegroundColor Cyan
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 3306" -ForegroundColor White
Write-Host "  Database: passion_erp" -ForegroundColor White
Write-Host "  User: root" -ForegroundColor White
Write-Host "  Password: root" -ForegroundColor White
Write-Host ""
Write-Host "Next steps to run the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Start the SERVER:" -ForegroundColor Cyan
Write-Host "     cd d:\projects\passion-clothing\server" -ForegroundColor White
Write-Host "     npm install" -ForegroundColor White
Write-Host "     npm start" -ForegroundColor White
Write-Host ""
Write-Host "  2. Start the CLIENT (in another terminal):" -ForegroundColor Cyan
Write-Host "     cd d:\projects\passion-clothing\client" -ForegroundColor White
Write-Host "     npm install" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  3. Open http://localhost:3000 in your browser" -ForegroundColor Green
Write-Host ""