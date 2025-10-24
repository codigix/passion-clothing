
import React, { useState } from 'react';
import { Eye, Edit, Plus, FileText } from 'lucide-react';

const mockInvoices = [
  {
    id: 1,
    invoiceNo: 'INV-2024-001',
    type: 'sales',
    customerVendor: 'ABC School',
    amount: 425000,
    dueDate: '2024-12-15',
    status: 'paid',
    paymentDate: '2024-12-10',
    challanNo: 'CHN-20241201-0001',
    createdDate: '2024-11-15'
  },
  {
    id: 2,
    invoiceNo: 'INV-2024-002',
    type: 'purchase',
    customerVendor: 'XYZ Textiles',
    amount: 125000,
    dueDate: '2024-12-20',
    status: 'pending',
    paymentDate: null,
    challanNo: 'CHN-20241201-0002',
    createdDate: '2024-11-20'
  },
  {
    id: 3,
    invoiceNo: 'INV-2024-003',
    type: 'sales',
    customerVendor: 'PQR College',
    amount: 285000,
    dueDate: '2024-12-25',
    status: 'overdue',
    paymentDate: null,
    challanNo: 'CHN-20241201-0003',
    createdDate: '2024-11-25'
  }
];

const statusColors = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700',
  partially_paid: 'bg-sky-100 text-sky-700',
};

const typeColors = {
  sales: 'bg-emerald-100 text-emerald-700',
  purchase: 'bg-blue-100 text-blue-700',
};

const FinanceInvoicesPage = () => {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const openModal = (type, invoice = null) => {
    setModalType(type);
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const handleCreate = (newInvoice) => {
    setInvoices([...invoices, { ...newInvoice, id: invoices.length + 1 }]);
    closeModal();
  };

  const handleEdit = (updatedInvoice) => {
    setInvoices(invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    closeModal();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          onClick={() => openModal('create')}
        >
          <Plus size={18} /> Create Invoice
        </button>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Invoice No.</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Customer / Vendor</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{invoice.invoiceNo}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[invoice.type]}`}>{invoice.type.toUpperCase()}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{invoice.customerVendor}</td>
                <td className="px-4 py-3">₹{invoice.amount.toLocaleString()}</td>
                <td className="px-4 py-3">{invoice.dueDate}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>{invoice.status.replace('_', ' ').toUpperCase()}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="text-primary-600 hover:text-primary-800" aria-label="View" onClick={() => openModal('view', invoice)}><Eye size={16} /></button>
                    <button className="text-gray-500 hover:text-gray-700" aria-label="Edit" onClick={() => openModal('edit', invoice)}><Edit size={16} /></button>
                  </div>
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
            {modalType === 'view' && selectedInvoice && (
              <div>
                <h2 className="text-xl font-bold mb-2">Invoice Details</h2>
                <div className="space-y-2">
                  <div><strong>Invoice No:</strong> {selectedInvoice.invoiceNo}</div>
                  <div><strong>Type:</strong> {selectedInvoice.type}</div>
                  <div><strong>Customer/Vendor:</strong> {selectedInvoice.customerVendor}</div>
                  <div><strong>Amount:</strong> ₹{selectedInvoice.amount.toLocaleString()}</div>
                  <div><strong>Status:</strong> {selectedInvoice.status}</div>
                  <div><strong>Due Date:</strong> {selectedInvoice.dueDate}</div>
                  <div><strong>Created Date:</strong> {selectedInvoice.createdDate}</div>
                </div>
              </div>
            )}
            {modalType === 'edit' && selectedInvoice && (
              <EditInvoiceForm invoice={selectedInvoice} onSave={handleEdit} onCancel={closeModal} />
            )}
            {modalType === 'create' && (
              <CreateInvoiceForm onSave={handleCreate} onCancel={closeModal} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function EditInvoiceForm({ invoice, onSave, onCancel }) {
  const [form, setForm] = useState(invoice);
  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <h2 className="text-lg font-bold">Edit Invoice</h2>
      <input className="w-full border rounded p-2" value={form.invoiceNo} onChange={e => setForm({ ...form, invoiceNo: e.target.value })} />
      <input className="w-full border rounded p-2" value={form.customerVendor} onChange={e => setForm({ ...form, customerVendor: e.target.value })} />
      <input className="w-full border rounded p-2" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
      <input className="w-full border rounded p-2" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
      <select className="w-full border rounded p-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
        <option value="paid">Paid</option>
        <option value="pending">Pending</option>
        <option value="overdue">Overdue</option>
        <option value="partially_paid">Partially Paid</option>
      </select>
      <div className="flex gap-2 justify-end">
        <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onCancel}>Cancel</button>
        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Save</button>
      </div>
    </form>
  );
}

function CreateInvoiceForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    invoiceNo: '',
    type: 'sales',
    customerVendor: '',
    amount: 0,
    dueDate: '',
    status: 'pending',
    paymentDate: '',
    challanNo: '',
    createdDate: new Date().toISOString().slice(0, 10)
  });
  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <h2 className="text-lg font-bold">Create Invoice</h2>
      <div className="grid grid-cols-1 gap-4">
        <input className="w-full border rounded p-2" placeholder="Invoice No" value={form.invoiceNo} onChange={e => setForm({ ...form, invoiceNo: e.target.value })} required />
        <select className="w-full border rounded p-2" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
          <option value="sales">Sales</option>
          <option value="purchase">Purchase</option>
        </select>
        <input className="w-full border rounded p-2" placeholder="Customer/Vendor" value={form.customerVendor} onChange={e => setForm({ ...form, customerVendor: e.target.value })} required />
        <input className="w-full border rounded p-2" type="number" min="0" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} required />
        <input className="w-full border rounded p-2" type="date" placeholder="Due Date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
        <select className="w-full border rounded p-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} required>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="partially_paid">Partially Paid</option>
        </select>
        <input className="w-full border rounded p-2" type="date" placeholder="Payment Date" value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} />
        <input className="w-full border rounded p-2" placeholder="Challan No" value={form.challanNo} onChange={e => setForm({ ...form, challanNo: e.target.value })} />
        <input className="w-full border rounded p-2" type="date" placeholder="Created Date" value={form.createdDate} onChange={e => setForm({ ...form, createdDate: e.target.value })} required />
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onCancel}>Cancel</button>
        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Create</button>
      </div>
    </form>
  );
}

export default FinanceInvoicesPage;
