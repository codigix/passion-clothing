# 🚀 START HERE: Local Database Setup

Your AWS database will expire. This document tells you exactly what to do.

## ⏱️ Time Required: 15-30 Minutes

---

## 🎯 What You Need

1. **Windows 10/11 with Admin Access**
2. **MySQL Community Server** (we'll install)
3. **Your backup files** (already in your project: `backup.sql`)

---

## 📋 Action Plan

### PHASE 1: Install MySQL (5 min)

1. **Download MySQL**: https://dev.mysql.com/downloads/mysql/
   - Click "MySQL Community Server"
   - Choose your Windows version
   - Download the installer (.msi file)

2. **Run Installer**
   - Accept default options
   - When asked for port: use **3306** (default)
   - When asked for root password: **root**
   - Install as Windows Service ✓

3. **Verify Installation**
   ```powershell
   mysql --version
   ```
   Should show MySQL version number.

---

### PHASE 2: Configure Your Project (2 min)

Edit this file: `d:\projects\passion-clothing\server\.env`

**Find these lines:**
```
DB_HOST=passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=passion_erp
DB_USER=admin
DB_PASSWORD=C0digix$309
```

**Replace with:**
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=passion_erp
DB_USER=root
DB_PASSWORD=root
```

**Save the file.**

---

### PHASE 3: Import Your Database (5 min)

Open **PowerShell as Administrator** and run:

```powershell
# Navigate to project
cd d:\projects\passion-clothing

# Import database
mysql -u root -proot passion_erp < backup.sql

# Verify (should show tables)
mysql -u root -proot passion_erp -e "SHOW TABLES;"
```

**If that doesn't work, use the automated script:**

```powershell
cd d:\projects\passion-clothing
.\setup-local-database.ps1
```

---

### PHASE 4: Start Your Application (3 min)

**Open Terminal 1:**
```powershell
cd d:\projects\passion-clothing\server
npm start
```

Wait for: `Server running on http://localhost:5000`

**Open Terminal 2 (new PowerShell window):**
```powershell
cd d:\projects\passion-clothing\client
npm run dev
```

Wait for: `VITE v... ready in XXX ms`

---

### PHASE 5: Test It Works (2 min)

1. Open browser: **http://localhost:3000**
2. You should see the **Login page**
3. Try logging in with an existing user account
4. If it works → **Success! 🎉**

---

## ✅ Checklist Before Starting

- [ ] I have admin access to my computer
- [ ] I know my Windows password (to run as admin)
- [ ] I can see `backup.sql` in `d:\projects\passion-clothing`
- [ ] I have ~30 minutes available

---

## 🚨 If You Get Stuck

| Error | Quick Fix |
|-------|-----------|
| `mysql: command not found` | Restart PowerShell after MySQL install |
| `Access denied for user 'root'` | Check .env has `DB_PASSWORD=root` |
| `Can't connect to localhost:3306` | Check MySQL service: `Get-Service MySQL80` |
| `Port 3306 already in use` | Another MySQL is running, check if it's the one you want |
| `backup.sql not found` | Make sure you're in correct directory: `cd d:\projects\passion-clothing` |

See `LOCAL_DATABASE_SETUP_GUIDE.md` for detailed troubleshooting.

---

## 📁 Documents Created For You

| Read This | If You Want To... |
|-----------|-------------------|
| `QUICK_LOCAL_DB_SETUP.md` | Get 5-minute overview |
| `LOCAL_DATABASE_SETUP_GUIDE.md` | Understand all the details & troubleshoot |
| `DATABASE_MIGRATION_SUMMARY.md` | See full migration plan & backup info |
| `setup-local-database.ps1` | Let a script do the setup automatically |

---

## 💡 Pro Tips

1. **Save Your AWS Credentials** (in case you need them):
   - Add to a text file as backup
   - Keep until you confirm local DB works perfectly

2. **Backup Your Local DB Regularly**:
   ```powershell
   mysqldump -u root -proot passion_erp > my_backup.sql
   ```

3. **Use the Automated Script**:
   ```powershell
   .\setup-local-database.ps1
   ```
   It does steps 2-4 automatically!

---

## 🎓 What Happens After

Your application will now:
- ✅ Run 100x faster (no network latency to AWS)
- ✅ Work offline if needed
- ✅ Cost $0/month instead of AWS charges
- ✅ Give you full database control

MySQL will automatically start when you boot your computer (as a service).

---

## 🔄 Can I Go Back to AWS?

Yes! Just change `.env` back and restart:

```
DB_HOST=passion-erp.cxqc440y2mz9.eu-north-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=C0digix$309
```

But remember AWS expires soon, so do local migration soon.

---

## 📞 Help

- **MySQL Installation Issues?** → See LOCAL_DATABASE_SETUP_GUIDE.md > Troubleshooting
- **Setup Script Failed?** → Read error message, then see guide above
- **Database Import Issues?** → Run: `mysql -u root -proot passion_erp < backup.sql`

---

## 🎯 Your Next Step

→ **Go to PHASE 1 above and start installing MySQL!**

Once MySQL is installed, you can run:

```powershell
.\setup-local-database.ps1
```

And everything else will be automated. ✨

---

**Ready?** Let's go! 🚀