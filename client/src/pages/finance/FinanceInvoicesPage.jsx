import React, { useState, useEffect } from 'react';
import { Eye, Plus, FileText, Check, AlertCircle, TrendingUp, X, Trash2, ExternalLink, Package, ClipboardList, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const FinanceInvoicesPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [financialRecords, setFinancialRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showInvoiceViewModal, setShowInvoiceViewModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchFinancialRecords();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/finance/invoices-to-process');
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Fetch invoices error:', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialRecords = async () => {
    try {
      const response = await api.get('/finance/financial-records');
      setFinancialRecords(response.data.records || []);
    } catch (error) {
      console.error('Fetch financial records error:', error);
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceViewModal(true);
  };

  const handleViewInvoiceDetails = (invoiceId) => {
    navigate(`/invoice/${invoiceId}`);
  };

  const handleCreateRecord = (invoice) => {
    setSelectedInvoice(invoice);
    setShowRecordModal(true);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleRecordSubmit = async (formData) => {
    try {
      toast.loading('Creating financial record...');
      
      const response = await api.post('/finance/financial-records', {
        invoice_id: selectedInvoice.id,
        ...formData
      });

      toast.dismiss();
      toast.success(`Financial record ${response.data.record.record_number} created successfully!`);
      
      setShowRecordModal(false);
      setSelectedInvoice(null);
      fetchInvoices();
      fetchFinancialRecords();
    } catch (error) {
      toast.dismiss();
      console.error('Create record error:', error);
      toast.error(error.response?.data?.message || 'Failed to create financial record');
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      toast.loading('Deleting invoice...');
      await api.delete(`/finance/invoices/${invoiceId}`);
      toast.dismiss();
      toast.success('Invoice deleted successfully');
      fetchInvoices();
    } catch (error) {
      toast.dismiss();
      console.error('Delete invoice error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this financial record?')) {
      return;
    }

    try {
      toast.loading('Deleting financial record...');
      await api.delete(`/finance/financial-records/${recordId}`);
      toast.dismiss();
      toast.success('Financial record deleted successfully');
      fetchFinancialRecords();
    } catch (error) {
      toast.dismiss();
      console.error('Delete record error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete financial record');
    }
  };

  const statusColors = {
    generated: 'bg-yellow-100 text-yellow-800',
    recorded: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const recordTypeColors = {
    debit: 'bg-blue-100 text-blue-800',
    credit: 'bg-green-100 text-green-800',
    journal_entry: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-gray-600 mt-1">Manage invoices and financial records</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Invoices to Process ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'records'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Financial Records ({financialRecords.length})
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <p className="mt-2 text-gray-600">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
              <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-amber-900">No Invoices to Process</h3>
              <p className="text-amber-700 mt-1">All invoices have been processed</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Invoice #</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Order #</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{invoice.invoice_number}</td>
                      <td className="px-6 py-3 text-gray-600">{invoice.customer?.name}</td>
                      <td className="px-6 py-3 font-semibold text-gray-900">₹{invoice.total_amount?.toLocaleString()}</td>
                      <td className="px-6 py-3 text-gray-600">{invoice.salesOrder?.order_number || 'N/A'}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusColors[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
                          {invoice.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewInvoiceDetails(invoice.id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="View Full Details"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Quick View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleCreateRecord(invoice)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Create Financial Record"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Financial Records Tab */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {financialRecords.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-blue-900">No Financial Records</h3>
              <p className="text-blue-700 mt-1">Create financial records from invoices</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Record #</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Account Head</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Project</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {financialRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{record.record_number}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${recordTypeColors[record.record_type] || 'bg-gray-100 text-gray-800'}`}>
                          {record.record_type?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-900">₹{record.amount?.toLocaleString()}</td>
                      <td className="px-6 py-3 text-gray-600">{record.account_head}</td>
                      <td className="px-6 py-3 text-gray-600">{record.project_name || 'N/A'}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusColors[record.status] || 'bg-gray-100 text-gray-800'}`}>
                          {record.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewRecord(record)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invoice View Modal */}
      {showInvoiceViewModal && selectedInvoice && (
        <InvoiceViewModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceViewModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}

      {/* Create Financial Record Modal */}
      {showRecordModal && selectedInvoice && (
        <FinancialRecordModal
          invoice={selectedInvoice}
          onSubmit={handleRecordSubmit}
          onClose={() => {
            setShowRecordModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}

      {/* Financial Record Details Modal */}
      {showDetailsModal && selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
};

function InvoiceViewModal({ invoice, onClose }) {
  const [activeTab, setActiveTab] = React.useState('details');

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      generated: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-cyan-100 text-cyan-800',
      partial_paid: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      recorded: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-gray-200 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overpaid: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Invoice Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 px-6 pt-4 border-b border-gray-200 overflow-x-auto">
          {['verification', 'details', 'items', 'po', 'payments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'verification' && 'Verification'}
              {tab === 'details' && 'Details'}
              {tab === 'items' && 'Items'}
              {tab === 'po' && 'PO'}
              {tab === 'payments' && 'Payments'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              {/* PO & Invoice Details - Purple */}
              <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                  <h4 className="text-sm font-semibold text-gray-900">PO & Invoice Details</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600">Invoice #</p>
                    <p className="font-semibold">{invoice.invoice_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'partial_paid' ? 'bg-orange-100 text-orange-800' :
                      invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600">PO #</p>
                    <p className="font-semibold">{invoice.purchaseOrder?.po_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Priority</p>
                    <p className="font-semibold">{invoice.purchaseOrder?.priority?.toUpperCase() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Invoice Date</p>
                    <p className="font-semibold">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Due Date</p>
                    <p className="font-semibold">{new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Vendor & Client - Orange */}
              <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                  <h4 className="text-sm font-semibold text-gray-900">Vendor & Client</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600">Vendor</p>
                    <p className="font-semibold">{invoice.purchaseOrder?.vendor?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Customer</p>
                    <p className="font-semibold">{invoice.customer?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Items - Blue */}
              {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 && (
                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <h4 className="text-sm font-semibold text-gray-900">Items ({invoice.items.length})</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-blue-100 border-b border-blue-300">
                        <tr>
                          <th className="px-2 py-1 text-left font-semibold">Item</th>
                          <th className="px-2 py-1 text-right font-semibold">Qty</th>
                          <th className="px-2 py-1 text-right font-semibold">Rate</th>
                          <th className="px-2 py-1 text-right font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-200">
                        {invoice.items.slice(0, 3).map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-2 py-1">{item.product_name || item.name || 'N/A'}</td>
                            <td className="px-2 py-1 text-right">{item.quantity || item.qty || 0}</td>
                            <td className="px-2 py-1 text-right">₹{parseFloat(item.rate || 0).toLocaleString()}</td>
                            <td className="px-2 py-1 text-right font-semibold">₹{(parseFloat(item.amount || 0)).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {invoice.items.length > 3 && (
                    <p className="text-xs text-blue-700 mt-2">+ {invoice.items.length - 3} more items</p>
                  )}
                </div>
              )}

              {/* Financial Details - Green */}
              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <h4 className="text-sm font-semibold text-gray-900">Financial Details</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-semibold">₹{(invoice.subtotal || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tax</p>
                    <p className="font-semibold">₹{(invoice.total_tax_amount || 0).toLocaleString()}</p>
                  </div>
                  {invoice.discount_amount > 0 && (
                    <div>
                      <p className="text-gray-600">Discount</p>
                      <p className="font-semibold">-₹{(invoice.discount_amount || 0).toLocaleString()}</p>
                    </div>
                  )}
                  <div className="bg-green-100 p-2 rounded border border-green-300 col-span-2">
                    <div className="flex justify-between">
                      <p className="text-gray-600 font-medium">Total</p>
                      <p className="font-bold text-green-700">₹{(invoice.total_amount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status - Red */}
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                  <h4 className="text-sm font-semibold text-gray-900">Payment Status</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-semibold">₹{(invoice.total_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Paid</p>
                    <p className="font-semibold text-green-700">₹{(invoice.paid_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Outstanding</p>
                    <p className="font-semibold text-red-700">₹{(invoice.outstanding_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-semibold">{invoice.payment_status?.replace('_', ' ').toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* PO & Invoice Details - Purple */}
              <div className="bg-purple-50 p-4 rounded border border-purple-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">PO & Invoice Details</h4>
                <div className="bg-white p-3 rounded border border-gray-200 text-xs text-gray-700 space-y-1">
                  <p><strong>Invoice #:</strong> {invoice.invoice_number}</p>
                  <p><strong>PO #:</strong> {invoice.purchaseOrder?.po_number || 'N/A'}</p>
                  <p><strong>Status:</strong> {invoice.status?.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Payment Status:</strong> {invoice.payment_status?.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Priority:</strong> {invoice.purchaseOrder?.priority?.toUpperCase() || 'N/A'}</p>
                  <p><strong>Invoice Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                  <p><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Vendor & Client Information - Orange */}
              <div className="bg-orange-50 p-4 rounded border border-orange-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Vendor & Client Information</h4>
                <div className="bg-white p-3 rounded border border-gray-200 text-xs text-gray-700 space-y-1">
                  <p><strong>Vendor Name:</strong> {invoice.purchaseOrder?.vendor?.name || 'N/A'}</p>
                  <p><strong>Vendor Phone:</strong> {invoice.purchaseOrder?.vendor?.phone || 'N/A'}</p>
                  <p><strong>Vendor Email:</strong> {invoice.purchaseOrder?.vendor?.email || 'N/A'}</p>
                  <p><strong>Customer:</strong> {invoice.customer?.name || 'N/A'}</p>
                  <p><strong>Project:</strong> {invoice.purchaseOrder?.project_name || 'N/A'}</p>
                </div>
              </div>

              {/* Billing & Shipping */}
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Billing & Shipping</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2 rounded border border-gray-200 text-gray-700">
                    <p className="font-medium mb-1">Billing Address</p>
                    <p>{invoice.billing_address || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200 text-gray-700">
                    <p className="font-medium mb-1">Shipping Address</p>
                    <p>{invoice.shipping_address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {invoice.purchaseOrder?.advance_payment_percentage && (
                <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <div className="text-orange-600 font-bold text-lg mt-0.5">⚠️</div>
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-2">Advance Payment Required</h4>
                      <p className="text-sm text-orange-800 mb-2">
                        This purchase order requires <span className="font-bold">{invoice.purchaseOrder.advance_payment_percentage}% advance payment</span> before production/delivery.
                      </p>
                      <p className="text-sm text-orange-800">
                        <span className="font-semibold">Action Required:</span> Please process the advance payment of <span className="font-bold">₹{(parseFloat(invoice.total_amount || 0) * (invoice.purchaseOrder.advance_payment_percentage / 100)).toLocaleString()}</span> before proceeding with the order.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Invoice Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Invoice Date</p>
                    <p className="text-sm text-gray-900 mt-1">{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Due Date</p>
                    <p className="text-sm text-gray-900 mt-1">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Payment Terms</p>
                    <p className="text-sm text-gray-900 mt-1">{invoice.payment_terms || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Order Number</p>
                    <p className="text-sm text-gray-900 mt-1">{invoice.salesOrder?.order_number || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Customer Name</p>
                    <p className="text-sm text-gray-900 mt-1">{invoice.customer?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Customer Email</p>
                    <p className="text-sm text-gray-900 mt-1">{invoice.customer?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Customer Phone</p>
                    <p className="text-sm text-gray-900 mt-1">{invoice.customer?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Customer Address</p>
                    <p className="text-sm text-gray-900 mt-1">{invoice.customer?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Billing & Shipping</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Billing Address</p>
                    <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">{invoice.billing_address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Shipping Address</p>
                    <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">{invoice.shipping_address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Financial Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Subtotal</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">₹{(invoice.subtotal || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Tax Amount</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">₹{(invoice.total_tax_amount || invoice.tax_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Discount Amount</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">₹{(invoice.discount_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Shipping Charges</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">₹{(invoice.shipping_charges || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Other Charges</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">₹{(invoice.other_charges || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-xs text-gray-600 font-medium">Total Amount</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">₹{(invoice.total_amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <div className="bg-blue-50 p-3 rounded text-sm text-gray-700">{invoice.notes}</div>
                </div>
              )}

              {invoice.terms_conditions && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">{invoice.terms_conditions}</div>
                </div>
              )}

              {invoice.internal_notes && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Internal Notes</h4>
                  <div className="bg-yellow-50 p-3 rounded text-sm text-gray-700">{invoice.internal_notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              {/* Items & Quantities - Blue */}
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Items & Quantities</h4>
                {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                  <div className="bg-white rounded border border-gray-200 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Material/Item</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-700">Qty</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-700">Rate</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invoice.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 text-gray-900">{item.product_name || item.fabric_name || item.name || 'N/A'}</td>
                            <td className="px-3 py-2 text-right text-gray-900">{item.quantity || item.qty || 0}</td>
                            <td className="px-3 py-2 text-right text-gray-900">₹{parseFloat(item.rate || item.price || 0).toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right font-semibold text-gray-900">₹{(parseFloat(item.amount || item.total || (item.quantity * item.rate) || 0)).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded border border-gray-200 text-xs text-gray-500 text-center">
                    No items found
                  </div>
                )}
              </div>

              {/* Financial Summary in Items Tab */}
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Financial Summary</h4>
                <div className="bg-white p-3 rounded border border-gray-200 text-xs text-gray-700 space-y-1">
                  <div className="flex justify-between">
                    <span><strong>Subtotal:</strong></span>
                    <span>₹{(invoice.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span><strong>Discount:</strong></span>
                      <span>-₹{(invoice.discount_amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span><strong>Tax Amount:</strong></span>
                    <span>₹{(invoice.total_tax_amount || invoice.tax_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {invoice.shipping_charges > 0 && (
                    <div className="flex justify-between">
                      <span><strong>Shipping:</strong></span>
                      <span>₹{(invoice.shipping_charges || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {invoice.other_charges > 0 && (
                    <div className="flex justify-between">
                      <span><strong>Other Charges:</strong></span>
                      <span>₹{(invoice.other_charges || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-1 flex justify-between font-semibold text-blue-600">
                    <span>Total Amount:</span>
                    <span>₹{(invoice.total_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Purchase Order Tab */}
          {activeTab === 'po' && (
            <div>
              {invoice.purchaseOrder ? (
                <div className="space-y-6">
                  {invoice.purchaseOrder.advance_payment_percentage && (
                    <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <div className="text-orange-600 font-bold text-lg mt-0.5">⚠️</div>
                        <div>
                          <h4 className="font-semibold text-orange-900 mb-2">Advance Payment Requirement</h4>
                          <p className="text-sm text-orange-800 mb-2">
                            This PO requires <span className="font-bold">{invoice.purchaseOrder.advance_payment_percentage}% advance payment</span> from the vendor.
                          </p>
                          <p className="text-sm text-orange-800">
                            <span className="font-semibold">Amount Required:</span> ₹{(parseFloat(invoice.purchaseOrder.cost_summary?.grand_total || invoice.total_amount || 0) * (invoice.purchaseOrder.advance_payment_percentage / 100)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">PO Number</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{invoice.purchaseOrder.po_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">PO Status</p>
                      <p className="text-sm text-gray-900 mt-1">{invoice.purchaseOrder.status?.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">PO Date</p>
                      <p className="text-sm text-gray-900 mt-1">{new Date(invoice.purchaseOrder.po_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Priority</p>
                      <p className="text-sm text-gray-900 mt-1">{invoice.purchaseOrder.priority?.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Expected Delivery</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {invoice.purchaseOrder.expected_delivery_date
                          ? new Date(invoice.purchaseOrder.expected_delivery_date).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {invoice.purchaseOrder.vendor && (
                    <div className="border-t border-gray-200 pt-6 bg-orange-50 p-4 rounded">
                      <h4 className="font-semibold text-gray-900 mb-3">Vendor Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Vendor Name</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{invoice.purchaseOrder.vendor.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Email</p>
                          <p className="text-sm text-gray-900 mt-1">{invoice.purchaseOrder.vendor.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Phone</p>
                          <p className="text-sm text-gray-900 mt-1">{invoice.purchaseOrder.vendor.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Address</p>
                          <p className="text-sm text-gray-900 mt-1">{invoice.purchaseOrder.vendor.address || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Address - Cyan */}
                  {invoice.purchaseOrder.delivery_address && (
                    <div className="border-t border-gray-200 pt-4 bg-cyan-50 p-4 rounded border border-cyan-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                      <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-700 leading-relaxed">
                        {invoice.purchaseOrder.delivery_address}
                      </div>
                    </div>
                  )}

                  {/* Payment Terms & Delivery - Yellow */}
                  <div className="border-t border-gray-200 pt-4 bg-yellow-50 p-4 rounded border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Payment Terms & Delivery</h4>
                    <div className="space-y-2 text-xs">
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p><strong>Payment Terms:</strong></p>
                        <p className="text-gray-700 mt-1">{invoice.purchaseOrder.payment_terms || invoice.payment_terms || 'N/A'}</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p><strong>Expected Delivery Date:</strong> {invoice.purchaseOrder.expected_delivery_date ? new Date(invoice.purchaseOrder.expected_delivery_date).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Invoice Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions & Terms - Indigo */}
                  {(invoice.purchaseOrder.special_instructions || invoice.purchaseOrder.terms_conditions) && (
                    <div className="border-t border-gray-200 pt-4 bg-indigo-50 p-4 rounded border border-indigo-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Special Instructions & Terms</h4>
                      <div className="space-y-3 text-xs">
                        {invoice.purchaseOrder.special_instructions && (
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="font-medium text-gray-900 mb-2">Special Instructions:</p>
                            <p className="text-gray-700">{invoice.purchaseOrder.special_instructions}</p>
                          </div>
                        )}
                        {invoice.purchaseOrder.terms_conditions && (
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="font-medium text-gray-900 mb-2">Terms & Conditions:</p>
                            <p className="text-gray-700 whitespace-pre-wrap">{invoice.purchaseOrder.terms_conditions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {invoice.purchaseOrder.cost_summary && (
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Cost Summary</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {invoice.purchaseOrder.cost_summary.fabric_total !== undefined && (
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600 font-medium">Fabric Total</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              ₹{parseFloat(invoice.purchaseOrder.cost_summary.fabric_total).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {invoice.purchaseOrder.cost_summary.accessories_total !== undefined && (
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600 font-medium">Accessories Total</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              ₹{parseFloat(invoice.purchaseOrder.cost_summary.accessories_total).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {invoice.purchaseOrder.cost_summary.sub_total !== undefined && (
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600 font-medium">Sub Total</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              ₹{parseFloat(invoice.purchaseOrder.cost_summary.sub_total).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {invoice.purchaseOrder.cost_summary.gst_amount !== undefined && (
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600 font-medium">GST ({invoice.purchaseOrder.cost_summary.gst_percentage}%)</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              ₹{parseFloat(invoice.purchaseOrder.cost_summary.gst_amount).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {invoice.purchaseOrder.cost_summary.freight !== undefined && (
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600 font-medium">Freight</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              ₹{parseFloat(invoice.purchaseOrder.cost_summary.freight).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {invoice.purchaseOrder.cost_summary.grand_total !== undefined && (
                          <div className="col-span-2 bg-blue-100 p-3 rounded border-2 border-blue-600">
                            <p className="text-xs text-gray-600 font-medium">Grand Total</p>
                            <p className="text-lg font-bold text-blue-800 mt-1">
                              ₹{parseFloat(invoice.purchaseOrder.cost_summary.grand_total).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No purchase order linked to this invoice</p>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              {/* Payment Status Summary - Red */}
              <div className="bg-red-50 p-4 rounded border border-red-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment Status & History</h4>
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600 font-medium">Total Amount</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">₹{parseFloat(invoice.total_amount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600 font-medium">Paid Amount</p>
                    <p className="text-lg font-bold text-green-600 mt-1">₹{parseFloat(invoice.paid_amount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600 font-medium">Outstanding</p>
                    <p className="text-lg font-bold text-red-600 mt-1">₹{parseFloat(invoice.outstanding_amount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600 font-medium">Status</p>
                    <p className={`text-sm font-bold mt-1 px-2 py-1 rounded inline-block ${getPaymentStatusColor(invoice.payment_status)}`}>
                      {invoice.payment_status?.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Financial Breakdown</h4>
                <div className="bg-white p-3 rounded border border-gray-200 text-xs text-gray-700 space-y-1">
                  <div className="flex justify-between">
                    <span><strong>Subtotal:</strong></span>
                    <span>₹{(invoice.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span><strong>Discount:</strong></span>
                      <span>-₹{(invoice.discount_amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span><strong>Tax Amount:</strong></span>
                    <span>₹{(invoice.total_tax_amount || invoice.tax_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {invoice.shipping_charges > 0 && (
                    <div className="flex justify-between">
                      <span><strong>Shipping Charges:</strong></span>
                      <span>₹{(invoice.shipping_charges || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {invoice.other_charges > 0 && (
                    <div className="flex justify-between">
                      <span><strong>Other Charges:</strong></span>
                      <span>₹{(invoice.other_charges || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-1 flex justify-between font-semibold text-blue-600">
                    <span>Total Amount:</span>
                    <span>₹{(invoice.total_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Records */}
              {invoice.payments && invoice.payments.length > 0 ? (
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Records</h4>
                  <div className="space-y-2">
                    {invoice.payments.map((payment, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors text-xs">
                        <div>
                          <p className="font-semibold text-gray-900">Payment #{idx + 1}</p>
                          <p className="text-gray-600">
                            {new Date(payment.payment_date).toLocaleDateString()} - {payment.payment_method}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 text-sm">₹{parseFloat(payment.amount).toLocaleString('en-IN')}</p>
                          <p className={`text-xs font-semibold px-2 py-0.5 rounded mt-1 inline-block ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {payment.status?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center text-gray-500 text-xs">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No payment records found</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.open(`/invoice/${invoice.id}`, '_blank')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} /> View Full Page
          </button>
        </div>
      </div>
    </div>
  );
}

function FinancialRecordModal({ invoice, onSubmit, onClose }) {
  const [form, setForm] = useState({
    record_type: 'debit',
    account_head: 'Sales Income',
    description: `Financial record for invoice ${invoice.invoice_number}`,
    amount: invoice.total_amount || 0,
    project_name: invoice.salesOrder?.project_name || '',
    department: 'Sales',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create Financial Record</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Invoice:</span> {invoice.invoice_number}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Amount:</span> ₹{invoice.total_amount?.toLocaleString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
            <select
              value={form.record_type}
              onChange={(e) => setForm({ ...form, record_type: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
              <option value="journal_entry">Journal Entry</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Head</label>
            <input
              type="text"
              value={form.account_head}
              onChange={(e) => setForm({ ...form, account_head: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Sales Income"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              value={form.project_name}
              onChange={(e) => setForm({ ...form, project_name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Department"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Additional notes (optional)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FileText size={16} /> Create Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecordDetailsModal({ record, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Financial Record Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 font-medium">Record Number</p>
              <p className="text-lg font-semibold text-gray-900">{record.record_number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Status</p>
              <p className="text-sm text-gray-900 mt-1">{record.status?.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 font-medium">Type</p>
              <p className="text-sm text-gray-900 mt-1">{record.record_type?.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Amount</p>
              <p className="text-lg font-semibold text-gray-900">₹{record.amount?.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 font-medium">Account Head</p>
            <p className="text-sm text-gray-900 mt-1">{record.account_head}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 font-medium">Project</p>
            <p className="text-sm text-gray-900 mt-1">{record.project_name || 'N/A'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 font-medium">Department</p>
            <p className="text-sm text-gray-900 mt-1">{record.department}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 font-medium">Description</p>
            <p className="text-sm text-gray-900 mt-1">{record.description}</p>
          </div>

          {record.notes && (
            <div>
              <p className="text-xs text-gray-600 font-medium">Notes</p>
              <p className="text-sm text-gray-900 mt-1">{record.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600 font-medium">Recorded By</p>
              <p className="text-sm text-gray-900 mt-1">{record.recorded_by_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Recorded At</p>
              <p className="text-sm text-gray-900 mt-1">{new Date(record.recorded_at).toLocaleDateString()}</p>
            </div>
          </div>

          {record.approved_by_name && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-medium">Approved By</p>
                <p className="text-sm text-gray-900 mt-1">{record.approved_by_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Approved At</p>
                <p className="text-sm text-gray-900 mt-1">{new Date(record.approved_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinanceInvoicesPage;
