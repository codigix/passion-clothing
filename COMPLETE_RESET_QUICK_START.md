# 🚀 Complete Database Reset - Quick Start

**Time Required:** 3-5 minutes  
**Difficulty:** Easy  
**Risk Level:** High (data loss)  
**Reversibility:** Via backup restore

---

## ⚠️ What This Does

Deletes **ALL data** from **ALL 63 tables** including:
- Users, roles, permissions
- Sales orders, customers
- Purchase orders, vendors
- Production orders, manufacturing data
- Shipments, inventory, stock
- Invoices, payments, financial data
- Everything else

**After this: Database is completely empty. Start from scratch.**

---

## ✅ Prerequisites

1. **Backup created** (5 seconds)
2. **Node.js installed** (should be present)
3. **Database credentials correct** in `server/.env`

---

## 🎯 Three Methods (Pick One)

### Method 1: Interactive Node.js ⭐ RECOMMENDED

```bash
# 1. From project root or server directory:
node reset-entire-database.js

# 2. Answer prompts:
#    Type: DELETE ALL DATA
#    Type: YES I AM SURE

# 3. Wait for completion (1-2 minutes)

# 4. Verify success:
node verify-all-tables-empty.js
# Expected: ✓ All tables are empty!

# 5. Create admin user:
npm run seed

# 6. Start server:
npm start
```

**Pros:** Safe, requires confirmation, shows progress  
**Cons:** Requires typing confirmation phrases

---

### Method 2: npm Script

```bash
# 1. From server directory:
npm run reset-entire-db

# 2. Answer same prompts as Method 1

# 3. Verify:
npm run reset-verify

# 4. Create users:
npm run seed

# 5. Start:
npm start
```

**Pros:** Uses npm, same safety as Method 1  
**Cons:** Same as Method 1

---

### Method 3: Direct SQL

```bash
# MySQL Workbench:
# 1. File > Open > reset-entire-database.sql
# 2. Review warnings at top
# 3. Execute (click lightning bolt)
# 4. Done!

# OR Command Line:
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -pC0digix$309 passion_erp < reset-entire-database.sql

# Then verify:
node verify-all-tables-empty.js

# Create users:
npm run seed

# Start server:
npm start
```

**Pros:** Fastest, no confirmation prompts, good for automation  
**Cons:** No safety confirmations, direct execution

---

## 📋 Complete Workflow

```
┌─────────────────────────────────┐
│ 1. CREATE BACKUP (10 sec)       │ ← Important!
│   mysqldump ... > backup.sql    │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ 2. RESET DATABASE (1-2 min)     │
│   npm run reset-entire-db       │
│   (or Option B or C)            │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ 3. VERIFY CLEAN (30 sec)        │
│   npm run reset-verify          │
│   ✓ All tables are empty!       │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ 4. CREATE ADMIN USER (10 sec)   │
│   npm run seed                  │
│   ✓ Admin account created       │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ 5. START SERVER (5 sec)         │
│   npm start                     │
│   ✓ Server on localhost:5000    │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ 6. LOGIN (open browser)         │
│   http://localhost:3000         │
│   User: admin / Pass: password  │
└─────────────────────────────────┘

Total Time: ~3 minutes
```

---

## 🔑 Login After Reset

Once server is running, login with:

```
URL: http://localhost:3000
Username: admin
Password: password
```

You have a fresh system ready to use!

---

## 💾 Before You Start - BACKUP!

```bash
# Create timestamped backup
mysqldump -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
          -u admin -pC0digix$309 passion_erp > backup-$(date +%Y%m%d-%H%M%S).sql

# Should show: "Dumping database structure..."
# Should complete: "Dump completed on..."
```

**This takes 30-60 seconds.**

---

## ✅ Verify Success

After reset, all tables should be empty:

```bash
npm run reset-verify
```

Expected output:
```
✓ user_roles                       : 0 records
✓ role_permissions                 : 0 records
✓ user_permissions                 : 0 records
✓ sales_order                      : 0 records
✓ purchase_order                   : 0 records
... (all tables show 0 records)

✓ Empty tables    : 63/63
✗ Non-empty tables: 0/63

✓ All tables are empty!
```

---

## 🚨 If Something Goes Wrong

### "Connection failed"
Check `.env` file has correct credentials:
```env
DB_HOST=passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=passion_erp
DB_USER=admin
DB_PASSWORD=C0digix$309
```

### "Reset didn't work"
1. Check console output for error messages
2. Try verification: `npm run reset-verify`
3. If tables still have data, try again
4. If it fails completely, restore backup

### "I need to undo this!"
Restore from your backup:
```bash
mysql -h passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com \
      -u admin -pC0digix$309 passion_erp < backup-YYYYMMDD-HHMMSS.sql
```

**All data restored to backup point!**

---

## 📊 What Gets Deleted

| Category | Tables | Records |
|----------|--------|---------|
| Users & Auth | 6 tables | ~20 records |
| Sales | 5 tables | ~500+ records |
| Procurement | 4 tables | ~300+ records |
| Manufacturing | 10 tables | ~2000+ records |
| Inventory | 8 tables | ~1000+ records |
| Shipment | 3 tables | ~200+ records |
| Finance | 3 tables | ~300+ records |
| Other | 7 tables | ~5000+ records |
| **TOTAL** | **63 tables** | **~10,000+ records** |

---

## 🎯 Next Steps After Reset

1. ✅ Database empty and clean
2. ✅ Admin user created
3. ✅ Server running
4. **↓**
5. Login to system
6. Create your department users
7. Configure master data (products, vendors, customers)
8. Start fresh workflows

---

## 📚 Need More Help?

- Detailed Guide: `COMPLETE_RESET_DETAILED_GUIDE.md`
- Recovery Help: `COMPLETE_RESET_RECOVERY_GUIDE.md`
- Backup Issues: Check backup file size (should be 1-5 MB)
- Database Issues: Check AWS RDS console

---

## ⏱️ Estimated Timing

| Step | Time |
|------|------|
| Backup | 30-60 sec |
| Reset | 60-120 sec |
| Verify | 30 sec |
| Create User | 10 sec |
| Start Server | 5 sec |
| **TOTAL** | **~3 minutes** |

---

## ✨ You're Ready!

Choose your method above and start! 

**Remember: Backup first! 🔐**

---

**Status:** ✅ Ready to Execute  
**Safety Level:** High (requires confirmation)  
**Reversibility:** Yes (via backup)  
**Estimated Time:** 3-5 minutes  