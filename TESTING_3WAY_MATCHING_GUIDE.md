# 🧪 Testing Guide: 3-Way Matching GRN Workflow

## ✅ Setup Status
- ✅ Database table `vendorreturn` created (23 columns)
- ✅ VendorReturn model loaded
- ✅ API routes registered at `/api/vendor-returns`
- ✅ Enhanced GRN creation with 3-way matching
- ✅ Frontend UI with color-coded quantity columns

---

## 📋 Prerequisites

### 1. Ensure Server is Running
```powershell
cd d:\Projects\passion-inventory\server
npm start
```

### 2. Ensure Client is Running
```powershell
cd d:\Projects\passion-inventory\client
npm start
```

### 3. Login as Admin User
Navigate to `http://localhost:3000/login`

---

## 🎯 Test Scenario 1: Perfect Match (No Discrepancies)

### Objective
Verify that when all three quantities match, GRN is created without vendor return.

### Steps
1. **Navigate to Purchase Orders**
   - Go to `/procurement/purchase-orders`
   - Filter by status: "Approved"

2. **Select a PO and Create GRN**
   - Click "Create GRN" button on any approved PO
   - You'll be redirected to Create GRN page

3. **Enter Matching Quantities**
   ```
   Item: Cotton Fabric - White
   Ordered Qty:  100.00 meters  [Auto-filled from PO]
   Invoiced Qty: 100.00 meters  [Enter same as ordered]
   Received Qty: 100.00 meters  [Enter same as ordered]
   ```

4. **Observe UI**
   - ✓ Row should NOT be highlighted red/yellow
   - ✓ Status badge shows: "✓ Perfect Match"
   - ✓ Summary card shows: "Perfect Matches: 1"
   - ✓ NO shortage alert banner

5. **Submit GRN**
   - Click "Create GRN & Proceed to Verification"
   - ✓ Success message: "GRN created successfully"
   - ✓ NO vendor return should be created

### Expected Result
✅ GRN created normally, inventory will be added after verification

---

## 🎯 Test Scenario 2: Shortage Detection (Auto Vendor Return)

### Objective
Verify automatic vendor return creation when shortage is detected.

### Steps
1. **Navigate to Purchase Orders**
   - Go to `/procurement/purchase-orders`
   - Click "Create GRN" on approved PO

2. **Enter Quantities with Shortage**
   ```
   Item: Polyester Fabric - Blue
   Ordered Qty:  100.00 meters  [Auto-filled from PO]
   Invoiced Qty:  95.00 meters  [Vendor claimed 95m on invoice]
   Received Qty:  90.00 meters  [Actually received only 90m]
   ```

3. **Observe UI Changes**
   - 🔴 Row background turns RED
   - ⚠️ Status badge shows: "⚠️ SHORT: 10.00"
   - 📊 Summary card shows:
     - Shortages: 1
     - Shortage vs Order: 10.00 meters
   - 🚨 Alert banner appears:
     ```
     ⚠️ Shortage Detected!
     A vendor return request will be automatically created.
     Total Shortage Value: ₹1,500.00
     ```

4. **Submit GRN**
   - Click "Create GRN & Proceed to Verification"
   - ✓ Success message with shortage info

5. **Verify Vendor Return Created**
   - Open API endpoint: `http://localhost:5000/api/vendor-returns`
   - Or check database table: `vendorreturn`

### Expected Response
```json
{
  "data": [
    {
      "id": 1,
      "return_number": "VR-20250110-00001",
      "return_type": "shortage",
      "status": "pending",
      "total_shortage_value": 1500.00,
      "items": [
        {
          "material_name": "Polyester Fabric - Blue",
          "ordered_qty": 100.00,
          "invoiced_qty": 95.00,
          "received_qty": 90.00,
          "shortage_qty": 10.00,
          "shortage_value": 1500.00,
          "reason": "Shortage detected during GRN verification"
        }
      ],
      "purchase_order_id": 123,
      "vendor_id": 45,
      "grn_id": 67,
      "created_at": "2025-01-10T10:30:00.000Z"
    }
  ]
}
```

### Expected Result
✅ GRN created with shortage flag  
✅ Vendor return auto-created with status "pending"  
✅ Notification sent to procurement team  
✅ Only 90 meters will be added to inventory (after verification)

---

## 🎯 Test Scenario 3: Overage Detection

### Objective
Verify overage flagging when received quantity exceeds ordered/invoiced.

### Steps
1. **Enter Quantities with Overage**
   ```
   Item: Cotton Thread - Black
   Ordered Qty:  100.00 meters  [Auto-filled from PO]
   Invoiced Qty: 100.00 meters  [Vendor invoiced 100m]
   Received Qty: 105.00 meters  [Received extra 5m]
   ```

2. **Observe UI**
   - 🟡 Row background turns YELLOW
   - ⚠️ Status badge shows: "⚠️ OVER: 5.00"
   - Summary card shows: "Overages: 1"

3. **Submit GRN**
   - Overage is flagged but GRN can be created
   - Warehouse supervisor should investigate

### Expected Result
✅ GRN created with overage flag  
⚠️ Requires supervisor approval  
ℹ️ All 105 meters will be added to inventory (bonus from vendor)

---

## 🎯 Test Scenario 4: Invoice Mismatch

### Objective
Verify detection when vendor's invoice doesn't match PO.

### Steps
1. **Enter Quantities with Invoice Mismatch**
   ```
   Item: Buttons - White
   Ordered Qty:  1000 pieces  [Auto-filled from PO]
   Invoiced Qty:  950 pieces  [Vendor invoiced less]
   Received Qty:  950 pieces  [Received as per invoice]
   ```

2. **Observe UI**
   - 🟠 Orange highlighting for invoice mismatch
   - Status shows: "⚠️ Invoice≠PO"
   - Summary shows: "Invoice Mismatches: 1"

3. **Submit GRN**
   - Both shortage AND invoice mismatch are flagged

### Expected Result
✅ GRN created  
✅ Vendor return auto-created for 50 pieces shortage  
⚠️ Accounting notified about invoice vs PO discrepancy

---

## 🧮 Understanding the 3-Way Matching Logic

### Shortage Detection
```javascript
hasShortage = received_qty < min(ordered_qty, invoiced_qty)
shortage_qty = min(ordered_qty, invoiced_qty) - received_qty
```

**Example:**
- Ordered: 100m, Invoiced: 95m, Received: 90m
- Shortage: 90 < min(100, 95) = 90 < 95 ✓
- Shortage Qty: 95 - 90 = 5m (vs invoice) + 10m (vs PO)

### Overage Detection
```javascript
hasOverage = received_qty > max(ordered_qty, invoiced_qty)
overage_qty = received_qty - max(ordered_qty, invoiced_qty)
```

**Example:**
- Ordered: 100m, Invoiced: 100m, Received: 105m
- Overage: 105 > max(100, 100) = 105 > 100 ✓
- Overage Qty: 105 - 100 = 5m

### Invoice Mismatch
```javascript
invoiceMismatch = invoiced_qty ≠ ordered_qty
```

**Example:**
- Ordered: 1000 pcs, Invoiced: 950 pcs
- Mismatch: 1000 ≠ 950 ✓
- Difference: 50 pcs

---

## 🔍 Verification Steps

### 1. Check Database Table
```sql
SELECT * FROM vendorreturn;
```

### 2. Check API Endpoints
```powershell
# List all vendor returns
curl http://localhost:5000/api/vendor-returns

# Get single vendor return
curl http://localhost:5000/api/vendor-returns/1

# Update status
curl -X PATCH http://localhost:5000/api/vendor-returns/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "acknowledged",
    "vendor_response": "Will send replacement shipment",
    "resolution_type": "replacement"
  }'
```

### 3. Check Frontend UI
- Navigate to Create GRN page
- Verify 3 quantity columns are visible
- Verify color coding works
- Verify real-time summary updates

---

## 🐛 Troubleshooting

### Issue: Table not found
**Solution:** Run sync script
```powershell
node server/scripts/testVendorReturnsSetup.js
```

### Issue: Foreign key constraint error
**Solution:** Ensure these tables exist:
- `purchase_orders`
- `goodsreceiptnote`
- `vendors`
- `users`

### Issue: UI not showing 3 columns
**Solution:** Clear browser cache and refresh
```powershell
Ctrl + Shift + Delete → Clear cache → Refresh
```

### Issue: Vendor return not auto-creating
**Solution:** Check server logs
```powershell
# Check server console for errors
# Verify GRN route is processing invoiced_qty field
```

---

## 📊 Sample Test Data

If you need to create test data, use this script:

```javascript
// server/scripts/createTestData.js
const { PurchaseOrder, Vendor, User } = require('../config/database');

async function createTestData() {
  // Create test vendor
  const vendor = await Vendor.create({
    name: 'Test Fabric Supplier',
    company_name: 'ABC Textiles Pvt Ltd',
    email: 'supplier@abc.com',
    phone: '9876543210',
    vendor_type: 'supplier',
    category: 'fabric',
    status: 'active',
    created_by: 1
  });

  // Create test PO
  const po = await PurchaseOrder.create({
    po_number: 'PO-2025-TEST-001',
    vendor_id: vendor.id,
    items: [
      {
        material_name: 'Cotton Fabric - White',
        quantity: 100,
        unit: 'meters',
        unit_price: 150,
        total_price: 15000
      }
    ],
    total_amount: 15000,
    final_amount: 15000,
    status: 'approved',
    created_by: 1,
    approved_by: 1,
    po_date: new Date()
  });

  console.log('✅ Test data created!');
  console.log(`   Vendor ID: ${vendor.id}`);
  console.log(`   PO Number: ${po.po_number}`);
}

createTestData();
```

---

## ✅ Success Criteria

- [ ] Perfect match creates GRN without vendor return
- [ ] Shortage auto-creates vendor return with correct values
- [ ] Overage is flagged with yellow highlighting
- [ ] Invoice mismatch is detected and flagged
- [ ] Vendor return has unique return number (VR-YYYYMMDD-XXXXX)
- [ ] Status workflow works (pending → acknowledged → resolved)
- [ ] UI shows 3 color-coded quantity columns
- [ ] Real-time summary updates correctly
- [ ] Alert banner appears for shortages
- [ ] API endpoints respond correctly

---

## 🚀 Next Steps

Once testing is complete:

1. **Create Vendor Returns Management UI**
   - List page: `/procurement/vendor-returns`
   - Detail page: `/procurement/vendor-returns/:id`
   - Status update modal

2. **Email Notifications**
   - Auto-email vendor when return created
   - Email procurement team for approval

3. **Reports Dashboard**
   - Vendor performance metrics
   - Shortage trends analysis
   - Invoice accuracy reports

4. **Photo Upload**
   - Add photo capture during GRN creation
   - Evidence for shortage/damage claims

5. **Vendor Portal**
   - Allow vendors to view returns
   - Submit responses/acknowledgments
   - Track resolution status

---

**Ready to test!** 🚀

Start with Scenario 1 (Perfect Match) and work your way through all scenarios.