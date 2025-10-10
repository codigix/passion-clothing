# 🔄 Database Reset Guide

## ⚠️ IMPORTANT WARNING

**This process will DELETE ALL DATA from your database!**

All of the following will be permanently deleted:
- ❌ All users and login credentials
- ❌ All sales orders
- ❌ All purchase orders
- ❌ All inventory items and stock
- ❌ All GRN records
- ❌ All production orders and tracking
- ❌ All vendors and customers
- ❌ All notifications and history
- ❌ EVERYTHING in the system

---

## 🚀 How to Reset Database

### Option 1: Complete Fresh Reset (Recommended)

**This creates a completely fresh database with a default admin user.**

```powershell
# Stop the server first (Ctrl+C if running)

# Run the reset script
node reset-database-fresh.js
```

**After Reset:**
- ✅ Fresh empty database created
- ✅ All tables recreated
- ✅ Basic roles and permissions added
- ✅ Default admin user created

**Login Credentials:**
- Email: `admin@pashion.com`
- Password: `Admin@123`

---

### Option 2: Quick Table Drop

**This drops all tables and recreates them (faster).**

```powershell
# Run from server directory
cd server
node scripts/completeReset.js
cd ..
```

---

## 📝 After Reset Steps

1. **Start the server:**
   ```powershell
   npm run dev
   ```

2. **Login with admin credentials:**
   - Navigate to: http://localhost:3000/login
   - Email: `admin@pashion.com`
   - Password: `Admin@123`

3. **Create new users:**
   - Go to Admin → User Management
   - Create users for each department
   - Assign appropriate roles

4. **Start entering fresh data:**
   - Sales Orders
   - Purchase Orders
   - Inventory Items
   - Vendors/Customers
   - Everything else

---

## 🎯 What Gets Created Automatically

### Roles (23 roles total)
- ✅ Super Admin
- ✅ Sales User & Manager
- ✅ Procurement User & Manager
- ✅ Inventory User & Manager
- ✅ Manufacturing User & Manager
- ✅ Finance User & Manager
- ✅ Admin User & Manager
- ✅ Shipment User & Manager
- ✅ Store User & Manager
- ✅ Samples User & Manager
- ✅ Challans User & Manager
- ✅ Outsourcing User & Manager

### Permissions (33 permissions)
- ✅ User management (Create, Read, Update, Delete)
- ✅ Sales orders (Create, Read, Update, Delete, Approve)
- ✅ Purchase orders (Create, Read, Update, Delete, Approve)
- ✅ Production orders (Create, Read, Update, Delete)
- ✅ Inventory items (Create, Read, Update, Delete)
- ✅ Products (Create, Read, Update, Delete)
- ✅ Attendance (Create, Read, Update)
- ✅ Reports (Read, Export)

### Default Admin User
- ✅ Username: admin
- ✅ Email: admin@pashion.com
- ✅ Password: Admin@123
- ✅ Department: Admin
- ✅ Role: Super Administrator
- ✅ Full system access

---

## 🔒 Security Recommendations

**After your first login, immediately:**

1. **Change admin password:**
   - Go to Profile → Change Password
   - Use a strong password

2. **Create individual user accounts:**
   - Don't share the admin account
   - Create separate users for each person
   - Assign appropriate department roles

3. **Review permissions:**
   - Go to Admin → Role Management
   - Verify each role has correct permissions

---

## 🛠️ Troubleshooting

### Database Connection Error
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:** Check your `.env` file in the server folder:
- Verify DB_USER and DB_PASSWORD are correct
- Make sure MySQL is running

### Table Already Exists Error
```
Error: Table 'users' already exists
```
**Solution:** Database wasn't fully dropped. Run:
```sql
-- In MySQL Workbench or command line
DROP DATABASE passion_erp;
```
Then run the reset script again.

### Permission Denied Error
```
Error: Access denied for user 'root'@'localhost' (using password: YES)
```
**Solution:** 
1. Check MySQL root password
2. Update `server/.env` file with correct credentials
3. Make sure MySQL service is running

---

## 📊 Database Structure After Reset

Your fresh database will have these tables:

**Core Tables:**
- users
- roles
- permissions
- role_permissions (junction table)
- user_roles (junction table)

**Business Tables:**
- sales_orders
- purchase_orders
- inventory
- vendors
- customers
- production_orders
- production_requests
- grn_requests
- material_dispatches
- material_receipts
- material_verifications
- production_approvals
- challans
- shipments
- invoices
- payments
- notifications
- attendance

**All tables will be EMPTY except:**
- ✅ roles (23 roles)
- ✅ permissions (33 permissions)
- ✅ users (1 admin user)
- ✅ role_permissions (all mappings)
- ✅ user_roles (admin role assignment)

---

## ✅ Verification Checklist

After reset, verify:

- [ ] Server starts without errors
- [ ] Can login with admin@pashion.com / Admin@123
- [ ] Can access all departments (Admin has access to all)
- [ ] Can create new users in Admin → User Management
- [ ] All sidebar menus are visible
- [ ] Barcode scanner page loads correctly
- [ ] Can navigate to all pages without errors

---

## 🎉 You're Ready!

Your system is now completely fresh and ready for real production data entry!

**Pro Tips:**
1. Start with creating vendors and customers
2. Then add inventory items
3. Create sales orders
4. Generate purchase orders
5. Process GRN workflow
6. Track everything through the system

**Good luck with your fresh start!** 🚀