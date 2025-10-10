# 🚀 Quick Start: Inventory & Product Merge

## ⚡ 5-Minute Setup

Follow these steps to activate the new unified inventory system:

### Step 1: Install Dependencies (2 minutes)

```powershell
# Install backend barcode library
cd d:\Projects\passion-inventory\server
npm install bwip-js

# Install frontend barcode library
cd d:\Projects\passion-inventory\client
npm install react-barcode
```

### Step 2: Run Migration (1 minute)

```powershell
cd d:\Projects\passion-inventory\server
node scripts/runMergeProductsInventory.js
```

**Expected Output:**
```
🔄 Starting Products → Inventory Migration...
📝 Running UP migration...
✅ Migration completed successfully!
```

### Step 3: Restart Server (1 minute)

```powershell
cd d:\Projects\passion-inventory
npm run dev
```

### Step 4: Access New Features (1 minute)

Open your browser and navigate to:
- **Enhanced Inventory Dashboard**: `http://localhost:3000/inventory`
- **Test with existing data**

## 🎯 Quick Test Checklist

- [ ] Can you see the new 3-tab interface (All Stock | Factory Stock | Project Stock)?
- [ ] Can you view inventory statistics on dashboard?
- [ ] Can you click on a barcode icon and see the barcode?
- [ ] Can you send a material to manufacturing?
- [ ] Can you see project materials list (if you have sales orders)?

## 📱 Key Features to Try

### 1. View All Inventory
```
1. Go to /inventory
2. See All Stock tab
3. View stats cards at top
```

### 2. Add New Material
```
1. Click "Add Item" button
2. Fill in: Product Name, Category, Quantity, Location
3. Choose "Factory Stock" or "Project Stock"
4. Submit - Barcode auto-generated!
```

### 3. Send to Manufacturing
```
1. Find any material with stock > 0
2. Click 🚚 icon
3. Enter quantity
4. Confirm - Stock deducted permanently
```

### 4. View Project Materials
```
1. Click "Project Stock" tab
2. See list of projects
3. Click on any project
4. See detailed material dashboard
```

### 5. Print Barcode
```
1. Click 🔍 icon on any material
2. See barcode modal
3. Click "Print"
```

## 🔧 Troubleshooting

### Migration Error?
```powershell
# Check database connection
cd d:\Projects\passion-inventory\server
node test-db-connection.js
```

### Barcode Not Showing?
```powershell
# Ensure react-barcode is installed
cd d:\Projects\passion-inventory\client
npm install react-barcode --save
```

### Server Not Starting?
```powershell
# Check if port 5000 is already in use
# Kill existing process
Set-Location d:\Projects\passion-inventory\server
.\kill-port-5000.ps1
```

## 📊 What Changed?

### Database:
- ✅ Inventory table now has product fields
- ✅ New field: `sales_order_id` for project linking
- ✅ Existing products migrated to inventory
- ✅ Auto-generated barcodes for all items

### Backend:
- ✅ New API endpoints for project tracking
- ✅ Material dispatch with permanent deduction
- ✅ Barcode generation endpoints
- ✅ Stock history tracking

### Frontend:
- ✅ New Enhanced Inventory Dashboard
- ✅ New Project Material Dashboard
- ✅ Barcode display/print functionality
- ✅ Send to Manufacturing modals

## 🎉 You're Ready!

The system is now fully operational. You can:
- Manage all stock in one place (Inventory)
- Track materials by project (Sales Order)
- Send materials to manufacturing with real-time deduction
- View/print barcodes for all items
- Track complete stock history

## 📚 Full Documentation

For detailed information, see: `INVENTORY_PRODUCT_MERGE_COMPLETE.md`

---

**Need Help?** Check server logs at `server/server.log` or browser console for errors.