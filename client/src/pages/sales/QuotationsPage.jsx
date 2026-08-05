import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaEye, FaFilePdf, FaEnvelope, FaWhatsapp,
  FaPlus, FaCheck, FaTimes, FaExchangeAlt, FaShoppingCart,
  FaFileInvoiceDollar, FaTrash
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const QuotationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sent'); // 'sent' or 'received'
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddReceivedModal, setShowAddReceivedModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [viewingVersionSnapshot, setViewingVersionSnapshot] = useState(null);
  
  // Form State for new Received Quotation
  const [newReceivedData, setNewReceivedData] = useState({
    vendor_id: '',
    rfq_no: '',
    rfq_version: 'V1',
    product_name: '',
    quantity: '1',
    unit_price: '',
    discount_percentage: '0',
    tax_percentage: '18',
    remarks: '',
    valid_until: ''
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quotations', {
        params: {
          type: activeTab === 'sent' ? 'Sent' : 'Received',
          search: searchQuery || undefined,
          status: statusFilter || undefined
        }
      });
      setQuotations(res.data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await api.get('/procurement/vendors');
      setVendors(res.data.vendors || res.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, searchQuery, statusFilter]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleCreateReceivedQuotation = async (e) => {
    e.preventDefault();
    if (!newReceivedData.vendor_id) return toast.error('Vendor is required');
    if (!newReceivedData.unit_price || parseFloat(newReceivedData.unit_price) <= 0) {
      return toast.error('Price must be a positive number');
    }

    try {
      await api.post('/quotations/received', newReceivedData);
      toast.success('Received quotation created successfully!');
      setShowAddReceivedModal(false);
      // Reset form
      setNewReceivedData({
        vendor_id: '',
        rfq_no: '',
        rfq_version: 'V1',
        product_name: '',
        quantity: '1',
        unit_price: '',
        discount_percentage: '0',
        tax_percentage: '18',
        remarks: '',
        valid_until: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error adding received quotation:', error);
      toast.error(error.response?.data?.message || 'Failed to create received quotation');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/quotations/${id}/status`, { status });
      toast.success(`Quotation updated to ${status}`);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update quotation');
    }
  };

  const handleDeleteQuotation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await api.delete(`/quotations/${id}`);
      toast.success('Quotation deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast.error('Failed to delete quotation');
    }
  };

  const handleCreateQuotationRevision = async (quotationId) => {
    const remarks = prompt("Enter revision reason / remarks (e.g. Price Updated):");
    if (remarks === null) return;
    try {
      await api.post(`/quotations/${quotationId}/revision`, { remarks });
      toast.success("Quotation revised successfully. Status set to Pending.");
      setShowViewModal(false);
      setSelectedQuotation(null);
      setViewingVersionSnapshot(null);
      fetchData();
    } catch (error) {
      console.error('Error revising quotation:', error);
      toast.error(error.response?.data?.message || 'Failed to revise quotation');
    }
  };

  const handleSendEmail = async (quotation) => {
    try {
      if (quotation.client_requirement_id) {
        // Trigger RFQ email
        await api.post(`/client-requirements/${quotation.client_requirement_id}/rfq`, {
          rfqItems: [{
            product_name: quotation.product_name,
            quantity: quotation.quantity,
            unit_cost: quotation.unit_price,
            gst_percentage: quotation.tax_percentage,
            discount_percentage: quotation.discount_percentage
          }],
          sendEmail: true
        });
        toast.success('Quotation PDF sent to customer email successfully!');
      } else {
        toast.error('No client requirement linked to this quotation to fetch email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
  };

  const handleSendWhatsApp = (quotation) => {
    const phoneNumber = quotation.clientRequirement?.mobile_number || '';
    if (!phoneNumber) {
      return toast.error('No customer mobile number linked to send WhatsApp.');
    }
    const message = `Hello! Please find your Quotation ${quotation.quotation_number} total amount ₹${parseFloat(quotation.final_amount).toLocaleString('en-IN')}. Thank you!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  // Compare received quotations for same RFQ
  const getCompareList = () => {
    if (!selectedQuotation || !selectedQuotation.rfq_no) return [];
    return quotations.filter(q => q.rfq_no === selectedQuotation.rfq_no && q.quotation_type === 'Received');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFileInvoiceDollar className="text-blue-600" /> Quotations Module
          </h1>
          <p className="text-gray-500 text-sm">Manage client quotations and vendor quotation submissions.</p>
        </div>

        {activeTab === 'received' && (
          <button
            onClick={() => setShowAddReceivedModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
          >
            <FaPlus /> Log Received Quotation
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-sm">
        <button
          onClick={() => { setActiveTab('sent'); setStatusFilter(''); }}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-all ${
            activeTab === 'sent'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent Quotations
        </button>
        <button
          onClick={() => { setActiveTab('received'); setStatusFilter(''); }}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-all ${
            activeTab === 'received'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Received Quotations
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by quote no, RFQ no, customer or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">All Statuses</option>
          {activeTab === 'sent' ? (
            <>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Approved">Approved</option>
              <option value="Converted to SO">Converted to SO</option>
            </>
          ) : (
            <>
              <option value="Received">Received</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </>
          )}
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No quotations found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Quotation No</th>
                  <th className="py-3.5 px-4">RFQ No</th>
                  <th className="py-3.5 px-4">{activeTab === 'sent' ? 'Customer' : 'Vendor'}</th>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">{activeTab === 'sent' ? 'Date' : 'Received Date'}</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-blue-600">{q.quotation_number}</td>
                    <td className="py-4 px-4 text-gray-500">{q.rfq_no || 'N/A'}</td>
                    <td className="py-4 px-4 font-medium">
                      {activeTab === 'sent' ? q.customer_name : q.vendor_name}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">
                        {q.rfq_version || 'V1'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500">
                      {new Date(q.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        q.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        q.status === 'Sent' || q.status === 'Received' ? 'bg-blue-100 text-blue-700' :
                        q.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        q.status === 'Converted to SO' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      ₹{parseFloat(q.final_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-center flex justify-center items-center gap-2">
                      <button
                        onClick={() => { setSelectedQuotation(q); setShowViewModal(true); }}
                        title="View Details"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaEye />
                      </button>

                      {activeTab === 'sent' ? (
                        <>
                          {q.clientRequirement?.rfq_history?.[0]?.pdf_path && (
                            <a
                              href={`http://localhost:5000${q.clientRequirement.rfq_history[q.clientRequirement.rfq_history.length - 1].pdf_path}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Download PDF"
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FaFilePdf />
                            </a>
                          )}
                          <button
                            onClick={() => handleSendEmail(q)}
                            title="Send Email"
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <FaEnvelope />
                          </button>
                          <button
                            onClick={() => handleSendWhatsApp(q)}
                            title="Send WhatsApp"
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <FaWhatsapp />
                          </button>
                          {q.client_requirement_id && (
                            <button
                              onClick={() => navigate(`/sales/client-requirements/${q.client_requirement_id}`)}
                              title="Create Revision"
                              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            >
                              <FaExchangeAlt />
                            </button>
                          )}
                          {q.status !== 'Converted to SO' && (
                            <button
                              onClick={() => navigate('/sales/orders/create', {
                                state: {
                                  fromRequirement: true,
                                  requirementId: q.client_requirement_id,
                                  customerName: q.customer_name,
                                  productName: q.product_name,
                                  quantity: q.quantity,
                                  pricePerPiece: q.unit_price,
                                  gstPercentage: q.tax_percentage,
                                  specialInstructions: `From Quotation: ${q.quotation_number}`
                                }
                              })}
                              title="Convert to Sales Order"
                              className="p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <FaShoppingCart />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setSelectedQuotation(q); setShowCompareModal(true); }}
                            title="Compare Vendor Quotes"
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <FaExchangeAlt />
                          </button>
                          {q.status === 'Received' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(q.id, 'Approved')}
                                title="Approve"
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(q.id, 'Rejected')}
                                title="Reject"
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          {q.status === 'Approved' && (
                            <button
                              onClick={() => navigate('/procurement/purchase-orders/create', {
                                state: {
                                  prefilledVendorId: q.vendor_id,
                                  prefilledProductName: q.product_name,
                                  prefilledQuantity: q.quantity,
                                  prefilledRate: q.unit_price,
                                  prefilledRemarks: `From approved vendor quotation: ${q.quotation_number}`
                                }
                              })}
                              title="Create Purchase Order"
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <FaShoppingCart />
                            </button>
                          )}
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDeleteQuotation(q.id)}
                        title="Delete"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Received Quotation Modal */}
      {showAddReceivedModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Log Received Vendor Quotation</h2>
              <button onClick={() => setShowAddReceivedModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleCreateReceivedQuotation} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Select Vendor *</label>
                <select
                  required
                  value={newReceivedData.vendor_id}
                  onChange={(e) => setNewReceivedData({ ...newReceivedData, vendor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Choose Vendor --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.company_name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">RFQ No Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. RFQ-002-0001"
                    value={newReceivedData.rfq_no}
                    onChange={(e) => setNewReceivedData({ ...newReceivedData, rfq_no: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Version</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. V1"
                    value={newReceivedData.rfq_version}
                    onChange={(e) => setNewReceivedData({ ...newReceivedData, rfq_version: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Product/Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cotton Fabrics 300m"
                  value={newReceivedData.product_name}
                  onChange={(e) => setNewReceivedData({ ...newReceivedData, product_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newReceivedData.quantity}
                    onChange={(e) => setNewReceivedData({ ...newReceivedData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Unit Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    placeholder="Rate per unit"
                    value={newReceivedData.unit_price}
                    onChange={(e) => setNewReceivedData({ ...newReceivedData, unit_price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newReceivedData.discount_percentage}
                    onChange={(e) => setNewReceivedData({ ...newReceivedData, discount_percentage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tax / GST %</label>
                  <input
                    type="number"
                    min="0"
                    value={newReceivedData.tax_percentage}
                    onChange={(e) => setNewReceivedData({ ...newReceivedData, tax_percentage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Validity Date</label>
                  <input
                    type="date"
                    value={newReceivedData.valid_until}
                    onChange={(e) => setNewReceivedData({ ...newReceivedData, valid_until: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Terms & conditions"
                    value={newReceivedData.remarks}
                    onChange={(e) => setNewReceivedData({ ...newReceivedData, remarks: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddReceivedModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                  Save Received Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedQuotation && (() => {
        const displayData = viewingVersionSnapshot || selectedQuotation;
        const isSnapshot = !!viewingVersionSnapshot;
        
        // Parse products list
        const productsList = selectedQuotation.clientRequirement?.products || [
          {
            product_name: displayData.product_name || selectedQuotation.product_name,
            quantity: displayData.quantity || selectedQuotation.quantity,
            unit: 'Pcs',
            unit_cost: displayData.unit_price || selectedQuotation.unit_price,
            discount_percentage: displayData.discount_percentage || selectedQuotation.discount_percentage,
            gst_percentage: displayData.tax_percentage || selectedQuotation.tax_percentage
          }
        ];

        // Format timeline milestones status
        const currentStatus = selectedQuotation.status;
        const timelineSteps = [
          { label: 'Client Requirement', done: true },
          { label: 'RFQ Approved', done: !!selectedQuotation.rfq_no },
          { label: 'Quotation Generated', done: true },
          { label: 'Sent to Customer', done: currentStatus === 'Sent' || currentStatus === 'Approved' || currentStatus === 'Converted to SO' },
          { label: 'Approved', done: currentStatus === 'Approved' || currentStatus === 'Converted to SO' },
          { label: 'Sales Order', done: currentStatus === 'Converted to SO' }
        ];

        // Revision history array helper
        const historyList = selectedQuotation.revision_history || [];

        return (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-fade-in border border-slate-100">
              
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 bg-slate-900 text-white">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold tracking-tight">
                      Quotation Viewer - {displayData.quotation_number}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500 text-white tracking-wider">
                      {displayData.version || 'V1'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      displayData.status === 'Approved' || displayData.status === 'Converted to SO'
                        ? 'bg-emerald-500 text-white'
                        : displayData.status === 'Sent'
                        ? 'bg-blue-600 text-white'
                        : displayData.status === 'Pending'
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}>
                      {displayData.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Created: {new Date(selectedQuotation.createdAt).toLocaleDateString()} | Last Updated: {new Date(selectedQuotation.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedQuotation(null);
                    setViewingVersionSnapshot(null);
                  }}
                  className="text-slate-400 hover:text-white text-2xl font-bold transition"
                >
                  ×
                </button>
              </div>

              {/* Read-Only Mode Banner */}
              {isSnapshot && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex justify-between items-center text-xs text-amber-800">
                  <span className="font-semibold flex items-center gap-1.5">
                    ⚠️ Viewing Read-Only Archive Snapshot of Version {displayData.version} (Sent on {new Date(displayData.date_time).toLocaleString()})
                  </span>
                  <button
                    onClick={() => setViewingVersionSnapshot(null)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded font-bold transition text-[10px] uppercase"
                  >
                    Return to Active Version ({selectedQuotation.version})
                  </button>
                </div>
              )}

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Columns (Col Span 2) */}
                <div className="lg:col-span-2 space-y-5">
                  
                  {/* Customer Information & RFQ Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Customer Info */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2">
                      <h3 className="text-xs font-bold text-slate-800 border-b pb-1.5 uppercase tracking-wider">
                        👤 Customer Details
                      </h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-bold text-slate-800">{selectedQuotation.customer_name}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Contact:</span> <span className="font-semibold text-slate-800">{selectedQuotation.clientRequirement?.contact_person || 'N/A'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="font-semibold text-slate-800">{selectedQuotation.clientRequirement?.email || 'N/A'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Phone:</span> <span className="font-semibold text-slate-800">{selectedQuotation.clientRequirement?.mobile_number || 'N/A'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">GSTIN:</span> <span className="font-mono text-slate-800">{selectedQuotation.clientRequirement?.customer_gstin || 'N/A'}</span></div>
                        <div className="pt-1"><span className="text-slate-500 block">Billing Address:</span> <span className="text-slate-700 font-medium">{selectedQuotation.clientRequirement?.customer_address || 'N/A'}</span></div>
                      </div>
                    </div>

                    {/* RFQ Details */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2">
                      <h3 className="text-xs font-bold text-slate-800 border-b pb-1.5 uppercase tracking-wider">
                        📑 RFQ / Project Info
                      </h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-slate-500">RFQ Ref:</span> <span className="font-bold text-blue-600">{displayData.rfq_no || 'N/A'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">RFQ Version:</span> <span className="font-bold">{displayData.rfq_version || 'V1'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Project Name:</span> <span className="font-semibold text-slate-800">{selectedQuotation.clientRequirement?.project_name || 'N/A'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Requirement No:</span> <span className="font-semibold text-slate-800">{selectedQuotation.clientRequirement?.requirement_number || 'N/A'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">RFQ Approved Date:</span> <span className="font-medium">
                          {selectedQuotation.clientRequirement?.rfq_history?.find(r => r.rfq_number === displayData.rfq_no)?.date 
                            ? new Date(selectedQuotation.clientRequirement.rfq_history.find(r => r.rfq_number === displayData.rfq_no).date).toLocaleDateString() 
                            : 'N/A'}
                        </span></div>
                      </div>
                    </div>

                  </div>

                  {/* Product Details List */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                      <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        📦 Quoted Items Summary
                      </h3>
                    </div>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                          <th className="px-4 py-2.5">Product Name</th>
                          <th className="px-4 py-2.5 text-center">Qty</th>
                          <th className="px-4 py-2.5 text-right">Unit Rate (₹)</th>
                          <th className="px-4 py-2.5 text-right">GST %</th>
                          <th className="px-4 py-2.5 text-right">Discount %</th>
                          <th className="px-4 py-2.5 text-right">Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {productsList.map((item, idx) => {
                          const qty = parseFloat(item.quantity) || 0;
                          const rate = parseFloat(item.unit_cost) || 0;
                          const gst = parseFloat(item.gst_percentage) || 18;
                          const disc = parseFloat(item.discount_percentage) || 0;
                          const base = qty * rate;
                          const discAmt = base * disc / 100;
                          const total = (base - discAmt) * (1 + gst / 100);
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-semibold text-slate-800">{item.product_name}</td>
                              <td className="px-4 py-3 text-center font-bold text-slate-700">{qty} {item.unit || 'Pcs'}</td>
                              <td className="px-4 py-3 text-right font-bold">₹{rate.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right">{gst}%</td>
                              <td className="px-4 py-3 text-right">{disc}%</td>
                              <td className="px-4 py-3 text-right font-extrabold text-blue-600">
                                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Cost Summary & Terms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Cost Summary */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2 text-xs">
                      <h3 className="text-xs font-bold text-slate-800 border-b pb-1.5 uppercase tracking-wider">
                        💰 Financial Breakdown
                      </h3>
                      <div className="flex justify-between text-slate-600">
                        <span>Base Amount:</span>
                        <span className="font-semibold text-slate-800">₹{parseFloat(displayData.total_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Discount ({displayData.discount_percentage || 0}%):</span>
                        <span className="font-semibold text-rose-600">-₹{parseFloat(displayData.discount_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>GST ({displayData.tax_percentage || 18}%):</span>
                        <span className="font-semibold text-slate-800">+₹{parseFloat(displayData.tax_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Freight / Shipping:</span>
                        <span className="font-medium text-slate-400">₹0.00 (Standard)</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm text-blue-800 bg-blue-50/50 p-2 rounded">
                        <span>Grand Total:</span>
                        <span>₹{parseFloat(displayData.final_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2 text-xs">
                      <h3 className="text-xs font-bold text-slate-800 border-b pb-1.5 uppercase tracking-wider">
                        📑 Terms & Conditions
                      </h3>
                      <div className="space-y-1">
                        <div><span className="text-slate-500 font-semibold">Payment Terms:</span> <span className="text-slate-850 font-semibold">{selectedQuotation.clientRequirement?.payment_terms || '50% Advance, 50% Before Dispatch'}</span></div>
                        <div><span className="text-slate-500 font-semibold">Warranty:</span> <span className="text-slate-800">{selectedQuotation.clientRequirement?.dynamic_fields?.warranty || '1 Year Manufacturing Warranty'}</span></div>
                        <div><span className="text-slate-500 font-semibold">Validity:</span> <span className="text-slate-800">{displayData.valid_until ? new Date(displayData.valid_until).toLocaleDateString() : '30 Days'}</span></div>
                        {selectedQuotation.remarks && (
                          <div className="pt-1.5">
                            <span className="text-slate-500 block font-semibold">Remarks/Notes:</span>
                            <p className="text-slate-700 bg-white p-2 rounded border border-slate-200 mt-1 font-medium italic">{displayData.remarks}</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Attachments Section */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2 text-xs">
                    <h3 className="text-xs font-bold text-slate-800 border-b pb-1.5 uppercase tracking-wider">
                      📎 Documents & Reference Attachments
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedQuotation.clientRequirement?.rfq_history?.[selectedQuotation.clientRequirement.rfq_history.length - 1]?.pdf_path ? (
                        <div className="flex justify-between items-center p-2.5 border border-slate-200 rounded bg-white">
                          <div>
                            <span className="font-bold block text-slate-700">RFQ Generated PDF</span>
                            <span className="text-[10px] text-slate-400">Ref: {selectedQuotation.rfq_no}</span>
                          </div>
                          <a
                            href={`http://localhost:5000${selectedQuotation.clientRequirement.rfq_history[selectedQuotation.clientRequirement.rfq_history.length - 1].pdf_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded transition"
                          >
                            <FaFilePdf size={14} />
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-450 italic text-[11px]">No reference attachments available</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Column (Col Span 1) */}
                <div className="space-y-5">

                  {/* Workflow Timeline */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <h3 className="text-xs font-bold text-slate-800 border-b pb-1.5 uppercase tracking-wider mb-3">
                      📍 Workflow Progress
                    </h3>
                    <div className="relative border-l border-slate-300 ml-2 space-y-4 text-xs pb-1">
                      {timelineSteps.map((step, idx) => (
                        <div key={idx} className="relative pl-5">
                          <div className={`absolute -left-1.5 top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                            step.done 
                              ? 'bg-emerald-500 border-emerald-500' 
                              : 'bg-white border-slate-300'
                          }`} />
                          <span className={`font-semibold ${step.done ? 'text-slate-800' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revision History */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 border-b pb-1.5 uppercase tracking-wider">
                      📜 Revision History
                    </h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[9px]">
                            <th className="p-2">Ver</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Sent By</th>
                            <th className="p-2">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {/* Live Current Version Row */}
                          <tr
                            onClick={() => setViewingVersionSnapshot(null)}
                            className={`cursor-pointer hover:bg-slate-50 font-semibold ${
                              !isSnapshot ? 'bg-blue-50/50 text-blue-700' : ''
                            }`}
                          >
                            <td className="p-2">
                              {selectedQuotation.version || 'V1'}
                              {!isSnapshot && <span className="ml-1 text-[8px] bg-blue-600 text-white px-1 py-0.2 rounded font-extrabold uppercase">Live</span>}
                            </td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                                selectedQuotation.status === 'Approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                              }`}>
                                {selectedQuotation.status}
                              </span>
                            </td>
                            <td className="p-2">Admin</td>
                            <td className="p-2">Current</td>
                          </tr>
                          
                          {/* Past Revision History entries */}
                          {historyList.map((h, i) => {
                            const isCurrentViewingThis = viewingVersionSnapshot && viewingVersionSnapshot.version === h.version;
                            return (
                              <tr
                                key={i}
                                onClick={() => setViewingVersionSnapshot(h)}
                                className={`cursor-pointer hover:bg-slate-50 text-slate-600 ${
                                  isCurrentViewingThis ? 'bg-amber-50/80 text-amber-900 font-semibold border-l-2 border-amber-500' : ''
                                }`}
                              >
                                <td className="p-2 font-bold">{h.version}</td>
                                <td className="p-2">
                                  <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[9px] font-semibold uppercase">
                                    {h.status || 'Sent'}
                                  </span>
                                </td>
                                <td className="p-2">{h.created_by || 'Admin'}</td>
                                <td className="p-2">{h.date_time ? new Date(h.date_time).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'N/A'}</td>
                              </tr>
                            );
                          })}

                          {historyList.length === 0 && (
                            <tr>
                              <td colSpan="4" className="p-3 text-center text-slate-400 italic text-[10px]">
                                No revision entries yet. Revisions are created once sent.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
                <div className="flex gap-2">
                  {selectedQuotation.clientRequirement?.rfq_history?.[selectedQuotation.clientRequirement.rfq_history.length - 1]?.pdf_path && (
                    <a
                      href={`http://localhost:5000${selectedQuotation.clientRequirement.rfq_history[selectedQuotation.clientRequirement.rfq_history.length - 1].pdf_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <FaFilePdf /> View PDF
                    </a>
                  )}
                  <button
                    onClick={() => handleSendEmail(selectedQuotation)}
                    className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <FaEnvelope /> Email Quote
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp(selectedQuotation)}
                    className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <FaWhatsapp /> WhatsApp
                  </button>
                </div>

                <div className="flex gap-2">
                  {!isSnapshot && (selectedQuotation.status === 'Sent' || selectedQuotation.status === 'Approved') && (
                    <button
                      onClick={() => handleCreateQuotationRevision(selectedQuotation.id)}
                      className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs transition"
                    >
                      Create Revision
                    </button>
                  )}

                  {!isSnapshot && (selectedQuotation.status === 'Pending' || selectedQuotation.status === 'Sent') && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedQuotation.id, 'Approved')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedQuotation.id, 'Rejected')}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {!isSnapshot && selectedQuotation.status === 'Approved' && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        navigate('/sales/orders/create', {
                          state: {
                            fromRequirement: true,
                            requirementId: selectedQuotation.client_requirement_id,
                            customerName: selectedQuotation.customer_name,
                            productName: selectedQuotation.product_name,
                            quantity: selectedQuotation.quantity,
                            pricePerPiece: selectedQuotation.unit_price,
                            gstPercentage: selectedQuotation.tax_percentage,
                            specialInstructions: `From Quotation: ${selectedQuotation.quotation_number}`
                          }
                        });
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-extrabold text-xs shadow-md transition animate-pulse"
                    >
                      Convert to Sales Order
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedQuotation(null);
                      setViewingVersionSnapshot(null);
                    }}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs transition"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Compare Modal */}
      {showCompareModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Compare Vendor Quotations for {selectedQuotation.rfq_no}</h2>
              <button onClick={() => { setShowCompareModal(false); setSelectedQuotation(null); }} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-left text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Quotation No</th>
                    <th className="p-3 text-center">Version</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3">Discount</th>
                    <th className="p-3">GST %</th>
                    <th className="p-3">Final Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getCompareList().map(c => (
                    <tr key={c.id} className={c.id === selectedQuotation.id ? 'bg-blue-50/30' : ''}>
                      <td className="p-3 font-semibold text-gray-800">{c.vendor_name}</td>
                      <td className="p-3">{c.quotation_number}</td>
                      <td className="p-3 text-center font-bold">{c.rfq_version}</td>
                      <td className="p-3">₹{parseFloat(c.unit_price).toLocaleString()}</td>
                      <td className="p-3">{c.discount_percentage}%</td>
                      <td className="p-3">{c.tax_percentage}%</td>
                      <td className="p-3 font-bold text-gray-900">₹{parseFloat(c.final_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          c.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          c.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {c.status === 'Received' ? (
                          <button
                            onClick={() => { handleUpdateStatus(c.id, 'Approved'); setShowCompareModal(false); }}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold shadow-sm transition-colors"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationsPage;
