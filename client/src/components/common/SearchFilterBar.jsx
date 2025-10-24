import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

/**
 * SearchFilterBar Component
 * 
 * A standardized search and filter bar for dashboard pages.
 * Provides consistent layout and styling for search and filter controls.
 * 
 * @param {string} searchPlaceholder - Placeholder text for search input
 * @param {string} searchValue - Current search value
 * @param {function} onSearchChange - Handler for search input changes
 * @param {array} filters - Array of filter components
 * @param {array} actions - Array of action button components
 * @param {boolean} showFilters - Whether to show the filters section
 * @param {string} className - Additional CSS classes
 */
const SearchFilterBar = ({ 
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filters = [],
  actions = [],
  showFilters = true,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded shadow-sm border border-gray-200 p-3 mb-3 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        {/* Search and Filters Section */}
        <div className="flex-1">
          {showFilters && (
            <h3 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <FaFilter size={10} />
              Quick Search & Filters
            </h3>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
            {/* Search Input */}
            {onSearchChange && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border border-gray-300 text-sm rounded px-3 py-1.5 pl-8 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                  <FaSearch className="absolute left-2.5 top-2.5 text-gray-400" size={12} />
                </div>
              </div>
            )}
            
            {/* Filter Components */}
            {filters.map((filter, index) => (
              <React.Fragment key={index}>
                {filter}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        {actions.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {actions.map((action, index) => (
              <React.Fragment key={index}>
                {action}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * FilterSelect Component
 * 
 * A standardized select dropdown for filters.
 * 
 * @param {string} label - Label for the select
 * @param {string} value - Current selected value
 * @param {function} onChange - Handler for value changes
 * @param {array} options - Array of {value, label} objects
 * @param {string} className - Additional CSS classes
 */
export const FilterSelect = ({ 
  label, 
  value, 
  onChange, 
  options = [],
  className = '' 
}) => {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        className="w-full border border-gray-300 text-sm rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * FilterDateRange Component
 * 
 * A standardized date range filter.
 * 
 * @param {string} fromValue - Start date value
 * @param {string} toValue - End date value
 * @param {function} onFromChange - Handler for start date changes
 * @param {function} onToChange - Handler for end date changes
 * @param {string} className - Additional CSS classes
 */
export const FilterDateRange = ({ 
  fromValue, 
  toValue, 
  onFromChange, 
  onToChange,
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          From Date
        </label>
        <input
          type="date"
          className="w-full border border-gray-300 text-sm rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
          value={fromValue}
          onChange={(e) => onFromChange(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          To Date
        </label>
        <input
          type="date"
          className="w-full border border-gray-300 text-sm rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
          value={toValue}
          onChange={(e) => onToChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchFilterBar;