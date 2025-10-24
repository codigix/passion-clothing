import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaEye, FaPlus, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../utils/api';

const QualityControlPage = () => {
  const [inspections, setInspections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [formData, setFormData] = useState({
    inspectionNumber: '',
    orderId: '',
    batchNumber: '',
    inspectionDate: '',
    inspector: '',
    quantityInspected: '',
    quantityPassed: '',
    quantityFailed: '',
    status: 'pending',
    result: 'pending'
  });

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/manufacturing/quality-inspections');
      setInspections(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      setLoading(false);
      // Fallback to mock data
      setInspections([
        {
          id: 1,
          inspectionNumber: 'QC-2024-001',
          orderNumber: 'PO-2024-001',
          productName: 'Cotton T-Shirt - Blue',
          batchNumber: 'B001',
          inspectionDate: '2024-01-15',
          inspector: 'John Doe',
          quantityInspected: 100,
          quantityPassed: 95,
          quantityFailed: 5,
          status: 'completed',
          result: 'passed'
        },
        {
          id: 2,
          inspectionNumber: 'QC-2024-002',
          orderNumber: 'PO-2024-002',
          productName: 'Denim Jeans - Black',
          batchNumber: 'B002',
          inspectionDate: '2024-01-16',
          inspector: 'Jane Smith',
          quantityInspected: 50,
          quantityPassed: 45,
          quantityFailed: 5,
          status: 'in_progress',
          result: 'pending'
        }
      ]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'passed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const filteredInspections = inspections.filter(inspection =>
    inspection.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewInspection = (inspection) => {
    setSelectedInspection(inspection);
    setOpenDialog(true);
  };

  const handleNewInspection = () => {
    setFormData({
      inspectionNumber: '',
      orderId: '',
      batchNumber: '',
      inspectionDate: '',
      inspector: '',
      quantityInspected: '',
      quantityPassed: '',
      quantityFailed: '',
      status: 'pending',
      result: 'pending'
    });
    setOpenCreateDialog(true);
  };

  const handleEditInspection = (inspection) => {
    setSelectedInspection(inspection);
    setFormData({
      inspectionNumber: inspection.inspectionNumber,
      orderId: inspection.orderId || '',
      batchNumber: inspection.batchNumber,
      inspectionDate: inspection.inspectionDate,
      inspector: inspection.inspector,
      quantityInspected: inspection.quantityInspected,
      quantityPassed: inspection.quantityPassed,
      quantityFailed: inspection.quantityFailed,
      status: inspection.status,
      result: inspection.result
    });
    setOpenEditDialog(true);
  };

  const handleSaveInspection = async () => {
    try {
      if (openEditDialog) {
        await api.put(`/manufacturing/quality-inspections/${selectedInspection.id}`, formData);
        alert('Inspection updated successfully');
      } else {
        await api.post('/manufacturing/quality-inspections', formData);
        alert('Inspection created successfully');
      }
      setOpenCreateDialog(false);
      setOpenEditDialog(false);
      fetchInspections();
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Failed to save inspection');
    }
  };

  const handleDeleteInspection = async (inspection) => {
    if (window.confirm('Are you sure you want to delete this inspection?')) {
      try {
        await api.delete(`/manufacturing/quality-inspections/${inspection.id}`);
        fetchInspections();
        alert('Inspection deleted successfully');
      } catch (error) {
        console.error('Error deleting inspection:', error);
        alert('Failed to delete inspection');
      }
    }
  };

  // Summary metrics
  const totalInspections = inspections.length;
  const passedInspections = inspections.filter(i => i.result === 'passed').length;
  const failedInspections = inspections.filter(i => i.result === 'failed').length;
  const pendingInspections = inspections.filter(i => i.result === 'pending').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="text-lg text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quality Control</h1>
          <p className="text-sm text-slate-600 mt-2">Manage and track quality inspections</p>
        </div>
        <button
          className="bg-teal-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:bg-teal-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          onClick={handleNewInspection}
        >
          <FaPlus />
          New Inspection
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-6 bg-white text-slate-900 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 flex justify-between items-center">
          <div>
            <div className="text-slate-600 text-sm font-medium mb-2">Total Inspections</div>
            <div className="text-3xl font-bold text-slate-900">{totalInspections}</div>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <FaCheckCircle className="text-blue-600 text-2xl" />
          </div>
        </div>
        <div className="p-6 bg-white text-slate-900 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 flex justify-between items-center">
          <div>
            <div className="text-slate-600 text-sm font-medium mb-2">Passed</div>
            <div className="text-3xl font-bold text-green-600">{passedInspections}</div>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <FaCheckCircle className="text-green-600 text-2xl" />
          </div>
        </div>
        <div className="p-6 bg-white text-slate-900 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 flex justify-between items-center">
          <div>
            <div className="text-slate-600 text-sm font-medium mb-2">Failed</div>
            <div className="text-3xl font-bold text-red-600">{failedInspections}</div>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <FaTimesCircle className="text-red-600 text-2xl" />
          </div>
        </div>
        <div className="p-6 bg-white text-slate-900 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 flex justify-between items-center">
          <div>
            <div className="text-slate-600 text-sm font-medium mb-2">Pending</div>
            <div className="text-2xl font-bold text-yellow-500">{pendingInspections}</div>
          </div>
          <FaExclamationTriangle className="text-yellow-500 text-3xl" />
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search inspections..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Inspections Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Inspection #</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Order #</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Product</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Batch</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Inspector</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Date</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Inspected</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Pass Rate</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Result</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredInspections.map(inspection => (
              <tr key={inspection.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-3 text-slate-900 font-medium">{inspection.inspectionNumber}</td>
                <td className="px-6 py-3 text-slate-700">{inspection.orderNumber}</td>
                <td className="px-6 py-3 text-slate-700">{inspection.productName}</td>
                <td className="px-6 py-3 text-slate-700">{inspection.batchNumber}</td>
                <td className="px-6 py-3 text-slate-700">{inspection.inspector}</td>
                <td className="px-6 py-3 text-slate-700">{inspection.inspectionDate}</td>
                <td className="px-6 py-3 text-slate-700">{inspection.quantityInspected}</td>
                <td className="px-6 py-3 text-slate-700">{inspection.quantityInspected > 0 ? `${Math.round((inspection.quantityPassed / inspection.quantityInspected) * 100)}%` : '0%'}</td>
                <td className="px-6 py-3">
                  {inspection.status === 'completed' ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200">Completed</span>
                  ) : inspection.status === 'in_progress' ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  {inspection.result === 'passed' ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200">Passed</span>
                  ) : inspection.result === 'failed' ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200">Failed</span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150" onClick={() => handleViewInspection(inspection)} title="View">
                      <FaEye size={16} />
                    </button>
                    <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-150" onClick={() => handleEditInspection(inspection)} title="Edit">
                      <FaEdit size={16} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150" onClick={() => handleDeleteInspection(inspection)} title="Delete">
                      <FaTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inspection Details Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Inspection Details</h2>
            {selectedInspection && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><span className="font-semibold">Inspection Number:</span> {selectedInspection.inspectionNumber}</div>
                <div><span className="font-semibold">Order Number:</span> {selectedInspection.orderNumber}</div>
                <div className="col-span-2"><span className="font-semibold">Product Name:</span> {selectedInspection.productName}</div>
                <div><span className="font-semibold">Batch Number:</span> {selectedInspection.batchNumber}</div>
                <div><span className="font-semibold">Inspector:</span> {selectedInspection.inspector}</div>
                <div><span className="font-semibold">Quantity Inspected:</span> {selectedInspection.quantityInspected}</div>
                <div><span className="font-semibold">Quantity Passed:</span> <span className="text-green-500">{selectedInspection.quantityPassed}</span></div>
                <div><span className="font-semibold">Quantity Failed:</span> <span className="text-red-500">{selectedInspection.quantityFailed}</span></div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setOpenDialog(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
                onClick={() => handleEditInspection(selectedInspection)}
              >
                Edit Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Inspection Dialog */}
      {(openCreateDialog || openEditDialog) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">{openCreateDialog ? 'Create Inspection' : 'Edit Inspection'}</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Inspection Number</label>
                <input
                  type="text"
                  value={formData.inspectionNumber}
                  onChange={e => setFormData({ ...formData, inspectionNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order ID</label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={e => setFormData({ ...formData, orderId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Batch Number</label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Inspection Date</label>
                <input
                  type="date"
                  value={formData.inspectionDate}
                  onChange={e => setFormData({ ...formData, inspectionDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Inspector</label>
                <input
                  type="text"
                  value={formData.inspector}
                  onChange={e => setFormData({ ...formData, inspector: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity Inspected</label>
                <input
                  type="number"
                  value={formData.quantityInspected}
                  onChange={e => setFormData({ ...formData, quantityInspected: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity Passed</label>
                <input
                  type="number"
                  value={formData.quantityPassed}
                  onChange={e => setFormData({ ...formData, quantityPassed: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity Failed</label>
                <input
                  type="number"
                  value={formData.quantityFailed}
                  onChange={e => setFormData({ ...formData, quantityFailed: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Result</label>
                <select
                  value={formData.result}
                  onChange={e => setFormData({ ...formData, result: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </form>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => { setOpenCreateDialog(false); setOpenEditDialog(false); setSelectedInspection(null); setFormData({ inspectionNumber: '', orderId: '', batchNumber: '', inspectionDate: '', inspector: '', quantityInspected: '', quantityPassed: '', quantityFailed: '', status: 'pending', result: 'pending' }); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
                onClick={handleSaveInspection}
              >
                {openCreateDialog ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityControlPage;