# GRN Form Pre-fill Verification Guide

## ✅ How It Should Work

When you create a GRN from a Purchase Order, the form should **automatically pre-fill**:

### 📋 **PO Information Card (Read-Only Display)**
- ✅ PO Number (e.g., `PO-2025-001`)
- ✅ Vendor Name
- ✅ PO Date
- ✅ Customer/Project Name
- ✅ Total Items Count
- ✅ PO Amount (₹)

### 📦 **Items Table (Auto-populated from PO)**
For each item in the PO:
- ✅ Material Name (Fabric/Item name)
- ✅ Specifications (Color, GSM)
- ✅ UOM (Meters/Kgs/Pieces)
- ✅ **Ordered Qty** (from PO) - Read-only background color
- ✅ **Invoiced Qty** (defaults to ordered, editable)
- ✅ **Received Qty** (defaults to ordered, editable)

### ✏️ **What You Need to Fill**
- Received Date (defaults to today)
- Vendor Challan Number (optional)
- Supplier Invoice Number (required)
- Adjust Invoiced Qty (if vendor invoice differs from PO)
- Adjust Received Qty (from physical count)
- Weight & Remarks (optional)

---

## 🧪 **Step-by-Step Test**

### **1. Login as Inventory User**
```
Email: inventory@pashion.com
Password: inventory123
```

### **2. Navigate to GRN Workflow**
- Dashboard → Click **"Goods Receipt (GRN)"** in sidebar
- You should see **Pending GRN Creation** tab with a badge showing count (e.g., "3")

### **3. Initiate GRN Creation**
- Look for a row with a Purchase Order
- Click the green **"Create GRN"** button
- You should be navigated to: `/inventory/grn/create?po_id=123`

### **4. Verify Pre-filled Data**

#### ✅ **Check PO Information Card**
Should display at the top:
```
┌─────────────────────────────────────────┐
│ 📄 Purchase Order Details               │
├─────────────────────────────────────────┤
│ PO Number:    PO-2025-001               │
│ Vendor:       ABC Fabrics Pvt Ltd       │
│ PO Date:      12/01/2025                │
│ Customer:     XYZ Industries            │
│ Total Items:  3                         │
│ PO Amount:    ₹45,000                   │
└─────────────────────────────────────────┘
```

#### ✅ **Check Items Table**
Should show all PO items with data:
```
╔════════════════════════════════════════════════════════════════╗
║ Material    │ Specs          │ Ordered │ Invoiced │ Received ║
╠════════════════════════════════════════════════════════════════╣
║ Cotton      │ Blue, 180 GSM  │ 1000    │ 1000*    │ 1000*   ║
║ Polyester   │ Red, 200 GSM   │ 500     │ 500*     │ 500*    ║
║ Silk        │ Green, 150 GSM │ 750     │ 750*     │ 750*    ║
╚════════════════════════════════════════════════════════════════╝
```
* = Editable fields (prefilled with PO quantity)

---

## ❌ **If Pre-fill Is NOT Working**

### **Symptom 1: Empty Form / No PO Data**
#### Check Browser Console (F12)
```javascript
// Expected: Success
✅ GET /api/procurement/pos/123 → 200 OK

// Error Example:
❌ GET /api/procurement/pos/123 → 404 Not Found
❌ GET /api/procurement/pos/123 → 403 Forbidden
❌ GET /api/procurement/pos/123 → 500 Internal Server Error
```

#### **Fix for 403 Forbidden:**
- Issue: Inventory user doesn't have permission to view POs
- **Solution:** Update API endpoint permission

**Edit:** `server/routes/procurement.js` (Line ~842)
```javascript
// BEFORE (restrictive):
router.get('/pos/:id', authenticateToken, checkDepartment(['procurement', 'admin']), async (req, res) => {

// AFTER (allow inventory access):
router.get('/pos/:id', authenticateToken, checkDepartment(['procurement', 'admin', 'inventory']), async (req, res) => {
```

Then **restart server**:
```powershell
# Stop server
netstat -ano | findstr :5000
Stop-Process -Id <PID> -Force

# Start server
Set-Location "d:\Projects\passion-inventory\server"; npm start
```

#### **Fix for 404 Not Found:**
- Issue: PO ID is invalid or doesn't exist
- Check if `po_id` parameter is being passed correctly in URL

---

### **Symptom 2: PO Data Loads But Items Are Empty**
#### Check Console:
```javascript
console.log('PO Data:', purchaseOrder);
console.log('Items:', purchaseOrder.items);
```

#### **Potential Issues:**
1. **PO has no items:** Check database
   ```sql
   SELECT id, po_number, items FROM purchase_orders WHERE id = 123;
   ```

2. **Items field is NULL/empty array:** Items not saved during PO creation

3. **JSON parsing issue:** Items stored as string instead of JSON array

