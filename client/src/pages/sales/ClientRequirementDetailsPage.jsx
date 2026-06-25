import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaArrowLeft, FaEdit, FaCheck, FaCheckCircle, 
  FaFileInvoiceDollar, FaDownload, FaFileAlt, FaClock, 
  FaIndustry, FaTimes, FaCalculator, FaQrcode, FaPrint,
  FaUser, FaCalendar, FaEnvelope, FaPhone, FaBox, FaCog,
  FaClipboardCheck, FaImage, FaExclamationTriangle
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import QRCodeDisplay from '../../components/QRCodeDisplay';

const ClientRequirementDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  
  // Quotation Modal State
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [quotationData, setQuotationData] = useState({
    unit_price: '',
    discount_percentage: '0',
    tax_percentage: '18',
    valid_until: '',
    remarks: ''
  });

  // QR Modal state
  const [showQRModal, setShowQRModal] = useState(false);

  const fetchRequirementDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/client-requirements/${id}`);
      setRequirement(response.data);
    } catch (err) {
      console.error('Error fetching requirement details:', err);
      setError(err.response?.data?.message || 'Failed to load requirement details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirementDetails();
  }, [id]);

  // Status update handler
  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      await api.patch(`/client-requirements/${id}/status`, { status: newStatus });
      toast.success(`Requirement status updated to ${newStatus}`);
      fetchRequirementDetails();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
      setLoading(false);
    }
  };

  // Quotation Calculations
  const calculatedQuotation = useMemo(() => {
    if (!requirement) return null;
    const qty = requirement.quantity || 0;
    const unitPrice = parseFloat(quotationData.unit_price) || 0;
    const discountPercent = parseFloat(quotationData.discount_percentage) || 0;
    const taxPercent = parseFloat(quotationData.tax_percentage) || 18;

    const totalAmount = qty * unitPrice;
    const discountAmount = (totalAmount * discountPercent) / 100;
    const taxableAmount = totalAmount - discountAmount;
    const taxAmount = (taxableAmount * taxPercent) / 100;
    const finalAmount = taxableAmount + taxAmount;

    return {
      totalAmount,
      discountAmount,
      taxableAmount,
      taxAmount,
      finalAmount
    };
  }, [requirement, quotationData]);

  // Submit Quotation handler
  const handleGenerateQuotation = async (e) => {
    e.preventDefault();
    if (!quotationData.unit_price || parseFloat(quotationData.unit_price) <= 0) {
      return toast.error('Unit Price must be a positive number');
    }

    try {
      setModalLoading(true);
      await api.post(`/client-requirements/${id}/generate-quotation`, {
        unit_price: quotationData.unit_price,
        discount_percentage: quotationData.discount_percentage,
        tax_percentage: quotationData.tax_percentage,
        valid_until: quotationData.valid_until || null,
        remarks: quotationData.remarks
      });

      toast.success('Quotation generated successfully!');
      setShowQuotationModal(false);
      fetchRequirementDetails();
    } catch (err) {
      console.error('Error generating quotation:', err);
      const msg = err.response?.data?.message || 'Failed to generate quotation';
      toast.error(msg);
    } finally {
      setModalLoading(false);
    }
  };

  // Convert to Sales Order handler
  const handleConvertToSalesOrder = () => {
    if (!requirement || !requirement.quotation) {
      return toast.error('Generate a quotation first');
    }
    
    // Navigate to sales order create page with state containing prefilled parameters
    navigate('/sales/orders/create', {
      state: {
        fromRequirement: true,
        requirementId: requirement.id,
        customerName: requirement.customer_name,
        contactPerson: requirement.contact_person || '',
        phone: requirement.mobile_number || '',
        email: requirement.email || '',
        projectTitle: requirement.project_name || '',
        productName: requirement.product_name,
        productType: requirement.product_category,
        quantity: requirement.quantity,
        pricePerPiece: requirement.quotation.unit_price,
        gstPercentage: requirement.quotation.tax_percentage,
        advancePaid: '0',
        orderReference: requirement.requirement_number,
        specialInstructions: `Quotation Number: ${requirement.quotation.quotation_number}\nRequirement specifications: Material: ${requirement.material || 'N/A'}, Dim: ${requirement.dimensions || 'N/A'}, Color: ${requirement.color || 'N/A'}`
      }
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Draft': {
        color: 'bg-gradient-to-r from-gray-400 to-gray-500',
        textColor: 'text-gray-700',
        icon: <FaClock className="w-4 h-4" />,
        label: 'Draft'
      },
      'Review': {
        color: 'bg-gradient-to-r from-orange-400 to-orange-500',
        textColor: 'text-orange-700',
        icon: <FaClock className="w-4 h-4" />,
        label: 'Review'
      },
      'Approved': {
        color: 'bg-gradient-to-r from-green-500 to-green-600',
        textColor: 'text-green-700',
        icon: <FaCheckCircle className="w-4 h-4" />,
        label: 'Approved'
      },
      'Quotation Generated': {
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        textColor: 'text-blue-700',
        icon: <FaFileInvoiceDollar className="w-4 h-4" />,
        label: 'Quotation Generated'
      },
      'Converted to SO': {
        color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        textColor: 'text-purple-700',
        icon: <FaCheck className="w-4 h-4" />,
        label: 'Converted to SO'
      }
    };
    return configs[status] || configs['Draft'];
  };

  const getRequirementStages = () => {
    const stages = [
      { key: 'Requirement', label: 'Inquiry', icon: <FaFileAlt />, completed: true, active: true },
      { key: 'Quotation', label: 'Quotation', icon: <FaFileInvoiceDollar />, completed: false, active: false },
      { key: 'Sales Order', label: 'Sales Order', icon: <FaCheckCircle />, completed: false, active: false },
      { key: 'Production', label: 'Production', icon: <FaIndustry />, completed: false, active: false }
    ];

    if (requirement) {
      if (requirement.status === 'Review' || requirement.status === 'Approved') {
        stages[0].active = true;
      }
      if (requirement.status === 'Quotation Generated') {
        stages[0].completed = true;
        stages[1].active = true;
        stages[1].completed = true;
      }
      if (requirement.status === 'Converted to SO') {
        stages[0].completed = true;
        stages[1].completed = true;
        stages[2].active = true;
        stages[2].completed = true;
        stages[3].active = true;
      }
    }

    return stages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-3"></div>
          <p className="text-lg font-semibold text-gray-700">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white rounded shadow-xl p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-3xl" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Error Loading Requirement</h2>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="p-4 min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white rounded shadow-xl p-6 border-l-4 border-yellow-500">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-yellow-500 text-3xl" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Requirement Not Found</h2>
                <p className="text-gray-600 text-sm">The requested requirement details could not be found.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(requirement.status);
  const requirementStages = getRequirementStages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-4 py-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <button
            onClick={() => navigate('/sales/client-requirements')}
            className="flex items-center gap-1 text-blue-100 hover:text-white mb-1 transition-all text-xs font-normal hover:gap-2"
          >
            <FaArrowLeft className="w-3 h-3" />
            <span>Back</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-white/15 backdrop-blur-sm rounded-lg">
                  <FaClipboardList className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-xs font-normal">Requirement #</p>
                  <h1 className="text-lg font-semibold">{requirement.requirement_number}</h1>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${statusConfig.color} shadow-lg backdrop-blur-sm flex items-center gap-1`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {(requirement.status === 'Draft' || requirement.status === 'Review') && (
                <button 
                  onClick={() => navigate(`/sales/client-requirements/${requirement.id}/edit`)}
                  className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-lg hover:bg-white/30 transition-all shadow-lg font-normal text-xs border border-white/30"
                >
                  <FaEdit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
              <button 
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-lg hover:bg-white/30 transition-all shadow-lg font-normal text-xs border border-white/30"
              >
                <FaQrcode className="w-3 h-3" />
                <span>QR</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 max-w-7xl mx-auto">
        {/* Progress Stepper */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="p-1 bg-blue-100 rounded-lg">
              <FaIndustry className="text-blue-600 w-3 h-3" />
            </div>
            <h2 className="text-xs font-semibold text-gray-900">Enquiry Process Timeline</h2>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              {requirementStages.map((stage, index) => (
                <div key={stage.label} className="flex flex-col items-center flex-1 relative">
                  {index < requirementStages.length - 1 && (
                    <div className={`absolute top-3 left-1/2 w-full h-0.5 rounded-full ${
                      stage.completed ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gray-200'
                    }`} style={{ zIndex: 0 }}></div>
                  )}
                  
                  <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                    stage.completed 
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md' 
                      : stage.active 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg animate-pulse' 
                      : 'bg-gray-100 text-gray-400 ring-1 ring-gray-200'
                  }`}>
                    {stage.completed ? <FaCheckCircle className="w-3 h-3" /> : React.cloneElement(stage.icon, { className: 'w-3 h-3' })}
                  </div>
                  
                  <span className={`text-xs font-medium text-center max-w-16 ${
                    stage.active ? 'text-blue-700' : stage.completed ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
          {/* Required Date */}
          <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-100 hover:shadow-md transition-all hover:border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <div className="p-1 bg-blue-100 rounded">
                <FaCalendar className="text-blue-600 w-2.5 h-2.5" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1 py-0.5 rounded text-xxs">Date</span>
            </div>
            <p className="text-gray-600 text-xs font-normal mb-0.5">Required Date</p>
            <p className="text-sm font-semibold text-gray-900">
              {requirement.required_date ? new Date(requirement.required_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          {/* Quantity */}
          <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-100 hover:shadow-md transition-all hover:border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <div className="p-1 bg-purple-100 rounded">
                <FaBox className="text-purple-600 w-2.5 h-2.5" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-1 py-0.5 rounded text-xxs">QTY</span>
            </div>
            <p className="text-gray-600 text-xs font-normal mb-0.5">Quantity</p>
            <p className="text-sm font-semibold text-gray-900">{requirement.quantity} {requirement.unit}</p>
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-100 hover:shadow-md transition-all hover:border-green-200">
            <div className="flex items-center justify-between mb-1">
              <div className="p-1 bg-green-100 rounded">
                <FaClipboardCheck className="text-green-600 w-2.5 h-2.5" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-1 py-0.5 rounded text-xxs">CAT</span>
            </div>
            <p className="text-gray-600 text-xs font-normal mb-0.5">Category</p>
            <p className="text-sm font-semibold text-gray-900">{requirement.product_category}</p>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-100 hover:shadow-md transition-all hover:border-orange-200">
            <div className="flex items-center justify-between mb-1">
              <div className="p-1 bg-orange-100 rounded">
                <FaClock className="text-orange-600 w-2.5 h-2.5" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-1 py-0.5 rounded text-xxs">State</span>
            </div>
            <p className="text-gray-600 text-xs font-normal mb-0.5">Current Status</p>
            <p className="text-sm font-semibold text-orange-600">{requirement.status}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left / Main Columns */}
          <div className="lg:col-span-2 space-y-3">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <nav className="flex gap-1 px-2 py-1 overflow-x-auto">
                  {[
                    { id: 'details', label: 'Details', icon: <FaFileAlt className="w-3.5 h-3.5" /> },
                    { id: 'technical', label: 'Technical Specs', icon: <FaClipboardCheck className="w-3.5 h-3.5" /> },
                    { id: 'attachments', label: 'Attachments', icon: <FaImage className="w-3.5 h-3.5" /> },
                    { id: 'actions', label: 'Actions', icon: <FaCog className="w-3.5 h-3.5" /> }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 font-medium text-xs rounded-lg transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-3">
                {activeTab === 'details' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Enquiry Info */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-blue-200">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <FaFileAlt className="text-blue-600 w-3.5 h-3.5" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900">Enquiry Information</h3>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Inquiry / Project Title</span>
                            <span className="font-semibold text-gray-900">{requirement.project_name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Product Category</span>
                            <span className="font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border border-blue-200">{requirement.product_category}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Product Name</span>
                            <span className="font-semibold text-gray-900">{requirement.product_name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Quantity Required</span>
                            <span className="font-semibold text-blue-600">{requirement.quantity} {requirement.unit}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Required Date</span>
                            <span className="font-semibold text-gray-900">
                              {requirement.required_date ? new Date(requirement.required_date).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-purple-200">
                          <div className="p-1.5 bg-purple-100 rounded-lg">
                            <FaUser className="text-purple-600 w-3.5 h-3.5" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900">Customer Contact</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {requirement.customer_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{requirement.customer_name}</p>
                            {requirement.contact_person && (
                              <p className="text-xs text-gray-600 font-medium">Person: {requirement.contact_person}</p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-100">
                            <FaEnvelope className="text-purple-500 w-3 h-3 flex-shrink-0" />
                            <span className="text-gray-700 truncate text-xs">{requirement.email || 'No email id'}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-100">
                            <FaPhone className="text-purple-500 w-3 h-3 flex-shrink-0" />
                            <span className="text-gray-700 text-xs">{requirement.mobile_number || 'No contact number'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {requirement.description && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <span className="text-gray-500 text-xs block mb-1 font-semibold">Inquiry Remarks / Special Instructions</span>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{requirement.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'technical' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      { label: 'Material specification', value: requirement.material },
                      { label: 'Dimensions / sizes', value: requirement.dimensions },
                      { label: 'Weight', value: requirement.weight },
                      { label: 'Color / shades', value: requirement.color },
                      { label: 'Finish specification', value: requirement.finish },
                      { label: 'Tolerance level', value: requirement.tolerance }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2.5 border border-gray-200">
                        <label className="block text-xxs font-bold text-gray-500 uppercase mb-1 tracking-wider">
                          {item.label}
                        </label>
                        <p className="text-xs font-semibold text-gray-900">{item.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'attachments' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-900">Reference Files & Attachments</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'drawing', label: 'Technical Drawing' },
                        { key: 'pdf', label: 'PDF Specification Document' },
                        { key: 'images', label: 'Product Images' },
                        { key: 'specifications', label: 'Additional Specifications' }
                      ].map((attach) => {
                        const filePath = requirement.attachments?.[attach.key];
                        return (
                          <div key={attach.key} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50">
                            <div className="min-w-0 flex-1 mr-2">
                              <span className="text-xs block font-bold text-gray-700">{attach.label}</span>
                              <span className="text-[10px] text-gray-400 block truncate" title={filePath}>
                                {filePath ? filePath.split('-').slice(1).join('-') : 'No file uploaded'}
                              </span>
                            </div>
                            {filePath ? (
                              <a
                                href={`${api.defaults.baseURL.replace('/api', '')}${filePath}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                                title="Download File"
                              >
                                <FaDownload size={14} />
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded select-none">N/A</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-900">Process Actions</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {requirement.status === 'Draft' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus('Review')}
                            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md text-xs font-medium"
                          >
                            <FaClock size={14} />
                            <div className="text-left flex-1">
                              <p className="font-semibold">Submit for Review</p>
                              <p className="text-[10px] text-orange-100">Send enquiry for sales review</p>
                            </div>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('Approved')}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white p-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md text-xs font-medium"
                          >
                            <FaCheckCircle size={14} />
                            <div className="text-left flex-1">
                              <p className="font-semibold">Approve Directly</p>
                              <p className="text-[10px] text-green-100">Approve this customer requirement</p>
                            </div>
                          </button>
                        </>
                      )}

                      {requirement.status === 'Review' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus('Approved')}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white p-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md text-xs font-medium"
                          >
                            <FaCheck size={14} />
                            <div className="text-left flex-1">
                              <p className="font-semibold">Approve Requirement</p>
                              <p className="text-[10px] text-green-100">Enquiry is correct, approve it</p>
                            </div>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('Draft')}
                            className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white p-2.5 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-md text-xs font-medium"
                          >
                            <FaClock size={14} />
                            <div className="text-left flex-1">
                              <p className="font-semibold">Send back to Draft</p>
                              <p className="text-[10px] text-gray-100">Return to draft state for modifications</p>
                            </div>
                          </button>
                        </>
                      )}

                      {requirement.status === 'Approved' && (
                        <button
                          onClick={() => setShowQuotationModal(true)}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md text-xs font-medium"
                        >
                          <FaFileInvoiceDollar size={14} />
                          <div className="text-left flex-1">
                            <p className="font-semibold">Generate Quotation</p>
                            <p className="text-[10px] text-blue-100">Create quotation details & cost</p>
                          </div>
                        </button>
                      )}

                      {requirement.status === 'Quotation Generated' && (
                        <button
                          onClick={handleConvertToSalesOrder}
                          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-2.5 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md text-xs font-medium"
                        >
                          <FaCheckCircle size={14} />
                          <div className="text-left flex-1">
                            <p className="font-semibold">Convert to Sales Order</p>
                            <p className="text-[10px] text-purple-100">Prefill and generate formal sales order</p>
                          </div>
                        </button>
                      )}

                      {requirement.status === 'Converted to SO' && (
                        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg font-medium">
                          ✓ This requirement has been successfully converted into a formal Sales Order.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column / Sidebar details */}
          <div className="space-y-3">
            {/* Status Actions Sidebar Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3.5">
              <h3 className="text-xs font-semibold text-gray-900 mb-2 pb-1.5 border-b border-gray-100">Requirement State</h3>
              
              {requirement.status === 'Draft' && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleUpdateStatus('Review')}
                    className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                  >
                    Submit for Review
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Approved')}
                    className="w-full py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                  >
                    Approve Directly
                  </button>
                </div>
              )}

              {requirement.status === 'Review' && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleUpdateStatus('Approved')}
                    className="w-full py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                  >
                    Approve Requirement
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Draft')}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-gray-200 rounded-lg text-xs font-semibold transition-all"
                  >
                    Return to Draft
                  </button>
                </div>
              )}

              {requirement.status === 'Approved' && (
                <button
                  onClick={() => setShowQuotationModal(true)}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  <FaFileInvoiceDollar size={12} />
                  Generate Quotation
                </button>
              )}

              {requirement.status === 'Quotation Generated' && (
                <button
                  onClick={handleConvertToSalesOrder}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  <FaCheckCircle size={12} />
                  Convert to Sales Order
                </button>
              )}

              {requirement.status === 'Converted to SO' && (
                <div className="p-3 bg-green-50 text-green-700 text-xxs font-semibold rounded-lg border border-green-200">
                  Requirement has been processed as a Sales Order.
                </div>
              )}
            </div>

            {/* Quotation Details block */}
            {requirement.quotation && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3.5">
                <h3 className="text-xs font-semibold text-gray-900 mb-2 pb-1.5 border-b border-gray-100 flex items-center gap-1">
                  <FaFileInvoiceDollar className="text-blue-500" />
                  Quotation Details
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quotation No</span>
                    <span className="font-semibold text-gray-800">{requirement.quotation.quotation_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Unit Price</span>
                    <span className="font-semibold text-gray-800">₹{requirement.quotation.unit_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-semibold text-gray-800">₹{requirement.quotation.total_amount}</span>
                  </div>
                  {parseFloat(requirement.quotation.discount_amount) > 0 && (
                    <div className="flex justify-between text-orange-600 font-medium">
                      <span>Discount ({requirement.quotation.discount_percentage}%)</span>
                      <span>-₹{requirement.quotation.discount_amount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">GST ({requirement.quotation.tax_percentage}%)</span>
                    <span className="font-semibold text-gray-800">₹{requirement.quotation.tax_amount}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-slate-100 pt-1.5 text-xs font-bold text-blue-600 bg-blue-50 p-1.5 rounded">
                    <span>Final Cost</span>
                    <span>₹{requirement.quotation.final_amount}</span>
                  </div>

                  {requirement.quotation.valid_until && (
                    <div className="flex justify-between text-xxs pt-1 text-gray-500">
                      <span>Valid Until</span>
                      <span>{new Date(requirement.quotation.valid_until).toLocaleDateString()}</span>
                    </div>
                  )}

                  {requirement.quotation.remarks && (
                    <div className="pt-1.5 border-t border-gray-100 text-xxs text-gray-500 italic">
                      <span className="font-semibold block text-gray-600 not-italic">Terms:</span>
                      {requirement.quotation.remarks}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GENERATE QUOTATION MODAL */}
      {showQuotationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <FaCalculator /> Generate Quotation
              </h3>
              <button 
                onClick={() => setShowQuotationModal(false)}
                className="p-1 hover:bg-white/20 rounded transition-all text-white"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleGenerateQuotation} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                <div>
                  <span className="text-gray-400 block">Product</span>
                  <span className="font-bold text-gray-700">{requirement.product_name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Quantity</span>
                  <span className="font-bold text-blue-600">{requirement.quantity} {requirement.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Unit Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={quotationData.unit_price}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, unit_price: e.target.value }))}
                  placeholder="Enter cost per unit"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quotationData.discount_percentage}
                    onChange={(e) => setQuotationData(prev => ({ ...prev, discount_percentage: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tax / GST %</label>
                  <input
                    type="number"
                    value={quotationData.tax_percentage}
                    onChange={(e) => setQuotationData(prev => ({ ...prev, tax_percentage: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Valid Until</label>
                <input
                  type="date"
                  value={quotationData.valid_until}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, valid_until: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Remarks / Terms</label>
                <textarea
                  rows="2"
                  value={quotationData.remarks}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="e.g. 50% advance, balance upon delivery"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-gray-800"
                ></textarea>
              </div>

              {/* Real-time Pricing Preview */}
              {calculatedQuotation && (
                <div className="bg-blue-50 p-3 border border-blue-100 rounded-lg space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Base Amount:</span>
                    <span>₹{calculatedQuotation.totalAmount.toFixed(2)}</span>
                  </div>
                  {calculatedQuotation.discountAmount > 0 && (
                    <div className="flex justify-between text-orange-600 font-medium">
                      <span>Discount ({quotationData.discount_percentage}%):</span>
                      <span>-₹{calculatedQuotation.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST ({quotationData.tax_percentage}%):</span>
                    <span>₹{calculatedQuotation.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-slate-200 pt-1.5 text-xs font-extrabold text-blue-700">
                    <span>Net Total Amount:</span>
                    <span>₹{calculatedQuotation.finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuotationModal(false)}
                  className="px-4 py-1.5 border border-gray-200 bg-white text-gray-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-md"
                >
                  {modalLoading ? 'Generating...' : 'Save & Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">QR Code</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-4 flex justify-center">
              <QRCodeDisplay 
                data={{
                  requirement_id: requirement.id,
                  requirement_number: requirement.requirement_number,
                  status: requirement.status,
                  customer: requirement.customer_name,
                  product: requirement.product_name,
                  quantity: `${requirement.quantity} ${requirement.unit}`,
                  timestamp: new Date().toISOString()
                }}
                size={250}
              />
            </div>
            <p className="text-center text-gray-600 mb-4 font-semibold">{requirement.requirement_number}</p>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientRequirementDetailsPage;
