/**
 * Procurement Module - Formatting Utilities
 * Centralized formatters for consistent styling across all procurement pages
 */

/**
 * Format amount to Indian Rupee currency
 * @param {number} amount - Amount to format
 * @param {number} decimalPlaces - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string (₹X,XX,XXX.XX)
 */
export const formatINR = (amount, decimalPlaces = 2) => {
  if (amount === null || amount === undefined || amount === '') return '₹0.00';
  
  try {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '₹0.00';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
      useGrouping: true
    }).format(numAmount);
  } catch (error) {
    console.warn('Currency formatting error:', error);
    return '₹0.00';
  }
};

/**
 * Format amount without currency symbol (for totals/calculations)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted number (X,XX,XXX.XX)
 */
export const formatAmount = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '0.00';
  
  try {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0.00';
    
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(numAmount);
  } catch (error) {
    console.warn('Amount formatting error:', error);
    return '0.00';
  }
};

/**
 * Format date with Indian locale
 * @param {string|Date} dateString - Date to format
 * @param {string} format - Format type: 'short', 'long', 'datetime' (default: 'short')
 * @returns {string} Formatted date string or '—' if invalid
 */
export const formatDate = (dateString, format = 'short') => {
  if (!dateString) return '—';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    
    const options = {
      short: { day: '2-digit', month: 'short', year: 'numeric' },
      long: { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' },
      datetime: { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
      time: { hour: '2-digit', minute: '2-digit' }
    };
    
    return date.toLocaleDateString('en-IN', options[format] || options.short);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return '—';
  }
};

/**
 * Format date for input fields
 * @param {string|Date} dateString - Date to format
 * @returns {string} YYYY-MM-DD format or empty string if invalid
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('Date input formatting error:', error);
    return '';
  }
};

/**
 * Calculate days between two dates
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {number} Number of days between dates
 */
export const calculateDaysBetween = (date1, date2) => {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    
    const diffTime = Math.abs(d2 - d1);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
};

/**
 * Safely access nested object properties
 * @param {object} obj - Object to access
 * @param {string} path - Dot-separated path (e.g., 'vendor.name')
 * @param {any} defaultValue - Default value if path doesn't exist (default: '—')
 * @returns {any} Value at path or defaultValue
 */
export const safePath = (obj, path, defaultValue = '—') => {
  try {
    if (!obj || typeof obj !== 'object') return defaultValue;
    
    const value = path.split('.').reduce((o, p) => {
      if (o && typeof o === 'object' && p in o) {
        return o[p];
      }
      return undefined;
    }, obj);
    
    return value ?? defaultValue;
  } catch (error) {
    console.warn('Safe path access error:', error);
    return defaultValue;
  }
};

/**
 * Get available actions based on PO status
 * @param {string} status - Current PO status
 * @param {string} userRole - User role/department (default: 'user')
 * @returns {array} Array of available action keys
 */
export const getAvailablePOActions = (status, userRole = 'user') => {
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  
  const actionMap = {
    draft: ['submit_approval', 'edit', 'delete', 'view'],
    pending_approval: isAdmin ? ['approve', 'reject', 'view'] : ['view'],
    approved: ['send_to_vendor', 'edit', 'view'],
    sent: ['material_received', 'request_grn', 'view'],
    received: ['mark_complete', 'generate_invoice', 'view'],
    partial_received: ['mark_complete', 'generate_invoice', 'view'],
    completed: ['view', 'generate_invoice'],
    rejected: ['edit', 'resubmit', 'delete', 'view'],
    cancelled: ['view'],
    on_hold: ['resume', 'cancel', 'view']
  };
  
  return actionMap[status] || ['view'];
};

/**
 * Format quantity with unit
 * @param {number} quantity - Quantity value
 * @param {string} unit - Unit of measurement (default: '')
 * @returns {string} Formatted quantity string
 */
export const formatQuantity = (quantity, unit = '') => {
  if (quantity === null || quantity === undefined) return '0' + (unit ? ` ${unit}` : '');
  
  try {
    const num = parseFloat(quantity);
    if (isNaN(num)) return '0' + (unit ? ` ${unit}` : '');
    
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
    
    return unit ? `${formatted} ${unit}` : formatted;
  } catch (error) {
    return '0' + (unit ? ` ${unit}` : '');
  }
};

/**
 * Format percentage
 * @param {number} value - Value as decimal (0-1)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage (XX.X%)
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  
  try {
    const num = parseFloat(value);
    if (isNaN(num)) return '0%';
    
    const percentage = num * 100;
    return percentage.toFixed(decimals) + '%';
  } catch (error) {
    return '0%';
  }
};

/**
 * Check if value is empty/null/undefined
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Safe calculation with division by zero protection
 * @param {number} numerator - Numerator
 * @param {number} denominator - Denominator
 * @param {number} defaultValue - Default if denominator is 0 (default: 0)
 * @returns {number} Result of division or defaultValue
 */
export const safeDivide = (numerator, denominator, defaultValue = 0) => {
  try {
    const num = parseFloat(numerator) || 0;
    const denom = parseFloat(denominator) || 0;
    
    if (denom === 0) return defaultValue;
    return num / denom;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Get text status label for display
 * @param {string} status - Status code
 * @returns {string} Human-readable status label
 */
export const getStatusLabel = (status) => {
  const labels = {
    draft: 'Draft',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    sent: 'Sent to Vendor',
    received: 'Received',
    partial_received: 'Partially Received',
    completed: 'Completed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    on_hold: 'On Hold'
  };
  
  return labels[status] || status?.replace(/_/g, ' ').toUpperCase() || '—';
};

/**
 * Get text priority label for display
 * @param {string} priority - Priority code
 * @returns {string} Human-readable priority label
 */
export const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  };
  
  return labels[priority?.toLowerCase()] || 'Medium';
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 30)
 * @returns {string} Truncated text with ellipsis
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text || typeof text !== 'string') return '—';
  
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format phone number for Indian format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '—';
  
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)}-${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Calculate summary statistics safely
 * @param {array} items - Array of items
 * @param {string} field - Field name to sum
 * @returns {object} Statistics object {total, count, average, min, max}
 */
export const calculateStatistics = (items, field) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { total: 0, count: 0, average: 0, min: 0, max: 0 };
  }
  
  try {
    const values = items
      .map(item => parseFloat(safePath(item, field, 0)))
      .filter(v => !isNaN(v) && v !== null && v !== undefined);
    
    if (values.length === 0) {
      return { total: 0, count: 0, average: 0, min: 0, max: 0 };
    }
    
    const total = values.reduce((sum, v) => sum + v, 0);
    const average = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      total: parseFloat(total.toFixed(2)),
      count: values.length,
      average: parseFloat(average.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2))
    };
  } catch (error) {
    console.warn('Statistics calculation error:', error);
    return { total: 0, count: 0, average: 0, min: 0, max: 0 };
  }
};

export default {
  formatINR,
  formatAmount,
  formatDate,
  formatDateForInput,
  calculateDaysBetween,
  safePath,
  getAvailablePOActions,
  formatQuantity,
  formatPercentage,
  isEmpty,
  safeDivide,
  getStatusLabel,
  getPriorityLabel,
  truncateText,
  formatPhone,
  calculateStatistics
};