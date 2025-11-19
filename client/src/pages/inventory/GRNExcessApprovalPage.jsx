import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Zap,
  Package,
  DollarSign,
  Truck,
  Eye,
  Save,
  ArrowRight,
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const GRNExcessApprovalPage = () => {
  const { grnId } = useParams();
  const navigate = useNavigate();
  const [grn, setGrn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchGRNDetails();
  }, [grnId]);

  const fetchGRNDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/grn/${grnId}`);
      setGrn(response.data);
    } catch (error) {
      console.error("Error fetching GRN:", error);
      toast.error("Failed to load GRN details");
      navigate("/inventory/grn");
    } finally {
      setLoading(false);
    }
  };

  const excessItems =
    grn?.items_received?.filter((item) => item.overage_quantity > 0) || [];
  const totalExcessValue =
    excessItems.reduce(
      (sum, item) => sum + item.overage_quantity * item.rate,
      0
    ) || 0;

  // Option A: Auto-Reject and Return to Vendor
  const handleAutoReject = async () => {
    if (!selectedOption) {
      toast.error("Please select an option first");
      return;
    }

    try {
      setProcessing(true);

      // Call backend endpoint to auto-generate VR for excess
      const response = await api.post(`/grn/${grnId}/handle-excess`, {
        action: "auto_reject",
        notes: approvalNotes,
      });

      // After rejection, handle the ordered quantity allocation
      await handlePostApprovalAllocation("auto_reject");

      toast.success("Excess quantity auto-rejected and Vendor Return created");
      navigate("/inventory/grn");
    } catch (error) {
      console.error("Error handling excess:", error);
      toast.error(
        error.response?.data?.message || "Failed to process excess quantity"
      );
    } finally {
      setProcessing(false);
    }
  };

  // Option B: Approve Excess
  const handleApproveExcess = async () => {
    if (!selectedOption) {
      toast.error("Please select an option first");
      return;
    }

    try {
      setProcessing(true);

      const response = await api.post(`/grn/${grnId}/handle-excess`, {
        action: "approve_excess",
        notes: approvalNotes,
      });

      // After approval, handle the full quantity allocation (ordered + excess)
      await handlePostApprovalAllocation("approve_excess");

      toast.success("Excess quantity approved and added to inventory");
      navigate("/inventory/grn");
    } catch (error) {
      console.error("Error approving excess:", error);
      toast.error(
        error.response?.data?.message || "Failed to approve excess quantity"
      );
    } finally {
      setProcessing(false);
    }
  };

  // Handle stock allocation after excess approval/rejection
  const handlePostApprovalAllocation = async (action) => {
    try {
      const isProjectStock = grn.purchaseOrder?.linked_sales_order_id;

      if (isProjectStock) {
        // Allocate to project
        const allocationResponse = await api.post(`/inventory/allocate-to-project`, {
          grn_id: grnId,
          sales_order_id: grn.purchaseOrder.linked_sales_order_id,
          include_excess: action === "approve_excess"
        });

        toast.success(`Stock allocated to project ${grn.purchaseOrder.project_name || grn.purchaseOrder.linked_sales_order_id}`);
        navigate('/inventory/allocations');
      } else {
        // Store in warehouse
        const warehouseResponse = await api.post(`/inventory/add-to-warehouse`, {
          grn_id: grnId,
          include_excess: action === "approve_excess"
        });

        toast.success("Stock added to warehouse inventory");
        navigate('/inventory/stock');
      }
    } catch (allocationError) {
      console.error("Error allocating stock:", allocationError);
      toast.error("GRN processed but stock allocation failed. Please check manually.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto animate-spin" />
          <p className="text-gray-500 mt-4">Loading GRN details...</p>
        </div>
      </div>
    );
  }

  if (!grn) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-8">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-700">GRN Not Found</h2>
          <p className="text-gray-500 mt-2">
            The GRN you're looking for doesn't exist
          </p>
          <button
            onClick={() => navigate("/inventory/grn")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to GRNs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/inventory/grn")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to GRN Dashboard
        </button>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Handle Excess Quantity</h1>
          <p className="text-gray-600">
            GRN: <span className="font-mono font-bold">{grn.grn_number}</span> |
            PO:{" "}
            <span className="font-mono font-bold">
              {grn.purchaseOrder?.po_number}
            </span>
          </p>
        </div>

        {/* Excess Quantity Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-700">
              Excess Quantity Detected 🔺
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">
                Total Excess Items
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {excessItems.length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">
                Total Excess Units
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {excessItems
                  .reduce((sum, item) => sum + item.overage_quantity, 0)
                  .toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">
                Total Excess Value
              </div>
              <div className="text-3xl font-bold text-blue-600">
                ₹{totalExcessValue.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <h3 className="font-bold text-blue-700 mb-3">Excess Items</h3>
            <div className="space-y-2">
              {excessItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start text-sm border-b pb-2"
                >
                  <div>
                    <div className="font-medium">{item.material_name}</div>
                    <div className="text-xs text-gray-600">
                      Ordered: {item.ordered_quantity} | Received:{" "}
                      {item.received_quantity} |
                      <span className="font-bold text-blue-600">
                        {" "}
                        Excess: {item.overage_quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      ₹{(item.overage_quantity * item.rate).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">{item.uom}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decision Options */}
        <div className="space-y-4 mb-6">
          {/* Option A: Auto-Reject */}
          <div
            onClick={() => setSelectedOption("auto_reject")}
            className={`border-2 rounded-lg p-6 cursor-pointer transition ${
              selectedOption === "auto_reject"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 bg-white hover:border-red-300"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`mt-1 ${
                  selectedOption === "auto_reject"
                    ? "text-red-600"
                    : "text-gray-400"
                }`}
              >
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Option A: Auto-Reject Excess
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Automatically create a Vendor Return for excess materials and
                  reject them back to the vendor.
                </p>

                <div className="bg-gray-50 rounded p-3 mb-4 border-l-4 border-red-500">
                  <h4 className="font-bold text-gray-800 text-sm mb-2">
                    What happens:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✅ Vendor Return (VR) auto-generated</li>
                    <li>📋 Only ordered quantity accepted in inventory</li>
                    <li>📤 Excess materials will be returned to vendor</li>
                    <li>
                      💰 PO status remains 'received' (not excess_received)
                    </li>
                    <li>🔔 Vendor notified of return</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
                  <span className="font-bold">Note:</span> This is the strictest
                  option - only ordered materials are kept.
                </div>
              </div>
              {selectedOption === "auto_reject" && (
                <CheckCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              )}
            </div>
          </div>

          {/* Option B: Approve Excess */}
          <div
            onClick={() => setSelectedOption("approve_excess")}
            className={`border-2 rounded-lg p-6 cursor-pointer transition ${
              selectedOption === "approve_excess"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-white hover:border-green-300"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`mt-1 ${
                  selectedOption === "approve_excess"
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Option B: Accept Excess with Approval
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Approve the excess materials and add all received quantity
                  (including excess) to inventory.
                </p>

                <div className="bg-gray-50 rounded p-3 mb-4 border-l-4 border-green-500">
                  <h4 className="font-bold text-gray-800 text-sm mb-2">
                    What happens:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✅ Full received quantity accepted</li>
                    <li>📦 Excess materials added to inventory</li>
                    <li>📋 PO status updated to 'excess_received'</li>
                    <li>💰 Extra inventory now available for future orders</li>
                    <li>🔔 Approval recorded with notes</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800">
                  <span className="font-bold">Benefit:</span> Extra materials
                  become available for production immediately.
                </div>
              </div>
              {selectedOption === "approve_excess" && (
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              )}
            </div>
          </div>
        </div>

        {/* Approval Notes */}
        <div className="bg-white rounded-lg p-6 mb-6 border">
          <h3 className="font-bold text-gray-800 mb-3">
            Approval Notes (Optional)
          </h3>
          <textarea
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Add any notes or justification for your decision..."
            rows="4"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Decision Matrix Table */}
        <div className="bg-white rounded-lg p-6 mb-6 border">
          <h3 className="font-bold text-gray-800 mb-4">Decision Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-gray-700">
                    Criteria
                  </th>
                  <th className="px-4 py-2 text-left font-bold text-gray-700">
                    Option A (Reject)
                  </th>
                  <th className="px-4 py-2 text-left font-bold text-gray-700">
                    Option B (Approve)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">Inventory Addition</td>
                  <td className="px-4 py-2">Only ordered quantity</td>
                  <td className="px-4 py-2 text-green-600 font-bold">
                    Full received qty
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">Vendor Return</td>
                  <td className="px-4 py-2 text-red-600 font-bold">
                    Auto-created
                  </td>
                  <td className="px-4 py-2">None</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">PO Status</td>
                  <td className="px-4 py-2">received</td>
                  <td className="px-4 py-2 text-green-600 font-bold">
                    excess_received
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">Excess Materials</td>
                  <td className="px-4 py-2">Returned to vendor</td>
                  <td className="px-4 py-2 text-green-600 font-bold">
                    Added to stock
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">Approval Required</td>
                  <td className="px-4 py-2">-</td>
                  <td className="px-4 py-2 text-green-600 font-bold">
                    Management approval
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">Best For</td>
                  <td className="px-4 py-2">Strict compliance</td>
                  <td className="px-4 py-2 text-green-600 font-bold">
                    Flexibility & extra stock
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/inventory/grn")}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold"
          >
            Cancel
          </button>
          <button
            onClick={
              selectedOption === "auto_reject"
                ? handleAutoReject
                : handleApproveExcess
            }
            disabled={!selectedOption || processing}
            className={`flex-1 px-6 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 ${
              selectedOption === "auto_reject"
                ? "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
                : "bg-green-600 hover:bg-green-700 disabled:bg-green-300"
            }`}
          >
            {processing ? (
              <>
                <Package className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {selectedOption === "auto_reject"
                  ? "Reject Excess"
                  : "Approve Excess"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GRNExcessApprovalPage;
