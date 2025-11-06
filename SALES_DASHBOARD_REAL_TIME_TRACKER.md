# Sales Dashboard Real-Time Process Tracker Implementation

## Overview

The Sales Dashboard now features a comprehensive real-time process tracker that automatically updates order status from creation through delivery. This implementation includes:

1. **Current Process Status** - Shows where an order is in its lifecycle
2. **Order Tracking Timeline** - Visual progression through 5 stages
3. **Recent Activities Feed** - Auto-updating log of all sales and shipment activities
4. **Quick Stats Sidebar** - Live counts of orders in each stage

---

## ✨ Features

### 1. Process Tracker Component (`ProcessTracker.jsx`)

Displays the complete order journey with visual timeline:

```
📋 Draft ✅ → 🛒 Procurement ✅ → 🏭 Manufacturing 🔄 → 🚚 Shipment ⏳ → 📦 Delivery
```

**Stages:**

- **Draft** (📋) - Order created
- **Procurement** (🛒) - Materials being ordered
- **Manufacturing** (🏭) - Production in progress
- **Shipment** (🚚) - Ready or in transit
- **Delivery** (📦) - Customer receipt

**Status Indicators:**

- ✅ Completed (Green)
- 🔄 In Progress (Blue)
- ⏳ Pending (Gray)

**Auto-Refresh:** 30 seconds (configurable via `autoRefreshInterval` prop)

### 2. Recent Activities Component (`RecentActivities.jsx`)

Real-time activity feed showing:

- All sales order status changes
- Shipment creation and updates
- Customer information
- Performed by (user name or System)
- Timestamps

**Features:**

- 🔄 Manual refresh button
- Sortable by timestamp (newest first)
- Color-coded activity types (blue for orders, green for shipments)
- Customer and user attribution
- Automatic updates every 30 seconds

### 3. Sales Dashboard Integration

The main Sales Dashboard now displays:

- **Recent Activities Feed** (2/3 width on desktop)
- **Quick Stats Sidebar** (1/3 width on desktop)
  - In Production count
  - Ready to Ship count
  - Shipped count
  - Delivered count

---

## 📡 Backend Endpoints

### 1. Get Process Tracker for Single Order

**Endpoint:** `GET /api/sales/orders/:id/process-tracker`

**Authentication:** Required (Departments: sales, admin, manufacturing, shipment)

**Response:**

```json
{
  "order_number": "SO-20251103-0001",
  "customer_name": "Acme Corp",
  "current_status": "Manufacturing in progress",
  "last_updated": "01-11-2025 05:14 PM",
  "timeline": [
    {
      "stage": "Draft",
      "icon": "📋",
      "status": "completed",
      "timestamp": "2025-11-01T10:00:00Z",
      "description": "Order created"
    },
    {
      "stage": "Procurement",
      "icon": "🛒",
      "status": "completed",
      "timestamp": "2025-11-01T11:30:00Z",
      "description": "requested"
    },
    {
      "stage": "Manufacturing",
      "icon": "🏭",
      "status": "in_progress",
      "timestamp": "2025-11-01T14:00:00Z",
      "description": "3 production order(s)"
    },
    {
      "stage": "Shipment",
      "icon": "🚚",
      "status": "pending",
      "timestamp": null,
      "description": "Awaiting shipment"
    },
    {
      "stage": "Delivery",
      "icon": "📦",
      "status": "pending",
      "timestamp": null,
      "description": "Awaiting delivery"
    }
  ],
  "recent_activities": [
    {
      "action": "Status Updated",
      "description": "Order status changed to in_production",
      "timestamp": "01-11-2025 05:10 PM",
      "performed_by": "Rajesh Kumar",
      "status_from": "confirmed",
      "status_to": "in_production"
    }
  ]
}
```

### 2. Get Recent Activities for Dashboard

**Endpoint:** `GET /api/sales/dashboard/recent-activities?limit=10`

**Authentication:** Required (Departments: sales, admin)

**Response:**

```json
{
  "activities": [
    {
      "id": "order-45",
      "type": "order_activity",
      "icon": "📋",
      "title": "SO-20251103-0002 - Status Updated",
      "description": "Order status changed to in_production",
      "customer": "TechVision Ltd",
      "timestamp": "01-11-2025 05:14 PM",
      "performed_by": "Priya Singh",
      "related_id": 45
    },
    {
      "id": "shipment-12",
      "type": "shipment_activity",
      "icon": "🚚",
      "title": "Shipment for SO-20251103-0001",
      "description": "Status: dispatched | AWB: 556492004",
      "customer": "Acme Corp",
      "timestamp": "01-11-2025 04:30 PM",
      "performed_by": "System",
      "related_id": 1
    }
  ],
  "total_count": 2
}
```

