import React from 'react';
import { getPriorityConfig } from '../../constants/statusConfig';

/**
 * PriorityBadge Component
 * 
 * A reusable badge component for displaying priority levels across the application.
 * Supports different sizes and optional icon display.
 * 
 * @param {string} priority - The priority value ('low', 'medium', 'high', 'urgent')
 * @param {string} size - Size of the badge ('sm', 'md', 'lg')
 * @param {boolean} showIcon - Whether to show the emoji icon
 * @param {boolean} showLabel - Whether to show the text label
 * @param {string} className - Additional CSS classes
 */
const PriorityBadge = ({ 
  priority, 
  size = 'md', 
  showIcon = true,
  showLabel = true,
  className = '' 
}) => {
  const config = getPriorityConfig(priority);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };
  
  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  return (
    <span 
      className={`
        ${config.color} 
        ${sizeClasses[size]} 
        rounded-sm
        font-medium 
        inline-flex 
        items-center 
        gap-1
        whitespace-nowrap
        ${className}
      `}
      title={`Priority: ${config.label}`}
    >
      {showIcon && (
        <span className={iconSizes[size]} role="img" aria-label={config.label}>
          {config.icon}
        </span>
      )}
      {showLabel && config.label}
    </span>
  );
};

export default PriorityBadge;