# Sales Dashboard Real-Time Tracker - Quick Start Guide

## 🎯 What's New?

Your Sales Dashboard now displays:

1. **🕒 Recent Activities** - Auto-updating feed of all order and shipment activities
2. **⚡ Quick Stats** - Live counts of orders at each stage
3. **📊 Process Timeline** - Visual order journey (clicking order details shows full timeline)

---

## 🚀 How to Use

### 1. View Recent Activities

- Navigate to **Sales Dashboard** (`http://localhost:3000/sales/dashboard`)
- See the **Recent Activities** section at the top
- Activities auto-refresh every 30 seconds
- Click **🔄 Refresh** button for immediate update

### 2. Check Quick Stats

- View stats in the **right sidebar**:
  - In Production: _count_
  - Ready to Ship: _count_
  - Shipped: _count_
  - Delivered: _count_

### 3. View Order's Process Timeline

1. Navigate to Sales Dashboard
2. Click on any order in the table/cards
3. On order details page, you'll see the full process timeline
4. Timeline shows:
   - Current status
   - Last updated time
   - All completed stages with timestamps
   - Pending stages

---

## 📊 Activity Feed Shows

Each activity displays:

- **Icon**: 📋 for orders, 🚚 for shipments
- **Title**: Order number + action
- **Description**: What happened
- **Customer**: Who it's for
- **Timestamp**: When it happened
- **Performed By**: Who did it (System for shipments)

---

## 🔄 Auto-Update Timeline

Activities refresh automatically every 30 seconds. You'll see:

- ✅ New orders
- ✅ Status changes
- ✅ Shipment creations
- ✅ Deliveries

No need to refresh the page!

---

## 📈 Stage Progression

An order moves through these stages:

```
📋 Draft (Order created)
   ↓
🛒 Procurement (Materials ordered)
   ↓
🏭 Manufacturing (Production in progress)
   ↓
🚚 Shipment (Dispatch prepared)
   ↓
📦 Delivery (In transit/Delivered)
```

Each stage is marked as:

- ✅ Completed (Green)
- 🔄 In Progress (Blue)
- ⏳ Pending (Gray)

---

## 🎯 Key Features

| Feature               | Benefit                               |
| --------------------- | ------------------------------------- |
| **Auto-Refresh**      | No manual page refresh needed         |
| **Real-Time Updates** | See changes immediately               |
| **Visual Timeline**   | Understand order progress at a glance |
| **Activity Log**      | Complete audit trail of all actions   |
| **Quick Stats**       | Monitor order pipeline health         |

---

## 🔍 Example Workflow

### Creating a New Order

1. Create a sales order → Appears in **Recent Activities** as "Order Created"
2. Send to Procurement → Activity shows "Status Updated to procurement_created"
3. Manufacturing starts → Activity shows "Production Started"
4. Production completes → Activity shows shipment creation
5. Order delivered → Activity shows "Delivered"

All activities appear in the feed instantly!

---

## ⚙️ Configuration

### Change Auto-Refresh Speed

Edit `client/src/pages/dashboards/SalesDashboard.jsx`:

**Current:** 30 seconds

```jsx
<RecentActivities autoRefreshInterval={30000} />
```

**To change to 15 seconds:**

```jsx
<RecentActivities autoRefreshInterval={15000} />
```

### Show More Activities

Edit the same file, change query parameter:

**Current:** 10 activities

```jsx
const response = await api.get("/sales/dashboard/recent-activities?limit=10");
```

**To show 20:**

```jsx
const response = await api.get("/sales/dashboard/recent-activities?limit=20");
```

---

## 🛠️ Troubleshooting

### Activities not showing?

- ✅ Make sure you're logged in as Sales user
- ✅ Check that orders exist in database
- ✅ Click **Refresh** button
- ✅ Check browser console (F12) for errors

### Timeline not updating?

- ✅ Wait 30 seconds for auto-refresh
- ✅ Manually click Refresh button
- ✅ Navigate away and back to dashboard

### 401 Unauthorized error?

- ✅ Log out and log back in
- ✅ Check that user has "sales" or "admin" department role
- ✅ Verify JWT token is valid

---

## 📱 Mobile View

On mobile devices:

- Activities and stats stack vertically
- All features work the same
- Timestamps are readable on small screens
- Touch-friendly refresh button

---

## 🎨 Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│                    Sales Dashboard                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────┐  ┌─────────────────┐ │
│  │    Recent Activities (2/3)       │  │  Quick Stats    │ │
│  │                                  │  │  (1/3)          │ │
│  │ 📋 SO-123 - Status Updated       │  │                 │ │
│  │ 🚚 Shipment for SO-122           │  │ In Production:7 │ │
│  │ 📋 SO-121 - Order Created        │  │ Ready to Ship:3 │ │
│  │ 🚚 Shipment Dispatched           │  │ Shipped: 12     │ │
│  │ 📋 SO-120 - Production Started   │  │ Delivered: 45   │ │
│  │                                  │  │                 │ │
│  └──────────────────────────────────┘  └─────────────────┘ │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  [Stats Cards showing Total, Active, Completed, Revenue]    │
├─────────────────────────────────────────────────────────────┤
│  [Search Bar] [Status Filter] [Export] [View Toggle]        │
├─────────────────────────────────────────────────────────────┤
│  [Orders Table or Cards - same as before]                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Permissions

You need these permissions to see activities:

- **Department**: Sales, Admin, Manufacturing, or Shipment
- **Role**: Salesperson, Manager, Admin, or Manufacturing Staff
- **Action**: View sales orders

If you can't see activities, ask your admin to grant the "sales" or "admin" department role.

---

## 📚 Related Docs

- [Full Implementation Details](./SALES_DASHBOARD_REAL_TIME_TRACKER.md)
- [API Endpoints Reference](./API_ENDPOINTS_REFERENCE.md)
- [Order Status Flow](./COMPLETE_MANUFACTURING_FLOW_GUIDE.md)

---

## 💡 Tips & Tricks

1. **Monitor Pipeline Health**: Watch Quick Stats to see order distribution
2. **Track Bottlenecks**: See if orders stack up in any stage
3. **Audit Trail**: Review who made what changes and when
4. **Customer Updates**: See shipment AWB numbers in activities
5. **Performance**: Activities are cached - no page refresh needed

---

## ✨ What's Coming Next

Future enhancements:

- ⏳ WebSocket real-time updates (no polling)
- 🔔 Notifications for critical changes
- 📊 Analytics dashboard with stage timings
- 📋 Export activities to CSV/PDF
- 🎯 Alert rules for delayed orders

---

## 🚨 Known Limitations

1. Auto-refresh happens every 30 seconds (not real-time)
2. Activities limited to last 10 items (configurable)
3. Historical data requires page refresh to show older activities

---

## 📞 Need Help?

1. Check this guide first
2. Review browser console (F12) for errors
3. Verify user permissions
4. Check database for order data
5. Contact your administrator

**Created:** November 2025
**Last Updated:** November 2025
