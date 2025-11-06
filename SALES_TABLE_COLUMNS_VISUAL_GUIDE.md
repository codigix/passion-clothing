# Sales Orders Table - Visual Column Guide

## 📊 Complete Column Layout

### **Default View** (7 Columns Visible)
```
┌──────────────────────────────────────────────────────────────────────────┐
│  SO Number    │ Customer    │ Order Date │ Amount      │ Status │ ...   │
├──────────────────────────────────────────────────────────────────────────┤
│  SO-2024-001  │ Acme Inc    │ 01 Jan 25  │ ₹50,000     │ Draft  │ ⋮     │
│  📦SO-2024    │ Beta Corp   │ 02 Jan 25  │ ₹75,000     │Shipped │ ⋮     │
│  SO-2024-003  │ Gamma Ltd   │ 03 Jan 25  │ ₹100,000    │ Deliv. │ ⋮     │
└──────────────────────────────────────────────────────────────────────────┘
```

### **Expanded View** (All 16 Columns)
```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ SO# │ Order │Customer │Product │Qty │Rate│Total│Advance│Balance│Delivery│Status│Shipment│
│     │ Date  │         │Info    │    │   │     │      │      │Date   │      │Status  │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│ SO- │01 Jan │Acme Inc │Cotton  │100 │200│20K │5K    │15K   │15 Jan │Draft │pending │
│ 001 │ 2025  │         │Shirt   │    │   │    │      │      │       │      │        │
├─────┴───────┴─────────┴────────┴────┴───┴────┴──────┴──────┴───────┴──────┴────────┤
│ Procurement│Invoice│Challan│Created By│Actions                                        │
│PO Created  │N/A    │N/A    │John Doe  │👁 QR ⋮                                       │
├────────────┴────────┴────────┴────────┴──────────────────────────────────────────────┤
```

---

## 🎨 Column Visibility Menu

```
┌─────────────────────────────────┐
│      Visible Columns            │
├─────────────────────────────────┤
│ [Show All]     [Reset]          │
├─────────────────────────────────┤
│ ☑ SO Number           (fixed)   │
│ ☑ Order Date                    │
│ ☑ Customer                      │
│ ☑ Status                        │
│ ☑ Shipment Status               │
│ ☑ Delivery Date                 │
│ ☑ Total Amount                  │
│ ☐ Product Info                  │
│ ☐ Quantity                      │
│ ☐ Rate per Piece                │
│ ☐ Advance Paid                  │
│ ☐ Balance Amount                │
│ ☐ Procurement Status            │
│ ☐ Invoice Status                │
│ ☐ Challan Status                │
│ ☐ Created By                    │
│ ☑ Actions              (fixed)   │
├─────────────────────────────────┤
│       (scroll if needed)         │
└─────────────────────────────────┘
```

---

## 📋 Column Reference

### **1. SO Number** 
```
┌──────────────────────┐
│ 📦 SO-2024-001      │  ← Project Name badge
│    Sales Order #    │
└──────────────────────┘
```
- **Always Visible** ✅ (Fixed)
- **Data**: sales_orders.order_number
- **Display**: "📦 {project_name} - {order_number}"
- **Action**: Click to view order details

---

### **2. Order Date**
```
┌──────────────────────┐
│  15 January 2025    │
│  (Local format)     │
└──────────────────────┘
```
- **Default**: Visible ✅
- **Data**: sales_orders.order_date
- **Format**: Local date (MM DD YYYY)
- **Use**: Track order timeline

---

### **3. Customer**
```
┌──────────────────────┐
│  Acme Inc            │
│  (Customer name)     │
└──────────────────────┘
```
- **Default**: Visible ✅
- **Data**: sales_orders.customer.name
- **Format**: Company name
- **Use**: Identify customer

---

### **4. Product Info**
```
┌──────────────────────┐
│ Cotton Shirt,       │ ← Hover for full text
│ Navy Blue, Large... │
└──────────────────────┘
```
- **Default**: Hidden ❌
- **Data**: items[].product_type || items[].description
- **Format**: Comma-separated list
- **Use**: Quick product reference

---

### **5. Quantity**
```
┌──────────────────────┐
│       1500           │  ← Sum of all items
│    (Total Items)     │
└──────────────────────┘
```
- **Default**: Hidden ❌
- **Data**: SUM(items[].quantity)
- **Format**: Integer
- **Use**: Production volume tracking

---

### **6. Rate per Piece**
```
┌──────────────────────┐
│      ₹250            │  ← From first item
│   (Unit Price)       │
└──────────────────────┘
```
- **Default**: Hidden ❌
- **Data**: items[0].rate_per_piece || items[0].rate
- **Format**: Currency (₹)
- **Use**: Pricing reference

---

### **7. Total Amount**
```
┌──────────────────────┐
│    ₹3,75,000        │  ← Order total
│   (Total Value)      │
└──────────────────────┘
```
- **Default**: Visible ✅
- **Data**: sales_orders.total_amount
- **Format**: Currency (₹) formatted
- **Color**: 🔵 Blue (important financial)
- **Use**: Revenue tracking

---

### **8. Advance Paid**
```
┌──────────────────────┐
│     ₹50,000         │  ← Prepayment
│   (Advance Payment)  │
└──────────────────────┘
```
- **Default**: Hidden ❌
- **Data**: sales_orders.advance_paid
- **Format**: Currency (₹) formatted
- **Color**: 🟢 Green (received money)
- **Use**: Cash flow tracking

---

### **9. Balance Amount**
```
┌──────────────────────┐
│    ₹3,25,000        │  ← Calculated
│  (Total - Advance)   │
└──────────────────────┘
```
- **Default**: Hidden ❌
- **Data**: total_amount - advance_paid
- **Format**: Currency (₹) formatted
- **Color**: 🟠 Orange (payment due)
- **Use**: Outstanding payment tracking

---

### **10. Delivery Date**
```
┌──────────────────────┐
│  20 January 2025    │
│ (Expected delivery)  │
└──────────────────────┘
```
- **Default**: Visible ✅
- **Data**: sales_orders.delivery_date
- **Format**: Local date
- **Use**: Delivery timeline

---

### **11. Status**
```
┌──────────────────────┐
│  ⏱ Draft            │
│  (Order status)      │
└──────────────────────┘
```
- **Default**: Visible ✅
- **Data**: sales_orders.status
- **States**:
  - ⏱ Draft (Slate) - Not confirmed
  - ✓ Confirmed (Blue) - Ready
  - ⚙ In Production (Orange) - Manufacturing
  - 📦 Ready to Ship (Purple) - Awaiting dispatch
  - 🚚 Shipped (Indigo) - In transit
  - ✅ Delivered (Green) - Received
  - ✓ Completed (Emerald) - Finished
  - ❌ Cancelled (Red) - Cancelled
- **Use**: Workflow tracking

---

### **12. Shipment Status**
```
┌──────────────────────┐
│  📦 Pending          │
│ (Shipping status)    │
└──────────────────────┘
```
- **Default**: Visible ✅
- **Data**: shipments[sales_order_id].status
- **Color**: 🟣 Purple badge
- **Use**: Logistics tracking

---

### **13. Procurement Status**
```
┌──────────────────────┐
│  PO Created          │
│ (Purchase order)     │
└──────────────────────┘
```
- **Default**: Hidden ❌
- **Data**: sales_orders.procurement_status
- **Color**: 🟠 Amber badge
- **Use**: Sourcing progress

---

### **14. Invoice Status**
```
┌──────────────────────┐
│  Generated           │
│ (Invoice status)     │
└──────────────────────┘
```
- **Default**: Hidden ❌
- **Data**: sales_orders.invoice_status
- **Color**: 🔵 Indigo badge
- **Use**: Billing tracking

---

### **15. Challan Status**
```
┌──────────────────────┐
│  Dispatched          │
│ (Challan status)     │
└──────────────────────┘
```
- **Default**: Hidden ❌
- **Data**: sales_orders.challan_status
- **Color**: 🔷 Cyan badge
- **Use**: Document tracking

