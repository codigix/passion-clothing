import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaEye, 
  FaClock, 
  FaCheckCircle, 
  FaBox, 
  FaExclamationTriangle,
  FaBoxOpen,
  FaCalendar,
  FaClipboardList
} from 'react-icons/fa';
import api from '../../utils/api';
import { formatDate, safePath } from '../../utils/procurementFormatters';
import { MATERIAL_REQUEST_STATUS_BADGES, PRIORITY_BADGES } from '../../constants/procurementStatus';
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
      console.error('Error fetching requests:', error);
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
      console.error('Error fetching request details:', error);
      toast.error('Failed to load request details');
    }
  };

  const getStatusBadge = (status) => {
    const badge = MATERIAL_REQUEST_STATUS_BADGES[status] || MATERIAL_REQUEST_STATUS_BADGES.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${badge.color} ${badge.text}`} title={badge.label}>
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badge = PRIORITY_BADGES[priority?.toLowerCase()] || PRIORITY_BADGES.medium;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badge.color} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === statusFilter);

  const getStatusCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      reviewed: requests.filter(r => r.status === 'reviewed').length,
      forwarded_to_inventory: requests.filter(r => r.status === 'forwarded_to_inventory').length,
      stock_available: requests.filter(r => r.status === 'stock_available').length,
      materials_reserved: requests.filter(r => r.status === 'materials_reserved').length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/procurement/dashboard')}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 transition"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Material Requests</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage project material requests</p>
          </div>
        </div>
        <button
          onClick={fetchRequests}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center gap-1.5"
        >
          <FaClipboardList /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        <div className="bg-white p-4 rounded shadow border-l-4 border-gray-400">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
          <div className="text-xs text-gray-600">Total Requests</div>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-yellow-400">
          <div className="text-2xl font-bold text-yellow-700">{statusCounts.pending}</div>
          <div className="text-xs text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-400">
          <div className="text-2xl font-bold text-blue-700">{statusCounts.reviewed}</div>
          <div className="text-xs text-gray-600">Reviewed</div>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-purple-400">
          <div className="text-2xl font-bold text-purple-700">{statusCounts.forwarded_to_inventory}</div>
          <div className="text-xs text-gray-600">Forwarded</div>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-green-400">
          <div className="text-2xl font-bold text-green-700">{statusCounts.stock_available}</div>
          <div className="text-xs text-gray-600">Available</div>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-emerald-400">
          <div className="text-2xl font-bold text-emerald-700">{statusCounts.materials_reserved}</div>
          <div className="text-xs text-gray-600">Reserved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="font-medium text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
          >
            <option value="all">All Requests ({statusCounts.all})</option>
            <option value="pending">Pending ({statusCounts.pending})</option>
            <option value="reviewed">Reviewed ({statusCounts.reviewed})</option>
            <option value="forwarded_to_inventory">Forwarded to Inventory ({statusCounts.forwarded_to_inventory})</option>
            <option value="stock_available">Stock Available ({statusCounts.stock_available})</option>
            <option value="materials_reserved">Materials Reserved ({statusCounts.materials_reserved})</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading material requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <FaBoxOpen className="mx-auto text-gray-400 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">No material requests found</p>
            <p className="text-gray-400 text-sm mt-2">
              {statusFilter === 'all' 
                ? 'Create a material request from a Purchase Order details page'
                : `No requests with status: ${statusFilter.replace(/_/g, ' ')}`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Date</th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition">
                    <td className="px-2 py-2 text-sm font-mono text-blue-600">#{request.id}</td>
                    <td className="px-2 py-2 text-sm font-medium text-gray-900">{request.project_name}</td>
                    <td className="px-2 py-2 text-sm text-gray-600">{request.purchaseOrder?.po_number || 'N/A'}</td>
                    <td className="px-2 py-2">{getPriorityBadge(request.priority)}</td>
                    <td className="px-2 py-2">{getStatusBadge(request.status)}</td>
                    <td className="px-2 py-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FaCalendar className="text-gray-400" />
                        {formatDate(request.required_date)}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => viewDetails(request.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Material Request #{selectedRequest.id}</h2>
                <p className="text-sm text-gray-500 mt-1">Created on {formatDate(selectedRequest.created_at, 'datetime')}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
              >
                ×
              </button>
            </div>

            {/* Request Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 bg-gray-50 p-4 rounded-md">
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Project Name</label>
                <p className="font-medium text-gray-900 mt-1">{selectedRequest.project_name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">PO Number</label>
                <p className="font-medium text-gray-900 mt-1">{selectedRequest.purchaseOrder?.po_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Priority</label>
                <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Status</label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Required Date</label>
                <p className="font-medium text-gray-900 mt-1 flex items-center gap-1.5">
                  <FaCalendar className="text-blue-500" />
                  {formatDate(selectedRequest.required_date)}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Created By</label>
                <p className="font-medium text-gray-900 mt-1">{safePath(selectedRequest, 'creator.name', 'Unknown User')}</p>
              </div>
            </div>

            {/* Materials Requested */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-1.5">
                <FaBox className="text-blue-500" /> Materials Requested
              </h3>
              <div className="border rounded overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                      {selectedRequest.stock_availability && (
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedRequest.materials_requested?.map((material, index) => {
                      const availability = Array.isArray(selectedRequest.stock_availability)
                        ? selectedRequest.stock_availability.find(
                            a => a.product_id === material.product_id
                          )
                        : undefined;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-2 py-2 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-2 py-2 text-sm font-medium text-gray-900">{material.product_name}</td>
                          <td className="px-2 py-2 text-sm text-gray-600">{material.quantity}</td>
                          <td className="px-2 py-2 text-sm text-gray-600">{material.unit}</td>
                          {availability && (
                            <td className="px-2 py-2 text-sm">
                              {availability.is_available ? (
                                <span className="text-green-600 font-medium">✓ Available ({availability.available_quantity})</span>
                              ) : availability.available_quantity > 0 ? (
                                <span className="text-orange-600 font-medium">⚠ Partial ({availability.available_quantity})</span>
                              ) : (
                                <span className="text-red-600 font-medium">✗ Unavailable</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4 mb-4">
              {selectedRequest.procurement_notes && (
                <div>
                  <h3 className="font-semibold text-sm mb-2 text-gray-700">Procurement Notes</h3>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                    {selectedRequest.procurement_notes}
                  </p>
                </div>
              )}
              {selectedRequest.manufacturing_notes && (
                <div>
                  <h3 className="font-semibold text-sm mb-2 text-gray-700">Manufacturing Notes</h3>
                  <p className="text-gray-700 bg-purple-50 p-3 rounded border border-purple-200">
                    {selectedRequest.manufacturing_notes}
                  </p>
                </div>
              )}
              {selectedRequest.inventory_notes && (
                <div>
                  <h3 className="font-semibold text-sm mb-2 text-gray-700">Inventory Notes</h3>
                  <p className="text-gray-700 bg-green-50 p-3 rounded border border-green-200">
                    {selectedRequest.inventory_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Reserved Materials */}
            {selectedRequest.status === 'materials_reserved' && selectedRequest.reserved_inventory_items && selectedRequest.reserved_inventory_items.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-1.5 text-green-600">
                  <FaCheckCircle /> Reserved Materials
                </h3>
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <div className="space-y-3">
                    {selectedRequest.reserved_inventory_items.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-green-300">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Barcode:</span>
                            <span className="ml-2 font-mono font-semibold text-gray-900">{item.barcode}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <span className="ml-2 font-medium text-gray-900">{item.location}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <span className="ml-2 font-medium text-gray-900">{item.quantity} {item.unit}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Product:</span>
                            <span className="ml-2 font-medium text-gray-900">{item.product_name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            {selectedRequest.timeline && selectedRequest.timeline.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-3">Timeline</h3>
                <div className="space-y-2">
                  {selectedRequest.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{event.status.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-gray-500 text-xs">{new Date(event.timestamp).toLocaleString()}</p>
                        {event.notes && <p className="text-gray-600 text-xs mt-1">{event.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full bg-gray-600 text-white px-4 py-3 rounded hover:bg-gray-700 transition font-medium"
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