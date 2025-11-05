import React, { useState, useEffect } from "react";
import { FaSpinner, FaExclamationTriangle, FaCircle } from "react-icons/fa";
import api from "../../utils/api";

const RecentActivities = ({ autoRefreshInterval = 30000 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentActivities = async () => {
    try {
      setError(null);
      const response = await api.get(
        "/sales/dashboard/recent-activities?limit=10"
      );
      setActivities(response.data.activities || []);
    } catch (err) {
      console.error("Error fetching recent activities:", err);
      setError(
        err.response?.data?.message || "Failed to load recent activities"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivities();

    // Auto-refresh if interval is provided
    if (autoRefreshInterval) {
      const interval = setInterval(fetchRecentActivities, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval]);

  const getActivityColor = (type) => {
    switch (type) {
      case "order_activity":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          dot: "text-blue-600",
        };
      case "shipment_activity":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          dot: "text-green-600",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          dot: "text-slate-600",
        };
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "order_activity":
        return "📋";
      case "shipment_activity":
        return "🚚";
      default:
        return "📌";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex justify-center items-center h-40">
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

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <span>🕒</span>
          Recent Activities
        </h3>
        <button
          onClick={fetchRecentActivities}
          className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors border border-blue-200"
          title="Refresh activities"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Activities List */}
      {activities.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-slate-500 text-sm">No recent activities</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => {
            const colors = getActivityColor(activity.type);
            return (
              <div
                key={activity.id}
                className={`${colors.bg} border ${colors.border} rounded-lg p-3 hover:shadow-sm transition-all`}
              >
                {/* Activity Header */}
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-lg mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900 text-xs truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                          {activity.description}
                        </p>
                      </div>
                    </div>

                    {/* Activity Details */}
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 flex-wrap">
                      {activity.customer &&
                        activity.customer !== "Unknown" &&
                        activity.customer !== "Unknown Customer" && (
                          <span className="bg-white/50 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                            👤 {activity.customer.substring(0, 15)}
                          </span>
                        )}
                      {activity.performed_by && (
                        <span className="bg-white/50 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                          👨‍💼 {activity.performed_by.substring(0, 12)}
                        </span>
                      )}
                      <span className="bg-white/50 px-2 py-0.5 rounded border border-slate-200 ml-auto whitespace-nowrap">
                        🕐{" "}
                        {typeof activity.timestamp === "string"
                          ? activity.timestamp.substring(0, 16)
                          : activity.timestamp || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    <FaCircle className={`text-xs ${colors.dot}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 text-center">
        Showing {activities.length} recent activities • Auto-refreshes every 30
        seconds
      </div>
    </div>
  );
};

export default RecentActivities;
