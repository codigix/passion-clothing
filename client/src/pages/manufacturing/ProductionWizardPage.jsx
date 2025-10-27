import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FormProvider,
  useForm,
  useFormContext,
  useFieldArray,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import {
  ClipboardList,
  CalendarCheck,
  PackageSearch,
  ShieldCheck,
  Users,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowLeft,
  ArrowRight,
  Loader2,
  FileSearch,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { getOperationTemplate } from '../../utils/productionOperationTemplates';

const qualityCheckpointSchema = yup.object({
  name: yup.string().required('Checkpoint name is required'),
  frequency: yup.string().required('Frequency is required'),
  acceptanceCriteria: yup.string().required('Acceptance criteria is required'),
});

const materialsSchema = yup.object({
  items: yup
    .array()
    .of(
      yup.object({
        materialId: yup.string().required('Material is required'),
        description: yup.string().required('Description is required'),
        requiredQuantity: yup
          .number()
          .typeError('Quantity must be a number')
          .positive('Quantity must be greater than zero')
          .required('Quantity is required'),
        unit: yup.string().required('Unit is required'),
        status: yup
          .string()
          .oneOf(['available', 'shortage', 'ordered'])
          .required('Status is required'),
      }),
    )
    .min(1, 'At least one material is required for production order'),
});

const qualitySchema = yup.object({
  checkpoints: yup
    .array()
    .of(qualityCheckpointSchema)
    .min(1, 'Add at least one checkpoint'),
  notes: yup.string().nullable(),
});

const schedulingSchema = yup.object({
  plannedStartDate: yup.string().required('Planned start date is required'),
  plannedEndDate: yup
    .string()
    .required('Planned end date is required')
    .test('is-after', 'End date must be on or after start date', function validate(value) {
      const { plannedStartDate } = this.parent;
      if (!value || !plannedStartDate) return true;
      return new Date(value) >= new Date(plannedStartDate);
    }),
  shift: yup.string().required('Shift is required'),
  expectedHours: yup
    .number()
    .nullable()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .min(0, 'Hours cannot be negative'),
});

const orderDetailsSchema = yup.object({
  productId: yup.string().nullable(),
  productionType: yup
    .string()
    .oneOf(['in_house', 'outsourced', 'mixed'])
    .required('Production type is required'),
  quantity: yup
    .number()
    .typeError('Quantity must be a number')
    .positive('Quantity must be greater than zero')
    .required('Quantity is required'),
  priority: yup
    .string()
    .oneOf(['low', 'medium', 'high', 'urgent'])
    .required('Priority is required'),
  salesOrderId: yup.string().nullable(),
  specialInstructions: yup.string().nullable(),
});

const teamSchema = yup.object({
  supervisorId: yup.string().nullable(),
  assignedToId: yup.string().nullable(),
  qaLeadId: yup.string().nullable(),
  notes: yup.string().nullable(),
});

const customizationStageSchema = yup.object({
  stageName: yup.string().required('Stage name is required'),
  plannedDurationHours: yup
    .number()
    .nullable()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .min(0, 'Duration cannot be negative'),
});

const customizationSchema = yup.object({
  useCustomStages: yup.boolean().required(),
  stages: yup
    .array()
    .of(customizationStageSchema)
    .when('useCustomStages', {
      is: true,
      then: (schema) => schema.min(1, 'Add at least one custom stage when enabled'),
      otherwise: (schema) => schema.default([]),
    }),
});

const orderSelectionSchema = yup.object({
  salesOrderId: yup.string().required('Please select a project/sales order'),
  autoFilled: yup.boolean(),
});

const reviewSchema = yup.object({
  acknowledge: yup.boolean().oneOf([true], 'Please confirm the order details before submission'),
});

const formSchema = yup.object({
  orderSelection: orderSelectionSchema,
  orderDetails: orderDetailsSchema,
  scheduling: schedulingSchema,
  materials: materialsSchema,
  quality: qualitySchema,
  team: teamSchema,
  customization: customizationSchema,
  review: reviewSchema,
});

const defaultStageTemplates = [
  { stageName: 'Calculate Material Review', plannedDurationHours: null },
  { stageName: 'Cutting', plannedDurationHours: null },
  { stageName: 'Embroidery or Printing', plannedDurationHours: null },
  { stageName: 'Stitching', plannedDurationHours: null },
  { stageName: 'Finishing', plannedDurationHours: null },
  { stageName: 'Quality Check', plannedDurationHours: null },
];

const DEFAULT_FILTERS = {
  productSearch: '',
  salesOrderSearch: '',
};

const defaultValues = {
  orderSelection: {
    salesOrderId: '',
    autoFilled: false,
  },
  orderDetails: {
    productId: '',
    productionType: 'in_house',
    quantity: '',
    priority: 'medium',
    salesOrderId: '',
    specialInstructions: '',
  },
  scheduling: {
    plannedStartDate: '',
    plannedEndDate: '',
    shift: '',
    expectedHours: '',
  },
  materials: {
    items: [],
  },
  quality: {
    checkpoints: [
      {
        name: '',
        frequency: 'per_batch',
        acceptanceCriteria: '',
      },
    ],
    notes: '',
  },
  team: {
    supervisorId: '',
    assignedToId: '',
    qaLeadId: '',
    notes: '',
  },
  customization: {
    useCustomStages: false,
    stages: [],
  },
  review: {
    acknowledge: false,
  },
};

function countValidationErrors(errorObject) {
  if (!errorObject) {
    return 0;
  }

  if (typeof errorObject === 'object') {
    return Object.values(errorObject).reduce((accumulator, value) => {
      if (!value) {
        return accumulator;
      }

      if (value?.message) {
        return accumulator + 1;
      }

      return accumulator + countValidationErrors(value);
    }, 0);
  }

  return 0;
}

const stepConfig = [
  {
    title: 'Select Project',
    description: 'Choose a sales order project to begin production.',
    icon: FileSearch,
    key: 'orderSelection',
  },
  {
    title: 'Order Details',
    description: 'Capture the essential order metadata.',
    icon: ClipboardList,
    key: 'orderDetails',
  },
  {
    title: 'Scheduling',
    description: 'Plan the production timeline and shifts.',
    icon: CalendarCheck,
    key: 'scheduling',
  },
  {
    title: 'Materials',
    description: 'Verify material sufficiency to avoid interruptions.',
    icon: PackageSearch,
    key: 'materials',
  },
  {
    title: 'Quality',
    description: 'Define inspection gates and acceptance standards.',
    icon: ShieldCheck,
    key: 'quality',
  },
  {
    title: 'Team',
    description: 'Assign accountability for execution and oversight.',
    icon: Users,
    key: 'team',
  },
  {
    title: 'Customization',
    description: 'Review default stages and enable custom workflow.',
    icon: Settings2,
    key: 'customization',
  },
  {
    title: 'Review & Submit',
    description: 'Verify details and launch the production order.',
    icon: CheckCircle2,
    key: 'review',
  },
];

const SectionCard = ({ icon: Icon, title, description, children }) => (
  <section className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-fadeInUp">
    <header className="flex items-start gap-4 mb-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-transparent p-6">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-600 leading-snug">{description}</p>
      </div>
    </header>
    <div className="px-6 pb-6 space-y-4">{children}</div>
  </section>
);

const Stepper = ({ currentStep, completedSteps, invalidSteps, onStepSelect }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
    <div className="mb-4">
      <h3 className="text-base font-bold text-gray-900">Wizard Progress</h3>
      <p className="text-sm text-gray-600 mt-1">Click any step to navigate • {completedSteps.size} of {stepConfig.length} completed</p>
    </div>
    
    <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-3">
      {stepConfig.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === index;
        const isCompleted = completedSteps.has(index);
        const isErrored = invalidSteps.has(index);
        const isClickable = index <= currentStep + 1 || isCompleted || isErrored;

        const buttonClass = isActive
          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
          : isErrored
            ? 'border-red-400 bg-red-50 hover:bg-red-100 shadow-sm'
            : isCompleted
              ? 'border-green-400 bg-green-50 hover:bg-green-100 shadow-sm'
              : 'border-gray-200 bg-white hover:bg-gray-50 shadow-sm';

        const badgeClass = isActive
          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md'
          : isErrored
            ? 'bg-red-500 text-white'
            : isCompleted
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-600';

        const statusIcon = isCompleted ? (
          <CheckCircle2 className="w-3 h-3 text-green-600 absolute -top-1 -right-1 bg-white rounded-full" />
        ) : isErrored ? (
          <AlertCircle className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full" />
        ) : null;

        return (
          <button
            key={step.title}
            type="button"
            onClick={() => isClickable && onStepSelect(index)}
            className={`relative flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${buttonClass} ${!isClickable ? 'cursor-not-allowed opacity-50' : 'hover:shadow-sm'}`}
            disabled={!isClickable}
            data-invalid={isErrored || undefined}
            title={`${step.title} - ${isCompleted ? 'Completed' : isErrored ? 'Needs attention' : isActive ? 'Current' : 'Pending'}`}
          >
            <div className="relative">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${badgeClass} transition-all`}>
                {isActive ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              {statusIcon}
            </div>
            
            <div className="text-center w-full">
              <p className={`text-[10px] font-semibold ${isActive ? 'text-blue-600' : isErrored ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                {step.title}
              </p>
              {isActive && (
                <span className="inline-block mt-0.5 px-1.5 py-0 bg-blue-100 text-blue-700 rounded-full text-[8px] font-medium">
                  Current
                </span>
              )}
              {isCompleted && !isActive && (
                <span className="inline-block mt-0.5 px-1.5 py-0 bg-green-100 text-green-700 rounded-full text-[8px] font-medium">
                  Done
                </span>
              )}
              {isErrored && (
                <span className="inline-block mt-0.5 px-1.5 py-0 bg-red-100 text-red-700 rounded-full text-[8px] font-medium">
                  Error
                </span>
              )}
            </div>
          </button>
        );
      })}
    </nav>
  </div>
);

const StepStatusBanner = ({ hasError, title, description }) => {
  const Icon = hasError ? AlertCircle : CheckCircle2;
  const containerClass = hasError
    ? 'bg-gradient-to-r from-red-50 via-red-50 to-red-100 border-red-300 text-red-800 shadow-md'
    : 'bg-gradient-to-r from-green-50 via-green-50 to-green-100 border-green-300 text-green-800 shadow-md';
  const iconClass = hasError ? 'text-red-600' : 'text-green-600';
  const helperText = hasError
    ? '⚠️ Please resolve the highlighted fields below to continue.'
    : '✓ All required fields are complete. You can proceed to the next step.';

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-sm ${containerClass} animate-fadeInUp`}
      role="status"
      aria-live="polite"
      data-has-error={hasError || undefined}
    >
      <Icon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${iconClass}`} aria-hidden="true" />
      <div className="space-y-1 flex-1">
        <p className="font-bold text-base">{hasError ? 'Validation Required' : 'Step Complete'}</p>
        <p className="text-sm leading-snug">{description}</p>
        <p className="text-xs font-medium opacity-90 mt-2">{helperText}</p>
      </div>
    </div>
  );
};

const StepHint = ({ children, tone = 'info' }) => {
  const Icon = tone === 'warning' ? AlertCircle : Info;
  const toneClasses = tone === 'warning'
    ? 'border-amber-300 bg-gradient-to-r from-amber-50 via-amber-50 to-amber-100 text-amber-800 shadow-sm'
    : 'border-blue-300 bg-gradient-to-r from-blue-50 via-blue-50 to-blue-100 text-blue-800 shadow-sm';
  
  const iconClasses = tone === 'warning' ? 'text-amber-600' : 'text-blue-600';

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${toneClasses}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconClasses}`} />
      <div className="leading-relaxed font-medium">{children}</div>
    </div>
  );
};

const ProductionWizardPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [invalidSteps, setInvalidSteps] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSalesOrders, setLoadingSalesOrders] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [salesOrderOptions, setSalesOrderOptions] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchInputs, setSearchInputs] = useState(DEFAULT_FILTERS);
  const [productDetails, setProductDetails] = useState(null);
  const [loadingProductDetails, setLoadingProductDetails] = useState(false);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const productSearchTimeoutRef = useRef(null);
  const salesOrderSearchTimeoutRef = useRef(null);
  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(formSchema),
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasPermission } = useAuth();
  const canCustomizeStages = true; // Permission check disabled - all users can customize stages
  const canCreateOrder = true; // Permission check disabled

  const fetchProducts = useCallback(
    async (search = '') => {
      setLoadingProducts(true);
      try {
        // Fetch all products
        const productsResponse = await api.get('/products', {
          params: {
            limit: 200,
            ...(search ? { search } : {}),
          },
        });

        // Fetch all sales orders
        const salesOrdersResponse = await api.get('/sales/orders', {
          params: { limit: 500, status: 'confirmed' },
        });

        // Fetch all purchase orders
        const purchaseOrdersResponse = await api.get('/procurement/pos', {
          params: { limit: 500 },
        });

        const products = productsResponse.data?.products || [];
        const salesOrders = salesOrdersResponse.data?.orders || [];
        const purchaseOrders = purchaseOrdersResponse.data?.purchaseOrders || [];

        // Filter products - show products that have sales orders OR purchase orders (more flexible)
        const validProducts = products.filter((product) => {
          // Check if product exists in any sales order items
          const hasSalesOrder = salesOrders.some((so) => {
            const items = Array.isArray(so.items) ? so.items : [];
            return items.some((item) => item.product_id === product.id);
          });

          // Check if product has linked purchase orders
          const hasPurchaseOrder = purchaseOrders.some((po) => {
            // Check if PO is linked to a sales order that contains this product
            const linkedSO = salesOrders.find((so) => so.id === po.sales_order_id);
            if (linkedSO) {
              const items = Array.isArray(linkedSO.items) ? linkedSO.items : [];
              return items.some((item) => item.product_id === product.id);
            }
            return false;
          });

          // More flexible: show if product has either sales order OR purchase order OR is active
          return hasSalesOrder || hasPurchaseOrder || product.status === 'active';
        });

        const options = validProducts.map((product) => ({
          value: String(product.id),
          label: `${product.name} (${product.product_code || 'N/A'})`,
        }));

        setProductOptions(options);
      } catch (error) {
        console.error('fetch products error', error);
        toast.error('Unable to load products. Please try again.');
      } finally {
        setLoadingProducts(false);
      }
    },
    [],
  );

  const fetchSalesOrderOptions = useCallback(
    async ({ search = '', productId }) => {
      setLoadingSalesOrders(true);
      try {
        const response = await api.get('/sales/orders', {
          params: {
            limit: 100,
            status: 'confirmed',
            ...(productId ? { product_id: productId } : {}),
            ...(search ? { search } : {}),
          },
        });

        const options = (response.data?.orders || []).map((order) => ({
          value: String(order.id),
          label: `${order.order_number}${order.customer?.name ? ` • ${order.customer.name}` : ''}`,
        }));

        setSalesOrderOptions(options);
      } catch (error) {
        console.error('fetch sales order options error', error);
        // Silently fail - sales order selection is optional
        setSalesOrderOptions([]);
      } finally {
        setLoadingSalesOrders(false);
      }
    },
    [],
  );

  const fetchProductDetails = useCallback(
    async (productId) => {
      if (!productId) {
        setProductDetails(null);
        return;
      }

      setLoadingProductDetails(true);
      try {
        const response = await api.get(`/manufacturing/products/${productId}/wizard-details`);
        setProductDetails(response.data);
        
        // Auto-populate sales order if there's only one
        if (response.data?.salesOrders?.length === 1) {
          methods.setValue('orderDetails.salesOrderId', String(response.data.salesOrders[0].id), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      } catch (error) {
        console.error('fetch product details error', error);
        toast.error('Unable to load product details');
        setProductDetails(null);
      } finally {
        setLoadingProductDetails(false);
      }
    },
    [methods],
  );

  const fetchSalesOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      // Fetch all sales orders that are ready for production
      const response = await api.get('/sales/orders', {
        params: { 
          limit: 500,
          // Show orders that are confirmed or already in procurement stage
          // status: ['confirmed', 'procurement_created']
        },
      });
      setSalesOrders(response.data?.orders || []);
    } catch (error) {
      console.error('fetch sales orders error', error);
      toast.error('Unable to load sales orders');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchOrderDetails = useCallback(
    async (salesOrderId) => {
      if (!salesOrderId) return;

      setLoadingProductDetails(true);
      try {
        console.log('📋 Fetching sales order details for ID:', salesOrderId);
        
        // 1. Fetch the sales order
        const soResponse = await api.get(`/sales/orders/${salesOrderId}`);
        const salesOrder = soResponse.data?.order;
        
        if (!salesOrder) {
          toast.error('Sales order not found');
          return;
        }

        console.log('✅ Sales order loaded:', salesOrder);

        // 2. Fetch the linked purchase order (if available)
        let purchaseOrder = {};
        let vendor = {};
        try {
          // Get PO linked to this sales order
          const poResponse = await api.get('/procurement/pos', {
            params: { 
              sales_order_id: salesOrderId,
              limit: 1 
            },
          });
          purchaseOrder = poResponse.data?.purchaseOrders?.[0] || {};
          vendor = purchaseOrder.vendor || {};
          console.log('✅ Purchase order linked:', purchaseOrder);
        } catch (e) {
          console.warn('No PO found for this sales order (yet):', e);
        }

        // 3. Fetch MRN request for this project
        let mrnRequest = {};
        let materialsRequested = [];
        let receivedMaterials = [];
        try {
          const projectName = salesOrder.project_name || `SO-${salesOrderId}`;
          console.log(`🔍 Searching for MRN with project_name: "${projectName}"`);
          
          const mrnResponse = await api.get('/project-material-requests', {
            params: { 
              project_name: projectName,
              limit: 1
            },
          });
          
          console.log('📨 MRN API Response:', mrnResponse.data);
          mrnRequest = mrnResponse.data?.requests?.[0] || {};
          
          if (!mrnRequest.id) {
            console.warn('⚠️ No MRN found for project_name:', projectName);
          } else {
            console.log('✅ MRN Found:', mrnRequest.request_number, 'ID:', mrnRequest.id);
          }
          
          // Parse materials from MRN
          if (mrnRequest.materials_requested) {
            try {
              materialsRequested = typeof mrnRequest.materials_requested === 'string'
                ? JSON.parse(mrnRequest.materials_requested)
                : mrnRequest.materials_requested;
              console.log(`📦 MRN materials_requested field contains ${materialsRequested.length} items`);
              console.log('Materials structure:', materialsRequested);
            } catch (e) {
              console.warn('Failed to parse materials_requested:', e);
              console.log('Raw materials_requested:', mrnRequest.materials_requested);
            }
          } else {
            console.warn('⚠️ MRN has no materials_requested field');
          }
          
          // Try to get received materials if verification exists
          if (mrnRequest.id) {
            try {
              const verifyResponse = await api.get(`/project-material-requests/${mrnRequest.id}/verification`);
              const verification = verifyResponse.data?.verification || {};
              const receipt = verification.receipt || {};
              if (receipt.received_materials) {
                receivedMaterials = typeof receipt.received_materials === 'string'
                  ? JSON.parse(receipt.received_materials)
                  : receipt.received_materials;
                console.log(`✅ Found ${receivedMaterials.length} received materials`);
              }
            } catch (e) {
              console.warn('No verification found for MRN:', e);
            }
          }
          
          console.log(`✅ MRN Flow: ${materialsRequested.length} requested + ${receivedMaterials.length} received = ${(receivedMaterials.length > 0 ? receivedMaterials : materialsRequested).length} to display`);
        } catch (e) {
          console.error('❌ Error fetching MRN:', e);
          console.warn('Could not load MRN materials - you can add them manually');
        }

        // Extract customer
        const customer = salesOrder.customer || {};

        // Parse items from sales order
        let items = [];
        try {
          if (salesOrder.items) {
            items = typeof salesOrder.items === 'string' ? JSON.parse(salesOrder.items) : salesOrder.items;
          }
        } catch (e) {
          console.warn('Failed to parse items:', e);
        }

        // Determine final materials list with fallback logic
        let finalMaterials = [];
        if (receivedMaterials.length > 0) {
          finalMaterials = receivedMaterials;
          console.log(`✅ Using received materials: ${receivedMaterials.length} items`);
        } else if (materialsRequested.length > 0) {
          finalMaterials = materialsRequested;
          console.log(`✅ Using MRN requested materials: ${materialsRequested.length} items`);
        } else {
          // Fallback 1: Try to extract materials from PO items
          let poItems = [];
          if (purchaseOrder.items) {
            try {
              poItems = typeof purchaseOrder.items === 'string' 
                ? JSON.parse(purchaseOrder.items) 
                : purchaseOrder.items;
              if (Array.isArray(poItems) && poItems.length > 0) {
                console.log(`📦 Fallback 1: Found ${poItems.length} items in Purchase Order`);
              }
            } catch (e) {
              console.warn('Failed to parse PO items:', e);
            }
          }

          // Fallback 2: Use SO items if PO items empty
          if (poItems.length === 0 && items.length > 0) {
            poItems = items;
            console.log(`📦 Fallback 2: Using Sales Order items instead (${items.length} items)`);
          }

          // Convert items to materials format
          if (poItems.length > 0) {
            finalMaterials = poItems.map((item, idx) => ({
              materialId: `M-${(idx + 1).toString().padStart(3, '0')}`,
              description: item.material_name || item.name || item.description || item.product_name || `Material ${idx + 1}`,
              requiredQuantity: item.quantity || item.quantity_required || 1,
              unit: item.uom || item.unit || 'pieces',
              status: 'pending',
              barcode: '',
              remarks: `Auto-populated from ${purchaseOrder.items && poItems === (typeof purchaseOrder.items === 'string' ? JSON.parse(purchaseOrder.items) : purchaseOrder.items) ? 'Purchase Order' : 'Sales Order'}`,
              location: '',
              color: item.color || '',
              gsm: item.gsm || '',
              width: item.width || '',
              purpose: item.purpose || ''
            }));
            console.log(`✅ Fallback: Created ${finalMaterials.length} materials from items`);
          } else {
            console.warn('⚠️ No materials found in MRN, PO, or SO - materials will be empty');
          }
        }

        // Prepare transformed data for display
        const productName = items[0]?.product_name || 
                           items[0]?.name || 
                           materialsRequested[0]?.description ||
                           'N/A';

        const quantity = items[0]?.quantity || 
                        materialsRequested[0]?.quantity_required ||
                        1;

        const transformedData = {
          customer_name: customer.name || 'N/A',
          vendor_name: vendor.name || 'N/A',
          product_name: productName,
          quantity: quantity,
          project_name: salesOrder.project_name || `SO-${salesOrderId}`,
          delivery_date: salesOrder.delivery_date || '',
          product_id: items[0]?.product_id || null,
          sales_order_id: salesOrderId,
          special_instructions: salesOrder.special_instructions || salesOrder.notes || '',
          materials: finalMaterials
        };

        setSelectedOrderDetails(transformedData);

        // Resolve product ID
        let validProductId = null;
        if (transformedData.product_id) {
          try {
            const isNumeric = !isNaN(Number(transformedData.product_id));
            let product = null;
            
            if (isNumeric) {
              const productResponse = await api.get(`/products/${transformedData.product_id}`);
              product = productResponse.data?.product;
            } else {
              console.log('🔍 Searching for product code:', transformedData.product_id);
              const searchResponse = await api.get('/products', {
                params: { search: transformedData.product_id, limit: 10 }
              });
              const products = searchResponse.data?.products || [];
              product = products.find(p => p.product_code === transformedData.product_id) || products[0];
            }
            
            if (product) {
              validProductId = String(product.id);
              console.log('✅ Product resolved:', product.name);
              
              setProductOptions((prevOptions) => {
                const exists = prevOptions.some(opt => opt.value === String(product.id));
                if (!exists) {
                  return [
                    {
                      value: String(product.id),
                      label: `${product.name} (${product.product_code || 'N/A'})`,
                    },
                    ...prevOptions
                  ];
                }
                return prevOptions;
              });
            }
          } catch (error) {
            console.warn('Could not resolve product:', error);
          }
        }

        // Auto-fill form
        if (validProductId) {
          methods.setValue('orderDetails.productId', validProductId);
        }
        if (transformedData.quantity) {
          methods.setValue('orderDetails.quantity', transformedData.quantity);
        }
        methods.setValue('orderDetails.salesOrderId', String(transformedData.sales_order_id));
        if (transformedData.special_instructions) {
          methods.setValue('orderDetails.specialInstructions', transformedData.special_instructions);
        }

        // Auto-fill materials from various sources
        if (transformedData.materials && transformedData.materials.length > 0) {
          // Determine source of materials for better logging
          let materialSource = 'Unknown Source';
          if (receivedMaterials.length > 0) {
            materialSource = `Material Receipt (${mrnRequest.request_number || 'MRN'})`;
          } else if (materialsRequested.length > 0) {
            materialSource = `MRN Request (${mrnRequest.request_number || 'N/A'})`;
          } else if (purchaseOrder.items) {
            materialSource = 'Purchase Order Items';
          } else {
            materialSource = 'Sales Order Items';
          }
          
          console.log(`📦 Loading ${transformedData.materials.length} material(s) from ${materialSource}`);
          console.log('🔍 Materials data:', transformedData.materials);
          
          // Map materials - handles both MRN format and item format
          const loadedMaterials = transformedData.materials.map((m, idx) => {
            // Material already has correct structure if from MRN/receipt
            // or from our fallback mapping if from items
            if (m.materialId) {
              // Already properly formatted from fallback mapping
              console.log(`✅ Material ${m.materialId}: ${m.description}`);
              return m;
            }
            
            // Generate auto-incremented material ID (M-001, M-002, etc.)
            const materialId = `M-${(idx + 1).toString().padStart(3, '0')}`;
            const description = m.material_name || m.name || m.description || m.product_name || '';
            const requiredQty = m.quantity_received !== undefined ? m.quantity_received : 
                               (m.quantity_required !== undefined ? m.quantity_required : 
                               (m.quantity !== undefined ? m.quantity : ''));
            
            if (!description) {
              console.warn(`⚠️ Material ${idx} has no description - skipping`);
              return null;
            }
            
            console.log(`✅ Material ${materialId} mapped: ${description}`);
            
            return {
              materialId,
              description,
              requiredQuantity: requiredQty,
              unit: m.uom || m.unit || 'pieces',
              status: m.status || 'available',
              condition: m.condition || '',
              barcode: m.barcode_scanned || m.barcode || '',
              remarks: m.remarks || (mrnRequest.request_number ? `From MRN ${mrnRequest.request_number}` : ''),
              location: m.location || m.warehouse_location || '',
              color: m.color || '',
              gsm: m.gsm || '',
              width: m.width || '',
              purpose: m.purpose || ''
            };
          }).filter(m => m !== null); // Remove null entries
          
          if (loadedMaterials.length > 0) {
            methods.setValue('materials.items', loadedMaterials);
            console.log(`✅ Successfully loaded ${loadedMaterials.length} materials from ${materialSource}`);
            toast.success(`✅ Loaded ${loadedMaterials.length} materials from ${materialSource}!`);
          } else {
            console.warn('⚠️ No valid materials after mapping');
            console.warn('⚠️ No valid materials found to load - please add materials manually');
            toast.info('⚠️ No materials found - please add them manually in the Materials section');
          }
        } else {
          console.log('ℹ️ No materials found in any source (MRN, PO, or SO)');
          console.log('ℹ️ You can add materials manually in the Materials section below');
        }

        methods.setValue('orderSelection.autoFilled', true);
        toast.success('Project details loaded successfully!');
      } catch (error) {
        console.error('fetch order details error', error);
        toast.error('Unable to load project details');
      } finally {
        setLoadingProductDetails(false);
      }
    },
    [methods],
  );

  const fetchVendors = useCallback(async () => {
    setLoadingVendors(true);
    try {
      const response = await api.get('/procurement/vendors', {
        params: { limit: 200 },
      });
      setVendors(response.data?.vendors || []);
    } catch (error) {
      console.error('fetch vendors error', error);
      toast.error('Unable to load vendors');
    } finally {
      setLoadingVendors(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchSalesOrders();
    fetchVendors();
  }, [fetchProducts, fetchSalesOrders, fetchVendors]);

  // Auto-load order details from URL parameter (when redirected from sales order or approval page)
  useEffect(() => {
    // Check for new salesOrderId parameter
    const salesOrderId = searchParams.get('salesOrderId');
    // Fallback to old approvalId parameter for backward compatibility
    const approvalId = searchParams.get('approvalId');
    
    if (salesOrderId) {
      toast.success('Loading project details...');
      methods.setValue('orderSelection.salesOrderId', salesOrderId);
      fetchOrderDetails(salesOrderId);
    } else if (approvalId) {
      // Legacy support - treat approvalId as sales order ID
      toast.success('Loading project details from approval...');
      methods.setValue('orderSelection.salesOrderId', approvalId);
      fetchOrderDetails(approvalId);
    }
  }, [searchParams, fetchOrderDetails, methods]);

  // Watch for sales order changes and reset form accordingly
  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      // When user changes the sales order selection, reset dependent fields
      if (name === 'orderSelection.salesOrderId' && type === 'change') {
        const newSalesOrderId = value.orderSelection.salesOrderId;
        const currentSalesOrderId = methods.getValues('orderDetails.salesOrderId');
        
        // If selection changed, reset the related fields
        if (newSalesOrderId !== currentSalesOrderId) {
          console.log('🔄 Sales order changed. Resetting dependent fields...');
          
          // Reset order details
          methods.setValue('orderDetails.productId', '');
          methods.setValue('orderDetails.quantity', '');
          methods.setValue('orderDetails.specialInstructions', '');
          
          // Reset scheduling
          methods.setValue('scheduling.plannedStartDate', '');
          methods.setValue('scheduling.plannedEndDate', '');
          methods.setValue('scheduling.shift', '');
          methods.setValue('scheduling.expectedHours', '');
          
          // Clear materials - important!
          methods.setValue('materials.items', []);
          
          // Reset autofilled flag
          methods.setValue('orderSelection.autoFilled', false);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [methods]);



  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      if (!name) return;

      if (name === 'customization.useCustomStages' && type === 'change') {
        if (value.customization.useCustomStages && value.customization.stages.length === 0) {
          methods.setValue(
            'customization.stages',
            defaultStageTemplates.map((stage) => ({ ...stage })),
            {
              shouldDirty: true,
              shouldTouch: false,
            },
          );
        }
        if (!value.customization.useCustomStages) {
          methods.setValue('customization.stages', [], {
            shouldDirty: true,
            shouldTouch: false,
          });
        }
      }

      const stepIndex = stepConfig.findIndex((step) => name.startsWith(step.key));
      if (stepIndex >= 0) {
        methods.trigger(stepConfig[stepIndex].key).then((valid) => {
          setInvalidSteps((prev) => {
            const updated = new Set(prev);
            if (valid) {
              updated.delete(stepIndex);
            } else {
              updated.add(stepIndex);
            }
            return updated;
          });

          setCompletedSteps((prev) => {
            const updated = new Set(prev);
            if (valid) {
              updated.add(stepIndex);
            } else {
              updated.delete(stepIndex);
            }
            return updated;
          });
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProducts, methods]);

  const formErrors = methods.formState.errors;
  const currentStepKey = stepConfig[currentStep].key;
  const currentStepErrors = useMemo(
    () => getNestedError(formErrors, currentStepKey),
    [formErrors, currentStepKey],
  );
  const currentStepErrorCount = useMemo(
    () => countValidationErrors(currentStepErrors),
    [currentStepErrors],
  );
  const hasStepError = invalidSteps.has(currentStep);
  const statusDescription = hasStepError && currentStepErrorCount > 0
    ? `${stepConfig[currentStep].description} • ${currentStepErrorCount} field${currentStepErrorCount === 1 ? '' : 's'} need attention.`
    : stepConfig[currentStep].description;

  // Permission check disabled - all users can create production orders

  const attemptStepChange = (nextStep) => {
    if (nextStep === currentStep) return;

    setInvalidSteps((prev) => {
      const updated = new Set(prev);
      const targetStepKey = stepConfig[nextStep].key;
      const targetStepErrors = getNestedError(formErrors, targetStepKey);
      const targetHasErrors = countValidationErrors(targetStepErrors) > 0;
      if (targetHasErrors) {
        updated.add(nextStep);
      } else {
        updated.delete(nextStep);
      }
      return updated;
    });

    setCurrentStep(nextStep);
  };

  const handleProductSearchChange = (event) => {
    const { value } = event.target;
    setSearchInputs((prev) => ({ ...prev, productSearch: value }));

    if (productSearchTimeoutRef.current) {
      clearTimeout(productSearchTimeoutRef.current);
    }

    productSearchTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, productSearch: value }));
      fetchProducts(value);
    }, 350);
  };

  const handleSalesOrderSearchChange = (event) => {
    const { value } = event.target;
    setSearchInputs((prev) => ({ ...prev, salesOrderSearch: value }));

    if (salesOrderSearchTimeoutRef.current) {
      clearTimeout(salesOrderSearchTimeoutRef.current);
    }

    salesOrderSearchTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, salesOrderSearch: value }));
      // Sales order search is now handled in OrderSelectionStep
    }, 350);
  };

  const handleNext = () => {
    if (currentStep < stepConfig.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    
    // Log form values for debugging
    console.log('Form submission values:', JSON.stringify({
      productId: values.orderDetails.productId,
      salesOrderId: values.orderSelection.salesOrderId,
      productOptions: productOptions.length,
      availableProductIds: productOptions.map(p => p.value)
    }, null, 2));
    
    // Validate product_id is numeric
    if (values.orderDetails.productId && isNaN(Number(values.orderDetails.productId))) {
      console.error('Invalid product_id detected:', values.orderDetails.productId);
      toast.error('Invalid product selected. Please select a valid product from the dropdown.');
      setSubmitting(false);
      setCurrentStep(0); // Go back to first step
      return;
    }
    
    const payload = buildPayload(values);

    try {
      // Create production order
      const orderResponse = await api.post('/manufacturing/orders', payload);
      const createdOrder = orderResponse.data;
      
      // Update sales order status to in_production
      if (values.orderSelection.salesOrderId) {
        try {
          await api.put(`/sales/orders/${values.orderSelection.salesOrderId}/status`, {
            status: 'in_production',
            production_order_id: createdOrder.id || createdOrder.productionOrder?.id
          });
          console.log('✅ Sales order status updated to in_production');
        } catch (statusError) {
          console.error('Failed to update sales order status:', statusError);
          // Don't fail the entire operation if this fails
        }
      }
      
      // Create operations for each stage
      if (createdOrder && createdOrder.stages) {
        for (const stage of createdOrder.stages) {
          const isOutsourced = stage.outsourced || false;
          const operations = getOperationTemplate(stage.stage_name, isOutsourced);
          
          if (operations && operations.length > 0) {
            try {
              await api.post(`/manufacturing/stages/${stage.id}/operations`, {
                operations: operations.map((op, index) => ({
                  ...op,
                  operation_order: index + 1,
                })),
              });
            } catch (opError) {
              console.error(`Failed to create operations for stage ${stage.stage_name}:`, opError);
              // Continue with other stages even if one fails
            }
          }
          
          // Auto-create challan for outsourced embroidery/printing stages
          if (isOutsourced && (stage.customization_type === 'embroidery' || stage.customization_type === 'printing') && stage.vendor_id) {
            try {
              await api.post('/manufacturing/challans', {
                production_stage_id: stage.id,
                vendor_id: stage.vendor_id,
                challan_number: `CH-${createdOrder.production_number}-${stage.stage_order}`,
                dispatch_date: null, // Will be set when dispatching
                expected_return_date: null,
                status: 'draft',
                notes: `Auto-created for ${stage.customization_type} stage`,
              });
            } catch (challanError) {
              console.error(`Failed to create challan for stage ${stage.stage_name}:`, challanError);
              // Continue even if challan creation fails
            }
          }
        }
      }
      
      toast.success('Production order created successfully with operations');
      navigate('/manufacturing/orders');
    } catch (error) {
      console.error('create production order error', error);
      toast.error(error.response?.data?.message || 'Failed to create production order');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <OrderSelectionStep
            salesOrders={salesOrders}
            loadingOrders={loadingOrders}
            selectedOrderDetails={selectedOrderDetails}
            loadingProductDetails={loadingProductDetails}
            fetchOrderDetails={fetchOrderDetails}
          />
        );
      case 1:
        return <OrderDetailsStep />;
      case 2:
        return <SchedulingStep />;
      case 3:
        return <MaterialsStep />;
      case 4:
        return <QualityStep />;
      case 5:
        return <TeamStep />;
      case 6:
        return <CustomizationStep canCustomize={canCustomizeStages} vendors={vendors} loadingVendors={loadingVendors} />;
      case 7: {
        const values = methods.getValues();
        return <ReviewStep values={values} />;
      }
      default:
        return null;
    }
  }, [canCustomizeStages, currentStep, methods, salesOrders, loadingOrders, selectedOrderDetails, fetchOrderDetails, vendors, loadingVendors]);

  // Calculate progress
  const progressPercentage = Math.round((completedSteps.size / stepConfig.length) * 100);
  const remainingSteps = stepConfig.length - completedSteps.size;

  return (
    <>
      <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Enhanced Header with Progress */}
        <header className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Production Order Wizard</h1>
                  <p className="text-base text-gray-600 mt-1">Complete each step to create a new manufacturing order</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-3 rounded-full transition-all duration-500 ease-out shadow-md"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {completedSteps.size} of {stepConfig.length} steps completed • {remainingSteps} remaining
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 text-center min-w-[100px] shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-blue-600">{completedSteps.size}</div>
                <div className="text-xs text-gray-600 mt-1 font-semibold">Completed</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3 text-center min-w-[100px] shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-green-600">{stepConfig.length - completedSteps.size}</div>
                <div className="text-xs text-gray-600 mt-1 font-semibold">Remaining</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-3 text-center min-w-[100px] shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-amber-600">{invalidSteps.size}</div>
                <div className="text-xs text-gray-600 mt-1 font-semibold">Need Review</div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>Estimated completion time: <span className="font-bold text-gray-900">10-15 minutes</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Need assistance?</span>
              <a href="mailto:support@pashion-erp.com" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </header>

        {/* Enhanced Stepper */}
        <Stepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          invalidSteps={invalidSteps}
          onStepSelect={attemptStepChange}
        />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step Content Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 animate-fadeInUp">
              {/* Current Step Header */}
              <div className="mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                    {currentStep + 1}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{stepConfig[currentStep].title}</h2>
                    <p className="text-base text-gray-600 mt-1">{stepConfig[currentStep].description}</p>
                  </div>
                </div>
                
                <StepStatusBanner
                  hasError={hasStepError}
                  title={stepConfig[currentStep].title}
                  description={statusDescription}
                />
              </div>

              {/* Step Content */}
              <div className="min-h-[450px] space-y-6">
                {renderStepContent}
              </div>
            </div>

            {/* Enhanced Footer */}
            <footer className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                {/* Step Counter */}
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="font-bold text-gray-900 text-lg">Step {currentStep + 1}</span>
                    <span className="text-gray-600"> of {stepConfig.length}</span>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="text-gray-600">
                    {currentStep === stepConfig.length - 1 ? (
                      <span className="flex items-center gap-2 text-green-600 font-semibold">
                        <CheckCircle2 className="w-5 h-5" />
                        Ready to submit
                      </span>
                    ) : (
                      <span><span className="font-semibold">{stepConfig.length - currentStep - 1}</span> steps remaining</span>
                    )}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold text-base hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                  )}
                  {currentStep < stepConfig.length - 1 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-base hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                      disabled={hasStepError}
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {currentStep === stepConfig.length - 1 && (
                    <button
                      type="submit"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-base hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                      disabled={submitting || hasStepError}
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{submitting ? 'Creating...' : 'Create Order'}</span>
                      {!submitting && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Warning if errors */}
              {hasStepError && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 px-4 py-3 text-sm bg-amber-50 border border-amber-300 rounded-lg text-amber-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                    <span className="font-medium">Please fix the validation errors above before proceeding to the next step.</span>
                  </div>
                </div>
              )}
            </footer>
          </form>
        </FormProvider>
      </div>
    </>
  );
};

const FieldLabel = ({ label, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {label}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const ErrorText = ({ error, id }) => (
  error ? (
    <p id={id} className="text-sm text-red-500 mt-1" role="alert">
      {error.message}
    </p>
  ) : null
);

const toErrorId = (name) => `${name.replace(/\./g, '-')}-error`;

const Row = ({ children, columns = 2 }) => {
  const mdCols = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns] || 'md:grid-cols-2';

  return <div className={`grid grid-cols-1 gap-4 ${mdCols}`}>{children}</div>;
};

const TextInput = ({ name, label, type = 'text', required, placeholder, disabled = false, size = 'md' }) => {
  const {
    register,
    formState: { errors },
  } = useFormContextSafe();

  const error = getNestedError(errors, name);
  const errorId = error ? toErrorId(name) : undefined;

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  }[size] || 'px-3 py-2';

  return (
    <div>
      <FieldLabel label={label} required={required} />
      <input
        {...register(name, type === 'number' ? { valueAsNumber: true } : {})}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-md border ${sizeClasses} focus:outline-none focus:ring-2 transition-colors ${
          disabled 
            ? 'bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed' 
            : error 
              ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
              : 'border-gray-300 focus:ring-primary focus:border-primary'
        }`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
      />
      <ErrorText error={error} id={errorId} />
    </div>
  );
};

const TextArea = ({ name, label, rows = 3, required, placeholder }) => {
  const {
    register,
    formState: { errors },
  } = useFormContextSafe();
  const error = getNestedError(errors, name);
  const errorId = error ? toErrorId(name) : undefined;

  return (
    <div>
      <FieldLabel label={label} required={required} />
      <textarea
        {...register(name)}
        rows={rows}
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
        }`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
      />
      <ErrorText error={error} id={errorId} />
    </div>
  );
};

const SelectInput = ({ name, label, options, required, disabled }) => {
  const {
    register,
    formState: { errors },
  } = useFormContextSafe();
  const error = getNestedError(errors, name);
  const errorId = error ? toErrorId(name) : undefined;

  return (
    <div>
      <FieldLabel label={label} required={required} />
      <select
        {...register(name)}
        disabled={disabled}
        className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ErrorText error={error} id={errorId} />
    </div>
  );
};

const SwitchInput = ({ name, label, hint, disabled }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContextSafe();
  const checked = watch(name);
  const error = getNestedError(errors, name);
  const errorId = error ? toErrorId(name) : undefined;
  const hintId = hint ? `${toErrorId(name)}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  React.useEffect(() => {
    if (disabled) {
      setValue(name, false, { shouldDirty: true, shouldTouch: true });
    }
  }, [disabled, name, setValue]);

  return (
    <div className="flex items-start gap-3">
      <div className="pt-1">
        <input
          type="checkbox"
          {...register(name)}
          disabled={disabled}
          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-60"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
        {hint && (
          <p id={hintId} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">{checked ? 'Enabled' : 'Disabled'}</p>
        {disabled && (
          <p className="text-xs text-red-400 mt-1">
            You do not have permission to customize stages.
          </p>
        )}
        <ErrorText error={error} id={errorId} />
      </div>
    </div>
  );
};

const OrderSelectionStep = ({
  salesOrders,
  loadingOrders,
  selectedOrderDetails,
  loadingProductDetails,
  fetchOrderDetails,
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContextSafe();

  const selectedSalesOrderId = watch('orderSelection.salesOrderId');
  const autoFilled = watch('orderSelection.autoFilled');

  // Auto-trigger fetch when order is selected and has changed
  useEffect(() => {
    if (selectedSalesOrderId && !autoFilled) {
      fetchOrderDetails(selectedSalesOrderId);
    }
  }, [selectedSalesOrderId, autoFilled, fetchOrderDetails]);

  return (
    <SectionCard
      icon={FileSearch}
      title="Select Project"
      description="Choose a sales order project to begin production"
    >
      <StepStatusBanner
        hasError={!!errors.orderSelection}
        title="Project Selection"
        description="Select a sales order project to auto-fill order details, delivery date, customer info, and materials."
      />

      <div>
        <label htmlFor="salesOrderId" className="block text-sm font-medium text-gray-700 mb-2">
          Project / Sales Order <span className="text-red-500">*</span>
        </label>
        <select
          id="salesOrderId"
          {...register('orderSelection.salesOrderId')}
          className={`w-full px-4 py-2 border rounded-lg ${errors.orderSelection?.salesOrderId ? 'border-red-500' : 'border-gray-300'}`}
          disabled={loadingOrders}
        >
          <option value="">-- Select a project/sales order --</option>
          {salesOrders.map((order) => {
            // Get customer name
            const customerName = order.customer?.name || 'Unknown Customer';
            
            // Get product from items
            let productName = 'N/A';
            try {
              if (order.items) {
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                if (Array.isArray(items) && items.length > 0) {
                  productName = items[0].product_name || items[0].name || 'N/A';
                }
              }
            } catch (e) {
              console.warn('Could not parse items for order:', order.id);
            }
            
            // Get quantity
            let quantity = 0;
            try {
              if (order.items) {
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                if (Array.isArray(items) && items.length > 0) {
                  quantity = items[0].quantity || 0;
                }
              }
            } catch (e) {
              console.warn('Could not parse quantity for order:', order.id);
            }
            
            return (
              <option key={order.id} value={String(order.id)}>
                {order.order_number || `SO-${order.id}`}
                {' • '}
                {customerName}
                {' • '}
                {productName}
                {quantity > 0 ? ` • Qty: ${quantity}` : ''}
              </option>
            );
          })}
        </select>
        {errors.orderSelection?.salesOrderId && (
          <p className="mt-1 text-sm text-red-500">
            {errors.orderSelection.salesOrderId.message}
          </p>
        )}
      </div>

      {loadingProductDetails && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-800">Loading project details, PO, and materials...</span>
        </div>
      )}

      {selectedOrderDetails && autoFilled && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Project Details Loaded
          </h3>
          <div className="text-sm text-green-800 space-y-1">
            <p>
              <strong>Customer:</strong> {selectedOrderDetails.customer_name || 'N/A'}
            </p>
            <p>
              <strong>Product:</strong> {selectedOrderDetails.product_name || 'N/A'}
            </p>
            <p>
              <strong>Quantity:</strong> {selectedOrderDetails.quantity || 0}
            </p>
            <p>
              <strong>Project Name:</strong> {selectedOrderDetails.project_name || 'N/A'}
            </p>
            <p>
              <strong>Delivery Date:</strong> {selectedOrderDetails.delivery_date ? format(parseISO(selectedOrderDetails.delivery_date), 'MMM dd, yyyy') : 'Not specified'}
            </p>
            {selectedOrderDetails.materials && selectedOrderDetails.materials.length > 0 && (
              <p>
                <strong>Materials:</strong> {selectedOrderDetails.materials.length} item(s) loaded
              </p>
            )}
          </div>
        </div>
      )}

      <StepHint>
        💡 Select a project/sales order to automatically load project details, customer info, delivery date, and material requirements from the sales order and linked PO/MRN.
      </StepHint>
    </SectionCard>
  );
};

const OrderDetailsStep = () => {
  const { watch } = useFormContextSafe();
  const salesOrderId = watch('orderSelection.salesOrderId');
  const quantity = watch('orderDetails.quantity');

  return (
    <SectionCard icon={ClipboardList} title="Production order basics" description="Capture the essential order metadata.">
      {!salesOrderId ? (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-900">⚠️ Project Not Selected</p>
            <p className="text-xs text-amber-700 mt-1">
              Please go back to Step 1 and select a project/sales order first. 
              <br />Product information and quantity will be automatically loaded here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <StepHint>
            ✅ Product information is automatically loaded from the project selected in Step 1. 
            <br />Adjust production type and priority as needed. Materials will be fetched from the project's material request in Step 4.
          </StepHint>
          <Row>
            <SelectInput
              name="orderDetails.productionType"
              label="Production Type"
              required
              options={[
                { value: 'in_house', label: 'In-House' },
                { value: 'outsourced', label: 'Outsourced' },
                { value: 'mixed', label: 'Mixed' },
              ]}
            />
            <TextInput name="orderDetails.quantity" label="Quantity" type="number" required />
            <SelectInput
              name="orderDetails.priority"
              label="Priority"
              required
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </Row>
          <Row>
            <TextArea
              name="orderDetails.specialInstructions"
              label="Special Instructions"
              rows={3}
              placeholder="Note any production nuances, trims, or handling notes"
            />
          </Row>
        </>
      )}
  </SectionCard>
  );
};

const SchedulingStep = () => {
  const { watch } = useFormContextSafe();
  const salesOrderId = watch('orderSelection.salesOrderId');

  return (
    <SectionCard icon={CalendarCheck} title="Plan the production timeline" description="Ensure scheduling aligns with capacity and promises.">
      {!salesOrderId ? (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-900">⚠️ Project Not Selected</p>
            <p className="text-xs text-amber-700 mt-1">
              Please go back to Step 1 and select a project/sales order first. 
              <br />Then you can plan the production timeline here.
            </p>
          </div>
        </div>
      ) : (
        <Row>
          <TextInput name="scheduling.plannedStartDate" label="Planned Start Date" type="date" required />
          <TextInput name="scheduling.plannedEndDate" label="Planned End Date" type="date" required />
          <SelectInput
            name="scheduling.shift"
            label="Shift"
            required
            options={[
              { value: 'day', label: 'Day Shift' },
              { value: 'morning', label: 'Morning Shift' },
              { value: 'afternoon', label: 'Afternoon Shift' },
              { value: 'evening', label: 'Evening Shift' },
              { value: 'night', label: 'Night Shift' },
              { value: 'flexible', label: 'Flexible' },
            ]}
          />
          <TextInput name="scheduling.expectedHours" label="Expected Hours" type="number" />
        </Row>
      )}
    </SectionCard>
  );
};

const MaterialsStep = () => {
  const { control, formState: { errors }, watch } = useFormContextSafe();
  const { fields, append, remove } = useFieldArray({ control, name: 'materials.items' });
  const autoFilled = watch('orderSelection.autoFilled');
  const salesOrderId = watch('orderSelection.salesOrderId');
  
  // Function to generate next Material ID (M-001, M-002, etc.)
  const generateNextMaterialId = () => {
    const maxIndex = fields.length > 0 
      ? Math.max(...fields.map((field, idx) => idx)) + 1 
      : 0;
    return `M-${(maxIndex + 1).toString().padStart(3, '0')}`;
  };

  return (
    <SectionCard icon={PackageSearch} title="Verify materials" description="Ensure material sufficiency to avoid interruptions.">
      <div className="space-y-6">
        {/* Show message when no project selected */}
        {!salesOrderId && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">⚠️ Project Not Selected</p>
              <p className="text-xs text-amber-700 mt-1">
                Please go back to Step 1 and select a project/sales order first. 
                <br />Materials will be automatically loaded from the project's Material Request.
              </p>
            </div>
          </div>
        )}

        {/* Show message when loading or no materials found */}
        {salesOrderId && !autoFilled && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-900">🔄 Loading materials...</p>
              <p className="text-xs text-blue-700 mt-1">
                Fetching materials from the project's Material Request Number. Please wait...
              </p>
            </div>
          </div>
        )}

        {/* Show when materials are loaded */}
        {autoFilled && fields.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-900">📦 Materials loaded from MRN</p>
              <p className="text-xs text-blue-700 mt-1">
                {fields.length} material(s) fetched from the Material Request Number for this project. 
                <br />✓ Material IDs are auto-generated (M-001, M-002, etc.) for each material.
                <br />✓ Read-only fields (ID, Description, Unit, Color, GSM, Width) are locked from MRN.
                <br />✓ Adjust Required Quantity and Status as needed before submission.
              </p>
            </div>
          </div>
        )}

        {/* Show when project selected but no materials in MRN */}
        {autoFilled && fields.length === 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-yellow-900">⚠️ No Materials Found in MRN</p>
              <p className="text-xs text-yellow-700 mt-1">
                No materials were found in the Material Request for this project. 
                <br />You can manually add materials below using the "Add Material" button.
              </p>
            </div>
          </div>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="border-2 border-gray-200 rounded-lg p-5 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <span className="text-sm font-bold text-gray-900">📌 Material #{index + 1}</span>
                {field.remarks && (
                  <p className="text-xs text-gray-600 mt-1">🔗 {field.remarks}</p>
                )}
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-xs px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 transition-colors"
                >
                  ✕ Remove
                </button>
              )}
            </div>

            {/* Core Material Info */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Core Information</p>
              <Row columns={3}>
                <TextInput name={`materials.items.${index}.materialId`} label="Material ID / Code" required disabled size="md" />
                <TextInput name={`materials.items.${index}.description`} label="Description" required disabled size="md" />
                <TextInput name={`materials.items.${index}.requiredQuantity`} label="Required Qty ⚡" type="number" required size="md" />
              </Row>
            </div>
            
            {/* MRN Details - Fetched from Material Request Number */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-4">
              <p className="text-xs font-bold text-purple-900 mb-3 uppercase tracking-wide">📋 Sourced from MRN</p>
              <Row columns={3}>
                <TextInput name={`materials.items.${index}.unit`} label="Unit" required disabled size="sm" />
                {field.barcode && (
                  <TextInput name={`materials.items.${index}.barcode`} label="🏷️ Barcode" disabled size="sm" />
                )}
                {field.location && (
                  <TextInput name={`materials.items.${index}.location`} label="📍 Location" disabled size="sm" />
                )}
              </Row>
              
              {/* Fabric Attributes */}
              {(field.color || field.gsm || field.width) && (
                <>
                  <hr className="my-3 border-purple-200" />
                  <p className="text-xs font-semibold text-purple-800 mb-2">Fabric Attributes</p>
                  <Row columns={3}>
                    {field.color && (
                      <TextInput name={`materials.items.${index}.color`} label="🎨 Color" disabled size="sm" />
                    )}
                    {field.gsm && (
                      <TextInput name={`materials.items.${index}.gsm`} label="⚖️ GSM" disabled size="sm" />
                    )}
                    {field.width && (
                      <TextInput name={`materials.items.${index}.width`} label="📏 Width" disabled size="sm" />
                    )}
                  </Row>
                </>
              )}

              {field.condition && (
                <>
                  <hr className="my-3 border-purple-200" />
                  <Row>
                    <TextInput name={`materials.items.${index}.condition`} label="Condition" disabled size="sm" />
                  </Row>
                </>
              )}
            </div>

            {/* Status & Actions */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Status & Adjustments</p>
              <Row columns={2}>
                <SelectInput
                  name={`materials.items.${index}.status`}
                  label="Availability Status"
                  required
                  options={[
                    { value: 'available', label: '✓ Available' },
                    { value: 'shortage', label: '⚠️ Shortage' },
                    { value: 'ordered', label: '📦 Ordered' },
                  ]}
                />
              </Row>
            </div>
          </div>
        ))}

        <ErrorText error={errors.materials?.items} />

        {/* Add Material Button */}
        {(fields.length === 0 || autoFilled) && (
          <button
            type="button"
            onClick={() => append({ 
              materialId: generateNextMaterialId(), 
              description: '', 
              requiredQuantity: '', 
              unit: 'pieces', 
              status: 'available',
              barcode: '',
              location: '',
              color: '',
              gsm: '',
              width: '',
              condition: '',
              remarks: ''
            })}
            className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors text-sm"
          >
            {fields.length === 0 ? '➕ Add First Material' : '➕ Add Additional Material'}
          </button>
        )}
      </div>
    </SectionCard>
  );
};

