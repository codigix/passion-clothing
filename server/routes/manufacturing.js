const express = require('express');
const { Op } = require('sequelize');
const { ProductionOrder, ProductionStage, Rejection, SalesOrder, Product, User, Challan, MaterialAllocation, Inventory, InventoryMovement } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const { updateOrderQRCode } = require('../utils/qrCodeUtils');
const NotificationService = require('../utils/notificationService');
const router = express.Router();

// Get production order detail
router.get(
  '/orders/:id',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const productionOrder = await ProductionOrder.findByPk(req.params.id, {
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'product_code', 'specifications']
          },
          {
            model: SalesOrder,
            as: 'salesOrder',
            attributes: ['id', 'order_number', 'delivery_date', 'customer_id', 'status']
          },
          {
            model: ProductionStage,
            as: 'stages',
            attributes: [
              'id',
              'stage_name',
              'stage_order',
              'status',
              'planned_start_time',
              'planned_end_time',
              'planned_duration_hours',
              'actual_start_time',
              'actual_end_time',
              'actual_duration_hours',
              'quantity_processed',
              'quantity_approved',
              'quantity_rejected',
              'delay_reason',
              'notes',
              'assigned_to',
              'machine_id',
              'rejection_reasons'
            ],
            include: [
              {
                model: User,
                as: 'assignedUser',
                attributes: ['id', 'name', 'employee_id']
              }
            ]
          },
          {
            model: Rejection,
            as: 'rejections',
            attributes: [
              'id',
              'stage_name',
              'rejected_quantity',
              'rejection_reason',
              'detailed_reason',
              'severity',
              'action_taken',
              'responsible_party',
              'responsible_person',
              'reported_by',
              'created_at'
            ]
          },
          {
            model: Challan,
            as: 'challans',
            attributes: ['id', 'challan_number', 'type', 'status', 'created_at']
          }
        ],
        order: [[{ model: ProductionStage, as: 'stages' }, 'stage_order', 'ASC']]
      });

      if (!productionOrder) {
        return res.status(404).json({ message: 'Production order not found' });
      }

      const completedStages = productionOrder.stages.filter(
        (stage) => stage.status === 'completed'
      ).length;
      const progressPercentage = productionOrder.stages.length
        ? Math.round((completedStages / productionOrder.stages.length) * 100)
        : 0;

      res.json({
        productionOrder: {
          id: productionOrder.id,
          production_number: productionOrder.production_number,
          status: productionOrder.status,
          priority: productionOrder.priority,
          production_type: productionOrder.production_type,
          quantity: productionOrder.quantity,
          produced_quantity: productionOrder.produced_quantity,
          approved_quantity: productionOrder.approved_quantity,
          rejected_quantity: productionOrder.rejected_quantity,
          planned_start_date: productionOrder.planned_start_date,
          planned_end_date: productionOrder.planned_end_date,
          actual_start_date: productionOrder.actual_start_date,
          actual_end_date: productionOrder.actual_end_date,
          estimated_hours: productionOrder.estimated_hours,
          actual_hours: productionOrder.actual_hours,
          special_instructions: productionOrder.special_instructions,
          materials_required: productionOrder.materials_required,
          quality_parameters: productionOrder.quality_parameters,
          progress_percentage: progressPercentage,
          product: productionOrder.product,
          salesOrder: productionOrder.salesOrder,
          stages: productionOrder.stages,
          rejections: productionOrder.rejections
        }
      });
    } catch (error) {
      console.error('Production order detail fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch production order detail' });
    }
  }
);

// Start production order
router.post('/orders/:id/start', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const order = await ProductionOrder.findByPk(req.params.id, {
      include: [{ model: ProductionStage, as: 'stages' }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Production order not found' });
    }

    if (order.status === 'completed') {
      return res.status(400).json({ message: 'Order is already completed' });
    }

    // Ensure stages are evaluated in their defined order
    const sortedStages = [...order.stages].sort(
      (a, b) => (a.stage_order || 0) - (b.stage_order || 0),
    );

    // Find the first stage that is pending (or on hold after a stop)
    const firstPendingStage = sortedStages.find((stage) =>
      ['pending', 'on_hold'].includes(stage.status),
    );

    if (!firstPendingStage) {
      return res.status(400).json({ message: 'No pending stages to start' });
    }

    // Start the first available stage
    await firstPendingStage.update({
      status: 'in_progress',
      actual_start_time: firstPendingStage.actual_start_time || new Date(),
    });

    // Update order status when transitioning from an idle state
    if (['pending', 'material_allocated', 'on_hold'].includes(order.status)) {
      const stageDrivenStatuses = new Set([
        'cutting',
        'embroidery',
        'stitching',
        'finishing',
        'quality_check',
      ]);

      const derivedStatus = stageDrivenStatuses.has(firstPendingStage.stage_name)
        ? firstPendingStage.stage_name
        : 'material_allocated';

      await order.update({
        status: derivedStatus,
        actual_start_date: order.actual_start_date || new Date(),
      });

      // Update QR code and send notification if sales order exists
      if (order.sales_order_id) {
        await updateOrderQRCode(order.sales_order_id, {
          status: derivedStatus,
          current_stage: firstPendingStage.stage_name,
          production_progress: {
            stage_started: firstPendingStage.stage_name
          }
        });

        // Send notification
        const salesOrder = await SalesOrder.findByPk(order.sales_order_id);
        await NotificationService.createNotification({
          type: 'production_started',
          title: 'Production Started',
          message: `Production started for order ${salesOrder.order_number} at ${firstPendingStage.stage_name} stage`,
          recipients: ['manufacturing', 'admin'],
          related_entity_type: 'production_order',
          related_entity_id: order.id,
          priority: 'medium',
          user_id: req.user.id
        });
      }
    }

    res.json({ message: 'Production started successfully' });
  } catch (error) {
    console.error('Start production error:', error);
    res.status(500).json({ message: 'Failed to start production' });
  }
});

