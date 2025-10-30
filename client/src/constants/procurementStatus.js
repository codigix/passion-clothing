/**
 * Procurement Module - Status & Configuration Constants
 * Centralized constants for badges, colors, and status configurations
 */

/**
 * PO Status Badge Configurations
 * Each status includes: color classes, display label, and icon name
 */
export const PO_STATUS_BADGES = {
  draft: {
    color: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    label: 'Draft',
    icon: 'FileText',
    description: 'Not submitted for approval'
  },
  pending_approval: {
    color: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    label: 'Pending Approval',
    icon: 'Clock',
    description: 'Waiting for admin approval'
  },
  approved: {
    color: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Approved',
    icon: 'CheckCircle2',
    description: 'Approved by admin'
  },
  sent: {
    color: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    label: 'Sent to Vendor',
    icon: 'Send',
    description: 'Sent to vendor for fulfillment'
  },
  received: {
    color: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Received',
    icon: 'Package',
    description: 'Materials received from vendor'
  },
  partial_received: {
    color: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    label: 'Partially Received',
    icon: 'AlertCircle',
    description: 'Some materials received'
  },
  completed: {
    color: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Completed',
    icon: 'CheckCheck',
    description: 'All processes completed'
  },
  rejected: {
    color: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Rejected',
    icon: 'XCircle',
    description: 'Rejected during approval'
  },
  cancelled: {
    color: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    label: 'Cancelled',
    icon: 'Ban',
    description: 'Cancelled by user'
  },
  on_hold: {
    color: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    label: 'On Hold',
    icon: 'PauseCircle',
    description: 'Temporarily on hold'
  }
};

/**
 * Priority Badge Configurations
 */
export const PRIORITY_BADGES = {
  low: {
    color: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Low',
    icon: 'ArrowDown'
  },
  medium: {
    color: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Medium',
    icon: 'Minus'
  },
  high: {
    color: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    label: 'High',
    icon: 'ArrowUp'
  },
  urgent: {
    color: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Urgent',
    icon: 'AlertTriangle'
  }
};

/**
 * Vendor Status Badge Configurations
 */
export const VENDOR_STATUS_BADGES = {
  active: {
    color: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Active',
    icon: 'CheckCircle'
  },
  inactive: {
    color: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    label: 'Inactive',
    icon: 'Circle'
  },
  blacklisted: {
    color: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Blacklisted',
    icon: 'Ban'
  }
};

/**
 * Vendor Type Badge Configurations
 */
export const VENDOR_TYPE_BADGES = {
  material_supplier: {
    color: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Material Supplier',
    icon: 'Package'
  },
  outsource_partner: {
    color: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    label: 'Outsource Partner',
    icon: 'Users'
  },
  service_provider: {
    color: 'bg-cyan-100',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    label: 'Service Provider',
    icon: 'Wrench'
  },
  both: {
    color: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    label: 'Both',
    icon: 'Briefcase'
  }
};

/**
 * Material Request Status Badge Configurations
 */
export const MATERIAL_REQUEST_STATUS_BADGES = {
  pending: {
    color: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    label: 'Pending Review',
    icon: 'Clock'
  },
  reviewed: {
    color: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Reviewed',
    icon: 'CheckCircle'
  },
  forwarded_to_inventory: {
    color: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    label: 'Forwarded to Inventory',
    icon: 'Send'
  },
  stock_checking: {
    color: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    label: 'Checking Stock',
    icon: 'Search'
  },
  stock_available: {
    color: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Stock Available',
    icon: 'CheckCircle'
  },
  partial_available: {
    color: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    label: 'Partial Stock',
    icon: 'AlertCircle'
  },
  stock_unavailable: {
    color: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Stock Unavailable',
    icon: 'XCircle'
  },
  materials_reserved: {
    color: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Materials Reserved',
    icon: 'Lock'
  },
  materials_issued: {
    color: 'bg-teal-100',
    text: 'text-teal-700',
    border: 'border-teal-200',
    label: 'Materials Issued',
    icon: 'CheckCircle'
  },
  completed: {
    color: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Completed',
    icon: 'CheckCheck'
  },
  cancelled: {
    color: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Cancelled',
    icon: 'Ban'
  }
};

/**
 * Quality Status Badge Configurations
 */
export const QUALITY_STATUS_BADGES = {
  approved: {
    color: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Approved',
    icon: 'CheckCircle'
  },
  pending_qc: {
    color: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    label: 'Pending QC',
    icon: 'Clock'
  },
  rejected: {
    color: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Rejected',
    icon: 'XCircle'
  },
  rework_required: {
    color: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    label: 'Rework Required',
    icon: 'AlertCircle'
  }
};

/**
 * GRN Status Badge Configurations
 */
export const GRN_STATUS_BADGES = {
  draft: {
    color: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    label: 'Draft',
    icon: 'FileText'
  },
  pending: {
    color: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    label: 'Pending',
    icon: 'Clock'
  },
  verified: {
    color: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Verified',
    icon: 'CheckCircle'
  },
  approved: {
    color: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Approved',
    icon: 'CheckCheck'
  },
  rejected: {
    color: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Rejected',
    icon: 'XCircle'
  }
};

/**
 * Badge helper function to get badge config
 * Usage: getBadgeConfig('status', statusValue, 'PO_STATUS_BADGES')
 */
export const getBadgeConfig = (configKey, statusValue, configName = 'PO_STATUS_BADGES') => {
  const configs = {
    PO_STATUS_BADGES,
    PRIORITY_BADGES,
    VENDOR_STATUS_BADGES,
    VENDOR_TYPE_BADGES,
    MATERIAL_REQUEST_STATUS_BADGES,
    QUALITY_STATUS_BADGES,
    GRN_STATUS_BADGES
  };
  
  const config = configs[configName] || PO_STATUS_BADGES;
  return config[statusValue] || config.draft;
};

/**
 * Get all statuses for a config
 */
export const getStatuses = (configName = 'PO_STATUS_BADGES') => {
  const configs = {
    PO_STATUS_BADGES,
    PRIORITY_BADGES,
    VENDOR_STATUS_BADGES,
    VENDOR_TYPE_BADGES,
    MATERIAL_REQUEST_STATUS_BADGES,
    QUALITY_STATUS_BADGES,
    GRN_STATUS_BADGES
  };
  
  const config = configs[configName] || PO_STATUS_BADGES;
  return Object.keys(config);
};

/**
 * PO Status lifecycle for validation
 */
export const PO_STATUS_LIFECYCLE = {
  draft: ['pending_approval', 'cancelled'],
  pending_approval: ['approved', 'rejected'],
  approved: ['sent', 'cancelled'],
  sent: ['received', 'partial_received', 'on_hold', 'cancelled'],
  partial_received: ['received', 'completed', 'on_hold'],
  received: ['completed', 'cancelled'],
  completed: [],
  rejected: ['draft'],
  cancelled: [],
  on_hold: ['sent', 'cancelled']
};

/**
 * Action configurations with labels and colors
 */
export const ACTIONS = {
  view: {
    label: 'View Details',
    icon: 'Eye',
    color: 'blue',
    variant: 'ghost'
  },
  edit: {
    label: 'Edit',
    icon: 'Pencil',
    color: 'blue',
    variant: 'ghost'
  },
  delete: {
    label: 'Delete',
    icon: 'Trash2',
    color: 'red',
    variant: 'ghost'
  },
  submit_approval: {
    label: 'Submit for Approval',
    icon: 'Send',
    color: 'blue',
    variant: 'default'
  },
  approve: {
    label: 'Approve',
    icon: 'CheckCircle',
    color: 'green',
    variant: 'default'
  },
  reject: {
    label: 'Reject',
    icon: 'XCircle',
    color: 'red',
    variant: 'default'
  },
  send_to_vendor: {
    label: 'Send to Vendor',
    icon: 'Send',
    color: 'blue',
    variant: 'default'
  },
  material_received: {
    label: 'Mark as Received',
    icon: 'Package',
    color: 'green',
    variant: 'default'
  },
  request_grn: {
    label: 'Request GRN',
    icon: 'FileText',
    color: 'blue',
    variant: 'default'
  },
  mark_complete: {
    label: 'Mark Complete',
    icon: 'CheckCheck',
    color: 'green',
    variant: 'default'
  },
  generate_invoice: {
    label: 'Generate Invoice',
    icon: 'FileInvoice',
    color: 'blue',
    variant: 'default'
  },
  resubmit: {
    label: 'Resubmit',
    icon: 'RotateCw',
    color: 'blue',
    variant: 'default'
  },
  resume: {
    label: 'Resume',
    icon: 'Play',
    color: 'blue',
    variant: 'default'
  },
  cancel: {
    label: 'Cancel',
    icon: 'X',
    color: 'red',
    variant: 'default'
  }
};

/**
 * Table column definitions
 */
export const TABLE_COLUMNS = {
  PURCHASE_ORDERS: [
    { id: 'po_number', label: 'PO Number', minWidth: 120 },
    { id: 'po_date', label: 'Date', minWidth: 100 },
    { id: 'vendor', label: 'Vendor', minWidth: 150 },
    { id: 'linked_so', label: 'Linked SO', minWidth: 120 },
    { id: 'customer', label: 'Customer', minWidth: 150 },
    { id: 'total_quantity', label: 'Quantity', minWidth: 100 },
    { id: 'final_amount', label: 'Total Amount', minWidth: 130 },
    { id: 'expected_delivery_date', label: 'Expected Delivery', minWidth: 130 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'priority', label: 'Priority', minWidth: 100 },
    { id: 'actions', label: 'Actions', minWidth: 100 }
  ],
  VENDORS: [
    { id: 'vendor_code', label: 'Code', minWidth: 100 },
    { id: 'name', label: 'Vendor Name', minWidth: 150 },
    { id: 'vendor_type', label: 'Type', minWidth: 120 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'contact', label: 'Contact', minWidth: 150 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'rating', label: 'Rating', minWidth: 80 },
    { id: 'actions', label: 'Actions', minWidth: 80 }
  ]
};

/**
 * Date range options for filters
 */
export const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisQuarter', label: 'This Quarter' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' }
];

export default {
  PO_STATUS_BADGES,
  PRIORITY_BADGES,
  VENDOR_STATUS_BADGES,
  VENDOR_TYPE_BADGES,
  MATERIAL_REQUEST_STATUS_BADGES,
  QUALITY_STATUS_BADGES,
  GRN_STATUS_BADGES,
  getBadgeConfig,
  getStatuses,
  PO_STATUS_LIFECYCLE,
  ACTIONS,
  TABLE_COLUMNS,
  DATE_RANGE_OPTIONS
};