# Enhanced Table Structure - System-Wide Implementation Plan

## 📋 Overview
Implement the advanced table structure from SalesOrdersPage across all data tables in the Passion ERP system.

---

## ✨ Key Features to Implement

### 1. **Column Visibility Manager**
- Show/hide columns via dropdown menu
- Checkbox-based selection
- "Show All" and "Reset" options
- LocalStorage persistence per page
- Always-visible columns (Order Number, Actions)

### 2. **Advanced Filters**
- Collapsible filter panel
- Multiple filter types:
  - Status dropdowns
  - Date range filters
  - Custom field filters
- Grid layout (responsive)

### 3. **Smart Action Dropdown**
- Context-aware actions
- Smart positioning (opens upward if space below is limited)
- Click-outside-to-close
- Grouped actions with visual separators
- Icon + Label for clarity

### 4. **Sticky Actions Column**
- Fixed on right side
- Shadow for visual separation
- Maintains background color on row hover
- Minimum width constraint

### 5. **Search Functionality**
- Global search across multiple fields
- Real-time filtering
- Icon indicator

### 6. **Summary Widgets**
- Stats cards with icons
- Color-coded by status/priority
- Responsive grid layout

---

## 🎯 Implementation Priority

### **PHASE 1 - Critical Tables** (Week 1)
| # | Page | Module | Complexity | Status |
|---|------|--------|------------|--------|
| 1 | ✅ SalesOrdersPage | Sales | Reference | ✅ Done |
| 2 | PurchaseOrdersPage | Procurement | High | ⏳ Pending |
| 3 | VendorsPage | Procurement | Medium | ⏳ Pending |
| 4 | ProductionOrdersPage | Manufacturing | High | ⏳ Pending |
| 5 | MRMListPage | Manufacturing | Medium | ⏳ Pending |

### **PHASE 2 - Important Tables** (Week 2)
| # | Page | Module | Complexity | Status |
|---|------|--------|------------|--------|
| 6 | StockManagementPage | Inventory | High | ⏳ Pending |
| 7 | GoodsReceiptNotePage | Inventory | Medium | ⏳ Pending |
| 8 | FinanceInvoicesPage | Finance | High | ⏳ Pending |
| 9 | FinancePaymentsPage | Finance | High | ⏳ Pending |
| 10 | ChallanRegisterPage | Challans | Medium | ⏳ Pending |

### **PHASE 3 - Secondary Tables** (Week 3)
| # | Page | Module | Complexity | Status |
|---|------|--------|------------|--------|
| 11 | ProductionRequestsPage | Procurement | Medium | ⏳ Pending |
| 12 | MaterialRequestsPage | Procurement | Medium | ⏳ Pending |
| 13 | SamplesOrdersPage | Samples | Medium | ⏳ Pending |
| 14 | ShipmentTrackingPage | Shipment | Medium | ⏳ Pending |
| 15 | ProductsPage | Inventory | Low | ⏳ Pending |
| 16 | UserManagementPage | Admin | Low | ⏳ Pending |

---

## 🔧 Technical Implementation

### **Reusable Component Structure**

```javascript
// Component: EnhancedTable.jsx
// Features:
- Column management system
- Filter system with multiple types
- Action dropdown with smart positioning
- Sticky columns support
- LocalStorage integration
```

### **Files to Create**
1. `client/src/components/tables/EnhancedTable.jsx` - Main component
2. `client/src/components/tables/ColumnManager.jsx` - Column visibility UI
3. `client/src/components/tables/FilterPanel.jsx` - Advanced filters UI
4. `client/src/components/tables/ActionDropdown.jsx` - Smart actions menu
5. `client/src/hooks/useTableState.js` - Table state management hook
6. `client/src/hooks/useColumnVisibility.js` - Column visibility hook

---

## 📝 Features by Module

### **Sales Module** (Reference Implementation)
✅ SalesOrdersPage - **COMPLETE**
- 16 columns with visibility toggle
- 5 filters (status, procurement, invoice, challan, dates)
- 10 actions in dropdown
- Smart menu positioning
- LocalStorage: `salesOrdersVisibleColumns`

### **Procurement Module**
#### PurchaseOrdersPage
**Columns:**
- PO Number (always visible)
- PO Date
- Vendor
- Linked SO (if any)
- Product Info
- Quantity
- Rate
- Total Amount
- Advance Paid
- Balance
- Expected Delivery
- Status
- GRN Status
- Approval Status
- Created By
- Actions (always visible)

**Filters:**
- Status (draft, pending, approved, completed)
- GRN Status (not_created, created, verified, added_to_inventory)
- Approval Status (pending, approved, rejected)
- Vendor dropdown
- Date range

**Actions:**
- View/Edit
- Approve PO
- Create GRN
- View GRN Status
- Mark as Received
- Generate QR Code
- Print PO
- Send to Vendor (email)
- Cancel PO
- Delete

#### VendorsPage
**Columns:**
- Vendor Code (always visible)
- Vendor Name
- Contact Person
- Email
- Phone
- Address
- City/State
- GST Number
- Total POs
- Total Value
- Payment Terms
- Status (Active/Inactive)
- Rating
- Created Date
- Actions (always visible)

**Filters:**
- Status (active, inactive)
- City
- State
- Rating
- Date range

**Actions:**
- View Details
- Edit Vendor
- View Purchase History
- Create PO
- View Performance Report
- Activate/Deactivate
- Delete

### **Manufacturing Module**

#### ProductionOrdersPage
**Columns:**
- Production Order Number (always visible)
- Order Date
- Sales Order Reference
- Product Type
- Quantity
- Start Date
- Target Completion
- Actual Completion
- Status
- Stage
- Progress %
- Assigned Team
- Material Status
- Quality Status
- Actions (always visible)

**Filters:**
- Status (draft, materials_requested, in_progress, quality_check, completed, cancelled)
- Stage (cutting, stitching, finishing, packaging)
- Material Status
- Quality Status
- Date range
- Assigned Team

**Actions:**
- View Details
- Update Progress
- Change Stage
- Request Materials (Create MRM)
- View Material Status
- Quality Check
- Mark Complete
- Assign Team
- View Timeline
- Cancel Order

#### MRMListPage (Material Release & Receipt Management)
**Columns:**
- MRM Number (always visible)
- Request Date
- Production Order
- Requested By
- Department
- Material Count
- Priority
- Status
- Dispatch Status
- Receipt Status
- Verification Status
- Approved By
- Actions (always visible)

**Filters:**
- Status (pending, approved, dispatched, received, verified, rejected)
- Priority (low, medium, high, urgent)
- Department
- Date range

**Actions:**
- View Details
- Approve/Reject (Inventory Manager)
- Release Stock (Create Dispatch)
- View Dispatch Details
- Mark as Received (Manufacturing)
- Verify Materials (QC)
- Approve for Production (Manager)
- Return Materials
- Print MRM

### **Inventory Module**

#### StockManagementPage
**Columns:**
- Item Code (always visible)
- Product Name
- Category
- Quantity in Stock
- Unit
- Reorder Level
- Location
- Warehouse
- Last Updated
- Supplier
- Unit Cost
- Total Value
- Status (In Stock, Low Stock, Out of Stock)
- Actions (always visible)

**Filters:**
- Status (in_stock, low_stock, out_of_stock)
- Category
- Warehouse
- Location
- Supplier

**Actions:**
- View Details
- Adjust Stock
- Create GRN
- Transfer Stock
- View Movement History
- Generate Barcode
- Print Label
- Delete

#### GoodsReceiptNotePage
**Columns:**
- GRN Number (always visible)
- GRN Date
- PO Number
- Vendor
- Product Info
- Ordered Qty
- Received Qty
- Discrepancy
- Status
- Verification Status
- Verified By
- Added to Inventory
- Actions (always visible)

**Filters:**
- Status (created, verified, added_to_inventory)
- Verification Status (pending, passed, failed)
- Vendor
- Date range

**Actions:**
- View Details
- Verify GRN
- View Discrepancies
- Add to Inventory
- Reject GRN
- Print GRN
- View Photos
- Edit

### **Finance Module**

#### FinanceInvoicesPage
**Currently:** Basic table with inline buttons
**Needs:**
- Column visibility (Invoice No, Date, Customer, Amount, Status, Due Date, etc.)
- Filters (Status, Payment Status, Date Range, Customer)
- Action dropdown (View, Edit, Send, Mark Paid, Download PDF, Print, Delete)

#### FinancePaymentsPage
**Currently:** Basic table
**Needs:**
- Column visibility (Payment No, Date, Invoice, Customer, Amount, Mode, Status, etc.)
- Filters (Status, Payment Mode, Date Range)
- Action dropdown (View, Edit, Record Payment, Reconcile, Print Receipt, Delete)

---

## 🎨 UI Components Reference

### Column Manager Dropdown
```jsx
<div className="relative column-menu-container">
  <button onClick={toggleColumnMenu}>
    <FaColumns /> Columns
  </button>
  {showColumnMenu && (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl">
      {/* Checkboxes for each column */}
      <button onClick={showAllColumns}>Show All</button>
      <button onClick={resetColumns}>Reset</button>
    </div>
  )}
</div>
```

### Action Dropdown with Smart Positioning
```jsx
<div className="relative action-menu-container">
  <button onClick={(e) => handleActionMenuToggle(item.id, e)}>
    <FaChevronDown />
  </button>
  {showActionMenu === item.id && (
    <div className={`absolute right-0 w-56 ${
      menuPosition[item.id] ? 'bottom-full mb-2' : 'top-full mt-2'
    }`}>
      {/* Action buttons */}
    </div>
  )}
</div>
```

