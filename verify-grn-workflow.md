# GRN Workflow Verification Guide

## ✅ System Status

### Backend Status
- ✅ Material Received endpoint: Working
- ✅ GRN Request creation: Working
- ✅ Status transitions: Configured correctly
- ✅ GRN Requests API: Working
- ✅ Inventory user: Created

### Database Status
- **Pending GRN Requests:** 3
- **Inventory Users:** 1 active user
  - Email: `inventory@pashion.com`
  - Password: `inventory123`
  - Department: inventory
  - Status: active

### GRN Requests in Database
```
Request #2: PO-20251007-0001 (Supreme Fabrics) - Unassigned
Request #4: PO-20251007-0002 (Supreme Fabrics) - Assigned to inventory manager
Request #5: PO-20251007-0003 (Supreme Fabrics) - Assigned to inventory manager
```

## 🎯 How to View GRN Requests

### Option 1: Login as Inventory User
1. **Logout** if currently logged in
2. **Login** with:
   - Email: `inventory@pashion.com`
   - Password: `inventory123`
3. **Navigate** to Goods Receipt (GRN) from the sidebar
4. You should see a **red badge with "3"** on the menu item
5. Click on **"Pending GRN Creation"** tab
6. You'll see all 3 POs waiting for GRN creation

### Option 2: Login as Admin
1. Login as admin user
2. Admin users can access all department functions
3. Navigate to inventory section and access GRN page

## 📋 Complete Workflow Test

### Step 1: Test Material Received (Procurement)
1. Login as procurement user or admin
2. Go to Purchase Orders
3. Select a PO with status "sent"
4. Click "Material Received" button
5. ✅ PO status changes to "received"
6. ✅ GRN request created automatically

### Step 2: View GRN Requests (Inventory)
1. Login as inventory user (`inventory@pashion.com`)
2. Navigate to Goods Receipt (GRN) 
3. Check the badge count (should show pending requests)
4. Click "Pending GRN Creation" tab
5. ✅ See list of POs awaiting GRN creation

### Step 3: Create GRN (Inventory)
1. Click "Create GRN" button on any pending PO
2. Fill in GRN details (items received, quantities, etc.)
3. Submit GRN
4. ✅ GRN created and ready for verification

### Step 4: Verify GRN (Inventory)
1. Navigate to "All GRNs" tab
2. Click verify on the GRN
3. Verify quantities and quality
4. Approve GRN
5. ✅ GRN verified

### Step 5: Add to Inventory (Inventory)
1. After verification, add GRN to inventory
2. ✅ Stock levels updated in inventory

## 🔍 Troubleshooting

### "No purchase orders awaiting GRN creation"
**Cause:** You're not logged in as inventory/admin user
**Solution:** Login with `inventory@pashion.com` / `inventory123`

### Badge count not showing in sidebar
**Cause:** 
- Not logged in as inventory/admin
- No pending requests in database
- Page not refreshed after login

**Solution:** 
- Ensure you're logged in as inventory user
- Refresh the page (F5)
- Check browser console for API errors

### API returns 403 Forbidden
**Cause:** User doesn't have inventory/admin department access
**Solution:** Login as correct user

## 📊 Verification Scripts

### Check Current GRN Requests
```bash
node server/scripts/checkGRNRequests.js
```

### Check Users
```bash
node server/scripts/checkUsers.js
```

## 🎉 Success Criteria

You'll know everything is working when:
1. ✅ Sidebar shows GRN menu item with badge count
2. ✅ Pending GRN Creation tab shows list of POs
3. ✅ Can click "Create GRN" to start GRN workflow
4. ✅ Material Received button creates new GRN requests
5. ✅ Inventory user can see and process all requests

## 🔐 Test User Credentials

### Inventory User (NEW)
- Email: `inventory@pashion.com`
- Password: `inventory123`
- Department: inventory
- Purpose: View and process GRN requests

### Admin User
- Email: `admin@pashion.com`
- Password: (your admin password)
- Department: admin
- Purpose: Access all functions including GRN

---

**Note:** The sidebar badge refreshes every 30 seconds automatically. If you don't see updates immediately, wait a moment or refresh the page.