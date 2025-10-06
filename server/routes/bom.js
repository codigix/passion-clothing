const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const { BillOfMaterials, SalesOrder, Product, User, PurchaseOrder, Vendor } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');

const router = express.Router();

// Generate BOM number
const generateBOMNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  const lastBOM = await BillOfMaterials.findOne({
    where: {
      bom_number: {
        [Op.like]: `BOM-${dateStr}-%`
      }
    },
    order: [['created_at', 'DESC']]
  });

  let sequence = 1;
  if (lastBOM) {
    const lastSequence = parseInt(lastBOM.bom_number.split('-')[2], 10);
    sequence = Number.isNaN(lastSequence) ? 1 : lastSequence + 1;
  }

  return `BOM-${dateStr}-${sequence.toString().padStart(4, '0')}`;
};

// Generate BOM from Sales Order
router.post('/generate/:salesOrderId', authenticateToken, checkDepartment(['procurement', 'admin']),  async (req, res) => {
  try {
    const { salesOrderId } = req.params;

    // Check if sales order exists and is confirmed
    const salesOrder = await SalesOrder.findByPk(salesOrderId, {
      include: [
        { model: Product, as: 'products', through: { attributes: [] } }
      ]
    });

    if (!salesOrder) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    // Allow BOM generation for confirmed orders and orders ready for procurement
    const allowedStatuses = ['confirmed', 'in_production', 'materials_pending', 'ready_to_ship'];
    if (!allowedStatuses.includes(salesOrder.status)) {
      return res.status(400).json({ message: `Sales order must be confirmed before generating BOM. Current status: ${salesOrder.status}` });
    }

    // Check if BOM already exists for this sales order
    const existingBOM = await BillOfMaterials.findOne({
      where: { sales_order_id: salesOrderId }
    });

    if (existingBOM) {
      return res.status(400).json({ message: 'BOM already exists for this sales order' });
    }

    // Generate BOM number
    const bomNumber = await generateBOMNumber();

    // Generate materials list based on garment specifications and order items
    const materials = [];
    let totalMaterialCost = 0;

    // Process each item in the sales order
    for (const item of salesOrder.items) {
      // Basic materials calculation - this would be more sophisticated in production
      const itemMaterials = await generateMaterialsForItem(item, salesOrder.garment_specifications);
      materials.push(...itemMaterials);

      // Calculate costs (simplified - would use actual product costs)
      for (const material of itemMaterials) {
        // This is a placeholder - in reality, you'd look up current prices
        totalMaterialCost += (material.quantity * material.estimated_cost_per_unit) || 0;
      }
    }

    // Create BOM
    const bom = await BillOfMaterials.create({
      bom_number: bomNumber,
      sales_order_id: salesOrderId,
      product_id: salesOrder.items[0]?.product_id || null, // For now, assume single product type
      materials: materials,
      total_material_cost: totalMaterialCost,
      estimated_production_cost: totalMaterialCost * 1.2, // 20% markup for production costs
      status: 'draft',
      fabric_type: salesOrder.garment_specifications?.fabric_type,
      fabric_gsm: salesOrder.garment_specifications?.gsm,
      fabric_color: salesOrder.garment_specifications?.color,
      thread_colors: salesOrder.garment_specifications?.thread_colors,
      button_count: salesOrder.garment_specifications?.button_count || 0,
      printing_required: salesOrder.garment_specifications?.printing || false,
      embroidery_required: salesOrder.garment_specifications?.embroidery || false,
      special_instructions: salesOrder.special_instructions,
      created_by: req.user.id
    });

    // Update sales order status to indicate BOM created
    await salesOrder.update({
      status: 'materials_pending',
      qr_code: JSON.stringify({
        ...JSON.parse(salesOrder.qr_code || '{}'),
        status: 'materials_pending',
        bom_generated: true,
        bom_id: bom.id,
        updated_at: new Date().toISOString()
      })
    });

    res.status(201).json({
      message: 'BOM generated successfully',
      bom: {
        id: bom.id,
        bom_number: bom.bom_number,
        status: bom.status
      }
    });
  } catch (error) {
    console.error('BOM generation error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate BOM' });
  }
});

// Helper function to generate materials for an item
const generateMaterialsForItem = async (item, garmentSpecs) => {
  const materials = [];

  // Fabric material
  if (garmentSpecs?.fabric_type) {
    materials.push({
      type: 'fabric',
      product_code: `FAB-${garmentSpecs.fabric_type}-${garmentSpecs.gsm || 'N/A'}`,
      description: `${garmentSpecs.fabric_type} fabric ${garmentSpecs.gsm ? `(${garmentSpecs.gsm} GSM)` : ''}`,
      quantity: item.quantity * 1.5, // 1.5 meters per piece (placeholder)
      unit: 'meter',
      color: garmentSpecs.color,
      estimated_cost_per_unit: 100, // Placeholder - would be looked up
      specifications: {
        gsm: garmentSpecs.gsm,
        type: garmentSpecs.fabric_type
      }
    });
  }

  // Thread materials
  if (garmentSpecs?.thread_colors) {
    const threadColors = garmentSpecs.thread_colors.split(',').map(c => c.trim());
    for (const color of threadColors) {
      materials.push({
        type: 'thread',
        product_code: `THR-${color}`,
        description: `${color} thread`,
        quantity: item.quantity * 10, // 10 meters per piece (placeholder)
        unit: 'meter',
        color: color,
        estimated_cost_per_unit: 5,
        specifications: {}
      });
    }
  }

  // Buttons
  if (garmentSpecs?.button_count && garmentSpecs.button_count > 0) {
    materials.push({
      type: 'button',
      product_code: 'BTN-STD',
      description: 'Standard buttons',
      quantity: item.quantity * garmentSpecs.button_count,
      unit: 'piece',
      estimated_cost_per_unit: 2,
      specifications: {}
    });
  }

  // Labels/tags
  materials.push({
    type: 'label',
    product_code: 'LBL-MAIN',
    description: 'Main label',
    quantity: item.quantity,
    unit: 'piece',
    estimated_cost_per_unit: 1,
    specifications: {}
  });

  // Size labels
  materials.push({
    type: 'label',
    product_code: 'LBL-SIZE',
    description: 'Size label',
    quantity: item.quantity,
    unit: 'piece',
    estimated_cost_per_unit: 0.5,
    specifications: {}
  });

  // Care labels
  materials.push({
    type: 'label',
    product_code: 'LBL-CARE',
    description: 'Care label',
    quantity: item.quantity,
    unit: 'piece',
    estimated_cost_per_unit: 0.5,
    specifications: {}
  });

  // Poly bags for packing
  materials.push({
    type: 'packaging',
    product_code: 'PKG-POLYBAG',
    description: 'Poly bag for packing',
    quantity: Math.ceil(item.quantity / 10), // 1 bag per 10 pieces
    unit: 'piece',
    estimated_cost_per_unit: 3,
    specifications: {}
  });

  return materials;
};

// Get all BOMs
router.get('/', authenticateToken, checkDepartment(['procurement', 'admin', 'manufacturing']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sales_order_id,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = Array.isArray(status) ? status : [status];
    }

    if (sales_order_id) {
      where.sales_order_id = sales_order_id;
    }

    if (search) {
      where[Op.or] = [
        { bom_number: { [Op.like]: `%${search}%` } },
        { special_instructions: { [Op.like]: `%${search}%` } }
      ];
    }

    const { rows: boms, count } = await BillOfMaterials.findAndCountAll({
      where,
      include: [
        {
          model: SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'order_number', 'customer_id'],
          include: [{
            model: require('../models/Customer'),
            as: 'customer',
            attributes: ['id', 'name']
          }]
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'product_code']
        },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: User, as: 'approver', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    res.json({
      boms,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('BOM fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch BOMs' });
  }
});

// Get single BOM
router.get('/:id', authenticateToken, checkDepartment(['procurement', 'admin', 'manufacturing']), async (req, res) => {
  try {
    const bom = await BillOfMaterials.findByPk(req.params.id, {
      include: [
        {
          model: SalesOrder,
          as: 'salesOrder',
          include: [{
            model: require('../models/Customer'),
            as: 'customer',
            attributes: ['id', 'name', 'customer_code']
          }]
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'product_code']
        },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: User, as: 'approver', attributes: ['id', 'name'] },
        {
          model: PurchaseOrder,
          as: 'purchaseOrders',
          include: [{
            model: Vendor,
            as: 'vendor',
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    res.json({ bom });
  } catch (error) {
    console.error('BOM fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch BOM' });
  }
});

// Update BOM
router.put('/:id', authenticateToken, checkDepartment(['procurement', 'admin']), async (req, res) => {
  try {
    const bom = await BillOfMaterials.findByPk(req.params.id);

    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    const {
      materials,
      fabric_type,
      fabric_gsm,
      fabric_color,
      thread_colors,
      button_count,
      printing_required,
      embroidery_required,
      production_requirements,
      special_instructions,
      internal_notes
    } = req.body;

    const updateData = {};

    if (materials) updateData.materials = materials;
    if (fabric_type !== undefined) updateData.fabric_type = fabric_type;
    if (fabric_gsm !== undefined) updateData.fabric_gsm = fabric_gsm;
    if (fabric_color !== undefined) updateData.fabric_color = fabric_color;
    if (thread_colors !== undefined) updateData.thread_colors = thread_colors;
    if (button_count !== undefined) updateData.button_count = button_count;
    if (printing_required !== undefined) updateData.printing_required = printing_required;
    if (embroidery_required !== undefined) updateData.embroidery_required = embroidery_required;
    if (production_requirements) updateData.production_requirements = production_requirements;
    if (special_instructions !== undefined) updateData.special_instructions = special_instructions;
    if (internal_notes !== undefined) updateData.internal_notes = internal_notes;

    // Recalculate costs if materials changed
    if (materials) {
      let totalCost = 0;
      for (const material of materials) {
        totalCost += (material.quantity * material.estimated_cost_per_unit) || 0;
      }
      updateData.total_material_cost = totalCost;
      updateData.estimated_production_cost = totalCost * 1.2;
    }

    await bom.update(updateData);

    res.json({ message: 'BOM updated successfully' });
  } catch (error) {
    console.error('BOM update error:', error);
    res.status(500).json({ message: error.message || 'Failed to update BOM' });
  }
});

// Approve BOM
router.put('/:id/approve', authenticateToken, checkDepartment(['procurement', 'admin']), async (req, res) => {
  try {
    const bom = await BillOfMaterials.findByPk(req.params.id, {
      include: [{ model: SalesOrder, as: 'salesOrder' }]
    });

    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    if (bom.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft BOMs can be approved' });
    }

    await bom.update({
      status: 'approved',
      approved_by: req.user.id,
      approved_at: new Date()
    });

    // Update sales order QR code
    if (bom.salesOrder) {
      const qrData = JSON.parse(bom.salesOrder.qr_code || '{}');
      await bom.salesOrder.update({
        qr_code: JSON.stringify({
          ...qrData,
          status: 'materials_procurement',
          bom_approved: true,
          updated_at: new Date().toISOString()
        })
      });
    }

    res.json({ message: 'BOM approved successfully' });
  } catch (error) {
    console.error('BOM approval error:', error);
    res.status(500).json({ message: 'Failed to approve BOM' });
  }
});

// Create Purchase Order from BOM
router.post('/:id/create-po', authenticateToken, checkDepartment(['procurement', 'admin']), async (req, res) => {
  try {
    const bom = await BillOfMaterials.findByPk(req.params.id, {
      include: [{ model: SalesOrder, as: 'salesOrder' }]
    });

    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    if (bom.status !== 'approved') {
      return res.status(400).json({ message: 'BOM must be approved before creating purchase orders' });
    }

    const { vendor_id, items } = req.body;

    if (!vendor_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Vendor and items are required' });
    }

    // Generate PO number
    const poNumber = await require('./procurement').generatePONumber();

    // Calculate totals
    const totalQuantity = items.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.rate)), 0);

    // Create PO
    const po = await PurchaseOrder.create({
      po_number: poNumber,
      vendor_id,
      po_date: new Date(),
      expected_delivery_date: bom.salesOrder?.delivery_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items,
      total_quantity: totalQuantity,
      total_amount: totalAmount,
      final_amount: totalAmount, // Simplified - no tax/discount for now
      status: 'draft',
      bom_id: bom.id,
      created_by: req.user.id
    });

    // Update BOM status
    await bom.update({ status: 'procurement_created' });

    // Update sales order QR code
    if (bom.salesOrder) {
      const qrData = JSON.parse(bom.salesOrder.qr_code || '{}');
      await bom.salesOrder.update({
        qr_code: JSON.stringify({
          ...qrData,
          status: 'po_created',
          po_created: true,
          updated_at: new Date().toISOString()
        })
      });
    }

    res.status(201).json({
      message: 'Purchase order created successfully',
      po: {
        id: po.id,
        po_number: po.po_number,
        status: po.status
      }
    });
  } catch (error) {
    console.error('PO creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create purchase order' });
  }
});

module.exports = router;