### Sticky Actions Column
```css
/* Table Header */
<th className="sticky right-0 bg-gray-50 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] min-w-[100px]">
  Actions
</th>

/* Table Cell */
<td className="sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
  {/* Action dropdown */}
</td>
```

---

## 🔄 Implementation Workflow (Per Table)

### Step 1: Define Available Columns
```javascript
const AVAILABLE_COLUMNS = [
  { id: 'column_id', label: 'Column Label', defaultVisible: true, alwaysVisible: false },
  // ...
];
```

### Step 2: Set Up State Management
```javascript
const [visibleColumns, setVisibleColumns] = useState(() => {
  const saved = localStorage.getItem('pageNameVisibleColumns');
  return saved ? JSON.parse(saved) : defaultColumns;
});
```

### Step 3: Add Column Manager UI
- Create column dropdown button
- Render checkboxes for all columns
- Add show/hide logic with localStorage sync

### Step 4: Update Table Structure
- Conditionally render headers: `{isColumnVisible('col_id') && <th>...</th>}`
- Conditionally render cells: `{isColumnVisible('col_id') && <td>...</td>}`
- Make Actions column sticky

### Step 5: Create Action Dropdown
- Move all action buttons into dropdown
- Implement smart positioning logic
- Add click-outside handler

### Step 6: Add Advanced Filters
- Create collapsible filter panel
- Add all relevant filters
- Wire up filter state to data

### Step 7: Testing
- Test column visibility persistence
- Test filter combinations
- Test action dropdown positioning
- Test responsive behavior

---

## 📂 Reusable Hooks

### `useColumnVisibility.js`
```javascript
export const useColumnVisibility = (storageKey, availableColumns) => {
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved 
      ? JSON.parse(saved) 
      : availableColumns.filter(col => col.defaultVisible).map(col => col.id);
  });

  const isColumnVisible = (columnId) => visibleColumns.includes(columnId);
  
  const toggleColumn = (columnId) => {
    const column = availableColumns.find(col => col.id === columnId);
    if (column?.alwaysVisible) return;
    
    setVisibleColumns(prev => {
      const newColumns = prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId];
      localStorage.setItem(storageKey, JSON.stringify(newColumns));
      return newColumns;
    });
  };

  const resetColumns = () => {
    const defaults = availableColumns.filter(col => col.defaultVisible).map(col => col.id);
    setVisibleColumns(defaults);
    localStorage.setItem(storageKey, JSON.stringify(defaults));
  };

  const showAllColumns = () => {
    const all = availableColumns.map(col => col.id);
    setVisibleColumns(all);
    localStorage.setItem(storageKey, JSON.stringify(all));
  };

  return { visibleColumns, isColumnVisible, toggleColumn, resetColumns, showAllColumns };
};
```

### `useSmartDropdown.js`
```javascript
export const useSmartDropdown = () => {
  const [showMenu, setShowMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({});

  const handleToggle = (itemId, event) => {
    if (showMenu === itemId) {
      setShowMenu(null);
      setMenuPosition({});
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const menuHeight = 350;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      
      setMenuPosition({ [itemId]: openUpward });
      setShowMenu(itemId);
    }
  };

  const closeMenu = () => {
    setShowMenu(null);
    setMenuPosition({});
  };

  return { showMenu, menuPosition, handleToggle, closeMenu };
};
```

---

## ✅ Quality Checklist (Per Table)

### Before Marking Complete:
- [ ] All relevant columns defined
- [ ] Column visibility works correctly
- [ ] LocalStorage persistence verified
- [ ] All filters functional
- [ ] Action dropdown has all necessary actions
- [ ] Smart positioning works (try scrolling to bottom)
- [ ] Click-outside closes menus
- [ ] Sticky actions column displays correctly
- [ ] Mobile/responsive layout works
- [ ] No console errors
- [ ] Summary widgets show correct data
- [ ] Search filters correctly

---

## 🚀 Getting Started

### Immediate Next Steps:
1. **Create reusable hooks** (`useColumnVisibility`, `useSmartDropdown`)
2. **Start with PurchaseOrdersPage** (most similar to SalesOrdersPage)
3. **Test thoroughly**
4. **Document any variations needed**
5. **Continue with remaining tables**

### Estimated Timeline:
- **Phase 1 (5 tables):** 5-7 days
- **Phase 2 (5 tables):** 5-7 days
- **Phase 3 (6 tables):** 5-7 days
- **Total:** ~3 weeks

---

## 📊 Success Metrics

### User Experience Goals:
- ⚡ Faster data navigation (column hide/show)
- 🎯 More precise filtering
- 🖱️ Less cluttered UI (dropdown actions)
- 💾 Personalized views (localStorage persistence)
- 📱 Better responsive experience

### Technical Goals:
- ♻️ Reusable components/hooks
- 🧹 Cleaner code structure
- 📦 Reduced bundle size (lazy loading dropdowns)
- 🐛 Fewer bugs (standardized patterns)

---

**Ready to implement!** Start with Phase 1, Table 2 (PurchaseOrdersPage).