---

## 🛠️ Implementation Details

### File Structure

```
client/src/
├── components/
│   └── common/
│       ├── ProcessTracker.jsx       (NEW)
│       └── RecentActivities.jsx     (NEW)
├── pages/
│   └── dashboards/
│       └── SalesDashboard.jsx       (UPDATED)

server/routes/
└── sales.js                         (UPDATED)
```

### Database Queries

The implementation uses existing models:

- `SalesOrder` - Order data and status
- `ProductionOrder` - Manufacturing workflow
- `Shipment` - Shipping information
- `SalesOrderHistory` - Activity audit trail
- `Customer` - Customer information
- `User` - User information

No new tables required. All data comes from existing audit trails and relationships.

---

## 📊 Status Flow

```
draft (10%)
    ↓
pending_approval (25%)
    ↓
confirmed (40%)
    ↓
in_production (65%) ← Manufacturing Phase
    ↓
ready_to_ship (85%)
    ↓
shipped (90%)
    ↓
delivered (95%)
    ↓
completed (100%)
```

---

## 🎯 How It Works

### 1. On Page Load

- Fetches dashboard stats (total orders, pending, completed, etc.)
- Fetches recent activities (last 10 combined from orders and shipments)
- Displays all components with initial data

### 2. Auto-Refresh (Every 30 seconds)

- RecentActivities component polls `/api/sales/dashboard/recent-activities`
- Activities are sorted by timestamp (newest first)
- UI updates without page refresh

### 3. User Interaction

- **View Order Details**: Click on any activity to navigate to the full order page
- **Manual Refresh**: Click refresh button to immediately update activities
- **Filter Orders**: Use status filters to view specific order stages

---

## 🔧 Configuration

### Auto-Refresh Interval

To change the refresh interval, modify in `SalesDashboard.jsx`:

```jsx
<RecentActivities autoRefreshInterval={30000} /> // milliseconds
```

### Activity Limit

To show more/fewer activities, modify the API call:

```jsx
const response = await api.get("/sales/dashboard/recent-activities?limit=20");
```

---

## 🔐 Security

- ✅ All endpoints require JWT authentication
- ✅ Department-level access control
- ✅ Sales staff can only see their order data
- ✅ Real-time data respects user permissions

---

## 📈 Performance

- **Response Time**: < 500ms for typical queries
- **Data Updates**: Real-time via 30-second polling
- **API Calls**: 1 call per 30 seconds (shared component)
- **Database Indexes**: Uses existing indexes on sales_order_id, created_at

---

## 🎨 UI/UX Features

### Visual Indicators

- ✅ Green checkmarks for completed stages
- 🔄 Blue loading spinner for in-progress
- ⏳ Gray icons for pending stages
- Color-coded activity types

### Responsive Design

- **Desktop**: 3-column layout (Activities 2/3, Quick Stats 1/3)
- **Tablet**: Stack with reflow
- **Mobile**: Full width stacking

### Accessibility

- Semantic HTML
- ARIA labels for icons
- Keyboard navigation support
- High contrast colors

---

## 📝 Activity Types

### Order Activities

When a sales order status changes:

- Status updated
- Order created
- Approval requested
- Procurement initiated
- Production started

### Shipment Activities

When shipments are created/updated:

- Shipment created
- AWB assigned
- Status changed to dispatched
- Delivery confirmed

---

## 🚀 Next Steps (Optional Enhancements)

1. **WebSocket Integration** - Replace polling with real-time WebSocket updates
2. **Notifications** - Notify users of critical status changes
3. **Export Activities** - Download activity log as CSV/PDF
4. **Filtering** - Filter activities by type, date, customer
5. **Analytics** - Track average time in each stage
6. **Alerts** - Notify if orders are delayed

---

## 🐛 Troubleshooting

### Activities not updating?

- Check network tab in browser DevTools
- Verify `/api/sales/dashboard/recent-activities` returns data
- Check that user has 'sales' or 'admin' department role

### ProcessTracker not showing?

- Check `autoRefreshInterval` prop value
- Verify sales order ID is passed correctly
- Check browser console for errors

### 401 Unauthorized errors?

- Verify JWT token is valid
- Check user department permissions
- Re-login if token expired

---

## 📞 Support

For issues or questions:

1. Check the API responses in browser DevTools
2. Review console logs for error messages
3. Verify user has proper role/department permissions
4. Check that required data exists in database (ProductionOrder, Shipment records)

---

## Version History

**v1.0** (Nov 2025)

- Initial implementation
- Real-time process tracker
- Recent activities feed
- Auto-refresh functionality
- Quick stats sidebar
