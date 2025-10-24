import React from 'react';
import { getPriorityConfig } from '../../constants/statusConfig.minimal';

/**
 * Minimal PriorityBadge Component - Clean, Professional Design
 * 
 * Design Philosophy:
 * - Subtle background tints
 * - Minimal border radius (2px)
 * - Simple circle icons (○ ◐ ◕ ●)
 * - Subtle border for definition
 * - Clean, minimal styling
 * 
 * @param {string} priority - Priority level ('low', 'medium', 'high', 'urgent')
 * @param {string} size - Size of the badge ('sm', 'md', 'lg')
 * @param {boolean} showIcon - Whether to show the icon
 * @param {boolean} showLabel - Whether to show the label
 * @param {string} className - Additional CSS classes
 */
const MinimalPriorityBadge = ({ 
  priority = 'low',
  size = 'md',
  showIcon = true,
  showLabel = true,
  className = '' 
}) => {
  const config = getPriorityConfig(priority);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
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
      {showIcon && <span className="text-xs">{config.icon}</span>}
      {showLabel && config.label}
    </span>
  );
};

export default MinimalPriorityBadge;