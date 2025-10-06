# 🧪 Phase 1 Testing Guide - Material Allocation System

## ✅ Server Status

**Server should be running on:** `http://localhost:5000`

**Check if running:**
```powershell
curl http://localhost:5000/api/auth/health
```

---

## 📋 TEST WORKFLOW

### **Pre-requisites:**
1. ✅ Server running
2. ✅ User logged in (get JWT token)
3. ✅ At least 1 inventory item exists (with barcode)
4. ✅ At least 1 production order exists

---

## 🔧 Step 1: Get Your Auth Token

```powershell
# Login to get token
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    email = "admin@example.com"
    password = "admin123"
  } | ConvertTo-Json)

$token = $response.token
Write-Host "Token: $token"
```

---

## 🔧 Step 2: Check Existing Inventory Items

```powershell
# Get inventory items with barcodes
$inventoryResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/inventory?limit=5" `
  -Headers @{Authorization = "Bearer $token"}

$inventoryResponse.items | Select-Object id, item_name, barcode, quantity, reserved_quantity | Format-Table

# Save an inventory ID and barcode for testing
$invId = $inventoryResponse.items[0].id
$invBarcode = $inventoryResponse.items[0].barcode

Write-Host "Test Inventory ID: $invId"
Write-Host "Test Barcode: $invBarcode"
```

---

## 🔧 Step 3: Check Existing Production Orders

```powershell
# Get production orders
$productionResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/manufacturing/orders?limit=5" `
  -Headers @{Authorization = "Bearer $token"}

$productionResponse.productionOrders | Select-Object id, production_number, status, quantity | Format-Table

# Save a production order ID for testing
$prodOrderId = $productionResponse.productionOrders[0].id

Write-Host "Test Production Order ID: $prodOrderId"
```

---

## 🔧 Step 4: TEST ENDPOINT 1 - Allocate Materials

```powershell
# Allocate materials to production order
$allocationBody = @{
  materials = @(
    @{
      inventory_id = $invId
      barcode = $invBarcode
      quantity = 10
    }
  )
} | ConvertTo-Json

$allocationResponse = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/manufacturing/orders/$prodOrderId/allocate-materials" `
  -Method POST `
  -Headers @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body $allocationBody

Write-Host "✅ Allocation Response:" -ForegroundColor Green
$allocationResponse | ConvertTo-Json -Depth 5
```

**Expected Response:**
```json
{
  "message": "Material allocation completed",
  "allocations": [...],
  "summary": {
    "total_requested": 1,
    "successfully_allocated": 1,
    "failed": 0
  }
}
```

---

## 🔧 Step 5: TEST ENDPOINT 2 - Get Allocated Materials

```powershell
# Get materials allocated to production order
$materialsResponse = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/manufacturing/orders/$prodOrderId/materials" `
  -Headers @{Authorization = "Bearer $token"}

Write-Host "✅ Allocated Materials:" -ForegroundColor Green
$materialsResponse.materials | Format-Table
$materialsResponse.summary | ConvertTo-Json
```

**Expected Response:**
```json
{
  "materials": [
    {
      "id": 1,
      "barcode": "INV-20250115-001",
      "quantity_allocated": 10,
      "quantity_consumed": 0,
      "status": "allocated",
      ...
    }
  ],
  "summary": {
    "total_materials": 1,
    "total_allocated": 10,
    "total_consumed": 0,
    ...
  }
}
```

---

## 🔧 Step 6: TEST ENDPOINT 3 - Barcode Scanner

```powershell
# Scan the barcode
$scanResponse = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/manufacturing/materials/scan/$invBarcode" `
  -Headers @{Authorization = "Bearer $token"}

