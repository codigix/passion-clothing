# 📦 Procurement Material Request - Complete Guide

## 🎯 Overview

This guide shows you how to manage the **Project Material Request workflow** from the **Procurement Department's perspective**.

---

## 🚀 Quick Start for Procurement Team

### 1. **Create a Material Request**

#### From Purchase Order Details Page:

1. Navigate to **Procurement Dashboard** → **Purchase Orders**
2. Click on any Purchase Order that is linked to a **Project**
3. Look for the **"Send Material Request to Manufacturing"** button in the Quick Actions section
4. Click the button to open the Material Request form

#### Material Request Form Fields:

```
┌─────────────────────────────────────────────────────────────┐
│  Create Material Request                                     │
│                                                              │
│  Priority: [Low | Medium | High | Urgent]                   │
│  Required Date: [Select Date]                               │
│  Procurement Notes: [Add special instructions...]           │
│                                                              │
│  Select Materials from PO:                                   │
│  ☑ Cotton Fabric - 100 Meters                               │
│  ☑ Polyester Thread - 50 Spools                             │
│  ☐ Buttons - 1000 Pieces                                    │
│                                                              │
│  [Send Request] [Cancel]                                     │
└─────────────────────────────────────────────────────────────┘
```

**What happens after you submit:**
- ✅ Material request is created with status: **"Pending"**
- 🔔 Manufacturing department receives a notification
- 📧 Email notification sent to Manufacturing team (if configured)
- 📊 Request appears in your Material Requests dashboard

---

### 2. **Track Material Requests**

#### Option A: From Procurement Dashboard

1. Go to **Procurement Dashboard**
2. Click on the **"Material Requests"** tab (6th tab)
3. View summary statistics:
   - Total Requests
   - Pending Reviews
   - Materials Reserved
   - Completed Requests

4. Click **"View All Material Requests"** button

#### Option B: Direct Navigation

1. Go to **`/procurement/material-requests`**
2. Or use the sidebar: **Procurement** → **Material Requests**

---

### 3. **Material Requests Dashboard**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Material Requests                                                   │
│  [Back to Dashboard]                              [Refresh]          │
│                                                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │  16  │  │  5   │  │  3   │  │  2   │  │  4   │  │  2   │      │
│  │Total │  │Pend. │  │Review│  │Forwd.│  │Avail.│  │Resv. │      │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘      │
│                                                                      │
│  Filter by Status: [All Requests ▼]                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ ID  │ Project │ PO Number │ Priority │ Status │ Date │ ... │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │ #1  │ ABC Proj│ PO-001    │ HIGH     │ PEND.  │ ...  │[View]│   │
│  │ #2  │ XYZ Proj│ PO-002    │ URGENT   │ RESERV │ ...  │[View]│   │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

#### Features:

**📊 Statistics Cards:**
- **Total Requests** - All material requests created
- **Pending** - Waiting for manufacturing review
- **Reviewed** - Manufacturing has reviewed
- **Forwarded** - Sent to inventory department
- **Available** - Stock is available
- **Reserved** - Materials reserved and ready

**🔍 Filters:**
- Filter by status to see specific requests
- Quick access to different workflow stages

**📋 Request Table:**
- Request ID (clickable)
- Project Name
- PO Number
- Priority Badge (color-coded)
- Status Badge (color-coded)
- Required Date
- Created Date
- View Details button

---

### 4. **View Request Details**

Click **"View"** on any request to see full details:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Material Request #1                                                 │
│  Created on Jan 15, 2024, 10:30 AM                          [×]     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Project Name: ABC Manufacturing Project                       │  │
│  │ PO Number: PO-20240115-00001                                  │  │
│  │ Priority: [HIGH]    Status: [MATERIALS RESERVED]              │  │
│  │ Required Date: Jan 20, 2024    Created By: John Doe          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  📦 Materials Requested:                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ # │ Material        │ Quantity │ Unit   │ Availability      │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ 1 │ Cotton Fabric   │ 100      │ Meters │ ✓ Available (120) │  │
│  │ 2 │ Polyester Thread│ 50       │ Spools │ ✓ Available (75)  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  📝 Procurement Notes:                                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Urgent requirement for Project ABC. Please prioritize.       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  📝 Manufacturing Notes:                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Reviewed and approved. Forwarding to inventory.              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  📝 Inventory Notes:                                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ All materials available. Reserved for Project ABC.           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ✅ Reserved Materials:                                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Barcode: INV-2024-001234                                      │  │
│  │ Location: Warehouse A - Rack 5 - Shelf 2                     │  │
│  │ Quantity: 100 Meters                                          │  │
│  │ Product: Cotton Fabric                                        │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ Barcode: INV-2024-001235                                      │  │
│  │ Location: Warehouse A - Rack 3 - Shelf 1                     │  │
│  │ Quantity: 50 Spools                                           │  │
│  │ Product: Polyester Thread                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  📅 Timeline:                                                        │
│  ● PENDING - Jan 15, 2024, 10:30 AM                                 │
│  ● REVIEWED - Jan 15, 2024, 11:15 AM                                │
│  ● FORWARDED TO INVENTORY - Jan 15, 2024, 11:20 AM                  │
│  ● STOCK AVAILABLE - Jan 15, 2024, 11:45 AM                         │
│  ● MATERIALS RESERVED - Jan 15, 2024, 12:00 PM                      │
│                                                                      │
│  [Close]                                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Status Flow & What They Mean

### Status Progression:

```
1. PENDING
   ↓ (Manufacturing reviews)
2. REVIEWED
   ↓ (Manufacturing forwards)
3. FORWARDED TO INVENTORY
   ↓ (Inventory checks stock)
4. STOCK CHECKING
   ↓ (System determines availability)
5a. STOCK AVAILABLE (all materials available)
5b. PARTIAL AVAILABLE (some materials available)
5c. STOCK UNAVAILABLE (no materials available)
   ↓ (Inventory reserves materials)
6. MATERIALS RESERVED
   ↓ (Manufacturing issues materials)
7. MATERIALS ISSUED
   ↓ (Project completed)
8. COMPLETED
```

### Status Badges & Colors:

| Status | Badge Color | Icon | Meaning |
|--------|------------|------|---------|
| **Pending** | 🟡 Yellow | ⏰ | Waiting for manufacturing review |
| **Reviewed** | 🔵 Blue | ✓ | Manufacturing has reviewed |
| **Forwarded to Inventory** | 🟣 Purple | 📦 | Sent to inventory department |
| **Stock Checking** | 🟣 Indigo | ⏰ | Inventory is checking availability |
| **Stock Available** | 🟢 Green | ✓ | All materials in stock |
| **Partial Available** | 🟠 Orange | ⚠ | Some materials in stock |
| **Stock Unavailable** | 🔴 Red | ⚠ | No materials in stock |
| **Materials Reserved** | 🟢 Emerald | ✓ | Materials reserved for project |
| **Materials Issued** | 🟢 Teal | ✓ | Materials issued to production |
| **Completed** | ⚪ Gray | ✓ | Request completed |

---

## 🔔 Notifications You'll Receive

### 1. **When Manufacturing Reviews Your Request**
```
📬 Material Request Reviewed
Manufacturing has reviewed your material request #1 for Project ABC.
Status: Reviewed
[View Request]
```

### 2. **When Inventory Checks Stock**
```
📬 Stock Availability Update
Inventory has checked stock for material request #1.
Status: Stock Available
All requested materials are available.
[View Request]
```

### 3. **When Materials Are Reserved**
```
📬 Materials Reserved
Materials have been reserved for your request #1.
Project: ABC Manufacturing Project
Reserved Items: 2
[View Details]
```

### 4. **When Materials Are Issued**
```
📬 Materials Issued
Materials have been issued for request #1.
Project: ABC Manufacturing Project
Status: Materials Issued
[View Request]
```

---

## 🎨 Priority Levels

### Priority Badge Colors:

| Priority | Badge Color | When to Use |
|----------|------------|-------------|
| **LOW** | ⚪ Gray | Standard requests, no rush |
| **MEDIUM** | 🔵 Blue | Normal priority, standard timeline |
| **HIGH** | 🟠 Orange | Important, needs attention soon |
| **URGENT** | 🔴 Red | Critical, immediate attention required |

### Setting Priority:

Choose priority based on:
- **Project deadline**
- **Production schedule**
- **Customer requirements**
- **Material lead time**

---

## 📱 Dashboard Integration

### Procurement Dashboard - Material Requests Tab

The Procurement Dashboard now includes a **Material Requests** tab showing:

```
┌─────────────────────────────────────────────────────────────┐
│  Material Requests                                           │
│  [View All Material Requests]                                │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │    5     │  │    3     │  │    8     │  │   16     │   │
│  │ Pending  │  │ Reviewed │  │ Reserved │  │  Total   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  Recent Requests:                                            │
│  • Request #15 - Project XYZ - Status: Reserved             │
│  • Request #14 - Project ABC - Status: Forwarded            │
│  • Request #13 - Project DEF - Status: Pending              │
└─────────────────────────────────────────────────────────────┘
```

**Quick Stats:**
- **Pending** - Requests waiting for manufacturing review
- **Reviewed** - Requests reviewed by manufacturing
- **Reserved** - Materials reserved and ready
- **Total** - All material requests

---

## 🔗 Navigation Paths

### Access Material Requests:

**Method 1: From Dashboard**
```
Procurement Dashboard → Material Requests Tab → View All Material Requests
```

**Method 2: From Sidebar**
```
Sidebar → Procurement → Material Requests
```

**Method 3: Direct URL**
```
/procurement/material-requests
```

**Method 4: From PO Details**
```
Purchase Orders → Select PO → Send Material Request
```

---

## ✅ Best Practices

### 1. **Creating Requests**
- ✅ Always set appropriate priority
- ✅ Provide clear procurement notes
- ✅ Select accurate required date
- ✅ Select only needed materials
- ✅ Double-check quantities

### 2. **Tracking Requests**
- ✅ Check dashboard regularly
- ✅ Respond to notifications promptly
- ✅ Follow up on pending requests
- ✅ Verify reserved materials
- ✅ Coordinate with manufacturing

### 3. **Communication**
- ✅ Use notes field for special instructions
- ✅ Mention any quality requirements
- ✅ Specify delivery location if needed
- ✅ Note any substitution preferences
- ✅ Include contact information

---

## 🚨 Troubleshooting

### Issue: Can't create material request

**Solution:**
- Ensure PO is linked to a project
- Check PO status (must be approved, sent, acknowledged, or received)
- Verify you have procurement department access

### Issue: Request stuck in "Pending"

**Solution:**
- Check if manufacturing team received notification
- Contact manufacturing department
- Verify request priority is set correctly

### Issue: Materials not reserved

**Solution:**
- Check stock availability status
- If "Stock Unavailable", contact inventory
- Consider alternative materials
- Adjust quantities if partial stock

### Issue: Can't view request details

**Solution:**
- Refresh the page
- Check your internet connection
- Verify you have proper permissions
- Try logging out and back in

---

## 📞 Support & Contact

### For Technical Issues:
- Contact IT Support
- Email: it@company.com
- Phone: ext. 1234

### For Workflow Questions:
- Contact Manufacturing Manager
- Contact Inventory Manager
- Email: operations@company.com

### For System Training:
- Request training session
- View video tutorials
- Read user documentation

---

## 🎯 Quick Reference

### Keyboard Shortcuts:
- `Ctrl + R` - Refresh requests list
- `Esc` - Close modal
- `Enter` - Submit form

### Status Icons:
- ⏰ - Waiting/Pending
- ✓ - Completed/Available
- ⚠ - Warning/Partial
- ✗ - Unavailable/Error
- 📦 - In Process

### Color Codes:
- 🟡 Yellow - Pending/Warning
- 🔵 Blue - In Progress
- 🟢 Green - Success/Available
- 🔴 Red - Urgent/Unavailable
- 🟣 Purple - Forwarded
- ⚪ Gray - Completed/Inactive

---

## 📈 Reports & Analytics

### Available Reports:
- Material request summary
- Status distribution
- Priority analysis
- Fulfillment time
- Department performance

### Export Options:
- Export to Excel
- Export to PDF
- Print request details
- Download QR codes

---

## 🔄 Integration with Other Modules

### Purchase Orders:
- Create requests from PO details
- Link materials to PO items
- Track PO-to-production flow

### Inventory:
- Real-time stock checking
- Material reservation
- Location tracking
- Barcode integration

### Manufacturing:
- Production planning
- Material issuance
- Work order linking
- Quality control

### Projects:
- Project material tracking
- Cost allocation
- Timeline management
- Resource planning

---

## 🎓 Training Resources

### Video Tutorials:
1. Creating Material Requests (5 min)
2. Tracking Request Status (3 min)
3. Understanding Notifications (4 min)
4. Best Practices (10 min)

### Documentation:
- User Manual (PDF)
- Quick Start Guide
- FAQ Document
- Workflow Diagrams

### Live Training:
- Weekly training sessions
- One-on-one support
- Department workshops
- Q&A sessions

---

## ✨ New Features Coming Soon

- 🔜 Bulk material requests
- 🔜 Material substitution suggestions
- 🔜 Automated priority calculation
- 🔜 Mobile app support
- 🔜 Advanced analytics dashboard
- 🔜 Email digest reports
- 🔜 Custom workflow rules
- 🔜 Integration with ERP systems

---

## 📝 Feedback & Suggestions

We value your feedback! Help us improve the system:

- Submit feature requests
- Report bugs or issues
- Share workflow improvements
- Suggest UI enhancements

**Contact:** feedback@company.com

---

**Last Updated:** January 2024  
**Version:** 1.0  
**Document Owner:** IT Department

---

## 🎉 You're All Set!

You now have everything you need to manage material requests from the Procurement dashboard. Start creating requests and tracking materials for your projects!

**Need Help?** Contact your system administrator or refer to this guide.