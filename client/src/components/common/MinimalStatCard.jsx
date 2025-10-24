import React from 'react';

/**
 * Minimal StatCard Component - Clean, Professional Design
 * 
 * Design Philosophy:
 * - White background with subtle gray border
 * - No gradients or colored backgrounds
 * - Minimal border radius (4px)
 * - No accent lines or decorative elements
 * - Gray icon with subtle background
 * - Clean typography with proper hierarchy
 * - Subtle hover effect (border color only)
 * 
 * @param {string} title - Card title (uppercase, small)
 * @param {string|number} value - Main value to display
 * @param {React.Component} icon - Icon component
 * @param {string} subtitle - Optional subtitle text
 * @param {function} onClick - Optional click handler
 * @param {number} trend - Optional trend percentage
 * @param {boolean} loading - Loading state
 */
const MinimalStatCard = ({ 
  title, 
  value, 
  icon, 
  subtitle, 
  onClick, 
  trend = null,
  loading = false 
}) => {
  return (
    <div 
      className={`
        bg-white
        border border-gray-200
        rounded
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:border-gray-300' : ''}
        ${loading ? 'animate-pulse' : ''}
      `}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">
              {title}
            </p>
            
            {/* Value */}
            <div className="flex items-baseline mt-2 gap-2">
              <h3 className="text-3xl font-bold text-gray-900 leading-none">
                {loading ? '...' : value}
              </h3>
              {trend !== null && (
                <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
                </span>
              )}
            </div>
            
            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1.5 truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 p-2 rounded bg-gray-100">
              {React.isValidElement(icon) ? (
                icon
              ) : (
                // Fallback when caller passes a component instead of an element
                React.createElement(icon, {
                  className: 'w-5 h-5 text-gray-600'
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinimalStatCard;