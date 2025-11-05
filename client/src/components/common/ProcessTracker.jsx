import React, { useState, useEffect } from "react";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import api from "../../utils/api";

const ProcessTracker = ({ salesOrderId, autoRefreshInterval = 30000 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProcessTracker = async () => {
    try {
      setError(null);
      const response = await api.get(
        `/sales/orders/${salesOrderId}/process-tracker`
      );
      setData(response.data);
    } catch (err) {
      console.error("Error fetching process tracker:", err);
      setError(err.response?.data?.message || "Failed to load process tracker");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcessTracker();

    // Auto-refresh if interval is provided
    if (autoRefreshInterval) {
      const interval = setInterval(fetchProcessTracker, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [salesOrderId, autoRefreshInterval]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex justify-center items-center h-32">
          <FaSpinner className="animate-spin text-2xl text-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2 text-red-600">
          <FaExclamationTriangle />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅";
      case "in_progress":
        return "🔄";
      case "pending":
        return "⏳";
      default:
        return "•";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-blue-600";
      case "pending":
        return "text-slate-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200 p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              📊 Current Process Status
            </h3>
            <p className="text-xs text-slate-600 mt-1">{data.current_status}</p>
          </div>
          <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
            🔄 Last Updated: {data.last_updated}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-center justify-between gap-2">
          {data.timeline &&
            data.timeline.map((stage, index) => (
              <div key={index} className="flex-1">
                <div className="flex flex-col items-center">
                  {/* Stage Icon */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full mb-2 ${
                      stage.status === "completed"
                        ? "bg-green-100 border-2 border-green-500"
                        : stage.status === "in_progress"
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "bg-slate-100 border-2 border-slate-300"
                    }`}
                  >
                    <span className="text-lg">{stage.icon}</span>
                  </div>

                  {/* Stage Name */}
                  <p className="text-xs font-semibold text-slate-900 text-center">
                    {stage.stage}
                  </p>

                  {/* Status Badge */}
                  <span
                    className={`text-lg ${getStatusColor(stage.status)} mt-1`}
                  >
                    {getStatusIcon(stage.status)}
                  </span>

                  {/* Description */}
                  <p className="text-xs text-slate-600 text-center mt-1 max-w-20">
                    {stage.description}
                  </p>

                  {/* Connector Line */}
                  {index < data.timeline.length - 1 && (
                    <div
                      className={`w-0.5 h-8 mt-2 ${
                        stage.status === "completed"
                          ? "bg-green-400"
                          : "bg-slate-300"
                      }`}
                    ></div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-green-600">✅</span>
          <span className="text-slate-600">Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-blue-600">🔄</span>
          <span className="text-slate-600">In Progress</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400">⏳</span>
          <span className="text-slate-600">Pending</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessTracker;
