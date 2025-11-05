import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaQrcode,
  FaTruck,
  FaFileInvoice,
  FaPrint,
  FaChevronDown,
  FaShoppingCart,
  FaClock,
  FaCheck,
  FaMoneyBillWave,
  FaColumns,
  FaCheckCircle,
  FaExclamationCircle,
  FaBoxOpen,
  FaClipboardList,
} from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import {
  formatINR,
  formatDate,
  safePath,
  getAvailablePOActions,
} from "../../utils/procurementFormatters";
import {
  PO_STATUS_BADGES,
  PRIORITY_BADGES,
} from "../../constants/procurementStatus";
import QRCodeDisplay from "../../components/QRCodeDisplay";
import EnhancedPurchaseOrderForm from "../../components/procurement/EnhancedPurchaseOrderForm";
import { useVendors } from "../../hooks/useVendors";
import { useProducts } from "../../hooks/useProducts";
import { useCustomers } from "../../hooks/useCustomers";
import toast from "react-hot-toast";

// Define all available columns with their properties
const AVAILABLE_COLUMNS = [
  {
    id: "po_number",
    label: "PO Number",
    defaultVisible: true,
    alwaysVisible: true,
  },
  { id: "po_date", label: "PO Date", defaultVisible: true },
  { id: "vendor", label: "Vendor", defaultVisible: true },
  { id: "linked_so", label: "Linked SO", defaultVisible: false },
  { id: "customer", label: "Customer", defaultVisible: false },
  { id: "project_name", label: "Project Name", defaultVisible: false },
  { id: "total_quantity", label: "Total Quantity", defaultVisible: false },
  { id: "final_amount", label: "Total Amount", defaultVisible: true },
  {
    id: "expected_delivery_date",
    label: "Expected Delivery",
    defaultVisible: true,
  },
  { id: "status", label: "Status", defaultVisible: true },
  { id: "priority", label: "Priority", defaultVisible: true },
  { id: "created_by", label: "Created By", defaultVisible: false },
  {
    id: "actions",
    label: "Actions",
    defaultVisible: true,
    alwaysVisible: true,
  },
];

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrOrder, setQrOrder] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded rows

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("purchaseOrdersVisibleColumns");
    if (saved) {
      return JSON.parse(saved);
    }
    return AVAILABLE_COLUMNS.filter((col) => col.defaultVisible).map(
      (col) => col.id
    );
  });

  // Form modal states
  const [modalMode, setModalMode] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);

  const { data: vendors = [] } = useVendors();
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();

  useEffect(() => {
    fetchOrders();
    fetchSummary();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, priorityFilter, dateFrom, dateTo]);

  // Click outside handler for menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnMenu && !event.target.closest(".column-menu-container")) {
        setShowColumnMenu(false);
      }
      if (showActionMenu && !event.target.closest(".action-menu-container")) {
        setShowActionMenu(null);
        setMenuPosition({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColumnMenu, showActionMenu]);

  // Handle URL params for auto-opening modal or navigating to create page
  useEffect(() => {
    const viewId = searchParams.get("view");
    const editId = searchParams.get("edit");
    const createFromSoId = searchParams.get("create_from_so");

    if (createFromSoId) {
      // Navigate to create page with sales order parameter
      navigate(
        `/procurement/purchase-orders/create?from_sales_order=${createFromSoId}`
      );
    } else if (viewId && orders.length > 0) {
      const order = orders.find((o) => o.id === parseInt(viewId));
      if (order) {
        setSelectedOrder(order);
        setModalMode("view");
        setSearchParams({});
      }
    } else if (editId && orders.length > 0) {
      const order = orders.find((o) => o.id === parseInt(editId));
      if (order) {
        setSelectedOrder(order);
        setModalMode("edit");
        setSearchParams({});
      }
    }
  }, [searchParams, orders, setSearchParams, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/procurement/pos");
      setOrders(data.purchaseOrders || []);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      toast.error("Failed to fetch purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const { data } = await api.get("/procurement/pos/stats/summary");
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.po_number?.toLowerCase().includes(search) ||
          order.vendor?.name?.toLowerCase().includes(search) ||
          order.vendor?.vendor_code?.toLowerCase().includes(search) ||
          order.project_name?.toLowerCase().includes(search) ||
          order.customer?.name?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((order) => order.priority === priorityFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(
        (order) => new Date(order.po_date) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filtered = filtered.filter(
        (order) => new Date(order.po_date) <= new Date(dateTo)
      );
    }

    setFilteredOrders(filtered);
  };

  const isColumnVisible = (columnId) => visibleColumns.includes(columnId);

  const toggleColumn = (columnId) => {
    const column = AVAILABLE_COLUMNS.find((col) => col.id === columnId);
    if (column?.alwaysVisible) return;

    const newVisible = visibleColumns.includes(columnId)
      ? visibleColumns.filter((id) => id !== columnId)
      : [...visibleColumns, columnId];

    setVisibleColumns(newVisible);
    localStorage.setItem(
      "purchaseOrdersVisibleColumns",
      JSON.stringify(newVisible)
    );
  };

  const showAllColumns = () => {
    const allIds = AVAILABLE_COLUMNS.map((col) => col.id);
    setVisibleColumns(allIds);
    localStorage.setItem(
      "purchaseOrdersVisibleColumns",
      JSON.stringify(allIds)
    );
  };

  const resetColumns = () => {
    const defaultIds = AVAILABLE_COLUMNS.filter(
      (col) => col.defaultVisible
    ).map((col) => col.id);
    setVisibleColumns(defaultIds);
    localStorage.setItem(
      "purchaseOrdersVisibleColumns",
      JSON.stringify(defaultIds)
    );
  };

  const handleView = (order) => {
    navigate(`/procurement/purchase-orders/${order.id}`);
  };

  const handleEdit = (order) => {
    navigate(`/procurement/purchase-orders/${order.id}`);
  };

  const handleDelete = async (order) => {
    if (
      !window.confirm(`Are you sure you want to delete PO ${order.po_number}?`)
    ) {
      return;
    }

    try {
      await api.delete(`/procurement/pos/${order.id}`);
      toast.success("Purchase order deleted successfully");
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete purchase order"
      );
    }
  };

  const handleGenerateQR = (order) => {
    setQrOrder(order);
    setShowQRModal(true);
  };

  const handlePrint = (order) => {
    window.print();
  };

  const handleSendToVendor = async (order) => {
    if (
      !window.confirm(
        `Send PO ${order.po_number} to vendor ${order.vendor?.name}?`
      )
    ) {
      return;
    }

    try {
      await api.patch(`/procurement/pos/${order.id}`, { status: "sent" });
      toast.success("Purchase order sent to vendor successfully!");
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send to vendor");
    }
  };

  const handleMaterialReceived = async (order) => {
    if (
      !window.confirm(
        `Confirm that materials for PO ${order.po_number} have been received? This will automatically create a GRN request for the Inventory Department.`
      )
    ) {
      return;
    }

    try {
      await api.post(
        `/procurement/purchase-orders/${order.id}/material-received`
      );
      toast.success(
        `✅ Materials received for PO ${order.po_number}! GRN request sent to Inventory Department.`
      );
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark materials as received"
      );
    }
  };

  const handleRequestGRN = async (order) => {
    if (
      !window.confirm(
        `Request GRN creation for PO ${order.po_number}? This will notify the Inventory Department for approval.`
      )
    ) {
      return;
    }

    try {
      await api.post(`/procurement/purchase-orders/${order.id}/request-grn`, {
        notes: "Requesting GRN creation from procurement",
      });
      toast.success(
        "GRN creation request submitted successfully! Inventory Department will review."
      );
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to request GRN creation"
      );
    }
  };

  const handleViewGRNStatus = (order) => {
    // Navigate to PO details page with GRN tab
    navigate(`/procurement/purchase-orders/${order.id}?tab=grn`);
  };

  const handleSubmitForApproval = async (order) => {
    if (
      !window.confirm(
        `Submit Purchase Order ${order.po_number} for admin approval?`
      )
    ) {
      return;
    }

    try {
      await api.post(`/procurement/pos/${order.id}/submit-for-approval`, {
        notes: "Submitted for approval from procurement dashboard",
      });
      toast.success("Purchase order submitted for approval successfully!");
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit for approval"
      );
    }
  };

  const handleApprovePO = async (order) => {
    if (!window.confirm(`Approve Purchase Order ${order.po_number}?`)) {
      return;
    }

    try {
      await api.post(`/procurement/pos/${order.id}/approve`);
      toast.success("Purchase order approved and sent to vendor!");
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve PO");
    }
  };

  const handleMarkAsReceived = async (order) => {
    if (!window.confirm(`Mark PO ${order.po_number} as received?`)) {
      return;
    }

    try {
      await api.patch(`/procurement/pos/${order.id}`, { status: "received" });
      toast.success("Purchase order marked as received!");
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark as received"
      );
    }
  };

  const handleGenerateInvoice = async (order) => {
    if (!window.confirm(`Generate vendor invoice for PO ${order.po_number}?`)) {
      return;
    }

    try {
      await api.post(`/procurement/pos/${order.id}/generate-invoice`);
      toast.success("Vendor invoice generated successfully!");
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate invoice"
      );
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (modalMode === "create") {
        await api.post("/procurement/pos", formData);
        toast.success("Purchase order created successfully");
      } else if (modalMode === "edit") {
        await api.patch(`/procurement/pos/${selectedOrder.id}`, formData);
        toast.success("Purchase order updated successfully");
      }

      setModalMode(null);
      setSelectedOrder(null);
      setSelectedSalesOrder(null);
      fetchOrders();
      fetchSummary();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save purchase order"
      );
      throw error;
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedOrder(null);
    setSelectedSalesOrder(null);
  };

  const toggleActionMenu = (orderId, event) => {
    if (showActionMenu === orderId) {
      setShowActionMenu(null);
      setMenuPosition({});
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const menuWidth = 180;
      const menuHeight = 250; // Approximate height

      // Calculate position to keep menu in viewport
      let top = rect.bottom + window.scrollY;
      let left = rect.left + window.scrollX - menuWidth;

      // Adjust if menu would go off bottom of viewport
      if (rect.bottom + menuHeight > window.innerHeight) {
        top = rect.top + window.scrollY - menuHeight;
      }

      // Adjust if menu would go off left of viewport
      if (left < 0) {
        left = rect.right + window.scrollX - menuWidth;
      }

      // Adjust if menu would go off right of viewport
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 10;
      }

      setMenuPosition({ top, left });
      setShowActionMenu(orderId);
    }
  };

  const toggleRowExpansion = (orderId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(orderId)) {
      newExpandedRows.delete(orderId);
    } else {
      newExpandedRows.add(orderId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getStatusBadge = (status) => {
    const badge = PO_STATUS_BADGES[status] || PO_STATUS_BADGES.draft;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.color} ${badge.text}`}
        title={badge.description}
      >
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badge =
      PRIORITY_BADGES[priority?.toLowerCase()] || PRIORITY_BADGES.medium;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.color} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  const vendorOptions = vendors.map((vendor) => ({
    value: vendor.id,
    label: `${vendor.name} (${vendor.vendor_code})`,
  }));

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: `${customer.name} (${customer.customer_code})`,
  }));

  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.name} (${product.product_code})`,
  }));

  return (
    <div className="min-h-screen bg-white p-3">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-3">
          <h1
            className="text-xl font-semibold mb-0.5"
            style={{ color: "#0f172a" }}
          >
            Purchase Orders
          </h1>
          <p className="text-slate-500 text-xs">
            Manage and track all purchase orders with real-time updates
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mb-3">
            <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-normal mb-1 truncate">
                    Total Orders
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    {summary.total_orders}
                  </p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
                  <FaShoppingCart size={14} className="text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-normal mb-1 truncate">
                    Draft Orders
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    {summary.draft_orders}
                  </p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg flex-shrink-0">
                  <FaFileInvoice size={14} className="text-slate-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-normal mb-1 truncate">
                    Pending Appr.
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    {summary.pending_approval_orders}
                  </p>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg flex-shrink-0">
                  <FaClock size={14} className="text-amber-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-normal mb-1 truncate">
                    Sent to Vendor
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    {summary.sent_orders}
                  </p>
                </div>
                <div className="bg-violet-50 p-2 rounded-lg flex-shrink-0">
                  <FaTruck size={14} className="text-violet-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-normal mb-1 truncate">
                    Received
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    {summary.received_orders}
                  </p>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg flex-shrink-0">
                  <FaBoxOpen size={14} className="text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-normal mb-1 truncate">
                    Completed
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    {summary.completed_orders}
                  </p>
                </div>
                <div className="bg-teal-50 p-2 rounded-lg flex-shrink-0">
                  <FaCheck size={14} className="text-teal-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-cyan-100 transition-all sm:col-span-2 md:col-span-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-normal mb-1 truncate">
                    Total Value
                  </p>
                  <p className="text-base font-semibold text-slate-800">
                    {formatINR(summary.total_value)}
                  </p>
                </div>
                <div className="bg-cyan-50 p-2 rounded-lg flex-shrink-0">
                  <FaMoneyBillWave size={14} className="text-cyan-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-normal mb-1 truncate">
                    Pending Value
                  </p>
                  <p className="text-base font-semibold text-orange-600">
                    {formatINR(summary.pending_value)}
                  </p>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg flex-shrink-0">
                  <FaClock size={14} className="text-orange-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-normal mb-1 truncate">
                    Completed Value
                  </p>
                  <p className="text-base font-semibold text-green-600">
                    {formatINR(summary.completed_value)}
                  </p>
                </div>
                <div className="bg-green-50 p-2 rounded-lg flex-shrink-0">
                  <FaCheck size={14} className="text-green-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm mb-3">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <div className="flex-1 relative min-w-0">
              <input
                type="text"
                placeholder="Search PO, Vendor, Project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg pl-8 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-20 bg-white text-slate-800 placeholder-slate-400 transition-all"
              />
              <FaSearch
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={12}
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <div className="relative column-menu-container">
                <button
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg transition-all font-medium whitespace-nowrap"
                >
                  <FaColumns size={12} />
                  <span>Columns</span>
                  <FaChevronDown
                    size={10}
                    className={`transition-transform ${
                      showColumnMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Column Menu Dropdown */}
                {showColumnMenu && (
                  <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg z-50 border border-slate-100">
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-xs text-slate-800">
                          Manage Columns
                        </h3>
                        <span className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                          {visibleColumns.length}/{AVAILABLE_COLUMNS.length}
                        </span>
                      </div>

                      <div className="space-y-1 max-h-72 overflow-y-auto">
                        {AVAILABLE_COLUMNS.map((column) => (
                          <label
                            key={column.id}
                            className={`flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors ${
                              column.alwaysVisible
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isColumnVisible(column.id)}
                              onChange={() => toggleColumn(column.id)}
                              disabled={column.alwaysVisible}
                              className="w-3 h-3 rounded focus:ring-1 focus:ring-opacity-20"
                              style={{ accentColor: "#0f172a" }}
                            />
                            <span className="text-xs text-slate-700">
                              {column.label}
                            </span>
                            {column.alwaysVisible && (
                              <span className="text-xs text-slate-400 ml-auto">
                                (Req)
                              </span>
                            )}
                          </label>
                        ))}
                      </div>

                      <div className="flex gap-1.5 mt-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={showAllColumns}
                          className="flex-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg transition-all font-medium"
                        >
                          Show All
                        </button>
                        <button
                          onClick={resetColumns}
                          className="flex-1 px-2 py-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all font-medium"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all font-medium whitespace-nowrap"
              >
                <FaFilter size={12} />
                <span>Filters</span>
                <FaChevronDown
                  size={10}
                  className={`transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-20 bg-white text-slate-800 transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="sent">Sent to Vendor</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="dispatched">🚚 Dispatched</option>
                  <option value="in_transit">🚛 In Transit</option>
                  <option value="grn_requested">GRN Requested</option>
                  <option value="grn_created">GRN Created</option>
                  <option value="partial_received">Partially Received</option>
                  <option value="received">Received</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full p-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-20 bg-white text-slate-800 transition-all"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full p-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-20 bg-white text-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full p-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-20 bg-white text-slate-800 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  {isColumnVisible("po_number") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">
                      PO Number
                    </th>
                  )}
                  {isColumnVisible("po_date") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">
                      PO Date
                    </th>
                  )}
                  {isColumnVisible("vendor") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">
                      Vendor
                    </th>
                  )}
                  {isColumnVisible("linked_so") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">
                      Linked SO
                    </th>
                  )}
                  {isColumnVisible("customer") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">
                      Customer
                    </th>
                  )}
                  {isColumnVisible("project_name") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">
                      Project
                    </th>
                  )}
                  {isColumnVisible("total_quantity") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">
                      Qty
                    </th>
                  )}
                  {isColumnVisible("final_amount") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">
                      Amount
                    </th>
                  )}
                  {isColumnVisible("expected_delivery_date") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">
                      Del. Date
                    </th>
                  )}
                  {isColumnVisible("status") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">
                      Status
                    </th>
                  )}
                  {isColumnVisible("priority") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">
                      Priority
                    </th>
                  )}
                  {isColumnVisible("created_by") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">
                      Created By
                    </th>
                  )}
                  {isColumnVisible("actions") && (
                    <th className="px-2 py-2 text-left text-xs font-medium text-slate-700 sticky right-0 bg-slate-100 shadow-[-2px_0_4px_rgba(0,0,0,0.05)] min-w-[80px]">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={AVAILABLE_COLUMNS.length}
                      className="px-2 py-6 text-center text-slate-500 text-xs"
                    >
                      <div className="inline-flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                        Loading purchase orders...
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={AVAILABLE_COLUMNS.length}
                      className="px-2 py-6 text-center text-slate-400 text-xs"
                    >
                      <p>No purchase orders found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-slate-50 transition-colors group">
                        {isColumnVisible("po_number") && (
                          <td className="px-2 py-2 whitespace-nowrap">
                            <button
                              onClick={() => handleView(order)}
                              className="font-medium text-xs hover:underline"
                              style={{ color: "#0f172a" }}
                            >
                              {order.po_number}
                            </button>
                          </td>
                        )}
                        {isColumnVisible("po_date") && (
                          <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-700">
                            {formatDate(order.po_date)}
                          </td>
                        )}
                        {isColumnVisible("vendor") && (
                          <td className="px-2 py-2 whitespace-nowrap">
                            <div className="text-xs font-normal text-slate-800">
                              {safePath(order, "vendor.name", "Unknown Vendor")}
                            </div>
                            <div className="text-xs text-slate-500">
                              {safePath(order, "vendor.vendor_code", "—")}
                            </div>
                          </td>
                        )}
                        {isColumnVisible("linked_so") && (
                          <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-700">
                            {safePath(order, "salesOrder.order_number", "—")}
                          </td>
                        )}
                        {isColumnVisible("customer") && (
                          <td className="px-2 py-2 whitespace-nowrap">
                            <div className="text-xs font-normal text-slate-800">
                              {safePath(
                                order,
                                "customer.name",
                                "Unknown Customer"
                              )}
                            </div>
                            {safePath(order, "customer.customer_code") !==
                              "—" && (
                              <div className="text-xs text-slate-500">
                                {safePath(order, "customer.customer_code", "")}
                              </div>
                            )}
                          </td>
                        )}
                        {isColumnVisible("project_name") && (
                          <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-700">
                            {order.project_name || "—"}
                          </td>
                        )}
                        {isColumnVisible("total_quantity") && (
                          <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-700">
                            {order.total_quantity || "0"}
                          </td>
                        )}
                        {isColumnVisible("final_amount") && (
                          <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-slate-800">
                            {formatINR(order.final_amount)}
                          </td>
                        )}
                        {isColumnVisible("expected_delivery_date") && (
                          <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-700">
                            {formatDate(order.expected_delivery_date)}
                          </td>
                        )}
                        {isColumnVisible("status") && (
                          <td className="px-2 py-2 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                        )}
                        {isColumnVisible("priority") && (
                          <td className="px-2 py-2 whitespace-nowrap">
                            {getPriorityBadge(order.priority)}
                          </td>
                        )}
                        {isColumnVisible("created_by") && (
                          <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-700">
                            {order.creator?.name || "N/A"}
                          </td>
                        )}
                        {isColumnVisible("actions") && (
                          <td className="px-2 py-2 whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-2px_0_4px_rgba(0,0,0,0.05)] transition-colors">
                            <button
                              onClick={() => toggleRowExpansion(order.id)}
                              className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                              title={
                                expandedRows.has(order.id)
                                  ? "Hide Actions"
                                  : "Show Actions"
                              }
                            >
                              <FaChevronDown
                                size={12}
                                className={`transition-transform ${
                                  expandedRows.has(order.id) ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </td>
                        )}
                      </tr>

                      {/* Expanded Actions Row */}
                      {expandedRows.has(order.id) && (
                        <tr className="bg-slate-50 border-t border-blue-200">
                          <td
                            colSpan={AVAILABLE_COLUMNS.length}
                            className="px-2 py-2"
                          >
                            <div className="space-y-1">
                              <h4 className="text-xs font-medium text-slate-700 mb-1.5">
                                Available Actions
                              </h4>
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1">
                                {/* View / Edit Button */}
                                <button
                                  onClick={() => {
                                    handleView(order);
                                    setExpandedRows(new Set());
                                  }}
                                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors text-xs font-normal border border-blue-200"
                                >
                                  <FaEye size={12} />
                                  <span className="text-center text-xs">
                                    View
                                  </span>
                                </button>

                                {/* Submit for Approval - For draft and pending_approval statuses (working flow) */}
                                {["draft", "pending_approval"].includes(
                                  order.status?.toLowerCase()
                                ) && (
                                  <button
                                    onClick={() => {
                                      const lowerStatus =
                                        order.status?.toLowerCase();
                                      if (lowerStatus === "draft") {
                                        handleSubmitForApproval(order);
                                      } else if (
                                        lowerStatus === "pending_approval"
                                      ) {
                                        handleApprovePO(order);
                                      }
                                      setExpandedRows(new Set());
                                    }}
                                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors text-xs font-normal border border-amber-200"
                                  >
                                    <FaClipboardList size={12} />
                                    <span className="text-center text-xs">
                                      Submit
                                    </span>
                                  </button>
                                )}

                                {/* Send to Vendor - For approved or draft status */}
                                {(order.status?.toLowerCase() === "approved" ||
                                  order.status?.toLowerCase() === "draft") && (
                                  <button
                                    onClick={() => {
                                      handleSendToVendor(order);
                                      setExpandedRows(new Set());
                                    }}
                                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-violet-50 hover:bg-violet-100 text-violet-600 transition-colors text-xs font-normal border border-violet-200"
                                  >
                                    <FaTruck size={12} />
                                    <span className="text-center text-xs">
                                      Send
                                    </span>
                                  </button>
                                )}

                                {/* Material Received - For sent or acknowledged status */}
                                {(order.status?.toLowerCase() === "sent" ||
                                  order.status?.toLowerCase() ===
                                    "acknowledged") && (
                                  <button
                                    onClick={() => {
                                      handleMaterialReceived(order);
                                      setExpandedRows(new Set());
                                    }}
                                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-teal-50 hover:bg-teal-100 text-teal-600 transition-colors text-xs font-normal border border-teal-200"
                                  >
                                    <FaCheckCircle size={12} />
                                    <span className="text-center text-xs">
                                      Received
                                    </span>
                                  </button>
                                )}

                                {/* Request GRN Creation - For sent status (LEGACY - Manual Option) */}
                                {order.status?.toLowerCase() === "sent" && (
                                  <button
                                    onClick={() => {
                                      handleRequestGRN(order);
                                      setExpandedRows(new Set());
                                    }}
                                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors text-xs font-normal border border-blue-200"
                                  >
                                    <FaBoxOpen size={12} />
                                    <span className="text-center text-xs">
                                      Req GRN
                                    </span>
                                  </button>
                                )}

                                {/* View GRN Request Status - For grn_requested or dispatched status */}
                                {(order.status?.toLowerCase() ===
                                  "grn_requested" ||
                                  order.status?.toLowerCase() ===
                                    "dispatched" ||
                                  order.status?.toLowerCase() ===
                                    "in_transit") && (
                                  <button
                                    onClick={() => {
                                      handleViewGRNStatus(order);
                                      setExpandedRows(new Set());
                                    }}
                                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors text-xs font-normal border border-orange-200"
                                  >
                                    <FaClock size={12} />
                                    <span className="text-center text-xs">
                                      {order.status?.toLowerCase() ===
                                        "dispatched" ||
                                      order.status?.toLowerCase() ===
                                        "in_transit"
                                        ? "In Transit"
                                        : "GRN Status"}
                                    </span>
                                  </button>
                                )}

                                {/* Generate Invoice */}
                                <button
                                  onClick={() => {
                                    handleGenerateInvoice(order);
                                    setExpandedRows(new Set());
                                  }}
                                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors text-xs font-normal border border-slate-200"
                                >
                                  <FaFileInvoice size={12} />
                                  <span className="text-center text-xs">
                                    Invoice
                                  </span>
                                </button>

                                {/* View GRN Status - General option for received orders */}
                                {[
                                  "sent",
                                  "acknowledged",
                                  "received",
                                  "partial_received",
                                  "completed",
                                ].includes(order.status?.toLowerCase()) &&
                                  ![
                                    "grn_requested",
                                    "dispatched",
                                    "in_transit",
                                  ].includes(order.status?.toLowerCase()) && (
                                    <button
                                      onClick={() => {
                                        handleViewGRNStatus(order);
                                        setExpandedRows(new Set());
                                      }}
                                      className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors text-xs font-normal border border-slate-200"
                                    >
                                      <FaClipboardList size={12} />
                                      <span className="text-center text-xs">
                                        GRN Status
                                      </span>
                                    </button>
                                  )}

                                {/* Generate QR Code */}
                                <button
                                  onClick={() => {
                                    handleGenerateQR(order);
                                    setExpandedRows(new Set());
                                  }}
                                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors text-xs font-normal border border-slate-200"
                                >
                                  <FaQrcode size={12} />
                                  <span className="text-center text-xs">
                                    QR Code
                                  </span>
                                </button>

                                {/* Print PO */}
                                <button
                                  onClick={() => {
                                    handlePrint(order);
                                    setExpandedRows(new Set());
                                  }}
                                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors text-xs font-normal border border-slate-200"
                                >
                                  <FaPrint size={12} />
                                  <span className="text-center text-xs">
                                    Print
                                  </span>
                                </button>

                                {/* Mark as Received - Quick action */}
                                {[
                                  "sent",
                                  "acknowledged",
                                  "partial_received",
                                ].includes(order.status?.toLowerCase()) && (
                                  <button
                                    onClick={() => {
                                      handleMarkAsReceived(order);
                                      setExpandedRows(new Set());
                                    }}
                                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors text-xs font-normal border border-emerald-200"
                                  >
                                    <FaCheck size={12} />
                                    <span className="text-center text-xs">
                                      Received
                                    </span>
                                  </button>
                                )}

                                {/* Delete - Dangerous action at bottom */}
                                <button
                                  onClick={() => {
                                    handleDelete(order);
                                    setExpandedRows(new Set());
                                  }}
                                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors text-xs font-normal border border-red-200"
                                >
                                  <FaTrash size={12} />
                                  <span className="text-center text-xs">
                                    Delete
                                  </span>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRModal && qrOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 border border-slate-100">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-800">
                  PO QR Code
                </h2>
              </div>

              <div className="p-3">
                <div className="text-center mb-3">
                  <QRCodeDisplay
                    data={JSON.stringify({
                      po_number: qrOrder.po_number,
                      vendor: qrOrder.vendor?.name,
                      status: qrOrder.status,
                      amount: qrOrder.final_amount,
                      track_url: `${window.location.origin}/procurement/track/${qrOrder.po_number}`,
                    })}
                    size={160}
                  />
                </div>

                <div className="space-y-1.5 text-xs mb-3 bg-slate-50 p-2.5 rounded">
                  <div className="text-slate-700">
                    <strong className="text-slate-800">PO:</strong>{" "}
                    <span className="font-mono text-xs">
                      {qrOrder.po_number}
                    </span>
                  </div>
                  <div className="text-slate-700">
                    <strong className="text-slate-800">Vendor:</strong>{" "}
                    {qrOrder.vendor?.name}
                  </div>
                  <div className="text-slate-700">
                    <strong className="text-slate-800">Status:</strong>{" "}
                    {qrOrder.status}
                  </div>
                  <div className="text-slate-700">
                    <strong className="text-slate-800">Amount:</strong> ₹
                    {qrOrder.final_amount?.toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded transition-all font-medium text-xs"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 px-3 py-2 text-white rounded transition-all font-medium text-xs"
                    style={{ backgroundColor: "#0f172a" }}
                  >
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Purchase Order Form Modal */}
        {modalMode && (
          <EnhancedPurchaseOrderForm
            open={true}
            mode={modalMode}
            initialValues={selectedOrder}
            linkedSalesOrder={selectedSalesOrder}
            vendorOptions={vendorOptions}
            customerOptions={customerOptions}
            productOptions={productOptions}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default PurchaseOrdersPage;
