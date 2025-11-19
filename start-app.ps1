# Start Passion ERP Application
# This script starts both the server and client

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passion ERP - Starting Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing node processes
Write-Host "Cleaning up previous processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Define paths
$serverPath = "d:\projects\passion-clothing\server"
$clientPath = "d:\projects\passion-clothing\client"

# Function to start server
function Start-Server {
    Write-Host ""
    Write-Host "Starting Server..." -ForegroundColor Green
    Write-Host "Location: $serverPath" -ForegroundColor White
    Write-Host ""
    
    Set-Location $serverPath
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Start server
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Server Output:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    npm start
}

# Function to start client
function Start-Client {
    Write-Host ""
    Write-Host "Starting Client..." -ForegroundColor Green
    Write-Host "Location: $clientPath" -ForegroundColor White
    Write-Host ""
    
    Set-Location $clientPath
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Start client
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Client Output:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    npm run dev
}

# Show instructions
Write-Host "This script will start the server and client." -ForegroundColor Cyan
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "  1. A new window will open for the SERVER (do not close)" -ForegroundColor White
Write-Host "  2. This window will start the CLIENT" -ForegroundColor White
Write-Host "  3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = Read-Host

# Start server in new window
Write-Host ""
Write-Host "Launching server in new window..." -ForegroundColor Green
$serverScript = {
    param($path)
    Set-Location $path
    npm install 2>&1 | Out-Null
    npm start
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$serverPath'; npm install 2>&1 | Out-Null; npm start"

# Wait for server to start
Write-Host "Waiting for server to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start client in current window
Write-Host ""
Write-Host "Starting client in this window..." -ForegroundColor Green
Set-Location $clientPath

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Application Running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open your browser: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server: Running on http://localhost:5000" -ForegroundColor White
Write-Host "Client: Running on http://localhost:3000" -ForegroundColor White
Write-Host ""

npm run dev