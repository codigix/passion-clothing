/**
 * Minimalist Status and Priority Configurations
 * 
 * Design Philosophy: Minimal colors, subtle tints, professional appearance
 * - No gradients
 * - Subtle background colors
 * - No icons in badges (cleaner look)
 * - Consistent, minimal styling
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
// SALES ORDER STATUS (Minimalist)
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
    description: 'Order cancelled'
  }
};

// ============================================================================
// PROCUREMENT STATUS (Minimalist)
// ============================================================================

export const PROCUREMENT_STATUS = {
  pending: {
    color: 'bg-amber-50',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-50 text-amber-700 border border-amber-100',
    icon: FaClock,
    label: 'Pending',
    description: 'Awaiting processing'
  },
  approved: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaCheckCircle,
    label: 'Approved',
    description: 'Request approved'
  },
  ordered: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaClipboardCheck,
    label: 'Ordered',
    description: 'Order placed with supplier'
  },
  received: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-50 text-green-700 border border-green-100',
    icon: FaTruck,
    label: 'Received',
    description: 'Materials received'
  },
  completed: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-50 text-green-700 border border-green-100',
    icon: FaCheckCircle,
    label: 'Completed',
    description: 'Procurement completed'
  },
  cancelled: {
    color: 'bg-red-50',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-50 text-red-700 border border-red-100',
    icon: FaTimesCircle,
    label: 'Cancelled',
    description: 'Request cancelled'
  }
};

// ============================================================================
// PURCHASE ORDER STATUS (Minimalist)
// ============================================================================

export const PURCHASE_ORDER_STATUS = {
  draft: {
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    badgeColor: 'bg-gray-50 text-gray-700 border border-gray-200',
    icon: FaFileAlt,
    label: 'Draft',
    description: 'PO in draft state'
  },
  pending_approval: {
    color: 'bg-amber-50',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-50 text-amber-700 border border-amber-100',
    icon: FaClock,
    label: 'Pending Approval',
    description: 'Awaiting approval'
  },
  approved: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaCheckCircle,
    label: 'Approved',
    description: 'PO approved'
  },
  sent_to_supplier: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaPaperPlane,
    label: 'Sent to Supplier',
    description: 'PO sent to supplier'
  },
  confirmed: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaCheckCircle,
    label: 'Confirmed',
    description: 'Supplier confirmed'
  },
  in_transit: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaTruck,
    label: 'In Transit',
    description: 'Materials in transit'
  },
  received: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-50 text-green-700 border border-green-100',
    icon: FaBox,
    label: 'Received',
    description: 'Materials received'
  },
  completed: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-50 text-green-700 border border-green-100',
    icon: FaCheckCircle,
    label: 'Completed',
    description: 'PO completed'
  },
  cancelled: {
    color: 'bg-red-50',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-50 text-red-700 border border-red-100',
    icon: FaTimesCircle,
    label: 'Cancelled',
    description: 'PO cancelled'
  }
};

// ============================================================================
// PRODUCTION STATUS (Minimalist)
// ============================================================================

export const PRODUCTION_STATUS = {
  pending: {
    color: 'bg-amber-50',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-50 text-amber-700 border border-amber-100',
    icon: FaClock,
    label: 'Pending',
    description: 'Awaiting production start'
  },
  in_progress: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaCog,
    label: 'In Progress',
    description: 'Production in progress'
  },
  quality_check: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaClipboardCheck,
    label: 'Quality Check',
    description: 'Under quality inspection'
  },
  completed: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-50 text-green-700 border border-green-100',
    icon: FaCheckCircle,
    label: 'Completed',
    description: 'Production completed'
  },
  on_hold: {
    color: 'bg-amber-50',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-50 text-amber-700 border border-amber-100',
    icon: FaExclamationTriangle,
    label: 'On Hold',
    description: 'Production on hold'
  },
  cancelled: {
    color: 'bg-red-50',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-50 text-red-700 border border-red-100',
    icon: FaTimesCircle,
    label: 'Cancelled',
    description: 'Production cancelled'
  }
};

// ============================================================================
// PRODUCTION STAGE STATUS (Minimalist)
// ============================================================================

export const PRODUCTION_STAGE_STATUS = {
  not_started: {
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    badgeColor: 'bg-gray-50 text-gray-700 border border-gray-200',
    icon: FaClock,
    label: 'Not Started',
    description: 'Stage not started'
  },
  in_progress: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaCog,
    label: 'In Progress',
    description: 'Stage in progress'
  },
  completed: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-50 text-green-700 border border-green-100',
    icon: FaCheckCircle,
    label: 'Completed',
    description: 'Stage completed'
  },
  skipped: {
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    badgeColor: 'bg-gray-50 text-gray-700 border border-gray-200',
    icon: FaTimesCircle,
    label: 'Skipped',
    description: 'Stage skipped'
  }
};

// ============================================================================
// INVOICE STATUS (Minimalist)
// ============================================================================

export const INVOICE_STATUS = {
  draft: {
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    badgeColor: 'bg-gray-50 text-gray-700 border border-gray-200',
    icon: FaFileAlt,
    label: 'Draft',
    description: 'Invoice in draft'
  },
  sent: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaPaperPlane,
    label: 'Sent',
    description: 'Invoice sent'
  },
  paid: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-50 text-green-700 border border-green-100',
    icon: FaCheckCircle,
    label: 'Paid',
    description: 'Invoice paid'
  },
  overdue: {
    color: 'bg-red-50',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-50 text-red-700 border border-red-100',
    icon: FaExclamationTriangle,
    label: 'Overdue',
    description: 'Payment overdue'
  }
};

// ============================================================================
// CHALLAN STATUS (Minimalist)
// ============================================================================

export const CHALLAN_STATUS = {
  draft: {
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    badgeColor: 'bg-gray-50 text-gray-700 border border-gray-200',
    icon: FaFileAlt,
    label: 'Draft',
    description: 'Challan in draft'
  },
  issued: {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: FaPaperPlane,
    label: 'Issued',
    description: 'Challan issued'
  },
  received: {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-50 text-green-700 border border-green-100',
    icon: FaCheckCircle,
    label: 'Received',
    description: 'Challan received'
  },
  cancelled: {
    color: 'bg-red-50',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-50 text-red-700 border border-red-100',
    icon: FaTimesCircle,
    label: 'Cancelled',
    description: 'Challan cancelled'
  }
};

// ============================================================================
// PRIORITY CONFIGURATION (Minimalist)
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
 * Get status configuration by type and status value
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

  const config = configs[type]?.[status];
  
  if (!config) {
    return {
      color: 'bg-gray-50',
      textColor: 'text-gray-700',
      badgeColor: 'bg-gray-50 text-gray-700 border border-gray-200',
      icon: FaClock,
      label: status || 'Unknown',
      description: 'Status not configured'
    };
  }

  return config;
};

/**
 * Get priority configuration
 */
export const getPriorityConfig = (priority) => {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
};

/**
 * Get all statuses for a type
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
 * Get status options for dropdowns
 */
export const getStatusOptions = (type) => {
  const statuses = getAllStatuses(type);
  return Object.entries(statuses).map(([value, config]) => ({
    value,
    label: config.label
  }));
};

/**
 * Get priority options for dropdowns
 */
export const getPriorityOptions = () => {
  return Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
    value,
    label: config.label
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