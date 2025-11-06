import React, { useState, useEffect, useRef } from "react";
import { FaSpinner, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Eye, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import api from "../../utils/api";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const RecentActivities = ({ autoRefreshInterval = 30000 }) => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStage, setSelectedStage] = useState("all");

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

  // Filter activities by stage
  const filteredActivities = selectedStage === "all" 
    ? activities 
    : activities.filter(activity => activity.stage === selectedStage || activity.status === selectedStage);

  // Get unique stages for filter tabs
  const uniqueStages = ["all", ...new Set(activities.map(a => a.stage || a.status).filter(Boolean))];

  // Handle view order
  const handleViewOrder = (activity) => {
    if (activity.order_id) {
      navigate(`/sales/orders/${activity.order_id}`);
    }
  };

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
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-3">
          Recent Activities
        </h3>
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">No activities yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow w-full">
      {/* Header with Title */}
      <div className="mb-4 pb-3 border-b border-slate-200">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Recent Activities
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Live order tracking - {filteredActivities.length} activities</p>
      </div>

      {/* Stage Filter Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {uniqueStages.slice(0, 6).map((stage) => (
          <button
            key={stage}
            onClick={() => {
              setSelectedStage(stage);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedStage === stage
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {stage === "all" ? "All" : stage}
          </button>
        ))}
      </div>

      {/* Slick Carousel Container */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">No activities in this stage</p>
        </div>
      ) : (
        <div className="relative group">
          <Slider
            ref={sliderRef}
            slidesToShow={2}
            slidesToScroll={1}
            arrows={false}
            dots={true}
            draggable={false}
            swipe={false}
            autoplay={false}
            responsive={[
              { breakpoint: 1280, settings: { slidesToShow: 2 } },
              { breakpoint: 768, settings: { slidesToShow: 1 } },
            ]}
            className="activity-slider"
          >
            {filteredActivities.map((activity) => (
              <div
                key={activity.id || `${activity.order_id}-${activity.timestamp}`}
                className="px-2"
              >
                <div
                  className={`${
                    getActivityColor(activity.type).bg
                  } border-2 ${
                    getActivityColor(activity.type).border
                  } rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 group h-full`}
                  onClick={() => handleViewOrder(activity)}
                >
                  {/* Top Section */}
                  <div className="flex items-start justify-between mb-3">
                    {/* Icon & Title */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 text-2xl rounded-lg bg-white p-2 flex items-center justify-center w-10 h-10 shadow-sm group-hover:scale-110 transition-transform">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">Project</p>
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                            {activity.title}
                          </h4>
                        </div>
                        {activity.order_number && (
                          <p className="text-xs text-slate-600 mt-1">
                            <span className="text-slate-500">Order ID:</span>
                            <span className="font-mono font-semibold ml-1">{activity.order_number}</span>
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {typeof activity.timestamp === "string"
                            ? activity.timestamp
                            : activity.timestamp || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* View Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOrder(activity);
                      }}
                      className="flex-shrink-0 p-2 bg-white rounded-lg hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all shadow-sm hover:shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-2 text-xs">
                    {/* Product */}
                    {activity.product_name && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">📦</span>
                        <span className="truncate">
                          <span className="text-slate-600">Product:</span>
                          <span className="font-semibold text-slate-900 ml-1">{activity.product_name}</span>
                        </span>
                      </div>
                    )}

                    {/* Customer */}
                    {activity.customer &&
                      activity.customer !== "Unknown" &&
                      activity.customer !== "Unknown Customer" && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">👤</span>
                          <span className="truncate">
                            <span className="text-slate-600">Customer:</span>
                            <span className="font-semibold text-slate-900 ml-1">{activity.customer}</span>
                          </span>
                        </div>
                      )}

                    {/* Stage & Status Badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activity.stage && (
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold text-xs whitespace-nowrap">
                          🏭 {activity.stage}
                        </span>
                      )}

                      {activity.status && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold capitalize text-xs whitespace-nowrap">
                          📊 {activity.status}
                        </span>
                      )}
                    </div>

                    {/* Order Number */}
                    {activity.order_number && (
                      <div className="mt-3 pt-3 border-t border-current border-opacity-10">
                        <p className="text-xs text-slate-600">
                          Order #<span className="font-mono font-bold">{activity.order_number}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Slider>

          {/* Custom Navigation Arrows */}
          <button
            onClick={() => sliderRef.current?.slickPrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100 shadow-lg hover:shadow-xl"
          >
            <FaChevronLeft size={14} />
          </button>

          <button
            onClick={() => sliderRef.current?.slickNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100 shadow-lg hover:shadow-xl"
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
