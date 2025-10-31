# Expandable Purchase Order Rows - Code Changes Summary

## File Modified
**`d:\projects\passion-clothing\client\src\pages\procurement\PurchaseOrdersPage.jsx`**

## Change 1: Add State Variable (Line 74)

### Added:
```javascript
const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded rows
```

**Purpose**: Maintains a Set of order IDs that are currently expanded.

---

## Change 2: Add Toggle Function (Lines 437-445)

### Added:
```javascript
const toggleRowExpansion = (orderId) => {
  const newExpandedRows = new Set(expandedRows);
  if (newExpandedRows.has(orderId)) {
    newExpandedRows.delete(orderId);
  } else {
    newExpandedRows.add(orderId);
  }
  setExpandedRows(newExpandedRows);
};
```

**Purpose**: Toggles row expansion state by adding/removing order ID from Set.

---

## Change 3: Wrap Map Item in React.Fragment (Line 822)

### Changed From:
```jsx
filteredOrders.map((order) => (
  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
```

### Changed To:
```jsx
filteredOrders.map((order) => (
  <React.Fragment key={order.id}>
    <tr className="hover:bg-slate-50 transition-colors group">
```

**Purpose**: Allows returning multiple rows per iteration (main row + expanded row).

---

## Change 4: Replace Dropdown with Expand Button (Lines 894-904)

### Changed From:
```jsx
{isColumnVisible('actions') && (
  <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-2px_0_4px_rgba(0,0,0,0.05)] transition-colors">
    <div className="relative action-menu-container">
      <button
        onClick={(e) => toggleActionMenu(order.id, e)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
        title="Actions"
      >
        <FaChevronDown size={14} />
      </button>
      
      {/* Old dropdown menu code removed */}
```

### Changed To:
```jsx
{isColumnVisible('actions') && (
  <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-2px_0_4px_rgba(0,0,0,0.05)] transition-colors">
    <button
      onClick={() => toggleRowExpansion(order.id)}
      className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
      title={expandedRows.has(order.id) ? 'Hide Actions' : 'Show Actions'}
    >
      <FaChevronDown size={14} className={`transition-transform ${expandedRows.has(order.id) ? 'rotate-180' : ''}`} />
    </button>
  </td>
)}
```

**Purpose**: 
- Removes dropdown menu positioning logic
- Replaces with simple expand button
- Icon rotates when expanded
- Tooltip changes based on state

---

## Change 5: Add Expanded Actions Row (Lines 906-1090)

### Added After `</tr>`:
```jsx
      </tr>

      {/* Expanded Actions Row */}
      {expandedRows.has(order.id) && (
        <tr className="bg-slate-50 border-t-2 border-blue-200">
          <td colSpan={AVAILABLE_COLUMNS.length} className="px-4 py-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Available Actions</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                
                {/* View / Edit Button */}
                <button
                  onClick={() => {
                    handleView(order);
                    setExpandedRows(new Set());
                  }}
                  className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors text-xs font-medium border border-blue-200"
                >
                  <FaEye size={16} />
                  <span className="text-center">View</span>
                </button>

                {/* Submit for Approval - Only for draft status */}
                {order.status === 'draft' && (
                  <button
                    onClick={() => {
                      handleSubmitForApproval(order);
                      setExpandedRows(new Set());
                    }}
                    className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors text-xs font-medium border border-amber-200"
                  >
                    <FaClipboardList size={16} />
                    <span className="text-center">Submit</span>
                  </button>
                )}

                {/* Approve PO - Only for pending_approval status */}
                {order.status === 'pending_approval' && (
                  <button
                    onClick={() => {
                      handleApprovePO(order);
                      setExpandedRows(new Set());
                    }}
                    className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors text-xs font-medium border border-emerald-200"
                  >
                    <FaCheckCircle size={16} />
                    <span className="text-center">Approve</span>
                  </button>
                )}

                {/* Send to Vendor - For approved or draft status */}
                {(order.status === 'approved' || order.status === 'draft') && (
                  <button
                    onClick={() => {
                      handleSendToVendor(order);
                      setExpandedRows(new Set());
                    }}
                    className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 transition-colors text-xs font-medium border border-violet-200"
                  >
                    <FaTruck size={16} />
                    <span className="text-center">Send</span>
                  </button>
                )}

                {/* Material Received - For sent or acknowledged status */}
                {(order.status === 'sent' || order.status === 'acknowledged') && (
                  <button
                    onClick={() => {
                      handleMaterialReceived(order);
                      setExpandedRows(new Set());
                    }}
                    className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 transition-colors text-xs font-medium border border-teal-200 font-bold"
                  >
                    <FaCheckCircle size={16} />
                    <span className="text-center">Received</span>
                  </button>
                )}

                {/* Request GRN Creation - For sent status (LEGACY - Manual Option) */}
                {order.status === 'sent' && (
                  <button
                    onClick={() => {
                      handleRequestGRN(order);
                      setExpandedRows(new Set());
                    }}
                    className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors text-xs font-medium border border-blue-200"
                  >
                    <FaBoxOpen size={16} />
                    <span className="text-center">Request GRN</span>
                  </button>
                )}

                {/* View GRN Request Status - For grn_requested or dispatched status */}
                {(order.status === 'grn_requested' || order.status === 'dispatched' || order.status === 'in_transit') && (
                  <button
                    onClick={() => {
                      handleViewGRNStatus(order);
                      setExpandedRows(new Set());
                    }}
                    className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors text-xs font-medium border border-orange-200"
                  >
                    <FaClock size={16} />
                    <span className="text-center">{order.status === 'dispatched' || order.status === 'in_transit' ? 'In Transit' : 'GRN Status'}</span>
                  </button>
                )}

                {/* Generate Invoice */}
                <button
                  onClick={() => {
                    handleGenerateInvoice(order);
                    setExpandedRows(new Set());
                  }}
                  className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors text-xs font-medium border border-slate-200"
                >
                  <FaFileInvoice size={16} />
                  <span className="text-center">Invoice</span>
                </button>

                {/* View GRN Status - General option for received orders */}
                {['sent', 'acknowledged', 'received', 'partial_received', 'completed'].includes(order.status) && !['grn_requested', 'dispatched', 'in_transit'].includes(order.status) && (
                  <button
                    onClick={() => {
                      handleViewGRNStatus(order);
                      setExpandedRows(new Set());
                    }}
                    className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors text-xs font-medium border border-slate-200"
                  >
                    <FaClipboardList size={16} />
                    <span className="text-center">GRN Status</span>
                  </button>
                )}

                {/* Generate QR Code */}
                <button
                  onClick={() => {
                    handleGenerateQR(order);
                    setExpandedRows(new Set());
                  }}
                  className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors text-xs font-medium border border-slate-200"
                >
                  <FaQrcode size={16} />
                  <span className="text-center">QR Code</span>
                </button>

                {/* Print PO */}
                <button
                  onClick={() => {
                    handlePrint(order);
                    setExpandedRows(new Set());
                  }}
                  className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors text-xs font-medium border border-slate-200"
                >
                  <FaPrint size={16} />
                  <span className="text-center">Print</span>
                </button>

                {/* Mark as Received - Quick action */}
                {['sent', 'acknowledged', 'partial_received'].includes(order.status) && (
                  <button
                    onClick={() => {
                      handleMarkAsReceived(order);
                      setExpandedRows(new Set());
                    }}
                    className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors text-xs font-medium border border-emerald-200"
                  >
                    <FaCheck size={16} />
                    <span className="text-center">Received</span>
                  </button>
                )}

                {/* Delete - Dangerous action at bottom */}
                <button
                  onClick={() => {
                    handleDelete(order);
                    setExpandedRows(new Set());
                  }}
                  className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors text-xs font-medium border border-red-200"
                >
                  <FaTrash size={16} />
                  <span className="text-center">Delete</span>
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
```

**Key Features**:
- Conditional rendering based on `expandedRows.has(order.id)`
- Grid layout with responsive columns (2-6)
- Each button calls original handler + collapses row
- Status-based visibility for most actions
- Color-coded buttons for visual hierarchy

---

## Change 6: Close Fragment (Line 1091)

### Changed From:
```jsx
                    </tr>
                  ))
```

### Changed To:
```jsx
                    </React.Fragment>
                  ))
```

**Purpose**: Properly closes the React.Fragment wrapper.

---

## Summary of Changes

| Item | Lines | Action |
|------|-------|--------|
| State variable | 74 | Added `expandedRows` Set state |
| Toggle function | 437-445 | Added `toggleRowExpansion()` |
| Fragment wrapper | 822 | Changed to `React.Fragment` |
| Expand button | 894-904 | Replaced dropdown with expand button |
| Expanded row | 906-1090 | Added new row with grid buttons |
| Fragment close | 1091 | Changed to `</React.Fragment>` |

---

## Lines Changed/Added

```
Total Lines Added: ~185
Total Lines Removed: ~180 (old dropdown menu code)
Net Change: ~5 lines (slight reduction)
```

---

## Backward Compatibility

✅ **No Breaking Changes**
- All action handlers (`handleView`, `handleSubmitForApproval`, etc.) unchanged
- API endpoints unchanged
- Event handlers preserve exact same logic
- State management follows existing patterns
- No dependency updates required

---

## Testing the Changes

```bash
# Navigate to project
cd d:\projects\passion-clothing

# Start dev server
npm run dev

# Visit URL
http://localhost:3001/procurement/purchase-orders

# Test: Click expand arrow on any PO row
```

---

## Rollback Instructions

If needed to revert:

```jsx
// Change back: Remove expandedRows state
// - const [expandedRows, setExpandedRows] = useState(new Set());

// Change back: Remove toggleRowExpansion function
// - const toggleRowExpansion = (orderId) => { ... }

// Change back: Restore original map structure
// - Remove React.Fragment wrapper
// - Restore original dropdown code

// Change back: Restore closing tr/map
// - Change back from </React.Fragment> to </tr>
```

---

**Implementation complete and ready for testing!**