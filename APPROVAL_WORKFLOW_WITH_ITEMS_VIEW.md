# Purchase Order & Sales Order Approval Workflow with Item Details

## ✅ **COMPLETE - Server Updated & Running**

All endpoints have been enhanced to include **full item details** (fabric requirements, accessories, items, cost summary, etc.) in approval requests. Admins can now view all details before approving.

---

## 🎯 **New Features Added**

### 1. **Enhanced Pending Approvals Endpoint**
- **Endpoint**: `GET /api/admin/pending-approvals`
- **Enhancement**: Now includes ALL fields from PO/SO including:
  - **Purchase Orders**: `items`, `fabric_requirements`, `accessories`, `cost_summary`, `attachments`
  - **Sales Orders**: `items`, `garment_specifications`, `design_files`
  - Full vendor/customer details (email, phone, company name, GST number)
  - Creator and approver information

### 2. **View Single Approval with Full Details**
- **Endpoint**: `GET /api/admin/pending-approvals/:id`
- **Purpose**: View complete approval details before making a decision
- **Returns**: 
  - Approval metadata (who requested, when, status)
  - **Complete entity data** with all items, specifications, and attachments
  - Related entities (vendor, customer, sales order, etc.)

### 3. **Approve from Approval Table**
- **Endpoint**: `POST /api/admin/pending-approvals/:id/approve`
- **Body**: `{ "notes": "Optional approval notes" }`
- **Actions**:
  - Updates Approval record status to 'approved'
  - Updates PO status to 'sent' (automatically sent to vendor)
  - Updates SO status to 'confirmed'
  - Sends notifications to relevant departments
  - Records approval timestamp and approver

### 4. **Reject from Approval Table**
- **Endpoint**: `POST /api/admin/pending-approvals/:id/reject`
- **Body**: `{ "notes": "REQUIRED - Rejection reason" }`
- **Actions**:
  - Updates Approval record status to 'rejected'
  - Returns PO/SO to 'draft' status for revision
  - Sends high-priority notifications to creator and department
  - Records rejection reason and timestamp

---

## 📋 **Complete Approval Workflow**

### **For Purchase Orders:**

#### **Step 1: Procurement Creates PO**
```
POST /api/procurement/pos
Status: draft
```

#### **Step 2: Submit for Approval**
```
POST /api/procurement/pos/:id/submit-for-approval
Body: { "notes": "Please approve this PO" }

Actions:
- PO status: draft → pending_approval
- Creates Approval record in approvals table
- Sends notification to Admin department
```

#### **Step 3: Admin Views Pending Approvals**
```
GET /api/admin/pending-approvals
GET /api/admin/pending-approvals?entity_type=purchase_order

Response includes:
{
  "approvals": [{
    "id": 1,
    "entity_type": "purchase_order",
    "entity_id": 123,
    "status": "pending",
    "created_at": "2025-01-15T10:00:00Z",
    "entity": {
      "id": 123,
      "po_number": "PO-20250115-0001",
      "items": [...],  // ✅ ALL ITEMS INCLUDED
      "fabric_requirements": [...],  // ✅ FULL FABRIC DETAILS
      "accessories": [...],  // ✅ ALL ACCESSORIES
      "cost_summary": {...},  // ✅ COMPLETE COST BREAKDOWN
      "vendor": {
        "id": 5,
        "name": "ABC Fabrics",
        "email": "vendor@abc.com",
        "phone": "+91-1234567890"
      },
      "creator": {
        "id": 10,
        "name": "John Doe",
        "department": "procurement"
      }
    }
  }],
  "purchaseOrders": [...],  // Backward compatibility
  "stats": {
    "totalPendingApprovals": 5,
    "totalPendingPOs": 3,
    "totalPOValue": 150000
  }
}
```

#### **Step 4: Admin Views Full Details (Optional)**
```
GET /api/admin/pending-approvals/1

Response:
{
  "approval": {
    "id": 1,
    "entity_type": "purchase_order",
    "status": "pending",
    "assignedUser": {...},
    "creator": {...},
    "entity": {
      // COMPLETE PO DATA with ALL items, fabric, accessories, cost summary
      "po_number": "PO-20250115-0001",
      "vendor": {...},  // Full vendor details
      "items": [
        {
          "item_code": "FAB001",
          "material_type": "Cotton",
          "spec": "100% Cotton, Single Jersey",
          "color": "Navy Blue",
          "size": "60\" width",
          "uom": "meters",
          "quantity": 500,
          "price": 250,
          "total": 125000,
          "remarks": "Required urgently"
        }
      ],
      "fabric_requirements": [...],
      "accessories": [...],
      "cost_summary": {
        "fabric_total": 125000,
        "accessories_total": 15000,
        "sub_total": 140000,
        "gst_percentage": 18,
        "gst_amount": 25200,
        "freight": 2000,
        "grand_total": 167200
      }
    }
  }
}
```

#### **Step 5A: Approve PO**
```
POST /api/admin/pending-approvals/1/approve
Body: { "notes": "Approved - Good pricing" }

Actions:
- Approval status: pending → approved
- PO status: pending_approval → sent
- PO approval_status: pending → approved
- Records approved_by, approved_at
- Notifies Procurement department
- Notifies Inventory (prepare for GRN)
```

#### **Step 5B: Reject PO**
```
POST /api/admin/pending-approvals/1/reject
Body: { "notes": "Price too high, please negotiate" }

Actions:
- Approval status: pending → rejected
- PO status: pending_approval → draft
- PO approval_status: pending → rejected
- Records rejection reason
- Sends HIGH priority notification to Procurement
- Creator can revise and resubmit
```

---

### **For Sales Orders:**

#### **Step 1: Sales Creates SO**
```
POST /api/sales/orders
Status: draft
```

#### **Step 2: Submit for Approval**
```
POST /api/sales/orders/:id/submit-for-approval
Body: { "notes": "Ready for approval" }

Actions:
- SO status: draft → pending_approval
- Creates Approval record
- Sends notification to Admin
```

#### **Step 3-5: Same as PO workflow above**
```
GET /api/admin/pending-approvals
GET /api/admin/pending-approvals/:id
POST /api/admin/pending-approvals/:id/approve
POST /api/admin/pending-approvals/:id/reject
```

---

## 🔍 **Data Included in Approval Responses**

### **Purchase Order Data:**
```json
{
  "id": 123,
  "po_number": "PO-20250115-0001",
  "vendor_id": 5,
  "customer_id": 10,
  "project_name": "Summer Collection 2025",
  "po_date": "2025-01-15",
  "expected_delivery_date": "2025-02-15",
  
  // ✅ ALL ITEMS - Main items array
  "items": [
    {
      "item_code": "FAB001",
      "material_type": "Cotton",
      "spec": "100% Cotton, Single Jersey",
      "color": "Navy Blue",
      "size": "60\" width",
      "uom": "meters",
      "quantity": 500,
      "price": 250,
      "total": 125000,
      "remarks": "Required urgently"
    }
  ],
  
  // ✅ FABRIC REQUIREMENTS - Detailed fabric breakdown
  "fabric_requirements": [
    {
      "fabric_type": "Cotton Single Jersey",
      "color": "Navy Blue",
      "hsn_code": "52081100",
      "gsm_quality": "180 GSM",
      "uom": "meters",
      "required_quantity": 500,
      "rate_per_unit": 250,
      "total": 125000,
      "supplier_name": "ABC Fabrics",
      "expected_delivery_date": "2025-02-15",
      "remarks": "High quality required"
    }
  ],
  
  // ✅ ACCESSORIES - All accessories
  "accessories": [
    {
      "accessory_item": "Buttons",
      "description": "12mm plastic buttons, white",
      "hsn_code": "96062100",
      "uom": "pieces",
      "required_quantity": 1000,
      "rate_per_unit": 2,
      "total": 2000,
      "supplier_name": "XYZ Accessories",
      "expected_delivery_date": "2025-02-10",
      "remarks": "Pack in boxes of 100"
    }
  ],
  
  // ✅ COST SUMMARY - Complete financial breakdown
  "cost_summary": {
    "fabric_total": 125000,
    "accessories_total": 15000,
    "sub_total": 140000,
    "gst_percentage": 18,
    "gst_amount": 25200,
    "freight": 2000,
    "grand_total": 167200
  },
  
  // ✅ ATTACHMENTS
  "attachments": [
    {
      "filename": "fabric-sample.jpg",
      "url": "/uploads/fabric-sample.jpg",
      "uploaded_at": "2025-01-15T10:00:00Z"
    }
  ],
  
  "total_quantity": 500,
  "total_amount": 140000,
  "final_amount": 167200,
  "status": "pending_approval",
  "priority": "high",
  "payment_terms": "30 days credit",
  "delivery_address": "123 Factory Street...",
  "terms_conditions": "Standard terms apply",
  "special_instructions": "Handle with care",
  "internal_notes": "Urgent order",
  
  // Related entities
  "vendor": {
    "id": 5,
    "name": "ABC Fabrics",
    "vendor_code": "VEN-001",
    "email": "vendor@abc.com",
    "phone": "+91-1234567890",
    "company_name": "ABC Fabrics Pvt Ltd",
    "gst_number": "27AABCU9603R1ZM"
  },
  "customer": {...},
  "creator": {...},
  "salesOrder": {...}
}
```

### **Sales Order Data:**
```json
{
  "id": 456,
  "order_number": "SO-20250115-0001",
  "customer_id": 10,
  "order_date": "2025-01-15",
  "delivery_date": "2025-03-15",
  "buyer_reference": "STYLE-2025-001",
  "order_type": "Knitted",
  
  // ✅ ALL ITEMS
  "items": [
    {
      "item_code": "ITEM001",
      "product_type": "T-Shirt",
      "style_no": "TS-001",
      "fabric_type": "Cotton Single Jersey",
      "color": "Navy Blue",
      "size_breakdown": {
        "S": 100,
        "M": 200,
        "L": 150,
        "XL": 50
      },
      "quantity": 500,
      "unit_price": 450,
      "total": 225000,
      "remarks": "Print on front"
    }
  ],
  
  // ✅ GARMENT SPECIFICATIONS
  "garment_specifications": {
    "fabric_type": "100% Cotton Single Jersey",
    "gsm": "180",
    "color": "Navy Blue",
    "quality_specs": "Pre-shrunk, enzyme washed",
    "print_specs": "Screen print on front",
    "packing": "Individual poly bags"
  },
  
  // ✅ DESIGN FILES
  "design_files": [
    {
      "filename": "front-design.ai",
      "url": "/uploads/designs/front-design.ai",
      "uploaded_at": "2025-01-15T09:00:00Z"
    }
  ],
  
  "total_quantity": 500,
  "total_amount": 225000,
  "final_amount": 265500,
  "status": "pending_approval",
  "priority": "high",
  
  // Related entities
  "customer": {
    "id": 10,
    "name": "Fashion Retail Co.",
    "customer_code": "CUST-001",
    "email": "customer@fashion.com",
    "phone": "+91-9876543210",
    "company_name": "Fashion Retail Co. Ltd",
    "gst_number": "29AABCU9603R1ZN",
    "billing_address": "456 Retail Street...",
    "shipping_address": "456 Retail Street..."
  },
  "creator": {...}
}
```

---

## 🚀 **Frontend Integration**

### **Display Pending Approvals List**
```javascript
// Fetch pending approvals
const response = await api.get('/api/admin/pending-approvals');
const { approvals, purchaseOrders, stats } = response.data;

// Each approval contains:
approvals.forEach(approval => {
  const po = approval.entity; // Complete PO with all items
  
  console.log('PO Number:', po.po_number);
  console.log('Vendor:', po.vendor.name);
  console.log('Items Count:', po.items.length);
  console.log('Fabric Requirements:', po.fabric_requirements);
  console.log('Accessories:', po.accessories);
  console.log('Total Amount:', po.final_amount);
});
```

### **View Full Details Before Approval**
```javascript
// Fetch single approval with complete details
const response = await api.get(`/api/admin/pending-approvals/${approvalId}`);
const { approval } = response.data;

// Display all items in a table/modal
approval.entity.items.forEach(item => {
  console.log(`${item.material_type} - ${item.color} - ${item.quantity} ${item.uom}`);
});

// Display fabric requirements
approval.entity.fabric_requirements.forEach(fabric => {
  console.log(`${fabric.fabric_type} - ${fabric.gsm_quality} - ${fabric.required_quantity}`);
});

// Display accessories
approval.entity.accessories.forEach(accessory => {
  console.log(`${accessory.accessory_item} - ${accessory.required_quantity}`);
});

// Display cost summary
const cost = approval.entity.cost_summary;
console.log('Subtotal:', cost.sub_total);
console.log('GST:', cost.gst_amount);
console.log('Grand Total:', cost.grand_total);
```

### **Approve with Notes**
```javascript
const response = await api.post(
  `/api/admin/pending-approvals/${approvalId}/approve`,
  { notes: 'Approved - pricing is competitive' }
);

// Success response
console.log(response.data.message);
// "Purchase Order approved successfully"
```

### **Reject with Reason**
```javascript
const response = await api.post(
  `/api/admin/pending-approvals/${approvalId}/reject`,
  { notes: 'Price too high, please negotiate with vendor' }
);

// Success response
console.log(response.data.message);
// "Purchase Order rejected successfully"
```

---

## 📊 **Summary of All Endpoints**

| Endpoint | Method | Purpose | Items Included? |
|----------|--------|---------|-----------------|
| `/api/admin/pending-approvals` | GET | List all pending approvals | ✅ YES - All items, fabric, accessories |
| `/api/admin/pending-approvals?entity_type=purchase_order` | GET | Filter POs only | ✅ YES - All items |
| `/api/admin/pending-approvals?entity_type=sales_order` | GET | Filter SOs only | ✅ YES - All items |
| `/api/admin/pending-approvals/:id` | GET | View single approval details | ✅ YES - Complete details |
| `/api/admin/pending-approvals/:id/approve` | POST | Approve PO/SO | N/A |
| `/api/admin/pending-approvals/:id/reject` | POST | Reject PO/SO (notes required) | N/A |
| `/api/procurement/pos/:id` | GET | View single PO | ✅ YES - All items |
| `/api/sales/orders/:id` | GET | View single SO | ✅ YES - All items |
| `/api/procurement/pos/:id/submit-for-approval` | POST | Submit PO for approval | N/A |
| `/api/procurement/pos/:id/approve` | POST | Direct PO approval (legacy) | N/A |

---

## ✅ **Benefits of New Workflow**

1. **Complete Visibility**: Admins can see ALL items, fabrics, accessories, and costs before approving
2. **Informed Decisions**: Cost breakdowns, vendor details, and specifications are immediately available
3. **No Surprises**: Review complete order details including attachments and special instructions
4. **Audit Trail**: Approval/rejection notes are captured for compliance
5. **Department Notifications**: Automatic notifications keep everyone informed
6. **Flexible Review**: Can view list or drill down into individual approval details
7. **Error Prevention**: Reject with reason allows procurement to fix issues and resubmit

---

## 🎯 **Testing the Workflow**

### **Test 1: Create and Submit PO**
```bash
# 1. Create PO
POST http://localhost:5000/api/procurement/pos
Body: {
  "vendor_id": 1,
  "items": [...],
  "fabric_requirements": [...],
  "accessories": [...]
}

# 2. Submit for approval
POST http://localhost:5000/api/procurement/pos/1/submit-for-approval
Body: { "notes": "Please review" }
```

### **Test 2: View Pending Approvals**
```bash
# View all pending
GET http://localhost:5000/api/admin/pending-approvals

# View specific approval
GET http://localhost:5000/api/admin/pending-approvals/1
```

### **Test 3: Approve**
```bash
POST http://localhost:5000/api/admin/pending-approvals/1/approve
Body: { "notes": "Approved" }
```

### **Test 4: Reject**
```bash
POST http://localhost:5000/api/admin/pending-approvals/1/reject
Body: { "notes": "Price too high" }
```

---

## 🔔 **Notifications Sent**

### **On Submit for Approval:**
- ✉️ To: Admin department
- 📄 Message: "New PO requires approval"
- 🔗 Action: View approval details

### **On Approval:**
- ✉️ To: Procurement department
- ✉️ To: Inventory department (prepare for GRN)
- 📄 Message: "PO approved and sent to vendor"
- 🔗 Action: Track delivery

### **On Rejection:**
- ✉️ To: Procurement department
- ✉️ To: PO creator
- 📄 Message: "PO rejected - revisions needed"
- 🔗 Action: Edit and resubmit
- ⚠️ Priority: HIGH

---

## 📝 **Status Flow**

### **Purchase Order:**
```
draft → pending_approval → sent → acknowledged → received → completed
         ↓ (if rejected)
       draft (for revision)
```

### **Sales Order:**
```
draft → pending_approval → confirmed → in_production → ... → completed
         ↓ (if rejected)
       draft (for revision)
```

---

## ✅ **Implementation Complete**

✔️ Enhanced pending-approvals endpoint with full item details  
✔️ Added single approval view endpoint  
✔️ Added approve endpoint with notifications  
✔️ Added reject endpoint with mandatory notes  
✔️ All PO/SO fields included: items, fabric, accessories, cost summary  
✔️ Vendor/customer details enhanced  
✔️ Department notifications configured  
✔️ Audit trail captured  
✔️ Server running on port 5000  

**Ready to use!** 🚀