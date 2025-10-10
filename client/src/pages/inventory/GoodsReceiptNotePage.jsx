import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus, FaEye, FaEdit, FaTrash, FaCheck, FaSearch, FaFilter, FaDownload, FaUpload,
  FaClipboardList, FaTruck, FaBox, FaCheckCircle, FaExclamationTriangle, FaClock,
  FaArrowRight, FaTimes
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const GoodsReceiptNotePage = () => {
  const navigate = useNavigate();
  const [grns, setGrns] = useState([]);
  const [pendingPOs, setPendingPOs] = useState([]);
  const [mrnRequests, setMrnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInspectDialog, setShowInspectDialog] = useState(false);
  const [showMrnDetailModal, setShowMrnDetailModal] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [selectedMRN, setSelectedMRN] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mrnStatusFilter, setMrnStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [mrnPagination, setMrnPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [activeTab, setActiveTab] = useState('mrn'); // 'mrn', 'pending', 'grns'

  // Form states
  const [newGRN, setNewGRN] = useState({
    purchase_order_id: '',
    bill_of_materials_id: '',
    sales_order_id: '',
    received_date: new Date().toISOString().split('T')[0],
    supplier_name: '',
    supplier_invoice_number: '',
    inward_challan_number: '',
    items_received: [],
    total_received_value: 0,
    inspection_notes: '',
    remarks: '',
    attachments: []
  });

  const [verificationForm, setVerificationForm] = useState({
    verification_status: 'verified',
    verification_notes: ''
  });

  useEffect(() => {
    fetchGRNs();
    fetchPendingPOs();
    fetchMRNRequests();
  }, [pagination.page, statusFilter, mrnPagination.page, mrnStatusFilter]);

  const fetchPendingPOs = async () => {
    try {
      const response = await api.get('/inventory/grn-requests');
      setPendingPOs(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching pending POs:', error);
    }
  };

  const fetchMRNRequests = async () => {
    try {
      const params = new URLSearchParams({
        page: mrnPagination.page,
        limit: mrnPagination.limit,
        ...(mrnStatusFilter !== 'all' && { status: mrnStatusFilter })
      });

      const response = await api.get(`/project-material-requests?${params}`);
      setMrnRequests(response.data.requests || []);
      setMrnPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching MRN requests:', error);
      toast.error('Failed to load material requests');
    }
  };

  const fetchGRNs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusFilter })
      });

      const response = await api.get(`/grn?${params}`);
      setGrns(response.data.grns);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching GRNs:', error);
    } finally {
      setLoading(false);
    }
  };

  // GRN creation is now automatic via approval workflow
  // This function is no longer used in the new workflow

  const handleVerifyGRN = async () => {
    try {
      await api.post(`/grn/${selectedGRN.id}/verify`, {
        verification_status: verificationForm.verification_status,
        verification_notes: verificationForm.verification_notes
      });
      setShowInspectDialog(false);
      setSelectedGRN(null);
      setVerificationForm({ verification_status: 'verified', verification_notes: '' });
      fetchGRNs();
    } catch (error) {
      console.error('Error verifying GRN:', error);
    }
  };

  const handleAddToInventory = async (grnId) => {
    if (window.confirm('Are you sure you want to add this GRN to inventory? This will create inventory entries.')) {
      try {
        await api.post(`/grn/${grnId}/add-to-inventory`);
        fetchGRNs();
      } catch (error) {
        console.error('Error adding GRN to inventory:', error);
      }
    }
  };

  const handleDeleteGRN = async (grnId) => {
    if (window.confirm('Are you sure you want to delete this GRN?')) {
      try {
        await api.delete(`/grn/${grnId}`);
        fetchGRNs();
      } catch (error) {
        console.error('Error deleting GRN:', error);
      }
    }
  };

  // MRN Functions
  const viewMRNDetails = async (mrnId) => {
    try {
      const response = await api.get(`/project-material-requests/${mrnId}`);
      setSelectedMRN(response.data);
      setShowMrnDetailModal(true);
    } catch (error) {
      console.error('Error fetching MRN details:', error);
      toast.error('Failed to load MRN details');
    }
  };

  const acceptMRNRequest = async (mrnId) => {
    if (window.confirm('Are you sure you want to accept this MRN request? This will convert it to a GRN with all requested quantities marked as received.')) {
      try {
        // First fetch the MRN to get its items
        const mrnResponse = await api.get(`/project-material-requests/${mrnId}`);
        const mrn = mrnResponse.data;

        // Prepare items_received array (assume all quantities are received)
        const items_received = mrn.items.map((item, index) => ({
          item_index: index,
          received_qty: parseFloat(item.quantity),
          weight: null, // Can be added later if needed
          remarks: ''
        }));

        // Create GRN from MRN with the prepared data
        const grnData = {
          received_date: new Date().toISOString().split('T')[0],
          inward_challan_number: null,
          supplier_invoice_number: null,
          items_received: items_received,
          remarks: `Auto-generated from MRN ${mrn.request_number}`,
          attachments: []
        };

        const response = await api.post(`/grn/from-mrn/${mrnId}`, grnData);

        toast.success('MRN accepted and converted to GRN successfully');
        fetchMRNRequests(); // Refresh MRN list (this MRN should disappear)
        fetchGRNs(); // Refresh GRN list (new GRN should appear)
        setShowMrnDetailModal(false);
        setSelectedMRN(null);
      } catch (error) {
        console.error('Error accepting MRN:', error);
        toast.error('Failed to accept MRN request');
      }
    }
  };

  const rejectMRNRequest = async (mrnId, reason) => {
    try {
      await api.patch(`/project-material-requests/${mrnId}/status`, {
        status: 'rejected',
        rejection_reason: reason
      });

      toast.success('MRN rejected successfully');
      fetchMRNRequests();
      setShowMrnDetailModal(false);
      setSelectedMRN(null);
    } catch (error) {
      console.error('Error rejecting MRN:', error);
      toast.error('Failed to reject MRN request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      received: 'bg-blue-100 text-blue-700',
      verified: 'bg-purple-100 text-purple-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getMRNStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: <FaClock />, text: 'Pending Review' },
      reviewed: { color: 'bg-blue-100 text-blue-700', icon: <FaCheckCircle />, text: 'Reviewed' },
      forwarded_to_inventory: { color: 'bg-purple-100 text-purple-700', icon: <FaBox />, text: 'Forwarded to Inventory' },
      stock_checking: { color: 'bg-indigo-100 text-indigo-700', icon: <FaClock />, text: 'Checking Stock' },
      stock_available: { color: 'bg-green-100 text-green-700', icon: <FaCheckCircle />, text: 'Stock Available' },
      partial_available: { color: 'bg-orange-100 text-orange-700', icon: <FaExclamationTriangle />, text: 'Partial Stock' },
      stock_unavailable: { color: 'bg-red-100 text-red-700', icon: <FaExclamationTriangle />, text: 'Stock Unavailable' },
      materials_reserved: { color: 'bg-emerald-100 text-emerald-700', icon: <FaCheckCircle />, text: 'Materials Reserved' },
      materials_issued: { color: 'bg-teal-100 text-teal-700', icon: <FaCheckCircle />, text: 'Materials Issued' },
      completed: { color: 'bg-gray-100 text-gray-700', icon: <FaCheckCircle />, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-700', icon: <FaExclamationTriangle />, text: 'Cancelled' },
      accepted: { color: 'bg-green-100 text-green-700', icon: <FaCheckCircle />, text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-700', icon: <FaExclamationTriangle />, text: 'Rejected' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${badge.color}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const getMRNPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Goods Receipt & Material Requests</h1>
            <p className="text-gray-600">Manage material requests (MRN) and receipts (GRN) in one place</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/inventory/grn/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> Create GRN
            </button>
            <button
              onClick={() => navigate('/procurement/material-requests')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FaClipboardList /> View All MRNs
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('mrn')}
              className={`px-4 py-2 font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === 'mrn'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <FaClipboardList className="w-4 h-4" />
              Material Requests (MRN)
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                {mrnRequests.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <FaClock className="w-4 h-4" />
              Pending GRN Approvals
              <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">
                {pendingPOs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('grns')}
              className={`px-4 py-2 font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === 'grns'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <FaTruck className="w-4 h-4" />
              Goods Receipt Notes (GRN)
              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                {grns.length}
              </span>
            </button>
          </div>
        </div>

        {/* MRN Tab */}
        {activeTab === 'mrn' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-blue-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FaClipboardList className="w-5 h-5" />
                Material Requests (MRN)
              </h3>
              <p className="text-sm text-gray-600 mt-1">Review and approve material requests from manufacturing</p>
            </div>

            {/* MRN Filters */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <select
                    value={mrnStatusFilter}
                    onChange={(e) => setMrnStatusFilter(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="forwarded_to_inventory">Forwarded to Inventory</option>
                    <option value="stock_checking">Checking Stock</option>
                    <option value="stock_available">Stock Available</option>
                    <option value="materials_reserved">Materials Reserved</option>
                    <option value="materials_issued">Materials Issued</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search MRNs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRN Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mrnRequests
                      .filter(mrn => mrnStatusFilter === 'all' || mrn.status === mrnStatusFilter)
                      .filter(mrn => !searchTerm ||
                        mrn.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        mrn.project_name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((mrn) => (
                        <tr key={mrn.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {mrn.request_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {mrn.project_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(mrn.request_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getMRNPriorityBadge(mrn.priority)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getMRNStatusBadge(mrn.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {mrn.total_items}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{mrn.total_value?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => viewMRNDetails(mrn.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              {(mrn.status === 'pending' || mrn.status === 'reviewed' || mrn.status === 'forwarded_to_inventory') && (
                                <>
                                  <button
                                    onClick={() => acceptMRNRequest(mrn.id)}
                                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                                    title="Accept & Convert to GRN"
                                  >
                                    <FaCheckCircle className="w-3 h-3" /> Accept
                                  </button>
                                  <button
                                    onClick={() => rejectMRNRequest(mrn.id, 'Not approved by inventory')}
                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                                    title="Reject Request"
                                  >
                                    <FaTimes className="w-3 h-3" /> Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    {mrnRequests.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                          No material requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pending POs Tab */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-blue-50">
              <h3 className="font-semibold text-gray-900">Purchase Orders Awaiting GRN Creation</h3>
              <p className="text-sm text-gray-600 mt-1">These purchase orders have been approved and are ready for goods receipt</p>
            </div>
            {loading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Delivery</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingPOs.map((po) => (
                      <tr key={po.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.po_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.vendor_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {po.po_date ? new Date(po.po_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{po.items_count || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{po.total_amount?.toLocaleString() || '0'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/inventory/grn/create?po_id=${po.po_id}`)}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                              title="Create GRN"
                            >
                              <FaPlus className="w-3 h-3" /> Create GRN
                            </button>
                            <button
                              onClick={() => navigate(`/procurement/purchase-orders/${po.po_id}`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View PO"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingPOs.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          No purchase orders awaiting GRN creation
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* GRNs Tab */}
        {activeTab === 'grns' && (
          <>
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search GRNs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="received">Received</option>
                  <option value="verified">Verified</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* GRN List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GRN #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grns.map((grn) => (
                      <tr key={grn.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grn.grn_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grn.purchaseOrder?.po_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grn.supplier_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(grn.received_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(grn.status)}`}>
                            {grn.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{grn.total_received_value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedGRN(grn)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            {grn.status === 'draft' && (
                              <button
                                onClick={() => navigate(`/inventory/grn/update/${grn.id}`)}
                                className="text-orange-600 hover:text-orange-900"
                                title="Update Received Quantities"
                              >
                                <FaEdit />
                              </button>
                            )}
                            {grn.status === 'received' && (
                              <button
                                onClick={() => {
                                  setSelectedGRN(grn);
                                  setShowInspectDialog(true);
                                }}
                                className="text-purple-600 hover:text-purple-900"
                                title="Verify"
                              >
                                <FaCheck />
                              </button>
                            )}
                            {(grn.status === 'verified' || grn.status === 'approved') && !grn.inventory_added && (
                              <button
                                onClick={() => handleAddToInventory(grn.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Add to Inventory"
                              >
                                <FaUpload />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteGRN(grn.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">Page {pagination.page} of {pagination.pages}</span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
          </>
        )}

        {/* Create GRN Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create Goods Receipt Note</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Purchase Order ID"
                  value={newGRN.purchase_order_id}
                  onChange={(e) => setNewGRN(prev => ({ ...prev, purchase_order_id: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Bill of Materials ID"
                  value={newGRN.bill_of_materials_id}
                  onChange={(e) => setNewGRN(prev => ({ ...prev, bill_of_materials_id: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Sales Order ID"
                  value={newGRN.sales_order_id}
                  onChange={(e) => setNewGRN(prev => ({ ...prev, sales_order_id: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="date"
                  value={newGRN.received_date}
                  onChange={(e) => setNewGRN(prev => ({ ...prev, received_date: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Supplier Name"
                  value={newGRN.supplier_name}
                  onChange={(e) => setNewGRN(prev => ({ ...prev, supplier_name: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Supplier Invoice Number"
                  value={newGRN.supplier_invoice_number}
                  onChange={(e) => setNewGRN(prev => ({ ...prev, supplier_invoice_number: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Inward Challan Number"
                  value={newGRN.inward_challan_number}
                  onChange={(e) => setNewGRN(prev => ({ ...prev, inward_challan_number: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Total Received Value"
                  value={newGRN.total_received_value}
                  onChange={(e) => setNewGRN(prev => ({ ...prev, total_received_value: parseFloat(e.target.value) || 0 }))}
                  className="border rounded px-3 py-2"
                />
              </div>
              <textarea
                placeholder="Inspection Notes"
                value={newGRN.inspection_notes}
                onChange={(e) => setNewGRN(prev => ({ ...prev, inspection_notes: e.target.value }))}
                className="w-full border rounded px-3 py-2 mb-4"
                rows="3"
              />
              <textarea
                placeholder="Remarks"
                value={newGRN.remarks}
                onChange={(e) => setNewGRN(prev => ({ ...prev, remarks: e.target.value }))}
                className="w-full border rounded px-3 py-2 mb-4"
                rows="2"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGRN}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create GRN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verify GRN Dialog */}
        {showInspectDialog && selectedGRN && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Verify GRN - {selectedGRN.grn_number}</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={verificationForm.verification_status}
                  onChange={(e) => setVerificationForm(prev => ({ ...prev, verification_status: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Verification Notes</label>
                <textarea
                  value={verificationForm.verification_notes}
                  onChange={(e) => setVerificationForm(prev => ({ ...prev, verification_notes: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowInspectDialog(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyGRN}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Submit Verification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View GRN Details Dialog */}
        {selectedGRN && !showInspectDialog && !showCreateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">GRN Details - {selectedGRN.grn_number}</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><strong>PO Number:</strong> {selectedGRN.purchaseOrder?.po_number}</div>
                <div><strong>Supplier:</strong> {selectedGRN.supplier_name}</div>
                <div><strong>Received Date:</strong> {new Date(selectedGRN.received_date).toLocaleDateString()}</div>
                <div><strong>Status:</strong> <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedGRN.status)}`}>{selectedGRN.status}</span></div>
                <div><strong>Total Value:</strong> ₹{selectedGRN.total_received_value}</div>
                <div><strong>Created By:</strong> {selectedGRN.creator?.name}</div>
              </div>

              <h3 className="font-bold mb-2">Items Received</h3>
              <div className="border rounded mb-4">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Material</th>
                      <th className="px-4 py-2 text-left">Ordered Qty</th>
                      <th className="px-4 py-2 text-left">Received Qty</th>
                      <th className="px-4 py-2 text-left">Unit</th>
                      <th className="px-4 py-2 text-left">Quality Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGRN.items_received?.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item.material_name}</td>
                        <td className="px-4 py-2">{item.ordered_quantity}</td>
                        <td className="px-4 py-2">{item.received_quantity}</td>
                        <td className="px-4 py-2">{item.unit}</td>
                        <td className="px-4 py-2">{item.quality_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedGRN.inspection_notes && (
                <div className="mb-4">
                  <strong>Inspection Notes:</strong>
                  <p className="mt-1 text-gray-600">{selectedGRN.inspection_notes}</p>
                </div>
              )}

              {selectedGRN.remarks && (
                <div className="mb-4">
                  <strong>Remarks:</strong>
                  <p className="mt-1 text-gray-600">{selectedGRN.remarks}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedGRN(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MRN Detail Modal */}
        {showMrnDetailModal && selectedMRN && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">MRN Details - {selectedMRN.request_number}</h2>
                <button
                  onClick={() => setShowMrnDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><strong>Project:</strong> {selectedMRN.project_name}</div>
                <div><strong>Request Date:</strong> {new Date(selectedMRN.request_date).toLocaleDateString()}</div>
                <div><strong>Priority:</strong> {getMRNPriorityBadge(selectedMRN.priority)}</div>
                <div><strong>Status:</strong> {getMRNStatusBadge(selectedMRN.status)}</div>
                <div><strong>Total Items:</strong> {selectedMRN.total_items}</div>
                <div><strong>Total Value:</strong> ₹{selectedMRN.total_value?.toLocaleString() || '0'}</div>
                {selectedMRN.requested_by && <div><strong>Requested By:</strong> {selectedMRN.requested_by}</div>}
                {selectedMRN.approved_by && <div><strong>Approved By:</strong> {selectedMRN.approved_by}</div>}
              </div>

              <h3 className="font-bold mb-2">Requested Materials</h3>
              <div className="border rounded mb-4">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Material</th>
                      <th className="px-4 py-2 text-left">Quantity</th>
                      <th className="px-4 py-2 text-left">Unit</th>
                      <th className="px-4 py-2 text-left">Required Date</th>
                      <th className="px-4 py-2 text-left">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMRN.items?.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item.material_name}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{item.unit}</td>
                        <td className="px-4 py-2">{item.required_date ? new Date(item.required_date).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-4 py-2">{item.purpose || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedMRN.notes && (
                <div className="mb-4">
                  <strong>Notes:</strong>
                  <p className="mt-1 text-gray-600">{selectedMRN.notes}</p>
                </div>
              )}

              {selectedMRN.status === 'rejected' && selectedMRN.rejection_reason && (
                <div className="mb-4">
                  <strong>Rejection Reason:</strong>
                  <p className="mt-1 text-red-600">{selectedMRN.rejection_reason}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {(selectedMRN.status === 'pending' || selectedMRN.status === 'reviewed' || selectedMRN.status === 'forwarded_to_inventory') && (
                  <>
                    <button
                      onClick={() => acceptMRNRequest(selectedMRN.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                    >
                      <FaCheckCircle /> Accept & Convert to GRN
                    </button>
                    <button
                      onClick={() => rejectMRNRequest(selectedMRN.id, 'Not approved by inventory')}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                    >
                      <FaTimes /> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowMrnDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoodsReceiptNotePage;