import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Truck, 
  CheckCircle, 
  QrCode, 
  Camera,
  Loader2
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

      // Check for missing inventory_id (warning, not blocking)
      const missingInventoryId = dispatchedMaterials.filter(m => !m.inventory_id);
      if (missingInventoryId.length > 0) {
        console.warn(`⚠️ ${missingInventoryId.length} material(s) don't have inventory_id:`, 
          missingInventoryId.map(m => m.material_name));
        toast('⚠️ Some materials not linked to inventory - stock won\'t be deducted', { 
          duration: 4000,
          icon: '⚠️'
        });
      }

      const dispatchData = {
        mrn_request_id: parseInt(mrnId),
        dispatched_materials: dispatchedMaterials,
        dispatch_notes: dispatchNotes,
        dispatch_photos: dispatchPhotos
      };

      await api.post('/material-dispatch/create', dispatchData);
      
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Material Code</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Requested</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Dispatch Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Barcode</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Batch #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dispatchedMaterials.map((material, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{material.material_name}</td>
                    <td className="px-4 py-3 text-sm">{material.material_code}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {material.quantity_requested} {material.uom}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        className="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={material.quantity_dispatched}
                        onChange={(e) => handleMaterialChange(index, 'quantity_dispatched', e.target.value)}
                        min="0"
                        max={material.quantity_requested}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={material.barcode}
                          onChange={(e) => handleMaterialChange(index, 'barcode', e.target.value)}
                          placeholder="Scan/Enter"
                        />
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={material.batch_number}
                        onChange={(e) => handleMaterialChange(index, 'batch_number', e.target.value)}
                        placeholder="Batch"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={material.location}
                        onChange={(e) => handleMaterialChange(index, 'location', e.target.value)}
                        placeholder="Location"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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