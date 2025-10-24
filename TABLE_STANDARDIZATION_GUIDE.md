# Table Standardization Guide - Reference Implementation

## 📋 Overview
This guide documents the **standard table structure** based on **SalesOrdersPage** that should be applied across all tables in the Passion ERP system for consistency, usability, and professional appearance.

## ✨ Reference Implementation
**File:** `client/src/pages/sales/SalesOrdersPage.jsx`

---

## 🎯 Key Features to Implement in All Tables

### 1. **Column Visibility Control** ⭐
```javascript
// Define all available columns
const AVAILABLE_COLUMNS = [
  { id: 'column_id', label: 'Column Name', defaultVisible: true, alwaysVisible: false },
  // alwaysVisible: true prevents hiding (e.g., ID, Actions columns)
];

// State management
const [visibleColumns, setVisibleColumns] = useState(() => {
  const saved = localStorage.getItem('tableNameVisibleColumns');
  return saved ? JSON.parse(saved) : AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
});

// Functions
- isColumnVisible(columnId)
- toggleColumn(columnId)
- resetColumns() // Reset to defaults
- showAllColumns() // Show all columns
```

**UI Component:**
- Purple "Columns" button with dropdown menu
- Checkboxes for each column
- "Show All" and "Reset" buttons at bottom
- Displays count: "X of Y columns"
- Always-visible columns marked as "(Required)"

---

### 2. **Advanced Filters** 🔍

**Search Bar:**
```javascript
<input
  type="text"
  placeholder="Search by [specific fields]..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="w-full p-3 border rounded-lg pl-10 focus:ring-2 focus:ring-blue-500"
/>
<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
```

**Filter Panel:**
- Collapsible filter section with "Filters" button + chevron icon
- Grid layout: `grid-cols-1 md:grid-cols-3 lg:grid-cols-6`
- Status dropdowns, date range pickers
- All filters apply automatically via `useEffect`

**Implementation:**
```javascript
const [showFilters, setShowFilters] = useState(false);
const [statusFilter, setStatusFilter] = useState('all');
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');

useEffect(() => {
  applyFilters();
}, [orders, searchTerm, statusFilter, dateFrom, dateTo]);
```

---

### 3. **Proper Data Formatting** 💰

**Currency:**
```javascript
₹{order.final_amount?.toLocaleString()} // ₹1,23,456
```

**Dates:**
```javascript
new Date(order.order_date).toLocaleDateString() // 12/25/2024
```

**Conditional Formatting:**
```javascript
// Green for positive amounts
<td className="text-sm text-green-600 font-medium">
  ₹{order.advance_paid?.toLocaleString() || '0'}
</td>

// Red for due/balance amounts
<td className="text-sm text-red-600 font-medium">
  ₹{order.balance_amount?.toLocaleString()}
</td>
```

---

### 4. **Color-Coded Status Badges** 🎨

```javascript
const getStatusBadge = (status) => {
  const statusConfig = {
    draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
    confirmed: { color: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
    in_progress: { color: 'bg-orange-100 text-orange-700', label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' }
  };
  const config = statusConfig[status] || statusConfig.draft;
  return <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>{config.label}</span>;
};
```

**Color Scheme:**
- **Gray**: Draft, Pending, Not Started
- **Blue**: Confirmed, Sent, Active
- **Yellow**: Awaiting, Needs Review
- **Orange**: In Progress, Processing
- **Purple**: Special status (e.g., PO Created)
- **Green**: Completed, Success, Approved, Delivered
- **Red**: Cancelled, Rejected, Failed

---

### 5. **Responsive Table Structure** 📱

```jsx
<div className="bg-white rounded-lg shadow-md">
  <div className="w-full">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {isColumnVisible('column_id') && (
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Column Name
            </th>
          )}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        <tr className="hover:bg-gray-50 transition-colors group">
          {isColumnVisible('column_id') && (
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
              {/* Cell content */}
            </td>
          )}
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**Key Classes:**
- `hover:bg-gray-50` on rows
- `whitespace-nowrap` for single-line content
- `text-xs` for header text (uppercase)
- `text-sm` for body text
- `group` on row, `group-hover:` on sticky cells

---

### 6. **Sticky Actions Column** 📌

```jsx
// Header
<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 
             sticky right-0 bg-gray-50 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] min-w-[100px]">
  Actions
</th>

// Cell
<td className="px-4 py-3 whitespace-nowrap 
               sticky right-0 bg-white group-hover:bg-gray-50 
               shadow-[-2px_0_4px_rgba(0,0,0,0.1)] transition-colors">
  {/* Action buttons */}
</td>
```

**Features:**
- Always visible when scrolling horizontally
- Left shadow for depth
- Background color matches row hover state

---

### 7. **Smart Action Dropdown Menu** 📋

```javascript
// State
const [showActionMenu, setShowActionMenu] = useState(null);
const [menuPosition, setMenuPosition] = useState({});

// Smart positioning (opens upward if no space below)
const handleActionMenuToggle = (id, event) => {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const menuHeight = 350;
  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;
  
  const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;
  setMenuPosition({ [id]: openUpward });
  setShowActionMenu(id);
};

// Click outside handler
useEffect(() => {
  const handleClickOutside = (event) => {
    if (showActionMenu && !event.target.closest('.action-menu-container')) {
      setShowActionMenu(null);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [showActionMenu]);
```

**Dropdown UI:**
```jsx
<div className={`absolute right-0 w-56 bg-white rounded-lg shadow-xl z-[100] border ${
  menuPosition[id] ? 'bottom-full mb-2' : 'top-full mt-2'
}`}>
  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
    <FaIcon /> Action Name
  </button>
</div>
```

---

### 8. **Summary Cards/Widgets** 📊

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">Stat Label</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="bg-blue-100 p-3 rounded-full">
        <FaIcon size={24} className="text-blue-600" />
      </div>
    </div>
  </div>
</div>
```

**Features:**
- Colored left border matching theme
- Large number display
- Icon in colored circular background
- Responsive grid layout

---

### 9. **Loading & Empty States** ⏳

```jsx
{loading ? (
  <tr>
    <td colSpan={16} className="px-4 py-8 text-center text-gray-500">
      Loading data...
    </td>
  </tr>
) : filteredData.length === 0 ? (
  <tr>
    <td colSpan={16} className="px-4 py-8 text-center text-gray-500">
      No records found
    </td>
  </tr>
) : (
  // Data rows
)}
```

---

### 10. **Page Header** 📄

```jsx
<div className="flex justify-between items-center mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-800">Page Title</h1>
    <p className="text-gray-600 mt-1">Description text</p>
  </div>
  <button className="bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700 
                     flex items-center gap-2 shadow-md transition-colors">
    <FaPlus size={16} /> Create New
  </button>
</div>
```

---

## 📝 Pages That Need Table Standardization

### 🔴 High Priority (User-Facing, Frequently Used)

#### **Sales Department:**
- ✅ **SalesOrdersPage.jsx** - ✅ REFERENCE IMPLEMENTATION
- ❌ **SalesReportsPage.jsx** - Needs update

#### **Procurement Department:**
- ❌ **PurchaseOrdersPage.jsx** - Needs update ⭐
- ❌ **PendingApprovalsPage.jsx** - Needs update ⭐
- ❌ **MaterialRequestsPage.jsx** - Needs update
- ❌ **ProductionRequestsPage.jsx** - Needs update
- ❌ **VendorsPage.jsx** - Needs update
- ❌ **VendorManagementPage.jsx** - Needs update
- ❌ **GoodsReceiptPage.jsx** - Needs update

#### **Inventory Department:**
- ❌ **StockManagementPage.jsx** - Needs update ⭐⭐
- ❌ **GoodsReceiptNotePage.jsx** - Needs update ⭐
- ❌ **MRNRequestsPage.jsx** - Needs update ⭐
- ❌ **StockAlertsPage.jsx** - Needs update
- ❌ **ProductsPage.jsx** - Needs update
- ❌ **ProductLifecyclePage.jsx** - Needs update
- ❌ **POInventoryTrackingPage.jsx** - Needs update
- ❌ **MaterialRequestReviewPage.jsx** - Needs update

#### **Manufacturing Department:**
- ❌ **ProductionOrdersPage.jsx** - Needs update ⭐⭐
- ❌ **ProductionTrackingPage.jsx** - Needs update ⭐
- ❌ **ManufacturingProductionRequestsPage.jsx** - Needs update
- ❌ **QualityControlPage.jsx** - Needs update
- ❌ **MRMListPage.jsx** - Needs update
- ❌ **MaterialRequirementsPage.jsx** - Needs update

#### **Challans:**
- ❌ **ChallanRegisterPage.jsx** - Needs update ⭐

### 🟡 Medium Priority

#### **Shipment Department:**
- ❌ **ShipmentDispatchPage.jsx** - Needs update
- ❌ **ShipmentTrackingPage.jsx** - Needs update

#### **Samples Department:**
- ❌ **SamplesOrdersPage.jsx** - Needs update
- ❌ **SamplesTrackingPage.jsx** - Needs update

#### **Store Department:**
- ❌ **StoreStockManagementPage.jsx** - Needs update
- ❌ **StoreReturnsPage.jsx** - Needs update

#### **Finance Department:**
- ❌ **FinanceInvoicesPage.jsx** - Needs update
- ❌ **FinancePaymentsPage.jsx** - Needs update

### 🟢 Low Priority (Admin/Configuration)

#### **Admin Department:**
- ❌ **UserManagementPage.jsx** - Needs update
- ❌ **RoleManagementPage.jsx** - Needs update

#### **Others:**
- ❌ **AttendancePage.jsx** - Needs update
- ❌ **NotificationsPage.jsx** - Needs update

---

## 🛠️ Implementation Checklist

For each table page, ensure:

### **Structure:**
- [ ] Define `AVAILABLE_COLUMNS` array with id, label, defaultVisible, alwaysVisible
- [ ] Implement column visibility state with localStorage
- [ ] Add column visibility dropdown menu (purple "Columns" button)
- [ ] Implement `isColumnVisible()`, `toggleColumn()`, `resetColumns()`, `showAllColumns()`

### **Filtering:**
- [ ] Add search input with icon
- [ ] Add collapsible filter panel with "Filters" button
- [ ] Implement multiple filter states (status, date range, etc.)
- [ ] Add `applyFilters()` function triggered by useEffect

### **Table Structure:**
- [ ] Use `bg-white rounded-lg shadow-md` wrapper
- [ ] Use `min-w-full divide-y divide-gray-200` table classes
- [ ] Add `bg-gray-50` to thead
- [ ] Add `hover:bg-gray-50 transition-colors group` to rows
- [ ] Wrap all cells with `isColumnVisible()` conditional

### **Data Formatting:**
- [ ] Format currency with ₹ and toLocaleString()
- [ ] Format dates with toLocaleDateString()
- [ ] Add conditional color formatting (green for positive, red for negative)
- [ ] Implement color-coded status badges

### **Actions:**
- [ ] Create sticky actions column with shadow
- [ ] Implement smart dropdown menu with upward/downward positioning
- [ ] Add click-outside handler to close menus
- [ ] Use action menu container class for event handling

### **UI Polish:**
- [ ] Add summary cards at top (if applicable)
- [ ] Implement loading state
- [ ] Implement empty state
- [ ] Add page header with title, description, and create button
- [ ] Ensure responsive design with proper grid layouts

### **Code Quality:**
- [ ] Extract badge functions (getStatusBadge, etc.)
- [ ] Use consistent icon set (react-icons/fa)
- [ ] Add proper TypeScript/PropTypes if needed
- [ ] Implement proper error handling
- [ ] Add console.log for debugging (remove before production)

---

## 🎨 Color Palette Reference

```javascript
// Status Colors
draft/pending:     bg-gray-100 text-gray-700
confirmed/active:  bg-blue-100 text-blue-700
awaiting/review:   bg-yellow-100 text-yellow-700
in_progress:       bg-orange-100 text-orange-700
special:           bg-purple-100 text-purple-700
completed/success: bg-green-100 text-green-700
cancelled/failed:  bg-red-100 text-red-700

// Action Buttons
primary:    bg-blue-600 hover:bg-blue-700 text-white
secondary:  bg-gray-100 hover:bg-gray-200 text-gray-700
danger:     bg-red-600 hover:bg-red-700 text-white
success:    bg-green-600 hover:bg-green-700 text-white
```

---

## 🚀 Quick Start Implementation

### Step 1: Copy Column Management Code
```javascript
// Copy from SalesOrdersPage.jsx lines 29-205
```

### Step 2: Copy Filter Panel Structure
```javascript
// Copy from SalesOrdersPage.jsx lines 472-645
```

### Step 3: Copy Table Structure
```javascript
// Copy from SalesOrdersPage.jsx lines 647-906
```

### Step 4: Adapt to Your Data
- Replace column IDs and labels
- Adjust filter fields
- Update badge status configurations
- Modify action menu items

---

## 📚 Related Files

- **Reference:** `client/src/pages/sales/SalesOrdersPage.jsx`
- **Icons:** `react-icons/fa`
- **Styling:** Tailwind CSS utility classes
- **API:** `client/src/utils/api.js`

---

## 🎯 Success Criteria

A table implementation is considered complete when:

1. ✅ All columns are toggleable (except always-visible ones)
2. ✅ Column preferences are saved to localStorage
3. ✅ Search and filters work correctly
4. ✅ Data is properly formatted (currency, dates, badges)
5. ✅ Actions column is sticky and responsive
6. ✅ Dropdown menus position intelligently (up/down)
7. ✅ Loading and empty states are handled
8. ✅ Hover effects are smooth and consistent
9. ✅ Mobile responsive (at minimum, horizontal scroll works)
10. ✅ Code is clean, maintainable, and follows the pattern

---

## 📞 Notes

- **Performance:** For tables with 1000+ rows, consider implementing pagination or virtual scrolling
- **Export:** Consider adding CSV/Excel export functionality to action menus
- **Bulk Actions:** For future enhancement, consider adding row selection checkboxes
- **Print:** Add print-friendly CSS using `@media print`

---

**Last Updated:** January 2025
**Status:** Reference Implementation Complete ✅
**Priority:** High - System-wide standardization required