# 🚀 Quick Start After Database Seed

## Login & Get Started

### Step 1: Start Server
```powershell
cd d:\projects\passion-clothing\server
npm run dev
```

### Step 2: Login
- **URL**: `http://localhost:3000`
- **Email**: `admin@pashion.com`
- **Password**: `Admin@123`

### Step 3: What's Ready for Testing

✅ **Sales Department** (Rajesh Kumar)
- Create Sales Orders for any of 5 customers
- Track order status through Recent Activities

✅ **Procurement** (Priya Singh)  
- Create Purchase Orders from vendors
- Manage purchase workflows
- Monitor GRN incoming orders

✅ **Manufacturing** (Amit Patel)
- Create production orders from approved sales
- Track manufacturing stages
- Manage outsourcing & material flow

✅ **Inventory** (Neha Verma)
- View 6 inventory items with stock levels
- Manage material allocations
- Track inventory movements

✅ **Shipment** (Vikram Reddy)
- Create shipments with courier partners
- Track active shipments
- Manage delivery status

✅ **Finance & Admin**
- All core systems operational
- Role & permission management ready

---

## Test User Accounts

All test users have password: `Test@123`

```
Sales:        rajesh@pashion.com
Procurement:  priya@pashion.com
Manufacturing: amit@pashion.com
Inventory:    neha@pashion.com
Shipment:     vikram@pashion.com
Finance:      ananya@pashion.com
Samples:      rohit@pashion.com
```

---

## Test Data Available

### 5 Customers Ready
- ABC Textiles Pvt Ltd
- XYZ Garments Ltd
- Fashion Hub Retail
- Metro Fashion Inc
- Elite Clothing Co

### 5 Vendors Ready
- Premium Fabrics India
- Quality Threads Ltd
- Metro Accessories Pvt Ltd
- Global Textiles Pvt
- Precision Embroidery

### 6 Inventory Items Stocked
- Cotton Fabric: 1000m
- Polyester Fabric: 800m
- Silk Fabric: 500m
- Buttons: 5000 pcs
- Zippers: 3000 pcs
- Thread: 2000 spools

### 3 Courier Partners
- FedEx Logistics
- DHL Express
- Blue Dart Express

---

## Recommended Test Flow

### 1. Sales → Procurement → Manufacturing

```
Sales Order Creation
      ↓
Approval (Sales)
      ↓
Create Purchase Order
      ↓
GRN Receipt
      ↓
Create Production Order
      ↓
Track Manufacturing
      ↓
Ready for Shipment
      ↓
Create Shipment
      ↓
Delivery Tracking
```

### 2. Quick Testing Steps

**As Admin:**
1. Go to Dashboard → Check Recent Activities
2. View all 5 Customers
3. View all 5 Vendors
4. Check Inventory (6 items stocked)

**As Sales User (rajesh@pashion.com):**
1. Create Sales Order for "ABC Textiles"
2. Select any product
3. Submit for approval

**As Admin:**
1. Approve the sales order
2. View in Recent Activities

**As Procurement (priya@pashion.com):**
1. Create Purchase Order from sale
2. Select vendor and submit

**Continue workflow through all departments...**

---

## Useful Features to Test

✅ **Recent Activities Carousel** - Should show no NULL project names
✅ **Production Operations** - Stage-by-stage tracking
✅ **Shipment Dashboard** - Active & delivered shipments
✅ **Courier Tracking** - Track by tracking number
✅ **Material Flow** - Dispatch → Receipt → Verification
✅ **Quality Control** - Quality checkpoints per stage
✅ **Reports** - Sales, Procurement, Manufacturing dashboards

---

## If Something Breaks

### Reset Database Again
```powershell
cd d:\projects\passion-clothing\server
node truncate-all-tables.js
node create-admin-quick.js
node seed-complete-data.js
```

### Check Connection
```powershell
node test-db-connection.js
```

### View Database Stats
```sql
USE passion_erp;
SELECT 
  TABLE_NAME, 
  TABLE_ROWS 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'passion_erp'
ORDER BY TABLE_ROWS DESC;
```

---

## Important Notes

⚠️ **This is Development Data**
- All passwords are simple
- Used only for testing workflows
- Can be reset anytime

✨ **Fresh & Clean**
- No old corrupted data
- No NULL project names (fixed!)
- All relationships intact

🔄 **Easy Reset**
- One command to truncate
- One command to seed
- Keep testing workflows

---

## Environment Check

Required for smooth operation:
- ✅ Node.js v16+
- ✅ MySQL 8.0+
- ✅ `.env` file configured with DB credentials
- ✅ Server running on port 5000
- ✅ Client running on port 3000

---

**Happy Testing! 🎉**

Questions? Check `/server/seed-complete-data.js` for seed logic