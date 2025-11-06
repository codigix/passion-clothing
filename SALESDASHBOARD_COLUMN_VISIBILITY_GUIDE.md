# Sales Dashboard - Dynamic Column Visibility Implementation

## ✨ Overview

The **Sales Dashboard** (`/sales`) now includes a **dynamic column visibility system** that allows users to customize which columns are displayed in the Sales Orders table on the "Orders" tab. This feature enhances flexibility and lets different departments focus on the metrics most relevant to them.

---

## 🎯 Key Features

✅ **16 Available Columns** - Mix of essential and optional columns  
✅ **9 Default Visible** - Balanced set for most users  
✅ **7 Optional Columns** - Additional metrics users can add  
✅ **Fixed Core Columns** - Project Name and Actions cannot be hidden  
✅ **localStorage Persistence** - Settings saved per browser  
✅ **Quick Actions** - Show All and Reset buttons for instant layouts  
✅ **Color-Coded Data** - Status badges, financial values color-coded  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  

---

## 📋 Available Columns

### **Default Visible (9 Columns)**

| Column | Type | Description |
|--------|------|-------------|
| **Project Name** (Fixed) | Core | Order number with project identifier |
| **Customer** | Info | Customer name and phone |
| **Products** | Info | Product list from order items |
| **Qty** | Data | Total quantity across all items |
| **Amount** | Financial | Total order amount (₹) |
| **📋 Procurement** | Status | PO status (Under PO / No PO) |
| **🏭 Production** | Status | Production stage (Pending / Active / Ready) |
| **Status** | Status | Main order status (Draft, Confirmed, Shipped, etc.) |
| **Progress** | Metric | Visual progress bar with percentage |
| **Delivery** | Date | Expected delivery date |
| **Actions** (Fixed) | Control | View and Edit buttons |

### **Optional Columns (7 Available)**

| Column | Type | Description |
|--------|------|-------------|
| **Order Date** | Date | When order was created |
| **Advance Paid** | Financial | Prepayment received (₹) - Green |
| **Balance** | Financial | Calculated: Total - Advance (₹) - Orange |
| **Rate/Piece** | Financial | Unit price (₹) from first item |
| **Created By** | Audit | User who created the order |

---

## 🎮 How to Use Column Visibility

### **Step 1: Locate the Columns Button**
On the Sales Dashboard → Orders tab, look for the **"Columns"** button in the toolbar:
```
[Reports] [Columns▼] [Export]
```

### **Step 2: Click to Open Menu**
Click the **Columns** button to reveal the dropdown menu with:
- ☑ All available columns with checkboxes
- [Show All] button (top-right)
- [Reset] button (next to Show All)

### **Step 3: Toggle Columns**
- **Check** (☑) a column to add it to the table
- **Uncheck** (☐) to hide it from view
- Fixed columns (Project Name, Actions) are **disabled** with "(fixed)" label

### **Step 4: Quick Actions**
- **[Show All]** - Display all 16 columns at once
- **[Reset]** - Return to default 9 columns

### **Settings Saved Automatically**
Your column preferences are automatically saved to browser localStorage under the key:
```
salesDashboardVisibleColumns
```
This persists across page refreshes and browser sessions.

---

## 📊 Column Layouts by Department

### **Finance Team Layout**
```
Show: Project Name, Customer, Amount, Advance Paid, 
      Balance, Status, Delivery, Actions

Suggested: Use Balance column to track outstanding payments
           Use Advance Paid to see prepayments received
```

### **Sales Operations**
```
Show: Project Name, Customer, Status, Delivery, 
      Progress, Actions

Hide: All financial and optional columns for clean view
      Focus on order status and timeline
```

### **Procurement Team**
```
Show: Project Name, Customer, Products, Qty,
      Procurement Status, Order Date, Actions

Hide: Financial columns, Production Status
      Focus on PO status and material tracking
```

### **Production Planning**
```
Show: Project Name, Customer, Products, Qty, 
      Production Status, Status, Progress, Actions

Hide: Financial columns, Order Date
      Focus on production workflow
```

### **Logistics & Delivery**
```
Show: Project Name, Customer, Status, Delivery,
      Progress, Actions

Hide: Product details, Financial data
      Focus on delivery timeline
```

### **Executive Dashboard**
```
Show: Project Name, Customer, Amount, Status,
      Progress, Actions

Hide: Detailed product info, Advance Paid
      High-level order overview
```

---

## 🎨 Column Features

### **Color Coding**

**Status Badges:**
- 📝 **Draft** - Slate (not confirmed)
- ✓ **Confirmed** - Blue (ready)
- 🏭 **In Production** - Indigo (manufacturing)
- 📦 **Ready to Ship** - Cyan (awaiting dispatch)
- 🚚 **Shipped** - Blue (in transit)
- ✅ **Delivered** - Green (received)

**Financial Values:**
- 🔵 **Amount** - Blue (primary value)
- 🟢 **Advance Paid** - Green (money received)
- 🟠 **Balance** - Orange (payment due)

**Status Indicators:**
- 🔗 **Under PO** - Green badge (procurement started)
- ❌ **No PO** - Red badge (pending procurement)
- 🏭 **Active** - Blue badge (in production)
- 📦 **Ready** - Blue badge (ready for shipment)

### **Interactive Elements**

- **Project Name** - Click entire row to view order details
- **Products** - Hover to see full product list in tooltip
- **View Button** - 👁 icon to navigate to order details
- **Edit Button** - ✎ icon to modify order
- **Progress Bar** - Shows visual order completion (0-100%)

### **Date Formatting**

All dates display in Indian format: **DD-MM-YY**
- Example: `15-01-25` (January 15, 2025)

### **Currency Formatting**

All amounts display in Indian Rupees with thousand separators:
- Example: `₹3,75,000` (Three Lakh Seventy-Five Thousand)

---

## 💾 Data Persistence

### **localStorage Storage**

Column preferences are stored in browser localStorage:
```javascript
localStorage.getItem("salesDashboardVisibleColumns")
// Returns: ["project_name", "customer", "products", "quantity", "amount", ...]
```

### **Per-Device Settings**

- Settings are **per browser/device**
- NOT synced across different devices
- NOT synced across different browsers
- Each user device maintains its own preferences

### **Clearing Cache**

If you clear browser cache/localStorage, column settings will reset to defaults.

### **Future: Server-Side Sync**

For multi-device synchronization, consider:
1. Save preferences in user profile table
2. Fetch preferences on dashboard load
3. Allow preferences in user settings page

---

## 🔧 Technical Implementation

### **File Modified**
- `client/src/pages/dashboards/SalesDashboard.jsx`

### **State Management**

```javascript
// Column visibility state
const [visibleColumns, setVisibleColumns] = useState(() => {
  const stored = localStorage.getItem("salesDashboardVisibleColumns");
  if (stored) return JSON.parse(stored);
  return AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
});

// Auto-save to localStorage
useEffect(() => {
  localStorage.setItem("salesDashboardVisibleColumns", JSON.stringify(visibleColumns));
}, [visibleColumns]);
```

### **Column Definition**

```javascript
const AVAILABLE_COLUMNS = [
  { 
    id: "project_name", 
    label: "Project Name", 
    defaultVisible: true, 
    fixed: true 
  },
  { 
    id: "amount", 
    label: "Amount", 
    defaultVisible: true, 
    fixed: false 
  },
  // ... 14 more columns
];
```

### **Column Rendering**

- Dynamic `<th>` elements in table header
- Dynamic `<td>` cells in table body
- Switch/conditional rendering for column-specific data
- Proper text alignment (left/right/center) based on data type

---

## 📱 Responsive Behavior

### **Desktop (>1024px)**
- All columns visible side-by-side
- Horizontal scroll if needed
- Full column width

### **Tablet (768-1024px)**
- Some columns may require horizontal scroll
- Responsive grid adjusts
- Touch-friendly controls

### **Mobile (<768px)**
- Horizontal scroll for table
- Compact column widths
- Fixed Project Name and Actions visible first

---

## 🐛 Troubleshooting

### **Issue: Column settings not saving**
**Solution:** Check if localStorage is enabled in browser
- Right-click → Inspect → Application → localStorage
- Verify `salesDashboardVisibleColumns` key exists

### **Issue: Columns show but data is empty**
**Solution:** Ensure order data includes all fields
- Check API response includes all data fields
- Verify order.items array has product information
- Check for null/undefined values in order object

### **Issue: Column menu not opening**
**Solution:** Verify Columns button is visible
- Check Reports button appears
- Try clicking exactly on Columns button
- Clear browser cache if stuck

### **Issue: Custom layout lost after browser refresh**
**Solution:** Check localStorage wasn't cleared
- Right-click → Settings → Privacy & security → Clear browsing data
- Disable cache clearing extensions
- Try incognito/private window

---

## ✅ Testing Checklist

- [ ] Columns button visible in toolbar
- [ ] Click Columns button opens dropdown
- [ ] All 16 columns listed in menu
- [ ] Checkboxes toggle column visibility
- [ ] Fixed columns (Project Name, Actions) disabled
- [ ] Show All button displays all columns
- [ ] Reset button returns to default 9 columns
- [ ] Column selection persists after page refresh
- [ ] Column selection persists after closing browser
- [ ] Table aligns columns correctly (left/right/center)
- [ ] Horizontal scroll works on narrow screens
- [ ] Data displays correctly for all columns
- [ ] Color coding applies to status badges
- [ ] Currency formatting shows ₹ symbol
- [ ] Date formatting uses DD-MM-YY
- [ ] Hover effects work on products
- [ ] View/Edit buttons function correctly
- [ ] Progress bars display correctly

---

## 📈 Metrics & Analytics

### **Usage Recommendations**

Track in future analytics:
- Most commonly hidden columns
- Most commonly shown optional columns
- Department-specific column preferences
- Mobile vs desktop column usage

This data can inform future dashboard improvements.

---

## 🚀 Future Enhancements

1. **Server-Side Persistence** - Save preferences in user profile
2. **Department Presets** - Pre-configured layouts per role
3. **Custom Column Order** - Drag-to-reorder columns
4. **Column Grouping** - Group by Financial, Status, Info
5. **Column Freeze** - Lock columns while scrolling
6. **Export Preferences** - Save/load layouts as JSON
7. **Shared Presets** - Team members share column layouts

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify API data includes all required fields
5. Contact development team with browser/data details

---

**Created:** January 2025  
**Version:** 1.0  
**Status:** ✅ Complete & Production Ready  

**Key Files:**
- Implementation: `client/src/pages/dashboards/SalesDashboard.jsx`
- Related Docs: `SALESDASHBOARD_COLUMN_VISIBILITY_GUIDE.md`
- Visual Guide: `SALES_TABLE_COLUMNS_VISUAL_GUIDE.md`