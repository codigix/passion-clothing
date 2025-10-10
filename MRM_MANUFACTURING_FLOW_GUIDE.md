# Manufacturing Material Request (MRN) Flow - Complete Guide

## 🎯 Overview

The **Manufacturing Material Request (MRN)** system enables the Manufacturing department to request materials from Inventory for production projects. This guide covers the complete workflow and how to use the new pages.

### ✨ **NEW: Quick Create from Production Requests**
You can now create MRNs directly from incoming Production Requests with automatic data prefilling! Click the **"Create MRN"** button on any production request card to quickly generate a material request with project info already filled. See [MRN_QUICK_CREATE_FROM_PRODUCTION_REQUEST.md](./MRN_QUICK_CREATE_FROM_PRODUCTION_REQUEST.md) for complete details.

---

## 📦 What Was Created

### **1. Frontend Pages**

#### **A. MRNListPage** (`/manufacturing/material-requests`)
- **Purpose**: View all material requests created by Manufacturing
- **Features**:
  - Dashboard with summary statistics
  - Filter by status, priority, and project
  - Search by request number or project name
  - View detailed information for each request
  - Track material issue status (issued/pending/balance)

#### **B. CreateMRMPage ** (`/manufacturing/material-requests/create`)
- **Purpose**: Create new material requests
- **Features**:
  - Multi-material request form
  - Project name selection (from active production requests)
  - Priority levels (Low, Medium, High, Urgent)
  - Required by date picker
  - Material autocomplete from product catalog
  - Support for multiple units (meters, kg, pieces, rolls, boxes, liters)
  - Validation and error handling

### **2. Navigation**
- Added **"Material Requests (MRN)"** to Manufacturing sidebar
- Routes configured in `App.jsx`:
  - `/manufacturing/material-requests` → MRNListPage
  - `/manufacturing/material-requests/create` → CreateMRMPage 

---

## 🔄 Complete Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MANUFACTURING DEPARTMENT                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  CREATE MRN      │
                    │  (CreateMRMPage ) │
                    └──────────────────┘
                              │
                              ▼
                   ┌────────────────────┐
                   │ MRN Created        │
                   │ Status: pending    │
                   │ Number: MRN-...    │
                   └────────────────────┘
                              │
                              ▼
                   ┌────────────────────┐
                   │ Auto-Notification  │
                   │ sent to Inventory  │
                   └────────────────────┘
                              │
┌─────────────────────────────┴────────────────────────────┐
│                     INVENTORY DEPARTMENT                  │
└───────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌────────────────────────┐
                   │ Review Stock           │
                   │ Check Availability     │
                   │ (Inventory Team)       │
                   └────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
       ┌────────────────┐         ┌────────────────────┐
       │ Stock Available│         │ Stock NOT Available│
       └────────────────┘         └────────────────────┘
                │                           │
                ▼                           ▼
       ┌────────────────┐         ┌────────────────────┐
       │ Issue Materials│         │ Trigger Procurement│
       │ Deduct Stock   │         │ Create notification│
       └────────────────┘         └────────────────────┘
                │                           │
                ▼                           ▼
       ┌────────────────┐         ┌────────────────────┐
       │ Status: issued │         │ Status: pending_   │
       │                │         │        procurement  │
       └────────────────┘         └────────────────────┘
                │                           │
                └───────────┬───────────────┘
                            ▼
               ┌────────────────────────┐
               │ Auto-Notification      │
               │ sent to Manufacturing  │
               └────────────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────┐
│                  MANUFACTURING DEPARTMENT                 │
└───────────────────────────────────────────────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ View MRN Status     │
                 │ (MRNListPage)       │
                 │ Track materials     │
                 └─────────────────────┘
```

---

## 📋 How to Use the MRN System

### **Step 1: Create Material Request**

1. **Navigate to Manufacturing Dashboard**
   - Login as Manufacturing user
   - Click **"Material Requests (MRN)"** in sidebar

2. **Click "Create New MRN" Button**

3. **Fill Request Information**:
   - **Project Name** (required): Select from active projects or enter custom name
   - **Priority** (required): Low/Medium/High/Urgent
   - **Required By Date** (required): When materials are needed
   - **Notes**: Special instructions for inventory team

4. **Add Materials**:
   - **Material Name** (required): Type or select from products
   - **Quantity** (required): Amount needed
   - **Unit** (required): Select appropriate unit
   - **Description**: Brief description
   - **Specifications**: Color, grade, size, etc.

5. **Add Multiple Materials**:
   - Click **"Add Material"** button to add more items
   - Click trash icon to remove unwanted items

6. **Submit**:
   - Click **"Create Material Request"**
   - System generates unique MRN number: `MRN-PROJ2025-001`
   - Auto-notification sent to Inventory

### **Step 2: Track Your Requests**

1. **Go to MRN List Page**
   - Navigate to `/manufacturing/material-requests`

2. **View Summary Statistics**:
   - Total Requests
   - Pending Review
   - Issued
   - Completed
   - Urgent Priority

3. **Filter Requests**:
   - **Search**: By request number or project name
   - **Status**: Filter by processing status
   - **Priority**: Filter by urgency level
   - **Project**: Filter by project name

4. **View Request Details**:
   - Click **"View Details"** button on any request
   - Modal shows:
     - Full request information
     - All materials with status
     - Quantity tracking (Required/Available/Issued/Balance)
     - Timeline and notes

### **Step 3: Monitor Material Status**

Each material in your request shows:

- ✅ **Required**: Original quantity requested
- 📦 **Available**: Stock found by Inventory
- ✔️ **Issued**: Materials released to you
- ⚠️ **Balance**: Still pending

**Status Types**:
- 🟡 **Pending**: Awaiting inventory review
- 🔵 **Pending Inventory Review**: Being processed
- 🟠 **Partially Issued**: Some materials issued
- 🟢 **Issued**: All materials released
- 🟣 **Pending Procurement**: Needs to be purchased
- ⚫ **Completed**: Request fulfilled

---

## 🎨 Page Features

### **CreateMRMPage  Features**

✅ **Smart Project Selection**
- Auto-populates from active production requests
- Allows custom project names via datalist

✅ **Material Autocomplete**
- Suggests materials from product catalog
- Remembers recently used items

✅ **Multi-Unit Support**
- Meters, Kilograms, Pieces, Rolls, Boxes, Liters, Units

✅ **Form Validation**
- Required field checks
- Future date validation
- Quantity validation
- User-friendly error messages

✅ **Dynamic Form**
- Add/remove materials on the fly
- No limit on material count
- Responsive grid layout

### **MRNListPage Features**

✅ **Summary Dashboard**
- 5 key metrics at a glance
- Real-time status counts

✅ **Advanced Filtering**
- Multi-filter support (search + status + priority + project)
- One-click filter reset
- Instant filter application

✅ **Card-Based Layout**
- Clean, visual request cards
- Color-coded status badges
- Priority indicators
- Quick stats per request

✅ **Detailed Modal View**
- Full request information
- Material-level tracking
- Timeline information
- Scrollable for long lists

✅ **Responsive Design**
- Works on desktop and tablets
- Grid adjusts to screen size

---

## 🔔 Notification Flow

### **Manufacturing Receives**:
1. ✉️ When Inventory reviews request
2. ✉️ When materials are issued
3. ✉️ When materials need procurement

### **Inventory Receives**:
1. ✉️ When new MRN is created
2. ✉️ When urgent priority request submitted

### **Procurement Receives**:
1. ✉️ When materials trigger procurement request

---

## 🎯 Status Definitions

| Status | Meaning | Next Action |
|--------|---------|-------------|
| `pending` | Just created | Wait for Inventory review |
| `pending_inventory_review` | Being reviewed | Inventory checking stock |
| `partially_issued` | Some materials given | Wait for remaining items |
| `issued` | All materials given | Start production |
| `completed` | Request closed | None |
| `pending_procurement` | Need to purchase | Wait for procurement |
| `rejected` | Cannot fulfill | Create new request |
| `cancelled` | Request cancelled | Create new if needed |

---

## 💡 Best Practices

### **For Creating Requests**

1. ✅ **Plan Ahead**
   - Submit requests with buffer time
   - Use appropriate priority levels
   - Don't mark everything as "Urgent"

2. ✅ **Be Specific**
   - Provide clear material descriptions
   - Include specifications (color, grade, size)
   - Add notes for special requirements

3. ✅ **Use Projects**
   - Link requests to production projects
   - Helps track project costs
   - Easier for reporting

4. ✅ **Accurate Quantities**
   - Request exact amounts needed
   - Include wastage buffer if needed
   - Use correct units

### **For Tracking Requests**

1. ✅ **Check Regularly**
   - Monitor status updates
   - Respond to inventory queries
   - Plan production based on availability

2. ✅ **Use Filters**
   - Filter by project for project planning
   - Filter by urgent for priorities
   - Filter by pending for follow-ups

3. ✅ **Review Details**
   - Check balance quantities
   - Verify issued materials
   - Cross-check with production needs

---

## 🔧 Technical Details

### **API Endpoints Used**

```
POST   /api/project-material-request/MRN/create
GET    /api/project-material-request?requesting_department=manufacturing
GET    /api/production-requests?status=pending,in_progress
GET    /api/products
```

### **Data Structure**

```json
{
  "request_number": "MRN-PROJ2025-001",
  "project_name": "Summer Collection 2025",
  "requesting_department": "manufacturing",
  "priority": "high",
  "required_by_date": "2025-03-20",
  "status": "pending_inventory_review",
  "notes": "Urgent for customer deadline",
  "materials_requested": [
    {
      "material_name": "Cotton Fabric",
      "description": "White plain cotton",
      "quantity_required": 500,
      "unit": "meters",
      "specifications": "60s count, plain weave",
      "available_qty": 300,
      "issued_qty": 300,
      "balance_qty": 200,
      "status": "partially_issued"
    }
  ]
}
```

---

## 🚀 Next Steps

### **Immediate**
1. ✅ Run MRN database migration
2. ✅ Restart server
3. ✅ Test creating first MRN
4. ✅ Verify notification delivery

### **Future Enhancements**
- 📱 Mobile app for field requests
- 📊 Material consumption analytics
- 📈 Trend analysis by project
- 🔄 Auto-reorder based on usage patterns
- 📧 Email notifications
- 📋 PDF export of requests
- 🔗 Integration with production planning

---

## 🐛 Troubleshooting

### **Problem**: Can't see "Material Requests" in sidebar
**Solution**: Hard refresh browser (Ctrl+Shift+R)

### **Problem**: Create button doesn't work
**Solution**: Check form validation errors (red highlights)

### **Problem**: No projects in dropdown
**Solution**: Create production requests first, or type custom project name

### **Problem**: Materials not loading
**Solution**: Check if products exist in inventory catalog

### **Problem**: Status not updating
**Solution**: Refresh page or check network connection

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review `MRN_IMPLEMENTATION_GUIDE.md` for technical details
3. Check `MRN_QUICK_START.md` for setup steps
4. Contact system administrator

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: Zencoder Assistant