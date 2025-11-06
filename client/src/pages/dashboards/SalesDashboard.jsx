import React, { useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaMoneyBill,
  FaUser,
  FaClipboardList,
  FaDownload,
  FaSpinner,
  FaExclamationTriangle,
  FaFilter,
  FaCalendarAlt,
  FaFileExport,
  FaQrcode,
  FaPaperPlane,
  FaEllipsisV,
  FaStar,
  FaTh,
  FaColumns,
} from "react-icons/fa";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Target,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import QRCodeDisplay from "../../components/QRCodeDisplay";
import MinimalStatCard from "../../components/common/MinimalStatCard";
import Tooltip from "../../components/common/Tooltip";
import ProcessTracker from "../../components/common/ProcessTracker";
import RecentActivities from "../../components/common/RecentActivities";
import "../../styles/compactDashboard.css";

const SalesDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProcurement, setFilterProcurement] = useState("all");
  const [filterProduction, setFilterProduction] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [salesOrders, setSalesOrders] = useState([]);
  const [salesPipeline, setSalesPipeline] = useState([]);
  const [customerStats, setCustomerStats] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);

  // Define available columns for the sales orders table
  const AVAILABLE_COLUMNS = [
    { id: "project_name", label: "Project Name", defaultVisible: true, fixed: true },
    { id: "customer", label: "Customer", defaultVisible: true, fixed: false },
    { id: "products", label: "Products", defaultVisible: true, fixed: false },
    { id: "quantity", label: "Qty", defaultVisible: false, fixed: false },
    { id: "amount", label: "Amount", defaultVisible: true, fixed: false },
    { id: "advance_paid", label: "Advance Paid", defaultVisible: false, fixed: false },
    { id: "balance", label: "Balance", defaultVisible: false, fixed: false },
    { id: "procurement_status", label: "📋 Procurement", defaultVisible: true, fixed: false },
    { id: "production_status", label: "🏭 Production", defaultVisible: true, fixed: false },
    { id: "status", label: "Status", defaultVisible: true, fixed: false },
    { id: "progress", label: "Progress", defaultVisible: false, fixed: false },
    { id: "delivery_date", label: "Delivery", defaultVisible: true, fixed: false },
    { id: "created_by", label: "Created By", defaultVisible: false, fixed: false },
    { id: "order_date", label: "Order Date", defaultVisible: false, fixed: false },
    { id: "rate_per_piece", label: "Rate/Piece", defaultVisible: false, fixed: false },
    { id: "actions", label: "Actions", defaultVisible: true, fixed: true },
  ];

  // Initialize visible columns from localStorage
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const stored = localStorage.getItem("salesDashboardVisibleColumns");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error parsing stored columns:", e);
    }
    return AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
  });

  // Save visible columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("salesDashboardVisibleColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Toggle column visibility
  const handleToggleColumn = (columnId) => {
    const column = AVAILABLE_COLUMNS.find(col => col.id === columnId);
    if (column && column.fixed) return; // Don't toggle fixed columns
    
    setVisibleColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  // Show all columns
  const handleShowAllColumns = () => {
    setVisibleColumns(AVAILABLE_COLUMNS.map(col => col.id));
  };

  // Reset to default columns
  const handleResetColumns = () => {
    setVisibleColumns(AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id));
  };

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (columnMenuOpen && !event.target.closest('.column-menu-container')) {
        setColumnMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && columnMenuOpen) {
        setColumnMenuOpen(false);
      }
    };

    if (columnMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [columnMenuOpen]);

  // Fetch dashboard data function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsResponse = await api.get("/sales/dashboard/stats");
      setStats(statsResponse.data);

      // Fetch sales orders
      const ordersResponse = await api.get("/sales/orders?page=1&limit=20");
      setSalesOrders(ordersResponse.data.orders);

      // Fetch sales pipeline
      const pipelineResponse = await api.get("/sales/pipeline");
      setSalesPipeline(pipelineResponse.data.pipeline);
    } catch (err) {
      console.error("Error fetching sales dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle export orders
  const handleExportOrders = async () => {
    try {
      setExporting(true);

      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterProcurement !== "all") params.append("procurement", filterProcurement);
      if (filterProduction !== "all") params.append("production", filterProduction);
      if (dateFilter.from) params.append("date_from", dateFilter.from);
      if (dateFilter.to) params.append("date_to", dateFilter.to);

      const response = await api.get(`/sales/export?${params}`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "sales_orders.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Orders exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export orders");
    } finally {
      setExporting(false);
    }
  };

  // Handle view order details
  const handleViewOrder = (orderId) => {
    navigate(`/sales/orders/${orderId}`);
  };

  // Handle edit order
  const handleEditOrder = (orderId) => {
    navigate(`/sales/orders/edit/${orderId}`);
  };

  // Handle show QR code
  const handleShowQrCode = (order) => {
    setSelectedOrder(order);
    setQrDialogOpen(true);
  };

  // Handle send to procurement
  const handleSendToProcurement = async (order) => {
    if (
      window.confirm(
        `Are you sure you want to send order ${order.order_number} to procurement?\n\nThe order will remain in 'draft' status until procurement confirms it.`
      )
    ) {
      try {
        // Use dedicated send-to-procurement endpoint
        const response = await api.put(
          `/sales/orders/${order.id}/send-to-procurement`
        );

        toast.success(
          response.data.message ||
            "Order sent to procurement successfully. Awaiting procurement confirmation."
        );
        // Refresh data
        fetchDashboardData();
      } catch (error) {
        console.error("Error sending to procurement:", error);

        // Show specific error message
        const errorMessage =
          error.response?.data?.message ||
          "Failed to send order to procurement";
        const currentStatus = error.response?.data?.currentStatus;

        if (currentStatus) {
          toast.error(`${errorMessage}. Current status: ${currentStatus}`);
        } else {
          toast.error(errorMessage);
        }
      }
    }
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    // This would filter the orders locally or make a new API call
    // For now, we'll implement basic client-side filtering
    if (searchTerm) {
      // Filter logic would go here
      console.log("Searching for:", searchTerm);
    }
  };

  // Get status color for badges
  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-100 text-slate-700 border border-slate-300",
      pending_approval: "bg-amber-100 text-amber-700 border border-amber-300",
      confirmed: "bg-blue-100 text-blue-700 border border-blue-300",
      in_production: "bg-indigo-100 text-indigo-700 border border-indigo-300",
      ready_to_ship: "bg-cyan-100 text-cyan-700 border border-cyan-300",
      shipped: "bg-blue-100 text-blue-700 border border-blue-300",
      delivered: "bg-green-100 text-green-700 border border-green-300",
      completed: "bg-emerald-100 text-emerald-700 border border-emerald-300",
      cancelled: "bg-red-100 text-red-700 border border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border border-gray-300";
  };

  // Get status gradient bg for cards
  const getStatusGradient = (status) => {
    const gradients = {
      draft: "from-slate-50 to-slate-100",
      pending_approval: "from-amber-50 to-amber-100",
      confirmed: "from-blue-50 to-blue-100",
      in_production: "from-indigo-50 to-indigo-100",
      ready_to_ship: "from-cyan-50 to-cyan-100",
      shipped: "from-blue-50 to-blue-100",
      delivered: "from-green-50 to-green-100",
      completed: "from-emerald-50 to-emerald-100",
      cancelled: "from-red-50 to-red-100",
    };
    return gradients[status] || "from-gray-50 to-gray-100";
  };

  // Calculate progress based on status
  const getOrderProgress = (status) => {
    const progressMap = {
      draft: 10,
      pending_approval: 25,
      confirmed: 40,
      in_production: 65,
      ready_to_ship: 85,
      shipped: 90,
      delivered: 95,
      completed: 100,
      cancelled: 0,
    };
    return progressMap[status] || 0;
  };

  // Get trend indicator
  const getTrendIndicator = (current, previous) => {
    if (!previous) return { text: "New", color: "text-green-600", icon: "📈" };
    const percentage = (((current - previous) / previous) * 100).toFixed(1);
    if (percentage > 0)
      return { text: `+${percentage}%`, color: "text-green-600", icon: "📈" };
    if (percentage < 0)
      return { text: `${percentage}%`, color: "text-red-600", icon: "📉" };
    return { text: "0%", color: "text-gray-600", icon: "➡️" };
  };

  const TabPanel = ({ children, value, index }) => (
    <div className={value !== index ? "hidden" : ""}>
      {value === index && <div>{children}</div>}
    </div>
  );

  // Filter orders based on multiple criteria (status, procurement, production)
  const filteredOrders = salesOrders.filter((order) => {
    // Base status filter
    if (filterStatus !== "all" && order.status !== filterStatus) return false;

    // Procurement stage filter
    if (filterProcurement !== "all") {
      if (filterProcurement === "under_po" && !order.purchase_order_id) return false;
      if (filterProcurement === "no_po" && order.purchase_order_id) return false;
    }

    // Production stage filter
    if (filterProduction !== "all") {
      if (filterProduction === "in_production" && order.status !== "in_production") return false;
      if (filterProduction === "production_pending" && order.status !== "confirmed") return false;
      if (filterProduction === "ready_to_ship" && order.status !== "ready_to_ship") return false;
    }

    return true;
  });

  // Loading component
  if (loading) {
    return (
      <div className="p-3">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-3" />
            <p className="text-gray-600 font-normal text-sm">
              Loading sales dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className="p-3">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center max-w-sm">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
            <p className="text-red-600 mb-3 font-normal text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Header with Sophisticated Design */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 text-white px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">Sales Dashboard</h1>
            </div>
            <p className="text-blue-200 text-xs font-normal ml-13">
              Performance • Orders • Revenue
            </p>
          </div>
          <button
            className="px-3.5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-xs sm:text-sm flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 flex-shrink-0"
            onClick={() => navigate("/sales/orders/create")}
          >
            <FaPlus size={14} />
            <span className="hidden sm:inline">New Order</span>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 max-w-7xl mx-auto w-full">
        {/* Real-Time Process Tracker Section */}
        <div className="mb-6">
          <RecentActivities autoRefreshInterval={30000} />
        </div>

        {/* Modern Search and Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
            {/* Search Box */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-3 text-slate-400"
                  size={13}
                />
                <input
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-slate-400"
                  placeholder="Search order #, customer..."
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Order Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Order Status</label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="draft">📝 Draft</option>
                <option value="pending_approval">⏳ Pending Approval</option>
                <option value="confirmed">✅ Confirmed</option>
                <option value="in_production">🏭 In Production</option>
                <option value="ready_to_ship">📦 Ready to Ship</option>
                <option value="shipped">🚚 Shipped</option>
                <option value="delivered">✔️ Delivered</option>
                <option value="completed">🎯 Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>

            {/* Procurement Stage Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Procurement</label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                value={filterProcurement}
                onChange={(e) => setFilterProcurement(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="under_po">🔗 Under PO</option>
                <option value="no_po">❌ No PO Yet</option>
              </select>
            </div>

            {/* Production Stage Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Production</label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                value={filterProduction}
                onChange={(e) => setFilterProduction(e.target.value)}
              >
                <option value="all">All Stages</option>
                <option value="production_pending">⏱️ Pending Production</option>
                <option value="in_production">🏭 In Production</option>
                <option value="ready_to_ship">📦 Ready to Ship</option>
              </select>
            </div>
          </div>

          {/* Second Row: Action Buttons */}
          <div className="flex gap-2 flex-wrap relative items-center">
            <button
              className="px-4 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium flex items-center justify-center gap-2 whitespace-nowrap"
              onClick={() => navigate("/sales/reports")}
              title="View detailed reports"
            >
              <FaChartLine size={13} />
              <span className="hidden sm:inline">Reports</span>
            </button>
            
            {/* Column Visibility Toggle - More Prominent */}
            

            <button
              className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:shadow-md transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              onClick={handleExportOrders}
              disabled={exporting}
              title="Export orders to CSV"
            >
              {exporting ? (
                <FaSpinner className="animate-spin" size={13} />
              ) : (
                <FaFileExport size={13} />
              )}
              <span className="hidden sm:inline">
                {exporting ? "Exporting..." : "Export"}
              </span>
            </button>

            {/* Active Filters Display */}
            {(filterStatus !== "all" || filterProcurement !== "all" || filterProduction !== "all") && (
              <div className="ml-auto flex items-center gap-2 text-xs text-slate-600">
                <FaFilter size={12} className="text-blue-600" />
                <span className="font-medium">
                  Filters active: {[
                    filterStatus !== "all" ? "1 Status" : "",
                    filterProcurement !== "all" ? "1 Procurement" : "",
                    filterProduction !== "all" ? "1 Production" : ""
                  ].filter(Boolean).join(", ")}
                </span>
                <button
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterProcurement("all");
                    setFilterProduction("all");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modern Tabs Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
            <div className="flex gap-1">
              {[
                { label: "Orders", icon: FaClipboardList },
                { label: "Pipeline", icon: TrendingUp },
                { label: "Customers", icon: FaUser },
              ].map((tab, idx) => (
                <button
                  key={tab.label}
                  className={`py-3 px-4 font-medium text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    tabValue === idx
                      ? "border-blue-600 text-blue-700 bg-blue-50"
                      : "border-transparent text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                  }`}
                  onClick={() => setTabValue(idx)}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <div className="p-4 sm:p-6">
              {/* Orders Header with View Mode Toggle */}
              <div className="flex justify-between items-center mb-5 gap-3">
                <div>
                  <h3 className="font-semibold text-base text-slate-800">
                    Sales Orders
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">
                    {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-1 bg-slate-100 p-1.5 rounded-lg flex-shrink-0">
                  <button
                    className={`px-3 py-2 rounded transition-all ${
                      viewMode === "table"
                        ? "bg-white text-blue-700 shadow-sm border border-slate-300"
                        : "text-slate-600 hover:text-blue-700"
                    }`}
                    onClick={() => setViewMode("table")}
                    title="Table view"
                  >
                    <FaClipboardList size={13} />
                  </button>
                  <button
                    className={`px-3 py-2 rounded transition-all ${
                      viewMode === "cards"
                        ? "bg-white text-blue-700 shadow-sm border border-slate-300"
                        : "text-slate-600 hover:text-blue-700"
                    }`}
                    onClick={() => setViewMode("cards")}
                    title="Card view"
                  >
                    <FaTh size={13} />
                  </button>
                  <div className="relative column-menu-container">
              <button
                className={`px-3 py-2 text-sm border  transition-all font-medium flex items-center justify-center gap-2 relative whitespace-nowrap ${
                  columnMenuOpen 
                    ? "bg-blue-100 border-blue-300 text-blue-600" 
                    : "border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400"
                }`}
                onClick={() => setColumnMenuOpen(!columnMenuOpen)}
                title="Customize table columns"
                id="columnMenuButton"
              >
                <FaColumns size={13} />
                
                {/* Indicator dot if columns are customized */}
                {visibleColumns.length !== AVAILABLE_COLUMNS.filter(col => col.defaultVisible).length && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Column Menu Dropdown */}
              {columnMenuOpen && (
                <div 
                  className="absolute right-0 mt-1 w-56 sm:w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-96 overflow-y-auto top-full"
                  id="columnMenuDropdown"
                >
                  {/* Header with Quick Actions */}
                  <div className="sticky top-0 bg-white border-b border-slate-200 p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Visible Columns</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleShowAllColumns}
                        className="flex-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      >
                        Show All
                      </button>
                      <button
                        onClick={handleResetColumns}
                        className="flex-1 px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Column List */}
                  <div className="p-2 space-y-1">
                    {AVAILABLE_COLUMNS.map(column => (
                      <label
                        key={column.id}
                        className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(column.id)}
                          onChange={() => handleToggleColumn(column.id)}
                          disabled={column.fixed}
                          className="w-4 h-4 rounded border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`text-xs font-normal ${column.fixed ? 'text-slate-400' : 'text-slate-700 group-hover:text-slate-900'} flex-1`}>
                          {column.label}
                        </span>
                        {column.fixed && (
                          <span className="text-xs text-slate-400 font-medium">(fixed)</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
                </div>
              </div>

              {/* Orders Display */}
              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="inline-block p-3 bg-slate-100 rounded-full mb-3">
                    <FaClipboardList className="text-2xl text-slate-400" />
                  </div>
                  <p className="text-slate-800 font-semibold text-base">
                    No orders found
                  </p>
                  <p className="text-slate-600 text-sm mt-2 mb-4">
                    Try adjusting your filters or create a new order to get started
                  </p>
                  <button
                    onClick={() => navigate("/sales/orders/create")}
                    className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:shadow-md transition-all font-medium"
                  >
                    <FaPlus className="inline mr-2" size={13} />
                    Create New Order
                  </button>
                </div>
              ) : viewMode === "cards" ? (
                // Modern Card View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`rounded-lg border border-slate-200 p-4 bg-gradient-to-br ${getStatusGradient(
                        order.status
                      )} hover:shadow-md transition-all cursor-pointer group`}
                      onClick={() => handleViewOrder(order.id)}
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-600">
                            Order Number
                          </p>
                          <p className="text-base font-bold text-slate-900 group-hover:text-blue-600 truncate">
                            {order.order_number}
                          </p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="mb-3 pb-3 border-b border-slate-300/40">
                        <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">
                          Customer
                        </p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-1">
                          {order.customer?.name || "N/A"}
                        </p>
                        <p className="text-xs text-slate-600 truncate">
                          {order.customer?.phone || "-"}
                        </p>
                      </div>

                      {/* Product Info */}
                      <div className="mb-3 pb-3 border-b border-slate-300/40">
                        <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">
                          Product
                        </p>
                        {order.items &&
                        Array.isArray(order.items) &&
                        order.items.length > 0 ? (
                          <div className="mt-1">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {order.items[0]?.product_name ||
                                order.items[0]?.description ||
                                "Product"}
                            </p>
                            {order.items.length > 1 && (
                              <p className="text-xs text-slate-600 mt-1">
                                +{order.items.length - 1} more item{order.items.length > 2 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 mt-1">No products</p>
                        )}
                      </div>

                      {/* Order Details */}
                      <div className="space-y-2 mb-3 pb-3 border-b border-slate-300/40">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Quantity:</span>
                          <span className="font-semibold text-slate-900">
                            {order.total_quantity || 0} units
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Amount:</span>
                          <span className="font-bold text-slate-900 text-lg">
                            ₹
                            {(order.final_amount || 0).toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Process Stages */}
                      <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-slate-300/40">
                        {/* Procurement Stage */}
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📋</span>
                          <div>
                            <p className="text-xs text-slate-600 font-semibold">Procurement</p>
                            <p className="text-xs font-bold text-slate-900">
                              {order.purchase_order_id ? "🔗 Under PO" : "❌ No PO"}
                            </p>
                          </div>
                        </div>
                        
                        {/* Production Stage */}
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🏭</span>
                          <div>
                            <p className="text-xs text-slate-600 font-semibold">Production</p>
                            <p className="text-xs font-bold text-slate-900">
                              {order.status === "confirmed" ? "⏱️ Pending" : 
                               order.status === "in_production" ? "🏭 Active" :
                               order.status === "ready_to_ship" ? "📦 Ready" : "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status and Progress */}
                      <div className="mb-3">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.replace(/_/g, " ").toUpperCase()}
                        </span>
                        <div className="w-full bg-slate-300/30 rounded-full h-2 mt-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{
                              width: `${getOrderProgress(order.status)}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 font-medium">
                          {getOrderProgress(order.status)}% complete
                        </p>
                      </div>

                      {/* Delivery Date */}
                      <p className="text-sm text-slate-700 mb-4 font-medium">
                        <span className="text-slate-600">Delivery: </span>
                        {order.delivery_date
                          ? new Date(order.delivery_date).toLocaleDateString(
                              "en-IN",
                              {
                                year: "2-digit",
                                month: "short",
                                day: "2-digit",
                              }
                            )
                          : "Not scheduled"}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:shadow-md transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order.id);
                          }}
                        >
                          <FaEye size={12} />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                          className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-white transition-colors font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOrder(order.id);
                          }}
                        >
                          <FaEdit size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Modern Table View
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 border-b border-slate-300 sticky top-0 z-10">
                      <tr>
                        {AVAILABLE_COLUMNS.map(column => 
                          visibleColumns.includes(column.id) && (
                            <th
                              key={column.id}
                              className={`font-semibold text-slate-700 text-xs px-4 py-3 ${
                                ["amount", "quantity", "advance_paid", "balance", "rate_per_piece"].includes(column.id)
                                  ? "text-right"
                                  : ["procurement_status", "production_status", "status", "progress", "actions"].includes(column.id)
                                  ? "text-center"
                                  : "text-left"
                              }`}
                            >
                              {column.label}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredOrders.map((order) => {
                        // Extract product names from items array
                        const productList =
                          order.items &&
                          Array.isArray(order.items) &&
                          order.items.length > 0
                            ? order.items
                                .map(
                                  (item) =>
                                    item.product_name ||
                                    item.description ||
                                    item.style_no ||
                                    "Product"
                                )
                                .filter(Boolean)
                            : [];
                        const primaryProduct = productList[0] || "No products";
                        const additionalCount = Math.max(0, productList.length - 1);

                        return (
                          <tr
                            key={order.id}
                            className="hover:bg-blue-50 transition-colors group cursor-pointer border-b border-slate-100 last:border-b-0"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            {/* Dynamic Column Rendering */}
                            {AVAILABLE_COLUMNS.map(column => 
                              visibleColumns.includes(column.id) && (
                                <td
                                  key={column.id}
                                  className={`px-4 py-3 ${
                                    ["amount", "quantity", "advance_paid", "balance", "rate_per_piece"].includes(column.id)
                                      ? "text-right"
                                      : ["procurement_status", "production_status", "status", "progress", "actions"].includes(column.id)
                                      ? "text-center"
                                      : "text-left"
                                  }`}
                                >
                                  {/* Project Name */}
                                  {column.id === "project_name" && (
                                    <div>
                                      <p className="font-semibold text-slate-900 group-hover:text-blue-600">
                                        {order.project_name || "-"}
                                      </p>
                                      <span className="text-slate-400 text-xs">{order.order_number}</span>
                                    </div>
                                  )}

                                  {/* Customer */}
                                  {column.id === "customer" && (
                                    <div>
                                      <div className="font-semibold text-slate-900 text-sm">
                                        {order.customer?.name || "N/A"}
                                      </div>
                                      <div className="text-xs text-slate-600">
                                        {order.customer?.phone || "-"}
                                      </div>
                                    </div>
                                  )}

                                  {/* Products */}
                                  {column.id === "products" && (
                                    <Tooltip text={productList.join(", ") || "No products"}>
                                      <div className="text-slate-700">
                                        <div
                                          className="font-semibold truncate text-sm"
                                          title={primaryProduct}
                                        >
                                          {primaryProduct}
                                        </div>
                                        {additionalCount > 0 && (
                                          <div className="text-slate-600 text-xs">
                                            +{additionalCount} item{additionalCount > 1 ? "s" : ""}
                                          </div>
                                        )}
                                      </div>
                                    </Tooltip>
                                  )}

                                  {/* Quantity */}
                                  {column.id === "quantity" && (
                                    <span className="font-semibold text-slate-900">
                                      {order.total_quantity || 0}
                                    </span>
                                  )}

                                  {/* Amount */}
                                  {column.id === "amount" && (
                                    <span className="font-bold text-slate-900">
                                      ₹{(order.final_amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </span>
                                  )}

                                  {/* Advance Paid */}
                                  {column.id === "advance_paid" && (
                                    <span className="font-semibold text-green-700">
                                      ₹{(order.advance_paid || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </span>
                                  )}

                                  {/* Balance */}
                                  {column.id === "balance" && (
                                    <span className="font-semibold text-orange-700">
                                      ₹{((order.final_amount || 0) - (order.advance_paid || 0)).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </span>
                                  )}

                                  {/* Procurement Status */}
                                  {column.id === "procurement_status" && (
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                      order.purchase_order_id 
                                        ? "bg-green-100 text-green-700" 
                                        : "bg-red-100 text-red-700"
                                    }`}>
                                      {order.purchase_order_id ? "🔗 Under PO" : "❌ No PO"}
                                    </span>
                                  )}

                                  {/* Production Status */}
                                  {column.id === "production_status" && (
                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-blue-100 text-blue-700">
                                      {order.status === "confirmed" ? "⏱️ Pending" : 
                                       order.status === "in_production" ? "🏭 Active" :
                                       order.status === "ready_to_ship" ? "📦 Ready" : "—"}
                                    </span>
                                  )}

                                  {/* Main Status */}
                                  {column.id === "status" && (
                                    <span
                                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(order.status)}`}
                                    >
                                      {order.status.replace(/_/g, " ").toUpperCase()}
                                    </span>
                                  )}

                                  {/* Progress */}
                                  {column.id === "progress" && (
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-12 h-2 bg-slate-300/50 rounded-full">
                                        <div
                                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                          style={{
                                            width: `${getOrderProgress(order.status)}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs font-semibold text-slate-700 w-8 text-center">
                                        {getOrderProgress(order.status)}%
                                      </span>
                                    </div>
                                  )}

                                  {/* Delivery Date */}
                                  {column.id === "delivery_date" && (
                                    <span className="text-sm text-slate-700 whitespace-nowrap">
                                      {order.delivery_date
                                        ? new Date(order.delivery_date).toLocaleDateString("en-IN", {
                                            year: "2-digit",
                                            month: "2-digit",
                                            day: "2-digit",
                                          })
                                        : "-"}
                                    </span>
                                  )}

                                  {/* Order Date */}
                                  {column.id === "order_date" && (
                                    <span className="text-sm text-slate-700 whitespace-nowrap">
                                      {order.order_date
                                        ? new Date(order.order_date).toLocaleDateString("en-IN", {
                                            year: "2-digit",
                                            month: "2-digit",
                                            day: "2-digit",
                                          })
                                        : "-"}
                                    </span>
                                  )}

                                  {/* Rate per Piece */}
                                  {column.id === "rate_per_piece" && (
                                    <span className="font-semibold text-slate-900">
                                      ₹{(order.items?.[0]?.rate_per_piece || order.items?.[0]?.rate || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </span>
                                  )}

                                  {/* Created By */}
                                  {column.id === "created_by" && (
                                    <span className="text-sm text-slate-700">
                                      {order.created_by || order.created?.name || "-"}
                                    </span>
                                  )}

                                  {/* Actions */}
                                  {column.id === "actions" && (
                                    <div className="flex items-center justify-center gap-1.5">
                                      <Tooltip text="View">
                                        <button
                                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewOrder(order.id);
                                          }}
                                        >
                                          <FaEye size={13} />
                                        </button>
                                      </Tooltip>
                                      <Tooltip text="Edit">
                                        <button
                                          className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditOrder(order.id);
                                          }}
                                        >
                                          <FaEdit size={13} />
                                        </button>
                                      </Tooltip>
                                    </div>
                                  )}
                                </td>
                              )
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Sales Pipeline Tab */}
          <TabPanel value={tabValue} index={1}>
            <div className="p-4 sm:p-6">
              <h3 className="font-semibold text-base text-slate-800 mb-5">
                Sales Pipeline Overview
              </h3>
              {salesPipeline && salesPipeline.length > 0 ? (
                <div className="space-y-3">
                  {salesPipeline.map((stage, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-sm text-slate-800">
                          {stage.stage}
                        </h4>
                        <span className="text-lg font-bold text-blue-700">
                          {stage.count || 0}
                        </span>
                      </div>
                      <div className="w-full bg-slate-300/30 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              (stage.count /
                                salesPipeline.reduce(
                                  (acc, s) => acc + (s.count || 0),
                                  0
                                )) *
                                100 || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-slate-600 font-medium">
                          Total Value
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          ₹{(stage.value || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-block p-3 bg-slate-100 rounded-full mb-3">
                    <TrendingUp className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-700 font-semibold text-base">
                    No pipeline data available
                  </p>
                  <p className="text-slate-600 text-sm mt-2">
                    Create orders to build your sales pipeline
                  </p>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Customer Management Tab */}
          <TabPanel value={tabValue} index={2}>
            <div className="p-4 sm:p-6">
              <h3 className="font-semibold text-base text-slate-800 mb-5">
                Customer Management
              </h3>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
                <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-slate-800 font-semibold text-base">
                  Feature Coming Soon
                </p>
                <p className="text-slate-600 text-sm mt-2">
                  Manage customers, accounts, purchase history, and loyalty programs
                </p>
              </div>
            </div>
          </TabPanel>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
