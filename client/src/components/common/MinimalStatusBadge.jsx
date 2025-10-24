import React from 'react';
import { getStatusConfig } from '../../constants/statusConfig.minimal';

/**
 * Minimal StatusBadge Component - Clean, Professional Design
 * 
 * Design Philosophy:
 * - Subtle background tints (e.g., bg-blue-50)
 * - Minimal border radius (2px)
 * - No icons (text only for cleaner look)
 * - Subtle border for definition
 * - 12px font size minimum
 * - Medium font weight
 * 
 * @param {string} status - The status value (e.g., 'draft', 'confirmed', 'completed')
 * @param {string} type - The type of status (e.g., 'sales', 'procurement', 'production')
 * @param {string} size - Size of the badge ('sm', 'md', 'lg')
 * @param {string} className - Additional CSS classes
 */
const MinimalStatusBadge = ({ 
  status, 
  type = 'sales', 
  size = 'md',
  className = '' 
}) => {
  const config = getStatusConfig(type, status);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };
  
  return (
    <span 
      className={`
        ${config.badgeColor} 
        ${sizeClasses[size]} 
        rounded-sm
        font-medium 
        inline-flex 
        items-center
        whitespace-nowrap
        ${className}
      `}
      title={config.description}
    >
      {config.label}
    </span>
  );
};

export default MinimalStatusBadge;