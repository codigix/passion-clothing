# 🔥 COMPLETE DATABASE RESET - Start Fresh

## What This Does

This will **DELETE EVERYTHING**:
- ✅ All users (including admin)
- ✅ All sales orders
- ✅ All purchase orders  
- ✅ All production requests/orders
- ✅ All inventory items
- ✅ All GRN records
- ✅ All mock/test data
- ✅ ALL data from ALL tables

After reset, you'll have a **completely empty database** ready for REAL data testing.

---

## ⚠️ IMPORTANT: Before You Start

1. **Stop the server** (press Ctrl+C in terminal)
2. **Backup** if you need anything (though you said you want to delete all mock data)
3. Make sure you're ready to start fresh

---

## 🚀 RESET PROCEDURE

### Step 1: Run Reset Script

```powershell
# Navigate to project root
cd d:\Projects\passion-inventory

# Run the reset script
node server/complete-database-reset.js
```

**You will be asked to confirm:**
1. Type: `DELETE ALL DATA`
2. Type: `YES`

The script will:
- Drop all tables
- Remove all data
- Keep only SequelizeMeta (migration tracking)

---

### Step 2: Run Migrations

```powershell
# Navigate to server directory
cd server

# Run all migrations to recreate tables
npx sequelize-cli db:migrate
```

This recreates all tables with proper structure (empty, no data).

---

### Step 3: Create Admin User

```powershell
# Still in server directory
node create-admin-quick.js
```

This creates the default admin user:
- **Username:** admin
- **Password:** admin123
- **Email:** admin@passion.com
- **Role:** Admin
- **Department:** admin

**⚠️ IMPORTANT:** Change the password after first login!

---

### Step 4: Create Department Users (Optional)

You can create users for each department:

```powershell
# Still in server directory
node scripts/createInventoryUser.js   # Creates inventory user
```

Or create them manually through the Admin Dashboard after logging in:
1. Login as admin
2. Go to Admin → Users
3. Click "Add User"
4. Fill details for each department:
   - Sales user (department: sales)
   - Procurement user (department: procurement)
   - Manufacturing user (department: manufacturing)
   - Inventory user (department: inventory)

---

### Step 5: Start Server

```powershell
# Navigate back to project root
cd ..

# Start development server
npm run dev
```

Server should start on:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

### Step 6: Login and Test

1. Open browser: http://localhost:3000
2. Login with admin credentials
3. Start testing with REAL data flow!

---

## 📋 COMPLETE COMMANDS SUMMARY

Copy and paste these commands one by one:

```powershell
# Stop server first (Ctrl+C)

# Reset database
cd d:\Projects\passion-inventory
node server/complete-database-reset.js

# Recreate tables
cd server
npx sequelize-cli db:migrate

# Create admin user
node create-admin-quick.js

# Start server
cd ..
npm run dev
```

---

## 🎯 WHAT TO TEST AFTER RESET

### Complete Real Flow Test

#### 1. Create Sales Order
- Login as Sales user (or admin)
- Go to Sales Dashboard
- Create new sales order with real customer data
- Add products and quantities

#### 2. Request Production
- Open the sales order
- Click "Request Production"
- Check Manufacturing Dashboard

#### 3. Manufacturing Process
- Login as Manufacturing user (or admin)
- Go to Manufacturing Dashboard
- See production request in "Incoming Orders"
- **Click "Start Production"** ▶️ (CRITICAL!)
- Order moves to "Active Orders"
- Click "Material Verification" ✅
- Move through production stages

#### 4. Track Progress
- Check production stages
- Update stage status
- Complete production

#### 5. Quality Control
- Perform quality checks
- Document any issues
- Approve for shipment

---

## 🐛 Troubleshooting

### "SequelizeMeta table doesn't exist"
```powershell
cd server
npx sequelize-cli db:migrate
```

### "Admin user creation failed"
Check if migrations ran successfully first.

### "Cannot connect to database"
Check `.env` file in server directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=passion_erp
```

### "Port 5000 already in use"
Kill the process:
```powershell
cd server
./kill-port-5000.ps1
```

---

## ✅ SUCCESS INDICATORS

After reset, you should have:
- ✅ Empty database with all tables created
- ✅ Admin user created
- ✅ Server starts without errors
- ✅ Can login to frontend
- ✅ All pages load (empty, no data)
- ✅ Ready to test real workflow!

---

## 📚 Next Steps

After successful reset:
1. Read: `COMPLETE_MANUFACTURING_FLOW_GUIDE.md`
2. Follow the step-by-step real flow
3. Test each department workflow
4. Create real data (not mock)
5. Verify system works end-to-end

---

*Last Updated: January 2025*
*Related Files: complete-database-reset.js, COMPLETE_MANUFACTURING_FLOW_GUIDE.md*