import React, { useState, useEffect } from "react";
import {
  Package,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Eye,
  Plus,
  Filter,
  Download,
  RefreshCw,
  ArrowRight,
  Info,
  Zap,
  DollarSign,
  Truck,
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const GRNWorkflowDashboard = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGRNs();
  }, [filterStatus]);

  const fetchGRNs = async () => {
    try {
      setLoading(true);
      const query = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const response = await api.get(`/grn${query}`);
      setGrns(response.data.grns || []);
    } catch (error) {
      console.error("Error fetching GRNs:", error);
      toast.error("Failed to load GRNs");
    } finally {
      setLoading(false);
    }
  };

  // Workflow Status Indicator
  const WorkflowStatus = ({ grn }) => {
    const hasShortages = grn.items_received?.some(
      (item) => item.shortage_quantity > 0
    );
    const hasExcess = grn.items_received?.some(
      (item) => item.overage_quantity > 0
    );
    const allMatched = grn.items_received?.every(
      (item) => item.received_quantity === item.ordered_quantity
    );

    let workflowType = "accurate";
    let icon = <CheckCircle className="w-5 h-5 text-green-600" />;
    let label = "Accurate Qty";
    let description = "Received = Ordered";
    let color = "bg-green-50 border-green-200";
    let badge = "bg-green-100 text-green-700";

    if (hasShortages && !hasExcess) {
      workflowType = "shortage";
      icon = <TrendingDown className="w-5 h-5 text-orange-600" />;
      label = "Short Received";
      description = "Received < Ordered";
      color = "bg-orange-50 border-orange-200";
      badge = "bg-orange-100 text-orange-700";
    } else if (hasExcess && !hasShortages) {
      workflowType = "excess";
      icon = <TrendingUp className="w-5 h-5 text-blue-600" />;
      label = "Excess Received";
      description = "Received > Ordered";
      color = "bg-blue-50 border-blue-200";
      badge = "bg-blue-100 text-blue-700";
    } else if (hasShortages && hasExcess) {
      workflowType = "mixed";
      icon = <AlertTriangle className="w-5 h-5 text-red-600" />;
      label = "Mixed Variances";
      description = "Shortages + Excess";
      color = "bg-red-50 border-red-200";
      badge = "bg-red-100 text-red-700";
    }

    return { workflowType, icon, label, description, color, badge };
  };

  // GRN Card Component
  const GRNCard = ({ grn }) => {
    const workflow = WorkflowStatus({ grn });
    const vendorReturnRequired = grn.items_received?.some(
      (item) => item.shortage_quantity > 0
    );
    const excessApprovalRequired =
      grn.items_received?.some((item) => item.overage_quantity > 0) &&
      grn.verification_status !== "approved";

    return (
      <div
        className={`border rounded-lg p-5 mb-4 cursor-pointer hover:shadow-md transition ${workflow.color}`}
        onClick={() => {
          setSelectedGRN(grn);
          setShowDetailModal(true);
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="mt-1">{workflow.icon}</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{grn.grn_number}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${workflow.badge}`}
                >
                  {workflow.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                PO:{" "}
                <span className="font-mono font-bold">
                  {grn.purchaseOrder?.po_number}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Vendor:{" "}
                <span className="font-medium">
                  {grn.purchaseOrder?.vendor?.name}
                </span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-mono text-gray-700">
              {new Date(grn.received_date).toLocaleDateString()}
            </div>
            <div
              className={`text-xs mt-2 px-2 py-1 rounded-full font-medium ${
                grn.verification_status === "approved"
                  ? "bg-green-100 text-green-700"
                  : grn.verification_status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {grn.verification_status?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Workflow Details */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white bg-opacity-50 p-2 rounded">
            <div className="text-gray-600">Ordered</div>
            <div className="font-bold text-lg">
              {grn.items_received
                ?.reduce((sum, item) => sum + item.ordered_quantity, 0)
                .toFixed(2)}
            </div>
          </div>
          <div className="bg-white bg-opacity-50 p-2 rounded">
            <div className="text-gray-600">Received</div>
            <div className="font-bold text-lg">
              {grn.items_received
                ?.reduce((sum, item) => sum + item.received_quantity, 0)
                .toFixed(2)}
            </div>
          </div>
          {vendorReturnRequired && (
            <div className="bg-red-100 bg-opacity-50 p-2 rounded col-span-2">
              <div className="text-red-700 font-medium text-xs flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Vendor Return Auto-Generated
              </div>
            </div>
          )}
          {excessApprovalRequired && (
            <div className="bg-blue-100 bg-opacity-50 p-2 rounded col-span-2">
              <div className="text-blue-700 font-medium text-xs flex items-center gap-1">
                <Info className="w-4 h-4" />
                Excess Qty - Awaiting Approval
              </div>
            </div>
          )}
        </div>

        {/* Workflow Indicators */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {workflow.workflowType === "accurate" && (
              <span className="flex items-center gap-1 text-green-700 font-medium">
                <CheckCircle className="w-4 h-4" />
                Direct to Inventory
              </span>
            )}
            {workflow.workflowType === "shortage" && (
              <>
                <span className="flex items-center gap-1 text-orange-700 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  VR Generated
                </span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-orange-700 font-medium">Debit Note</span>
              </>
            )}
            {workflow.workflowType === "excess" && (
              <span className="flex items-center gap-1 text-blue-700 font-medium">
                <Info className="w-4 h-4" />
                Needs Approval
              </span>
            )}
          </div>
          <Eye className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    );
  };

  // Detail Modal Component
  const GRNDetailModal = ({ grn }) => {
    if (!grn) return null;

    const workflow = WorkflowStatus({ grn });
    const hasShortages = grn.items_received?.some(
      (item) => item.shortage_quantity > 0
    );
    const hasExcess = grn.items_received?.some(
      (item) => item.overage_quantity > 0
    );
    const totalShortageValue =
      grn.items_received?.reduce(
        (sum, item) => sum + item.shortage_quantity * item.rate,
        0
      ) || 0;
    const totalExcessValue =
      grn.items_received?.reduce(
        (sum, item) => sum + item.overage_quantity * item.rate,
        0
      ) || 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={`${workflow.color} border-b p-6`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{grn.grn_number}</h2>
                <p className="text-gray-700">
                  PO:{" "}
                  <span className="font-mono font-bold">
                    {grn.purchaseOrder?.po_number}
                  </span>
                </p>
                <p className="text-gray-700">
                  Vendor:{" "}
                  <span className="font-medium">
                    {grn.purchaseOrder?.vendor?.name}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Workflow Status Section */}
            <div className={`${workflow.color} border rounded-lg p-4 mb-6`}>
              <div className="flex items-center gap-3 mb-3">
                {workflow.icon}
                <div>
                  <h3 className="font-bold text-lg">{workflow.label}</h3>
                  <p className="text-sm text-gray-600">
                    {workflow.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity Comparison */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm mb-2">📋 Ordered Qty</div>
                <div className="text-2xl font-bold">
                  {grn.items_received
                    ?.reduce((sum, item) => sum + item.ordered_quantity, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm mb-2">
                  📊 Invoiced Qty
                </div>
                <div className="text-2xl font-bold">
                  {grn.items_received
                    ?.reduce((sum, item) => sum + item.invoiced_quantity, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="text-gray-600 text-sm mb-2">
                  📦 Received Qty
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {grn.items_received
                    ?.reduce((sum, item) => sum + item.received_quantity, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div
                className={`border rounded-lg p-4 ${
                  hasShortages
                    ? "bg-orange-50"
                    : hasExcess
                    ? "bg-blue-50"
                    : "bg-green-50"
                }`}
              >
                <div className="text-gray-600 text-sm mb-2">⚠️ Variance</div>
                <div
                  className={`text-2xl font-bold ${
                    hasShortages && !hasExcess
                      ? "text-orange-600"
                      : hasExcess && !hasShortages
                      ? "text-blue-600"
                      : "text-green-600"
                  }`}
                >
                  {hasShortages || hasExcess ? "❌ Yes" : "✅ No"}
                </div>
              </div>
            </div>

            {/* Shortage Section */}
            {hasShortages && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Shortage Detected 🔻
                </h4>
                <div className="space-y-2 text-sm">
                  {grn.items_received
                    ?.filter((item) => item.shortage_quantity > 0)
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded border border-orange-100"
                      >
                        <div className="font-medium">{item.material_name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Ordered: {item.ordered_quantity} {item.uom} |
                          Received: {item.received_quantity} {item.uom} |
                          <span className="font-bold text-orange-600">
                            {" "}
                            Short: {item.shortage_quantity} {item.uom}
                          </span>
                        </div>
                        <div className="text-xs text-orange-700 font-medium mt-1">
                          💰 Shortage Value: ₹
                          {(item.shortage_quantity * item.rate).toFixed(2)}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-3 bg-white p-3 rounded border border-orange-200">
                  <div className="font-bold text-orange-700">
                    Total Shortage Value: ₹{totalShortageValue.toFixed(2)}
                  </div>
                  <div className="text-xs text-orange-600 mt-2">
                    ✅ Action: Vendor Return (VR) Auto-Generated
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    PO Status: <span className="font-bold">short_received</span>
                  </div>
                </div>
              </div>
            )}

            {/* Excess Section */}
            {hasExcess && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Excess Received 🔺
                </h4>
                <div className="space-y-2 text-sm mb-3">
                  {grn.items_received
                    ?.filter((item) => item.overage_quantity > 0)
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded border border-blue-100"
                      >
                        <div className="font-medium">{item.material_name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Ordered: {item.ordered_quantity} {item.uom} |
                          Received: {item.received_quantity} {item.uom} |
                          <span className="font-bold text-blue-600">
                            {" "}
                            Excess: {item.overage_quantity} {item.uom}
                          </span>
                        </div>
                        <div className="text-xs text-blue-700 font-medium mt-1">
                          💰 Excess Value: ₹
                          {(item.overage_quantity * item.rate).toFixed(2)}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="bg-white p-3 rounded border border-blue-200 mb-3">
                  <div className="font-bold text-blue-700">
                    Total Excess Value: ₹{totalExcessValue.toFixed(2)}
                  </div>
                </div>

                <div className="border-t border-blue-200 pt-3">
                  <p className="text-xs text-gray-700 mb-3">
                    Two options available for handling excess quantity:
                  </p>
                  <div className="space-y-2">
                    <div className="bg-blue-100 p-3 rounded">
                      <div className="font-medium text-blue-700 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Option A: Auto-Reject & Return to Vendor
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        ✅ Action: Auto-generate Vendor Return (VR)
                        <br />
                        📋 PO Status: remains 'received' (only ordered qty
                        accepted)
                        <br />
                        🔄 Result: Excess materials returned automatically
                      </div>
                    </div>
                    <div className="bg-green-100 p-3 rounded">
                      <div className="font-medium text-green-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Option B: Request Approval to Accept Excess
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        ⏳ Status: Awaiting Management Approval
                        <br />
                        ✅ If Approved: Extra qty added to inventory
                        <br />
                        📋 PO Status: 'excess_received'
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="mb-6">
              <h4 className="font-bold mb-3">Items Details</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-3 py-2 text-left">Material</th>
                      <th className="border px-3 py-2 text-center">Ordered</th>
                      <th className="border px-3 py-2 text-center">Invoiced</th>
                      <th className="border px-3 py-2 text-center">Received</th>
                      <th className="border px-3 py-2 text-center">Variance</th>
                      <th className="border px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grn.items_received?.map((item, idx) => {
                      const variance =
                        item.received_quantity - item.ordered_quantity;
                      const variancePercent = (
                        (variance / item.ordered_quantity) *
                        100
                      ).toFixed(1);

                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border px-3 py-2">
                            {item.material_name}
                          </td>
                          <td className="border px-3 py-2 text-center">
                            {item.ordered_quantity}
                          </td>
                          <td className="border px-3 py-2 text-center">
                            {item.invoiced_quantity}
                          </td>
                          <td className="border px-3 py-2 text-center font-bold">
                            {item.received_quantity}
                          </td>
                          <td
                            className={`border px-3 py-2 text-center font-bold ${
                              variance === 0
                                ? "text-green-600"
                                : variance < 0
                                ? "text-orange-600"
                                : "text-blue-600"
                            }`}
                          >
                            {variance > 0 ? "+" : ""}
                            {variance} ({variancePercent}%)
                          </td>
                          <td className="border px-3 py-2 text-center">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                item.discrepancy_flag
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {item.quality_status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 border-t pt-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.location.href = `/inventory/grn/${grn.id}/verify`;
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Verification
              </button>
              {hasExcess && grn.verification_status !== "approved" && (
                <button
                  onClick={() => {
                    window.location.href = `/inventory/grn/${grn.id}/excess-approval`;
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Handle Excess
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">GRN Workflow Dashboard</h1>
            <p className="text-gray-600">
              Monitor Goods Receipt Notes with intelligent workflow branching
            </p>
          </div>
          <button
            onClick={() => {
              window.location.href = "/inventory/grn/create";
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Create GRN
          </button>
        </div>
      </div>

      {/* Workflow Legend */}
      <div className="max-w-7xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-700">Accurate Qty</span>
          </div>
          <p className="text-xs text-gray-600">Received = Ordered</p>
          <p className="text-xs text-green-700 mt-2 font-medium">
            → PO: received
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <span className="font-bold text-orange-700">Short Qty</span>
          </div>
          <p className="text-xs text-gray-600">Received &lt; Ordered</p>
          <p className="text-xs text-orange-700 mt-2 font-medium">
            → VR + Debit Note
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-700">Excess Qty</span>
          </div>
          <p className="text-xs text-gray-600">Received &gt; Ordered</p>
          <p className="text-xs text-blue-700 mt-2 font-medium">
            → A: VR | B: Approval
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-bold text-red-700">Mixed</span>
          </div>
          <p className="text-xs text-gray-600">Shortages + Excess</p>
          <p className="text-xs text-red-700 mt-2 font-medium">
            → Hybrid handling
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6 bg-white rounded-lg p-4 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search GRN, PO, Vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="received">Received</option>
          <option value="verified">Verified</option>
          <option value="short_received">Short Received</option>
        </select>
        <button
          onClick={fetchGRNs}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* GRN List */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mt-2">Loading GRNs...</p>
          </div>
        ) : grns.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700">No GRNs Found</h3>
            <p className="text-gray-500 mt-2">
              Create your first GRN to get started
            </p>
            <button
              onClick={() => {
                window.location.href = "/inventory/grn/create";
              }}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create GRN
            </button>
          </div>
        ) : (
          <div>
            {grns
              .filter(
                (grn) =>
                  searchTerm === "" ||
                  grn.grn_number
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  grn.purchaseOrder?.po_number
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  grn.purchaseOrder?.vendor?.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map((grn) => (
                <GRNCard key={grn.id} grn={grn} />
              ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && <GRNDetailModal grn={selectedGRN} />}
    </div>
  );
};

export default GRNWorkflowDashboard;
