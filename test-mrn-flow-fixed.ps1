#!/usr/bin/env pwsh
# MRN Flow Navigation Fix - Diagnostic Script
# Tests the complete MRN → Receipt → Verification → Approval → Production flow
# Updated to verify navigation fixes

$ApiBase = "http://localhost:5000/api"
$Credentials = @{
    email = "manufacturing@passion.com"
    password = "password123"
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "MRN FLOW - NAVIGATION FIX TEST" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Track results
$Results = @()

function Log {
    param([string]$msg, [string]$status = "INFO")
    $color = switch($status) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [$status] $msg" -ForegroundColor $color
}

function Test-ServerHealth {
    Log "Testing server connectivity..." "INFO"
    try {
        $health = Invoke-RestMethod -Uri "$ApiBase/health" -Method Get -TimeoutSec 5
        Log "✅ Server is online (Environment: $($health.environment))" "SUCCESS"
        return $true
    } catch {
        Log "❌ Server connection failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Test-Login {
    Log "Authenticating user..." "INFO"
    try {
        $response = Invoke-RestMethod -Uri "$ApiBase/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body (ConvertTo-Json $Credentials) `
            -TimeoutSec 10
        
        $token = $response.token
        if ($token) {
            Log "✅ Authentication successful (Token: $($token.Substring(0,20))...)" "SUCCESS"
            return $token
        } else {
            Log "❌ No token in response" "ERROR"
            return $null
        }
    } catch {
        Log "❌ Authentication failed: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Get-MRNRequests {
    param([string]$Token)
    Log "Fetching MRN requests..." "INFO"
    try {
        $headers = @{ "Authorization" = "Bearer $Token" }
        $response = Invoke-RestMethod -Uri "$ApiBase/project-material-requests/list" `
            -Method Get `
            -Headers $headers `
            -TimeoutSec 10
        
        $count = $response.requests.Count
        Log "✅ Found $count MRN requests" "SUCCESS"
        return $response.requests
    } catch {
        Log "❌ Failed to fetch MRN requests: $($_.Exception.Message)" "ERROR"
        return @()
    }
}

function Get-MaterialDispatches {
    param([string]$Token)
    Log "Fetching material dispatches..." "INFO"
    try {
        $headers = @{ "Authorization" = "Bearer $Token" }
        $response = Invoke-RestMethod -Uri "$ApiBase/material-dispatch/list" `
            -Method Get `
            -Headers $headers `
            -TimeoutSec 10
        
        $count = $response.dispatches.Count
        Log "✅ Found $count dispatches" "SUCCESS"
        return $response.dispatches
    } catch {
        Log "❌ Failed to fetch dispatches: $($_.Exception.Message)" "ERROR"
        return @()
    }
}

function Get-MaterialReceipts {
    param([string]$Token)
    Log "Fetching material receipts..." "INFO"
    try {
        $headers = @{ "Authorization" = "Bearer $Token" }
        $response = Invoke-RestMethod -Uri "$ApiBase/material-receipt/list/pending-verification" `
            -Method Get `
            -Headers $headers `
            -TimeoutSec 10
        
        $count = $response.receipts.Count
        Log "✅ Found $count receipts pending verification" "SUCCESS"
        return $response.receipts
    } catch {
        Log "❌ Failed to fetch receipts: $($_.Exception.Message)" "ERROR"
        return @()
    }
}

function Get-PendingVerifications {
    param([string]$Token)
    Log "Fetching pending verifications..." "INFO"
    try {
        $headers = @{ "Authorization" = "Bearer $Token" }
        $response = Invoke-RestMethod -Uri "$ApiBase/material-verification/list/pending-approval" `
            -Method Get `
            -Headers $headers `
            -TimeoutSec 10
        
        $count = $response.verifications.Count
        if ($count -eq 0) {
            Log "⚠️  Found $count verifications pending approval (THIS IS EXPECTED IF VERIFICATION HASN'T RUN YET)" "WARNING"
        } else {
            Log "✅ Found $count verifications pending approval" "SUCCESS"
        }
        return $response.verifications
    } catch {
        Log "❌ Failed to fetch verifications: $($_.Exception.Message)" "ERROR"
        return @()
    }
}

function Get-PendingApprovals {
    param([string]$Token)
    Log "Fetching pending approvals..." "INFO"
    try {
        $headers = @{ "Authorization" = "Bearer $Token" }
        $response = Invoke-RestMethod -Uri "$ApiBase/production-approval/list/pending" `
            -Method Get `
            -Headers $headers `
            -TimeoutSec 10
        
        $count = $response.approvals.Count
        if ($count -eq 0) {
            Log "⚠️  Found $count approvals pending (THIS IS EXPECTED IF APPROVAL HASN'T RUN YET)" "WARNING"
        } else {
            Log "✅ Found $count pending approvals" "SUCCESS"
        }
        return $response.approvals
    } catch {
        Log "❌ Failed to fetch approvals: $($_.Exception.Message)" "ERROR"
        return @()
    }
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

try {
    # Step 1: Test server health
    if (-not (Test-ServerHealth)) {
        Write-Host ""
        Write-Host "❌ Cannot proceed - server is not running" -ForegroundColor Red
        Write-Host "   Start server with: npm start" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    
    # Step 2: Authenticate
    $token = Test-Login
    if (-not $token) {
        Write-Host ""
        Write-Host "❌ Authentication failed - check credentials" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "FLOW STAGE VERIFICATION" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Step 3: Check MRN Requests
    $mrnRequests = Get-MRNRequests $token
    if ($mrnRequests.Count -eq 0) {
        Log "No MRN requests found. Create one first:" "WARNING"
        Write-Host "  → Manufacturing → Material Requests → Create MRN" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # Step 4: Check Dispatches
    $dispatches = Get-MaterialDispatches $token
    if ($dispatches.Count -eq 0) {
        Log "No dispatches found. MRN requests must be dispatched first." "WARNING"
    }
    
    Write-Host ""
    
    # Step 5: Check Receipts
    $receipts = Get-MaterialReceipts $token
    if ($receipts.Count -eq 0) {
        Log "No receipts pending verification. Receive materials first." "WARNING"
    } else {
        Write-Host "   📍 Navigate to: /manufacturing/stock-verification/{receiptId}" -ForegroundColor Cyan
        Write-Host "      Sample ID: $($receipts[0].id)" -ForegroundColor Gray
    }
    
    Write-Host ""
    
    # Step 6: Check Verifications
    $verifications = Get-PendingVerifications $token
    if ($verifications.Count -gt 0) {
        Write-Host "   📍 Navigate to: /manufacturing/production-approval/{verificationId}" -ForegroundColor Cyan
        Write-Host "      Sample ID: $($verifications[0].id)" -ForegroundColor Gray
    }
    
    Write-Host ""
    
    # Step 7: Check Approvals
    $approvals = Get-PendingApprovals $token
    if ($approvals.Count -gt 0) {
        Write-Host "   📍 Navigate to: /manufacturing/wizard?approvalId={approvalId}" -ForegroundColor Cyan
        Write-Host "      Sample ID: $($approvals[0].id)" -ForegroundColor Gray
    }
    
    # Print summary
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "FLOW SUMMARY" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    
    $summary = @"
MRN Requests:     $($mrnRequests.Count) found
Dispatches:       $($dispatches.Count) found
Receipts:         $($receipts.Count) pending verification
Verifications:    $($verifications.Count) pending approval
Approvals:        $($approvals.Count) pending
"@
    
    Write-Host $summary -ForegroundColor White
    
    # Navigation flow check
    Write-Host ""
    Write-Host "NAVIGATION FLOW CHECK:" -ForegroundColor Cyan
    Write-Host ""
    
    if ($receipts.Count -eq 0) {
        Write-Host "  ⏳ No receipts → Step: Create MRN → Dispatch → Receive Materials" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Receipts exist → Navigate to Stock Verification page" -ForegroundColor Green
        if ($verifications.Count -eq 0) {
            Write-Host "     ⏳ No verifications yet → Complete Stock Verification to create them" -ForegroundColor Yellow
        } else {
            Write-Host "     ✅ Verifications exist → Navigate to Production Approval page" -ForegroundColor Green
            if ($approvals.Count -eq 0) {
                Write-Host "        ⏳ No approvals yet → Complete Production Approval to create them" -ForegroundColor Yellow
            } else {
                Write-Host "        ✅ Approvals exist → Navigate to Production Wizard to create orders" -ForegroundColor Green
            }
        }
    }
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "✅ DIAGNOSTIC COMPLETE" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.StackTrace -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "For more info, see: MRN_FLOW_NAVIGATION_FIX.md" -ForegroundColor Cyan
Write-Host ""