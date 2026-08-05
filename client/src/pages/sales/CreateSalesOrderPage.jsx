import React, { useState, useMemo, useEffect } from 'react';
import { FaArrowLeft, FaCheck, FaPlus, FaTrash, FaCloudUploadAlt, FaCheckCircle, FaTimesCircle, FaLock, FaDownload, FaFileAlt } from 'react-icons/fa';
import { ArrowLeft, Send, Download, FileText, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PRODUCT_TYPE_SPECS = {
  'T-Shirt': ['fabricType', 'gsm', 'color', 'size', 'fit', 'sleeveType', 'neckType'],
  'Polo T-Shirt': ['fabricType', 'gsm', 'color', 'size', 'fit', 'collarType', 'sleeveType'],
  'Shirt': ['fabricType', 'gsm', 'color', 'size', 'fit', 'collarType', 'sleeveType', 'cuffType'],
  'Formal Shirt': ['fabricType', 'gsm', 'color', 'size', 'fit', 'collarType', 'sleeveType', 'cuffType'],
  'Hoodie': ['fabricType', 'gsm', 'color', 'size', 'fit', 'hoodType', 'pocketType', 'sleeveType'],
  'Sweatshirt': ['fabricType', 'gsm', 'color', 'size', 'fit', 'neckType', 'sleeveType'],
  'Jacket': ['fabricType', 'gsm', 'color', 'size', 'fit', 'closureType', 'lining', 'sleeveType'],
  'Blazer': ['fabricType', 'gsm', 'fit', 'lapelType', 'sleeveType', 'lining'],
  'Jeans': ['fabricType', 'gsm', 'color', 'fit', 'waistSize', 'length', 'rise', 'stretchType', 'legOpening', 'washType', 'pocketStyle', 'buttonType', 'zipperType'],
  'Trouser': ['fabricType', 'gsm', 'color', 'size', 'fit', 'waistSize', 'length'],
  'Pant': ['fabricType', 'gsm', 'color', 'size', 'fit', 'waistSize', 'length'],
  'Cargo Pant': ['fabricType', 'gsm', 'color', 'size', 'fit', 'waistSize', 'length'],
  'Jogger': ['fabricType', 'gsm', 'color', 'fit', 'waistSize', 'ankleStyle'],
  'Track Pant': ['fabricType', 'gsm', 'color', 'fit', 'waistSize', 'length'],
  'Shorts': ['fabricType', 'gsm', 'color', 'fit', 'waistSize', 'length'],
  'Uniform': ['fabricType', 'gsm', 'color', 'fit', 'department', 'logoType'],
  'Safety Wear': ['fabricType', 'gsm', 'color', 'reflectiveType', 'safetyStandard'],
  'Kurti': ['fabricType', 'gsm', 'color', 'neckType', 'sleeveType', 'length'],
  'Saree': ['fabricType', 'color', 'length', 'borderType', 'blousePiece'],
  'Custom Product': ['material', 'dimensions', 'weight', 'color', 'technicalNotes'],
  'Industrial Parts': ['partNumber', 'drawingNumber', 'material', 'dimensions', 'weight', 'surfaceFinish', 'tolerance', 'manufacturingProcess', 'heatTreatment'],
  'Bottle': ['capacity', 'material', 'bottleColor', 'capType', 'capColor', 'neckSize', 'foodGrade'],
  'Bag': ['material', 'bagSize', 'compartments', 'handleType', 'zipType', 'branding'],
  'Stationery / Books': ['paperType', 'paperGsm', 'pageCount', 'bindingType', 'coverLamination', 'printingColors', 'finishing'],
  'Promotional / Gifting': ['productTypeField', 'material', 'dimensions', 'color', 'logoPosition', 'printingMethod', 'giftBox', 'packaging', 'productDescription'],
  'Others': ['material', 'size', 'color', 'weight']
};

const CreateSalesOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isFromRequirement = !!(location.state && location.state.fromRequirement);
  
  // State for order data
  const [orderData, setOrderData] = useState({
    // PRIMARY IDENTIFIERS
    projectTitle: '',
    customerName: '',
    email: '',
    phone: '',
    contactPerson: '',
    clientPoNumber: '',
    
    // REFERENCE INFO
    clientRequirementId: '',
    quotationId: '',
    orderReference: '', // Client Requirement No
    quotationNo: '',
    salesPerson: '',
    deliveryTerms: '',
    paymentTerms: '',
    
    // PRODUCT DETAILS
    productName: '',
    productType: '',
    productCategory: '',
    fabricType: '',
    color: '',
    quantity: '',
    unit: 'Pcs',
    pricePerPiece: '',
    discountPercentage: '0',
    gstPercentage: '18',
    specialInstructions: '',
    
    // TECHNICAL SPECS
    gsm: '',
    size: '',
    fit: '',
    pattern: '',
    sleeveType: '',
    neckType: '',
    printType: '',
    embroidery: '',
    packingType: '',
    customerInstructions: '',
    
    // JEANS / LOWER BODY SPECIFIC
    rise: '',
    legOpening: '',
    washType: '',
    pocketStyle: '',
    buttonType: '',
    zipperType: '',
    
    // ADDITIONAL COMPREHENSIVE FIELDS FOR ALL PRODUCT TYPES
    collarType: '',
    cuffType: '',
    hoodType: '',
    pocketType: '',
    closureType: '',
    lining: '',
    lapelType: '',
    waistSize: '',
    length: '',
    stretchType: '',
    ankleStyle: '',
    department: '',
    logoType: '',
    reflectiveType: '',
    safetyStandard: '',
    borderType: '',
    blousePiece: '',
    material: '',
    dimensions: '',
    weight: '',
    technicalNotes: '',
    partNumber: '',
    drawingNumber: '',
    surfaceFinish: '',
    tolerance: '',
    manufacturingProcess: '',
    heatTreatment: '',
    capacity: '',
    bottleColor: '',
    capType: '',
    capColor: '',
    neckSize: '',
    foodGrade: '',
    bagSize: '',
    compartments: '',
    handleType: '',
    zipType: '',
    branding: '',
    paperType: '',
    paperGsm: '',
    pageCount: '',
    bindingType: '',
    coverLamination: '',
    printingColors: '',
    finishing: '',
    productTypeField: '',
    logoPosition: '',
    printingMethod: '',
    giftBox: '',
    packaging: '',
    productDescription: '',
    
    // DOCUMENTS / ATTACHMENTS
    designFiles: [], 
    
    // DELIVERY INFO
    expectedDeliveryDate: '',
    deliveryAddress: '',
    address: '', // Billing Address
    transportMode: '',
    shippingMethod: '',
    priority: 'medium',
    dispatchInstructions: '',
    
    // INTERNAL
    orderDate: new Date().toISOString().split('T')[0],
    productCode: '',
    sizeOption: 'fixed',
    sizeDetails: [],
    itemsList: [],
  });

  const [loadingRequirement, setLoadingRequirement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [currentSection, setCurrentSection] = useState('customer_so'); // Tab control
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [imagePreviews, setImagePreviews] = useState([]);

  const productTypes = [
    'Shirt',
    'T-Shirt', 
    'Polo Shirt',
    'Pant',
    'Trouser',
    'Jeans',
    'Jacket',
    'Blazer',
    'Uniform',
    'Kurta',
    'Other'
  ];
  
  // Helper to determine the normalized product type key from specs mapping
  const getProductTypeKey = () => {
    const pName = (orderData.productName || '').trim();
    const pType = (orderData.productType || '').trim();
    
    const possibleMatches = [
      pName,
      pType,
      location.state?.productType
    ];

    for (const match of possibleMatches) {
      if (!match) continue;
      const normalized = match.toLowerCase().replace(/\s+/g, '');
      
      // Try to find exact or close match in keys of PRODUCT_TYPE_SPECS
      for (const key of Object.keys(PRODUCT_TYPE_SPECS)) {
        const keyNorm = key.toLowerCase().replace(/\s+/g, '');
        if (normalized === keyNorm || normalized.includes(keyNorm) || keyNorm.includes(normalized)) {
          return key;
        }
      }
    }

    // Default to category-based matching
    if (pType === 'Industrial Parts') return 'Industrial Parts';
    if (pType === 'Bottle' || pType === 'Bottles') return 'Bottle';
    if (pType === 'Bag' || pType === 'Bags') return 'Bag';
    if (pType === 'Stationery / Books') return 'Stationery / Books';
    if (pType === 'Promotional / Gifting') return 'Promotional / Gifting';
    if (pType === 'Custom Product') return 'Custom Product';
    
    return 'Others';
  };

  // Helper to dynamically filter technical specifications based on product type spec mapping
  const isFieldVisible = (fieldName) => {
    const typeKey = getProductTypeKey();
    const allowedFields = PRODUCT_TYPE_SPECS[typeKey] || PRODUCT_TYPE_SPECS['Others'];
    return allowedFields.includes(fieldName);
  };

  // Auto-fetch and prefill details
  useEffect(() => {
    const fetchRequirementAndPrefill = async () => {
      if (location.state && location.state.requirementId) {
        setLoadingRequirement(true);
        try {
          const res = await api.get(`/client-requirements/${location.state.requirementId}`);
          const d = res.data;
          
          // Map attachments if present
          const mainAttachments = d.attachments || {};
          const productAttachments = d.products?.[0]?.attachments || {};
          const mergedAttachments = { ...mainAttachments, ...productAttachments };
          const prefilledFiles = [];
          Object.entries(mergedAttachments).forEach(([key, val]) => {
            if (val) {
              prefilledFiles.push({
                name: val.split('/').pop() || `${key}_doc`,
                path: val,
                preview: val.startsWith('/uploads') ? `${api.defaults.baseURL.replace('/api', '')}${val}` : val,
                isExisting: true,
                label: key
              });
            }
          });

          const rfqHistory = d.rfq_history || [];
          const approvedRfq = rfqHistory.find(r => r.status === 'Approved') || rfqHistory[rfqHistory.length - 1];
          const approvedRfqItems = approvedRfq?.rfqItems || [];

          const itemsList = (d.products || []).map((p, idx) => {
            const rfqItem = approvedRfqItems.find(ri => ri.product_name === p.product_name) || approvedRfqItems[idx] || {};
            
            const sizeReq = p.clothing_data?.sizes_required || {};
            const sizeBreakdown = p.clothing_data?.size_breakdown || {};
            const parsedSizes = Object.keys(sizeReq)
              .filter(sizeKey => sizeReq[sizeKey])
              .map(sizeKey => ({ 
                size: sizeKey, 
                quantity: sizeBreakdown[sizeKey] || '' 
              }));

            const clothing = p.clothing_data || {};
            const details = p.category_details || {};
            const resolvedProductType = clothing.product_type || 
                                        details.bottle_type || 
                                        details.bag_type || 
                                        details.promo_product_type || 
                                        details.stationery_product_type || 
                                        p.product_category || d.product_category || '';

            const productCode = p.product_code || generateProductCode(p.product_name, resolvedProductType);

            return {
              productName: p.product_name || '',
              productCategory: p.product_category || d.product_category || '',
              productType: resolvedProductType,
              quantity: p.quantity || 0,
              unit: p.unit || 'Pcs',
              pricePerPiece: rfqItem.unit_cost || '',
              gstPercentage: rfqItem.gst_percentage || '18',
              discountPercentage: rfqItem.discount_percentage || '0',
              
              // Technical specifications
              fabricType: clothing.fabric_composition || clothing.fabric_type || details.material || details.bag_material || details.promo_material || details.custom_material || details.other_material || '',
              gsm: clothing.fabric_gsm || details.paper_gsm || '',
              color: clothing.colors?.join(', ') || details.bottle_color || details.custom_color || details.other_color || '',
              size: clothing.waist_size && clothing.length 
                ? `W: ${clothing.waist_size}, L: ${clothing.length}`
                : (Object.keys(sizeReq).filter(k => sizeReq[k]).join(', ') || details.bag_size || details.custom_size || details.other_size || ''),
              fit: clothing.fit || '',
              pattern: clothing.pattern || clothing.product_type || '',
              sleeveType: clothing.sleeve_type || '',
              neckType: clothing.neck_type || '',
              printType: clothing.printing_required ? Object.keys(clothing.printing_required).filter(k => clothing.printing_required[k]).join(', ') : (details.printing_type || details.printing || details.print_type || ''),
              embroidery: clothing.embroidery || '',
              packingType: clothing.packing_type || details.packing_type || '',
              customerInstructions: clothing.special_instructions || p.special_instructions || '',
              
              // Jeans/lower body specific
              rise: clothing.rise || '',
              legOpening: clothing.leg_opening || '',
              washType: clothing.wash_type || '',
              pocketStyle: clothing.pocket_style || '',
              buttonType: clothing.button_type || '',
              zipperType: clothing.zipper_type || '',

              // Additional specs
              collarType: clothing.collar_type || '',
              cuffType: clothing.cuff_type || '',
              hoodType: clothing.hood_type || '',
              pocketType: clothing.pocket_type || details.pocket_type || '',
              closureType: clothing.closure_type || '',
              lining: clothing.lining || '',
              lapelType: clothing.lapel_type || '',
              waistSize: clothing.waist_size || clothing.waist || '',
              length: clothing.length || details.length || '',
              stretchType: clothing.stretch_type || '',
              ankleStyle: clothing.ankle_style || '',
              department: clothing.department || '',
              logoType: clothing.logo || clothing.logo_type || '',
              reflectiveType: clothing.reflective_type || '',
              safetyStandard: clothing.safety_standard || '',
              borderType: clothing.border_type || '',
              blousePiece: clothing.blouse_piece || '',
              material: details.material || details.bag_material || details.promo_material || details.custom_material || details.other_material || '',
              dimensions: details.dimensions || details.bag_size || details.custom_size || details.other_size || '',
              weight: details.weight || details.custom_weight || details.other_weight || '',
              technicalNotes: details.technical_notes || '',
              partNumber: details.part_number || '',
              drawingNumber: details.drawing_number || '',
              surfaceFinish: details.surface_finish || '',
              tolerance: details.tolerance || '',
              manufacturingProcess: details.manufacturing_process || '',
              heatTreatment: details.heat_treatment || '',
              capacity: details.capacity || '',
              bottleColor: details.bottle_color || '',
              capType: details.cap_type || '',
              capColor: details.cap_color || '',
              neckSize: details.neck_size || '',
              foodGrade: details.food_grade || '',
              bagSize: details.bag_size || '',
              compartments: details.compartments || '',
              handleType: details.handle_type || '',
              zipType: details.zip_type || '',
              branding: details.branding || '',
              paperType: details.paper_type || '',
              paperGsm: details.paper_gsm || '',
              pageCount: details.page_count || '',
              bindingType: details.binding_type || '',
              coverLamination: details.cover_lamination || '',
              printingColors: details.printing_colors || '',
              finishing: details.finishing || '',
              productTypeField: details.promo_product_type || '',
              logoPosition: details.logo_position || '',
              printingMethod: details.printing_method || '',
              giftBox: details.gift_box || '',
              packaging: details.packaging || '',
              productDescription: details.product_description_detailed || details.other_description || '',

              productCode,
              sizeDetails: parsedSizes,
              attachments: p.attachments || {}
            };
          });

          setOrderData((prev) => ({
            ...prev,
            customerName: d.customer_name || '',
            contactPerson: d.contact_person || '',
            phone: d.mobile_number || '',
            email: d.email || '',
            gstNumber: d.customer_gstin || '',
            address: d.customer_address || '',
            deliveryAddress: d.delivery_address || d.customer_address || '',
            projectTitle: d.project_name || '',
            orderReference: d.requirement_number || '',
            quotationNo: d.quotation?.quotation_number || '',
            clientRequirementId: d.id,
            quotationId: d.quotation?.id || '',
            itemsList: itemsList,
            ...(itemsList[0] || {})
          }));
          toast.success('Auto-fetched all Client Requirement details!');
        } catch (err) {
          console.error('Error loading client requirement:', err);
          toast.error('Failed to auto-fetch Client Requirement details');
        } finally {
          setLoadingRequirement(false);
        }
      }
    };
    fetchRequirementAndPrefill();
  }, [location.state]);

  // Auto-generate product code
  const generateProductCode = (name, type) => {
    if (!name) return '';
    const prefix = type ? type.substring(0, 3).toUpperCase() : 'PRD';
    const namePart = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${namePart}-${timestamp}`;
  };

  // Auto-calculate values
  const calculations = useMemo(() => {
    const list = orderData.itemsList && orderData.itemsList.length > 0 ? orderData.itemsList : [orderData];
    
    let totalQty = 0;
    let subtotal = 0;
    let discountAmount = 0;
    let gstAmount = 0;
    
    list.forEach(item => {
      let itemQty = item.sizeDetails?.reduce((sum, size) => sum + (parseFloat(size.quantity) || 0), 0) || 0;
      if (itemQty === 0) {
        itemQty = parseFloat(item.quantity) || 0;
      }
      
      const price = parseFloat(item.pricePerPiece) || 0;
      const base = itemQty * price;
      const discPercent = parseFloat(item.discountPercentage) || 0;
      const itemDisc = (base * discPercent) / 100;
      const taxable = base - itemDisc;
      
      const gst = parseFloat(item.gstPercentage) || 0;
      const itemTax = (taxable * gst) / 100;
      
      totalQty += itemQty;
      subtotal += base;
      discountAmount += itemDisc;
      gstAmount += itemTax;
    });
    
    const taxableAmount = subtotal - discountAmount;
    const grandTotal = taxableAmount + gstAmount;
    const advance = parseFloat(orderData.advancePaid) || 0;
    const remainingAmount = grandTotal - advance;
    
    return {
      totalQty,
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxableAmount: taxableAmount.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      remainingAmount: remainingAmount.toFixed(2)
    };
  }, [orderData.itemsList, orderData.sizeDetails, orderData.quantity, orderData.pricePerPiece, orderData.discountPercentage, orderData.gstPercentage, orderData.advancePaid]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setOrderData((prev) => {
      const updated = { ...prev, [field]: value };
      
      if (prev.itemsList && prev.itemsList.length > 0) {
        const itemFields = [
          'productName', 'productCategory', 'productType', 'quantity', 'unit',
          'pricePerPiece', 'gstPercentage', 'discountPercentage', 'fabricType', 'gsm',
          'color', 'size', 'fit', 'pattern', 'sleeveType', 'neckType', 'printType',
          'embroidery', 'packingType', 'customerInstructions', 'rise', 'legOpening',
          'washType', 'pocketStyle', 'buttonType', 'zipperType', 'collarType', 'cuffType',
          'hoodType', 'pocketType', 'closureType', 'lining', 'lapelType', 'waistSize',
          'length', 'stretchType', 'ankleStyle', 'department', 'logoType', 'reflectiveType',
          'safetyStandard', 'borderType', 'blousePiece', 'material', 'dimensions', 'weight',
          'technicalNotes', 'partNumber', 'drawingNumber', 'surfaceFinish', 'tolerance',
          'manufacturingProcess', 'heatTreatment', 'capacity', 'bottleColor', 'capType',
          'capColor', 'neckSize', 'foodGrade', 'bagSize', 'compartments', 'handleType',
          'zipType', 'branding', 'paperType', 'paperGsm', 'pageCount', 'bindingType',
          'coverLamination', 'printingColors', 'finishing', 'productTypeField', 'logoPosition',
          'printingMethod', 'giftBox', 'packaging', 'productDescription', 'productCode'
        ];
        
        if (itemFields.includes(field)) {
          const updatedItemsList = [...prev.itemsList];
          const activeItem = { ...updatedItemsList[activeItemIndex], [field]: value };
          if (field === 'productName' || field === 'productType') {
            activeItem.productCode = generateProductCode(activeItem.productName, activeItem.productType);
          }
          updatedItemsList[activeItemIndex] = activeItem;
          updated.itemsList = updatedItemsList;
        }
      } else {
        if (field === 'productName' || field === 'productType') {
          const productType = field === 'productType' ? value : prev.productType;
          const productName = field === 'productName' ? value : prev.productName;
          updated.productCode = generateProductCode(productName, productType);
        }
      }
      
      return updated;
    });
  };

  // Handle size details
  const handleSizeDetailChange = (index, field, value) => {
    setOrderData((prev) => {
      const newSizeDetails = [...prev.sizeDetails];
      newSizeDetails[index] = { ...newSizeDetails[index], [field]: value };
      
      const updated = { ...prev, sizeDetails: newSizeDetails };
      
      if (prev.itemsList && prev.itemsList.length > 0) {
        const updatedItemsList = [...prev.itemsList];
        const activeItem = { 
          ...updatedItemsList[activeItemIndex], 
          sizeDetails: newSizeDetails 
        };
        updatedItemsList[activeItemIndex] = activeItem;
        updated.itemsList = updatedItemsList;
      }
      
      return updated;
    });
  };

  const handleSelectActiveItem = (index) => {
    setActiveItemIndex(index);
    setOrderData(prev => {
      if (!prev.itemsList || !prev.itemsList[index]) return prev;
      return {
        ...prev,
        ...prev.itemsList[index],
        itemsList: prev.itemsList
      };
    });
  };

  const addSizeDetail = () => {
    setOrderData((prev) => {
      const newSizeDetails = [...prev.sizeDetails, { size: '', quantity: '' }];
      const updated = { ...prev, sizeDetails: newSizeDetails };
      if (prev.itemsList && prev.itemsList.length > 0) {
        const updatedItemsList = [...prev.itemsList];
        updatedItemsList[activeItemIndex] = { ...updatedItemsList[activeItemIndex], sizeDetails: newSizeDetails };
        updated.itemsList = updatedItemsList;
      }
      return updated;
    });
  };

  const removeSizeDetail = (index) => {
    setOrderData((prev) => {
      const newSizeDetails = prev.sizeDetails.filter((_, i) => i !== index);
      const updated = { ...prev, sizeDetails: newSizeDetails };
      if (prev.itemsList && prev.itemsList.length > 0) {
        const updatedItemsList = [...prev.itemsList];
        updatedItemsList[activeItemIndex] = { ...updatedItemsList[activeItemIndex], sizeDetails: newSizeDetails };
        updated.itemsList = updatedItemsList;
      }
      return updated;
    });
  };

  // Handle multiple file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 5MB limit`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrderData(prev => ({
          ...prev,
          designFiles: [...prev.designFiles, { file, name: file.name, preview: reader.result, isExisting: false }]
        }));
        toast.success(`"${file.name}" uploaded successfully`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveDesignFile = (index) => {
    setOrderData(prev => ({
      ...prev,
      designFiles: prev.designFiles.filter((_, i) => i !== index)
    }));
    toast.success('Attachment removed');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validation
    if (!orderData.customerName.trim()) {
      setSubmitError('Customer name is required');
      return;
    }
    if (!orderData.projectTitle.trim()) {
      setSubmitError('Project/Order title is required');
      return;
    }
    if (!orderData.expectedDeliveryDate) {
      setSubmitError('Expected delivery date is required');
      return;
    }

    if (orderData.itemsList && orderData.itemsList.length > 0) {
      for (let i = 0; i < orderData.itemsList.length; i++) {
        const item = orderData.itemsList[i];
        if (!item.productName.trim()) {
          setSubmitError(`Product Name is required for Item ${i + 1}`);
          return;
        }
        if (parseFloat(item.quantity) <= 0) {
          setSubmitError(`Quantity must be greater than 0 for Item ${i + 1} (${item.productName})`);
          return;
        }
        if (!item.pricePerPiece || parseFloat(item.pricePerPiece) <= 0) {
          setSubmitError(`Price per piece must be greater than 0 for Item ${i + 1} (${item.productName})`);
          return;
        }
      }
    } else {
      if (!orderData.productName.trim()) {
        setSubmitError('Product name is required');
        return;
      }
      if (parseFloat(calculations.totalQty) <= 0) {
        setSubmitError('Total quantity must be greater than 0. Please enter quantity or add size details.');
        return;
      }
      if (!orderData.pricePerPiece || parseFloat(orderData.pricePerPiece) <= 0) {
        setSubmitError('Price per piece must be greater than 0');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const finalProductType = orderData.productType === 'Other' ? orderData.customProductType : orderData.productType;

      const payloadItems = (orderData.itemsList && orderData.itemsList.length > 0)
        ? orderData.itemsList.map((item, index) => {
            const itemProductType = item.productType === 'Other' ? item.customProductType : item.productType;
            const itemCode = item.productCode || `PRD-${Date.now()}-${index}`;
            
            // Build item specs dictionary
            const itemSpecs = {
              fabric_type: item.fabricType,
              gsm: item.gsm,
              color: item.color,
              size: item.size,
              fit: item.fit,
              pattern: item.pattern,
              sleeve_type: item.sleeveType,
              neck_type: item.neckType,
              print_type: item.printType,
              embroidery: item.embroidery,
              packing_type: item.packingType,
              customer_instructions: item.customerInstructions,
              rise: item.rise,
              leg_opening: item.legOpening,
              wash_type: item.washType,
              pocket_style: item.pocketStyle,
              button_type: item.buttonType,
              zipper_type: item.zipperType,
              collar_type: item.collarType,
              cuff_type: item.cuffType,
              hood_type: item.hoodType,
              pocket_type: item.pocketType,
              closure_type: item.closureType,
              lining: item.lining,
              lapel_type: item.lapelType,
              waist_size: item.waistSize,
              length: item.length,
              stretch_type: item.stretchType,
              ankle_style: item.ankleStyle,
              department: item.department,
              logo_type: item.logoType,
              reflective_type: item.reflectiveType,
              safety_standard: item.safetyStandard,
              border_type: item.borderType,
              blouse_piece: item.blousePiece,
              material: item.material,
              dimensions: item.dimensions,
              weight: item.weight,
              technical_notes: item.technicalNotes,
              part_number: item.partNumber,
              drawing_number: item.drawingNumber,
              surface_finish: item.surfaceFinish,
              tolerance: item.tolerance,
              manufacturing_process: item.manufacturingProcess,
              heat_treatment: item.heatTreatment,
              capacity: item.capacity,
              bottle_color: item.bottleColor,
              cap_type: item.capType,
              cap_color: item.capColor,
              neck_size: item.neckSize,
              food_grade: item.foodGrade,
              bag_size: item.bagSize,
              compartments: item.compartments,
              handle_type: item.handleType,
              zip_type: item.zipType,
              branding: item.branding,
              paper_type: item.paperType,
              paper_gsm: item.paperGsm,
              page_count: item.pageCount,
              binding_type: item.bindingType,
              cover_lamination: item.coverLamination,
              printing_colors: item.printingColors,
              finishing: item.finishing,
              product_type_field: item.productTypeField,
              logo_position: item.logoPosition,
              printing_method: item.printingMethod,
              gift_box: item.giftBox,
              packaging: item.packaging,
              product_description: item.productDescription
            };

            return {
              item_code: itemCode,
              product_id: itemCode,
              product_type: itemProductType,
              fabric_type: item.fabricType || null,
              color: item.color || null,
              description: item.productName,
              quantity: parseFloat(item.quantity) || 0,
              unit_price: parseFloat(item.pricePerPiece) || 0,
              unit_of_measure: item.unit || 'Pcs',
              size_breakdown: item.sizeDetails || null,
              specifications: itemSpecs,
              remarks: `${itemProductType} - ${item.fabricType || 'N/A'} - ${item.color || 'N/A'}`
            };
          })
        : [
            {
              item_code: orderData.productCode || `PRD-${Date.now()}-0`,
              product_id: orderData.productCode || `PRD-${Date.now()}-0`,
              product_type: finalProductType,
              fabric_type: orderData.fabricType || null,
              color: orderData.color || null,
              description: orderData.productName,
              quantity: parseFloat(calculations.totalQty),
              unit_price: parseFloat(orderData.pricePerPiece),
              unit_of_measure: orderData.unit || 'Pcs',
              size_breakdown: orderData.sizeDetails || null,
              specifications: {
                fabric_type: orderData.fabricType,
                gsm: orderData.gsm,
                color: orderData.color,
                size: orderData.size,
                fit: orderData.fit,
                pattern: orderData.pattern,
                sleeve_type: orderData.sleeveType,
                neck_type: orderData.neckType,
                print_type: orderData.printType,
                embroidery: orderData.embroidery,
                packing_type: orderData.packingType,
                customer_instructions: orderData.customerInstructions,
                rise: orderData.rise,
                leg_opening: orderData.legOpening,
                wash_type: orderData.washType,
                pocket_style: orderData.pocketStyle,
                button_type: orderData.buttonType,
                zipper_type: orderData.zipperType,
                collar_type: orderData.collarType,
                cuff_type: orderData.cuffType,
                hood_type: orderData.hoodType,
                pocket_type: orderData.pocketType,
                closure_type: orderData.closureType,
                lining: orderData.lining,
                lapel_type: orderData.lapelType,
                waist_size: orderData.waistSize,
                length: orderData.length,
                stretch_type: orderData.stretchType,
                ankle_style: orderData.ankleStyle,
                department: orderData.department,
                logo_type: orderData.logoType,
                reflective_type: orderData.reflectiveType,
                safety_standard: orderData.safetyStandard,
                border_type: orderData.borderType,
                blouse_piece: orderData.blousePiece,
                material: orderData.material,
                dimensions: orderData.dimensions,
                weight: orderData.weight,
                technical_notes: orderData.technicalNotes,
                part_number: orderData.partNumber,
                drawing_number: orderData.drawingNumber,
                surface_finish: orderData.surfaceFinish,
                tolerance: orderData.tolerance,
                manufacturing_process: orderData.manufacturingProcess,
                heat_treatment: orderData.heatTreatment,
                capacity: orderData.capacity,
                bottle_color: orderData.bottleColor,
                cap_type: orderData.capType,
                cap_color: orderData.capColor,
                neck_size: orderData.neckSize,
                food_grade: orderData.foodGrade,
                bag_size: orderData.bagSize,
                compartments: orderData.compartments,
                handle_type: orderData.handleType,
                zip_type: orderData.zipType,
                branding: orderData.branding,
                paper_type: orderData.paperType,
                paper_gsm: orderData.paperGsm,
                page_count: orderData.pageCount,
                binding_type: orderData.bindingType,
                cover_lamination: orderData.coverLamination,
                printing_colors: orderData.printingColors,
                finishing: orderData.finishing,
                product_type_field: orderData.productTypeField,
                logo_position: orderData.logoPosition,
                printing_method: orderData.printingMethod,
                gift_box: orderData.giftBox,
                packaging: orderData.packaging,
                product_description: orderData.productDescription
              },
              remarks: `${finalProductType} - ${orderData.fabricType || 'N/A'} - ${orderData.color || 'N/A'}`
            }
          ];

      const payload = {
        customer_name: orderData.customerName.trim(),
        customer_email: orderData.email || null,
        customer_phone: orderData.phone || null,
        customer_address: orderData.address || orderData.deliveryAddress || null,
        contact_person: orderData.contactPerson || null,
        gst_number: orderData.gstNumber || null,
        order_date: orderData.orderDate,
        project_title: orderData.projectTitle.trim(),
        buyer_reference: orderData.orderReference || orderData.projectTitle.trim(),
        client_po_number: orderData.clientPoNumber || null,
        delivery_date: orderData.expectedDeliveryDate,
        tax_percentage: parseFloat(orderData.gstPercentage) || 18,
        discount_percentage: parseFloat(orderData.discountPercentage) || 0,
        advance_paid: parseFloat(orderData.advancePaid) || 0,
        payment_terms: orderData.paymentTerms || null,
        shipping_address: orderData.deliveryAddress || null,
        billing_address: orderData.address || null,
        special_instructions: orderData.specialInstructions || null,
        client_requirement_id: orderData.clientRequirementId || null,
        quotation_id: orderData.quotationId || null,
        priority: orderData.priority || 'medium',
        garment_specifications: payloadItems[0]?.specifications || {},
        items: payloadItems
      };

      const response = await api.post('/sales/orders', payload);
      const newOrder = response.data.order;
      
      // Update Client Requirement status if linked
      if (orderData.clientRequirementId) {
        try {
          await api.patch(`/client-requirements/${orderData.clientRequirementId}/status`, {
            status: 'Converted to SO'
          });
        } catch (statusErr) {
          console.error('Failed to update client requirement status:', statusErr);
        }
      }
      
      // Upload new design files
      const newFiles = orderData.designFiles.filter(df => !df.isExisting);
      if (newFiles.length > 0 && newOrder?.id) {
        try {
          const formData = new FormData();
          newFiles.forEach(df => {
            formData.append('files', df.file);
          });
          
          await api.post(`/sales/orders/${newOrder.id}/upload-design-files`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.success('Design files uploaded successfully!');
        } catch (uploadErr) {
          console.warn('Failed to upload design files:', uploadErr);
          toast.warning('Order created but design file upload failed');
        }
      }
      
      setCreatedOrder(newOrder);
      toast.success('Sales order created successfully!');
    } catch (err) {
      console.error('Order creation error:', err);
      setSubmitError(err.response?.data?.message || 'Failed to create sales order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actions on success
  const handlePrintOrder = () => window.print();
  const handleDownloadPDF = async () => {
    if (!createdOrder) return;
    try {
      const response = await api.get(`/sales/orders/${createdOrder.id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SalesOrder-${createdOrder.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  if (loadingRequirement) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">Fetching details from Client Requirement...</p>
        </div>
      </div>
    );
  }

  // Success view
  if (createdOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
        <div className="mx-auto max-w-4xl bg-white border border-gray-200 rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <FaCheckCircle className="text-4xl text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Order Created Successfully!</h1>
            <p className="text-sm text-gray-500 mt-1">Order No: <span className="font-bold text-blue-600">{createdOrder.order_number}</span></p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Customer</p>
              <p className="font-bold text-gray-800 text-sm mt-1">{createdOrder.customer_name || orderData.customerName}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Project Name</p>
              <p className="font-bold text-gray-800 text-sm mt-1">{orderData.projectTitle}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Total Qty</p>
              <p className="font-bold text-gray-800 text-sm mt-1">{calculations.totalQty} Pcs</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Grand Total</p>
              <p className="font-bold text-green-700 text-sm mt-1">₹{calculations.grandTotal}</p>
            </div>
          </div>

          {/* Workflow Action Buttons */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider text-center">Sales Order Workflow Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={() => navigate(`/sales/orders/${createdOrder.id}`)}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow animate-pulse"
              >
                Confirm Sales Order
              </button>
              <button
                onClick={() => toast.success('Mock Action: Design team notified!')}
                className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs border border-indigo-200 transition"
              >
                Assign Design Team
              </button>
              <button
                onClick={() => toast.success('Mock Action: Design order generated!')}
                className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs border border-indigo-200 transition"
              >
                Create Design Order
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.post(`/bom/generate/${createdOrder.id}`);
                    navigate('/procurement/bom');
                    toast.success('BOM Generated Successfully!');
                  } catch (err) {
                    toast.error('Failed to generate BOM');
                  }
                }}
                className="px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-semibold text-xs border border-orange-200 transition"
              >
                Generate BOM
              </button>
              <button
                onClick={() => {
                  navigate('/manufacturing/orders');
                  toast.success('Navigated to Production Planning');
                }}
                className="px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-semibold text-xs border border-purple-200 transition"
              >
                Production Planning
              </button>
              <button
                onClick={handlePrintOrder}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-gray-800 rounded-lg font-semibold text-xs border border-slate-300 transition"
              >
                Print Sales Order
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-gray-800 rounded-lg font-semibold text-xs border border-slate-300 transition"
              >
                Download PDF
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/sales/orders')}
              className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-medium text-xs transition"
            >
              ← Back to Sales Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/sales/orders')}
              className="p-2 hover:bg-white rounded-lg transition border border-gray-200 text-gray-600"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create Sales Order</h1>
              {isFromRequirement && (
                <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit animate-pulse">
                  <FaLock className="w-2.5 h-2.5" />
                  <span>Converting from Requirement: {orderData.orderReference}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {submitError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5">
            <FaTimesCircle className="flex-shrink-0 text-red-500 w-4 h-4" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Multi-Section Tabs */}
        <div className="mb-4 flex gap-1 border-b border-gray-200 overflow-x-auto pb-1 bg-white p-1 rounded-lg border">
          {[
            { id: 'customer_so', label: '🎯 Customer & SO' },
            { id: 'product_info', label: '📦 Product Info' },
            { id: 'tech_specs', label: '⚙️ Technical Specs' },
            { id: 'documents', label: '📄 Documents' },
            { id: 'delivery_summary', label: '🚚 Summary & Delivery' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentSection(tab.id)}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs whitespace-nowrap transition ${
                currentSection === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TAB 1: Customer & SO */}
          {currentSection === 'customer_so' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center justify-between">
                <span>1. Customer & Sales Order Information</span>
                {isFromRequirement && <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Locked Fields Auto-filled</span>}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={orderData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Customer Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={orderData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Contact Person"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={orderData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Mobile Number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={orderData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Email Address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={orderData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="GSTIN"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sales Order No (Auto)</label>
                  <input
                    type="text"
                    value="SO-YYYYMMDD-XXXX (Auto-Generated)"
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Order Date</label>
                  <input
                    type="date"
                    value={orderData.orderDate}
                    onChange={(e) => handleInputChange('orderDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Client Requirement No.</label>
                  <input
                    type="text"
                    value={orderData.orderReference}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                    placeholder="CR-XXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quotation No.</label>
                  <input
                    type="text"
                    value={orderData.quotationNo}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                    placeholder="QT-XXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Customer PO No.</label>
                  <input
                    type="text"
                    value={orderData.clientPoNumber}
                    onChange={(e) => handleInputChange('clientPoNumber', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    placeholder="e.g. PO-12345"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sales Person</label>
                  <input
                    type="text"
                    value={orderData.salesPerson}
                    onChange={(e) => handleInputChange('salesPerson', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    placeholder="Responsible Sales Person"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Terms</label>
                  <input
                    type="text"
                    value={orderData.deliveryTerms}
                    onChange={(e) => handleInputChange('deliveryTerms', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    placeholder="e.g. EXW, FOB"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={orderData.paymentTerms}
                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    placeholder="e.g. 50% Advance, 50% on Delivery"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Billing Address</label>
                  <textarea
                    value={orderData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Billing Address"
                    rows="2"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentSection('product_info')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs transition animate-pulse"
                >
                  Next: Product Info →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Product Info */}
          {currentSection === 'product_info' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-800 border-b pb-2">2. Product Information</h2>

              {orderData.itemsList && orderData.itemsList.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">
                    Line Items in Client Requirement (Select to view/configure specs)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {orderData.itemsList.map((item, idx) => {
                      const isActive = idx === activeItemIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectActiveItem(idx)}
                          className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-md font-bold scale-[1.02]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="text-[10px] block opacity-70">Product {idx + 1}</span>
                            <span className="text-xs font-bold truncate block">{item.productName}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[10px] block opacity-70">Qty</span>
                            <span className="text-xs font-extrabold block">{item.quantity} {item.unit}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Category</label>
                  <input
                    type="text"
                    value={orderData.productCategory}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={orderData.productName}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Type</label>
                  <input
                    type="text"
                    value={orderData.productType}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quantity (Units) *</label>
                  <input
                    type="number"
                    value={orderData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs font-semibold"
                    placeholder="Quantity"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={orderData.unit}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={orderData.pricePerPiece}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={orderData.discountPercentage}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">GST (%)</label>
                  <input
                    type="number"
                    value={orderData.gstPercentage}
                    disabled={isFromRequirement}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Total Amount (₹)</label>
                  <input
                    type="text"
                    value={`₹${calculations.grandTotal}`}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 font-bold text-xs"
                  />
                </div>
              </div>

              {/* Size Breakdown */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-bold text-gray-800 mb-2">📋 Size breakdown / Breakdown quantities</h3>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                  {orderData.sizeDetails.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic">No size details loaded. Add below if required.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {orderData.sizeDetails.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                          <span className="text-xs font-bold text-gray-700 w-10 uppercase">{item.size}</span>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleSizeDetailChange(idx, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="w-full px-2 py-1 border border-gray-200 rounded text-xs outline-none focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={addSizeDetail}
                    className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    + Add Size Row
                  </button>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-700 mb-1">Remarks / Product Note</label>
                <textarea
                  value={orderData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                  placeholder="Additional order notes or customization remarks..."
                  rows="2"
                />
              </div>

              <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentSection('customer_so')}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 font-semibold text-xs transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSection('tech_specs')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs transition animate-pulse"
                >
                  Next: Technical Specs →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Technical Specs */}
          {currentSection === 'tech_specs' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center justify-between">
                <span>3. Technical Specifications</span>
                {isFromRequirement && <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Auto-fetched & Locked</span>}
              </h2>

              {orderData.itemsList && orderData.itemsList.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">
                    Line Items in Client Requirement (Select to view/configure specs)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {orderData.itemsList.map((item, idx) => {
                      const isActive = idx === activeItemIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectActiveItem(idx)}
                          className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-md font-bold scale-[1.02]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="text-[10px] block opacity-70">Product {idx + 1}</span>
                            <span className="text-xs font-bold truncate block">{item.productName}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[10px] block opacity-70">Qty</span>
                            <span className="text-xs font-extrabold block">{item.quantity} {item.unit}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isFieldVisible('fabricType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Fabric</label>
                    <input
                      type="text"
                      value={orderData.fabricType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('fabricType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('gsm') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">GSM</label>
                    <input
                      type="text"
                      value={orderData.gsm}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('gsm', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('color') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      value={orderData.color}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('size') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Size</label>
                    <input
                      type="text"
                      value={orderData.size}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('fit') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Fit</label>
                    <input
                      type="text"
                      value={orderData.fit}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('fit', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('pattern') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pattern</label>
                    <input
                      type="text"
                      value={orderData.pattern}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('pattern', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('sleeveType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Sleeve Type</label>
                    <input
                      type="text"
                      value={orderData.sleeveType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('sleeveType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('neckType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Neck Type</label>
                    <input
                      type="text"
                      value={orderData.neckType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('neckType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('printType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Print Type</label>
                    <input
                      type="text"
                      value={orderData.printType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('printType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('embroidery') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Embroidery</label>
                    <input
                      type="text"
                      value={orderData.embroidery}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('embroidery', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('rise') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Rise</label>
                    <input
                      type="text"
                      value={orderData.rise}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('rise', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('legOpening') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Leg Opening</label>
                    <input
                      type="text"
                      value={orderData.legOpening}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('legOpening', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('washType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Wash Type</label>
                    <input
                      type="text"
                      value={orderData.washType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('washType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('pocketStyle') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pocket Style</label>
                    <input
                      type="text"
                      value={orderData.pocketStyle}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('pocketStyle', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('buttonType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Button Type</label>
                    <input
                      type="text"
                      value={orderData.buttonType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('buttonType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('zipperType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Zipper Type</label>
                    <input
                      type="text"
                      value={orderData.zipperType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('zipperType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('packingType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Packing Type</label>
                    <input
                      type="text"
                      value={orderData.packingType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('packingType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}

                {/* Additional Spec Fields */}
                {isFieldVisible('collarType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Collar Type</label>
                    <input
                      type="text"
                      value={orderData.collarType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('collarType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('cuffType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Cuff Type</label>
                    <input
                      type="text"
                      value={orderData.cuffType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('cuffType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('hoodType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Hood Type</label>
                    <input
                      type="text"
                      value={orderData.hoodType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('hoodType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('pocketType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pocket Type</label>
                    <input
                      type="text"
                      value={orderData.pocketType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('pocketType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('closureType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Closure Type</label>
                    <input
                      type="text"
                      value={orderData.closureType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('closureType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('lining') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Lining</label>
                    <input
                      type="text"
                      value={orderData.lining}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('lining', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('lapelType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Lapel Type</label>
                    <input
                      type="text"
                      value={orderData.lapelType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('lapelType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('waistSize') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Waist Size</label>
                    <input
                      type="text"
                      value={orderData.waistSize}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('waistSize', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('length') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Length</label>
                    <input
                      type="text"
                      value={orderData.length}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('stretchType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Stretch Type</label>
                    <input
                      type="text"
                      value={orderData.stretchType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('stretchType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('ankleStyle') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ankle Style</label>
                    <input
                      type="text"
                      value={orderData.ankleStyle}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('ankleStyle', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('department') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={orderData.department}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('logoType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Logo Type</label>
                    <input
                      type="text"
                      value={orderData.logoType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('logoType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('reflectiveType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Reflective Type</label>
                    <input
                      type="text"
                      value={orderData.reflectiveType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('reflectiveType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('safetyStandard') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Safety Standard</label>
                    <input
                      type="text"
                      value={orderData.safetyStandard}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('safetyStandard', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('borderType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Border Type</label>
                    <input
                      type="text"
                      value={orderData.borderType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('borderType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('blousePiece') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Blouse Piece</label>
                    <input
                      type="text"
                      value={orderData.blousePiece}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('blousePiece', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('material') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Material</label>
                    <input
                      type="text"
                      value={orderData.material}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('material', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('dimensions') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Dimensions</label>
                    <input
                      type="text"
                      value={orderData.dimensions}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('dimensions', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('weight') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Weight</label>
                    <input
                      type="text"
                      value={orderData.weight}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('partNumber') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Part Number</label>
                    <input
                      type="text"
                      value={orderData.partNumber}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('partNumber', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('drawingNumber') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Drawing Number</label>
                    <input
                      type="text"
                      value={orderData.drawingNumber}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('drawingNumber', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('surfaceFinish') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Surface Finish</label>
                    <input
                      type="text"
                      value={orderData.surfaceFinish}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('surfaceFinish', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('tolerance') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tolerance</label>
                    <input
                      type="text"
                      value={orderData.tolerance}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('tolerance', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('manufacturingProcess') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Manufacturing Process</label>
                    <input
                      type="text"
                      value={orderData.manufacturingProcess}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('manufacturingProcess', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('heatTreatment') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Heat Treatment</label>
                    <input
                      type="text"
                      value={orderData.heatTreatment}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('heatTreatment', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('capacity') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Capacity</label>
                    <input
                      type="text"
                      value={orderData.capacity}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('bottleColor') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Bottle Color</label>
                    <input
                      type="text"
                      value={orderData.bottleColor}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('bottleColor', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('capType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Cap Type</label>
                    <input
                      type="text"
                      value={orderData.capType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('capType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('capColor') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Cap Color</label>
                    <input
                      type="text"
                      value={orderData.capColor}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('capColor', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('neckSize') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Neck Size</label>
                    <input
                      type="text"
                      value={orderData.neckSize}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('neckSize', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('foodGrade') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Food Grade</label>
                    <input
                      type="text"
                      value={orderData.foodGrade}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('foodGrade', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('bagSize') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Bag Size</label>
                    <input
                      type="text"
                      value={orderData.bagSize}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('bagSize', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('compartments') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Compartments</label>
                    <input
                      type="text"
                      value={orderData.compartments}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('compartments', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('handleType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Handle Type</label>
                    <input
                      type="text"
                      value={orderData.handleType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('handleType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('zipType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Zip Type</label>
                    <input
                      type="text"
                      value={orderData.zipType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('zipType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('branding') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Branding</label>
                    <input
                      type="text"
                      value={orderData.branding}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('branding', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('paperType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Paper Type</label>
                    <input
                      type="text"
                      value={orderData.paperType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('paperType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('paperGsm') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Paper GSM</label>
                    <input
                      type="text"
                      value={orderData.paperGsm}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('paperGsm', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('pageCount') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Page Count</label>
                    <input
                      type="text"
                      value={orderData.pageCount}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('pageCount', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('bindingType') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Binding Type</label>
                    <input
                      type="text"
                      value={orderData.bindingType}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('bindingType', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('coverLamination') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Cover Lamination</label>
                    <input
                      type="text"
                      value={orderData.coverLamination}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('coverLamination', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('printingColors') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Printing Colors</label>
                    <input
                      type="text"
                      value={orderData.printingColors}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('printingColors', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('finishing') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Finishing</label>
                    <input
                      type="text"
                      value={orderData.finishing}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('finishing', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('productTypeField') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Product Type</label>
                    <input
                      type="text"
                      value={orderData.productTypeField}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('productTypeField', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('logoPosition') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Logo Position</label>
                    <input
                      type="text"
                      value={orderData.logoPosition}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('logoPosition', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('printingMethod') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Printing Method</label>
                    <input
                      type="text"
                      value={orderData.printingMethod}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('printingMethod', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('giftBox') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Gift Box</label>
                    <input
                      type="text"
                      value={orderData.giftBox}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('giftBox', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}
                {isFieldVisible('packaging') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Packaging</label>
                    <input
                      type="text"
                      value={orderData.packaging}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('packaging', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                    />
                  </div>
                )}

                {/* Textareas */}
                {isFieldVisible('technicalNotes') && (
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Technical Notes</label>
                    <textarea
                      value={orderData.technicalNotes}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('technicalNotes', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-normal"
                      rows="3"
                    />
                  </div>
                )}
                {isFieldVisible('productDescription') && (
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Product Description</label>
                    <textarea
                      value={orderData.productDescription}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('productDescription', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-normal"
                      rows="3"
                    />
                  </div>
                )}
                {isFieldVisible('customerInstructions') && (
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Customer Instructions</label>
                    <textarea
                      value={orderData.customerInstructions}
                      disabled={isFromRequirement}
                      onChange={(e) => handleInputChange('customerInstructions', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs disabled:bg-gray-100 disabled:text-gray-500 font-normal"
                      rows="3"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentSection('product_info')}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 font-semibold text-xs transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSection('documents')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs transition animate-pulse"
                >
                  Next: Documents →
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Documents */}
          {currentSection === 'documents' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-800 border-b pb-2">4. Documents & Design Files</h2>

              {orderData.itemsList && orderData.itemsList.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">
                    Line Items in Client Requirement (Select to view/configure specs)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {orderData.itemsList.map((item, idx) => {
                      const isActive = idx === activeItemIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectActiveItem(idx)}
                          className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-md font-bold scale-[1.02]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="text-[10px] block opacity-70">Product {idx + 1}</span>
                            <span className="text-xs font-bold truncate block">{item.productName}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[10px] block opacity-70">Qty</span>
                            <span className="text-xs font-extrabold block">{item.quantity} {item.unit}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Existing Auto-fetched Attachments */}
              {orderData.designFiles.some(f => f.isExisting) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">📎 Auto-fetched Reference Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {orderData.designFiles.filter(f => f.isExisting).map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50 text-xs">
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-gray-700 capitalize block">{file.label || 'Reference Document'}</span>
                          <span className="text-gray-500 truncate block mt-0.5">{file.name}</span>
                        </div>
                        <a
                          href={file.preview}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg shadow-sm flex items-center justify-center"
                          title="Download Reference File"
                        >
                          <FaDownload size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Files */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-2">Upload Customer PO / Design Files / Artwork</label>
                <label className="block w-full px-4 py-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 cursor-pointer transition flex flex-col items-center justify-center gap-2">
                  <FaCloudUploadAlt className="w-6 h-6 text-gray-400" />
                  <div className="text-center">
                    <p className="font-bold text-gray-700 text-xs">Click to browse or drop files here</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Images, PDFs, Tech Packs, Design Files (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    multiple
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded Files List */}
              {orderData.designFiles.some(f => !f.isExisting) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">📤 Newly Added Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {orderData.designFiles.filter(f => !f.isExisting).map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white text-xs">
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-700 truncate font-semibold">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDesignFile(orderData.designFiles.indexOf(file))}
                          className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentSection('tech_specs')}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 font-semibold text-xs transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSection('delivery_summary')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs transition animate-pulse"
                >
                  Next: Delivery & Summary →
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Delivery & Summary */}
          {currentSection === 'delivery_summary' && (
            <div className="space-y-4">
              {/* Delivery Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-gray-800 border-b pb-2">5. Delivery & Execution Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Expected Delivery Date *</label>
                    <input
                      type="date"
                      value={orderData.expectedDeliveryDate}
                      onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Transport Mode</label>
                    <input
                      type="text"
                      value={orderData.transportMode}
                      onChange={(e) => handleInputChange('transportMode', e.target.value)}
                      placeholder="e.g. Road, Air, Sea"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Shipping Method</label>
                    <input
                      type="text"
                      value={orderData.shippingMethod}
                      onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                      placeholder="e.g. Express, Normal"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                    <select
                      value={orderData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Dispatch Instructions</label>
                    <input
                      type="text"
                      value={orderData.dispatchInstructions}
                      onChange={(e) => handleInputChange('dispatchInstructions', e.target.value)}
                      placeholder="e.g. Ship with safety packing, double wrapping"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Address</label>
                    <textarea
                      value={orderData.deliveryAddress}
                      onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs font-semibold"
                      placeholder="Delivery address details..."
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary & Price Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-gray-800 border-b pb-2">6. Order Financial Summary</h2>
                
                {orderData.itemsList && orderData.itemsList.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
                          <th className="px-3 py-2 text-left">Product</th>
                          <th className="px-3 py-2 text-center">Qty</th>
                          <th className="px-3 py-2 text-right">Rate (₹)</th>
                          <th className="px-3 py-2 text-right">GST %</th>
                          <th className="px-3 py-2 text-right">Discount %</th>
                          <th className="px-3 py-2 text-right">Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orderData.itemsList.map((item, idx) => {
                          const qty = parseFloat(item.quantity) || 0;
                          const rate = parseFloat(item.pricePerPiece) || 0;
                          const gst = parseFloat(item.gstPercentage) || 18;
                          const disc = parseFloat(item.discountPercentage) || 0;
                          const base = qty * rate;
                          const discAmt = base * disc / 100;
                          const total = (base - discAmt) * (1 + gst / 100);
                          return (
                            <tr key={idx} className="hover:bg-slate-50 bg-white">
                              <td className="px-3 py-2.5 font-semibold text-gray-800">{item.productName}</td>
                              <td className="px-3 py-2.5 text-center font-semibold">{qty}</td>
                              <td className="px-3 py-2.5 text-right font-bold">₹{rate}</td>
                              <td className="px-3 py-2.5 text-right">{gst}%</td>
                              <td className="px-3 py-2.5 text-right">{disc}%</td>
                              <td className="px-3 py-2.5 text-right font-extrabold text-blue-600">
                                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-gray-500 font-semibold">Total Quantity:</span>
                      <span className="font-bold text-gray-800">{calculations.totalQty} Pcs</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-gray-500 font-semibold">Total Amount (Before Tax):</span>
                      <span className="font-bold text-gray-800">₹{calculations.subtotal}</span>
                    </div>
                    {parseFloat(orderData.discountPercentage) > 0 && (
                      <div className="flex justify-between border-b pb-1.5 text-red-600">
                        <span className="font-semibold">Discount ({orderData.discountPercentage}%):</span>
                        <span className="font-bold">- ₹{calculations.discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b pb-1.5 text-amber-600">
                      <span className="font-semibold">GST ({orderData.gstPercentage}%):</span>
                      <span className="font-bold">+ ₹{calculations.gstAmount}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm bg-blue-50 p-2 rounded border border-blue-200">
                      <span className="text-blue-800">Grand Total:</span>
                      <span className="text-blue-800">₹{calculations.grandTotal}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Advance Received (₹)</label>
                      <input
                        type="number"
                        value={orderData.advancePaid}
                        onChange={(e) => handleInputChange('advancePaid', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-xs"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex justify-between font-bold text-xs bg-orange-50 p-2.5 rounded border border-orange-200 mt-2 text-orange-800">
                      <span>Balance Amount:</span>
                      <span>₹{calculations.remainingAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentSection('documents')}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 font-semibold text-xs transition"
                  >
                    ← Back
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/sales/orders')}
                      className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-semibold text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs transition flex items-center gap-1.5 shadow"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <FaCheck className="w-3 h-3" />
                          <span>Create Sales Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateSalesOrderPage;