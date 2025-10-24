
import React, { useState } from 'react';
import { Eye, Plus, CreditCard } from 'lucide-react';

const mockPayments = [
  {
    id: 1,
    paymentNo: 'PAY-2024-001',
    invoiceNo: 'INV-2024-001',
    type: 'received',
    party: 'ABC School',
    amount: 425000,
    paymentMode: 'bank_transfer',
    paymentDate: '2024-12-10',
    status: 'cleared',
    reference: 'NEFT123456789'
  },
  {
    id: 2,
    paymentNo: 'PAY-2024-002',
    invoiceNo: 'INV-2024-004',
    type: 'made',
    party: 'LMN Accessories',
    amount: 50000,
    paymentMode: 'cheque',
    paymentDate: '2024-12-01',
    status: 'pending',
    reference: 'CHQ001234'
  },
  {
    id: 3,
    paymentNo: 'PAY-2024-003',
    invoiceNo: 'INV-2024-005',
    type: 'received',
    party: 'XYZ School',
    amount: 180000,
    paymentMode: 'cash',
    paymentDate: '2024-12-05',
    status: 'cleared',
    reference: 'CASH-001'
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

const FinancePaymentsPage = () => {
  const [payments, setPayments] = useState(mockPayments);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [selectedPayment, setSelectedPayment] = useState(null);

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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payments</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          onClick={() => openModal('record')}
        >
          <Plus size={18} /> Record Payment
        </button>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Payment No.</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Party</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment Mode</th>
              <th className="px-4 py-3">Payment Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{payment.paymentNo}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[payment.type]}`}>{payment.type.toUpperCase()}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{payment.party}</td>
                <td className="px-4 py-3">₹{payment.amount.toLocaleString()}</td>
                <td className="px-4 py-3">{payment.paymentMode.replace('_', ' ')}</td>
                <td className="px-4 py-3">{payment.paymentDate}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>{payment.status.toUpperCase()}</span>
                </td>
                <td className="px-4 py-3">{payment.reference}</td>
                <td className="px-4 py-3 text-center">
                  <button className="text-primary-600 hover:text-primary-800" aria-label="View" onClick={() => openModal('view', payment)}><Eye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={closeModal}>&times;</button>
            {modalType === 'view' && selectedPayment && (
              <div>
                <h2 className="text-xl font-bold mb-2">Payment Details</h2>
                <div className="space-y-2">
                  <div><strong>Payment No:</strong> {selectedPayment.paymentNo}</div>
                  <div><strong>Type:</strong> {selectedPayment.type}</div>
                  <div><strong>Party:</strong> {selectedPayment.party}</div>
                  <div><strong>Amount:</strong> ₹{selectedPayment.amount.toLocaleString()}</div>
                  <div><strong>Status:</strong> {selectedPayment.status}</div>
                  <div><strong>Payment Mode:</strong> {selectedPayment.paymentMode}</div>
                  <div><strong>Payment Date:</strong> {selectedPayment.paymentDate}</div>
                  <div><strong>Reference:</strong> {selectedPayment.reference}</div>
                </div>
              </div>
            )}
            {modalType === 'record' && (
              <RecordPaymentForm onSave={handleRecord} onCancel={closeModal} />
            )}
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
    paymentDate: '',
    status: 'pending',
    reference: '',
    invoiceNo: ''
  });
  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <h2 className="text-lg font-bold">Record Payment</h2>
      <div className="grid grid-cols-1 gap-4">
        <input className="w-full border rounded p-2" placeholder="Payment No" value={form.paymentNo} onChange={e => setForm({ ...form, paymentNo: e.target.value })} required />
        <select className="w-full border rounded p-2" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
          <option value="received">Received</option>
          <option value="made">Made</option>
        </select>
        <input className="w-full border rounded p-2" placeholder="Party" value={form.party} onChange={e => setForm({ ...form, party: e.target.value })} required />
        <input className="w-full border rounded p-2" type="number" min="0" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} required />
        <input className="w-full border rounded p-2" type="date" placeholder="Payment Date" value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} required />
        <select className="w-full border rounded p-2" value={form.paymentMode} onChange={e => setForm({ ...form, paymentMode: e.target.value })} required>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cheque">Cheque</option>
          <option value="cash">Cash</option>
        </select>
        <select className="w-full border rounded p-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} required>
          <option value="cleared">Cleared</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input className="w-full border rounded p-2" placeholder="Reference" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} />
        <input className="w-full border rounded p-2" placeholder="Invoice No (linked)" value={form.invoiceNo} onChange={e => setForm({ ...form, invoiceNo: e.target.value })} />
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onCancel}>Cancel</button>
        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Record</button>
      </div>
    </form>
  );
}

export default FinancePaymentsPage;
