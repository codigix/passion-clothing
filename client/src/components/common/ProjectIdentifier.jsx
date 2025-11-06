import React from "react";
import { Tooltip } from "@mui/material";

/**
 * ProjectIdentifier Component
 * 
 * Displays project name and order ID in a professional stacked format.
 * Used across all tables throughout the system for consistent project identification.
 * 
 * Features:
 * - Stacked display with project name as primary identifier
 * - Order ID displayed below in smaller text
 * - Tooltip on hover showing full details
 * - Copy to clipboard on click
 * - Responsive design with truncation
 * - Support for all order types (Sales, Manufacturing, Purchase, Shipment)
 */
const ProjectIdentifier = ({
  projectName,
  orderId,
  orderNumber,
  type = "sales", // 'sales', 'production', 'purchase', 'shipment'
  size = "default", // 'small', 'default', 'large'
  copyable = true,
  showIcon = true,
}) => {
  const displayName = projectName || "No Project";
  const displayId = orderId || orderNumber || "N/A";

  // Copy to clipboard handler
  const handleCopy = (e) => {
    e.stopPropagation();
    if (copyable) {
      const textToCopy = `${displayName} (${displayId})`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        // Optional: Show toast notification
        console.log("Copied to clipboard:", textToCopy);
      });
    }
  };

  // Get icon for order type
  const getIcon = () => {
    switch (type) {
      case "production":
        return "🏭";
      case "purchase":
        return "📦";
      case "shipment":
        return "🚚";
      case "sales":
      default:
        return "📋";
    }
  };

  // Get colors based on size
  const sizeClasses = {
    small: {
      container: "px-2 py-1.5",
      projectName: "text-xs font-semibold",
      orderId: "text-[10px]",
      icon: "w-3 h-3",
    },
    default: {
      container: "px-3 py-2",
      projectName: "text-sm font-bold",
      orderId: "text-xs",
      icon: "w-4 h-4",
    },
    large: {
      container: "px-4 py-3",
      projectName: "text-base font-bold",
      orderId: "text-sm",
      icon: "w-5 h-5",
    },
  };

  const classes = sizeClasses[size];

  const tooltipTitle = `Project: ${displayName}\nOrder ID: ${displayId}\nType: ${type.charAt(0).toUpperCase() + type.slice(1)}`;

  return (
    <Tooltip title={tooltipTitle} arrow>
      <div
        onClick={handleCopy}
        className={`
          ${classes.container}
          bg-gradient-to-br from-blue-50 to-indigo-50
          border border-blue-200 rounded-lg
          hover:shadow-md hover:border-blue-400 
          transition-all duration-200
          cursor-pointer
          group
          inline-block
          max-w-xs
        `}
      >
        <div className="flex items-start gap-2">
          {/* Icon */}
          {showIcon && (
            <div className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
              {getIcon()}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Project Name */}
            <div className={`${classes.projectName} text-slate-900 truncate`}>
              {displayName}
            </div>

            {/* Order ID */}
            <div className={`${classes.orderId} text-slate-600 font-mono truncate`}>
              {displayId}
            </div>
          </div>

          {/* Copy Indicator (shows on hover) */}
          {copyable && (
            <div className="text-slate-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              📋
            </div>
          )}
        </div>
      </div>
    </Tooltip>
  );
};

export default ProjectIdentifier;