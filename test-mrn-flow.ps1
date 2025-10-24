# MRN → Production Flow Diagnostic Script
# Run this to identify where your flow is broken

# Colors for output
$Green = @{ForegroundColor = "Green"}
$Red = @{ForegroundColor = "Red"}
$Yellow = @{ForegroundColor = "Yellow"}
$Blue = @{ForegroundColor = "Blue"}

Write-Host "🔍 MRN FLOW DIAGNOSTIC" @Blue
Write-Host "=" * 50
Write-Host ""

# Configuration
$API_URL = "http://localhost:5000/api"
$EMAIL = Read-Host "Enter your email (default: manufacturing@example.com)"
if ([string]::IsNullOrWhiteSpace($EMAIL)) { $EMAIL = "manufacturing@example.com" }
$PASSWORD = Read-Host "Enter your password (default: password123)" -AsSecureString
if ($PASSWORD.Length -eq 0) { $PASSWORD = "password123" | ConvertTo-SecureString -AsPlainText -Force }

$PASSWORD_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($PASSWORD))

# Step 1: Check server health
Write-Host "1️⃣  CHECKING SERVER HEALTH..." @Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$API_URL/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Server is running" @Green
    Write-Host "   Environment: $($healthResponse.environment)"
    Write-Host "   Timestamp: $($healthResponse.timestamp)"
} catch {
    Write-Host "   ❌ Server is NOT running!" @Red
    Write-Host "   Error: $_"
    Write-Host "   Start server with: npm start (in server directory)"
    exit
}

# Step 2: Try Login
Write-Host ""
Write-Host "2️⃣  ATTEMPTING LOGIN..." @Yellow
try {
    $loginBody = @{
        email = $EMAIL
        password = $PASSWORD_PLAIN
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $loginBody `
        -ErrorAction Stop

    $token = $loginResponse.token
    $user = $loginResponse.user

    Write-Host "   ✅ Login successful!" @Green
    Write-Host "   User: $($user.name)"
    Write-Host "   Department: $($user.department)"
    Write-Host "   Token: $($token.Substring(0,20))..."
} catch {
    Write-Host "   ❌ Login FAILED!" @Red
    Write-Host "   Error: $($_.Exception.Message)"
    Write-Host "   Response: $($_.ErrorDetails.Message)"
    exit
}

# Setup auth headers for subsequent requests
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Step 3: Check MRN Requests
Write-Host ""
Write-Host "3️⃣  CHECKING MRN REQUESTS..." @Yellow
try {
    $mrnResponse = Invoke-RestMethod -Uri "$API_URL/project-material-requests" `
        -Method GET -Headers $headers -ErrorAction Stop
    
    $mrnCount = $mrnResponse.requests.Count
    Write-Host "   Found: $mrnCount MRN requests"
    
    if ($mrnCount -eq 0) {
        Write-Host "   ⚠️  NO MRN REQUESTS - Need to create one first!" @Yellow
    } else {
        $mrnResponse.requests | Select-Object -First 3 | ForEach-Object {
            Write-Host "   • Request #$($_.request_number) - Status: $($_.status)"
        }
    }
} catch {
    Write-Host "   ❌ Error fetching MRN requests: $_" @Red
}

# Step 4: Check Material Dispatches
Write-Host ""
Write-Host "4️⃣  CHECKING MATERIAL DISPATCHES..." @Yellow
try {
    $dispatchResponse = Invoke-RestMethod -Uri "$API_URL/material-dispatch/pending" `
        -Method GET -Headers $headers -ErrorAction Stop
    
    $dispatchCount = $dispatchResponse.dispatches.Count
    Write-Host "   Found: $dispatchCount pending dispatches"
    
    if ($dispatchCount -eq 0) {
        Write-Host "   ⚠️  NO DISPATCHES - Materials haven't been sent from inventory yet" @Yellow
    } else {
        $dispatchResponse.dispatches | Select-Object -First 3 | ForEach-Object {
            Write-Host "   • Dispatch #$($_.dispatch_number) - Project: $($_.project_name)"
        }
    }
} catch {
    Write-Host "   ❌ Error fetching dispatches: $_" @Red
}

# Step 5: Check Material Receipts
Write-Host ""
Write-Host "5️⃣  CHECKING MATERIAL RECEIPTS..." @Yellow
try {
    $receiptResponse = Invoke-RestMethod -Uri "$API_URL/material-receipt/list/pending-verification" `
        -Method GET -Headers $headers -ErrorAction Stop
    
    $receiptCount = $receiptResponse.receipts.Count
    Write-Host "   Found: $receiptCount receipts pending verification"
    
    if ($receiptCount -eq 0) {
        Write-Host "   ⚠️  NO RECEIPTS - Materials haven't been received yet" @Yellow
    } else {
        $receiptResponse.receipts | Select-Object -First 3 | ForEach-Object {
            Write-Host "   • Receipt #$($_.receipt_number) - Project: $($_.project_name)"
        }
    }
} catch {
    Write-Host "   ❌ Error fetching receipts: $_" @Red
}

# Step 6: Check Material Verifications (MOST IMPORTANT)
Write-Host ""
Write-Host "6️⃣  CHECKING MATERIAL VERIFICATIONS..." @Yellow
try {
    $verResponse = Invoke-RestMethod -Uri "$API_URL/material-verification/list/pending-approval" `
        -Method GET -Headers $headers -ErrorAction Stop
    
    $verCount = $verResponse.verifications.Count
    Write-Host "   Found: $verCount verifications pending approval" @Green
    
    if ($verCount -eq 0) {
        Write-Host "   ⚠️  NO VERIFICATIONS - This is your problem!" @Red
        Write-Host "   → Receipts haven't been verified yet"
        Write-Host "   → Complete verification from StockVerificationPage"
    } else {
        $verResponse.verifications | Select-Object -First 3 | ForEach-Object {
            Write-Host "   • Verification #$($_.verification_number) - Project: $($_.project_name)"
        }
    }
} catch {
    Write-Host "   ❌ Error fetching verifications: $_" @Red
}

# Step 7: Check Production Approvals
Write-Host ""
Write-Host "7️⃣  CHECKING PRODUCTION APPROVALS..." @Yellow
try {
    $approvalResponse = Invoke-RestMethod -Uri "$API_URL/production-approval/list/approved" `
        -Method GET -Headers $headers -ErrorAction Stop
    
    $approvalCount = $approvalResponse.approvals.Count
    Write-Host "   Found: $approvalCount approved productions" @Green
    
    if ($approvalCount -eq 0) {
        Write-Host "   ⚠️  NO APPROVALS - Either no verifications passed, or no approvals created" @Yellow
    } else {
        $approvalResponse.approvals | Select-Object -First 3 | ForEach-Object {
            Write-Host "   • Approval #$($_.approval_number) - Status: $($_.approval_status)"
        }
    }
} catch {
    Write-Host "   ❌ Error fetching approvals: $_" @Red
}

# Step 8: Check Production Orders
Write-Host ""
Write-Host "8️⃣  CHECKING PRODUCTION ORDERS..." @Yellow
try {
    $orderResponse = Invoke-RestMethod -Uri "$API_URL/manufacturing/orders?page=1&limit=20" `
        -Method GET -Headers $headers -ErrorAction Stop
    
    $orderCount = $orderResponse.productionOrders.Count
    Write-Host "   Found: $orderCount production orders" @Green
    
    if ($orderCount -eq 0) {
        Write-Host "   ⚠️  NO PRODUCTION ORDERS - Not yet created" @Yellow
    } else {
        $orderResponse.productionOrders | Select-Object -First 3 | ForEach-Object {
            Write-Host "   • Order #$($_.production_number) - Status: $($_.status)"
        }
    }
} catch {
    Write-Host "   ❌ Error fetching production orders: $_" @Red
}

# Final Report
Write-Host ""
Write-Host "=" * 50
Write-Host "📊 FLOW STATUS SUMMARY" @Blue
Write-Host ""

$flowStatus = @(
    @{Stage = "1. Login"; Status = "✅ OK"; Count = 1},
    @{Stage = "2. MRN Requests"; Status = if ($mrnCount -gt 0) { "✅ Found $mrnCount" } else { "❌ None" }; Count = $mrnCount},
    @{Stage = "3. Material Dispatches"; Status = if ($dispatchCount -gt 0) { "✅ Found $dispatchCount" } else { "❌ None" }; Count = $dispatchCount},
    @{Stage = "4. Material Receipts"; Status = if ($receiptCount -gt 0) { "✅ Found $receiptCount" } else { "❌ None" }; Count = $receiptCount},
    @{Stage = "5. Material Verifications"; Status = if ($verCount -gt 0) { "✅ Found $verCount" } else { "🔴 BROKEN!" }; Count = $verCount},
    @{Stage = "6. Production Approvals"; Status = if ($approvalCount -gt 0) { "✅ Found $approvalCount" } else { "❌ None" }; Count = $approvalCount},
    @{Stage = "7. Production Orders"; Status = if ($orderCount -gt 0) { "✅ Found $orderCount" } else { "❌ None" }; Count = $orderCount}
)

$flowStatus | Format-Table -Property Stage, Status -AutoSize

# Recommendations
Write-Host ""
Write-Host "🎯 RECOMMENDED NEXT STEPS:" @Yellow
Write-Host ""

if ($mrnCount -eq 0) {
    Write-Host "   1. ❌ NO MRN REQUESTS - Create Sales Order → Purchase Order → MRN"
    Write-Host "      Go to: Sales Dashboard → Create Order → Generate MRN"
}
elseif ($dispatchCount -eq 0) {
    Write-Host "   2. ❌ NO DISPATCHES - Dispatch materials from inventory"
    Write-Host "      Go to: Inventory Dashboard → Send to Manufacturing"
}
elseif ($receiptCount -eq 0) {
    Write-Host "   3. ❌ NO RECEIPTS - Manufacturing needs to receive dispatched materials"
    Write-Host "      Go to: Manufacturing Dashboard → Material Receipts → Click dispatch → Receive Materials"
}
elseif ($verCount -eq 0) {
    Write-Host "   4. 🔴 NO VERIFICATIONS - This is the PROBLEM!"
    Write-Host "      Go to: Manufacturing Dashboard → Material Receipts"
    Write-Host "      Find receipt → Complete Stock Verification (QC)"
    Write-Host "      This creates the verification record needed for production approval"
}
elseif ($approvalCount -eq 0) {
    Write-Host "   5. ⚠️  NO APPROVALS - After verification passes, need production approval"
    Write-Host "      Go to: Manufacturing Dashboard → Approved Productions"
    Write-Host "      Complete the production approval workflow"
}
else {
    Write-Host "   ✅ FLOW IS COMPLETE!"
    Write-Host "      You can now create production orders"
    Write-Host "      Go to: Manufacturing Dashboard → Production Orders → Create Order"
}

Write-Host ""
Write-Host "=" * 50