import React from 'react';

/**
 * Compact StatCard Component - Optimized for space efficiency
 * 
 * Features:
 * - 40% less padding than original
 * - Smaller font sizes while maintaining readability
 * - Gradient backgrounds for visual appeal
 * - Hover effects for interactive cards
 * - Icon integration with proper alignment
 */
const CompactStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  onClick, 
  color = 'indigo',
  trend = null,
  loading = false 
}) => {
  const colorClasses = {
    indigo: 'bg-white border-gray-200 hover:border-gray-300',
    blue: 'bg-white border-gray-200 hover:border-gray-300',
    green: 'bg-white border-gray-200 hover:border-gray-300',
    yellow: 'bg-white border-gray-200 hover:border-gray-300',
    red: 'bg-white border-gray-200 hover:border-gray-300',
    purple: 'bg-white border-gray-200 hover:border-gray-300',
    gray: 'bg-white border-gray-200 hover:border-gray-300',
  };

  const iconColorClasses = {
    indigo: 'text-gray-600 bg-gray-100',
    blue: 'text-gray-600 bg-gray-100',
    green: 'text-gray-600 bg-gray-100',
    yellow: 'text-gray-600 bg-gray-100',
    red: 'text-gray-600 bg-gray-100',
    purple: 'text-gray-600 bg-gray-100',
    gray: 'text-gray-600 bg-gray-100',
  };

  return (
    <div 
      className={`
        ${colorClasses[color]}
        rounded border
        transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
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
          {Icon && (
            <div className={`flex-shrink-0 p-2 rounded ${iconColorClasses[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompactStatCard;