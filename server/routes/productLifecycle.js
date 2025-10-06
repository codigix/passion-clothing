const express = require('express');
const { Op } = require('sequelize');
const { 
  Product, 
  ProductLifecycle, 
  ProductLifecycleHistory, 
  User, 
  Customer, 
  SalesOrder, 
  ProductionOrder 
} = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');

const router = express.Router();

// Get product lifecycle by barcode
router.get('/barcode/:barcode', authenticateToken, checkDepartment(['inventory', 'production', 'quality', 'dispatch', 'admin']), async (req, res) => {
  try {
    const { barcode } = req.params;

    const lifecycle = await ProductLifecycle.findOne({
      where: { barcode },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'product_code', 'name', 'category', 'product_type']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'order_number', 'order_date', 'delivery_date']
        },
        {
          model: ProductionOrder,
          as: 'productionOrder',
          attributes: ['id', 'order_number', 'planned_start_date', 'planned_end_date']
        }
      ]
    });

    if (!lifecycle) {
      return res.status(404).json({ message: 'Product not found with this barcode' });
    }

    // Get lifecycle history
    const history = await ProductLifecycleHistory.findAll({
      where: { product_lifecycle_id: lifecycle.id },
      include: [
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['transition_time', 'ASC']]
    });

    res.json({
      lifecycle,
      history,
      current_stage: lifecycle.current_stage,
      current_status: lifecycle.current_status
    });
  } catch (err) {
    console.error('Lifecycle fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch product lifecycle' });
  }
});

// Update product stage (barcode scan transition)
router.post('/scan/:barcode/transition', authenticateToken, checkDepartment(['inventory', 'production', 'quality', 'dispatch', 'admin']), async (req, res) => {
  try {
    const { barcode } = req.params;
    const { 
      new_stage, 
      new_status = 'active',
      location,
      machine_id,
      quantity_processed,
      quantity_approved,
      quantity_rejected,
      rejection_reasons,
      quality_parameters,
      cost_incurred = 0,
      materials_consumed,
      notes,
      images
    } = req.body;

    // Validate new stage
    const validStages = [
      'created', 'material_allocated', 'in_production', 'cutting', 
      'embroidery', 'printing', 'stitching', 'finishing', 'ironing', 
      'quality_check', 'packing', 'ready_for_dispatch', 'dispatched', 
      'in_transit', 'delivered', 'returned', 'rejected'
    ];

    if (!validStages.includes(new_stage)) {
      return res.status(400).json({ message: 'Invalid stage provided' });
    }

    const lifecycle = await ProductLifecycle.findOne({
      where: { barcode },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'product_code', 'name']
        }
      ]
    });

    if (!lifecycle) {
      return res.status(404).json({ message: 'Product not found with this barcode' });
    }

    // Get the last history entry to calculate duration
    const lastHistory = await ProductLifecycleHistory.findOne({
      where: { product_lifecycle_id: lifecycle.id },
      order: [['transition_time', 'DESC']]
    });

    let durationInPreviousStage = null;
    if (lastHistory) {
      const timeDiff = new Date() - new Date(lastHistory.transition_time);
      durationInPreviousStage = timeDiff / (1000 * 60 * 60); // Convert to hours
    }

    // Update lifecycle current stage and status
    const previousStage = lifecycle.current_stage;
    const previousStatus = lifecycle.current_status;

    await lifecycle.update({
      current_stage: new_stage,
      current_status: new_status,
      location: location || lifecycle.location,
      total_cost: lifecycle.total_cost + parseFloat(cost_incurred || 0),
      last_updated_by: req.user.id,
      // Update completion dates based on stage
      ...(new_stage === 'delivered' && { actual_delivery_date: new Date() }),
      ...(new_stage === 'quality_check' && quantity_approved && { 
        quality_status: quantity_rejected > 0 ? 'failed' : 'passed' 
      })
    });

    // Create history entry
    const historyEntry = await ProductLifecycleHistory.create({
      product_lifecycle_id: lifecycle.id,
      barcode,
      stage_from: previousStage,
      stage_to: new_stage,
      status_from: previousStatus,
      status_to: new_status,
      transition_time: new Date(),
      duration_in_previous_stage_hours: durationInPreviousStage,
      location,
      machine_id,
      operator_id: req.user.id,
      quantity_processed,
      quantity_approved,
      quantity_rejected,
      rejection_reasons,
      quality_parameters,
      cost_incurred: parseFloat(cost_incurred || 0),
      materials_consumed,
      notes,
      images,
      scan_data: {
        scan_type: 'stage_transition',
        barcode,
        timestamp: new Date(),
        user_id: req.user.id,
        device_info: req.headers['user-agent']
      },
      created_by: req.user.id
    });

    res.json({
      message: `Product stage updated to ${new_stage}`,
      lifecycle: {
        id: lifecycle.id,
        barcode,
        current_stage: new_stage,
        current_status: new_status,
        product: lifecycle.product
      },
      history_entry: historyEntry
    });
  } catch (err) {
    console.error('Stage transition error:', err);
    res.status(500).json({ message: 'Failed to update product stage', error: err.message });
  }
});

// Get all products in a specific stage
router.get('/stage/:stage', authenticateToken, checkDepartment(['inventory', 'production', 'quality', 'dispatch', 'admin']), async (req, res) => {
  try {
    const { stage } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const where = { current_stage: stage };
    if (status) where.current_status = status;

    const { count, rows } = await ProductLifecycle.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'product_code', 'name', 'category', 'product_type']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name']
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      products: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Stage products fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch products in stage' });
  }
});

// Get lifecycle analytics/dashboard data
router.get('/analytics/dashboard', authenticateToken, checkDepartment(['inventory', 'production', 'quality', 'dispatch', 'admin']), async (req, res) => {
  try {
    // Get count by stage
    const stageStats = await ProductLifecycle.findAll({
      attributes: [
        'current_stage',
        [ProductLifecycle.sequelize.fn('COUNT', ProductLifecycle.sequelize.col('id')), 'count']
      ],
      group: ['current_stage'],
      raw: true
    });

    // Get count by status
    const statusStats = await ProductLifecycle.findAll({
      attributes: [
        'current_status',
        [ProductLifecycle.sequelize.fn('COUNT', ProductLifecycle.sequelize.col('id')), 'count']
      ],
      group: ['current_status'],
      raw: true
    });

    // Get recent transitions (last 24 hours)
    const recentTransitions = await ProductLifecycleHistory.findAll({
      where: {
        transition_time: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      include: [
        {
          model: ProductLifecycle,
          as: 'lifecycle',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['product_code', 'name']
            }
          ]
        },
        {
          model: User,
          as: 'operator',
          attributes: ['name']
        }
      ],
      order: [['transition_time', 'DESC']],
      limit: 10
    });

    // Get overdue products (estimated delivery date passed)
    const overdueProducts = await ProductLifecycle.findAll({
      where: {
        estimated_delivery_date: {
          [Op.lt]: new Date()
        },
        current_stage: {
          [Op.notIn]: ['delivered', 'returned', 'rejected']
        }
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['product_code', 'name']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['name']
        }
      ],
      limit: 10
    });

    res.json({
      stage_statistics: stageStats,
      status_statistics: statusStats,
      recent_transitions: recentTransitions,
      overdue_products: overdueProducts,
      summary: {
        total_products: stageStats.reduce((sum, stage) => sum + parseInt(stage.count), 0),
        active_products: statusStats.find(s => s.current_status === 'active')?.count || 0,
        completed_products: statusStats.find(s => s.current_status === 'completed')?.count || 0
      }
    });
  } catch (err) {
    console.error('Analytics fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
});

// Bulk stage transition (for multiple products)
router.post('/bulk-transition', authenticateToken, checkDepartment(['inventory', 'production', 'quality', 'dispatch', 'admin']), async (req, res) => {
  try {
    const { barcodes, new_stage, new_status = 'active', location, notes } = req.body;

    if (!barcodes || !Array.isArray(barcodes) || barcodes.length === 0) {
      return res.status(400).json({ message: 'Barcodes array is required' });
    }

    const results = [];
    const errors = [];

    for (const barcode of barcodes) {
      try {
        const lifecycle = await ProductLifecycle.findOne({ where: { barcode } });
        
        if (!lifecycle) {
          errors.push({ barcode, error: 'Product not found' });
          continue;
        }

        const previousStage = lifecycle.current_stage;
        const previousStatus = lifecycle.current_status;

        await lifecycle.update({
          current_stage: new_stage,
          current_status: new_status,
          location: location || lifecycle.location,
          last_updated_by: req.user.id
        });

        await ProductLifecycleHistory.create({
          product_lifecycle_id: lifecycle.id,
          barcode,
          stage_from: previousStage,
          stage_to: new_stage,
          status_from: previousStatus,
          status_to: new_status,
          transition_time: new Date(),
          location,
          operator_id: req.user.id,
          notes: notes || `Bulk transition to ${new_stage}`,
          scan_data: {
            scan_type: 'bulk_transition',
            barcode,
            timestamp: new Date(),
            user_id: req.user.id
          },
          created_by: req.user.id
        });

        results.push({ barcode, success: true, new_stage });
      } catch (error) {
        errors.push({ barcode, error: error.message });
      }
    }

    res.json({
      message: `Bulk transition completed. ${results.length} successful, ${errors.length} failed.`,
      results,
      errors
    });
  } catch (err) {
    console.error('Bulk transition error:', err);
    res.status(500).json({ message: 'Failed to perform bulk transition' });
  }
});

module.exports = router;