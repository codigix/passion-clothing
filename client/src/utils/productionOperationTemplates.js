/**
 * Production Stage Operation Templates
 * 
 * This file contains predefined operation templates for each production stage.
 * These templates are used to automatically create operations when a stage is created.
 */

export const STAGE_OPERATION_TEMPLATES = {
  'Calculate Material': [
    {
      operation_name: 'Verify BOM',
      operation_order: 1,
      description: 'Verify Bill of Materials against sales order requirements',
      is_outsourced: false
    },
    {
      operation_name: 'Check Material Availability',
      operation_order: 2,
      description: 'Check if all required materials are available in inventory',
      is_outsourced: false
    },
    {
      operation_name: 'Allocate Materials',
      operation_order: 3,
      description: 'Allocate materials from inventory to this production order',
      is_outsourced: false
    }
  ],

  'Cutting': [
    {
      operation_name: 'Fabric Inspection',
      operation_order: 1,
      description: 'Inspect fabric for defects and quality issues',
      is_outsourced: false
    },
    {
      operation_name: 'Marker Making',
      operation_order: 2,
      description: 'Create cutting markers for optimal fabric utilization',
      is_outsourced: false
    },
    {
      operation_name: 'Fabric Spreading',
      operation_order: 3,
      description: 'Spread fabric layers on cutting table',
      is_outsourced: false
    },
    {
      operation_name: 'Cutting',
      operation_order: 4,
      description: 'Cut fabric according to markers',
      is_outsourced: false
    },
    {
      operation_name: 'Numbering/Bundling',
      operation_order: 5,
      description: 'Number and bundle cut pieces for tracking',
      is_outsourced: false
    }
  ],

  'Embroidery (In-House)': [
    {
      operation_name: 'Design Setup',
      operation_order: 1,
      description: 'Set up embroidery design on machine',
      is_outsourced: false
    },
    {
      operation_name: 'Sample Approval',
      operation_order: 2,
      description: 'Create sample and get approval',
      is_outsourced: false
    },
    {
      operation_name: 'Production Run',
      operation_order: 3,
      description: 'Run embroidery production',
      is_outsourced: false
    },
    {
      operation_name: 'Quality Check',
      operation_order: 4,
      description: 'Inspect embroidery quality',
      is_outsourced: false
    }
  ],

  'Embroidery (Outsourced)': [
    {
      operation_name: 'Prepare Materials',
      operation_order: 1,
      description: 'Prepare materials for dispatch to vendor',
      is_outsourced: false
    },
    {
      operation_name: 'Generate Challan',
      operation_order: 2,
      description: 'Generate delivery challan for vendor',
      is_outsourced: false
    },
    {
      operation_name: 'Dispatch to Vendor',
      operation_order: 3,
      description: 'Dispatch materials to embroidery vendor',
      is_outsourced: true
    },
    {
      operation_name: 'Vendor Processing',
      operation_order: 4,
      description: 'Vendor performs embroidery work',
      is_outsourced: true
    },
    {
      operation_name: 'Receive from Vendor',
      operation_order: 5,
      description: 'Receive embroidered items from vendor',
      is_outsourced: false
    },
    {
      operation_name: 'Quality Inspection',
      operation_order: 6,
      description: 'Inspect quality of embroidered items',
      is_outsourced: false
    }
  ],

  'Printing (In-House)': [
    {
      operation_name: 'Screen Preparation',
      operation_order: 1,
      description: 'Prepare printing screens',
      is_outsourced: false
    },
    {
      operation_name: 'Color Mixing',
      operation_order: 2,
      description: 'Mix printing colors according to specifications',
      is_outsourced: false
    },
    {
      operation_name: 'Sample Print',
      operation_order: 3,
      description: 'Create sample print for approval',
      is_outsourced: false
    },
    {
      operation_name: 'Production Printing',
      operation_order: 4,
      description: 'Run production printing',
      is_outsourced: false
    },
    {
      operation_name: 'Drying/Curing',
      operation_order: 5,
      description: 'Dry and cure printed items',
      is_outsourced: false
    },
    {
      operation_name: 'Quality Check',
      operation_order: 6,
      description: 'Inspect print quality',
      is_outsourced: false
    }
  ],

  'Printing (Outsourced)': [
    {
      operation_name: 'Prepare Materials',
      operation_order: 1,
      description: 'Prepare materials for dispatch to vendor',
      is_outsourced: false
    },
    {
      operation_name: 'Generate Challan',
      operation_order: 2,
      description: 'Generate delivery challan for vendor',
      is_outsourced: false
    },
    {
      operation_name: 'Dispatch to Vendor',
      operation_order: 3,
      description: 'Dispatch materials to printing vendor',
      is_outsourced: true
    },
    {
      operation_name: 'Vendor Processing',
      operation_order: 4,
      description: 'Vendor performs printing work',
      is_outsourced: true
    },
    {
      operation_name: 'Receive from Vendor',
      operation_order: 5,
      description: 'Receive printed items from vendor',
      is_outsourced: false
    },
    {
      operation_name: 'Quality Inspection',
      operation_order: 6,
      description: 'Inspect quality of printed items',
      is_outsourced: false
    }
  ],

  'Stitching': [
    {
      operation_name: 'Pattern Matching',
      operation_order: 1,
      description: 'Match patterns and prepare for sewing',
      is_outsourced: false
    },
    {
      operation_name: 'Sewing',
      operation_order: 2,
      description: 'Sew garment pieces together',
      is_outsourced: false
    },
    {
      operation_name: 'Joining',
      operation_order: 3,
      description: 'Join different parts of garment',
      is_outsourced: false
    },
    {
      operation_name: 'Attachment (buttons, zippers)',
      operation_order: 4,
      description: 'Attach buttons, zippers, and other accessories',
      is_outsourced: false
    },
    {
      operation_name: 'Quality Inspection',
      operation_order: 5,
      description: 'Inspect stitching quality',
      is_outsourced: false
    }
  ],

  'Finishing': [
    {
      operation_name: 'Thread Trimming',
      operation_order: 1,
      description: 'Trim excess threads',
      is_outsourced: false
    },
    {
      operation_name: 'Pressing/Ironing',
      operation_order: 2,
      description: 'Press and iron garments',
      is_outsourced: false
    },
    {
      operation_name: 'Folding',
      operation_order: 3,
      description: 'Fold garments properly',
      is_outsourced: false
    },
    {
      operation_name: 'Tagging',
      operation_order: 4,
      description: 'Attach tags and labels',
      is_outsourced: false
    },
    {
      operation_name: 'Packaging',
      operation_order: 5,
      description: 'Package finished garments',
      is_outsourced: false
    }
  ],

  'Quality Check': [
    {
      operation_name: 'Visual Inspection',
      operation_order: 1,
      description: 'Visual inspection for defects',
      is_outsourced: false
    },
    {
      operation_name: 'Measurement Check',
      operation_order: 2,
      description: 'Verify measurements against specifications',
      is_outsourced: false
    },
    {
      operation_name: 'Functional Test',
      operation_order: 3,
      description: 'Test functionality (zippers, buttons, etc.)',
      is_outsourced: false
    },
    {
      operation_name: 'Final Approval',
      operation_order: 4,
      description: 'Final approval for shipment',
      is_outsourced: false
    }
  ]
};

/**
 * Get operation template for a stage
 * @param {string} stageName - Name of the stage
 * @param {boolean} isOutsourced - Whether the stage is outsourced
 * @returns {Array} Array of operation templates
 */
export const getOperationTemplate = (stageName, isOutsourced = false) => {
  // Normalize stage name
  const normalizedName = stageName.trim();
  
  // Handle embroidery/printing with outsourcing
  if (normalizedName.toLowerCase().includes('embroidery')) {
    return isOutsourced 
      ? STAGE_OPERATION_TEMPLATES['Embroidery (Outsourced)']
      : STAGE_OPERATION_TEMPLATES['Embroidery (In-House)'];
  }
  
  if (normalizedName.toLowerCase().includes('printing')) {
    return isOutsourced 
      ? STAGE_OPERATION_TEMPLATES['Printing (Outsourced)']
      : STAGE_OPERATION_TEMPLATES['Printing (In-House)'];
  }
  
  // Return template if exists, otherwise return empty array
  return STAGE_OPERATION_TEMPLATES[normalizedName] || [];
};

/**
 * Get all available stage names
 * @returns {Array} Array of stage names
 */
export const getAvailableStages = () => {
  return Object.keys(STAGE_OPERATION_TEMPLATES).filter(
    key => !key.includes('(In-House)') && !key.includes('(Outsourced)')
  );
};

/**
 * Check if a stage supports outsourcing
 * @param {string} stageName - Name of the stage
 * @returns {boolean} True if stage supports outsourcing
 */
export const supportsOutsourcing = (stageName) => {
  const normalizedName = stageName.toLowerCase();
  return normalizedName.includes('embroidery') || normalizedName.includes('printing');
};

/**
 * Status workflow validation
 */
export const STATUS_TRANSITIONS = {
  pending: ['in_progress', 'on_hold', 'skipped'],
  in_progress: ['completed', 'on_hold', 'skipped'],
  on_hold: ['in_progress', 'skipped'],
  completed: [], // Cannot transition from completed
  skipped: [] // Cannot transition from skipped
};

/**
 * Check if status transition is valid
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - New status to transition to
 * @returns {boolean} True if transition is valid
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
  if (!STATUS_TRANSITIONS[currentStatus]) return false;
  return STATUS_TRANSITIONS[currentStatus].includes(newStatus);
};

/**
 * Get status badge color
 * @param {string} status - Status value
 * @returns {string} Tailwind color class
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    skipped: 'bg-red-100 text-red-800',
    failed: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Format status for display
 * @param {string} status - Status value
 * @returns {string} Formatted status
 */
export const formatStatus = (status) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};