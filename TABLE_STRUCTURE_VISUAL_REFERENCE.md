# Table Structure Visual Reference 📊

## 🎯 Complete Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  PAGE CONTAINER (p-6 bg-gray-50 min-h-screen)                       │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  PAGE HEADER (flex justify-between items-center mb-6)         │ │
│  │                                                                │ │
│  │  ┌─────────────────┐              ┌────────────────────────┐  │ │
│  │  │ Title & Subtitle│              │ [+ Create New Button] │  │ │
│  │  │                 │              │                        │  │ │
│  │  │ Sales Orders    │              │  bg-blue-600          │  │ │
│  │  │ Manage and track│              │  hover:bg-blue-700    │  │ │
│  │  └─────────────────┘              └────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  SUMMARY CARDS (grid-cols-4 gap-4 mb-6)                       │ │
│  │                                                                │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │ │
│  │  │ 📊 Total │ │ ⏰ Pending│ │ ⚙️ Active │ │ ✅ Done   │        │ │
│  │  │   Card   │ │   Card   │ │   Card   │ │   Card   │        │ │
│  │  │   123    │ │    45    │ │    67    │ │    89    │        │ │
│  │  │ border-  │ │ border-  │ │ border-  │ │ border-  │        │ │
│  │  │ blue-500 │ │ yellow   │ │ orange   │ │ green    │        │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  FILTERS SECTION (bg-white p-4 rounded-lg shadow-md mb-6)     │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ 🔍 Search Input (flex-1)    [🎨 Columns ▼] [🔽 Filters] │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ EXPANDABLE FILTER PANEL (when showFilters = true)        │ │ │
│  │  │                                                           │ │ │
│  │  │ [Status ▼] [Procurement ▼] [Invoice ▼] [Date From] [To] │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  TABLE CONTAINER (bg-white rounded-lg shadow-md)              │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ <table> with scrollable content                          │ │ │
│  │  │                                                           │ │ │
│  │  │ [TABLE STRUCTURE - See detailed diagram below]           │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Table Structure Detail

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ <table className="min-w-full divide-y divide-gray-200">                          │
│                                                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ <thead className="bg-gray-50">                                              │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ SO Number │ Date │ Customer │ Product │ Amount │ Status │ 📌 ACTIONS  │ │ │
│ │ │           │      │          │         │        │        │  (sticky)   │ │ │
│ │ │ text-xs font-medium text-gray-500 uppercase                            │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ <tbody className="bg-white divide-y divide-gray-200">                      │ │
│ │                                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ <tr className="hover:bg-gray-50 transition-colors group">              │ │ │
│ │ │                                                                         │ │ │
│ │ │ SO-001  │ 12/25 │ ABC Ltd │ T-Shirt │ ₹50,000 │ 🟢 Active │ [⋮ Menu] │ │ │
│ │ │         │       │         │         │         │           │          │ │ │
│ │ │ (Conditional rendering based on isColumnVisible())                    │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                             │ │
│ │ ... more rows ...                                                           │ │
│ │                                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Column Visibility Dropdown

```
┌─────────────────────────────────────┐
│ [🎨 Columns ▼]  ← Purple button     │
│                                     │
│ When clicked:                       │
│ ┌─────────────────────────────────┐ │
│ │ Manage Columns      (8 of 15)   │ │
│ ├─────────────────────────────────┤ │
│ │ ☑ SO Number        (Required)   │ │
│ │ ☑ Order Date                    │ │
│ │ ☑ Customer                      │ │
│ │ ☐ Product Info                  │ │
│ │ ☐ Quantity                      │ │
│ │ ☐ Rate per Piece                │ │
│ │ ☑ Total Amount                  │ │
│ │ ☐ Advance Paid                  │ │
│ │ ☐ Balance Amount                │ │
│ │ ☑ Delivery Date                 │ │
│ │ ☑ Status                        │ │
│ │ ☐ Procurement Status            │ │
│ │ ☐ Invoice Status                │ │
│ │ ☐ Challan Status                │ │
│ │ ☑ Actions          (Required)   │ │
│ ├─────────────────────────────────┤ │
│ │ [Show All]     [Reset]          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🔍 Filter Panel Structure

```
┌───────────────────────────────────────────────────────────────────────┐
│ 🔍 Search Input (full width with icon)                               │
│ ┌─────────────────────────────────────────────────────────────────┐  │
│ │ 🔍 Search by SO Number, Customer, or Product...                 │  │
│ └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│ [🎨 Columns ▼]  [🔽 Filters ▼]  ← Right side buttons                │
└───────────────────────────────────────────────────────────────────────┘

When Filters expanded:
┌───────────────────────────────────────────────────────────────────────┐
│ ┌────────────┬────────────┬────────────┬────────────┬────────────┐   │
│ │ Status ▼   │ Procure ▼  │ Invoice ▼  │ Challan ▼  │ Date From  │   │
│ │            │            │            │            │            │   │
│ │ All Status │ All        │ All        │ All        │ [date]     │   │
│ │ Draft      │ Not Req    │ Pending    │ Pending    │            │   │
│ │ Confirmed  │ Requested  │ Generated  │ Created    │            │   │
│ │ In Prod    │ PO Created │ Paid       │ Dispatched │            │   │
│ │ ...        │ ...        │            │ Delivered  │            │   │
│ └────────────┴────────────┴────────────┴────────────┴────────────┘   │
│                                                                       │
│                                                    ┌────────────┐     │
│                                                    │ Date To    │     │
│                                                    │ [date]     │     │
│                                                    └────────────┘     │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 📌 Sticky Actions Column

```
Table scrolls horizontally →→→
                                                          ↓ Always visible
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬─────────────────┐
│ Col1 │ Col2 │ Col3 │ Col4 │ Col5 │ Col6 │ Col7 │ 📌 ACTIONS     │
│      │      │      │      │      │      │      │  (sticky)       │
│      │      │      │      │      │      │      │  right-0        │
│      │      │      │      │      │      │      │  shadow-left    │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴─────────────────┘
                                                   ↑
                                  Stays in place while scrolling
```

**CSS Classes:**
```css
sticky right-0 bg-white group-hover:bg-gray-50 
shadow-[-2px_0_4px_rgba(0,0,0,0.1)] transition-colors
```

---

## 📋 Smart Action Dropdown

```
Row with actions:
┌──────────────────────────────────────────┬──────────┐
│ ... other columns ...                    │ [⋮ Menu] │
└──────────────────────────────────────────┴──────────┘

When clicked:
                                           ┌─────────────────────────┐
Enough space below                         │ 📋 Send to Procurement  │
→ Opens downward                           │ ⚙️  Request Production  │
                                           │ 📄 Generate Invoice     │
                                           │ 🚚 Create Challan       │
                                           │ 🏭 View PO Status       │
                                           │ 📱 Generate QR Code     │
                                           │ 🖨️  Print SO             │
                                           ├─────────────────────────┤
                                           │ 🗑️  Delete Order        │
                                           └─────────────────────────┘

Not enough space below:
┌─────────────────────────┐
│ 📋 Send to Procurement  │
│ ⚙️  Request Production  │   ↑ Opens upward
│ 📄 Generate Invoice     │
│ 🚚 Create Challan       │
│ 🏭 View PO Status       │
│ 📱 Generate QR Code     │
│ 🖨️  Print SO             │
├─────────────────────────┤
│ 🗑️  Delete Order        │
└─────────────────────────┘
┌──────────────────────────────────────────┬──────────┐
│ ... other columns ...                    │ [⋮ Menu] │ ← Button here
└──────────────────────────────────────────┴──────────┘
```

---

## 🎨 Status Badge Examples

```
┌────────────────────────────────────────────────────┐
│ Status Column:                                     │
│                                                    │
│ ┌──────────┐  bg-gray-100 text-gray-700          │
│ │  Draft   │                                      │
│ └──────────┘                                      │
│                                                    │
│ ┌──────────┐  bg-blue-100 text-blue-700          │
│ │Confirmed │                                      │
│ └──────────┘                                      │
│                                                    │
│ ┌──────────────┐  bg-orange-100 text-orange-700  │
│ │ In Production│                                  │
│ └──────────────┘                                  │
│                                                    │
│ ┌──────────┐  bg-green-100 text-green-700        │
│ │Completed │                                      │
│ └──────────┘                                      │
│                                                    │
│ ┌──────────┐  bg-red-100 text-red-700            │
│ │Cancelled │                                      │
│ └──────────┘                                      │
│                                                    │
│ Classes: px-2 py-1 rounded text-xs font-medium   │
└────────────────────────────────────────────────────┘
```

---

## 💰 Currency Formatting Examples

```javascript
// Input: 123456
// Output: ₹1,23,456

<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
  ₹{order.final_amount?.toLocaleString()}
</td>

// Positive amount (advance paid)
<td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
  ₹{order.advance_paid?.toLocaleString() || '0'}
</td>

// Negative/Due amount (balance)
<td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">
  ₹{order.balance_amount?.toLocaleString()}
</td>
```

---

## 📅 Date Formatting Examples

```javascript
// Order Date
<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
  {new Date(order.order_date).toLocaleDateString()}
</td>
// Output: 12/25/2024

// Delivery Date with conditional styling
<td className="px-4 py-3 whitespace-nowrap text-sm">
  <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'}>
    {new Date(order.delivery_date).toLocaleDateString()}
  </span>
</td>
```

---

## 🎯 Summary Card Structure

```
┌─────────────────────────────────────────────────┐
│ bg-white p-6 rounded-lg shadow-md               │
│ border-l-4 border-blue-500                      │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ flex items-center justify-between         │  │
│ │                                           │  │
│ │ ┌──────────────────┐   ┌──────────────┐  │  │
│ │ │ Total Orders     │   │   ┌───┐      │  │  │
│ │ │ text-sm gray-600 │   │   │🛒│      │  │  │
│ │ │                  │   │   └───┘      │  │  │
│ │ │ 123              │   │ bg-blue-100  │  │  │
│ │ │ text-3xl bold    │   │ p-3 rounded  │  │  │
│ │ └──────────────────┘   └──────────────┘  │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Color Combinations:**
- Blue: Total items (border-blue-500, bg-blue-100)
- Yellow: Pending items (border-yellow-500, bg-yellow-100)
- Orange: In Progress (border-orange-500, bg-orange-100)
- Green: Completed (border-green-500, bg-green-100)
- Purple: Value/Amount (border-purple-500, bg-purple-100)
- Red: Alerts/Due (border-red-500, bg-red-100)

---

## 🔄 Loading & Empty States

```
┌─────────────────────────────────────────────────┐
│ <tbody>                                         │
│                                                 │
│   LOADING STATE:                                │
│   ┌───────────────────────────────────────┐    │
│   │                                       │    │
│   │         Loading orders...             │    │
│   │         (centered, gray text)         │    │
│   │                                       │    │
│   └───────────────────────────────────────┘    │
│                                                 │
│   EMPTY STATE:                                  │
│   ┌───────────────────────────────────────┐    │
│   │                                       │    │
│   │         No orders found               │    │
│   │         (centered, gray text)         │    │
│   │                                       │    │
│   └───────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘

<td colSpan={16} className="px-4 py-8 text-center text-gray-500">
  {loading ? 'Loading orders...' : 'No orders found'}
</td>
```

---

## 🎨 Complete Color Reference

### Status Badge Colors:
```css
/* Draft/Pending/Not Started */
bg-gray-100 text-gray-700

/* Confirmed/Sent/Active */
bg-blue-100 text-blue-700

/* Awaiting/Needs Review */
bg-yellow-100 text-yellow-700

/* In Progress/Processing */
bg-orange-100 text-orange-700

/* Special Status (e.g., PO Created) */
bg-purple-100 text-purple-700

/* Completed/Success/Approved */
bg-green-100 text-green-700

/* Cancelled/Rejected/Failed */
bg-red-100 text-red-700
```

### Button Colors:
```css
/* Primary Action */
bg-blue-600 hover:bg-blue-700 text-white

/* Secondary Action */
bg-gray-100 hover:bg-gray-200 text-gray-700

/* Danger Action */
bg-red-600 hover:bg-red-700 text-white
text-red-600 hover:bg-red-50 (for menu items)

/* Success Action */
bg-green-600 hover:bg-green-700 text-white

/* Column Menu Button */
bg-purple-100 hover:bg-purple-200 text-purple-700
```

---

## 📱 Responsive Breakpoints

```javascript
// Summary Cards
grid-cols-1           // Mobile (< 768px)
md:grid-cols-2        // Tablet (768px - 1024px)
lg:grid-cols-4        // Desktop (> 1024px)

// Filter Panel
grid-cols-1           // Mobile
md:grid-cols-3        // Tablet
lg:grid-cols-6        // Desktop

// Table
- Horizontal scroll on mobile
- Full width on desktop
- Sticky actions column always visible
```

---

## ✅ Implementation Quick Checklist

```
Page Structure:
├─ [ ] Page Container (p-6 bg-gray-50 min-h-screen)
├─ [ ] Page Header (flex justify-between)
│   ├─ [ ] Title + Subtitle
│   └─ [ ] Create Button (bg-blue-600)
├─ [ ] Summary Cards (grid, colored borders, icons)
├─ [ ] Filter Section (bg-white shadow-md)
│   ├─ [ ] Search Input (with icon)
│   ├─ [ ] Columns Button (purple)
│   ├─ [ ] Filters Button (gray)
│   └─ [ ] Expandable Filter Grid
└─ [ ] Table Container (bg-white shadow-md)
    ├─ [ ] thead (bg-gray-50)
    ├─ [ ] tbody (white, dividers)
    ├─ [ ] Conditional column rendering
    ├─ [ ] Status badges (colored)
    ├─ [ ] Sticky actions column
    └─ [ ] Smart dropdown menu

Code Features:
├─ [ ] AVAILABLE_COLUMNS definition
├─ [ ] Column visibility state + localStorage
├─ [ ] isColumnVisible() function
├─ [ ] toggleColumn() function
├─ [ ] resetColumns() function
├─ [ ] showAllColumns() function
├─ [ ] Filter states (search, status, dates)
├─ [ ] applyFilters() function
├─ [ ] getStatusBadge() functions
├─ [ ] Smart menu positioning
├─ [ ] Click outside handler
├─ [ ] Loading state
└─ [ ] Empty state
```

---

## 🚀 Copy-Paste Template

```jsx
// 1. Column Definition
const AVAILABLE_COLUMNS = [
  { id: 'id_column', label: 'ID', defaultVisible: true, alwaysVisible: true },
  { id: 'name', label: 'Name', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'actions', label: 'Actions', defaultVisible: true, alwaysVisible: true }
];

// 2. State
const [visibleColumns, setVisibleColumns] = useState(() => {
  const saved = localStorage.getItem('yourPageVisibleColumns');
  return saved ? JSON.parse(saved) : AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
});

// 3. Functions
const isColumnVisible = (columnId) => visibleColumns.includes(columnId);
const toggleColumn = (columnId) => {
  const column = AVAILABLE_COLUMNS.find(col => col.id === columnId);
  if (column?.alwaysVisible) return;
  setVisibleColumns(prev => {
    const newColumns = prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId];
    localStorage.setItem('yourPageVisibleColumns', JSON.stringify(newColumns));
    return newColumns;
  });
};

// 4. Table Header
{isColumnVisible('column_id') && (
  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    Column Name
  </th>
)}

// 5. Table Cell
{isColumnVisible('column_id') && (
  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
    {data.value}
  </td>
)}
```

---

**Reference File:** `client/src/pages/sales/SalesOrdersPage.jsx`
**Last Updated:** January 2025