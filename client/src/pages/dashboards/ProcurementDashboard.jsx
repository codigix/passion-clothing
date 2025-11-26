import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  Plus,
  Search,
  Eye,
  Edit,
  Building,
  Receipt,
  Truck,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Download,
  Star,
  Phone,
  Mail,
  QrCode,
  MessageSquare,
  Package,
  Factory,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Clock,
  Box,
  Trash2,
  FileText,
  PrinterIcon,
  ChevronDown,
  Columns3,
} from "lucide-react";
import {
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
  FaRedo,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import QRCodeScanner from "../../components/manufacturing/QRCodeScanner";
import QRCodeDisplay from "../../components/QRCodeDisplay";
import PurchaseOrderForm from "../../components/procurement/PurchaseOrderForm";
import SalesOrderDetailModal from "../../components/dialogs/SalesOrderDetailModal";
import CreditNoteModal from "../../components/dialogs/CreditNoteModal";

// Define all available columns
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

// Status and Priority badges
const PO_STATUS_BADGES = {
  draft: {
    label: "Draft",
    color: "bg-slate-100",
    text: "text-slate-700",
    description: "Order is in draft status",
  },
  pending_approval: {
    label: "Pending Approval",
    color: "bg-amber-100",
    text: "text-amber-700",
    description: "Awaiting admin approval",
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100",
    text: "text-blue-700",
    description: "Order approved",
  },
  sent: {
    label: "Sent to Vendor",
    color: "bg-purple-100",
    text: "text-purple-700",
    description: "Sent to vendor",
  },
  acknowledged: {
    label: "Acknowledged",
    color: "bg-indigo-100",
    text: "text-indigo-700",
    description: "Vendor acknowledged",
  },
  dispatched: {
    label: "📤 Dispatched",
    color: "bg-cyan-100",
    text: "text-cyan-700",
    description: "Materials dispatched",
  },
  in_transit: {
    label: "🚛 In Transit",
    color: "bg-sky-100",
    text: "text-sky-700",
    description: "Materials in transit",
  },
  grn_requested: {
    label: "GRN Requested",
    color: "bg-orange-100",
    text: "text-orange-700",
    description: "GRN creation requested",
  },
  grn_created: {
    label: "GRN Created",
    color: "bg-teal-100",
    text: "text-teal-700",
    description: "GRN created",
  },
  partial_received: {
    label: "Partially Received",
    color: "bg-lime-100",
    text: "text-lime-700",
    description: "Partially received",
  },
  received: {
    label: "Received",
    color: "bg-emerald-100",
    text: "text-emerald-700",
    description: "Fully received",
  },
  grn_shortage: {
    label: "⚠️ GRN Shortage",
    color: "bg-red-100",
    text: "text-red-700",
    description: "Material shortage detected",
  },
  grn_overage: {
    label: "📦 GRN Overage",
    color: "bg-yellow-100",
    text: "text-yellow-700",
    description: "Material overage detected",
  },
  reopened: {
    label: "🔄 Reopened",
    color: "bg-purple-100",
    text: "text-purple-700",
    description: "PO reopened for vendor request",
  },
  completed: {
    label: "Completed",
    color: "bg-green-100",
    text: "text-green-700",
    description: "Order completed",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100",
    text: "text-red-700",
    description: "Order cancelled",
  },
};

const PRIORITY_BADGES = {
  low: { label: "Low", color: "bg-blue-100", text: "text-blue-700" },
  medium: { label: "Medium", color: "bg-yellow-100", text: "text-yellow-700" },
  high: { label: "High", color: "bg-orange-100", text: "text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100", text: "text-red-700" },
};

// Utility functions
const formatINR = (value) => {
  if (!value) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN");
};

const ProcurementDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");

  // Real data
  const [stats, setStats] = useState({
    totalPOs: 0,
    openPOs: 0,
    vendorCount: 0,
    pendingOrders: 0,
    pendingExcessApprovals: 0,
    pendingVendorReturns: 0,
  });
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [incomingPurchaseOrders, setIncomingPurchaseOrders] = useState([]);
  const [excessApprovals, setExcessApprovals] = useState([]);
  const [vendorReturns, setVendorReturns] = useState([]);
  const [grnRequests, setGrnRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qrOrder, setQrOrder] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  // Purchase Orders table state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilterPO, setStatusFilterPO] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("procurementDashboardVisibleColumns");
    if (saved) {
      return JSON.parse(saved);
    }
    return AVAILABLE_COLUMNS.filter((col) => col.defaultVisible).map(
      (col) => col.id
    );
  });
  const [poSummary, setPoSummary] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded rows
  const [poCountByOrder, setPoCountByOrder] = useState({}); // Track PO count per sales order
  
  // Sales Order Detail Modal state
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);
  
  // Create PO Modal state
  const [createPOModalOpen, setCreatePOModalOpen] = useState(false);
  const [salesOrdersForPO, setSalesOrdersForPO] = useState([]);
  const [selectedSOForPO, setSelectedSOForPO] = useState(null);
  const [filterSOSearch, setFilterSOSearch] = useState("");
  const [filterSOStatus, setFilterSOStatus] = useState("all");
  const [showPOFormStep, setShowPOFormStep] = useState(false);
  const [showProjectStep, setShowProjectStep] = useState(true);
  const [vendorOptionsForPO, setVendorOptionsForPO] = useState([]);
  const [projectNamesForPO, setProjectNamesForPO] = useState([]);
  const [allSOForProjecting, setAllSOForProjecting] = useState([]);
  const [selectedProjectForPO, setSelectedProjectForPO] = useState("");
  const [poFormData, setPoFormData] = useState({
    projectName: "",
    vendor: "",
    materialType: "fabric",
  });

  // Credit Note Modal states
  const [creditNoteModalOpen, setCreditNoteModalOpen] = useState(false);
  const [selectedOverageRequest, setSelectedOverageRequest] = useState(null);

  // Show success message if navigated from PO creation
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Apply filters for PO table
  useEffect(() => {
    applyPOFilters();
  }, [
    purchaseOrders,
    searchTerm,
    statusFilterPO,
    priorityFilter,
    dateFrom,
    dateTo,
  ]);

  // Click outside handler for PO table menus
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

  const fetchDashboardData = async () => {
    if (isFetching) return;

    try {
      setIsFetching(true);
      setLoading(true);

      // Fetch stats
      const statsRes = await api.get("/procurement/dashboard/stats");
      setStats((prevStats) => ({
        ...prevStats,
        ...statsRes.data,
      }));

      // Fetch recent purchase orders
      const poRes = await api.get("/procurement/pos?limit=100");
      const allPOs = poRes.data.purchaseOrders || [];
      setPurchaseOrders(allPOs.slice(0, 10));

      // Calculate PO count for each sales order
      const poCount = {};
      allPOs.forEach((po) => {
        if (po.linked_sales_order_id) {
          poCount[po.linked_sales_order_id] =
            (poCount[po.linked_sales_order_id] || 0) + 1;
        }
      });
      setPoCountByOrder(poCount);

      // Fetch incoming orders from sales
      const incomingRes = await api.get("/sales/orders?limit=50");
      const ordersForProcurement = (incomingRes.data.orders || []).filter(
        (order) =>
          order.ready_for_procurement === true &&
          (order.status === "draft" || order.status === "confirmed")
      );
      setIncomingOrders(ordersForProcurement);

      // Fetch incoming purchase orders
      const incomingPORes = await api.get(
        "/procurement/pos?status=draft,pending_approval,sent&limit=20"
      );
      setIncomingPurchaseOrders(incomingPORes.data.purchaseOrders || []);

      // Update pending orders count
      const totalIncoming =
        (incomingRes.data.orders?.length || 0) +
        (incomingPORes.data.purchaseOrders?.length || 0);

      // Fetch vendors
      const vendorsRes = await api.get("/procurement/vendors?limit=10");
      setVendors(vendorsRes.data.vendors || []);

      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        pendingOrders: totalIncoming,
        pendingExcessApprovals: 0,
        pendingVendorReturns: 0,
      }));

      // Fetch PO summary stats
      try {
        const summaryRes = await api.get("/procurement/pos/stats/summary");
        setPoSummary(summaryRes.data);
      } catch (err) {
        console.error("Error fetching PO summary:", err);
      }

      // Fetch pending requests (shortage/overage complaints)
      try {
        const pendingRes = await api.get("/approvals?entity_type=purchase_order&status=pending,in_progress");
        const complaints = (pendingRes.data.approvals || []).filter(
          (approval) =>
            approval.stage_key === "grn_shortage_complaint" ||
            approval.stage_key === "grn_overage_complaint"
        );
        setPendingRequests(complaints);
      } catch (err) {
        console.error("Error fetching pending requests:", err);
        setPendingRequests([]);
      }

      // Fetch excess approvals
      try {
        const excessRes = await api.get("/approvals?entity_type=purchase_order&stage_key=excess_material_approval&status=pending");
        setExcessApprovals(excessRes.data.approvals || []);
      } catch (err) {
        console.error("Error fetching excess approvals:", err);
        setExcessApprovals([]);
      }

      // Fetch vendor returns
      try {
        const returnsRes = await api.get("/vendor-returns?status=pending&status=approved");
        setVendorReturns(returnsRes.data.returns || []);
      } catch (err) {
        console.error("Error fetching vendor returns:", err);
        setVendorReturns([]);
      }

      // Fetch recent credit notes
      try {
        const creditNotesRes = await api.get("/credit-notes/?limit=10&sort=-created_at");
        setCreditNotes(creditNotesRes.data.creditNotes || creditNotesRes.data.data || []);
      } catch (err) {
        console.error("Error fetching credit notes:", err);
        setCreditNotes([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setStats({ totalPOs: 0, openPOs: 0, vendorCount: 0, pendingOrders: 0 });
      setPurchaseOrders([]);
      setIncomingOrders([]);
      setVendors([]);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const handleReopenPOAndSendRequest = async (complaintId) => {
    try {
      const result = await toast.promise(
        api.post("/vendor-requests/reopen-po-and-send-request", {
          complaint_id: complaintId,
        }),
        {
          loading: "Reopening PO and sending vendor request...",
          success: "PO reopened and vendor request sent successfully!",
          error: "Failed to reopen PO and send vendor request",
        }
      );

      fetchDashboardData();
    } catch (error) {
      console.error("Error reopening PO:", error);
    }
  };

  // Apply filters for PO table
  const applyPOFilters = () => {
    let filtered = [...purchaseOrders];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.po_number?.toLowerCase().includes(search) ||
          order.vendor?.name?.toLowerCase().includes(search) ||
          order.vendor?.vendor_code?.toLowerCase().includes(search) ||
          order.project_name?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilterPO !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilterPO);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.priority?.toLowerCase() === priorityFilter
      );
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

  // Column management
  const isColumnVisible = (columnId) => visibleColumns.includes(columnId);

  const toggleColumn = (columnId) => {
    const column = AVAILABLE_COLUMNS.find((col) => col.id === columnId);
    if (column?.alwaysVisible) return;

    const newVisible = visibleColumns.includes(columnId)
      ? visibleColumns.filter((id) => id !== columnId)
      : [...visibleColumns, columnId];

    setVisibleColumns(newVisible);
    localStorage.setItem(
      "procurementDashboardVisibleColumns",
      JSON.stringify(newVisible)
    );
  };

  const showAllColumns = () => {
    const allIds = AVAILABLE_COLUMNS.map((col) => col.id);
    setVisibleColumns(allIds);
    localStorage.setItem(
      "procurementDashboardVisibleColumns",
      JSON.stringify(allIds)
    );
  };

  const resetColumns = () => {
    const defaultIds = AVAILABLE_COLUMNS.filter(
      (col) => col.defaultVisible
    ).map((col) => col.id);
    setVisibleColumns(defaultIds);
    localStorage.setItem(
      "procurementDashboardVisibleColumns",
      JSON.stringify(defaultIds)
    );
  };

  // Badge helpers
  const getStatusBadge = (status) => {
    const badge = PO_STATUS_BADGES[status] || PO_STATUS_BADGES.draft;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.color} ${badge.text}`}
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
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.color} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  const toggleActionMenu = (orderId, event) => {
    if (showActionMenu === orderId) {
      setShowActionMenu(null);
      setMenuPosition({});
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const menuWidth = 180;
      const menuHeight = 250;

      let top = rect.bottom + window.scrollY;
      let left = rect.left + window.scrollX - menuWidth;

      if (rect.bottom + menuHeight > window.innerHeight) {
        top = rect.top + window.scrollY - menuHeight;
      }

      if (left < 0) {
        left = rect.right + window.scrollX - menuWidth;
      }

      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 10;
      }

      setMenuPosition({ top, left });
      setShowActionMenu(orderId);
    }
  };

  // PO Action handlers
  const handleViewPO = (order) => {
    navigate(`/procurement/purchase-orders/${order.id}`);
  };

  const handleEditPO = (order) => {
    navigate(`/procurement/purchase-orders/${order.id}`);
  };

  const handleDeletePO = async (order) => {
    if (
      !window.confirm(`Are you sure you want to delete PO ${order.po_number}?`)
    ) {
      return;
    }

    try {
      await api.delete(`/procurement/pos/${order.id}`);
      toast.success("Purchase order deleted successfully");
      fetchDashboardData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete purchase order"
      );
    }
  };

  const handleSubmitPO = async (order) => {
    if (!window.confirm(`Submit PO ${order.po_number} for approval?`)) {
      return;
    }

    try {
      await api.patch(`/procurement/pos/${order.id}`, {
        status: "pending_approval",
      });
      toast.success("Purchase order submitted for approval!");
      fetchDashboardData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit purchase order"
      );
    }
  };

  const handleSendToVendor = async (order) => {
    const vendorName = order.vendor?.name || "vendor";
    const vendorEmail = order.vendor?.email;
    const vendorPhone = order.vendor?.phone;
    
    if (!vendorEmail && !vendorPhone) {
      toast.error("Vendor has no email or phone number configured");
      return;
    }

    const message = `Send PO ${order.po_number} to ${vendorName}?\n\n` +
      (vendorEmail ? `📧 Email: ${vendorEmail}\n` : '') +
      (vendorPhone ? `📱 WhatsApp: ${vendorPhone}\n` : '') +
      `\nPO will be sent via both channels if available.`;

    if (!window.confirm(message)) {
      return;
    }

    try {
      const response = await api.post(`/procurement/pos/${order.id}/send-to-vendor`, {
        sendEmail: !!vendorEmail,
        sendWhatsapp: !!vendorPhone
      });
      
      toast.success(response.data.message || "Purchase order sent to vendor successfully!");
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send to vendor");
    }
  };

  const handleMaterialReceived = async (order) => {
    if (
      !window.confirm(
        `Confirm that materials for PO ${order.po_number} have been received?`
      )
    ) {
      return;
    }

    try {
      await api.post(
        `/procurement/purchase-orders/${order.id}/material-received`
      );
      toast.success(`Materials received for PO ${order.po_number}!`);
      fetchDashboardData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark materials as received"
      );
    }
  };

  const handleRequestGRN = async (order) => {
    const isReopenedPO = order.status === "reopened";
    const confirmMessage = isReopenedPO
      ? `Confirm that shortage materials have been received for PO ${order.po_number}?\n\nThis will send a GRN request to Inventory Department to verify and add materials to inventory.`
      : `Send GRN request for PO ${order.po_number} to Inventory Department?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const notes = isReopenedPO
        ? `Shortage materials received - GRN request for fulfillment`
        : `GRN request sent from Procurement Dashboard`;
      
      await api.post(`/procurement/purchase-orders/${order.id}/request-grn`, {
        notes,
      });
      
      if (isReopenedPO) {
        toast.success(
          `✓ Shortage materials receipt confirmed for PO ${order.po_number}!`
        );
        toast.success("GRN request sent to Inventory Department for verification");
      } else {
        toast.success(
          `✓ GRN request sent for PO ${order.po_number}!`
        );
        toast.success("Inventory Department has been notified");
      }
      
      setTimeout(() => {
        fetchDashboardData();
      }, 1000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to request GRN";
      toast.error(errorMsg);
    }
  };

  // Handle QR code scanning
  const handleQrScanSuccess = (qrData) => {
    setSelectedOrder(qrData);
    setQrDialogOpen(true);
    toast.success("Order details loaded from QR code");
  };

  // Handle creating purchase order from sales order
  const handleCreatePO = (salesOrder) => {
    navigate(
      `/procurement/purchase-orders/create?from_sales_order=${salesOrder.id}`
    );
  };

  // Handle viewing sales order details in modal
  const handleViewOrder = (order) => {
    if (!order) {
      toast.error("Order data is unavailable");
      return;
    }

    setSelectedSalesOrder(order);
    setOrderDetailModalOpen(true);
  };

  // Handle opening Create PO modal
  const handleOpenCreatePOModal = async () => {
    try {
      const [ordersRes, vendorsRes] = await Promise.all([
        api.get("/sales/orders?limit=200"),
        api.get("/procurement/vendors?limit=100"),
      ]);

      const allOrders = ordersRes.data.orders || [];
      console.log("Total orders fetched:", allOrders.length);
      console.log("Sample order:", allOrders[0]);
      
      const availableOrders = allOrders.filter(
        (order) => order.status !== "cancelled"
      );
      console.log("Available orders for procurement:", availableOrders.length);
      console.log("Available orders:", availableOrders);
      
      const vendorOptions = vendorsRes.data.vendors || [];
      const projectNames = [
        ...new Set(availableOrders.map((o) => o.project_name || "Unassigned")),
      ].filter(name => name && name.trim() !== "").sort();
      console.log("Project names extracted:", projectNames);
      
      setSalesOrdersForPO(availableOrders);
      setAllSOForProjecting(availableOrders);
      setVendorOptionsForPO(vendorOptions);
      setProjectNamesForPO(projectNames);
      setFilterSOSearch("");
      setFilterSOStatus("all");
      setSelectedSOForPO(null);
      setSelectedProjectForPO("");
      setShowPOFormStep(false);
      setShowProjectStep(true);
      setPoFormData({ projectName: "", vendor: "", materialType: "fabric" });
      setCreatePOModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch sales orders:", error);
      toast.error("Failed to load sales orders");
    }
  };

  // Handle proceeding to create PO with selected sales order
  const handleProceedToCreatePO = (salesOrder) => {
    if (showProjectStep) {
      if (!selectedSOForPO) {
        toast.error("Please select a sales order");
        return;
      }
      setPoFormData({
        ...poFormData,
        projectName: selectedSOForPO.project_name || "",
      });
      setShowProjectStep(false);
      setShowPOFormStep(true);
      return;
    }

    const finalProjectName = selectedProjectForPO || poFormData.projectName || selectedSOForPO?.project_name || "";
    
    if (!poFormData.vendor) {
      toast.error("Please select a vendor");
      return;
    }

    setCreatePOModalOpen(false);
    const queryParams = new URLSearchParams({
      from_sales_order: selectedSOForPO.id,
      project_name: finalProjectName,
      vendor_id: poFormData.vendor,
      material_type: poFormData.materialType,
    });
    navigate(`/procurement/purchase-orders/create?${queryParams.toString()}`);
  };

  // Handle accepting incoming order request
  const handleAcceptOrder = async (order) => {
    if (!order) {
      toast.error(
        "Order details are unavailable. Please refresh and try again."
      );
      return;
    }

    const isDraft = order.status === "draft";
    const isReady = order.ready_for_procurement === true;

    if (!isDraft || !isReady) {
      toast.error(
        `Order ${
          order.order_number || order.id
        } cannot be accepted yet. Status: ${
          order.status || "unknown"
        }, Ready for procurement: ${isReady ? "Yes" : "No"}.`
      );
      return;
    }

    if (
      !window.confirm(
        `Confirm order ${order.order_number}?\n\nThis will change the order status to 'Confirmed' and notify the Sales department.`
      )
    ) {
      return;
    }

    try {
      const response = await api.put(
        `/procurement/sales-orders/${order.id}/accept`
      );
      toast.success(
        "Order confirmed successfully. Sales department has been notified."
      );
      fetchDashboardData();
    } catch (error) {
      console.error("Error confirming order:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to confirm order";
      const currentStatus = error.response?.data?.currentStatus;

      if (currentStatus) {
        toast.error(`${errorMsg}. Current status: ${currentStatus}`);
      } else {
        toast.error(errorMsg);
      }
    }
  };

  // Send order to inventory
  const handleSendToInventory = async (orderId) => {
    if (!window.confirm("Mark materials as received and send to inventory?")) {
      return;
    }

    try {
      await api.put(`/sales/orders/${orderId}/status`, {
        status: "materials_received",
        notes: "Materials received by procurement and sent to inventory",
      });

      toast.success("Order sent to inventory");
      fetchDashboardData();
    } catch (error) {
      console.error("Error sending to inventory:", error);
      toast.error("Failed to send to inventory");
    }
  };

  // Handle Generate Invoice
  const handleGenerateInvoice = (po) => {
    toast.success("Invoice generation feature coming soon");
    // TODO: Implement invoice generation
  };

  // Handle Show QR Code
  const handleShowQrCode = (po) => {
    setQrOrder(po);
    setQrDialogOpen(true);
  };

  // Toggle row expansion
  const toggleRowExpansion = (poId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(poId)) {
      newExpanded.delete(poId);
    } else {
      newExpanded.clear(); // Close any other expanded row
      newExpanded.add(poId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "default",
      pending_approval: "warning",
      approved: "info",
      sent_to_vendor: "primary",
      completed: "success",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
    <div className="bg-white rounded-lg border border-slate-100 p-2.5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide font-medium text-slate-500 mb-1">
            {label}
          </p>
          <p className="text-xl font-semibold text-slate-800">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: color + "15" }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: "#0f172a15" }}
              >
                <ShoppingBag size={22} style={{ color: "#0f172a" }} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">
                  Procurement Dashboard
                </h1>
                <p className="text-xs text-slate-500 mt-0">
                  Manage orders, vendors & supply chain
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => navigate("/procurement/vendor-management")}
                className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium text-xs"
              >
                <Building size={16} /> Vendors
              </button>
              <button
                onClick={handleOpenCreatePOModal}
                className="flex items-center gap-2 px-3 py-1.5 text-white rounded-lg transition font-medium text-xs shadow-sm hover:shadow-md"
                style={{ backgroundColor: "#0f172a" }}
              >
                <Plus size={16} /> Create PO
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <StatCard
            icon={ShoppingCart}
            label="Total Purchase Orders"
            value={stats.totalPOs}
            color="#3b82f6"
            subtitle="All time"
          />
          <StatCard
            icon={Clock}
            label="Pending Orders"
            value={stats.pendingOrders}
            color="#f59e0b"
            subtitle="Awaiting action"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed POs"
            value={stats.completedPOs || 0}
            color="#10b981"
            subtitle="This month"
          />
          <StatCard
            icon={DollarSign}
            label="Total Spend"
            value={`₹${(stats.totalSpend / 100000).toFixed(1)}L`}
            color="#8b5cf6"
            subtitle="YTD"
          />
        </div>

        {/* Filter & Controls Bar */}
        <div className="flex gap-2 mb-3 flex-wrap items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs font-medium bg-white"
          >
            <option value="all">All Orders</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="sent_to_vendor">Sent to Vendor</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => navigate("/procurement/reports")}
            className="flex items-center gap-2 px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium text-xs"
          >
            <BarChart3 size={16} /> Reports
          </button>
          <button
            onClick={() => fetchDashboardData()}
            disabled={loading}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white transition font-medium text-xs disabled:opacity-50"
            style={{ backgroundColor: "#0f172a" }}
          >
            {loading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </button>
          <button
            onClick={() => navigate("/procurement/reports")}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white transition font-medium text-xs ml-auto"
            style={{ backgroundColor: "#06b6d4" }}
          >
            <Download size={16} /> Export
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-3 border-b border-slate-200 overflow-x-auto">
          {[
            {
              label: "Incoming",
              count: incomingOrders.length + incomingPurchaseOrders.length,
              icon: TrendingUp,
            },
            {
              label: "Purchase Orders",
              count: purchaseOrders.length,
              icon: Receipt,
            },
            { label: "Vendors", count: vendors.length, icon: Building },
            {
              label: "Pending Requests",
              count: pendingRequests.length,
              icon: FaClipboardList,
            },
            {
              label: "Excess Approvals",
              count: excessApprovals.length,
              icon: AlertTriangle,
            },
            {
              label: "Vendor Returns",
              count: vendorReturns.length,
              icon: Truck,
            },
            {
              label: "Credit Notes",
              count: creditNotes.length,
              icon: FaMoneyBillWave,
            },
          ].map((tab, idx) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={idx}
                onClick={() => setTabValue(idx)}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-xs transition border-b-2 whitespace-nowrap ${
                  tabValue === idx
                    ? "border-blue-500 text-slate-800"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                <TabIcon size={16} />
                {tab.label}{" "}
                <span className="ml-1 px-2 py-0 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {/* Incoming Orders Tab */}
          {tabValue === 0 && (
            <div className="space-y-3">
              {incomingOrders.length === 0 &&
              incomingPurchaseOrders.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    No Incoming Orders
                  </p>
                  <p className="text-xs text-slate-500">
                    Check back later or create a new purchase order
                  </p>
                </div>
              ) : (
                <>
                  {/* Sales Orders Section */}
                  {incomingOrders.length > 0 && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1.5 rounded-lg"
                            style={{ backgroundColor: "#3b82f615" }}
                          >
                            <ShoppingCart
                              size={16}
                              style={{ color: "#3b82f6" }}
                            />
                          </div>
                          <h3 className="text-sm font-semibold text-slate-800">
                            Sales Orders{" "}
                            <span className="text-xs text-slate-500">
                              ({incomingOrders.length})
                            </span>
                          </h3>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-700">
                                Project Name
                                
                              </th>
                              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-700">
                                Customer
                              </th>
                              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-700">
                                Product
                              </th>
                              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-700">
                                Qty
                              </th>
                              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-700">
                                Material
                              </th>
                              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-700">
                                Status
                              </th>
                              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-700">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {incomingOrders.map((order) => (
                              <tr
                                key={order.id}
                                className="hover:bg-slate-50 transition"
                              >
                               
                                <td className="px-3 py-1.5 text-xs">
                                  <p className="font-medium text-slate-800">
                                   {order.project_name || "-"}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0">
                                    {order.order_number}
                                  </p>
                                </td>
                                <td className="px-3 py-1.5 text-xs">
                                  <p className="font-medium text-slate-800">
                                    {typeof order.customer === "object"
                                      ? order.customer?.name
                                      : order.customer}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0">
                                    {new Date(
                                      order.created_at
                                    ).toLocaleDateString()}
                                  </p>
                                </td>
                                <td className="px-3 py-1.5 text-xs">
                                  <p className="text-slate-800">
                                    {order.garment_specifications
                                      ?.product_name ||
                                      order.product_name ||
                                      "N/A"}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0">
                                    {order.garment_specifications
                                      ?.product_type || "N/A"}
                                  </p>
                                </td>
                                <td className="px-3 py-1.5 text-xs font-semibold text-slate-800">
                                  {order.total_quantity || 0}
                                </td>
                                <td className="px-3 py-1.5 text-xs">
                                  <div className="space-y-0.5">
                                    {order.garment_specifications
                                      ?.fabric_type && (
                                      <p className="text-slate-800">
                                        <span className="text-slate-500">
                                          Fabric:
                                        </span>{" "}
                                        {
                                          order.garment_specifications
                                            .fabric_type
                                        }
                                      </p>
                                    )}
                                    {order.garment_specifications?.color && (
                                      <p className="text-slate-800">
                                        <span className="text-slate-500">
                                          Color:
                                        </span>{" "}
                                        {order.garment_specifications.color}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-1.5 text-xs">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-xs ${
                                      order.status === "confirmed"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {order.status === "confirmed" ? (
                                      <CheckCircle size={12} />
                                    ) : (
                                      <Clock size={12} />
                                    )}
                                    {order.status === "draft"
                                      ? "Pending"
                                      : "Approved"}
                                  </span>
                                </td>
                                <td className="px-3 py-1.5 text-xs">
                                  <div className="flex gap-1 flex-wrap items-center">
                                    {/* View Order Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleViewOrder(order);
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-blue-100 transition text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                                      title="View order details before creating PO"
                                      style={{ outline: 'none' }}
                                    >
                                      <Eye size={14} />
                                    </button>
                                    
                                    {/* Accept Order Button - Only for Draft orders */}
                                    {order.status === "draft" && (
                                      <button
                                        onClick={() => handleAcceptOrder(order)}
                                        className="p-1.5 rounded-lg hover:bg-green-100 transition text-green-600 hover:text-green-700 font-medium"
                                        title="Accept order (change status to Confirmed)"
                                      >
                                        <CheckCircle size={14} />
                                      </button>
                                    )}
                                    
                                    {/* Create PO Button - For Confirmed orders (can create multiple) */}
                                    {order.status === "confirmed" && (
                                      <div className="relative">
                                        <button
                                          onClick={() => handleCreatePO(order)}
                                          className="p-1.5 rounded-lg hover:bg-purple-100 transition text-purple-600 hover:text-purple-700 font-medium relative"
                                          title={`Create purchase order (${poCountByOrder[order.id] || 0} PO${poCountByOrder[order.id] !== 1 ? "s" : ""} exist${poCountByOrder[order.id] !== 1 ? "" : "s"}, you can create more)`}
                                        >
                                          <Plus size={14} />
                                        </button>
                                        {/* Badge showing PO count if any exist */}
                                        {poCountByOrder[order.id] > 0 && (
                                          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-purple-600 rounded-full">
                                            {poCountByOrder[order.id]}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Purchase Orders Section */}
                  {incomingPurchaseOrders.length > 0 && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1.5 rounded-lg"
                            style={{ backgroundColor: "#8b5cf615" }}
                          >
                            <Receipt size={16} style={{ color: "#8b5cf6" }} />
                          </div>
                          <h3 className="text-sm font-semibold text-slate-800">
                            Incoming Purchase Orders{" "}
                            <span className="text-xs text-slate-500">
                              ({incomingPurchaseOrders.length})
                            </span>
                          </h3>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-700">
                                PO #
                              </th>
                              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-700">
                                Vendor
                              </th>
                              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-700">
                                Amount
                              </th>
                              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-700">
                                Status
                              </th>
                              <th className="px-3 py-1 text-left text-xs font-semibold text-slate-700">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {incomingPurchaseOrders.map((po) => (
                              <tr
                                key={po.id}
                                className="hover:bg-slate-50 transition"
                              >
                                <td className="px-3 py-1.5 text-xs font-semibold text-slate-800">
                                  {po.po_number}
                                </td>
                                <td className="px-3 py-1.5 text-xs text-slate-800">
                                  {po.vendor?.vendor_name || po.vendor_id}
                                </td>
                                <td className="px-3 py-1.5 text-xs font-semibold text-slate-800">
                                  ₹{(po.total_amount / 100).toFixed(0)}
                                </td>
                                <td className="px-3 py-1.5 text-xs">
                                  <span
                                    className={`inline-flex px-2 py-0.5 rounded-full font-medium text-xs ${
                                      po.status === "draft"
                                        ? "bg-slate-100 text-slate-700"
                                        : po.status === "pending_approval"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {po.status.replace(/_/g, " ")}
                                  </span>
                                </td>
                                <td className="px-3 py-1.5 text-xs">
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/procurement/purchase-orders/${po.id}`
                                      )
                                    }
                                    className="p-1 rounded-lg hover:bg-slate-100 transition text-blue-600"
                                    title="View"
                                  >
                                    <Eye size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Purchase Orders Tab - Full Featured Table */}
          {tabValue === 1 && (
            <div className="space-y-3">
              {/* Summary Cards */}
              {poSummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      Total Orders
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {poSummary.total_orders}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      Draft
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {poSummary.draft_orders}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      Pending
                    </p>
                    <p className="text-lg font-semibold text-amber-600">
                      {poSummary.pending_approval_orders}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      Sent
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {poSummary.sent_orders}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      Received
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {poSummary.received_orders}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm md:col-span-2 lg:col-span-1">
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      Total Value
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {formatINR(poSummary.total_value)}
                    </p>
                  </div>
                </div>
              )}

              {/* Filter & Search Section */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search by PO Number, Vendor, Project..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg pl-8 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800 placeholder-slate-400 transition-all text-xs"
                    />
                    <Search
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400"
                      size={14}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative column-menu-container">
                      <button
                        onClick={() => setShowColumnMenu(!showColumnMenu)}
                        className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg transition-all font-medium text-xs whitespace-nowrap"
                      >
                        <FaColumns size={14} />
                        <span>Columns</span>
                        <FaChevronDown
                          size={12}
                          className={`transition-transform ${
                            showColumnMenu ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Column Menu Dropdown */}
                      {showColumnMenu && (
                        <div className="absolute right-0 mt-1 w-60 bg-white rounded-lg shadow-lg z-50 border border-slate-100">
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-slate-800 text-xs">
                                Manage Columns
                              </h3>
                              <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                                {visibleColumns.length}/
                                {AVAILABLE_COLUMNS.length}
                              </span>
                            </div>

                            <div className="space-y-1 max-h-72 overflow-y-auto mb-2">
                              {AVAILABLE_COLUMNS.map((column) => (
                                <label
                                  key={column.id}
                                  className={`flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-xs ${
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
                                  <span className="text-slate-700">
                                    {column.label}
                                  </span>
                                  {column.alwaysVisible && (
                                    <span className="text-xs text-slate-400 ml-auto">
                                      (Required)
                                    </span>
                                  )}
                                </label>
                              ))}
                            </div>

                            <div className="flex gap-1 pt-1 border-t border-slate-100">
                              <button
                                onClick={showAllColumns}
                                className="flex-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded transition-all font-medium"
                              >
                                Show All
                              </button>
                              <button
                                onClick={resetColumns}
                                className="flex-1 px-2 py-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded transition-all font-medium"
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
                      className="flex items-center gap-1 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all font-medium text-xs whitespace-nowrap"
                    >
                      <Search size={14} />
                      <span>Filters</span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${
                          showFilters ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {showFilters && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilterPO}
                        onChange={(e) => setStatusFilterPO(e.target.value)}
                        className="w-full p-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800 transition-all"
                      >
                        <option value="all">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="pending_approval">
                          Pending Approval
                        </option>
                        <option value="approved">Approved</option>
                        <option value="sent">Sent to Vendor</option>
                        <option value="received">Received</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full p-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800 transition-all"
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
                        className="w-full p-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800 transition-all"
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
                        className="w-full p-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Purchase Orders Table */}
              <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-4">
                    <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-800 mb-1">
                      No Purchase Orders
                    </p>
                    <p className="text-xs text-slate-500">
                      Create your first purchase order to get started
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          {isColumnVisible("po_number") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Project Name
                            </th>
                          )}
                          {isColumnVisible("po_date") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              PO Date
                            </th>
                          )}
                          {isColumnVisible("vendor") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Vendor
                            </th>
                          )}
                          {isColumnVisible("linked_so") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Linked SO
                            </th>
                          )}
                          {isColumnVisible("customer") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Customer
                            </th>
                          )}
                          {isColumnVisible("project_name") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Project
                            </th>
                          )}
                          {isColumnVisible("total_quantity") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Qty
                            </th>
                          )}
                          {isColumnVisible("final_amount") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Total Amount
                            </th>
                          )}
                          {isColumnVisible("expected_delivery_date") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Expected Delivery
                            </th>
                          )}
                          {isColumnVisible("status") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Status
                            </th>
                          )}
                          {isColumnVisible("priority") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Priority
                            </th>
                          )}
                          {isColumnVisible("created_by") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Created By
                            </th>
                          )}
                          {isColumnVisible("actions") && (
                            <th className="px-3 py-1 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider sticky right-0 bg-slate-50">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredOrders.map((po) => (
                          <React.Fragment key={po.id}>
                            {/* Main Row */}
                            <tr className="hover:bg-slate-50 transition">
                              {isColumnVisible("po_number") && (
                                <td className="px-3 py-1.5 text-xs font-semibold text-slate-800">
                                  <p>{po.project_name}</p>
                                 <span className="text-xs text-slate-600"> {po.po_number}</span>
                                </td>
                              )}
                              {isColumnVisible("po_date") && (
                                <td className="px-3 py-1.5 text-xs text-slate-600">
                                  {formatDate(po.po_date)}
                                </td>
                              )}
                              {isColumnVisible("vendor") && (
                                <td className="px-3 py-1.5 text-xs text-slate-800">
                                  {po.vendor?.name ||
                                    po.vendor?.vendor_name ||
                                    "N/A"}
                                </td>
                              )}
                              {isColumnVisible("linked_so") && (
                                <td className="px-3 py-1.5 text-xs text-slate-800">
                                  {po.linked_sales_order_id || "N/A"}
                                </td>
                              )}
                              {isColumnVisible("customer") && (
                                <td className="px-3 py-1.5 text-xs text-slate-800">
                                  {po.customer?.name || "N/A"}
                                </td>
                              )}
                              {isColumnVisible("project_name") && (
                                <td className="px-3 py-1.5 text-xs text-slate-800">
                                  {po.project_name || "N/A"}
                                </td>
                              )}
                              {isColumnVisible("total_quantity") && (
                                <td className="px-3 py-1.5 text-xs font-semibold text-slate-800">
                                  {po.total_quantity || 0}
                                </td>
                              )}
                              {isColumnVisible("final_amount") && (
                                <td className="px-3 py-1.5 text-xs font-semibold text-slate-800">
                                  {formatINR(
                                    po.final_amount || po.total_amount
                                  )}
                                </td>
                              )}
                              {isColumnVisible("expected_delivery_date") && (
                                <td className="px-3 py-1.5 text-xs text-slate-600">
                                  {formatDate(po.expected_delivery_date)}
                                </td>
                              )}
                              {isColumnVisible("status") && (
                                <td className="px-3 py-1.5 text-xs">
                                  {getStatusBadge(po.status)}
                                </td>
                              )}
                              {isColumnVisible("priority") && (
                                <td className="px-3 py-1.5 text-xs">
                                  {getPriorityBadge(po.priority)}
                                </td>
                              )}
                              {isColumnVisible("created_by") && (
                                <td className="px-3 py-1.5 text-xs text-slate-600">
                                  {po.created_by || "N/A"}
                                </td>
                              )}
                              {isColumnVisible("actions") && (
                                <td className="px-3 py-1.5 text-xs sticky right-0 bg-white">
                                  <button
                                    onClick={() => toggleRowExpansion(po.id)}
                                    className={`p-1 rounded-lg hover:bg-slate-100 transition text-slate-600 ${
                                      expandedRows.has(po.id)
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                    title={
                                      expandedRows.has(po.id)
                                        ? "Collapse"
                                        : "Expand Actions"
                                    }
                                  >
                                    <ChevronDown
                                      size={16}
                                      className="transition-transform"
                                    />
                                  </button>
                                </td>
                              )}
                            </tr>

                            {/* Expanded Row - Actions Panel */}
                            {expandedRows.has(po.id) && (
                              <tr className="bg-slate-50">
                                <td
                                  colSpan={
                                    Object.keys(AVAILABLE_COLUMNS).length
                                  }
                                  className="px-3 py-3"
                                >
                                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
                                      <Receipt
                                        size={16}
                                        className="text-slate-600"
                                      />
                                      <h4 className="text-sm font-semibold text-slate-800">
                                        Available Actions
                                      </h4>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                      {/* View Button */}
                                      <button
                                        onClick={() => {
                                          handleViewPO(po);
                                          setExpandedRows(new Set());
                                        }}
                                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all group"
                                        title="View PO details"
                                      >
                                        <Eye
                                          size={16}
                                          className="text-blue-600 group-hover:scale-110 transition-transform"
                                        />
                                        <span className="text-xs font-medium text-blue-700">
                                          View
                                        </span>
                                      </button>

                                      {/* Submit Button */}
                                      {po.status === "draft" && (
                                        <button
                                          onClick={() => {
                                            handleSubmitPO(po);
                                            setExpandedRows(new Set());
                                          }}
                                          className="flex flex-col items-center gap-1 p-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 transition-all group"
                                          title="Submit for approval"
                                        >
                                          <FaCheckCircle
                                            size={14}
                                            className="text-green-600 group-hover:scale-110 transition-transform"
                                          />
                                          <span className="text-xs font-medium text-green-700">
                                            Submit to Admin
                                          </span>
                                        </button>
                                      )}

                                      {/* Send to Vendor Button */}
                                      {po.status === "approved" && (
                                        <button
                                          onClick={() => {
                                            handleSendToVendor(po);
                                            setExpandedRows(new Set());
                                          }}
                                          className="flex flex-col items-center gap-1 p-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 transition-all group"
                                          title="Send approved PO to vendor via Email & WhatsApp"
                                        >
                                          <Truck
                                            size={16}
                                            className="text-green-600 group-hover:scale-110 transition-transform"
                                          />
                                          <span className="text-xs font-medium text-green-700">
                                            Send to Vendor
                                          </span>
                                        </button>
                                      )}

                                      {/* Material Received Button */}
                                      {po.status === "sent" && (
                                        <button
                                          onClick={() => {
                                            handleMaterialReceived(po);
                                            setExpandedRows(new Set());
                                          }}
                                          className="flex flex-col items-center gap-1 p-2 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all group"
                                          title="Mark as material received"
                                        >
                                          <FaBoxOpen
                                            size={14}
                                            className="text-teal-600 group-hover:scale-110 transition-transform"
                                          />
                                          <span className="text-xs font-medium text-teal-700">
                                            Received
                                          </span>
                                        </button>
                                      )}

                                      {/* Request GRN Button */}
                                      {(po.status === "sent" || 
                                        po.status === "acknowledged" ||
                                        po.status === "partial_received" ||
                                        po.status === "received" ||
                                        po.status === "reopened") && (
                                        <button
                                          onClick={() => {
                                            handleRequestGRN(po);
                                            setExpandedRows(new Set());
                                          }}
                                          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all group ${
                                            po.status === "reopened"
                                              ? "bg-purple-50 hover:bg-purple-100 border border-purple-200"
                                              : "bg-orange-50 hover:bg-orange-100 border border-orange-200"
                                          }`}
                                          title={po.status === "reopened" ? "Shortage materials received - Request GRN" : "Request GRN creation"}
                                        >
                                          <Receipt
                                            size={16}
                                            className={`group-hover:scale-110 transition-transform ${
                                              po.status === "reopened" ? "text-purple-600" : "text-orange-600"
                                            }`}
                                          />
                                          <span className={`text-xs font-medium ${
                                            po.status === "reopened" ? "text-purple-700" : "text-orange-700"
                                          }`}>
                                            {po.status === "reopened" ? "Materials Received" : "Request GRN"}
                                          </span>
                                        </button>
                                      )}

                                      {/* Create GRN Button - Direct creation */}
                                      {(po.status === "sent" || 
                                        po.status === "acknowledged" ||
                                        po.status === "partial_received" ||
                                        po.status === "received" ||
                                        po.status === "grn_requested") && (
                                        <button
                                          onClick={() => {
                                            navigate(`/inventory/grn/create?from_po=${po.id}`);
                                            setExpandedRows(new Set());
                                          }}
                                          className="flex flex-col items-center gap-1 p-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 transition-all group"
                                          title="Create GRN for this PO"
                                        >
                                          <Package
                                            size={16}
                                            className="text-green-600 group-hover:scale-110 transition-transform"
                                          />
                                          <span className="text-xs font-medium text-green-700">
                                            Create GRN
                                          </span>
                                        </button>
                                      )}

                                      {/* Generate Invoice */}
                                      <button
                                        onClick={() => {
                                          handleGenerateInvoice(po);
                                          setExpandedRows(new Set());
                                        }}
                                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all group"
                                        title="Generate invoice"
                                      >
                                        <FaFileInvoice
                                          size={14}
                                          className="text-slate-600 group-hover:scale-110 transition-transform"
                                        />
                                        <span className="text-xs font-medium text-slate-700">
                                          Invoice
                                        </span>
                                      </button>

                                      {/* QR Code Button */}
                                      <button
                                        onClick={() => {
                                          handleShowQrCode(po);
                                          setExpandedRows(new Set());
                                        }}
                                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all group"
                                        title="Show QR code"
                                      >
                                        <QrCode
                                          size={16}
                                          className="text-purple-600 group-hover:scale-110 transition-transform"
                                        />
                                        <span className="text-xs font-medium text-purple-700">
                                          QR
                                        </span>
                                      </button>

                                      {/* Print Button */}
                                      <button
                                        onClick={() => {
                                          window.print();
                                          setExpandedRows(new Set());
                                        }}
                                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all group"
                                        title="Print PO"
                                      >
                                        <FaPrint
                                          size={14}
                                          className="text-indigo-600 group-hover:scale-110 transition-transform"
                                        />
                                        <span className="text-xs font-medium text-indigo-700">
                                          Print
                                        </span>
                                      </button>

                                      {/* Delete Button */}
                                      <button
                                        onClick={() => {
                                          handleDeletePO(po);
                                          setExpandedRows(new Set());
                                        }}
                                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition-all group"
                                        title="Delete PO"
                                      >
                                        <Trash2
                                          size={16}
                                          className="text-red-600 group-hover:scale-110 transition-transform"
                                        />
                                        <span className="text-xs font-medium text-red-700">
                                          Delete
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pending Requests Tab */}
          {tabValue === 3 && (
            <div>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-lg">
                  <FaCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    No Pending Requests
                  </p>
                  <p className="text-xs text-slate-500">
                    All shortage and overage requests have been resolved
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => {
                    const isShortage = request.stage_key === "grn_shortage_complaint";
                    const metadata = request.metadata || {};
                    const items = metadata.items_affected || [];
                    
                    return (
                      <div
                        key={request.id}
                        className={`border-2 rounded-lg p-4 ${
                          isShortage
                            ? "border-red-200 bg-red-50"
                            : "border-yellow-200 bg-yellow-50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {isShortage ? (
                                <FaExclamationCircle className="text-red-600 w-5 h-5" />
                              ) : (
                                <FaBoxOpen className="text-yellow-600 w-5 h-5" />
                              )}
                              <h3 className="text-base font-bold text-slate-800">
                                {isShortage ? "⚠️ Material Shortage" : "📦 Material Overage"}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-600">
                              {request.stage_label}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isShortage
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {request.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-white rounded-lg border border-slate-200">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">GRN Number</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {metadata.grn_number || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">PO Number</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {metadata.po_number || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Vendor</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {metadata.vendor_name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Total Value</p>
                            <p className="text-sm font-bold text-blue-600">
                              ₹{metadata.total_shortage_value || metadata.total_overage_value || "0"}
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-xs font-semibold text-slate-700 mb-2">
                            Affected Items ({items.length})
                          </p>
                          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <table className="w-full text-xs">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="px-2 py-2 text-left font-semibold text-slate-700">Material</th>
                                  <th className="px-2 py-2 text-center font-semibold text-slate-700">Ordered</th>
                                  <th className="px-2 py-2 text-center font-semibold text-slate-700">Invoiced</th>
                                  <th className="px-2 py-2 text-center font-semibold text-slate-700">Received</th>
                                  <th className="px-2 py-2 text-center font-semibold text-slate-700">
                                    {isShortage ? "Shortage" : "Overage"}
                                  </th>
                                  <th className="px-2 py-2 text-right font-semibold text-slate-700">Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {items.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-2 py-2 font-medium text-slate-800">
                                      {item.material_name}
                                    </td>
                                    <td className="px-2 py-2 text-center text-slate-600">
                                      {item.ordered_qty}
                                    </td>
                                    <td className="px-2 py-2 text-center text-slate-600">
                                      {item.invoiced_qty}
                                    </td>
                                    <td className="px-2 py-2 text-center text-slate-600">
                                      {item.received_qty}
                                    </td>
                                    <td className={`px-2 py-2 text-center font-bold ${
                                      isShortage ? "text-red-600" : "text-yellow-600"
                                    }`}>
                                      {item.shortage_qty || item.overage_qty}
                                    </td>
                                    <td className="px-2 py-2 text-right font-semibold text-blue-600">
                                      ₹{item.shortage_value || item.overage_value}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-semibold text-blue-800 mb-1">
                            Action Required:
                          </p>
                          <p className="text-xs text-blue-700">
                            {metadata.action_required}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex gap-2">
                            {isShortage ? (
                              <>
                                <button
                                  onClick={() => handleReopenPOAndSendRequest(request.id)}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold text-sm"
                                  title="Reopen PO and send vendor request for shortage materials"
                                >
                                  <FaRedo className="w-4 h-4" />
                                  Request Shortage Materials
                                </button>
                                <button
                                  onClick={() => {
                                    if (metadata.grn_id) {
                                      navigate(`/procurement/grn/${metadata.grn_id}`);
                                    } else {
                                      toast.error("GRN ID not found");
                                    }
                                  }}
                                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm"
                                  title="View GRN details"
                                >
                                  <Eye className="w-4 h-4" />
                                  View GRN
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedOverageRequest(request);
                                    setCreditNoteModalOpen(true);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm"
                                  title="Request credit note for overage materials"
                                >
                                  <FaMoneyBillWave className="w-4 h-4" />
                                  Request Credit Note
                                </button>
                                <button
                                  onClick={() => {
                                    if (metadata.grn_id) {
                                      navigate(`/procurement/grn/${metadata.grn_id}`);
                                    } else {
                                      toast.error("GRN ID not found");
                                    }
                                  }}
                                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm"
                                  title="View GRN details"
                                >
                                  <Eye className="w-4 h-4" />
                                  View GRN
                                </button>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => navigate(`/procurement/pos/${request.entity_id}`)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition font-semibold text-sm"
                            title="View Purchase Order details"
                          >
                            <Eye className="w-4 h-4" />
                            View Purchase Order
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Excess Approvals Tab */}
          {tabValue === 4 && (
            <div>
              {excessApprovals.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-lg">
                  <FaCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    No Pending Excess Approvals
                  </p>
                  <p className="text-xs text-slate-500">
                    All excess material approvals have been processed
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {excessApprovals.map((approval) => {
                    const metadata = approval.metadata || {};
                    return (
                      <div
                        key={approval.id}
                        className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-slate-800">
                              📦 Excess Material Approval
                            </h3>
                            <p className="text-sm text-slate-600">
                              {approval.stage_label}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {approval.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 p-3 bg-white rounded-lg border border-slate-200">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">PO Number</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {metadata.po_number || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Vendor</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {metadata.vendor_name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Created</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {new Date(approval.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/procurement/pos/${approval.entity_id}`)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition font-semibold text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Vendor Returns Tab */}
          {tabValue === 5 && (
            <div>
              {vendorReturns.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-lg">
                  <FaCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    No Vendor Returns
                  </p>
                  <p className="text-xs text-slate-500">
                    No materials have been returned to vendors
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorReturns.map((vendorReturn) => {
                    return (
                      <div
                        key={vendorReturn.id}
                        className="border-2 border-orange-200 bg-orange-50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-slate-800">
                              🔄 Vendor Return
                            </h3>
                            <p className="text-sm text-slate-600">
                              Return #{vendorReturn.return_number}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            vendorReturn.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            vendorReturn.status === 'approved' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {vendorReturn.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-white rounded-lg border border-slate-200">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Return Type</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {vendorReturn.return_type || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Total Value</p>
                            <p className="text-sm font-bold text-blue-600">
                              ₹{vendorReturn.total_value || "0"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Items Count</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {vendorReturn.items?.length || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Created</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {new Date(vendorReturn.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/procurement/vendor-returns/${vendorReturn.id}`)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition font-semibold text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Vendors Tab */}
          {tabValue === 2 && (
            <div>
              {vendors.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <Building className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    No Vendors Found
                  </p>
                  <p className="text-xs text-slate-500">
                    Add vendors to manage procurement
                  </p>
                  <button
                    onClick={() => navigate("/procurement/vendor-management")}
                    className="mt-2 px-3 py-1.5 text-white rounded-lg transition font-semibold text-xs"
                    style={{ backgroundColor: "#0f172a" }}
                  >
                    Manage Vendors
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {vendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-800">
                            {vendor.vendor_name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {vendor.vendor_code}
                          </p>
                        </div>
                        <Star size={16} className="text-amber-500" />
                      </div>

                      <div className="space-y-1 mb-2 text-xs">
                        {vendor.contact_person && (
                          <p className="text-slate-700">
                            <span className="text-slate-500">Contact:</span>{" "}
                            {vendor.contact_person}
                          </p>
                        )}
                        {vendor.email && (
                          <p className="text-slate-700 flex items-center gap-1">
                            <Mail size={12} className="text-slate-400" />{" "}
                            {vendor.email}
                          </p>
                        )}
                        {vendor.phone && (
                          <p className="text-slate-700 flex items-center gap-1">
                            <Phone size={12} className="text-slate-400" />{" "}
                            {vendor.phone}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          navigate("/procurement/vendor-management")
                        }
                        className="w-full py-1 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition font-medium text-xs"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Credit Notes Tab */}
          {tabValue === 6 && (
            <div>
              {creditNotes.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-lg">
                  <FaMoneyBillWave className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    No Credit Notes
                  </p>
                  <p className="text-xs text-slate-500">
                    Credit notes for material overage will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {creditNotes.map((note) => {
                    const statusColors = {
                      draft: 'bg-slate-100 text-slate-700',
                      issued: 'bg-blue-100 text-blue-700',
                      accepted: 'bg-green-100 text-green-700',
                      rejected: 'bg-red-100 text-red-700',
                      settled: 'bg-purple-100 text-purple-700',
                      cancelled: 'bg-gray-100 text-gray-700'
                    };
                    
                    return (
                      <div
                        key={note.id}
                        className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FaMoneyBillWave className="text-blue-600 w-5 h-5" />
                              <h3 className="text-base font-bold text-slate-800">
                                {note.credit_note_number}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-600">
                              GRN: {note.GRN?.grn_number} | PO: {note.PurchaseOrder?.po_number}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[note.status] || statusColors.draft}`}>
                            {note.status?.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-white rounded-lg border border-slate-200">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Vendor</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {note.Vendor?.vendor_name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Type</p>
                            <p className="text-sm font-semibold text-slate-800 capitalize">
                              {note.credit_note_type?.replace('_', ' ') || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Settlement Method</p>
                            <p className="text-sm font-semibold text-slate-800 capitalize">
                              {note.settlement_method?.replace('_', ' ') || 'Pending'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Amount</p>
                            <p className="text-sm font-bold text-blue-600">
                              ₹{(note.total_amount || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/procurement/credit-notes`)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Full Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Display Modal */}
      {qrDialogOpen && qrOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                PO QR Code
              </h3>
              <button
                onClick={() => setQrDialogOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              ></button>
            </div>
            <div className="p-4">
              <QRCodeDisplay
                data={qrOrder}
                title={`PO: ${qrOrder.po_number}`}
                subtitle={qrOrder.vendor?.name || "Purchase Order"}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sales Order Detail Modal */}
      <SalesOrderDetailModal
        isOpen={orderDetailModalOpen}
        onClose={() => {
          setOrderDetailModalOpen(false);
          setSelectedSalesOrder(null);
        }}
        order={selectedSalesOrder}
        onApprove={handleAcceptOrder}
        onCreatePO={handleCreatePO}
      />

      {/* Create PO Modal - Multi-step */}
      {createPOModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Create Purchase Order</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {showProjectStep
                    ? "Step 1: Select Sales Order"
                    : "Step 2: Configure PO Details"}
                </p>
              </div>
              <button
                onClick={() => setCreatePOModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl transition"
              >
                ×
              </button>
            </div>

            {/* Sales Order Selection Step */}
            {showProjectStep && (
              <div className="p-4 border-b border-slate-200 space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Select Sales Order <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSOForPO?.id || ""}
                    onChange={(e) => {
                      const selectedOrder = allSOForProjecting.find(o => o.id === parseInt(e.target.value));
                      setSelectedSOForPO(selectedOrder);
                      setSelectedProjectForPO(selectedOrder?.project_name || "");
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Choose a Sales Order --</option>
                    {allSOForProjecting.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.order_number} - {order.customer?.name || order.customer_name || 'N/A'} 
                        {order.project_name ? ` (${order.project_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedSOForPO && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-900">
                      ✓ <strong>Selected:</strong> {selectedSOForPO.order_number}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Customer: {selectedSOForPO.customer?.name || selectedSOForPO.customer_name || 'N/A'}
                    </p>
                    {selectedSOForPO.project_name && (
                      <p className="text-xs text-green-700">
                        Project: {selectedSOForPO.project_name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}



            {/* Content - Sales Orders List or Form */}
            <div className="p-4">
              {showPOFormStep ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    {selectedProjectForPO && (
                      <p className="text-sm text-blue-900">
                        <strong>Project:</strong> {selectedProjectForPO}
                      </p>
                    )}
                    <p className="text-sm text-blue-900 mt-1">
                      <strong>Sales Order:</strong> {selectedSOForPO?.order_number}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Project Name
                      </label>
                      <input
                        type="text"
                        placeholder={selectedProjectForPO ? "Project name (auto-filled from selected project)..." : "Enter project name or leave blank"}
                        value={selectedProjectForPO || poFormData.projectName}
                        onChange={(e) => !selectedProjectForPO && setPoFormData({...poFormData, projectName: e.target.value})}
                        readOnly={!!selectedProjectForPO}
                        className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm ${selectedProjectForPO ? 'bg-slate-50' : ''}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Vendor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={poFormData.vendor}
                        onChange={(e) =>
                          setPoFormData({
                            ...poFormData,
                            vendor: e.target.value,
                            projectName: selectedProjectForPO,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select vendor</option>
                        {vendorOptionsForPO.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Material Type
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="materialType"
                            value="fabric"
                            checked={poFormData.materialType === "fabric"}
                            onChange={(e) =>
                              setPoFormData({
                                ...poFormData,
                                materialType: e.target.value,
                                projectName: selectedProjectForPO,
                              })
                            }
                          />
                          <span className="text-sm text-slate-700">Fabric</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="materialType"
                            value="accessories"
                            checked={poFormData.materialType === "accessories"}
                            onChange={(e) =>
                              setPoFormData({
                                ...poFormData,
                                materialType: e.target.value,
                                projectName: selectedProjectForPO,
                              })
                            }
                          />
                          <span className="text-sm text-slate-700">
                            Accessories
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer with Actions */}
            <div className="flex gap-2 p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0">
              <button
                onClick={() => {
                  if (showPOFormStep) {
                    setShowPOFormStep(false);
                    setShowProjectStep(true);
                    setPoFormData({ projectName: "", vendor: "", materialType: "fabric" });
                  } else {
                    setCreatePOModalOpen(false);
                  }
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition font-medium text-sm text-slate-700"
              >
                {showPOFormStep ? "Back" : "Cancel"}
              </button>
              <button
                onClick={() => handleProceedToCreatePO(selectedSOForPO)}
                disabled={
                  showProjectStep ? !selectedSOForPO : !poFormData.vendor
                }
                className="flex-1 px-4 py-2 text-white rounded-lg transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  backgroundColor:
                    showProjectStep
                      ? selectedSOForPO ? "#0f172a" : "#ccc"
                      : poFormData.vendor ? "#0f172a" : "#ccc",
                }}
              >
                <Plus size={16} />
                {showPOFormStep ? "Create PO" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Note Modal */}
      <CreditNoteModal
        isOpen={creditNoteModalOpen}
        onClose={() => {
          setCreditNoteModalOpen(false);
          setSelectedOverageRequest(null);
        }}
        grnData={selectedOverageRequest}
        onSuccess={(data) => {
          setCreditNoteModalOpen(false);
          setSelectedOverageRequest(null);
          fetchDashboardData();
          
          const creditNoteNumber = data.credit_note_number || data.data?.credit_note_number;
          
          setTimeout(() => {
            const creditNoteToast = toast((t) => (
              <div className="flex flex-col gap-2">
                <p className="font-semibold">✓ Credit Note Created: {creditNoteNumber}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigate('/procurement/credit-notes');
                      toast.dismiss(t.id);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                  >
                    View Credit Notes
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="px-3 py-1 bg-slate-300 text-slate-800 rounded text-sm font-medium hover:bg-slate-400"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ), {
              duration: 8000,
              position: 'bottom-right',
              style: {
                background: '#10b981',
                color: '#fff',
              }
            });
          }, 500);
        }}
      />
    </div>
  );
};

export default ProcurementDashboard;
