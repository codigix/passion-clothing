
import React, { useState } from 'react';
import { Eye, Plus, CreditCard, Download, Filter } from 'lucide-react';

const mockPayments = [
  {
    id: 1,
    paymentNo: 'PAY-20251117-001',
    invoiceNo: 'INV-20251117-0001',
    type: 'received',
    party: 'Ashwini Khedekar',
    amount: 735000,
    paymentMode: 'bank_transfer',
    paymentDate: '2025-11-10',
    status: 'cleared',
    reference: 'NEFT20251110001',
    description: 'Payment for sales order SO-20251101',
    narration: 'Invoice INV-20251117-0001 - Partial advance payment'
  },
  {
    id: 2,
    paymentNo: 'PAY-20251117-002',
    invoiceNo: 'INV-20251117-0002',
    type: 'received',
    party: 'Priya Enterprises',
    amount: 450000,
    paymentMode: 'bank_transfer',
    paymentDate: '2025-11-12',
    status: 'cleared',
    reference: 'NEFT20251112002',
    description: 'Partial payment for bulk order',
    narration: 'Bulk order delivery - payment received'
  },
  {
    id: 3,
    paymentNo: 'PAY-20251117-003',
    invoiceNo: 'PO-20251115-0001',
    type: 'made',
    party: 'Textile Suppliers Ltd',
    amount: 280000,
    paymentMode: 'bank_transfer',
    paymentDate: '2025-11-08',
    status: 'cleared',
    reference: 'NEFT20251108003',
    description: 'Raw material purchase payment',
    narration: 'Fabric purchase PO-20251115-0001'
  },
  {
    id: 4,
    paymentNo: 'PAY-20251117-004',
    invoiceNo: 'INV-20251117-0004',
    type: 'received',
    party: 'Rajesh Kumar',
    amount: 195000,
    paymentMode: 'cheque',
    paymentDate: '2025-11-14',
    status: 'cleared',
    reference: 'CHQ789456',
    description: 'Payment for customized order',
    narration: 'Custom tailored collection - full payment'
  },
  {
    id: 5,
    paymentNo: 'PAY-20251117-005',
    invoiceNo: 'PO-20251116-0002',
    type: 'made',
    party: 'Premium Accessories Co',
    amount: 125000,
    paymentMode: 'cheque',
    paymentDate: '2025-11-15',
    status: 'pending',
    reference: 'CHQ123789',
    description: 'Buttons and trims purchase',
    narration: 'Cheque CHQ123789 issued - awaiting clearance'
  },
  {
    id: 6,
    paymentNo: 'PAY-20251117-006',
    invoiceNo: 'INV-20251117-0006',
    type: 'received',
    party: 'Kavya Fashion Store',
    amount: 620000,
    paymentMode: 'bank_transfer',
    paymentDate: '2025-11-11',
    status: 'cleared',
    reference: 'NEFT20251111006',
    description: 'Seasonal collection payment',
    narration: 'Seasonal collection order - full settlement'
  },
  {
    id: 7,
    paymentNo: 'PAY-20251117-007',
    invoiceNo: 'PO-20251114-0003',
    type: 'made',
    party: 'Dye & Chemical Industries',
    amount: 95000,
    paymentMode: 'cash',
    paymentDate: '2025-11-13',
    status: 'cleared',
    reference: 'CASH-20251113',
    description: 'Fabric dye purchase',
    narration: 'Chemical dyes for production - cash paid'
  },
  {
    id: 8,
    paymentNo: 'PAY-20251117-008',
    invoiceNo: 'INV-20251117-0008',
    type: 'received',
    party: 'Sharma Retail Solutions',
    amount: 340000,
    paymentMode: 'bank_transfer',
    paymentDate: '2025-11-16',
    status: 'cleared',
    reference: 'NEFT20251116008',
    description: 'Wholesale order delivery',
    narration: 'Wholesale shipment - payment received'
  },
  {
    id: 9,
    paymentNo: 'PAY-20251117-009',
    invoiceNo: 'SO-20251110-0004',
    type: 'made',
    party: 'Stitching Services Unit',
    amount: 210000,
    paymentMode: 'bank_transfer',
    paymentDate: '2025-11-09',
    status: 'cleared',
    reference: 'NEFT20251109009',
    description: 'Outsourced stitching services',
    narration: 'Subcontracting stitching work - payment released'
  },
  {
    id: 10,
    paymentNo: 'PAY-20251117-010',
    invoiceNo: 'INV-20251117-0010',
    type: 'received',
    party: 'Harish Menswear',
    amount: 485000,
    paymentMode: 'bank_transfer',
    paymentDate: '2025-11-17',
    status: 'cleared',
    reference: 'NEFT20251117010',
    description: 'Premium collection advance',
    narration: 'Premium collection - advance received'
  },
  {
    id: 11,
    paymentNo: 'PAY-20251117-011',
    invoiceNo: 'PO-20251117-0005',
    type: 'made',
    party: 'Packaging Solutions Inc',
    amount: 65000,
    paymentMode: 'cheque',
    paymentDate: '2025-11-16',
    status: 'pending',
    reference: 'CHQ456789',
    description: 'Packaging materials for shipment',
    narration: 'Cheque issued for packaging - awaiting clearance'
  },
  {
    id: 12,
    paymentNo: 'PAY-20251117-012',
    invoiceNo: 'INV-20251117-0012',
    type: 'received',
    party: 'Online Boutique Hub',
    amount: 275000,
    paymentMode: 'bank_transfer',
    paymentDate: '2025-11-14',
    status: 'cleared',
    reference: 'NEFT20251114012',
    description: 'E-commerce order settlement',
    narration: 'E-commerce platform order - payment cleared'
  },
  {
    id: 13,
    paymentNo: 'PAY-20251117-013',
    invoiceNo: 'SVC-20251113-0001',
    type: 'made',
    party: 'Quality Control Labs',
    amount: 45000,
    paymentMode: 'cash',
    paymentDate: '2025-11-12',
    status: 'cleared',
    reference: 'CASH-20251112',
    description: 'Quality testing charges',
    narration: 'QC testing for batch - cash payment'
  },
  {
    id: 14,
    paymentNo: 'PAY-20251117-014',
    invoiceNo: 'INV-20251117-0014',
    type: 'received',
    party: 'Corporate Gifting Solutions',
    amount: 580000,
    paymentMode: 'bank_transfer',
    paymentDate: '2025-11-13',
    status: 'cleared',
    reference: 'NEFT20251113014',
    description: 'Custom corporate order',
    narration: 'Corporate gift order - full payment received'
  },
  {
    id: 15,
    paymentNo: 'PAY-20251117-015',
    invoiceNo: 'LOGX-20251110-0001',
    type: 'made',
    party: 'Logistics Partner Ltd',
    amount: 155000,
    paymentMode: 'bank_transfer',
    paymentDate: '2025-11-10',
    status: 'cleared',
    reference: 'NEFT20251110015',
    description: 'Shipping and logistics charges',
    narration: 'Freight charges - shipment cleared'
  }
];

const statusColors = {
  cleared: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

const typeColors = {
  received: 'bg-emerald-100 text-emerald-700',
  made: 'bg-blue-100 text-blue-700',
};

const modeIcons = {
  bank_transfer: '🏦',
  cheque: '📋',
  cash: '💵'
};

const FinancePaymentsPage = () => {
  const [payments, setPayments] = useState(mockPayments);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const openModal = (type, payment = null) => {
    setModalType(type);
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  const handleRecord = (newPayment) => {
    setPayments([...payments, { ...newPayment, id: payments.length + 1 }]);
    closeModal();
  };

  const filteredPayments = payments.filter(p => {
    const typeMatch = filterType === 'all' || p.type === filterType;
    const statusMatch = filterStatus === 'all' || p.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const totalReceived = filteredPayments
    .filter(p => p.type === 'received')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalMade = filteredPayments
    .filter(p => p.type === 'made')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCleared = filteredPayments
    .filter(p => p.status === 'cleared')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = filteredPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
            <p className="text-gray-600 text-sm mt-1">Track all incoming and outgoing payments</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 shadow-sm"
            onClick={() => openModal('record')}
          >
            <Plus size={18} /> Record Payment
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-emerald-500">
            <div className="text-gray-600 text-sm">Total Received</div>
            <div className="text-2xl font-bold text-gray-900">₹{totalReceived.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{filteredPayments.filter(p => p.type === 'received').length} payments</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="text-gray-600 text-sm">Total Made</div>
            <div className="text-2xl font-bold text-gray-900">₹{totalMade.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{filteredPayments.filter(p => p.type === 'made').length} payments</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="text-gray-600 text-sm">Cleared</div>
            <div className="text-2xl font-bold text-gray-900">₹{totalCleared.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{filteredPayments.filter(p => p.status === 'cleared').length} payments</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-amber-500">
            <div className="text-gray-600 text-sm">Pending</div>
            <div className="text-2xl font-bold text-gray-900">₹{totalPending.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{filteredPayments.filter(p => p.status === 'pending').length} payments</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6 p-4 border border-gray-200">
          <div className="flex items-center gap-4">
            <Filter size={18} className="text-gray-500" />
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm hover:border-gray-400 focus:outline-none focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="received">Received</option>
                <option value="made">Made</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm hover:border-gray-400 focus:outline-none focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="cleared">Cleared</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Payment No.</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Party</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Mode</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Payment Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Reference</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{payment.paymentNo}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[payment.type]}`}>
                        {payment.type === 'received' ? '📥 RECEIVED' : '📤 MADE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{payment.party}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">₹{payment.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        {modeIcons[payment.paymentMode]} {payment.paymentMode.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs font-mono">{payment.reference}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 p-1 rounded transition-colors"
                        aria-label="View"
                        onClick={() => openModal('view', payment)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPayments.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No payments found with the selected filters.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalType === 'view' ? 'Payment Details' : 'Record Payment'}
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>
            
            {modalType === 'view' && selectedPayment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Payment No</div>
                    <div className="text-lg font-bold text-gray-900">{selectedPayment.paymentNo}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedPayment.status]}`}>
                      {selectedPayment.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Type</div>
                    <div className="font-medium text-gray-900">
                      {selectedPayment.type === 'received' ? '📥 Received' : '📤 Made'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Party</div>
                    <div className="font-medium text-gray-900">{selectedPayment.party}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Amount</div>
                    <div className="text-2xl font-bold text-primary-600">₹{selectedPayment.amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Payment Date</div>
                    <div className="font-medium text-gray-900">{new Date(selectedPayment.paymentDate).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Payment Mode</div>
                    <div className="font-medium text-gray-900">
                      {modeIcons[selectedPayment.paymentMode]} {selectedPayment.paymentMode.replace('_', ' ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Reference</div>
                    <div className="font-mono text-sm text-gray-900">{selectedPayment.reference}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Invoice Linked</div>
                  <div className="font-medium text-gray-900">{selectedPayment.invoiceNo}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Description</div>
                  <div className="text-gray-900">{selectedPayment.description}</div>
                </div>

                {selectedPayment.narration && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Narration</div>
                    <div className="text-sm text-gray-900 mt-1">{selectedPayment.narration}</div>
                  </div>
                )}
              </div>
            )}

            {modalType === 'record' && (
              <RecordPaymentForm onSave={handleRecord} onCancel={closeModal} />
            )}

            <div className="flex gap-2 justify-end mt-6 pt-4 border-t">
              {modalType === 'view' && (
                <>
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Download size={16} /> Export
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function RecordPaymentForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    paymentNo: '',
    type: 'received',
    party: '',
    amount: 0,
    paymentMode: 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    reference: '',
    invoiceNo: '',
    description: '',
    narration: ''
  });

  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Payment No"
          value={form.paymentNo}
          onChange={e => setForm({ ...form, paymentNo: e.target.value })}
          required
        />
        <select
          className="w-full border rounded px-3 py-2"
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
          required
        >
          <option value="received">Received</option>
          <option value="made">Made</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Party"
          value={form.party}
          onChange={e => setForm({ ...form, party: e.target.value })}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="number"
          min="0"
          placeholder="Amount"
          value={form.amount}
          onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          className="w-full border rounded px-3 py-2"
          type="date"
          value={form.paymentDate}
          onChange={e => setForm({ ...form, paymentDate: e.target.value })}
          required
        />
        <select
          className="w-full border rounded px-3 py-2"
          value={form.paymentMode}
          onChange={e => setForm({ ...form, paymentMode: e.target.value })}
          required
        >
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cheque">Cheque</option>
          <option value="cash">Cash</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <select
          className="w-full border rounded px-3 py-2"
          value={form.status}
          onChange={e => setForm({ ...form, status: e.target.value })}
          required
        >
          <option value="cleared">Cleared</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Reference"
          value={form.reference}
          onChange={e => setForm({ ...form, reference: e.target.value })}
        />
      </div>

      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Invoice No (linked)"
        value={form.invoiceNo}
        onChange={e => setForm({ ...form, invoiceNo: e.target.value })}
      />

      <textarea
        className="w-full border rounded px-3 py-2"
        placeholder="Description"
        rows="2"
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
      />

      <textarea
        className="w-full border rounded px-3 py-2"
        placeholder="Narration"
        rows="2"
        value={form.narration}
        onChange={e => setForm({ ...form, narration: e.target.value })}
      />

      <div className="flex gap-2 justify-end">
        <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
          Record Payment
        </button>
      </div>
    </form>
  );
}

export default FinancePaymentsPage;
