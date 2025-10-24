# Step-by-Step Table Implementation Guide 🚀

## 📋 Overview
This guide provides copy-paste code blocks to quickly implement the standardized table structure based on SalesOrdersPage.jsx

---

## ⚡ Quick Start (30 Minutes Implementation)

### Step 1: Import Required Dependencies (2 min)

```jsx
import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaEye,
  FaChevronDown,
  FaColumns,
  FaPrint,
  FaUpload,
  FaDownload
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
```

---

### Step 2: Define Column Configuration (5 min)

```jsx
// Define all available columns with their properties
const AVAILABLE_COLUMNS = [
  // IMPORTANT: Replace these with your actual columns
  { id: 'id', label: 'ID', defaultVisible: true, alwaysVisible: true },
  { id: 'name', label: 'Name', defaultVisible: true },
  { id: 'description', label: 'Description', defaultVisible: false },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'created_at', label: 'Created Date', defaultVisible: false },
  { id: 'updated_at', label: 'Updated Date', defaultVisible: false },
  { id: 'actions', label: 'Actions', defaultVisible: true, alwaysVisible: true }
];

// CUSTOMIZE: Change 'yourTableName' to match your page (e.g., 'purchaseOrders', 'inventory')
const LOCAL_STORAGE_KEY = 'yourTableNameVisibleColumns';
```

---

### Step 3: Component State Setup (5 min)

```jsx
const YourComponentPage = () => {
  const navigate = useNavigate();
  
  // Data states
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // UI states
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  
  // Column visibility state with localStorage persistence
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
  });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [data, searchTerm, statusFilter, dateFrom, dateTo]);

  // Click outside handler for menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnMenu && !event.target.closest('.column-menu-container')) {
        setShowColumnMenu(false);
      }
      if (showActionMenu && !event.target.closest('.action-menu-container')) {
        setShowActionMenu(null);
        setMenuPosition({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnMenu, showActionMenu]);

  // ... (continue to next step)
```

---

### Step 4: Data Fetching & Filtering Functions (5 min)

```jsx
  const fetchData = async () => {
    try {
      setLoading(true);
      // CUSTOMIZE: Replace with your API endpoint
      const response = await api.get('/your-endpoint');
      setData(response.data.items || response.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        // CUSTOMIZE: Add your searchable fields
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(item => 
        new Date(item.created_at) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filtered = filtered.filter(item => 
        new Date(item.created_at) <= new Date(dateTo + 'T23:59:59')
      );
    }

    setFilteredData(filtered);
  };
```

---

### Step 5: Column Visibility Functions (3 min)

```jsx
  // Column visibility functions
  const isColumnVisible = (columnId) => {
    return visibleColumns.includes(columnId);
  };

  const toggleColumn = (columnId) => {
    const column = AVAILABLE_COLUMNS.find(col => col.id === columnId);
    if (column?.alwaysVisible) return; // Don't toggle always-visible columns
    
    setVisibleColumns(prev => {
      const newColumns = prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newColumns));
      return newColumns;
    });
  };

  const resetColumns = () => {
    const defaultCols = AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
    setVisibleColumns(defaultCols);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultCols));
  };

  const showAllColumns = () => {
    const allCols = AVAILABLE_COLUMNS.map(col => col.id);
    setVisibleColumns(allCols);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allCols));
  };
```

---

### Step 6: Action Menu Functions (3 min)

```jsx
  // Smart menu positioning
  const handleActionMenuToggle = (itemId, event) => {
    if (showActionMenu === itemId) {
      setShowActionMenu(null);
      setMenuPosition({});
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const menuHeight = 350; // Approximate height of dropdown menu
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If not enough space below and more space above, open upward
      const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      
      setMenuPosition({ [itemId]: openUpward });
      setShowActionMenu(itemId);
    }
  };

  const closeActionMenu = () => {
    setShowActionMenu(null);
    setMenuPosition({});
  };
```

---

### Step 7: Status Badge Functions (3 min)

```jsx
  // CUSTOMIZE: Adjust statuses and colors to match your data
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
      active: { color: 'bg-blue-100 text-blue-700', label: 'Active' },
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      in_progress: { color: 'bg-orange-100 text-orange-700', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };
```

---

### Step 8: JSX - Page Header (2 min)

```jsx
  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Your Page Title</h1>
          <p className="text-gray-600 mt-1">Manage and track your items</p>
        </div>
        <button
          className="bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md transition-colors"
          onClick={() => navigate('/your-create-route')}
        >
          <FaPlus size={16} /> Create New
        </button>
      </div>
```

---

### Step 9: JSX - Summary Cards (Optional, 5 min)

```jsx
      {/* Summary Widgets - OPTIONAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-gray-800">{data.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaEye size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Items</p>
              <p className="text-3xl font-bold text-gray-800">
                {data.filter(item => item.status === 'pending').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaChevronDown size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Add more summary cards as needed */}
      </div>
```

---

### Step 10: JSX - Filters Section (7 min)

```jsx
      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          {/* Search Input */}
          <div className="flex-1 relative mr-4">
            <input
              type="text"
              placeholder="Search by name, ID, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Column Visibility Dropdown */}
            <div className="relative column-menu-container">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="flex items-center gap-2 px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
              >
                <FaColumns size={16} />
                <span>Columns</span>
                <FaChevronDown size={14} className={`transition-transform ${showColumnMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Column Menu Dropdown */}
              {showColumnMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50 border">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700">Manage Columns</h3>
                      <span className="text-xs text-gray-500">
                        {visibleColumns.length} of {AVAILABLE_COLUMNS.length}
                      </span>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {AVAILABLE_COLUMNS.map(column => (
                        <label
                          key={column.id}
                          className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer ${
                            column.alwaysVisible ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isColumnVisible(column.id)}
                            onChange={() => toggleColumn(column.id)}
                            disabled={column.alwaysVisible}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{column.label}</span>
                          {column.alwaysVisible && (
                            <span className="text-xs text-gray-400 ml-auto">(Required)</span>
                          )}
                        </label>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      <button
                        onClick={showAllColumns}
                        className="flex-1 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                      >
                        Show All
                      </button>
                      <button
                        onClick={resetColumns}
                        className="flex-1 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Filters Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FaFilter size={16} />
              <span>Filters</span>
              <FaChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* CUSTOMIZE: Add more filter fields as needed */}
          </div>
        )}
      </div>
```

---

### Step 11: JSX - Data Table (10 min)

```jsx
      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* CUSTOMIZE: Replace with your actual columns */}
                {isColumnVisible('id') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                )}
                {isColumnVisible('name') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                )}
                {isColumnVisible('description') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                )}
                {isColumnVisible('status') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                )}
                {isColumnVisible('created_at') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                )}
                {isColumnVisible('actions') && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] min-w-[100px]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={16} className="px-4 py-8 text-center text-gray-500">
                    Loading data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-4 py-8 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    {/* CUSTOMIZE: Replace with your actual data fields */}
                    {isColumnVisible('id') && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/your-route/${item.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {item.id}
                        </button>
                      </td>
                    )}
                    {isColumnVisible('name') && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                    )}
                    {isColumnVisible('description') && (
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.description || 'N/A'}
                      </td>
                    )}
                    {isColumnVisible('status') && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                    )}
                    {isColumnVisible('created_at') && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                    )}
                    {isColumnVisible('actions') && (
                      <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] transition-colors">
                        <div className="relative action-menu-container flex items-center gap-1">
                          <button
                            onClick={(e) => handleActionMenuToggle(item.id, e)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="More Actions"
                          >
                            <FaChevronDown size={14} />
                          </button>
                          
                          {/* Action Dropdown Menu */}
                          {showActionMenu === item.id && (
                            <div className={`absolute right-0 w-56 bg-white rounded-lg shadow-xl z-[100] border ${
                              menuPosition[item.id] ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}>
                              <button
                                onClick={() => {
                                  navigate(`/your-route/${item.id}`);
                                  closeActionMenu();
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <FaEye /> View Details
                              </button>
                              <button
                                onClick={() => {
                                  navigate(`/your-route/${item.id}/edit`);
                                  closeActionMenu();
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  // CUSTOMIZE: Add your action handler
                                  closeActionMenu();
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <FaPrint /> Print
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this item?')) {
                                    // CUSTOMIZE: Add delete handler
                                  }
                                  closeActionMenu();
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t"
                              >
                                <FaTrash /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default YourComponentPage;
```

---

## 🎨 Customization Checklist

After copying the template, customize these sections:

### 1. Column Configuration
- [ ] Update `AVAILABLE_COLUMNS` array with your actual columns
- [ ] Set appropriate `defaultVisible` values
- [ ] Mark essential columns as `alwaysVisible: true`
- [ ] Update `LOCAL_STORAGE_KEY` to unique name

### 2. API Integration
- [ ] Replace API endpoint in `fetchData()`
- [ ] Adjust response data path (`response.data.items`)
- [ ] Add any additional API calls (e.g., summary data)

### 3. Filter Logic
- [ ] Update searchable fields in `applyFilters()`
- [ ] Add custom filter states if needed
- [ ] Adjust status filter options
- [ ] Add additional filter dropdowns

### 4. Status Badges
- [ ] Update status values in `getStatusBadge()`
- [ ] Adjust colors to match your status types
- [ ] Create additional badge functions if needed (e.g., priority badges)

### 5. Table Columns
- [ ] Replace table headers with your column names
- [ ] Update table cells with your data fields
- [ ] Add proper data formatting (dates, currency, etc.)
- [ ] Ensure all columns wrapped with `isColumnVisible()`

### 6. Action Handlers
- [ ] Update navigation routes
- [ ] Implement custom action handlers
- [ ] Add/remove action menu items as needed
- [ ] Implement delete, edit, view handlers

### 7. Page Content
- [ ] Update page title and description
- [ ] Customize "Create New" button text and route
- [ ] Add/remove summary cards
- [ ] Adjust responsive breakpoints if needed

---

## 💡 Pro Tips

### Tip 1: Currency Formatting
```jsx
// For Indian Rupee with proper formatting
<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
  ₹{item.amount?.toLocaleString('en-IN')}
</td>
```

### Tip 2: Date Formatting
```jsx
// Short date
{new Date(item.created_at).toLocaleDateString()}

// Long date with time
{new Date(item.created_at).toLocaleString()}

// Custom format
{new Date(item.created_at).toLocaleDateString('en-IN', { 
  day: '2-digit', 
  month: 'short', 
  year: 'numeric' 
})}
```

### Tip 3: Conditional Row Styling
```jsx
<tr className={`hover:bg-gray-50 transition-colors group ${
  item.status === 'urgent' ? 'bg-red-50' : ''
}`}>
```

### Tip 4: Add Export Functionality
```jsx
const handleExport = () => {
  const csv = filteredData.map(item => 
    Object.values(item).join(',')
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'export.csv';
  a.click();
};

// Add button in header
<button onClick={handleExport} className="...">
  <FaDownload size={16} /> Export CSV
</button>
```

### Tip 5: Add Row Selection
```jsx
// Add to state
const [selectedRows, setSelectedRows] = useState([]);

// Add checkbox column
{isColumnVisible('select') && (
  <th className="px-4 py-3">
    <input 
      type="checkbox" 
      onChange={(e) => {
        if (e.target.checked) {
          setSelectedRows(filteredData.map(item => item.id));
        } else {
          setSelectedRows([]);
        }
      }}
    />
  </th>
)}

// In tbody
<td className="px-4 py-3">
  <input 
    type="checkbox"
    checked={selectedRows.includes(item.id)}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedRows([...selectedRows, item.id]);
      } else {
        setSelectedRows(selectedRows.filter(id => id !== item.id));
      }
    }}
  />
</td>
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Sticky Column Not Working
**Solution:** Ensure table is in a scrollable container and has `overflow-x-auto`

### Issue 2: Column Menu Closes Immediately
**Solution:** Check that `.column-menu-container` class is on the wrapper div

### Issue 3: Dropdown Opens Off-Screen
**Solution:** Smart positioning code should handle this, ensure `menuPosition` state is working

### Issue 4: localStorage Not Persisting
**Solution:** Check `LOCAL_STORAGE_KEY` is unique and `JSON.stringify/parse` is correct

### Issue 5: Filters Not Working
**Solution:** Ensure `applyFilters()` is in `useEffect` with correct dependencies

---

## ✅ Final Checklist

Before considering implementation complete:

- [ ] All columns defined in `AVAILABLE_COLUMNS`
- [ ] Column visibility working with localStorage
- [ ] Search functionality working
- [ ] All filters applying correctly
- [ ] Status badges displaying with correct colors
- [ ] Sticky actions column visible
- [ ] Dropdown menu positioning correctly (up/down)
- [ ] Click outside closes menus
- [ ] Loading state displays
- [ ] Empty state displays
- [ ] All action handlers implemented
- [ ] Navigation routes working
- [ ] Data formatting correct (dates, currency)
- [ ] Mobile responsive (at minimum, horizontal scroll)
- [ ] No console errors
- [ ] Code is clean and commented

---

## 📚 Additional Resources

- **Reference File:** `client/src/pages/sales/SalesOrdersPage.jsx`
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **React Icons:** https://react-icons.github.io/react-icons/
- **React Router:** https://reactrouter.com/

---

**Estimated Total Implementation Time:** 30-45 minutes per page
**Difficulty Level:** Intermediate
**Last Updated:** January 2025