---

### **Symptom 3: Form Loads Then Shows Error**
#### Check Console Error:
```javascript
// Common error:
❌ TypeError: Cannot read property 'map' of undefined
❌ TypeError: po.items is undefined
```

#### **Fix in Code:**
The CreateGRNPage should handle missing items gracefully.

**Check:** `client/src/pages/inventory/CreateGRNPage.jsx` (Line ~35)
```javascript
// Ensure this line exists:
const items = (po.items || []).map((item, index) => ({
  // ... mapping code
}));
```

---

## 🔍 **Debug Checklist**

### **1. Verify User Permissions**
```sql
-- Check inventory user permissions
SELECT u.id, u.name, u.department, u.status
FROM users u
WHERE u.email = 'inventory@pashion.com';
```

### **2. Verify PO Data Exists**
```sql
-- Check PO with items
SELECT 
  id,
  po_number,
  vendor_id,
  status,
  JSON_LENGTH(items) as item_count,
  items
FROM purchase_orders
WHERE id = 123; -- Replace with actual PO ID
```

### **3. Check API Response Format**
Open browser DevTools → Network tab → Click "Create GRN" → Check:
```json
{
  "purchaseOrder": {
    "id": 123,
    "po_number": "PO-2025-001",
    "vendor": {
      "id": 5,
      "name": "ABC Fabrics"
    },
    "items": [
      {
        "type": "fabric",
        "fabric_name": "Cotton",
        "color": "Blue",
        "gsm": "180",
        "quantity": "1000",
        "uom": "Meters"
      }
    ]
  }
}
```

### **4. Check React Component State**
Add temporary console logs in `CreateGRNPage.jsx`:
```javascript
useEffect(() => {
  if (poId) {
    console.log('🔍 Fetching PO with ID:', poId);
    fetchPurchaseOrder();
  }
}, [poId]);

const fetchPurchaseOrder = async () => {
  try {
    setLoading(true);
    const response = await api.get(`/procurement/pos/${poId}`);
    console.log('✅ PO Data received:', response.data);
    const po = response.data.purchaseOrder || response.data;
    console.log('📦 PO Object:', po);
    console.log('📋 Items:', po.items);
    setPurchaseOrder(po);
    // ... rest of code
  } catch (error) {
    console.error('❌ Error fetching PO:', error.response || error);
  }
};
```

---

## 🎯 **Expected Behavior Summary**

1. **Click "Create GRN"** → Navigate to `/inventory/grn/create?po_id=123`
2. **Component mounts** → Extracts `po_id` from URL
3. **API call** → `GET /api/procurement/pos/123`
4. **Response received** → Parse PO data
5. **State updated** → `setPurchaseOrder(po)`
6. **Items mapped** → Convert PO items to GRN item format
7. **Form rendered** → All fields pre-filled ✅

---

## 📞 **Common Questions**

### **Q: Can I create GRN without a PO?**
No, the current workflow requires:
1. Sales Order → Approved
2. Purchase Order → Created & Approved
3. GRN Request → Auto-created
4. GRN → Create from request

### **Q: What if invoiced quantity differs from PO?**
- **Invoiced Qty** field is editable
- Enter the quantity from vendor's invoice
- System will detect discrepancy in 3-way matching

### **Q: What if received quantity is less than ordered?**
- **Received Qty** field is editable
- Enter actual physical count
- System will auto-create vendor return request for shortages

### **Q: Can I edit material names or specs?**
No, these are locked to PO data for traceability. If there's an error, correct the PO first.

---

## ✅ **Success Indicators**

You know pre-fill is working when:
- ✅ PO details card shows immediately (no "Loading...")
- ✅ Items table populates with all PO items
- ✅ Ordered quantities match PO
- ✅ Vendor name displays correctly
- ✅ All color-coded columns (blue/orange/green) show data

---

## 🐛 **Still Not Working?**

### **Option 1: Check Server Logs**
```powershell
Get-Content "d:\Projects\passion-inventory\server_error.log" -Tail 50
```

### **Option 2: Test API Directly**
Use Postman or curl:
```bash
curl -X GET http://localhost:5000/api/procurement/pos/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### **Option 3: Verify Database Connection**
```javascript
// In server console (or add to index.js temporarily)
const { PurchaseOrder } = require('./config/database');
PurchaseOrder.findByPk(123).then(po => console.log('PO:', po));
```

---

## 📝 **Report Issues**

If pre-fill still doesn't work, provide:
1. **Browser console errors** (screenshot or copy-paste)
2. **Network tab** showing API request/response
3. **PO ID** you're testing with
4. **User department** you're logged in as
5. **Server logs** if any errors appear

---

**Last Updated:** After username → email field fix
**Status:** ✅ API Fixed, Testing Pre-fill Flow