# Local MySQL Database Setup Script
# This script automates the local database setup

param(
    [string]$BackupFile = "backup.sql",
    [string]$MySQLUser = "root",
    [string]$MySQLPassword = "root",
    [string]$DatabaseName = "passion_erp"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Local MySQL Database Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if MySQL is installed
Write-Host "[1/5] Checking MySQL installation..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MySQL installed: $mysqlVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ MySQL not found in PATH" -ForegroundColor Red
        Write-Host "Please install MySQL Community Server first" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ Error checking MySQL: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Test MySQL connection
Write-Host "`n[2/5] Testing MySQL connection..." -ForegroundColor Yellow
try {
    mysql -u $MySQLUser -p$MySQLPassword -e "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully connected to MySQL" -ForegroundColor Green
    } else {
        Write-Host "✗ Connection failed. Verify credentials:" -ForegroundColor Red
        Write-Host "  User: $MySQLUser" -ForegroundColor Yellow
        Write-Host "  Check if password is correct" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ Error connecting to MySQL: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Create database
Write-Host "`n[3/5] Creating database '$DatabaseName'..." -ForegroundColor Yellow
try {
    $createDbSQL = "CREATE DATABASE IF NOT EXISTS $DatabaseName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql -u $MySQLUser -p$MySQLPassword -e $createDbSQL 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database created/verified" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error creating database: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Import backup
Write-Host "`n[4/5] Importing backup from '$BackupFile'..." -ForegroundColor Yellow

# Check if backup file exists
$backupPath = Join-Path (Get-Location) $BackupFile
if (-not (Test-Path $backupPath)) {
    # Try alternative paths
    $altPaths = @(
        "backup.sql",
        ".\dump\passion_erp.sql",
        ".\dump.zip"
    )
    
    $found = $false
    foreach ($path in $altPaths) {
        if (Test-Path $path) {
            $backupPath = $path
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        Write-Host "✗ Backup file not found. Searched for:" -ForegroundColor Red
        Write-Host "  - $backupPath" -ForegroundColor Yellow
        $altPaths | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
        Write-Host "`nUsage: .\setup-local-database.ps1 -BackupFile 'path/to/backup.sql'" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host "Using backup: $backupPath" -ForegroundColor Cyan

try {
    $content = Get-Content $backupPath -Raw
    if ($null -ne $content) {
        # Import the SQL file
        mysql -u $MySQLUser -p$MySQLPassword --default-character-set=utf8mb4 $DatabaseName < $backupPath 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Backup imported successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ Import had issues, but continuing..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ Backup file is empty" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error importing backup: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Verify import
Write-Host "`n[5/5] Verifying database setup..." -ForegroundColor Yellow
try {
    $tableCount = mysql -u $MySQLUser -p$MySQLPassword -e "USE $DatabaseName; SHOW TABLES;" 2>$null | Measure-Object -Line
    $tables = $tableCount.Lines - 1  # Subtract header
    
    if ($tables -gt 0) {
        Write-Host "✓ Database verified with $tables tables" -ForegroundColor Green
        
        # Show sample counts
        Write-Host "`nDatabase Statistics:" -ForegroundColor Cyan
        $stats = mysql -u $MySQLUser -p$MySQLPassword -N -e "
        USE $DatabaseName;
        SELECT CONCAT('Users: ', COUNT(*)) FROM users UNION ALL
        SELECT CONCAT('Roles: ', COUNT(*)) FROM roles UNION ALL
        SELECT CONCAT('Purchase Orders: ', COUNT(*)) FROM purchase_orders UNION ALL
        SELECT CONCAT('Sales Orders: ', COUNT(*)) FROM sales_orders UNION ALL
        SELECT CONCAT('Vendors: ', COUNT(*)) FROM vendors;
        " 2>$null
        
        $stats | ForEach-Object { Write-Host "  $_" -ForegroundColor Cyan }
    } else {
        Write-Host "⚠ Warning: No tables found in database" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Warning: Could not verify database: $_" -ForegroundColor Yellow
}

# Step 6: Update .env file
Write-Host "`n[NEXT STEP] Updating .env file..." -ForegroundColor Yellow

$envPath = "server\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # Check if already using local database
    if ($envContent -like "*localhost*" -or $envContent -like "*passion-erp.cxqc*") {
        Write-Host "Current .env database settings:" -ForegroundColor Cyan
        $envContent -split "`n" | Where-Object { $_ -match "DB_" } | ForEach-Object { Write-Host "  $_" }
    }
    
    # Backup original
    Copy-Item $envPath "$envPath.backup" -Force
    Write-Host "✓ Backup created: $envPath.backup" -ForegroundColor Green
    
    # Update with local settings
    $newEnv = $envContent `
        -replace "DB_HOST=.*", "DB_HOST=localhost" `
        -replace "DB_PORT=.*", "DB_PORT=3306" `
        -replace "DB_NAME=.*", "DB_NAME=passion_erp" `
        -replace "DB_USER=.*", "DB_USER=root" `
        -replace "DB_PASSWORD=.*", "DB_PASSWORD=root"
    
    Set-Content $envPath $newEnv -Encoding UTF8
    Write-Host "✓ .env file updated with local database settings" -ForegroundColor Green
    Write-Host "`nUpdated settings:" -ForegroundColor Cyan
    $newEnv -split "`n" | Where-Object { $_ -match "DB_" } | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "⚠ .env file not found at: $envPath" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Verify .env file has local database settings" -ForegroundColor White
Write-Host "2. Start the backend server:" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host "3. Start the frontend (new terminal):" -ForegroundColor White
Write-Host "   cd client" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "4. Open http://localhost:3000 and test" -ForegroundColor White
Write-Host "`nFor troubleshooting, see: LOCAL_DATABASE_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""