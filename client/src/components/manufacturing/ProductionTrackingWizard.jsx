import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Square,
  AlertCircle,
  Calendar,
  Timer,
  Edit3,
  Save,
  X
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusSchema = yup.object({
  status: yup.string().oneOf(['pending', 'in_progress', 'completed', 'on_hold', 'skipped']).required(),
  startDate: yup.string().nullable(),
  endDate: yup.string().nullable(),
  notes: yup.string().nullable(),
  quantity_processed: yup.number().nullable().transform((value) => (Number.isNaN(value) ? null : value)).min(0),
  quantity_approved: yup.number().nullable().transform((value) => (Number.isNaN(value) ? null : value)).min(0),
  quantity_rejected: yup.number().nullable().transform((value) => (Number.isNaN(value) ? null : value)).min(0),
  material_used: yup.number().nullable().transform((value) => (Number.isNaN(value) ? null : value)).min(0),
}).test('completion-validation', 'Please provide completion details', function(value) {
  if (value.status === 'completed') {
    return value.quantity_processed !== null && value.quantity_processed >= 0;
  }
  return true;
});

const ProductionTrackingWizard = ({ orderId, onClose, onUpdate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMode, setEditingMode] = useState(false);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm({
    resolver: yupResolver(statusSchema),
    defaultValues: {
      status: 'pending',
      startDate: '',
      endDate: '',
      notes: '',
      quantity_processed: 0,
      quantity_approved: 0,
      quantity_rejected: 0,
      material_used: 0
    }
  });

  const currentStatus = watch('status');

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  useEffect(() => {
    if (orderData?.stages?.[currentStep]) {
      const stage = orderData.stages[currentStep];
      reset({
        status: stage.status,
        startDate: stage.actual_start_time ? new Date(stage.actual_start_time).toISOString().slice(0, 16) : '',
        endDate: stage.actual_end_time ? new Date(stage.actual_end_time).toISOString().slice(0, 16) : '',
        notes: stage.notes || '',
        quantity_processed: stage.quantity_processed || 0,
        quantity_approved: stage.quantity_approved || 0,
        quantity_rejected: stage.quantity_rejected || 0,
        material_used: stage.material_used || 0
      });
    }
  }, [currentStep, orderData, reset]);

  // Dummy data for demonstration
  const dummyOrderData = {
    id: 1,
    production_number: "PO-2024-001",
    product: {
      id: 1,
      name: "Cotton T-Shirt"
    },
    quantity: 100,
    stages: [
      {
        id: 1,
        stage_name: "calculate_material_review",
        status: "completed",
        actual_start_time: "2024-01-15T08:00:00Z",
        actual_end_time: "2024-01-15T08:30:00Z",
        notes: "Material review completed, all materials verified",
        quantity_processed: 100,
        quantity_approved: 100,
        quantity_rejected: 0,
        material_used: 10
      },
      {
        id: 2,
        stage_name: "cutting",
        status: "completed",
        actual_start_time: "2024-01-15T09:00:00Z",
        actual_end_time: "2024-01-15T10:30:00Z",
        notes: "Cutting completed successfully with minimal waste",
        quantity_processed: 100,
        quantity_approved: 95,
        quantity_rejected: 5,
        material_used: 20
      },
      {
        id: 3,
        stage_name: "embroidery_or_printing",
        status: "in_progress",
        actual_start_time: "2024-01-15T11:00:00Z",
        actual_end_time: null,
        notes: "Embroidery in progress",
        quantity_processed: 50,
        quantity_approved: 0,
        quantity_rejected: 0,
        material_used: 5
      },
      {
        id: 4,
        stage_name: "stitching",
        status: "pending",
        actual_start_time: null,
        actual_end_time: null,
        notes: null,
        quantity_processed: 0,
        quantity_approved: 0,
        quantity_rejected: 0,
        material_used: 0
      },
      {
        id: 5,
        stage_name: "finishing",
        status: "pending",
        actual_start_time: null,
        actual_end_time: null,
        notes: null,
        quantity_processed: 0,
        quantity_approved: 0,
        quantity_rejected: 0,
        material_used: 0
      },
      {
        id: 6,
        stage_name: "quality_check",
        status: "pending",
        actual_start_time: null,
        actual_end_time: null,
        notes: null,
        quantity_processed: 0,
        quantity_approved: 0,
        quantity_rejected: 0,
        material_used: 0
      }
    ]
  };

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      // Use dummy data for now instead of API call
      setOrderData(dummyOrderData);
      // Uncomment below to use real API:
      // const { data } = await api.get(`/manufacturing/orders/${orderId}`);
      // setOrderData(data);
    } catch (error) {
      console.error('Error fetching order data:', error);
      toast.error('Failed to load order data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'on_hold': return <Pause className="w-5 h-5 text-yellow-500" />;
      case 'skipped': return <Square className="w-5 h-5 text-gray-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 border-green-300 text-green-700';
      case 'in_progress': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'on_hold': return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'skipped': return 'bg-gray-100 border-gray-300 text-gray-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const handleSave = async (formData) => {
    if (!orderData?.stages?.[currentStep]) return;

    try {
      setSaving(true);
      const stage = orderData.stages[currentStep];

      const updateData = {
        status: formData.status,
        actual_start_time: formData.startDate || null,
        actual_end_time: formData.endDate || null,
        notes: formData.notes,
        quantity_processed: formData.quantity_processed,
        quantity_approved: formData.quantity_approved,
        quantity_rejected: formData.quantity_rejected,
        material_used: formData.material_used
      };

      // Use dummy response for now instead of API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      // Update the local dummy data
      setOrderData(prevData => ({
        ...prevData,
        stages: prevData.stages.map(s =>
          s.id === stage.id
            ? {
                ...s,
                status: formData.status,
                actual_start_time: formData.startDate || s.actual_start_time,
                actual_end_time: formData.endDate || s.actual_end_time,
                notes: formData.notes,
                quantity_processed: formData.quantity_processed,
                quantity_approved: formData.quantity_approved,
                quantity_rejected: formData.quantity_rejected,
                material_used: formData.material_used
              }
            : s
        )
      }));

      toast.success('Stage updated successfully');
      setEditingMode(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Failed to update stage');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!orderData?.stages?.[currentStep]) return;

    try {
      const stage = orderData.stages[currentStep];

      // Use dummy response for now instead of API call
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

      // Update the local dummy data
      setOrderData(prevData => ({
        ...prevData,
        stages: prevData.stages.map(s =>
          s.id === stage.id
            ? {
                ...s,
                status: newStatus === 'start' ? 'in_progress' :
                        newStatus === 'pause' ? 'on_hold' :
                        newStatus === 'resume' ? 'in_progress' :
                        newStatus === 'complete' ? 'completed' :
                        newStatus === 'hold' ? 'on_hold' :
                        newStatus === 'skip' ? 'skipped' : s.status,
                actual_start_time: (newStatus === 'start' && !s.actual_start_time) ? new Date().toISOString() : s.actual_start_time,
                actual_end_time: newStatus === 'complete' ? new Date().toISOString() : s.actual_end_time
              }
            : s
        )
      }));

      if (newStatus === 'start' && !watch('startDate')) {
        setValue('startDate', new Date().toISOString().slice(0, 16));
      }

      if (newStatus === 'complete' && !watch('endDate')) {
        setValue('endDate', new Date().toISOString().slice(0, 16));
      }

      toast.success(`Stage ${newStatus} successfully`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(`Error ${newStatus} stage:`, error);
      toast.error(`Failed to ${newStatus} stage`);
    }
  };

  const canMoveNext = () => {
    if (!orderData?.stages) return false;
    const currentStage = orderData.stages[currentStep];
    return currentStage?.status === 'completed' || currentStage?.status === 'skipped';
  };

  const canMovePrev = () => {
    return currentStep > 0;
  };

  const moveToNext = () => {
    if (canMoveNext() && currentStep < (orderData?.stages?.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
      setEditingMode(false);
    }
  };

  const moveToPrev = () => {
    if (canMovePrev()) {
      setCurrentStep(currentStep - 1);
      setEditingMode(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="p-6 text-center text-gray-500">
        Failed to load order data
      </div>
    );
  }

  const currentStage = orderData.stages[currentStep];
  const progress = Math.round(((orderData.stages.filter(s => s.status === 'completed').length) / orderData.stages.length) * 100);

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Production Tracking Wizard
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Order: {orderData.production_number} - {orderData.product?.name}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 bg-gray-50 border-b">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{progress}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Stage Navigation Sidebar */}
        <div className="md:w-80 border-r border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-4">Production Stages</h3>
          <div className="space-y-2 max-h-[calc(90vh-250px)] overflow-y-auto">
            {orderData.stages.map((stage, index) => (
              <div
                key={stage.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  index === currentStep
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setCurrentStep(index);
                  setEditingMode(false);
                }}
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(stage.status)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      Step {index + 1}: {stage.stage_name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusColor(stage.status)}`}>
                      {getStatusLabel(stage.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStage && (
            <div className="space-y-6">
              {/* Stage Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentStage.stage_name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </h3>
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(currentStage.status)}`}>
                    {getStatusIcon(currentStage.status)}
                    {getStatusLabel(currentStage.status)}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!editingMode ? (
                    <button
                      onClick={() => setEditingMode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Details
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingMode(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit(handleSave)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        disabled={saving}
                      >
                        {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {currentStage.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('start')}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Start Stage
                      </button>
                      <button
                        onClick={() => handleStatusChange('hold')}
                        className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <Pause className="w-4 h-4" />
                        Hold
                      </button>
                    </>
                  )}
                  {currentStage.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('pause')}
                        className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                      <button
                        onClick={() => handleStatusChange('complete')}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </button>
                    </>
                  )}
                  {currentStage.status === 'on_hold' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('resume')}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Resume
                      </button>
                      <button
                        onClick={() => handleStatusChange('skip')}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Square className="w-4 h-4" />
                        Skip
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Editable Form */}
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    {editingMode ? (
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on_hold">On Hold</option>
                            <option value="skipped">Skipped</option>
                          </select>
                        )}
                      />
                    ) : (
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getStatusColor(currentStage.status)}`}>
                        {getStatusIcon(currentStage.status)}
                        {getStatusLabel(currentStage.status)}
                      </div>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                    {editingMode ? (
                      <Controller
                        name="startDate"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="datetime-local"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        )}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {currentStage.actual_start_time ? new Date(currentStage.actual_start_time).toLocaleString() : 'Not started'}
                      </div>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                    {editingMode ? (
                      <Controller
                        name="endDate"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="datetime-local"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        )}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {currentStage.actual_end_time ? new Date(currentStage.actual_end_time).toLocaleString() : 'Not completed'}
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Timer className="w-4 h-4" />
                      {currentStage.actual_start_time && currentStage.actual_end_time ? (
                        `${Math.round((new Date(currentStage.actual_end_time) - new Date(currentStage.actual_start_time)) / (1000 * 60 * 60))} hours`
                      ) : (
                        'Not calculated'
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Tracking */}
                {currentStage.status === 'completed' && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Quantity Tracking</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Processed</label>
                        {editingMode ? (
                          <Controller
                            name="quantity_processed"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                min="0"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            )}
                          />
                        ) : (
                          <div className="text-gray-600">{currentStage.quantity_processed || 0}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approved</label>
                        {editingMode ? (
                          <Controller
                            name="quantity_approved"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                min="0"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            )}
                          />
                        ) : (
                          <div className="text-gray-600">{currentStage.quantity_approved || 0}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rejected</label>
                        {editingMode ? (
                          <Controller
                            name="quantity_rejected"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                min="0"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            )}
                          />
                        ) : (
                          <div className="text-gray-600">{currentStage.quantity_rejected || 0}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Material Used</label>
                        {editingMode ? (
                          <Controller
                            name="material_used"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            )}
                          />
                        ) : (
                          <div className="text-gray-600">{currentStage.material_used || 0}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  {editingMode ? (
                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Add notes about this stage..."
                        />
                      )}
                    />
                  ) : (
                    <div className="text-gray-600 bg-gray-50 rounded-lg p-3 min-h-[60px]">
                      {currentStage.notes || 'No notes added'}
                    </div>
                  )}
                </div>
              </form>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={moveToPrev}
                  disabled={!canMovePrev()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Stage
                </button>

                <div className="text-sm text-gray-600">
                  Stage {currentStep + 1} of {orderData.stages.length}
                </div>

                <button
                  onClick={moveToNext}
                  disabled={!canMoveNext()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next Stage
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionTrackingWizard;