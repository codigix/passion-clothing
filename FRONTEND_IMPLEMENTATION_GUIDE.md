# Frontend Implementation Guide - Project Material Requests

## Quick Start Guide for Frontend Developers

This guide provides ready-to-use code examples for implementing the Project Material Request feature on the frontend.

---

## 1. Procurement: Add Button to PO Details Page

### File: `client/src/pages/procurement/PurchaseOrderDetails.jsx`

### Step 1: Add State and API Function

```javascript
import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Inside your component
const [showRequestModal, setShowRequestModal] = useState(false);
const [requestNotes, setRequestNotes] = useState('');
const [requestPriority, setRequestPriority] = useState('medium');
const [creatingRequest, setCreatingRequest] = useState(false);

const handleCreateMaterialRequest = async () => {
  if (!po.project_name) {
    toast.error('Purchase Order must have a project name');
    return;
  }

  setCreatingRequest(true);
  
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/project-material-requests/from-po/${po.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          procurement_notes: requestNotes,
          priority: requestPriority
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success('Material request sent to manufacturing department');
      setShowRequestModal(false);
      setRequestNotes('');
      // Refresh PO data to show the new request
      fetchPODetails();
    } else {
      toast.error(data.message || 'Failed to create material request');
    }
  } catch (error) {
    console.error('Error creating material request:', error);
    toast.error('Failed to create material request');
  } finally {
    setCreatingRequest(false);
  }
};
```

### Step 2: Add Button in JSX

```jsx
{/* Add this in the PO details section, near other action buttons */}
{po.project_name && po.status === 'sent' && (
  <button
    onClick={() => setShowRequestModal(true)}
    className="btn btn-primary"
    disabled={creatingRequest}
  >
    <FaPaperPlane className="mr-2" />
    Send Request to Manufacturing
  </button>
)}
```

### Step 3: Add Modal for Request Creation

```jsx
{/* Material Request Modal */}
{showRequestModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h3>Send Material Request to Manufacturing</h3>
        <button onClick={() => setShowRequestModal(false)}>×</button>
      </div>
      
      <div className="modal-body">
        <div className="form-group">
          <label>Project Name</label>
          <input 
            type="text" 
            value={po.project_name} 
            disabled 
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Priority</label>
          <select 
            value={requestPriority}
            onChange={(e) => setRequestPriority(e.target.value)}
            className="form-control"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="form-group">
          <label>Notes for Manufacturing</label>
          <textarea
            value={requestNotes}
            onChange={(e) => setRequestNotes(e.target.value)}
            className="form-control"
            rows="4"
            placeholder="Add any special instructions or notes..."
          />
        </div>

        <div className="info-box">
          <p><strong>Materials to be requested:</strong></p>
          <ul>
            {po.items?.map((item, index) => (
              <li key={index}>
                {item.fabric_name || item.item_name} - {item.quantity} {item.uom}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="modal-footer">
        <button 
          onClick={() => setShowRequestModal(false)}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button 
          onClick={handleCreateMaterialRequest}
          className="btn btn-primary"
          disabled={creatingRequest}
        >
          {creatingRequest ? 'Sending...' : 'Send Request'}
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 2. Manufacturing: Material Requests Page

### File: `client/src/pages/manufacturing/MaterialRequestsPage.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { FaEye, FaArrowRight, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MaterialRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    project_name: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, filters]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/project-material-requests?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setRequests(data.requests);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      } else {
        toast.error('Failed to fetch material requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch material requests');
    } finally {
      setLoading(false);
    }
  };

  const handleForwardToInventory = async (requestId) => {
    const notes = prompt('Add notes for inventory team (optional):');
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/project-material-requests/${requestId}/forward-to-inventory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            manufacturing_notes: notes || ''
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Request forwarded to inventory department');
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to forward request');
      }
    } catch (error) {
      console.error('Error forwarding request:', error);
      toast.error('Failed to forward request');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'badge-warning',
      reviewed: 'badge-info',
      forwarded_to_inventory: 'badge-primary',
      stock_available: 'badge-success',
      partial_available: 'badge-warning',
      stock_unavailable: 'badge-danger',
      materials_reserved: 'badge-success',
      completed: 'badge-success'
    };

    return (
      <span className={`badge ${statusColors[status] || 'badge-secondary'}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      low: 'badge-secondary',
      medium: 'badge-info',
      high: 'badge-warning',
      urgent: 'badge-danger'
    };

    return (
      <span className={`badge ${priorityColors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="material-requests-page">
      <div className="page-header">
        <h1>Project Material Requests</h1>
        <p>Review and forward material requests to inventory department</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="form-control"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="forwarded_to_inventory">Forwarded to Inventory</option>
            <option value="stock_available">Stock Available</option>
            <option value="materials_reserved">Materials Reserved</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="form-control"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Project Name</label>
          <input
            type="text"
            value={filters.project_name}
            onChange={(e) => setFilters({ ...filters, project_name: e.target.value })}
            className="form-control"
            placeholder="Search by project name..."
          />
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Request #</th>
                <th>Project Name</th>
                <th>PO Number</th>
                <th>Total Items</th>
                <th>Total Value</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    No material requests found
                  </td>
                </tr>
              ) : (
                requests.map(request => (
                  <tr key={request.id}>
                    <td>{request.request_number}</td>
                    <td>{request.project_name}</td>
                    <td>{request.purchaseOrder?.po_number}</td>
                    <td>{request.total_items}</td>
                    <td>₹{request.total_value.toLocaleString()}</td>
                    <td>{getPriorityBadge(request.priority)}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>{new Date(request.request_date).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/manufacturing/material-requests/${request.id}`)}
                        className="btn btn-sm btn-info"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      
                      {(request.status === 'pending' || request.status === 'reviewed') && (
                        <button
                          onClick={() => handleForwardToInventory(request.id)}
                          className="btn btn-sm btn-primary ml-2"
                          title="Forward to Inventory"
                        >
                          <FaArrowRight />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.pages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MaterialRequestsPage;
```

---

## 3. Inventory: Material Requests Page

### File: `client/src/pages/inventory/MaterialRequestsPage.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaSearch, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const InventoryMaterialRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAvailability, setStockAvailability] = useState([]);
  const [checkingStock, setCheckingStock] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/project-material-requests?status=forwarded_to_inventory`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setRequests(data.requests);
      } else {
        toast.error('Failed to fetch material requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch material requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStock = async (request) => {
    setCheckingStock(true);
    setSelectedRequest(request);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/project-material-requests/${request.id}/check-stock`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Stock availability checked successfully');
        setStockAvailability(data.stockAvailability);
        setShowStockModal(true);
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to check stock');
      }
    } catch (error) {
      console.error('Error checking stock:', error);
      toast.error('Failed to check stock');
    } finally {
      setCheckingStock(false);
    }
  };

  const handleReserveMaterials = async (requestId, inventoryIds) => {
    const notes = prompt('Add notes for manufacturing team (optional):');
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/project-material-requests/${requestId}/reserve-materials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            inventory_notes: notes || '',
            inventory_ids: inventoryIds
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Materials reserved successfully');
        setShowStockModal(false);
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to reserve materials');
      }
    } catch (error) {
      console.error('Error reserving materials:', error);
      toast.error('Failed to reserve materials');
    }
  };

  return (
    <div className="inventory-material-requests-page">
      <div className="page-header">
        <h1>Material Requests from Manufacturing</h1>
        <p>Check stock availability and reserve materials for projects</p>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="requests-grid">
          {requests.length === 0 ? (
            <div className="empty-state">
              <p>No pending material requests</p>
            </div>
          ) : (
            requests.map(request => (
              <div key={request.id} className="request-card">
                <div className="card-header">
                  <h3>{request.request_number}</h3>
                  <span className={`badge badge-${request.priority}`}>
                    {request.priority.toUpperCase()}
                  </span>
                </div>

                <div className="card-body">
                  <p><strong>Project:</strong> {request.project_name}</p>
                  <p><strong>PO:</strong> {request.purchaseOrder?.po_number}</p>
                  <p><strong>Total Items:</strong> {request.total_items}</p>
                  <p><strong>Total Value:</strong> ₹{request.total_value.toLocaleString()}</p>
                  
                  {request.manufacturing_notes && (
                    <div className="notes-box">
                      <strong>Manufacturing Notes:</strong>
                      <p>{request.manufacturing_notes}</p>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <button
                    onClick={() => navigate(`/inventory/material-requests/${request.id}`)}
                    className="btn btn-info"
                  >
                    <FaEye /> View Details
                  </button>
                  
                  {request.status === 'forwarded_to_inventory' && (
                    <button
                      onClick={() => handleCheckStock(request)}
                      className="btn btn-primary"
                      disabled={checkingStock}
                    >
                      <FaSearch /> Check Stock
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Stock Availability Modal */}
      {showStockModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Stock Availability - {selectedRequest.request_number}</h3>
              <button onClick={() => setShowStockModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <table className="table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Color</th>
                    <th>Requested Qty</th>
                    <th>Available Qty</th>
                    <th>Shortage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockAvailability.map((item, index) => (
                    <tr key={index}>
                      <td>{item.material_name}</td>
                      <td>{item.color}</td>
                      <td>{item.requested_qty} {item.uom}</td>
                      <td>{item.available_qty} {item.uom}</td>
                      <td>{item.shortage_qty} {item.uom}</td>
                      <td>
                        <span className={`badge badge-${
                          item.status === 'available' ? 'success' :
                          item.status === 'partial' ? 'warning' : 'danger'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowStockModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              
              {stockAvailability.some(item => item.status !== 'unavailable') && (
                <button
                  onClick={() => {
                    const inventoryIds = stockAvailability
                      .flatMap(item => item.inventory_items?.map(inv => inv.id) || []);
                    handleReserveMaterials(selectedRequest.id, inventoryIds);
                  }}
                  className="btn btn-success"
                >
                  <FaLock /> Reserve Available Materials
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryMaterialRequestsPage;
```

---

## 4. Add Routes to App.jsx

```jsx
import MaterialRequestsPage from './pages/manufacturing/MaterialRequestsPage';
import InventoryMaterialRequestsPage from './pages/inventory/MaterialRequestsPage';

// In your routes section:
<Route path="/manufacturing/material-requests" element={<MaterialRequestsPage />} />
<Route path="/inventory/material-requests" element={<InventoryMaterialRequestsPage />} />
```

---

## 5. Add Navigation Links

### Manufacturing Sidebar
```jsx
<NavLink to="/manufacturing/material-requests">
  <FaClipboardList /> Material Requests
</NavLink>
```

### Inventory Sidebar
```jsx
<NavLink to="/inventory/material-requests">
  <FaClipboardList /> Material Requests
</NavLink>
```

---

## Styling (Add to your CSS)

```css
/* Material Requests Page */
.material-requests-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.filters-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  flex: 1;
}

.filter-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.request-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.card-body {
  padding: 15px;
}

.card-body p {
  margin-bottom: 10px;
}

.notes-box {
  margin-top: 15px;
  padding: 10px;
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  border-radius: 4px;
}

.card-footer {
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success { background: #28a745; color: white; }
.badge-warning { background: #ffc107; color: black; }
.badge-danger { background: #dc3545; color: white; }
.badge-info { background: #17a2b8; color: white; }
.badge-primary { background: #007bff; color: white; }
.badge-secondary { background: #6c757d; color: white; }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.modal-header button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.info-box {
  margin-top: 15px;
  padding: 15px;
  background: #e7f3ff;
  border-left: 3px solid #007bff;
  border-radius: 4px;
}

.info-box ul {
  margin: 10px 0 0 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #6c757d;
}
```

---

## Testing Checklist

- [ ] Procurement can create material request from PO
- [ ] Manufacturing receives notification
- [ ] Manufacturing can view request list
- [ ] Manufacturing can forward to inventory
- [ ] Inventory receives notification
- [ ] Inventory can check stock availability
- [ ] Stock availability displays correctly
- [ ] Inventory can reserve materials
- [ ] Status updates correctly
- [ ] All badges display correct colors
- [ ] Modals open and close properly
- [ ] Error messages display correctly
- [ ] Success messages display correctly

---

## API Reference

See `PROJECT_MATERIAL_REQUEST_WORKFLOW.md` for complete API documentation.

---

**Ready to implement!** Follow the steps above and you'll have the complete Project Material Request workflow working on the frontend.