# AWS to Local Database Migration - Complete Guide

## 🎯 Overview

Your AWS RDS database will expire soon. This guide helps you migrate to a **local MySQL database** in 3 steps.

---

## 📋 What You Need to Do

### Step 1: Install MySQL (First Time Only)
- Download: https://dev.mysql.com/downloads/mysql/
- Use default settings during installation
- **Important**: Create user `root` with password `root`
- Install as Windows Service (auto-start)

### Step 2: Update Environment Configuration
Edit `server/.env` file:

**CHANGE FROM:**
```
DB_HOST=passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=C0digix$309
```

**CHANGE TO:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
```

### Step 3: Import Your Database Backup
Run this PowerShell command:

```powershell
cd d:\projects\passion-clothing
mysql -u root -proot passion_erp < backup.sql
```

**That's it!** Your database is now local.

---

## 🚀 Automated Setup (Recommended)

We created an automatic setup script for you:

```powershell
cd d:\projects\passion-clothing
.\setup-local-database.ps1
```

This script will:
1. ✓ Check if MySQL is installed
2. ✓ Test the connection
3. ✓ Create the database
4. ✓ Import your backup
5. ✓ Update your .env file
6. ✓ Verify everything works

---

## 📁 Files We Created For You

| File | Purpose |
|------|---------|
| `QUICK_LOCAL_DB_SETUP.md` | **Start here!** 5-minute quick setup |
| `LOCAL_DATABASE_SETUP_GUIDE.md` | Detailed step-by-step guide with troubleshooting |
| `setup-local-database.ps1` | Automated PowerShell script (recommended) |
| `DATABASE_MIGRATION_SUMMARY.md` | This file |

---

## ✅ Verification Checklist

After setup, verify everything works:

```powershell
# 1. Check MySQL is running
mysql -u root -proot -e "SELECT 1;"

# 2. Verify database exists
mysql -u root -proot -e "SHOW DATABASES;" | findstr passion_erp

# 3. Check tables were imported
mysql -u root -proot -e "USE passion_erp; SHOW TABLES;" | Measure-Object -Line

# 4. Check sample data
mysql -u root -proot -e "USE passion_erp; SELECT COUNT(*) as UserCount FROM users;"
```

---

## 🔧 Starting Your Application

### First Time After Setup:

**Terminal 1 - Backend Server:**
```powershell
cd d:\projects\passion-clothing\server
npm start
```

**Terminal 2 - Frontend (new PowerShell window):**
```powershell
cd d:\projects\passion-clothing\client
npm run dev
```

**Terminal 3 - Optional (if needed):**
```powershell
# For any migrations or setup scripts
cd d:\projects\passion-clothing\server
npm run migrate  # if available
```

### What to Expect:
- Backend should start on http://localhost:5000
- Frontend should start on http://localhost:3000
- No more "ETIMEDOUT" or connection refused errors
- Login page should load successfully

---

## 🐛 Troubleshooting

### Problem: "mysql: command not found"
**Solution**: MySQL is not in your PATH
- Option 1: Restart your terminal after MySQL installation
- Option 2: Add MySQL to PATH:
  - Find MySQL bin folder (usually `C:\Program Files\MySQL\MySQL Server 8.0\bin`)
  - Add to System Environment Variables PATH

### Problem: "Access denied for user 'root'@'localhost'"
**Solution**: Wrong password
- Verify your `.env` file has: `DB_PASSWORD=root`
- Or use correct password if you set different one during MySQL setup

### Problem: "MySQL service not running"
**Solution**: Start it
```powershell
Start-Service MySQL80
# Or restart all MySQL services
Get-Service | Where-Object {$_.Name -like '*MySQL*'} | Start-Service
```

### Problem: "Can't connect to MySQL server on 'localhost'"
**Solution**: Check if MySQL is listening
```powershell
# Test connection with verbose output
mysql -u root -proot -h localhost -P 3306 -e "SELECT 1;" -v
```

### Problem: "Table 'passion_erp.xyz' doesn't exist"
**Solution**: Backup wasn't imported correctly
```powershell
# Re-import backup
mysql -u root -proot passion_erp < backup.sql

# Or from dump folder
mysql -u root -proot passion_erp < dump\passion_erp.sql
```

---

## 🔄 Backup Your Local Database

To backup your local database periodically:

```powershell
# Create a backup
mysqldump -u root -proot passion_erp > backup_$(Get-Date -f 'yyyy-MM-dd_HHmmss').sql

# Backup location: current directory
```

---

## 🔙 Restore From AWS (If Needed)

If you need to temporarily connect back to AWS:

```powershell
# Edit server/.env
DB_HOST=passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=C0digix$309
DB_PORT=3306

# Restart server
npm start
```

But keep in mind AWS will eventually expire, so plan migration carefully.

---

## 📝 Related Fixes Needed After DB Setup

Once your database is working locally, we need to fix:

1. **Sequelize Association Alias Error**
   - Error: "QualityCheckpoint is associated using alias qualityCheckpoints"
   - File: `server/config/database.js`
   - This was causing your 500 error on `/api/production-tracking/stages/13`

2. **Connection Pool Optimization**
   - Already configured in `server/config/database.js`
   - Should work automatically with local MySQL

---

## 🎓 Performance Notes

**Local MySQL vs AWS RDS:**
- ✅ Faster for development (no network latency)
- ✅ No monthly costs
- ✅ Full control and debugging
- ⚠️ Only accessible from this machine
- ⚠️ Manual backup responsibility

---

## 📞 Quick Command Reference

```powershell
# Test MySQL connection
mysql -u root -proot -e "SELECT 1"

# Start MySQL service
Start-Service MySQL80

# Stop MySQL service  
Stop-Service MySQL80

# Check MySQL status
Get-Service MySQL80

# Connect to database interactively
mysql -u root -proot passion_erp

# Run SQL file
mysql -u root -proot passion_erp < backup.sql

# Dump database
mysqldump -u root -proot passion_erp > backup.sql

# List all databases
mysql -u root -proot -e "SHOW DATABASES"

# Show all tables
mysql -u root -proot -e "USE passion_erp; SHOW TABLES"

# Count records
mysql -u root -proot -e "USE passion_erp; SELECT COUNT(*) FROM users"
```

---

## ✨ Next Steps After Setup

1. ✅ Install MySQL
2. ✅ Update .env file
3. ✅ Import backup
4. ✅ Run `setup-local-database.ps1` (or manual steps)
5. ⏭️ Start backend and frontend
6. ⏭️ Test login at http://localhost:3000
7. ⏭️ Fix the Sequelize association error (separate task)

---

**You're now ready to use a local database! 🎉**

For detailed help, see `LOCAL_DATABASE_SETUP_GUIDE.md`