// Stop production order
router.post('/orders/:id/stop', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const order = await ProductionOrder.findByPk(req.params.id, {
      include: [{ model: ProductionStage, as: 'stages' }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Production order not found' });
    }

    // Find the currently in-progress stage and pause it
    const inProgressStage = order.stages.find(stage => stage.status === 'in_progress');

    if (inProgressStage) {
      await inProgressStage.update({
        status: 'on_hold',
        actual_end_time: new Date()
      });
    }

    // Update order status
    await order.update({ status: 'on_hold' });

    // Update QR code and send notification if sales order exists
    if (order.sales_order_id) {
      await updateOrderQRCode(order.sales_order_id, {
        status: 'production_paused',
        current_stage: 'on_hold',
        production_progress: {
          production_paused: true
        }
      });

      // Send notification
      const salesOrder = await SalesOrder.findByPk(order.sales_order_id);
      await NotificationService.createNotification({
        type: 'production_paused',
        title: 'Production Paused',
        message: `Production paused for order ${salesOrder.order_number}`,
        recipients: ['manufacturing', 'admin'],
        related_entity_type: 'production_order',
        related_entity_id: order.id,
        priority: 'medium',
        user_id: req.user.id
      });
    }

    res.json({ message: 'Production stopped successfully' });
  } catch (error) {
    console.error('Stop production error:', error);
    res.status(500).json({ message: 'Failed to stop production' });
  }
});

// Pause production order
router.post('/orders/:id/pause', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const order = await ProductionOrder.findByPk(req.params.id, {
      include: [{ model: ProductionStage, as: 'stages' }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Production order not found' });
    }

    // Find the currently in-progress stage and pause it
    const inProgressStage = order.stages.find(stage => stage.status === 'in_progress');

    if (inProgressStage) {
      await inProgressStage.update({
        status: 'paused'
      });
    }

    // Update order status
    await order.update({ status: 'paused' });

    res.json({ message: 'Production paused successfully', order });
  } catch (error) {
    console.error('Pause production error:', error);
    res.status(500).json({ message: 'Failed to pause production' });
  }
});

// Get production orders
router.get('/orders', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      production_type,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      if (statusArray.length === 1) {
        where.status = statusArray[0];
      } else {
        where.status = { [Op.in]: statusArray };
      }
    }
    if (priority) where.priority = priority;
    if (production_type) where.production_type = production_type;

    if (search) {
      where[Op.or] = [
        { production_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await ProductionOrder.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'product_code'] },
        { model: ProductionStage, as: 'stages', attributes: ['id', 'stage_name', 'status'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      productionOrders: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Production orders fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch production orders' });
  }
});

// Create production order
router.post('/orders', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const {
      sales_order_id,
      product_id,
      quantity,
      priority = 'medium',
      production_type = 'standard',
      planned_start_date,
      planned_end_date,
      special_instructions,
      assigned_user_id
    } = req.body;

    if (!product_id || !quantity || !planned_start_date || !planned_end_date) {
      return res.status(400).json({ message: 'Product, quantity, and dates are required' });
    }

    // Generate production number
    const lastOrder = await ProductionOrder.findOne({
      order: [['created_at', 'DESC']]
    });
    const nextNumber = lastOrder ? parseInt(lastOrder.production_number.split('-')[2]) + 1 : 1;
    const productionNumber = `PROD-${new Date().getFullYear()}-${nextNumber.toString().padStart(3, '0')}`;

    const order = await ProductionOrder.create({
      production_number: productionNumber,
      sales_order_id: sales_order_id || null,
      product_id,
      quantity,
      priority,
      production_type,
      planned_start_date,
      planned_end_date,
      special_instructions,
      assigned_user_id,
      created_by: req.user.id
    });

    // Create default stages
    const defaultStages = [
      { stage_name: 'cutting', stage_order: 1, planned_duration_hours: 8 },
      { stage_name: 'embroidery', stage_order: 2, planned_duration_hours: 6 },
      { stage_name: 'stitching', stage_order: 3, planned_duration_hours: 12 },
      { stage_name: 'finishing', stage_order: 4, planned_duration_hours: 4 },
      { stage_name: 'quality_check', stage_order: 5, planned_duration_hours: 2 },
      { stage_name: 'packaging', stage_order: 6, planned_duration_hours: 2 }
    ];

    for (const stageData of defaultStages) {
      await ProductionStage.create({
        production_order_id: order.id,
        ...stageData
      });
    }

    res.status(201).json({
      message: 'Production order created successfully',
      order: {
        id: order.id,
        production_number: order.production_number
      }
    });
  } catch (error) {
    console.error('Production order creation error:', error);
    res.status(500).json({ message: 'Failed to create production order' });
  }
});

// Update production order
router.put('/orders/:id', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const {
      status,
      priority,
      planned_start_date,
      planned_end_date,
      special_instructions,
      assigned_user_id
    } = req.body;

    const order = await ProductionOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Production order not found' });
    }

    const updateData = {};
    
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (planned_start_date) updateData.planned_start_date = planned_start_date;
    if (planned_end_date) updateData.planned_end_date = planned_end_date;
    if (special_instructions !== undefined) updateData.special_instructions = special_instructions;
    if (assigned_user_id) updateData.assigned_user_id = assigned_user_id;

    await order.update(updateData);

    // If status is updated, update the current stage status as well
    if (status) {
      const currentStage = await ProductionStage.findOne({
        where: {
          production_order_id: order.id,
          status: 'in_progress'
        }
      });

      if (currentStage && status !== 'in_progress') {
        await currentStage.update({ status: 'pending' });
      }

      // If moving to a specific stage, update that stage to in_progress
      if (['cutting', 'embroidery', 'stitching', 'finishing', 'quality_check', 'packaging'].includes(status)) {
        const targetStage = await ProductionStage.findOne({
          where: {
            production_order_id: order.id,
            stage_name: status
          }
        });

        if (targetStage) {
          await targetStage.update({ 
            status: 'in_progress',
            actual_start_time: new Date()
          });
        }
      }
    }

    res.json({ message: 'Production order updated successfully', order });
  } catch (error) {
    console.error('Production order update error:', error);
    res.status(500).json({ message: 'Failed to update production order' });
  }
});

// Delete production order
router.delete('/orders/:id', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const order = await ProductionOrder.findByPk(req.params.id, {
      include: [{ model: ProductionStage, as: 'stages' }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Production order not found' });
    }

    // Check if order can be deleted (only if not in progress)
    if (order.status === 'in_progress') {
      return res.status(400).json({ 
        message: 'Cannot delete production order that is currently in progress. Please stop the order first.' 
      });
    }

    // Delete associated stages first
    await ProductionStage.destroy({
      where: { production_order_id: order.id }
    });

    // Delete associated rejections
    await Rejection.destroy({
      where: { production_order_id: order.id }
    });

    // Delete the production order
    await order.destroy();

    res.json({ message: 'Production order deleted successfully' });
  } catch (error) {
    console.error('Production order delete error:', error);
    res.status(500).json({ message: 'Failed to delete production order' });
  }
});

