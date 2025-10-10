import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBox, 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaArrowLeft,
  FaExclamationTriangle,
  FaCalendar,
  FaClipboardList,
  FaIndustry,
  FaInfoCircle
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreateMRMPage  = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isPrefilledFromRequest, setIsPrefilledFromRequest] = useState(false);
  
  const [formData, setFormData] = useState({
    project_name: '',
    priority: 'medium',
    required_by_date: '',
    notes: '',
    materials: [
      {
        material_name: '',
        description: '',
        quantity_required: '',
        unit: 'meters',
        specifications: ''
      }
    ]
  });

  // Store prefilled data for display in Request Information section
  const [prefilledOrderData, setPrefilledOrderData] = useState(null);

  // Handle prefilled data from Production Request
  useEffect(() => {
    if (location.state?.prefilledData) {
      const prefilled = location.state.prefilledData;
      
      // Store complete prefilled data for display
      setPrefilledOrderData(prefilled);
      
      // Build comprehensive notes
      let notes = `Materials needed for ${prefilled.request_number || 'production request'}`;
      if (prefilled.product_name) notes += ` - ${prefilled.product_name}`;
      if (prefilled.product_description) notes += `\nProduct: ${prefilled.product_description}`;
      if (prefilled.customer_name) notes += `\nCustomer: ${prefilled.customer_name}`;
      if (prefilled.quantity && prefilled.unit) notes += `\nQuantity: ${prefilled.quantity} ${prefilled.unit}`;
      
      // Auto-populate materials if provided from production request
      let materialsToAdd = [
        {
          material_name: '',
          description: '',
          quantity_required: '',
          unit: 'meters',
          specifications: ''
        }
      ];
      
      // If material_requirements exist, map them to material rows
      if (prefilled.material_requirements && Array.isArray(prefilled.material_requirements) && prefilled.material_requirements.length > 0) {
        materialsToAdd = prefilled.material_requirements.map(item => ({
          material_name: item.product_name || item.item_name || item.name || '',
          description: item.description || item.specifications || '',
          quantity_required: item.quantity || item.quantity_required || '',
          unit: item.unit || 'meters',
          specifications: item.specifications || item.color || item.grade || ''
        }));
      }
      
      setFormData(prev => ({
        ...prev,
        project_name: prefilled.project_name || '',
        priority: prefilled.priority || 'medium',
        required_by_date: prefilled.required_date 
          ? new Date(prefilled.required_date).toISOString().split('T')[0] 
          : '',
        notes: notes,
        materials: materialsToAdd
      }));
      
      setIsPrefilledFromRequest(true);
      toast.success('Project data loaded from production request!');
    }
  }, [location.state]);

  useEffect(() => {
    fetchProjects();
    fetchProducts();
  }, []);

  const fetchProjects = async () => {
    try {
      // Fetch active projects from production requests or sales orders
      const response = await api.get('/production-requests?status=in_progress,pending');
      const requests = response.data.data || [];
      
      // Extract unique project names
      const uniqueProjects = [...new Set(
        requests
          .map(r => r.project_name)
          .filter(Boolean)
      )];
      
      setProjects(uniqueProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setAvailableProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMaterialChange = (index, field, value) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[index][field] = value;
    setFormData(prev => ({
      ...prev,
      materials: updatedMaterials
    }));
  };

  const addMaterialRow = () => {
    setFormData(prev => ({
      ...prev,
      materials: [
        ...prev.materials,
        {
          material_name: '',
          description: '',
          quantity_required: '',
          unit: 'meters',
          specifications: ''
        }
      ]
    }));
  };

  const removeMaterialRow = (index) => {
    if (formData.materials.length === 1) {
      toast.error('At least one material is required');
      return;
    }
    
    const updatedMaterials = formData.materials.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      materials: updatedMaterials
    }));
  };

  const validateForm = () => {
    if (!formData.project_name.trim()) {
      toast.error('Project name is required');
      return false;
    }

    if (!formData.required_by_date) {
      toast.error('Required by date is required');
      return false;
    }

    // Check if required date is in the future
    const requiredDate = new Date(formData.required_by_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requiredDate < today) {
      toast.error('Required by date must be in the future');
      return false;
    }

    // Validate materials
    for (let i = 0; i < formData.materials.length; i++) {
      const material = formData.materials[i];
      
      if (!material.material_name.trim()) {
        toast.error(`Material name is required for item ${i + 1}`);
        return false;
      }
      
      if (!material.quantity_required || parseFloat(material.quantity_required) <= 0) {
        toast.error(`Valid quantity is required for ${material.material_name}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare materials_requested in the format expected by backend
      const materials_requested = formData.materials.map(m => ({
        material_name: m.material_name,
        description: m.description,
        quantity_required: parseFloat(m.quantity_required),
        unit: m.unit,
        specifications: m.specifications,
        // Initialize tracking fields
        available_qty: 0,
        issued_qty: 0,
        balance_qty: parseFloat(m.quantity_required),
        status: 'pending'
      }));

      const payload = {
        project_name: formData.project_name,
        priority: formData.priority,
        required_by_date: formData.required_by_date,
        notes: formData.notes,
        materials_requested
      };

      const response = await api.post('/project-material-requests/create', payload);
      
      toast.success('Material Request created successfully!');
      toast.success(`MRN Number: ${response.data.request_number}`);
      
      // Navigate to MRN list page
      navigate('/manufacturing/material-requests');
      
    } catch (error) {
      console.error('Error creating MRN:', error);
      toast.error(error.response?.data?.message || 'Failed to create material request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/manufacturing/material-requests');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Material Requests
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaIndustry className="mr-3 text-purple-500" />
              Create Material Request (MRN)
            </h1>
            <p className="text-gray-600 mt-1">
              Request materials from Inventory for manufacturing projects
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
        <div className="flex items-start">
          <FaExclamationTriangle className="text-blue-500 mt-1 mr-3" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800">Material Request Process</h3>
            <p className="text-sm text-blue-700 mt-1">
              This request will be sent to Inventory department for review. They will check stock availability
              and either issue materials or trigger procurement for unavailable items.
            </p>
          </div>
        </div>
      </div>

      {/* Prefilled Data Banner */}
      {isPrefilledFromRequest && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded animate-fade-in">
          <div className="flex items-start">
            <FaInfoCircle className="text-green-500 mt-1 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-green-800">Data Loaded from Production Request</h3>
              <p className="text-sm text-green-700 mt-1">
                Project information has been automatically filled from the incoming production request. 
                You can now add the specific materials needed for this project.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaClipboardList className="mr-2 text-purple-500" />
            Request Information
          </h2>
          
          {/* Comprehensive Order Details Display */}
          {prefilledOrderData && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-3 text-lg">📋 Production Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Order Reference */}
                {prefilledOrderData.request_number && (
                  <div className="bg-white p-3 rounded border border-purple-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Request Number</span>
                    <span className="text-sm font-bold text-purple-700">{prefilledOrderData.request_number}</span>
                  </div>
                )}
                
                {/* Customer */}
                {prefilledOrderData.customer_name && (
                  <div className="bg-white p-3 rounded border border-blue-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Customer</span>
                    <span className="text-sm font-bold text-blue-700">{prefilledOrderData.customer_name}</span>
                  </div>
                )}
                
                {/* Product Name */}
                {prefilledOrderData.product_name && (
                  <div className="bg-white p-3 rounded border border-green-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Product</span>
                    <span className="text-sm font-bold text-green-700">{prefilledOrderData.product_name}</span>
                  </div>
                )}
                
                {/* Product Type */}
                {prefilledOrderData.product_type && (
                  <div className="bg-white p-3 rounded border border-indigo-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Product Type</span>
                    <span className="text-sm font-bold text-indigo-700">{prefilledOrderData.product_type}</span>
                  </div>
                )}
                
                {/* Quantity */}
                {prefilledOrderData.quantity && (
                  <div className="bg-white p-3 rounded border border-orange-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Quantity to Manufacture</span>
                    <span className="text-sm font-bold text-orange-700">
                      {prefilledOrderData.quantity} {prefilledOrderData.unit || 'units'}
                    </span>
                  </div>
                )}
                
                {/* Delivery Date */}
                {prefilledOrderData.required_date && (
                  <div className="bg-white p-3 rounded border border-red-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Delivery Date</span>
                    <span className="text-sm font-bold text-red-700">
                      {new Date(prefilledOrderData.required_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {/* Sales Order */}
                {prefilledOrderData.sales_order_number && (
                  <div className="bg-white p-3 rounded border border-teal-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Sales Order</span>
                    <span className="text-sm font-bold text-teal-700">{prefilledOrderData.sales_order_number}</span>
                  </div>
                )}
                
                {/* Purchase Order */}
                {prefilledOrderData.po_number && (
                  <div className="bg-white p-3 rounded border border-cyan-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Purchase Order</span>
                    <span className="text-sm font-bold text-cyan-700">{prefilledOrderData.po_number}</span>
                  </div>
                )}
                
                {/* Requested By */}
                {prefilledOrderData.requested_by && (
                  <div className="bg-white p-3 rounded border border-pink-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Requested By</span>
                    <span className="text-sm font-bold text-pink-700">{prefilledOrderData.requested_by}</span>
                  </div>
                )}
                
                {/* Product Description - Full Width */}
                {prefilledOrderData.product_description && (
                  <div className="bg-white p-3 rounded border border-gray-200 md:col-span-2 lg:col-span-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Product Description</span>
                    <span className="text-sm text-gray-700">{prefilledOrderData.product_description}</span>
                  </div>
                )}
                
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                list="projects-list"
                placeholder="Enter or select project name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <datalist id="projects-list">
                {projects.map((project, idx) => (
                  <option key={idx} value={project} />
                ))}
              </datalist>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Required By Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required By Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="required_by_date"
                  value={formData.required_by_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes / Special Instructions
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any special instructions or notes for inventory team..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Materials List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaBox className="mr-2 text-purple-500" />
              Materials Required
            </h2>
            <button
              type="button"
              onClick={addMaterialRow}
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Material
            </button>
          </div>

          <div className="space-y-4">
            {formData.materials.map((material, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-700">Material #{index + 1}</h3>
                  {formData.materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterialRow(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Material Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={material.material_name}
                      onChange={(e) => handleMaterialChange(index, 'material_name', e.target.value)}
                      list={`products-list-${index}`}
                      placeholder="e.g., Cotton Fabric, Thread"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <datalist id={`products-list-${index}`}>
                      {availableProducts.map((product) => (
                        <option key={product.id} value={product.name} />
                      ))}
                    </datalist>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={material.quantity_required}
                      onChange={(e) => handleMaterialChange(index, 'quantity_required', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={material.unit}
                      onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="meters">Meters</option>
                      <option value="kilograms">Kilograms</option>
                      <option value="pieces">Pieces</option>
                      <option value="rolls">Rolls</option>
                      <option value="boxes">Boxes</option>
                      <option value="liters">Liters</option>
                      <option value="units">Units</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={material.description}
                      onChange={(e) => handleMaterialChange(index, 'description', e.target.value)}
                      placeholder="Brief description of the material"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Specifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specifications
                    </label>
                    <input
                      type="text"
                      value={material.specifications}
                      onChange={(e) => handleMaterialChange(index, 'specifications', e.target.value)}
                      placeholder="e.g., Color, Grade, Size"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Create Material Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMRMPage ;