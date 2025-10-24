import React from 'react';

/**
 * DashboardHeader Component
 * 
 * A standardized header component for all dashboard pages.
 * Provides consistent layout for title, subtitle, and action buttons.
 * 
 * @param {string} title - Main title of the dashboard
 * @param {string} subtitle - Optional subtitle/description
 * @param {array} actions - Array of action button components
 * @param {node} children - Additional custom content
 * @param {string} className - Additional CSS classes
 */
const DashboardHeader = ({ 
  title, 
  subtitle, 
  actions = [], 
  children,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3 ${className}`}>
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
        )}
      </div>
      
      {(actions.length > 0 || children) && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <React.Fragment key={index}>
              {action}
            </React.Fragment>
          ))}
          {children}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;