// Update production stage by order ID and stage name
router.put('/orders/:id/stages', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { stage, status, notes, quantity_processed, quantity_approved, quantity_rejected, delay_reason } = req.body;

    if (!stage) {
      return res.status(400).json({ message: 'Stage name is required' });
    }

    // Find the production order
    const order = await ProductionOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Production order not found' });
    }

    // Find the specific stage by name within this order
    const productionStage = await ProductionStage.findOne({
      where: {
        production_order_id: req.params.id,
        stage_name: stage
      }
    });

    if (!productionStage) {
      return res.status(404).json({ message: `Stage '${stage}' not found for this production order` });
    }

    const updateData = {};
    
    if (status) {
      updateData.status = status;
      
      // Set start time when moving to in_progress
      if (status === 'in_progress' && !productionStage.actual_start_time) {
        updateData.actual_start_time = new Date();
      }
      
      // Set end time when completing
      if (status === 'completed' && !productionStage.actual_end_time) {
        updateData.actual_end_time = new Date();
        
        // Calculate duration
        if (productionStage.actual_start_time) {
          const start = new Date(productionStage.actual_start_time);
          const end = new Date();
          updateData.actual_duration_hours = (end - start) / (1000 * 60 * 60);
        }
      }
    }
    
    if (notes) updateData.notes = notes;
    if (quantity_processed !== undefined) updateData.quantity_processed = quantity_processed;
    if (quantity_approved !== undefined) updateData.quantity_approved = quantity_approved;
    if (quantity_rejected !== undefined) updateData.quantity_rejected = quantity_rejected;
    if (delay_reason) updateData.delay_reason = delay_reason;

    await productionStage.update(updateData);

    // Update production order status if needed
    if (status === 'in_progress' && ['cutting', 'embroidery', 'stitching', 'finishing', 'quality_check', 'packaging'].includes(stage)) {
      await order.update({ status: stage });
    }

    res.json({ 
      message: 'Production stage updated successfully',
      stage: productionStage 
    });
  } catch (error) {
    console.error('Production stage update error:', error);
    res.status(500).json({ message: 'Failed to update production stage' });
  }
});

// Update production stage by stage ID
router.put('/stages/:id', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const {
      status,
      actual_start_time,
      actual_end_time,
      quantity_processed,
      quantity_approved,
      quantity_rejected,
      notes,
      delay_reason
    } = req.body;

    const stage = await ProductionStage.findByPk(req.params.id);
    if (!stage) {
      return res.status(404).json({ message: 'Production stage not found' });
    }

    const updateData = {};
    
    if (status) updateData.status = status;
    if (actual_start_time) updateData.actual_start_time = actual_start_time;
    if (actual_end_time) updateData.actual_end_time = actual_end_time;
    if (quantity_processed !== undefined) updateData.quantity_processed = quantity_processed;
    if (quantity_approved !== undefined) updateData.quantity_approved = quantity_approved;
    if (quantity_rejected !== undefined) updateData.quantity_rejected = quantity_rejected;
    if (notes) updateData.notes = notes;
    if (delay_reason) updateData.delay_reason = delay_reason;

    // Calculate duration if both start and end times are provided
    if (actual_start_time && actual_end_time) {
      const start = new Date(actual_start_time);
      const end = new Date(actual_end_time);
      updateData.actual_duration_hours = (end - start) / (1000 * 60 * 60);
    }

    await stage.update(updateData);

    res.json({ message: 'Production stage updated successfully' });
  } catch (error) {
    console.error('Production stage update error:', error);
    res.status(500).json({ message: 'Failed to update production stage' });
  }
});

// Create rejection record
router.post('/rejections', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const {
      production_order_id,
      stage_name,
      rejected_quantity,
      rejection_reason,
      detailed_reason,
      severity,
      action_taken,
      responsible_party,
      responsible_person,
      vendor_id
    } = req.body;

    if (!production_order_id || !stage_name || !rejected_quantity || !rejection_reason || !severity || !action_taken || !responsible_party) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const rejection = await Rejection.create({
      production_order_id,
      stage_name,
      rejected_quantity,
      rejection_reason,
      detailed_reason,
      severity,
      action_taken,
      responsible_party,
      responsible_person,
      vendor_id,
      reported_by: req.user.id
    });

    res.status(201).json({
      message: 'Rejection record created successfully',
      rejection: {
        id: rejection.id,
        production_order_id: rejection.production_order_id,
        stage_name: rejection.stage_name,
        rejected_quantity: rejection.rejected_quantity
      }
    });
  } catch (error) {
    console.error('Rejection creation error:', error);
    res.status(500).json({ message: 'Failed to create rejection record' });
  }
});

// Get manufacturing dashboard stats
router.get('/dashboard/stats', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const totalOrders = await ProductionOrder.count();
    const activeOrders = await ProductionOrder.count({
      where: {
        status: { [require('sequelize').Op.in]: ['cutting', 'embroidery', 'stitching', 'finishing'] }
      }
    });

    const completedOrders = await ProductionOrder.count({
      where: { status: 'completed' }
    });

    const delayedOrders = await ProductionOrder.count({
      where: {
        planned_end_date: { [require('sequelize').Op.lt]: new Date() },
        status: { [require('sequelize').Op.notIn]: ['completed', 'cancelled'] }
      }
    });

    const rejectionStats = await Rejection.findAll({
      attributes: [
        'rejection_reason',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('rejected_quantity')), 'total_quantity']
      ],
      group: ['rejection_reason']
    });

    res.json({
      totalOrders,
      activeOrders,
      completedOrders,
      delayedOrders,
      rejectionStats: rejectionStats.map(stat => ({
        reason: stat.rejection_reason,
        count: parseInt(stat.dataValues.count),
        total_quantity: parseInt(stat.dataValues.total_quantity || 0)
      }))
    });
  } catch (error) {
    console.error('Manufacturing stats error:', error);
    res.status(500).json({ message: 'Failed to fetch manufacturing statistics' });
  }
});

// Stage action endpoints
router.post('/stages/:id/start',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const { notes } = req.body;
      const stage = await ProductionStage.findByPk(req.params.id);
      if (!stage) return res.status(404).json({ message: 'Stage not found' });

      if (!['pending', 'on_hold'].includes(stage.status)) {
        return res.status(400).json({ message: `Cannot start stage from status '${stage.status}'` });
      }

      // Enforce previous stages completion
      const prevIncomplete = await ProductionStage.count({
        where: {
          production_order_id: stage.production_order_id,
          stage_order: { [require('sequelize').Op.lt]: stage.stage_order },
          status: { [require('sequelize').Op.notIn]: ['completed', 'skipped'] }
        }
      });
      if (prevIncomplete > 0) {
        return res.status(400).json({ message: 'Previous stages must be completed or skipped before starting this stage' });
      }

      await stage.update({
        status: 'in_progress',
        actual_start_time: stage.actual_start_time || new Date(),
        notes: notes || stage.notes
      });

      // Ensure production order has start date
      const order = await ProductionOrder.findByPk(stage.production_order_id);
      if (order && !order.actual_start_date) {
        await order.update({ actual_start_date: new Date(), status: order.status === 'pending' ? 'material_allocated' : order.status });
      }

      res.json({ message: 'Stage started', stage });
    } catch (error) {
      console.error('Stage start error:', error);
      res.status(500).json({ message: 'Failed to start stage' });
    }
  }
);

router.post('/stages/:id/pause',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const { delay_reason, notes } = req.body;
      const stage = await ProductionStage.findByPk(req.params.id);
      if (!stage) return res.status(404).json({ message: 'Stage not found' });

      if (stage.status !== 'in_progress') {
        return res.status(400).json({ message: `Cannot pause stage from status '${stage.status}'` });
      }

      await stage.update({ status: 'on_hold', delay_reason: delay_reason || stage.delay_reason, notes: notes || stage.notes });
      res.json({ message: 'Stage paused', stage });
    } catch (error) {
      console.error('Stage pause error:', error);
      res.status(500).json({ message: 'Failed to pause stage' });
    }
  }
);

router.post('/stages/:id/resume',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const { notes } = req.body;
      const stage = await ProductionStage.findByPk(req.params.id);
      if (!stage) return res.status(404).json({ message: 'Stage not found' });

      if (stage.status !== 'on_hold') {
        return res.status(400).json({ message: `Cannot resume stage from status '${stage.status}'` });
      }

      await stage.update({ status: 'in_progress', notes: notes || stage.notes });
      res.json({ message: 'Stage resumed', stage });
    } catch (error) {
      console.error('Stage resume error:', error);
      res.status(500).json({ message: 'Failed to resume stage' });
    }
  }
);

router.post('/stages/:id/complete',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const { quantity_processed = 0, quantity_approved = 0, quantity_rejected = 0, notes } = req.body;
      const stage = await ProductionStage.findByPk(req.params.id);
      if (!stage) return res.status(404).json({ message: 'Stage not found' });

      if (stage.status !== 'in_progress') {
        return res.status(400).json({ message: `Cannot complete stage from status '${stage.status}'` });
      }

      // Validate quantities
      const qp = Number(quantity_processed) || 0;
      const qa = Number(quantity_approved) || 0;
      const qr = Number(quantity_rejected) || 0;
      if (qp < 0 || qa < 0 || qr < 0) {
        return res.status(400).json({ message: 'Quantities cannot be negative' });
      }
      if (qa + qr > qp) {
        return res.status(400).json({ message: 'Approved + Rejected cannot exceed Processed quantity' });
      }

      const now = new Date();
      const start = stage.actual_start_time ? new Date(stage.actual_start_time) : now;
      const duration = (now - start) / (1000 * 60 * 60);

      await stage.update({
        status: 'completed',
        actual_end_time: now,
        actual_duration_hours: duration,
        quantity_processed: qp,
        quantity_approved: qa,
        quantity_rejected: qr,
        notes: notes || stage.notes
      });

      // Roll up to production order: accumulate approved/rejected/produced and progress
      const order = await ProductionOrder.findByPk(stage.production_order_id);
      if (order) {
        const stages = await ProductionStage.findAll({ where: { production_order_id: order.id } });
        const completed = stages.filter(s => s.status === 'completed').length;
        const progress = Math.round((completed / Math.max(1, stages.length)) * 100);
        const producedApproved = stages.reduce((sum, s) => sum + (s.quantity_approved || 0), 0);
        const producedRejected = stages.reduce((sum, s) => sum + (s.quantity_rejected || 0), 0);
        await order.update({
          progress_percentage: progress,
          approved_quantity: producedApproved,
          rejected_quantity: producedRejected,
          produced_quantity: producedApproved + producedRejected,
          status: progress === 100 ? 'completed' : order.status,
          actual_end_date: progress === 100 ? now : order.actual_end_date
        });
      }

      res.json({ message: 'Stage completed', stage });
    } catch (error) {
      console.error('Stage complete error:', error);
      res.status(500).json({ message: 'Failed to complete stage' });
    }
  }
);

// Create rejection line-items for a completed stage
router.post('/stages/:id/rejections',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const stage = await ProductionStage.findByPk(req.params.id);
      if (!stage) return res.status(404).json({ message: 'Stage not found' });

      if (stage.status !== 'completed') {
        return res.status(400).json({ message: 'Rejections can only be logged after stage completion' });
      }

      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items array is required' });
      }

      // Validate items
      for (const it of items) {
        if (!it || typeof it.reason !== 'string') {
          return res.status(400).json({ message: 'Each item must include a reason (string)' });
        }
        const qty = Number(it.quantity);
        if (!Number.isFinite(qty) || qty <= 0) {
          return res.status(400).json({ message: 'Each item must have a positive quantity' });
        }
      }

      const totalQty = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
      if (totalQty > (stage.quantity_rejected || 0)) {
        return res.status(400).json({ message: 'Sum of item quantities cannot exceed stage rejected quantity' });
      }

      // Create rejection records with sensible defaults
      const records = items.map(it => ({
        production_order_id: stage.production_order_id,
        stage_name: stage.stage_name,
        rejected_quantity: Number(it.quantity),
        rejection_reason: it.reason, // validated by ENUM at DB level
        detailed_reason: it.notes || null,
        severity: 'minor',
        action_taken: 'pending',
        responsible_party: 'internal',
        responsible_person: null,
        vendor_id: stage.vendor_id || null,
        reported_by: req.user.id
      }));

      const created = await Rejection.bulkCreate(records);

      // Append to stage.rejection_reasons summary
      const prev = Array.isArray(stage.rejection_reasons) ? stage.rejection_reasons : [];
      const summaryItems = items.map(it => ({ reason: it.reason, quantity: Number(it.quantity), notes: it.notes || null }));
      await stage.update({ rejection_reasons: [...prev, ...summaryItems] });

      // Send notification for rejections
      const productionOrder = await ProductionOrder.findByPk(stage.production_order_id, {
        include: [{ model: SalesOrder, as: 'salesOrder' }]
      });

      if (productionOrder && productionOrder.salesOrder) {
        await NotificationService.createNotification({
          type: 'quality_rejection',
          title: 'Quality Rejections Logged',
          message: `${totalQty} items rejected in ${stage.stage_name} stage for order ${productionOrder.salesOrder.order_number}`,
          recipients: ['manufacturing', 'admin', 'quality'],
          related_entity_type: 'production_stage',
          related_entity_id: stage.id,
          priority: totalQty > 10 ? 'high' : 'medium',
          user_id: req.user.id
        });
      }

      return res.status(201).json({
        message: 'Rejections logged',
        count: created.length,
        items: created.map(r => ({ id: r.id, reason: r.rejection_reason, quantity: r.rejected_quantity }))
      });
    } catch (error) {
      console.error('Stage rejections error:', error);
      return res.status(500).json({ message: 'Failed to log rejections' });
    }
  }
);

router.post('/stages/:id/hold',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const { delay_reason, notes } = req.body;
      const stage = await ProductionStage.findByPk(req.params.id);
      if (!stage) return res.status(404).json({ message: 'Stage not found' });

      if (!['pending', 'in_progress'].includes(stage.status)) {
        return res.status(400).json({ message: `Cannot put on hold from status '${stage.status}'` });
      }

      await stage.update({ status: 'on_hold', delay_reason: delay_reason || stage.delay_reason, notes: notes || stage.notes });

      // Send notification for stage hold
      const productionOrder = await ProductionOrder.findByPk(stage.production_order_id, {
        include: [{ model: SalesOrder, as: 'salesOrder' }]
      });

      if (productionOrder && productionOrder.salesOrder) {
        await NotificationService.createNotification({
          type: 'production_delay',
          title: 'Production Stage Delayed',
          message: `${stage.stage_name} stage put on hold for order ${productionOrder.salesOrder.order_number}${delay_reason ? ': ' + delay_reason : ''}`,
          recipients: ['manufacturing', 'admin'],
          related_entity_type: 'production_stage',
          related_entity_id: stage.id,
          priority: 'medium',
          user_id: req.user.id
        });
      }

      res.json({ message: 'Stage put on hold', stage });
    } catch (error) {
      console.error('Stage hold error:', error);
      res.status(500).json({ message: 'Failed to hold stage' });
    }
  }
);

router.post('/stages/:id/skip',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const { notes } = req.body;
      const stage = await ProductionStage.findByPk(req.params.id);
      if (!stage) return res.status(404).json({ message: 'Stage not found' });

      if (!['pending', 'on_hold'].includes(stage.status)) {
        return res.status(400).json({ message: `Cannot skip stage from status '${stage.status}'` });
      }

      await stage.update({ status: 'skipped', actual_start_time: stage.actual_start_time || new Date(), actual_end_time: new Date(), notes: notes || stage.notes });

      // Send notification for stage skip
      const productionOrder = await ProductionOrder.findByPk(stage.production_order_id, {
        include: [{ model: SalesOrder, as: 'salesOrder' }]
      });

      if (productionOrder && productionOrder.salesOrder) {
        await NotificationService.createNotification({
          type: 'production_stage_skipped',
          title: 'Production Stage Skipped',
          message: `${stage.stage_name} stage skipped for order ${productionOrder.salesOrder.order_number}`,
          recipients: ['manufacturing', 'admin'],
          related_entity_type: 'production_stage',
          related_entity_id: stage.id,
          priority: 'low',
          user_id: req.user.id
        });
      }

      res.json({ message: 'Stage skipped', stage });
    } catch (error) {
      console.error('Stage skip error:', error);
      res.status(500).json({ message: 'Failed to skip stage' });
    }
  }
);

// Manufacturing reports
router.get('/reports', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { type = 'summary', dateRange = 'thisMonth' } = req.query;

    // Calculate date range
    const now = new Date();
    let dateFrom, dateTo;

    switch (dateRange) {
      case 'today':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'thisWeek':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        dateFrom = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
        dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'thisMonth':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'lastMonth':
        dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        dateTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      default:
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const whereClause = {
      created_at: {
        [require('sequelize').Op.between]: [dateFrom, dateTo]
      }
    };

    let metrics = {};
    let charts = {};

    // Calculate metrics based on type
    switch (type) {
      case 'summary':
      case 'production':
        const totalProduction = await ProductionOrder.sum('produced_quantity', { where: whereClause }) || 0;
        const completedOrders = await ProductionOrder.count({
          where: { ...whereClause, status: 'completed' }
        });
        const totalOrders = await ProductionOrder.count({ where: whereClause }) || 1;

        // Calculate efficiency (simplified - actual implementation would be more complex)
        const productionEfficiency = Math.round((completedOrders / totalOrders) * 100);

        // Quality rate based on rejections
        const totalRejected = await Rejection.sum('rejected_quantity', {
          where: {
            created_at: {
              [require('sequelize').Op.between]: [dateFrom, dateTo]
            }
          }
        }) || 0;

        const totalProduced = totalProduction + totalRejected;
        const qualityRate = totalProduced > 0 ? Math.round(((totalProduced - totalRejected) / totalProduced) * 100) : 100;

        // On-time delivery (simplified)
        const onTimeOrders = await ProductionOrder.count({
          where: {
            ...whereClause,
            status: 'completed',
            actual_end_date: {
              [require('sequelize').Op.lte]: require('sequelize').col('planned_end_date')
            }
          }
        });
        const onTimeDelivery = completedOrders > 0 ? Math.round((onTimeOrders / completedOrders) * 100) : 100;

        metrics = {
          totalProduction,
          productionEfficiency,
          qualityRate,
          onTimeDelivery
        };

        // Generate production trend chart data
        const productionTrend = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

          const dayProduction = await ProductionOrder.sum('produced_quantity', {
            where: {
              created_at: {
                [require('sequelize').Op.between]: [dayStart, dayEnd]
              }
            }
          }) || 0;

          productionTrend.push({
            date: dayStart.toISOString().split('T')[0],
            production: dayProduction
          });
        }

        charts = {
          productionTrend,
          qualityAnalysis: [
            { name: 'Passed', value: qualityRate, color: '#4caf50' },
            { name: 'Failed', value: 100 - qualityRate, color: '#f44336' }
          ],
          efficiencyVsTarget: [
            { month: new Date().toLocaleString('default', { month: 'short' }), efficiency: productionEfficiency, target: 90 }
          ]
        };
        break;

      default:
        metrics = {
          totalProduction: 0,
          productionEfficiency: 0,
          qualityRate: 0,
          onTimeDelivery: 0
        };
        charts = {
          productionTrend: [],
          qualityAnalysis: [],
          efficiencyVsTarget: []
        };
    }

    res.json({ metrics, charts });
  } catch (error) {
    console.error('Manufacturing reports error:', error);
    res.status(500).json({ message: 'Failed to generate manufacturing reports' });
  }
});

// Start production from sales order
router.post('/start-production/:salesOrderId', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { SalesOrder, BillOfMaterials, Inventory } = require('../config/database');

    const salesOrder = await SalesOrder.findByPk(req.params.salesOrderId, {
      include: [{ model: require('../models/Customer'), as: 'customer' }]
    });

    if (!salesOrder) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    if (salesOrder.status !== 'materials_received') {
      return res.status(400).json({ message: 'Materials must be received before starting production' });
    }

    // Check material availability
    const bom = await BillOfMaterials.findOne({ where: { sales_order_id: req.params.salesOrderId } });
    if (!bom) {
      return res.status(400).json({ message: 'BOM not found for this sales order' });
    }

    // Check if all materials are available
    let materialsAvailable = true;
    for (const material of bom.materials) {
      const inventory = await Inventory.findOne({ where: { material_id: material.material_id } });
      if (!inventory || inventory.quantity < material.required_quantity * salesOrder.total_quantity) {
        materialsAvailable = false;
        break;
      }
    }

    if (!materialsAvailable) {
      return res.status(400).json({ message: 'Insufficient materials available' });
    }

    // Create production order
    const productionNumber = `PROD-${Date.now()}`;
    const productionOrder = await ProductionOrder.create({
      production_number: productionNumber,
      sales_order_id: req.params.salesOrderId,
      product_id: salesOrder.items[0]?.product_id || 1, // Assuming first item
      quantity: salesOrder.total_quantity,
      status: 'material_allocated',
      planned_start_date: new Date(),
      planned_end_date: salesOrder.delivery_date,
      created_by: req.user.id
    });

    // Create production stages
    const stages = [
      { stage_name: 'cutting', stage_order: 1 },
      { stage_name: 'printing', stage_order: 2 },
      { stage_name: 'stitching', stage_order: 3 },
      { stage_name: 'finishing', stage_order: 4 },
      { stage_name: 'quality_control', stage_order: 5 }
    ];

    for (const stageData of stages) {
      await ProductionStage.create({
        production_order_id: productionOrder.id,
        ...stageData,
        status: 'pending',
        planned_duration_hours: 8
      });
    }

    // Update sales order status
    await salesOrder.update({
      status: 'in_production',
      production_started_at: new Date(),
      lifecycle_history: [
        ...(salesOrder.lifecycle_history || []),
        {
          event: 'production_started',
          timestamp: new Date(),
          user: req.user.id,
          details: `Production started with order ${productionNumber}`
        }
      ]
    });

    // Update QR code (placeholder - implement QR update logic)
    await updateOrderQRCode(salesOrder.id, 'in_production');

    res.json({
      message: 'Production started successfully',
      productionOrder,
      salesOrder
    });
  } catch (error) {
    console.error('Start production error:', error);
    res.status(500).json({ message: 'Failed to start production' });
  }
});

// Update production stage with QR code update
router.put('/update-stage/:stageId', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const {
      status,
      quantity_processed,
      quantity_approved,
      quantity_rejected,
      notes,
      materials_used
    } = req.body;

    const stage = await ProductionStage.findByPk(req.params.stageId, {
      include: [{ model: ProductionOrder, as: 'productionOrder', include: [{ model: SalesOrder, as: 'salesOrder' }] }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Production stage not found' });
    }

    await stage.update({
      status,
      quantity_processed: quantity_processed || stage.quantity_processed,
      quantity_approved: quantity_approved || stage.quantity_approved,
      quantity_rejected: quantity_rejected || stage.quantity_rejected,
      notes: notes || stage.notes,
      actual_end_time: status === 'completed' ? new Date() : stage.actual_end_time,
      materials_used: materials_used || stage.materials_used
    });

    // Update production order quantities
    const productionOrder = stage.productionOrder;
    if (stage.stage_name === 'quality_check' && status === 'completed') {
      await productionOrder.update({
        produced_quantity: quantity_approved,
        approved_quantity: quantity_approved,
        rejected_quantity: quantity_rejected,
        status: 'completed',
        actual_end_date: new Date()
      });

      // Update sales order status
      const salesOrder = productionOrder.salesOrder;
      const newStatus = quantity_rejected > 0 ? 'qc_passed' : 'ready_to_ship';
      await salesOrder.update({
        status: newStatus,
        lifecycle_history: [
          ...(salesOrder.lifecycle_history || []),
          {
            event: 'production_completed',
            timestamp: new Date(),
            user: req.user.id,
            details: `Production completed with ${quantity_approved} approved, ${quantity_rejected} rejected`
          }
        ]
      });

      // Update QR code
      await updateOrderQRCode(salesOrder.id, {
        status: newStatus,
        current_stage: 'production_completed',
        production_progress: {
          total_quantity: productionOrder.quantity,
          approved_quantity: quantity_approved,
          rejected_quantity: quantity_rejected
        }
      });

      // Send notifications
      await NotificationService.createNotification({
        type: 'production_completed',
        title: 'Production Completed',
        message: `Production completed for order ${salesOrder.order_number} with ${quantity_approved} approved and ${quantity_rejected} rejected items`,
        recipients: ['sales', 'finance', 'shipment'],
        related_entity_type: 'sales_order',
        related_entity_id: salesOrder.id,
        priority: 'high',
        user_id: req.user.id
      });

      if (quantity_rejected > 0) {
        await NotificationService.createNotification({
          type: 'quality_issue',
          title: 'Quality Issues Detected',
          message: `Quality control found ${quantity_rejected} rejected items in order ${salesOrder.order_number}`,
          recipients: ['manufacturing', 'admin'],
          related_entity_type: 'production_order',
          related_entity_id: productionOrder.id,
          priority: 'medium',
          user_id: req.user.id
        });
      }
    } else if (status === 'completed') {
      // Update sales order status based on current stage
      const statusMap = {
        cutting: 'cutting_completed',
        embroidery: 'embroidery_completed',
        stitching: 'stitching_completed',
        finishing: 'finishing_completed',
        packaging: 'packaging_completed'
      };

      if (statusMap[stage.stage_name]) {
        const salesOrder = productionOrder.salesOrder;
        await salesOrder.update({
          status: statusMap[stage.stage_name],
          lifecycle_history: [
            ...(salesOrder.lifecycle_history || []),
            {
              event: `${stage.stage_name}_completed`,
              timestamp: new Date(),
              user: req.user.id,
              details: `${stage.stage_name} completed with ${quantity_processed || 0} pieces processed`
            }
          ]
        });

        // Update QR code
        await updateOrderQRCode(salesOrder.id, {
          status: statusMap[stage.stage_name],
          current_stage: stage.stage_name,
          production_progress: {
            stage_completed: stage.stage_name,
            quantity_processed: quantity_processed || 0
          }
        });

        // Send notification for stage completion
        await NotificationService.createNotification({
          type: 'production_stage_completed',
          title: `${stage.stage_name.charAt(0).toUpperCase() + stage.stage_name.slice(1)} Stage Completed`,
          message: `${stage.stage_name} stage completed for order ${salesOrder.order_number}`,
          recipients: ['manufacturing', 'admin'],
          related_entity_type: 'production_stage',
          related_entity_id: stage.id,
          priority: 'medium',
          user_id: req.user.id
        });
      }
    }

    res.json({ message: 'Stage updated successfully', stage });
  } catch (error) {
    console.error('Update stage error:', error);
    res.status(500).json({ message: 'Failed to update stage' });
  }
});

// ==================== MATERIAL ALLOCATION ENDPOINTS ====================

/**
 * POST /api/manufacturing/orders/:id/allocate-materials
 * Allocate materials from inventory to a production order
 */
router.post('/orders/:id/allocate-materials', authenticateToken, checkDepartment(['manufacturing', 'inventory', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { materials } = req.body; // Array of { inventory_id, barcode, quantity }

    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({ message: 'Materials array is required' });
    }

    // Check if production order exists
    const productionOrder = await ProductionOrder.findByPk(id);
    if (!productionOrder) {
      return res.status(404).json({ message: 'Production order not found' });
    }

    const allocations = [];
    const errors = [];

    // Process each material allocation
    for (const material of materials) {
      const { inventory_id, barcode, quantity } = material;

      if (!inventory_id || !barcode || !quantity) {
        errors.push(`Invalid material data: ${JSON.stringify(material)}`);
        continue;
      }

      // Check inventory availability
      const inventoryItem = await Inventory.findOne({
        where: { id: inventory_id, barcode }
      });

      if (!inventoryItem) {
        errors.push(`Inventory item not found: ${barcode}`);
        continue;
      }

      const availableQty = inventoryItem.quantity - (inventoryItem.reserved_quantity || 0);
      if (availableQty < quantity) {
        errors.push(`Insufficient quantity for ${barcode}. Available: ${availableQty}, Requested: ${quantity}`);
        continue;
      }

      // Create material allocation
      const allocation = await MaterialAllocation.create({
        production_order_id: id,
        inventory_id: inventory_id,
        barcode: barcode,
        quantity_allocated: quantity,
        quantity_consumed: 0,
        quantity_returned: 0,
        quantity_wasted: 0,
        allocation_date: new Date(),
        allocated_by: req.user.id,
        status: 'allocated',
        consumption_log: []
      });

      // Update inventory reserved quantity
      await inventoryItem.update({
        reserved_quantity: (inventoryItem.reserved_quantity || 0) + parseFloat(quantity)
      });

      // Create inventory movement record
      await InventoryMovement.create({
        inventory_id: inventory_id,
        movement_type: 'allocation',
        quantity: -quantity,
        reference_type: 'production_order',
        reference_id: id,
        production_order_id: id,
        performed_by: req.user.id,
        notes: `Material allocated to production order ${productionOrder.production_number}`,
        barcode: barcode
      });

      allocations.push(allocation);
    }

    // Update production order status if materials allocated
    if (allocations.length > 0 && productionOrder.status === 'pending') {
      await productionOrder.update({ status: 'material_allocated' });

      // Send notification
      await NotificationService.createNotification({
        type: 'materials_allocated',
        title: 'Materials Allocated to Production',
        message: `${allocations.length} materials allocated to production order ${productionOrder.production_number}`,
        recipients: ['manufacturing', 'inventory', 'admin'],
        related_entity_type: 'production_order',
        related_entity_id: id,
        priority: 'medium',
        user_id: req.user.id
      });
    }

    res.json({
      message: 'Material allocation completed',
      allocations,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total_requested: materials.length,
        successfully_allocated: allocations.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Material allocation error:', error);
    res.status(500).json({ message: 'Failed to allocate materials', error: error.message });
  }
});

/**
 * GET /api/manufacturing/orders/:id/materials
 * Get all materials allocated to a production order
 */
router.get('/orders/:id/materials', authenticateToken, checkDepartment(['manufacturing', 'inventory', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const allocations = await MaterialAllocation.findAll({
      where: { production_order_id: id },
      include: [
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'item_name', 'category', 'unit', 'barcode', 'quantity', 'reserved_quantity']
        },
        {
          model: User,
          as: 'allocator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'returner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ProductionStage,
          as: 'currentStage',
          attributes: ['id', 'stage_name', 'status']
        }
      ],
      order: [['allocation_date', 'DESC']]
    });

    // Calculate summary
    const summary = {
      total_materials: allocations.length,
      total_allocated: allocations.reduce((sum, a) => sum + parseFloat(a.quantity_allocated || 0), 0),
      total_consumed: allocations.reduce((sum, a) => sum + parseFloat(a.quantity_consumed || 0), 0),
      total_returned: allocations.reduce((sum, a) => sum + parseFloat(a.quantity_returned || 0), 0),
      total_wasted: allocations.reduce((sum, a) => sum + parseFloat(a.quantity_wasted || 0), 0),
      by_status: {
        allocated: allocations.filter(a => a.status === 'allocated').length,
        in_use: allocations.filter(a => a.status === 'in_use').length,
        consumed: allocations.filter(a => a.status === 'consumed').length,
        partially_returned: allocations.filter(a => a.status === 'partially_returned').length,
        fully_returned: allocations.filter(a => a.status === 'fully_returned').length,
        wasted: allocations.filter(a => a.status === 'wasted').length
      }
    };

    res.json({
      materials: allocations,
      summary
    });
  } catch (error) {
    console.error('Fetch materials error:', error);
    res.status(500).json({ message: 'Failed to fetch allocated materials', error: error.message });
  }
});

/**
 * POST /api/manufacturing/stages/:stageId/consume-material
 * Record material consumption at a specific production stage
 */
router.post('/stages/:stageId/consume-material', authenticateToken, checkDepartment(['manufacturing', 'admin']), async (req, res) => {
  try {
    const { stageId } = req.params;
    const { barcode, quantity, wastage = 0, notes } = req.body;

    if (!barcode || !quantity) {
      return res.status(400).json({ message: 'Barcode and quantity are required' });
    }

    // Find the production stage
    const stage = await ProductionStage.findByPk(stageId, {
      include: [{ model: ProductionOrder, as: 'productionOrder' }]
    });

    if (!stage) {
      return res.status(404).json({ message: 'Production stage not found' });
    }

    // Find the material allocation
    const allocation = await MaterialAllocation.findOne({
      where: {
        production_order_id: stage.production_order_id,
        barcode: barcode
      },
      include: [
        { model: Inventory, as: 'inventory' }
      ]
    });

    if (!allocation) {
      return res.status(404).json({ message: `Material with barcode ${barcode} not allocated to this production order` });
    }

    // Check if enough material is available
    const remainingQty = parseFloat(allocation.quantity_allocated) - parseFloat(allocation.quantity_consumed) - parseFloat(allocation.quantity_returned);
    const totalRequired = parseFloat(quantity) + parseFloat(wastage);

    if (remainingQty < totalRequired) {
      return res.status(400).json({
        message: `Insufficient material. Available: ${remainingQty}, Required: ${totalRequired}`,
        available: remainingQty,
        requested: totalRequired
      });
    }

    // Update consumption log
    const consumptionLog = allocation.consumption_log || [];
    consumptionLog.push({
      stage_id: stage.id,
      stage_name: stage.stage_name,
      quantity: parseFloat(quantity),
      wastage: parseFloat(wastage),
      consumed_at: new Date().toISOString(),
      consumed_by: req.user.id,
      consumed_by_name: req.user.name,
      barcode_scan: barcode,
      notes: notes || ''
    });

    // Update allocation
    const newConsumed = parseFloat(allocation.quantity_consumed) + parseFloat(quantity);
    const newWasted = parseFloat(allocation.quantity_wasted) + parseFloat(wastage);
    const newRemaining = parseFloat(allocation.quantity_allocated) - newConsumed - parseFloat(allocation.quantity_returned);

    await allocation.update({
      quantity_consumed: newConsumed,
      quantity_wasted: newWasted,
      current_stage_id: stage.id,
      consumption_log: consumptionLog,
      status: newRemaining > 0 ? 'in_use' : 'consumed'
    });

    // Update production stage material consumption if field exists
    if (stage.material_consumption) {
      const stageMaterialLog = stage.material_consumption || [];
      stageMaterialLog.push({
        barcode,
        item_name: allocation.inventory?.item_name || 'Unknown',
        quantity: parseFloat(quantity),
        wastage: parseFloat(wastage),
        timestamp: new Date().toISOString()
      });
      await stage.update({ material_consumption: stageMaterialLog });
    }

    res.json({
      message: 'Material consumption recorded successfully',
      allocation: {
        id: allocation.id,
        barcode: allocation.barcode,
        item_name: allocation.inventory?.item_name,
        quantity_allocated: allocation.quantity_allocated,
        quantity_consumed: newConsumed,
        quantity_wasted: newWasted,
        quantity_remaining: newRemaining,
        status: allocation.status
      },
      consumption_entry: consumptionLog[consumptionLog.length - 1]
    });
  } catch (error) {
    console.error('Material consumption error:', error);
    res.status(500).json({ message: 'Failed to record material consumption', error: error.message });
  }
});

/**
 * GET /api/manufacturing/materials/scan/:barcode
 * Scan barcode to get material information
 */
router.get('/materials/scan/:barcode', authenticateToken, checkDepartment(['manufacturing', 'inventory', 'admin']), async (req, res) => {
  try {
    const { barcode } = req.params;

    // Check if it's an inventory barcode
    const inventoryItem = await Inventory.findOne({
      where: { barcode }
    });

    if (inventoryItem) {
      return res.json({
        type: 'inventory',
        item: inventoryItem,
        available_quantity: inventoryItem.quantity - (inventoryItem.reserved_quantity || 0),
        status: 'available_in_inventory'
      });
    }

    // Check if it's allocated to production
    const allocation = await MaterialAllocation.findOne({
      where: { barcode },
      include: [
        {
          model: ProductionOrder,
          as: 'productionOrder',
          attributes: ['id', 'production_number', 'status']
        },
        {
          model: Inventory,
          as: 'inventory'
        },
        {
          model: ProductionStage,
          as: 'currentStage',
          attributes: ['id', 'stage_name', 'status']
        }
      ],
      order: [['allocation_date', 'DESC']],
      limit: 1
    });

    if (allocation) {
      const remaining = parseFloat(allocation.quantity_allocated) - parseFloat(allocation.quantity_consumed) - parseFloat(allocation.quantity_returned);
      return res.json({
        type: 'allocated_material',
        allocation: {
          id: allocation.id,
          barcode: allocation.barcode,
          item_name: allocation.inventory?.item_name,
          production_order: allocation.productionOrder?.production_number,
          production_order_id: allocation.production_order_id,
          current_stage: allocation.currentStage?.stage_name,
          quantity_allocated: allocation.quantity_allocated,
          quantity_consumed: allocation.quantity_consumed,
          quantity_remaining: remaining,
          status: allocation.status,
          consumption_log: allocation.consumption_log
        }
      });
    }

    // Check if it's a returned material barcode
    const returnedAllocation = await MaterialAllocation.findOne({
      where: { return_barcode: barcode },
      include: [
        { model: Inventory, as: 'inventory' },
        { model: ProductionOrder, as: 'productionOrder' }
      ]
    });

    if (returnedAllocation) {
      return res.json({
        type: 'returned_material',
        allocation: returnedAllocation,
        message: 'This material was returned from production'
      });
    }

    res.status(404).json({ message: 'Barcode not found in inventory or allocations' });
  } catch (error) {
    console.error('Barcode scan error:', error);
    res.status(500).json({ message: 'Failed to scan barcode', error: error.message });
  }
});



module.exports = router;