const QualityStep = () => {
  const { control, formState: { errors } } = useFormContextSafe();
  const { fields, append, remove } = useFieldArray({ control, name: 'quality.checkpoints' });

  return (
    <SectionCard icon={ShieldCheck} title="Quality parameters" description="Define inspection gates and acceptance standards.">
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Checkpoint #{index + 1}</span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
            <Row>
              <TextInput name={`quality.checkpoints.${index}.name`} label="Checkpoint" required />
              <SelectInput
                name={`quality.checkpoints.${index}.frequency`}
                label="Frequency"
                required
                options={[
                  { value: 'per_batch', label: 'Per Batch' },
                  { value: 'per_unit', label: 'Per Unit' },
                  { value: 'per_shift', label: 'Per Shift' },
                ]}
              />
              <TextArea
                name={`quality.checkpoints.${index}.acceptanceCriteria`}
                label="Acceptance Criteria"
                rows={2}
                required
              />
            </Row>
          </div>
        ))}

        <ErrorText error={errors.quality?.checkpoints} />

        <TextArea name="quality.notes" label="Quality Notes" placeholder="Record quality alerts or heightened inspection guidance" />

        <button
          type="button"
          onClick={() => append({ name: '', frequency: 'per_batch', acceptanceCriteria: '' })}
          className="px-4 py-2 rounded-md border border-dashed border-primary text-primary hover:bg-primary/5"
        >
          Add Checkpoint
        </button>
      </div>
    </SectionCard>
  );
};

