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
    .min(1, 'At least one material is required'),
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
  productId: yup.string().required('Product is required'),
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
  productionApprovalId: yup.string().required('Please select an approved order'),
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
    productionApprovalId: '',
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
    items: [
      {
        materialId: '',
        description: '',
        requiredQuantity: '',
        unit: '',
        status: 'available',
      },
    ],
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
    title: 'Select Order',
    description: 'Choose an approved order to begin production.',
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
  <section className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
    <header className="flex items-start gap-4 mb-6 pb-4 border-b border-gray-200">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </header>
    <div className="space-y-5">{children}</div>
  </section>
);

const Stepper = ({ currentStep, completedSteps, invalidSteps, onStepSelect }) => (
  <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Progress Steps</h3>
      <p className="text-sm text-gray-600">Click on any step to navigate (if completed or in progress)</p>
    </div>
    
    <nav className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {stepConfig.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === index;
        const isCompleted = completedSteps.has(index);
        const isErrored = invalidSteps.has(index);
        const isClickable = index <= currentStep + 1 || isCompleted || isErrored;

        const buttonClass = isActive
          ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
          : isErrored
            ? 'border-red-400 bg-red-50 hover:bg-red-100'
            : isCompleted
              ? 'border-green-400 bg-green-50 hover:bg-green-100'
              : 'border-gray-200 bg-white hover:bg-gray-50';

        const badgeClass = isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : isErrored
            ? 'bg-red-500 text-white'
            : isCompleted
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-500';

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
            className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${buttonClass} ${!isClickable ? 'cursor-not-allowed opacity-50' : 'hover:shadow-sm'}`}
            disabled={!isClickable}
            data-invalid={isErrored || undefined}
            title={`${step.title} - ${isCompleted ? 'Completed' : isErrored ? 'Needs attention' : isActive ? 'Current' : 'Pending'}`}
          >
            <div className="relative">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${badgeClass} transition-all`}>
                {isActive ? (
                  <Icon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              {statusIcon}
            </div>
            
            <div className="text-center w-full">
              <p className={`text-xs font-semibold ${isActive ? 'text-blue-600' : isErrored ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                {step.title}
              </p>
              {isActive && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">
                  Current
                </span>
              )}
              {isCompleted && !isActive && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">
                  Done
                </span>
              )}
              {isErrored && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">
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
    ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800 shadow-sm'
    : 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 text-green-800 shadow-sm';
  const iconClass = hasError ? 'text-red-600' : 'text-green-600';
  const helperText = hasError
    ? '⚠️ Resolve the highlighted fields below to continue.'
    : '✓ All required fields are complete. Review and proceed when ready.';

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border-2 px-4 py-4 text-sm ${containerClass}`}
      role="status"
      aria-live="polite"
      data-has-error={hasError || undefined}
    >
      <Icon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${iconClass}`} aria-hidden="true" />
      <div className="space-y-1 flex-1">
        <p className="font-bold text-base">{hasError ? 'Validation Required' : 'Step Complete'}</p>
        <p className="text-sm">{description}</p>
        <p className="text-xs font-medium opacity-90 mt-2">{helperText}</p>
      </div>
    </div>
  );
};

const StepHint = ({ children, tone = 'info' }) => {
  const Icon = tone === 'warning' ? AlertCircle : Info;
  const toneClasses = tone === 'warning'
    ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 shadow-sm'
    : 'border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 shadow-sm';
  
  const iconClasses = tone === 'warning' ? 'text-amber-600' : 'text-blue-600';

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${toneClasses}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconClasses}`} />
      <div className="leading-relaxed text-xs md:text-sm font-medium">{children}</div>
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
  const [approvedOrders, setApprovedOrders] = useState([]);
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

  const fetchSalesOrders = useCallback(
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
        console.error('fetch sales orders error', error);
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

  const fetchApprovedOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const response = await api.get('/production-approval/list/approved');
      setApprovedOrders(response.data?.approvals || []);
    } catch (error) {
      console.error('fetch approved orders error', error);
      toast.error('Unable to load approved orders');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchOrderDetails = useCallback(
    async (approvalId) => {
      if (!approvalId) return;

      setLoadingProductDetails(true);
      try {
        const response = await api.get(`/production-approval/${approvalId}/details`);
        const approval = response.data.approval;
        
        if (!approval) {
          toast.error('Approval data not found');
          return;
        }

        // Extract data from nested structure
        const mrnRequest = approval.mrnRequest || {};
        const salesOrder = mrnRequest.salesOrder || {};
        const purchaseOrder = mrnRequest.purchaseOrder || {};
        const customer = salesOrder.customer || {};
        const vendor = purchaseOrder.vendor || {};
        const verification = approval.verification || {};
        const receipt = verification.receipt || {};
        
        // Parse materials_requested from MRN
        let materialsRequested = [];
        try {
          if (mrnRequest.materials_requested) {
            materialsRequested = typeof mrnRequest.materials_requested === 'string' 
              ? JSON.parse(mrnRequest.materials_requested) 
              : mrnRequest.materials_requested;
          }
        } catch (e) {
          console.warn('Failed to parse materials_requested:', e);
        }

        // Extract customer name from manufacturing_notes as fallback
        let extractedCustomerName = null;
        if (mrnRequest.manufacturing_notes) {
          const match = mrnRequest.manufacturing_notes.match(/Customer:\s*([^\n]+)/);
          if (match) {
            extractedCustomerName = match[1].trim();
          }
        }

        // Parse items from sales order or purchase order
        let items = [];
        try {
          if (salesOrder.items) {
            items = typeof salesOrder.items === 'string' ? JSON.parse(salesOrder.items) : salesOrder.items;
          } else if (purchaseOrder.items) {
            items = typeof purchaseOrder.items === 'string' ? JSON.parse(purchaseOrder.items) : purchaseOrder.items;
          }
        } catch (e) {
          console.warn('Failed to parse items:', e);
        }

        // Parse received materials from receipt
        let receivedMaterials = [];
        try {
          if (receipt.received_materials) {
            receivedMaterials = typeof receipt.received_materials === 'string' 
              ? JSON.parse(receipt.received_materials) 
              : receipt.received_materials;
          }
        } catch (e) {
          console.warn('Failed to parse received materials:', e);
        }

        // Determine customer/vendor name with multiple fallbacks
        const customerVendorName = customer.name || 
                                   vendor.name || 
                                   extractedCustomerName || 
                                   'N/A';

        // Determine product name with multiple fallbacks
        const productName = items[0]?.product_name || 
                           items[0]?.name || 
                           materialsRequested[0]?.description ||
                           materialsRequested[0]?.product_name ||
                           approval.product_name ||
                           mrnRequest.product_name ||
                           'N/A';

        // Determine quantity with multiple fallbacks
        const quantity = items[0]?.quantity || 
                        materialsRequested[0]?.quantity_required ||
                        receipt.total_items_received || 
                        1;

        // Prepare transformed data for display
        const transformedData = {
          customer_name: customerVendorName,
          vendor_name: vendor.name || 'N/A',
          product_name: productName,
          quantity: quantity,
          project_name: receipt.project_name || 
                       purchaseOrder.project_name || 
                       salesOrder.project_name || 
                       mrnRequest.project_name ||
                       approval.project_name ||
                       'N/A',
          product_id: items[0]?.product_id || 
                     materialsRequested[0]?.product_id ||
                     approval.product_id ||
                     mrnRequest.product_id ||
                     null,
          sales_order_id: salesOrder.id || mrnRequest.sales_order_id || null,
          special_instructions: salesOrder.special_instructions || 
                               mrnRequest.manufacturing_notes || 
                               approval.approval_notes || 
                               '',
          materials: receivedMaterials.length > 0 ? receivedMaterials : materialsRequested
        };

        setSelectedOrderDetails(transformedData);

        // If product_id exists, fetch the product details and ensure it's in the dropdown
        let validProductId = null;
        if (transformedData.product_id) {
          try {
            // Check if product_id is numeric or a product code
            const isNumeric = !isNaN(Number(transformedData.product_id));
            let product = null;
            
            if (isNumeric) {
              // It's a numeric ID, fetch directly
              const productResponse = await api.get(`/products/${transformedData.product_id}`);
              product = productResponse.data?.product;
            } else {
              // It's a product code, search for the product
              console.log('🔍 Product ID appears to be a code, searching:', transformedData.product_id);
              const searchResponse = await api.get('/products', {
                params: { search: transformedData.product_id, limit: 10 }
              });
              const products = searchResponse.data?.products || [];
              // Find exact match by product_code
              product = products.find(p => p.product_code === transformedData.product_id);
              
              if (!product && products.length > 0) {
                // Fallback: use first result if no exact match
                product = products[0];
                console.warn('⚠️ No exact product code match, using first search result:', product.name);
              }
            }
            
            if (product) {
              validProductId = String(product.id);
              console.log('✅ Resolved product:', { id: product.id, name: product.name, code: product.product_code });
              
              // Check if product is already in options
              setProductOptions((prevOptions) => {
                const exists = prevOptions.some(opt => opt.value === String(product.id));
                if (!exists) {
                  // Add this product to the options
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
            } else {
              console.error('❌ Could not resolve product from ID/code:', transformedData.product_id);
            }
          } catch (error) {
            console.warn('Could not fetch product details:', error);
            // Non-blocking - continue with form population
          }
        }

        // Auto-fill form fields with validated product ID
        if (validProductId) {
          methods.setValue('orderDetails.productId', validProductId);
        }
        if (transformedData.quantity) {
          methods.setValue('orderDetails.quantity', transformedData.quantity);
        }
        if (transformedData.sales_order_id) {
          methods.setValue('orderDetails.salesOrderId', String(transformedData.sales_order_id));
        }
        if (transformedData.special_instructions) {
          methods.setValue('orderDetails.specialInstructions', transformedData.special_instructions);
        }

        // Auto-fill materials if available
        if (receivedMaterials && receivedMaterials.length > 0) {
          console.log('📦 Pre-filling materials from receipt:', receivedMaterials);
          methods.setValue(
            'materials.items',
            receivedMaterials.map((m) => ({
              materialId: String(m.inventory_id || m.material_code || m.barcode_scanned || ''),
              description: m.material_name || m.name || m.description || '',
              requiredQuantity: m.quantity_received || m.quantity || m.quantity_dispatched || '',
              unit: m.uom || m.unit || 'pieces',
              status: 'available',
              condition: m.condition || '',
              barcode: m.barcode_scanned || m.barcode || '',
              remarks: m.remarks || ''
            })),
          );
          toast.success(`✅ ${receivedMaterials.length} material(s) loaded from receipt`);
        } else if (materialsRequested && materialsRequested.length > 0) {
          // Fallback to requested materials if no received materials
          console.log('📦 Pre-filling materials from request:', materialsRequested);
          methods.setValue(
            'materials.items',
            materialsRequested.map((m) => ({
              materialId: String(m.inventory_id || m.material_code || ''),
              description: m.material_name || m.description || m.product_name || '',
              requiredQuantity: m.quantity_required || m.quantity || '',
              unit: m.unit || m.uom || 'pieces',
              status: 'ordered',
              remarks: 'From material request'
            })),
          );
          toast.info(`⚠️ Using requested materials (${materialsRequested.length} items) - receipt not yet received`);
        }

        methods.setValue('orderSelection.autoFilled', true);
        toast.success('Order details loaded successfully!');
      } catch (error) {
        console.error('fetch order details error', error);
        toast.error('Unable to load order details');
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
    fetchApprovedOrders();
    fetchVendors();
  }, [fetchProducts, fetchApprovedOrders, fetchVendors]);

  // Auto-load order details from URL parameter (when redirected from approval page)
  useEffect(() => {
    const approvalId = searchParams.get('approvalId');
    if (approvalId) {
      toast.success('Loading approved order details...');
      // Set the approval ID in form
      methods.setValue('orderSelection.productionApprovalId', approvalId);
      fetchOrderDetails(approvalId);
    }
  }, [searchParams, fetchOrderDetails, methods]);

  useEffect(() => {
    fetchSalesOrders({ productId: methods.getValues('orderDetails.productId') });
  }, [fetchSalesOrders, methods]);

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

      if (name === 'orderDetails.productId' && type === 'change') {
        const nextProductId = value.orderDetails?.productId || undefined;
        fetchSalesOrders({ productId: nextProductId, search: filters.salesOrderSearch });
        fetchProductDetails(nextProductId);
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
      const productId = methods.getValues('orderDetails.productId');
      fetchSalesOrders({ search: value, productId });
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
      productionApprovalId: values.orderSelection.productionApprovalId,
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
      
      // Mark approval as production started if approval ID exists
      if (values.orderSelection.productionApprovalId) {
        try {
          await api.put(`/production-approval/${values.orderSelection.productionApprovalId}/start-production`, {
            production_order_id: createdOrder.id || createdOrder.productionOrder?.id
          });
          console.log('✅ Production approval marked as started');
        } catch (approvalError) {
          console.error('Failed to mark approval as started:', approvalError);
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
            approvedOrders={approvedOrders}
            loadingOrders={loadingOrders}
            selectedOrderDetails={selectedOrderDetails}
            loadingProductDetails={loadingProductDetails}
            fetchOrderDetails={fetchOrderDetails}
          />
        );
      case 1:
        return <OrderDetailsStep productOptions={productOptions} loadingProducts={loadingProducts} productDetails={productDetails} loadingProductDetails={loadingProductDetails} />;
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
  }, [canCustomizeStages, currentStep, methods, productOptions, loadingProducts, productDetails, loadingProductDetails, approvedOrders, loadingOrders, selectedOrderDetails, fetchOrderDetails, vendors, loadingVendors]);

  // Calculate progress
  const progressPercentage = Math.round((completedSteps.size / stepConfig.length) * 100);
  const remainingSteps = stepConfig.length - completedSteps.size;

  return (
    <>
      <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
        {/* Enhanced Header with Progress */}
        <header className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">New Production Order</h1>
                  <p className="text-sm text-gray-600">Complete each step to initiate a manufacturing order.</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-semibold text-blue-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {completedSteps.size} of {stepConfig.length} steps completed • {remainingSteps} remaining
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-blue-600">{completedSteps.size}</div>
                <div className="text-xs text-gray-600 mt-1">Completed</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-orange-600">{invalidSteps.size}</div>
                <div className="text-xs text-gray-600 mt-1">Need Review</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-green-600">{stepConfig.length}</div>
                <div className="text-xs text-gray-600 mt-1">Total Steps</div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>Estimated time to complete: <span className="font-semibold text-gray-900">10-15 minutes</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Need help?</span>
              <a href="mailto:support@pashion-erp.com" className="text-blue-600 font-semibold hover:text-blue-700">
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
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              {/* Current Step Header */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {currentStep + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{stepConfig[currentStep].title}</h2>
                    <p className="text-sm text-gray-600">{stepConfig[currentStep].description}</p>
                  </div>
                </div>
                
                <StepStatusBanner
                  hasError={hasStepError}
                  title={stepConfig[currentStep].title}
                  description={statusDescription}
                />
              </div>

              {/* Step Content */}
              <div className="min-h-[400px]">
                {renderStepContent}
              </div>
            </div>

            {/* Enhanced Footer */}
            <footer className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Step Counter */}
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Step {currentStep + 1}</span> of {stepConfig.length}
                  </div>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <div className="text-sm text-gray-600">
                    {currentStep === stepConfig.length - 1 ? (
                      <span className="flex items-center gap-2 text-green-600 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        Ready to submit
                      </span>
                    ) : (
                      <span>{stepConfig.length - currentStep - 1} steps remaining</span>
                    )}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </button>
                  )}
                  {currentStep < stepConfig.length - 1 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      disabled={hasStepError}
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {currentStep === stepConfig.length - 1 && (
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-8 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      disabled={submitting || hasStepError}
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submitting ? 'Creating Order...' : 'Create Production Order'}
                      {!submitting && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Warning if errors */}
              {hasStepError && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Please fix the validation errors above before proceeding to the next step.</span>
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

const TextInput = ({ name, label, type = 'text', required, placeholder }) => {
  const {
    register,
    formState: { errors },
  } = useFormContextSafe();

  const error = getNestedError(errors, name);
  const errorId = error ? toErrorId(name) : undefined;

  return (
    <div>
      <FieldLabel label={label} required={required} />
      <input
        {...register(name, type === 'number' ? { valueAsNumber: true } : {})}
        type={type}
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
  approvedOrders,
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

  const selectedApprovalId = watch('orderSelection.productionApprovalId');
  const autoFilled = watch('orderSelection.autoFilled');

  return (
    <SectionCard
      icon={FileSearch}
      title="Select Approved Order"
      description="Choose an approved order from the MRN workflow"
    >
      <StepStatusBanner
        hasError={!!errors.orderSelection}
        title="Order Selection"
        description="Select an approved production approval to auto-fill order details."
      />

      <div>
        <label htmlFor="productionApprovalId" className="block text-sm font-medium text-gray-700 mb-2">
          Approved Order <span className="text-red-500">*</span>
        </label>
        <select
          id="productionApprovalId"
          {...register('orderSelection.productionApprovalId')}
          className={`w-full px-4 py-2 border rounded-lg ${errors.orderSelection?.productionApprovalId ? 'border-red-500' : 'border-gray-300'}`}
          disabled={loadingOrders}
        >
          <option value="">-- Select an approved order --</option>
          {approvedOrders.map((order) => {
            // Extract customer name from multiple sources
            const customerName = order.mrnRequest?.salesOrder?.customer?.name || 
                                order.mrnRequest?.purchaseOrder?.vendor?.name || 
                                (() => {
                                  // Fallback: extract from manufacturing_notes
                                  const notes = order.mrnRequest?.manufacturing_notes || '';
                                  const match = notes.match(/Customer:\s*([^\n]+)/);
                                  return match ? match[1].trim() : 'Unknown';
                                })();
            
            // Get order number
            const orderNumber = order.mrnRequest?.salesOrder?.order_number || 
                               order.mrnRequest?.purchaseOrder?.po_number || 
                               order.mrnRequest?.project_name ||
                               'N/A';
            
            // Get quantity with fallbacks
            const quantity = order.verification?.receipt?.total_items_received || 
                            (() => {
                              try {
                                const materials = order.mrnRequest?.materials_requested;
                                if (materials && materials.length > 0) {
                                  return materials[0]?.quantity_required || 0;
                                }
                              } catch (e) {}
                              return 0;
                            })();
            
            return (
              <option key={order.id} value={order.id}>
                {order.verification?.receipt?.receipt_number || `Approval #${order.id}`}
                {' • '}
                {orderNumber}
                {' • '}
                {customerName}
                {' • '}
                Qty: {quantity}
              </option>
            );
          })}
        </select>
        {errors.orderSelection?.productionApprovalId && (
          <p className="mt-1 text-sm text-red-500">
            {errors.orderSelection.productionApprovalId.message}
          </p>
        )}
      </div>

      {selectedApprovalId && (
        <button
          type="button"
          onClick={() => fetchOrderDetails(selectedApprovalId)}
          disabled={loadingProductDetails || autoFilled}
          className="w-full md:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loadingProductDetails ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : autoFilled ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Auto-filled Successfully
            </>
          ) : (
            'Load Order Details'
          )}
        </button>
      )}

      {selectedOrderDetails && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Order Summary</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Customer/Vendor:</strong>{' '}
              {selectedOrderDetails.customer_name || selectedOrderDetails.vendor_name || 'N/A'}
            </p>
            <p>
              <strong>Product:</strong> {selectedOrderDetails.product_name || 'N/A'}
            </p>
            <p>
              <strong>Quantity:</strong> {selectedOrderDetails.quantity || 'N/A'}
            </p>
            <p>
              <strong>Project:</strong> {selectedOrderDetails.project_name || 'N/A'}
            </p>
          </div>
        </div>
      )}

      <StepHint>
        💡 Select an approved order to automatically populate product details, quantities, and material
        requirements.
      </StepHint>
    </SectionCard>
  );
};

const OrderDetailsStep = ({ productOptions, loadingProducts, productDetails, loadingProductDetails }) => {
  const { setValue, watch } = useFormContextSafe();
  const selectedProductId = watch('orderDetails.productId');
  const selectedSalesOrderId = watch('orderDetails.salesOrderId');

  // Auto-populate quantity when sales order is selected
  useEffect(() => {
    if (productDetails && selectedSalesOrderId) {
      const selectedSO = productDetails.salesOrders?.find(
        (so) => String(so.id) === String(selectedSalesOrderId)
      );
      if (selectedSO && selectedSO.product_quantity) {
        setValue('orderDetails.quantity', selectedSO.product_quantity, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  }, [selectedSalesOrderId, productDetails, setValue]);

  return (
    <SectionCard icon={ClipboardList} title="Production order basics" description="Capture the essential order metadata.">
      <Row>
        <SelectInput
          name="orderDetails.productId"
          label="Product"
          required
          options={productOptions}
          disabled={loadingProducts}
        />
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
        {productDetails && productDetails.salesOrders && productDetails.salesOrders.length > 0 ? (
          <SelectInput
            name="orderDetails.salesOrderId"
            label="Linked Sales Order"
            options={productDetails.salesOrders.map((so) => ({
              value: String(so.id),
              label: `${so.order_number} - Qty: ${so.product_quantity || so.total_quantity}${so.customer?.name ? ` (${so.customer.name})` : ''}`,
            }))}
          />
        ) : (
          <TextInput name="orderDetails.salesOrderId" label="Linked Sales Order" disabled />
        )}
        <TextArea
          name="orderDetails.specialInstructions"
          label="Special Instructions"
          rows={3}
          placeholder="Note any production nuances, trims, or handling notes"
        />
      </Row>
    
    {loadingProductDetails && (
      <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
        <p className="text-sm text-blue-700">Loading product details...</p>
      </div>
    )}
    
    {productDetails && !loadingProductDetails && (
      <div className="mt-4 space-y-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Information</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {productDetails.product?.product_code && (
              <div>
                <dt className="text-xs text-gray-500">Product Code</dt>
                <dd className="font-medium text-gray-900">{productDetails.product.product_code}</dd>
              </div>
            )}
            {productDetails.product?.barcode && (
              <div>
                <dt className="text-xs text-gray-500">Barcode</dt>
                <dd className="font-medium text-gray-900">{productDetails.product.barcode}</dd>
              </div>
            )}
          </dl>
        </div>
        
        {productDetails.salesOrders && productDetails.salesOrders.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Related Sales Orders</h3>
            <div className="space-y-2">
              {productDetails.salesOrders.map((order) => (
                <div key={order.id} className="text-sm border-l-2 border-primary pl-3">
                  <div className="font-medium text-gray-900">{order.order_number}</div>
                  <div className="text-xs text-gray-600">
                    Quantity: {order.total_quantity} • 
                    {order.buyer_reference && ` Buyer Ref: ${order.buyer_reference} •`}
                    {order.delivery_date && ` Delivery: ${new Date(order.delivery_date).toLocaleDateString()}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {productDetails.purchaseOrders && productDetails.purchaseOrders.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Related Purchase Orders</h3>
            <div className="space-y-2">
              {productDetails.purchaseOrders.map((po) => (
                <div key={po.id} className="text-sm border-l-2 border-green-500 pl-3">
                  <div className="font-medium text-gray-900">{po.po_number}</div>
                  <div className="text-xs text-gray-600">
                    {po.project_name && `Project: ${po.project_name} • `}
                    {po.expected_delivery_date && `Expected: ${new Date(po.expected_delivery_date).toLocaleDateString()}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {productDetails.inventoryItems && productDetails.inventoryItems.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Inventory Items (Barcodes)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {productDetails.inventoryItems.map((item) => (
                <div key={item.id} className="text-sm border border-gray-300 rounded p-2 bg-white">
                  <div className="font-mono text-xs text-primary font-semibold">{item.barcode}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Available: {item.quantity_available} {item.unit}
                    {item.location && ` • ${item.location}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </SectionCard>
  );
};

const SchedulingStep = () => (
  <SectionCard icon={CalendarCheck} title="Plan the production timeline" description="Ensure scheduling aligns with capacity and promises.">
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
  </SectionCard>
);

const MaterialsStep = () => {
  const { control, formState: { errors }, watch } = useFormContextSafe();
  const { fields, append, remove } = useFieldArray({ control, name: 'materials.items' });
  const autoFilled = watch('orderSelection.autoFilled');

  return (
    <SectionCard icon={PackageSearch} title="Verify materials" description="Ensure material sufficiency to avoid interruptions.">
      <div className="space-y-6">
        {autoFilled && fields.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900">Materials loaded from approved receipt</p>
              <p className="text-xs text-green-700 mt-1">
                These materials were dispatched from inventory and received in manufacturing. 
                Verify quantities and add any additional materials if needed.
              </p>
            </div>
          </div>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Material #{index + 1}</span>
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
            <Row columns={3}>
              <TextInput name={`materials.items.${index}.materialId`} label="Material ID / Code" required />
              <TextInput name={`materials.items.${index}.description`} label="Description" required />
              <TextInput name={`materials.items.${index}.requiredQuantity`} label="Required Quantity" type="number" required />
            </Row>
            <Row>
              <TextInput name={`materials.items.${index}.unit`} label="Unit" required />
              <SelectInput
                name={`materials.items.${index}.status`}
                label="Status"
                required
                options={[
                  { value: 'available', label: 'Available' },
                  { value: 'shortage', label: 'Shortage' },
                  { value: 'ordered', label: 'Ordered' },
                ]}
              />
              {field.barcode && (
                <TextInput name={`materials.items.${index}.barcode`} label="Barcode" disabled />
              )}
            </Row>
            {(field.condition || field.remarks) && (
              <Row columns={field.remarks ? 2 : 1}>
                {field.condition && (
                  <TextInput name={`materials.items.${index}.condition`} label="Condition" disabled />
                )}
                {field.remarks && (
                  <TextInput name={`materials.items.${index}.remarks`} label="Remarks" disabled />
                )}
              </Row>
            )}
          </div>
        ))}

        <ErrorText error={errors.materials?.items} />

        <button
          type="button"
          onClick={() => append({ materialId: '', description: '', requiredQuantity: '', unit: '', status: 'available' })}
          className="px-4 py-2 rounded-md border border-dashed border-primary text-primary hover:bg-primary/5"
        >
          Add Material
        </button>
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
    { label: 'Product', value: values.orderDetails.productId || 'Not specified' },
    { label: 'Quantity', value: values.orderDetails.quantity || 'Not specified' },
    { label: 'Priority', value: values.orderDetails.priority || 'Not specified' },
    { label: 'Planned Schedule', value: scheduleSummary },
    { label: 'Materials', value: `${values.materials.items.length} item(s)` },
    { label: 'Quality Checkpoints', value: `${values.quality.checkpoints.length} checkpoint(s)` },
  ];

  return (
    <SectionCard icon={CheckCircle2} title="Review order" description="Confirm accuracy before submission.">
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summaryRows.map((row) => (
          <div key={row.label} className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <dt className="text-xs uppercase tracking-wider text-gray-500">{row.label}</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">
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
    sales_order_id: orderDetails.salesOrderId || null,
    production_approval_id: orderSelection.productionApprovalId ? Number(orderSelection.productionApprovalId) : null,
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