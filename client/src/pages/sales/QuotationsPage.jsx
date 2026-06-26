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
      {showViewModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Quotation details</h2>
              <button onClick={() => { setShowViewModal(false); setSelectedQuotation(null); }} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 block">Quotation Number</span>
                  <span className="font-semibold text-gray-800">{selectedQuotation.quotation_number}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">RFQ Reference</span>
                  <span className="font-semibold text-gray-800">{selectedQuotation.rfq_no || 'N/A'} (version {selectedQuotation.rfq_version || 'V1'})</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 block">Customer Name</span>
                  <span className="font-semibold text-gray-800">{selectedQuotation.customer_name}</span>
                </div>
                {selectedQuotation.quotation_type === 'Received' && (
                  <div>
                    <span className="text-gray-500 block">Vendor Name</span>
                    <span className="font-semibold text-gray-800 text-blue-600">{selectedQuotation.vendor_name}</span>
                  </div>
                )}
              </div>
              <div>
                <span className="text-gray-500 block">Product / Service Name</span>
                <span className="font-semibold text-gray-800">{selectedQuotation.product_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-100 py-3 my-2">
                <div>
                  <span className="text-gray-500 block text-xs uppercase">Qty</span>
                  <span className="font-semibold text-gray-800">{selectedQuotation.quantity} Pcs</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase">Unit Rate</span>
                  <span className="font-semibold text-gray-800">₹{parseFloat(selectedQuotation.unit_price).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase">Base Amount</span>
                  <span className="font-semibold text-gray-800">₹{parseFloat(selectedQuotation.total_amount).toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount ({selectedQuotation.discount_percentage}%)</span>
                  <span className="font-semibold text-gray-800">-₹{parseFloat(selectedQuotation.discount_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GST ({selectedQuotation.tax_percentage}%)</span>
                  <span className="font-semibold text-gray-800">+₹{parseFloat(selectedQuotation.tax_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-base text-gray-900">
                  <span>Grand Total</span>
                  <span>₹{parseFloat(selectedQuotation.final_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              {selectedQuotation.valid_until && (
                <div>
                  <span className="text-gray-500 block">Valid Until</span>
                  <span className="font-semibold text-gray-800">{new Date(selectedQuotation.valid_until).toLocaleDateString()}</span>
                </div>
              )}
              {selectedQuotation.remarks && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-500 block text-xs uppercase font-semibold mb-1">Remarks / Terms</span>
                  <span className="text-gray-700">{selectedQuotation.remarks}</span>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => { setShowViewModal(false); setSelectedQuotation(null); }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
