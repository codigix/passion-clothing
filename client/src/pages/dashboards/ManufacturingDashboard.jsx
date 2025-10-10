import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Square,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Factory,
  Users,
  Clock,
  Package,
  BarChart3,
  RefreshCw,
  Plus,
  Scan,
  QrCode,
  Trash2,
  Scissors,
  Paintbrush,
  Shirt,
  CheckSquare,
  Send,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import BarcodeDisplay from "../../components/BarcodeDisplay";
import BarcodeScanner from "../../components/BarcodeScanner";
import QRCodeScanner from "../../components/manufacturing/QRCodeScanner";

const StatCard = ({ title, value, icon, subtitle }) => (
  <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600 uppercase">{title}</span>
        <span>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mt-2">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  </div>
);

const ManufacturingDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    delayedOrders: 0,
    efficiency: 0,
  });
  const [activeOrders, setActiveOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productionStages, setProductionStages] = useState([]);
  const [workerPerformance, setWorkerPerformance] = useState([]);
  const [qualityMetrics, setQualityMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedOrderForBarcode, setSelectedOrderForBarcode] = useState(null);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [productionStagesDialogOpen, setProductionStagesDialogOpen] = useState(false);
  const [selectedProductionOrder, setSelectedProductionOrder] = useState(null);
  const [materialVerificationDialogOpen, setMaterialVerificationDialogOpen] = useState(false);
  const [outsourcingDialogOpen, setOutsourcingDialogOpen] = useState(false);
  const [qualityCheckDialogOpen, setQualityCheckDialogOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchActiveOrders();
    fetchProducts();
    fetchProductionStages();
    fetchWorkerPerformance();
    fetchQualityMetrics();
    fetchIncomingOrders();
  }, []);

  const fetchIncomingOrders = async () => {
    try {
      // Fetch production requests with pending status (newly created from Sales/Procurement)
      const response = await api.get('/production-requests?status=pending');
      const requests = response.data.data || [];
      
      // Transform production requests to match the expected order format
      const transformedOrders = requests.map(request => {
        // Parse product specifications if it's JSON string
        let specs = {};
        try {
          specs = typeof request.product_specifications === 'string' 
            ? JSON.parse(request.product_specifications) 
            : request.product_specifications || {};
        } catch (e) {
          specs = {};
        }
        
        return {
          id: request.id,
          order_number: request.request_number,
          request_number: request.request_number,
          product_id: request.product_id || specs.items?.[0]?.product_id || null,
          product_name: request.product_name,
          product_description: request.product_description,
          quantity: request.quantity,
          unit: request.unit,
          priority: request.priority,
          required_date: request.required_date,
          project_name: request.project_name,
          sales_order_id: request.sales_order_id,
          sales_order_number: request.sales_order_number,
          po_id: request.po_id,
          po_number: request.po_number,
          customer: {
            name: request.salesOrder?.customer?.name || specs.customer_name || 'N/A'
          },
          garment_specs: {
            product_type: specs.garment_specifications?.product_type || request.product_name
          },
          material_requirements: specs.items || [],
          requested_by: request.requester?.name || 'Unknown',
          status: request.status,
          created_at: request.created_at
        };
      });
      
      setIncomingOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching incoming orders:', error);
      toast.error('Failed to load incoming production requests');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/manufacturing/dashboard/stats');
      const data = response.data;
      
      // Calculate efficiency based on completed vs total orders
      const efficiency = data.totalOrders > 0 
        ? Math.round((data.completedOrders / data.totalOrders) * 100) 
        : 0;

      setStats({
        totalOrders: data.totalOrders,
        activeOrders: data.activeOrders,
        completedOrders: data.completedOrders,
        delayedOrders: data.delayedOrders,
        efficiency: efficiency,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchActiveOrders = async () => {
    try {
      const response = await api.get('/manufacturing/orders?status=cutting,embroidery,stitching,finishing,quality_check');
      const orders = response.data.productionOrders || [];
      
      // Transform data for display
      const transformedOrders = orders.map(order => {
        const completedStages = order.stages?.filter(stage => stage.status === 'completed').length || 0;
        const totalStages = order.stages?.length || 1;
        const progress = Math.round((completedStages / totalStages) * 100);
        
        const currentStage = order.stages?.find(stage => stage.status === 'in_progress')?.stage_name || 
                           order.stages?.find(stage => stage.status === 'pending')?.stage_name || 
                           'Not Started';

        return {
          id: order.id,
          orderNo: order.production_number,
          productName: order.product?.name || 'Unknown Product',
          quantity: order.quantity,
          currentStage: currentStage.replace('_', ' ').toUpperCase(),
          progress: progress,
          assignedWorker: order.assignedUser?.name || 'Unassigned',
          status: order.status,
          expectedCompletion: order.planned_end_date ? new Date(order.planned_end_date).toLocaleDateString() : 'TBD',
          productCode: order.product?.product_code,
          priority: order.priority
        };
      });

      setActiveOrders(transformedOrders);
    } catch (error) {
      console.error('Failed to fetch active orders:', error);
      toast.error('Failed to load active orders');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchProductionStages = async () => {
    try {
      // Get stage-wise statistics
      const stages = [
        { name: 'Cutting', key: 'cutting', icon: Package, color: 'bg-blue-100 text-blue-800' },
        { name: 'Embroidery', key: 'embroidery', icon: Factory, color: 'bg-purple-100 text-purple-800' },
        { name: 'Stitching', key: 'stitching', icon: Factory, color: 'bg-green-100 text-green-800' },
        { name: 'Finishing', key: 'finishing', icon: CheckCircle, color: 'bg-yellow-100 text-yellow-800' },
        { name: 'Quality Check', key: 'quality_check', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
        { name: 'Packaging', key: 'packaging', icon: Package, color: 'bg-gray-100 text-gray-800' }
      ];

      // Get count for each stage
      const stageData = await Promise.all(
        stages.map(async (stage) => {
          try {
            const response = await api.get(`/manufacturing/orders?status=${stage.key}`);
            const count = response.data.productionOrders?.length || 0;
            return { ...stage, count };
          } catch (error) {
            return { ...stage, count: 0 };
          }
        })
      );

      setProductionStages(stageData);
    } catch (error) {
      console.error('Failed to fetch production stages:', error);
    }
  };

  const fetchWorkerPerformance = async () => {
    try {
      // Mock worker performance data - replace with actual API call
      const mockData = [
        { id: 1, name: 'John Doe', efficiency: 95, tasksCompleted: 12, currentTask: 'Cutting Order #123' },
        { id: 2, name: 'Jane Smith', efficiency: 88, tasksCompleted: 10, currentTask: 'Stitching Order #124' },
        { id: 3, name: 'Mike Johnson', efficiency: 92, tasksCompleted: 11, currentTask: 'Quality Check Order #125' },
      ];
      setWorkerPerformance(mockData);
    } catch (error) {
      console.error('Failed to fetch worker performance:', error);
    }
  };

  const fetchQualityMetrics = async () => {
    try {
      const response = await api.get('/manufacturing/dashboard/stats');
      const rejectionStats = response.data.rejectionStats || [];
      
      const totalRejections = rejectionStats.reduce((sum, stat) => sum + stat.total_quantity, 0);
      const qualityRate = totalRejections > 0 ? Math.max(0, 100 - (totalRejections / 100)) : 100;

      setQualityMetrics([
        { label: 'Quality Rate', value: `${qualityRate.toFixed(1)}%`, color: 'text-green-600' },
        { label: 'Total Rejections', value: totalRejections, color: 'text-red-600' },
        { label: 'Top Rejection Reason', value: rejectionStats[0]?.reason || 'None', color: 'text-yellow-600' }
      ]);
    } catch (error) {
      console.error('Failed to fetch quality metrics:', error);
    }
  };

  // Action handlers for production orders
  const handleStartOrder = async (orderId) => {
    try {
      await api.post(`/manufacturing/orders/${orderId}/start`);
      toast.success('Production started successfully');
      fetchActiveOrders();
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start production');
    }
  };

  const handlePauseOrder = async (orderId) => {
    try {
      await api.post(`/manufacturing/orders/${orderId}/pause`);
      toast.success('Production paused successfully');
      fetchActiveOrders();
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to pause production');
    }
  };

  const handleStopOrder = async (orderId) => {
    try {
      await api.post(`/manufacturing/orders/${orderId}/stop`);
      toast.success('Production stopped successfully');
      fetchActiveOrders();
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to stop production');
    }
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setUpdateDialogOpen(true);
  };

  const handleViewOrder = (order) => {
    navigate(`/manufacturing/orders/${order.id}`);
  };

  const handleShowBarcode = (order) => {
    setSelectedOrderForBarcode(order);
    setBarcodeDialogOpen(true);
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      // Look up product by barcode
      const response = await api.get(`/products/scan/${decodedText}`);
      const product = response.data.product;
      
      if (product) {
        // Find orders with this product
        const ordersWithProduct = activeOrders.filter(order => 
          order.productCode === product.product_code
        );
        
        if (ordersWithProduct.length > 0) {
          toast.success(`Found ${ordersWithProduct.length} order(s) for ${product.name}`);
          // You could navigate to filtered view or highlight the orders
        } else {
          toast.info(`Product ${product.name} found, but no active orders`);
        }
      }
    } catch (error) {
      toast.error('Product not found with this barcode');
    }
    setIsScanning(false);
  };

  const handleScanError = (error) => {
    console.log('Scan error:', error);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this production order? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/manufacturing/orders/${orderId}`);
      toast.success('Production order deleted successfully');
      fetchActiveOrders();
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete production order');
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    fetchActiveOrders();
    fetchProductionStages();
    fetchWorkerPerformance();
    fetchQualityMetrics();
    fetchIncomingOrders();
  };

  // Production Workflow Functions
  const handleStartProduction = async (order) => {
    try {
      // Create production order from incoming order
      await api.post('/manufacturing/orders', {
        order_id: order.id,
        product_id: order.product_id,
        quantity: order.quantity,
        priority: 'medium',
        planned_start_date: new Date().toISOString().split('T')[0],
        planned_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        special_instructions: order.special_instructions
      });

      // Update order status to manufacturing_started
      await api.put(`/orders/${order.id}/status`, {
        status: 'manufacturing_started',
        department: 'manufacturing',
        action: 'production_started',
        notes: 'Production order created and started'
      });

      // Update QR code
      await api.put(`/orders/${order.id}/qr-code`, {
        department: 'manufacturing',
        status: 'production_started',
        timestamp: new Date().toISOString(),
        materials: order.material_requirements,
        customer: order.customer,
        stage: 'material_review'
      });

      toast.success('Production started successfully');
      fetchIncomingOrders();
      fetchActiveOrders();
    } catch (error) {
      toast.error('Failed to start production');
    }
  };

  const handleOpenProductionStages = (order) => {
    setSelectedProductionOrder(order);
    setProductionStagesDialogOpen(true);
  };

  const handleMaterialVerification = async (order) => {
    // Check if this is a production request that hasn't been converted to production order yet
    if (!order.production_order_id && !order.orderNo) {
      toast.error('Please start production first before verifying materials');
      return;
    }

    // If it's from a production request, fetch the actual production order
    if (order.production_order_id) {
      try {
        const response = await api.get(`/manufacturing/orders/${order.production_order_id}`);
        const productionOrder = response.data.productionOrder;
        setSelectedProductionOrder({
          ...productionOrder,
          id: productionOrder.id, // Use actual production order ID
          orderNo: productionOrder.production_number
        });
        setMaterialVerificationDialogOpen(true);
      } catch (error) {
        toast.error('Production order not found. Please start production first.');
      }
    } else {
      // It's already a production order from active orders list
      setSelectedProductionOrder(order);
      setMaterialVerificationDialogOpen(true);
    }
  };

  const handleCreateMRN = (order) => {
    // Navigate to Create MRN page with ALL comprehensive project data
    navigate('/manufacturing/material-requests/create', {
      state: {
        prefilledData: {
          // Basic Information
          project_name: order.project_name,
          production_request_id: order.id,
          request_number: order.request_number,
          
          // Product Details
          product_name: order.product_name,
          product_description: order.product_description,
          product_type: order.garment_specs?.product_type,
          
          // Quantities & Units
          quantity: order.quantity,
          unit: order.unit,
          
          // Dates & Priority
          required_date: order.required_date,
          priority: order.priority,
          created_at: order.created_at,
          
          // Order References
          sales_order_id: order.sales_order_id,
          sales_order_number: order.sales_order_number,
          po_id: order.po_id,
          po_number: order.po_number,
          
          // Customer & Requester Info
          customer_name: order.customer?.name,
          requested_by: order.requested_by,
          
          // Material Requirements (from production request specs)
          material_requirements: order.material_requirements || [],
          
          // Status
          status: order.status
        }
      }
    });
  };

  const handleConfirmMaterialVerification = async () => {
    if (!selectedProductionOrder) return;

    // Additional safety check - ensure we have a valid production order
    if (!selectedProductionOrder.id) {
      toast.error('Invalid production order. Please refresh and try again.');
      setMaterialVerificationDialogOpen(false);
      return;
    }

    try {
      // Update production stage to material_verified
      await api.put(`/manufacturing/orders/${selectedProductionOrder.id}/stages`, {
        stage: 'material_review',
        status: 'completed',
        notes: 'Materials verified and available'
      });

      // Move to next stage
      await api.put(`/manufacturing/orders/${selectedProductionOrder.id}/stages`, {
        stage: 'cutting',
        status: 'in_progress'
      });

      // Update QR code
      await api.put(`/orders/${selectedProductionOrder.order_id}/qr-code`, {
        department: 'manufacturing',
        status: 'material_verified',
        timestamp: new Date().toISOString(),
        stage: 'cutting',
        materials_verified: true
      });

      toast.success('Material verification completed');
      setMaterialVerificationDialogOpen(false);
      setSelectedProductionOrder(null);
      fetchActiveOrders();
    } catch (error) {
      toast.error('Failed to verify materials');
    }
  };

  const handleUpdateProductionStage = async (orderId, stage, status, notes = '') => {
    try {
      await api.put(`/manufacturing/orders/${orderId}/stages`, {
        stage: stage,
        status: status,
        notes: notes
      });

      // Update QR code with stage progress
      const qrData = {
        department: 'manufacturing',
        status: `${stage}_${status}`,
        timestamp: new Date().toISOString(),
        stage: stage,
        stage_status: status
      };

      // Find the order to get order_id
      const order = activeOrders.find(o => o.id === orderId);
      if (order) {
        await api.put(`/orders/${order.order_id || orderId}/qr-code`, qrData);
      }

      toast.success(`Stage ${stage} ${status}`);
      fetchActiveOrders();
    } catch (error) {
      toast.error(`Failed to update ${stage} stage`);
    }
  };

  const handleOutsourceStage = (order, stage) => {
    setSelectedProductionOrder({ ...order, outsourceStage: stage });
    setOutsourcingDialogOpen(true);
  };

  const handleConfirmOutsourcing = async () => {
    if (!selectedProductionOrder) return;

    try {
      // Create outsourcing record
      await api.post('/manufacturing/outsourcing', {
        production_order_id: selectedProductionOrder.id,
        stage: selectedProductionOrder.outsourceStage,
        vendor_name: 'Third Party Vendor', // This would come from form
        estimated_cost: 0, // This would come from form
        estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      // Update stage to outsourced
      await handleUpdateProductionStage(
        selectedProductionOrder.id,
        selectedProductionOrder.outsourceStage,
        'outsourced',
        'Sent to third party vendor'
      );

      toast.success('Stage outsourced successfully');
      setOutsourcingDialogOpen(false);
      setSelectedProductionOrder(null);
    } catch (error) {
      toast.error('Failed to outsource stage');
    }
  };

  const handleQualityCheck = (order) => {
    setSelectedProductionOrder(order);
    setQualityCheckDialogOpen(true);
  };

  const handleQualityCheckResult = async (passed, rejectReason = '') => {
    if (!selectedProductionOrder) return;

    try {
      if (passed) {
        // Complete quality check and move to completion
        await handleUpdateProductionStage(
          selectedProductionOrder.id,
          'quality_check',
          'completed',
          'Quality check passed'
        );

        // Mark production as completed
        await api.put(`/manufacturing/orders/${selectedProductionOrder.id}/complete`);

        // Update order status to manufacturing_completed
        await api.put(`/orders/${selectedProductionOrder.order_id}/status`, {
          status: 'manufacturing_completed',
          department: 'manufacturing',
          action: 'production_completed',
          notes: 'Production completed successfully'
        });

        // Update QR code
        await api.put(`/orders/${selectedProductionOrder.order_id}/qr-code`, {
          department: 'manufacturing',
          status: 'production_completed',
          timestamp: new Date().toISOString(),
          stage: 'completed',
          quality_passed: true
        });

        toast.success('Production completed successfully');
      } else {
        // Create rejection record
        await api.post('/manufacturing/rejections', {
          production_order_id: selectedProductionOrder.id,
          stage: 'quality_check',
          reason: rejectReason,
          quantity: selectedProductionOrder.quantity
        });

        toast.error(`Production rejected: ${rejectReason}`);
      }

      setQualityCheckDialogOpen(false);
      setSelectedProductionOrder(null);
      fetchActiveOrders();
    } catch (error) {
      toast.error('Failed to process quality check');
    }
  };

  const handleSendToShipment = async (order) => {
    try {
      // Update order status to ready_for_shipment
      await api.put(`/orders/${order.order_id}/status`, {
        status: 'ready_for_shipment',
        department: 'shipment',
        action: 'sent_to_shipment',
        notes: 'Order ready for shipment'
      });

      // Update QR code
      await api.put(`/orders/${order.order_id}/qr-code`, {
        department: 'shipment',
        status: 'ready_for_shipment',
        timestamp: new Date().toISOString(),
        stage: 'ready_for_dispatch'
      });

      toast.success('Order sent to shipment department');
      fetchActiveOrders();
    } catch (error) {
      toast.error('Failed to send to shipment');
    }
  };

  const handleScanQrCode = () => {
    setQrScannerOpen(true);
  };

  const handleQrScanSuccess = async (decodedText) => {
    try {
      const qrData = JSON.parse(decodedText);
      if (qrData.orderId) {
        // Find the order
        const order = [...incomingOrders, ...activeOrders].find(o =>
          o.id === qrData.orderId || o.order_id === qrData.orderId
        );
        if (order) {
          setSelectedProductionOrder(order);
          setQrScannerOpen(false);
          toast.success(`Order ${order.orderNo || order.production_number} scanned`);
        } else {
          toast.error('Order not found');
        }
      }
    } catch (error) {
      toast.error('Invalid QR code');
    }
  };

  // Create order form state
  const [createOrderForm, setCreateOrderForm] = useState({
    product_id: '',
    quantity: '',
    priority: 'medium',
    planned_start_date: '',
    planned_end_date: '',
    special_instructions: '',
    outsourced_stages: []
  });

  const handleCreateOrder = async () => {
    try {
      if (!createOrderForm.product_id || !createOrderForm.quantity || !createOrderForm.planned_start_date || !createOrderForm.planned_end_date) {
        toast.error('Please fill in all required fields');
        return;
      }

      await api.post('/manufacturing/orders', createOrderForm);
      toast.success('Production order created successfully');
      setCreateDialogOpen(false);
      setCreateOrderForm({
        product_id: '',
        quantity: '',
        priority: 'medium',
        planned_start_date: '',
        planned_end_date: '',
        special_instructions: '',
        outsourced_stages: []
      });
      fetchActiveOrders();
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create production order');
    }
  };

  // Update order form state
  const [updateOrderForm, setUpdateOrderForm] = useState({
    status: '',
    priority: '',
    planned_end_date: '',
    special_instructions: ''
  });

  const handleUpdateOrder = async () => {
    try {
      if (!selectedOrder) return;

      await api.put(`/manufacturing/orders/${selectedOrder.id}`, updateOrderForm);
      toast.success('Production order updated successfully');
      setUpdateDialogOpen(false);
      setSelectedOrder(null);
      setUpdateOrderForm({
        status: '',
        priority: '',
        planned_end_date: '',
        special_instructions: ''
      });
      fetchActiveOrders();
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update production order');
    }
  };

  // Dialogs
  const UpdateDialog = () => {
    // Initialize form when dialog opens
    React.useEffect(() => {
      if (selectedOrder && updateDialogOpen) {
        setUpdateOrderForm({
          status: selectedOrder.status || '',
          priority: selectedOrder.priority || '',
          planned_end_date: selectedOrder.expectedCompletion ? 
            new Date(selectedOrder.expectedCompletion).toISOString().split('T')[0] : '',
          special_instructions: ''
        });
      }
    }, [selectedOrder, updateDialogOpen]);

    return (
      <div className={`fixed inset-0 z-50 ${updateDialogOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setUpdateDialogOpen(false)}></div>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Order - {selectedOrder?.orderNo}
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={updateOrderForm.status}
                    onChange={(e) => setUpdateOrderForm({...updateOrderForm, status: e.target.value})}
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="cutting">Cutting</option>
                    <option value="embroidery">Embroidery</option>
                    <option value="stitching">Stitching</option>
                    <option value="finishing">Finishing</option>
                    <option value="quality_check">Quality Check</option>
                    <option value="packaging">Packaging</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={updateOrderForm.priority}
                    onChange={(e) => setUpdateOrderForm({...updateOrderForm, priority: e.target.value})}
                  >
                    <option value="">Select Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planned End Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={updateOrderForm.planned_end_date}
                    onChange={(e) => setUpdateOrderForm({...updateOrderForm, planned_end_date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                  <textarea
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={updateOrderForm.special_instructions}
                    onChange={(e) => setUpdateOrderForm({...updateOrderForm, special_instructions: e.target.value})}
                    placeholder="Enter any special instructions..."
                  />
                </div>

                {selectedOrder && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Order Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Product:</strong> {selectedOrder.productName}</p>
                      <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                      <p><strong>Current Stage:</strong> {selectedOrder.currentStage}</p>
                      <p><strong>Progress:</strong> {selectedOrder.progress}%</p>
                      <p><strong>Assigned Worker:</strong> {selectedOrder.assignedWorker}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setUpdateDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrder}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Update Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreateDialog = () => (
    <div className={`fixed inset-0 z-50 ${createDialogOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setCreateDialogOpen(false)}></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create Production Order</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={createOrderForm.product_id}
                  onChange={(e) => setCreateOrderForm({...createOrderForm, product_id: e.target.value})}
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.product_code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={createOrderForm.quantity}
                    onChange={(e) => setCreateOrderForm({...createOrderForm, quantity: e.target.value})}
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={createOrderForm.priority}
                    onChange={(e) => setCreateOrderForm({...createOrderForm, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planned Start Date *</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={createOrderForm.planned_start_date}
                    onChange={(e) => setCreateOrderForm({...createOrderForm, planned_start_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planned End Date *</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={createOrderForm.planned_end_date}
                    onChange={(e) => setCreateOrderForm({...createOrderForm, planned_end_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={createOrderForm.special_instructions}
                  onChange={(e) => setCreateOrderForm({...createOrderForm, special_instructions: e.target.value})}
                  placeholder="Enter any special instructions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Outsource Stages (Optional)</label>
                <p className="text-xs text-gray-500 mb-3">Select specific production stages to outsource to vendors</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'embroidery', label: 'Embroidery' },
                    { key: 'stitching', label: 'Stitching' },
                    { key: 'finishing', label: 'Finishing' },
                    { key: 'quality_check', label: 'Quality Check' }
                  ].map((stage) => (
                    <label key={stage.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={createOrderForm.outsourced_stages.includes(stage.key)}
                        onChange={(e) => {
                          const stages = e.target.checked
                            ? [...createOrderForm.outsourced_stages, stage.key]
                            : createOrderForm.outsourced_stages.filter(s => s !== stage.key);
                          setCreateOrderForm({...createOrderForm, outsourced_stages: stages});
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{stage.label}</span>
                    </label>
                  ))}
                </div>
                {createOrderForm.outsourced_stages.length > 0 && (
                  <p className="text-xs text-blue-600 mt-2">
                   ✓ {createOrderForm.outsourced_stages.length} stage(s) will be outsourced
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => setCreateDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOrder}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Create Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Manufacturing Dashboard</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsScanning(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition"
          >
            <Scan className="w-4 h-4" />
            Scan Product
          </button>
          <button
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Order
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            onClick={() => navigate('/manufacturing/orders/new')}
          >
            <Factory className="w-5 h-5" />
            Production Wizard
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={() => setActiveTab(4)}
          >
            <Users className="w-5 h-5" />
            Outsourcing
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<Factory className="w-6 h-6 text-blue-600" />}
          subtitle="All production orders"
        />
        <StatCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={<Play className="w-6 h-6 text-green-600" />}
          subtitle="Currently in production"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          subtitle="Successfully completed"
        />
        <StatCard
          title="Delayed Orders"
          value={stats.delayedOrders}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          subtitle="Behind schedule"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <nav className="flex space-x-8 px-6 border-b border-gray-200">
          {["Incoming Orders", "Active Orders", "Production Stages", "Worker Performance", "Quality Control", "Outsourcing", "QR Code Scanner"].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === idx
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
              {idx === 0 && incomingOrders.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {incomingOrders.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        {/* Incoming Orders Tab */}
        <div className={activeTab === 0 ? "block" : "hidden"}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Incoming Orders from Sales</h3>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                  onClick={handleScanQrCode}
                >
                  <QrCode className="w-4 h-4" /> Scan QR
                </button>
              </div>
            </div>
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materials</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {incomingOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{order.order_number}</div>
                        {!order.production_order_id && !order.orderNo && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                            Not Started
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">{order.customer?.name}</td>
                      <td className="px-6 py-4">{order.garment_specs?.product_type}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          {order.material_requirements?.slice(0, 2).map((mat, idx) => (
                            <div key={idx}>{mat.item}: {mat.quantity} {mat.unit}</div>
                          ))}
                          {order.material_requirements?.length > 2 && (
                            <div>+{order.material_requirements.length - 2} more</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">{order.quantity}</td>
                      <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleStartProduction(order)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                            title="Start Production"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMaterialVerification(order)}
                            disabled={!order.production_order_id && !order.orderNo}
                            className={`p-2 rounded transition-colors ${
                              !order.production_order_id && !order.orderNo
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                            }`}
                            title={!order.production_order_id && !order.orderNo ? "Start production first" : "Material Verification"}
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCreateMRN(order)}
                            className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded transition-colors"
                            title="Create Material Request (MRN)"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenProductionStages(order)}
                            disabled={!order.production_order_id && !order.orderNo}
                            className={`p-2 rounded transition-colors ${
                              !order.production_order_id && !order.orderNo
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-purple-600 hover:text-purple-900 hover:bg-purple-50'
                            }`}
                            title={!order.production_order_id && !order.orderNo ? "Start production first" : "Production Stages"}
                          >
                            <Factory className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {incomingOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No Incoming Orders from Sales
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={activeTab === 1 ? "block" : "hidden"}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders in Production</h3>
            {/* ...existing table code for active orders... */}
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Worker</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Completion</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{order.orderNo}</td>
                      <td className="px-6 py-4">{order.productName}</td>
                      <td className="px-6 py-4 text-right">{order.quantity}</td>
                      <td className="px-6 py-4">{order.currentStage}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${order.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-900">{order.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{order.assignedWorker}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {order.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">{order.expectedCompletion}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button 
                            onClick={() => handleStartOrder(order.id)}
                            className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                            title="Start Production"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handlePauseOrder(order.id)}
                            className="p-1 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded transition-colors"
                            title="Pause Production"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStopOrder(order.id)}
                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                            title="Stop Production"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditOrder(order)}
                            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Order"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleViewOrder(order)}
                            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleShowBarcode(order)}
                            className="p-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors"
                            title="Show Barcode"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Production Stages Tab */}
        <div className={activeTab === 1 ? "block" : "hidden"}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Stages Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {productionStages.map((stage) => {
                const IconComponent = stage.icon;
                return (
                  <div 
                    key={stage.key} 
                    className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/manufacturing/orders?status=${stage.key}`)}
                  >
                    <IconComponent className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{stage.name}</h4>
                    <div className="text-3xl font-bold text-blue-600 mb-1">{stage.count}</div>
                    <p className="text-sm text-gray-500">Active orders</p>
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${stage.color}`}>
                      {stage.key.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Worker Performance Tab */}
        <div className={activeTab === 2 ? "block" : "hidden"}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Worker Performance</h3>
            {workerPerformance.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workerPerformance.map((worker) => (
                  <div key={worker.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">{worker.name}</h4>
                          <p className="text-xs text-gray-500">Production Worker</p>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        worker.efficiency >= 90 ? 'text-green-600' : 
                        worker.efficiency >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {worker.efficiency}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tasks Completed:</span>
                        <span className="font-medium">{worker.tasksCompleted}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Current Task:</span>
                        <span className="font-medium text-blue-600">{worker.currentTask}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${worker.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No worker performance data available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quality Control Tab */}
        <div className={activeTab === 3 ? "block" : "hidden"}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Control Metrics</h3>
            {qualityMetrics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {qualityMetrics.map((metric, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">{metric.label}</h4>
                    <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                  </div>
                ))}
              </div>
            ) : null}
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quality Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/manufacturing/quality')}
                  className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Quality Reports</span>
                </button>
                <button 
                  onClick={() => navigate('/manufacturing/orders?tab=rejections')}
                  className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Rejection Analysis</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Outsourcing Tab */}
        <div className={activeTab === 5 ? "block" : "hidden"}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Outsourcing Management</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/outsourcing/vendors')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition"
                >
                  <Users className="w-4 h-4" />
                  Manage Vendors
                </button>
                <button
                  onClick={() => navigate('/outsourcing/create-order')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Create Outsource Order
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Active Outsource Orders"
                value={12}
                icon={<Package className="w-6 h-6 text-blue-600" />}
                subtitle="Currently with vendors"
              />
              <StatCard
                title="Completed Orders"
                value={45}
                icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                subtitle="Successfully completed"
              />
              <StatCard
                title="Total Vendors"
                value={8}
                icon={<Users className="w-6 h-6 text-purple-600" />}
                subtitle="Active partnerships"
              />
              <StatCard
                title="Avg Delivery Time"
                value="6.2"
                icon={<Clock className="w-6 h-6 text-orange-600" />}
                subtitle="Days from vendor"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Outsource Orders */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Recent Outsource Orders</h4>
                  <button
                    onClick={() => navigate('/outsourcing/orders')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { id: 1, orderNo: 'OUT-2024-001', vendor: 'Precision Embroidery', product: 'Logo Embroidery', status: 'in_progress', progress: 65 },
                    { id: 2, orderNo: 'OUT-2024-002', vendor: 'Elite Stitching', product: 'Trouser Stitching', status: 'completed', progress: 100 },
                    { id: 3, orderNo: 'OUT-2024-003', vendor: 'Quick Print', product: 'Screen Printing', status: 'delayed', progress: 40 }
                  ].map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{order.orderNo}</div>
                        <div className="text-sm text-gray-600">{order.vendor} - {order.product}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-xs px-2 py-1 rounded-full ${
                           order.status === 'completed' ? 'bg-green-100 text-green-800' :
                           order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                           'bg-yellow-100 text-yellow-800'
                         }`}>
                           {order.status.replace('_', ' ').toUpperCase()}
                         </div>
                          <div className="text-xs text-gray-500 mt-1">{order.progress}%</div>
                        </div>
                        <button
                          onClick={() => navigate(`/outsourcing/orders/${order.id}`)}
                          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vendor Performance */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Top Performing Vendors</h4>
                  <button
                    onClick={() => navigate('/outsourcing/performance')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Precision Embroidery', rating: 4.8, orders: 25, onTime: 96 },
                    { name: 'Elite Stitching Services', rating: 4.6, orders: 18, onTime: 92 },
                    { name: 'Quick Print Solutions', rating: 4.2, orders: 12, onTime: 88 }
                  ].map((vendor, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{vendor.name}</div>
                        <div className="text-sm text-gray-600">{vendor.orders} orders completed</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{vendor.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                        <div className="text-xs text-gray-500">{vendor.onTime}% on-time</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Outsourcing Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Outsourcing Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/outsourcing/performance')}
                  className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Vendor Performance</span>
                </button>
                <button
                  onClick={() => navigate('/outsourcing/quality')}
                  className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Quality Reports</span>
                </button>
                <button
                  onClick={() => navigate('/outsourcing/reports')}
                  className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Outsource Reports</span>
                </button>
                <button
                  onClick={() => navigate('/outsourcing/reports/export')}
                  className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Package className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Export Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Scanner Tab */}
        <div className={activeTab === 6 ? "block" : "hidden"}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">QR Code Scanner</h3>
              <div className="text-sm text-gray-600">
                Scan QR codes from production orders, challans, and materials to view detailed information
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scanner Component */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Scan QR Code</h4>
                <QRCodeScanner embedded={true} />
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/manufacturing/orders')}
                    className="flex items-center justify-center gap-2 w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Factory className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">View All Orders</span>
                  </button>
                  <button
                    onClick={() => navigate('/manufacturing/challans')}
                    className="flex items-center justify-center gap-2 w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="font-medium">View Challans</span>
                  </button>
                  <button
                    onClick={() => navigate('/inventory')}
                    className="flex items-center justify-center gap-2 w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Inventory Management</span>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="text-sm font-semibold text-blue-900 mb-2">QR Code Features</h5>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Scan production order QR codes to view progress</li>
                    <li>• Track challan details and delivery status</li>
                    <li>• Monitor material usage and quality metrics</li>
                    <li>• Verify vendor work with external partners</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpdateDialog />
      <CreateDialog />

      {/* QR Code Scanner Dialog */}
      <div className={`fixed inset-0 z-50 ${qrScannerOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setQrScannerOpen(false)}></div>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Scan QR Code
              </h3>
            </div>
            <div className="px-6 py-6">
              <QRCodeScanner
                onScanSuccess={handleQrScanSuccess}
                onScanError={(error) => toast.error('Scan failed: ' + error)}
                isScanning={qrScannerOpen}
                setIsScanning={setQrScannerOpen}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setQrScannerOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Material Verification Dialog */}
      <div className={`fixed inset-0 z-50 ${materialVerificationDialogOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMaterialVerificationDialogOpen(false)}></div>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Material Verification - {selectedProductionOrder?.order_number}
              </h3>
            </div>
            <div className="px-6 py-6">
              {selectedProductionOrder?.material_requirements && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedProductionOrder.material_requirements.map((material, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{material.item}</span>
                          <span className="text-sm text-gray-600">{material.quantity} {material.unit}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Required: {material.quantity * selectedProductionOrder.quantity} {material.unit}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`material-${idx}`}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`material-${idx}`} className="text-sm">Available</label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setMaterialVerificationDialogOpen(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmMaterialVerification}
                      className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md"
                    >
                      Confirm Verification
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Production Stages Dialog */}
      <div className={`fixed inset-0 z-50 ${productionStagesDialogOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setProductionStagesDialogOpen(false)}></div>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Production Stages - {selectedProductionOrder?.order_number}
              </h3>
            </div>
            <div className="px-6 py-6">
              {selectedProductionOrder && (
                <div className="space-y-6">
                  {[
                    { name: 'Material Review', status: 'completed', icon: CheckSquare },
                    { name: 'Measurement & Cutting', status: 'in_progress', icon: Scissors },
                    { name: 'Printing/Embroidery', status: 'pending', icon: Paintbrush },
                    { name: 'Stitching', status: 'pending', icon: Shirt },
                    { name: 'Finishing', status: 'pending', icon: CheckSquare },
                    { name: 'Quality Check', status: 'pending', icon: CheckCircle }
                  ].map((stage, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <stage.icon className={`w-5 h-5 ${
                          stage.status === 'completed' ? 'text-green-600' :
                          stage.status === 'in_progress' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <span className="font-medium">{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                          stage.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {stage.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {stage.status === 'in_progress' && (
                          <button
                            onClick={() => handleUpdateProductionStage(selectedProductionOrder.id, stage.name.toLowerCase().replace(' & ', '_').replace(' ', '_'), 'completed')}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setProductionStagesDialogOpen(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleSendToShipment(selectedProductionOrder)}
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                    >
                      Send to Shipment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Display Dialog */}
      <div className={`fixed inset-0 z-50 ${barcodeDialogOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setBarcodeDialogOpen(false)}></div>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Product Barcode - {selectedOrderForBarcode?.orderNo}
              </h3>
            </div>
            <div className="px-6 py-6">
              {selectedOrderForBarcode?.productCode ? (
                <div className="text-center space-y-4">
                  <BarcodeDisplay value={selectedOrderForBarcode.productCode} />
                  <div className="text-sm text-gray-600">
                    <p><strong>Product:</strong> {selectedOrderForBarcode.productName}</p>
                    <p><strong>Order:</strong> {selectedOrderForBarcode.orderNo}</p>
                    <p><strong>Quantity:</strong> {selectedOrderForBarcode.quantity}</p>
                    <p><strong>Stage:</strong> {selectedOrderForBarcode.currentStage}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No barcode available for this product
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setBarcodeDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Dialog */}
      <div className={`fixed inset-0 z-50 ${isScanning ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsScanning(false)}></div>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Scan Product Barcode
              </h3>
            </div>
            <div className="px-6 py-6">
              <BarcodeScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
                isScanning={isScanning}
                setIsScanning={setIsScanning}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsScanning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturingDashboard;