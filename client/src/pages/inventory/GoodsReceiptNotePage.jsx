import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaTrash, FaCheck, FaSearch, FaFilter, FaDownload, FaUpload } from 'react-icons/fa';
import api from '../../utils/api';

const GoodsReceiptNotePage = () => {
  const navigate = useNavigate();
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInspectDialog, setShowInspectDialog] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });

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
  }, [pagination.page, statusFilter]);

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Goods Receipt Notes</h1>
            <p className="text-gray-600">Manage material receipts and inventory updates</p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Create GRN
          </button>
        </div>

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
                            {(grn.status === 'verified' || grn.status === 'approved') && (
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
      </div>
    </div>
  );
};

export default GoodsReceiptNotePage;