const TeamStep = () => (
  <SectionCard icon={Users} title="Assign your team" description="Allocate accountability for execution and oversight.">
    <Row>
      <TextInput name="team.supervisorId" label="Production Supervisor" />
      <TextInput name="team.assignedToId" label="Primary Operator" />
      <TextInput name="team.qaLeadId" label="QA Lead" />
    </Row>
    <TextArea name="team.notes" label="Team Notes" placeholder="Any additional alignment notes or shift specifics" />
  </SectionCard>
);

const CustomizationStep = ({ canCustomize, vendors = [], loadingVendors = false }) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContextSafe();
  const useCustomStages = watch('customization.useCustomStages');
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'customization.stages',
  });
  const stageArrayError = errors.customization?.stages;

  const handleAddStage = () => {
    append({ 
      stageName: '', 
      plannedDurationHours: '',
      isPrinting: false,
      isEmbroidery: false,
      isOutsourced: false,
      vendorId: null
    });
  };

  const renderStageCard = (field, index) => {
    const isPrinting = watch(`customization.stages.${index}.isPrinting`);
    const isEmbroidery = watch(`customization.stages.${index}.isEmbroidery`);
    const isOutsourced = watch(`customization.stages.${index}.isOutsourced`);
    const showExecutionOptions = isPrinting || isEmbroidery;

    return (
      <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Stage #{index + 1}</span>
            {isPrinting && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                Printing
              </span>
            )}
            {isEmbroidery && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-pink-100 text-pink-700">
                Embroidery
              </span>
            )}
            {showExecutionOptions && isOutsourced && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">
                Outsourced
              </span>
            )}
            {showExecutionOptions && !isOutsourced && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                In-House
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => move(index, index - 1)}
              disabled={index === 0}
              className={`px-3 py-1 text-xs rounded border ${
                index === 0
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Move Up
            </button>
            <button
              type="button"
              onClick={() => move(index, index + 1)}
              disabled={index === fields.length - 1}
              className={`px-3 py-1 text-xs rounded border ${
                index === fields.length - 1
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Move Down
            </button>
            <button
              type="button"
              onClick={() => remove(index)}
              className="px-3 py-1 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </div>
        <Row>
          <TextInput
            name={`customization.stages.${index}.stageName`}
            label="Stage Name"
            required
            placeholder="e.g. Heat Treatment"
          />
          <TextInput
            name={`customization.stages.${index}.plannedDurationHours`}
            label="Planned Duration (hours)"
            type="number"
            placeholder="Optional"
          />
        </Row>
        
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-xs font-semibold text-gray-700 mb-3">Customization Type</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SwitchInput
              name={`customization.stages.${index}.isPrinting`}
              label="Printing Stage"
              hint="Mark this stage as a printing operation"
            />
            <SwitchInput
              name={`customization.stages.${index}.isEmbroidery`}
              label="Embroidery Stage"
              hint="Mark this stage as an embroidery operation"
            />
          </div>
        </div>
        
        {showExecutionOptions && (
          <div className="border-t border-gray-200 pt-4 bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Execution Method
            </h4>
            <SelectInput
              name={`customization.stages.${index}.isOutsourced`}
              label="Work Type"
              options={[
                { value: 'false', label: '🏭 In-House Production' },
                { value: 'true', label: '🚚 Outsourced to Vendor' },
              ]}
            />
            {isOutsourced && (
              <div className="mt-4 space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-xs text-yellow-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Outsourced work requires vendor selection and challan creation
                  </p>
                </div>
                <SelectInput
                  name={`customization.stages.${index}.vendorId`}
                  label="Select Vendor"
                  required
                  options={[
                    { value: '', label: 'Choose a vendor...' },
                    ...vendors.map(v => ({
                      value: v.id.toString(),
                      label: `${v.vendor_name || v.company_name} ${v.contact_person ? `(${v.contact_person})` : ''}`
                    }))
                  ]}
                />
                {loadingVendors && (
                  <p className="text-xs text-gray-500 italic">Loading vendors...</p>
                )}
                {!loadingVendors && vendors.length === 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-xs text-red-700">⚠️ No vendors found. Please add vendors in Procurement section first.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <SectionCard icon={Settings2} title="Customize stages" description="Toggle to build a bespoke production sequence.">
      <SwitchInput
        name="customization.useCustomStages"
        label="Enable stage customization"
        hint="Use only when the default stages need adjustment."
      />
      {useCustomStages ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Adjust the production stages to match unique workflows. Reorder, rename, or extend the sequence as required.
          </p>
          <div className="space-y-4">
            {fields.length === 0 ? (
              <div className="border border-dashed border-primary/40 rounded-md p-4 text-sm text-primary">
                Stages will appear here once you add them. Use the button below to begin.
              </div>
            ) : (
              fields.map((field, index) => renderStageCard(field, index))
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={handleAddStage}
              className="px-4 py-2 rounded-md border border-dashed border-primary text-primary hover:bg-primary/5"
            >
              Add Stage
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Keep stages concise and outcome-oriented. Duration is optional but helps capacity planning.
            </p>
          </div>
          {stageArrayError?.message && <ErrorText error={stageArrayError} />}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Default stages</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {defaultStageTemplates.map((stage, index) => (
              <li key={stage.stageName}>
                {index + 1}. {stage.stageName}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-3">
            These stages will populate automatically unless customization is enabled.
          </p>
        </div>
      )}
    </SectionCard>
  );
};

const ReviewStep = ({ values }) => {
  const plannedStart = values.scheduling.plannedStartDate
    ? parseISO(values.scheduling.plannedStartDate)
    : null;
  const plannedEnd = values.scheduling.plannedEndDate
    ? parseISO(values.scheduling.plannedEndDate)
    : null;

  const scheduleSummary =
    plannedStart && plannedEnd && isValidDate(plannedStart) && isValidDate(plannedEnd)
      ? `${format(plannedStart, 'MMM d, yyyy')} → ${format(plannedEnd, 'MMM d, yyyy')}`
      : 'Not specified';

  const summaryRows = [
    { label: 'Project', value: values.orderSelection.salesOrderId || 'Not specified' },
    { label: 'Quantity', value: values.orderDetails.quantity || 'Not specified' },
    { label: 'Priority', value: values.orderDetails.priority || 'Not specified' },
    { label: 'Planned Schedule', value: scheduleSummary },
    { label: 'Materials', value: `${values.materials.items.length} item(s)` },
    { label: 'Quality Checkpoints', value: `${values.quality.checkpoints.length} checkpoint(s)` },
  ];

  return (
    <SectionCard icon={CheckCircle2} title="Review order" description="Confirm accuracy before submission.">
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {summaryRows.map((row) => (
          <div key={row.label} className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <dt className="text-[10px] uppercase tracking-wider text-gray-500">{row.label}</dt>
            <dd className="mt-0.5 text-xs font-medium text-gray-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <SwitchInput
          name="review.acknowledge"
          label="I confirm that the order details are accurate"
          hint="Once submitted, the production number will be generated and shared with the team."
        />
      </div>
    </SectionCard>
  );
};

function buildPayload(values) {
  const {
    orderSelection,
    orderDetails,
    scheduling,
    materials,
    quality,
    team,
    customization,
  } = values;

  const payload = {
    product_id: orderDetails.productId ? Number(orderDetails.productId) : null,
    production_type: orderDetails.productionType,
    quantity: Number(orderDetails.quantity),
    priority: orderDetails.priority,
    sales_order_id: orderSelection.salesOrderId || orderDetails.salesOrderId || null,
    production_approval_id: null, // Legacy field - no longer used with sales order selection
    special_instructions: orderDetails.specialInstructions || null,
    planned_start_date: scheduling.plannedStartDate,
    planned_end_date: scheduling.plannedEndDate,
    estimated_hours: scheduling.expectedHours ? Number(scheduling.expectedHours) : null,
    shift: scheduling.shift,
    materials_required: materials.items.map((material) => ({
      material_id: material.materialId,
      description: material.description,
      required_quantity: Number(material.requiredQuantity),
      unit: material.unit,
      status: material.status,
    })),
    quality_parameters: {
      checkpoints: quality.checkpoints.map((checkpoint) => ({
        name: checkpoint.name,
        frequency: checkpoint.frequency,
        acceptance_criteria: checkpoint.acceptanceCriteria,
      })),
      notes: quality.notes || null,
    },
    supervisor_id: team.supervisorId || null,
    assigned_user_id: team.assignedToId || null,
    qa_lead_id: team.qaLeadId || null,
    team_notes: team.notes || null,
  };

  if (customization.useCustomStages) {
    payload.stages = customization.stages.map((stage, index) => {
      const stageData = {
        stage_name: stage.stageName,
        stage_order: index + 1,
        planned_duration_hours:
          stage.plannedDurationHours === '' || stage.plannedDurationHours === null
            ? null
            : Number(stage.plannedDurationHours),
        is_printing: stage.isPrinting || false,
        is_embroidery: stage.isEmbroidery || false,
      };

      // Determine customization_type based on flags
      if (stage.isPrinting && stage.isEmbroidery) {
        stageData.customization_type = 'both';
      } else if (stage.isPrinting) {
        stageData.customization_type = 'printing';
      } else if (stage.isEmbroidery) {
        stageData.customization_type = 'embroidery';
      } else {
        stageData.customization_type = 'none';
      }

      // Add outsourced info if it's a customization stage
      if (stage.isPrinting || stage.isEmbroidery) {
        stageData.outsourced = stage.isOutsourced === 'true' || stage.isOutsourced === true;
        if (stageData.outsourced && stage.vendorId) {
          stageData.vendor_id = Number(stage.vendorId);
        }
      }

      return stageData;
    });
  }

  return payload;
}

function useFormContextSafe() {
  const methods = useFormContext();
  if (!methods) {
    throw new Error('Form components must be used within FormProvider');
  }
  return methods;
}

function getNestedError(errors, name) {
  const parts = name.split('.');
  let current = errors;
  for (const part of parts) {
    if (!current) break;
    current = current[part];
  }
  return current;
}

export default ProductionWizardPage;