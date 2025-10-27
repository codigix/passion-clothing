# 🚀 Start Both Frontend and Backend Servers

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        Passion ERP - Start Development Servers             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host "`n"

$projectRoot = "d:\projects\passion-clothing"

# Colors
$success = "Green"
$error = "Red"
$warning = "Yellow"
$info = "Cyan"

# Function to print status
function Print-Status {
    param([string]$message, [string]$status = "info")
    $color = switch($status) {
        "success" { $success }
        "error" { $error }
        "warning" { $warning }
        default { $info }
    }
    $icon = switch($status) {
        "success" { "✅" }
        "error" { "❌" }
        "warning" { "⚠️ " }
        default { "ℹ️ " }
    }
    Write-Host "$icon $message" -ForegroundColor $color
}

# Check if Node.js is installed
Print-Status "Checking Node.js installation..." "info"
try {
    $nodeVersion = node --version
    Print-Status "Node.js $nodeVersion found" "success"
} catch {
    Print-Status "Node.js is not installed or not in PATH" "error"
    exit 1
}

# Check if npm is installed
Print-Status "Checking npm installation..." "info"
try {
    $npmVersion = npm --version
    Print-Status "npm $npmVersion found" "success"
} catch {
    Print-Status "npm is not installed" "error"
    exit 1
}

# Kill any existing Node processes
Write-Host "`n" -ForegroundColor Gray
Print-Status "Cleaning up existing Node processes..." "warning"
try {
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    Print-Status "Previous Node processes terminated" "success"
} catch {
    Print-Status "No existing Node processes found" "info"
}

# Check MySQL service
Write-Host "`n"
Print-Status "Checking MySQL service..." "info"
$mysqlService = Get-Service "MySQL80" -ErrorAction SilentlyContinue

if ($mysqlService) {
    if ($mysqlService.Status -eq "Running") {
        Print-Status "MySQL service is running" "success"
    } else {
        Print-Status "Starting MySQL service..." "warning"
        try {
            Start-Service "MySQL80" -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            Print-Status "MySQL service started" "success"
        } catch {
            Print-Status "Could not start MySQL service (may require admin)" "warning"
            Print-Status "Continuing anyway..." "info"
        }
    }
} else {
    Print-Status "MySQL80 service not found - install MySQL if needed" "warning"
}

# Start Backend Server
Write-Host "`n"
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Starting Backend Server (Port 5000)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n"

$serverPath = Join-Path $projectRoot "server"

if (-not (Test-Path $serverPath)) {
    Print-Status "Server directory not found at $serverPath" "error"
    exit 1
}

# Check if node_modules exists, if not install
$serverNodeModules = Join-Path $serverPath "node_modules"
if (-not (Test-Path $serverNodeModules)) {
    Print-Status "Installing server dependencies..." "warning"
    Set-Location $serverPath
    npm install | Out-Null
    Print-Status "Server dependencies installed" "success"
}

# Start server in new PowerShell window
Print-Status "Starting backend server..." "info"
$serverScript = {
    param([string]$serverPath)
    Set-Location $serverPath
    npm start
}

$serverJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location `"$serverPath`"; npm start" `
    -PassThru -WindowStyle Normal
Print-Status "Backend server started in new window (PID: $($serverJob.Id))" "success"

# Wait a bit for server to start
Start-Sleep -Seconds 3

# Check if server is running
Print-Status "Checking if backend server is responding..." "info"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 3 -ErrorAction SilentlyContinue
    Print-Status "Backend server is responding at http://localhost:5000" "success"
} catch {
    Print-Status "Backend server not responding yet (it may still be starting)" "warning"
}

# Start Frontend Server
Write-Host "`n"
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "Starting Frontend Server (Port 3000)" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "`n"

$clientPath = Join-Path $projectRoot "client"

if (-not (Test-Path $clientPath)) {
    Print-Status "Client directory not found at $clientPath" "error"
    exit 1
}

# Check if node_modules exists, if not install
$clientNodeModules = Join-Path $clientPath "node_modules"
if (-not (Test-Path $clientNodeModules)) {
    Print-Status "Installing client dependencies..." "warning"
    Set-Location $clientPath
    npm install | Out-Null
    Print-Status "Client dependencies installed" "success"
}

# Start client in new PowerShell window
Print-Status "Starting frontend server..." "info"
$clientJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location `"$clientPath`"; npm start" `
    -PassThru -WindowStyle Normal
Print-Status "Frontend server started in new window (PID: $($clientJob.Id))" "success"

# Summary
Write-Host "`n"
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  🎉 SERVERS STARTED                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host "`n"

Print-Status "Backend Server: http://localhost:5000" "success"
Print-Status "Frontend Server: http://localhost:3000" "success"
Write-Host "`n"

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "  2. Log in with your credentials" -ForegroundColor White
Write-Host "  3. Check browser console (F12) for any errors" -ForegroundColor White
Write-Host "`n"

Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
Write-Host "  • If you see 401 errors: Clear localStorage and log in again" -ForegroundColor White
Write-Host "  • If server doesn't start: Check port 5000 is not in use" -ForegroundColor White
Write-Host "  • If database errors: Verify MySQL is running" -ForegroundColor White
Write-Host "`n"

Write-Host "📝 Console Output:" -ForegroundColor Cyan
Write-Host "  Backend: Check window titled 'npm start'" -ForegroundColor White
Write-Host "  Frontend: Check window titled 'npm start'" -ForegroundColor White
Write-Host "`n"

# Keep this window open
Write-Host "Type 'exit' in backend/frontend windows to stop servers" -ForegroundColor Gray
Start-Sleep -Seconds 3