Write-Host "✅ Barcode Scan Result:" -ForegroundColor Green
$scanResponse | ConvertTo-Json -Depth 5
```

**Expected Response:**
```json
{
  "type": "allocated_material",
  "allocation": {
    "barcode": "INV-20250115-001",
    "production_order": "PROD-2025-001",
    "quantity_allocated": 10,
    "quantity_consumed": 0,
    "quantity_remaining": 10,
    "status": "allocated"
  }
}
```

---

## 🔧 Step 7: TEST ENDPOINT 4 - Consume Material at Stage

```powershell
# First, get a stage ID from the production order
$prodOrderDetails = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/manufacturing/orders/$prodOrderId" `
  -Headers @{Authorization = "Bearer $token"}

$stageId = $prodOrderDetails.productionOrder.stages[0].id
Write-Host "Test Stage ID: $stageId"

# Consume material at that stage
$consumptionBody = @{
  barcode = $invBarcode
  quantity = 5
  wastage = 0.5
  notes = "Testing material consumption"
} | ConvertTo-Json

$consumptionResponse = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/manufacturing/stages/$stageId/consume-material" `
  -Method POST `
  -Headers @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body $consumptionBody

Write-Host "✅ Consumption Response:" -ForegroundColor Green
$consumptionResponse | ConvertTo-Json -Depth 5
```

**Expected Response:**
```json
{
  "message": "Material consumption recorded successfully",
  "allocation": {
    "barcode": "INV-20250115-001",
    "quantity_allocated": 10,
    "quantity_consumed": 5,
    "quantity_wasted": 0.5,
    "quantity_remaining": 4.5,
    "status": "in_use"
  },
  "consumption_entry": {
    "stage_id": 1,
    "stage_name": "cutting",
    "quantity": 5,
    "wastage": 0.5,
    "consumed_at": "2025-01-15T10:30:00Z",
    ...
  }
}
```

---

## 🔧 Step 8: Verify Consumption Log

```powershell
# Get materials again to see updated consumption
$updatedMaterials = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/manufacturing/orders/$prodOrderId/materials" `
  -Headers @{Authorization = "Bearer $token"}

Write-Host "✅ Updated Material Status:" -ForegroundColor Green
$updatedMaterials.materials[0] | Select-Object barcode, quantity_allocated, quantity_consumed, quantity_wasted, quantity_remaining, status | Format-Table

Write-Host "📊 Consumption Log:" -ForegroundColor Cyan
$updatedMaterials.materials[0].consumption_log | ConvertTo-Json -Depth 3
```

---

## 📊 COMPLETE TEST SCRIPT (Run All Steps)

```powershell
# Complete test script - run all at once
$baseUrl = "http://localhost:5000/api"

# 1. Login
Write-Host "🔐 Step 1: Logging in..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body (@{email="admin@example.com"; password="admin123"} | ConvertTo-Json)
$token = $loginResponse.token
Write-Host "✅ Logged in successfully!" -ForegroundColor Green

# 2. Get Inventory
Write-Host "`n📦 Step 2: Getting inventory..." -ForegroundColor Yellow
$inventory = Invoke-RestMethod -Uri "$baseUrl/inventory?limit=5" `
  -Headers @{Authorization = "Bearer $token"}
$invId = $inventory.items[0].id
$invBarcode = $inventory.items[0].barcode
Write-Host "✅ Inventory ID: $invId, Barcode: $invBarcode" -ForegroundColor Green

# 3. Get Production Order
Write-Host "`n🏭 Step 3: Getting production order..." -ForegroundColor Yellow
$production = Invoke-RestMethod -Uri "$baseUrl/manufacturing/orders?limit=5" `
  -Headers @{Authorization = "Bearer $token"}
$prodOrderId = $production.productionOrders[0].id
Write-Host "✅ Production Order ID: $prodOrderId" -ForegroundColor Green

# 4. Allocate Materials
Write-Host "`n🔧 Step 4: Allocating materials..." -ForegroundColor Yellow
$allocation = Invoke-RestMethod -Uri "$baseUrl/manufacturing/orders/$prodOrderId/allocate-materials" `
  -Method POST -Headers @{Authorization = "Bearer $token"; "Content-Type" = "application/json"} `
  -Body (@{materials=@(@{inventory_id=$invId; barcode=$invBarcode; quantity=10})} | ConvertTo-Json)
Write-Host "✅ Materials allocated!" -ForegroundColor Green
$allocation.summary | Format-Table

# 5. Get Allocated Materials
Write-Host "`n📊 Step 5: Checking allocated materials..." -ForegroundColor Yellow
$materials = Invoke-RestMethod -Uri "$baseUrl/manufacturing/orders/$prodOrderId/materials" `
  -Headers @{Authorization = "Bearer $token"}
Write-Host "✅ Allocated materials summary:" -ForegroundColor Green
$materials.summary | Format-List

# 6. Scan Barcode
Write-Host "`n🔍 Step 6: Scanning barcode..." -ForegroundColor Yellow
$scan = Invoke-RestMethod -Uri "$baseUrl/manufacturing/materials/scan/$invBarcode" `
  -Headers @{Authorization = "Bearer $token"}
Write-Host "✅ Scan result: $($scan.type)" -ForegroundColor Green
$scan.allocation | Select-Object barcode, quantity_allocated, quantity_consumed, status | Format-List

# 7. Get Stage and Consume Material
Write-Host "`n⚙️ Step 7: Consuming material at stage..." -ForegroundColor Yellow
$orderDetails = Invoke-RestMethod -Uri "$baseUrl/manufacturing/orders/$prodOrderId" `
  -Headers @{Authorization = "Bearer $token"}
$stageId = $orderDetails.productionOrder.stages[0].id
$consumption = Invoke-RestMethod -Uri "$baseUrl/manufacturing/stages/$stageId/consume-material" `
  -Method POST -Headers @{Authorization = "Bearer $token"; "Content-Type" = "application/json"} `
  -Body (@{barcode=$invBarcode; quantity=5; wastage=0.5; notes="Test consumption"} | ConvertTo-Json)
Write-Host "✅ Material consumed!" -ForegroundColor Green
$consumption.allocation | Format-List

# 8. Verify Final State
Write-Host "`n📊 Step 8: Verifying final state..." -ForegroundColor Yellow
$finalMaterials = Invoke-RestMethod -Uri "$baseUrl/manufacturing/orders/$prodOrderId/materials" `
  -Headers @{Authorization = "Bearer $token"}
Write-Host "✅ Final Material Status:" -ForegroundColor Green
$finalMaterials.materials[0] | Select-Object barcode, quantity_allocated, quantity_consumed, quantity_wasted, status | Format-List

Write-Host "`n🎉 ALL TESTS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
```

---

## ✅ SUCCESS CRITERIA

After running all tests, you should see:

1. ✅ **Materials allocated** - `reserved_quantity` increased in inventory
2. ✅ **Barcode scanning works** - Returns material location and status
3. ✅ **Material consumption recorded** - `quantity_consumed` and `quantity_wasted` updated
4. ✅ **Consumption log created** - JSON array with stage details
5. ✅ **Status changes** - From `allocated` → `in_use` → `consumed`
6. ✅ **Inventory movement created** - Audit trail exists
7. ✅ **Production order status updated** - Changed to `material_allocated`

---

## 🐛 TROUBLESHOOTING

### **Error: "Port 5000 already in use"**
```powershell
Set-Location "d:\Projects\passion-inventory\server"
.\kill-port-5000.ps1
npm start
```

### **Error: "User not authenticated"**
- Ensure you're using valid credentials
- Check if token is properly set in headers

### **Error: "Inventory item not found"**
- Ensure inventory items exist
- Check if barcodes are properly generated

### **Error: "Production order not found"**
- Create a production order first
- Or use an existing production order ID

---

**Phase 1 Status:** ✅ **READY FOR TESTING**