import React from 'react';
import { getStatusConfig } from '../../constants/statusConfig';

/**
 * StatusBadge Component
 * 
 * A reusable badge component for displaying status across the application.
 * Supports different status types (sales, procurement, production, etc.)
 * and sizes (sm, md, lg).
 * 
 * @param {string} status - The status value (e.g., 'draft', 'confirmed', 'completed')
 * @param {string} type - The type of status (e.g., 'sales', 'procurement', 'production')
 * @param {string} size - Size of the badge ('sm', 'md', 'lg')
 * @param {boolean} showIcon - Whether to show the icon
 * @param {string} className - Additional CSS classes
 */
const StatusBadge = ({ 
  status, 
  type = 'sales', 
  size = 'md', 
  showIcon = false,
  className = '' 
}) => {
  const config = getStatusConfig(type, status);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };
  
  const IconComponent = config.icon;
  
  return (
    <span 
      className={`
        ${config.badgeColor} 
        ${sizeClasses[size]} 
        rounded-sm
        font-medium 
        inline-flex 
        items-center 
        gap-1
        whitespace-nowrap
        ${className}
      `}
      title={config.description}
    >
      {showIcon && IconComponent && (
        <IconComponent className={iconSizes[size]} />
      )}
      {config.label}
    </span>
  );
};

export default StatusBadge;