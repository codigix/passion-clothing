const express = require('express');
const router = express.Router();
const { ProjectMaterialRequest, PurchaseOrder, SalesOrder, User, Vendor, Customer, Notification, Inventory } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all Project Material Requests
router.get('/', authenticateToken, checkDepartment(['procurement', 'manufacturing', 'inventory', 'admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, project_name } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (project_name) {
      whereClause.project_name = {
        [Op.like]: `%${project_name}%`
      };
    }

    const { count, rows: requests } = await ProjectMaterialRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          include: [
            { model: Vendor, as: 'vendor' },
            { model: Customer, as: 'customer' }
          ]
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          required: false,
          include: [{ model: Customer, as: 'customer' }]
        },
        { model: User, as: 'creator', attributes: ['id', 'email', 'name'] },
        { model: User, as: 'reviewer', attributes: ['id', 'email', 'name'], required: false },
        { model: User, as: 'forwarder', attributes: ['id', 'email', 'name'], required: false },
        { model: User, as: 'processor', attributes: ['id', 'email', 'name'], required: false }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      requests,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching Project Material Requests:', error);
    res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
});

// Get single Project Material Request
router.get('/:id', authenticateToken, checkDepartment(['procurement', 'manufacturing', 'inventory', 'admin']), async (req, res) => {
  try {
    const request = await ProjectMaterialRequest.findByPk(req.params.id, {
      include: [
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          include: [
            { model: Vendor, as: 'vendor' },
            { model: Customer, as: 'customer' }
          ]
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          required: false,
          include: [{ model: Customer, as: 'customer' }]
        },
        { model: User, as: 'creator', attributes: ['id', 'email', 'name'] },
        { model: User, as: 'reviewer', attributes: ['id', 'email', 'name'], required: false },
        { model: User, as: 'forwarder', attributes: ['id', 'email', 'name'], required: false },
        { model: User, as: 'processor', attributes: ['id', 'email', 'name'], required: false }
      ]
    });

    if (!request) {
      return res.status(404).json({ message: 'Project Material Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching Project Material Request:', error);
    res.status(500).json({ message: 'Failed to fetch request', error: error.message });
  }
});

// Create Project Material Request from Purchase Order (Manual Trigger)
router.post('/from-po/:poId', authenticateToken, checkDepartment(['procurement', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const { poId } = req.params;
    const { procurement_notes, priority } = req.body;

    // Get PO with all details
    const po = await PurchaseOrder.findByPk(poId, {
      include: [
        { model: Vendor, as: 'vendor' },
        { model: Customer, as: 'customer' },
        { model: SalesOrder, as: 'salesOrder' }
      ]
    });

    if (!po) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    // Check if project_name exists
    if (!po.project_name) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Purchase Order must be linked to a project. Please update the PO with a project name first.' 
      });
    }

    // Check if request already exists for this PO
    const existingRequest = await ProjectMaterialRequest.findOne({
      where: { purchase_order_id: poId }
    });

    if (existingRequest) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Project Material Request already exists for this Purchase Order',
        request_id: existingRequest.id,
        request_number: existingRequest.request_number
      });
    }

    // Generate request number: PMR-YYYYMMDD-XXXXX
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const lastRequest = await ProjectMaterialRequest.findOne({
      where: {
        request_number: {
          [Op.like]: `PMR-${dateStr}-%`
        }
      },
      order: [['created_at', 'DESC']],
      transaction
    });

    let sequence = 1;
    if (lastRequest) {
      const lastSequence = parseInt(lastRequest.request_number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    const requestNumber = `PMR-${dateStr}-${sequence.toString().padStart(5, '0')}`;

    // Extract materials from PO items
    const poItems = po.items || [];
    const materialsRequested = poItems.map(item => ({
      material_name: item.fabric_name || item.item_name || item.material_name || item.name || 'Unknown Material',
      color: item.color || '',
      hsn: item.hsn || item.hsn_code || '',
      gsm: item.gsm || '',
      width: item.width || '',
      description: item.description || '',
      uom: item.uom || item.unit || 'Meters',
      quantity: parseFloat(item.quantity) || 0,
      rate: parseFloat(item.rate) || 0,
      total: (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)
    }));

    const totalItems = materialsRequested.length;
    const totalValue = materialsRequested.reduce((sum, item) => sum + item.total, 0);

    // Create Project Material Request
    const requestData = {
      request_number: requestNumber,
      purchase_order_id: po.id,
      sales_order_id: po.linked_sales_order_id || null,
      project_name: po.project_name,
      request_date: new Date(),
      expected_delivery_date: po.expected_delivery_date,
      materials_requested: materialsRequested,
      total_items: totalItems,
      total_value: totalValue,
      status: 'pending',
      priority: priority || po.priority || 'medium',
      procurement_notes: procurement_notes || `Material request for project: ${po.project_name}`,
      created_by: req.user.id
    };

    console.log('Creating ProjectMaterialRequest with data:', requestData);
    const materialRequest = await ProjectMaterialRequest.create(requestData, { transaction });
    console.log('✅ ProjectMaterialRequest created:', materialRequest.id);

    // Create notification for manufacturing department
    console.log('Creating notification...');
    await Notification.create({
      type: 'procurement',
      title: 'New Project Material Request',
      message: `Project Material Request ${requestNumber} has been created for project "${po.project_name}". Please review and forward to inventory.`,
      priority: priority || po.priority || 'medium',
      status: 'unread',
      recipient_department: 'manufacturing',
      related_entity_id: materialRequest.id,
      related_entity_type: 'project_material_request',
      action_url: `/manufacturing/material-requests/${materialRequest.id}`,
      metadata: {
        request_number: requestNumber,
        po_number: po.po_number,
        project_name: po.project_name,
        total_items: totalItems,
        total_value: totalValue,
        vendor_name: po.vendor?.name
      },
      trigger_event: 'material_request_created',
      actor_id: req.user.id,
      created_by: req.user.id
    }, { transaction });
    console.log('✅ Notification created');

    await transaction.commit();
    console.log('✅ Transaction committed');

    // Fetch the created record with associations
    console.log('Fetching created record with includes...');
    const createdRequest = await ProjectMaterialRequest.findByPk(materialRequest.id, {
      include: [
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          include: [
            { model: Vendor, as: 'vendor' },
            { model: Customer, as: 'customer' }
          ]
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          required: false,
          include: [{ model: Customer, as: 'customer' }]
        },
        { model: User, as: 'creator', attributes: ['id', 'email', 'name'] }
      ]
    });
    console.log('✅ Record fetched successfully');

    res.status(201).json({
      message: 'Project Material Request created successfully',
      materialRequest: createdRequest
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error creating Project Material Request:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Failed to create request', error: error.message });
  }
});

