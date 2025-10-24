/**
 * Centralized Status and Priority Configurations
 * 
 * This file contains all status and priority configurations used across
 * the ERP system to ensure consistency and maintainability.
 */

import {
  FaClock,
  FaCheckCircle,
  FaCog,
  FaTruck,
  FaShippingFast,
  FaExclamationTriangle,
  FaHourglassHalf,
  FaPaperPlane,
  FaClipboardCheck,
  FaFileAlt,
  FaBox,
  FaIndustry,
  FaTimesCircle
} from 'react-icons/fa';

// ============================================================================
// SALES ORDER STATUS
// ============================================================================

export const SALES_ORDER_STATUS = {
  draft: {
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    badgeColor: 'bg-gray-50 text-gray-700 border border-gray-200',
    icon: FaClock,
    label: 'Draft',
    description: 'Order is in draft state'
  },
  pending_approval: {
    color: 'bg-amber-50',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-50 text-amber-700 border border-amber-100',
    icon: FaHourglassHalf,
    label: 'Pending Approval',
    description: 'Awaiting approval'
  },
  confirmed: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaCheckCircle,
    label: 'Confirmed',
    description: 'Order confirmed'
  },
  in_production: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaCog,
    label: 'In Production',
    description: 'Currently in production'
  },
  materials_received: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaTruck,
    label: 'Materials Received',
    description: 'Materials have been received'
  },
  ready_to_ship: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaBox,
    label: 'Ready to Ship',
    description: 'Ready for shipment'
  },
  shipped: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaShippingFast,
    label: 'Shipped',
    description: 'Order has been shipped'
  },
  delivered: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-50 text-green-700 border border-green-100',
    icon: FaCheckCircle,
    label: 'Delivered',
    description: 'Order delivered to customer'
  },
  completed: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-50 text-green-700 border border-green-100',
    icon: FaCheckCircle,
    label: 'Completed',
    description: 'Order completed successfully'
  },
  cancelled: {
    color: 'bg-red-50',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-50 text-red-700 border border-red-100',
    icon: FaTimesCircle,
    label: 'Cancelled',
    description: 'Order has been cancelled'
  }
};

// ============================================================================
// PROCUREMENT STATUS
// ============================================================================

export const PROCUREMENT_STATUS = {
  not_requested: {
    color: 'bg-gray-50',
    textColor: 'text-gray-600',
    badgeColor: 'bg-gray-50 text-gray-600 border border-gray-200',
    icon: FaClock,
    label: 'Not Requested',
    description: 'Procurement not yet requested'
  },
  requested: {
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
    badgeColor: 'bg-blue-50 text-blue-600 border border-blue-100',
    icon: FaFileAlt,
    label: 'Requested',
    description: 'Procurement requested'
  },
  po_created: {
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
    badgeColor: 'bg-blue-50 text-blue-600 border border-blue-100',
    icon: FaClipboardCheck,
    label: 'PO Created',
    description: 'Purchase order created'
  },
  materials_ordered: {
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
    badgeColor: 'bg-blue-50 text-blue-600 border border-blue-100',
    icon: FaShippingFast,
    label: 'Materials Ordered',
    description: 'Materials ordered from vendor'
  },
  materials_received: {
    color: 'bg-green-50',
    textColor: 'text-green-600',
    badgeColor: 'bg-green-50 text-green-600 border border-green-100',
    icon: FaTruck,
    label: 'Materials Received',
    description: 'Materials received in inventory'
  },
  completed: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-50 text-green-700 border border-green-100',
    icon: FaCheckCircle,
    label: 'Completed',
    description: 'Procurement completed'
  }
};

// ============================================================================
// PURCHASE ORDER STATUS
// ============================================================================

export const PURCHASE_ORDER_STATUS = {
  draft: {
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    badgeColor: 'bg-gray-100 text-gray-700',
    icon: FaClock,
    label: 'Draft',
    description: 'PO is in draft state'
  },
  pending_approval: {
    color: 'bg-amber-50',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    icon: FaHourglassHalf,
    label: 'Pending Approval',
    description: 'Awaiting approval'
  },
  approved: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-700',
    icon: FaCheckCircle,
    label: 'Approved',
    description: 'PO approved'
  },
  sent: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-700',
    icon: FaPaperPlane,
    label: 'Sent to Vendor',
    description: 'PO sent to vendor'
  },
  acknowledged: {
    color: 'bg-blue-50',
    textColor: 'text-indigo-700',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    icon: FaClipboardCheck,
    label: 'Acknowledged',
    description: 'Vendor acknowledged PO'
  },
  received: {
    color: 'bg-blue-50',
    textColor: 'text-purple-700',
    badgeColor: 'bg-purple-100 text-purple-700',
    icon: FaTruck,
    label: 'Received',
    description: 'Materials received'
  },
  completed: {
    color: 'bg-green-50',
    textColor: 'text-teal-700',
    badgeColor: 'bg-teal-100 text-teal-700',
    icon: FaCheckCircle,
    label: 'Completed',
    description: 'PO completed'
  },
  cancelled: {
    color: 'bg-red-50',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-700',
    icon: FaExclamationTriangle,
    label: 'Cancelled',
    description: 'PO cancelled'
  }
};

// ============================================================================
// PRODUCTION ORDER STATUS
// ============================================================================

export const PRODUCTION_STATUS = {
  pending: {
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    badgeColor: 'bg-gray-100 text-gray-700',
    icon: FaClock,
    label: 'Pending',
    description: 'Awaiting production start'
  },
  in_progress: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-700',
    icon: FaCog,
    label: 'In Progress',
    description: 'Production in progress'
  },
  on_hold: {
    color: 'bg-amber-50',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    icon: FaHourglassHalf,
    label: 'On Hold',
    description: 'Production on hold'
  },
  quality_check: {
    color: 'bg-blue-50',
    textColor: 'text-purple-700',
    badgeColor: 'bg-purple-100 text-purple-700',
    icon: FaClipboardCheck,
    label: 'Quality Check',
    description: 'Undergoing quality inspection'
  },
  completed: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-700',
    icon: FaCheckCircle,
    label: 'Completed',
    description: 'Production completed'
  },
  cancelled: {
    color: 'bg-red-50',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-700',
    icon: FaTimesCircle,
    label: 'Cancelled',
    description: 'Production cancelled'
  }
};

// ============================================================================
// PRODUCTION STAGE STATUS
// ============================================================================

export const PRODUCTION_STAGE_STATUS = {
  pending: {
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: FaClock,
    label: 'Pending'
  },
  in_progress: {
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: FaCog,
    label: 'In Progress'
  },
  completed: {
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: FaCheckCircle,
    label: 'Completed'
  },
  on_hold: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: FaExclamationTriangle,
    label: 'On Hold'
  }
};

// ============================================================================
// INVOICE STATUS
// ============================================================================

export const INVOICE_STATUS = {
  pending: {
    color: 'bg-gray-50',
    textColor: 'text-gray-600',
    badgeColor: 'bg-gray-100 text-gray-600',
    icon: FaClock,
    label: 'Pending',
    description: 'Invoice pending'
  },
  generated: {
    color: 'bg-green-50',
    textColor: 'text-green-600',
    badgeColor: 'bg-green-100 text-green-600',
    icon: FaFileAlt,
    label: 'Generated',
    description: 'Invoice generated'
  },
  sent: {
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-600',
    icon: FaPaperPlane,
    label: 'Sent',
    description: 'Invoice sent to customer'
  },
  paid: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-700',
    icon: FaCheckCircle,
    label: 'Paid',
    description: 'Invoice paid'
  }
};

// ============================================================================
// CHALLAN STATUS
// ============================================================================

export const CHALLAN_STATUS = {
  pending: {
    color: 'bg-gray-50',
    textColor: 'text-gray-600',
    badgeColor: 'bg-gray-100 text-gray-600',
    icon: FaClock,
    label: 'Pending',
    description: 'Challan pending'
  },
  created: {
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-600',
    icon: FaFileAlt,
    label: 'Created',
    description: 'Challan created'
  },
  dispatched: {
    color: 'bg-blue-50',
    textColor: 'text-orange-600',
    badgeColor: 'bg-orange-100 text-orange-600',
    icon: FaTruck,
    label: 'Dispatched',
    description: 'Goods dispatched'
  },
  delivered: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-700',
    icon: FaCheckCircle,
    label: 'Delivered',
    description: 'Goods delivered'
  }
};

// ============================================================================
// PRIORITY CONFIGURATION
// ============================================================================

export const PRIORITY_CONFIG = {
  low: {
    color: 'bg-gray-50 text-gray-700 border border-gray-200',
    borderColor: 'border-gray-200',
    icon: '○',
    label: 'Low',
    value: 1
  },
  medium: {
    color: 'bg-blue-50 text-blue-700 border border-blue-100',
    borderColor: 'border-blue-200',
    icon: '◐',
    label: 'Medium',
    value: 2
  },
  high: {
    color: 'bg-amber-50 text-amber-700 border border-amber-100',
    borderColor: 'border-amber-200',
    icon: '◕',
    label: 'High',
    value: 3
  },
  urgent: {
    color: 'bg-red-50 text-red-700 border border-red-100',
    borderColor: 'border-red-200',
    icon: '●',
    label: 'Urgent',
    value: 4
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get status configuration by type and status
 * @param {string} type - Type of status (sales, procurement, production, etc.)
 * @param {string} status - Status value
 * @returns {object} Status configuration object
 */
export const getStatusConfig = (type, status) => {
  const configs = {
    sales: SALES_ORDER_STATUS,
    procurement: PROCUREMENT_STATUS,
    purchase_order: PURCHASE_ORDER_STATUS,
    production: PRODUCTION_STATUS,
    production_stage: PRODUCTION_STAGE_STATUS,
    invoice: INVOICE_STATUS,
    challan: CHALLAN_STATUS
  };

  const config = configs[type];
  if (!config) {
    console.warn(`Unknown status type: ${type}`);
    return SALES_ORDER_STATUS.draft; // Default fallback
  }

  return config[status] || config.draft || config.pending;
};

/**
 * Get priority configuration
 * @param {string} priority - Priority value (low, medium, high, urgent)
 * @returns {object} Priority configuration object
 */
export const getPriorityConfig = (priority) => {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
};

/**
 * Get all statuses for a given type
 * @param {string} type - Type of status
 * @returns {object} All statuses for the type
 */
export const getAllStatuses = (type) => {
  const configs = {
    sales: SALES_ORDER_STATUS,
    procurement: PROCUREMENT_STATUS,
    purchase_order: PURCHASE_ORDER_STATUS,
    production: PRODUCTION_STATUS,
    production_stage: PRODUCTION_STAGE_STATUS,
    invoice: INVOICE_STATUS,
    challan: CHALLAN_STATUS
  };

  return configs[type] || {};
};

/**
 * Get status options for dropdown/select
 * @param {string} type - Type of status
 * @returns {array} Array of {value, label} objects
 */
export const getStatusOptions = (type) => {
  const statuses = getAllStatuses(type);
  return Object.keys(statuses).map(key => ({
    value: key,
    label: statuses[key].label
  }));
};

/**
 * Get priority options for dropdown/select
 * @returns {array} Array of {value, label} objects
 */
export const getPriorityOptions = () => {
  return Object.keys(PRIORITY_CONFIG).map(key => ({
    value: key,
    label: PRIORITY_CONFIG[key].label,
    icon: PRIORITY_CONFIG[key].icon
  }));
};

export default {
  SALES_ORDER_STATUS,
  PROCUREMENT_STATUS,
  PURCHASE_ORDER_STATUS,
  PRODUCTION_STATUS,
  PRODUCTION_STAGE_STATUS,
  INVOICE_STATUS,
  CHALLAN_STATUS,
  PRIORITY_CONFIG,
  getStatusConfig,
  getPriorityConfig,
  getAllStatuses,
  getStatusOptions,
  getPriorityOptions
};
