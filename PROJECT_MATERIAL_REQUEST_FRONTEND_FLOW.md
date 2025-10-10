# Project Material Request - Complete Frontend Flow Guide

## 📊 Visual Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROCUREMENT DEPARTMENT                               │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  1. Purchase Order Details Page                                       │  │
│  │     - View PO linked to a Project                                     │  │
│  │     - Click "Send Material Request to Manufacturing" button           │  │
│  │     - Fill form: Priority, Required Date, Notes, Select Materials     │  │
│  │     - Submit Request                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  2. Procurement Dashboard - Material Requests Tab (NEW)               │  │
│  │     - View all material requests created                              │  │
│  │     - Track status of each request                                    │  │
│  │     - Receive notifications when materials are reserved               │  │
│  │     - View reservation details                                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    🔔 Notification sent to Manufacturing
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MANUFACTURING DEPARTMENT                              │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  3. Manufacturing Dashboard - Notifications                           │  │
│  │     - Receive notification: "New material request from Procurement"   │  │
│  │     - Click notification to view request                              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  4. Material Requests Page (/manufacturing/material-requests)         │  │
│  │     - View list of all material requests                              │  │
│  │     - Filter by status: Pending, Reviewed, Forwarded                  │  │
│  │     - Click "View Details" to see full request                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  5. Review Request Modal                                              │  │
│  │     - View materials requested                                        │  │
│  │     - Add manufacturing notes                                         │  │
│  │     - Click "Review Request" → Status: Reviewed                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  6. Forward to Inventory                                              │  │
│  │     - Click "Forward to Inventory" button                             │  │
│  │     - Add notes for inventory team                                    │  │
│  │     - Submit → Status: Forwarded to Inventory                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    🔔 Notification sent to Inventory
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INVENTORY DEPARTMENT                                 │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  7. Inventory Dashboard - Notifications                               │  │
│  │     - Receive notification: "Material request forwarded by Mfg"       │  │
│  │     - Click notification to view request                              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  8. Material Requests Page (/inventory/material-requests)             │  │
│  │     - View list of forwarded requests                                 │  │
│  │     - Filter by status: Forwarded, Checking, Available, Reserved      │  │
│  │     - Click "View Details" to see full request                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  9. Check Stock Availability                                          │  │
│  │     - Click "Check Stock Availability" button                         │  │
│  │     - System automatically checks inventory for each material         │  │
│  │     - Status updates to:                                              │  │
│  │       • Stock Available (all materials in stock)                      │  │
│  │       • Partial Available (some materials in stock)                   │  │
│  │       • Stock Unavailable (no materials in stock)                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  10. Reserve Materials                                                │  │
│  │     - View availability details for each material                     │  │
│  │     - Click "Reserve Materials" button                                │  │
│  │     - Add reservation notes                                           │  │
│  │     - Submit → Materials marked as "Reserved" in inventory            │  │
│  │     - Status: Materials Reserved                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    🔔 Notification sent to Manufacturing & Procurement
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACK TO MANUFACTURING & PROCUREMENT                       │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  11. View Reservation Details                                         │  │
│  │     - Receive notification: "Materials reserved for your request"     │  │
│  │     - View which materials are reserved                               │  │
│  │     - View inventory item barcodes and locations                      │  │
│  │     - Materials ready for production                                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Procurement Dashboard Integration

### Current State
The Procurement Dashboard has these tabs:
1. **Incoming Orders** - Sales orders and purchase orders
2. **Purchase Orders** - All POs
3. **Vendor Management** - Vendor list
4. **Goods Receipt** - GRN tracking
5. **Vendor Performance** - Vendor ratings

### NEW: Add Material Requests Tab

Add a **6th tab** to track material requests:

```jsx
// Add to ProcurementDashboard.jsx tabs section

<button
  className={`px-6 py-3 text-sm font-medium border-b-2 ${
    tabValue === 5
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700'
  }`}
  onClick={() => setTabValue(5)}
>
  Material Requests ({materialRequests.length})
</button>
```

---

## 📝 Implementation Steps

### Step 1: Create API Service (Already Done ✅)
File: `client/src/services/projectMaterialRequestService.js`

### Step 2: Add Material Request Button to PO Details Page

**File:** `client/src/pages/procurement/PurchaseOrderDetailsPage.jsx`

**Location:** In the "Quick Actions" section (around line 262)

**Add this button:**

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

**Add state and modal:**

```jsx
// Add to state declarations (around line 39)
const [showMaterialRequestModal, setShowMaterialRequestModal] = useState(false);
const [materialRequestData, setMaterialRequestData] = useState({
  priority: 'medium',
  required_date: '',
  procurement_notes: '',
  selected_materials: []
});

// Add modal component (before the closing div)
{showMaterialRequestModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <h3 className="text-xl font-bold mb-4">Create Material Request</h3>
      
      <div className="space-y-4">
        {/* Priority */}
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={materialRequestData.priority}
            onChange={(e) => setMaterialRequestData({...materialRequestData, priority: e.target.value})}
            className="w-full border rounded px-3 py-2"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Required Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Required Date</label>
          <input
            type="date"
            value={materialRequestData.required_date}
            onChange={(e) => setMaterialRequestData({...materialRequestData, required_date: e.target.value})}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Procurement Notes</label>
          <textarea
            value={materialRequestData.procurement_notes}
            onChange={(e) => setMaterialRequestData({...materialRequestData, procurement_notes: e.target.value})}
            className="w-full border rounded px-3 py-2"
            rows="3"
            placeholder="Add any special instructions or notes..."
          />
        </div>

        {/* Materials Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Materials</label>
          <div className="border rounded p-3 max-h-60 overflow-y-auto">
            {order.items?.map((item, index) => (
              <label key={index} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
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
                  {item.product_name || item.item_name} - Qty: {item.quantity} {item.unit}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={handleCreateMaterialRequest}
          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Send Request
        </button>
        <button
          onClick={() => setShowMaterialRequestModal(false)}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

**Add handler function:**

```jsx
// Add this function (around line 135)
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

    // Optionally navigate to material requests page
    setTimeout(() => {
      navigate('/procurement/material-requests');
    }, 1500);

  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to create material request');
  }
};
```

### Step 3: Create Procurement Material Requests Page

**File:** `client/src/pages/procurement/MaterialRequestsPage.jsx` (NEW FILE)

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaClock, FaCheckCircle, FaBox } from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MaterialRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/project-material-requests');
      setRequests(response.data.requests || []);
    } catch (error) {
      toast.error('Failed to load material requests');
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (requestId) => {
    try {
      const response = await api.get(`/project-material-requests/${requestId}`);
      setSelectedRequest(response.data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to load request details');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: <FaClock /> },
      reviewed: { color: 'bg-blue-100 text-blue-700', icon: <FaCheckCircle /> },
      forwarded_to_inventory: { color: 'bg-purple-100 text-purple-700', icon: <FaBox /> },
      stock_checking: { color: 'bg-indigo-100 text-indigo-700', icon: <FaClock /> },
      stock_available: { color: 'bg-green-100 text-green-700', icon: <FaCheckCircle /> },
      partial_available: { color: 'bg-orange-100 text-orange-700', icon: <FaCheckCircle /> },
      stock_unavailable: { color: 'bg-red-100 text-red-700', icon: <FaClock /> },
      materials_reserved: { color: 'bg-emerald-100 text-emerald-700', icon: <FaCheckCircle /> },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${badge.color}`}>
        {badge.icon} {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === statusFilter);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/procurement/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">Material Requests</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex items-center gap-4">
          <label className="font-medium">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="forwarded_to_inventory">Forwarded to Inventory</option>
            <option value="stock_available">Stock Available</option>
            <option value="materials_reserved">Materials Reserved</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No material requests found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">#{request.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{request.project_name}</td>
                  <td className="px-4 py-3 text-sm">{request.purchaseOrder?.po_number}</td>
                  <td className="px-4 py-3">{getPriorityBadge(request.priority)}</td>
                  <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(request.required_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => viewDetails(request.id)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Request #{selectedRequest.id}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Request Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-500">Project Name</label>
                <p className="font-medium">{selectedRequest.project_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">PO Number</label>
                <p className="font-medium">{selectedRequest.purchaseOrder?.po_number}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Priority</label>
                <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Required Date</label>
                <p className="font-medium">
                  {new Date(selectedRequest.required_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Created</label>
                <p className="font-medium">
                  {new Date(selectedRequest.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Materials Requested */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Materials Requested</h3>
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs">Material</th>
                    <th className="px-3 py-2 text-left text-xs">Quantity</th>
                    <th className="px-3 py-2 text-left text-xs">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRequest.materials_requested?.map((material, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2">{material.product_name}</td>
                      <td className="px-3 py-2">{material.quantity}</td>
                      <td className="px-3 py-2">{material.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {selectedRequest.procurement_notes && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Procurement Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">
                  {selectedRequest.procurement_notes}
                </p>
              </div>
            )}

            {/* Reserved Materials */}
            {selectedRequest.status === 'materials_reserved' && selectedRequest.reserved_inventory_items && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-green-600">✅ Reserved Materials</h3>
                <div className="bg-green-50 p-4 rounded">
                  {selectedRequest.reserved_inventory_items.map((item, index) => (
                    <div key={index} className="mb-2">
                      <p><strong>Barcode:</strong> {item.barcode}</p>
                      <p><strong>Location:</strong> {item.location}</p>
                      <p><strong>Quantity:</strong> {item.quantity} {item.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequestsPage;
```

### Step 4: Add Route to App.jsx

```jsx
// Add to client/src/App.jsx

import MaterialRequestsPage from './pages/procurement/MaterialRequestsPage';

// Add route
<Route path="/procurement/material-requests" element={<MaterialRequestsPage />} />
```

### Step 5: Add Navigation Link to Sidebar

```jsx
// Add to client/src/components/Sidebar.jsx in Procurement section

<li>
  <Link
    to="/procurement/material-requests"
    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded"
  >
    <FaBoxOpen /> Material Requests
  </Link>
</li>
```

### Step 6: Add Tab to Procurement Dashboard

```jsx
// Add to client/src/pages/dashboards/ProcurementDashboard.jsx

// Add state
const [materialRequests, setMaterialRequests] = useState([]);

// Fetch in useEffect
const fetchMaterialRequests = async () => {
  const response = await api.get('/project-material-requests');
  setMaterialRequests(response.data.requests || []);
};

// Add tab button (around line 290)
<button
  className={`px-6 py-3 text-sm font-medium border-b-2 ${
    tabValue === 5
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700'
  }`}
  onClick={() => setTabValue(5)}
>
  Material Requests ({materialRequests.length})
</button>

// Add tab content
{tabValue === 5 && (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Material Requests</h2>
    <button
      onClick={() => navigate('/procurement/material-requests')}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      View All Material Requests
    </button>
    
    {/* Quick summary */}
    <div className="mt-4 grid grid-cols-4 gap-4">
      <div className="bg-yellow-50 p-4 rounded">
        <div className="text-2xl font-bold">
          {materialRequests.filter(r => r.status === 'pending').length}
        </div>
        <div className="text-sm text-gray-600">Pending</div>
      </div>
      <div className="bg-blue-50 p-4 rounded">
        <div className="text-2xl font-bold">
          {materialRequests.filter(r => r.status === 'reviewed').length}
        </div>
        <div className="text-sm text-gray-600">Reviewed</div>
      </div>
      <div className="bg-green-50 p-4 rounded">
        <div className="text-2xl font-bold">
          {materialRequests.filter(r => r.status === 'materials_reserved').length}
        </div>
        <div className="text-sm text-gray-600">Reserved</div>
      </div>
      <div className="bg-purple-50 p-4 rounded">
        <div className="text-2xl font-bold">{materialRequests.length}</div>
        <div className="text-sm text-gray-600">Total</div>
      </div>
    </div>
  </div>
)}
```

---

## 🎯 User Journey Summary

### For Procurement Team:

1. **Create Request:**
   - Go to Purchase Order Details page
   - Click "Send Material Request to Manufacturing"
   - Fill form and submit

2. **Track Requests:**
   - Go to Procurement Dashboard → Material Requests tab
   - OR go to `/procurement/material-requests`
   - View all requests and their status

3. **Receive Updates:**
   - Get notifications when materials are reserved
   - View reservation details in request details

### For Manufacturing Team:

1. **Receive Request:**
   - Get notification from Procurement
   - Go to `/manufacturing/material-requests`

2. **Review Request:**
   - View request details
   - Add manufacturing notes
   - Click "Review Request"

3. **Forward to Inventory:**
   - Click "Forward to Inventory"
   - Add notes for inventory team
   - Submit

### For Inventory Team:

1. **Receive Request:**
   - Get notification from Manufacturing
   - Go to `/inventory/material-requests`

2. **Check Stock:**
   - Click "Check Stock Availability"
   - System automatically checks inventory

3. **Reserve Materials:**
   - View availability details
   - Click "Reserve Materials"
   - Materials marked as reserved

---

## 🎨 UI Screenshots Description

### Procurement Dashboard - Material Requests Tab
```
┌─────────────────────────────────────────────────────────────┐
│  Material Requests                                           │
│  [View All Material Requests]                                │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │    5     │  │    3     │  │    8     │  │   16     │   │
│  │ Pending  │  │ Reviewed │  │ Reserved │  │  Total   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### PO Details Page - Material Request Button
```
┌─────────────────────────────────────────────────────────────┐
│  Purchase Order PO-20240115-00001                            │
│  [APPROVED] [Priority: HIGH] 🔗 Linked to SO: SO-001        │
│                                                              │
│  Quick Actions:                                              │
│  [Send to Vendor] [✨ Create GRN] [📦 Send Material Request]│
└─────────────────────────────────────────────────────────────┘
```

### Material Request Modal
```
┌─────────────────────────────────────────────────────────────┐
│  Create Material Request                                     │
│                                                              │
│  Priority: [Medium ▼]                                        │
│  Required Date: [2024-01-20]                                 │
│  Procurement Notes: [___________________________]            │
│                                                              │
│  Select Materials:                                           │
│  ☑ Cotton Fabric - Qty: 100 Meters                          │
│  ☑ Polyester Thread - Qty: 50 Spools                        │
│  ☐ Buttons - Qty: 1000 Pieces                               │
│                                                              │
│  [Send Request] [Cancel]                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Testing Checklist

- [ ] Create material request from PO details page
- [ ] View request in Procurement dashboard
- [ ] Manufacturing receives notification
- [ ] Manufacturing can review request
- [ ] Manufacturing can forward to inventory
- [ ] Inventory receives notification
- [ ] Inventory can check stock
- [ ] Inventory can reserve materials
- [ ] Procurement receives reservation notification
- [ ] All status badges display correctly
- [ ] Priority badges display correctly
- [ ] Timeline shows all steps
- [ ] Reserved materials show barcode and location

---

## 🚀 Ready to Deploy!

All backend APIs are ready. Follow the steps above to complete the frontend integration!