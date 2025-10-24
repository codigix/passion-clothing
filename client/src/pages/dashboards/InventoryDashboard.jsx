import React, { useState, useEffect } from 'react';
import { FaBoxOpen, FaPlus, FaSearch, FaExclamationTriangle, FaEye, FaEdit, FaQrcode, FaDownload, FaArrowDown, FaTags, FaWarehouse, FaTruck, FaShoppingCart, FaCheckCircle, FaIndustry, FaClipboardCheck } from 'react-icons/fa';
import { Package, AlertTriangle, ArrowDownCircle, Warehouse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import MinimalStatCard from '../../components/common/MinimalStatCard';
import '../../styles/compactDashboard.css';

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    outOfStock: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [mrnRequests, setMrnRequests] = useState([]);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stockReceiptDialogOpen, setStockReceiptDialogOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchIncomingOrders();
  }, []);

  const fetchIncomingOrders = async () => {
    try {
      // Fetch GRN requests (approved POs waiting for GRN creation)
      const grnResponse = await api.get('/inventory/grn-requests');
      setIncomingOrders(grnResponse.data.requests || []);

      // Fetch MRN requests (Material Request Notes from manufacturing)
      const mrnResponse = await api.get('/project-material-requests?status=pending_inventory_review&limit=50');
      setMrnRequests(mrnResponse.data.requests || []);
    } catch (error) {
      console.error('Error fetching incoming orders:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsRes = await api.get('/inventory/stats');
      setStats(statsRes.data);

      // Fetch low stock items
      const lowStockRes = await api.get('/inventory/alerts/low-stock');
      setLowStockItems(lowStockRes.data.lowStockItems.slice(0, 3)); // Show top 3

      // Fetch recent movements
      const movementsRes = await api.get('/inventory/movements/recent');
      setRecentMovements(movementsRes.data.movements);

      // Fetch categories
      const categoriesRes = await api.get('/inventory/categories');
      setCategories(categoriesRes.data.categories);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // If it looks like a barcode (numeric), go to barcode lookup
      if (/^\d+$/.test(searchQuery.trim())) {
        navigate(`/inventory/barcode-lookup?barcode=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        // Otherwise, go to products page with search
        navigate(`/inventory/products?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  // Workflow functions
  const handleShowQrCode = (order) => {
    setSelectedOrder(order);
    setQrCodeDialogOpen(true);
  };

  const handleScanQrCode = () => {
    setQrScannerOpen(true);
  };

  const handleQrScanSuccess = async (decodedText) => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText);
      if (qrData.orderId) {
        // Find the order in incoming orders
        const order = incomingOrders.find(o => o.id === qrData.orderId);
        if (order) {
          setSelectedOrder(order);
          setQrScannerOpen(false);
          toast.success(`Order ${order.order_number} scanned successfully`);
        } else {
          toast.error('Order not found in incoming orders');
        }
      }
    } catch (error) {
      toast.error('Invalid QR code data');
    }
  };

  const handleReceiveStock = (order) => {
    setSelectedOrder(order);
    setStockReceiptDialogOpen(true);
  };

  const handleConfirmStockReceipt = async () => {
    if (!selectedOrder) return;

    try {
      // Update order status to inventory_received
      await api.put(`/orders/${selectedOrder.id}/status`, {
        status: 'inventory_received',
        department: 'inventory',
        action: 'stock_received',
        notes: 'Stock received and stored in inventory'
      });

      // Update QR code with inventory details
      await api.put(`/orders/${selectedOrder.id}/qr-code`, {
        department: 'inventory',
        status: 'inventory_received',
        timestamp: new Date().toISOString(),
        materials: selectedOrder.material_requirements,
        customer: selectedOrder.customer
      });

      toast.success('Stock received successfully');
      setStockReceiptDialogOpen(false);
      setSelectedOrder(null);
      fetchIncomingOrders();
    } catch (error) {
      toast.error('Failed to receive stock');
    }
  };

  const handleSendToManufacturing = async (order) => {
    try {
      // Update order status to manufacturing
      await api.put(`/orders/${order.id}/status`, {
        status: 'manufacturing',
        department: 'manufacturing',
        action: 'sent_to_manufacturing',
        notes: 'Order sent to manufacturing department'
      });

      // Update QR code
      await api.put(`/orders/${order.id}/qr-code`, {
        department: 'manufacturing',
        status: 'ready_for_production',
        timestamp: new Date().toISOString(),
        materials: order.material_requirements,
        customer: order.customer
      });

      toast.success('Order sent to manufacturing');
      fetchIncomingOrders();
    } catch (error) {
      toast.error('Failed to send order to manufacturing');
    }
  };



  const getStockLevel = (current, min) => {
    const percentage = (current / min) * 100;
    if (percentage <= 25) return { level: 'critical', color: 'bg-red-200 text-red-700' };
    if (percentage <= 50) return { level: 'low', color: 'bg-yellow-200 text-yellow-700' };
    if (percentage <= 75) return { level: 'medium', color: 'bg-blue-200 text-blue-700' };
    return { level: 'good', color: 'bg-green-200 text-green-700' };
  };

  const getMovementColor = (type) => {
    return type === 'inward' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
  };

  const TabPanel = ({ children, value, index }) => (
    <div className={value !== index ? 'hidden' : ''}>
      {value === index && <div className="p-4">{children}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading inventory dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100 flex items-center gap-1.5" onClick={() => navigate('/inventory/stock')}><FaQrcode /> Stock Management</button>
          <button className="px-4 py-1 text-sm font-medium text-white bg-primary border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-primary hover:text-primary  hover:bg-transparent flex gap-2 items-center" onClick={() => navigate('/inventory/products')}><FaPlus /> Add Product</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MinimalStatCard title="Total Items" value={stats.totalItems} icon={Package} />
        <MinimalStatCard title="Low Stock Items" value={stats.lowStockItems} icon={AlertTriangle} />
        <MinimalStatCard title="Out of Stock" value={stats.outOfStock} icon={ArrowDownCircle} />
        <MinimalStatCard title="Total Value" value={`₹${(stats.totalValue / 100000).toFixed(1)}L`} icon={Warehouse} subtitle="Current inventory value" />
      </div>

      {/* Low Stock Alert */}
      {(stats.lowStockItems > 0 || stats.outOfStock > 0) && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 flex justify-between items-center">
          <span>{stats.lowStockItems} items are running low on stock. {stats.outOfStock} items are out of stock.</span>
          <button className="px-3 py-1 rounded bg-yellow-600 text-white text-sm font-semibold hover:bg-yellow-600" onClick={() => setTabValue(1)}>View Details</button>
        </div>
      )}

      {/* Search and Quick Actions */}
      <div className="compact-card mb-4">
        <div>
          <div className="compact-section-title mb-3">Quick Actions</div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
            <div className="col-span-2">
              <div className="relative">
                <input 
                  className="w-full border rounded px-3 py-2 pl-9 bg-gray-50" 
                  placeholder="Search by item code, name, or barcode..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <FaSearch className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </div>
            <button className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100" onClick={() => navigate('/inventory/stock')}>Stock Management</button>
            <button className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100" onClick={() => navigate('/inventory/alerts')}>Stock Alerts</button>
            <button className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-blue-600 hover:bg-gray-100 flex items-center gap-1.5" onClick={() => navigate('/inventory/lifecycle')}>
              <FaQrcode /> Lifecycle Tracking
            </button>
            <button
              className="px-4 py-1 text-sm font-medium text-white bg-green-500 border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-green-600 hover:text-success hover:bg-transparent flex gap-2 items-center w-fit"
              onClick={() => navigate('/inventory/reports')}
            >
              <FaDownload /> Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Tabs for different views */}
      <div className="bg-white rounded shadow border border-gray-200">
        <div className="border-b bg-gray-50">
          <div className="compact-tabs">
            {['Incoming Orders', 'Recent Movements', 'Low Stock Items', 'Categories'].map((tab, idx) => (
              <button
                key={tab}
                className={`compact-tab ${tabValue === idx ? 'compact-tab-active' : ''}`}
                onClick={() => setTabValue(idx)}
              >
                {tab}
                {idx === 0 && (incomingOrders.length + mrnRequests.length) > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {incomingOrders.length + mrnRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <TabPanel value={tabValue} index={0}>
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="compact-section-title">GRN Requests - Purchase Orders Awaiting Receipt</div>
              <div className="flex gap-2">
                <button
                  className="compact-btn compact-btn-primary"
                  onClick={() => navigate('/inventory/grn')}
                >
                  <FaCheckCircle /> View All GRNs
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Vendor</th>
                    <th>PO Date</th>
                    <th>Expected Delivery</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Requested By</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomingOrders.map((request) => (
                    <tr key={request.id}>
                      <td className="font-semibold text-gray-900">{request.po_number}</td>
                      <td>{request.vendor_name}</td>
                      <td>{request.po_date ? new Date(request.po_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{request.expected_delivery_date ? new Date(request.expected_delivery_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="text-center">{request.items_count || 0}</td>
                      <td>₹{request.total_amount?.toLocaleString() || '0'}</td>
                      <td className="text-[10px] text-gray-600">{request.requested_by || 'N/A'}</td>
                      <td className="text-center">
                        <button
                          className="compact-btn compact-btn-sm compact-btn-success mr-1"
                          onClick={() => navigate(`/inventory/grn/create?po_id=${request.po_id}`)}
                          title="Create GRN"
                        >
                          Create GRN
                        </button>
                        <button
                          className="compact-btn compact-btn-sm compact-btn-primary"
                          onClick={() => navigate(`/procurement/purchase-orders/${request.po_id}`)}
                          title="View PO Details"
                        >
                          View PO
                        </button>
                      </td>
                    </tr>
                  ))}
                  {incomingOrders.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        No GRN requests pending. All purchase orders have been processed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MRN Requests - Material Release from Manufacturing */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <div className="compact-section-title flex items-center gap-1.5">
                  <FaIndustry className="text-blue-600" />
                  MRN Requests - Material Release for Projects
                </div>
                <button
                  className="compact-btn compact-btn-primary"
                  onClick={() => navigate('/inventory/mrn-requests')}
                >
                  <FaClipboardCheck />
                  View All MRN Requests
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>MRN Number</th>
                      <th>Project Name</th>
                      <th>Department</th>
                      <th>Request Date</th>
                      <th>Required By</th>
                      <th>Items</th>
                      <th>Priority</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mrnRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="font-semibold text-gray-900">{request.request_number}</td>
                        <td>{request.project_name}</td>
                        <td>
                          <span className="compact-badge compact-badge-blue">
                            {request.requesting_department?.toUpperCase() || 'MANUFACTURING'}
                          </span>
                        </td>
                        <td>{request.request_date ? new Date(request.request_date).toLocaleDateString() : 'N/A'}</td>
                        <td>{request.required_by_date ? new Date(request.required_by_date).toLocaleDateString() : 'N/A'}</td>
                        <td className="text-center">{request.total_items || 0}</td>
                        <td>
                          <span className={`compact-badge ${
                            request.priority === 'urgent' ? 'compact-badge-red' :
                            request.priority === 'high' ? 'compact-badge-orange' :
                            request.priority === 'medium' ? 'compact-badge-yellow' :
                            'compact-badge-green'
                          }`}>
                            {request.priority?.toUpperCase() || 'MEDIUM'}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="compact-btn compact-btn-sm compact-btn-primary mr-1"
                            onClick={() => navigate(`/inventory/mrn/${request.id}`)}
                            title="Review Material Request"
                          >
                            <FaClipboardCheck />
                            Review
                          </button>
                          <button
                            className="compact-btn compact-btn-sm compact-btn-success"
                            onClick={() => navigate(`/inventory/dispatch/${request.id}`)}
                            title="Accept & Dispatch Materials"
                          >
                            <FaTruck />
                            Dispatch
                          </button>
                        </td>
                      </tr>
                    ))}
                    {mrnRequests.length === 0 && (
                      <tr>
                        <td colSpan="8" className="p-6 text-center text-gray-500 text-xs">
                          No MRN requests pending. All material requests have been processed.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="compact-section-title">Recent Stock Movements</div>
              <button className="compact-btn compact-btn-secondary" onClick={() => navigate('/challans/register')}>View All Movements</button>
            </div>
            <div className="overflow-x-auto">
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Type</th>
                    <th className="text-right">Quantity</th>
                    <th>Challan No.</th>
                    <th>Reference</th>
                    <th>Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="font-semibold text-gray-900">{movement.itemCode}</td>
                      <td>{movement.itemName}</td>
                      <td>
                        <span className={`compact-badge inline-flex items-center gap-1 ${getMovementColor(movement.type)}`}>
                          {movement.type === 'inward' ? <FaTruck /> : <FaArrowDown />} {movement.type?.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right">{movement.quantity} {movement.unit}</td>
                      <td>{movement.location}</td>
                      <td>-</td>
                      <td>{new Date(movement.date).toLocaleDateString()}</td>
                      <td className="text-center">
                        <button
                          className="compact-icon-btn compact-icon-btn-primary"
                          onClick={() => navigate('/inventory/stock')}
                          title="View Stock"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="compact-section-title">Low Stock Items</div>
              <button className="compact-btn compact-btn-primary" onClick={() => navigate('/procurement/purchase-orders')}>Create Purchase Order</button>
            </div>
            <div className="overflow-x-auto">
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th className="text-right">Current Stock</th>
                    <th className="text-right">Min Stock</th>
                    <th>Stock Level</th>
                    <th>Location</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => {
                    const minStock = item.minimum_level || item.reorder_level || 0;
                    const stockInfo = getStockLevel(item.current_stock, minStock);
                    const percentage = minStock > 0 ? (item.current_stock / minStock) * 100 : 0;
                    return (
                      <tr key={item.id}>
                        <td className="font-semibold text-gray-900">{item.product?.product_code}</td>
                        <td>{item.product?.name}</td>
                        <td><span className="compact-badge compact-badge-gray">{item.product?.category}</span></td>
                        <td className="text-right">{item.current_stock} {item.product?.unit_of_measurement}</td>
                        <td className="text-right">{minStock} {item.product?.unit_of_measurement}</td>
                        <td>
                          <div className={`flex items-center gap-1.5 ${stockInfo.color}`}>
                            <div className="w-16 h-2 bg-gray-200 rounded">
                              <div className={`h-2 rounded ${stockInfo.color}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                            </div>
                            <span className="text-[10px] font-semibold">{percentage.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td>{item.location}</td>
                        <td className="text-center">
                          <button
                            className="compact-icon-btn compact-icon-btn-primary mr-1"
                            onClick={() => navigate('/inventory/products')}
                            title="Edit Item"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="compact-icon-btn compact-icon-btn-secondary"
                            onClick={() => navigate('/procurement/purchase-orders')}
                            title="Create Purchase Order"
                          >
                            <FaPlus />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <div>
            <div className="compact-section-title mb-3">Inventory Categories</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.length > 0 ? categories.map((category) => (
                <div
                  key={category.category}
                  className="border rounded bg-white shadow p-3 text-center cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/inventory/products')}
                >
                  <FaTags className="text-blue-600 text-2xl mx-auto mb-2" />
                  <div className="font-semibold text-sm text-gray-900 mb-1">{category.category}</div>
                  <div className="text-xs text-gray-600 mb-1">{category.itemCount} items</div>
                  <div className="text-[10px] text-gray-500">₹{(category.totalValue / 100000).toFixed(1)}L value</div>
                </div>
              )) : (
                <div className="col-span-full text-center text-gray-500 py-6 text-xs">
                  No categories found. Add products to see categories here.
                </div>
              )}
            </div>
          </div>
        </TabPanel>
      </div>

      {/* QR Code Dialog */}
      {qrCodeDialogOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b font-bold text-lg">Order QR Code</div>
            <div className="px-6 py-4 text-center">
              <div className="bg-gray-100 p-4 rounded inline-block">
                {/* QR Code would be generated here */}
                <div className="w-48 h-48 bg-gray-300 flex items-center justify-center text-gray-600">
                  QR Code for Order {selectedOrder.order_number}
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Order:</strong> {selectedOrder.order_number}</p>
                <p><strong>Customer:</strong> {selectedOrder.customer?.name}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setQrCodeDialogOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Receipt Confirmation Dialog */}
      {stockReceiptDialogOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b font-bold text-lg">Confirm Stock Receipt</div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <h3 className="font-semibold">Order Details</h3>
                <p><strong>Order:</strong> {selectedOrder.order_number}</p>
                <p><strong>Customer:</strong> {selectedOrder.customer?.name}</p>
                <p><strong>Product:</strong> {selectedOrder.garment_specs?.product_type}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Material Requirements</h3>
                <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                  {selectedOrder.material_requirements?.map((mat, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{mat.item}</span>
                      <span>{mat.quantity} {mat.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>By confirming, you acknowledge that all materials have been received and stored in inventory.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setStockReceiptDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-500"
                onClick={handleConfirmStockReceipt}
              >
                Confirm Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Dialog */}
      {qrScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b font-bold text-lg">Scan QR Code</div>
            <div className="px-6 py-4 text-center">
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="w-full h-64 bg-gray-300 flex items-center justify-center text-gray-600 mb-4">
                  Camera Scanner Placeholder
                </div>
                <p className="text-sm text-gray-600">Point your camera at the QR code to scan</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setQrScannerOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;