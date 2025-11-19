import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  TrendingDown,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Pause,
  Play,
  Settings,
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const StageTrackingModal = ({
  isOpen,
  onClose,
  stageId,
  stageName,
  productionOrderId,
  onUpdate,
  stage,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("timing"); // timing, material, checkpoint, rework, result
  const [stageData, setStageData] = useState(null);

  // Timing state
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Material state
  const [materialUsed, setMaterialUsed] = useState([]);
  const [newMaterial, setNewMaterial] = useState({
    item_id: "",
    quantity: 0,
    unit: "",
  });
  const [allocatedMaterials, setAllocatedMaterials] = useState([]);

  // Checkpoint state
  const [checkpoints, setCheckpoints] = useState([]);
  const [newCheckpoint, setNewCheckpoint] = useState({
    name: "",
    passed: null,
    remarks: "",
  });

  // Rework state
  const [reworkHistory, setReworkHistory] = useState([]);
  const [showReworkForm, setShowReworkForm] = useState(false);
  const [reworkData, setReworkData] = useState({
    failure_reason: "",
    failed_quantity: 0,
    rework_cost: 0,
  });

  // Result state
  const [result, setResult] = useState({
    status: "pending",
    quality_approved: false,
    is_late: false,
    late_reason: "",
    total_material_used: 0,
  });

  useEffect(() => {
    if (isOpen && stageId) {
      fetchStageData();
    }
  }, [isOpen, stageId]);

  const fetchStageData = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/production-tracking/stages/${stageId}`
      );
      setStageData(response.data);

      // Pre-fill timing
      if (response.data.actual_start_time) {
        const startDT = new Date(response.data.actual_start_time);
        setStartDate(startDT.toISOString().split("T")[0]);
        setStartTime(startDT.toTimeString().slice(0, 5));
      }
      if (response.data.actual_end_time) {
        const endDT = new Date(response.data.actual_end_time);
        setEndDate(endDT.toISOString().split("T")[0]);
        setEndTime(endDT.toTimeString().slice(0, 5));
      }

      // Pre-fill material
      if (response.data.materialConsumptions) {
        setMaterialUsed(response.data.materialConsumptions);
      }

      // Pre-fill checkpoints
      if (response.data.qualityCheckpoints) {
        setCheckpoints(response.data.qualityCheckpoints);
      }

      // Pre-fill rework history
      if (response.data.stageReworkHistories) {
        setReworkHistory(response.data.stageReworkHistories);
      }

      // Pre-fill allocated materials
      if (response.data.materialAllocations) {
        setAllocatedMaterials(response.data.materialAllocations);
      }

      // Set result state
      setResult({
        status: response.data.status || "pending",
        quality_approved: response.data.quality_approved || false,
        is_late: response.data.is_late || false,
        late_reason: response.data.late_reason || "",
        total_material_used: response.data.total_material_used || 0,
      });
    } catch (error) {
      console.error("Error fetching stage data:", error);
      toast.error("Failed to load stage details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = () => {
    if (!newMaterial.item_id || newMaterial.quantity <= 0) {
      toast.error("Please enter valid material and quantity");
      return;
    }
    setMaterialUsed([...materialUsed, { ...newMaterial, id: Date.now() }]);
    setNewMaterial({ item_id: "", quantity: 0, unit: "" });
    toast.success("Material added");
  };

  const handleRemoveMaterial = (id) => {
    setMaterialUsed(materialUsed.filter((m) => m.id !== id));
  };

  const handleAddCheckpoint = () => {
    if (!newCheckpoint.name) {
      toast.error("Please enter checkpoint name");
      return;
    }
    setCheckpoints([...checkpoints, { ...newCheckpoint, id: Date.now() }]);
    setNewCheckpoint({ name: "", passed: null, remarks: "" });
    toast.success("Checkpoint added");
  };

  const handleUpdateCheckpoint = (id, field, value) => {
    setCheckpoints(
      checkpoints.map((cp) => (cp.id === id ? { ...cp, [field]: value } : cp))
    );
  };

  const handleRemoveCheckpoint = (id) => {
    setCheckpoints(checkpoints.filter((cp) => cp.id !== id));
  };

  const handleAddRework = () => {
    if (
      !reworkData.failure_reason ||
      reworkData.failed_quantity <= 0
    ) {
      toast.error("Please enter rework details");
      return;
    }

    setReworkHistory([
      ...reworkHistory,
      {
        ...reworkData,
        id: Date.now(),
        iteration: reworkHistory.length + 1,
        timestamp: new Date().toISOString(),
      },
    ]);
    setReworkData({ failure_reason: "", failed_quantity: 0, rework_cost: 0 });
    setShowReworkForm(false);
    toast.success("Rework recorded");
  };

  const handleRemoveRework = (id) => {
    setReworkHistory(reworkHistory.filter((r) => r.id !== id));
  };

  // Calculate material summary
  const calculateMaterialSummary = () => {
    const used = materialUsed.reduce((sum, m) => sum + (m.quantity || 0), 0);
    const allocated = allocatedMaterials.reduce(
      (sum, m) => sum + (m.quantity || 0),
      0
    );
    return {
      used,
      allocated,
      remaining: allocated - used,
    };
  };

  // Check if late
  const checkIfLate = () => {
    if (!endTime || !stageData?.planned_end_time) return false;
    const endDT = new Date(`${endDate}T${endTime}`);
    const plannedDT = new Date(stageData.planned_end_time);
    return endDT > plannedDT;
  };

  // Handle stage update
  const handleStageUpdate = async () => {
    try {
      if (!startTime || !startDate) {
        toast.error("Please enter start time");
        return;
      }

      // Check all checkpoints are approved before completing
      if (
        checkpoints.length > 0 &&
        !checkpoints.every((cp) => cp.passed === true)
      ) {
        toast.error("All checkpoints must be approved before completion");
        return;
      }

      const isLate = checkIfLate();
      if (isLate && !result.is_late) {
        result.is_late = true;
        result.late_reason = `Stage exceeded planned end time by ${
          Math.round(
            (new Date(`${endDate}T${endTime}`) -
              new Date(stageData.planned_end_time)) /
              (1000 * 60)
          )
        } minutes`;
      }

      const payload = {
        start_time: `${startDate}T${startTime}:00`,
        end_time: endTime ? `${endDate}T${endTime}:00` : null,
        material_used: materialUsed,
        checkpoints: checkpoints,
        quality_approved: result.quality_approved,
        is_late: result.is_late,
        late_reason: result.late_reason,
        status: endTime ? "completed" : "in_progress",
      };

      await api.post(`/production-tracking/stages/${stageId}/update`, payload);
      toast.success("Stage updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error(error.response?.data?.message || "Failed to update stage");
    }
  };

  const handleSubmitRework = async () => {
    try {
      await api.post(`/production-tracking/stages/${stageId}/rework`, {
        ...reworkData,
        materials_affected: materialUsed,
      });
      toast.success("Rework recorded successfully");
      await fetchStageData();
      setReworkData({ failure_reason: "", failed_quantity: 0, rework_cost: 0 });
      setShowReworkForm(false);
    } catch (error) {
      console.error("Error recording rework:", error);
      toast.error("Failed to record rework");
    }
  };

  if (!isOpen) return null;

  const materialSummary = calculateMaterialSummary();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div>
            <h2 className="text-2xl font-bold">{stageName} - Stage Tracking</h2>
            <p className="text-blue-100 text-sm">
              Production Order #{productionOrderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-2 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {[
            { id: "timing", label: "⏱️ Timing", icon: Clock },
            { id: "material", label: "📦 Material", icon: Package },
            { id: "checkpoint", label: "✅ Checkpoints", icon: CheckCircle },
            { id: "rework", label: "🔄 Rework", icon: AlertTriangle },
            { id: "result", label: "📊 Result", icon: TrendingDown },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading stage data...</span>
            </div>
          ) : (
            <>
              {/* Timing Tab */}
              {activeTab === "timing" && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      Stage Timeline
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Start Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time *
                        </label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Planned times display */}
                    {stageData && (
                      <div className="mt-4 pt-4 border-t border-blue-200 text-sm">
                        <p>
                          <span className="font-medium">Planned Start:</span>{" "}
                          {new Date(
                            stageData.planned_start_time
                          ).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Planned End:</span>{" "}
                          {new Date(stageData.planned_end_time).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Allocated Time:</span>{" "}
                          {stageData.estimated_duration_hours} hours
                        </p>
                      </div>
                    )}

                    {/* Late warning */}
                    {checkIfLate() && (
                      <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800">
                            ⚠️ Stage is LATE
                          </p>
                          <p className="text-red-700 text-sm mt-1">
                            This stage has exceeded the planned end time. Late
                            marking will be applied and the stage will be frozen
                            for supervisor review.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Material Tab */}
              {activeTab === "material" && (
                <div className="space-y-6">
                  {/* Material Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600">Allocated</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {materialSummary.allocated} units
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600">Used</p>
                      <p className="text-2xl font-bold text-green-600">
                        {materialSummary.used} units
                      </p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {materialSummary.remaining} units
                      </p>
                    </div>
                  </div>

                  {/* Material Used */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      Material Used
                    </h4>
                    {materialUsed.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {materialUsed.map((material, idx) => (
                          <div
                            key={material.id}
                            className="flex justify-between items-center p-3 bg-white rounded border border-gray-200"
                          >
                            <div>
                              <p className="font-medium text-gray-800">
                                Item {idx + 1}
                              </p>
                              <p className="text-sm text-gray-600">
                                Quantity: {material.quantity} {material.unit}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveMaterial(material.id)}
                              className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mb-4">
                        No materials added yet
                      </p>
                    )}

                    {/* Add Material */}
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Item ID"
                          value={newMaterial.item_id}
                          onChange={(e) =>
                            setNewMaterial({
                              ...newMaterial,
                              item_id: e.target.value,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={newMaterial.quantity || ""}
                          onChange={(e) =>
                            setNewMaterial({
                              ...newMaterial,
                              quantity: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Unit"
                          value={newMaterial.unit}
                          onChange={(e) =>
                            setNewMaterial({
                              ...newMaterial,
                              unit: e.target.value,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handleAddMaterial}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Material
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Checkpoint Tab */}
              {activeTab === "checkpoint" && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      Quality Checkpoints
                    </h4>

                    {checkpoints.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {checkpoints.map((checkpoint) => (
                          <div
                            key={checkpoint.id}
                            className="p-4 bg-white rounded border border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <input
                                type="text"
                                value={checkpoint.name}
                                onChange={(e) =>
                                  handleUpdateCheckpoint(
                                    checkpoint.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="flex-1 font-medium px-2 py-1 border border-gray-300 rounded text-gray-800"
                              />
                              <button
                                onClick={() =>
                                  handleRemoveCheckpoint(checkpoint.id)
                                }
                                className="text-red-600 hover:bg-red-50 p-2 rounded transition ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="mb-3">
                              <label className="text-sm font-medium text-gray-700">
                                Status
                              </label>
                              <select
                                value={checkpoint.passed ?? ""}
                                onChange={(e) =>
                                  handleUpdateCheckpoint(
                                    checkpoint.id,
                                    "passed",
                                    e.target.value === "" ? null : e.target.value === "true"
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              >
                                <option value="">Not Checked</option>
                                <option value="true">✅ Passed</option>
                                <option value="false">❌ Failed</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Remarks
                              </label>
                              <textarea
                                value={checkpoint.remarks}
                                onChange={(e) =>
                                  handleUpdateCheckpoint(
                                    checkpoint.id,
                                    "remarks",
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter remarks..."
                                rows="2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mb-4">
                        No checkpoints added yet
                      </p>
                    )}

                    {/* Add Checkpoint */}
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <input
                        type="text"
                        placeholder="Checkpoint name (e.g., Color Verification, Stitching Quality)"
                        value={newCheckpoint.name}
                        onChange={(e) =>
                          setNewCheckpoint({
                            ...newCheckpoint,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddCheckpoint}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Checkpoint
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Rework Tab */}
              {activeTab === "rework" && (
                <div className="space-y-6">
                  {reworkHistory.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">
                        Rework History
                      </h4>
                      {reworkHistory.map((rework, idx) => (
                        <div
                          key={rework.id}
                          className="p-4 bg-orange-50 rounded border border-orange-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-orange-900">
                              Attempt #{rework.iteration}
                            </span>
                            <button
                              onClick={() => handleRemoveRework(rework.id)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Reason:</span>{" "}
                            {rework.failure_reason}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Failed Qty:</span>{" "}
                            {rework.failed_quantity}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Cost:</span> ₹
                            {rework.rework_cost}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(rework.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rework Form */}
                  {!showReworkForm ? (
                    <button
                      onClick={() => setShowReworkForm(true)}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Record Rework Attempt
                    </button>
                  ) : (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-4">
                      <h4 className="font-semibold text-gray-800">
                        New Rework Attempt
                      </h4>
                      <textarea
                        placeholder="Failure reason"
                        value={reworkData.failure_reason}
                        onChange={(e) =>
                          setReworkData({
                            ...reworkData,
                            failure_reason: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows="2"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          placeholder="Failed quantity"
                          value={reworkData.failed_quantity || ""}
                          onChange={(e) =>
                            setReworkData({
                              ...reworkData,
                              failed_quantity: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          placeholder="Rework cost (₹)"
                          value={reworkData.rework_cost || ""}
                          onChange={(e) =>
                            setReworkData({
                              ...reworkData,
                              rework_cost: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSubmitRework}
                          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                        >
                          Save Rework
                        </button>
                        <button
                          onClick={() => setShowReworkForm(false)}
                          className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Result Tab */}
              {activeTab === "result" && (
                <div className="space-y-6">
                  {/* Status */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stage Status
                    </label>
                    <select
                      value={result.status}
                      onChange={(e) =>
                        setResult({ ...result, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>

                  {/* Quality Approval */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={result.quality_approved}
                        onChange={(e) =>
                          setResult({
                            ...result,
                            quality_approved: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                      />
                      <span className="ml-3 font-semibold text-gray-800">
                        ✅ Quality Approved
                      </span>
                    </label>
                    <p className="text-sm text-gray-600 ml-7 mt-1">
                      Mark this stage as quality approved to proceed
                    </p>
                  </div>

                  {/* Late Status */}
                  <div
                    className={`p-4 rounded-lg border ${
                      result.is_late
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <label className="flex items-center cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={result.is_late}
                        onChange={(e) =>
                          setResult({ ...result, is_late: e.target.checked })
                        }
                        className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                      />
                      <span
                        className={`ml-3 font-semibold ${
                          result.is_late ? "text-red-900" : "text-gray-800"
                        }`}
                      >
                        ⏰ Mark as Late
                      </span>
                    </label>
                    {result.is_late && (
                      <textarea
                        placeholder="Enter reason for delay..."
                        value={result.late_reason}
                        onChange={(e) =>
                          setResult({
                            ...result,
                            late_reason: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows="3"
                      />
                    )}
                  </div>

                  {/* Material Summary */}
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Material Summary
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Allocated</p>
                        <p className="text-lg font-bold text-amber-600">
                          {materialSummary.allocated}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Used</p>
                        <p className="text-lg font-bold text-amber-600">
                          {materialSummary.used}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Remaining</p>
                        <p className="text-lg font-bold text-amber-600">
                          {materialSummary.remaining}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleStageUpdate}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Stage Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageTrackingModal;