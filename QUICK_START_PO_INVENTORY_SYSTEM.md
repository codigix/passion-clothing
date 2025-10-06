# 🚀 Quick Start: PO to Inventory Barcode Tracking System

## ⚡ Getting Started in 5 Minutes

### Step 1: Run Database Migration
```powershell
# Navigate to server directory
Set-Location "d:\Projects\passion-inventory\server"

# Run the PO inventory tracking migration
npx sequelize-cli db:migrate --to 20250302000000-add-po-inventory-tracking.js
```

Expected output:
```
✅ Migration 20250302000000-add-po-inventory-tracking.js completed
```

### Step 2: Verify Database Tables
```powershell
# Check if tables were created
node -e "const db = require('./config/database'); db.sequelize.query('SHOW TABLES LIKE \"inventory_movements\"').then(r => console.log(r[0].length > 0 ? '✅ Table exists' : '❌ Table missing')).catch(e => console.error(e))"
```

### Step 3: Start the Application
```powershell
# From project root
Set-Location "d:\Projects\passion-inventory"

# Start both server and client
npm run dev
```

---

## 🧪 Test Workflow (End-to-End)

### **Scenario: Create PO and Add to Inventory**

#### 1. **Create a Purchase Order**
- Open browser: `http://localhost:3000`
- Login with admin credentials
- Navigate to: **Procurement → Purchase Orders → Create New**
- Fill in:
  ```
  Vendor: Select any vendor
  Customer: Select any customer (optional)
  Project Name: "Test Fabric Order"
  Priority: Medium
  ```
- Add items:
  ```
  Item 1:
    Type: Fabric
    Fabric Name: Cotton Fabric
    Color: White
    GSM: 200
    Width: 60 inches
    Quantity: 100
    Rate: 50
    UOM: Meters
  
  Item 2:
    Type: Accessories
    Item Name: Buttons
    Description: White plastic buttons
    Quantity: 500
    Rate: 2
    UOM: Pieces
  ```
- Click **"Save as Draft"**
- Note the PO Number (e.g., `PO20250302001`)

#### 2. **Approve PO and Add to Inventory**
- Open the PO you just created
- Click **"Approve & Add to Inventory"** button (green button with warehouse icon)
- In the modal:
  ```
  Warehouse Location: Main Warehouse
  Receipt Notes: First test order received
  ```
- Click **"Approve & Add to Inventory"**
- You'll be auto-redirected to the tracking page

#### 3. **Verify Inventory Creation**
You should see:
- **Summary Cards:**
  - Total Items: 2
  - Initial Quantity: 600 (100 meters + 500 pieces)
  - Current Stock: 600
  - Total Consumed: 0

- **Items Table:**
  - Row 1: Cotton Fabric with barcode `INV-YYYYMMDD-XXXXX`
  - Row 2: Buttons with barcode `INV-YYYYMMDD-YYYYY`
  - Both showing 0% usage (green progress bar)

#### 4. **View QR Code**
- Click **"View QR"** button on any item
- Modal opens with QR code
- Verify it shows:
  - Barcode
  - Batch Number (e.g., `BATCH-PO20250302001-001`)
  - Location: Main Warehouse
  - Current Stock

#### 5. **Consume Stock**
- Click **"Consume Stock"** on first item (Cotton Fabric)
- Enter:
  ```
  Quantity to Consume: 25
  Notes: Used for Production Order #123
  ```
- Click **"Consume Stock"**
- Verify:
  - Current Stock: 75 Meters (was 100)
  - Consumed: 25 Meters (was 0)
  - Usage: 25% (yellow progress bar)

#### 6. **Check Inventory Movement History**
Open browser console and check API response or view database:
```sql
SELECT * FROM inventory_movements 
WHERE inventory_id IN (
  SELECT id FROM inventory WHERE purchase_order_id = <your_po_id>
)
ORDER BY created_at DESC;
```

You should see 3 records:
1. **Inward** - Cotton Fabric received (100 meters)
2. **Inward** - Buttons received (500 pieces)
3. **Consume** - Cotton Fabric consumed (25 meters)

---

## 📋 API Testing (Using Postman/curl)

### 1. **Approve PO and Add to Inventory**
```bash
POST http://localhost:5000/api/procurement/pos/{PO_ID}/approve-and-add-to-inventory
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "warehouse_location": "Main Warehouse",
  "notes": "Test PO approval"
}
```

Expected Response:
```json
{
  "success": true,
  "message": "PO approved and 2 items added to inventory",
  "po": {
    "id": 123,
    "po_number": "PO20250302001",
    "status": "received"
  },
  "inventoryItems": [
    {
      "id": 101,
      "barcode": "INV-20250302-A1B2C3",
      "batch_number": "BATCH-PO20250302001-001",
      "product_name": "Cotton Fabric",
      "quantity": 100,
      "location": "Main Warehouse"
    }
  ]
}
```

### 2. **Get Inventory from PO**
```bash
GET http://localhost:5000/api/inventory/from-po/{PO_ID}
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

Expected Response:
```json
{
  "inventory": [
    {
      "id": 101,
      "barcode": "INV-20250302-A1B2C3",
      "batch_number": "BATCH-PO20250302001-001",
      "current_stock": 100,
      "initial_quantity": 100,
      "consumed_quantity": 0,
      "location": "Main Warehouse",
      "product": {
        "name": "Cotton Fabric",
        "sku": "FAB-1234567890-001"
      }
    }
  ],
  "summary": {
    "total_items": 2,
    "total_initial_quantity": 600,
    "total_current_quantity": 600,
    "total_consumed": 0
  }
}
```

### 3. **Consume Stock**
```bash
POST http://localhost:5000/api/inventory/item/{ITEM_ID}/consume
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "quantity": 25,
  "notes": "Used for Production Order #123",
  "consumed_by": 5
}
```

Expected Response:
```json
{
  "success": true,
  "message": "Stock consumed successfully",
  "item": {
    "id": 101,
    "current_stock": 75,
    "consumed_quantity": 25,
    "usage_percentage": 25
  },
  "movement": {
    "id": 501,
    "movement_type": "consume",
    "quantity": 25,
    "notes": "Used for Production Order #123"
  }
}
```

---

## ✅ Verification Checklist

After running the workflow, verify:

- [ ] Database migration completed successfully
- [ ] `inventory_movements` table exists
- [ ] `inventory` table has new columns: `purchase_order_id`, `barcode`, `batch_number`, etc.
- [ ] PO status changed from `draft` to `received`
- [ ] Inventory entries created (one per PO item)
- [ ] Barcodes generated (format: `INV-YYYYMMDD-XXXXX`)
- [ ] Batch numbers generated (format: `BATCH-PONUMBER-XXX`)
- [ ] QR codes display correctly
- [ ] Consume stock functionality works
- [ ] Usage percentage updates correctly
- [ ] Movement records created in database
- [ ] Frontend tracking page displays data
- [ ] Summary cards show correct totals

---

## 🐛 Common Issues & Fixes

### Issue: "Table 'inventory_movements' doesn't exist"
**Fix:**
```powershell
Set-Location "d:\Projects\passion-inventory\server"
npx sequelize-cli db:migrate
```

### Issue: "Cannot read property 'items' of null"
**Fix:** Ensure PO has items before approving. Edit PO and add at least one item.

### Issue: "Barcode is null"
**Fix:** Check `barcodeUtils.js` is in correct location:
```powershell
Test-Path "d:\Projects\passion-inventory\server\utils\barcodeUtils.js"
```

### Issue: Frontend shows "Cannot GET /inventory/from-po/123"
**Fix:** Ensure route is added to `App.jsx`:
```jsx
<Route path="/inventory/from-po/:poId" element={<POInventoryTrackingPage />} />
```
Restart client: `Ctrl+C` then `npm start`

### Issue: "User does not have required department access"
**Fix:** Ensure your user has `procurement`, `inventory`, or `admin` department access.

---

## 🎯 Success Criteria

Your system is working correctly if:

1. ✅ You can approve a PO and see "Successfully added to inventory" message
2. ✅ Tracking page shows all PO items with unique barcodes
3. ✅ QR codes can be viewed and contain correct data
4. ✅ Stock consumption reduces current quantity
5. ✅ Usage percentage updates with color coding
6. ✅ Summary cards show accurate totals
7. ✅ Movement history tracks all changes

---

## 📊 What to Expect

**After approving a PO with 3 items:**

| Metric | Expected Value |
|--------|---------------|
| Inventory entries created | 3 |
| Unique barcodes generated | 3 |
| Batch numbers generated | 3 |
| Movement records (inward) | 3 |
| PO status | `received` |
| Initial total quantity | Sum of all item quantities |
| Current stock | Same as initial (before consumption) |
| Usage percentage | 0% (green) |

**After consuming 30% of an item:**

| Field | Before | After |
|-------|--------|-------|
| Current Stock | 100 | 70 |
| Consumed Quantity | 0 | 30 |
| Usage Percentage | 0% (green) | 30% (yellow) |
| Movement Records | 1 (inward) | 2 (inward + consume) |

---

## 🔄 Testing Multiple Scenarios

### Scenario 1: Partial Consumption
- Create PO with 100 units
- Consume 10 units → Stock: 90, Usage: 10%
- Consume 20 units → Stock: 70, Usage: 30%
- Consume 40 units → Stock: 30, Usage: 70%

### Scenario 2: Multiple Warehouses
- Create PO #1 → Send to "Warehouse A"
- Create PO #2 → Send to "Fabric Storage"
- Verify tracking page shows different locations

### Scenario 3: Large Order
- Create PO with 10+ items
- Approve and add to inventory
- Verify all items appear on tracking page
- Test pagination if implemented

---

## 📞 Need Help?

If something doesn't work:

1. **Check server logs:**
   ```powershell
   Get-Content "d:\Projects\passion-inventory\server.log" -Tail 50
   ```

2. **Check browser console:**
   - Press F12 → Console tab
   - Look for red error messages

3. **Verify database connection:**
   ```powershell
   Set-Location "d:\Projects\passion-inventory\server"
   node -e "require('./config/database').sequelize.authenticate().then(() => console.log('✅ Connected')).catch(e => console.error('❌', e.message))"
   ```

4. **Test backend endpoint directly:**
   ```powershell
   # Get your JWT token from localStorage
   # Then test API with curl or Postman
   ```

---

**Happy Testing! 🎉**

Your complete PO → Inventory → Barcode Tracking system is ready to use!