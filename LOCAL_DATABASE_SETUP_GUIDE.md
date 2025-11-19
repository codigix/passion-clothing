# Local MySQL Database Setup Guide

## Step 1: Install MySQL on Windows

### Option A: Using MySQL Installer (Recommended)
1. Download MySQL Community Server from: https://dev.mysql.com/downloads/mysql/
2. Run the installer
3. Choose Setup Type: "Developer Default"
4. Accept all dependencies
5. Click "Execute" to install prerequisites
6. Configure MySQL Server:
   - **Port**: 3306 (default)
   - **MySQL X Protocol Port**: 33060
7. Configure MySQL Server as a Windows Service:
   - Service name: "MySQL80" (or latest version)
   - Start service on startup: ✓ Check
8. Create MySQL User Account:
   - Username: `root`
   - Password: `root` (as per your config)
   - Create user account for Windows Service: ✓ Check
9. Complete the installation

### Option B: Using Chocolatey (If installed)
```powershell
choco install mysql
```

### Verify Installation
```powershell
mysql --version
```

---

## Step 2: Update Your `.env` File

Change the database configuration from AWS to local:

```env
# Database Configuration - LOCAL SETUP
DB_HOST=localhost
DB_PORT=3306
DB_NAME=passion_erp
DB_USER=root
DB_PASSWORD=root

# Keep other settings the same...
```

Location: `d:\projects\passion-clothing\server\.env`

---

## Step 3: Create Database and Import Backup

### Using PowerShell:

```powershell
# 1. Start MySQL Command Line
mysql -u root -p

# When prompted, enter password: root
```

### In MySQL Console:

```sql
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS passion_erp;

-- Use the database
USE passion_erp;

-- Import the backup (exit MySQL first, then run from command line)
```

### Exit MySQL and Run Import:

```powershell
# Go to your project root
Set-Location "d:\projects\passion-clothing"

# Import from backup.sql
mysql -u root -proot passion_erp < backup.sql

# OR if using the dump folder
# First extract dump.zip if needed
mysql -u root -proot passion_erp < dump/passion_erp.sql
```

---

## Step 4: Verify Database Setup

```powershell
# Connect to database
mysql -u root -proot passion_erp

# Check tables exist
SHOW TABLES;

# Verify a few key tables
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM roles;
SELECT COUNT(*) FROM purchase_orders;

# Exit
EXIT;
```

---

## Step 5: Update Server Configuration (if needed)

The server config in `server/config/database.js` uses environment variables from `.env`, so if you updated `.env` correctly, no code changes are needed.

**Verify the logic:**
```javascript
const database = process.env.DB_NAME || defaultDbConfig.database;     // passion_erp
const username = process.env.DB_USER || defaultDbConfig.username;     // root
const password = process.env.DB_PASSWORD || defaultDbConfig.password; // root
const host = process.env.DB_HOST || defaultDbConfig.host;             // localhost
const port = process.env.DB_PORT || defaultDbConfig.port;             // 3306
```

---

## Step 6: Start Your Application

### Terminal 1 - Start Backend Server
```powershell
Set-Location "d:\projects\passion-clothing\server"
npm install  # if not already done
npm start
```

### Terminal 2 - Start Frontend Dev Server
```powershell
Set-Location "d:\projects\passion-clothing\client"
npm install  # if not already done
npm run dev
```

---

## Step 7: Test the Setup

1. Open browser: `http://localhost:3000`
2. Try logging in with existing credentials
3. Check browser console for errors
4. Check server logs for connection issues

---

## Troubleshooting

### MySQL Won't Start
```powershell
# Check if MySQL service is running
Get-Service MySQL80
```

If not running:
```powershell
# Start the service
Start-Service MySQL80

# Or set to start automatically
Set-Service MySQL80 -StartupType Automatic
```

### "Connection Refused" Error
- Verify MySQL is running: `mysql -u root -proot -e "SELECT 1"`
- Check port 3306 is open: `netstat -ano | findstr :3306`
- Verify credentials in `.env` file

### "Access Denied" Error
- Check username and password in `.env`
- Verify MySQL user "root" has correct password

### Database Import Issues
```powershell
# If import fails due to character encoding
mysql -u root -proot --default-character-set=utf8mb4 passion_erp < backup.sql
```

### Connection Timeout (Your Original Error)
This is now fixed! The ETIMEDOUT error was because it was trying to connect to the expired AWS database.

---

## Quick Reference: Useful MySQL Commands

```powershell
# Test connection
mysql -u root -proot -e "SELECT 1"

# List all databases
mysql -u root -proot -e "SHOW DATABASES"

# Show tables in passion_erp
mysql -u root -proot -e "USE passion_erp; SHOW TABLES"

# Check specific table
mysql -u root -proot -e "USE passion_erp; SELECT COUNT(*) FROM users"

# Backup your local database
mysqldump -u root -proot passion_erp > backup_local.sql

# Reset database (drop and recreate)
mysql -u root -proot -e "DROP DATABASE passion_erp; CREATE DATABASE passion_erp"
```

---

## After Setup Checklist

- [ ] MySQL installed and running
- [ ] `.env` file updated with local database credentials
- [ ] Database created: `passion_erp`
- [ ] Data imported from backup
- [ ] Server starts without connection errors
- [ ] Frontend connects successfully
- [ ] Can login to application

---

## Next Steps

Once setup is complete:

1. **Fix the Sequelize Association Error** (QualityCheckpoint/qualityCheckpoints mismatch)
2. Test all major workflows
3. Verify data integrity

The association error you saw earlier will need code fix, but that's separate from the database setup.