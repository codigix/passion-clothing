# 🔧 Fix 500 Error: Run Database Migration

## ⚠️ Problem
The server is throwing a 500 error because the database is **missing required columns** that the code expects.

---

## ✅ **SOLUTION: Run This Command**

### **Step 1: Stop Your Server**
Press `Ctrl+C` in the terminal running the backend server.

---

### **Step 2: Run the Migration**

```powershell
Set-Location "d:\Projects\passion-inventory\server"
npx sequelize-cli db:migrate
```

**What this does:**
- Adds `purchase_order_id` column to `inventory` table
- Adds `po_item_index` column to `inventory` table
- Adds `initial_quantity` column to `inventory` table
- Adds `consumed_quantity` column to `inventory` table
- Creates `inventory_movements` table
- Adds proper indexes

---

### **Step 3: Restart Server**

```powershell
# From server directory
npm start
```

**Or from root directory:**
```powershell
Set-Location "d:\Projects\passion-inventory"
npm run dev
```

---

### **Step 4: Hard Refresh Browser**
Press `Ctrl+Shift+R` (or `Ctrl+F5`)

---

### **Step 5: Test It**
1. Go to **Procurement → Purchase Orders**
2. Click **"Approve & Add to Inventory"** on any PO
3. Should work without 500 error ✅

---

## 🔍 **Verify Migration Ran Successfully**

After running the migration, you should see:

```
Sequelize CLI [Node: X.X.X, CLI: X.X.X, ORM: X.X.X]

Loaded configuration file "config/config.js".
Using environment "development".
== 20250302000000-add-po-inventory-tracking: migrating =======
== 20250302000000-add-po-inventory-tracking: migrated (X.XXXs)
```

---

## ❌ **If Migration Fails**

If you get an error like "column already exists", the migration might have partially run. Try:

```powershell
# Check database directly
Set-Location "d:\Projects\passion-inventory\server"
node -e "
const { sequelize } = require('./config/database');
sequelize.query('DESCRIBE inventory').then(([results]) => {
  console.log('Inventory table columns:');
  console.log(results.map(r => r.Field).join(', '));
  process.exit(0);
});
"
```

If you see `purchase_order_id`, `po_item_index`, `initial_quantity`, `consumed_quantity` in the output, the migration already ran successfully.

---

## 📋 **What Changed**

**Files Modified:**
- ✅ `server/models/Inventory.js` - Added missing model fields
- ✅ `server/routes/procurement.js` - Enhanced error logging
- ✅ `server/index.js` - Fixed CORS (already done)

**Database Changes (after migration):**
- ✅ 4 new columns in `inventory` table
- ✅ New `inventory_movements` table
- ✅ Foreign key relationships
- ✅ Proper indexes for performance

---

## 🎯 **Quick Troubleshooting**

### **Error: "Cannot find module 'sequelize-cli'"**
```powershell
npm install --save-dev sequelize-cli
```

### **Error: "Access denied for user"**
Check your `server/.env` file has correct database credentials:
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=passion_erp
```

### **Error: "Unknown database 'passion_erp'"**
Create the database first:
```sql
CREATE DATABASE passion_erp;
```

---

**Run the migration and restart - the 500 error should be gone!** 🚀