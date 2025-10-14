// Predefined stage operations for each manufacturing stage

const STAGE_TEMPLATES = {
  'material_calculation': {
    name: 'Material Calculation',
    operations: [
      {
        name: 'Review Production Request',
        description: 'Check production request details and specifications',
        order: 1
      },
      {
        name: 'Verify Material Availability',
        description: 'Check if all required materials are available in inventory',
        order: 2
      },
      {
        name: 'Calculate Exact Quantities',
        description: 'Calculate exact material quantities needed based on order',
        order: 3
      },
      {
        name: 'Create Material Requisition',
        description: 'Create material requisition for missing items',
        order: 4
      },
      {
        name: 'Approve Material Plan',
        description: 'Get approval for material usage plan',
        order: 5
      }
    ]
  },
  
  'cutting': {
    name: 'Cutting',
    operations: [
      {
        name: 'Prepare Cutting Table',
        description: 'Clean and prepare cutting table/area',
        order: 1
      },
      {
        name: 'Fabric Spreading',
        description: 'Spread fabric layers on cutting table',
        order: 2
      },
      {
        name: 'Pattern Marking',
        description: 'Mark cutting patterns on fabric',
        order: 3
      },
      {
        name: 'Cut Fabric',
        description: 'Cut fabric according to patterns',
        order: 4
      },
      {
        name: 'Bundle and Label',
        description: 'Bundle cut pieces and attach labels',
        order: 5
      },
      {
        name: 'Quality Check',
        description: 'Check cut pieces for accuracy and defects',
        order: 6
      }
    ]
  },
  
  'embroidery_printing': {
    name: 'Embroidery/Printing',
    operations: [
      {
        name: 'Design Selection',
        description: 'Select and finalize embroidery/printing design',
        order: 1
      },
      {
        name: 'Prepare Work Order',
        description: 'Create detailed work order with specifications',
        order: 2
      },
      {
        name: 'Send to Vendor',
        description: 'Create dispatch challan and send materials to vendor',
        order: 3,
        isOutsourced: true
      },
      {
        name: 'Track Vendor Progress',
        description: 'Monitor vendor progress and timeline',
        order: 4,
        isOutsourced: true
      },
      {
        name: 'Receive from Vendor',
        description: 'Receive completed work and create return challan',
        order: 5,
        isOutsourced: true
      },
      {
        name: 'Quality Inspection',
        description: 'Inspect embroidery/printing quality',
        order: 6
      }
    ]
  },
  
  'embroidery_printing_inhouse': {
    name: 'Embroidery/Printing (In-House)',
    operations: [
      {
        name: 'Design Selection',
        description: 'Select and finalize embroidery/printing design',
        order: 1
      },
      {
        name: 'Prepare Machine Setup',
        description: 'Set up embroidery/printing machine with design',
        order: 2
      },
      {
        name: 'Test Run',
        description: 'Perform test run on sample fabric',
        order: 3
      },
      {
        name: 'Production Run',
        description: 'Execute embroidery/printing on all pieces',
        order: 4
      },
      {
        name: 'Drying/Curing',
        description: 'Allow prints to dry or cure properly',
        order: 5
      },
      {
        name: 'Quality Inspection',
        description: 'Inspect embroidery/printing quality',
        order: 6
      }
    ]
  },
  
  'stitching': {
    name: 'Stitching',
    operations: [
      {
        name: 'Prepare Sewing Machines',
        description: 'Set up and test sewing machines',
        order: 1
      },
      {
        name: 'Thread Color Matching',
        description: 'Match thread colors to fabric',
        order: 2
      },
      {
        name: 'Assemble Garment Parts',
        description: 'Join garment parts according to design',
        order: 3
      },
      {
        name: 'Seam Finishing',
        description: 'Finish and reinforce seams',
        order: 4
      },
      {
        name: 'Attach Accessories',
        description: 'Attach buttons, zippers, labels, etc.',
        order: 5
      },
      {
        name: 'In-line Quality Check',
        description: 'Check stitching quality at each station',
        order: 6
      }
    ]
  },
  
  'finishing': {
    name: 'Finishing',
    operations: [
      {
        name: 'Thread Trimming',
        description: 'Remove excess threads and loose ends',
        order: 1
      },
      {
        name: 'Washing',
        description: 'Wash garments as per specifications',
        order: 2
      },
      {
        name: 'Drying',
        description: 'Dry garments properly',
        order: 3
      },
      {
        name: 'Ironing/Pressing',
        description: 'Iron and press garments',
        order: 4
      },
      {
        name: 'Spot Cleaning',
        description: 'Remove any stains or marks',
        order: 5
      },
      {
        name: 'Final Touch-up',
        description: 'Final finishing touches',
        order: 6
      }
    ]
  },
  
  'quality_control': {
    name: 'Quality Control',
    operations: [
      {
        name: 'Visual Inspection',
        description: 'Visual check for defects and quality issues',
        order: 1
      },
      {
        name: 'Measurement Check',
        description: 'Verify garment measurements against specifications',
        order: 2
      },
      {
        name: 'Color Consistency',
        description: 'Check color consistency across batch',
        order: 3
      },
      {
        name: 'Stitch Quality',
        description: 'Inspect stitch quality and strength',
        order: 4
      },
      {
        name: 'Accessories Check',
        description: 'Verify all accessories are properly attached',
        order: 5
      },
      {
        name: 'Final Approval',
        description: 'Final QC approval or rejection',
        order: 6
      }
    ]
  },
  
  'packaging': {
    name: 'Packaging',
    operations: [
      {
        name: 'Fold Garments',
        description: 'Fold garments according to standards',
        order: 1
      },
      {
        name: 'Attach Tags',
        description: 'Attach price tags, care labels, etc.',
        order: 2
      },
      {
        name: 'Pack in Poly Bags',
        description: 'Pack garments in poly bags',
        order: 3
      },
      {
        name: 'Box Packing',
        description: 'Pack poly bags in cartons',
        order: 4
      },
      {
        name: 'Carton Labeling',
        description: 'Label cartons with order details',
        order: 5
      },
      {
        name: 'Ready for Shipment',
        description: 'Move to shipment area',
        order: 6
      }
    ]
  }
};

// Helper function to get operations for a stage
function getOperationsForStage(stageName) {
  const normalizedName = stageName.toLowerCase().replace(/\s+/g, '_');
  
  // Direct match
  if (STAGE_TEMPLATES[normalizedName]) {
    return STAGE_TEMPLATES[normalizedName];
  }
  
  // Handle common variations
  const nameMapping = {
    'calculate_material_review': 'material_calculation',
    'material_review': 'material_calculation',
    'material_calculation': 'material_calculation',
    'cutting': 'cutting',
    'embroidery_or_printing': 'embroidery_printing',
    'embroidery/printing': 'embroidery_printing',
    'printing': 'embroidery_printing',
    'embroidery': 'embroidery_printing',
    'stitching': 'stitching',
    'finishing': 'finishing',
    'quality_check': 'quality_control',
    'quality_control': 'quality_control',
    'packaging': 'packaging'
  };
  
  const mappedKey = nameMapping[normalizedName];
  return mappedKey ? STAGE_TEMPLATES[mappedKey] : null;
}

// Helper function to create operations for a production stage
async function createOperationsForStage(stageId, stageName, StageOperation, stageData = {}) {
  let templateKey = stageName;
  
  // For embroidery/printing stages, check if outsourced
  const normalizedName = stageName.toLowerCase().replace(/\s+/g, '_');
  const isEmbroideryPrinting = normalizedName.includes('embroidery') || normalizedName.includes('printing');
  
  if (isEmbroideryPrinting && stageData.outsourced === false) {
    // Use in-house template for embroidery/printing
    templateKey = 'embroidery_printing_inhouse';
  }
  
  const template = getOperationsForStage(templateKey);
  if (!template) {
    console.warn(`No template found for stage: ${stageName}`);
    return [];
  }

  const operations = [];
  for (const op of template.operations) {
    const operation = await StageOperation.create({
      production_stage_id: stageId,
      operation_name: op.name,
      operation_order: op.order,
      description: op.description,
      status: 'pending',
      is_outsourced: op.isOutsourced || false,
      vendor_id: stageData.vendor_id || null
    });
    operations.push(operation);
  }

  return operations;
}

// Get all stage names
function getAllStageNames() {
  return Object.keys(STAGE_TEMPLATES).map(key => ({
    key,
    name: STAGE_TEMPLATES[key].name
  }));
}

module.exports = {
  STAGE_TEMPLATES,
  getOperationsForStage,
  createOperationsForStage,
  getAllStageNames
};