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

const StatCard = ({ title, value, icon, subtitle, onClick }) => (
  <div 
    className={`p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
    onClick={onClick}
  >
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

const getStageStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-300';
    case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'pending': return 'bg-gray-100 text-gray-800 border-gray-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStageIcon = (status) => {
  switch (status) {
    case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
    case 'on_hold': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
    default: return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedOrderForBarcode, setSelectedOrderForBarcode] = useState(null);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [productionStagesDialogOpen, setProductionStagesDialogOpen] = useState(false);
  const [selectedProductionOrder, setSelectedProductionOrder] = useState(null);
  const [materialVerificationDialogOpen, setMaterialVerificationDialogOpen] = useState(false);
  const [qualityCheckDialogOpen, setQualityCheckDialogOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [productSelectionDialogOpen, setProductSelectionDialogOpen] = useState(false);
  const [pendingProductionOrder, setPendingProductionOrder] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProductForProduction, setSelectedProductForProduction] = useState(null);
  const [pendingDispatches, setPendingDispatches] = useState([]);
  const [pendingReceipts, setPendingReceipts] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [productTrackingDialogOpen, setProductTrackingDialogOpen] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchActiveOrders();
    fetchProducts();
    fetchProductionStages();
    fetchIncomingOrders();
    fetchPendingMaterialReceipts();
  }, []);

  const fetchIncomingOrders = async () => {
    try {
      // Fetch production requests with pending and reviewed status (newly created from Sales/Procurement)
      const response = await api.get('/production-requests?status=pending,reviewed');
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
        
        // Extract product info from multiple sources with better fallback logic
        const productName = request.product_name || 
                           specs.garment_specifications?.product_type ||
                           specs.product_name ||
                           'Unknown Product';
        
        const productDescription = request.product_description || 
                                  specs.garment_specifications?.description ||
                                  specs.description ||
                                  '';
        
        const productId = request.product_id || 
                         specs.items?.[0]?.product_id || 
                         null;
        
        // Extract customer name from multiple sources
        const customerName = request.salesOrder?.customer?.name || 
                           request.salesOrder?.customer_name ||
                           specs.customer_name || 
                           'N/A';
        
        return {
          id: request.id,
          order_number: request.request_number,
          request_number: request.request_number,
          product_id: productId,
          product_name: productName,
          product_description: productDescription,
          quantity: request.quantity,
          unit: request.unit,
          priority: request.priority || 'medium',
          required_date: request.required_date,
          project_name: request.project_name,
          sales_order_id: request.sales_order_id,
          sales_order_number: request.sales_order_number,
          po_id: request.po_id,
          po_number: request.po_number,
          customer: {
            name: customerName
          },
          garment_specs: {
            product_type: productName
          },
          material_requirements: specs.items || [],
          requested_by: request.requester?.name || 'Unknown',
          status: request.status,
          created_at: request.created_at,
          special_instructions: request.notes || specs.special_instructions || ''
        };
      });
      
      console.log('📦 Incoming Orders:', transformedOrders.length);
      transformedOrders.forEach(order => {
        console.log(`  - ${order.order_number}: Product="${order.product_name}" (ID: ${order.product_id || 'NULL'})`);
      });
      
      setIncomingOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching incoming orders:', error);
      toast.error('Failed to load incoming production requests');
    }
  };

  const fetchPendingMaterialReceipts = async () => {
    try {
      // Fetch pending dispatches (materials dispatched by inventory, awaiting receipt in manufacturing)
      const dispatchResponse = await api.get('/material-dispatch/list/all');
      const allDispatches = dispatchResponse.data.dispatches || [];
      const pending = allDispatches.filter(d => d.received_status === 'pending');
      setPendingDispatches(pending);

      // Fetch pending receipts (materials received but awaiting verification)
      try {
        const receiptResponse = await api.get('/material-receipt/list/pending-verification');
        setPendingReceipts(receiptResponse.data.receipts || []);
      } catch (err) {
        console.log('No pending receipts endpoint yet');
        setPendingReceipts([]);
      }

      // Fetch pending verifications (materials verified but awaiting production approval)
      try {
        const verificationResponse = await api.get('/material-verification/list/pending-approval');
        setPendingVerifications(verificationResponse.data.verifications || []);
      } catch (err) {
        console.log('No pending verifications endpoint yet');
        setPendingVerifications([]);
      }

    } catch (error) {
      console.error('Error fetching pending material receipts:', error);
      // Don't show error toast to avoid spam
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
      const response = await api.get('/manufacturing/orders?limit=100');
      const orders = response.data.productionOrders || [];
      
      // Transform data for display with complete stage information
      const transformedOrders = orders.map(order => {
        const completedStages = order.stages?.filter(stage => stage.status === 'completed').length || 0;
        const totalStages = order.stages?.length || 1;
        const progress = Math.round((completedStages / totalStages) * 100);
        
        const currentStage = order.stages?.find(stage => stage.status === 'in_progress')?.stage_name || 
                           order.stages?.find(stage => stage.status === 'pending')?.stage_name || 
                           'Not Started';

        // Extract project name from multiple sources
        const projectName = order.project_name || 
                           order.salesOrder?.project_name || 
                           order.productionRequest?.project_name ||
                           'N/A';

        // Transform stages with complete details
        const stages = (order.stages || []).map(stage => ({
          id: stage.id,
          name: stage.stage_name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          rawName: stage.stage_name,
          status: stage.status,
          progress: stage.status === 'completed' ? 100 : stage.status === 'in_progress' ? 50 : 0,
          startTime: stage.actual_start_time ? new Date(stage.actual_start_time).toLocaleString() : null,
          endTime: stage.actual_end_time ? new Date(stage.actual_end_time).toLocaleString() : null,
          processedQty: stage.quantity_processed || 0,
          approvedQty: stage.quantity_approved || 0,
          rejectedQty: stage.quantity_rejected || 0,
          isOutsourced: stage.work_type === 'outsourced',
          isPrinting: stage.stage_name === 'printing',
          isEmbroidery: stage.stage_name === 'embroidery',
          notes: stage.notes || ''
        }));

        return {
          id: order.id,
          orderNo: order.production_number,
          projectName: projectName,
          productName: order.product?.name || 'Unknown Product',
          quantity: order.quantity,
          currentStage: currentStage.replace('_', ' ').toUpperCase(),
          progress: progress,
          assignedWorker: order.assignedUser?.name || 'Unassigned',
          status: order.status,
          expectedCompletion: order.planned_end_date ? new Date(order.planned_end_date).toLocaleDateString() : 'TBD',
          productCode: order.product?.product_code,
          priority: order.priority,
          stages: stages,
          actualStartDate: order.actual_start_date ? new Date(order.actual_start_date).toLocaleDateString() : null,
          actualEndDate: order.actual_end_date ? new Date(order.actual_end_date).toLocaleDateString() : null,
          salesOrderNumber: order.salesOrder?.order_number || 'N/A',
          customerName: order.salesOrder?.customer?.name || 'N/A'
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
      // Fetch products with larger limit to get all available products
      const response = await api.get('/products?limit=1000&status=active');
      const productsList = response.data.products || [];
      console.log('✅ Fetched products:', productsList.length);
      setProducts(productsList);
      setAvailableProducts(productsList);
      
      // If no products found, show a warning
      if (productsList.length === 0) {
        console.warn('⚠️ No products found. Please create products in the Inventory module first.');
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products. Please check your connection.');
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
      setIsScanning(false);
      setTrackingLoading(true);
      setProductTrackingDialogOpen(true);
      
      // Look up product by barcode
      const productResponse = await api.get(`/products/scan/${decodedText}`);
      const product = productResponse.data.product;
      
      if (!product) {
        toast.error('Product not found with this barcode');
        setProductTrackingDialogOpen(false);
        return;
      }

      // Fetch comprehensive tracking data
      const trackingInfo = {
        product: product,
        salesOrders: [],
        productionRequests: [],
        productionOrders: [],
        materialRequests: [],
        currentStatus: 'Not Found'
      };

      // Find sales orders with this product
      try {
        const salesResponse = await api.get(`/sales/orders?product_id=${product.id}`);
        trackingInfo.salesOrders = salesResponse.data.orders || [];
      } catch (err) {
        console.log('No sales orders found');
      }

      // Find production requests
      try {
        const productionRequestsResponse = await api.get(`/production-requests?product_id=${product.id}`);
        trackingInfo.productionRequests = productionRequestsResponse.data.data || [];
      } catch (err) {
        console.log('No production requests found');
      }

      // Find production orders
      try {
        const productionOrdersResponse = await api.get(`/manufacturing/orders?product_id=${product.id}`);
        trackingInfo.productionOrders = productionOrdersResponse.data.productionOrders || [];
      } catch (err) {
        console.log('No production orders found');
      }

      // Find material requests
      try {
        const materialRequestsResponse = await api.get(`/material-request-manufacture?product_id=${product.id}`);
        trackingInfo.materialRequests = materialRequestsResponse.data.requests || [];
      } catch (err) {
        console.log('No material requests found');
      }

      // Determine current status
      if (trackingInfo.productionOrders.length > 0) {
        const latestOrder = trackingInfo.productionOrders[0];
        trackingInfo.currentStatus = latestOrder.status.replace(/_/g, ' ').toUpperCase();
      } else if (trackingInfo.productionRequests.length > 0) {
        trackingInfo.currentStatus = 'PRODUCTION REQUESTED';
      } else if (trackingInfo.salesOrders.length > 0) {
        trackingInfo.currentStatus = 'SALES ORDER CREATED';
      }

      setTrackingData(trackingInfo);
      toast.success(`Product ${product.name} found!`);
      
    } catch (error) {
      console.error('Scan error:', error);
      
      // Check if it's a 404 error (product not found)
      if (error.response?.status === 404) {
        // Try to fetch available products to help user
        try {
          const productsResponse = await api.get('/products?limit=10&status=active');
          const availableProducts = productsResponse.data.products || [];
          
          if (availableProducts.length > 0) {
            const productList = availableProducts
              .map(p => `  • ${p.name} (${p.barcode || 'No barcode'})`)
              .join('\n');
            
            toast.error(
              <div>
                <p className="font-semibold mb-2">❌ Product Not Found</p>
                <p className="mb-2">Barcode "{decodedText}" doesn't exist in the system.</p>
                <p className="text-xs mb-1">Available products:</p>
                <pre className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                  {productList}
                </pre>
                <p className="text-xs mt-2 text-gray-600">
                  💡 Add products via Inventory → GRN workflow
                </p>
              </div>,
              {
                duration: 8000,
                style: {
                  maxWidth: '600px'
                }
              }
            );
          } else {
            toast.error(
              `❌ Product with barcode "${decodedText}" not found.\n\n` +
              `⚠️ No products exist in the system yet.\n` +
              `💡 Add products via: Inventory → GRN Workflow`,
              {
                duration: 6000,
                style: {
                  maxWidth: '500px'
                }
              }
            );
          }
        } catch (fetchError) {
          // Fallback if we can't fetch products
          toast.error(`Product with barcode "${decodedText}" not found in system.\nPlease check the barcode or add the product first.`, {
            duration: 5000,
            style: {
              maxWidth: '500px'
            }
          });
        }
      } else {
        // Other errors (network, server, etc.)
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch product tracking information';
        toast.error(errorMessage);
      }
      
      setProductTrackingDialogOpen(false);
    } finally {
      setTrackingLoading(false);
    }
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
    fetchIncomingOrders();
  };

  // Production Workflow Functions - Simplified Approval
  const handleStartProduction = async (order) => {
    try {
      console.log('=== Approve Order Clicked ===');
      console.log('Order:', order.order_number || order.request_number);

      // Update production request status to reviewed (approved by manufacturing)
      await api.patch(`/production-requests/${order.id}/status`, {
        status: 'reviewed',
        manufacturing_notes: 'Order reviewed and approved. Ready for MRN request.'
      });

      toast.success('Order approved successfully. Ready for MRN request.');
      fetchIncomingOrders();
    } catch (error) {
      console.error('Approval error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to approve order';
      toast.error(errorMessage);
    }
  };

  const handleConfirmProductSelection = async () => {
    if (!selectedProductForProduction) {
      toast.error('Please select a product');
      return;
    }

    if (!pendingProductionOrder) {
      toast.error('No pending order found');
      return;
    }

    try {
      // Create the order with the selected product
      const orderWithProduct = {
        ...pendingProductionOrder,
        product_id: selectedProductForProduction
      };

      console.log('Creating production with selected product:', selectedProductForProduction);

      // Create production order from incoming order
      const payload = {
        sales_order_id: orderWithProduct.sales_order_id || null,
        product_id: Number(selectedProductForProduction), // Use selected product
        quantity: orderWithProduct.quantity,
        priority: orderWithProduct.priority || 'medium',
        production_type: 'in_house', // Valid values: 'in_house', 'outsourced', 'mixed'
        planned_start_date: new Date().toISOString().split('T')[0],
        planned_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        special_instructions: orderWithProduct.special_instructions || orderWithProduct.product_description || ''
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      await api.post('/manufacturing/orders', payload);

      // Update production request status if applicable
      if (orderWithProduct.request_number) {
        try {
          await api.put(`/production-requests/${orderWithProduct.id}`, {
            status: 'in_production',
            notes: 'Production order created with selected product'
          });
        } catch (reqError) {
          console.warn('Failed to update production request status:', reqError);
          // Don't fail the entire operation
        }
      }

      // Close the dialog first
      setProductSelectionDialogOpen(false);
      setPendingProductionOrder(null);
      setSelectedProductForProduction(null);

      toast.success('Production started successfully');
      fetchIncomingOrders();
      fetchActiveOrders();
    } catch (error) {
      console.error('Start production with selected product error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to start production';
      toast.error(errorMessage);
    }
  };

  const handleCreateNewProduct = () => {
    // Close the dialog
    setProductSelectionDialogOpen(false);
    // Navigate to inventory dashboard to create new product
    navigate('/inventory');
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

  const ProductTrackingDialog = () => (
    <div className={`fixed inset-0 z-50 ${productTrackingDialogOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setProductTrackingDialogOpen(false)}></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-6 h-6" />
                Product Tracking Details
              </h3>
              <button 
                onClick={() => setProductTrackingDialogOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {trackingLoading ? (
            <div className="px-6 py-12 text-center">
              <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading tracking information...</p>
            </div>
          ) : trackingData ? (
            <div className="px-6 py-6">
              {/* Product Info Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6 border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{trackingData.product.name}</h4>
                    {trackingData.product.description && (
                      <p className="text-gray-600 mb-3">{trackingData.product.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 font-medium">Product Code:</span>
                        <p className="text-gray-900 font-semibold">{trackingData.product.product_code}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Category:</span>
                        <p className="text-gray-900 font-semibold">{trackingData.product.category || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Barcode:</span>
                        <p className="text-gray-900 font-semibold">{trackingData.product.barcode || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Current Status:</span>
                        <span className="inline-block px-3 py-1 text-sm font-bold bg-blue-600 text-white rounded">
                          {trackingData.currentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  {trackingData.product.barcode && (
                    <div className="ml-6">
                      <BarcodeDisplay value={trackingData.product.barcode} width={1.5} height={60} />
                    </div>
                  )}
                </div>
              </div>

              {/* Journey Timeline */}
              <div className="space-y-6">
                {/* Sales Orders */}
                <div>
                  <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 font-bold">1</span>
                    </div>
                    Sales Orders ({trackingData.salesOrders.length})
                  </h5>
                  {trackingData.salesOrders.length > 0 ? (
                    <div className="space-y-2">
                      {trackingData.salesOrders.map((order, idx) => (
                        <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Order #:</span>
                              <p className="font-semibold text-gray-900">{order.order_number}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Customer:</span>
                              <p className="font-semibold text-gray-900">{order.customer?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Quantity:</span>
                              <p className="font-semibold text-gray-900">{order.quantity || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <span className="inline-block px-2 py-1 text-xs bg-green-600 text-white rounded">
                                {order.status?.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic p-4 bg-gray-50 rounded border border-gray-200">No sales orders found</p>
                  )}
                </div>

                {/* Production Requests */}
                <div>
                  <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-700 font-bold">2</span>
                    </div>
                    Production Requests ({trackingData.productionRequests.length})
                  </h5>
                  {trackingData.productionRequests.length > 0 ? (
                    <div className="space-y-2">
                      {trackingData.productionRequests.map((request, idx) => (
                        <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Request #:</span>
                              <p className="font-semibold text-gray-900">{request.request_number}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Project:</span>
                              <p className="font-semibold text-gray-900">{request.project_name || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Quantity:</span>
                              <p className="font-semibold text-gray-900">{request.quantity} {request.unit}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <span className="inline-block px-2 py-1 text-xs bg-blue-600 text-white rounded">
                                {request.status?.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic p-4 bg-gray-50 rounded border border-gray-200">No production requests found</p>
                  )}
                </div>

                {/* Material Requests */}
                <div>
                  <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-700 font-bold">3</span>
                    </div>
                    Material Requests ({trackingData.materialRequests.length})
                  </h5>
                  {trackingData.materialRequests.length > 0 ? (
                    <div className="space-y-2">
                      {trackingData.materialRequests.map((request, idx) => (
                        <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">MRN #:</span>
                              <p className="font-semibold text-gray-900">{request.mrm_number || request.id}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Project:</span>
                              <p className="font-semibold text-gray-900">{request.project_name || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Requested Date:</span>
                              <p className="font-semibold text-gray-900">{new Date(request.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <span className="inline-block px-2 py-1 text-xs bg-purple-600 text-white rounded">
                                {request.status?.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic p-4 bg-gray-50 rounded border border-gray-200">No material requests found</p>
                  )}
                </div>

                {/* Production Orders */}
                <div>
                  <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-orange-700 font-bold">4</span>
                    </div>
                    Production Orders ({trackingData.productionOrders.length})
                  </h5>
                  {trackingData.productionOrders.length > 0 ? (
                    <div className="space-y-2">
                      {trackingData.productionOrders.map((order, idx) => (
                        <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">Production #:</span>
                              <p className="font-semibold text-gray-900">{order.production_number}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Quantity:</span>
                              <p className="font-semibold text-gray-900">{order.quantity}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Priority:</span>
                              <span className={`inline-block px-2 py-1 text-xs rounded ${
                                order.priority === 'urgent' ? 'bg-red-600 text-white' :
                                order.priority === 'high' ? 'bg-orange-600 text-white' :
                                order.priority === 'medium' ? 'bg-yellow-600 text-white' :
                                'bg-gray-600 text-white'
                              }`}>
                                {order.priority?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <span className="inline-block px-2 py-1 text-xs bg-orange-600 text-white rounded">
                                {order.status?.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {/* Production Stages */}
                          {order.stages && order.stages.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-orange-200">
                              <span className="text-xs font-medium text-gray-600 mb-2 block">Production Stages:</span>
                              <div className="flex flex-wrap gap-2">
                                {order.stages.map((stage, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                                      stage.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-300' :
                                      stage.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                      stage.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                      'bg-gray-100 text-gray-800 border border-gray-300'
                                    }`}
                                  >
                                    {getStageIcon(stage.status)}
                                    {stage.stage_name.replace(/_/g, ' ').toUpperCase()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic p-4 bg-gray-50 rounded border border-gray-200">No production orders found</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-600">
              No tracking data available
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
            <button
              onClick={() => setProductTrackingDialogOpen(false)}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Close
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
        <div className="flex gap-3 w-full justify-end">
          <button
            onClick={() => setIsScanning(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition"
          >
            <Scan className="w-4 h-4" />
            Scan Product
          </button>
          <button
            onClick={() => navigate('/manufacturing/wizard')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Order
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-purple-700"
            onClick={() => navigate('/outsourcing')}
          >
            <Users className="w-5 h-5" />
            Outsourcing
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
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
          title="Pending Materials"
          value={pendingDispatches.length + pendingReceipts.length + pendingVerifications.length}
          icon={<Package className="w-6 h-6 text-orange-600" />}
          subtitle="Awaiting receipt/verification"
          onClick={() => setActiveTab(1)}
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
        <nav className="flex space-x-8 px-6 border-b border-gray-200 overflow-x-auto">
          {["Incoming Orders", "Material Receipts", "Active Orders", "Production Stages", "QR Code Scanner"].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
              {idx === 1 && (pendingDispatches.length + pendingReceipts.length + pendingVerifications.length) > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingDispatches.length + pendingReceipts.length + pendingVerifications.length}
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
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{order.product_name}</div>
                        {order.product_description && (
                          <div className="text-xs text-gray-500 mt-0.5">{order.product_description}</div>
                        )}
                        {!order.product_id && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 mt-1">
                            No Product Link
                          </span>
                        )}
                      </td>
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
                        <div className="flex items-center justify-center space-x-2">
                          {order.status === 'pending' ? (
                            <button
                              onClick={() => handleStartProduction(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
                              title="Approve order and prepare for MRN request"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve Order
                            </button>
                          ) : order.status === 'reviewed' ? (
                            <>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded border border-green-300">
                                <CheckCircle className="w-4 h-4" />
                                
                              </span>
                              <button
                                onClick={() => handleCreateMRN(order)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                                title="Create Material Request for this project"
                              >
                                <ArrowRight className="w-4 h-4" />
                                Create MRN
                              </button>
                            </>
                          ) : null}
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

        {/* Material Receipts Tab */}
        <div className={activeTab === 1 ? "block" : "hidden"}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Material Receipts</h3>
              <button
                onClick={fetchPendingMaterialReceipts}
                className="px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            {/* Pending Dispatches - Need to Receive */}
            {pendingDispatches.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-600" />
                  Materials Dispatched from Inventory ({pendingDispatches.length})
                </h4>
                <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispatch #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRN Request</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispatched By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispatched At</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingDispatches.map((dispatch) => (
                        <tr key={dispatch.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{dispatch.dispatch_number}</div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                              Awaiting Receipt
                            </span>
                          </td>
                          <td className="px-6 py-4">{dispatch.mrnRequest?.request_number || 'N/A'}</td>
                          <td className="px-6 py-4">{dispatch.project_name}</td>
                          <td className="px-6 py-4">{dispatch.total_items} items</td>
                          <td className="px-6 py-4">{dispatch.dispatcher?.name || 'N/A'}</td>
                          <td className="px-6 py-4">{new Date(dispatch.dispatched_at).toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => navigate(`/manufacturing/material-receipt/${dispatch.id}`)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Receive Materials
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pending Receipts - Need to Verify */}
            {pendingReceipts.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                  Materials Received - Awaiting Verification ({pendingReceipts.length})
                </h4>
                <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discrepancy</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received At</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingReceipts.map((receipt) => (
                        <tr key={receipt.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{receipt.receipt_number}</div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              Need Verification
                            </span>
                          </td>
                          <td className="px-6 py-4">{receipt.project_name}</td>
                          <td className="px-6 py-4">{receipt.total_items_received} items</td>
                          <td className="px-6 py-4">
                            {receipt.has_discrepancy ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">{receipt.receiver?.name || 'N/A'}</td>
                          <td className="px-6 py-4">{new Date(receipt.received_at).toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => navigate(`/manufacturing/stock-verification/${receipt.id}`)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md gap-2"
                            >
                              <CheckSquare className="w-4 h-4" />
                              Verify Stock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pending Verifications - Need Production Approval */}
            {pendingVerifications.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  Stock Verified - Awaiting Production Approval ({pendingVerifications.length})
                </h4>
                <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verification #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified At</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingVerifications.map((verification) => (
                        <tr key={verification.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{verification.verification_number}</div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                              Need Approval
                            </span>
                          </td>
                          <td className="px-6 py-4">{verification.project_name}</td>
                          <td className="px-6 py-4">
                            {verification.overall_result === 'passed' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">{verification.verifier?.name || 'N/A'}</td>
                          <td className="px-6 py-4">{new Date(verification.verified_at).toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => navigate(`/manufacturing/production-approval/${verification.id}`)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md gap-2"
                            >
                              <Send className="w-4 h-4" />
                              Approve Production
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {pendingDispatches.length === 0 && pendingReceipts.length === 0 && pendingVerifications.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Material Receipts</h3>
                <p className="text-gray-600">
                  All materials have been received, verified, and approved for production.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Active Orders Tab */}
        <div className={activeTab === 2 ? "block" : "hidden"}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Production Tracking - Active Orders</h3>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{activeOrders.length}</span> orders in production
              </div>
            </div>
            
            {activeOrders.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Production Orders</h4>
                <p className="text-gray-600 mb-4">There are currently no orders in production.</p>
                <button 
                  onClick={() => navigate('/manufacturing/wizard')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Production Order
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {/* Order Summary Row */}
                    <div className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Order Info */}
                        <div className="col-span-3">
                          <div className="font-semibold text-gray-900">{order.orderNo}</div>
                          <div className="text-sm text-blue-600 font-medium mt-1">{order.projectName}</div>
                          <div className="text-xs text-gray-500 mt-1">Customer: {order.customerName}</div>
                        </div>
                        
                        {/* Product & Quantity */}
                        <div className="col-span-2">
                          <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                          <div className="text-xs text-gray-600 mt-1">Qty: {order.quantity}</div>
                          {order.productCode && (
                            <div className="text-xs text-gray-500 mt-1">Code: {order.productCode}</div>
                          )}
                        </div>
                        
                        {/* Current Stage */}
                        <div className="col-span-2">
                          <div className="text-sm font-medium text-gray-900">{order.currentStage}</div>
                          <div className="text-xs text-gray-600 mt-1">Assigned: {order.assignedWorker}</div>
                        </div>
                        
                        {/* Progress */}
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${order.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-900 w-10">{order.progress}%</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {order.stages.filter(s => s.status === 'completed').length} / {order.stages.length} stages
                          </div>
                        </div>
                        
                        {/* Status & Date */}
                        <div className="col-span-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {order.status.replace("_", " ").toUpperCase()}
                          </span>
                          <div className="text-xs text-gray-600 mt-2">Due: {order.expectedCompletion}</div>
                        </div>
                        
                        {/* Actions */}
                        <div className="col-span-1 text-right">
                          <button
                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title={expandedOrderId === order.id ? "Collapse Details" : "Expand Details"}
                          >
                            <ArrowRight className={`w-5 h-5 transition-transform duration-200 ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Details - Stage Breakdown */}
                    {expandedOrderId === order.id && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Stage-by-Stage Tracking</h4>
                        
                        {/* Stages Table */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Stage</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Progress</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Quantities</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Start Time</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">End Time</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {order.stages.map((stage, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {getStageIcon(stage.status)}
                                      <span className="font-medium">{stage.name}</span>
                                      {stage.isPrinting && (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 font-medium flex items-center gap-1">
                                          <Paintbrush className="w-3 h-3" />
                                          Printing
                                        </span>
                                      )}
                                      {stage.isEmbroidery && (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-pink-100 text-pink-700 font-medium flex items-center gap-1">
                                          <Scissors className="w-3 h-3" />
                                          Embroidery
                                        </span>
                                      )}
                                      {stage.isOutsourced ? (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700 font-medium flex items-center gap-1">
                                          <Send className="w-3 h-3" />
                                          Outsourced
                                        </span>
                                      ) : (
                                        (stage.isPrinting || stage.isEmbroidery) && (
                                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                                            In-House
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageStatusColor(stage.status)}`}>
                                      {stage.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full ${
                                            stage.status === 'completed' ? 'bg-green-600' : 
                                            stage.status === 'in_progress' ? 'bg-blue-600' : 'bg-gray-400'
                                          }`}
                                          style={{ width: `${stage.progress}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-gray-600 w-8">{stage.progress}%</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-xs space-y-1">
                                      {stage.processedQty > 0 && (
                                        <div className="text-gray-700">Processed: <span className="font-medium">{stage.processedQty}</span></div>
                                      )}
                                      {stage.approvedQty > 0 && (
                                        <div className="text-green-700">Approved: <span className="font-medium">{stage.approvedQty}</span></div>
                                      )}
                                      {stage.rejectedQty > 0 && (
                                        <div className="text-red-700">Rejected: <span className="font-medium">{stage.rejectedQty}</span></div>
                                      )}
                                      {stage.processedQty === 0 && stage.approvedQty === 0 && stage.rejectedQty === 0 && (
                                        <div className="text-gray-500">-</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-xs text-gray-700">{stage.startTime || '-'}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-xs text-gray-700">{stage.endTime || '-'}</div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleStartOrder(order.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                              title="Start Production"
                            >
                              <Play className="w-4 h-4" />
                              Start
                            </button>
                            <button 
                              onClick={() => handlePauseOrder(order.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                              title="Pause Production"
                            >
                              <Pause className="w-4 h-4" />
                              Pause
                            </button>
                            <button 
                              onClick={() => handleStopOrder(order.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                              title="Stop Production"
                            >
                              <Square className="w-4 h-4" />
                              Stop
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEditOrder(order)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                              title="Edit Order"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleViewOrder(order)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button 
                              onClick={() => handleShowBarcode(order)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                              title="Show Barcode"
                            >
                              <QrCode className="w-4 h-4" />
                              Barcode
                            </button>
                            <button 
                              onClick={() => handleDeleteOrder(order.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        {/* Additional Notes */}
                        {order.stages.some(s => s.notes) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2">Stage Notes:</h5>
                            {order.stages.filter(s => s.notes).map((stage, idx) => (
                              <div key={idx} className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">{stage.name}:</span> {stage.notes}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Production Stages Tab - MOVED TO INDEX 3 */}
        {/* Production Stages Tab */}
        <div className={activeTab === 3 ? "block" : "hidden"}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Stages Overview (DUPLICATE - REMOVE)</h3>
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

        {/* QR Code Scanner Tab */}
        <div className={activeTab === 4 ? "block" : "hidden"}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">QR Code Scanner</h3>
              <div className="text-sm text-gray-600">
                Scan QR codes from production orders, challans, and materials
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
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">View Production Orders</span>
                  </button>
                  <button
                    onClick={() => navigate('/challans')}
                    className="flex items-center justify-center gap-2 w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Scan className="w-5 h-5 text-green-600" />
                    <span className="font-medium">View Challans</span>
                  </button>
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

      {/* Product Selection Dialog */}
      <div className={`fixed inset-0 z-50 ${productSelectionDialogOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
          setProductSelectionDialogOpen(false);
          setPendingProductionOrder(null);
          setSelectedProductForProduction(null);
        }}></div>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Product for Production
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                The order "{pendingProductionOrder?.product_name}" doesn't have a valid product ID. 
                Please select the correct product to start production.
              </p>
            </div>
            <div className="px-6 py-6 overflow-y-auto flex-1">
              {pendingProductionOrder && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Order Details:</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Product Name:</strong> {pendingProductionOrder.product_name}</p>
                    <p><strong>Description:</strong> {pendingProductionOrder.product_description}</p>
                    <p><strong>Quantity:</strong> {pendingProductionOrder.quantity} {pendingProductionOrder.unit}</p>
                    <p><strong>Customer:</strong> {pendingProductionOrder.customer?.name}</p>
                    {pendingProductionOrder.project_name && (
                      <p><strong>Project:</strong> {pendingProductionOrder.project_name}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product:
                </label>
                {availableProducts.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                      <Package className="w-16 h-16 mx-auto mb-3 text-yellow-500" />
                      <p className="text-lg font-semibold text-gray-900 mb-2">No Products Found</p>
                      <p className="text-sm text-gray-600 mb-4">
                        You need to create a product before starting production.<br/>
                        The product should match: <strong>{pendingProductionOrder?.product_name}</strong>
                      </p>
                      <button
                        onClick={() => {
                          setProductSelectionDialogOpen(false);
                          navigate('/inventory/products/create', { 
                            state: { 
                              suggestedName: pendingProductionOrder?.product_name,
                              returnTo: '/manufacturing'
                            } 
                          });
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Create Product Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {availableProducts.map((product) => {
                      // Highlight products that match the order's product name
                      const isRecommended = pendingProductionOrder?.product_name && 
                        product.name.toLowerCase().includes(pendingProductionOrder.product_name.toLowerCase());
                      
                      return (
                        <div
                          key={product.id}
                          onClick={() => setSelectedProductForProduction(product.id)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedProductForProduction === product.id
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : isRecommended
                              ? 'border-green-300 bg-green-50 hover:border-green-400'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                {isRecommended && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              {product.description && (
                                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                              )}
                              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                {product.product_code && (
                                  <span><strong>Code:</strong> {product.product_code}</span>
                                )}
                                {product.category && (
                                  <span><strong>Category:</strong> {product.category}</span>
                                )}
                                {product.unit_of_measurement && (
                                  <span><strong>Unit:</strong> {product.unit_of_measurement}</span>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              {selectedProductForProduction === product.id && (
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center gap-3 bg-gray-50">
              {availableProducts.length > 0 && (
                <button
                  onClick={() => {
                    setProductSelectionDialogOpen(false);
                    navigate('/inventory/products/create', { 
                      state: { 
                        suggestedName: pendingProductionOrder?.product_name,
                        returnTo: '/manufacturing'
                      } 
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Product
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => {
                    setProductSelectionDialogOpen(false);
                    setPendingProductionOrder(null);
                    setSelectedProductForProduction(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmProductSelection}
                  disabled={!selectedProductForProduction}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedProductForProduction
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Start Production
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tracking Dialog */}
      <ProductTrackingDialog />

      {/* Barcode Scanner */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Scan or Enter Barcode
              </h3>
              <button
                onClick={() => {
                  setIsScanning(false);
                  setManualBarcode('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Manual Barcode Input Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Barcode Manually
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && manualBarcode.trim()) {
                      handleScanSuccess(manualBarcode.trim());
                      setManualBarcode('');
                    }
                  }}
                  placeholder="Type barcode number..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (manualBarcode.trim()) {
                      handleScanSuccess(manualBarcode.trim());
                      setManualBarcode('');
                    } else {
                      toast.error('Please enter a barcode');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
                >
                  Check
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter or click Check to lookup the barcode
              </p>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Camera Scanner Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scan with Camera
              </label>
              <BarcodeScanner
                onScanSuccess={(barcode) => {
                  handleScanSuccess(barcode);
                  setManualBarcode('');
                }}
                onScanError={handleScanError}
                isScanning={isScanning}
                setIsScanning={setIsScanning}
              />
            </div>

            <button
              onClick={() => {
                setIsScanning(false);
                setManualBarcode('');
              }}
              className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  
  );
};

export default ManufacturingDashboard;
