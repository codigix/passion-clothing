const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { sequelize, ProductionRequest, PurchaseOrder, SalesOrder, User, Notification, Customer, Vendor } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Helper function to generate request number
const generateRequestNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastRequest = await ProductionRequest.findOne({
    where: {
      request_number: {
        [Op.like]: `PR-${dateStr}-%`
      }
    },
    order: [['request_number', 'DESC']]
  });

  let sequence = 1;
  if (lastRequest) {
    const lastSequence = parseInt(lastRequest.request_number.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `PR-${dateStr}-${sequence.toString().padStart(5, '0')}`;
};

// Create production request from PO
router.post('/from-po/:poId', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { poId } = req.params;
    const {
      product_name,
      product_description,
      product_specifications,
      quantity,
      unit,
      priority,
      required_date,
      procurement_notes
    } = req.body;

    // Validate required fields
    if (!product_name || !quantity || !unit || !required_date) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Product name, quantity, unit, and required date are required'
      });
    }

    // Get PO details
    const po = await PurchaseOrder.findByPk(poId);
    if (!po) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found'
      });
    }

    // Check if PO is linked to a project
    if (!po.project_name) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Purchase Order must be linked to a project to create production request'
      });
    }

    // Generate request number
    const request_number = await generateRequestNumber();

    // Create production request
    const productionRequest = await ProductionRequest.create({
      request_number,
      po_id: poId,
      po_number: po.po_number,
      project_name: po.project_name,
      product_name,
      product_description,
      product_specifications,
      quantity,
      unit,
      priority: priority || 'medium',
      required_date,
      procurement_notes,
      status: 'pending',
      requested_by: req.user.id
    }, { transaction });

    // Create notification for Manufacturing department
    const manufacturingUsers = await User.findAll({
      where: { department: 'manufacturing' }
    });

    const notifications = manufacturingUsers.map(user => ({
      user_id: user.id,
      type: 'production_request',
      title: 'New Production Request',
      message: `New production request ${request_number} for project "${po.project_name}" - ${product_name}`,
      reference_type: 'production_request',
      reference_id: productionRequest.id,
      link: `/manufacturing/production-requests/${productionRequest.id}`,
      priority: priority || 'medium'
    }));

    await Notification.bulkCreate(notifications, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Production request created successfully',
      data: productionRequest
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating production request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create production request',
      error: error.message
    });
  }
});

// Get all production requests (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('[Production Requests] Fetching with query:', req.query);
    console.log('[Production Requests] User:', req.user.email, 'Department:', req.user.department);
    
    const { status, priority, project_name, department } = req.query;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (project_name) {
      where.project_name = {
        [Op.like]: `%${project_name}%`
      };
    }

    // If user is from procurement, show only their requests
    if (req.user.department === 'procurement' && !department) {
      where.requested_by = req.user.id;
    }

    console.log('[Production Requests] Query where clause:', where);

    const requests = await ProductionRequest.findAll({
      where,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'department'],
          required: false
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email', 'department'],
          required: false
        },
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          required: false,
          attributes: ['id', 'po_number', 'total_amount', 'vendor_id'],
          include: [
            {
              model: Vendor,
              as: 'vendor',
              required: false,
              attributes: ['id', 'name', 'vendor_code', 'contact_person']
            }
          ]
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          required: false,
          include: [
            {
              model: Customer,
              as: 'customer',
              required: false,
              attributes: ['id', 'name', 'customer_code']
            }
          ],
          attributes: ['id', 'order_number', 'customer_id', 'total_quantity', 'delivery_date']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log(`[Production Requests] Found ${requests.length} requests`);

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('[Production Requests] Error fetching:', error);
    console.error('[Production Requests] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch production requests',
      error: error.message
    });
  }
});

// Get single production request
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ProductionRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'department']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email', 'department']
        },
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          attributes: ['id', 'po_number', 'vendor_name', 'total_amount', 'items']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Production request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Error fetching production request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch production request',
      error: error.message
    });
  }
});

// Update production request status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, manufacturing_notes } = req.body;

    const request = await ProductionRequest.findByPk(id);
    
    if (!request) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Production request not found'
      });
    }

    // Update request
    const updateData = { status };
    
    if (manufacturing_notes) {
      updateData.manufacturing_notes = manufacturing_notes;
    }

    if (status === 'reviewed' && !request.reviewed_by) {
      updateData.reviewed_by = req.user.id;
      updateData.reviewed_at = new Date();
    }

    if (status === 'completed' && !request.completed_at) {
      updateData.completed_at = new Date();
    }

    await request.update(updateData, { transaction });

    // Notify procurement user
    await Notification.create({
      user_id: request.requested_by,
      type: 'production_request_update',
      title: 'Production Request Updated',
      message: `Production request ${request.request_number} status changed to: ${status}`,
      reference_type: 'production_request',
      reference_id: request.id,
      link: `/procurement/production-requests/${request.id}`,
      priority: 'medium'
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Production request updated successfully',
      data: request
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error updating production request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update production request',
      error: error.message
    });
  }
});

// Link production order to request
router.patch('/:id/link-production-order', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { production_order_id } = req.body;

    const request = await ProductionRequest.findByPk(id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Production request not found'
      });
    }

    await request.update({
      production_order_id,
      status: 'in_production'
    });

    res.json({
      success: true,
      message: 'Production order linked successfully',
      data: request
    });

  } catch (error) {
    console.error('Error linking production order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link production order',
      error: error.message
    });
  }
});

module.exports = router;