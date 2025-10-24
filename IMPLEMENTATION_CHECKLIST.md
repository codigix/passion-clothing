# ✅ Material Request Implementation Checklist

## 🎯 What's Already Done

### ✅ Backend (100% Complete)
- [x] Database model created (`ProjectMaterialRequest`)
- [x] Database migration executed
- [x] All 7 API endpoints implemented
- [x] Notification system integrated
- [x] Stock checking logic implemented
- [x] Material reservation logic implemented
- [x] Routes registered in server

### ✅ Frontend - Core Files (100% Complete)
- [x] API service layer created (`projectMaterialRequestService.js`)
- [x] Procurement Material Requests page created (`MaterialRequestsPage.jsx`)
- [x] Route added to App.jsx
- [x] Manufacturing Material Requests page (from previous work)
- [x] Inventory Material Requests page (from previous work)

---

## 🚀 What You Need to Do Now

### Step 1: Add Material Request Button to PO Details Page

**File:** `client/src/pages/procurement/PurchaseOrderDetailsPage.jsx`

**Location:** Around line 305 (in the Quick Actions section)

**Add this code:**

```jsx
{/* Material Request Button - Only show for project-linked POs */}
{order.project_name && ['approved', 'sent', 'acknowledged', 'received'].includes(order.status) && (
  <button
    onClick={() => setShowMaterialRequestModal(true)}
    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm shadow-lg"
  >
    <FaBoxOpen /> Send Material Request to Manufacturing
  </button>
)}
```

**Add state variables (around line 39):**

```jsx
const [showMaterialRequestModal, setShowMaterialRequestModal] = useState(false);
const [materialRequestData, setMaterialRequestData] = useState({
  priority: 'medium',
  required_date: '',
  procurement_notes: '',
  selected_materials: []
});
```

**Add handler function (around line 135):**

```jsx
const handleCreateMaterialRequest = async () => {
  try {
    if (!materialRequestData.required_date) {
      toast.error('Please select a required date');
      return;
    }

    if (materialRequestData.selected_materials.length === 0) {
      toast.error('Please select at least one material');
      return;
    }

    const response = await api.post(`/project-material-requests/from-po/${id}`, {
      priority: materialRequestData.priority,
      required_date: materialRequestData.required_date,
      procurement_notes: materialRequestData.procurement_notes,
      materials_requested: materialRequestData.selected_materials.map(index => ({
        product_id: order.items[index].product_id,
        product_name: order.items[index].product_name || order.items[index].item_name,
        quantity: order.items[index].quantity,
        unit: order.items[index].unit
      }))
    });

    toast.success('Material request sent to Manufacturing successfully!');
    setShowMaterialRequestModal(false);
    
    // Reset form
    setMaterialRequestData({
      priority: 'medium',
      required_date: '',
      procurement_notes: '',
      selected_materials: []
    });

    // Navigate to material requests page
    setTimeout(() => {
      navigate('/procurement/material-requests');
    }, 1500);

  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to create material request');
  }
};
```

**Add modal component (before the closing div, around line 700):**

```jsx
{/* Material Request Modal */}
{showMaterialRequestModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      <h3 className="text-xl font-bold mb-4">Create Material Request</h3>
      
      <div className="space-y-4">
        {/* Priority */}
        <div>
          <label className="block text-sm font-medium mb-1">Priority *</label>
          <select
            value={materialRequestData.priority}
            onChange={(e) => setMaterialRequestData({...materialRequestData, priority: e.target.value})}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Required Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Required Date *</label>
          <input
            type="date"
            value={materialRequestData.required_date}
            onChange={(e) => setMaterialRequestData({...materialRequestData, required_date: e.target.value})}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-purple-500"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Procurement Notes</label>
          <textarea
            value={materialRequestData.procurement_notes}
            onChange={(e) => setMaterialRequestData({...materialRequestData, procurement_notes: e.target.value})}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-purple-500"
            rows="3"
            placeholder="Add any special instructions or notes for manufacturing..."
          />
        </div>

        {/* Materials Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Materials *</label>
          <div className="border rounded p-3 max-h-60 overflow-y-auto bg-gray-50">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <label key={index} className="flex items-center gap-2 p-2 hover:bg-white cursor-pointer rounded">
                  <input
                    type="checkbox"
                    checked={materialRequestData.selected_materials.includes(index)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMaterialRequestData({
                          ...materialRequestData,
                          selected_materials: [...materialRequestData.selected_materials, index]
                        });
                      } else {
                        setMaterialRequestData({
                          ...materialRequestData,
                          selected_materials: materialRequestData.selected_materials.filter(i => i !== index)
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="flex-1">
                    <strong>{item.product_name || item.item_name || item.fabric_name}</strong>
                    {' - '}Qty: {item.quantity} {item.unit || item.uom}
                  </span>
                </label>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No items available in this PO</p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {materialRequestData.selected_materials.length} material(s) selected
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={handleCreateMaterialRequest}
          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-medium transition"
        >
          Send Request to Manufacturing
        </button>
        <button
          onClick={() => {
            setShowMaterialRequestModal(false);
            setMaterialRequestData({
              priority: 'medium',
              required_date: '',
              procurement_notes: '',
              selected_materials: []
            });
          }}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 font-medium transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

---

### Step 2: Add Navigation Link to Sidebar

**File:** `client/src/components/Sidebar.jsx`

**Location:** In the Procurement section

**Add this link:**

```jsx
{/* In Procurement section */}
<li>
  <Link
    to="/procurement/material-requests"
    className={`flex items-center gap-2 px-4 py-2 rounded transition ${
      location.pathname === '/procurement/material-requests'
        ? 'bg-blue-100 text-blue-600'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <FaBoxOpen /> Material Requests
  </Link>
</li>
```

**Make sure to import FaBoxOpen:**

```jsx
import { FaBoxOpen } from 'react-icons/fa';
```

---

### Step 3: Add Tab to Procurement Dashboard (Optional but Recommended)

**File:** `client/src/pages/dashboards/ProcurementDashboard.jsx`

**Add state variable:**

```jsx
const [materialRequests, setMaterialRequests] = useState([]);
```

**Add fetch function in useEffect:**

```jsx
// Inside fetchDashboardData function
const fetchMaterialRequests = async () => {
  try {
    const response = await api.get('/project-material-requests');
    setMaterialRequests(response.data.requests || []);
  } catch (error) {
    console.error('Error fetching material requests:', error);
  }
};

// Call it
await fetchMaterialRequests();
```

**Add tab button (around line 290):**

```jsx
<button
  className={`px-2 py-2 text-sm font-medium border-b-2 ${
    tabValue === 5
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700'
  }`}
  onClick={() => setTabValue(5)}
>
  Material Requests ({materialRequests.length})
</button>
```

**Add tab content:**

```jsx
{tabValue === 5 && (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-900">Material Requests</h2>
      <button
        onClick={() => navigate('/procurement/material-requests')}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <FaClipboardList /> View All Material Requests
      </button>
    </div>
    
    {/* Quick summary */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
        <div className="text-2xl font-bold text-yellow-700">
          {materialRequests.filter(r => r.status === 'pending').length}
        </div>
        <div className="text-sm text-gray-600">Pending Review</div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <div className="text-2xl font-bold text-blue-700">
          {materialRequests.filter(r => r.status === 'reviewed').length}
        </div>
        <div className="text-sm text-gray-600">Reviewed</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
        <div className="text-2xl font-bold text-green-700">
          {materialRequests.filter(r => r.status === 'materials_reserved').length}
        </div>
        <div className="text-sm text-gray-600">Materials Reserved</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
        <div className="text-2xl font-bold text-purple-700">
          {materialRequests.length}
        </div>
        <div className="text-sm text-gray-600">Total Requests</div>
      </div>
    </div>

    {/* Recent requests */}
    {materialRequests.length > 0 ? (
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {materialRequests.slice(0, 5).map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">#{request.id}</td>
                <td className="px-4 py-2 text-sm font-medium">{request.project_name}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    request.status === 'materials_reserved' ? 'bg-green-100 text-green-700' :
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {request.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    request.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    request.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {request.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  {new Date(request.required_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">
        <FaBoxOpen className="mx-auto text-4xl mb-2" />
        <p>No material requests yet</p>
        <p className="text-sm">Create a request from a Purchase Order details page</p>
      </div>
    )}
  </div>
)}
```

---

## 🧪 Testing Steps

### Test 1: Create Material Request

1. ✅ Start the development server
   ```bash
   npm run dev
   ```

2. ✅ Login as Procurement user

3. ✅ Navigate to Purchase Orders

4. ✅ Open a PO that is linked to a project

5. ✅ Click "Send Material Request to Manufacturing" button

6. ✅ Fill the form:
   - Select priority
   - Choose required date
   - Add notes
   - Select materials

7. ✅ Click "Send Request"

8. ✅ Verify success message appears

9. ✅ Verify redirect to Material Requests page

### Test 2: View Material Requests

1. ✅ Go to `/procurement/material-requests`

2. ✅ Verify stats cards show correct counts

3. ✅ Verify request appears in table

4. ✅ Click "View" button

5. ✅ Verify modal shows all details

6. ✅ Close modal

### Test 3: Filter Requests

1. ✅ Use status filter dropdown

2. ✅ Select "Pending"

3. ✅ Verify only pending requests show

4. ✅ Try other filters

### Test 4: Dashboard Integration

1. ✅ Go to Procurement Dashboard

2. ✅ Click "Material Requests" tab

3. ✅ Verify stats show correctly

4. ✅ Click "View All Material Requests"

5. ✅ Verify navigation works

### Test 5: End-to-End Workflow

1. ✅ Create request as Procurement

2. ✅ Login as Manufacturing user

3. ✅ Verify notification received

4. ✅ Go to Manufacturing Material Requests

5. ✅ Review and forward request

6. ✅ Login as Inventory user

7. ✅ Check stock availability

8. ✅ Reserve materials

9. ✅ Login back as Procurement

10. ✅ Verify reservation notification

11. ✅ View reserved materials details

---

## 📁 Files Summary

### ✅ Already Created:
- `client/src/services/projectMaterialRequestService.js` ✅
- `client/src/pages/procurement/MaterialRequestsPage.jsx` ✅
- `client/src/App.jsx` (route added) ✅

### 📝 Need to Modify:
- `client/src/pages/procurement/PurchaseOrderDetailsPage.jsx` (add button & modal)
- `client/src/components/Sidebar.jsx` (add navigation link)
- `client/src/pages/dashboards/ProcurementDashboard.jsx` (add tab - optional)

---

## 🎯 Quick Commands

### Start Development Server:
```bash
cd client
npm run dev
```

### Start Backend Server:
```bash
cd server
npm run dev
```

### Run Both (if configured):
```bash
npm run dev
```

---

## 📞 Need Help?

### Common Issues:

**Issue: Button doesn't appear on PO details page**
- Check if PO has `project_name` field
- Check if PO status is approved/sent/acknowledged/received
- Check console for errors

**Issue: API calls fail**
- Verify backend server is running
- Check API endpoint URLs
- Verify authentication token

**Issue: Modal doesn't open**
- Check state variables are defined
- Check for JavaScript errors in console
- Verify modal code is added correctly

**Issue: Navigation doesn't work**
- Verify route is added to App.jsx
- Check sidebar link path matches route
- Clear browser cache

---

## ✨ You're Almost Done!

Just follow the 3 steps above to complete the integration:

1. ✅ Add button & modal to PO Details page
2. ✅ Add navigation link to Sidebar
3. ✅ (Optional) Add tab to Procurement Dashboard

Then test the complete workflow!

---

**Last Updated:** January 2024  
**Status:** Ready for Implementation  
**Estimated Time:** 30-45 minutes