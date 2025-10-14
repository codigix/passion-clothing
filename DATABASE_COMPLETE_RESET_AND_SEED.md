# 🔄 Complete Database Reset and Seed Guide

## Overview
This guide helps you **completely reset** your database and fill it with fresh sample data. This is useful when:
- You want to start with a clean slate
- Your database has corrupted data
- You're setting up a new development environment
- You want to test the system with fresh data

---

## 🚀 Quick Start (One Command)

### Complete Reset with All Data
```powershell
cd server
npm run reset-all
```

**This single command will:**
1. ✅ Truncate all tables (remove all data)
2. ✅ Seed roles and permissions
3. ✅ Create 10 default users (one per department)
4. ✅ Create 3 sample customers
5. ✅ Create 3 sample vendors
6. ✅ Create 5 sample products

---

## 📋 Default Users Created

After running the reset, you can login with these credentials:

| Department      | Email                      | Password          | Role         |
|-----------------|----------------------------|-------------------|--------------|
| **Admin**       | admin@pashion.com          | admin123          | Super Admin  |
| Sales           | sales@pashion.com          | sales123          | Manager      |
| Procurement     | procurement@pashion.com    | procurement123    | Manager      |
| Manufacturing   | manufacturing@pashion.com  | manufacturing123  | Manager      |
| Inventory       | inventory@pashion.com      | inventory123      | Manager      |
| Outsourcing     | outsourcing@pashion.com    | outsourcing123    | Manager      |
| Shipment        | shipment@pashion.com       | shipment123       | Manager      |
| Store           | store@pashion.com          | store123          | Manager      |
| Finance         | finance@pashion.com        | finance123        | Manager      |
| Samples         | samples@pashion.com        | samples123        | Manager      |

---

## 🎯 Step-by-Step Commands

### Option 1: Complete Reset (Recommended)
```powershell
cd server
npm run reset-all
```
**Does everything in one go!**

### Option 2: Manual Step-by-Step

#### Step 1: Truncate All Tables
```powershell
cd server
npm run reset-db
```

#### Step 2: Seed Roles and Permissions
```powershell
npm run seed
```

#### Step 3: Seed Sample Data
```powershell
npm run seed-sample
```

---

## 📊 What Data Gets Created?

### 1. Roles (21 total)
- **10 Departments** × 2 roles each (User + Manager):
  - sales_user, sales_manager
  - procurement_user, procurement_manager
  - manufacturing_user, manufacturing_manager
  - inventory_user, inventory_manager
  - outsourcing_user, outsourcing_manager
  - shipment_user, shipment_manager
  - store_user, store_manager
  - finance_user, finance_manager
  - admin_user, admin_manager
  - samples_user, samples_manager
- **1 Super Admin**: super_admin

### 2. Permissions (~30 total)
- User management (CRUD)
- Sales orders (CRUD + approve)
- Purchase orders (CRUD + approve)
- Production orders (CRUD)
- Inventory items (CRUD)
- Products (CRUD)
- Attendance (CRU)
- Reports (read + export)

### 3. Users (10 total)
- 1 Super Admin
- 9 Department Managers (one for each department)

### 4. Customers (3 total)
- ABC Textiles Pvt Ltd (Mumbai)
- XYZ Garments Ltd (Delhi)
- Fashion Hub Retail (Bangalore)

### 5. Vendors (3 total)
- Premium Fabrics India (Surat) - Fabric Supplier
- Quality Threads Ltd (Ludhiana) - Accessories Supplier
- Metro Accessories Pvt Ltd (Noida) - Accessories Supplier

### 6. Products (5 total)
- Cotton T-Shirt (Garment)
- Denim Jeans (Garment)
- Cotton Fabric (Material)
- Polyester Thread (Material)
- Metal Buttons (Accessory)

---

## 🛠️ Available NPM Scripts

```json
{
  "reset-all": "Complete reset + seed everything (recommended)",
  "reset-db": "Only truncate tables",
  "seed": "Only seed roles and permissions",
  "seed-sample": "Only seed sample data (users, customers, vendors)"
}
```

---

## ⚠️ Important Notes

### 1. Data Loss Warning
**This will DELETE ALL DATA in your database!**
- All sales orders
- All purchase orders
- All production data
- All inventory records
- Everything!

**Make sure you want to do this before proceeding!**

### 2. Foreign Key Constraints
The reset script properly handles foreign key constraints by:
1. Disabling foreign key checks
2. Truncating all tables
3. Re-enabling foreign key checks

### 3. Server Restart
After running the reset, you should restart your server:
```powershell
npm run dev
```

---

## 🔍 Troubleshooting

### Problem: Permission Denied
**Solution:** Make sure your MySQL user has proper permissions
```sql
GRANT ALL PRIVILEGES ON passion_erp.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Problem: Cannot Connect to Database
**Solution:** Check your `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=passion_erp
DB_USER=root
DB_PASSWORD=root
```

### Problem: Script Fails Midway
**Solution:** Run commands separately:
```powershell
# 1. Reset first
npm run reset-db

# 2. Then seed roles
npm run seed

# 3. Then seed sample data
npm run seed-sample
```

---

## 📝 Script Files

### Location
All scripts are in: `server/scripts/`

### Files
- **resetDatabase.js** - Truncates all tables
- **seed.js** - Seeds roles and permissions
- **seedSampleData.js** - Seeds customers, vendors, basic admin user
- **completeReset.js** - Runs all above + creates department users and products

---

## 🎯 After Reset Checklist

- [ ] Run the reset: `npm run reset-all`
- [ ] Restart server: `npm run dev`
- [ ] Login with admin@pashion.com / admin123
- [ ] Verify all departments are accessible
- [ ] Check sample customers exist
- [ ] Check sample vendors exist
- [ ] Check sample products exist
- [ ] Start creating your data!

---

## 🚀 Quick Test After Reset

### 1. Login
```
Email: admin@pashion.com
Password: admin123
```

### 2. Navigate to Each Module
- ✅ Sales Orders
- ✅ Purchase Orders
- ✅ Inventory
- ✅ Manufacturing
- ✅ Customers
- ✅ Vendors

### 3. Create Test Order
1. Go to Sales → Create Order
2. Select customer: ABC Textiles Pvt Ltd
3. Add product: Cotton T-Shirt
4. Submit

---

## 💡 Pro Tips

### 1. Development Workflow
```powershell
# Reset database daily during development
npm run reset-all && npm run dev
```

### 2. Custom Seed Data
Edit these files to add your own sample data:
- `server/scripts/seedSampleData.js` - Add more customers/vendors
- `server/scripts/completeReset.js` - Add more products

### 3. Production Safety
**Never run these scripts in production!**
Add this check to your scripts:
```javascript
if (process.env.NODE_ENV === 'production') {
  console.error('Cannot reset production database!');
  process.exit(1);
}
```

---

## 📞 Need Help?

If you encounter issues:
1. Check server logs: `server/server.log`
2. Verify database connection
3. Check MySQL service is running
4. Verify .env configuration

---

## ✅ Success Indicators

After a successful reset, you should see:
```
✅ Connected to MySQL database
✅ Foreign key checks disabled
✅ Found XX tables
✅ All tables truncated
✅ Foreign key checks enabled
✅ Sequelize models synced
✅ Ensured 21 roles exist
✅ Ensured XX permissions exist
✅ Sample customers created
✅ Sample vendors created
✅ Created department users
✅ Created sample products

🎉 DATABASE RESET COMPLETED!
```

---

**Last Updated:** January 2025  
**Maintained by:** Zencoder Assistant