# Column Visibility Toggle Feature

## Overview
Added a dynamic column visibility control to the Sales Orders table that allows users to customize which columns they want to see, making the table more manageable and reducing horizontal scrolling.

## Features

### 1. **Default Visible Columns**
By default, only essential columns are visible:
- ✅ SO Number (Required - Always Visible)
- ✅ Order Date
- ✅ Customer
- ✅ Total Amount
- ✅ Delivery Date
- ✅ Status
- ✅ Actions (Required - Always Visible)

### 2. **Optional Columns**
Users can toggle these columns on/off:
- Product Info
- Quantity
- Rate per Piece
- Advance Paid
- Balance Amount
- Procurement Status
- Invoice Status
- Challan Status
- Created By

### 3. **Column Management Menu**
- **Location**: Next to the "Filters" button in the top toolbar
- **Button**: Purple "Columns" button with dropdown icon
- **Design**: Professional dropdown menu with checkboxes
- **Features**:
  - ✅ Show/hide individual columns
  - ✅ Counter showing "X of Y" visible columns
  - ✅ Checkboxes for each column
  - ✅ Required columns are disabled (greyed out)
  - ✅ "Show All" button - displays all columns
  - ✅ "Reset" button - restores default column visibility

### 4. **Persistent Settings**
- Column visibility preferences are saved to `localStorage`
- Settings persist across page refreshes and browser sessions
- Key: `salesOrdersVisibleColumns`

### 5. **User Experience**
- Click-outside to close: Menu closes when clicking anywhere outside
- Visual feedback: Hover effects on all interactive elements
- Smooth transitions: Dropdown animation with chevron rotation
- Responsive design: Menu adapts to screen size

## Technical Implementation

### State Management
```javascript
const [visibleColumns, setVisibleColumns] = useState(() => {
  const saved = localStorage.getItem('salesOrdersVisibleColumns');
  return saved ? JSON.parse(saved) : defaultColumns;
});
```

### Column Configuration
```javascript
const AVAILABLE_COLUMNS = [
  { id: 'order_number', label: 'SO Number', defaultVisible: true, alwaysVisible: true },
  { id: 'order_date', label: 'Order Date', defaultVisible: true },
  // ... more columns
];
```

### Helper Functions
- `isColumnVisible(columnId)` - Check if a column is visible
- `toggleColumn(columnId)` - Toggle column visibility
- `resetColumns()` - Reset to default columns
- `showAllColumns()` - Show all available columns

### Conditional Rendering
Both table headers (`<th>`) and table cells (`<td>`) are wrapped with:
```javascript
{isColumnVisible('column_id') && (
  <th>Column Header</th>
)}
```

## Benefits

1. **Reduced Clutter**: Only show columns relevant to your current task
2. **Better Performance**: Fewer DOM elements when columns are hidden
3. **Improved UX**: No more excessive horizontal scrolling
4. **Flexible Workflow**: Different users can customize their view
5. **Easy Navigation**: Required columns always stay visible

## Usage Guide

### To Show/Hide Columns:
1. Click the purple **"Columns"** button in the top toolbar
2. Check/uncheck the columns you want to show/hide
3. Click outside the menu or toggle another column to close

### To Reset to Defaults:
1. Open the Columns menu
2. Click the **"Reset"** button at the bottom
3. Default columns will be restored

### To Show All Columns:
1. Open the Columns menu
2. Click the **"Show All"** button at the bottom
3. All columns will become visible

## Files Modified

- `client/src/pages/sales/SalesOrdersPage.jsx`
  - Added `FaColumns` icon import
  - Added `AVAILABLE_COLUMNS` configuration
  - Added column visibility state and functions
  - Added "Columns" button UI
  - Modified table headers with conditional rendering
  - Modified table cells with conditional rendering
  - Added click-outside handler

## Future Enhancements

1. **Column Reordering**: Drag-and-drop to reorder columns
2. **Column Width**: Resize columns dynamically
3. **Presets**: Save multiple column visibility presets
4. **Export Settings**: Share column settings with team members
5. **Column Groups**: Group related columns together
6. **Quick Toggles**: Keyboard shortcuts for common column sets

## Browser Compatibility

- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Mobile browsers (responsive design)

## Storage Details

**LocalStorage Key**: `salesOrdersVisibleColumns`  
**Data Format**: JSON array of column IDs  
**Example**: `["order_number", "order_date", "customer", "total_amount", "status", "actions"]`

---

**Last Updated**: 2024  
**Feature Status**: ✅ Production Ready