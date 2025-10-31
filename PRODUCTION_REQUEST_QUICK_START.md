# Production Request Automation - Quick Start Guide

## 🎯 What's New?

When you create a sales order and send it to procurement, **manufacturing automatically gets a production request** to review and create Material Requests (MRN).

---

## 📋 Complete Flow (5 Steps)

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: SALES CREATES ORDER                                     │
│ ─────────────────────────────────────────────────────────────   │
│ • Go to Sales → Create Sales Order                              │
│ • Fill in: Product, Quantity, Customer, Delivery Date           │
│ • Status: DRAFT                                                 │
└─────────────────────────────────────────────────────────────────┘
                          ⬇️  CLICK
         "SEND TO PROCUREMENT" BUTTON
                          ⬇️
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: SYSTEM CREATES PRODUCTION REQUEST (AUTOMATIC)           │
│ ─────────────────────────────────────────────────────────────   │
│ ✅ Sales Order sent to Procurement Department                  │
│ ✅ Production Request created with status: PENDING              │
│ ✅ Manufacturing Department notified                            │
│ ✅ Request Number: PRQ-YYYYMMDD-00001                           │
└─────────────────────────────────────────────────────────────────┘
                          ⬇️
        ┌─── NOTIFICATION SENT ───┐
        │  (Manufacturing Email)   │
        └─────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: MANUFACTURING SEES REQUEST IN DASHBOARD                 │
│ ─────────────────────────────────────────────────────────────   │
│ • Login → Manufacturing Dashboard                               │
│ • Click "Incoming Requests" Tab                                 │
│ • See Production Request PRQ-20251027-00001                     │
│ • Contains:                                                     │
│   - Sales Order: SO-20251027-0001                               │
│   - Product: T-shirt printing                                   │
│   - Quantity: 100 pcs                                           │
│   - Delivery: 2025-10-31                                        │
│   - Priority: medium                                            │
└─────────────────────────────────────────────────────────────────┘
                          ⬇️  CLICK
           "ANALYZE" OR "CREATE MRN"
                          ⬇️
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: MANUFACTURING CREATES MATERIAL REQUEST NOTES (MRN)      │
│ ─────────────────────────────────────────────────────────────   │
│ • Review product specifications                                 │
│ • Determine materials needed                                    │
│ • Create MRN with:                                              │
│   - Material 1: Cotton Fabric - 100 meters                      │
│   - Material 2: Threads - 50 spools                             │
│   - Material 3: Buttons - 200 pcs                               │
│ • MRN Status: PENDING                                           │
└─────────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: PROCUREMENT SEES & FULFILLS MRN                         │
│ ─────────────────────────────────────────────────────────────   │
│ • MRN appears in Inventory Dashboard                            │
│ • Procurement creates Purchase Orders                           │
│ • Materials ordered from suppliers                              │
│ • Inventory receives materials                                  │
│ • Manufacturing gets materials for production                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Dashboard Views

### Manufacturing Dashboard - Incoming Requests Tab

```
┌──────────────────────────────────────────────────────────────────┐
│ 📊 Manufacturing Dashboard                                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Active Orders] [Incoming Requests✅] [Material Receipts] ...  │
│                                                                  │
│  ┌─ Incoming Requests ─────────────────────────────────────────┐ │
│  │                                                              │ │
│  │  [1] PRQ-20251027-00003                                      │ │
│  │      Status: PENDING  |  SO-20251027-0001                   │ │
│  │      Product: T-shirt printing  |  100 pcs                  │ │
│  │      Required: 2025-10-31  |  Priority: medium              │ │
│  │      [👁️ View]  [📝 Create MRN]  [✅ Analyze]               │ │
│  │                                                              │ │
│  │  [2] PRQ-20251027-00002                                      │ │
│  │      Status: PENDING  |  SO-20251027-0001                   │ │
│  │      Product: T-shirt printing  |  100 pcs                  │ │
│  │      Required: 2025-10-31  |  Priority: medium              │ │
│  │      [👁️ View]  [📝 Create MRN]  [✅ Analyze]               │ │
│  │                                                              │ │
│  │  [3] PRQ-20251016-00001                                      │ │
│  │      Status: PENDING  |  SO-20251016-0001                   │ │
│  │      Product: T-shirt printing  |  100 pcs                  │ │
│  │      Required: 2025-10-24  |  Priority: medium              │ │
│  │      [👁️ View]  [📝 Create MRN]  [✅ Analyze]               │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Current Test Data

### 6 Production Requests Ready for Review

| Request | Sales Order | Product | Qty | Status | Required |
|---------|-------------|---------|-----|--------|----------|
| PRQ-20251027-00003 | SO-20251027-0001 | T-shirt printing | 100 | ⏳ PENDING | 2025-10-31 |
| PRQ-20251027-00002 | SO-20251027-0001 | T-shirt printing | 100 | ⏳ PENDING | 2025-10-31 |
| PRQ-20251027-00001 | SO-20251027-0001 | T-shirt printing | 100 | ⏳ PENDING | 2025-10-31 |
| PRQ-20251016-00001 | SO-20251016-0001 | T-shirt printing | 100 | ⏳ PENDING | 2025-10-24 |
| PRQ-20251015-00001 | SO-20251015-0001 | T-shirt printing | 200 | ⏳ PENDING | 2025-10-30 |
| PRQ-20251014-00001 | SO-20251014-0001 | Formal Shirt | 100 | ⏳ PENDING | 2025-10-30 |

---

## ✅ Testing Steps (For Users)

### 1️⃣ Login to Dashboard
```
• Email: Choose your Manufacturing user
• Password: Your password
• Department: manufacturing
```

### 2️⃣ Navigate to Manufacturing Dashboard
```
URL: http://localhost:3000/manufacturing/dashboard
Or: Sidebar → Manufacturing → Dashboard
```

### 3️⃣ Click "Incoming Requests" Tab
```
You should see all 6 production requests with status "PENDING"
```

### 4️⃣ Review a Production Request
```
• Click "View" or "Analyze" button on any request
• Review product specifications
• Check customer details and delivery date
• Analyze material requirements
```

### 5️⃣ Create Material Request Notes (MRN)
```
• Click "Create MRN" button
• System suggests materials based on product
• Review and modify quantities as needed
• Save MRN
• MRN appears in Inventory for procurement to fulfill
```

---

## 🔄 API Endpoints

### Get Production Requests
```
GET /api/production-requests?status=pending,reviewed

Response:
{
  "success": true,
  "data": [
    {
      "id": 6,
      "request_number": "PRQ-20251027-00003",
      "status": "pending",
      "sales_order_number": "SO-20251027-0001",
      "product_name": "T-shirt printing",
      "quantity": 100,
      "unit": "pcs",
      "priority": "medium",
      "required_date": "2025-10-31",
      "customer_name": "Ashwini Khedekar"
    }
  ]
}
```

### Send Sales Order to Procurement (Triggers Production Request)
```
PUT /api/sales/orders/4/send-to-procurement

Response:
{
  "message": "Sales order sent to procurement and production request created for manufacturing successfully",
  "productionRequest": {
    "id": 6,
    "request_number": "PRQ-20251027-00003"
  }
}
```

---

## 🎯 Key Benefits

✅ **Automatic** - No manual entry needed
✅ **Real-time** - Manufacturing notified instantly
✅ **Complete** - All product info included
✅ **Traceable** - Full audit trail
✅ **Efficient** - Reduces delays and errors
✅ **Integrated** - Links sales to procurement to manufacturing

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No requests showing | Refresh page (F5) or check if sales order was sent to procurement |
| Notification not received | Check email or refresh dashboard to see requests |
| Cannot create MRN | Verify manufacturing user has proper permissions |
| Wrong product details | Check sales order product information |

---

## 📞 Next Actions

1. **Test the flow:**
   - Go to Manufacturing Dashboard
   - View Incoming Requests
   - Review one of the 6 production requests
   - Try creating an MRN

2. **Create a new sales order to test end-to-end:**
   - Sales → Create Sales Order
   - Fill in details
   - Click "Send to Procurement"
   - Check Manufacturing Dashboard Incoming Requests tab
   - Should see the new request within seconds

3. **Monitor the flow:**
   - Track request from sales order → production request → MRN → purchase order

---

**Status:** ✅ Ready to Use
**Test Data:** 6 production requests loaded
**Dashboard:** Manufacturing Dashboard - Incoming Requests tab