# Quick Local Database Setup (5 Minutes)

## Prerequisites
- Windows 10/11
- Administrator access

## Installation Steps

### 1️⃣ Install MySQL (if not already installed)
Download from: https://dev.mysql.com/downloads/mysql/
- Choose "Developer Default" setup
- Port: **3306**
- Create user: **root** / **root**

### 2️⃣ Update .env File
Open `server/.env` and change:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=passion_erp
DB_USER=root
DB_PASSWORD=root
```

(Change from your AWS RDS settings)

### 3️⃣ Import Database

**Open PowerShell and run:**

```powershell
# Navigate to project
Set-Location "d:\projects\passion-clothing"

# Import backup
mysql -u root -proot passion_erp < backup.sql
```

**Or use the automated script:**
```powershell
.\setup-local-database.ps1
```

### 4️⃣ Verify Setup
```powershell
# Test connection
mysql -u root -proot -e "USE passion_erp; SHOW TABLES;"
```

### 5️⃣ Start Application

**Terminal 1 - Backend:**
```powershell
cd server
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd client
npm run dev
```

### 6️⃣ Test
- Open: http://localhost:3000
- Login with existing credentials
- Check for errors

---

## Common Issues

| Issue | Solution |
|-------|----------|
| `mysql: not found` | MySQL not in PATH. Restart terminal after installation |
| `Access denied for user 'root'` | Wrong password. Verify .env file matches MySQL setup |
| `Can't connect to MySQL` | MySQL service not running. Start it: `Start-Service MySQL80` |
| `Table doesn't exist` | Backup import failed. Check backup.sql file exists |

---

## Rollback (If Needed)
```powershell
# Your original AWS credentials
DB_HOST=passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=C0digix$309
```

---

## Files Created
- `LOCAL_DATABASE_SETUP_GUIDE.md` - Detailed guide
- `setup-local-database.ps1` - Automated setup script

For detailed troubleshooting, see `LOCAL_DATABASE_SETUP_GUIDE.md`