// Create MRN (Material Request) from Manufacturing
router.post('/create', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const { project_name, priority, required_by_date, notes, materials_requested } = req.body;

    // Validate required fields
    if (!project_name || !materials_requested || materials_requested.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Project name and at least one material are required' 
      });
    }

    // Generate request number: MRN-YYYYMMDD-XXXXX
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const lastRequest = await ProjectMaterialRequest.findOne({
      where: {
        request_number: {
          [Op.like]: `MRN-${dateStr}-%`
        }
      },
      order: [['created_at', 'DESC']],
      transaction
    });

    let sequence = 1;
    if (lastRequest) {
      const lastSequence = parseInt(lastRequest.request_number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    const requestNumber = `MRN-${dateStr}-${sequence.toString().padStart(5, '0')}`;

    // Calculate total items and value
    const totalItems = materials_requested.length;
    const totalValue = materials_requested.reduce((sum, item) => {
      const qty = parseFloat(item.quantity_required) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + (qty * rate);
    }, 0);

    // Create MRN using raw SQL to bypass Sequelize caching issues
    const [insertResult] = await require('../config/database').sequelize.query(`
      INSERT INTO project_material_requests 
      (request_number, project_name, requesting_department, request_date, required_by_date, 
       expected_delivery_date, materials_requested, total_items, total_value, status, 
       priority, manufacturing_notes, created_by, created_at, updated_at)
      VALUES 
      (?, ?, 'manufacturing', NOW(), ?, ?, ?, ?, ?, 'pending_inventory_review', ?, ?, ?, NOW(), NOW())
    `, {
      replacements: [
        requestNumber,
        project_name,
        required_by_date || null,
        required_by_date || null,
        JSON.stringify(materials_requested),
        totalItems,
        totalValue,
        priority || 'medium',
        notes || `Material request for project: ${project_name}`,
        req.user.id
      ],
      transaction
    });

    // Fetch the created record
    const materialRequest = await ProjectMaterialRequest.findOne({
      where: { request_number: requestNumber },
      transaction
    });

    // Create notification for inventory department
    await Notification.create({
      type: 'manufacturing',
      title: 'New Material Request from Manufacturing',
      message: `MRN ${requestNumber} has been created for project "${project_name}". Please check stock availability.`,
      priority: priority || 'medium',
      status: 'sent',
      recipient_department: 'inventory',
      related_entity_id: materialRequest.id,
      related_entity_type: 'material_request',
      action_url: `/inventory/material-requests/${materialRequest.id}`,
      metadata: {
        request_number: requestNumber,
        project_name,
        total_items: totalItems,
        total_value: totalValue
      },
      trigger_event: 'mrn_created',
      actor_id: req.user.id,
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: 'Material Request (MRN) created successfully',
      request_number: requestNumber,
      materialRequest: await ProjectMaterialRequest.findByPk(materialRequest.id, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'email', 'name'] }
        ]
      })
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating MRN:', error);
    res.status(500).json({ message: 'Failed to create MRN', error: error.message });
  }
});

// Manufacturing: Review and forward to inventory
router.post('/:id/forward-to-inventory', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const { id } = req.params;
    const { manufacturing_notes } = req.body;

    const materialRequest = await ProjectMaterialRequest.findByPk(id, {
      include: [
        { model: PurchaseOrder, as: 'purchaseOrder' }
      ]
    });

    if (!materialRequest) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Project Material Request not found' });
    }

    if (materialRequest.status !== 'pending' && materialRequest.status !== 'reviewed') {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Cannot forward request with status: ${materialRequest.status}` 
      });
    }

    // Update request status
    await materialRequest.update({
      status: 'forwarded_to_inventory',
      manufacturing_notes: manufacturing_notes || materialRequest.manufacturing_notes,
      reviewed_by: req.user.id,
      reviewed_at: new Date(),
      forwarded_by: req.user.id,
      forwarded_at: new Date()
    }, { transaction });

    // Create notification for inventory department
    await Notification.create({
      type: 'inventory',
      title: 'Material Request Forwarded from Manufacturing',
      message: `Project Material Request ${materialRequest.request_number} for project "${materialRequest.project_name}" has been forwarded to inventory. Please check stock availability.`,
      priority: materialRequest.priority,
      status: 'unread',
      recipient_department: 'inventory',
      related_entity_id: materialRequest.id,
      related_entity_type: 'project_material_request',
      action_url: `/inventory/material-requests/${materialRequest.id}`,
      metadata: {
        request_number: materialRequest.request_number,
        po_number: materialRequest.purchaseOrder?.po_number,
        project_name: materialRequest.project_name,
        total_items: materialRequest.total_items,
        total_value: materialRequest.total_value,
        manufacturing_notes: manufacturing_notes
      },
      trigger_event: 'material_request_forwarded',
      actor_id: req.user.id,
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'Material request forwarded to inventory successfully',
      materialRequest: await ProjectMaterialRequest.findByPk(id, {
        include: [
          { model: PurchaseOrder, as: 'purchaseOrder' },
          { model: User, as: 'reviewer', attributes: ['id', 'email', 'name'] },
          { model: User, as: 'forwarder', attributes: ['id', 'email', 'name'] }
        ]
      })
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error forwarding material request:', error);
    res.status(500).json({ message: 'Failed to forward request', error: error.message });
  }
});

// Inventory: Check stock availability
router.post('/:id/check-stock', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const { id } = req.params;

    const materialRequest = await ProjectMaterialRequest.findByPk(id);

    if (!materialRequest) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Project Material Request not found' });
    }

    if (materialRequest.status !== 'forwarded_to_inventory') {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Cannot check stock for request with status: ${materialRequest.status}` 
      });
    }

    // Check stock availability for each material
    const materialsRequested = materialRequest.materials_requested || [];
    const stockAvailability = [];
    let allAvailable = true;
    let noneAvailable = true;

    for (const material of materialsRequested) {
      // Search for matching inventory items by product_name, category, material, or description
      const inventoryItems = await Inventory.findAll({
        where: {
          [Op.or]: [
            { product_name: { [Op.like]: `%${material.material_name}%` } },
            { category: { [Op.like]: `%${material.material_name}%` } },
            { material: { [Op.like]: `%${material.material_name}%` } },
            { description: { [Op.like]: `%${material.material_name}%` } }
          ],
          is_active: true,
          quality_status: 'approved',
          available_stock: { [Op.gt]: 0 }
        },
        transaction,
        attributes: ['id', 'product_name', 'barcode', 'batch_number', 'available_stock', 'current_stock', 'location', 'category', 'color']
      });

      const availableQty = inventoryItems.reduce((sum, item) => sum + parseFloat(item.available_stock || 0), 0);
      const requestedQty = parseFloat(material.quantity_required || material.quantity || 0);
      const shortageQty = Math.max(0, requestedQty - availableQty);

      const itemStatus = availableQty >= requestedQty ? 'available' : 
                        availableQty > 0 ? 'partial' : 'unavailable';

      if (itemStatus !== 'available') allAvailable = false;
      if (itemStatus !== 'unavailable') noneAvailable = false;

      stockAvailability.push({
        material_name: material.material_name,
        color: material.color,
        uom: material.uom,
        requested_qty: requestedQty,
        available_qty: availableQty,
        shortage_qty: shortageQty,
        status: itemStatus,
        grn_received: inventoryItems.length > 0,
        inventory_items: inventoryItems.map(item => ({
          id: item.id,
          product_name: item.product_name,
          barcode: item.barcode,
          batch_number: item.batch_number,
          available_stock: parseFloat(item.available_stock),
          current_stock: parseFloat(item.current_stock),
          location: item.location,
          category: item.category,
          color: item.color
        }))
      });
    }

    // Determine overall status
    let overallStatus = 'stock_checking';
    if (allAvailable) {
      overallStatus = 'stock_available';
    } else if (noneAvailable) {
      overallStatus = 'stock_unavailable';
    } else {
      overallStatus = 'partial_available';
    }

    // Update request with stock availability
    await materialRequest.update({
      status: overallStatus,
      stock_availability: stockAvailability,
      processed_by: req.user.id,
      processed_at: new Date()
    }, { transaction });

    // Create notification for manufacturing about stock status
    await Notification.create({
      type: 'manufacturing',
      title: `Stock Check Complete: ${overallStatus.replace('_', ' ').toUpperCase()}`,
      message: `Stock availability checked for Project Material Request ${materialRequest.request_number}. Status: ${overallStatus.replace('_', ' ')}`,
      priority: overallStatus === 'stock_unavailable' ? 'high' : materialRequest.priority,
      status: 'unread',
      recipient_department: 'manufacturing',
      related_entity_id: materialRequest.id,
      related_entity_type: 'project_material_request',
      action_url: `/manufacturing/material-requests/${materialRequest.id}`,
      metadata: {
        request_number: materialRequest.request_number,
        project_name: materialRequest.project_name,
        stock_status: overallStatus,
        total_items: materialsRequested.length,
        available_items: stockAvailability.filter(s => s.status === 'available').length,
        unavailable_items: stockAvailability.filter(s => s.status === 'unavailable').length
      },
      trigger_event: 'stock_check_completed',
      actor_id: req.user.id,
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'Stock availability checked successfully',
      overallStatus,
      stockAvailability,
      materialRequest: await ProjectMaterialRequest.findByPk(id)
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error checking stock availability:', error);
    res.status(500).json({ message: 'Failed to check stock', error: error.message });
  }
});

// Inventory: Reserve materials for project
router.post('/:id/reserve-materials', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const { id } = req.params;
    const { inventory_notes, inventory_ids } = req.body;

    const materialRequest = await ProjectMaterialRequest.findByPk(id);

    if (!materialRequest) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Project Material Request not found' });
    }

    if (materialRequest.status !== 'stock_available' && materialRequest.status !== 'partial_available') {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Cannot reserve materials for request with status: ${materialRequest.status}` 
      });
    }

    // Reserve inventory items
    if (inventory_ids && inventory_ids.length > 0) {
      for (const invId of inventory_ids) {
        const inventoryItem = await Inventory.findByPk(invId, { transaction });
        if (inventoryItem && inventoryItem.available_stock > 0 && inventoryItem.is_active) {
          // Update reserved stock instead of using non-existent 'status' field
          const reservedAmount = parseFloat(inventory_ids[invId] || inventoryItem.available_stock);
          await inventoryItem.update({
            reserved_stock: parseFloat(inventoryItem.reserved_stock || 0) + reservedAmount,
            available_stock: Math.max(0, parseFloat(inventoryItem.available_stock) - reservedAmount),
            notes: `Reserved for ${materialRequest.project_name} - ${notes || ''}`
          }, { transaction });
        }
      }
    }

    // Update request status
    await materialRequest.update({
      status: 'materials_reserved',
      reserved_inventory_ids: inventory_ids || [],
      inventory_notes: inventory_notes || materialRequest.inventory_notes,
      processed_by: req.user.id,
      processed_at: new Date()
    }, { transaction });

    // Create notification for manufacturing
    await Notification.create({
      type: 'manufacturing',
      title: 'Materials Reserved for Project',
      message: `Materials have been reserved for Project Material Request ${materialRequest.request_number} (${materialRequest.project_name}).`,
      priority: materialRequest.priority,
      status: 'unread',
      recipient_department: 'manufacturing',
      related_entity_id: materialRequest.id,
      related_entity_type: 'project_material_request',
      action_url: `/manufacturing/material-requests/${materialRequest.id}`,
      metadata: {
        request_number: materialRequest.request_number,
        project_name: materialRequest.project_name,
        reserved_items_count: inventory_ids?.length || 0
      },
      trigger_event: 'materials_reserved',
      actor_id: req.user.id,
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'Materials reserved successfully',
      materialRequest: await ProjectMaterialRequest.findByPk(id)
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error reserving materials:', error);
    res.status(500).json({ message: 'Failed to reserve materials', error: error.message });
  }
});

// Update request status
router.patch('/:id/status', authenticateToken, checkDepartment(['procurement', 'manufacturing', 'inventory', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const materialRequest = await ProjectMaterialRequest.findByPk(id);

    if (!materialRequest) {
      return res.status(404).json({ message: 'Project Material Request not found' });
    }

    const updateData = { status };

    // Add notes based on user department
    if (req.user.department === 'procurement') {
      updateData.procurement_notes = notes || materialRequest.procurement_notes;
    } else if (req.user.department === 'manufacturing') {
      updateData.manufacturing_notes = notes || materialRequest.manufacturing_notes;
    } else if (req.user.department === 'inventory') {
      updateData.inventory_notes = notes || materialRequest.inventory_notes;
    }

    if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    await materialRequest.update(updateData);

    res.json({
      message: 'Request status updated successfully',
      materialRequest: await ProjectMaterialRequest.findByPk(id)
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
});

// ==========================================
// MRN (Manufacturing Material Request) Endpoints
// ==========================================

// Create MRN from Manufacturing Department
router.post('/MRN/create', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const {
      project_name,
      project_id,
      sales_order_id,
      required_by_date,
      materials_requested, // Array: [{material_name, material_code, description, quantity_required, uom, purpose, remarks}]
      manufacturing_notes,
      priority,
      attachments
    } = req.body;

    // Validate required fields
    if (!project_name || !materials_requested || materials_requested.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Project name and materials list are required' 
      });
    }

    // Generate MRN number: MRN-PROJ2025-001
    const year = new Date().getFullYear();
    const projectPrefix = project_name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
    const lastRequest = await ProjectMaterialRequest.findOne({
      where: {
        request_number: {
          [Op.like]: `MRN-${projectPrefix}${year}-%`
        }
      },
      order: [['created_at', 'DESC']],
      transaction
    });

    let sequence = 1;
    if (lastRequest) {
      const lastSequence = parseInt(lastRequest.request_number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    const requestNumber = `MRN-${projectPrefix}${year}-${sequence.toString().padStart(3, '0')}`;

    // Initialize material tracking structure
    const materialsWithTracking = materials_requested.map(item => ({
      material_name: item.material_name,
      material_code: item.material_code || '',
      description: item.description || '',
      quantity_required: parseFloat(item.quantity_required) || 0,
      uom: item.uom || 'PCS',
      purpose: item.purpose || '',
      available_qty: 0,  // Will be filled by inventory
      issued_qty: 0,
      balance_qty: parseFloat(item.quantity_required) || 0,
      status: 'pending', // pending, available, partial, issued, unavailable
      remarks: item.remarks || ''
    }));

    const totalItems = materialsWithTracking.length;

    // Create MRN
    const MRN = await ProjectMaterialRequest.create({
      request_number: requestNumber,
      purchase_order_id: null, // MRN doesn't originate from PO
      sales_order_id: sales_order_id || null,
      project_name,
      requesting_department: 'manufacturing',
      request_date: new Date(),
      required_by_date: required_by_date || null,
      materials_requested: materialsWithTracking,
      total_items: totalItems,
      total_value: 0, // Will be calculated during inventory review
      status: 'pending_inventory_review',
      priority: priority || 'medium',
      manufacturing_notes,
      attachments: attachments || [],
      created_by: req.user.id
    }, { transaction });

    // Create notification for inventory department
    const inventoryUsers = await User.findAll({
      where: { department: 'inventory' }
    });

    for (const user of inventoryUsers) {
      await Notification.create({
        user_id: user.id,
        title: 'New Material Request from Manufacturing',
        message: `MRN ${requestNumber} created for project "${project_name}". ${totalItems} materials requested.`,
        type: 'manufacturing', // Use valid ENUM value: manufacturing notification
        reference_id: MRN.id,
        reference_type: 'project_material_request'
      }, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Manufacturing Material Request created successfully',
      MRN: await ProjectMaterialRequest.findByPk(MRN.id, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'department'] },
          { model: SalesOrder, as: 'salesOrder', required: false, include: [{ model: Customer, as: 'customer' }] }
        ]
      })
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating MRN:', error);
    res.status(500).json({ message: 'Failed to create MRN', error: error.message });
  }
});

// Inventory Review & Stock Check
router.post('/:id/inventory-review', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const { id } = req.params;
    const { materials_reviewed, inventory_notes } = req.body;
    // materials_reviewed: [{material_name, available_qty, issued_qty, balance_qty, status, remarks}]

    const MRN = await ProjectMaterialRequest.findByPk(id, { transaction });

    if (!MRN) {
      await transaction.rollback();
      return res.status(404).json({ message: 'MRN not found' });
    }

    if (MRN.requesting_department !== 'manufacturing') {
      await transaction.rollback();
      return res.status(400).json({ message: 'This endpoint is for Manufacturing-originated requests only' });
    }

    // Update materials with inventory check results
    const updatedMaterials = MRN.materials_requested.map((item, index) => {
      const reviewed = materials_reviewed[index] || {};
      return {
        ...item,
        available_qty: reviewed.available_qty || 0,
        issued_qty: reviewed.issued_qty || 0,
        balance_qty: item.quantity_required - (reviewed.issued_qty || 0),
        status: reviewed.status || 'pending',
        remarks: reviewed.remarks || item.remarks
      };
    });

    // Determine overall status
    const allIssued = updatedMaterials.every(m => m.status === 'issued');
    const someIssued = updatedMaterials.some(m => m.status === 'issued');
    const allAvailable = updatedMaterials.every(m => m.status === 'available');
    const someUnavailable = updatedMaterials.some(m => m.status === 'unavailable');

    let overallStatus = 'stock_checking';
    if (allIssued) {
      overallStatus = 'issued';
    } else if (someIssued) {
      overallStatus = 'partially_issued';
    } else if (allAvailable) {
      overallStatus = 'stock_available';
    } else if (someUnavailable) {
      overallStatus = 'partial_available';
    }

    // Update MRN
    await MRN.update({
      materials_requested: updatedMaterials,
      status: overallStatus,
      inventory_notes,
      processed_by: req.user.id,
      processed_at: new Date()
    }, { transaction });

    // Notify manufacturing about stock status
    await Notification.create({
      user_id: MRN.created_by,
      title: 'MRN Stock Review Completed',
      message: `Your material request ${MRN.request_number} has been reviewed by inventory. Status: ${overallStatus}`,
      type: 'inventory', // Use valid ENUM value: inventory notification
      reference_id: MRN.id,
      reference_type: 'project_material_request'
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Inventory review completed',
      MRN: await ProjectMaterialRequest.findByPk(id, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'processor', attributes: ['id', 'name', 'email'], required: false }
        ]
      })
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error during inventory review:', error);
    res.status(500).json({ message: 'Failed to complete inventory review', error: error.message });
  }
});

// Issue Materials from Inventory
router.post('/:id/issue-materials', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const { id } = req.params;
    const { items_to_issue, remarks } = req.body;
    // items_to_issue: [{material_name, issue_qty, inventory_ids: []}]

    const MRN = await ProjectMaterialRequest.findByPk(id, { transaction });

    if (!MRN) {
      await transaction.rollback();
      return res.status(404).json({ message: 'MRN not found' });
    }

    // Update materials with issued quantities
    const updatedMaterials = MRN.materials_requested.map(item => {
      const issueItem = items_to_issue.find(i => i.material_name === item.material_name);
      if (issueItem) {
        const newIssuedQty = item.issued_qty + issueItem.issue_qty;
        const newBalanceQty = item.quantity_required - newIssuedQty;
        return {
          ...item,
          issued_qty: newIssuedQty,
          balance_qty: newBalanceQty,
          status: newBalanceQty === 0 ? 'issued' : newIssuedQty > 0 ? 'partial' : item.status,
          remarks: issueItem.remarks || item.remarks
        };
      }
      return item;
    });

    // Deduct from inventory
    for (const issueItem of items_to_issue) {
      for (const inventoryId of issueItem.inventory_ids || []) {
        const inventoryItem = await Inventory.findByPk(inventoryId, { transaction });
        if (inventoryItem) {
          const newQty = inventoryItem.quantity - issueItem.issue_qty;
          await inventoryItem.update({ quantity: newQty }, { transaction });
        }
      }
    }

    // Determine new overall status
    const allIssued = updatedMaterials.every(m => m.balance_qty === 0);
    const someIssued = updatedMaterials.some(m => m.issued_qty > 0);
    
    let newStatus = MRN.status;
    if (allIssued) {
      newStatus = 'issued';
    } else if (someIssued) {
      newStatus = 'partially_issued';
    }

    await MRN.update({
      materials_requested: updatedMaterials,
      status: newStatus,
      inventory_notes: remarks || MRN.inventory_notes,
      processed_by: req.user.id,
      processed_at: new Date()
    }, { transaction });

    // Notify manufacturing
    await Notification.create({
      user_id: MRN.created_by,
      title: 'Materials Issued for MRN',
      message: `Materials have been issued for ${MRN.request_number}. Status: ${newStatus}`,
      type: 'inventory', // Use valid ENUM value: inventory notification
      reference_id: MRN.id,
      reference_type: 'project_material_request'
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Materials issued successfully',
      MRN: await ProjectMaterialRequest.findByPk(id)
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error issuing materials:', error);
    res.status(500).json({ message: 'Failed to issue materials', error: error.message });
  }
});

// Trigger Procurement for Unavailable Materials
router.post('/:id/trigger-procurement', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const { id } = req.params;
    const { unavailable_materials, procurement_notes } = req.body;
    // unavailable_materials: [{material_name, shortage_qty, remarks}]

    const MRN = await ProjectMaterialRequest.findByPk(id, { transaction });

    if (!MRN) {
      await transaction.rollback();
      return res.status(404).json({ message: 'MRN not found' });
    }

    // Create procurement requests for unavailable materials
    // TODO: Implement actual PurchaseOrder creation logic here
    const procurementIds = []; // Will store created PO IDs

    // For now, just update MRN status
    await MRN.update({
      status: 'pending_procurement',
      triggered_procurement_ids: procurementIds,
      inventory_notes: procurement_notes || MRN.inventory_notes,
      processed_by: req.user.id,
      processed_at: new Date()
    }, { transaction });

    // Notify procurement department
    const procurementUsers = await User.findAll({
      where: { department: 'procurement' }
    });

    for (const user of procurementUsers) {
      await Notification.create({
        user_id: user.id,
        title: 'Procurement Required for MRN',
        message: `Materials unavailable for MRN ${MRN.request_number}. Procurement action needed.`,
        type: 'procurement', // Use valid ENUM value: procurement notification
        reference_id: MRN.id,
        reference_type: 'project_material_request'
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Procurement requests triggered successfully',
      MRN: await ProjectMaterialRequest.findByPk(id)
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error triggering procurement:', error);
    res.status(500).json({ message: 'Failed to trigger procurement', error: error.message });
  }
});

// ==========================================
// INTEGRATED WORKFLOW: Check MRN, GRN, Stock & Approve + Dispatch
// ==========================================

// Comprehensive Material Request Approval & Dispatch Workflow
router.post('/:id/approve-and-dispatch', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const { sequelize, GoodsReceiptNote, MaterialDispatch, Product } = require('../config/database');
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { dispatch_notes, force_dispatch } = req.body;

    // Step 1: Get Material Request (MRN)
    const materialRequest = await ProjectMaterialRequest.findByPk(id, {
      include: [
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          include: [{ model: Vendor, as: 'vendor' }]
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          include: [{ model: Customer, as: 'customer' }]
        },
        { model: User, as: 'creator', attributes: ['id', 'email', 'name'] }
      ],
      transaction
    });

    if (!materialRequest) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Material Request not found' });
    }

    // Step 2: Check if GRN exists for this project
    let grnCheck = {
      exists: false,
      grn_numbers: [],
      materials_received: []
    };

    if (materialRequest.purchase_order_id) {
      const grns = await GoodsReceiptNote.findAll({
        where: {
          purchase_order_id: materialRequest.purchase_order_id,
          verification_status: 'approved',
          inventory_added: true
        },
        attributes: ['id', 'grn_number', 'items_received', 'received_date'],
        transaction
      });

      if (grns.length > 0) {
        grnCheck.exists = true;
        grnCheck.grn_numbers = grns.map(g => g.grn_number);
        grnCheck.materials_received = grns.flatMap(g => g.items_received || []);
      }
    }

    // Step 3: Check Stock Availability Across Entire Inventory
    const materialsRequested = materialRequest.materials_requested || [];
    const stockCheckResults = [];
    let allMaterialsAvailable = true;
    let partiallyAvailable = false;
    
    for (const material of materialsRequested) {
      const materialName = material.material_name || material.name || '';
      const requestedQty = parseFloat(material.quantity_required || material.quantity || 0);

      // Search inventory with flexible matching - BOTH through Product AND Inventory fields
      const inventoryItems = await Inventory.findAll({
        where: {
          quality_status: 'approved',
          is_active: true,
          [Op.or]: [
            // Search by Inventory fields directly
            { product_name: { [Op.like]: `%${materialName}%` } },
            { category: { [Op.like]: `%${materialName}%` } },
            { material: { [Op.like]: `%${materialName}%` } },
            { description: { [Op.like]: `%${materialName}%` } }
          ]
        },
        include: [{
          model: Product,
          as: 'product',
          required: false // Make Product optional - not all inventory has product_id
        }],
        attributes: ['id', 'product_name', 'category', 'available_stock', 'current_stock', 
                    'batch_number', 'location', 'barcode', 'unit_cost', 'reserved_stock', 
                    'unit_of_measurement'],
        transaction
      });

      // Calculate total available quantity
      const totalAvailable = inventoryItems.reduce((sum, item) => {
        return sum + parseFloat(item.available_stock || 0);
      }, 0);

      const isAvailable = totalAvailable >= requestedQty;
      const shortage = Math.max(0, requestedQty - totalAvailable);

      if (!isAvailable) {
        allMaterialsAvailable = false;
        if (totalAvailable > 0) {
          partiallyAvailable = true;
        }
      }

      stockCheckResults.push({
        material_name: materialName,
        material_code: material.material_code || '',
        requested_qty: requestedQty,
        available_qty: totalAvailable,
        shortage_qty: shortage,
        uom: material.uom || 'PCS',
        status: isAvailable ? 'available' : (totalAvailable > 0 ? 'partial' : 'unavailable'),
        inventory_items: inventoryItems.map(item => ({
          id: item.id,
          product_name: item.product_name || item.product?.name || 'Unknown',
          product_code: item.product?.product_code || '',
          category: item.category,
          available_stock: item.available_stock,
          batch_number: item.batch_number,
          location: item.location,
          barcode: item.barcode,
          unit_cost: item.unit_cost,
          unit: item.unit_of_measurement
        })),
        grn_received: grnCheck.exists ? 
          grnCheck.materials_received.some(grnItem => 
            (grnItem.material_name || '').toLowerCase().includes(materialName.toLowerCase())
          ) : false
      });
    }

    // Step 4: Determine Approval Status
    let approvalStatus = 'rejected';
    let approvalMessage = '';
    
    if (allMaterialsAvailable || force_dispatch) {
      approvalStatus = 'approved';
      approvalMessage = 'All materials available in stock. Request approved for dispatch.';
    } else if (partiallyAvailable) {
      approvalStatus = 'partial';
      approvalMessage = 'Some materials available. Partial dispatch possible.';
    } else {
      approvalStatus = 'rejected';
      approvalMessage = 'Materials not available in stock. Request cannot be fulfilled.';
    }

    // Step 5: Update Material Request Status
    let newStatus = materialRequest.status;
    if (approvalStatus === 'approved') {
      newStatus = 'stock_available';
    } else if (approvalStatus === 'partial') {
      newStatus = 'partial_available';
    } else {
      newStatus = 'stock_unavailable';
    }

    await materialRequest.update({
      status: newStatus,
      stock_availability: stockCheckResults,
      inventory_notes: approvalMessage,
      processed_by: req.user.id,
      processed_at: new Date()
    }, { transaction });

    // Step 6: Create Material Dispatch if Approved
    let dispatch = null;
    if (approvalStatus === 'approved' || (approvalStatus === 'partial' && force_dispatch)) {
      // Generate dispatch number
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const lastDispatch = await MaterialDispatch.findOne({
        where: {
          dispatch_number: { [Op.like]: `DSP-${dateStr}-%` }
        },
        order: [['created_at', 'DESC']],
        transaction
      });

      let sequence = 1;
      if (lastDispatch) {
        const lastSequence = parseInt(lastDispatch.dispatch_number.split('-')[2]);
        sequence = lastSequence + 1;
      }
      const dispatchNumber = `DSP-${dateStr}-${sequence.toString().padStart(5, '0')}`;

      // Prepare materials to dispatch (only available ones)
      const materialsToDispatch = stockCheckResults
        .filter(m => m.status === 'available' || (force_dispatch && m.available_qty > 0))
        .map(m => ({
          material_name: m.material_name,
          material_code: m.material_code,
          quantity_dispatched: force_dispatch ? m.available_qty : m.requested_qty,
          uom: m.uom,
          barcode: m.inventory_items[0]?.barcode || '',
          batch_number: m.inventory_items[0]?.batch_number || '',
          location: m.inventory_items[0]?.location || '',
          inventory_ids: m.inventory_items.map(i => i.id)
        }));

      // Create dispatch record
      dispatch = await MaterialDispatch.create({
        dispatch_number: dispatchNumber,
        mrn_request_id: materialRequest.id,
        project_name: materialRequest.project_name,
        dispatched_materials: materialsToDispatch,
        total_items: materialsToDispatch.length,
        dispatch_notes: dispatch_notes || approvalMessage,
        dispatched_by: req.user.id,
        dispatched_at: new Date(),
        received_status: 'pending'
      }, { transaction });

      // Step 7: Deduct from Inventory and Update Reserved Stock
      for (const dispatchItem of materialsToDispatch) {
        for (const inventoryId of dispatchItem.inventory_ids || []) {
          const inventoryItem = await Inventory.findByPk(inventoryId, { transaction });
          if (inventoryItem) {
            const qtyToDeduct = parseFloat(dispatchItem.quantity_dispatched);
            const newCurrentStock = parseFloat(inventoryItem.current_stock) - qtyToDeduct;
            const newAvailableStock = parseFloat(inventoryItem.available_stock) - qtyToDeduct;

            await inventoryItem.update({
              current_stock: Math.max(0, newCurrentStock),
              available_stock: Math.max(0, newAvailableStock),
              consumed_quantity: parseFloat(inventoryItem.consumed_quantity || 0) + qtyToDeduct,
              last_issue_date: new Date(),
              movement_type: 'outward',
              last_movement_date: new Date()
            }, { transaction });
          }
        }
      }

      // Update material request to dispatched status
      await materialRequest.update({
        status: 'materials_issued',
        completed_at: new Date()
      }, { transaction });
    }

    // Step 8: Create Notification for Manufacturing
    await Notification.create({
      type: 'manufacturing', // Use valid ENUM value: manufacturing notification
      title: approvalStatus === 'approved' ? 'Material Request Approved & Dispatched' : 
             approvalStatus === 'partial' ? 'Partial Materials Available' : 
             'Material Request Rejected',
      message: dispatch ? 
        `Material request ${materialRequest.request_number} approved. Dispatch #${dispatch.dispatch_number} created for project "${materialRequest.project_name}".` :
        `Material request ${materialRequest.request_number}: ${approvalMessage}`,
      priority: materialRequest.priority,
      status: 'sent',
      recipient_department: 'manufacturing',
      related_entity_id: materialRequest.id,
      related_entity_type: 'material_request',
      action_url: dispatch ? 
        `/manufacturing/dispatches/${dispatch.id}` : 
        `/manufacturing/material-requests/${materialRequest.id}`,
      metadata: {
        request_number: materialRequest.request_number,
        dispatch_number: dispatch?.dispatch_number,
        project_name: materialRequest.project_name,
        approval_status: approvalStatus,
        grn_exists: grnCheck.exists,
        grn_numbers: grnCheck.grn_numbers,
        total_items_requested: materialsRequested.length,
        total_items_dispatched: dispatch?.total_items || 0,
        stock_check_results: stockCheckResults
      },
      trigger_event: dispatch ? 'material_dispatched' : 'material_request_processed',
      actor_id: req.user.id,
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: approvalMessage,
      approval_status: approvalStatus,
      materialRequest: await ProjectMaterialRequest.findByPk(id, {
        include: [
          { model: PurchaseOrder, as: 'purchaseOrder', include: [{ model: Vendor, as: 'vendor' }] },
          { model: SalesOrder, as: 'salesOrder', include: [{ model: Customer, as: 'customer' }] },
          { model: User, as: 'creator', attributes: ['id', 'email', 'name'] },
          { model: User, as: 'processor', attributes: ['id', 'email', 'name'] }
        ]
      }),
      grn_check: grnCheck,
      stock_check: stockCheckResults,
      dispatch: dispatch ? {
        id: dispatch.id,
        dispatch_number: dispatch.dispatch_number,
        total_items: dispatch.total_items,
        dispatched_at: dispatch.dispatched_at,
        materials: dispatch.dispatched_materials
      } : null
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error in approve-and-dispatch workflow:', error);
    res.status(500).json({ 
      message: 'Failed to process material request approval and dispatch', 
      error: error.message 
    });
  }
});

// Update MRN Status (for stock availability updates from inventory)
router.put('/:id/status', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, inventory_notes, stock_availability } = req.body;

    const MRN = await ProjectMaterialRequest.findByPk(id, { transaction });

    if (!MRN) {
      await transaction.rollback();
      return res.status(404).json({ message: 'MRN not found' });
    }

    // Update MRN with new status and stock availability info
    await MRN.update({
      status: status || MRN.status,
      inventory_notes: inventory_notes || MRN.inventory_notes,
      stock_availability: stock_availability ? JSON.stringify(stock_availability) : MRN.stock_availability,
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    }, { transaction });

    // Create notification for manufacturing
    await Notification.create({
      type: 'inventory',
      title: 'Stock Availability Updated',
      message: `Stock availability has been checked for MRN ${MRN.request_number}. Status: ${status}`,
      priority: 'medium',
      status: 'sent',
      recipient_department: 'manufacturing',
      related_entity_id: MRN.id,
      related_entity_type: 'material_request',
      action_url: `/manufacturing/material-requests`,
      metadata: {
        request_number: MRN.request_number,
        status: status,
        stock_availability: stock_availability
      },
      trigger_event: 'mrn_stock_checked',
      actor_id: req.user.id,
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Status updated successfully',
      MRN: await ProjectMaterialRequest.findByPk(id)
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
});

