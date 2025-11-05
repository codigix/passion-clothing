import React, { useState, useEffect, useRef } from "react";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import api from "../../utils/api";

// Inline styles for animation
const slideInStyles = `
  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const RecentActivities = ({ autoRefreshInterval = 30000 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);
  const cycleIntervalRef = useRef(null);

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

  // Auto-refresh data
  useEffect(() => {
    fetchRecentActivities();

    // Auto-refresh if interval is provided
    if (autoRefreshInterval) {
      const interval = setInterval(fetchRecentActivities, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval]);

  // Auto-cycle through activities every 3 seconds with left-to-right slide
  useEffect(() => {
    if (activities.length > 0) {
      cycleIntervalRef.current = setInterval(() => {
        setKey((prev) => prev + 1); // Trigger animation restart
        setCurrentIndex((prev) => (prev + 1) % activities.length);
      }, 3000); // 3 seconds per activity

      return () => {
        if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
      };
    }
  }, [activities.length]);

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

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
        <h3 className="font-semibold text-slate-900 text-sm mb-2">
          Recent Activities
        </h3>
        <div className="text-center py-6">
          <p className="text-slate-500 text-xs">No recent activities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5 shadow-sm">
      <style>{slideInStyles}</style>
      {/* Header */}
      <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 text-sm">
          Recent Activities
        </h3>
      </div>

      {/* Activity Counter */}
      <div className="text-right text-xs text-slate-500 mb-2">
        {currentIndex + 1} / {activities.length}
      </div>

      {/* Activity Container - Horizontal Slide Effect (Left to Right) */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-slate-50 to-white rounded border border-slate-100">
        {/* Single Activity Sliding from Left to Right */}
        <div
          key={key}
          className="animate-slide-in-left w-full"
          style={{
            animation: "slideInLeft 0.8s ease-out forwards",
          }}
        >
          {activities.length > 0 && (
            <div
              className={`${
                getActivityColor(activities[currentIndex].type).bg
              } border ${
                getActivityColor(activities[currentIndex].type).border
              } p-3 w-full flex items-start gap-3 min-h-28`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 text-2xl pt-0.5 rounded-full bg-white p-1.5 flex items-center justify-center w-9 h-9">
                {getActivityIcon(activities[currentIndex].type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <p className="font-semibold text-slate-900 text-sm">
                  {activities[currentIndex].title}
                </p>

                {/* Product Name */}
                {activities[currentIndex].product_name && (
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="text-slate-500">📦</span>{" "}
                    <span className="font-medium">
                      {activities[currentIndex].product_name}
                    </span>
                  </p>
                )}

                {/* Customer */}
                {activities[currentIndex].customer &&
                  activities[currentIndex].customer !== "Unknown" &&
                  activities[currentIndex].customer !== "Unknown Customer" && (
                    <p className="text-xs text-slate-600 mt-1">
                      <span className="text-slate-500">👤</span>{" "}
                      <span className="font-medium">
                        {activities[currentIndex].customer}
                      </span>
                    </p>
                  )}

                {/* Production Stage */}
                {activities[currentIndex].stage && (
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="text-slate-500">⚙️</span>{" "}
                    <span className="font-medium px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                      {activities[currentIndex].stage}
                    </span>
                  </p>
                )}

                {/* Status */}
                {activities[currentIndex].status && (
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="text-slate-500">📊</span>{" "}
                    <span className="font-medium capitalize px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {activities[currentIndex].status}
                    </span>
                  </p>
                )}

                {/* Timestamp */}
                <p className="text-xs text-slate-500 mt-1.5">
                  <span>🕐</span>{" "}
                  {typeof activities[currentIndex].timestamp === "string"
                    ? activities[currentIndex].timestamp.substring(0, 16)
                    : activities[currentIndex].timestamp || "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