---

### **16. Created By**
```
┌──────────────────────┐
│   John Doe           │
│ (User who created)   │
└──────────────────────┘
```
- **Default**: Hidden ❌
- **Data**: user.name (order creator)
- **Format**: Display name
- **Use**: Audit trail

---

### **17. Actions** (Always Visible)
```
┌──────────────────────┐
│ 👁 QR ⋮             │
├──────────────────────┤
│ 👁 View              │
│ ✎ Edit               │
│ QR Show QR Code      │
│ 🗑 Delete            │
└──────────────────────┘
```
- **Always Visible** ✅ (Fixed)
- **Buttons**:
  - 👁 **View** - Open order details
  - QR **Show QR** - Display QR code
  - ⋮ **Menu** - More options
    - ✎ Edit - Modify order
    - 🗑 Delete - Remove order
- **Use**: Order management

---

## 🎯 Recommended Layouts

### **Finance Dashboard**
```
Show: SO Number, Customer, Total Amount, Advance Paid, 
      Balance Amount, Invoice Status, Status, Actions

Hide: Product Info, Quantity, Rate, Procurement Status,
      Challan Status, Shipment Status, Created By
```

### **Sales Operations**
```
Show: SO Number, Order Date, Customer, Status, 
      Delivery Date, Shipment Status, Actions

Hide: All financial & optional columns
```

### **Production Planning**
```
Show: SO Number, Customer, Quantity, Delivery Date, 
      Status, Product Info, Actions

Hide: Financial columns, Invoice, Challan, Procurement
```

### **Logistics Team**
```
Show: SO Number, Customer, Status, Shipment Status,
      Delivery Date, Challan Status, Actions

Hide: Financial, Product Info, Quantity, Procurement
```

### **Audit & Compliance**
```
Show: All 16 columns (Use "Show All")

See: Complete order lifecycle and trail
```

---

## 📐 Column Widths

| Column | Min Width | Typical Width |
|--------|-----------|---------------|
| SO Number | 140px | 160px |
| Order Date | 100px | 120px |
| Customer | 150px | 180px |
| Product Info | 200px | 250px (with scroll) |
| Quantity | 80px | 100px |
| Rate | 100px | 120px |
| Total Amount | 120px | 140px |
| Advance Paid | 120px | 140px |
| Balance Amount | 120px | 140px |
| Delivery Date | 100px | 120px |
| Status | 100px | 130px |
| Shipment Status | 130px | 150px |
| Procurement | 120px | 140px |
| Invoice | 100px | 120px |
| Challan | 100px | 120px |
| Created By | 100px | 130px |
| Actions | 100px | 120px |

**Total**: Minimum ~1800px (with all columns)  
**Responsive**: Horizontal scroll on mobile/tablet

---

## 🎨 Color Coding Legend

| Element | Color | Meaning |
|---------|-------|---------|
| Order Status Badge | Various | 8 different statuses |
| Shipment Status | 🟣 Purple | Logistics tracking |
| Procurement Status | 🟠 Amber | Sourcing progress |
| Invoice Status | 🔵 Indigo | Billing tracking |
| Challan Status | 🔷 Cyan | Document tracking |
| Total Amount | 🔵 Blue | Important financial |
| Advance Paid | 🟢 Green | Money received |
| Balance Amount | 🟠 Orange | Payment due |

---

## ✨ Special Features

### **Hover Actions**
- Hover over Product Info → See full product list
- Hover over Customer → May show tooltip (in future)
- Hover over Status badge → Display status details (in future)

### **Click Actions**
- Click SO Number → Navigate to order details
- Click View icon → Open order page
- Click QR icon → Display QR code
- Click Edit menu → Modify order
- Click Delete → Remove order (with confirmation)

### **Responsive Behavior**
- **Desktop** (>1024px) - All columns visible side-by-side
- **Tablet** (768-1024px) - Horizontal scroll if needed
- **Mobile** (<768px) - Vertical scroll, some columns hidden by default

---

**Created**: January 2025  
**Version**: 1.0  
**Status**: ✅ Complete