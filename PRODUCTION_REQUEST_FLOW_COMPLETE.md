# Production Request Automation - Complete Workflow ✅

## Executive Summary
When a sales order is created and sent to procurement department, the manufacturing department **automatically receives a production request** to analyze the order and create Material Request Notes (MRN) accordingly.

---

## 🔄 Complete Workflow

### Step 1: Sales Order Creation
**What happens:**
- Sales department creates a new sales order (e.g., SO-20251027-0001)
- Order contains product details, quantities, delivery dates, and customer info
- Order status: `draft`

**Where:** Sales → Create Sales Order

---

### Step 2: Send to Procurement (Trigger Point)
**What happens:**
- Sales clicks "Send to Procurement" button
- System creates a **Production Request** automatically
  - Request Number: PRQ-20251027-00001
  - Status: `pending`
  - Linked to the Sales Order
  - Contains all product & delivery information

**HTTP Call:**
```
PUT /api/sales/orders/:id/send-to-procurement
```

**Backend Flow:**
```
1. Sales Order marked as ready_for_procurement
2. Production Request created with buildProductionRequestPayloadFromOrder()
3. Notification sent to manufacturing department
4. Transaction committed (atomic operation)
```

---

### Step 3: Manufacturing Gets Notification
**What happens:**
- Manufacturing department receives notification
- Notification includes:
  - Production Request Number
  - Sales Order Number
  - Product Details
  - Quantity & Delivery Date
  - Action URL to view request

**Notification Type:** `manufacturing`
**Priority:** `high` (or based on sales order priority)

---

### Step 4: Manufacturing Dashboard - Incoming Requests Tab
**What manufacturing sees:**
- Dashboard → Incoming Requests tab shows all pending production requests
- Each request displays:
  - Request Number (PRQ-YYYYMMDD-XXXXX)
  - Sales Order Link
  - Product Name & Quantity
  - Priority & Required Date
  - Quick action buttons

**API Endpoint:**
```
GET /api/production-requests?status=pending,reviewed
```

**Response includes:**
```json
{
  "success": true,
  "data": [
    {
      "id": 6,
      "request_number": "PRQ-20251027-00003",
      "status": "pending",
      "sales_order_id": 4,
      "sales_order_number": "SO-20251027-0001",
      "product_name": "T-shirt printing",
      "quantity": 100,
      "unit": "pcs",
      "priority": "medium",
      "required_date": "2025-10-31",
      "product_description": "T-shirt printing (100 pcs)",
      "customer_name": "Ashwini Khedekar"
    }
  ]
}
```

---

### Step 5: Manufacturing Analysis
**What manufacturing does:**
1. **Reviews** the incoming production request
   - Analyzes product specifications
   - Checks material requirements
   - Verifies feasibility
   - Confirms timeline

2. **Creates Material Request Notes (MRN)**
   - Click "Create MRN" button on the request
   - System generates MRN with:
     - Materials needed
     - Quantities
     - Linked to Sales Order
     - Linked to Production Request
   - MRN status: `pending`

3. **MRN appears in Inventory**
   - Procurement can now see the MRN
   - Creates Purchase Orders for materials
   - Follows Material Receipt flow

---

### Step 6: Production Request Status Updates
**Manufacturing can:**
- Mark request as `reviewed` after analysis
- Mark request as `in_production` when manufacturing starts
- Add notes and comments
- Link to actual production orders

**Status Transitions:**
```
pending → reviewed → in_production → completed
```

---

## 📊 Current System State

### Production Requests in Database (6 Total)

| # | Request | Status | Sales Order | Product | Qty | Priority | Required |
|---|---------|--------|-------------|---------|-----|----------|----------|
| 1 | PRQ-20251027-00003 | pending | SO-20251027-0001 | T-shirt printing | 100 | medium | 2025-10-31 |
| 2 | PRQ-20251027-00002 | pending | SO-20251027-0001 | T-shirt printing | 100 | medium | 2025-10-31 |
| 3 | PRQ-20251027-00001 | pending | SO-20251027-0001 | T-shirt printing | 100 | medium | 2025-10-31 |
| 4 | PRQ-20251016-00001 | pending | SO-20251016-0001 | T-shirt printing | 100 | medium | 2025-10-24 |
| 5 | PRQ-20251015-00001 | pending | SO-20251015-0001 | T-shirt printing | 200 | medium | 2025-10-30 |
| 6 | PRQ-20251014-00001 | pending | SO-20251014-0001 | Formal Shirt | 100 | medium | 2025-10-30 |

---

## 🚀 How to Test

### For Users:

1. **Login to Dashboard**
   - Manufacturing user credentials
   - Department: manufacturing

2. **Navigate to Manufacturing Dashboard**
   - URL: `http://localhost:3000/manufacturing/dashboard`

3. **Click "Incoming Requests" Tab**
   - Should show **6 pending production requests**
   - Each with full product and delivery details

4. **Click on any Request**
   - View complete sales order details
   - Review product specifications
   - Check delivery timeline

5. **Create Material Request Notes**
   - Button: "Create MRN"
   - System generates MRN with materials
   - MRN becomes visible to procurement

---

## 🔧 For Developers

### Backend Flow Code

**File:** `server/routes/sales.js` (Lines 250-334)

```javascript
router.put('/orders/:id/send-to-procurement', async (req, res) => {
  // 1. Update sales order (ready_for_procurement = true)
  await order.update({
    ready_for_procurement: true,
    ready_for_procurement_by: req.user.id,
    ready_for_procurement_at: new Date()
  });
  
  // 2. Send notification to procurement department
  await NotificationService.sendToDepartment('procurement', {...});
  
  // 3. CREATE PRODUCTION REQUEST FOR MANUFACTURING
  const requestNumber = await generateProductionRequestNumber();
  const payload = buildProductionRequestPayloadFromOrder(order, requestNumber, userId);
  const productionRequest = await ProductionRequest.create(payload);
  
  // 4. Send notification to manufacturing department
  await sendProductionRequestNotification(productionRequest, order);
  
  // 5. Return success response
  return res.json({ productionRequest });
});
```

### Helper Functions

**`buildProductionRequestPayloadFromOrder()`** (Line 32-60)
- Extracts product info from sales order
- Calculates total quantity
- Builds product description
- Sets priority & delivery date

**`sendProductionRequestNotification()`** (Line 62-87)
- Creates notification with full context
- Includes action URL to view request
- Sends to manufacturing department
- Sets 7-day expiry

### API Endpoints

#### Create Production Request from Sales Order
```
PUT /api/sales/orders/:id/send-to-procurement
```

#### Get Production Requests
```
GET /api/production-requests?status=pending,reviewed
```

**Query Parameters:**
- `status` - comma-separated status values
- `priority` - filter by priority
- `project_name` - filter by project name

#### Get Single Production Request
```
GET /api/production-requests/:id
```

---

## 🎯 Key Features

### ✅ Automation
- Production requests auto-created when sales order sent to procurement
- No manual entry needed
- Reduces errors and delays

### ✅ Notifications
- Real-time alerts to manufacturing department
- Full context provided in notification
- Expiry after 7 days

### ✅ Traceability
- Every request linked to:
  - Sales Order (SO-YYYYMMDD-XXXX)
  - Production Stages
  - Material Requirements
  - MRN (Material Request Notes)

### ✅ Status Management
- Clear status workflow: pending → reviewed → in_production → completed
- Audit trail of status changes
- User tracking (who changed, when)

### ✅ Bi-directional Linking
- Sales Order → Production Request → MRN → Purchase Order
- Complete traceability from customer order to material fulfillment

---

## 🔍 Database Schema

### ProductionRequest Table
```sql
CREATE TABLE production_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_number VARCHAR(50) UNIQUE,          -- PRQ-YYYYMMDD-XXXXX
  sales_order_id INT NOT NULL,                -- Link to sales order
  sales_order_number VARCHAR(50),             -- Denormalized for quick access
  project_name VARCHAR(255),                  -- Project grouping
  product_name VARCHAR(255),                  -- Main product
  product_description LONGTEXT,               -- Detailed description
  product_specifications JSON,                -- Items & specs
  quantity DECIMAL(12,3),                     -- Total quantity
  unit VARCHAR(20),                           -- Unit (pcs, meters, etc)
  priority ENUM('low', 'medium', 'high'),     -- Priority level
  required_date DATE,                         -- Delivery date
  status ENUM('pending', 'reviewed', 'in_production', 'completed', 'cancelled'),
  requested_by INT,                           -- User who created
  reviewed_by INT,                            -- User who reviewed
  sales_notes LONGTEXT,                       -- Notes from sales
  status_history JSON,                        -- Audit trail
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
  FOREIGN KEY (requested_by) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id),
  INDEX idx_sales_order_id (sales_order_id),
  INDEX idx_status (status),
  INDEX idx_request_number (request_number)
);
```

---

## ✅ Verification Checklist

- [x] Production requests created with 'pending' status
- [x] Manufacturing dashboard filters for 'pending' and 'reviewed' requests
- [x] Notifications sent to manufacturing department
- [x] Request contains all necessary information
- [x] Linked to correct sales order
- [x] Customer name and delivery date included
- [x] Product specifications available for review

---

## 📝 Next Steps

1. **Manufacturing Review**
   - Review each production request
   - Analyze material requirements
   - Create MRN for each project

2. **Procurement Fulfillment**
   - View MRNs in Inventory module
   - Create purchase orders
   - Source materials from vendors

3. **Production Execution**
   - Use production orders for manufacturing
   - Track stages and progress
   - Update status as work progresses

4. **Quality & Delivery**
   - Quality checks at each stage
   - Final inspection before shipment
   - Delivery tracking

---

## 🐛 Troubleshooting

### Issue: No requests showing in "Incoming Requests" tab
**Solution:**
1. Check that sales order was sent to procurement
2. Verify manufacturing user is logged in
3. Check browser console for API errors
4. Verify production_requests table has records with status='pending'

### Issue: Manufacturing not receiving notifications
**Solution:**
1. Check NotificationService configuration
2. Verify manufacturing user email is correct
3. Check database for Notification records
4. Verify notification expiry hasn't passed

### Issue: Production Request not created
**Solution:**
1. Check database transaction logs
2. Verify sequelize connection is working
3. Check for foreign key constraint errors
4. Verify sales order data is complete

---

## 📞 Support

For issues or questions:
1. Check the database directly using scripts provided
2. Review backend logs for error messages
3. Check browser console for frontend errors
4. Verify all API endpoints are running

---

**Last Updated:** October 31, 2025
**Status:** ✅ PRODUCTION READY