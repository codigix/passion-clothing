import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Truck, 
  CheckCircle, 
  QrCode, 
  Camera,
  Loader2,
  Search,
  Link as LinkIcon,
  AlertTriangle
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StockDispatchPage = () => {
  const { mrnId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mrnRequest, setMrnRequest] = useState(null);
  const [dispatchedMaterials, setDispatchedMaterials] = useState([]);
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [dispatchPhotos, setDispatchPhotos] = useState([]);
  const [searchingInventory, setSearchingInventory] = useState({});
  const [inventoryResults, setInventoryResults] = useState({});

  useEffect(() => {
    fetchMRNDetails();
  }, [mrnId]);

  const fetchMRNDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/project-material-requests/${mrnId}`);
      const mrn = response.data.request || response.data;
      setMrnRequest(mrn);

      // Parse materials_requested if it's a string
      let materialsRequested = [];
      try {
        materialsRequested = typeof mrn.materials_requested === 'string' 
          ? JSON.parse(mrn.materials_requested)
          : mrn.materials_requested || [];
      } catch (parseError) {
        console.error('Error parsing materials_requested:', parseError);
        toast.error('Invalid materials data format');
        return;
      }

      // Initialize dispatched materials from requested materials
      const initialMaterials = materialsRequested.map(material => ({
        material_name: material.material_name,
        material_code: material.material_code || 'N/A',
        quantity_requested: material.quantity_required || material.quantity_requested || 0,
        quantity_dispatched: material.quantity_required || material.quantity_requested || 0,
        uom: material.uom || 'PCS',
        barcode: material.barcode || '',
        batch_number: material.batch_number || '',
        location: material.location || '',
        inventory_id: material.inventory_id || null
      }));
      setDispatchedMaterials(initialMaterials);
    } catch (error) {
      console.error('Error fetching MRN details:', error);
      toast.error('Failed to load MRN details');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...dispatchedMaterials];
    updated[index][field] = value;
    setDispatchedMaterials(updated);
  };

  const searchInventoryForMaterial = async (index, materialName) => {
    try {
      setSearchingInventory({ ...searchingInventory, [index]: true });
      const response = await api.get('/inventory-enhanced', {
        params: { search: materialName, limit: 10 }
      });
      
      const items = response.data.inventory || [];
      setInventoryResults({ ...inventoryResults, [index]: items });
      
      if (items.length === 0) {
        toast.error(`No inventory items found for "${materialName}"`);
      }
    } catch (error) {
      console.error('Error searching inventory:', error);
      toast.error('Failed to search inventory');
    } finally {
      setSearchingInventory({ ...searchingInventory, [index]: false });
    }
  };

  const linkInventoryItem = (materialIndex, inventoryItem) => {
    const updated = [...dispatchedMaterials];
    updated[materialIndex] = {
      ...updated[materialIndex],
      inventory_id: inventoryItem.id,
      barcode: inventoryItem.barcode || updated[materialIndex].barcode,
      location: inventoryItem.location || updated[materialIndex].location,
      batch_number: inventoryItem.batch_number || updated[materialIndex].batch_number,
      available_stock: inventoryItem.current_stock || inventoryItem.quantity,
      linked_item_name: inventoryItem.product_name
    };
    setDispatchedMaterials(updated);
    
    // Clear search results for this material
    const newResults = { ...inventoryResults };
    delete newResults[materialIndex];
    setInventoryResults(newResults);
    
    toast.success(`Linked to inventory: ${inventoryItem.product_name}`);
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    // In real app, upload to server and get URLs
    const photoUrls = files.map(file => URL.createObjectURL(file));
    setDispatchPhotos([...dispatchPhotos, ...photoUrls]);
    toast.success(`${files.length} photo(s) added`);
  };

  const handleSubmitDispatch = async () => {
    try {
      setSubmitting(true);

      // Validate materials
      const invalidMaterials = dispatchedMaterials.filter(m => !m.material_name || m.quantity_dispatched <= 0);
      if (invalidMaterials.length > 0) {
        toast.error('Please ensure all materials have valid names and quantities');
        setSubmitting(false);
        return;
      }

      // Check for stock availability issues
      const insufficientStock = dispatchedMaterials.filter(m => 
        m.inventory_id && 
        m.available_stock !== undefined && 
        m.quantity_dispatched > m.available_stock
      );
      
      if (insufficientStock.length > 0) {
        toast.error(`Insufficient stock for: ${insufficientStock.map(m => m.material_name).join(', ')}`);
        setSubmitting(false);
        return;
      }

      // Check for missing inventory_id (warning, not blocking)
      const missingInventoryId = dispatchedMaterials.filter(m => !m.inventory_id);
      if (missingInventoryId.length > 0) {
        console.warn(`⚠️ ${missingInventoryId.length} material(s) don't have inventory_id:`, 
          missingInventoryId.map(m => m.material_name));
        
        // Show confirmation dialog
        const confirmed = window.confirm(
          `⚠️ ${missingInventoryId.length} material(s) are not linked to inventory.\n\n` +
          `Materials: ${missingInventoryId.map(m => m.material_name).join(', ')}\n\n` +
          `Stock will NOT be deducted for these materials.\n\n` +
          `Do you want to proceed with dispatch?`
        );
        
        if (!confirmed) {
          setSubmitting(false);
          return;
        }
      }

      const dispatchData = {
        mrn_request_id: parseInt(mrnId),
        dispatched_materials: dispatchedMaterials,
        dispatch_notes: dispatchNotes,
        dispatch_photos: dispatchPhotos
      };

      const response = await api.post('/material-dispatch/create', dispatchData);
      
      toast.success('Materials dispatched successfully!');
      navigate('/inventory/material-requests');
    } catch (error) {
      console.error('Error dispatching materials:', error);
      toast.error(error.response?.data?.message || 'Failed to dispatch materials');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!mrnRequest) {
    return (
      <div className="p-6">
        <div className="bg-error-50 border border-error-200 text-error-800 rounded-lg p-4">
          MRN request not found
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-error-100 text-error-700';
      case 'high': return 'bg-warning-100 text-warning-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-display-4 font-bold text-dark-800">
          Dispatch Materials
        </h1>
      </div>

      <div className="space-y-6">
        {/* MRN Details */}
        <div className="card p-6">
          <h2 className="text-display-6 font-semibold mb-4">MRN Request Details</h2>
          <hr className="border-border mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-body-2 text-text-secondary mb-1">Request Number</p>
              <p className="text-body-1 font-medium">{mrnRequest.request_number}</p>
            </div>
            <div>
              <p className="text-body-2 text-text-secondary mb-1">Project Name</p>
              <p className="text-body-1 font-medium">{mrnRequest.project_name}</p>
            </div>
            <div>
              <p className="text-body-2 text-text-secondary mb-1">Status</p>
              <span className="inline-flex px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                {mrnRequest.status}
              </span>
            </div>
            <div>
              <p className="text-body-2 text-text-secondary mb-1">Priority</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm ${getPriorityColor(mrnRequest.priority)}`}>
                {mrnRequest.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Materials Dispatch Table */}
        <div className="card p-6">
          <h2 className="text-display-6 font-semibold mb-4">Materials to Dispatch</h2>
          <hr className="border-border mb-4" />
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Material Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Inventory Link</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Requested</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Available</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Dispatch Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Barcode</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Batch #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dispatchedMaterials.map((material, index) => (
                  <React.Fragment key={index}>
                    <tr className={`hover:bg-gray-50 ${!material.inventory_id ? 'bg-warning-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{material.material_name}</p>
                          <p className="text-xs text-gray-500">{material.material_code}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {material.inventory_id ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs">
                              <CheckCircle className="w-3 h-3" />
                              Linked
                            </div>
                            {material.linked_item_name && (
                              <span className="text-xs text-gray-600">{material.linked_item_name}</span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => searchInventoryForMaterial(index, material.material_name)}
                            disabled={searchingInventory[index]}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            {searchingInventory[index] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                            Link to Stock
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {material.quantity_requested} {material.uom}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {material.available_stock !== undefined ? (
                          <span className={`text-sm font-medium ${material.available_stock < material.quantity_dispatched ? 'text-error-600' : 'text-success-600'}`}>
                            {material.available_stock}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          className="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={material.quantity_dispatched}
                          onChange={(e) => handleMaterialChange(index, 'quantity_dispatched', parseFloat(e.target.value) || 0)}
                          min="0"
                          max={material.available_stock || material.quantity_requested}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          value={material.barcode}
                          onChange={(e) => handleMaterialChange(index, 'barcode', e.target.value)}
                          placeholder="Barcode"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          value={material.batch_number}
                          onChange={(e) => handleMaterialChange(index, 'batch_number', e.target.value)}
                          placeholder="Batch"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          value={material.location}
                          onChange={(e) => handleMaterialChange(index, 'location', e.target.value)}
                          placeholder="Location"
                        />
                      </td>
                    </tr>
                    {/* Inventory Search Results */}
                    {inventoryResults[index] && inventoryResults[index].length > 0 && (
                      <tr>
                        <td colSpan="8" className="px-4 py-3 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-700 mb-2">Select Inventory Item:</div>
                          <div className="space-y-1">
                            {inventoryResults[index].map((item) => (
                              <button
                                key={item.id}
                                onClick={() => linkInventoryItem(index, item)}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-primary-50 border border-gray-200 rounded-lg text-left transition-colors"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                                  <p className="text-xs text-gray-500">
                                    {item.product_code} | Stock: {item.current_stock || item.quantity} {item.uom} | Location: {item.location || 'N/A'}
                                  </p>
                                </div>
                                <LinkIcon className="w-4 h-4 text-primary-600" />
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Warning if materials not linked */}
          {dispatchedMaterials.some(m => !m.inventory_id) && (
            <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning-800">
                  Some materials are not linked to inventory
                </p>
                <p className="text-xs text-warning-700 mt-1">
                  Stock quantities will not be deducted for unlinked materials. Click "Link to Stock" to search and link inventory items.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dispatch Notes & Photos */}
        <div className="card p-6">
          <h2 className="text-display-6 font-semibold mb-4">Dispatch Notes & Photos</h2>
          <hr className="border-border mb-4" />
          
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
            rows="4"
            value={dispatchNotes}
            onChange={(e) => setDispatchNotes(e.target.value)}
            placeholder="Any special instructions or notes..."
          />

          <div className="flex items-center gap-4">
            <label className="btn btn-outline cursor-pointer">
              <Camera className="w-4 h-4" />
              Add Photos
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </label>
            {dispatchPhotos.length > 0 && (
              <p className="text-body-2 text-text-secondary">
                {dispatchPhotos.length} photo(s) attached
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            className="btn btn-outline"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmitDispatch}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Dispatching...
              </>
            ) : (
              <>
                <Truck className="w-4 h-4" />
                Dispatch Materials
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockDispatchPage;