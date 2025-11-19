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
  FaInfoCircle,
  FaCut,
  FaTags,
  FaImage,
  FaTimes,
  FaPalette
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
  
  const [defaultMaterialType, setDefaultMaterialType] = useState('fabric');
  
  const [formData, setFormData] = useState({
    project_name: '',
    priority: 'medium',
    required_by_date: '',
    notes: '',
    materials: [
      {
        material_type: 'fabric',
        // Common fields
        unit: 'meters',
        description: '',
        // Fabric fields
        fabric_name: '',
        fabric_type: '',
        gsm: '',
        width: '',
        shrinkage: '',
        finish_type: '',
        // Color variants with quantities
        colorVariants: [
          {
            color: '',
            quantity: '',
            notes: ''
          }
        ],
        // Accessories fields
        accessory_type: '',
        accessory_color: '',
        size_length: '',
        quantity_per_unit: '',
        brand: '',
        images: []
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
          material_type: item.material_type || 'fabric',
          unit: item.unit || 'meters',
          description: item.description || item.specifications || '',
          // Fabric fields
          fabric_name: item.product_name || item.item_name || item.name || '',
          fabric_type: item.fabric_type || '',
          gsm: item.gsm || '',
          width: item.width || '',
          shrinkage: item.shrinkage || '',
          finish_type: item.finish_type || '',
          // Color variants
          colorVariants: [
            {
              color: item.color || '',
              quantity: item.quantity || item.quantity_required || '',
              notes: ''
            }
          ],
          // Accessories fields
          accessory_type: item.accessory_type || '',
          accessory_color: item.color || '',
          size_length: item.size || item.length || '',
          quantity_per_unit: item.quantity_per_unit || '',
          brand: item.brand || '',
          images: []
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

  const handleColorVariantChange = (materialIndex, variantIndex, field, value) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[materialIndex].colorVariants[variantIndex][field] = value;
    setFormData(prev => ({
      ...prev,
      materials: updatedMaterials
    }));
  };

  const addColorVariant = (materialIndex) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[materialIndex].colorVariants.push({
      color: '',
      quantity: '',
      notes: ''
    });
    setFormData(prev => ({
      ...prev,
      materials: updatedMaterials
    }));
  };

  const removeColorVariant = (materialIndex, variantIndex) => {
    const updatedMaterials = [...formData.materials];
    if (updatedMaterials[materialIndex].colorVariants.length > 1) {
      updatedMaterials[materialIndex].colorVariants.splice(variantIndex, 1);
      setFormData(prev => ({
        ...prev,
        materials: updatedMaterials
      }));
    } else {
      toast.error('At least one color variant is required');
    }
  };

  const handleImageUpload = (materialIndex, files) => {
    const updatedMaterials = [...formData.materials];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedMaterials[materialIndex].images.push({
          file: file,
          preview: reader.result,
          name: file.name
        });
        setFormData(prev => ({
          ...prev,
          materials: updatedMaterials
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (materialIndex, imageIndex) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[materialIndex].images.splice(imageIndex, 1);
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
          material_type: defaultMaterialType,
          // Common fields
          unit: defaultMaterialType === 'fabric' ? 'meters' : 'pieces',
          description: '',
          // Fabric fields
          fabric_name: '',
          fabric_type: '',
          gsm: '',
          width: '',
          shrinkage: '',
          finish_type: '',
          // Color variants
          colorVariants: [
            {
              color: '',
              quantity: '',
              notes: ''
            }
          ],
          // Accessories fields
          accessory_type: '',
          accessory_color: '',
          size_length: '',
          quantity_per_unit: '',
          brand: '',
          images: []
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
      
      // Check material type specific required fields
      if (material.material_type === 'fabric') {
        if (!material.fabric_name.trim()) {
          toast.error(`Fabric name is required for item ${i + 1}`);
          return false;
        }
        // Fabric type is now optional
      } else if (material.material_type === 'accessories') {
        if (!material.accessory_type.trim()) {
          toast.error(`Accessory type is required for item ${i + 1}`);
          return false;
        }
      }
      
      // Validate color variants
      if (!material.colorVariants || material.colorVariants.length === 0) {
        toast.error(`At least one color variant is required for item ${i + 1}`);
        return false;
      }
      
      for (let j = 0; j < material.colorVariants.length; j++) {
        const variant = material.colorVariants[j];
        if (!variant.color.trim()) {
          toast.error(`Color is required for all variants in item ${i + 1}`);
          return false;
        }
        if (!variant.quantity || parseFloat(variant.quantity) <= 0) {
          toast.error(`Valid quantity is required for ${variant.color} variant in item ${i + 1}`);
          return false;
        }
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
      const materials_requested = formData.materials.map(m => {
        // Calculate total quantity from all color variants
        const totalQuantity = m.colorVariants.reduce((sum, cv) => sum + (parseFloat(cv.quantity) || 0), 0);
        
        const baseMaterial = {
          material_type: m.material_type,
          description: m.description,
          quantity_required: totalQuantity,
          unit: m.unit,
          // Initialize tracking fields
          available_qty: 0,
          issued_qty: 0,
          balance_qty: totalQuantity,
          status: 'pending',
          color_variants: m.colorVariants,
          images: m.images.map(img => ({
            name: img.name,
            data: img.preview
          }))
        };

        // Add type-specific fields
        if (m.material_type === 'fabric') {
          // Build color list from variants
          const colorList = m.colorVariants.map(cv => cv.color).join(', ');
          
          return {
            ...baseMaterial,
            material_name: m.fabric_name,
            fabric_name: m.fabric_name,
            fabric_type: m.fabric_type,
            color: colorList,
            gsm: m.gsm,
            width: m.width,
            shrinkage: m.shrinkage,
            finish_type: m.finish_type,
            specifications: `${m.fabric_type || 'Fabric'} - ${colorList}${m.gsm ? ` - ${m.gsm} GSM` : ''}${m.width ? ` - ${m.width}` : ''}`
          };
        } else {
          return {
            ...baseMaterial,
            material_name: m.accessory_type,
            accessory_type: m.accessory_type,
            color: m.accessory_color,
            size_length: m.size_length,
            quantity_per_unit: m.quantity_per_unit,
            brand: m.brand,
            specifications: `${m.accessory_type}${m.size_length ? ` - ${m.size_length}` : ''}${m.accessory_color ? ` - ${m.accessory_color}` : ''}`
          };
        }
      });

      const payload = {
        project_name: formData.project_name,
        priority: formData.priority,
        required_by_date: formData.required_by_date,
        manufacturing_notes: formData.notes, // Use manufacturing_notes instead of notes
        materials_requested,
        // Include critical fields from prefilled data
        sales_order_id: prefilledOrderData?.sales_order_id || null,
        product_id: prefilledOrderData?.product_id || null,
        product_name: prefilledOrderData?.product_name || null
      };

      console.log('🔍 Submitting MRN with payload:', payload);

      const response = await api.post('/project-material-requests/MRN/create', payload);
      
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
        <div className="bg-white rounded shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaClipboardList className="mr-2 text-purple-500" />
            Request Information
          </h2>

          {/* Default Material Type Selector */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Default Material Type for New Items
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setDefaultMaterialType('fabric')}
                className={`flex-1 px-4 py-3 rounded border-2 transition-all flex items-center justify-center gap-2 ${
                  defaultMaterialType === 'fabric'
                    ? 'bg-purple-500 border-purple-600 text-white shadow-lg'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400'
                }`}
              >
                <FaCut className="text-lg" />
                <span className="font-semibold">Fabric</span>
              </button>
              <button
                type="button"
                onClick={() => setDefaultMaterialType('accessories')}
                className={`flex-1 px-4 py-3 rounded border-2 transition-all flex items-center justify-center gap-2 ${
                  defaultMaterialType === 'accessories'
                    ? 'bg-pink-500 border-pink-600 text-white shadow-lg'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-pink-400'
                }`}
              >
                <FaTags className="text-lg" />
                <span className="font-semibold">Accessories</span>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              This sets the default type for new materials. You can override it for each item individually.
            </p>
          </div>
          
          {/* Comprehensive Order Details Display */}
          {prefilledOrderData && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded">
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
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Materials List */}
        <div className="bg-white rounded shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaBox className="mr-2 text-purple-500" />
              Materials Required
            </h2>
            <button
              type="button"
              onClick={addMaterialRow}
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Material
            </button>
          </div>

          <div className="space-y-4">
            {formData.materials.map((material, index) => (
              <div 
                key={index} 
                className={`p-4 border-2 rounded ${
                  material.material_type === 'fabric' 
                    ? 'bg-purple-50 border-purple-300' 
                    : 'bg-pink-50 border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-700 flex items-center gap-2">
                    {material.material_type === 'fabric' ? <FaCut /> : <FaTags />}
                    Material #{index + 1}
                  </h3>
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

                {/* Material Type Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleMaterialChange(index, 'material_type', 'fabric')}
                      className={`flex-1 px-3 py-2 rounded border transition-all flex items-center justify-center gap-2 ${
                        material.material_type === 'fabric'
                          ? 'bg-purple-500 border-purple-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400'
                      }`}
                    >
                      <FaCut />
                      Fabric
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMaterialChange(index, 'material_type', 'accessories')}
                      className={`flex-1 px-3 py-2 rounded border transition-all flex items-center justify-center gap-2 ${
                        material.material_type === 'accessories'
                          ? 'bg-pink-500 border-pink-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-pink-400'
                      }`}
                    >
                      <FaTags />
                      Accessories
                    </button>
                  </div>
                </div>

                {/* Fabric Fields */}
                {material.material_type === 'fabric' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Fabric Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fabric Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={material.fabric_name}
                        onChange={(e) => handleMaterialChange(index, 'fabric_name', e.target.value)}
                        placeholder="e.g., Cotton Plain Fabric"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Fabric Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fabric Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={material.fabric_type}
                        onChange={(e) => handleMaterialChange(index, 'fabric_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Cotton">Cotton</option>
                        <option value="Polyester">Polyester</option>
                        <option value="Cotton Blend">Cotton Blend</option>
                        <option value="Silk">Silk</option>
                        <option value="Wool">Wool</option>
                        <option value="Linen">Linen</option>
                        <option value="Denim">Denim</option>
                        <option value="Viscose">Viscose</option>
                        <option value="Nylon">Nylon</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={material.color}
                        onChange={(e) => handleMaterialChange(index, 'color', e.target.value)}
                        placeholder="e.g., Navy Blue, White"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* GSM */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GSM (Grams/m²)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={material.gsm}
                        onChange={(e) => handleMaterialChange(index, 'gsm', e.target.value)}
                        placeholder="e.g., 180"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Width */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width
                      </label>
                      <input
                        type="text"
                        value={material.width}
                        onChange={(e) => handleMaterialChange(index, 'width', e.target.value)}
                        placeholder="e.g., 60 inches, 150 cm"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Shrinkage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shrinkage %
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={material.shrinkage}
                        onChange={(e) => handleMaterialChange(index, 'shrinkage', e.target.value)}
                        placeholder="e.g., 3"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Finish Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Finish Type
                      </label>
                      <select
                        value={material.finish_type}
                        onChange={(e) => handleMaterialChange(index, 'finish_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                      >
                        <option value="">Select Finish</option>
                        <option value="Plain">Plain</option>
                        <option value="Mercerized">Mercerized</option>
                        <option value="Sanforized">Sanforized</option>
                        <option value="Brushed">Brushed</option>
                        <option value="Calendered">Calendered</option>
                        <option value="Water Repellent">Water Repellent</option>
                        <option value="Wrinkle Free">Wrinkle Free</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Color Variants */}
                    <div className="md:col-span-3">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FaPalette className="text-purple-500" />
                          Color Variants <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => addColorVariant(index)}
                          className="flex items-center text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                        >
                          <FaPlus className="mr-1" />
                          Add Color
                        </button>
                      </div>
                      
                      <div className="space-y-3 bg-white p-3 rounded border border-purple-200">
                        {material.colorVariants?.map((variant, variantIndex) => (
                          <div key={variantIndex} className="flex gap-3 items-end p-2 bg-purple-50 rounded">
                            {/* Color */}
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                              <input
                                type="text"
                                value={variant.color}
                                onChange={(e) => handleColorVariantChange(index, variantIndex, 'color', e.target.value)}
                                placeholder="e.g., Navy Blue"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                              />
                            </div>
                            
                            {/* Quantity */}
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={variant.quantity}
                                onChange={(e) => handleColorVariantChange(index, variantIndex, 'quantity', e.target.value)}
                                placeholder="0.00"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                              />
                            </div>
                            
                            {/* Notes */}
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                              <input
                                type="text"
                                value={variant.notes}
                                onChange={(e) => handleColorVariantChange(index, variantIndex, 'notes', e.target.value)}
                                placeholder="Optional notes"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                              />
                            </div>
                            
                            {/* Remove Button */}
                            {material.colorVariants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeColorVariant(index, variantIndex)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={material.unit}
                        onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                        required
                      >
                        <optgroup label="Length">
                          <option value="meters">Meters (m)</option>
                          <option value="centimeters">Centimeters (cm)</option>
                          <option value="yards">Yards (yd)</option>
                          <option value="inches">Inches (in)</option>
                          <option value="feet">Feet (ft)</option>
                        </optgroup>
                        <optgroup label="Weight">
                          <option value="kilograms">Kilograms (kg)</option>
                          <option value="grams">Grams (g)</option>
                          <option value="pounds">Pounds (lbs)</option>
                          <option value="ounces">Ounces (oz)</option>
                        </optgroup>
                        <optgroup label="Volume">
                          <option value="liters">Liters (L)</option>
                          <option value="milliliters">Milliliters (ml)</option>
                          <option value="gallons">Gallons (gal)</option>
                        </optgroup>
                        <optgroup label="Others">
                          <option value="rolls">Rolls</option>
                          <option value="bolts">Bolts</option>
                          <option value="pieces">Pieces</option>
                          <option value="sets">Sets</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        value={material.description}
                        onChange={(e) => handleMaterialChange(index, 'description', e.target.value)}
                        placeholder="Any additional notes or special requirements..."
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Image Upload for Design Reference */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaImage className="text-purple-500" />
                        Design / Reference Images
                      </label>
                      
                      <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e.target.files)}
                          className="hidden"
                          id={`image-upload-${index}`}
                        />
                        <label htmlFor={`image-upload-${index}`} className="cursor-pointer text-center block">
                          <FaImage className="mx-auto text-purple-500 mb-2 text-2xl" />
                          <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                        </label>
                      </div>

                      {/* Uploaded Images Preview */}
                      {material.images && material.images.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {material.images.map((image, imgIndex) => (
                              <div key={imgIndex} className="relative group">
                                <img
                                  src={image.preview}
                                  alt={image.name}
                                  className="w-full h-24 object-cover rounded border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index, imgIndex)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <FaTimes className="text-xs" />
                                </button>
                                <p className="text-xs text-gray-600 mt-1 truncate">{image.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Accessories Fields */}
                {material.material_type === 'accessories' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Accessory Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accessory Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={material.accessory_type}
                        onChange={(e) => handleMaterialChange(index, 'accessory_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Button">Button</option>
                        <option value="Zipper">Zipper</option>
                        <option value="Thread">Thread</option>
                        <option value="Label">Label</option>
                        <option value="Elastic">Elastic</option>
                        <option value="Hook & Eye">Hook & Eye</option>
                        <option value="Velcro">Velcro</option>
                        <option value="Lining">Lining</option>
                        <option value="Interlining">Interlining</option>
                        <option value="Tape">Tape</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="text"
                        value={material.accessory_color}
                        onChange={(e) => handleMaterialChange(index, 'accessory_color', e.target.value)}
                        placeholder="e.g., Black, White, Gold"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Size/Length */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size / Length
                      </label>
                      <input
                        type="text"
                        value={material.size_length}
                        onChange={(e) => handleMaterialChange(index, 'size_length', e.target.value)}
                        placeholder="e.g., 12mm, 20 inches"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Quantity Per Unit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity Per Unit
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={material.quantity_per_unit}
                        onChange={(e) => handleMaterialChange(index, 'quantity_per_unit', e.target.value)}
                        placeholder="e.g., 4 (buttons per garment)"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Brand */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={material.brand}
                        onChange={(e) => handleMaterialChange(index, 'brand', e.target.value)}
                        placeholder="e.g., YKK, Coats"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={material.quantity_required}
                        onChange={(e) => handleMaterialChange(index, 'quantity_required', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-blue-500"
                        required
                      >
                        <optgroup label="Count">
                          <option value="pieces">Pieces</option>
                          <option value="units">Units</option>
                          <option value="boxes">Boxes</option>
                          <option value="dozens">Dozens</option>
                          <option value="gross">Gross (144)</option>
                        </optgroup>
                        <optgroup label="Length">
                          <option value="meters">Meters (m)</option>
                          <option value="centimeters">Centimeters (cm)</option>
                          <option value="yards">Yards (yd)</option>
                          <option value="inches">Inches (in)</option>
                          <option value="feet">Feet (ft)</option>
                        </optgroup>
                        <optgroup label="Weight">
                          <option value="kilograms">Kilograms (kg)</option>
                          <option value="grams">Grams (g)</option>
                          <option value="pounds">Pounds (lbs)</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        value={material.description}
                        onChange={(e) => handleMaterialChange(index, 'description', e.target.value)}
                        placeholder="Any additional notes or special requirements..."
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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