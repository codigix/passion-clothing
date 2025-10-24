# Complete MRN → Production Flow - Test & Fix Guide

## 🔴 YOUR PROBLEM: Empty Verifications Array

**API Response:** `{verifications: []}` means NO verification records exist in database.

## ✅ THE COMPLETE WORKING FLOW (Should Be)

```
1. Create MRN Request (ProjectMaterialRequest)
   ↓
2. Material Dispatch created from MRN
   ↓
3. Manufacturing receives dispatch & creates receipt (MaterialReceipt)
   ↓
4. Manufacturing runs verification on receipt (MaterialVerification) ← YOU'RE HERE (empty)
   ↓
5. Production Approval created from verification (ProductionApproval)
   ↓
6. Production Order created from approval (ProductionOrder)
```

## 🔍 DIAGNOSE THE ISSUE

### Step 1: Check Database Content

**Run these SQL queries in MySQL:**

```sql
-- 1. Check if any MRN requests exist
SELECT COUNT(*) as mrn_count FROM ProjectMaterialRequests;
SELECT id, request_number, status, created_at FROM ProjectMaterialRequests ORDER BY created_at DESC LIMIT 5;

-- 2. Check if any dispatches exist
SELECT COUNT(*) as dispatch_count FROM MaterialDispatches;
SELECT id, dispatch_number, project_name, dispatch_status, created_at FROM MaterialDispatches ORDER BY created_at DESC LIMIT 5;

-- 3. Check if any receipts exist
SELECT COUNT(*) as receipt_count FROM MaterialReceipts;
SELECT id, receipt_number, project_name, verification_status, received_at FROM MaterialReceipts ORDER BY received_at DESC LIMIT 5;

-- 4. Check if any verifications exist (THIS IS EMPTY)
SELECT COUNT(*) as verification_count FROM MaterialVerifications;
SELECT * FROM MaterialVerifications ORDER BY created_at DESC LIMIT 5;

-- 5. Check if sales orders are ready for production
SELECT id, order_number, status FROM SalesOrders WHERE status = 'materials_received' LIMIT 10;

-- 6. Check user and auth
SELECT id, email, name, department FROM Users LIMIT 10;
```

### Step 2: Check Browser Console for Errors

1. Open **DevTools** (F12)
2. Go to **Console** tab
3. Try to **log in** - are there any red errors?
4. Check for network errors (Network tab)

### Step 3: Test Login Endpoint

Use Postman or PowerShell to test login:

```powershell
$headers = @{"Content-Type" = "application/json"}
$body = @{
    email = "your.email@example.com"
    password = "your_password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST -Headers $headers -Body $body -ErrorAction SilentlyContinue

if ($response) {
    Write-Host "✅ Login works!"
    Write-Host "Token: $($response.token)"
    Write-Host "User: $($response.user.name)"
} else {
    Write-Host "❌ Login failed - check server console"
}
```

### Step 4: Test API Endpoints

```powershell
# Test pending verifications endpoint
$token = "YOUR_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/material-verification/list/pending-approval" `
    -Method GET -Headers $headers

Write-Host "Pending Verifications:"
Write-Host ($response | ConvertTo-Json -Depth 5)
```

## 🟢 HOW TO FIX

### Issue A: No MRN Requests Exist

**You need to:**
1. Create a sales order
2. Create a purchase order from sales order
3. Create material requirement (MRN) from purchase order
4. Verify MRN is created successfully

### Issue B: No Receipts Exist

**You need to:**
1. Dispatch materials from inventory
2. Manufacturing dashboard should show "Dispatches Awaiting Receipt"
3. Click "Receive Materials" button
4. Fill receipt form and submit

**Check MaterialReceiptPage.jsx is working:**
- Navigate to `/manufacturing/material-receipt/{dispatchId}`
- Fill out materials received
- Submit form
- Should create MaterialReceipt record

### Issue C: No Verifications Exist (LIKELY YOUR ISSUE)

**Even if receipts exist, verifications might not be created because:**

1. **Navigation missing after receipt** - After receipt creation, user should automatically go to verification page
2. **Or user hasn't clicked verification link** - MRN list might not show link to verify

**Check StockVerificationPage.jsx is accessible:**
- After receipt created, navigate to `/manufacturing/stock-verification/{receiptId}`
- Fill verification checklist
- Submit form
- Should create MaterialVerification record

### Issue D: Login is Broken

**If login doesn't work:**

1. **Check server is running:**
```powershell
curl.exe http://localhost:5000/api/health
```

Should return: `{"status":"OK","timestamp":"...","environment":"development"}`

2. **Check database connection:**
- Look at server console for: `Database connection established successfully`
- If not, DB credentials are wrong or database is not running

3. **Check user exists in database:**
```sql
SELECT id, email, name, department, password FROM Users WHERE email = 'your.email@example.com';
```

4. **Check auth routes:**
- File: `server/routes/auth.js`
- Make sure login endpoint is defined

## 🚀 COMPLETE END-TO-END TEST

Run this to test the **entire flow**:

```powershell
# 1. Login
$loginBody = @{
    email = "manufacturing@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST -Headers @{"Content-Type" = "application/json"} -Body $loginBody

$token = $loginResponse.token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "✅ Logged in as: $($loginResponse.user.name)"

# 2. Check pending verifications
$verResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/material-verification/list/pending-approval" `
    -Method GET -Headers $headers

Write-Host "Pending Verifications: $($verResponse.verifications.Count)"
if ($verResponse.verifications.Count -eq 0) {
    Write-Host "❌ NO VERIFICATIONS - Need to complete receipts first"
} else {
    Write-Host "✅ Found $($verResponse.verifications.Count) pending verifications"
    $verResponse.verifications | ForEach-Object {
        Write-Host "  - $($_.verification_number) for $($_.project_name)"
    }
}

# 3. Check approved productions
$approvalResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/production-approval/list/approved" `
    -Method GET -Headers $headers

Write-Host "Approved Productions: $($approvalResponse.approvals.Count)"
```

## 📋 WHAT I NEED FROM YOU

Reply with these diagnostics:

1. **SQL query results** - Run the diagnostic queries above and paste output
2. **Console errors** - Any red errors in browser DevTools?
3. **Can you log in?** - Yes/No?
4. **What data exists?** - MRNs? Dispatches? Receipts?
5. **Which page shows empty?** - ProductionDashboard? ProductionOrdersPage?

## 🔧 I WILL THEN:

1. ✅ Identify exact break point in flow
2. ✅ Fix missing endpoints or API calls
3. ✅ Fix navigation between pages
4. ✅ Fix authentication if broken
5. ✅ Test complete end-to-end flow
6. ✅ Provide step-by-step guide to recreate production order

---

**HINT:** Most likely issue is that the receipts are never being verified, so no verifications exist. This usually happens because the user doesn't see the verification page link after receipt creation. Let me know!