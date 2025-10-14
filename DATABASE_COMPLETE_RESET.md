# 🔥 Complete Database Reset Guide

## ⚠️ WARNING: This Will Delete EVERYTHING!

This guide provides tools to **completely reset your database** by truncating all tables.

**What will be DELETED:**
- ❌ All user accounts (including admin)
- ❌ All sales orders
- ❌ All purchase orders
- ❌ All production requests and orders
- ❌ All inventory items and products
- ❌ All customers and vendors
- ❌ All notifications, attendance, and history
- ❌ **EVERYTHING** in the database

**Use this only when:**
- Starting fresh in development
- Testing database migrations
- Cleaning test data before production
- You have a backup and want to restore clean state

---

## 🚀 Quick Start (Choose ONE method)

### Method 1: PowerShell Script (EASIEST) ⭐ Recommended

```powershell
cd d:\Projects\passion-clothing
.\reset-database.ps1
```

**What it does:**
- ✅ Creates automatic backup
- ✅ Shows current data counts
- ✅ Asks for confirmation
- ✅ Truncates all tables
- ✅ Offers to run seeders
- ✅ Provides restore instructions

**Safety features:**
- Must type "DELETE EVERYTHING" to proceed
- Creates timestamped backup file
- Shows summary of what was deleted

---

### Method 2: SQL Script (Manual)

```bash
# 1. Create backup first (IMPORTANT!)
mysqldump -u root -p passion_erp > backup_$(date +%Y%m%d).sql

# 2. Review what will be deleted
mysql -u root -p passion_erp -e "
  SELECT 'users' as table_name, COUNT(*) as count FROM users
  UNION ALL SELECT 'sales_orders', COUNT(*) FROM sales_orders
  UNION ALL SELECT 'production_requests', COUNT(*) FROM production_requests;
"

# 3. Execute truncate (⚠️ DELETES EVERYTHING)
mysql -u root -p passion_erp < truncate-all-tables.sql

# 4. Run seeders to create admin user
cd server
node seeders/seed.js
cd ..

# 5. Restart server
cd server
npm start
```

---

### Method 3: Node.js Script (Alternative)

```bash
# From project root
cd d:\Projects\passion-clothing
node reset-database.js
```

**Requirements:**
- Node.js installed
- Server dependencies installed (`npm install` in server folder)
- Database credentials in `.env` file

---

## 📋 Step-by-Step Manual Process

If you prefer maximum control:

### Step 1: Create Backup

```bash
mysqldump -u root -p passion_erp > backup_before_reset.sql
```

**Verify backup created:**
```bash
ls -lh backup_before_reset.sql
```

### Step 2: Check Current Data

```sql
-- Connect to database
mysql -u root -p passion_erp

-- Check important tables
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'sales_orders', COUNT(*) FROM sales_orders
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'production_requests', COUNT(*) FROM production_requests
UNION ALL SELECT 'inventory', COUNT(*) FROM inventory;
```

### Step 3: Truncate Tables

```sql
-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all tables
TRUNCATE TABLE production_approvals;
TRUNCATE TABLE material_verifications;
TRUNCATE TABLE material_receipts;
TRUNCATE TABLE material_dispatches;
TRUNCATE TABLE production_stage_operations;
TRUNCATE TABLE production_stages;
TRUNCATE TABLE production_orders;
TRUNCATE TABLE production_requests;
TRUNCATE TABLE rejections;
TRUNCATE TABLE material_request_materials;
TRUNCATE TABLE material_requests;
TRUNCATE TABLE grn_verifications;
TRUNCATE TABLE grns;
TRUNCATE TABLE purchase_order_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE vendors;
TRUNCATE TABLE sales_order_items;
TRUNCATE TABLE sales_orders;
TRUNCATE TABLE customers;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE project_materials;
TRUNCATE TABLE inventory;
TRUNCATE TABLE products;
TRUNCATE TABLE challan_items;
TRUNCATE TABLE challans;
TRUNCATE TABLE shipments;
TRUNCATE TABLE outsourcing_orders;
TRUNCATE TABLE store_stock_movements;
TRUNCATE TABLE store_stock;
TRUNCATE TABLE payments;
TRUNCATE TABLE invoices;
TRUNCATE TABLE sample_order_items;
TRUNCATE TABLE sample_orders;
TRUNCATE TABLE notifications;
TRUNCATE TABLE attendance;
TRUNCATE TABLE user_roles;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;
TRUNCATE TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
```

### Step 4: Verify All Empty

```sql
SELECT COUNT(*) FROM users;        -- Should be 0
SELECT COUNT(*) FROM sales_orders; -- Should be 0
SELECT COUNT(*) FROM inventory;    -- Should be 0
```

### Step 5: Seed Fresh Data

```bash
cd server
node seeders/seed.js
```

