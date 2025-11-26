import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  DollarSign,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ClipboardList,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/finance/invoices/${id}`);
      setInvoice(response.data.invoice);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invoice details');
      toast.error('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-blue-600 mx-auto animate-spin mb-3" />
          <p className="text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">{error || 'Invoice not found'}</p>
            <button
              onClick={() => navigate('/finance')}
              className="text-red-600 hover:text-red-700 underline mt-1"
            >
              Back to Finance
            </button>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <button
                onClick={() => navigate('/finance')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3"
              >
                <ArrowLeft size={18} />
                Back to Finance
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{invoice.invoice_number}</h1>
              <p className="text-gray-600 mt-1">Invoice Details</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => toast.success('Print functionality coming soon')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={() => toast.success('Download functionality coming soon')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={18} />
                Download
              </button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-4 flex-wrap mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Invoice Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                {invoice.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Payment Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(invoice.payment_status)}`}>
                {invoice.payment_status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Advance Payment Instruction */}
          {invoice.purchaseOrder?.advance_payment_percentage && (
            <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded mb-6">
              <div className="flex items-start gap-3">
                <div className="text-orange-600 font-bold text-2xl">⚠️</div>
                <div>
                  <h3 className="font-semibold text-orange-900 mb-2 text-lg">Advance Payment Required</h3>
                  <p className="text-sm text-orange-800 mb-3">
                    This purchase order requires <span className="font-bold text-base">{invoice.purchaseOrder.advance_payment_percentage}% advance payment</span> as per the agreed payment terms.
                  </p>
                  <div className="bg-orange-100 p-3 rounded border border-orange-300">
                    <p className="text-sm text-orange-900">
                      <span className="font-semibold">💰 Advance Amount Due:</span> <span className="text-lg font-bold text-orange-600">₹{(parseFloat(invoice.total_amount || 0) * (invoice.purchaseOrder.advance_payment_percentage / 100)).toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-orange-800 mt-2">
                      Please process this advance payment to the vendor to initiate production and ensure timely delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 bg-white rounded-t-lg px-6 pt-4">
          {['verification', 'details', 'items', 'po', 'payments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'verification' && 'Verification Checklist'}
              {tab === 'details' && 'Details'}
              {tab === 'items' && 'Items'}
              {tab === 'po' && 'Purchase Order'}
              {tab === 'payments' && 'Payments'}
            </button>
          ))}
        </div>

        {/* Verification Checklist Tab */}
        {activeTab === 'verification' && (
          <div className="space-y-6 bg-white rounded-b-lg p-6">
            {/* PO & Invoice Details - Purple */}
            <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <h3 className="text-lg font-semibold text-gray-900">PO & Invoice Details</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Invoice #</p>
                  <p className="text-gray-900 font-semibold">{invoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'partial_paid' ? 'bg-orange-100 text-orange-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">PO #</p>
                  <p className="text-gray-900 font-semibold">{invoice.purchaseOrder?.po_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Priority</p>
                  <p className="text-gray-900 font-semibold">{invoice.purchaseOrder?.priority?.toUpperCase() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Invoice Date</p>
                  <p className="text-gray-900 font-semibold">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Due Date</p>
                  <p className="text-gray-900 font-semibold">{new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">PO Date</p>
                  <p className="text-gray-900 font-semibold">{invoice.purchaseOrder?.po_date ? new Date(invoice.purchaseOrder.po_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Payment Terms</p>
                  <p className="text-gray-900 font-semibold">{invoice.payment_terms || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Vendor & Client Information - Orange */}
            <div className="border-l-4 border-orange-500 bg-orange-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                <h3 className="text-lg font-semibold text-gray-900">Vendor & Client Information</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Vendor Name</p>
                  <p className="text-gray-900 font-semibold">{invoice.purchaseOrder?.vendor?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Vendor Phone</p>
                  <p className="text-gray-900 font-semibold">{invoice.purchaseOrder?.vendor?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Vendor Email</p>
                  <p className="text-gray-900 font-semibold text-xs">{invoice.purchaseOrder?.vendor?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Customer Name</p>
                  <p className="text-gray-900 font-semibold">{invoice.customer?.name || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Items & Quantities - Blue */}
            {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 && (
              <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Items & Quantities</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-100 border-b border-blue-300">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-900">Item</th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-900">Qty</th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-900">Rate</th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-200">
                      {invoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-gray-900">{item.product_name || item.name || 'N/A'}</td>
                          <td className="px-3 py-2 text-right text-gray-900">{item.quantity || item.qty || 0}</td>
                          <td className="px-3 py-2 text-right text-gray-900">₹{parseFloat(item.rate || item.price || 0).toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-semibold text-gray-900">₹{(parseFloat(item.amount || (item.quantity * item.rate) || 0)).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Financial Details - Green */}
            <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <h3 className="text-lg font-semibold text-gray-900">Financial Details</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Subtotal</p>
                  <p className="text-gray-900 font-semibold">₹{(invoice.subtotal || 0).toLocaleString()}</p>
                </div>
                {invoice.discount_amount > 0 && (
                  <div>
                    <p className="text-gray-600 font-medium">Discount</p>
                    <p className="text-gray-900 font-semibold">-₹{(invoice.discount_amount || 0).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 font-medium">Tax</p>
                  <p className="text-gray-900 font-semibold">₹{(invoice.total_tax_amount || 0).toLocaleString()}</p>
                </div>
                {invoice.shipping_charges > 0 && (
                  <div>
                    <p className="text-gray-600 font-medium">Shipping</p>
                    <p className="text-gray-900 font-semibold">₹{(invoice.shipping_charges || 0).toLocaleString()}</p>
                  </div>
                )}
                <div className="col-span-2 md:col-span-4 bg-green-100 p-3 rounded border border-green-300">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 font-medium">Total Amount</p>
                    <p className="text-2xl font-bold text-green-700">₹{(invoice.total_amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address - Cyan */}
            {invoice.purchaseOrder?.delivery_address && (
              <div className="border-l-4 border-cyan-500 bg-cyan-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-cyan-600"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Delivery Address</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{invoice.purchaseOrder.delivery_address}</p>
              </div>
            )}

            {/* Payment Terms & Delivery - Yellow */}
            <div className="border-l-4 border-yellow-500 bg-yellow-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Terms & Delivery</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Expected Delivery</p>
                  <p className="text-gray-900 font-semibold">
                    {invoice.purchaseOrder?.expected_delivery_date
                      ? new Date(invoice.purchaseOrder.expected_delivery_date).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Payment Terms</p>
                  <p className="text-gray-900 font-semibold">{invoice.payment_terms || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Special Instructions & Terms - Indigo */}
            {(invoice.purchaseOrder?.special_instructions || invoice.terms_conditions) && (
              <div className="border-l-4 border-indigo-500 bg-indigo-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Special Instructions & Terms</h3>
                </div>
                <div className="space-y-4 text-sm">
                  {invoice.purchaseOrder?.special_instructions && (
                    <div>
                      <p className="text-gray-600 font-medium mb-2">Special Instructions</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>{invoice.purchaseOrder.special_instructions}</li>
                      </ul>
                    </div>
                  )}
                  {invoice.terms_conditions && (
                    <div>
                      <p className="text-gray-600 font-medium mb-2">Terms & Conditions</p>
                      <p className="text-gray-700">{invoice.terms_conditions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Status - Red */}
            <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Status & History</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600 font-medium">Total Amount</p>
                  <p className="text-gray-900 font-semibold">₹{(invoice.total_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Paid Amount</p>
                  <p className="text-green-700 font-semibold">₹{(invoice.paid_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Outstanding</p>
                  <p className="text-red-700 font-semibold">₹{(invoice.outstanding_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Payment Status</p>
                  <p className="text-gray-900 font-semibold">{invoice.payment_status?.replace('_', ' ').toUpperCase()}</p>
                </div>
              </div>
              {invoice.payments && invoice.payments.length > 0 && (
                <div className="border-t border-red-200 pt-4">
                  <p className="text-gray-600 font-medium mb-2">Payment History</p>
                  <div className="space-y-2">
                    {invoice.payments.map((payment, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-gray-700">
                        <span>{new Date(payment.payment_date).toLocaleDateString()} - {payment.payment_method}</span>
                        <span className="font-semibold">₹{parseFloat(payment.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6 bg-white rounded-b-lg p-6">
            {/* Invoice Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Invoice Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Invoice Number</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{invoice.invoice_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Invoice Type</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{invoice.invoice_type?.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Invoice Date</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Due Date</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Payment Terms</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{invoice.payment_terms || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Building2 size={20} className="text-green-600" />
                  Customer Information
                </h3>
                {invoice.customer && (
                  <div className="space-y-4 bg-green-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Customer Name</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{invoice.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <Mail size={14} /> Email
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{invoice.customer.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <Phone size={14} /> Phone
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{invoice.customer.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <MapPin size={14} /> Address
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{invoice.customer.address || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Billing & Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Billing Address</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{invoice.billing_address || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Shipping Address</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{invoice.shipping_address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="pt-8 border-t border-gray-200 space-y-6">
              {invoice.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{invoice.notes}</p>
                  </div>
                </div>
              )}
              {invoice.terms_conditions && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Terms & Conditions</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.terms_conditions}</p>
                  </div>
                </div>
              )}
              {invoice.internal_notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Internal Notes</h4>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{invoice.internal_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-b-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Package size={20} className="text-purple-600" />
              Invoice Items
            </h3>
            {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Product</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">Qty</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">Rate</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.product_name || item.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-600">{item.description || 'N/A'}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{item.quantity || item.qty || 0}</td>
                        <td className="px-4 py-3 text-right text-gray-900">₹{parseFloat(item.rate || item.price || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          ₹{(parseFloat(item.amount || (item.quantity * item.rate) || 0)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No items found in this invoice</p>
              </div>
            )}
          </div>
        )}

        {/* Purchase Order Tab */}
        {activeTab === 'po' && (
          <div className="bg-white rounded-b-lg p-6">
            {invoice.purchaseOrder ? (
              <div className="space-y-6">
                {invoice.purchaseOrder.advance_payment_percentage && (
                  <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                    <div className="flex items-start gap-3">
                      <div className="text-orange-600 font-bold text-2xl">⚠️</div>
                      <div>
                        <h4 className="font-semibold text-orange-900 mb-2">Vendor Advance Payment Requirement</h4>
                        <p className="text-sm text-orange-800 mb-2">
                          This PO requires <span className="font-bold">{invoice.purchaseOrder.advance_payment_percentage}% advance payment</span> to be paid to the vendor.
                        </p>
                        <div className="bg-orange-100 p-2 rounded text-sm text-orange-900 font-semibold">
                          Amount Required: ₹{(parseFloat(invoice.purchaseOrder.cost_summary?.grand_total || invoice.total_amount || 0) * (invoice.purchaseOrder.advance_payment_percentage / 100)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start pb-6 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ClipboardList size={20} className="text-orange-600" />
                      Purchase Order Details
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                    {invoice.purchaseOrder.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">PO Number</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{invoice.purchaseOrder.po_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">PO Date</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {new Date(invoice.purchaseOrder.po_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Expected Delivery</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {invoice.purchaseOrder.expected_delivery_date
                          ? new Date(invoice.purchaseOrder.expected_delivery_date).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Priority</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{invoice.purchaseOrder.priority?.toUpperCase()}</p>
                    </div>
                  </div>

                  {invoice.purchaseOrder.vendor && (
                    <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                      <h4 className="font-semibold text-gray-900 mb-4">Vendor Information</h4>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Vendor Name</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{invoice.purchaseOrder.vendor.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                          <Mail size={14} /> Email
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{invoice.purchaseOrder.vendor.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                          <Phone size={14} /> Phone
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{invoice.purchaseOrder.vendor.phone || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* PO Details */}
                <div className="pt-8 border-t border-gray-200 space-y-6">
                  {invoice.purchaseOrder.delivery_address && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">{invoice.purchaseOrder.delivery_address}</p>
                      </div>
                    </div>
                  )}

                  {invoice.purchaseOrder.payment_terms && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Payment Terms</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">{invoice.purchaseOrder.payment_terms}</p>
                      </div>
                    </div>
                  )}

                  {invoice.purchaseOrder.special_instructions && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Special Instructions</h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">{invoice.purchaseOrder.special_instructions}</p>
                      </div>
                    </div>
                  )}

                  {invoice.purchaseOrder.terms_conditions && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.purchaseOrder.terms_conditions}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cost Summary */}
                {invoice.purchaseOrder.cost_summary && (
                  <div className="pt-8 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">PO Cost Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                      {invoice.purchaseOrder.cost_summary.fabric_total !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Fabric Total</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            ₹{parseFloat(invoice.purchaseOrder.cost_summary.fabric_total).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {invoice.purchaseOrder.cost_summary.accessories_total !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Accessories Total</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            ₹{parseFloat(invoice.purchaseOrder.cost_summary.accessories_total).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {invoice.purchaseOrder.cost_summary.sub_total !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Sub Total</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            ₹{parseFloat(invoice.purchaseOrder.cost_summary.sub_total).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {invoice.purchaseOrder.cost_summary.gst_amount !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">
                            GST ({invoice.purchaseOrder.cost_summary.gst_percentage}%)
                          </p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            ₹{parseFloat(invoice.purchaseOrder.cost_summary.gst_amount).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {invoice.purchaseOrder.cost_summary.freight !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Freight</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            ₹{parseFloat(invoice.purchaseOrder.cost_summary.freight).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {invoice.purchaseOrder.cost_summary.grand_total !== undefined && (
                        <div className="col-span-2 md:col-span-1 bg-blue-100 p-3 rounded border-2 border-blue-600">
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
          <div className="bg-white rounded-b-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign size={20} className="text-green-600" />
              Payment Information
            </h3>

            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-medium">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">₹{parseFloat(invoice.total_amount || 0).toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-medium">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600 mt-2">₹{parseFloat(invoice.paid_amount || 0).toLocaleString()}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-medium">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">₹{parseFloat(invoice.outstanding_amount || 0).toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-medium">Payment Status</p>
                <p className={`text-sm font-bold mt-2 px-2 py-1 rounded inline-block ${getPaymentStatusColor(invoice.payment_status)}`}>
                  {invoice.payment_status?.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Subtotal</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">₹{parseFloat(invoice.subtotal || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Discount Amount</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">₹{parseFloat(invoice.discount_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Tax Amount</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">₹{parseFloat(invoice.total_tax_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Shipping Charges</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">₹{parseFloat(invoice.shipping_charges || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Other Charges</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">₹{parseFloat(invoice.other_charges || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Payments List */}
            {invoice.payments && invoice.payments.length > 0 ? (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Payment Records</h4>
                <div className="space-y-3">
                  {invoice.payments.map((payment, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900">Payment #{idx + 1}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.payment_date).toLocaleDateString()} - {payment.payment_method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{parseFloat(payment.amount).toLocaleString()}</p>
                        <p className={`text-xs font-semibold px-2 py-1 rounded mt-1 inline-block ${
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
              <div className="border-t border-gray-200 pt-6 text-center text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No payment records found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailsPage;
