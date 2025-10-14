import React, { useState, useEffect } from 'react';
import { FaIndustry, FaClock, FaCheckCircle, FaExclamationTriangle, FaMagic } from 'react-icons/fa';
import api from '../../utils/api';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ProductionTrackingWizard from '../../components/manufacturing/ProductionTrackingWizard';

// Mock data for fallback when API fails
const mockTrackingData = [
  {
    id: 1,
    orderNumber: 'PO-001',
    productName: 'Cotton T-Shirt',
    stages: [
      {
        id: 1,
        name: 'Cutting',
        rawName: 'cutting',
        status: 'completed',
        progress: 100,
        startTime: '2024-01-15 09:00',
        endTime: '2024-01-15 10:30'
      },
      {
        id: 2,
        name: 'Stitching',
        rawName: 'stitching',
        status: 'in_progress',
        progress: 50,
        startTime: '2024-01-15 11:00',
        endTime: null
      },
      {
        id: 3,
        name: 'Quality Check',
        rawName: 'quality_check',
        status: 'pending',
        progress: 0,
        startTime: null,
        endTime: null
      }
    ],
    currentStage: 'Stitching',
    overallProgress: 33
  },
  {
    id: 2,
    orderNumber: 'PO-002',
    productName: 'Denim Jacket',
    stages: [
      {
        id: 4,
        name: 'Cutting',
        rawName: 'cutting',
        status: 'completed',
        progress: 100,
        startTime: '2024-01-14 08:30',
        endTime: '2024-01-14 09:45'
      },
      {
        id: 5,
        name: 'Stitching',
        rawName: 'stitching',
        status: 'pending',
        progress: 0,
        startTime: null,
        endTime: null
      }
    ],
    currentStage: 'Not Started',
    overallProgress: 50
  }
];

const statusProgress = (status) => {
  switch (status) {
    case 'completed': return 100;
    case 'in_progress': return 50;
    default: return 0;
  }
};

const ProductionTrackingPage = () => {
  const [selectedOrder, setSelectedOrder] = useState('all');
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeStageId, setCompleteStageId] = useState(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionStageId, setRejectionStageId] = useState(null);
  const [rejectionMaxQty, setRejectionMaxQty] = useState(0);
  const [alert, setAlert] = useState({ open: false, severity: 'success', message: '' });
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Validation schema: non-negative integers and approved + rejected <= processed
  const quantitySchema = yup.object({
    quantity_processed: yup
      .number()
      .typeError('Enter a number')
      .integer('Must be an integer')
      .min(0, 'Must be >= 0')
      .required('Required'),
    quantity_approved: yup
      .number()
      .typeError('Enter a number')
      .integer('Must be an integer')
      .min(0, 'Must be >= 0')
      .required('Required'),
    quantity_rejected: yup
      .number()
      .typeError('Enter a number')
      .integer('Must be an integer')
      .min(0, 'Must be >= 0')
      .required('Required'),
  }).test('sum-lte-processed', 'Approved + Rejected must be <= Processed', (values) => {
    const { quantity_processed = 0, quantity_approved = 0, quantity_rejected = 0 } = values || {};
    return quantity_approved + quantity_rejected <= quantity_processed;
  });

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(quantitySchema),
    defaultValues: { quantity_processed: 0, quantity_approved: 0, quantity_rejected: 0 }
  });

  // Rejection form
  const rejectionSchema = yup.object({
    items: yup.array().of(
      yup.object({
        reason: yup.string().required('Reason is required'),
        quantity: yup
          .number()
          .typeError('Enter a number')
          .integer('Must be an integer')
          .min(1, 'Must be >= 1')
          .required('Required'),
        notes: yup.string().nullable()
      })
    ).min(1, 'Add at least one item').test('sum-lte', 'Total quantity exceeds rejected amount', (items, ctx) => {
      const total = (items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
      return total <= rejectionMaxQty;
    })
  });

  const rejectionForm = useForm({
    resolver: yupResolver(rejectionSchema),
    defaultValues: { items: [{ reason: '', quantity: 1, notes: '' }] }
  });

  const { control: rejControl, handleSubmit: handleRejSubmit, reset: resetRej, formState: { errors: rejErrors, isSubmitting: isRejSubmitting } } = rejectionForm;
  const { fields: rejFields, append: rejAppend, remove: rejRemove } = useFieldArray({ name: 'items', control: rejControl });

  const openCompleteDialog = (stageId) => {
    setCompleteStageId(stageId);
    reset({ quantity_processed: 0, quantity_approved: 0, quantity_rejected: 0 });
    setCompleteDialogOpen(true);
  };

  const closeCompleteDialog = () => {
    setCompleteDialogOpen(false);
    setCompleteStageId(null);
  };

  const submitComplete = async (values) => {
    if (!completeStageId) return;
    await doAction(completeStageId, 'complete', values);
    closeCompleteDialog();

    // Open rejection dialog if any rejected quantity
    if (values.quantity_rejected > 0) {
      setRejectionStageId(completeStageId);
      setRejectionMaxQty(values.quantity_rejected);
      resetRej({ items: [{ reason: '', quantity: values.quantity_rejected, notes: '' }] });
      setRejectionDialogOpen(true);
    }
  };

  const closeRejectionDialog = () => {
    setRejectionDialogOpen(false);
    setRejectionStageId(null);
    setRejectionMaxQty(0);
  };

  const submitRejections = async ({ items }) => {
    if (!rejectionStageId) return;
    try {
      await api.post(`/manufacturing/stages/${rejectionStageId}/rejections`, { items });
      closeRejectionDialog();
      await fetchTrackingData();
    } catch (e) {
      setAlert({ open: true, severity: 'error', message: e?.response?.data?.message || e.message });
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/manufacturing/orders?limit=50');
      const orders = (data?.productionOrders || []).map((o) => ({
        id: o.id,
        orderNumber: o.production_number,
        productName: o.product?.name || '—',
        stages: (o.stages || []).map((s) => ({
          id: s.id,
          name: s.stage_name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          rawName: s.stage_name,
          status: s.status,
          progress: statusProgress(s.status),
          startTime: s.actual_start_time ? new Date(s.actual_start_time).toLocaleString() : null,
          endTime: s.actual_end_time ? new Date(s.actual_end_time).toLocaleString() : null,
        })),
        currentStage: (o.stages || []).find(s => s.status === 'in_progress')?.stage_name || 'Not Started',
        overallProgress: Math.round(((o.stages || []).filter(s => s.status === 'completed').length / Math.max(1, (o.stages || []).length)) * 100)
      }));
      setTrackingData(orders);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      setAlert({ open: true, severity: 'warning', message: 'Failed to load tracking data. Using demo data.' });
      // Fallback to mock data
      setTrackingData(mockTrackingData);
    } finally {
      setLoading(false);
    }
  };

  const getStageStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'default';
      case 'on_hold': return 'warning';
      default: return 'default';
    }
  };

  const getStageIcon = (status) => {
    switch (status) {
      case 'completed': return <FaCheckCircle />;
      case 'in_progress': return <FaClock />;
      case 'on_hold': return <FaExclamationTriangle />;
      default: return <FaClock />;
    }
  };

  // Action handlers
  const doAction = async (stageId, action, payload = {}) => {
    try {
      await api.post(`/manufacturing/stages/${stageId}/${action}`, payload);
      await fetchTrackingData();
    } catch (e) {
      console.error(`Failed to ${action} stage`, e);
      setAlert({ open: true, severity: 'error', message: `Failed to ${action} stage: ${e?.response?.data?.message || e.message}` });
    }
  };

  const filteredData = selectedOrder === 'all'
    ? trackingData
    : trackingData.filter(item => item.orderNumber === selectedOrder);

  const openWizard = (orderId) => {
    setSelectedOrderId(orderId);
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setSelectedOrderId(null);
    fetchTrackingData(); // Refresh data when wizard closes
  };

  // Summary metrics
  const totalOrders = trackingData.length;
  const inProgressOrders = trackingData.filter(item => item.overallProgress > 0 && item.overallProgress < 100).length;
  const completedOrders = trackingData.filter(item => item.overallProgress === 100).length;
  const pendingOrders = trackingData.filter(item => item.overallProgress === 0).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="text-lg text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Production Tracking</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
          <div>
            <div className="text-gray-500 text-sm mb-1">Total Orders</div>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </div>
          <FaIndustry className="text-primary text-3xl" />
        </div>
        <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
          <div>
            <div className="text-gray-500 text-sm mb-1">In Progress</div>
            <div className="text-2xl font-bold text-primary">{inProgressOrders}</div>
          </div>
          <FaClock className="text-primary text-3xl" />
        </div>
        <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
          <div>
            <div className="text-gray-500 text-sm mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-500">{completedOrders}</div>
          </div>
          <FaCheckCircle className="text-green-500 text-3xl" />
        </div>
        <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
          <div>
            <div className="text-gray-500 text-sm mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-500">{pendingOrders}</div>
          </div>
          <FaExclamationTriangle className="text-yellow-500 text-3xl" />
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <label className="block text-sm font-medium mb-2">Select Order</label>
        <select
          value={selectedOrder}
          onChange={e => setSelectedOrder(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Orders</option>
          {trackingData.map(item => (
            <option key={item.id} value={item.orderNumber}>
              {item.orderNumber} - {item.productName}
            </option>
          ))}
        </select>
      </div>

      {/* Production Tracking Details */}
      {filteredData.map(order => (
        <div key={order.id} className="bg-white rounded shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{order.orderNumber} - {order.productName}</h2>
            <div className="flex items-center gap-4">
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Current Stage: {order.currentStage}</span>
                <span>Overall Progress: {order.overallProgress}%</span>
              </div>
              <button
                onClick={() => openWizard(order.id)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <FaMagic className="w-4 h-4" />
                Track Progress
              </button>
            </div>
          </div>
          <div className="mb-4">
            <div className="h-3 rounded bg-gray-200">
              <div
                className="h-3 rounded bg-primary"
                style={{ width: `${order.overallProgress}%` }}
              ></div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Stage</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Progress</th>
                  <th className="px-4 py-2 text-left">Start Time</th>
                  <th className="px-4 py-2 text-left">End Time</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {order.stages.map((stage, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStageIcon(stage.status)}
                        <span>{stage.name}</span>
                        {stage.is_printing && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">
                            Printing
                          </span>
                        )}
                        {stage.is_embroidery && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-pink-100 text-pink-700 font-medium">
                            Embroidery
                          </span>
                        )}
                        {(stage.is_printing || stage.is_embroidery) && stage.outsourced && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">
                            Outsourced
                          </span>
                        )}
                        {(stage.is_printing || stage.is_embroidery) && !stage.outsourced && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                            In-House
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs border border-${getStageStatusColor(stage.status)}-500 text-${getStageStatusColor(stage.status)}-500`}>{stage.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded bg-gray-200">
                          <div
                            className="h-2 rounded bg-primary"
                            style={{ width: `${stage.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{stage.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">{stage.startTime || '-'}</td>
                    <td className="px-4 py-2">{stage.endTime || '-'}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2 flex-wrap">
                        {stage.status === 'pending' && (
                          <>
                            {stage.outsourced ? (
                              <button 
                                className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium transition-colors flex items-center gap-1" 
                                onClick={() => doAction(stage.id, 'outsource')}
                                title="Send to vendor (create challan)"
                              >
                                <FaMagic className="w-3 h-3" />
                                Send to Vendor
                              </button>
                            ) : (
                              <button 
                                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors flex items-center gap-1" 
                                onClick={() => doAction(stage.id, 'start')}
                                title="Start this stage"
                              >
                                <FaClock className="w-3 h-3" />
                                Start
                              </button>
                            )}
                            <button 
                              className="px-3 py-1.5 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium transition-colors" 
                              onClick={() => doAction(stage.id, 'hold')}
                              title="Put this stage on hold"
                            >
                              Hold
                            </button>
                            <button 
                              className="px-3 py-1.5 rounded bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium transition-colors" 
                              onClick={() => doAction(stage.id, 'skip')}
                              title="Skip this stage"
                            >
                              Skip
                            </button>
                          </>
                        )}
                        {stage.status === 'in_progress' && (
                          <>
                            {stage.outsourced ? (
                              <>
                                <button 
                                  className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors flex items-center gap-1" 
                                  onClick={() => doAction(stage.id, 'receive')}
                                  title="Receive from vendor"
                                >
                                  <FaCheckCircle className="w-3 h-3" />
                                  Receive from Vendor
                                </button>
                                <button 
                                  className="px-3 py-1.5 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium transition-colors" 
                                  onClick={() => doAction(stage.id, 'pause')}
                                  title="Pause this stage"
                                >
                                  Pause
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  className="px-3 py-1.5 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium transition-colors" 
                                  onClick={() => doAction(stage.id, 'pause')}
                                  title="Pause this stage"
                                >
                                  Pause
                                </button>
                                <button 
                                  className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors flex items-center gap-1" 
                                  onClick={() => openCompleteDialog(stage.id)}
                                  title="Mark this stage as complete"
                                >
                                  <FaCheckCircle className="w-3 h-3" />
                                  Complete
                                </button>
                              </>
                            )}
                          </>
                        )}
                        {stage.status === 'on_hold' && (
                          <>
                            <button 
                              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors" 
                              onClick={() => doAction(stage.id, 'resume')}
                              title="Resume this stage"
                            >
                              Resume
                            </button>
                            <button 
                              className="px-3 py-1.5 rounded bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium transition-colors" 
                              onClick={() => doAction(stage.id, 'skip')}
                              title="Skip this stage"
                            >
                              Skip
                            </button>
                          </>
                        )}
                        {stage.status === 'completed' && (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <FaCheckCircle className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Complete Stage Dialog */}
      {completeDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Complete Stage</h2>
            <form className="space-y-4" onSubmit={handleSubmit(submitComplete)}>
              <Controller
                name="quantity_processed"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity processed</label>
                    <input
                      {...field}
                      type="number"
                      min={0}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.quantity_processed && <span className="text-xs text-red-500">{errors.quantity_processed.message}</span>}
                  </div>
                )}
              />
              <Controller
                name="quantity_approved"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity approved</label>
                    <input
                      {...field}
                      type="number"
                      min={0}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.quantity_approved && <span className="text-xs text-red-500">{errors.quantity_approved.message}</span>}
                  </div>
                )}
              />
              <Controller
                name="quantity_rejected"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity rejected</label>
                    <input
                      {...field}
                      type="number"
                      min={0}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.quantity_rejected && <span className="text-xs text-red-500">{errors.quantity_rejected.message}</span>}
                  </div>
                )}
              />
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={closeCompleteDialog}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
                  disabled={isSubmitting}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Logging Dialog */}
      {rejectionDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Log Rejections</h2>
            <div className="text-xs text-gray-500 mb-2">Remaining to allocate: max {rejectionMaxQty}</div>
            {rejFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center mb-2">
                <Controller
                  name={`items.${index}.reason`}
                  control={rejControl}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Reason (e.g., stitching_defect)"
                      className="w-32 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                />
                <Controller
                  name={`items.${index}.quantity`}
                  control={rejControl}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min={1}
                      className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                />
                <Controller
                  name={`items.${index}.notes`}
                  control={rejControl}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Notes"
                      className="w-32 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                />
                <button
                  type="button"
                  className="px-2 py-1 rounded bg-red-500 text-white text-xs"
                  onClick={() => rejRemove(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            {typeof rejErrors.items?.message === 'string' && (
              <div className="text-xs text-red-500 mb-2">{rejErrors.items.message}</div>
            )}
            <button
              type="button"
              className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark mb-4"
              onClick={() => rejAppend({ reason: '', quantity: 1, notes: '' })}
            >
              Add Item
            </button>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={closeRejectionDialog}
                disabled={isRejSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
                onClick={handleRejSubmit(submitRejections)}
                disabled={isRejSubmitting}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {alert.open && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-4 py-2 rounded shadow text-white ${alert.severity === 'success' ? 'bg-green-500' : alert.severity === 'error' ? 'bg-red-500' : 'bg-primary'}`}>
            {alert.message}
          </div>
        </div>
      )}

      {/* Production Tracking Wizard Modal */}
      {wizardOpen && selectedOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeWizard}>
          <ProductionTrackingWizard
            orderId={selectedOrderId}
            onClose={closeWizard}
            onUpdate={() => fetchTrackingData()}
          />
        </div>
      )}
    </div>
  );
};

export default ProductionTrackingPage;