# Database Truncation Guide

## Overview

This guide provides safe, step-by-step instructions to truncate all tables in your Passion ERP database **except the users table** and related system tables.

---

## 🔴 **IMPORTANT WARNINGS**

⚠️ **This action will DELETE ALL production data!**
- ❌ Cannot be undone
- ❌ No backups will be created automatically
- ✅ **ONLY user accounts, roles, and permissions are preserved**

### Before You Proceed:
1. **✅ Backup your database** (recommended)
2. **✅ Ensure only you have access** (prevent accidental execution)
3. **✅ Document what you're deleting** (for compliance)
4. **✅ Run in non-production first** (if possible)

---

## 📋 Tables That Will Be TRUNCATED

**Business/Transaction Data (ALL DELETED):**
- sales_orders
- purchase_orders
- production_orders
- production_stages
- production_requests
- production_completions
- production_approvals
- shipments
- shipment_tracking
- inventory
- goods_receipt_notes
- challans
- invoices
- payments
- material_allocations
- material_consumptions
- material_requirements
- material_verification
- material_receipt
- material_dispatch
- vendor_returns
- rejections
- quality_checkpoints
- stage_operations
- bill_of_materials
- project_material_requests
- store_stocks
- samples
- attendances
- notifications
- approvals
- customers
- vendors
- products
- product_lifecycles
- product_lifecycle_histories
- courier_partners
- courier_agents
- inventory_movements
- sales_order_history

---

## ✅ Tables That Will Be PRESERVED

**System/User Data (KEPT INTACT):**
- 👥 **users** - All user accounts with passwords, roles, permissions
- 🔐 **roles** - System roles (Admin, Manager, etc.)
- 🔑 **permissions** - System permissions
- 🔗 **user_roles** - User-to-role mappings
- 🔗 **role_permissions** - Role-to-permission mappings
- 🔗 **user_permissions** - Direct user permissions

---

## ⚙️ Method 1: Using Node.js Script (RECOMMENDED)

### Step 1: Ensure Dependencies
```bash
npm install mysql2/promise
```

### Step 2: Run the Truncation Script
```bash
# Option A: Using npm script (if configured)
npm run truncate-db

# Option B: Direct Node.js execution
node truncate-database.js
```

### Step 3: Respond to Prompts

The script will ask:

1. **Confirmation Prompt:**
   ```
   Type "TRUNCATE ALL" to confirm:
   ```
   → Type: `TRUNCATE ALL`

2. **Safety Confirmation:**
   ```
   ⚠️  This action CANNOT be undone. 
   Type "YES I AM SURE" to proceed:
   ```
   → Type: `YES I AM SURE`

### Step 4: Monitor Progress
```
🚀 Starting truncation...

🔒 Disabling foreign key checks...
   Done!

   ✅ sales_orders                    - TRUNCATED
   ✅ purchase_orders                 - TRUNCATED
   ✅ production_orders               - TRUNCATED
   ... (more tables)

🔓 Re-enabling foreign key checks...
   Done!

📊 TRUNCATION SUMMARY
✅ Successfully truncated: 63 tables
❌ Errors: 0 tables
✓  Preserved: 6 tables (users, roles, permissions, etc.)

🎉 Database truncation complete!
```

---

## ⚙️ Method 2: Using Raw SQL Script

### Option A: MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. File → Open SQL Script
4. Select `truncate-all-tables-except-users.sql`
5. **Execute** (⚠️ Review before executing!)
6. Confirm result messages

### Option B: MySQL Command Line
```bash
# Connect to database
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin \
      -p \
      passion_erp < truncate-all-tables-except-users.sql

# When prompted, enter password: C0digix$309
```

### Option C: Connect via GUI Client
1. Execute SQL from file: `truncate-all-tables-except-users.sql`
2. Review the output

---

## 🔍 Verify Truncation Success

### Check Table Counts
```sql
-- Run this query to verify all data is cleared

SELECT 
  table_name,
  table_rows,
  CASE 
    WHEN table_rows = 0 THEN '✅ CLEARED'
    ELSE '❌ HAS DATA'
  END as status
FROM information_schema.tables
WHERE table_schema = 'passion_erp'
  AND table_name NOT IN ('users', 'roles', 'permissions', 'user_roles', 'role_permissions', 'user_permissions')
ORDER BY table_name;
```

### Check User Preservation
```sql
-- Verify users table is intact
SELECT COUNT(*) as user_count FROM users;

-- Verify roles
SELECT COUNT(*) as role_count FROM roles;

-- Verify permissions
SELECT COUNT(*) as permission_count FROM permissions;
```

---

## 📊 Database State After Truncation

### Users Preserved
- All user accounts remain intact
- All passwords remain valid
- User roles and permissions unchanged
- Next login will work normally

### System Ready for Fresh Data
- All transaction data cleared
- All inventory/stock cleared
- All orders/shipments cleared
- All production records cleared
- Foreign key relationships preserved (schema intact)

### What's Lost
- ❌ All sales orders
- ❌ All purchase orders
- ❌ All inventory quantities
- ❌ All production history
- ❌ All shipment records
- ❌ All financial transactions
- ❌ All audit logs (except ShipmentTracking schema)

---

## ⚠️ Recovery Options

### If Truncation Was Accidental:

#### Option 1: From Database Backup
```bash
# Restore from backup (if available)
mysql -h [host] -u [user] -p passion_erp < backup.sql
```

#### Option 2: From Version Control
If you had data in version control or exports:
```bash
# Re-import from export file
mysql -h [host] -u [user] -p passion_erp < exported-data.sql
```

#### Option 3: Contact Support
- Database Administrator
- Cloud Provider (AWS RDS automated backups)
- IT Department

---

## 🛡️ Best Practices

### Before Truncation:
1. **Create a backup:**
   ```bash
   mysqldump -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
             -u admin -p passion_erp > backup-$(date +%Y%m%d-%H%M%S).sql
   ```

2. **Document the reason:**
   - Create issue/ticket explaining why
   - Note the date/time
   - List what will be lost

3. **Notify stakeholders:**
   - Inform team members
   - Update project documentation
   - Note system downtime

4. **Test in staging first:**
   - Create a staging database copy
   - Run truncation there first
   - Verify no unexpected consequences

### After Truncation:
1. **Verify integrity:**
   ```bash
   node truncate-database.js --verify
   ```

2. **Run migrations:**
   ```bash
   npm run migrate
   ```

3. **Verify system boot:**
   ```bash
   npm start
   ```

4. **Test critical flows:**
   - User login (should work)
   - Create new sales order (should work with empty inventory)
   - Create new purchase order (should work with empty vendors)

---

## 🚨 Troubleshooting

### Error: "Foreign Key Constraint Fails"
**Solution:**
```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Run truncation
SET FOREIGN_KEY_CHECKS = 1;
```

### Error: "Access Denied for User"
**Solution:**
- Check database credentials in `.env`
- Verify user has TRUNCATE privilege:
```sql
GRANT TRUNCATE ON passion_erp.* TO 'admin'@'%';
```

### Error: "Table Does Not Exist"
**Solution:**
- Schema might differ from expectations
- Check actual table names:
```sql
SHOW TABLES IN passion_erp;
```

### Error: "Connection Timeout"
**Solution:**
- Check database is running
- Verify network connectivity
- Check .env database configuration
- Test connection manually:
```bash
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com -u admin -p
```

---

## 📞 Support & Questions

**Need help?**
- Review `.env` database configuration
- Check database user permissions
- Verify database is running
- Test MySQL connection independently
- Contact Database Administrator

---

## 📋 Checklist for Execution

```
Pre-Execution:
☐ Database backup created
☐ Stakeholders notified
☐ Reason for truncation documented
☐ Test run completed (if applicable)
☐ Read all warnings above
☐ Understood what will be deleted

During Execution:
☐ Using correct database (not production if applicable)
☐ Node.js script running OR SQL file ready
☐ Monitoring truncation progress
☐ No errors in console output

Post-Execution:
☐ Verified all data cleared (except users)
☐ Verified users table still intact
☐ Verified system can still boot
☐ Verified users can still login
☐ Documented completion in issue/ticket
☐ Notified stakeholders of completion
```

---

## 📝 Examples

### Complete Workflow Example
```bash
# 1. Backup first
mysqldump -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
          -u admin -p passion_erp > backup-$(date +%Y%m%d).sql

# 2. Run truncation
node truncate-database.js

# 3. Respond to prompts (type: TRUNCATE ALL, then YES I AM SURE)

# 4. Verify success
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -p passion_erp -e \
      "SELECT COUNT(*) as users FROM users; SELECT COUNT(*) as sales_orders FROM sales_orders;"

# 5. Expected output:
# users        | 5
# sales_orders | 0 (cleared!)
```

---

## 📚 Additional Resources

- [MySQL TRUNCATE Documentation](https://dev.mysql.com/doc/refman/8.0/en/truncate-table.html)
- [Sequelize Raw Queries](https://sequelize.org/docs/v6/other-topics/raw-queries/)
- [MySQL Backup & Restore](https://dev.mysql.com/doc/refman/8.0/en/backup-and-recovery.html)

---

**Last Updated:** 2025-01-14
**Status:** ✅ Ready for Use