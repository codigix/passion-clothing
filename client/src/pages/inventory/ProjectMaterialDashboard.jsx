import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaPlus, FaTruck, FaBarcode, FaHistory, 
  FaDownload, FaPrint 
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Barcode from 'react-barcode';

const ProjectMaterialDashboard = () => {
  const { salesOrderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendQty, setSendQty] = useState('');
  const [sendNotes, setSendNotes] = useState('');

  useEffect(() => {
    fetchProjectMaterials();
  }, [salesOrderId]);

  const fetchProjectMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/inventory/projects/${salesOrderId}/materials`);
      setProject(res.data.project);
    } catch (error) {
      console.error('Error fetching project materials:', error);
      toast.error('Failed to load project materials');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToManufacturing = async () => {
    if (!sendQty || parseFloat(sendQty) <= 0) {
      toast.error('Please enter valid quantity');
      return;
    }

    try {
      await api.post('/inventory/send-to-manufacturing', {
        inventory_id: selectedMaterial.id,
        quantity: parseFloat(sendQty),
        sales_order_id: salesOrderId,
        notes: sendNotes
      });
      
      toast.success('Materials dispatched to manufacturing');
      setShowSendModal(false);
      setSendQty('');
      setSendNotes('');
      fetchProjectMaterials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to dispatch materials');
    }
  };

  const handleAddMaterial = () => {
    navigate('/inventory/add-item', { state: { salesOrderId } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          Project not found
        </div>
      </div>
    );
  }

  const { salesOrder, summary, materials, dispatches } = project;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/inventory')}
            className="text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Project Materials</h1>
            <p className="text-gray-600">{salesOrder.order_number} - {salesOrder.customer?.company_name}</p>
          </div>
        </div>
        <button
          onClick={handleAddMaterial}
          className="flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          <FaPlus /> Add Material
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500 text-sm mb-1">Total Materials</p>
          <p className="text-2xl font-bold text-gray-800">{summary.totalMaterials}</p>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500 text-sm mb-1">Total Received</p>
          <p className="text-2xl font-bold text-blue-600">{summary.totalReceived.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500 text-sm mb-1">Sent to Manufacturing</p>
          <p className="text-2xl font-bold text-orange-600">{summary.sentToManufacturing.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500 text-sm mb-1">Remaining Balance</p>
          <p className="text-2xl font-bold text-green-600">{summary.currentStock.toFixed(2)}</p>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded shadow mb-4">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Materials</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase">
                    Material Name
                  </th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase">
                    Barcode
                  </th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase">
                    Total Received
                  </th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase">
                    Current Stock
                  </th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase">
                    Sent to Mfg
                  </th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase">
                    Last Updated
                  </th>
                  <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No materials found for this project
                    </td>
                  </tr>
                ) : (
                  materials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{material.product_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{material.product_code || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-mono text-gray-700">{material.barcode || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-blue-600 font-semibold">
                          {parseFloat(material.initial_quantity || 0).toFixed(2)} {material.unit_of_measurement || ''}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-green-600 font-semibold">
                          {parseFloat(material.current_stock || 0).toFixed(2)} {material.unit_of_measurement || ''}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-orange-600 font-semibold">
                          {(parseFloat(material.initial_quantity || 0) - parseFloat(material.current_stock || 0)).toFixed(2)} {material.unit_of_measurement || ''}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(material.updated_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedMaterial(material);
                              setShowSendModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 p-2"
                            title="Send to Manufacturing"
                            disabled={material.current_stock <= 0}
                          >
                            <FaTruck size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMaterial(material);
                              setShowBarcodeModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-2"
                            title="View Barcode"
                          >
                            <FaBarcode size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/inventory/${material.id}/history`)}
                            className="text-purple-600 hover:text-purple-800 p-2"
                            title="View History"
                          >
                            <FaHistory size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dispatch History */}
      <div className="bg-white rounded shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Dispatch History</h2>
          <div className="space-y-3">
            {dispatches.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No dispatch history available</p>
            ) : (
              dispatches.map((dispatch) => (
                <div key={dispatch.id} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">
                        {dispatch.inventory?.product_name || 'Material'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {Math.abs(dispatch.quantity).toFixed(2)} {dispatch.inventory?.unit_of_measurement || ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        By: {dispatch.performer?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(dispatch.movement_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(dispatch.movement_date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {dispatch.notes && (
                    <p className="text-sm text-gray-500 mt-2">{dispatch.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Barcode Modal */}
      {showBarcodeModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Material Barcode</h3>
            <div className="text-center mb-4">
              <p className="font-medium text-gray-800 mb-2">{selectedMaterial.product_name}</p>
              <div className="flex justify-center">
                <Barcode value={selectedMaterial.barcode} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                <FaPrint /> Print
              </button>
              <button
                onClick={() => setShowBarcodeModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send to Manufacturing Modal */}
      {showSendModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Send to Manufacturing</h3>
            <div className="mb-4">
              <p className="font-medium text-gray-800">{selectedMaterial.product_name}</p>
              <p className="text-sm text-gray-600">
                Available: {selectedMaterial.available_stock} {selectedMaterial.unit_of_measurement}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Quantity to Send *
              </label>
              <input
                type="number"
                value={sendQty}
                onChange={(e) => setSendQty(e.target.value)}
                max={selectedMaterial.available_stock}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                placeholder="Enter quantity"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={sendNotes}
                onChange={(e) => setSendNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                rows="3"
                placeholder="Add notes..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSendToManufacturing}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Send
              </button>
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSendQty('');
                  setSendNotes('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMaterialDashboard;