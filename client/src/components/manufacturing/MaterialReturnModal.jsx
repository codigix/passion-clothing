import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  Send,
  Clock,
  RotateCcw,
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const MaterialReturnModal = ({
  isOpen,
  onClose,
  productionOrderId,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("request"); // request, pending, completed
  const [materials, setMaterials] = useState([]);
  const [materialReturns, setMaterialReturns] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [notes, setNotes] = useState("");
  const [returnReason, setReturnReason] = useState("unused");
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (isOpen && productionOrderId) {
      fetchMaterialData();
      fetchMaterialReturns();
    }
  }, [isOpen, productionOrderId]);

  const fetchMaterialData = async () => {
    try {
      setFetchingData(true);
      const response = await api.get(
        `/manufacturing/orders/${productionOrderId}/materials/allocation`
      );
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error("Error fetching material data:", error);
      toast.error("Failed to load material data");
    } finally {
      setFetchingData(false);
    }
  };

  const fetchMaterialReturns = async () => {
    try {
      const response = await api.get(
        `/production-tracking/orders/${productionOrderId}/material-returns`
      );
      setMaterialReturns(response.data || []);
    } catch (error) {
      console.error("Error fetching material returns:", error);
    }
  };

  const handleSelectMaterial = (materialId, quantity) => {
    const existing = selectedMaterials.find((m) => m.id === materialId);
    if (existing) {
      setSelectedMaterials(
        selectedMaterials.filter((m) => m.id !== materialId)
      );
    } else {
      setSelectedMaterials([
        ...selectedMaterials,
        {
          id: materialId,
          quantity: quantity > 0 ? quantity : 0,
          allocation_id: materialId,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (materialId, newQuantity) => {
    setSelectedMaterials(
      selectedMaterials.map((m) =>
        m.id === materialId ? { ...m, quantity: Math.max(0, newQuantity) } : m
      )
    );
  };

  const handleRemoveMaterial = (materialId) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m.id !== materialId));
  };

  const handleRequestReturn = async () => {
    try {
      if (selectedMaterials.length === 0) {
        toast.error("Please select at least one material to return");
        return;
      }

      if (selectedMaterials.some((m) => m.quantity <= 0)) {
        toast.error("Please enter valid quantities for all selected materials");
        return;
      }

      setLoading(true);

      await api.post(
        `/production-tracking/orders/${productionOrderId}/request-material-return`,
        {
          materials: selectedMaterials,
          reason: returnReason,
          notes: notes,
        }
      );

      toast.success("Material return request submitted successfully");
      setSelectedMaterials([]);
      setNotes("");
      setReturnReason("unused");
      await fetchMaterialReturns();
      setActiveTab("pending");
    } catch (error) {
      console.error("Error submitting return request:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit return request"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReturn = async (returnId) => {
    try {
      setLoading(true);
      await api.post(
        `/production-tracking/material-returns/${returnId}/approve`
      );
      toast.success("Material return approved");
      await fetchMaterialReturns();
    } catch (error) {
      console.error("Error approving return:", error);
      toast.error("Failed to approve return");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReturn = async (returnId) => {
    try {
      setLoading(true);
      await api.post(
        `/production-tracking/material-returns/${returnId}/process`
      );
      toast.success("Material return processed and added to inventory");
      await fetchMaterialReturns();
    } catch (error) {
      console.error("Error processing return:", error);
      toast.error("Failed to process return");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectReturn = async (returnId, reason) => {
    try {
      setLoading(true);
      await api.post(
        `/production-tracking/material-returns/${returnId}/reject`,
        { rejection_reason: reason }
      );
      toast.success("Material return rejected");
      await fetchMaterialReturns();
    } catch (error) {
      console.error("Error rejecting return:", error);
      toast.error("Failed to reject return");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const pendingReturns = materialReturns.filter(
    (r) => r.status === "pending_approval"
  );
  const approvedReturns = materialReturns.filter(
    (r) => r.status === "approved"
  );
  const completedReturns = materialReturns.filter(
    (r) => r.status === "completed" || r.status === "returned"
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-amber-600 to-amber-700 text-white">
          <div>
            <h2 className="text-2xl font-bold">Material Return Management</h2>
            <p className="text-amber-100 text-sm">
              Production Order #{productionOrderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-amber-800 p-2 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {[
            { id: "request", label: "📤 Request Return", count: 0 },
            { id: "pending", label: "⏳ Pending Approval", count: pendingReturns.length },
            { id: "completed", label: "✅ Completed", count: completedReturns.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-b-2 border-amber-600 text-amber-600 bg-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-amber-600 text-white rounded-full text-xs font-semibold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Request Return Tab */}
          {activeTab === "request" && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Select Materials to Return
                </h3>

                {fetchingData ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">
                      Loading materials...
                    </span>
                  </div>
                ) : materials.length > 0 ? (
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center gap-4 p-3 bg-white rounded border border-gray-200 hover:border-blue-300 transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMaterials.some(
                            (m) => m.id === material.id
                          )}
                          onChange={() =>
                            handleSelectMaterial(
                              material.id,
                              material.quantity_remaining || 0
                            )
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {material.item_name || "Material"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Remaining: {material.quantity_remaining || 0}{" "}
                            {material.unit || "units"}
                          </p>
                        </div>

                        {selectedMaterials.some((m) => m.id === material.id) && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={material.quantity_remaining || 0}
                              value={
                                selectedMaterials.find((m) => m.id === material.id)
                                  ?.quantity || 0
                              }
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  material.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-600">
                              {material.unit || "units"}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No materials available for return
                  </p>
                )}
              </div>

              {/* Selected Materials Summary */}
              {selectedMaterials.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Selected Materials ({selectedMaterials.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedMaterials.map((selected) => {
                      const material = materials.find(
                        (m) => m.id === selected.id
                      );
                      return (
                        <div
                          key={selected.id}
                          className="flex justify-between items-center p-2 bg-white rounded border border-green-200"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {material?.item_name || "Material"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {selected.quantity} {material?.unit || "units"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveMaterial(selected.id)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Return Details */}
              {selectedMaterials.length > 0 && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 space-y-4">
                  <h4 className="font-semibold text-gray-800">Return Details</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Reason
                    </label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="unused">Unused Material</option>
                      <option value="excess">Excess Material</option>
                      <option value="defective">Defective Material</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter any additional notes about the return..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>

                  <button
                    onClick={handleRequestReturn}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium flex items-center justify-center disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Return Request
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pending Approvals Tab */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              {pendingReturns.length > 0 ? (
                pendingReturns.map((returnData) => (
                  <div
                    key={returnData.id}
                    className="p-4 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Return Request #{returnData.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Reason: {returnData.reason}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    </div>

                    <div className="mb-3 p-3 bg-white rounded border border-orange-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Materials:
                      </p>
                      {returnData.materials &&
                        returnData.materials.map((mat, idx) => (
                          <p key={idx} className="text-sm text-gray-600">
                            • {mat.item_name}: {mat.quantity} {mat.unit}
                          </p>
                        ))}
                    </div>

                    {returnData.notes && (
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Notes:</span> {returnData.notes}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveReturn(returnData.id)}
                        disabled={loading}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center justify-center disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleRejectReturn(
                            returnData.id,
                            "Not approved by inventory"
                          )
                        }
                        disabled={loading}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No pending return requests</p>
                </div>
              )}
            </div>
          )}

          {/* Completed Tab */}
          {activeTab === "completed" && (
            <div className="space-y-4">
              {completedReturns.length > 0 ? (
                completedReturns.map((returnData) => (
                  <div
                    key={returnData.id}
                    className="p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Return Request #{returnData.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: {returnData.status}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded border border-green-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Materials Returned:
                      </p>
                      {returnData.materials &&
                        returnData.materials.map((mat, idx) => (
                          <p key={idx} className="text-sm text-gray-600">
                            • {mat.item_name}: {mat.quantity} {mat.unit}
                          </p>
                        ))}
                    </div>

                    {returnData.completed_at && (
                      <p className="text-xs text-gray-500 mt-3">
                        Completed on:{" "}
                        {new Date(returnData.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No completed returns yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialReturnModal;