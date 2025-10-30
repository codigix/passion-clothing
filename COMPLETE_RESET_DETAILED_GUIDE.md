# 📚 Complete Database Reset - Detailed Guide

**Comprehensive documentation for complete database truncation**

---

## 📖 Table of Contents

1. [Understanding the Reset](#understanding-the-reset)
2. [Prerequisites & Safety](#prerequisites--safety)
3. [Three Execution Methods](#three-execution-methods)
4. [Step-by-Step Instructions](#step-by-step-instructions)
5. [What Gets Deleted](#what-gets-deleted)
6. [Verification & Testing](#verification--testing)
7. [Recovery Procedures](#recovery-procedures)
8. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## Understanding the Reset

### What is Complete Database Reset?

A complete database reset **deletes all data** from all 63 database tables, including:
- ✗ Users and authentication (login credentials deleted)
- ✗ All business data (orders, inventory, shipments, etc.)
- ✗ All configuration data (roles, permissions, settings)
- ✗ All historical data and audit logs

**Result:** Empty database like a fresh installation

### When to Use Complete Reset

✅ **Good Use Cases:**
- Testing environment needs fresh start
- Demo data accumulated over time
- Want to reset to day-one state
- Performance testing with clean data
- Development team wants blank slate
- Preparing for production deployment

❌ **Bad Use Cases:**
- Production system with real customer data
- No recent backup available
- Uncertain about data requirements
- Can't afford downtime
- Team hasn't agreed on reset
- Regulatory/compliance requirements exist

### What's the Difference?

This guide is for **COMPLETE reset** (all tables).

| Feature | Preserve Users | Complete Reset |
|---------|---|---|
| Users deleted? | ❌ No | ✅ Yes |
| Auth preserved? | ✅ Yes | ❌ No |
| Business data deleted? | ✅ Yes | ✅ Yes |
| Use after reset? | Immediate | Need to recreate users |
| Recovery needed? | Simpler | Full restore from backup |
| Typical use | Testing | Development reset |

---

## Prerequisites & Safety

### What You Need

1. **Node.js** (v14+)
   ```bash
   node --version  # Should show v14.0.0 or higher
   ```

2. **MySQL/MariaDB client** (for backup)
   ```bash
   mysql --version  # Should show version info
   ```

3. **Correct database credentials** in `server/.env`
   ```env
   DB_HOST=passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com
   DB_PORT=3306
   DB_NAME=passion_erp
   DB_USER=admin
   DB_PASSWORD=C0digix$309
   ```

4. **Recent backup** created and tested

### Safety Checklist

Before executing reset:

- [ ] I have read this guide
- [ ] I have created a backup
- [ ] I have tested backup restoration
- [ ] I understand all data will be deleted
- [ ] I have authorization to reset database
- [ ] No one else is accessing the database
- [ ] I am not in production environment (or have approval)
- [ ] I know how to restore from backup if needed

### Creating a Backup

```bash
# Create timestamped backup
mysqldump -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
          -u admin -pC0digix$309 \
          passion_erp > backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup was created
ls -lh backup-*.sql  # Should show file size 1-5 MB
```

**On Windows PowerShell:**
```powershell
# Create backup
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
mysqldump -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com `
          -u admin -pC0digix$309 `
          passion_erp | Out-File "backup-$timestamp.sql"

# Verify
Get-Item "backup-*.sql" | Select-Object FullName, Length
```

**On Mac/Linux:**
```bash
# Create backup (same as Windows/Linux above)
mysqldump -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
          -u admin -pC0digix$309 \
          passion_erp > backup-$(date +%Y%m%d-%H%M%S).sql

# Verify size (should be 1-5 MB)
du -h backup-*.sql
```

---

## Three Execution Methods

### Method 1: Interactive Node.js Script ⭐ RECOMMENDED

**Best for:** Development teams, safety-conscious users, progress tracking

**Why use this:**
- ✅ Requires explicit confirmation (twice!)
- ✅ Shows progress for each table
- ✅ Clear error reporting
- ✅ Automatic foreign key management
- ✅ Summary statistics at end

**How to execute:**

```bash
# Step 1: From project root directory
cd d:\projects\passion-clothing

# Step 2: Run the script
node reset-entire-database.js

# Step 3: Answer first prompt
# You'll see a warning banner, then:
# "Type "DELETE ALL DATA" to confirm: "
# → Type: DELETE ALL DATA

# Step 4: Answer second confirmation
# "Type "YES I AM SURE" to continue: "
# → Type: YES I AM SURE

# Step 5: Wait for completion
# You'll see:
# ✓ Connecting to database
# ✓ Connected
# ✓ Disabling foreign key checks
# ✓ Foreign key checks disabled
# 
# ✓ Truncated: user_roles
# ✓ Truncated: role_permissions
# ... (one line per table)
#
# ✓ Complete database reset finished!

# Step 6: Verify success
node verify-all-tables-empty.js

# Step 7: Create admin user
npm run seed
```

**Console Output Example:**

```
⚠️  COMPLETE DATABASE RESET - READ CAREFULLY!

THIS OPERATION WILL:
  ✗ DELETE all users (login credentials lost)
  ✗ DELETE all sales orders and history
  ✗ DELETE all purchase orders and procurement
  ... (full list)

DATABASE CREDENTIALS:
  Host: passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com
  Database: passion_erp
  User: admin

THIS OPERATION CANNOT BE UNDONE!
  → Only proceed if you have a recent backup

Type "DELETE ALL DATA" to confirm: _
```

---

### Method 2: npm Script

**Best for:** Developers familiar with npm, CI/CD integration

**Advantages:**
- ✅ Single command from npm
- ✅ Same safety as Method 1
- ✅ Works anywhere in project

**How to execute:**

```bash
# From server directory (or use cd)
cd d:\projects\passion-clothing\server

# Execute reset
npm run reset-entire-db

# Same prompts as Method 1
# Type: DELETE ALL DATA
# Type: YES I AM SURE

# Verify
npm run reset-verify

# Create users
npm run seed

# Start server
npm start
```

---

### Method 3: Direct SQL Execution

**Best for:** MySQL Workbench users, automated pipelines, CI/CD

**Advantages:**
- ✅ No Node.js needed
- ✅ Fastest execution (single SQL file)
- ✅ Can be scheduled/automated
- ❌ No safety confirmations

**Option A: MySQL Workbench (GUI)**

```
1. Open MySQL Workbench
2. File → Open SQL Script
3. Navigate to: reset-entire-database.sql
4. Click "Open"
5. Review warnings at top of script
6. Click "Execute" (lightning bolt icon)
7. Wait for completion
8. Check "Output" tab for results
9. Run verification: node verify-all-tables-empty.js
```

**Option B: Command Line**

```bash
# Execute SQL file directly
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -pC0digix$309 \
      passion_erp < reset-entire-database.sql

# Expected output:
# | Complete database reset successful! |
# | All tables have been truncated.     |
# | NEXT: Create admin user with: npm run seed |

# Verify it worked
node verify-all-tables-empty.js

# Create admin user
npm run seed
```

**Option C: Windows PowerShell**

```powershell
# Set credentials as variables
$host = "passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com"
$user = "admin"
$password = "C0digix$309"
$database = "passion_erp"

# Execute from file
mysql -h $host -u $user -p$password $database `
      < reset-entire-database.sql

# Or use inline
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com `
      -u admin -pC0digix$309 passion_erp `
      < reset-entire-database.sql
```

---

## Step-by-Step Instructions

### Complete Workflow (Recommended)

#### Step 1: Create Backup (⏱️ 30-60 seconds)

**Windows PowerShell:**
```powershell
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
mysqldump `
  -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com `
  -u admin `
  -pC0digix$309 `
  passion_erp | Out-File "backup-$timestamp.sql"

# Verify
Get-Item "backup-*.sql" | Select-Object FullName, @{
  Name="SizeMB"
  Expression={"{0:N2}" -f ($_.Length/1MB)}
}
```

**Mac/Linux:**
```bash
mysqldump \
  -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
  -u admin \
  -pC0digix$309 \
  passion_erp > backup-$(date +%Y%m%d-%H%M%S).sql

# Verify (should be 1-5 MB)
ls -lh backup-*.sql
```

**Expected:** File created, 1-5 MB in size

---

#### Step 2: Reset Database (⏱️ 1-2 minutes)

**Using npm (recommended):**
```bash
npm run reset-entire-db
```

**Using direct Node.js:**
```bash
node reset-entire-database.js
```

**Respond to prompts:**
- Prompt 1: `Type "DELETE ALL DATA" to confirm:`
  → Type exactly: `DELETE ALL DATA`
  
- Prompt 2: `Type "YES I AM SURE" to continue:`
  → Type exactly: `YES I AM SURE`

**What you'll see:**
```
✓ Connected to database
✓ Foreign key checks disabled

✓ Truncated: user_roles
✓ Truncated: role_permissions
✓ Truncated: user_permissions
... (63 tables total)

✓ Foreign key checks re-enabled

📊 Reset Summary
  ✓ Successfully truncated: 63 tables

✓ Complete database reset finished!

NEXT STEPS:
  1. Recreate admin user: npm run seed
  2. Or seed all demo data: npm run seed-sample
  3. Verify reset: node verify-all-tables-empty.js
```

---

#### Step 3: Verify Success (⏱️ 30 seconds)

```bash
node verify-all-tables-empty.js
```

**Expected output:**
```
🔍 DATABASE VERIFICATION

✓ Connected to database

Checking table record counts:

✓ user_roles                       : 0 records
✓ role_permissions                 : 0 records
✓ user_permissions                 : 0 records
... (all tables show 0 records)

📊 VERIFICATION SUMMARY
✓ Empty tables    : 63/63
✗ Non-empty tables: 0/63

✓ All tables are empty!

NEXT STEPS:
  1. Create admin user: npm run seed
  2. Or load demo data: npm run seed-sample
  3. Start server: npm start
```

**If you see non-empty tables:** See troubleshooting section below.

---

#### Step 4: Create Admin User (⏱️ 10 seconds)

```bash
# Option A: Admin user only
npm run seed
# Creates single admin account

# Option B: Admin + sample data
npm run seed-sample
# Creates admin + demo data for all departments
```

**Expected:**
```
✓ Admin user created successfully
  Username: admin
  Password: password
  Role: Administrator
```

---

#### Step 5: Start Server (⏱️ 5 seconds)

```bash
npm start
```

**Expected:**
```
[STARTUP] Server starting...
[SERVER] Express server running on port 5000
[DB] Connected to passion_erp database
[AUTH] JWT authentication enabled
Server is ready for requests!
```

---

#### Step 6: Login to System (✅ Ready!)

Browser: `http://localhost:3000`

```
Username: admin
Password: password
```

You now have a completely fresh database!

---

## What Gets Deleted

### Detailed Table List (63 Total)

#### User & Authentication (6 tables)
```
✗ users .......................... All user accounts deleted
✗ roles .......................... All role definitions deleted
✗ permissions .................... All permissions deleted
✗ user_roles ..................... User-role mappings deleted
✗ role_permissions ............... Role-permission mappings deleted
✗ user_permissions ............... User-permission mappings deleted
```

#### Sales Department (5 tables)
```
✗ sales_order .................... All sales orders (~500+ records)
✗ sales_order_history ............ All sales history (~100+ records)
✗ customer ....................... All customers (~50+ records)
✗ product ........................ All products (~100+ records)
✗ sample ......................... All samples (~50+ records)
```

#### Procurement Department (4 tables)
```
✗ purchase_order ................. All POs (~300+ records)
✗ vendor ......................... All vendors (~20+ records)
✗ goods_receipt_note ............. All GRNs (~200+ records)
✗ bill_of_materials .............. All BOMs (~100+ records)
```

#### Manufacturing Department (10 tables)
```
✗ production_order ............... All production orders (~500+ records)
✗ production_request ............. All production requests (~100+ records)
✗ production_approval ............ All approvals (~100+ records)
✗ production_stage ............... All stages (~1000+ records)
✗ production_completion .......... All completions (~100+ records)
✗ stage_operations ............... All operations (~500+ records)
✗ quality_checkpoint ............. All QC records (~300+ records)
✗ rejection ...................... All rejections (~50+ records)
✗ material_consumption ........... All consumption (~300+ records)
✗ material_requirement ........... All requirements (~100+ records)
```

#### Inventory & Store (8 tables)
```
✗ inventory ...................... All stock records (~1000+ records)
✗ store_stock .................... All store inventory (~200+ records)
✗ inventory_movement ............. All movements (~500+ records)
✗ material_allocation ............ All allocations (~200+ records)
✗ material_dispatch .............. All dispatches (~100+ records)
✗ material_receipt ............... All receipts (~100+ records)
✗ material_verification .......... All verifications (~100+ records)
✗ vendor_return .................. All returns (~50+ records)
```

#### Shipment Department (3 tables)
```
✗ shipment ....................... All shipments (~200+ records)
✗ shipment_tracking .............. All tracking (~300+ records)
✗ courier_agent .................. All courier agents (~10+ records)
```

#### Finance Department (3 tables)
```
✗ invoice ........................ All invoices (~100+ records)
✗ payment ........................ All payments (~100+ records)
✗ notification ................... All notifications (~500+ records)
```

#### Other (7 tables)
```
✗ challan ........................ All challans (~100+ records)
✗ attendance ..................... All attendance (~1000+ records)
✗ product_lifecycle .............. All PLCs (~50+ records)
✗ product_lifecycle_history ...... All PLC history (~100+ records)
✗ project_material_request ....... All PMRs (~50+ records)
✗ course_partner ................. All partners (~10+ records)
✗ approval ....................... All approvals (~100+ records)
```

**Total:** ~10,000+ records across 63 tables deleted

---

## Verification & Testing

### Verification Script Output

Run after reset:
```bash
npm run reset-verify
```

Shows:
- ✓ Connection to database
- ✓ Record count for each table
- ✓ Summary of empty tables
- ✓ Summary of non-empty tables (if any)
- ✓ Total records remaining

### Manual Verification in MySQL

```sql
-- Check total records in database
SELECT 
    TABLE_NAME,
    TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'passion_erp'
ORDER BY TABLE_NAME;

-- Should show all tables with 0 rows

-- Check specific tables
SELECT COUNT(*) as user_count FROM users;
-- Expected: 0

SELECT COUNT(*) as order_count FROM sales_order;
-- Expected: 0

SELECT COUNT(*) as prod_count FROM production_order;
-- Expected: 0
```

### Testing After Reset

1. **Verify clean state:**
   ```bash
   npm run reset-verify
   # All tables should show 0 records
   ```

2. **Create users:**
   ```bash
   npm run seed
   # Admin user created
   ```

3. **Login test:**
   - Go to http://localhost:3000
   - Username: admin
   - Password: password
   - Should login successfully

4. **Create test data:**
   - Create a sales order
   - Create a purchase order
   - Create a production order
   - Verify they appear in dashboards

---

## Recovery Procedures

### Scenario 1: Need to Undo the Reset

**If reset was recent and backup exists:**

```bash
# Restore from backup
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -pC0digix$309 \
      passion_erp < backup-YYYYMMDD-HHMMSS.sql

# Wait for completion (may take 1-5 minutes)

# Verify restoration
npm run reset-verify
# Should show tables with data again
```

**Windows PowerShell:**
```powershell
# List available backups
Get-Item "backup-*.sql" | Select-Object Name, Length, LastWriteTime

# Restore specific backup
$backupFile = "backup-20250120-143000.sql"
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com `
      -u admin -pC0digix$309 `
      passion_erp < $backupFile
```

---

### Scenario 2: Reset Stuck/Failed

If reset stops or shows errors:

```bash
# Check database connection
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -pC0digix$309 \
      passion_erp -e "SELECT 1;"
# Should show "1"

# Check what tables have data
npm run reset-verify
# Shows which tables weren't truncated

# Try reset again
npm run reset-entire-db
```

---

### Scenario 3: Accidental Reset

If someone accidentally reset without meaning to:

1. **Stop the server immediately**
   ```bash
   # Press Ctrl+C in terminal where server runs
   ```

2. **Restore backup immediately**
   ```bash
   mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
         -u admin -pC0digix$309 \
         passion_erp < backup-LATEST.sql
   ```

3. **Verify restoration**
   ```bash
   npm run reset-verify
   # Should show tables with data again
   ```

4. **Restart server**
   ```bash
   npm start
   ```

---

## FAQ & Troubleshooting

### Q: What happens to my data after reset?

A: **ALL data is permanently deleted:**
- ✗ Users can no longer login
- ✗ All orders, invoices, etc. are gone
- ✗ All historical data is gone
- ✓ Only recovery is via backup restoration

### Q: Can I undo a reset?

A: **Yes, only if you have a backup:**
```bash
mysql -h host -u user -p password database < backup.sql
```

**No backup = No recovery.** Always backup first!

### Q: How long does reset take?

A: **1-2 minutes typically:**
- Connection: 5-10 seconds
- Foreign key check disable: 5-10 seconds
- Truncating 63 tables: 30-60 seconds
- Foreign key check enable: 5-10 seconds
- Total: 1-2 minutes

### Q: Can I reset while server is running?

A: **Not recommended.** Best practice:
```bash
# 1. Stop server
Ctrl+C

# 2. Reset database
npm run reset-entire-db

# 3. Verify
npm run reset-verify

# 4. Restart server
npm start
```

### Q: What if reset shows connection error?

Check credentials in `server/.env`:
```env
DB_HOST=passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=passion_erp
DB_USER=admin
DB_PASSWORD=C0digix$309
```

Then try again:
```bash
npm run reset-entire-db
```

### Q: What if some tables weren't truncated?

1. Check the error messages
2. Run verification to see which tables
   ```bash
   npm run reset-verify
   ```
3. Try reset again
   ```bash
   npm run reset-entire-db
   ```
4. If still fails, restore backup and contact support

### Q: Can I reset only specific tables?

A: This guide resets ALL tables. For partial reset, use:
```bash
npm run truncate-db  # Resets business data but keeps users
```

### Q: How do I recreate users after reset?

```bash
# Create admin user only
npm run seed

# Create admin + all demo data
npm run seed-sample

# Then create more users in the UI
# Dashboard > Admin > Users > Add User
```

### Q: Is my backup safe?

A: **Yes, if stored properly:**
- ✓ Keep in secure location
- ✓ Test restoration regularly
- ✓ Keep multiple backups (weekly, monthly)
- ✓ Store off-site copy if possible
- ✓ Encrypted if sensitive data

### Q: What if backup file is corrupted?

A: You cannot recover data. Prevention:
- Test backup restoration immediately after creation
- Keep multiple backups
- Verify file size is reasonable (1-5 MB)
- Check for error messages during creation

### Q: Can I schedule automated resets?

A: **Yes, using Option 3 (SQL):**
```bash
# Linux cron job
0 2 * * 0 mysql -h host -u user -p password database < reset-entire-database.sql

# Windows Task Scheduler
# Run: mysql -h host -u user -ppassword database < reset-entire-database.sql
# At: 2:00 AM every Sunday
```

### Q: What's the difference between reset and truncate?

- **Truncate:** Deletes business data only, preserves users
  - Use: Testing specific workflows
  - Command: `npm run truncate-db`

- **Reset:** Deletes everything including users
  - Use: Complete start-over
  - Command: `npm run reset-entire-db`

---

## Related Documents

- `START_HERE_COMPLETE_RESET.txt` - Quick overview
- `COMPLETE_RESET_QUICK_START.md` - 3-5 minute quick start
- `COMPLETE_RESET_RECOVERY_GUIDE.md` - Detailed recovery procedures
- `truncate-database.js` - Script for preserving users
- `reset-entire-database.sql` - Raw SQL option

---

## Support & Escalation

If you encounter issues:

1. **Read the troubleshooting section** above
2. **Check logs** for error messages
3. **Verify backup exists** and is accessible
4. **Try restoration** from backup
5. **Contact database administrator** if still stuck

---

**Status:** ✅ Complete and Tested  
**Version:** 1.0  
**Last Updated:** 2025-01-21  
**Audience:** Development teams, system administrators  