// Issue Materials from Inventory to Manufacturing
router.post('/:id/issue-materials', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const { id } = req.params;
    const { issued_materials, inventory_notes, issue_type } = req.body; // issue_type: 'full' or 'partial'

    const MRN = await ProjectMaterialRequest.findByPk(id, { transaction });

    if (!MRN) {
      await transaction.rollback();
      return res.status(404).json({ message: 'MRN not found' });
    }

    // Update inventory for each issued material
    const Inventory = require('../models/Inventory');
    const InventoryMovement = require('../models/InventoryMovement');

    for (const material of issued_materials) {
      // Find inventory item by material name
      const inventoryItem = await Inventory.findOne({
        where: { material_name: material.material_name },
        transaction
      });

      if (!inventoryItem) {
        await transaction.rollback();
        return res.status(404).json({ 
          message: `Material not found in inventory: ${material.material_name}` 
        });
      }

      // Check if sufficient quantity is available
      if (inventoryItem.quantity < material.issued_quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Insufficient quantity for ${material.material_name}. Available: ${inventoryItem.quantity}, Required: ${material.issued_quantity}` 
        });
      }

      // Deduct from inventory
      await inventoryItem.update({
        quantity: inventoryItem.quantity - material.issued_quantity,
        last_updated: new Date(),
        updated_by: req.user.id
      }, { transaction });

      // Record inventory movement
      await InventoryMovement.create({
        inventory_id: inventoryItem.id,
        movement_type: 'issue',
        quantity: material.issued_quantity,
        reference_type: 'material_request',
        reference_id: MRN.id,
        reference_number: MRN.request_number,
        from_location: inventoryItem.location || 'Main Warehouse',
        to_location: 'Manufacturing',
        moved_by: req.user.id,
        moved_at: new Date(),
        notes: `Issued for ${MRN.project_name} - ${MRN.request_number}`,
        created_by: req.user.id
      }, { transaction });
    }

    // Update MRN status based on issue type
    const newStatus = issue_type === 'full' ? 'issued' : 'partially_issued';
    
    await MRN.update({
      status: newStatus,
      inventory_notes: inventory_notes || MRN.inventory_notes,
      issued_materials: JSON.stringify(issued_materials),
      issued_by: req.user.id,
      issued_at: new Date()
    }, { transaction });

    // Create notification for manufacturing
    await Notification.create({
      type: 'inventory',
      title: `Materials ${issue_type === 'full' ? 'Issued' : 'Partially Issued'}`,
      message: `Materials have been ${issue_type === 'full' ? 'issued' : 'partially issued'} for MRN ${MRN.request_number}. Please collect from inventory.`,
      priority: MRN.priority || 'high',
      status: 'sent',
      recipient_department: 'manufacturing',
      related_entity_id: MRN.id,
      related_entity_type: 'material_request',
      action_url: `/manufacturing/material-requests/${MRN.id}`,
      metadata: {
        request_number: MRN.request_number,
        project_name: MRN.project_name,
        issued_materials: issued_materials,
        issue_type: issue_type
      },
      trigger_event: 'mrn_materials_issued',
      actor_id: req.user.id,
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: `Materials ${issue_type === 'full' ? 'issued' : 'partially issued'} successfully`,
      MRN: await ProjectMaterialRequest.findByPk(id),
      issued_materials: issued_materials
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error issuing materials:', error);
    res.status(500).json({ message: 'Failed to issue materials', error: error.message });
  }
});

// Forward unavailable materials to procurement
router.post('/:id/forward-to-procurement', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const { id } = req.params;
    const { unavailable_materials, inventory_notes } = req.body;

    const MRN = await ProjectMaterialRequest.findByPk(id, { transaction });

    if (!MRN) {
      await transaction.rollback();
      return res.status(404).json({ message: 'MRN not found' });
    }

    // Update MRN status to pending procurement
    await MRN.update({
      status: 'pending_procurement',
      inventory_notes: inventory_notes || MRN.inventory_notes,
      processed_by: req.user.id,
      processed_at: new Date()
    }, { transaction });

    // Create notification for procurement department
    await Notification.create({
      type: 'inventory',
      title: 'Materials Required - Procurement Action Needed',
      message: `MRN ${MRN.request_number} has ${unavailable_materials.length} materials unavailable in stock. Procurement required.`,
      priority: MRN.priority || 'medium',
      status: 'sent',
      recipient_department: 'procurement',
      related_entity_id: MRN.id,
      related_entity_type: 'material_request',
      action_url: `/procurement/material-requests/${MRN.id}`,
      metadata: {
        request_number: MRN.request_number,
        project_name: MRN.project_name,
        unavailable_materials: unavailable_materials
      },
      trigger_event: 'mrn_forwarded_to_procurement',
      actor_id: req.user.id,
      created_by: req.user.id
    }, { transaction });

    // Also notify manufacturing about the procurement process
    await Notification.create({
      type: 'inventory',
      title: 'MRN Forwarded to Procurement',
      message: `MRN ${MRN.request_number} has been forwarded to procurement for unavailable materials.`,
      priority: 'medium',
      status: 'sent',
      recipient_department: 'manufacturing',
      related_entity_id: MRN.id,
      related_entity_type: 'material_request',
      action_url: `/manufacturing/material-requests`,
      metadata: {
        request_number: MRN.request_number
      },
      trigger_event: 'mrn_forwarded_to_procurement',
      actor_id: req.user.id,
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Request forwarded to procurement successfully',
      MRN: await ProjectMaterialRequest.findByPk(id)
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error forwarding to procurement:', error);
    res.status(500).json({ message: 'Failed to forward to procurement', error: error.message });
  }
});

module.exports = router;