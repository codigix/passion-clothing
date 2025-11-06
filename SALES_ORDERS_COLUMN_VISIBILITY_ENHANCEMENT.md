# Sales Orders Table - Column Visibility Enhancement

## 🎉 What's New

The Sales Orders table (`/sales`) now features a **fully functional column visibility system** allowing users to customize which data columns are displayed.

---

## ✨ Key Features

### 1. **Column Visibility Menu**
- 🎯 New button with **column icon (⊟)** in the toolbar
- Click to toggle column visibility settings
- Dropdown menu shows all available columns with checkboxes
- Changes persist in browser **localStorage** automatically

### 2. **Available Columns** (16 total)
| Column | Default | Status | Purpose |
|--------|---------|--------|---------|
| **SO Number** | ✅ Visible | Fixed | Order identifier + Project Name |
| **Order Date** | ✅ Visible | - | When order was created |
| **Customer** | ✅ Visible | - | Customer name |
| **Status** | ✅ Visible | - | Order status badge |
| **Shipment Status** | ✅ Visible | - | Shipment tracking status |
| **Delivery Date** | ✅ Visible | - | Expected delivery date |
| **Total Amount** | ✅ Visible | - | Order value in ₹ |
| **Actions** | ✅ Visible | Fixed | View, QR, Edit, Delete buttons |
| Product Info | ❌ Hidden | Optional | Product type/description list |
| Quantity | ❌ Hidden | Optional | Total items in order |
| Rate per Piece | ❌ Hidden | Optional | Unit price |
| Advance Paid | ❌ Hidden | Optional | Amount paid upfront |
| Balance Amount | ❌ Hidden | Optional | Remaining payment |
| Procurement Status | ❌ Hidden | Optional | PO creation status |
| Invoice Status | ❌ Hidden | Optional | Invoice generation status |
| Created By | ❌ Hidden | Optional | User who created order |
| Challan Status | ❌ Hidden | Optional | Challan tracking status |

### 3. **Quick Actions**
- **Show All** button - Display all 16 columns
- **Reset** button - Return to default layout
- Individual checkboxes - Toggle each column on/off
- Fixed columns (SO Number, Actions) cannot be hidden

---

## 🚀 How to Use

### Show/Hide Columns
1. Click the **column icon (⊟)** in the toolbar
2. Check/uncheck desired columns
3. Changes apply **instantly** and persist

### Quick Options
- **Show All**: Displays all available columns
- **Reset**: Returns to default column layout

### Data Displayed per Column

#### **Core Information**
- **SO Number**: Order number with Project Name badge
- **Order Date**: Creation date in local format
- **Customer**: Customer company name
- **Delivery Date**: Expected delivery date

#### **Financial Details**
- **Total Amount**: Order total (₹)
- **Advance Paid**: Prepayment amount (₹)
- **Balance Amount**: Remaining balance (₹)
- **Rate per Piece**: Unit price from first item

#### **Product Details**
- **Product Info**: All product types/descriptions
- **Quantity**: Total items (summed across all line items)

#### **Workflow Status**
- **Status**: Main order status with color badge
- **Shipment Status**: Shipment tracking status
- **Procurement Status**: PO creation progress
- **Invoice Status**: Invoice generation status
- **Challan Status**: Challan tracking status

#### **System Info**
- **Created By**: User who created the order
- **Actions**: View, QR Code, Edit, Delete

---

## 💾 Data Persistence

Column visibility preferences are **automatically saved** to browser localStorage:
- Key: `salesOrdersVisibleColumns`
- Persists across page refreshes
- Per-browser setting (not synced across devices)

---

## 📊 Column Data Sources

### Single-Value Columns
```
- order_number: sales_orders.order_number
- order_date: sales_orders.order_date
- delivery_date: sales_orders.delivery_date
- customer: sales_orders.customer.name
- status: sales_orders.status
- total_amount: sales_orders.total_amount
- advance_paid: sales_orders.advance_paid
```

### Calculated Columns
```
- balance: total_amount - advance_paid
- quantity: SUM(items[].quantity)
- rate: items[0].rate_per_piece || items[0].rate
- product_info: items[].map(i => i.product_type || i.description).join(', ')
```

### Relationship Columns
```
- shipment_status: shipments[sales_order_id].status
- created_by: user.name (who created the order)
- procurement_status: sales_orders.procurement_status
- invoice_status: sales_orders.invoice_status
- challan_status: sales_orders.challan_status
```

---

## 🎨 Visual Enhancements

### Column Menu
- Clean dropdown with sticky header
- Scrollable for many columns
- "Show All" and "Reset" quick buttons
- Gray-out disabled (fixed) columns
- Checkboxes for easy toggling

### Table Rendering
- Dynamic column generation based on visibility
- Proper alignment (left-aligned data, center-aligned actions)
- Color-coded status badges:
  - 🟣 Purple: Shipment Status
  - 🟠 Amber: Procurement Status
  - 🔵 Indigo: Invoice Status
  - 🔷 Cyan: Challan Status
- Truncated product info with full text on hover

---

## 🔧 Technical Implementation

### State Management
```javascript
const [visibleColumns, setVisibleColumns] = useState(() => {
  const saved = localStorage.getItem('salesOrdersVisibleColumns');
  return saved ? JSON.parse(saved) : AVAILABLE_COLUMNS
    .filter(col => col.defaultVisible)
    .map(col => col.id);
});
```

### Column Definition
```javascript
const AVAILABLE_COLUMNS = [
  { id: 'order_number', label: 'SO Number', defaultVisible: true, alwaysVisible: true },
  { id: 'order_date', label: 'Order Date', defaultVisible: true },
  // ... more columns
];
```

### Dynamic Rendering
```javascript
{AVAILABLE_COLUMNS.map(col => {
  if (!visibleColumns.includes(col.id)) return null;
  // Render column cell based on col.id
})}
```

---

## ✅ Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Column visibility toggle | ✅ Complete | Checkbox-based menu |
| localStorage persistence | ✅ Complete | Auto-saves on change |
| Show All button | ✅ Complete | Shows 16 columns |
| Reset to defaults | ✅ Complete | Restores default layout |
| Fixed columns | ✅ Complete | SO Number & Actions cannot hide |
| Responsive design | ✅ Complete | Works on mobile/tablet |
| Color-coded statuses | ✅ Complete | Visual indicators |
| Financial calculations | ✅ Complete | Balance, rates, totals |
| Product info aggregation | ✅ Complete | All items concatenated |

---

## 🎯 Use Cases

### **Finance Team**
Show: Total Amount, Advance Paid, Balance Amount, Invoice Status
Hide: Product Info, Quantity, Procurement Status

### **Sales Team**
Show: Customer, Order Date, Status, Shipment Status, Delivery Date
Hide: Financial details, Created By

### **Operations Team**
Show: All columns
Use: "Show All" for complete visibility

### **Quick Dashboard**
Show: SO Number, Customer, Status, Delivery Date
Hide: All optional/detailed columns

---

## 📋 Implementation Details

**File Modified**: `client/src/pages/sales/SalesOrdersPage.jsx`

**Lines Changed**:
- Added column visibility menu button (lines 390-461)
- Updated table rendering to use dynamic columns (lines 530-716)
- Implemented switch statement for column-specific rendering
- Added localStorage persistence logic

**Components Used**:
- FaColumns icon (existing import)
- ProjectIdentifier component (existing)
- Standard Tailwind CSS styling

---

## 🔄 Future Enhancements

Potential improvements:
- Column reordering (drag & drop)
- Column width customization
- Export visible columns only
- Preset layouts (Finance, Sales, Operations)
- Server-side persistence (user preferences)
- Column filtering/grouping

---

## ⚠️ Notes

- Column visibility is **browser-specific** (not synced across devices)
- Clearing browser cache will reset column preferences
- Fixed columns (SO Number, Actions) cannot be hidden for usability
- All calculations update in real-time as data changes

---

## ✨ Testing Checklist

- [x] Column menu button visible
- [x] Toggle columns on/off works
- [x] Show All button displays all columns
- [x] Reset button restores defaults
- [x] Settings persist on page refresh
- [x] Fixed columns (SO Number, Actions) cannot be unchecked
- [x] Table renders correctly with different column combinations
- [x] All data displays correctly in each column
- [x] Responsive design on mobile/tablet
- [x] Color coding of status badges visible

---

**Version**: 1.0  
**Date**: January 2025  
**Status**: ✅ Complete and Ready for Production