### Step 6: Restart Server

```bash
cd server
npm start
```

---

## 🔄 Restore from Backup

If you need to undo the reset:

```bash
# Stop the server first
# Then restore backup
mysql -u root -p passion_erp < backup_before_reset.sql

# Restart server
cd server
npm start
```

---

## 📊 Verification Queries

After reset, verify database is clean:

```sql
-- All should return 0
SELECT 'Users' as item, COUNT(*) as count FROM users
UNION ALL SELECT 'Sales Orders', COUNT(*) FROM sales_orders
UNION ALL SELECT 'Purchase Orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'Production Requests', COUNT(*) FROM production_requests
UNION ALL SELECT 'Production Orders', COUNT(*) FROM production_orders
UNION ALL SELECT 'Inventory', COUNT(*) FROM inventory
UNION ALL SELECT 'Products', COUNT(*) FROM products
UNION ALL SELECT 'Customers', COUNT(*) FROM customers
UNION ALL SELECT 'Vendors', COUNT(*) FROM vendors;
```

After running seeders:

```sql
-- Should have default data
SELECT COUNT(*) as user_count FROM users;  -- Should be 1 (admin)
SELECT COUNT(*) as role_count FROM roles;  -- Should be 5+
SELECT email, name FROM users;  -- Check admin exists
```

---

## 🆘 Troubleshooting

### Error: "Cannot truncate table due to foreign key constraint"

**Solution:** The scripts handle this automatically with `SET FOREIGN_KEY_CHECKS = 0`

If running manual commands, always start with:
```sql
SET FOREIGN_KEY_CHECKS = 0;
-- ... your TRUNCATE commands ...
SET FOREIGN_KEY_CHECKS = 1;
```

### Error: "Table doesn't exist"

**Solution:** Normal - some tables may not exist yet. Scripts skip missing tables.

### Error: "Access denied for user"

**Solution:** Check MySQL credentials:
```bash
# Test connection
mysql -u root -p
# Enter password when prompted
```

### Server won't start after reset

**Solution:**
1. Run seeders first: `cd server && node seeders/seed.js`
2. Check server logs: `tail -f server.log`
3. Verify database connection in `.env`

---

## ✅ Post-Reset Checklist

- [ ] Backup created before truncate
- [ ] All tables truncated successfully
- [ ] Seeders ran successfully
- [ ] Admin user exists (check with SQL)
- [ ] Server starts without errors
- [ ] Can login with admin credentials
- [ ] Dashboard loads correctly

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

**⚠️ Change these immediately in production!**

---

## 📁 Files Created

| File | Purpose | When to Use |
|------|---------|-------------|
| `truncate-all-tables.sql` | SQL script to truncate all tables | Manual SQL execution |
| `reset-database.ps1` | PowerShell automation script | Windows users (easiest) |
| `reset-database.js` | Node.js reset script | Alternative to PowerShell |
| `DATABASE_COMPLETE_RESET.md` | This documentation | Reference guide |

---

## 🎯 Common Use Cases

### Use Case 1: Testing Fresh Install
```powershell
.\reset-database.ps1
# Follow prompts, type "DELETE EVERYTHING"
# Run seeders when prompted
# Login with admin@example.com / admin123
```

### Use Case 2: Clean Duplicate Production Requests (⚠️ Overkill!)

**Better option:** Use the duplicate cleanup script instead!
```bash
.\fix-duplicate-production-requests.ps1
```

Only use complete reset if you want to start completely fresh.

### Use Case 3: Before Production Deployment

```bash
# 1. Backup production data
mysqldump -u root -p passion_erp > prod_backup_$(date +%Y%m%d).sql

# 2. Test reset on development first
.\reset-database.ps1

# 3. Verify everything works
# 4. Only then consider for production (rarely needed)
```

---

## ⚠️ Safety Reminders

1. **ALWAYS create backup first**
2. **Never run on production without backup**
3. **Test on development environment first**
4. **Verify backup can be restored before proceeding**
5. **Communicate with team before reset**
6. **Schedule maintenance window for production**

---

## 📞 Support

If you encounter issues:

1. **Check server logs:** `tail -f d:\Projects\passion-clothing\server.log`
2. **Test database connection:** `mysql -u root -p passion_erp -e "SELECT 1"`
3. **Verify backup exists:** `ls -lh backup_*.sql`
4. **Review this documentation:** Read the troubleshooting section

---

## 🔗 Related Documentation

- `DUPLICATE_PRODUCTION_REQUEST_QUICK_FIX.md` - Clean only duplicate production requests
- `DATABASE_RESET_GUIDE.md` - General database management
- `server/seeders/seed.js` - Seeder script details
- `.zencoder/rules/repo.md` - System architecture overview

---

**Remember:** This is a destructive operation. Always have a backup! 🔥