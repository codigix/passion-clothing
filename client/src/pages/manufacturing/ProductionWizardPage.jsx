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
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

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

const reviewSchema = yup.object({
  acknowledge: yup.boolean().oneOf([true], 'Please confirm the order details before submission'),
});

const formSchema = yup.object({
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
  <section className="bg-white shadow rounded-lg border border-gray-200 p-6">
    <header className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </header>
    <div className="space-y-4">{children}</div>
  </section>
);

const Stepper = ({ currentStep, completedSteps, invalidSteps, onStepSelect }) => (
  <nav className="grid md:grid-cols-7 gap-3 mb-6">
    {stepConfig.map((step, index) => {
      const Icon = step.icon;
      const isActive = currentStep === index;
      const isCompleted = completedSteps.has(index);
      const isErrored = invalidSteps.has(index);
      const isClickable = index <= currentStep + 1 || isCompleted || isErrored;

      const buttonClass = isActive
        ? 'border-primary bg-primary/5 text-primary'
        : isErrored
          ? 'border-red-300 bg-red-50 text-red-600'
          : isCompleted
            ? 'border-green-200 bg-green-50 text-green-600'
            : 'border-gray-200 bg-white text-gray-700';

      const badgeClass = isActive
        ? 'border-primary bg-primary text-white'
        : isErrored
          ? 'border-red-400 bg-red-500 text-white'
          : isCompleted
            ? 'border-green-400 bg-green-500 text-white'
            : 'border-gray-300 bg-white text-gray-700';

      return (
        <button
          key={step.title}
          type="button"
          onClick={() => isClickable && onStepSelect(index)}
          className={`flex flex-col items-start gap-2 rounded-lg border p-4 transition focus:outline-none focus:ring-2 focus:ring-primary ${buttonClass} ${!isClickable ? 'cursor-not-allowed opacity-60' : ''}`}
          disabled={!isClickable}
          data-invalid={isErrored || undefined}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border ${badgeClass}`}
            >
              <Icon className="w-5 h-5" />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold">Step {index + 1}</p>
              <p className="text-xs text-gray-500">{step.title}</p>
            </div>
          </div>
          {isErrored && (
            <p className="text-xs text-red-500 mt-2">Validation required</p>
          )}
        </button>
      );
    })}
  </nav>
);

const StepStatusBanner = ({ hasError, title, description }) => {
  const Icon = hasError ? AlertCircle : Info;
  const containerClass = hasError
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-blue-50 border-blue-200 text-blue-700';
  const helperText = hasError
    ? 'Resolve the highlighted fields below to continue.'
    : 'All checks passed for this step. You can proceed once everything looks good.';

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${containerClass}`}
      role="status"
      aria-live="polite"
      data-has-error={hasError || undefined}
    >
      <Icon className="w-5 h-5 mt-0.5" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-xs md:text-sm">{description}</p>
        <p className="text-xs opacity-90">{helperText}</p>
      </div>
    </div>
  );
};

const StepHint = ({ children, tone = 'info' }) => {
  const Icon = tone === 'warning' ? AlertCircle : Info;
  const toneClasses = tone === 'warning'
    ? 'border-amber-200 bg-amber-50 text-amber-700'
    : 'border-slate-200 bg-slate-50 text-slate-600';

  return (
    <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${toneClasses}`}>
      <Icon className="w-4 h-4 mt-0.5" />
      <div className="leading-relaxed text-xs md:text-sm">{children}</div>
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
  const productSearchTimeoutRef = useRef(null);
  const salesOrderSearchTimeoutRef = useRef(null);
  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(formSchema),
  });
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canCustomizeStages = hasPermission('manufacturing', 'update', 'production_stage');
  const canCreateOrder = hasPermission('manufacturing', 'create', 'production_order');

  const fetchProducts = useCallback(
    async (search = '') => {
      setLoadingProducts(true);
      try {
        const response = await api.get('/products', {
          params: {
            limit: 50,
            ...(search ? { search } : {}),
          },
        });

        const options = (response.data?.products || []).map((product) => ({
          value: String(product.id),
          label: product.name,
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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  // Show permission warning if user cannot create orders
  useEffect(() => {
    if (!canCreateOrder) {
      toast.error('You do not have permission to create production orders. Please contact your administrator.', {
        duration: 5000,
        id: 'permission-warning'
      });
    }
  }, [canCreateOrder]);

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
      await api.post('/manufacturing/orders', payload);
      toast.success('Production order created successfully');
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
        return <OrderDetailsStep productOptions={productOptions} loadingProducts={loadingProducts} />;
      case 1:
        return <SchedulingStep />;
      case 2:
        return <MaterialsStep />;
      case 3:
        return <QualityStep />;
      case 4:
        return <TeamStep />;
      case 5:
        return <CustomizationStep canCustomize={canCustomizeStages} />;
      case 6: {
        const values = methods.getValues();
        return <ReviewStep values={values} />;
      }
      default:
        return null;
    }
  }, [canCustomizeStages, currentStep, methods, productOptions, loadingProducts]);

  return (
    <>
      <div className="p-4 md:p-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Production Order</h1>
            <p className="text-gray-600">Complete each step to initiate a manufacturing order.</p>
            {!canCreateOrder && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                ⚠️ You do not have permission to submit production orders
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Need help?</span>
            <a href="mailto:support@pashion-erp.com" className="text-primary font-semibold">
              Contact Ops Support
            </a>
          </div>
        </header>

        <Stepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          invalidSteps={invalidSteps}
          onStepSelect={attemptStepChange}
        />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <StepStatusBanner
              hasError={hasStepError}
              title={stepConfig[currentStep].title}
              description={statusDescription}
            />

            {renderStepContent}

            <footer className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-200">
              <div className="flex gap-2 sm:order-last">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                {currentStep < stepConfig.length - 1 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
                    disabled={hasStepError}
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {currentStep === stepConfig.length - 1 && (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={submitting || hasStepError || !canCreateOrder}
                    title={!canCreateOrder ? 'You do not have permission to create production orders' : ''}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit Order'}
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-400">
                Step {currentStep + 1} of {stepConfig.length}
              </div>
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

const OrderDetailsStep = ({ productOptions, loadingProducts }) => (
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
      <TextInput name="orderDetails.salesOrderId" label="Linked Sales Order" />
      <TextArea
        name="orderDetails.specialInstructions"
        label="Special Instructions"
        rows={3}
        placeholder="Note any production nuances, trims, or handling notes"
      />
    </Row>
  </SectionCard>
);

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
          { value: 'general', label: 'General Shift' },
          { value: 'morning', label: 'Morning Shift' },
          { value: 'evening', label: 'Evening Shift' },
          { value: 'night', label: 'Night Shift' },
        ]}
      />
      <TextInput name="scheduling.expectedHours" label="Expected Hours" type="number" />
    </Row>
  </SectionCard>
);

const MaterialsStep = () => {
  const { control, formState: { errors } } = useFormContextSafe();
  const { fields, append, remove } = useFieldArray({ control, name: 'materials.items' });

  return (
    <SectionCard icon={PackageSearch} title="Verify materials" description="Ensure material sufficiency to avoid interruptions.">
      <div className="space-y-6">
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
              <TextInput name={`materials.items.${index}.materialId`} label="Material" required />
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
            </Row>
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

const CustomizationStep = ({ canCustomize }) => {
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
    append({ stageName: '', plannedDurationHours: '' });
  };

  const renderStageCard = (field, index) => (
    <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <span className="text-sm font-semibold text-gray-700">Stage #{index + 1}</span>
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
    </div>
  );

  return (
    <SectionCard icon={Settings2} title="Customize stages" description="Toggle to build a bespoke production sequence.">
      <SwitchInput
        name="customization.useCustomStages"
        label="Enable stage customization"
        hint="Use only when the default stages need adjustment."
        disabled={!canCustomize}
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
    payload.stages = customization.stages.map((stage, index) => ({
      stage_name: stage.stageName,
      stage_order: index + 1,
      planned_duration_hours:
        stage.plannedDurationHours === '' || stage.plannedDurationHours === null
          ? null
          : Number(stage.plannedDurationHours),
    }));
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